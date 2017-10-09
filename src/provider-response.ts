interface ProviderResponse {
    type: string;

    version: string;

    title?: string;

    authorName?: string;

    authorUrl?: string;

    providerName?: string;

    providerUrl?: string;

    cacheAge?: number;

    thumbnailUrl?: string;

    thumbnailWidth?: number;

    thumbnailHeight?: number;

    [ propertyName: string ]: any;
}

export { ProviderResponse };

export default ProviderResponse;