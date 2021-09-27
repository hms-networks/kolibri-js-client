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


import { KolibriClient } from '../src/client';
import { KolibriRpcClient } from '../src/common/kolibri_rpc_client';
import { getAllMethods } from './test_utils/object_utils';

jest.mock('../src/common/kolibri_rpc_client');

const LatestClientMock = KolibriRpcClient as jest.MockedClass<typeof KolibriRpcClient>;

describe('Client:', () => {
    const mock: any = new LatestClientMock({} as any);
    const client: any = new KolibriClient(mock);

    const allLatestDelegateMethods = getAllMethods(mock);
    const allLatestClientMethods = getAllMethods(client);
    describe('Delegate method call to client object:', () => {
        const methodIntersection = allLatestDelegateMethods.filter(value => allLatestClientMethods.includes(value));

        it.each(methodIntersection)('should call %s method on delegates', (method: string) => {
            client[method]();
            expect(mock[method]).toHaveBeenCalled();
        });
    });

    describe('Ensure all methods of the delegate are called:', () => {
        const onlyPublicMethods = allLatestDelegateMethods.filter(onlyPublicMethodFilter());

        it.each(onlyPublicMethods)('should ensure to call delegates %s method', (method: string) => {
            client[method]();
            expect(mock[method]).toHaveBeenCalled();
        });
    });
});

function onlyPublicMethodFilter(): (value: any, index: number, array: any[]) => unknown {
    return value => ![
        'getKolibriProtocol',
        'addOnErrorListener',
        'addOnUnsubscribed',
        'addOnUserNotifyListener',
        'addOnWriteListener',
        'cancel',
        'commit',
        'clientEventDispatcher',
        'handleCommitRequest',
        'handleUnsubscribedRequest',
        'handleUserNotifyRequest',
        'handleWriteRequest',
        'handleConsumerRpcRequest',
        'handleGetRpcInfoRequest',
        'handleKolibriRpcRequest',
        'initReconnectHandler',
        'initBuildInConsumerRpcs',
        'storeLoginData',
        'restoreLogin',
        'storeSubscribeData',
        'clearSubscribeData',
        'storeUserSubscribeData',
        'restoreSubscriptions',
        'clearUserSubscribeData',
        'sendKolibriRequest',
        'sendKolibriRpcRequest',
        'getNextRpcId',
        'getNextTid'

    ].includes(value);
}

