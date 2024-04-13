// @ts-nocheck
import { NormalisedAppinfo } from "../../types";
import Recipe from "./recipe";
import { TypeInput, TypeNormalisedInput, DeviceHeaders } from "./types";
import { BaseRequest } from "../../framework";
export declare function validateAndNormaliseUserInput(
    _: Recipe,
    __: NormalisedAppinfo,
    config?: TypeInput
): TypeNormalisedInput;
export declare function getDeviceHeadersFromRequest(req: BaseRequest): DeviceHeaders;
export declare function getIpAddressFromRequest(req: BaseRequest): string | undefined;
