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


import { NodeUnsubscribeParams } from '.';
import {
    KolibriRpcServer,
    LoginParams, LoginResult, NodeBrowseParams, NodeBrowseResult, NodeCreateParams,
    NodeDeleteHistoryParams, NodeDeleteParams, NodeGetHistoryParams, NodeGetHistoryResult,
    NodeGetPropertiesParams, NodeGetPropertiesResult, NodeModifyParams, PermissionNodeListParams,
    PermissionNodeListResult, PermissionNodeSetParams, PermissionRpcAddParams, PermissionRpcListParams,
    PermissionRpcListResult, PermissionRpcRemoveParams, PermissionUserListParams, PermissionUserListResult,
    ProjectBrowseParams, ProjectBrowseResult, ProjectCreateParams, ProjectDeleteParams, ProjectGetHistoryUsageParams,
    ProjectGetHistoryUsageResult, ProjectGetLiveUsageParams, ProjectGetLiveUsageResult, ProjectGetPropertiesParams,
    ProjectGetPropertiesResult, ProjectGetStatisticsParams, ProjectGetStatisticsResult, ProjectModifyParams,
    ReadParams, ReadResult, UpdateTokenParams, SubscribeParams, SubscribeResult, UnsubscribeParams, UserBrowseParams,
    UserBrowseResult, UserCreateParams, UserDeleteParams, UserGetHistoryParams, UserGetHistoryResult,
    UserGetPropertiesParams, UserGetPropertiesResult, UserGetSessionsParams, UserGetSessionsResult,
    UserGroupAddMemberParams, UserGroupBrowseParams, UserGroupBrowseResult, UserGroupCreateParams,
    UserGroupDeleteParams, UserGroupGetPropertiesParams, UserGroupGetPropertiesResult, UserGroupIsMemberParams,
    UserGroupListMembersParams, UserGroupModifyParams, UserGroupRemoveMemberParams, UserModifyParams,
    UserSubscribeParams, UserSubscribeResult, UserUnsubscribeParams, UserUnsubscribeResult, WriteParams,
    NodeSubscribeParams
} from './client_types';

import { KolibriRpcClient } from './common/kolibri_rpc_client';
export class KolibriClient {
    private readonly delegate: KolibriRpcClient;
    constructor(delegate: KolibriRpcClient) {
        this.delegate = delegate;
    }

    public addOnUnsubscribedListener(listener: (data: any[]) => void) {
        this.delegate.addOnUnsubscribed(listener);
    }

    public addOnWriteListener(listener: (data: any[]) => void) {
        this.delegate.addOnWriteListener(listener);
    }

    public addOnUserNotifyListener(listener: (data: any[]) => void) {
        this.delegate.addOnUserNotifyListener(listener);
    }

    public addOnNodeNotifyListener(listener: (data: any[]) => void) {
        this.delegate.addOnNodeNotifyListener(listener);
    }

    public addOnErrorListener(listener: (error: any) => void) {
        this.delegate.addOnErrorListener(listener);
    }

    public addOnReconnectListener(listener: () => Promise<void>) {
        this.delegate.addOnReconnectListener(listener);
    }

    public addOnDisconnectListener(listener: (event?: { code: number, reason: string }) => Promise<void>) {
        this.delegate.addOnDisconnectListener(listener);
    }

    async callKolibriRpc(server: KolibriRpcServer, method: string, params?: unknown) {
        return this.delegate.callKolibriRpc(server, method, params);
    }

    async registerKolibriRpc(method: string, handler: (params?: unknown) => unknown) {
        this.delegate.registerKolibriRpc(method, handler);
    }

    async connect(): Promise<void> {
        return this.delegate.connect();
    }

    async disconnect(): Promise<void> {
        return this.delegate.disconnect();
    }

    async login(params?: LoginParams): Promise<LoginResult> {
        return this.delegate.login(params);
    }

    async updateToken(params: UpdateTokenParams): Promise<number> {
        return this.delegate.updateToken(params);
    }

    async logout(): Promise<number> {
        return this.delegate.logout();
    }

    async close(): Promise<number> {
        return this.delegate.close();
    }

    async write(params: WriteParams): Promise<number> {
        return this.delegate.write(params);
    }

    async read(params: ReadParams[]): Promise<ReadResult[]> {
        return this.delegate.read(params);
    }

    async subscribe(params: SubscribeParams[]): Promise<SubscribeResult[]> {
        return this.delegate.subscribe(params);
    }

    async unsubscribe(params: UnsubscribeParams[]): Promise<number> {
        return this.delegate.unsubscribe(params);
    }

    // -------------------------------------------------------------------------------------
    // ----------------------- PERMISSION MANAGEMENT ---------------------------------------
    // -------------------------------------------------------------------------------------
    async permissionNodeSet(params: PermissionNodeSetParams): Promise<number> {
        return this.delegate.permissionNodeSet(params);
    }

    async permissionNodeList(params: PermissionNodeListParams): Promise<PermissionNodeListResult[]> {
        return this.delegate.permissionNodeList(params);
    }

    async permissionRpcAdd(params: PermissionRpcAddParams): Promise<number> {
        return this.delegate.permissionRpcAdd(params);
    }

    async permissionRpcRemove(params: PermissionRpcRemoveParams): Promise<number> {
        return this.delegate.permissionRpcRemove(params);
    }

    async permissionRpcList(params: PermissionRpcListParams): Promise<PermissionRpcListResult[]> {
        return this.delegate.permissionRpcList(params);
    }

    async permissionUserList(params: PermissionUserListParams): Promise<PermissionUserListResult[]> {
        return this.delegate.permissionUserList(params);
    }
    // -------------------------------------------------------------------------------------
    // ----------------------- PROJECT MANAGEMENT ------------------------------------------
    // -------------------------------------------------------------------------------------
    async projectBrowse(params: ProjectBrowseParams): Promise<ProjectBrowseResult[]> {
        return this.delegate.projectBrowse(params);
    }

