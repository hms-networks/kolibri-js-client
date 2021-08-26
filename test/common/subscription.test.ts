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


import { Subscription } from '../../src/common/subscription';

describe('Subscription:', () => {
    describe('storeSubscribedNodes:', () => {
        it('should store subscribed nodes', () => {
            const subscription = new Subscription();

            const nodes = [{ path: '/path1' }, { path: '/path2' }];
            subscription.storeSubscribedNodes(nodes);

            expect(subscription.fetchSubscribedNode(nodes[0].path)).toEqual({ path: '/path1' });
        });

        it('should delete subscribed nodes', () => {
            const subscription = new Subscription();

            const nodes = [{ path: '/path1' }, { path: '/path2' }];
            subscription.storeSubscribedNodes(nodes);

            expect(subscription.deleteSubscribedNodes(nodes)).not.toBeDefined();
        });
    });
});
