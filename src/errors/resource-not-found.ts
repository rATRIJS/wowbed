import InvalidProviderResponseStatusError from "./invalid-provider-response-status";

class ResourceNotFoundError extends InvalidProviderResponseStatusError {
    constructor(message: string, requestError: Error) {
        super(message, requestError);

        this.name = "ResourceNotFoundError";
    }
}

export { ResourceNotFoundError };

export default ResourceNotFoundError;
