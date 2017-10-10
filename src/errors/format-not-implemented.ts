import InvalidProviderResponseStatusError from "./invalid-provider-response-status";

class FormatNotImplementedError extends InvalidProviderResponseStatusError {
    constructor(message: string, requestError: Error) {
        super(message, requestError);

        this.name = "FormatNotImplementedError";
    }
}

export { FormatNotImplementedError };

export default FormatNotImplementedError;