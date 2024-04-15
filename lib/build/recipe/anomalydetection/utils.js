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
exports.getIpAddressFromRequest = exports.getDeviceHeadersFromRequest = exports.validateAndNormaliseUserInput = void 0;
const normalisedURLDomain_1 = __importDefault(require("../../normalisedURLDomain"));
const normalisedURLPath_1 = __importDefault(require("../../normalisedURLPath"));
const getClientIp_1 = require("./getClientIp");
function validateAndNormaliseUserInput(_, __, config) {
    var _a, _b, _c;
    let override = Object.assign(
        {
            functions: (originalImplementation) => originalImplementation,
            apis: (originalImplementation) => originalImplementation,
        },
        config === null || config === void 0 ? void 0 : config.override
    );
    return {
        anomalyBasePath: new normalisedURLPath_1.default(
            (_a = config === null || config === void 0 ? void 0 : config.anomalyBasePath) !== null && _a !== void 0
                ? _a
                : "/api"
        ),
        anomalyDomain: new normalisedURLDomain_1.default(
            (_b = config === null || config === void 0 ? void 0 : config.anomalyDomain) !== null && _b !== void 0
                ? _b
                : "http://localhost:3002"
        ),
        mode:
            (_c = config === null || config === void 0 ? void 0 : config.mode) !== null && _c !== void 0
                ? _c
                : "REPORT_ONLY",
        override,
    };
}
exports.validateAndNormaliseUserInput = validateAndNormaliseUserInput;
function getDeviceHeadersFromRequest(req) {
    return {
        accept: req.getHeaderValue("accept"),
        language: req.getHeaderValue("accept-language"),
        encoding: req.getHeaderValue("accept-encoding"),
        userAgent: req.getHeaderValue("user-agent"),
    };
}
exports.getDeviceHeadersFromRequest = getDeviceHeadersFromRequest;
function getIpAddressFromRequest(req) {
    return getClientIp_1.getClientIp(req);
}
exports.getIpAddressFromRequest = getIpAddressFromRequest;
