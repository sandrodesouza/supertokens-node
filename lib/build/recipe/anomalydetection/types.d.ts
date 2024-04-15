// @ts-nocheck
import OverrideableBuilder from "supertokens-js-override";
import type { BaseRequest, BaseResponse } from "../../framework";
import NormalisedURLDomain from "../../normalisedURLDomain";
import NormalisedURLPath from "../../normalisedURLPath";
export declare type TypeInput = {
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
export declare type TypeNormalisedInput = {
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
export declare type APIOptions = {
    recipeImplementation: RecipeInterface;
    config: TypeNormalisedInput;
    recipeId: string;
    isInServerlessEnv: boolean;
    req: BaseRequest;
    res: BaseResponse;
};
declare type CheckAnomalyBaseRequest = {
    action: "SIGN_UP" | "SIGN_IN" | "REFRESH_TOKEN";
} & (
    | {
          status: "OK";
          userId: string;
          tenantId: string;
      }
    | {
          status: "ERROR";
          userId?: string;
          tenantId?: string;
      }
    | {}
);
export declare type RecipeInterface = {
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
export declare type APIInterface = {};
export declare type DeviceHeaders = {
    accept?: string;
    language?: string;
    encoding?: string;
    userAgent?: string;
};
export {};
