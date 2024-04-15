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

const { printPath, setupST, startST, killAllST, cleanST } = require("../utils");
let STExpress = require("../../");
let assert = require("assert");
let { ProcessState } = require("../../lib/build/processState");
let AnomalyDetection = require("../../recipe/anomalydetection");
let AnomalyDetectionRecipe = require("../../lib/build/recipe/anomalydetection/recipe").default;
let EmailPassword = require("../../recipe/emailpassword");

describe(`configTest: ${printPath("[test/anomaly-detection/config.test.js]")}`, function () {
    beforeEach(async function () {
        await killAllST();
        await setupST();
        ProcessState.getInstance().reset();
    });

    after(async function () {
        await killAllST();
        await cleanST();
    });

    // test config for anomalydetection module

    it("test default config for anomalydetection module", async function () {
        const connectionURI = await startST();
        STExpress.init({
            supertokens: {
                connectionURI,
            },
            appInfo: {
                apiDomain: "api.supertokens.io",
                appName: "SuperTokens",
                websiteDomain: "supertokens.io",
            },
            recipeList: [AnomalyDetection.init()],
        });

        let anomalydetection = AnomalyDetectionRecipe.getInstanceOrThrowError();

        let config = anomalydetection.config;
        assert.equal(config.mode, "REPORT_ONLY");
        assert.equal(config.anomalyBasePath.value, "/api");
        assert.equal(config.anomalyDomain.value, "http://localhost:3002");
    });

    it("test proper initialisation", async function () {
        const connectionURI = await startST();
        STExpress.init({
            supertokens: {
                connectionURI,
            },
            appInfo: {
                apiDomain: "api.supertokens.io",
                appName: "SuperTokens",
                websiteDomain: "supertokens.io",
            },
            recipeList: [EmailPassword.init()],
        });

        assert.throws(() => AnomalyDetectionRecipe.getInstanceOrThrowError());
    });
});
