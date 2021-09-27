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

export class KolibriRequestError extends Error {
    data?: any;
    constructor(message: string, data?: any) {
        super(message);
        if (data) {
            this.data = data;
        }
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = this.constructor.name;
    }
}

export class GeneralError extends KolibriRequestError {
    constructor(data?: any) {
        super('General request error', data);
    }
}

export class InvalidOpCodeError extends KolibriRequestError {
    constructor(data?: any) {
        super('Invalid op code error', data);
    }
}

export class InvalidOptionError extends KolibriRequestError {
    constructor(data?: any) {
        super('Invalid option error', data);
    }
}

export class InvalidProtocolVersionError extends KolibriRequestError {
    constructor(data?: any) {
        super('Invalid protocol version error', data);
    }
}

export class AccessDeniedError extends KolibriRequestError {
    constructor(data?: any) {
        super('Access denied error', data);
    }
}

export class InvalidPathError extends KolibriRequestError {
    constructor(data?: any) {
        super('Invalid path error', data);
    }
}

export class InvalidNodeTypeError extends KolibriRequestError {
    constructor(data?: any) {
        super('Invalid node type error', data);
    }
}

export class InvalidNodeIndexError extends KolibriRequestError {
    constructor(data?: any) {
        super('Invalid node index error', data);
    }
}

export class InvalidNodePropertyError extends KolibriRequestError {
    constructor(data?: any) {
        super('Invalid node property error', data);
    }
}

export class InvalidNodeStateError extends KolibriRequestError {
    constructor(data?: any) {
        super('Invalid node state error', data);
    }
}

export class InvalidSequenceNumberError extends KolibriRequestError {
    constructor(data?: any) {
        super('Invalid sequence number error', data);
    }
}

export class InvalidDataTypeError extends KolibriRequestError {
    constructor(data?: any) {
        super('Invalid data type error', data);
    }
}

export class InvalidRecipientError extends KolibriRequestError {
    constructor(data?: any) {
        super('Invalid recipient error', data);
    }
}

export class InvalidProtocolError extends KolibriRequestError {
    constructor(data?: any) {
        super('Invalid protocol error', data);
    }
}

export class MissingParameterError extends KolibriRequestError {
    constructor(data?: any) {
        super('Missing parameter error', data);
    }
}

export class InvalidParameterError extends KolibriRequestError {
    constructor(data?: any) {
        super('Invalid parameter error', data);
    }
}

export class InvalidValueError extends KolibriRequestError {
    constructor(data?: any) {
        super('Invalid value error', data);
    }
}

export class ItemNotFoundError extends KolibriRequestError {
    constructor(data?: any) {
        super('Item not found error', data);
    }
}

export class ItemExistsError extends KolibriRequestError {
    constructor(data?: any) {
        super('Item exists error', data);
    }
}

export class RateLimitExceededError extends KolibriRequestError {
    constructor(data?: any) {
        super('Rate limit exceeded error', data);
    }
}

export class QueueSizeLimitExceededError extends KolibriRequestError {
    constructor(data?: any) {
        super('Queue size limit exceeded error', data);
    }
}

export function getRequestError(code: number, data?: any) : KolibriRequestError {
    switch (code) {
        case -31901:
            return new GeneralError(data);
        case -31902:
            return new InvalidOpCodeError(data);
        case -31903:
            return new InvalidOptionError(data);
        case -31904:
            return new InvalidProtocolVersionError(data);
        case -31905:
            return new AccessDeniedError(data);
        case -31906:
            return new InvalidPathError(data);
        case -31907:
            return new InvalidNodeTypeError(data);
        case -31908:
            return new InvalidNodeIndexError(data);
        case -31909:
            return new InvalidNodePropertyError(data);
        case -31910:
            return new InvalidNodeStateError(data);
        case -31911:
            return new InvalidSequenceNumberError(data);
        case -31912:
            return new InvalidDataTypeError(data);
        case -31913:
            return new InvalidRecipientError(data);
        case -31914:
            return new InvalidProtocolError(data);
        case -31915:
            return new MissingParameterError(data);
        case -31916:
            return new InvalidParameterError(data);
        case -31917:
            return new InvalidValueError(data);
        case -31918:
            return new ItemNotFoundError(data);
        case -31919:
            return new ItemExistsError(data);
        case -31920:
            return new RateLimitExceededError(data);
        case -31921:
            return new QueueSizeLimitExceededError(data);
        default:
            return new KolibriRequestError('Unknown request error');
    }
}

