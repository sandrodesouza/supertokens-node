// @ts-nocheck
export declare class CustomQuerier {
    basePath: string;
    domain: string;
    constructor({ basePath, domain }: { basePath: string; domain: string });
    sendRequestHelper(requestFunc: () => Promise<Response>): Promise<any>;
    sendPostRequest(path: string, body: any): Promise<any>;
}
