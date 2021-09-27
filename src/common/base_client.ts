/*
* Copyright 2021 HMS Industrial Networks AB
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http: //www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


import Url from 'url-parse';
import { Subscription } from './subscription';
import { ConnectionOptions, KolibriConnection } from './kolibri_connection';
import {
    DefaultKolibriResponse, errorcode, errorFromCode, isJsonRpcError, isJsonRpcFailure,
    isJsonRpcRequest, isJsonRpcSuccess, isKolibriRpcError, isKolibriRpcRequest, isKolibriRpcSuccess, JsonRpcRequest,
    JsonRpcResponse,
    KolibriErrorResponse,
    KolibriRequest,
    KolibriRequestMethods, KolibriRpcErrorResponse, KolibriRpcRequest,
    KolibriRpcSuccessResponse,
    KolibriSuccessResponse
} from '@hms-networks/kolibri-js-core';
import { ClientConfig } from '../client_config';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { getRequestError } from '../error/kolibri_request_error';
export abstract class BaseClient {
    private rpcId = 1;
    private tId = 1;

    protected connection: KolibriConnection;

    protected subscription = new Subscription<any>();
    protected writeTransactions = new Map<number, unknown[]>();

    private consumerRpcs = new Map<string, Function>();
    private kolibriRpcs = new Map<string, Function>();

    private loginParams?: unknown & { client?: string };
    private loginResult?: unknown & { client: string };

    private subscribeParams?: unknown;
    private subscribeResult?: unknown;

    private userSubscribeParams?: unknown;
    private userSubscribeResult?: unknown;

    private onReconnectListener?: () => Promise<void>;
    private onDisconnectListener?: (event?: { code: number, reason: string }) => Promise<void>;

    constructor(readonly config: ClientConfig) {
        const urlStr = `${config.host}/${config.project}${config.path}`;
        const brokerUrl = new Url(urlStr);

        if (config.port) {
            brokerUrl.set('port', config.port.toString());
        }

        const connectionOptions: ConnectionOptions = {
            url: brokerUrl,
            protocol: this.getKolibriProtocol(),
            tlsOptions: config.tls,
            reconnectOptions: config.reconnect,
            clientMessageListener: (jsonrpc) => this.clientEventDispatcher(jsonrpc)
        };

        if (config.proxy) {
            const agent = new HttpsProxyAgent(config.proxy);
            connectionOptions.requestOptions = {
                agent: agent
            };
        }

        this.connection = new KolibriConnection(connectionOptions);

        this.initBuildInConsumerRpcs();

        this.registerKolibriRpc(KolibriRequestMethods.GetRpcInfoRequestMethod, this.handleGetRpcInfoRequest.bind(this));

        if (this.config.auth) {
            this.loginParams = this.config.auth;
        }

        if (this.config.reconnect) {
            this.initReconnectHandler();
        }

        this.connection.addOnDisconnectListener(async (event) => { await this.onDisconnectListener?.(event); });
    }

    protected getNextRpcId(): number {
        return this.rpcId++;
    }

    protected getNextTid(): number {
        return this.tId++;
    }

    abstract login(params?: unknown): Promise<unknown>;
    abstract subscribe(params: unknown): Promise<unknown>;
    abstract userSubscribe(params: unknown): Promise<unknown>;

    protected abstract getKolibriProtocol(): string;

    protected storeLoginData(params: unknown & { client?: string }, result: unknown & { client: string }): void {
        this.loginParams = params;
        this.loginResult = result;
    }

    protected storeSubscribeData(params: unknown, result: unknown): void {
        this.subscribeParams = params;
        this.subscribeResult = result;
    }

    protected clearSubscribeData(): void {
        this.subscribeParams = undefined;
        this.subscribeResult = undefined;
    }

    protected storeUserSubscribeData(params: unknown, result: unknown): void {
        this.userSubscribeParams = params;
        this.userSubscribeResult = result;
    }

    protected clearUserSubscribeData(): void {
        this.userSubscribeParams = undefined;
        this.userSubscribeResult = undefined;
    }


    public addOnUnsubscribed(listener: (data: any[]) => void): void {
        this.subscription.onUnsubscribed = listener;
    }

    public addOnWriteListener(listener: (data: any[]) => void): void {
        this.subscription.onWrite = listener;
    }

    public addOnUserNotifyListener(listener: (data: any[]) => void): void {
        this.subscription.onUserNotify = listener;
    }

    public addOnErrorListener(listener: (error: any) => void): void {
        this.subscription.onError = listener;
    }

    public addOnReconnectListener(listener: () => Promise<void>) {
        this.onReconnectListener = listener;
    }

    public addOnDisconnectListener(listener: (event?: { code: number, reason: string }) => Promise<void>) {
        this.onDisconnectListener = listener;
    }

    public async connect(): Promise<void> {
        return this.connection.connect();
    }

    public async disconnect(): Promise<void> {
        this.rpcId = 1;
        this.tId = 1;
        this.connection.disableReconnect();
        await this.connection.close();
    }

    async sendKolibriRpcRequest(request: KolibriRpcRequest<unknown>): Promise<KolibriRpcSuccessResponse<unknown>> {
        const response: JsonRpcResponse = await this.connection.sendRequest(request);
        if (isKolibriRpcSuccess(response)) {
            return response;
        }
        else if (isKolibriRpcError(response)) {
            throw getRequestError(
                response.error.code,
                response.error.data);
        }
        else {
            throw new Error('Unknown response type!');
        }
    }

    async sendKolibriRequest<T, R>(kolibriRequest: KolibriRequest<T>): Promise<KolibriSuccessResponse<R>> {
        const response: JsonRpcResponse = await this.connection.sendRequest(kolibriRequest);

        if (isJsonRpcSuccess<R>(response)) {
            return response;
        }
        else if (isJsonRpcFailure(response)) {
            throw getRequestError(
                response.error.code,
                response.error.data);
        }
        else {
            throw new Error('Unknown response type!');
        }
    }

    registerKolibriRpc(method: string, handler: (params?: unknown) => unknown): void {
        this.kolibriRpcs.set(method, handler.bind(this));
    }

    protected async handleGetRpcInfoRequest(_args?: any): Promise<string[]> {
        return Array.from(this.kolibriRpcs.keys());
    }

    protected async handleWriteRequest(request: any): Promise<void> {
        const writeRequest: any = request;
        const combinedWriteResult: any[] = writeRequest.params.nodes
            .map((node: any) => {
                const nodeProperties: any = this.subscription.fetchSubscribedNode(node.path);
                if (!nodeProperties) return;
                return { ...nodeProperties, ...node };
            })
            .filter((elem: any) => elem !== undefined);

        try {
            if (writeRequest.params.tid) {
                this.writeTransactions.set(writeRequest.params.tid, combinedWriteResult);
            }
            else if (combinedWriteResult.length !== 0) {
                this.subscription.onWrite?.(combinedWriteResult);
            }
            const response = new DefaultKolibriResponse(writeRequest.id, 0);
            await this.connection.sendResponse(response);
        }
        catch (e) {
            this.subscription.onError?.(e);
        }
    }

    protected async handleUnsubscribedRequest(request: any): Promise<void> {
        const unsubscribedRequest: any = request;
        this.subscription.deleteSubscribedNodes(unsubscribedRequest.params);
        try {
            const response = new DefaultKolibriResponse(request.id, 0);
            await this.connection.sendResponse(response);
            this.subscription.onUnsubscribed?.(unsubscribedRequest.params);
        }
        catch (e) {
            this.subscription.onError?.(e);
        }
    }

    protected async handleUserNotifyRequest(request: any): Promise<void> {
        const userNotifyRequest: any = request;

        try {
            const response = new DefaultKolibriResponse(request.id, 0);
            await this.connection.sendResponse(response);
            this.subscription.onUserNotify?.(userNotifyRequest.params);
        }
        catch (e) {
            this.subscription.onError?.(e);
        }
    }

    protected async handleCommitRequest(request: any): Promise<void> {
        const commitRequest: any = request;

        const pendingWriteResult: any[] | undefined = this.writeTransactions
            .get(commitRequest.params.tid);
        if (pendingWriteResult) {
            this.subscription.onWrite?.(pendingWriteResult);
        }
        else {
            // could not match commit with pending transaction. Respond to broker anyway.
        }

        try {
            const response = new DefaultKolibriResponse(commitRequest.id, 0);
            await this.connection.sendResponse(response);
        }
        catch (e) {
            this.subscription.onError?.(e);
        }
        finally {
            this.writeTransactions.delete(commitRequest.params.tid);
        }
    }

    protected async clientEventDispatcher(jsonrpc: any) {
        if (!isJsonRpcRequest(jsonrpc)) {
            return;
        }

        if (isKolibriRpcRequest(jsonrpc)) {
            await this.handleKolibriRpcRequest(jsonrpc);
        }
        else {
            await this.handleConsumerRpcRequest(jsonrpc);
        }
    }

    async handleConsumerRpcRequest(jsonrpc: JsonRpcRequest<unknown>): Promise<void> {
        const handlerFunction = this.consumerRpcs.get(jsonrpc.method);
        if (!handlerFunction) {
            const error = errorFromCode(errorcode.METHOD_NOT_FOUND.code);
            error.data = jsonrpc.method;
            const response = new class extends KolibriErrorResponse<unknown> { }(jsonrpc.id, error);
            await this.connection.sendResponse(response);
            return;
        }
        await handlerFunction(jsonrpc);
    }

    async handleKolibriRpcRequest(jsonrpc: KolibriRpcRequest<unknown>): Promise<void> {
        const handlerFunction = this.kolibriRpcs.get(jsonrpc.method);

        let response;
        if (!handlerFunction) {
            const error = errorFromCode(errorcode.METHOD_NOT_FOUND.code);
            error.data = jsonrpc.method;
            response = new KolibriRpcErrorResponse<unknown>(jsonrpc.id, jsonrpc._server,
                error);
            await this.connection.sendResponse(response);
            return;
        }
        let result;
        try {
            result = await handlerFunction(jsonrpc.params);
        }
        catch (e) {
            try {
                if (isJsonRpcError(e)) {
                    response = new KolibriRpcErrorResponse<unknown>(jsonrpc.id, jsonrpc._server, e);
                }
                else {
                    response = new KolibriRpcErrorResponse<unknown>(jsonrpc.id, jsonrpc._server,
                        errorFromCode(errorcode.KOLIBRI_RPC_ERROR.code));
                }
                await this.connection.sendResponse(response);
                return;
            }
            catch (ex) {
                throw new Error('Failed to send error!');
            }
        }
        try {
            response = new KolibriRpcSuccessResponse(jsonrpc.id, jsonrpc._server, result);
            await this.connection.sendResponse(response);
        }
        catch (e) {
            throw new Error('Failed to send result!');
        }
    }

    private initBuildInConsumerRpcs(): void {
        this.consumerRpcs.set(KolibriRequestMethods.WriteRequestMethod,
            this.handleWriteRequest.bind(this));
        this.consumerRpcs.set(KolibriRequestMethods.UnsubscribedRequestMethod,
            this.handleUnsubscribedRequest.bind(this));
        this.consumerRpcs.set(KolibriRequestMethods.UserNotifyRequestMethod,
            this.handleUserNotifyRequest.bind(this));
        this.consumerRpcs.set(KolibriRequestMethods.CommitRequestMethod,
            this.handleCommitRequest.bind(this));
    }

    private initReconnectHandler(): void {
        this.connection.addOnReconnectListener(async () => {
            // Reconnected
            try {
                await this.restoreLogin();

                if (this.config.reconnect?.resumeSubscriptions) {
                    // Restoring Subscriptions
                    await this.restoreSubscriptions();
                }
            }
            catch (e) {
                throw new Error('Restoring client state failed!');
            }
            try {
                await this.onReconnectListener?.();
            }
            catch (e) {
                // ignore errors on the listener
            }
        });
    }

    private async restoreLogin(): Promise<void> {
        if (this.loginParams && this.loginResult) {
            this.loginParams.client = this.loginResult.client;
            await this.login(this.loginParams);
        }
        else if (this.loginParams) {
            await this.login(this.loginParams);
        }
        else {
            throw new Error('Unknown client state!');
        }
    }

    private async restoreSubscriptions(): Promise<void> {
        if (this.subscribeParams && this.subscribeResult) {
            await this.subscribe(this.subscribeParams);
        }
        if (this.userSubscribeParams && this.userSubscribeResult) {
            await this.userSubscribe(this.userSubscribeParams);
        }
    }
}
