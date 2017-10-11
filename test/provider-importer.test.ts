import { expect } from "chai";
import * as proxyquire from "proxyquire";
import Client from "../src/client";

const providers = [
    {
        raw: {
            provider_name: "Provider 1",
            provider_url: "http://provider.one",
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
        converted: {
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
    },
    {
        raw: {
            provider_name: "Provider 2",
            provider_url: "http://provider.two",
            endpoints: [ { url: "http://provider.two" } ],
        },
        converted: {
            name: "Provider 2",
            url: "http://provider.two",
            endpoints: [ { url: "http://provider.two" } ],
        },
    },
    {
        raw: {
            provider_name: "Provider 3",
            provider_url: "http://provider.three",
            endpoints: [ { url: "http://provider.three" } ],
        },
        converted: {
            name: "Provider 3",
            url: "http://provider.three",
            endpoints: [ { url: "http://provider.three" } ],
        },
    },
];

describe("ProviderImporter", () => {
    describe("#import()", () => {
        it("should add all providers", () => {
            const client = new Client({ importOembedProviders: false });
            const providerImporter = proxyquire.noCallThru().load("../src/provider-importer", {
                "oembed-providers": providers.map((provider) => provider.raw),
            }).default;

            providerImporter.import(client);

            expect(client.providers).to.eql(providers.map((provider) => provider.converted));
        });

        it("should add specified providers", () => {
            const client = new Client({ importOembedProviders: false });
            const providerImporter = proxyquire.noCallThru().load("../src/provider-importer", {
                "oembed-providers": providers.map((provider) => provider.raw),
            }).default;

            providerImporter.import(
                client,
                providers.slice(0, 2).map((provider) => provider.converted.name),
            );

            expect(client.providers).to.eql(providers.slice(0, 2).map((provider) => provider.converted));
        });

        it("should append to existing providers", () => {
            const client = new Client({
                providers: providers.slice(0, 1).map((provider) => provider.converted),
                importOembedProviders: false,
            });
            const providerImporter = proxyquire.noCallThru().load("../src/provider-importer", {
                "oembed-providers": providers.slice(1).map((provider) => provider.raw),
            }).default;

            providerImporter.import(client);

            expect(client.providers).to.eql(providers.map((provider) => provider.converted));
        });

        it("should add nothing if no specified providers", () => {
            const client = new Client({ importOembedProviders: false });
            const providerImporter = proxyquire.noCallThru().load("../src/provider-importer", {
                "oembed-providers": providers.map((provider) => provider.raw),
            }).default;

            providerImporter.import(client, []);

            expect(client.providers).to.eql([]);
        });

        it("should add nothing if no providers", () => {
            const client = new Client({ importOembedProviders: false });
            const providerImporter = proxyquire.noCallThru().load("../src/provider-importer", {
                "oembed-providers": [],
            }).default;

            providerImporter.import(client);

            expect(client.providers).to.eql([]);
        });
    });
});
