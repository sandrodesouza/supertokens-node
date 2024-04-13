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
const { printPath, setupST, startST, killAllST, cleanST, signUPRequest } = require("../utils");
let STExpress = require("../../");
let Session = require("../../recipe/session");
let assert = require("assert");
let { ProcessState } = require("../../lib/build/processState");
let EmailPassword = require("../../recipe/emailpassword");
const express = require("express");
const request = require("supertest");
let { middleware, errorHandler } = require("../../framework/express");
const AnomalyDetection = require("../../recipe/anomalydetection");

describe(`overrideTest: ${printPath("[test/anomaly-detection/override.test.js]")}`, function () {
    beforeEach(async function () {
        await killAllST();
        await setupST();
        ProcessState.getInstance().reset();
    });

    after(async function () {
        await killAllST();
        await cleanST();
    });

    it("overriding functions tests", async () => {
        const connectionURI = await startST();
        let user = undefined;
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
                AnomalyDetection.init({
                    mode: "BLOCK_ACCESS",
                    override: {
                        functions: (oI) => {
                            return {
                                ...oI,
                                checkAnomaly: async (_) => {
                                    return {
                                        status: "ANOMALY_DETECTED",
                                    };
                                },
                            };
                        },
                    },
                }),
            ],
        });

        const app = express().use(middleware(), errorHandler());

        let response = await signUPRequest(app, "random@gmail.com", "validpass123");
        assert.equal(JSON.parse(response.text).status, "SIGN_UP_NOT_ALLOWED");
        assert.equal(response.status, 200);

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

        assert.equal(JSON.parse(signInResponse.text).status, "SIGN_IN_NOT_ALLOWED");
    });
});
