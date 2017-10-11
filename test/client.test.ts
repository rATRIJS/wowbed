import { spy, stub } from "sinon";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as proxyquire from "proxyquire";
import Client from "../src/client";
import EndpointNotFoundError from "../src/errors/endpoint-not-found";
import FormatNotImplementedError from "../src/errors/format-not-implemented";
import InvalidProviderResponseError from "../src/errors/invalid-provider-response";
import InvalidProviderResponseStatusError from "../src/errors/invalid-provider-response-status";
import Provider from "../src/provider";
import ResourceNotFoundError from "../src/errors/resource-not-found";
import StatusCodeError from "./helpers/status-code-error";
import UnauthorizedError from "../src/errors/unauthorized";

chai.use(chaiAsPromised);

const expect = chai.expect;

const providers: Provider[] = [
    {
        name: "Provider 1",
        url: "http://provider.one",
        endpoints: [
            {
                url: "http://provider.one",
                schemes: [ "http://*.provider.one", "http://provider.one/*" ],
                discovery: true,
            },
            {
                url: "https://provider.one",
                schemes: [ "https://*.provider.one", "https://provider.one/*" ],
                discovery: false,
            },
        ],
    },
    {
        name: "Provider 2",
        url: "http://provider.two",
        endpoints: [
            {
                url: "http://provider.two",
                schemes: [ "http://*.provider.two", "http://provider.two/*" ],
                discovery: true,
            },
            {
                url: "https://provider.two",
                schemes: [ "https://*.provider.two", "https://provider.two/*" ],
                discovery: false,
            },
        ],
    },
    {
        name: "Provider 3",
        url: "http://provider.three",
        endpoints: [
            { url: "http://provider.three" },
        ],
    },
];

