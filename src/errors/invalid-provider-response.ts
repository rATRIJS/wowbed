class InvalidProviderResponseError extends Error {
    constructor(message: string) {
        super();

        Error.captureStackTrace(this, this.constructor);

        this.name = "InvalidProviderResponseError";
        this.message = message;
    }
}

export { InvalidProviderResponseError };

export default InvalidProviderResponseError;