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

import NormalisedURLPath from "../../normalisedURLPath";
import { CustomQuerier } from "./customQuerier";
import { RecipeInterface, TypeNormalisedInput } from "./types";
import { getDeviceHeadersFromRequest, getIpAddressFromRequest } from "./utils";

export default function getRecipeInterface(querier: CustomQuerier, config: TypeNormalisedInput): RecipeInterface {
    return {
        checkAnomaly: async function ({ ipAddress, headers, ...rest }) {
            if (!ipAddress && !headers) {
                // no headers or ip address, so we can't check for anomaly
                return { status: "OK" };
            }

            let response = await querier.sendPostRequest(
                new NormalisedURLPath("/anomaly/check").getAsStringDangerous(),
                {
                    ipAddress,
                    headers,
                    ...rest,
                }
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
        checkAnomalyWithRequest: async function ({ request, ...rest }) {
            const headers = (this as RecipeInterface).getDeviceHeadersFromRequest({ request });
            const ipAddress = (this as RecipeInterface).getIpAddressFromRequest({ request });
            const result = await (this as RecipeInterface).checkAnomaly({
                headers,
                ipAddress,
                ...rest,
            });
            if (config.mode === "REPORT_ONLY") {
                return {
                    status: "OK",
                };
            }
            return result;
        },
        getIpAddressFromRequest: function ({ request }) {
            return getIpAddressFromRequest(request);
        },
        getDeviceHeadersFromRequest: function ({ request }) {
            return getDeviceHeadersFromRequest(request);
        },
    };
}
