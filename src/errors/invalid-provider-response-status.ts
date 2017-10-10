import WowbedError from "./base";

class InvalidProviderResponseStatusError extends WowbedError {
    public readonly requestError: Error;

    constructor(message: string, requestError: Error) {
        super(message);

        this.name = "InvalidProviderResponseStatusError";
        this.requestError = requestError;
    }
}

export { InvalidProviderResponseStatusError };

export default InvalidProviderResponseStatusError;