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


import { ConnectionOptions, KolibriConnection } from '../../src/common/kolibri_connection';
import WebSocketAsPromised from 'websocket-as-promised';
import Url from 'url-parse';
import { TestRequest } from '../test_utils/test_models';
jest.mock('websocket-as-promised');
const WebSocketAsPromisedMock = WebSocketAsPromised as jest.MockedClass<typeof WebSocketAsPromised>;
WebSocketAsPromisedMock.prototype.onUnpackedMessage = jest.fn() as any;
WebSocketAsPromisedMock.prototype.onUnpackedMessage.addListener = jest.fn();
WebSocketAsPromisedMock.prototype.onClose = jest.fn() as any;
WebSocketAsPromisedMock.prototype.onClose.addListener = jest.fn();
WebSocketAsPromisedMock.prototype.onClose.addOnceListener = jest.fn();

describe('KolibriConnection:', () => {
    const defaultConnectionOptions: ConnectionOptions = {
        url: new Url('ws://localhost:8080'),
        protocol: 'v3.3.c.kolibri',
        clientMessageListener: () => { }
    };

    describe('sendRequest:', () => {
        it('should send request and get success response', async () => {
            const kolibriConnection = new KolibriConnection(defaultConnectionOptions);
            kolibriConnection.connect();
            const socket = WebSocketAsPromisedMock.mock.instances[0];
            socket.isOpened = true;
            const request = new TestRequest(1, 'test');

            await kolibriConnection.sendRequest(request);

            expect(socket.sendRequest).toHaveBeenCalled();
        });

        it('should fail if no socket connection is established', async () => {
            const kolibriConnection = new KolibriConnection(defaultConnectionOptions);
            const request = new TestRequest(1, 'test');

            await expect(async () => {
                await kolibriConnection.sendRequest(request);
            }).rejects.toThrowError();
        });
    });

    describe('sendResponse:', () => {
        it('should send response', async () => {
            const kolibriConnection = new KolibriConnection(defaultConnectionOptions);
            kolibriConnection.connect();
            const socket = WebSocketAsPromisedMock.mock.instances[0];
            socket.isOpened = true;

            await kolibriConnection.sendResponse({} as any);

            expect(socket.sendPacked).toHaveBeenCalled();
        });

        it('should fail if no socket connection is established', async () => {
            const kolibriConnection = new KolibriConnection(defaultConnectionOptions);
            const request = new TestRequest(1, 'test');

            await expect(async () => {
                await kolibriConnection.sendResponse(request);
            }).rejects.toThrowError();
        });
    });

    describe('connect:', () => {
        it('should create connection', async () => {
            const kolibriConnection = new KolibriConnection(defaultConnectionOptions);

            await kolibriConnection.connect();

            expect(WebSocketAsPromisedMock.prototype.open).toHaveBeenCalled();
        });

        it('should create connection with reconnect enabled and trigger reconnect', async () => {
            let cbFun: Function = jest.fn();
            const addListenerMock = jest.fn().mockImplementation((cb) => { cbFun = cb; });
            WebSocketAsPromisedMock.prototype.onClose = jest.fn() as any;
            WebSocketAsPromisedMock.prototype.onClose.addListener = addListenerMock;
            WebSocketAsPromisedMock.prototype.onClose.addOnceListener = jest.fn();

            const options: ConnectionOptions = {
                url: new Url('ws://localhost:8080'),
                protocol: 'v3.3.c.kolibri',
                reconnectOptions: { maxReconnects: 1, maxReconnectDelay: 10 },
                clientMessageListener: () => { }
            };
            const kolibriConnection = new KolibriConnection(options);
            const reconnectListenerMock = jest.fn();
            kolibriConnection.addOnReconnectListener(reconnectListenerMock);

            await kolibriConnection.connect();
            jest.useFakeTimers({ legacyFakeTimers: true });
            expect(WebSocketAsPromisedMock.prototype.open).toHaveBeenCalled();
            expect(WebSocketAsPromisedMock.prototype.onClose.addListener).toHaveBeenCalled();

            cbFun?.();
            expect(setTimeout).toHaveBeenCalledTimes(1);
            jest.advanceTimersByTime(10000);
        });

        it('should create connection with reconnect enabled and trigger reconnect but failing', async () => {
            let cbFun: Function = jest.fn();
            const addListenerMock = jest.fn().mockImplementation((cb) => { cbFun = cb; });
            WebSocketAsPromisedMock.prototype.onClose = jest.fn() as any;
            WebSocketAsPromisedMock.prototype.onClose.addListener = addListenerMock;
            WebSocketAsPromisedMock.prototype.onClose.addOnceListener = jest.fn();

            const options: ConnectionOptions = {
                url: new Url('ws://localhost:8080'),
                protocol: 'v3.3.c.kolibri',
                reconnectOptions: { maxReconnects: 1, maxReconnectDelay: 10 },
                clientMessageListener: () => { }
            };
            const kolibriConnection = new KolibriConnection(options);
            const reconnectListenerMock = jest.fn();
            kolibriConnection.addOnReconnectListener(reconnectListenerMock);

            await kolibriConnection.connect();
            jest.useFakeTimers({ legacyFakeTimers: true });
            expect(WebSocketAsPromisedMock.prototype.open).toHaveBeenCalled();
            expect(WebSocketAsPromisedMock.prototype.onClose.addListener).toHaveBeenCalled();
            WebSocketAsPromisedMock.prototype.open.mockRejectedValueOnce(new Error());
            cbFun?.();
            expect(setTimeout).toHaveBeenCalledTimes(1);
            jest.advanceTimersByTime(10000);
        });

        it('should throw error creating connection', async () => {
            const kolibriConnection = new KolibriConnection(defaultConnectionOptions);
            WebSocketAsPromisedMock.prototype.open.mockRejectedValueOnce(new Error());

            await expect(async () => {
                await kolibriConnection.connect();
            }).rejects.toThrowError();
        });
    });

    describe('close:', () => {
        it('should close connection', async () => {
            const kolibriConnection = new KolibriConnection(defaultConnectionOptions);
            await kolibriConnection.connect();

            await kolibriConnection.close();

            expect(WebSocketAsPromisedMock.prototype.close).toHaveBeenCalled();
        });
    });
});
