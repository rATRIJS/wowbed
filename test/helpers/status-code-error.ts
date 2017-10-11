class StatusCodeError extends Error {
    public readonly statusCode: number;

    constructor(statusCode: number) {
        super();

        Error.captureStackTrace(this, this.constructor);

        this.message = "";
        this.name = "StatusCodeError";
        this.statusCode = statusCode;
    }
}

export default StatusCodeError;
