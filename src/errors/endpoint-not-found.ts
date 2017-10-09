class EndpointNotFoundError extends Error {
    constructor(message: string) {
        super();

        Error.captureStackTrace(this, this.constructor);

        this.name = "EndpointNotFoundError";
        this.message = message;
    }
}

export { EndpointNotFoundError };

export default EndpointNotFoundError;