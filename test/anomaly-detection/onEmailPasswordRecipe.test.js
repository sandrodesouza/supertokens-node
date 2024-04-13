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

const { printPath, setupST, startST, killAllST, cleanST, signUPRequest, extractInfoFromResponse } = require("../utils");
let STExpress = require("../../");
let Session = require("../../recipe/session");
let assert = require("assert");
let { ProcessState } = require("../../lib/build/processState");
let EmailPassword = require("../../recipe/emailpassword");
let AnomalyDetection = require("../../recipe/anomalydetection");
let AnomalyDetectionRecipe = require("../../lib/build/recipe/anomalydetection/recipe").default;
const express = require("express");
const request = require("supertest");
let { middleware, errorHandler } = require("../../framework/express");
const sinon = require("sinon");

describe(`onEmailPasswordRecipe: ${printPath("[test/anomaly-detection/onEmailPasswordRecipe.test.js]")}`, function () {
    beforeEach(async function () {
        await killAllST();
        await setupST();
        ProcessState.getInstance().reset();
    });

    after(async function () {
        await killAllST();
        await cleanST();
    });

    /*
     * test checkAnomalyWithRequest to be called:
     *        - when sign in works properly
     *        - when sign in throws an error because the email does not match
     *        - when sign in throws an error because the password is incorrect
     *
     * Failure condition:
     * checkAnomalyWithRequest is not been called when sign in works properly
     * checkAnomalyWithRequest is not been called when sign in throws an error because the email does not match
     * checkAnomalyWithRequest is not been called when sign in throws an error because the password is incorrect
     *
     */

    it("test checkAnomalyWithRequest is called when sign in works properly", async function () {
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
            recipeList: [
                EmailPassword.init(),
                Session.init({ getTokenTransferMethod: () => "cookie", antiCsrf: "VIA_TOKEN" }),
                AnomalyDetection.init(),
            ],
        });

        const app = express().use(middleware(), errorHandler());

        const instance = AnomalyDetectionRecipe.getInstanceOrThrowError();
        const checkAnomalyPost = sinon.stub(instance.recipeInterfaceImpl, "checkAnomalyWithRequest");

        // mock for sign up call
        checkAnomalyPost.resolves({
            status: "OK",
        });

        let response = await signUPRequest(app, "random@gmail.com", "validpass123");
        assert(JSON.parse(response.text).status === "OK");
        assert(response.status === 200);

        // check and reset
        sinon.assert.calledOnce(checkAnomalyPost);
        checkAnomalyPost.reset();

        // mock for sign in call
        checkAnomalyPost.resolves({
            status: "OK",
        });

        let signUpUserInfo = JSON.parse(response.text).user;

        let signInResponse = await new Promise((resolve) =>
            request(app)
                .post("/auth/signin")
                .send({
                    formFields: [
                        {
                            id: "password",
                            value: "validpass123",
                        },
                        {
                            id: "email",
                            value: "random@gmail.com",
                        },
                    ],
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        resolve(undefined);
                    } else {
                        resolve(res);
                    }
                })
        );

        // check and restore
        sinon.assert.calledOnce(checkAnomalyPost);
        checkAnomalyPost.restore();

        const userInfo = JSON.parse(signInResponse.text).user;
        assert(userInfo.id === signUpUserInfo.id);
        assert(userInfo.email === signUpUserInfo.email);

        let cookies = extractInfoFromResponse(signInResponse);
        assert(cookies.accessToken !== undefined);
        assert(cookies.refreshToken !== undefined);
        assert(cookies.antiCsrf !== undefined);
        assert(cookies.accessTokenExpiry !== undefined);
        assert(cookies.refreshTokenExpiry !== undefined);
        assert(cookies.refreshToken !== undefined);
        assert(cookies.accessTokenDomain === undefined);
        assert(cookies.refreshTokenDomain === undefined);
        assert(cookies.frontToken !== undefined);
    });

    it("test checkAnomalyWithRequest is called when sign in throws 'email does not match' error", async function () {
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
            recipeList: [
                EmailPassword.init(),
                Session.init({ getTokenTransferMethod: () => "cookie" }),
                AnomalyDetection.init(),
            ],
        });

        const app = express().use(middleware(), errorHandler());

        const instance = AnomalyDetectionRecipe.getInstanceOrThrowError();
        const checkAnomalyPost = sinon.stub(instance.recipeInterfaceImpl, "checkAnomalyWithRequest");

        // mock for sign up call
        checkAnomalyPost.resolves({
            status: "OK",
        });

        let signUpResponse = await signUPRequest(app, "random@gmail.com", "validpass123");
        assert(JSON.parse(signUpResponse.text).status === "OK");
        assert(signUpResponse.status === 200);

        // check and reset
        sinon.assert.calledOnce(checkAnomalyPost);
        checkAnomalyPost.reset();

        // mock for sign in call
        checkAnomalyPost.resolves({
            status: "OK",
        });

        let invalidEmailResponse = await new Promise((resolve) =>
            request(app)
                .post("/auth/signin")
                .send({
                    formFields: [
                        {
                            id: "password",
                            value: "validpass123",
                        },
                        {
                            id: "email",
                            value: "ran@gmail.com",
                        },
                    ],
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        resolve(undefined);
                    } else {
                        resolve(JSON.parse(res.text));
                    }
                })
        );
        assert(invalidEmailResponse.status === "WRONG_CREDENTIALS_ERROR");

        // check and restore
        sinon.assert.calledOnce(checkAnomalyPost);
        checkAnomalyPost.restore();
    });

    it("test checkAnomalyWithRequest is called when sign in throws 'password is incorrect' error", async function () {
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
            recipeList: [
                EmailPassword.init(),
                Session.init({ getTokenTransferMethod: () => "cookie" }),
                AnomalyDetection.init(),
            ],
        });

        const app = express().use(middleware(), errorHandler());

        const instance = AnomalyDetectionRecipe.getInstanceOrThrowError();
        const checkAnomalyPost = sinon.stub(instance.recipeInterfaceImpl, "checkAnomalyWithRequest");

        // mock for sign up call
        checkAnomalyPost.resolves({
            status: "OK",
        });

        let signUpResponse = await signUPRequest(app, "random@gmail.com", "validpass123");
        assert(JSON.parse(signUpResponse.text).status === "OK");
        assert(signUpResponse.status === 200);

        // check and reset
        sinon.assert.calledOnce(checkAnomalyPost);
        checkAnomalyPost.reset();

        // mock for sign in call
        checkAnomalyPost.resolves({
            status: "OK",
        });

        let invalidPasswordResponse = await new Promise((resolve) =>
            request(app)
                .post("/auth/signin")
                .send({
                    formFields: [
                        {
                            id: "password",
                            value: "validpass12345",
                        },
                        {
                            id: "email",
                            value: "random@gmail.com",
                        },
                    ],
                })
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        resolve(undefined);
                    } else {
                        resolve(JSON.parse(res.text));
                    }
                })
        );
        assert(invalidPasswordResponse.status === "WRONG_CREDENTIALS_ERROR");

        // check and restore
        sinon.assert.calledOnce(checkAnomalyPost);
        checkAnomalyPost.restore();
    });
});
