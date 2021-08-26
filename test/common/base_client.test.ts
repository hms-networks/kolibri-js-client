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
import TestClient from './test_client';
import { ConnectionOptions, KolibriConnection } from '../../src/common/kolibri_connection';
import { Subscription } from '../../src/common/subscription';
import { ClientConfig } from '../../src';
import Url from 'url-parse';
import { TestErrorResponse, TestRequest } from '../test_utils/test_models';
import {
    DefaultKolibriResponse, errorcode, errorFromCode, KolibriRequestError,
    KolibriRpcErrorResponse, KolibriRpcRequest, KolibriRpcSuccessResponse, cV33
} from '@hms-networks/kolibri-js-core';

jest.mock('../../src/common/subscription');
jest.mock('../../src/common/kolibri_connection');

const KolibriConnectionMock = KolibriConnection as jest.MockedClass<typeof KolibriConnection>;
const SubscriptionMock = Subscription as jest.MockedClass<typeof Subscription>;


describe('BaseClient:', () => {
    const defaultConfig: ClientConfig = {
        host: 'ws://localhost:8080',
        project: 'testv21',
        path: '/'
    };

    describe('Create Client:', () => {
        it('should create client object', () => {
            const client: BaseClient = new TestClient(defaultConfig);
            expect(client).toBeDefined();
        });

        it('should create client object with different port', () => {
            const config: ClientConfig = {
                host: 'ws://localhost:8080',
                port: 9090,
                project: 'testv21',
                path: '/'
            };

            const expectedConfig: ConnectionOptions = {
                clientMessageListener: expect.anything(),
                protocol: 'TestClientProtocolVersion',
                url: new Url('ws://localhost:9090/testv21/')
            };
            const client = new TestClient(config);
            expect(client).toBeDefined();
            expect(KolibriConnectionMock).toHaveBeenCalledWith(expectedConfig);
        });
    });

    describe('Reconnect Handler:', () => {
        it('should trigger reconnect and login as previous client', async () => {
            const config: ClientConfig = {
                host: 'ws://localhost:8080',
                project: 'testv21',
                path: '/',
                reconnect: { maxReconnectDelay: 1000, maxReconnects: 1, resumeSubscriptions: true }
            };

            let cbFun: Function = jest.fn();
            const reconnectListenerMock = jest.fn().mockImplementation(async (cb) => { cbFun = cb; });
            KolibriConnectionMock.prototype.addOnReconnectListener = reconnectListenerMock;
            const client = new TestClient(config);
            client.storeLoginData({}, { client: '123' });

            expect(client).toBeDefined();
            await cbFun?.();
        });

        it('should trigger reconnect and login as new client', async () => {
            const config: ClientConfig = {
                host: 'ws://localhost:8080',
                project: 'testv21',
                path: '/',
                reconnect: { maxReconnectDelay: 1000, maxReconnects: 1, resumeSubscriptions: true },
                auth: {} as any
            };

            let cbFun: Function = jest.fn();
            const reconnectListenerMock = jest.fn().mockImplementation(async (cb) => { cbFun = cb; });
            KolibriConnectionMock.prototype.addOnReconnectListener = reconnectListenerMock;
            const client = new TestClient(config);

            expect(client).toBeDefined();
            await cbFun?.();
        });

        it('should trigger reconnect and login as new client and resume subscriptions', async () => {
            const config: ClientConfig = {
                host: 'ws://localhost:8080',
                project: 'testv21',
                path: '/',
                reconnect: { maxReconnectDelay: 1000, maxReconnects: 1, resumeSubscriptions: true },
                auth: {} as any
            };

            let cbFun: Function = jest.fn();
            const reconnectListenerMock = jest.fn().mockImplementation(async (cb) => { cbFun = cb; });
            KolibriConnectionMock.prototype.addOnReconnectListener = reconnectListenerMock;
            const client = new TestClient(config);
            client.storeUserSubscribeData({}, {});
            client.storeSubscribeData({}, {});

            expect(client).toBeDefined();
            await cbFun?.();
        });
    });

    describe('Add Event Listeners:', () => {
        it('should add onUnsubscribeListener', () => {
            const client = new TestClient(defaultConfig);

            const listener = (_data: any[]) => { };
            client.addOnUnsubscribed(listener);

            const subscription = SubscriptionMock.mock.instances[0];

            expect(subscription.onUnsubscribed).toBeDefined();
            expect(subscription.onUnsubscribed).toEqual(listener);
        });

        it('should add onWriteListener', () => {
            const client = new TestClient(defaultConfig);
            const listener = (_data: any[]) => { };
            client.addOnWriteListener(listener);

            const subscription = SubscriptionMock.mock.instances[0];

            expect(subscription.onWrite).toBeDefined();
            expect(subscription.onWrite).toEqual(listener);
        });

        it('should add onUserNotifyListener', () => {
            const client = new TestClient(defaultConfig);
            const listener = (_data: any[]) => { };
            client.addOnUserNotifyListener(listener);

            const subscription = SubscriptionMock.mock.instances[0];

            expect(subscription.onUserNotify).toBeDefined();
            expect(subscription.onUserNotify).toEqual(listener);
        });

        it('should add onErrorListener', () => {
            const client = new TestClient(defaultConfig);
            const listener = (_data: any[]) => { };
            client.addOnErrorListener(listener);

            const subscription = SubscriptionMock.mock.instances[0];

            expect(subscription.onError).toBeDefined();
            expect(subscription.onError).toEqual(listener);
        });
    });

    describe('connect:', () => {
        it('should connect', async () => {
            const client: BaseClient = new TestClient(defaultConfig);

            await client.connect();

            expect(KolibriConnectionMock.prototype.connect).toHaveBeenCalled();
        });
    });

    describe('disconnect:', () => {
        it('should disconnect', async () => {
            const client: BaseClient = new TestClient(defaultConfig);

            await client.disconnect();

            expect(KolibriConnectionMock.prototype.close).toHaveBeenCalled();
        });
    });

    describe('sendKolibriRequest', () => {
        it('should send kolibri request and get success response', async () => {
            const responseMock = new DefaultKolibriResponse(1, 0);
            KolibriConnectionMock.prototype.sendRequest.mockResolvedValueOnce(responseMock);

            const client: BaseClient = new TestClient(defaultConfig);
            const testRequest = new TestRequest(1, 'test', 0);
            const response = await client.sendKolibriRequest(testRequest);

            expect(response).toBe(responseMock);
            expect(KolibriConnectionMock.prototype.sendRequest).toHaveBeenCalled();
        });

        it('should send request and get failure response', async () => {
            const responseMock = new TestErrorResponse();
            KolibriConnectionMock.prototype.sendRequest.mockResolvedValueOnce(responseMock);
            const client: BaseClient = new TestClient(defaultConfig);
            const request = new TestRequest(1, 'test', 0);
            await expect(async () => {
                await client.sendKolibriRequest(request);
            }).rejects.toThrowError(KolibriRequestError);
        });

        it('should fail if response is not valid', async () => {
            KolibriConnectionMock.prototype.sendRequest.mockResolvedValueOnce({} as any);

            const request = new TestRequest(1, 'test', 0);
            const client: BaseClient = new TestClient(defaultConfig);
            await expect(async () => {
                await client.sendKolibriRequest(request);
            }).rejects.toThrowError();
        });
    });

    describe('sendKolibriRpcRequest', () => {
        it('should send kolibri rpc request and get success response', async () => {
            const responseMock = new KolibriRpcSuccessResponse(1, {
                user: 'test',
                client: 'test'
            }, 0);
            KolibriConnectionMock.prototype.sendRequest.mockResolvedValueOnce(responseMock);

            const client: BaseClient = new TestClient(defaultConfig);
            const testRequest = new class extends TestRequest {
                _server = {
                    user: 'test',
                    client: 'test'
                }
            }(1, 'test', 0);
            const response = await client.sendKolibriRpcRequest(testRequest);

            expect(response).toBe(responseMock);
            expect(KolibriConnectionMock.prototype.sendRequest).toHaveBeenCalled();
        });

        it('should send request and get failure response', async () => {
            const responseMock = new KolibriRpcErrorResponse(1, {
                user: 'test',
                client: 'test'
            }, {} as any);
            KolibriConnectionMock.prototype.sendRequest.mockResolvedValueOnce(responseMock);
            const client: BaseClient = new TestClient(defaultConfig);

            await expect(async () => {
                await client.sendKolibriRpcRequest({} as any);
            }).rejects.toThrowError(KolibriRequestError);
        });

        it('should fail if response is not valid', async () => {
            KolibriConnectionMock.prototype.sendRequest.mockResolvedValueOnce({} as any);

            const client: BaseClient = new TestClient(defaultConfig);
            await expect(async () => {
                await client.sendKolibriRpcRequest({} as any);
            }).rejects.toThrowError();
        });
    });

    describe('handleWriteRequest:', () => {
        it('should trigger onWrite ', async () => {
            const client = new TestClient(defaultConfig);
            client.addOnWriteListener(jest.fn());

            const params = new cV33.WriteParams([{
                path: '/scope/group1/point1',
                timestamp: 12312312,
                quality: 1,
                value: true
            }]);
            const request = new cV33.WriteRequest(1, params);
            const subscription = SubscriptionMock.mock.instances[0];
            const mockNodeProperties = { path: '/scope/group1/point1', dataType: 1 };
            subscription.fetchSubscribedNode = jest.fn().mockReturnValueOnce(mockNodeProperties);
            const expectedData = [{ ...mockNodeProperties, ...params.nodes[0] }];

            await client.handleWriteRequest(request);

            expect(subscription.onWrite).toHaveBeenCalledWith(expectedData);
        });

        it('should trigger not trigger onWrite but store data as transaction ', async () => {
            const client = new TestClient(defaultConfig);
            client.addOnWriteListener(jest.fn());
            const params = new cV33.WriteParams([{
                path: '/scope/group1/point1',
                timestamp: 12312312,
                quality: 1,
                value: true
            }], 1);
            const request = new cV33.WriteRequest(1, params);
            const subscription = SubscriptionMock.mock.instances[0];
            const mockNodeProperties = { path: '/scope/group1/point1', dataType: 1 };
            subscription.fetchSubscribedNode = jest.fn().mockReturnValueOnce(mockNodeProperties);
            const expectedData = [{ ...mockNodeProperties, ...params.nodes[0] }];

            await client.handleWriteRequest(request);

            expect(client.getWriteTransactions().get(1)).toEqual(expectedData);
            expect(subscription.onWrite).not.toHaveBeenCalled();
        });

        it('should trigger onError ', async () => {
            const client = new TestClient(defaultConfig);
            client.addOnErrorListener(jest.fn());
            const params = new cV33.WriteParams([{
                path: '/scope/group1/point1',
                timestamp: 12312312,
                quality: 1,
                value: true
            }]);
            const request = new cV33.WriteRequest(1, params);
            const subscription = SubscriptionMock.mock.instances[0];
            const connection = KolibriConnectionMock.mock.instances[0];
            connection.sendResponse = jest.fn().mockRejectedValueOnce('no conn');

            await client.handleWriteRequest(request);

            expect(subscription.onError).toHaveBeenCalledWith('no conn');
        });


        it('should not trigger onWrite if writeRequest has unknown nodes', async () => {
            const client = new TestClient(defaultConfig);
            client.addOnWriteListener(jest.fn());

            const params = new cV33.WriteParams([{
                path: '/scope/group1/point1',
                timestamp: 12312312,
                quality: 1,
                value: true
            }]);
            const request = new cV33.WriteRequest(1, params);
            const subscription = SubscriptionMock.mock.instances[0];


            await client.handleWriteRequest(request);

            expect(subscription.onWrite).not.toHaveBeenCalled();
        });
    });

    describe('handleUnsubscribedRequest:', () => {
        it('should trigger onUnsubscribed ', async () => {
            const client = new TestClient(defaultConfig);
            client.addOnUnsubscribed(jest.fn());

            const param = new cV33.UnsubscribedParams('/scope/group1/point1', true);
            const request = new cV33.UnsubscribedRequest(1, [param]);
            const subscription = SubscriptionMock.mock.instances[0];

            await client.handleUnsubscribedRequest(request);

            expect(subscription.onUnsubscribed).toHaveBeenCalledWith(request.params);
        });
    });

    describe('handleUserNotifyRequest:', () => {
        it('should trigger onUnsubscribed ', async () => {
            const client = new TestClient(defaultConfig);
            client.addOnUserNotifyListener(jest.fn());

            const param = new cV33.UserNotifyParams('user', 123123, 'login', 'data');
            const request = new cV33.UserNotifyRequest(1, [param]);
            const subscription = SubscriptionMock.mock.instances[0];

            await client.handleUserNotifyRequest(request);

            expect(subscription.onUserNotify).toHaveBeenCalledWith(request.params);
        });
    });

    describe('handleCommitRequest:', () => {
        it('should trigger onWrite ', async () => {
            const client = new TestClient(defaultConfig);
            client.addOnWriteListener(jest.fn());
            const pendingWriteResult = [{}];
            client.getWriteTransactions().set(1, pendingWriteResult);

            const param = new cV33.CommitParams(1);
            const request = new cV33.CommitRequest(1, param);
            const subscription = SubscriptionMock.mock.instances[0];

            await client.handleCommitRequest(request);

            expect(subscription.onWrite).toHaveBeenCalledWith(pendingWriteResult);
        });

        it('should not trigger onWrite if no match ', async () => {
            const client = new TestClient(defaultConfig);
            client.addOnWriteListener(jest.fn());

            const param = new cV33.CommitParams(1);
            const request = new cV33.CommitRequest(1, param);
            const subscription = SubscriptionMock.mock.instances[0];

            await client.handleCommitRequest(request);

            expect(subscription.onWrite).not.toHaveBeenCalled();
        });

        it('should trigger onError ', async () => {
            const client = new TestClient(defaultConfig);
            client.addOnErrorListener(jest.fn());
            const param = new cV33.CommitParams(1);
            const request = new cV33.CommitRequest(1, param);
            const subscription = SubscriptionMock.mock.instances[0];
            const connection = KolibriConnectionMock.mock.instances[0];
            connection.sendResponse = jest.fn().mockRejectedValueOnce('no conn');

            await client.handleCommitRequest(request);

            expect(subscription.onError).toHaveBeenCalledWith('no conn');
        });
    });

    describe('clientEventDispatcher:', () => {
        it('should dispatch to handleWriteRequest', async () => {
            const client = new TestClient(defaultConfig);
            const spy = jest.spyOn(client, 'handleConsumerRpcRequest').mockImplementation(async () => { });
            const jsonrpc = { jsonrpc: '2.0', id: 1, method: 'kolibri.write', params: {} };

            await client.clientEventDispatcher(jsonrpc);

            expect(spy).toHaveBeenCalledWith(jsonrpc);
        });
    });

    describe('handleConsumerRpcRequest:', () => {
        it('should dispatch to handleWriteRequest', async () => {
            const client = new TestClient(defaultConfig);
            const connection = KolibriConnectionMock.mock.instances[0];
            const jsonrpc = { jsonrpc: '2.0', id: 1, method: 'kolibri.write', params: { nodes: [] } };

            await client.handleConsumerRpcRequest(jsonrpc);

            expect(connection.sendResponse).toHaveBeenCalled();
        });

        it('should dispatch to handleUnsubscribedRequest', async () => {
            const client = new TestClient(defaultConfig);
            client.addOnUnsubscribed(jest.fn());
            const connection = KolibriConnectionMock.mock.instances[0];
            const subscription = SubscriptionMock.mock.instances[0];
            const jsonrpc = { jsonrpc: '2.0', id: 1, method: 'kolibri.unsubscribed', params: {} };

            await client.handleConsumerRpcRequest(jsonrpc);

            expect(connection.sendResponse).toHaveBeenCalled();
            expect(subscription.onUnsubscribed).toHaveBeenCalled();
        });

        it('should dispatch to handleUserNotifyRequest', async () => {
            const client = new TestClient(defaultConfig);
            client.addOnUserNotifyListener(jest.fn());
            const connection = KolibriConnectionMock.mock.instances[0];
            const subscription = SubscriptionMock.mock.instances[0];
            const jsonrpc = { jsonrpc: '2.0', id: 1, method: 'kolibri.user.notify', params: {} };

            await client.handleConsumerRpcRequest(jsonrpc);

            expect(connection.sendResponse).toHaveBeenCalled();
            expect(subscription.onUserNotify).toHaveBeenCalled();
        });

        it('should dispatch to handleCommitRequest', async () => {
            const client = new TestClient(defaultConfig);
            client.handleCommitRequest = jest.fn();
            const connection = KolibriConnectionMock.mock.instances[0];
            const jsonrpc = { jsonrpc: '2.0', id: 1, method: 'kolibri.commit', params: {} };

            await client.handleConsumerRpcRequest(jsonrpc);

            expect(connection.sendResponse).toHaveBeenCalled();
        });

        it('should ignore and respond with method not found if method not implemented ', async () => {
            const client = new TestClient(defaultConfig);
            const connection = KolibriConnectionMock.mock.instances[0];
            const jsonrpc = { jsonrpc: '2.0', id: 1, method: 'kolibri.unknown', params: {} };

            await client.handleConsumerRpcRequest(jsonrpc);

            expect(connection.sendResponse).toHaveBeenCalled();
        });
    });

    describe('handleKolibriRpcRequest:', () => {
        it('should call custom kolibri rpc and send response to caller', async () => {
            const client = new TestClient(defaultConfig);
            const handlerMock = jest.fn();
            client.registerKolibriRpc('testRpc', handlerMock);
            const connection = KolibriConnectionMock.mock.instances[0];
            const kolibriRpc = new KolibriRpcRequest(1, { user: 'test', client: 'test' }, 'testRpc', {});

            await client.handleKolibriRpcRequest(kolibriRpc);


            expect(handlerMock).toHaveBeenCalled();
            expect(connection.sendResponse).toHaveBeenCalled();
        });

        it('should ignore and respond with method not found if method not implemented ', async () => {
            const client = new TestClient(defaultConfig);
            const connection = KolibriConnectionMock.mock.instances[0];
            const kolibriRpc = new KolibriRpcRequest(1, { user: 'test', client: 'test' }, 'unknownRpc', {});

            await client.handleKolibriRpcRequest(kolibriRpc);

            expect(connection.sendResponse).toHaveBeenCalledTimes(1);
        });

        it('should send error response to caller on processing error', async () => {
            const client = new TestClient(defaultConfig);
            const handlerMock = jest.fn();
            handlerMock.mockRejectedValueOnce(new Error('some error during processing'));
            client.registerKolibriRpc('testRpc', handlerMock);
            const connection = KolibriConnectionMock.mock.instances[0];
            const kolibriRpc = new KolibriRpcRequest(1, { user: 'test', client: 'test' }, 'testRpc', {});

            const errorResponse = new KolibriRpcErrorResponse<unknown>(kolibriRpc.id, kolibriRpc._server,
                errorFromCode(errorcode.KOLIBRI_RPC_ERROR.code));

            await client.handleKolibriRpcRequest(kolibriRpc);


            expect(handlerMock).toHaveBeenCalled();
            expect(connection.sendResponse).toHaveBeenCalledWith(errorResponse);
        });

        it('should fail if sending result fails', async () => {
            const client = new TestClient(defaultConfig);
            const handlerMock = jest.fn();
            client.registerKolibriRpc('testRpc', handlerMock);
            const connection = KolibriConnectionMock.mock.instances[0];
            connection.sendResponse = jest.fn().mockRejectedValueOnce(new Error());
            const kolibriRpc = new KolibriRpcRequest(1, { user: 'test', client: 'test' }, 'testRpc', {});

            await expect(async () => {
                await client.handleKolibriRpcRequest(kolibriRpc);
            }).rejects.toThrowError(Error);
        });
    });
});

