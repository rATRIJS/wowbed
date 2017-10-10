import WowbedError from "./base";

class EndpointNotFoundError extends WowbedError {
    constructor(message: string) {
        super(message);

        this.name = "EndpointNotFoundError";
    }
}

export { EndpointNotFoundError };

export default EndpointNotFoundError;