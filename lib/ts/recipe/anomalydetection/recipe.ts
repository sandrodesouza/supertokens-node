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
import { default as SuperTokensError, default as error } from "../../error";
import type { BaseRequest, BaseResponse } from "../../framework";
import { default as normalisedURLPath } from "../../normalisedURLPath";
import { Querier } from "../../querier";
import RecipeModule from "../../recipeModule";
import { APIHandled, HTTPMethod, NormalisedAppinfo, RecipeListFunction, UserContext } from "../../types";
import RecipeImplementation from "./recipeImplementation";
import { RecipeInterface, TypeInput, TypeNormalisedInput } from "./types";
import { validateAndNormaliseUserInput } from "./utils";

export default class Recipe extends RecipeModule {
    static RECIPE_ID = "anomalydetection";
    private static instance: Recipe | undefined = undefined;

    config: TypeNormalisedInput;
    recipeInterfaceImpl: RecipeInterface;
    isInServerlessEnv: boolean;

    constructor(recipeId: string, appInfo: NormalisedAppinfo, isInServerlessEnv: boolean, config?: TypeInput) {
        super(recipeId, appInfo);
        this.config = validateAndNormaliseUserInput(this, appInfo, config);
        this.isInServerlessEnv = isInServerlessEnv;

        // TODO-SAN: we may need to implement a new querier instead of reusing this one
        let querier = Querier.getNewCustomInstanceOrThrowError(
            [
                {
                    basePath: this.config.basePath,
                    domain: this.config.domain,
                },
            ],
            recipeId
        );
        {
            let builder = new OverrideableBuilder(RecipeImplementation(querier, this.config));
            this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
        }
    }

    /* Init functions */

    static getInstance(): Recipe | undefined {
        return Recipe.instance;
    }

    static getInstanceOrThrowError(): Recipe {
        if (Recipe.instance !== undefined) {
            return Recipe.instance;
        }
        throw new Error("Initialisation not done. Did you forget to call the AnomalyDetection.init function?");
    }

    static init(config?: TypeInput): RecipeListFunction {
        return (appInfo, isInServerlessEnv) => {
            if (Recipe.instance === undefined) {
                Recipe.instance = new Recipe(Recipe.RECIPE_ID, appInfo, isInServerlessEnv, config);
                return Recipe.instance;
            } else {
                throw new Error(
                    "AnomalyDetection recipe has already been initialised. Please check your code for bugs."
                );
            }
        };
    }

    static reset() {
        if (process.env.TEST_MODE !== "testing") {
            throw new Error("calling testing function in non testing env");
        }
        Recipe.instance = undefined;
    }

    /* RecipeModule functions */

    getAPIsHandled(): APIHandled[] {
        return [];
    }

    handleAPIRequest = async (
        _id: string,
        _tenantId: string | undefined,
        _req: BaseRequest,
        _res: BaseResponse,
        _path: normalisedURLPath,
        _method: HTTPMethod,
        _userContext: UserContext
    ): Promise<boolean> => {
        throw new Error("should never come here");
    };

    handleError(error: error, _: BaseRequest, __: BaseResponse, _userContext: UserContext): Promise<void> {
        throw error;
    }

    getAllCORSHeaders(): string[] {
        return [];
    }

    isErrorFromThisRecipe(err: any): err is error {
        return SuperTokensError.isErrorFromSuperTokens(err) && err.fromRecipe === Recipe.RECIPE_ID;
    }
}
