import ProviderResponse from "../provider-response";

interface WithDimensions extends ProviderResponse {
    width: number;

    height: number;
}

export { WithDimensions };

export default WithDimensions;
