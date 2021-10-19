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


import * as https from 'https';
import { LoginParams } from './client_types';
import { ReconnectOptions } from './common/kolibri_connection';

/**
* Options to pass to `https.request` if connecting via TLS.
* @see https://nodejs.org/api/https.html#https_https_request_options_callback
*/
export type TlsConfig = https.RequestOptions
export type ReconnectConfig = ReconnectOptions & { resumeSubscriptions?: boolean };
export type AuthConfig = LoginParams;

export type ClientConfig = {
    host: string,
    port?: number,
    project: string,
    path: string,
    auth?: AuthConfig,
    tls?: TlsConfig
    reconnect?: ReconnectConfig
}
