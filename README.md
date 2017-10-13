# WOWBed

[![Build Status](https://travis-ci.org/rATRIJS/wowbed.svg?branch=master)](https://travis-ci.org/rATRIJS/wowbed)

WOWBed is an oEmbed consumer library for Node.js. By default it will import all providers from [oEmbed](https://oembed.com/) so no configuration is required ( but is possible ).

Since WOWBed is written in TypeScript - all TypeScript "typings" come for free.

## Usage

First step is to add WOWBed to your dependencies.

You can use NPM:

```sh
npm install wowbed --save
```

Or Yarn:

```sh
yarn add wowbed
```

Then just use the WOWBed `Client` to fetch the oEmbed resource.

JavaScript:

```js
const WowbedClient = require("wowbed").Client;

const wowbed = new WowbedClient();

// if you use Promises

wowbed.fetch("https://www.youtube.com/watch?v=4A_tSyJBsRQ").then((response) => {
    //
}).catch((error) => {
    console.log(error);
});

// or async / await

try {
    const response = await wowbed.fetch("https://www.youtube.com/watch?v=4A_tSyJBsRQ");
} catch (error) {
    console.log(error);
}
```

TypeScript:

```ts
import { Client } from "wowbed";

const wowbed = new Client();

try {
    const response = await wowbed.fetch("https://www.youtube.com/watch?v=4A_tSyJBsRQ");
} catch (error) {
    console.log(error);
}
```

### Options

You can pass these optional options to `Client` constructor:

* `importOembedProviders: boolean | string[] = true` - whether to import oEmbed providers from [oEmbed](https://oembed.com/). If set to `true` then will import them, if set to `false` then won't. You can also pass which providers should be imported if you don't want all of them. They will be matched against `provider_name` from [oEmbed providers list](https://oembed.com/providers.json). If you don't plan to import these providers then you can skip the optional dependency when installing this package ( e.g. `npm install wowbed --no-optional --save` ).
* `providers: Provider[] = []` - list of providers to add ( e.g. if you don't want to import them from [oEmbed](https://oembed.com) or have some custom ones ). Format of each provider is the same as in [oEmbed providers list](https://oembed.com/providers.json) with `provider_name` just being called `name` and `provider_url` being called just `url`.

```js
const wowbed = new Client({
    importOembedProviders: [ "Vimeo", "Flickr" ],
    providers: [
        {
            name: "Giphy",
            url: "https://giphy.com",
            endpoints: [
                url: "http://giphy.com/services/oembed",
                schemes: [
                    "https://giphy.com/gifs/*",
                    "http://gph.is/*",
                    "https://media.giphy.com/media/*/giphy.gif",
                ],
                discovery: true,
            ],
        }
    ],
});
```

### Passing Options To Provider

Sometimes you might need to pass options to oEmbed request. You can do that via second `Client.fetch()` argument where they will be passed straight to provider:

```js
await (new Client()).fetch("https://www.youtube.com/watch?v=4A_tSyJBsRQ", { maxWidth: 1000 });
```

### Error Handling

`Client.fetch()` can throw any of these errors:

* `EndpointNotFoundError` - if no provider can be found for given URL.
* `FormatNotImplementedError` - if provider doesn't support JSON format.
* `InvalidProviderResponseStatusError` - if provider responds with non 200 status code.
* `InvalidProviderResponseError` - if provider response isn't valid JSON or valid oEmbed response.
* `ResourceNotFoundError` - if given resource wasn't found.
* `UnauthorizedError` - if given resource is private.

`FormatNotImplementedError`, `ResourceNotFoundError` and `UnauthorizedError` extends `InvalidProviderResponseStatusError`. All errors extends `WowbedError`.

All of these errors are importable.

JavaScript:

```js
const { Client, EndpointNotFoundError } = require("wowbed");

try {
    const response = await (new Client()).fetch("http://example.com");
} catch (error) {
    if (error instanceof EndpointNotFoundError) { // or error.name === "EndpointNotFoundError"
        console.log("example.com isn't a oEmbed provider");
    }
}
```

TypeScript:

```ts
import { Client, EndpointNotFoundError } from "wowbed";

try {
    const response = await (new Client()).fetch("http://example.com");
} catch (error) {
    if (error instanceof EndpointNotFoundError) {
        console.log("example.com isn't a oEmbed provider");
    }
}
```
