"use strict";
/* Copyright (c) 2021, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */
var __rest =
    (this && this.__rest) ||
    function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
            }
        return t;
    };
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
const normalisedURLPath_1 = __importDefault(require("../../normalisedURLPath"));
function getRecipeInterface(querier, config) {
    return {
        checkAnomaly: async function (input) {
            let response = await querier.sendPostRequest(
                new normalisedURLPath_1.default("/anomaly/check").getAsStringDangerous(),
                input
            );
            if (response.status === "OK") {
                return {
                    status: "OK",
                };
            } else {
                return {
                    status: "ANOMALY_DETECTED",
                };
            }
        },
        checkAnomalyWithRequest: async function (_a) {
            var { request } = _a,
                rest = __rest(_a, ["request"]);
            const headers = this.getHeadersFromRequest({ request });
            if (headers === undefined) {
                // nothing to check
                return { status: "OK" };
            }
            const result = await this.checkAnomaly(
                Object.assign(
                    {
                        // @ts-ignore (we have an if check above to make sure one of them is defined)
                        headers,
                    },
                    rest
                )
            );
            if (config.mode === "REPORT_ONLY") {
                return {
                    status: "OK",
                };
            }
            return result;
        },
        getHeadersFromRequest: function ({ request }) {
            return request.original.headers;
        },
    };
}
exports.default = getRecipeInterface;
