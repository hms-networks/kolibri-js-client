[![npm version](https://badge.fury.io/js/@hms-networks%2Fkolibri-js-client.svg)](https://badge.fury.io/js/@hms-networks%2Fkolibri-js-client)

# Kolibri-JS-Client

The Kolibri-JS-Client is an easy to use Kolibri Consumer API client. It allows to interact with a Kolibri Broker with a simple request / response model with additional event driven data functionalities. The client is written in TypeScript and can also be used with JavaScript.

## Supported Kolibri Versions

Currently supported Kolibri Consumer Protocol Versions:

- v3.3

## Features

The Kolibri-JS-Client abstracts most of the Kolibri Protocol internals from the application and provides some additional / convenient features.

- Promise-based Request/Response API for the Kolibri Consumer Protocol over WebSockets.
- Event Listener support for receiving events and live data from the Kolibri Broker.
- Client side data merging for the kolibri.subscribe and kolibri.write live data.
- Client side Kolibri QoS Level and transaction handling
- Auto reconnect on connection loss
- NodeJS and Browser support
- Support for TLS
- Support for Kolibri-RPC
- Fully typed

## Install

NPM

```bash
npm install @hms-networks/kolibri-js-client
```

Yarn

```bash
yarn add @hms-networks/kolibri-js-client
```

### Node and Browser Support

The client currently supports Browser Single Page applications and NodeJS environments.

HTML Apps can import the minimized bundle from the location build/bundles/kolibri-js-client.umd.min.js

```html
<script src="./build/bundles/kolibri-js-client.umd.min.js"></script>
```

## Getting Started

To be able to call kolibri RPCs the client has to be created with some configuration first. With the client object created you can then call Kolibri Consumer RPCs to the configured Kolibri Broker.

```typescript
import { ClientConfig, KolibriClientFactory } from '@hms-networks/kolibri-js-client';

// create config
const config: ClientConfig = {
     host: 'ws://localhost:8080',
     project: 'testv21',
     path: '/'
};
const client = KolibriClientFactory.create(config);

await client.connect();
// RPC calls...
await client.disconnect();
```

### TLS Connection

Custom TLS Configuration is only available on Node environment. On Browsers the config is ignored.

Tls connection with default options can be established by just providing host url with the wss:// protocol. If you want to configure the connection you can provide the optional tls config parameter to the ClientFactory.create method. For more details about the TlsConfig see <https://nodejs.org/api/https.html#https_https_request_options_callback>

```typescript
import { ClientConfig, KolibriClientFactory } from '@hms-networks/kolibri-js-client';

const config: ClientConfig = {
     host: 'ws://localhost:8080',
     project: 'testv21',
     path: '/',
     tls: {
        rejectUnauthorized: false
    }
};

const client = KolibriClientFactory.create(config);
```

### Samples Projects

The /sample directory contains examples how to setup and use some common scenarios.

## Sending RPCs

The client uses the request / response model to communicate with the Kolibri Broker. To send a kolibri RPC request call the desired function with the correct params object.

```typescript
const params: LoginParams = {
      user: 'Username',
      password: 'Password',
      interval: 60,
      timeout: 5
};
const result = await client.login(params);
```

## Event Listeners

Some kolibri RPCs trigger the Kolibri Broker to send data to the client. For that purpose the client is able to register event listeners to handle incoming data from the broker.

```typescript
client.addOnWriteListener((nodes: any[]) => {
 console.log(nodes);
});

const params: SubscribeParams = [
     { path: '/device01/temperatures/room1' }
];
const result = await client.subscribe(params);
```

After the registration of the addOnWriteListener and the client.subscribe RPC the Kolibri Broker will send data to the client. The client will then call the registered function with the data as the parameter. See Kolibri Consumer API Specification for more details.

## Error Handling

All the errors returned from the Kolibri Broker are instances of `KolibriRequestError` class containing the error code and the reason (if available).

```typescript
const params: LoginParams = {
      user: 'Invalid Username',
      password: 'Password',
      interval: 60,
      timeout: 5
};
try{
    const result = await client.login(params);
}
catch(e){
    console.log(e); // KolibriRequest failed: -31905
}
```
