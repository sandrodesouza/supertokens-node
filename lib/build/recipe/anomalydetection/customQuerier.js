"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomQuerier = void 0;
const utils_1 = require("../../utils");
class CustomQuerier {
    constructor({ basePath, domain }) {
        this.basePath = basePath;
        this.domain = domain;
    }
    async sendRequestHelper(requestFunc) {
        var _a;
        try {
            let response = await requestFunc();
            if (response.status !== 200) {
                throw response;
            }
            if (
                (_a = response.headers.get("content-type")) === null || _a === void 0 ? void 0 : _a.startsWith("text")
            ) {
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
    async sendPostRequest(path, body) {
        return this.sendRequestHelper(async () => {
            return utils_1.doFetch(this.domain + this.basePath + path, {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json",
                },
            });
        });
    }
}
exports.CustomQuerier = CustomQuerier;
