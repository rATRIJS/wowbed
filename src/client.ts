import { Provider, Endpoint } from "./provider";
import * as request from "request-promise-native";
import EndpointNotFoundError from "./errors/endpoint-not-found";
import escapeRegexp = require("escape-string-regexp");
import FormatNotImplementedError from "./errors/format-not-implemented";
import InvalidProviderResponseError from "./errors/invalid-provider-response";
import InvalidProviderResponseStatusError from "./errors/invalid-provider-response-status";
import providerImporter from "./provider-importer";
import ProviderResponse from "./provider-response";
import ResourceNotFoundError from "./errors/resource-not-found";
import UnauthorizedError from "./errors/unauthorized";

interface ClientOptions {
    providers?: Provider[];

    importOembedProviders?: boolean | string[];
}

interface FetchOptions {
    maxWidth?: number;

    maxHeight?: number;

    [ propertyName: string ]: any;
}

interface RawProviderResponse {
    [ propertyName: string ]: any;
}

class Client {
    public providers: Provider[];

    constructor(options: ClientOptions = {}) {
        options = {
            providers: [],
            importOembedProviders: true,
            ...options,
        };

        this.providers = options.providers;

        if (options.importOembedProviders) {
            providerImporter.import(
                this,
                Array.isArray(options.importOembedProviders) ? options.importOembedProviders : undefined,
            );
        }
    }

    public async fetch(url: string, options: FetchOptions = {}): Promise<ProviderResponse> {
        const endpoint = this.getEndpointByUrl(url);

        options.url = url;
        options.format = "json";

        if (options.maxWidth) {
            options.maxwidth = options.maxWidth;
            delete options.maxWidth;
        }

        if (options.maxHeight) {
            options.maxheight = options.maxHeight;
            delete options.maxHeight;
        }

        try {
            return this.responseToProviderResponse(await request({
                method: "GET",
                uri: endpoint.url.replace("{format}", "json"),
                qs: options,
            }));
        } catch (error) {
            if (error.name === "StatusCodeError") {
                switch (error.statusCode) {
                    case 401:
                        throw new UnauthorizedError("Access to resource denied.", error);

                    case 404:
                        throw new ResourceNotFoundError("Provider couldn't find the resource.", error);

                    case 501:
                        throw new FormatNotImplementedError("Provider doesn't support 'json' format.", error);

                    default:
                        throw new InvalidProviderResponseStatusError(
                            "Provider response had unsupported status.",
                            error,
                        );
                }
            }

            throw error;
        }
    }

    protected getEndpointByUrl(url: string): Endpoint {
        try {
            return this.getEndpointMatchingScheme(url);
        } catch (error) {
            if (!(error instanceof EndpointNotFoundError)) {
                throw error;
            }
        }

        try {
            return this.getEndpointMatchingUrl(url);
        } catch (error) {
            if (!(error instanceof EndpointNotFoundError)) {
                throw error;
            }
        }

        throw new EndpointNotFoundError("No endpoint was found for given URL.");
    }

    protected getEndpointMatchingScheme(url: string): Endpoint {
        for (const provider of this.providers) {
            for (const endpoint of provider.endpoints) {
                if (endpoint.schemes) {
                    for (const scheme of endpoint.schemes) {
                        const pattern = new RegExp(`^${escapeRegexp(scheme).replace(/\\\*/, ".*")}$`, "i");

                        if (url.match(pattern)) {
                            return endpoint;
                        }
                    }
                }
            }
        }

        throw new EndpointNotFoundError("No endpoint scheme matched given URL.");
    }

    protected getEndpointMatchingUrl(url: string): Endpoint {
        for (const provider of this.providers) {
            const pattern = new RegExp(escapeRegexp(provider.url.replace(/^https?:\/\//, "")));

            if (url.match(pattern)) {
                return provider.endpoints[0];
            }
        }

        throw new EndpointNotFoundError("No provider URL matched given URL.");
    }

    protected responseToProviderResponse(rawResponse: string): ProviderResponse {
        let response: RawProviderResponse;

        try {
            response = JSON.parse(rawResponse);
        } catch (error) {
            throw new InvalidProviderResponseError("Provider response isn't valid JSON.");
        }

        if (typeof response !== "object") {
            throw new InvalidProviderResponseError("Provider response isn't valid JSON.");
        }

        this.assertValidProviderResponse(response);

        if ([ "photo", "video", "rich" ].indexOf(response.type) !== -1) {
            this.assertValidWithDimensionsProviderResponse(<ProviderResponse> response);
        }

        if ([ "video", "rich" ].indexOf(response.type) !== -1) {
            this.assertValidWithHtmlProviderResponse(<ProviderResponse> response);
        }

        if (response.type === "photo") {
            this.assertValidPhotoProviderResponse(<ProviderResponse> response);
        }

        for (const property of [
            { raw: "author_name", converted: "authorName" },
            { raw: "author_url", converted: "authorUrl" },
            { raw: "provider_name", converted: "providerName" },
            { raw: "provider_url", converted: "providerUrl" },
            { raw: "cache_age", converted: "cacheAge" },
            { raw: "thumbnail_url", converted: "thumbnailUrl" },
            { raw: "thumbnail_width", converted: "thumbnailWidth" },
            { raw: "thumbnail_height", converted: "thumbnailHeight" },
        ]) {
            if (response.hasOwnProperty(property.raw)) {
                response[property.converted] = response[property.raw];
            }
        }

        for (const property of [ "cacheAge", "thumbnailWidth", "thumbnailHeight" ]) {
            if (response.hasOwnProperty(property)) {
                response[property] = parseInt(response[property], 10);
            }
        }

        return <ProviderResponse> response;
    }

    protected assertValidProviderResponse(response: RawProviderResponse): void {
        if (!response.type) {
            throw new InvalidProviderResponseError("Provider response didn't include 'type' property.");
        }

        if (!response.version) {
            throw new InvalidProviderResponseError("Provider response didn't include 'version' property.");
        }
    }

    protected assertValidWithDimensionsProviderResponse(response: ProviderResponse): void {
        if (!response.width) {
            throw new InvalidProviderResponseError(
                `Provider response with type of '${response.type}' didn't include 'width' property.`,
            );
        }

        if (!response.height) {
            throw new InvalidProviderResponseError(
                `Provider response with type of '${response.type}' didn't include 'height' property.`,
            );
        }
    }

    protected assertValidWithHtmlProviderResponse(response: ProviderResponse): void {
        if (!response.html) {
            throw new InvalidProviderResponseError(
                `Provider response with type of '${response.type}' didn't include 'html' property.`,
            );
        }
    }

    protected assertValidPhotoProviderResponse(response: ProviderResponse): void {
        if (!response.html) {
            throw new InvalidProviderResponseError(
                "Provider response with type of 'photo' didn't include 'url' property.",
            );
        }
    }
}

export { ClientOptions, FetchOptions, RawProviderResponse, Client };

export default Client;
