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
    cV33, DefaultKolibriResponse, isDefined, KolibriRpcRequest, KolibriRpcServer, KolibriRpcSuccessResponse
} from '@hms-networks/kolibri-js-core';
import { BaseClient } from './base_client';

const KOLIBRI_PROTOCOL = 'v3.3.c.kolibri';

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
    override async login(params?: cV33.LoginParams): Promise<cV33.LoginResult> {
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

        const request = new cV33.LoginRequest(this.getNextRpcId(), loginParams);
        const response: cV33.LoginResponse = await this.sendKolibriRequest(request);
        this.storeLoginData(loginParams, response.result);
        return response.result;
    }

    async updateToken(params: cV33.UpdateTokenParams): Promise<number> {
        const request = new cV33.UpdateTokenRequest(this.getNextRpcId(), params);
        const response: cV33.UpdateTokenResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async logout(): Promise<number> {
        const request = new cV33.LogoutRequest(this.getNextRpcId());
        const response: cV33.LogoutResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async close(): Promise<number> {
        this.connection.disableReconnect();
        const request = new cV33.CloseRequest(this.getNextRpcId());
        const response: cV33.CloseResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async write(params: cV33.WriteParams): Promise<number> {
        const request = new cV33.WriteRequest(this.getNextRpcId(), params);

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
            const response: cV33.WriteResponse = await this.sendKolibriRequest(request);
            if (tId) {
                await this.commit(new cV33.CommitParams(tId));
            }
            return response.result;
        }
        catch (e) {
            if (tId) {
                try {
                    await this.cancel(new cV33.CancelParams(tId));
                }
                catch (ex) {
                    throw ex;
                }
            }
            throw e;
        }
    }

    async read(params: cV33.ReadParams[]): Promise<cV33.ReadResult[]> {
        const request = new cV33.ReadRequest(this.getNextRpcId(), params);
        const response: cV33.ReadResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    protected async commit(params: cV33.CommitParams): Promise<number> {
        const request = new cV33.CommitRequest(this.getNextRpcId(), params);
        const response: cV33.CommitResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    protected async cancel(params: cV33.CancelParams): Promise<number> {
        const request = new cV33.CancelRequest(this.getNextRpcId(), params);
        const response: cV33.CancelResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    override async subscribe(params: cV33.SubscribeParams[]): Promise<cV33.SubscribeResult[]> {
        const request = new cV33.SubscribeRequest(this.getNextRpcId(), params);
        const response: cV33.SubscribeResponse = await this.sendKolibriRequest(request);
        this.subscription.storeSubscribedNodes(response.result);
        this.storeSubscribeData(params, response.result);
        return response.result;
    }

    async unsubscribe(params: cV33.UnsubscribeParams[]): Promise<number> {
        const request = new cV33.UnsubscribeRequest(this.getNextRpcId(), params);
        const response: DefaultKolibriResponse = await this.sendKolibriRequest(request);
        this.subscription.deleteSubscribedNodes(params);
        this.clearSubscribeData();
        return response.result;
    }

    // -------------------------------------------------------------------------------------
    // ----------------------- PERMISSION MANAGEMENT ---------------------------------------
    // -------------------------------------------------------------------------------------
    async permissionNodeSet(params: cV33.PermissionNodeSetParams): Promise<number> {
        const request = new cV33.PermissionNodeSetRequest(this.getNextRpcId(), params);
        const response: cV33.PermissionNodeSetResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async permissionNodeList(params: cV33.PermissionNodeListParams):
        Promise<cV33.PermissionNodeListResult[]> {
        const request = new cV33.PermissionNodeListRequest(this.getNextRpcId(), params);
        const response: cV33.PermissionNodeListResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async permissionRpcAdd(params: cV33.PermissionRpcAddParams): Promise<number> {
        const request = new cV33.PermissionRpcAddRequest(this.getNextRpcId(), params);
        const response: cV33.PermissionRpcAddResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async permissionRpcRemove(params: cV33.PermissionRpcRemoveParams): Promise<number> {
        const request = new cV33.PermissionRpcRemoveRequest(this.getNextRpcId(), params);
        const response: cV33.PermissionRpcRemoveResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async permissionRpcList(params: cV33.PermissionRpcListParams):
        Promise<cV33.PermissionRpcListResult[]> {
        const request = new cV33.PermissionRpcListRequest(this.getNextRpcId(), params);
        const response: cV33.PermissionRpcListResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async permissionUserList(params: cV33.PermissionUserListParams):
        Promise<cV33.PermissionUserListResult[]> {
        const request = new cV33.PermissionUserListRequest(this.getNextRpcId(), params);
        const response: cV33.PermissionUserListResponse = await this.sendKolibriRequest(request);
        return response.result;
    }
    // -------------------------------------------------------------------------------------
    // ----------------------- PROJECT MANAGEMENT ------------------------------------------
    // -------------------------------------------------------------------------------------
    async projectBrowse(params: cV33.ProjectBrowseParams): Promise<cV33.ProjectBrowseResult[]> {
        const request = new cV33.ProjectBrowseRequest(this.getNextRpcId(), params);
        const response: cV33.ProjectBrowseResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async projectCreate(params: cV33.ProjectCreateParams): Promise<number> {
        const request = new cV33.ProjectCreateRequest(this.getNextRpcId(), params);
        const response: cV33.ProjectCreateResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async projectDelete(params: cV33.ProjectDeleteParams): Promise<number> {
        const request = new cV33.ProjectDeleteRequest(this.getNextRpcId(), params);
        const response: cV33.ProjectDeleteResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async projectGetLiveUsage(params: cV33.ProjectGetLiveUsageParams):
        Promise<cV33.ProjectGetLiveUsageResult[]> {
        const request = new cV33.ProjectGetLiveUsageRequest(this.getNextRpcId(), params);
        const response: cV33.ProjectGetLiveUsageResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async projectGetProperties(params: cV33.ProjectGetPropertiesParams):
        Promise<cV33.ProjectGetPropertiesResult> {
        const request = new cV33.ProjectGetPropertiesRequest(this.getNextRpcId(), params);
        const response: cV33.ProjectGetPropertiesResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async projectGetStatistics(params: cV33.ProjectGetStatisticsParams):
        Promise<cV33.ProjectGetStatisticsResult> {
        const request = new cV33.ProjectGetStatisticsRequest(this.getNextRpcId(), params);
        const response: cV33.ProjectGetStatisticsResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async projectModify(params: cV33.ProjectModifyParams): Promise<number> {
        const request = new cV33.ProjectModifyRequest(this.getNextRpcId(), params);
        const response: cV33.ProjectModifyResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async projectGetHistoryUsage(params: cV33.ProjectGetHistoryUsageParams):
        Promise<cV33.ProjectGetHistoryUsageResult> {
        const request = new cV33.ProjectGetHistoryUsageRequest(this.getNextRpcId(), params);
        const response: cV33.ProjectGetHistoryUsageResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    // -------------------------------------------------------------------------------------
    // ----------------------- USER MANAGEMENT ---------------------------------------------
    // -------------------------------------------------------------------------------------
    override async userSubscribe(params: cV33.UserSubscribeParams[]): Promise<cV33.UserSubscribeResult[]> {
        const request = new cV33.UserSubscribeRequest(this.getNextRpcId(), params);
        const response: cV33.UserSubscribeResponse = await this.sendKolibriRequest(request);
        this.storeUserSubscribeData(params, response.result);
        return response.result;
    }

    async userUnsubscribe(params: cV33.UserUnsubscribeParams[]):
        Promise<cV33.UserUnsubscribeResult[]> {
        const request = new cV33.UserUnsubscribeRequest(this.getNextRpcId(), params);
        const response: cV33.UserUnsubscribeResponse = await this.sendKolibriRequest(request);
        this.clearUserSubscribeData();
        return response.result;
    }

    async userBrowse(params: cV33.UserBrowseParams):
        Promise<cV33.UserBrowseResult[]> {
        const request = new cV33.UserBrowseRequest(this.getNextRpcId(), params);
        const response: cV33.UserBrowseResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userCreate(params: cV33.UserCreateParams): Promise<number> {
        const request = new cV33.UserCreateRequest(this.getNextRpcId(), params);
        const response: cV33.UserCreateResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userModify(params: cV33.UserModifyParams): Promise<number> {
        const request = new cV33.UserModifyRequest(this.getNextRpcId(), params);
        const response: cV33.UserModifyResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGetSessions(params: cV33.UserGetSessionsParams):
        Promise<cV33.UserGetSessionsResult[]> {
        const request = new cV33.UserGetSessionsRequest(this.getNextRpcId(), params);
        const response: cV33.UserGetSessionsResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGetHistory(params: cV33.UserGetHistoryParams):
        Promise<cV33.UserGetHistoryResult[]> {
        const request = new cV33.UserGetHistoryRequest(this.getNextRpcId(), params);
        const response: cV33.UserGetHistoryResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userDelete(params: cV33.UserDeleteParams): Promise<number> {
        const request = new cV33.UserDeleteRequest(this.getNextRpcId(), params);
        const response: cV33.UserDeleteResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGetProperties(params: cV33.UserGetPropertiesParams):
        Promise<cV33.UserGetPropertiesResult> {
        const request = new cV33.UserGetPropertiesRequest(this.getNextRpcId(), params);
        const response: cV33.UserGetPropertiesResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    // -------------------------------------------------------------------------------------
    // ----------------------- USERGROUP MANAGEMENT ----------------------------------------
    // -------------------------------------------------------------------------------------

    async userGroupBrowse(params: cV33.UserGroupBrowseParams): Promise<cV33.UserGroupBrowseResult[]> {
        const request = new cV33.UserGroupBrowseRequest(this.getNextRpcId(), params);
        const response: cV33.UserGroupBrowseResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGroupCreate(params: cV33.UserGroupCreateParams): Promise<number> {
        const request = new cV33.UserGroupCreateRequest(this.getNextRpcId(), params);
        const response: cV33.UserGroupCreateResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGroupModify(params: cV33.UserGroupModifyParams): Promise<number> {
        const request = new cV33.UserGroupModifyRequest(this.getNextRpcId(), params);
        const response: cV33.UserGroupModifyResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGroupDelete(params: cV33.UserGroupDeleteParams): Promise<number> {
        const request = new cV33.UserGroupDeleteRequest(this.getNextRpcId(), params);
        const response: cV33.UserGroupDeleteResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGroupGetProperties(params: cV33.UserGroupGetPropertiesParams):
        Promise<cV33.UserGroupGetPropertiesResult> {
        const request = new cV33.UserGroupGetPropertiesRequest(this.getNextRpcId(), params);
        const response: cV33.UserGroupGetPropertiesResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGroupAddMember(params: cV33.UserGroupAddMemberParams): Promise<number> {
        const request = new cV33.UserGroupAddMemberRequest(this.getNextRpcId(), params);
        const response: cV33.UserGroupAddMemberResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGroupRemoveMember(params: cV33.UserGroupRemoveMemberParams): Promise<number> {
        const request = new cV33.UserGroupRemoveMemberRequest(this.getNextRpcId(), params);
        const response: cV33.UserGroupRemoveMemberResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGroupListMembers(params: cV33.UserGroupListMembersParams): Promise<string[]> {
        const request = new cV33.UserGroupListMembersRequest(this.getNextRpcId(), params);
        const response: cV33.UserGroupListMembersResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async userGroupIsMember(params: cV33.UserGroupIsMemberParams): Promise<boolean> {
        const request = new cV33.UserGroupIsMemberRequest(this.getNextRpcId(), params);
        const response: cV33.UserGroupIsMemberResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    // -------------------------------------------------------------------------------------
    // ----------------------- NODE MANAGEMENT ----------------------------------------
    // -------------------------------------------------------------------------------------

    async nodeBrowse(params: cV33.NodeBrowseParams): Promise<cV33.NodeBrowseResult[]> {
        const request = new cV33.NodeBrowseRequest(this.getNextRpcId(), params);
        const response: cV33.NodeBrowseResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async nodeCreate(params: cV33.NodeCreateParams): Promise<number> {
        const request = new cV33.NodeCreateRequest(this.getNextRpcId(), params);
        const response: cV33.NodeCreateResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async nodeModify(params: cV33.NodeModifyParams): Promise<number> {
        const request = new cV33.NodeModifyRequest(this.getNextRpcId(), params);
        const response: cV33.NodeModifyResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async nodeDelete(params: cV33.NodeDeleteParams): Promise<number> {
        const request = new cV33.NodeDeleteRequest(this.getNextRpcId(), params);
        const response: cV33.NodeDeleteResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async nodeGetProperties(params: cV33.NodeGetPropertiesParams): Promise<cV33.NodeGetPropertiesResult> {
        const request = new cV33.NodeGetPropertiesRequest(this.getNextRpcId(), params);
        const response: cV33.NodeGetPropertiesResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async nodeGetHistory(params: cV33.NodeGetHistoryParams): Promise<cV33.NodeGetHistoryResult[]> {
        const request = new cV33.NodeGetHistoryRequest(this.getNextRpcId(), params);
        const response: cV33.NodeGetHistoryResponse = await this.sendKolibriRequest(request);
        return response.result;
    }

    async nodeDeleteHistory(params: cV33.NodeDeleteHistoryParams): Promise<number> {
        const request = new cV33.NodeDeleteHistoryRequest(this.getNextRpcId(), params);
        const response: cV33.NodeDeleteHistoryResponse = await this.sendKolibriRequest(request);
        return response.result;
    }
}