    async projectCreate(params: ProjectCreateParams): Promise<number> {
        return this.delegate.projectCreate(params);
    }

    async projectDelete(params: ProjectDeleteParams): Promise<number> {
        return this.delegate.projectDelete(params);
    }

    async projectGetLiveUsage(params: ProjectGetLiveUsageParams): Promise<ProjectGetLiveUsageResult[]> {
        return this.delegate.projectGetLiveUsage(params);
    }

    async projectGetProperties(params: ProjectGetPropertiesParams): Promise<ProjectGetPropertiesResult> {
        return this.delegate.projectGetProperties(params);
    }

    async projectGetStatistics(params: ProjectGetStatisticsParams): Promise<ProjectGetStatisticsResult> {
        return this.delegate.projectGetStatistics(params);
    }

    async projectModify(params: ProjectModifyParams): Promise<number> {
        return this.delegate.projectModify(params);
    }

    async projectGetHistoryUsage(params: ProjectGetHistoryUsageParams): Promise<ProjectGetHistoryUsageResult> {
        return this.delegate.projectGetHistoryUsage(params);
    }

    // -------------------------------------------------------------------------------------
    // ----------------------- USER MANAGEMENT ---------------------------------------------
    // -------------------------------------------------------------------------------------
    async userSubscribe(params: UserSubscribeParams[]): Promise<UserSubscribeResult[]> {
        return this.delegate.userSubscribe(params);
    }

    async userUnsubscribe(params: UserUnsubscribeParams[]): Promise<UserUnsubscribeResult[]> {
        return this.delegate.userUnsubscribe(params);
    }

    async userBrowse(params: UserBrowseParams): Promise<UserBrowseResult[]> {
        return this.delegate.userBrowse(params);
    }

    async userCreate(params: UserCreateParams): Promise<number> {
        return this.delegate.userCreate(params);
    }

    async userModify(params: UserModifyParams): Promise<number> {
        return this.delegate.userModify(params);
    }

    async userGetSessions(params: UserGetSessionsParams): Promise<UserGetSessionsResult[]> {
        return this.delegate.userGetSessions(params);
    }

    async userGetHistory(params: UserGetHistoryParams): Promise<UserGetHistoryResult[]> {
        return this.delegate.userGetHistory(params);
    }

    async userDelete(params: UserDeleteParams): Promise<number> {
        return this.delegate.userDelete(params);
    }

    async userGetProperties(params: UserGetPropertiesParams): Promise<UserGetPropertiesResult> {
        return this.delegate.userGetProperties(params);
    }

    // -------------------------------------------------------------------------------------
    // ----------------------- USERGROUP MANAGEMENT ----------------------------------------
    // -------------------------------------------------------------------------------------

    async userGroupBrowse(params: UserGroupBrowseParams): Promise<UserGroupBrowseResult[]> {
        return this.delegate.userGroupBrowse(params);
    }

    async userGroupCreate(params: UserGroupCreateParams): Promise<number> {
        return this.delegate.userGroupCreate(params);
    }

    async userGroupModify(params: UserGroupModifyParams): Promise<number> {
        return this.delegate.userGroupModify(params);
    }

    async userGroupDelete(params: UserGroupDeleteParams): Promise<number> {
        return this.delegate.userGroupDelete(params);
    }

    async userGroupGetProperties(params: UserGroupGetPropertiesParams): Promise<UserGroupGetPropertiesResult> {
        return this.delegate.userGroupGetProperties(params);
    }

    async userGroupAddMember(params: UserGroupAddMemberParams): Promise<number> {
        return this.delegate.userGroupAddMember(params);
    }

    async userGroupRemoveMember(params: UserGroupRemoveMemberParams): Promise<number> {
        return this.delegate.userGroupRemoveMember(params);
    }

    async userGroupListMembers(params: UserGroupListMembersParams): Promise<string[]> {
        return this.delegate.userGroupListMembers(params);
    }

    async userGroupIsMember(params: UserGroupIsMemberParams): Promise<boolean> {
        return this.delegate.userGroupIsMember(params);
    }

    // -------------------------------------------------------------------------------------
    // ----------------------- NODE MANAGEMENT ----------------------------------------
    // -------------------------------------------------------------------------------------

    async nodeBrowse(params: NodeBrowseParams): Promise<NodeBrowseResult[]> {
        return this.delegate.nodeBrowse(params);
    }

    async nodeCreate(params: NodeCreateParams): Promise<number> {
        return this.delegate.nodeCreate(params);
    }

    async nodeModify(params: NodeModifyParams): Promise<number> {
        return this.delegate.nodeModify(params);
    }

    async nodeDelete(params: NodeDeleteParams): Promise<number> {
        return this.delegate.nodeDelete(params);
    }

    async nodeGetProperties(params: NodeGetPropertiesParams): Promise<NodeGetPropertiesResult> {
        return this.delegate.nodeGetProperties(params);
    }

    async nodeGetHistory(params: NodeGetHistoryParams): Promise<NodeGetHistoryResult[]> {
        return this.delegate.nodeGetHistory(params);
    }

    async nodeDeleteHistory(params: NodeDeleteHistoryParams): Promise<number> {
        return this.delegate.nodeDeleteHistory(params);
    }

    async nodeSubscribe(params: NodeSubscribeParams): Promise<number> {
        return this.delegate.nodeSubscribe(params);
    }

    async nodeUnsubscribe(params: NodeUnsubscribeParams): Promise<number> {
        return this.delegate.nodeUnsubscribe(params);
    }
}
