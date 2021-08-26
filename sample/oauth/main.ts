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


import { ClientConfig, KolibriClientFactory, LoginParams, UpdateTokenParams } from '@hms-networks/kolibri-js-client';
import { Issuer } from 'openid-client';

async function main() {
    const keycloakIssuer = await Issuer.discover(
        'http://localhost:8081/auth/realms/hmshub' // issuer url
    );

    const oauthClient = new keycloakIssuer.Client({
        client_id: 'kolibri-js-client', // client id configured for your project
        token_endpoint_auth_method: 'none' // to send only client_id in the header
    });

    const config: ClientConfig = {
        host: 'ws://localhost:8080',
        project: 'management',
        path: '/'
    };

    let tokenSet = await oauthClient.grant({
        grant_type: 'password',
        username: 'user:project',
        password: 'password'
    });

    const client = KolibriClientFactory.create(config);
    await client.connect();

    let accessToken = tokenSet.access_token;

    const loginParams: LoginParams = {
        token: accessToken,
        interval: 60,
        timeout: 5
    };

    const result = await client.login(loginParams);

    // refresh token periodically and sent new token to broker
    setInterval(async () => {
        console.log('Getting new token and sending it to the Broker...');
        const refreshToken = tokenSet.refresh_token;
        tokenSet = await oauthClient.refresh(refreshToken!);

        const updateTokenParams: UpdateTokenParams = {
            token: tokenSet.access_token!
        };
        await client.updateToken(updateTokenParams);
    }, 10 * 1000);

    console.log(result);
}

main();

