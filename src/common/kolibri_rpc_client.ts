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


import {
    cV32, DefaultKolibriResponse, isDefined, KolibriRpcRequest, KolibriRpcServer, KolibriRpcSuccessResponse
} from '@hms-networks/kolibri-js-core';
import { BaseClient } from './base_client';

const KOLIBRI_PROTOCOL = 'v3.2.c.kolibri';

export class KolibriRpcClient extends BaseClient {
    override getKolibriProtocol(): string {
        return KOLIBRI_PROTOCOL;
    }

    async callKolibriRpc(server: KolibriRpcServer, method: string, params?: unknown) {
        const request = new KolibriRpcRequest<unknown>(this.getNextRpcId(), server, method, params);
        const response: KolibriRpcSuccessResponse<unknown> = await this.sendKolibriRpcRequest(request);
        return response.result;
    }

    // -------------------------------------------------------------------------------------
    // ----------------------- GENERAL -----------------------------------------------------
    // -------------------------------------------------------------------------------------
    override async login(params?: cV32.LoginParams): Promise<cV32.LoginResult> {
        let loginParams;
        if (isDefined(this.config.auth)) {
            loginParams = this.config.auth;
        }
        else if (isDefined(params)) {
            loginParams = params;
        }
        else {
            throw new Error('Authentication not provided. ClientConfig#auth or login params must be provided.');
        }

        const request = new cV32.LoginRequest(this.getNextRpcId(), loginParams);
        const response: cV32.LoginResponse = await this.sendKolibriRequest(request);
        this.storeLoginData(loginParams, response.result);
        return response.result;
    }

