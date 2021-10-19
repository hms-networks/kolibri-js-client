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


import { cV33 as latest, KolibriRpcServer as RemoteRpcTarget } from '@hms-networks/kolibri-js-core';

export { ClientConfig } from './client_config';

export type KolibriRpcServer = RemoteRpcTarget;

export type LoginParams = latest.LoginParams;
export type LoginResult = latest.LoginResult;

export type UpdateTokenParams = latest.UpdateTokenParams;

export type WriteParams = latest.WriteParams;

export type ReadParams = latest.ReadParams;
export type ReadResult = latest.ReadResult;

export type SubscribeParams = latest.SubscribeParams;
export type SubscribeResult = latest.SubscribeResult;

export type UnsubscribeParams = latest.UnsubscribeParams

export type PermissionNodeSetParams = latest.PermissionNodeSetParams

export type PermissionNodeListParams = latest.PermissionNodeListParams
export type PermissionNodeListResult = latest.PermissionNodeListResult

export type PermissionRpcAddParams = latest.PermissionRpcAddParams

export type PermissionRpcRemoveParams = latest.PermissionRpcRemoveParams;

export type PermissionRpcListParams = latest.PermissionRpcListParams
export type PermissionRpcListResult = latest.PermissionRpcListResult;

export type PermissionUserListParams = latest.PermissionUserListParams;
export type PermissionUserListResult = latest.PermissionUserListResult;

export type ProjectBrowseParams = latest.ProjectBrowseParams;
export type ProjectBrowseResult = latest.ProjectBrowseResult;

export type ProjectCreateParams = latest.ProjectCreateParams;

export type ProjectDeleteParams = latest.ProjectDeleteParams;

export type ProjectGetLiveUsageParams = latest.ProjectGetLiveUsageParams;
export type ProjectGetLiveUsageResult = latest.ProjectGetLiveUsageResult;

export type ProjectGetPropertiesParams = latest.ProjectGetPropertiesParams;
export type ProjectGetPropertiesResult = latest.ProjectGetPropertiesResult;

export type ProjectGetStatisticsParams = latest.ProjectGetStatisticsParams;
export type ProjectGetStatisticsResult = latest.ProjectGetStatisticsResult;

export type ProjectModifyParams = latest.ProjectModifyParams;

export type ProjectGetHistoryUsageParams = latest.ProjectGetHistoryUsageParams;
export type ProjectGetHistoryUsageResult = latest.ProjectGetHistoryUsageResult;

export type UserSubscribeParams = latest.UserSubscribeParams;
export type UserSubscribeResult = latest.UserSubscribeResult;

export type UserUnsubscribeParams = latest.UserUnsubscribeParams
export type UserUnsubscribeResult = latest.UserUnsubscribeResult

export type UserBrowseParams = latest.UserBrowseParams
export type UserBrowseResult = latest.UserBrowseResult

export type UserCreateParams = latest.UserCreateParams

export type UserModifyParams = latest.UserModifyParams

export type UserGetSessionsParams = latest.UserGetSessionsParams
export type UserGetSessionsResult = latest.UserGetSessionsResult

export type UserGetHistoryParams = latest.UserGetHistoryParams
export type UserGetHistoryResult = latest.UserGetHistoryResult

export type UserDeleteParams = latest.UserDeleteParams

export type UserGetPropertiesParams = latest.UserGetPropertiesParams
export type UserGetPropertiesResult = latest.UserGetPropertiesResult

export type UserGroupBrowseParams = latest.UserGroupBrowseParams
export type UserGroupBrowseResult = latest.UserGroupBrowseResult

export type UserGroupCreateParams = latest.UserGroupCreateParams

export type UserGroupModifyParams = latest.UserGroupModifyParams

export type UserGroupDeleteParams = latest.UserGroupDeleteParams

export type UserGroupGetPropertiesParams = latest.UserGroupGetPropertiesParams
export type UserGroupGetPropertiesResult = latest.UserGroupGetPropertiesResult

export type UserGroupAddMemberParams = latest.UserGroupAddMemberParams

export type UserGroupRemoveMemberParams = latest.UserGroupRemoveMemberParams

export type UserGroupListMembersParams = latest.UserGroupListMembersParams

export type UserGroupIsMemberParams = latest.UserGroupIsMemberParams

export type NodeBrowseParams = latest.NodeBrowseParams
export type NodeBrowseResult = latest.NodeBrowseResult

export type NodeCreateParams = latest.NodeCreateParams

export type NodeModifyParams = latest.NodeModifyParams

export type NodeDeleteParams = latest.NodeDeleteParams

export type NodeGetPropertiesParams = latest.NodeGetPropertiesParams
export type NodeGetPropertiesResult = latest.NodeGetPropertiesResult

export type NodeGetHistoryParams = latest.NodeGetHistoryParams
export type NodeGetHistoryResult = latest.NodeGetHistoryResult

export type NodeDeleteHistoryParams = latest.NodeDeleteHistoryParams

export type NodeSubscribeParams = latest.NodeSubscribeParams;
export type NodeUnsubscribeParams = latest.NodeUnsubscribeParams;
