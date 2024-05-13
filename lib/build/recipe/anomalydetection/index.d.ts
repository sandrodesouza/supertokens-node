// @ts-nocheck
import Recipe from "./recipe";
import { APIInterface, APIOptions, RecipeInterface } from "./types";
export default class Wrapper {
    static init: typeof Recipe.init;
    static checkAnomaly(
        input: Parameters<RecipeInterface["checkAnomaly"]>[0]
    ): Promise<
        | {
              status: "OK";
          }
        | {
              status: "ANOMALY_DETECTED";
          }
    >;
}
export declare let init: typeof Recipe.init;
export declare let checkAnomaly: typeof Wrapper.checkAnomaly;
export type { APIInterface, APIOptions, RecipeInterface };