    async close(): Promise<number> {
        this.connection.disableReconnect();
        const request = new cV32.CloseRequest(this.getNextRpcId());
        const response: cV32.CloseResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async write(params: cV32.WriteParams): Promise<number> {
        const request = new cV32.WriteRequest(this.getNextRpcId(), params);

        let firstQoSGroup = false;
        let secondQoSGroup = false;

        request.params.nodes.forEach((node) => {
            if (node.quality >= 0 && node.quality <= 2) {
                firstQoSGroup = true;
            }
            else if (node.quality >= 3 && node.quality <= 4) {
                secondQoSGroup = true;
            }

            // check for qos level mix
            if (firstQoSGroup && secondQoSGroup) {
                throw new Error('Points with QoS level 0, 1 or 2 ' +
                    'must not be mixed in the same kolibri.write RPC with points which have QoS level 3 or 4.');
            }
        });

        let tId;
        if (secondQoSGroup) {
            tId = this.getNextTid();
        }

        try {
            const response: cV32.WriteResponse = await this.sendKolibriRequest(request);
            if (tId) {
                await this.commit(new cV32.CommitParams(tId));
            }
            return response.result;
        }
        catch (e) {
            if (tId) {
                try {
                    await this.cancel(new cV32.CancelParams(tId));
                }
                catch (ex) {
                    throw ex;
                }
            }
            throw e;
        }
    }

    async read(params: cV32.ReadParams[]): Promise<cV32.ReadResult[]> {
        const request = new cV32.ReadRequest(this.getNextRpcId(), params);
        const response: cV32.ReadResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    protected async commit(params: cV32.CommitParams): Promise<number> {
        const request = new cV32.CommitRequest(this.getNextRpcId(), params);
        const response: cV32.CommitResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    protected async cancel(params: cV32.CancelParams): Promise<number> {
        const request = new cV32.CancelRequest(this.getNextRpcId(), params);
        const response: cV32.CancelResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    override async subscribe(params: cV32.SubscribeParams[]): Promise<cV32.SubscribeResult[]> {
        const request = new cV32.SubscribeRequest(this.getNextRpcId(), params);
        const response: cV32.SubscribeResponse = await this.sendKolibriRequest(request);
        this.subscription.storeSubscribedNodes(response.result);
        this.storeSubscribeData(params, response.result);
        return response.result;
    }

    async unsubscribe(params: cV32.UnsubscribeParams[]): Promise<number> {
        const request = new cV32.UnsubscribeRequest(this.getNextRpcId(), params);
        const response: DefaultKolibriResponse = await this.sendKolibriRequest(request);
        this.subscription.deleteSubscribedNodes(params);
        this.clearSubscribeData();
        return response.result;
    }

    // -------------------------------------------------------------------------------------
    // ----------------------- PERMISSION MANAGEMENT ---------------------------------------
    // -------------------------------------------------------------------------------------
    async permissionNodeSet(params: cV32.PermissionNodeSetParams): Promise<number> {
        const request = new cV32.PermissionNodeSetRequest(this.getNextRpcId(), params);
        const response: cV32.PermissionNodeSetResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async permissionNodeList(params: cV32.PermissionNodeListParams):
        Promise<cV32.PermissionNodeListResult[]> {
        const request = new cV32.PermissionNodeListRequest(this.getNextRpcId(), params);
        const response: cV32.PermissionNodeListResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async permissionRpcAdd(params: cV32.PermissionRpcAddParams): Promise<number> {
        const request = new cV32.PermissionRpcAddRequest(this.getNextRpcId(), params);
        const response: cV32.PermissionRpcAddResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async permissionRpcRemove(params: cV32.PermissionRpcRemoveParams): Promise<number> {
        const request = new cV32.PermissionRpcRemoveRequest(this.getNextRpcId(), params);
        const response: cV32.PermissionRpcRemoveResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async permissionRpcList(params: cV32.PermissionRpcListParams):
        Promise<cV32.PermissionRpcListResult[]> {
        const request = new cV32.PermissionRpcListRequest(this.getNextRpcId(), params);
        const response: cV32.PermissionRpcListResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async permissionUserList(params: cV32.PermissionUserListParams):
        Promise<cV32.PermissionUserListResult[]> {
        const request = new cV32.PermissionUserListRequest(this.getNextRpcId(), params);
        const response: cV32.PermissionUserListResponse = await this.sendKolibriRequest(request);
        return response.result;
    }
    // -------------------------------------------------------------------------------------
    // ----------------------- PROJECT MANAGEMENT ------------------------------------------
    // -------------------------------------------------------------------------------------
    async projectBrowse(params: cV32.ProjectBrowseParams): Promise<cV32.ProjectBrowseResult[]> {
        const request = new cV32.ProjectBrowseRequest(this.getNextRpcId(), params);
        const response: cV32.ProjectBrowseResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async projectCreate(params: cV32.ProjectCreateParams): Promise<number> {
        const request = new cV32.ProjectCreateRequest(this.getNextRpcId(), params);
        const response: cV32.ProjectCreateResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async projectDelete(params: cV32.ProjectDeleteParams): Promise<number> {
        const request = new cV32.ProjectDeleteRequest(this.getNextRpcId(), params);
        const response: cV32.ProjectDeleteResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async projectGetLiveUsage(params: cV32.ProjectGetLiveUsageParams):
        Promise<cV32.ProjectGetLiveUsageResult[]> {
        const request = new cV32.ProjectGetLiveUsageRequest(this.getNextRpcId(), params);
        const response: cV32.ProjectGetLiveUsageResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async projectGetProperties(params: cV32.ProjectGetPropertiesParams):
        Promise<cV32.ProjectGetPropertiesResult> {
        const request = new cV32.ProjectGetPropertiesRequest(this.getNextRpcId(), params);
        const response: cV32.ProjectGetPropertiesResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async projectGetStatistics(params: cV32.ProjectGetStatisticsParams):
        Promise<cV32.ProjectGetStatisticsResult> {
        const request = new cV32.ProjectGetStatisticsRequest(this.getNextRpcId(), params);
        const response: cV32.ProjectGetStatisticsResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async projectModify(params: cV32.ProjectModifyParams): Promise<number> {
        const request = new cV32.ProjectModifyRequest(this.getNextRpcId(), params);
        const response: cV32.ProjectModifyResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async projectGetHistoryUsage(params: cV32.ProjectGetHistoryUsageParams):
        Promise<cV32.ProjectGetHistoryUsageResult> {
        const request = new cV32.ProjectGetHistoryUsageRequest(this.getNextRpcId(), params);
        const response: cV32.ProjectGetHistoryUsageResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    // -------------------------------------------------------------------------------------
    // ----------------------- USER MANAGEMENT ---------------------------------------------
    // -------------------------------------------------------------------------------------
    override async userSubscribe(params: cV32.UserSubscribeParams[]): Promise<cV32.UserSubscribeResult[]> {
        const request = new cV32.UserSubscribeRequest(this.getNextRpcId(), params);
        const response: cV32.UserSubscribeResponse = await this.sendKolibriRequest(request);
        this.storeUserSubscribeData(params, response.result);
        return response.result;
    }

    async userUnsubscribe(params: cV32.UserUnsubscribeParams[]):
        Promise<cV32.UserUnsubscribeResult[]> {
        const request = new cV32.UserUnsubscribeRequest(this.getNextRpcId(), params);
        const response: cV32.UserUnsubscribeResponse = await this.sendKolibriRequest(request);
        this.clearUserSubscribeData();
        return response.result;
    }

    async userBrowse(params: cV32.UserBrowseParams):
        Promise<cV32.UserBrowseResult[]> {
        const request = new cV32.UserBrowseRequest(this.getNextRpcId(), params);
        const response: cV32.UserBrowseResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userCreate(params: cV32.UserCreateParams): Promise<number> {
        const request = new cV32.UserCreateRequest(this.getNextRpcId(), params);
        const response: cV32.UserCreateResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userModify(params: cV32.UserModifyParams): Promise<number> {
        const request = new cV32.UserModifyRequest(this.getNextRpcId(), params);
        const response: cV32.UserModifyResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGetSessions(params: cV32.UserGetSessionsParams):
        Promise<cV32.UserGetSessionsResult[]> {
        const request = new cV32.UserGetSessionsRequest(this.getNextRpcId(), params);
        const response: cV32.UserGetSessionsResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGetHistory(params: cV32.UserGetHistoryParams):
        Promise<cV32.UserGetHistoryResult[]> {
        const request = new cV32.UserGetHistoryRequest(this.getNextRpcId(), params);
        const response: cV32.UserGetHistoryResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userDelete(params: cV32.UserDeleteParams): Promise<number> {
        const request = new cV32.UserDeleteRequest(this.getNextRpcId(), params);
        const response: cV32.UserDeleteResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGetProperties(params: cV32.UserGetPropertiesParams):
        Promise<cV32.UserGetPropertiesResult> {
        const request = new cV32.UserGetPropertiesRequest(this.getNextRpcId(), params);
        const response: cV32.UserGetPropertiesResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    // -------------------------------------------------------------------------------------
    // ----------------------- USERGROUP MANAGEMENT ----------------------------------------
    // -------------------------------------------------------------------------------------

    async userGroupBrowse(params: cV32.UserGroupBrowseParams): Promise<cV32.UserGroupBrowseResult[]> {
        const request = new cV32.UserGroupBrowseRequest(this.getNextRpcId(), params);
        const response: cV32.UserGroupBrowseResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGroupCreate(params: cV32.UserGroupCreateParams): Promise<number> {
        const request = new cV32.UserGroupCreateRequest(this.getNextRpcId(), params);
        const response: cV32.UserGroupCreateResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGroupModify(params: cV32.UserGroupModifyParams): Promise<number> {
        const request = new cV32.UserGroupModifyRequest(this.getNextRpcId(), params);
        const response: cV32.UserGroupModifyResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGroupDelete(params: cV32.UserGroupDeleteParams): Promise<number> {
        const request = new cV32.UserGroupDeleteRequest(this.getNextRpcId(), params);
        const response: cV32.UserGroupDeleteResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGroupGetProperties(params: cV32.UserGroupGetPropertiesParams):
        Promise<cV32.UserGroupGetPropertiesResult> {
        const request = new cV32.UserGroupGetPropertiesRequest(this.getNextRpcId(), params);
        const response: cV32.UserGroupGetPropertiesResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGroupAddMember(params: cV32.UserGroupAddMemberParams): Promise<number> {
        const request = new cV32.UserGroupAddMemberRequest(this.getNextRpcId(), params);
        const response: cV32.UserGroupAddMemberResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGroupRemoveMember(params: cV32.UserGroupRemoveMemberParams): Promise<number> {
        const request = new cV32.UserGroupRemoveMemberRequest(this.getNextRpcId(), params);
        const response: cV32.UserGroupRemoveMemberResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGroupListMembers(params: cV32.UserGroupListMembersParams): Promise<string[]> {
        const request = new cV32.UserGroupListMembersRequest(this.getNextRpcId(), params);
        const response: cV32.UserGroupListMembersResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGroupIsMember(params: cV32.UserGroupIsMemberParams): Promise<boolean> {
        const request = new cV32.UserGroupIsMemberRequest(this.getNextRpcId(), params);
        const response: cV32.UserGroupIsMemberResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    // -------------------------------------------------------------------------------------
    // ----------------------- NODE MANAGEMENT ----------------------------------------
    // -------------------------------------------------------------------------------------

    async nodeBrowse(params: cV32.NodeBrowseParams): Promise<cV32.NodeBrowseResult[]> {
        const request = new cV32.NodeBrowseRequest(this.getNextRpcId(), params);
        const response: cV32.NodeBrowseResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async nodeCreate(params: cV32.NodeCreateParams): Promise<number> {
        const request = new cV32.NodeCreateRequest(this.getNextRpcId(), params);
        const response: cV32.NodeCreateResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async nodeModify(params: cV32.NodeModifyParams): Promise<number> {
        const request = new cV32.NodeModifyRequest(this.getNextRpcId(), params);
        const response: cV32.NodeModifyResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async nodeDelete(params: cV32.NodeDeleteParams): Promise<number> {
        const request = new cV32.NodeDeleteRequest(this.getNextRpcId(), params);
        const response: cV32.NodeDeleteResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async nodeGetProperties(params: cV32.NodeGetPropertiesParams): Promise<cV32.NodeGetPropertiesResult> {
        const request = new cV32.NodeGetPropertiesRequest(this.getNextRpcId(), params);
        const response: cV32.NodeGetPropertiesResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async nodeGetHistory(params: cV32.NodeGetHistoryParams): Promise<cV32.NodeGetHistoryResult[]> {
        const request = new cV32.NodeGetHistoryRequest(this.getNextRpcId(), params);
        const response: cV32.NodeGetHistoryResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async nodeDeleteHistory(params: cV32.NodeDeleteHistoryParams): Promise<number> {
        const request = new cV32.NodeDeleteHistoryRequest(this.getNextRpcId(), params);
        const response: cV32.NodeDeleteHistoryResponse = await this.sendKolibriRequest(request);
        return response.result;
    }
}