describe("Client", () => {
    describe("#new()", () => {
        it("adds provided providers", () => {
            const client = new Client({ providers, importOembedProviders: false });

            expect(client.providers).to.eql(providers);
        });

        it("imports oembed providers", () => {
            const importer = spy();
            const client: Client = new (proxyquire("../src/client", {
                "./provider-importer": { import: importer },
            }).Client)({ importOembedProviders: true });

            importer.calledWith(client);
        });

        it("imports selected oembed providers", () => {
            const importer = spy();
            const client: Client = new (proxyquire("../src/client", {
                "./provider-importer": { import: importer },
            }).Client)({ importOembedProviders: providers.map((provider) => provider.name) });

            importer.calledWith(client, providers.map((provider) => provider.name));
        });
    });

    describe("#fetch()", () => {
        [
            {
                expectation: "fetches from provider matching scheme",
                url: "http://provider.two/something",
                providerUrl: providers[1].endpoints[0].url,
            },
            {
                expectation: "falls back to fetching from provider matching URL",
                url: "http://provider.three/something",
                providerUrl: providers[2].endpoints[0].url,
            },
        ].forEach((data) => {
            it(data.expectation, async () => {
                const response = { type: "type", version: "1.1" };

                const request = stub();
                const client = new (proxyquire("../src/client", {
                    "request-promise-native": request,
                }).Client)({ providers, importOembedProviders: false });

                request.withArgs({
                    method: "GET",
                    uri: data.providerUrl,
                    qs: { url: data.url, format: "json" },
                }).returns(JSON.stringify(response));

                expect(await client.fetch(data.url)).to.eql(response);
            });
        });

        it("passes through provided options", async () => {
            const url = "http://provider.one/something";

            const request = stub();
            const client = new (proxyquire("../src/client", {
                "request-promise-native": request,
            }).Client)({ providers, importOembedProviders: false });

            request.withArgs({
                method: "GET",
                uri: providers[0].endpoints[0].url,
                qs: { url, format: "json", maxwidth: 1000, maxheight: 2000, maxWow: 1337 },
            }).returns(JSON.stringify({ type: "type", version: "1.1" }));

            await client.fetch(url, { maxWidth: 1000, maxHeight: 2000, maxWow: 1337 });
        });

        it("throws exception if provider is not found", async () => {
            const client = new (proxyquire("../src/client", {
                "request-promise-native": stub(),
            }).Client)({ providers, importOembedProviders: false });

            await expect(client.fetch("http://non-existing-provider.com/something"))
                .to.eventually.be.rejectedWith(EndpointNotFoundError);
        });

        [
            {
                expectation: "throws exception if resource is not public",
                statusCode: 401,
                error: UnauthorizedError,
            },
            {
                expectation: "throws exception if resource is not found",
                statusCode: 404,
                error: ResourceNotFoundError,
            },
            {
                expectation: "throws exception if format is not supported",
                statusCode: 501,
                error: FormatNotImplementedError,
            },
            {
                expectation: "throws exception if provider response status isn't supported",
                statusCode: 500,
                error: InvalidProviderResponseStatusError,
            },
        ].forEach((data) => {
            it(data.expectation, async () => {
                const request = stub();
                const client = new (proxyquire("../src/client", {
                    "request-promise-native": request,
                }).Client)({ providers, importOembedProviders: false });

                request.throws(new StatusCodeError(data.statusCode));

                await expect(client.fetch("http://provider.one/something"))
                    .to.eventually.be.rejectedWith(data.error);
            });
        });

        [
            {
                expectation: "throws exception if provider response can't be JSON decoded",
                providerResponse: [],
                errorMessage: "valid JSON",
            },
            {
                expectation: "throws exception if provider response doesn't decode to object",
                providerResponse: "wowbed",
                errorMessage: "valid JSON",
            },
            {
                expectation: "throws exception if provider response doesn't have type",
                providerResponse: JSON.stringify({ version: "1.0" }),
                errorMessage: "type",
            },
            {
                expectation: "throws exception if provider response doesn't have version",
                providerResponse: JSON.stringify({ type: "type" }),
                errorMessage: "version",
            },
            {
                expectation: "throws exception if provider photo response doesn't have width",
                providerResponse: JSON.stringify({ type: "photo", version: "1.0", height: 1000, url: "" }),
                errorMessage: "width",
            },
            {
                expectation: "throws exception if provider photo response doesn't have height",
                providerResponse: JSON.stringify({ type: "photo", version: "1.0", width: 1000, url: "" }),
                errorMessage: "height",
            },
            {
                expectation: "throws exception if provider photo response doesn't have url",
                providerResponse: JSON.stringify({ type: "photo", version: "1.0", width: 1000, height: 1000 }),
                errorMessage: "url",
            },
            {
                expectation: "throws exception if provider rich response doesn't have width",
                providerResponse: JSON.stringify({ type: "rich", version: "1.0", height: 1000, html: "" }),
                errorMessage: "width",
            },
            {
                expectation: "throws exception if provider rich response doesn't have height",
                providerResponse: JSON.stringify({ type: "rich", version: "1.0", width: 1000, html: "" }),
                errorMessage: "height",
            },
            {
                expectation: "throws exception if provider rich response doesn't have html",
                providerResponse: JSON.stringify({ type: "rich", version: "1.0", width: 1000, height: 1000 }),
                errorMessage: "html",
            },
            {
                expectation: "throws exception if provider video response doesn't have width",
                providerResponse: JSON.stringify({ type: "video", version: "1.0", height: 1000, html: "" }),
                errorMessage: "width",
            },
            {
                expectation: "throws exception if provider video response doesn't have height",
                providerResponse: JSON.stringify({ type: "video", version: "1.0", width: 1000, html: "" }),
                errorMessage: "height",
            },
            {
                expectation: "throws exception if provider video response doesn't have html",
                providerResponse: JSON.stringify({ type: "video", version: "1.0", width: 1000, height: 1000 }),
                errorMessage: "html",
            },
        ].forEach((data) => {
            it(data.expectation, async () => {
                const request = stub();
                const client = new (proxyquire("../src/client", {
                    "request-promise-native": request,
                }).Client)({ providers, importOembedProviders: false });

                request.returns(data.providerResponse);

                await expect(client.fetch("http://provider.one/something"))
                    .to.eventually.be.rejectedWith(InvalidProviderResponseError, data.errorMessage);
            });
        });
    });
});
