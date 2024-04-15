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
const express = require("express");
const request = require("supertest");
let { middleware, errorHandler, wrapRequest } = require("../../framework/express");

describe(`getClientIp: ${printPath("[test/anomaly-detection/getClientIp.test.js]")}`, function () {
    beforeEach(async function () {
        await killAllST();
        await setupST();
        ProcessState.getInstance().reset();
    });

    after(async function () {
        await killAllST();
        await cleanST();
    });

    // test express
    describe("express", function () {
        const runs = [
            { header: "x-client-ip" },
            { header: "x-forwarded-for" },
            { header: "cf-connecting-ip" },
            { header: "do-connecting-ip" },
            { header: "fastly-client-ip" },
            { header: "true-client-ip" },
            { header: "x-real-ip" },
            { header: "x-cluster-client-ip" },
            { header: "x-forwarded" },
            { header: "forwarded-for" },
            { header: "forwarded" },
            { header: "x-appengine-user-ip" },
            { header: "Cf-Pseudo-IPv4" },
        ];
        runs.forEach(function (run) {
            it("it should get the client ip from request header " + run.header, async function () {
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

                const anomalydetection = AnomalyDetectionRecipe.getInstanceOrThrowError();
                const getIp = anomalydetection.recipeInterfaceImpl.getIpAddressFromRequest;

                const app = express().use(middleware(), errorHandler());
                app.use(function (req, res) {
                    res.end(getIp({ request: wrapRequest(req) }));
                });

                let response = await new Promise((resolve) =>
                    request(app)
                        .get("/")
                        .set(run.header, "59.195.114.48")
                        .expect(200)
                        .end((err, res) => {
                            if (err) {
                                resolve(undefined);
                            } else {
                                resolve(res);
                            }
                        })
                );
                assert.strictEqual(response.text, "59.195.114.48");
            });
        });
    });
});
