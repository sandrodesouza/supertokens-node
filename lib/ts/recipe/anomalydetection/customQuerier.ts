import { doFetch } from "../../utils";

export class CustomQuerier {
    basePath: string;
    domain: string;

    constructor({ basePath, domain }: { basePath: string; domain: string }) {
        this.basePath = basePath;
        this.domain = domain;
    }

    async sendRequestHelper(requestFunc: () => Promise<Response>) {
        try {
            let response = await requestFunc();
            if (response.status !== 200) {
                throw response;
            }
            if (response.headers.get("content-type")?.startsWith("text")) {
                return await response.clone().text();
            }
            return await response.clone().json();
        } catch (err) {
            // @ts-ignore
            if (err.status === 401) {
                throw new Error("Unauthorised");
            }
            throw new Error("Unknown error occurred");
        }
    }

    async sendPostRequest(path: string, body: any) {
        return this.sendRequestHelper(async () => {
            return doFetch(this.domain + this.basePath + path, {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                },
            });
        });
    }
}
