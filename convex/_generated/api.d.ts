/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admins from "../admins.js";
import type * as alerts from "../alerts.js";
import type * as crons from "../crons.js";
import type * as demoRequests from "../demoRequests.js";
import type * as feedback from "../feedback.js";
import type * as inbox from "../inbox.js";
import type * as ingest from "../ingest.js";
import type * as lib_classify from "../lib/classify.js";
import type * as lib_editorAuth from "../lib/editorAuth.js";
import type * as lib_rss from "../lib/rss.js";
import type * as lib_taxonomy from "../lib/taxonomy.js";
import type * as lib_text from "../lib/text.js";
import type * as lib_towns from "../lib/towns.js";
import type * as nodes from "../nodes.js";
import type * as notifications from "../notifications.js";
import type * as projectLog from "../projectLog.js";
import type * as roadmapIdeas from "../roadmapIdeas.js";
import type * as seedSources from "../seedSources.js";
import type * as sources from "../sources.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admins: typeof admins;
  alerts: typeof alerts;
  crons: typeof crons;
  demoRequests: typeof demoRequests;
  feedback: typeof feedback;
  inbox: typeof inbox;
  ingest: typeof ingest;
  "lib/classify": typeof lib_classify;
  "lib/editorAuth": typeof lib_editorAuth;
  "lib/rss": typeof lib_rss;
  "lib/taxonomy": typeof lib_taxonomy;
  "lib/text": typeof lib_text;
  "lib/towns": typeof lib_towns;
  nodes: typeof nodes;
  notifications: typeof notifications;
  projectLog: typeof projectLog;
  roadmapIdeas: typeof roadmapIdeas;
  seedSources: typeof seedSources;
  sources: typeof sources;
  waitlist: typeof waitlist;
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
