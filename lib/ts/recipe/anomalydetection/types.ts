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

import OverrideableBuilder from "supertokens-js-override";
import type { BaseRequest, BaseResponse } from "../../framework";
import NormalisedURLDomain from "../../normalisedURLDomain";
import NormalisedURLPath from "../../normalisedURLPath";

export type TypeInput = {
    anomalyBasePath?: string;
    anomalyDomain?: string;
    mode?: "BLOCK_ACCESS" | "REPORT_ONLY";
    override?: {
        functions?: (
            originalImplementation: RecipeInterface,
            builder?: OverrideableBuilder<RecipeInterface>
        ) => RecipeInterface;
        apis?: (originalImplementation: APIInterface, builder?: OverrideableBuilder<APIInterface>) => APIInterface;
    };
};

export type TypeNormalisedInput = {
    anomalyDomain: NormalisedURLDomain;
    anomalyBasePath: NormalisedURLPath;
    mode: "BLOCK_ACCESS" | "REPORT_ONLY";
    override: {
        functions: (
            originalImplementation: RecipeInterface,
            builder?: OverrideableBuilder<RecipeInterface>
        ) => RecipeInterface;
        apis: (originalImplementation: APIInterface, builder?: OverrideableBuilder<APIInterface>) => APIInterface;
    };
};

export type APIOptions = {
    recipeImplementation: RecipeInterface;
    config: TypeNormalisedInput;
    recipeId: string;
    isInServerlessEnv: boolean;
    req: BaseRequest;
    res: BaseResponse;
};

type CheckAnomalyBaseRequest = {
    action: "SIGN_UP" | "SIGN_IN" | "REFRESH_TOKEN";
} & (
    | {
          status: "OK";
          userId: string;
          tenantId: string;
      }
    | {
          status:
              | "LINKING_TO_SESSION_USER_FAILED"
              | "WRONG_CREDENTIALS_ERROR"
              | "SIGN_IN_NOT_ALLOWED"
              | "EMAIL_ALREADY_EXISTS_ERROR";
          userId?: string;
          tenantId?: string;
      }
    | {}
);

export type RecipeInterface = {
    checkAnomaly: (
        input: {
            ipAddress?: string;
            headers?: DeviceHeaders;
        } & CheckAnomalyBaseRequest
    ) => Promise<
        | {
              status: "OK";
          }
        | {
              status: "ANOMALY_DETECTED";
          }
    >;
    checkAnomalyWithRequest: (
        input: {
            request: BaseRequest;
        } & CheckAnomalyBaseRequest
    ) => Promise<
        | {
              status: "OK";
          }
        | {
              status: "ANOMALY_DETECTED";
          }
    >;
    getIpAddressFromRequest: (input: { request: BaseRequest }) => string | undefined;
    getDeviceHeadersFromRequest: (input: { request: BaseRequest }) => DeviceHeaders | undefined;
};

export type APIInterface = {};

export type DeviceHeaders = {
    accept?: string;
    language?: string;
    encoding?: string;
    userAgent?: string;
};
