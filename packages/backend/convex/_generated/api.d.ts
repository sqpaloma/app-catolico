/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as answers from "../answers.js";
import type * as asaas from "../asaas.js";
import type * as directorships from "../directorships.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as invoices from "../invoices.js";
import type * as orders from "../orders.js";
import type * as posts from "../posts.js";
import type * as privateData from "../privateData.js";
import type * as questions from "../questions.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  answers: typeof answers;
  asaas: typeof asaas;
  directorships: typeof directorships;
  healthCheck: typeof healthCheck;
  http: typeof http;
  invoices: typeof invoices;
  orders: typeof orders;
  posts: typeof posts;
  privateData: typeof privateData;
  questions: typeof questions;
  seed: typeof seed;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
