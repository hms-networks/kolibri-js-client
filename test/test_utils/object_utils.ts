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


/**
 * Getting all methods of an object
 * https://stackoverflow.com/questions/31054910/get-functions-methods-of-a-class/31055217
 * @param obj
 * @returns Array of method names
 */
export function getAllMethods(obj: any) {
    let props: any[] = [];

    do {
        const l = Object.getOwnPropertyNames(obj)
            .concat(Object.getOwnPropertySymbols(obj).map(s => s.toString()))
            .sort()
            .filter((p, i, arr) =>
                typeof obj[p] === 'function' && // only the methods
                p !== 'constructor' && // not the constructor
                (i === 0 || p !== arr[i - 1]) && // not overriding in this prototype
                props.indexOf(p) === -1 // not overridden in a child
            );
        props = props.concat(l);
    }
    while (
        (obj = Object.getPrototypeOf(obj)) && // walk-up the prototype chain
        Object.getPrototypeOf(obj) // not the the Object prototype methods (hasOwnProperty, etc...)
    );

    return props;
};
