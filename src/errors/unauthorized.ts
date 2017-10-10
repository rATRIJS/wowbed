import InvalidProviderResponseStatusError from "./invalid-provider-response-status";

class UnauthorizedError extends InvalidProviderResponseStatusError {
    constructor(message: string, requestError: Error) {
        super(message, requestError);

        this.name = "UnauthorizedError";
    }
}

export { UnauthorizedError };

export default UnauthorizedError;