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

import { NodeNotifyParams } from './../client_types';

interface AbstractNode {
    path: string
}

export class Subscription<T extends AbstractNode> {
    private _subscribedNodes: Map<string, T> = new Map();

    get subscribedNodes() { return this._subscribedNodes; };

    onWrite?: (data: any[]) => void;

    onUnsubscribed?: (data: any[]) => void;

    onUserNotify?: (data: any[]) => void;

    onNodeNotify?: (data: NodeNotifyParams) => void;

    onError?: (error: any) => void;

    storeSubscribedNodes(nodes: T[]): void {
        nodes.forEach((node: T) => {
            this.subscribedNodes.set(node.path, node);
        });
    }

    deleteSubscribedNodes(nodes: T[]): void {
        nodes.forEach((node: T) => {
            this.subscribedNodes.delete(node.path);
        });
    }

    fetchSubscribedNode(path: string): T | undefined {
        return this.subscribedNodes.get(path);
    }
}
