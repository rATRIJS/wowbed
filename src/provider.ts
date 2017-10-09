interface Endpoint {
    url: string;
    schemes?: string[];
    discovery?: boolean;
}

interface Provider {
    name: string;
    url: string;
    endpoints: Endpoint[];
}

export { Endpoint, Provider };

export default Provider;