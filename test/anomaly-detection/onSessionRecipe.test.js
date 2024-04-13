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
const { printPath, setupST, startST, killAllST, cleanST, extractInfoFromResponse } = require("../utils");
const assert = require("assert");
const { Querier } = require("../../lib/build/querier");
const express = require("express");
const request = require("supertest");
const { ProcessState } = require("../../lib/build/processState");
const SuperTokens = require("../../");
const Session = require("../../recipe/session");
const { parseJWTWithoutSignatureVerification } = require("../../lib/build/recipe/session/jwt");
const { middleware, errorHandler } = require("../../framework/express");
const { default: NormalisedURLPath } = require("../../lib/build/normalisedURLPath");
const AnomalyDetection = require("../../recipe/anomalydetection");
const AnomalyDetectionRecipe = require("../../lib/build/recipe/anomalydetection/recipe").default;
const sinon = require("sinon");

describe(`onSessionRecipe: ${printPath("[test/anomaly-detection/onSessionRecipe.test.js]")}`, function () {
    beforeEach(async function () {
        await killAllST();
        await setupST();
        ProcessState.getInstance().reset();
    });

    after(async function () {
        await killAllST();
        await cleanST();
    });

    it("it should call checkAnomalyWithRequest when refreshing legacy sessions", async function () {
        const connectionURI = await startST();
        SuperTokens.init({
            supertokens: {
                connectionURI,
            },
            appInfo: {
                apiDomain: "api.supertokens.io",
                appName: "SuperTokens",
                websiteDomain: "supertokens.io",
            },
            recipeList: [Session.init(), AnomalyDetection.init()],
        });

        // This CDI version is no longer supported by this SDK, but we want to ensure that sessions keep working after the upgrade
        // We can hard-code the structure of the request&response, since this is a fixed CDI version and it's not going to change
        Querier.apiVersion = "2.18";
        const legacySessionResp = await Querier.getNewInstanceOrThrowError().sendPostRequest(
            new NormalisedURLPath("/recipe/session"),
            {
                userId: "test-user-id",
                enableAntiCsrf: false,
                userDataInJWT: {},
                userDataInDatabase: {},
            },
            {}
        );
        Querier.apiVersion = undefined;

        const legacyRefreshToken = legacySessionResp.refreshToken.token;

        const app = express().use(middleware(), errorHandler());

        const instance = AnomalyDetectionRecipe.getInstanceOrThrowError();
        const checkAnomalyPost = sinon.stub(instance.recipeInterfaceImpl, "checkAnomalyWithRequest");

        // mock for sign up call
        checkAnomalyPost.resolves({
            status: "OK",
        });

        let res = await new Promise((resolve, reject) =>
            request(app)
                .post("/auth/session/refresh")
                .set("Authorization", `Bearer ${legacyRefreshToken}`)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                })
        );

        let cookies = extractInfoFromResponse(res);
        assert(cookies.accessTokenFromAny !== undefined);
        assert(cookies.refreshTokenFromAny !== undefined);
        assert(cookies.frontToken !== undefined);

        assert.strictEqual(parseJWTWithoutSignatureVerification(cookies.accessTokenFromAny).version, 5);

        // check and reset
        sinon.assert.calledOnce(checkAnomalyPost);
        checkAnomalyPost.reset();
    });

    it("it should call checkAnomalyWithRequest when refreshing sessions", async function () {
        const connectionURI = await startST();
        SuperTokens.init({
            supertokens: {
                connectionURI,
            },
            appInfo: {
                apiDomain: "api.supertokens.io",
                appName: "SuperTokens",
                websiteDomain: "supertokens.io",
            },
            recipeList: [Session.init(), AnomalyDetection.init()],
        });

        Querier.apiVersion = undefined;
        const sessionResp = await Querier.getNewInstanceOrThrowError().sendPostRequest(
            new NormalisedURLPath("/recipe/session"),
            {
                userId: "test-user-id",
                enableAntiCsrf: false,
                userDataInJWT: {},
                userDataInDatabase: {},
            },
            {}
        );

        const instance = AnomalyDetectionRecipe.getInstanceOrThrowError();
        const checkAnomalyPost = sinon.stub(instance.recipeInterfaceImpl, "checkAnomalyWithRequest");

        // mock for sign up call
        checkAnomalyPost.resolves({
            status: "OK",
        });

        const refreshToken = sessionResp.refreshToken.token;

        const app = express().use(middleware(), errorHandler());

        let res = await new Promise((resolve, reject) =>
            request(app)
                .post("/auth/session/refresh")
                .set("Authorization", `Bearer ${refreshToken}`)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                })
        );

        let cookies = extractInfoFromResponse(res);
        assert(cookies.accessTokenFromAny !== undefined);
        assert(cookies.refreshTokenFromAny !== undefined);
        assert(cookies.frontToken !== undefined);

        assert.strictEqual(parseJWTWithoutSignatureVerification(cookies.accessTokenFromAny).version, 5);

        // check and reset
        sinon.assert.calledOnce(checkAnomalyPost);
        checkAnomalyPost.reset();
    });
});
