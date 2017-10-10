import WowbedError from "./base";

class InvalidProviderResponseError extends WowbedError {
    constructor(message: string) {
        super(message);

        this.name = "InvalidProviderResponseError";
    }
}

export { InvalidProviderResponseError };

export default InvalidProviderResponseError;
