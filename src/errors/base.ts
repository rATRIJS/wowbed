abstract class WowbedError extends Error {
    constructor(message: string) {
        super();

        Error.captureStackTrace(this, this.constructor);

        this.message = message;
    }
}

export { WowbedError };

export default WowbedError;