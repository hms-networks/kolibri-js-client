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


import { BaseClient } from '../../src/common/base_client';

export default class TestClient extends BaseClient {
    login(_params?: unknown): Promise<unknown> {
        return {} as any;
    }

    subscribe(_params: unknown): Promise<unknown> {
        return {} as any;
    }

    userSubscribe(_params: unknown): Promise<unknown> {
        return {} as any;
    }
    getKolibriProtocol(): string {
        return 'TestClientProtocolVersion' as any;
    }

    getWriteTransactions() {
        return this.writeTransactions;
    }

    override storeLoginData(request: any, result: any) {
        super.storeLoginData(request, result);
    }

    override storeUserSubscribeData(request: any, result: any) {
        super.storeUserSubscribeData(request, result);
    }

    override storeSubscribeData(request: any, result: any) {
        super.storeSubscribeData(request, result);
    }

    override async handleWriteRequest(request: any) {
        await super.handleWriteRequest(request);
    }

    override async handleUnsubscribedRequest(request: any) {
        super.handleUnsubscribedRequest(request);
    }

    override async handleUserNotifyRequest(request: any) {
        super.handleUserNotifyRequest(request);
    }

    override async handleCommitRequest(request: any) {
        await super.handleCommitRequest(request);
    }

    override async clientEventDispatcher(jsonrpc: any) {
        await super.clientEventDispatcher(jsonrpc);
    }

    override async handleConsumerRpcRequest(jsonrpc: any) {
        await super.handleConsumerRpcRequest(jsonrpc);
    }
}
