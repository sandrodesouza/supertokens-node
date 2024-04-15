// @ts-nocheck
import Recipe from "./recipe";
import SuperTokensError from "./error";
import {
    RecipeInterface,
    APIInterface,
    PasswordlessAPIOptions,
    ThirdPartyAPIOptions,
    TypeThirdPartyPasswordlessEmailDeliveryInput,
} from "./types";
import { TypeProvider } from "../thirdparty/types";
import { TypePasswordlessSmsDeliveryInput } from "../passwordless/types";
import RecipeUserId from "../../recipeUserId";
import { SessionContainerInterface } from "../session/types";
import { User } from "../../types";
export default class Wrapper {
    static init: typeof Recipe.init;
    static Error: typeof SuperTokensError;
    static thirdPartyGetProvider(
        tenantId: string,
        thirdPartyId: string,
        clientType: string | undefined,
        userContext?: Record<string, any>
    ): Promise<TypeProvider | undefined>;
    static thirdPartyManuallyCreateOrUpdateUser(
        tenantId: string,
        thirdPartyId: string,
        thirdPartyUserId: string,
        email: string,
        isVerified: boolean,
        session?: undefined,
        userContext?: Record<string, any>
    ): Promise<
        | {
              status: "OK";
              createdNewRecipeUser: boolean;
              user: User;
              recipeUserId: RecipeUserId;
          }
        | {
              status: "EMAIL_CHANGE_NOT_ALLOWED_ERROR";
              reason: string;
          }
        | {
              status: "SIGN_IN_UP_NOT_ALLOWED";
              reason: string;
          }
    >;
    static thirdPartyManuallyCreateOrUpdateUser(
        tenantId: string,
        thirdPartyId: string,
        thirdPartyUserId: string,
        email: string,
        isVerified: boolean,
        session: SessionContainerInterface,
        userContext?: Record<string, any>
    ): Promise<
        | {
              status: "OK";
              createdNewRecipeUser: boolean;
              user: User;
              recipeUserId: RecipeUserId;
          }
        | {
              status: "EMAIL_CHANGE_NOT_ALLOWED_ERROR";
              reason: string;
          }
        | {
              status: "SIGN_IN_UP_NOT_ALLOWED";
              reason: string;
          }
        | {
              status: "LINKING_TO_SESSION_USER_FAILED";
              reason:
                  | "EMAIL_VERIFICATION_REQUIRED"
                  | "RECIPE_USER_ID_ALREADY_LINKED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR"
                  | "ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR"
                  | "SESSION_USER_ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR";
          }
    >;
    static createCode(
        input: (
            | {
                  email: string;
              }
            | {
                  phoneNumber: string;
              }
        ) & {
            userInputCode?: string;
            session?: SessionContainerInterface;
            tenantId: string;
            userContext?: Record<string, any>;
        }
    ): Promise<{
        status: "OK";
        preAuthSessionId: string;
        codeId: string;
        deviceId: string;
        userInputCode: string;
        linkCode: string;
        codeLifetime: number;
        timeCreated: number;
    }>;
    static createNewCodeForDevice(input: {
        deviceId: string;
        userInputCode?: string;
        tenantId: string;
        userContext?: Record<string, any>;
    }): Promise<
        | {
              status: "OK";
              preAuthSessionId: string;
              codeId: string;
              deviceId: string;
              userInputCode: string;
              linkCode: string;
              codeLifetime: number;
              timeCreated: number;
          }
        | {
              status: "RESTART_FLOW_ERROR" | "USER_INPUT_CODE_ALREADY_USED_ERROR";
          }
    >;
    /**
     * 1. verifies the code
     * 2. creates the user if it doesn't exist
     * 3. tries to link it
     * 4. marks the email as verified
     */
    static consumeCode(
        input:
            | {
                  preAuthSessionId: string;
                  userInputCode: string;
                  deviceId: string;
                  session?: undefined;
                  tenantId: string;
                  userContext?: Record<string, any>;
              }
            | {
                  preAuthSessionId: string;
                  linkCode: string;
                  session?: undefined;
                  tenantId: string;
                  userContext?: Record<string, any>;
              }
    ): Promise<
        | {
              status: "OK";
              consumedDevice: {
                  preAuthSessionId: string;
                  failedCodeInputAttemptCount: number;
                  email?: string;
                  phoneNumber?: string;
              };
              createdNewRecipeUser: boolean;
              user: User;
              recipeUserId: RecipeUserId;
          }
        | {
              status: "INCORRECT_USER_INPUT_CODE_ERROR" | "EXPIRED_USER_INPUT_CODE_ERROR";
              failedCodeInputAttemptCount: number;
              maximumCodeInputAttempts: number;
          }
        | {
              status: "RESTART_FLOW_ERROR";
          }
    >;
    static consumeCode(
        input:
            | {
                  preAuthSessionId: string;
                  userInputCode: string;
                  deviceId: string;
                  session: SessionContainerInterface;
                  tenantId: string;
                  userContext?: Record<string, any>;
              }
            | {
                  preAuthSessionId: string;
                  linkCode: string;
                  session: SessionContainerInterface;
                  tenantId: string;
                  userContext?: Record<string, any>;
              }
    ): Promise<
        | {
              status: "OK";
              consumedDevice: {
                  preAuthSessionId: string;
                  failedCodeInputAttemptCount: number;
                  email?: string;
                  phoneNumber?: string;
              };
              createdNewRecipeUser: boolean;
              user: User;
              recipeUserId: RecipeUserId;
          }
        | {
              status: "INCORRECT_USER_INPUT_CODE_ERROR" | "EXPIRED_USER_INPUT_CODE_ERROR";
              failedCodeInputAttemptCount: number;
              maximumCodeInputAttempts: number;
          }
        | {
              status: "RESTART_FLOW_ERROR";
          }
        | {
              status: "LINKING_TO_SESSION_USER_FAILED";
              reason:
                  | "EMAIL_VERIFICATION_REQUIRED"
                  | "RECIPE_USER_ID_ALREADY_LINKED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR"
                  | "ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR"
                  | "SESSION_USER_ACCOUNT_INFO_ALREADY_ASSOCIATED_WITH_ANOTHER_PRIMARY_USER_ID_ERROR";
          }
    >;
    /**
     * This function will only verify the code (not consume it), and:
     * NOT create a new user if it doesn't exist
     * NOT verify the user email if it exists
     * NOT do any linking
     * NOT delete the code unless it returned RESTART_FLOW_ERROR
     */
    static checkCode(
        input:
            | {
                  preAuthSessionId: string;
                  userInputCode: string;
                  deviceId: string;
                  tenantId: string;
                  userContext?: Record<string, any>;
              }
            | {
                  preAuthSessionId: string;
                  linkCode: string;
                  tenantId: string;
                  userContext?: Record<string, any>;
              }
    ): Promise<
        | {
              status: "OK";
              consumedDevice: {
                  preAuthSessionId: string;
                  failedCodeInputAttemptCount: number;
                  email?: string;
                  phoneNumber?: string;
              };
          }
        | {
              status: "INCORRECT_USER_INPUT_CODE_ERROR" | "EXPIRED_USER_INPUT_CODE_ERROR";
              failedCodeInputAttemptCount: number;
              maximumCodeInputAttempts: number;
          }
        | {
              status: "RESTART_FLOW_ERROR";
          }
    >;
    static updatePasswordlessUser(input: {
        recipeUserId: RecipeUserId;
        email?: string | null;
        phoneNumber?: string | null;
        userContext?: Record<string, any>;
    }): Promise<
        | {
              status:
                  | "OK"
                  | "UNKNOWN_USER_ID_ERROR"
                  | "EMAIL_ALREADY_EXISTS_ERROR"
                  | "PHONE_NUMBER_ALREADY_EXISTS_ERROR";
          }
        | {
              status: "EMAIL_CHANGE_NOT_ALLOWED_ERROR" | "PHONE_NUMBER_CHANGE_NOT_ALLOWED_ERROR";
              reason: string;
          }
    >;
    static revokeAllCodes(
        input:
            | {
                  email: string;
                  tenantId: string;
                  userContext?: Record<string, any>;
              }
            | {
                  phoneNumber: string;
                  tenantId: string;
                  userContext?: Record<string, any>;
              }
    ): Promise<{
        status: "OK";
    }>;
    static revokeCode(
        input:
            | {
                  codeId: string;
                  tenantId: string;
                  userContext?: Record<string, any>;
              }
            | {
                  preAuthSessionId: string;
                  tenantId: string;
                  userContext?: Record<string, any>;
              }
    ): Promise<{
        status: "OK";
    }>;
    static listCodesByEmail(input: {
        email: string;
        tenantId: string;
        userContext?: Record<string, any>;
    }): Promise<import("../passwordless/types").DeviceType[]>;
    static listCodesByPhoneNumber(input: {
        phoneNumber: string;
        tenantId: string;
        userContext?: Record<string, any>;
    }): Promise<import("../passwordless/types").DeviceType[]>;
    static listCodesByDeviceId(input: {
        deviceId: string;
        tenantId: string;
        userContext?: Record<string, any>;
    }): Promise<import("../passwordless/types").DeviceType | undefined>;
    static listCodesByPreAuthSessionId(input: {
        preAuthSessionId: string;
        tenantId: string;
        userContext?: Record<string, any>;
    }): Promise<import("../passwordless/types").DeviceType | undefined>;
    static createMagicLink(
        input:
            | {
                  email: string;
                  tenantId: string;
                  userContext?: Record<string, any>;
              }
            | {
                  phoneNumber: string;
                  tenantId: string;
                  userContext?: Record<string, any>;
              }
    ): Promise<string>;
    static passwordlessSignInUp(
        input:
            | {
                  email: string;
                  tenantId: string;
                  session?: SessionContainerInterface;
                  userContext?: Record<string, any>;
              }
            | {
                  phoneNumber: string;
                  tenantId: string;
                  session?: SessionContainerInterface;
                  userContext?: Record<string, any>;
              }
    ): Promise<{
        status: string;
        createdNewRecipeUser: boolean;
        recipeUserId: RecipeUserId;
        user: User;
    }>;
    static sendEmail(
        input: TypeThirdPartyPasswordlessEmailDeliveryInput & {
            userContext?: Record<string, any>;
        }
    ): Promise<void>;
    static sendSms(
        input: TypePasswordlessSmsDeliveryInput & {
            userContext?: Record<string, any>;
        }
    ): Promise<void>;
}
export declare let init: typeof Recipe.init;
export declare let Error: typeof SuperTokensError;
export declare let thirdPartyGetProvider: typeof Wrapper.thirdPartyGetProvider;
export declare let thirdPartyManuallyCreateOrUpdateUser: typeof Wrapper.thirdPartyManuallyCreateOrUpdateUser;
export declare let passwordlessSignInUp: typeof Wrapper.passwordlessSignInUp;
export declare let createCode: typeof Wrapper.createCode;
export declare let consumeCode: typeof Wrapper.consumeCode;
export declare let listCodesByDeviceId: typeof Wrapper.listCodesByDeviceId;
export declare let listCodesByEmail: typeof Wrapper.listCodesByEmail;
export declare let listCodesByPhoneNumber: typeof Wrapper.listCodesByPhoneNumber;
export declare let listCodesByPreAuthSessionId: typeof Wrapper.listCodesByPreAuthSessionId;
export declare let createNewCodeForDevice: typeof Wrapper.createNewCodeForDevice;
export declare let updatePasswordlessUser: typeof Wrapper.updatePasswordlessUser;
export declare let revokeAllCodes: typeof Wrapper.revokeAllCodes;
export declare let revokeCode: typeof Wrapper.revokeCode;
export declare let checkCode: typeof Wrapper.checkCode;
export declare let createMagicLink: typeof Wrapper.createMagicLink;
export type { RecipeInterface, TypeProvider, APIInterface, PasswordlessAPIOptions, ThirdPartyAPIOptions };
export declare let sendEmail: typeof Wrapper.sendEmail;
export declare let sendSms: typeof Wrapper.sendSms;
