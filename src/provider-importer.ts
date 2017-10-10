import { Provider, Endpoint } from "./provider";
import Client from "./client";

interface OembedProvider {
    provider_name: string;
    provider_url: string;
    endpoints: Endpoint[];
}

export default {
    import(client: Client, providers?: string[]): void {
        const oembedProviders = require("oembed-providers");

        oembedProviders
            .map((oembedProvider: OembedProvider): Provider => {
                return {
                    name: oembedProvider.provider_name,
                    url: oembedProvider.provider_url,
                    endpoints: oembedProvider.endpoints,
                };
            })
            .filter((oembedProvider: Provider) => {
                if (!providers) {
                    return true;
                }

                return providers.indexOf(oembedProvider.name) !== -1;
            })
            .forEach((oembedProvider: Provider) => {
                client.addProvider(oembedProvider);
            });
    },
};
