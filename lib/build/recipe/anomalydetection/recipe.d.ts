// @ts-nocheck
import { default as error } from "../../error";
import type { BaseRequest, BaseResponse } from "../../framework";
import { default as normalisedURLPath } from "../../normalisedURLPath";
import RecipeModule from "../../recipeModule";
import { APIHandled, HTTPMethod, NormalisedAppinfo, RecipeListFunction, UserContext } from "../../types";
import { RecipeInterface, TypeInput, TypeNormalisedInput } from "./types";
export default class Recipe extends RecipeModule {
    static RECIPE_ID: string;
    private static instance;
    config: TypeNormalisedInput;
    recipeInterfaceImpl: RecipeInterface;
    isInServerlessEnv: boolean;
    constructor(recipeId: string, appInfo: NormalisedAppinfo, isInServerlessEnv: boolean, config?: TypeInput);
    static getInstance(): Recipe | undefined;
    static getInstanceOrThrowError(): Recipe;
    static init(config?: TypeInput): RecipeListFunction;
    static reset(): void;
    getAPIsHandled(): APIHandled[];
    handleAPIRequest: (
        _id: string,
        _tenantId: string | undefined,
        _req: BaseRequest,
        _res: BaseResponse,
        _path: normalisedURLPath,
        _method: HTTPMethod,
        _userContext: UserContext
    ) => Promise<boolean>;
    handleError(error: error, _: BaseRequest, __: BaseResponse, _userContext: UserContext): Promise<void>;
    getAllCORSHeaders(): string[];
    isErrorFromThisRecipe(err: any): err is error;
}
