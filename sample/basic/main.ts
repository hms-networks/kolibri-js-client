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


import { ClientConfig, KolibriClientFactory, LoginParams } from '@hms-networks/kolibri-js-client';

async function main() {
    const config: ClientConfig = {
        host: 'ws://localhost:8080',
        project: 'testv21',
        path: '/',
        reconnect: {
            maxReconnectDelay: 10,
            maxReconnects: 10
        }
    };

    const loginParams: LoginParams = {
        user: 'kolibro_01',
        password: 'password123',
        interval: 60,
        timeout: 5
    };

    const client = KolibriClientFactory.create(config);

    client.addOnReconnectListener(async () => {
        console.log('reconnected');
    });

    client.addOnDisconnectListener(async (event: any) => {
        console.log('disconnected');
        console.log(event);
    });
    await client.connect();
    const result = await client.login(loginParams);

    console.log(result);
}

main();

