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
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, "__esModule", { value: true });
const supertokens_js_override_1 = __importDefault(require("supertokens-js-override"));
const error_1 = __importDefault(require("../../error"));
const querier_1 = require("../../querier");
const recipeModule_1 = __importDefault(require("../../recipeModule"));
const recipeImplementation_1 = __importDefault(require("./recipeImplementation"));
const utils_1 = require("./utils");
class Recipe extends recipeModule_1.default {
    constructor(recipeId, appInfo, isInServerlessEnv, config) {
        super(recipeId, appInfo);
        this.handleAPIRequest = async (_id, _tenantId, _req, _res, _path, _method, _userContext) => {
            throw new Error("should never come here");
        };
        this.config = utils_1.validateAndNormaliseUserInput(this, appInfo, config);
        this.isInServerlessEnv = isInServerlessEnv;
        // TODO-SAN: we may need to implement a new querier instead of reusing this one
        let querier = querier_1.Querier.getNewCustomInstanceOrThrowError(
            [
                {
                    basePath: this.config.basePath,
                    domain: this.config.domain,
                },
            ],
            recipeId
        );
        {
            let builder = new supertokens_js_override_1.default(recipeImplementation_1.default(querier, this.config));
            this.recipeInterfaceImpl = builder.override(this.config.override.functions).build();
        }
    }
    /* Init functions */
    static getInstance() {
        return Recipe.instance;
    }
    static getInstanceOrThrowError() {
        if (Recipe.instance !== undefined) {
            return Recipe.instance;
        }
        throw new Error("Initialisation not done. Did you forget to call the AnomalyDetection.init function?");
    }
    static init(config) {
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
    getAPIsHandled() {
        return [];
    }
    handleError(error, _, __, _userContext) {
        throw error;
    }
    getAllCORSHeaders() {
        return [];
    }
    isErrorFromThisRecipe(err) {
        return error_1.default.isErrorFromSuperTokens(err) && err.fromRecipe === Recipe.RECIPE_ID;
    }
}
exports.default = Recipe;
Recipe.RECIPE_ID = "anomalydetection";
Recipe.instance = undefined;
