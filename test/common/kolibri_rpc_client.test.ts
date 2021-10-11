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


import { KolibriConnection } from '../../src/common/kolibri_connection';
import { Subscription } from '../../src/common/subscription';
import { KolibriRpcClient } from '../../src/common/kolibri_rpc_client';

import { ClientConfig } from '../../src/client_config';
import { cV32 } from '@hms-networks/kolibri-js-core';

jest.mock('../../src/common/kolibri_connection');
jest.mock('../../src/common/subscription');

const KolibriConnectionMock = KolibriConnection as jest.MockedClass<typeof KolibriConnection>;
const SubscriptionMock = Subscription as jest.MockedClass<typeof Subscription>;

describe('KolibriRpcClient :', () => {
    const config: ClientConfig = {
        host: 'ws://localhost:8080',
        project: 'testv21',
        path: '/'
    };
    const client = new KolibriRpcClient(config);

    const mockKolibriResponse: any = { jsonrpc: '2.0', id: 1, result: {} };
    KolibriConnectionMock.prototype.sendRequest.mockResolvedValue(mockKolibriResponse);

    describe('login:', () => {
        it('should call and get result', async () => {
            const result = await client.login({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('close:', () => {
        it('should call and get result', async () => {
            const result = await client.close();
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('write:', () => {
        it('should call and get result with qos level <=2', async () => {
            const nodes = [new cV32.WriteNodeParam('/path', 123, 1, true)];
            const params = new cV32.WriteParams(nodes);
            const result = await client.write(params);
            expect(result).toEqual(mockKolibriResponse.result);
        });

        it('should call and get result with qos level >=3', async () => {
            const nodes = [new cV32.WriteNodeParam('/path', 123, 3, true)];
            const params = new cV32.WriteParams(nodes);
            const result = await client.write(params);
            expect(result).toEqual(mockKolibriResponse.result);
            expect(KolibriConnectionMock.prototype.sendRequest).toHaveBeenCalledTimes(2);
        });

        it('should fail and call cancel with qos level >=3', async () => {
            const nodes = [new cV32.WriteNodeParam('/path', 123, 3, true)];
            const params = new cV32.WriteParams(nodes);

            KolibriConnectionMock.prototype.sendRequest.mockRejectedValueOnce(new Error('some error'));

            await expect(async () => { await client.write(params); }).rejects.toThrowError();

            expect(KolibriConnectionMock.prototype.sendRequest).toHaveBeenCalledTimes(2);
        });

        it('should fail if qos levels are mixed in one request', async () => {
            const nodes = [
                new cV32.WriteNodeParam('/path', 123, 1, true),
                new cV32.WriteNodeParam('/path', 123, 3, true)
            ];
            const params = new cV32.WriteParams(nodes);

            await expect(async () => { await client.write(params); }).rejects.toThrowError();
        });
    });

    describe('subscribe:', () => {
        it('should call and get result', async () => {
            const result = await client.subscribe({} as any);

            expect(SubscriptionMock.prototype.storeSubscribedNodes).toHaveBeenCalled();
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('unsubscribe:', () => {
        it('should call and get result', async () => {
            const result = await client.unsubscribe({} as any);

            expect(SubscriptionMock.prototype.deleteSubscribedNodes).toHaveBeenCalled();
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('permissionNodeSet:', () => {
        it('should call and get result', async () => {
            const result = await client.permissionNodeSet({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('permissionNodeList:', () => {
        it('should call and get result', async () => {
            const result = await client.permissionNodeList({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('permissionRpcAdd:', () => {
        it('should call and get result', async () => {
            const result = await client.permissionRpcAdd({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('permissionRpcRemove:', () => {
        it('should call and get result', async () => {
            const result = await client.permissionRpcRemove({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('permissionRpcList:', () => {
        it('should call and get result', async () => {
            const result = await client.permissionRpcList({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('permissionUserList:', () => {
        it('should call and get result', async () => {
            const result = await client.permissionUserList({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('projectBrowse:', () => {
        it('should call and get result', async () => {
            const result = await client.projectBrowse({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('projectCreate:', () => {
        it('should call and get result', async () => {
            const result = await client.projectCreate({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('projectDelete:', () => {
        it('should call and get result', async () => {
            const result = await client.projectDelete({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('projectGetLiveUsage:', () => {
        it('should call and get result', async () => {
            const result = await client.projectGetLiveUsage({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('projectGetProperties:', () => {
        it('should call and get result', async () => {
            const result = await client.projectGetProperties({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('projectGetStatistics:', () => {
        it('should call and get result', async () => {
            const result = await client.projectGetStatistics({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('projectModify:', () => {
        it('should call and get result', async () => {
            const result = await client.projectModify({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('projectGetHistoryUsage:', () => {
        it('should call and get result', async () => {
            const result = await client.projectGetHistoryUsage({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('userSubscribe:', () => {
        it('should call and get result', async () => {
            const result = await client.userSubscribe({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('userUnsubscribe:', () => {
        it('should call and get result', async () => {
            const result = await client.userUnsubscribe({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('userBrowse:', () => {
        it('should call and get result', async () => {
            const result = await client.userBrowse({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('userCreate:', () => {
        it('should call and get result', async () => {
            const result = await client.userCreate({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('userModify:', () => {
        it('should call and get result', async () => {
            const result = await client.userModify({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('userGetSessions:', () => {
        it('should call and get result', async () => {
            const result = await client.userGetSessions({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('userGetHistory:', () => {
        it('should call and get result', async () => {
            const result = await client.userGetHistory({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('userDelete:', () => {
        it('should call and get result', async () => {
            const result = await client.userDelete({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('userGetProperties:', () => {
        it('should call and get result', async () => {
            const result = await client.userGetProperties({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('userGroupBrowse:', () => {
        it('should call and get result', async () => {
            const result = await client.userGroupBrowse({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('userGroupCreate:', () => {
        it('should call and get result', async () => {
            const result = await client.userGroupCreate({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('userGroupModify:', () => {
        it('should call and get result', async () => {
            const result = await client.userGroupModify({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('userGroupDelete:', () => {
        it('should call and get result', async () => {
            const result = await client.userGroupDelete({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('userGroupGetProperties:', () => {
        it('should call and get result', async () => {
            const result = await client.userGroupGetProperties({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('userGroupAddMember:', () => {
        it('should call and get result', async () => {
            const result = await client.userGroupAddMember({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('userGroupRemoveMember:', () => {
        it('should call and get result', async () => {
            const result = await client.userGroupRemoveMember({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('userGroupListMembers:', () => {
        it('should call and get result', async () => {
            const result = await client.userGroupListMembers({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('userGroupIsMember:', () => {
        it('should call and get result', async () => {
            const result = await client.userGroupIsMember({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('nodeBrowse:', () => {
        it('should call and get result', async () => {
            const result = await client.nodeBrowse({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('nodeCreate:', () => {
        it('should call and get result', async () => {
            const result = await client.nodeCreate({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('nodeModify:', () => {
        it('should call and get result', async () => {
            const result = await client.nodeModify({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('nodeDelete:', () => {
        it('should call and get result', async () => {
            const result = await client.nodeDelete({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('nodeGetProperties:', () => {
        it('should call and get result', async () => {
            const result = await client.nodeGetProperties({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('nodeGetHistory:', () => {
        it('should call and get result', async () => {
            const result = await client.nodeGetHistory({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });

    describe('nodeDeleteHistory:', () => {
        it('should call and get result', async () => {
            const result = await client.nodeDeleteHistory({} as any);
            expect(result).toEqual(mockKolibriResponse.result);
        });
    });
});
