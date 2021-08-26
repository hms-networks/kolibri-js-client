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
import {
    isDefined,
    JsonRpcFailure, JsonRpcRequest, JsonRpcResponse,
    JsonRpcSuccess
} from '@hms-networks/kolibri-js-core';
import WebSocketAsPromised from 'websocket-as-promised';
import { classToPlain } from 'class-transformer';
import { w3cwebsocket as WebSocket } from 'websocket';
import * as https from 'https';

export interface ReconnectOptions {
    maxReconnects: number,
    maxReconnectDelay: number
}

export interface ConnectionOptions {
    url: Url,
    protocol: string,
    tlsOptions?: https.RequestOptions,
    reconnectOptions?: ReconnectOptions,
    clientMessageListener: (jsonrpc: any) => void
}
export class KolibriConnection {
    private socket?: WebSocketAsPromised;

    private reconnectRetries = 0;
    private reconnectBackoffTime = 1;

    private clientMessageListener?: ((...args: any[]) => any);
    private onReconnectListener?: () => Promise<void>;
    private onDisconnectListener?: (event: { code: number, reason: string }) => Promise<void>;

    constructor(readonly options: ConnectionOptions) {
        this.clientMessageListener = options.clientMessageListener;

        this.reconnectRetries = this.options.reconnectOptions?.maxReconnects ?? 0;
    }

    addClientMessageListener(listener: (jsonrpc: any) => void) {
        this.clientMessageListener = listener;
    }

    addOnReconnectListener(listener: () => Promise<void>) {
        this.onReconnectListener = listener;
    }

    addOnDisconnectListener(listener: (event: { code: number, reason: string }) => Promise<void>) {
        this.onDisconnectListener = listener;
    }

    async sendRequest<T>(request: JsonRpcRequest<T>): Promise<JsonRpcSuccess<T> | JsonRpcFailure<T>> {
        const plainRequest = classToPlain(request);
        const requestId = request.id;
        if (!isDefined(this.socket) || !this.socket.isOpened) {
            throw new Error('Socket is not open!');
        }
        return this.socket.sendRequest(plainRequest, { requestId: requestId as number });
    }

    async sendResponse<T extends JsonRpcResponse>(response: T): Promise<void> {
        const plainResponse = classToPlain(response);
        if (!isDefined(this.socket) || !this.socket.isOpened) {
            throw new Error('Socket is not open!');
        }
        return this.socket.sendPacked(plainResponse);
    }

    async connect(): Promise<void> {
        this.socket = this.createWebSocket(this.options.url.toString(), this.options.protocol);
        this.addListeners();

        try {
            await this.socket.open();
        }
        catch (e) {
            throw new Error('Could not open connection!');
        }
    }

    async close(): Promise<void> {
        this.socket?.close();
    }

    disableReconnect(): void {
        this.socket?.onClose.mute();
    }

    enableReconnect(): void {
        this.socket?.onClose.unmute();
    }

    private createWebSocket(brokerUrl: string, kolibriProtocol: string): WebSocketAsPromised {
        return new WebSocketAsPromised(brokerUrl, {
            createWebSocket: url => new WebSocket(url, kolibriProtocol, undefined, undefined, undefined,
                { tlsOptions: this.options.tlsOptions }),
            packMessage: data => JSON.stringify(data),
            unpackMessage: data => JSON.parse(data as string),
            attachRequestId: (data, requestId) => Object.assign({ id: requestId }, data),
            extractRequestId: data => data && data.id
        });
    }

    private addListeners() {
        this.socket?.onUnpackedMessage.addListener((msg) => { this.clientMessageListener?.(msg); });

        if (this.options.reconnectOptions) {
            this.socket?.onClose.addOnceListener(async (event) => {
                await this.onDisconnectListener?.({ code: event.code, reason: event.reason });
            });
            this.socket?.onClose.addListener(async () => { await this.reconnectHandler(); });
        }
        else {
            this.socket?.onClose.addListener(async (event) => {
                await this.onDisconnectListener?.({ code: event.code, reason: event.reason });
            });
        }
    }

    private async reconnectHandler() {
        if (this.reconnectRetries > 0) {
            setTimeout(async () => {
                try {
                    await this.socket?.open();
                    // successfully connected
                    this.resetReconnectConfig();
                    await this.onReconnectListener?.();
                }
                catch (e) {
                    this.prepareReconnectConfigForNextTry();
                }
            }, this.reconnectBackoffTime * 1000);
        }
        else {
            // Do nothing - Could not reconnect. Giving up
        }
    }

    private resetReconnectConfig() {
        this.reconnectBackoffTime = 1;
        this.reconnectRetries = this.options.reconnectOptions?.maxReconnects ?? 0;
        this.socket?.onClose.addOnceListener(async (event) => {
            await this.onDisconnectListener?.({ code: event.code, reason: event.reason });
        });
    }

    private prepareReconnectConfigForNextTry() {
        this.reconnectRetries--;
        this.reconnectBackoffTime = Math.min(this.reconnectBackoffTime * 2,
            this.options.reconnectOptions?.maxReconnectDelay ?? 1);
    }
}

