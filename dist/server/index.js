globalThis.__VINEXT_LAZY_CHUNKS__ = ["assets/page-BgJZabB2.js","assets/page-TG_0yaiq.js","assets/layout-segment-context-BB0IixYO.js"];
import * as __viteRscAsyncHooks from "node:async_hooks";
import { AsyncLocalStorage as AsyncLocalStorage$1 } from "node:async_hooks";
import assetsManifest from "./__vite_rsc_assets_manifest.js";
import "node:fs";
import "node:path";
import "process";
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/http-error-responses.js
/**
* Build a 400 Bad Request plain-text response.
*
* Used for malformed percent-encoding, invalid HTTP methods (where Next.js
* returns 400), and other request-shape validation failures.
*/
function badRequestResponse(init) {
	return new Response("Bad Request", {
		status: 400,
		headers: init?.headers
	});
}
/**
* Build a 403 Forbidden plain-text response.
*
* Used by CSRF origin validation and dev-server origin checks.
*/
function forbiddenResponse() {
	return new Response("Forbidden", {
		status: 403,
		headers: { "Content-Type": "text/plain" }
	});
}
/**
* Build a 404 Not Found plain-text response.
*
* The `headers` option lets call sites merge middleware response headers into
* the 404, matching the pattern used by `app-rsc-handler` after a route match
* fails but middleware has already contributed headers.
*/
function notFoundResponse(init) {
	return new Response("Not Found", {
		status: 404,
		headers: init?.headers
	});
}
/**
* Build a 405 Method Not Allowed plain-text response with the `Allow` header set.
*
* `allowedMethods` is rendered as the comma-separated `Allow` header value.
* Existing headers (e.g. middleware response headers) can be merged via `init.headers`;
* the `Allow` header takes precedence and overwrites any colliding entry.
*/
function methodNotAllowedResponse(allowedMethods, init) {
	const headers = new Headers(init?.headers);
	headers.set("Allow", allowedMethods);
	return new Response("Method Not Allowed", {
		status: 405,
		headers
	});
}
/**
* Build a 413 Payload Too Large plain-text response.
*
* Used by server action body-size enforcement.
*/
function payloadTooLargeResponse() {
	return new Response("Payload Too Large", { status: 413 });
}
/**
* Build a 500 Internal Server Error plain-text response.
*
* The `message` argument lets dev-mode handlers surface failure details while
* production paths fall back to the canonical body. Pass `undefined` (or omit)
* to use the canonical "Internal Server Error" body.
*/
function internalServerErrorResponse(message, init) {
	return new Response(message ?? "Internal Server Error", {
		status: 500,
		headers: init?.headers
	});
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/image-optimization.js
/**
* Next.js default device sizes and image sizes.
* These are the allowed widths for image optimization when no custom
* config is provided. Matches Next.js defaults exactly.
*/
var DEFAULT_DEVICE_SIZES = [
	640,
	750,
	828,
	1080,
	1200,
	1920,
	2048,
	3840
];
var DEFAULT_IMAGE_SIZES = [
	16,
	32,
	48,
	64,
	96,
	128,
	256,
	384
];
/**
* Absolute maximum image width. Even if custom deviceSizes/imageSizes are
* configured, widths above this are always rejected. This prevents resource
* exhaustion from absurdly large resize requests.
*/
var ABSOLUTE_MAX_WIDTH = 3840;
/**
* Parse and validate image optimization query parameters.
* Returns null if the request is malformed.
*
* When `allowedWidths` is provided, the width must be 0 (no resize) or
* exactly match one of the allowed values. This matches Next.js behavior
* where only configured deviceSizes and imageSizes are accepted.
*
* When `allowedWidths` is not provided, any width from 0 to ABSOLUTE_MAX_WIDTH
* is accepted (backwards-compatible fallback).
*/
function parseImageParams(url, allowedWidths) {
	const imageUrl = url.searchParams.get("url");
	if (!imageUrl) return null;
	const w = parseInt(url.searchParams.get("w") || "0", 10);
	const q = parseInt(url.searchParams.get("q") || "75", 10);
	if (Number.isNaN(w) || w < 0) return null;
	if (w > ABSOLUTE_MAX_WIDTH) return null;
	if (allowedWidths && w !== 0 && !allowedWidths.includes(w)) return null;
	if (Number.isNaN(q) || q < 1 || q > 100) return null;
	const normalizedUrl = imageUrl.replaceAll("\\", "/");
	if (!normalizedUrl.startsWith("/") || normalizedUrl.startsWith("//")) return null;
	try {
		const base = "https://localhost";
		if (new URL(normalizedUrl, base).origin !== base) return null;
	} catch {
		return null;
	}
	return {
		imageUrl: normalizedUrl,
		width: w,
		quality: q
	};
}
/**
* Negotiate the best output format based on the Accept header.
* Returns an IANA media type.
*/
function negotiateImageFormat(acceptHeader) {
	if (!acceptHeader) return "image/jpeg";
	if (acceptHeader.includes("image/avif")) return "image/avif";
	if (acceptHeader.includes("image/webp")) return "image/webp";
	return "image/jpeg";
}
/**
* Standard Cache-Control header for optimized images.
* Optimized images are immutable because the URL encodes the transform params.
*/
var IMAGE_CACHE_CONTROL = "public, max-age=31536000, immutable";
/**
* Allowlist of Content-Types that are safe to serve from the image endpoint.
* SVG is intentionally excluded — it can contain embedded JavaScript and is
* essentially an XML document, not a safe raster image format.
*/
var SAFE_IMAGE_CONTENT_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/avif",
	"image/x-icon",
	"image/vnd.microsoft.icon",
	"image/bmp",
	"image/tiff"
]);
/**
* Check if a Content-Type header value is a safe image type.
* Returns false for SVG (unless dangerouslyAllowSVG is true), HTML, or any non-image type.
*/
function isSafeImageContentType(contentType, dangerouslyAllowSVG = false) {
	if (!contentType) return false;
	const mediaType = contentType.split(";")[0].trim().toLowerCase();
	if (SAFE_IMAGE_CONTENT_TYPES.has(mediaType)) return true;
	if (dangerouslyAllowSVG && mediaType === "image/svg+xml") return true;
	return false;
}
/**
* Apply security headers to an image optimization response.
* These headers are set on every response from the image endpoint,
* regardless of whether the image was transformed or served as-is.
* When an ImageConfig is provided, uses its values for CSP and Content-Disposition.
*/
function setImageSecurityHeaders(headers, config) {
	headers.set("Content-Security-Policy", config?.contentSecurityPolicy ?? "script-src 'none'; frame-src 'none'; sandbox;");
	headers.set("X-Content-Type-Options", "nosniff");
	headers.set("Content-Disposition", config?.contentDispositionType === "attachment" ? "attachment" : "inline");
}
function createPassthroughImageResponse(source, config) {
	const headers = new Headers(source.headers);
	headers.set("Cache-Control", IMAGE_CACHE_CONTROL);
	headers.set("Vary", "Accept");
	setImageSecurityHeaders(headers, config);
	return new Response(source.body, {
		status: 200,
		headers
	});
}
/**
* Handle image optimization requests.
*
* Parses and validates the request, fetches the source image via the provided
* handlers, optionally transforms it, and returns the response with appropriate
* cache headers.
*/
async function handleImageOptimization(request, handlers, allowedWidths, imageConfig) {
	const params = parseImageParams(new URL(request.url), allowedWidths);
	if (!params) return badRequestResponse();
	const { imageUrl, width, quality } = params;
	const source = await handlers.fetchAsset(imageUrl, request);
	if (!source.ok || !source.body) return new Response("Image not found", { status: 404 });
	const format = negotiateImageFormat(request.headers.get("Accept"));
	const sourceContentType = source.headers.get("Content-Type");
	if (!isSafeImageContentType(sourceContentType, imageConfig?.dangerouslyAllowSVG)) return new Response("The requested resource is not an allowed image type", { status: 400 });
	if (sourceContentType?.split(";")[0].trim().toLowerCase() === "image/svg+xml") return createPassthroughImageResponse(source, imageConfig);
	if (handlers.transformImage) try {
		const transformed = await handlers.transformImage(source.body, {
			width,
			format,
			quality
		});
		const headers = new Headers(transformed.headers);
		headers.set("Cache-Control", IMAGE_CACHE_CONTROL);
		headers.set("Vary", "Accept");
		setImageSecurityHeaders(headers, imageConfig);
		if (!isSafeImageContentType(headers.get("Content-Type"), imageConfig?.dangerouslyAllowSVG)) headers.set("Content-Type", format);
		return new Response(transformed.body, {
			status: 200,
			headers
		});
	} catch (e) {
		console.error("[vinext] Image optimization error:", e);
	}
	try {
		return createPassthroughImageResponse(source, imageConfig);
	} catch (e) {
		console.error("[vinext] Image fallback error, refetching source image:", e);
		const refetchedSource = await handlers.fetchAsset(imageUrl, request);
		if (!refetchedSource.ok || !refetchedSource.body) return new Response("Image not found", { status: 404 });
		if (!isSafeImageContentType(refetchedSource.headers.get("Content-Type"), imageConfig?.dangerouslyAllowSVG)) return new Response("The requested resource is not an allowed image type", { status: 400 });
		return createPassthroughImageResponse(refetchedSource, imageConfig);
	}
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/internal/als-registry.js
/**
* Shared helper for registering AsyncLocalStorage instances on `globalThis`
* via `Symbol.for(...)` so that they survive multiple module instances.
*
* Why this helper exists
* ----------------------
* Vite's multi-environment setup (RSC / SSR / client) and HMR can load a
* single source module under several different specifiers, producing more
* than one module instance at runtime. If each instance kept its own
* module-local `new AsyncLocalStorage()`, request-scoped state would silently
* fork across instances — `headers()` in one environment wouldn't see what
* `connection()` registered in another, concurrent requests would stomp each
* other, etc.
*
* The fix every shim was applying inline:
*
*   const _ALS_KEY = Symbol.for("vinext.foo.als");
*   const _g = globalThis as unknown as Record<PropertyKey, unknown>;
*   const _als = (_g[_ALS_KEY] ??=
*     new AsyncLocalStorage<T>()) as AsyncLocalStorage<T>;
*
* This helper packages that pattern.
*
* Cross-bundle singleton property — preserved
* -------------------------------------------
* - `Symbol.for(key)` consults the global symbol registry and returns the
*   same symbol regardless of which module instance calls it.
* - `globalThis[sym]` is a single slot shared by every module instance.
* - `??=` only assigns when the slot is empty, so the first caller wins and
*   every subsequent caller (in any module instance) reads the same ALS.
*
* The helper module itself never holds the ALS by reference — it always
* round-trips through `globalThis`. So even if this helper file is itself
* loaded under multiple module instances, every copy still hands back the
* one true ALS for a given key.
*/
var _g$8 = globalThis;
/**
* Get (or lazily create) the AsyncLocalStorage registered on `globalThis`
* under `Symbol.for(key)`. Multiple callers — including callers in different
* module instances — that pass the same `key` receive the same ALS instance.
*
* @param key - String key fed to `Symbol.for(...)`. By convention vinext
*   shims use a dotted namespace such as `"vinext.cache.als"`.
*/
function getOrCreateAls(key) {
	const sym = Symbol.for(key);
	return _g$8[sym] ??= new AsyncLocalStorage$1();
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/unified-request-context.js
var _REQUEST_CONTEXT_ALS_KEY = Symbol.for("vinext.requestContext.als");
var _g$7 = globalThis;
var _als$4 = getOrCreateAls("vinext.unifiedRequestContext.als");
function _getInheritedExecutionContext() {
	const unifiedStore = _als$4.getStore();
	if (unifiedStore) return unifiedStore.executionContext;
	return _g$7[_REQUEST_CONTEXT_ALS_KEY]?.getStore() ?? null;
}
/**
* Create a fresh `UnifiedRequestContext` with defaults for all fields.
* Pass partial overrides for the fields you need to pre-populate.
*/
function createRequestContext(opts) {
	return {
		headersContext: null,
		actionRevalidationKind: 0,
		dynamicUsageDetected: false,
		invalidDynamicUsageError: null,
		pendingSetCookies: [],
		draftModeCookieHeader: null,
		phase: "render",
		i18nContext: null,
		serverContext: null,
		serverInsertedHTMLCallbacks: [],
		requestScopedCacheLife: null,
		unstableCacheRevalidation: "foreground",
		_privateCache: null,
		currentRequestTags: [],
		currentFetchSoftTags: [],
		currentFetchCacheMode: null,
		isFetchDedupeActive: false,
		currentFetchDedupeEntries: /* @__PURE__ */ new Map(),
		executionContext: _getInheritedExecutionContext(),
		requestCache: /* @__PURE__ */ new WeakMap(),
		ssrContext: null,
		ssrHeadChildren: [],
		rootParams: null,
		...opts
	};
}
function runWithRequestContext(ctx, fn) {
	return _als$4.run(ctx, fn);
}
function runWithUnifiedStateMutation(mutate, fn) {
	const parentCtx = _als$4.getStore();
	if (!parentCtx) return fn();
	const childCtx = { ...parentCtx };
	mutate(childCtx);
	return _als$4.run(childCtx, fn);
}
/**
* Get the current unified request context.
* Returns the ALS store when inside a `runWithRequestContext()` scope,
* or a fresh detached context otherwise. Unlike the legacy per-shim fallback
* singletons, this detached value is ephemeral — mutations do not persist
* across calls. This is intentional to prevent state leakage outside request
* scopes.
*
* Only direct callers observe this detached fallback. Shim `_getState()`
* helpers should continue to gate on `isInsideUnifiedScope()` and fall back
* to their standalone ALS/fallback singletons outside the unified scope.
* If called inside a standalone `runWithExecutionContext()` scope, the
* detached context still reflects that inherited `executionContext`.
*/
function getRequestContext() {
	return _als$4.getStore() ?? createRequestContext();
}
/**
* Check whether the current execution is inside a `runWithRequestContext()` scope.
* Shim modules use this to decide whether to read from the unified store
* or fall back to their own standalone ALS.
*/
function isInsideUnifiedScope() {
	return _als$4.getStore() != null;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/request-context.js
/**
* Request ExecutionContext — AsyncLocalStorage-backed accessor.
*
* Makes the Cloudflare Workers `ExecutionContext` (which provides
* `waitUntil`) available to any code on the call stack during a request
* without requiring it to be threaded through every function signature.
*
* Usage:
*
*   // In the worker entry, wrap the handler:
*   import { runWithExecutionContext } from "vinext/shims/request-context";
*   export default {
*     fetch(request, env, ctx) {
*       return runWithExecutionContext(ctx, () => handler.fetch(request, env, ctx));
*     }
*   };
*
*   // Anywhere downstream:
*   import { getRequestExecutionContext } from "vinext/shims/request-context";
*   const ctx = getRequestExecutionContext(); // null on Node.js dev
*   ctx?.waitUntil(somePromise);
*/
var _als$3 = getOrCreateAls("vinext.requestContext.als");
function runWithExecutionContext(ctx, fn) {
	if (isInsideUnifiedScope()) return runWithUnifiedStateMutation((uCtx) => {
		uCtx.executionContext = ctx;
	}, fn);
	return _als$3.run(ctx, fn);
}
/**
* Get the `ExecutionContext` for the current request, or `null` when called
* outside a `runWithExecutionContext()` scope (e.g. on Node.js dev server).
*
* Use `ctx?.waitUntil(promise)` to schedule background work that must
* complete before the Worker isolate is torn down.
*/
function getRequestExecutionContext() {
	if (isInsideUnifiedScope()) return getRequestContext().executionContext;
	return _als$3.getStore() ?? null;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/utils/base-path.js
/**
* Shared basePath helpers.
*
* Next.js only treats a pathname as being under basePath when it is an exact
* match ("/app") or starts with the basePath followed by a path separator
* ("/app/..."). Prefix-only matches like "/application" must be left intact.
*/
/**
* Check whether a pathname is inside the configured basePath.
*/
function hasBasePath(pathname, basePath) {
	if (!basePath) return false;
	return pathname === basePath || pathname.startsWith(basePath + "/");
}
/**
* Strip the basePath prefix from a pathname when it matches on a segment
* boundary. Returns the original pathname when it is outside the basePath.
*/
function stripBasePath(pathname, basePath) {
	if (!hasBasePath(pathname, basePath)) return pathname;
	return pathname.slice(basePath.length) || "/";
}
/**
* Remove trailing slashes from a pathname while preserving the root "/".
* Collapses any number of trailing slashes ("/a//" → "/a"). Used by the
* trailing-slash redirect path and route pattern normalization.
*/
function removeTrailingSlash(pathname) {
	if (pathname === "/") return "/";
	let end = pathname.length;
	while (end > 0 && pathname.charCodeAt(end - 1) === 47) end--;
	return end === 0 ? "/" : pathname.slice(0, end);
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/headers.js
/**
* Internal HTTP header name constants used throughout vinext.
*
* Centralizes all custom header names so they are defined once and referenced
* everywhere via imports. Keeping them in one module prevents typos, makes
* rename-refactors trivial, and lets grep find every consumer instantly.
*
* Standard HTTP headers (Content-Type, Cache-Control, etc.) are intentionally
* omitted — only vinext-internal and Next.js-protocol headers belong here.
*/
/** ISR / page cache state indicator: "HIT" | "MISS" | "STALE" | "STATIC". */
var VINEXT_CACHE_HEADER = "X-Vinext-Cache";
/** Static file signal — value is URL-encoded pathname. */
var VINEXT_STATIC_FILE_HEADER = "x-vinext-static-file";
/** Serialized middleware context (JSON) forwarded from dev server to RSC entry. */
var VINEXT_MW_CTX_HEADER = "x-vinext-mw-ctx";
/** Timing metrics: `handlerStart,compileMs,renderMs`. */
var VINEXT_TIMING_HEADER = "x-vinext-timing";
/** Build-time prerender authentication secret. */
var VINEXT_PRERENDER_SECRET_HEADER = "x-vinext-prerender-secret";
/** URL-encoded JSON route params carried on RSC responses. */
var VINEXT_PARAMS_HEADER = "X-Vinext-Params";
/** Deduplicated, sorted list of mounted layout slots for cache keying. */
var VINEXT_MOUNTED_SLOTS_HEADER = "X-Vinext-Mounted-Slots";
/** Route interception context for parallel/intercepting routes. */
var VINEXT_INTERCEPTION_CONTEXT_HEADER = "X-Vinext-Interception-Context";
/** RSC render mode (e.g. "navigation", "prefetch"). */
var VINEXT_RSC_RENDER_MODE_HEADER = "X-Vinext-Rsc-Render-Mode";
/** Next.js action-not-found indicator (value "1"). */
var NEXTJS_ACTION_NOT_FOUND_HEADER = "x-nextjs-action-not-found";
/** Indicates revalidation occurred — value is JSON kind (1 = path/tag, 2 = dynamic-only). */
var ACTION_REVALIDATED_HEADER = "x-action-revalidated";
/** Redirect URL from a Server Action. */
var ACTION_REDIRECT_HEADER = "x-action-redirect";
/** Redirect type from a Server Action ("push" | "replace"). */
var ACTION_REDIRECT_TYPE_HEADER = "x-action-redirect-type";
/** HTTP status for a Server Action redirect (e.g. "308"). */
var ACTION_REDIRECT_STATUS_HEADER = "x-action-redirect-status";
/** Prefix for forwarded request headers (e.g. `x-middleware-request-cookie`). */
var MIDDLEWARE_REQUEST_HEADER_PREFIX = "x-middleware-request-";
/** Comma-separated list of header names that middleware wants to override. */
var MIDDLEWARE_OVERRIDE_HEADERS = "x-middleware-override-headers";
/** Carries cookies set by middleware for same-render reads. */
var MIDDLEWARE_SET_COOKIE_HEADER = "x-middleware-set-cookie";
/** Signal from `NextResponse.next()` — value "1" means "continue to next handler". */
var MIDDLEWARE_NEXT_HEADER = "x-middleware-next";
/** Rewrite destination URL set by `NextResponse.rewrite()`. */
var MIDDLEWARE_REWRITE_HEADER = "x-middleware-rewrite";
/** Redirect URL set by middleware. */
var MIDDLEWARE_REDIRECT_HEADER = "x-middleware-redirect";
/** Skip-middleware signal. */
var MIDDLEWARE_SKIP_HEADER = "x-middleware-skip";
var NEXT_ROUTER_STATE_TREE_HEADER = "Next-Router-State-Tree";
var NEXT_ROUTER_PREFETCH_HEADER = "Next-Router-Prefetch";
var NEXT_ROUTER_SEGMENT_PREFETCH_HEADER = "Next-Router-Segment-Prefetch";
var NEXT_URL_HEADER = "Next-Url";
/** Lowercase flight header variants used in middleware forwarding. */
var FLIGHT_HEADERS = [
	"rsc",
	"next-router-state-tree",
	"next-router-prefetch",
	"next-hmr-refresh",
	"next-router-segment-prefetch"
];
/**
* Headers that must be stripped from external requests before any handler
* processes them. An attacker could forge these to influence routing or
* impersonate internal data fetches.
*
* Ported from Next.js `INTERNAL_HEADERS`:
* https://github.com/vercel/next.js/blob/canary/packages/next/src/server/lib/server-ipc/utils.ts
*/
var INTERNAL_HEADERS = [
	MIDDLEWARE_REWRITE_HEADER,
	MIDDLEWARE_REDIRECT_HEADER,
	MIDDLEWARE_SET_COOKIE_HEADER,
	MIDDLEWARE_SKIP_HEADER,
	MIDDLEWARE_OVERRIDE_HEADERS,
	MIDDLEWARE_NEXT_HEADER,
	"x-now-route-matches",
	"x-matched-path",
	"x-nextjs-data",
	"x-next-resume-state-length"
];
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/middleware-request-headers.js
var CREDENTIAL_REQUEST_HEADERS = ["authorization", "cookie"];
function getMiddlewareHeaderValue(source, key) {
	if (source instanceof Headers) return source.get(key);
	const value = source[key];
	if (value === void 0) return null;
	return Array.isArray(value) ? value[0] ?? null : value;
}
function getOverrideHeaderNames(source) {
	const rawValue = getMiddlewareHeaderValue(source, MIDDLEWARE_OVERRIDE_HEADERS);
	if (rawValue === null) return null;
	return rawValue.split(",").map((key) => key.trim()).filter(Boolean);
}
function getForwardedRequestHeaders(source) {
	const forwardedHeaders = /* @__PURE__ */ new Map();
	if (source instanceof Headers) {
		for (const [key, value] of source.entries()) if (key.startsWith("x-middleware-request-")) forwardedHeaders.set(key.slice(MIDDLEWARE_REQUEST_HEADER_PREFIX.length), value);
		return forwardedHeaders;
	}
	for (const [key, value] of Object.entries(source)) {
		if (!key.startsWith("x-middleware-request-")) continue;
		const normalizedValue = Array.isArray(value) ? value[0] ?? "" : value;
		forwardedHeaders.set(key.slice(MIDDLEWARE_REQUEST_HEADER_PREFIX.length), normalizedValue);
	}
	return forwardedHeaders;
}
function cloneHeaders(source) {
	const cloned = new Headers();
	for (const [key, value] of source.entries()) cloned.append(key, value);
	return cloned;
}
function encodeMiddlewareRequestHeaders(targetHeaders, requestHeaders) {
	const overrideHeaderNames = [...requestHeaders.keys()];
	targetHeaders.set(MIDDLEWARE_OVERRIDE_HEADERS, overrideHeaderNames.join(","));
	for (const [key, value] of requestHeaders.entries()) targetHeaders.set(`${MIDDLEWARE_REQUEST_HEADER_PREFIX}${key}`, value);
}
function buildRequestHeadersFromMiddlewareResponse(baseHeaders, middlewareHeaders, options = {}) {
	const overrideHeaderNames = getOverrideHeaderNames(middlewareHeaders);
	const forwardedHeaders = getForwardedRequestHeaders(middlewareHeaders);
	if (overrideHeaderNames === null && forwardedHeaders.size === 0) return null;
	const nextHeaders = overrideHeaderNames === null ? cloneHeaders(baseHeaders) : new Headers();
	if (overrideHeaderNames === null) {
		for (const [key, value] of forwardedHeaders) nextHeaders.set(key, value);
		return nextHeaders;
	}
	if (options.preserveCredentialHeaders) {
		const overrideHeaderNameSet = new Set(overrideHeaderNames);
		for (const key of CREDENTIAL_REQUEST_HEADERS) {
			if (overrideHeaderNameSet.has(key)) continue;
			const value = baseHeaders.get(key);
			if (value !== null) nextHeaders.set(key, value);
		}
	}
	for (const key of overrideHeaderNames) {
		const value = forwardedHeaders.get(key);
		if (value !== void 0) nextHeaders.set(key, value);
	}
	return nextHeaders;
}
function shouldKeepMiddlewareHeader(key) {
	return key === "x-middleware-override-headers" || key === "x-middleware-set-cookie" || key.startsWith("x-middleware-request-");
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/config/config-matchers.js
/**
* Cache for compiled regex patterns in matchConfigPattern.
*
* Redirect/rewrite patterns are static — they come from next.config.js and
* never change at runtime. Without caching, every request that hits the regex
* branch re-runs the full tokeniser walk + isSafeRegex + new RegExp() for
* every rule in the array. On apps with many locale-prefixed rules (which all
* contain `(` and therefore enter the regex branch) this dominated profiling
* at ~2.4 seconds of CPU self-time.
*
* Value is `null` when safeRegExp rejected the pattern (ReDoS risk), so we
* skip it on subsequent requests too without re-running the scanner.
*/
var _compiledPatternCache = /* @__PURE__ */ new Map();
/**
* Cache for compiled header source regexes in matchHeaders.
*
* Each NextHeader rule has a `source` that is run through escapeHeaderSource()
* then safeRegExp() to produce a RegExp. Both are pure functions of the source
* string and the result never changes. Without caching, every request
* re-runs the full escapeHeaderSource tokeniser + isSafeRegex scan + new RegExp()
* for every header rule.
*
* Value is `null` when safeRegExp rejected the pattern (ReDoS risk).
*/
var _compiledHeaderSourceCache = /* @__PURE__ */ new Map();
/**
* Cache for compiled has/missing condition value regexes in checkSingleCondition.
*
* Each has/missing condition may carry a `value` string that is passed directly
* to safeRegExp() for matching against header/cookie/query/host values. The
* condition objects are static (from next.config.js) so the compiled RegExp
* never changes. Without caching, safeRegExp() is called on every request for
* every condition on every rule.
*
* Value is `null` when safeRegExp rejected the pattern, or `false` when the
* value string was undefined (no regex needed — use exact string comparison).
*/
var _compiledConditionCache = /* @__PURE__ */ new Map();
/**
* Cache for destination substitution regexes in substituteDestinationParams.
*
* The regex depends only on the set of param keys captured from the matched
* source pattern. Caching by sorted key list avoids recompiling a new RegExp
* for repeated redirect/rewrite calls that use the same param shape.
*/
var _compiledDestinationParamCache = /* @__PURE__ */ new Map();
/**
* Generic helper for the regex compilation caches above.
*
* Each cache stores the compiled artifact (or `null` when safeRegExp rejected
* the pattern) the first time a key is seen, and reuses it forever. The
* `undefined` sentinel distinguishes "not yet seen" from "seen and rejected"
* so we never re-run isSafeRegex on the same input.
*
* Keep the security path intact: `compile()` is responsible for calling
* safeRegExp(); this helper only handles caching.
*/
function getCachedRegex(cache, key, compile) {
	let value = cache.get(key);
	if (value === void 0) {
		value = compile();
		cache.set(key, value);
	}
	return value;
}
/**
* Redirect index for O(1) locale-static rule lookup.
*
* Many Next.js apps generate 50-100 redirect rules of the form:
*   /:locale(en|es|fr|...)?/some-static-path  →  /some-destination
*
* The compiled regex for each is like:
*   ^/(en|es|fr|...)?/some-static-path$
*
* When no redirect matches (the common case for ordinary page loads),
* matchRedirect previously ran exec() on every one of those regexes —
* ~2ms per call, ~2992ms total self-time in profiles.
*
* The index splits rules into two buckets:
*
*   localeStatic — rules whose source is exactly /:paramName(alt1|alt2|...)?/suffix
*     where `suffix` is a static path with no further params or regex groups.
*     These are indexed in a Map<suffix, entry[]> for O(1) lookup after a
*     single fast strip of the optional locale prefix.
*
*   linear — all other rules. Matched with the original O(n) loop.
*
* The index is stored in a WeakMap keyed by the redirects array so it is
* computed once per config load and GC'd when the array is no longer live.
*
* ## Ordering invariant
*
* Redirect rules must be evaluated in their original order (first match wins).
* Each locale-static entry stores its `originalIndex` so that, when a
* locale-static fast-path match is found, any linear rules that appear earlier
* in the array are still checked first.
*/
/** Matches `/:param(alternation)?/static/suffix` — the locale-static pattern. */
var _LOCALE_STATIC_RE = /^\/:[\w-]+\(([^)]+)\)\?\/([a-zA-Z0-9_~.%@!$&'*+,;=:/-]+)$/;
var _redirectIndexCache = /* @__PURE__ */ new WeakMap();
/**
* Build (or retrieve from cache) the redirect index for a given redirects array.
*
* Called once per config load from matchRedirect. The WeakMap ensures the index
* is recomputed if the config is reloaded (new array reference) and GC'd when
* the array is collected.
*/
function _getRedirectIndex(redirects) {
	let index = _redirectIndexCache.get(redirects);
	if (index !== void 0) return index;
	const localeStatic = /* @__PURE__ */ new Map();
	const linear = [];
	for (let i = 0; i < redirects.length; i++) {
		const redirect = redirects[i];
		const m = _LOCALE_STATIC_RE.exec(redirect.source);
		if (m) {
			const paramName = redirect.source.slice(2, redirect.source.indexOf("("));
			const alternation = m[1];
			const suffix = "/" + m[2];
			const altRe = safeRegExp("^(?:" + alternation + ")$");
			if (!altRe) {
				linear.push([i, redirect]);
				continue;
			}
			const entry = {
				paramName,
				altRe,
				redirect,
				originalIndex: i
			};
			const bucket = localeStatic.get(suffix);
			if (bucket) bucket.push(entry);
			else localeStatic.set(suffix, [entry]);
		} else linear.push([i, redirect]);
	}
	index = {
		localeStatic,
		linear
	};
	_redirectIndexCache.set(redirects, index);
	return index;
}
/** Hop-by-hop headers that should not be forwarded through a proxy. */
var HOP_BY_HOP_HEADERS = new Set([
	"connection",
	"keep-alive",
	"proxy-authenticate",
	"proxy-authorization",
	"te",
	"trailers",
	"transfer-encoding",
	"upgrade"
]);
/**
* Request hop-by-hop headers to strip before proxying with fetch().
* Intentionally narrower than HOP_BY_HOP_HEADERS: external rewrite proxying
* still forwards proxy auth credentials, while response sanitization strips
* them before returning data to the client.
*/
var REQUEST_HOP_BY_HOP_HEADERS = new Set([
	"connection",
	"keep-alive",
	"te",
	"trailers",
	"transfer-encoding",
	"upgrade"
]);
function stripHopByHopRequestHeaders(headers) {
	const connectionTokens = (headers.get("connection") || "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
	for (const header of REQUEST_HOP_BY_HOP_HEADERS) headers.delete(header);
	for (const token of connectionTokens) headers.delete(token);
}
/**
* Detect regex patterns vulnerable to catastrophic backtracking (ReDoS).
*
* Uses a lightweight heuristic: scans the pattern string for nested quantifiers
* (a quantifier applied to a group that itself contains a quantifier). This
* catches the most common pathological patterns like `(a+)+`, `(.*)*`,
* `([^/]+)+`, `(a|a+)+` without needing a full regex parser.
*
* Returns true if the pattern appears safe, false if it's potentially dangerous.
*/
function isSafeRegex(pattern) {
	const quantifierAtDepth = [];
	let depth = 0;
	let i = 0;
	while (i < pattern.length) {
		const ch = pattern[i];
		if (ch === "\\") {
			i += 2;
			continue;
		}
		if (ch === "[") {
			i++;
			while (i < pattern.length && pattern[i] !== "]") {
				if (pattern[i] === "\\") i++;
				i++;
			}
			i++;
			continue;
		}
		if (ch === "(") {
			depth++;
			if (quantifierAtDepth.length <= depth) quantifierAtDepth.push(false);
			else quantifierAtDepth[depth] = false;
			i++;
			continue;
		}
		if (ch === ")") {
			const hadQuantifier = depth > 0 && quantifierAtDepth[depth];
			if (depth > 0) depth--;
			const next = pattern[i + 1];
			if (next === "+" || next === "*" || next === "{") {
				if (hadQuantifier) return false;
				if (depth >= 0 && depth < quantifierAtDepth.length) quantifierAtDepth[depth] = true;
			}
			i++;
			continue;
		}
		if (ch === "+" || ch === "*") {
			if (depth > 0) quantifierAtDepth[depth] = true;
			i++;
			continue;
		}
		if (ch === "?") {
			const prev = i > 0 ? pattern[i - 1] : "";
			if (prev !== "+" && prev !== "*" && prev !== "?" && prev !== "}") {
				if (depth > 0) quantifierAtDepth[depth] = true;
			}
			i++;
			continue;
		}
		if (ch === "{") {
			let j = i + 1;
			while (j < pattern.length && /[\d,]/.test(pattern[j])) j++;
			if (j < pattern.length && pattern[j] === "}" && j > i + 1) {
				if (depth > 0) quantifierAtDepth[depth] = true;
				i = j + 1;
				continue;
			}
		}
		i++;
	}
	return true;
}
/**
* Compile a regex pattern safely. Returns the compiled RegExp or null if the
* pattern is invalid or vulnerable to ReDoS.
*
* Logs a warning when a pattern is rejected so developers can fix their config.
*/
function safeRegExp(pattern, flags) {
	if (!isSafeRegex(pattern)) {
		console.warn(`[vinext] Ignoring potentially unsafe regex pattern (ReDoS risk): ${pattern}\n  Patterns with nested quantifiers (e.g. (a+)+) can cause catastrophic backtracking.\n  Simplify the pattern to avoid nested repetition.`);
		return null;
	}
	try {
		return new RegExp(pattern, flags);
	} catch {
		return null;
	}
}
/**
* Convert a Next.js header/rewrite/redirect source pattern into a regex string.
*
* Regex groups in the source (e.g. `(\d+)`) are extracted first, the remaining
* text is escaped/converted in a **single pass** (avoiding chained `.replace()`
* which CodeQL flags as incomplete sanitization), then groups are restored.
*/
function escapeHeaderSource(source) {
	const S = "";
	const groups = [];
	const withPlaceholders = source.replace(/\(([^)]+)\)/g, (_m, inner) => {
		groups.push(inner);
		return `${S}G${groups.length - 1}${S}`;
	});
	let result = "";
	const re = new RegExp(`${S}G(\\d+)${S}|:[\\w-]+|[.+?*]|[^.+?*:\\uE000]+`, "g");
	let m;
	while ((m = re.exec(withPlaceholders)) !== null) if (m[1] !== void 0) result += `(${groups[Number(m[1])]})`;
	else if (m[0].startsWith(":")) {
		const constraintMatch = withPlaceholders.slice(re.lastIndex).match(new RegExp(`^${S}G(\\d+)${S}`));
		if (constraintMatch) {
			re.lastIndex += constraintMatch[0].length;
			result += `(${groups[Number(constraintMatch[1])]})`;
		} else result += "[^/]+";
	} else switch (m[0]) {
		case ".":
			result += "\\.";
			break;
		case "+":
			result += "\\+";
			break;
		case "?":
			result += "\\?";
			break;
		case "*":
			result += ".*";
			break;
		default:
			result += m[0];
			break;
	}
	return result;
}
/**
* Parse a Cookie header string into a key-value record.
*/
function parseCookies(cookieHeader) {
	if (!cookieHeader) return {};
	const cookies = {};
	for (const part of cookieHeader.split(";")) {
		const eq = part.indexOf("=");
		if (eq === -1) continue;
		const key = part.slice(0, eq).trim();
		const value = part.slice(eq + 1).trim();
		if (key) cookies[key] = value;
	}
	return cookies;
}
/**
* Build a RequestContext from a Web Request object.
*/
function requestContextFromRequest(request) {
	const url = new URL(request.url);
	return {
		headers: request.headers,
		cookies: parseCookies(request.headers.get("cookie")),
		query: url.searchParams,
		host: normalizeHost(request.headers.get("host"), url.hostname)
	};
}
function normalizeHost(hostHeader, fallbackHostname) {
	return (hostHeader ?? fallbackHostname).split(":", 1)[0].toLowerCase();
}
function _emptyParams() {
	return Object.create(null);
}
function _matchConditionValue(actualValue, expectedValue) {
	if (expectedValue === void 0) return _emptyParams();
	const re = _cachedConditionRegex(expectedValue);
	if (re) {
		const match = re.exec(actualValue);
		if (!match) return null;
		const params = _emptyParams();
		if (match.groups) {
			for (const [key, value] of Object.entries(match.groups)) if (value !== void 0) params[key] = value;
		}
		return params;
	}
	return actualValue === expectedValue ? _emptyParams() : null;
}
/**
* Check a single has/missing condition against request context.
* Returns captured params when the condition is satisfied, or null otherwise.
*/
function matchSingleCondition(condition, ctx) {
	switch (condition.type) {
		case "header": {
			const headerValue = ctx.headers.get(condition.key);
			if (headerValue === null) return null;
			return _matchConditionValue(headerValue, condition.value);
		}
		case "cookie": {
			const cookieValue = ctx.cookies[condition.key];
			if (cookieValue === void 0) return null;
			return _matchConditionValue(cookieValue, condition.value);
		}
		case "query": {
			const queryValue = ctx.query.get(condition.key);
			if (queryValue === null) return null;
			return _matchConditionValue(queryValue, condition.value);
		}
		case "host":
			if (condition.value !== void 0) return _matchConditionValue(ctx.host, condition.value);
			return ctx.host === condition.key ? _emptyParams() : null;
		default: return null;
	}
}
/**
* Return a cached RegExp for a has/missing condition value string, compiling
* on first use. Returns null if safeRegExp rejected the pattern or if the
* value is not a valid regex (fall back to exact string comparison).
*/
function _cachedConditionRegex(value) {
	return getCachedRegex(_compiledConditionCache, value, () => safeRegExp(`^${value}$`));
}
/**
* Check all has/missing conditions for a config rule.
* Returns true if the rule should be applied (all has conditions pass, all missing conditions pass).
*
* - has: every condition must match (the request must have it)
* - missing: every condition must NOT match (the request must not have it)
*/
function collectConditionParams(has, missing, ctx) {
	const params = _emptyParams();
	if (has) for (const condition of has) {
		const conditionParams = matchSingleCondition(condition, ctx);
		if (!conditionParams) return null;
		Object.assign(params, conditionParams);
	}
	if (missing) {
		for (const condition of missing) if (matchSingleCondition(condition, ctx)) return null;
	}
	return params;
}
function checkHasConditions(has, missing, ctx) {
	return collectConditionParams(has, missing, ctx) !== null;
}
/**
* If the current position in `str` starts with a parenthesized group, consume
* it and advance `re.lastIndex` past the closing `)`. Returns the group
* contents or null if no group is present.
*/
function extractConstraint$1(str, re) {
	if (str[re.lastIndex] !== "(") return null;
	const start = re.lastIndex + 1;
	let depth = 1;
	let i = start;
	while (i < str.length && depth > 0) {
		if (str[i] === "(") depth++;
		else if (str[i] === ")") depth--;
		i++;
	}
	if (depth !== 0) return null;
	re.lastIndex = i;
	return str.slice(start, i - 1);
}
/**
* Match a Next.js config pattern (from redirects/rewrites sources) against a pathname.
* Returns matched params or null.
*
* Supports:
*   :param     - matches a single path segment
*   :param*    - matches zero or more segments (catch-all)
*   :param+    - matches one or more segments
*   (regex)    - inline regex patterns in the source
*   :param(constraint) - named param with inline regex constraint
*/
function matchConfigPattern(pathname, pattern) {
	if (pattern.includes("(") || pattern.includes("\\") || /:[\w-]+[*+][^/]/.test(pattern) || /:[\w-]+\./.test(pattern)) try {
		const compiled = getCachedRegex(_compiledPatternCache, pattern, () => {
			const paramNames = [];
			let regexStr = "";
			const tokenRe = /:([\w-]+)|[.]|[^:.]+/g;
			let tok;
			while ((tok = tokenRe.exec(pattern)) !== null) if (tok[1] !== void 0) {
				const name = tok[1];
				const rest = pattern.slice(tokenRe.lastIndex);
				if (rest.startsWith("*") || rest.startsWith("+")) {
					const quantifier = rest[0];
					tokenRe.lastIndex += 1;
					const constraint = extractConstraint$1(pattern, tokenRe);
					paramNames.push(name);
					if (constraint !== null) regexStr += `(${constraint})`;
					else regexStr += quantifier === "*" ? "(.*)" : "(.+)";
				} else {
					const constraint = extractConstraint$1(pattern, tokenRe);
					paramNames.push(name);
					regexStr += constraint !== null ? `(${constraint})` : "([^/]+)";
				}
			} else if (tok[0] === ".") regexStr += "\\.";
			else regexStr += tok[0];
			const re = safeRegExp("^" + regexStr + "$");
			return re ? {
				re,
				paramNames
			} : null;
		});
		if (!compiled) return null;
		const match = compiled.re.exec(pathname);
		if (!match) return null;
		const params = Object.create(null);
		for (let i = 0; i < compiled.paramNames.length; i++) params[compiled.paramNames[i]] = match[i + 1] ?? "";
		return params;
	} catch {}
	const catchAllMatch = pattern.match(/:([\w-]+)(\*|\+)$/);
	if (catchAllMatch) {
		const prefix = pattern.slice(0, pattern.lastIndexOf(":"));
		const paramName = catchAllMatch[1];
		const isPlus = catchAllMatch[2] === "+";
		const prefixNoSlash = prefix.replace(/\/$/, "");
		if (!pathname.startsWith(prefixNoSlash)) return null;
		const charAfter = pathname[prefixNoSlash.length];
		if (charAfter !== void 0 && charAfter !== "/") return null;
		const rest = pathname.slice(prefixNoSlash.length);
		if (isPlus && (!rest || rest === "/")) return null;
		let restValue = rest.startsWith("/") ? rest.slice(1) : rest;
		return { [paramName]: restValue };
	}
	const parts = pattern.split("/");
	const pathParts = pathname.split("/");
	if (parts.length !== pathParts.length) return null;
	const params = Object.create(null);
	for (let i = 0; i < parts.length; i++) if (parts[i].startsWith(":")) params[parts[i].slice(1)] = pathParts[i];
	else if (parts[i] !== pathParts[i]) return null;
	return params;
}
/**
* Apply redirect rules from next.config.js.
* Returns the redirect info if a redirect was matched, or null.
*
* `ctx` provides the request context (cookies, headers, query, host) used
* to evaluate has/missing conditions. Next.js always has request context
* when evaluating redirects, so this parameter is required.
*
* ## Performance
*
* Rules with a locale-capture-group prefix (the dominant pattern in large
* Next.js apps — e.g. `/:locale(en|es|fr|...)?/some-path`) are handled via
* a pre-built index. Instead of running exec() on each locale regex
* individually, we:
*
*   1. Strip the optional locale prefix from the pathname with one cheap
*      string-slice check (no regex exec on the hot path).
*   2. Look up the stripped suffix in a Map<suffix, entry[]>.
*   3. For each matching entry, validate the captured locale string against
*      a small, anchored alternation regex.
*
* This reduces the per-request cost from O(n × regex) to O(1) map lookup +
* O(matches × tiny-regex), eliminating the ~2992ms self-time reported in
* profiles for apps with 63+ locale-prefixed rules.
*
* Rules that don't fit the locale-static pattern fall back to the original
* linear matchConfigPattern scan.
*
* ## Ordering invariant
*
* First match wins, preserving the original redirect array order. When a
* locale-static fast-path match is found at position N, all linear rules with
* an original index < N are checked via matchConfigPattern first — they are
* few in practice (typically zero) so this is not a hot-path concern.
*/
function matchRedirect(pathname, redirects, ctx) {
	if (redirects.length === 0) return null;
	const index = _getRedirectIndex(redirects);
	let localeMatch = null;
	let localeMatchIndex = Infinity;
	if (index.localeStatic.size > 0) {
		const noLocaleBucket = index.localeStatic.get(pathname);
		if (noLocaleBucket) for (const entry of noLocaleBucket) {
			if (entry.originalIndex >= localeMatchIndex) continue;
			const redirect = entry.redirect;
			const conditionParams = redirect.has || redirect.missing ? collectConditionParams(redirect.has, redirect.missing, ctx) : _emptyParams();
			if (!conditionParams) continue;
			localeMatch = {
				destination: substituteAndSanitizeDestination(redirect.destination, {
					[entry.paramName]: "",
					...conditionParams
				}),
				permanent: redirect.permanent
			};
			localeMatchIndex = entry.originalIndex;
			break;
		}
		const slashTwo = pathname.indexOf("/", 1);
		if (slashTwo !== -1) {
			const suffix = pathname.slice(slashTwo);
			const localePart = pathname.slice(1, slashTwo);
			const localeBucket = index.localeStatic.get(suffix);
			if (localeBucket) for (const entry of localeBucket) {
				if (entry.originalIndex >= localeMatchIndex) continue;
				if (!entry.altRe.test(localePart)) continue;
				const redirect = entry.redirect;
				const conditionParams = redirect.has || redirect.missing ? collectConditionParams(redirect.has, redirect.missing, ctx) : _emptyParams();
				if (!conditionParams) continue;
				localeMatch = {
					destination: substituteAndSanitizeDestination(redirect.destination, {
						[entry.paramName]: localePart,
						...conditionParams
					}),
					permanent: redirect.permanent
				};
				localeMatchIndex = entry.originalIndex;
				break;
			}
		}
	}
	for (const [origIdx, redirect] of index.linear) {
		if (origIdx >= localeMatchIndex) break;
		const params = matchConfigPattern(pathname, redirect.source);
		if (params) {
			const conditionParams = redirect.has || redirect.missing ? collectConditionParams(redirect.has, redirect.missing, ctx) : _emptyParams();
			if (!conditionParams) continue;
			return {
				destination: substituteAndSanitizeDestination(redirect.destination, {
					...params,
					...conditionParams
				}),
				permanent: redirect.permanent
			};
		}
	}
	return localeMatch;
}
/**
* Apply rewrite rules from next.config.js.
* Returns the rewritten URL or null if no rewrite matched.
*
* `ctx` provides the request context (cookies, headers, query, host) used
* to evaluate has/missing conditions. Next.js always has request context
* when evaluating rewrites, so this parameter is required.
*/
function matchRewrite(pathname, rewrites, ctx) {
	for (const rewrite of rewrites) {
		const params = matchConfigPattern(pathname, rewrite.source);
		if (params) {
			const conditionParams = rewrite.has || rewrite.missing ? collectConditionParams(rewrite.has, rewrite.missing, ctx) : _emptyParams();
			if (!conditionParams) continue;
			return substituteAndSanitizeDestination(rewrite.destination, {
				...params,
				...conditionParams
			});
		}
	}
	return null;
}
/**
* Substitute all matched route params into a redirect/rewrite destination.
*
* Handles repeated params (e.g. `/api/:id/:id`) and catch-all suffix forms
* (`:path*`, `:path+`) in a single pass. Unknown params are left intact.
*/
function substituteDestinationParams(destination, params) {
	const keys = Object.keys(params);
	if (keys.length === 0) return destination;
	const sortedKeys = [...keys].sort((a, b) => b.length - a.length);
	const cacheKey = sortedKeys.join("\0");
	let paramRe = _compiledDestinationParamCache.get(cacheKey);
	if (!paramRe) {
		const paramAlternation = sortedKeys.map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
		paramRe = new RegExp(`:(${paramAlternation})([+*])?(?![A-Za-z0-9_])`, "g");
		_compiledDestinationParamCache.set(cacheKey, paramRe);
	}
	return destination.replace(paramRe, (_token, key) => params[key]);
}
/**
* Substitute params into a redirect/rewrite destination and sanitize the
* result. Used by every redirect/rewrite branch — the substitution can
* introduce protocol-relative URLs (e.g. `//evil.com` from a decoded `%2F`
* in a catch-all param), which sanitizeDestination collapses.
*/
function substituteAndSanitizeDestination(destination, params) {
	return sanitizeDestination(substituteDestinationParams(destination, params));
}
/**
* Sanitize a redirect/rewrite destination to collapse protocol-relative URLs.
*
* After parameter substitution, a destination like `/:path*` can become
* `//evil.com` if the catch-all captured a decoded `%2F` (`/evil.com`).
* Browsers interpret `//evil.com` as a protocol-relative URL, redirecting
* users off-site.
*
* This function collapses any leading double (or more) slashes to a single
* slash for non-external (relative) destinations.
*/
function sanitizeDestination(dest) {
	if (dest.startsWith("http://") || dest.startsWith("https://")) return dest;
	dest = dest.replace(/^[\\/]+/, "/");
	return dest;
}
/**
* Check if a URL is external (absolute URL or protocol-relative).
* Detects any URL scheme (http:, https:, data:, javascript:, blob:, etc.)
* per RFC 3986, plus protocol-relative URLs (//).
*/
function isExternalUrl(url) {
	return /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("//");
}
/**
* Proxy an incoming request to an external URL and return the upstream response.
*
* Used for external rewrites (e.g. `/ph/:path*` → `https://us.i.posthog.com/:path*`).
* Next.js handles these as server-side reverse proxies, forwarding the request
* method, headers, and body to the external destination.
*
* Works in all runtimes (Node.js, Cloudflare Workers) via the standard fetch() API.
*/
async function proxyExternalRequest(request, externalUrl) {
	const originalUrl = new URL(request.url);
	const targetUrl = new URL(externalUrl);
	const destinationKeys = new Set(targetUrl.searchParams.keys());
	for (const [key, value] of originalUrl.searchParams) if (!destinationKeys.has(key)) targetUrl.searchParams.append(key, value);
	const headers = new Headers(request.headers);
	headers.set("host", targetUrl.host);
	stripHopByHopRequestHeaders(headers);
	const keysToDelete = [];
	for (const key of headers.keys()) if (key.startsWith("x-middleware-")) keysToDelete.push(key);
	for (const key of keysToDelete) headers.delete(key);
	headers.delete(VINEXT_PRERENDER_SECRET_HEADER);
	headers.delete(VINEXT_MW_CTX_HEADER);
	const method = request.method;
	const hasBody = method !== "GET" && method !== "HEAD";
	const init = {
		method,
		headers,
		redirect: "manual"
	};
	if (hasBody && request.body) {
		init.body = request.body;
		init.duplex = "half";
	}
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 3e4);
	let upstreamResponse;
	try {
		upstreamResponse = await fetch(targetUrl.href, {
			...init,
			signal: controller.signal
		});
	} catch (e) {
		if (e instanceof Error && e.name === "AbortError") {
			console.error("[vinext] External rewrite proxy timeout:", targetUrl.href);
			return new Response("Gateway Timeout", { status: 504 });
		}
		console.error("[vinext] External rewrite proxy error:", e);
		return new Response("Bad Gateway", { status: 502 });
	} finally {
		clearTimeout(timeout);
	}
	const isNodeRuntime = typeof process !== "undefined" && !!process.versions?.node;
	const responseHeaders = new Headers();
	upstreamResponse.headers.forEach((value, key) => {
		const lower = key.toLowerCase();
		if (HOP_BY_HOP_HEADERS.has(lower)) return;
		if (isNodeRuntime && (lower === "content-encoding" || lower === "content-length")) return;
		responseHeaders.append(key, value);
	});
	return new Response(upstreamResponse.body, {
		status: upstreamResponse.status,
		statusText: upstreamResponse.statusText,
		headers: responseHeaders
	});
}
/**
* Apply custom header rules from next.config.js.
* Returns an array of { key, value } pairs to set on the response.
*
* `ctx` provides the request context (cookies, headers, query, host) used
* to evaluate has/missing conditions. Next.js always has request context
* when evaluating headers, so this parameter is required.
*/
function matchHeaders(pathname, headers, ctx) {
	const result = [];
	for (const rule of headers) {
		const sourceRegex = getCachedRegex(_compiledHeaderSourceCache, rule.source, () => safeRegExp("^" + escapeHeaderSource(rule.source) + "$"));
		if (sourceRegex && sourceRegex.test(pathname)) {
			if (rule.has || rule.missing) {
				if (!checkHasConditions(rule.has, rule.missing, ctx)) continue;
			}
			result.push(...rule.headers);
		}
	}
	return result;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/request-pipeline.js
/**
* Shared request pipeline utilities.
*
* Extracted from generated entries and server hot paths to keep codegen focused
* on app shape while normal modules own request behavior. Some dev-server and
* worker-template setup code still has inline normalization that should be
* migrated in follow-up work.
*
* These utilities handle the common request lifecycle steps: protocol-
* relative URL guards, basePath stripping, trailing slash normalization,
* and CSRF origin validation.
*
* Plain-text error response builders (forbidden / not-found / etc.) live in
* `./http-error-responses.ts`.
*/
/**
* Guard against protocol-relative URL open redirects.
*
* Paths like `//example.com/` would be redirected to `//example.com` by the
* trailing-slash normalizer, which browsers interpret as `http://example.com`.
* Backslashes are equivalent to forward slashes in the URL spec
* (e.g. `/\evil.com` is treated as `//evil.com` by browsers).
*
* Next.js returns 404 for these paths. We check the RAW pathname before
* normalization so the guard fires before normalizePath collapses `//`.
*
* Percent-encoded variants are also blocked because:
*   - `%5C` decodes to `\` (browsers treat `/\evil.com` as `//evil.com`).
*   - `%2F` decodes to `/` (so `/%2F/evil.com` effectively becomes `//evil.com`).
* These forms survive segment-wise decoding that re-encodes path delimiters
* (e.g. `normalizePathnameForRouteMatchStrict`), so a later trailing-slash
* redirect would still echo the encoded form in its `Location` header. See
* `isOpenRedirectShaped` for the full list of rejected leading-segment forms.
*
* @param rawPathname - The raw pathname from the URL, before any normalization
* @returns A 404 Response if the path is protocol-relative, or null to continue
*/
function guardProtocolRelativeUrl(rawPathname) {
	if (isOpenRedirectShaped(rawPathname)) return notFoundResponse();
	return null;
}
/**
* Returns true if a request pathname looks like a protocol-relative open
* redirect, in either literal or percent-encoded form.
*
* Exported for call sites that need to replicate the guard inline (Pages
* Router worker codegen, Node production server) and for defense-in-depth
* checks inside redirect emitters.
*
* A pathname is considered "open redirect shaped" when its first segment,
* after decoding backslashes and encoded delimiters, would cause a browser
* to resolve a `Location` containing the pathname as protocol-relative:
*
*   - literal   `//evil.com`
*   - literal   `/\evil.com`             (browsers normalize `\` to `/`)
*   - encoded   `/%5Cevil.com`           (`%5C` decodes to `\` in Location)
*   - encoded   `/%2F/evil.com`          (`%2F` decodes to `/` → `//`)
*   - mixed     `/%5C%2F`, `/%5C%5C`     (and other combinations)
*
* We explicitly do not require a valid percent sequence elsewhere in the
* pathname — we only examine the leading bytes (up to the second real or
* encoded delimiter) so malformed suffixes can still reach the normal
* "400 Bad Request" decode path instead of being masked as "404".
*/
function isOpenRedirectShaped(rawPathname) {
	if (!rawPathname.startsWith("/")) return false;
	const afterSlash = rawPathname.slice(1);
	if (afterSlash.startsWith("/") || afterSlash.startsWith("\\")) return true;
	if (afterSlash.length >= 3 && afterSlash[0] === "%") {
		const encoded = afterSlash.slice(0, 3).toLowerCase();
		if (encoded === "%5c" || encoded === "%2f") return true;
	}
	return false;
}
/**
* Apply matched next.config.js headers to a Web Headers object.
*
* Next.js evaluates config header match conditions against the original
* request snapshot. Middleware response headers still win for the same
* response key, while multi-value headers are additive.
*/
function applyConfigHeadersToResponse(responseHeaders, options) {
	const matched = matchHeaders(options.pathname, options.configHeaders, options.requestContext);
	for (const header of matched) {
		const lowerName = header.key.toLowerCase();
		if (lowerName === "vary" || lowerName === "set-cookie") responseHeaders.append(header.key, header.value);
		else if (!responseHeaders.has(lowerName)) responseHeaders.set(header.key, header.value);
	}
}
function createStaticFileSignal(pathname, context) {
	const headers = new Headers({ [VINEXT_STATIC_FILE_HEADER]: encodeURIComponent(pathname) });
	if (context.headers) for (const [key, value] of context.headers) headers.append(key, value);
	return new Response(null, {
		status: context.status ?? 200,
		headers
	});
}
/**
* Resolve the public/ filesystem-route slot in the Next.js routing order.
*
* Public files are checked after middleware and before afterFiles/fallback
* rewrites. The generated App Router entry provides the public-file set; this
* helper owns the request-method and RSC exclusions plus static-file signaling.
*/
function resolvePublicFileRoute(options) {
	if (options.request.method !== "GET" && options.request.method !== "HEAD") return null;
	if (options.pathname.endsWith(".rsc")) return null;
	if (!options.publicFiles.has(options.cleanPathname)) return null;
	return createStaticFileSignal(options.cleanPathname, options.middlewareContext);
}
/**
* Check if the pathname needs a trailing slash redirect, and return the
* redirect Response if so.
*
* Follows Next.js behavior:
* - `/api` routes are never redirected
* - The root path `/` is never redirected
* - If `trailingSlash` is true, redirect `/about` → `/about/`
* - If `trailingSlash` is false (default), redirect `/about/` → `/about`
*
* @param pathname - The basePath-stripped pathname
* @param basePath - The basePath to prepend to the redirect Location
* @param trailingSlash - Whether trailing slashes should be enforced
* @param search - The query string (including `?`) to preserve in the redirect
* @returns A 308 redirect Response, or null if no redirect is needed
*/
function normalizeTrailingSlash(pathname, basePath, trailingSlash, search) {
	if (pathname === "/" || pathname === "/api" || pathname.startsWith("/api/")) return null;
	if (isOpenRedirectShaped(pathname)) return notFoundResponse();
	const hasTrailing = pathname.endsWith("/");
	if (trailingSlash && !hasTrailing && !pathname.endsWith(".rsc")) return new Response(null, {
		status: 308,
		headers: { Location: basePath + pathname + "/" + search }
	});
	if (!trailingSlash && hasTrailing) return new Response(null, {
		status: 308,
		headers: { Location: basePath + removeTrailingSlash(pathname) + search }
	});
	return null;
}
/**
* Validate CSRF origin for server action requests.
*
* Matches Next.js behavior: compares the Origin header against the Host
* header. If they don't match, the request is rejected with 403 unless
* the origin is in the allowedOrigins list.
*
* @param request - The incoming Request
* @param allowedOrigins - Origins from experimental.serverActions.allowedOrigins
* @returns A 403 Response if origin validation fails, or null to continue
*/
function validateCsrfOrigin(request, allowedOrigins = []) {
	const originHeader = request.headers.get("origin");
	if (!originHeader) return null;
	if (originHeader === "null") {
		if (allowedOrigins.includes("null")) return null;
		console.warn(`[vinext] CSRF origin "null" blocked for server action. To allow requests from sandboxed contexts, add "null" to experimental.serverActions.allowedOrigins.`);
		return forbiddenResponse();
	}
	let originHost;
	try {
		originHost = new URL(originHeader).host.toLowerCase();
	} catch {
		return forbiddenResponse();
	}
	const hostHeader = (request.headers.get("host") || "").split(",")[0].trim().toLowerCase() || new URL(request.url).host.toLowerCase();
	if (originHost === hostHeader) return null;
	if (allowedOrigins.length > 0 && isOriginAllowed(originHost, allowedOrigins)) return null;
	console.warn(`[vinext] CSRF origin mismatch: origin "${originHost}" does not match host "${hostHeader}". Blocking server action request.`);
	return forbiddenResponse();
}
/**
* Reject malformed Flight container reference graphs in server action payloads.
*
* `@vitejs/plugin-rsc` vendors its own React Flight decoder. Malicious action
* payloads can abuse container references (`$Q`, `$W`, `$i`) to trigger very
* expensive deserialization before the action is even looked up.
*
* Legitimate React-encoded container payloads use separate numeric backing
* fields (e.g. field `1` plus root field `0` containing `"$Q1"`). We reject
* numeric backing-field graphs that contain missing backing fields or cycles.
* Regular user form fields are ignored entirely.
*/
async function validateServerActionPayload(body) {
	const containerRefRe = /"\$([QWi])(\d+)"/g;
	const fieldRefs = /* @__PURE__ */ new Map();
	const collectRefs = (fieldKey, text) => {
		const refs = /* @__PURE__ */ new Set();
		let match;
		containerRefRe.lastIndex = 0;
		while ((match = containerRefRe.exec(text)) !== null) refs.add(match[2]);
		fieldRefs.set(fieldKey, refs);
	};
	if (typeof body === "string") collectRefs("0", body);
	else for (const [key, value] of body.entries()) {
		if (!/^\d+$/.test(key)) continue;
		if (typeof value === "string") {
			collectRefs(key, value);
			continue;
		}
		if (typeof value?.text === "function") collectRefs(key, await value.text());
	}
	if (fieldRefs.size === 0) return null;
	const knownFields = new Set(fieldRefs.keys());
	for (const refs of fieldRefs.values()) for (const ref of refs) if (!knownFields.has(ref)) return new Response("Invalid server action payload", {
		status: 400,
		headers: { "Content-Type": "text/plain" }
	});
	const visited = /* @__PURE__ */ new Set();
	const stack = /* @__PURE__ */ new Set();
	const hasCycle = (node) => {
		if (stack.has(node)) return true;
		if (visited.has(node)) return false;
		visited.add(node);
		stack.add(node);
		for (const ref of fieldRefs.get(node) ?? []) if (hasCycle(ref)) return true;
		stack.delete(node);
		return false;
	};
	for (const node of fieldRefs.keys()) if (hasCycle(node)) return new Response("Invalid server action payload", {
		status: 400,
		headers: { "Content-Type": "text/plain" }
	});
	return null;
}
/**
* Check if an origin matches any pattern in the allowed origins list.
* Supports wildcard subdomains (e.g. `*.example.com`).
*/
/**
* Segment-by-segment domain matching for wildcard origin patterns.
* `*` matches exactly one DNS label; `**` matches one or more labels.
*
* Ported from Next.js: packages/next/src/server/app-render/csrf-protection.ts
* https://github.com/vercel/next.js/blob/canary/packages/next/src/server/app-render/csrf-protection.ts
*/
function matchWildcardDomain(domain, pattern) {
	const normalizedDomain = domain.replace(/[A-Z]/g, (c) => c.toLowerCase());
	const normalizedPattern = pattern.replace(/[A-Z]/g, (c) => c.toLowerCase());
	const domainParts = normalizedDomain.split(".");
	const patternParts = normalizedPattern.split(".");
	if (patternParts.length < 1) return false;
	if (domainParts.length < patternParts.length) return false;
	if (patternParts.length === 1 && (patternParts[0] === "*" || patternParts[0] === "**")) return false;
	while (patternParts.length) {
		const patternPart = patternParts.pop();
		const domainPart = domainParts.pop();
		if (patternPart === void 0) return false;
		switch (patternPart) {
			case "": return false;
			case "*": if (domainPart) continue;
			else return false;
			case "**":
				if (patternParts.length > 0) return false;
				return domainPart !== void 0;
			default: if (patternPart !== domainPart) return false;
		}
	}
	return domainParts.length === 0;
}
function isOriginAllowed(origin, allowed) {
	for (const pattern of allowed) if (pattern.includes("*")) {
		if (matchWildcardDomain(origin, pattern)) return true;
	} else if (origin.toLowerCase() === pattern.toLowerCase()) return true;
	return false;
}
/**
* Validate an image optimization URL parameter.
*
* Ensures the URL is a relative path that doesn't escape the origin:
* - Must start with "/" but not "//"
* - Backslashes are normalized (browsers treat `\` as `/`)
* - Origin validation as defense-in-depth
*
* @param rawUrl - The raw `url` query parameter value
* @param requestUrl - The full request URL for origin comparison
* @returns An error Response if validation fails, or the normalized image URL
*/
function validateImageUrl(rawUrl, requestUrl) {
	const imgUrl = rawUrl?.replaceAll("\\", "/") ?? null;
	if (!imgUrl || !imgUrl.startsWith("/") || imgUrl.startsWith("//")) return new Response(!rawUrl ? "Missing url parameter" : "Only relative URLs allowed", { status: 400 });
	const url = new URL(requestUrl);
	if (new URL(imgUrl, url.origin).origin !== url.origin) return new Response("Only relative URLs allowed", { status: 400 });
	return imgUrl;
}
/**
* Strip internal `x-middleware-*` headers from a Headers object.
*
* Middleware uses `x-middleware-*` headers as internal signals (e.g.
* `x-middleware-next`, `x-middleware-rewrite`, `x-middleware-request-*`).
* These must be removed before sending the response to the client.
*
* @param headers - The Headers object to modify in place
*/
function processMiddlewareHeaders(headers) {
	const keysToDelete = [];
	for (const key of headers.keys()) if (key.startsWith("x-middleware-")) keysToDelete.push(key);
	for (const key of keysToDelete) headers.delete(key);
}
/**
* Strip internal headers from an inbound request so they cannot be forged by
* an external attacker to influence routing or impersonate internal state.
*
* Must be called at every request entry point BEFORE middleware, routing,
* or any handler logic accesses the request headers.
*
* Returns a new Headers object with internal headers removed. The input
* is never mutated — Request.headers is immutable in Workers/miniflare
* environments (see applyMiddlewareRequestHeaders in config-matchers.ts
* for the same cloning pattern).
*
* @param headers - The source Headers (never modified)
* @returns A new Headers with INTERNAL_HEADERS removed
*/
function filterInternalHeaders(headers) {
	const filtered = new Headers();
	for (const [key, value] of headers) if (!INTERNAL_HEADERS.includes(key.toLowerCase())) filtered.append(key, value);
	return filtered;
}
function getRequestCf(request) {
	const cf = Reflect.get(request, "cf");
	return cf === void 0 ? void 0 : cf;
}
/**
* Clone a Request while overriding headers, preserving metadata when possible.
*
* Some runtimes (Workers) allow `new Request(request, { headers })` which
* retains redirect/signal/cf data. Others (Node/undici across realms) can throw
* when cloning a foreign Request instance. In that case, fall back to building
* a RequestInit with best-effort metadata.
*/
function cloneRequestWithHeaders(request, headers) {
	let cloned;
	try {
		cloned = new Request(request, { headers });
	} catch {
		const init = {
			method: request.method,
			headers,
			body: request.body ?? void 0,
			redirect: request.redirect,
			signal: request.signal,
			integrity: request.integrity,
			cache: request.cache,
			mode: request.mode,
			credentials: request.credentials,
			referrer: request.referrer,
			referrerPolicy: request.referrerPolicy
		};
		if (request.body) init.duplex = "half";
		cloned = new Request(request.url, init);
	}
	const cf = getRequestCf(request);
	if (cf !== void 0) Object.defineProperty(cloned, "cf", {
		value: cf,
		enumerable: true,
		configurable: true
	});
	return cloned;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/worker-utils.js
/**
* Shared utilities for Cloudflare Worker entries.
*
* Used by hand-written example worker entries and can be imported as
* "vinext/server/worker-utils". The generated worker entry (deploy.ts)
* inlines these functions in its template string.
*/
/**
* Merge middleware/config headers into a response.
* Response headers take precedence over middleware headers for all headers
* except Set-Cookie, which is additive (both middleware and response cookies
* are preserved). Uses getSetCookie() to preserve multiple Set-Cookie values.
* Keep this in sync with prod-server.ts and the generated copy in deploy.ts.
*/
var NO_BODY_RESPONSE_STATUSES = new Set([
	204,
	205,
	304
]);
function isVinextStreamedHtmlResponse(response) {
	return response.__vinextStreamedHtmlResponse === true;
}
function isContentLengthHeader(name) {
	return name.toLowerCase() === "content-length";
}
function cancelResponseBody(response) {
	const body = response.body;
	if (!body || body.locked) return;
	body.cancel().catch(() => {});
}
function buildHeaderRecord(response, omitNames = []) {
	const omitted = new Set(omitNames.map((name) => name.toLowerCase()));
	const headers = {};
	response.headers.forEach((value, key) => {
		if (omitted.has(key.toLowerCase()) || key === "set-cookie") return;
		headers[key] = value;
	});
	const cookies = response.headers.getSetCookie?.() ?? [];
	if (cookies.length > 0) headers["set-cookie"] = cookies;
	return headers;
}
function mergeHeaders(response, extraHeaders, statusOverride) {
	const status = statusOverride ?? response.status;
	const merged = new Headers();
	for (const [k, v] of Object.entries(extraHeaders)) {
		if (isContentLengthHeader(k)) continue;
		if (Array.isArray(v)) for (const item of v) merged.append(k, item);
		else merged.set(k, v);
	}
	response.headers.forEach((v, k) => {
		if (k === "set-cookie") return;
		merged.set(k, v);
	});
	const responseCookies = response.headers.getSetCookie?.() ?? [];
	for (const cookie of responseCookies) merged.append("set-cookie", cookie);
	const shouldDropBody = NO_BODY_RESPONSE_STATUSES.has(status);
	const shouldStripStreamLength = isVinextStreamedHtmlResponse(response) && merged.has("content-length");
	if (!Object.keys(extraHeaders).some((key) => !isContentLengthHeader(key)) && statusOverride === void 0 && !shouldDropBody && !shouldStripStreamLength) return response;
	if (shouldDropBody) {
		cancelResponseBody(response);
		merged.delete("content-encoding");
		merged.delete("content-length");
		merged.delete("content-type");
		merged.delete("transfer-encoding");
		return new Response(null, {
			status,
			statusText: status === response.status ? response.statusText : void 0,
			headers: merged
		});
	}
	if (shouldStripStreamLength) merged.delete("content-length");
	return new Response(response.body, {
		status,
		statusText: status === response.status ? response.statusText : void 0,
		headers: merged
	});
}
async function resolveStaticAssetSignal(signalResponse, options) {
	const signal = signalResponse.headers.get(VINEXT_STATIC_FILE_HEADER);
	if (!signal) return null;
	let assetPath = "/";
	try {
		assetPath = decodeURIComponent(signal);
	} catch {
		assetPath = signal;
	}
	const extraHeaders = buildHeaderRecord(signalResponse, [
		VINEXT_STATIC_FILE_HEADER,
		"content-encoding",
		"content-length",
		"content-type"
	]);
	cancelResponseBody(signalResponse);
	const assetResponse = await options.fetchAsset(assetPath);
	return mergeHeaders(assetResponse, extraHeaders, assetResponse.ok && signalResponse.status !== 200 ? signalResponse.status : void 0);
}
//#endregion
//#region node_modules/.pnpm/@vitejs+plugin-rsc@0.5.26_react-dom@19.2.6_react@19.2.6__react-server-dom-webpack@19.2._0163e471c1626bdcb27d069e1de6a9e2/node_modules/@vitejs/plugin-rsc/dist/dist-rz-Bnebz.js
function tinyassert(value, message) {
	if (value) return;
	if (message instanceof Error) throw message;
	throw new TinyAssertionError(message, tinyassert);
}
var TinyAssertionError = class extends Error {
	constructor(message, stackStartFunction) {
		super(message ?? "TinyAssertionError");
		if (stackStartFunction && "captureStackTrace" in Error) Error.captureStackTrace(this, stackStartFunction);
	}
};
function safeFunctionCast(f) {
	return f;
}
function memoize(f, options) {
	const keyFn = options?.keyFn ?? ((...args) => args[0]);
	const cache = options?.cache ?? /* @__PURE__ */ new Map();
	return safeFunctionCast(function(...args) {
		const key = keyFn(...args);
		const value = cache.get(key);
		if (typeof value !== "undefined") return value;
		const newValue = f.apply(this, args);
		cache.set(key, newValue);
		return newValue;
	});
}
//#endregion
//#region node_modules/.pnpm/@vitejs+plugin-rsc@0.5.26_react-dom@19.2.6_react@19.2.6__react-server-dom-webpack@19.2._0163e471c1626bdcb27d069e1de6a9e2/node_modules/@vitejs/plugin-rsc/dist/shared-BViDMJTQ.js
var SERVER_REFERENCE_PREFIX = "$$server:";
var SERVER_DECODE_CLIENT_PREFIX = "$$decode-client:";
function removeReferenceCacheTag(id) {
	return id.split("$$cache=")[0];
}
function setInternalRequire() {
	globalThis.__vite_rsc_require__ = (id) => {
		if (id.startsWith("$$server:")) {
			id = id.slice(9);
			return globalThis.__vite_rsc_server_require__(id);
		}
		return globalThis.__vite_rsc_client_require__(id);
	};
}
//#endregion
//#region node_modules/.pnpm/react@19.2.6/node_modules/react/cjs/react.react-server.production.js
/**
* @license React
* react.react-server.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_react_server_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var ReactSharedInternals = {
		H: null,
		A: null
	};
	function formatProdErrorMessage(code) {
		var url = "https://react.dev/errors/" + code;
		if (1 < arguments.length) {
			url += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var i = 2; i < arguments.length; i++) url += "&args[]=" + encodeURIComponent(arguments[i]);
		}
		return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	var isArrayImpl = Array.isArray;
	function noop() {}
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	function getIteratorFn(maybeIterable) {
		if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
		maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
		return "function" === typeof maybeIterable ? maybeIterable : null;
	}
	var hasOwnProperty = Object.prototype.hasOwnProperty, assign = Object.assign;
	function ReactElement(type, key, props) {
		var refProp = props.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== refProp ? refProp : null,
			props
		};
	}
	function cloneAndReplaceKey(oldElement, newKey) {
		return ReactElement(oldElement.type, newKey, oldElement.props);
	}
	function isValidElement(object) {
		return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
	}
	function escape(key) {
		var escaperLookup = {
			"=": "=0",
			":": "=2"
		};
		return "$" + key.replace(/[=:]/g, function(match) {
			return escaperLookup[match];
		});
	}
	var userProvidedKeyEscapeRegex = /\/+/g;
	function getElementKey(element, index) {
		return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
	}
	function resolveThenable(thenable) {
		switch (thenable.status) {
			case "fulfilled": return thenable.value;
			case "rejected": throw thenable.reason;
			default: switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(function(fulfilledValue) {
				"pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
			}, function(error) {
				"pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
			})), thenable.status) {
				case "fulfilled": return thenable.value;
				case "rejected": throw thenable.reason;
			}
		}
		throw thenable;
	}
	function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
		var type = typeof children;
		if ("undefined" === type || "boolean" === type) children = null;
		var invokeCallback = !1;
		if (null === children) invokeCallback = !0;
		else switch (type) {
			case "bigint":
			case "string":
			case "number":
				invokeCallback = !0;
				break;
			case "object": switch (children.$$typeof) {
				case REACT_ELEMENT_TYPE:
				case REACT_PORTAL_TYPE:
					invokeCallback = !0;
					break;
				case REACT_LAZY_TYPE: return invokeCallback = children._init, mapIntoArray(invokeCallback(children._payload), array, escapedPrefix, nameSoFar, callback);
			}
		}
		if (invokeCallback) return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
			return c;
		})) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(callback, escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(userProvidedKeyEscapeRegex, "$&/") + "/") + invokeCallback)), array.push(callback)), 1;
		invokeCallback = 0;
		var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
		if (isArrayImpl(children)) for (var i = 0; i < children.length; i++) nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if (i = getIteratorFn(children), "function" === typeof i) for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done;) nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if ("object" === type) {
			if ("function" === typeof children.then) return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
			array = String(children);
			throw Error(formatProdErrorMessage(31, "[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array));
		}
		return invokeCallback;
	}
	function mapChildren(children, func, context) {
		if (null == children) return children;
		var result = [], count = 0;
		mapIntoArray(children, result, "", "", function(child) {
			return func.call(context, child, count++);
		});
		return result;
	}
	function lazyInitializer(payload) {
		if (-1 === payload._status) {
			var ctor = payload._result;
			ctor = ctor();
			ctor.then(function(moduleObject) {
				if (0 === payload._status || -1 === payload._status) payload._status = 1, payload._result = moduleObject;
			}, function(error) {
				if (0 === payload._status || -1 === payload._status) payload._status = 2, payload._result = error;
			});
			-1 === payload._status && (payload._status = 0, payload._result = ctor);
		}
		if (1 === payload._status) return payload._result.default;
		throw payload._result;
	}
	function createCacheRoot() {
		return /* @__PURE__ */ new WeakMap();
	}
	function createCacheNode() {
		return {
			s: 0,
			v: void 0,
			o: null,
			p: null
		};
	}
	exports.Children = {
		map: mapChildren,
		forEach: function(children, forEachFunc, forEachContext) {
			mapChildren(children, function() {
				forEachFunc.apply(this, arguments);
			}, forEachContext);
		},
		count: function(children) {
			var n = 0;
			mapChildren(children, function() {
				n++;
			});
			return n;
		},
		toArray: function(children) {
			return mapChildren(children, function(child) {
				return child;
			}) || [];
		},
		only: function(children) {
			if (!isValidElement(children)) throw Error(formatProdErrorMessage(143));
			return children;
		}
	};
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.Profiler = REACT_PROFILER_TYPE;
	exports.StrictMode = REACT_STRICT_MODE_TYPE;
	exports.Suspense = REACT_SUSPENSE_TYPE;
	exports.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
	exports.cache = function(fn) {
		return function() {
			var dispatcher = ReactSharedInternals.A;
			if (!dispatcher) return fn.apply(null, arguments);
			var fnMap = dispatcher.getCacheForType(createCacheRoot);
			dispatcher = fnMap.get(fn);
			void 0 === dispatcher && (dispatcher = createCacheNode(), fnMap.set(fn, dispatcher));
			fnMap = 0;
			for (var l = arguments.length; fnMap < l; fnMap++) {
				var arg = arguments[fnMap];
				if ("function" === typeof arg || "object" === typeof arg && null !== arg) {
					var objectCache = dispatcher.o;
					null === objectCache && (dispatcher.o = objectCache = /* @__PURE__ */ new WeakMap());
					dispatcher = objectCache.get(arg);
					void 0 === dispatcher && (dispatcher = createCacheNode(), objectCache.set(arg, dispatcher));
				} else objectCache = dispatcher.p, null === objectCache && (dispatcher.p = objectCache = /* @__PURE__ */ new Map()), dispatcher = objectCache.get(arg), void 0 === dispatcher && (dispatcher = createCacheNode(), objectCache.set(arg, dispatcher));
			}
			if (1 === dispatcher.s) return dispatcher.v;
			if (2 === dispatcher.s) throw dispatcher.v;
			try {
				var result = fn.apply(null, arguments);
				fnMap = dispatcher;
				fnMap.s = 1;
				return fnMap.v = result;
			} catch (error) {
				throw result = dispatcher, result.s = 2, result.v = error, error;
			}
		};
	};
	exports.cacheSignal = function() {
		var dispatcher = ReactSharedInternals.A;
		return dispatcher ? dispatcher.cacheSignal() : null;
	};
	exports.captureOwnerStack = function() {
		return null;
	};
	exports.cloneElement = function(element, config, children) {
		if (null === element || void 0 === element) throw Error(formatProdErrorMessage(267, element));
		var props = assign({}, element.props), key = element.key;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
		var propName = arguments.length - 2;
		if (1 === propName) props.children = children;
		else if (1 < propName) {
			for (var childArray = Array(propName), i = 0; i < propName; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		return ReactElement(element.type, key, props);
	};
	exports.createElement = function(type, config, children) {
		var propName, props = {}, key = null;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
		var childrenLength = arguments.length - 2;
		if (1 === childrenLength) props.children = children;
		else if (1 < childrenLength) {
			for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		if (type && type.defaultProps) for (propName in childrenLength = type.defaultProps, childrenLength) void 0 === props[propName] && (props[propName] = childrenLength[propName]);
		return ReactElement(type, key, props);
	};
	exports.createRef = function() {
		return { current: null };
	};
	exports.forwardRef = function(render) {
		return {
			$$typeof: REACT_FORWARD_REF_TYPE,
			render
		};
	};
	exports.isValidElement = isValidElement;
	exports.lazy = function(ctor) {
		return {
			$$typeof: REACT_LAZY_TYPE,
			_payload: {
				_status: -1,
				_result: ctor
			},
			_init: lazyInitializer
		};
	};
	exports.memo = function(type, compare) {
		return {
			$$typeof: REACT_MEMO_TYPE,
			type,
			compare: void 0 === compare ? null : compare
		};
	};
	exports.use = function(usable) {
		return ReactSharedInternals.H.use(usable);
	};
	exports.useCallback = function(callback, deps) {
		return ReactSharedInternals.H.useCallback(callback, deps);
	};
	exports.useDebugValue = function() {};
	exports.useId = function() {
		return ReactSharedInternals.H.useId();
	};
	exports.useMemo = function(create, deps) {
		return ReactSharedInternals.H.useMemo(create, deps);
	};
	exports.version = "19.2.6";
}));
//#endregion
//#region node_modules/.pnpm/react@19.2.6/node_modules/react/react.react-server.js
var require_react_react_server = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_react_server_production();
}));
//#endregion
//#region node_modules/.pnpm/react-dom@19.2.6_react@19.2.6/node_modules/react-dom/cjs/react-dom.react-server.production.js
/**
* @license React
* react-dom.react-server.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_dom_react_server_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var React = require_react_react_server();
	function noop() {}
	var Internals = {
		d: {
			f: noop,
			r: function() {
				throw Error("Invalid form element. requestFormReset must be passed a form that was rendered by React.");
			},
			D: noop,
			C: noop,
			L: noop,
			m: noop,
			X: noop,
			S: noop,
			M: noop
		},
		p: 0,
		findDOMNode: null
	};
	if (!React.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) throw Error("The \"react\" package in this environment is not configured correctly. The \"react-server\" condition must be enabled in any environment that runs React Server Components.");
	function getCrossOriginStringAs(as, input) {
		if ("font" === as) return "";
		if ("string" === typeof input) return "use-credentials" === input ? input : "";
	}
	exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
	exports.preconnect = function(href, options) {
		"string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
	};
	exports.prefetchDNS = function(href) {
		"string" === typeof href && Internals.d.D(href);
	};
	exports.preinit = function(href, options) {
		if ("string" === typeof href && options && "string" === typeof options.as) {
			var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
			"style" === as ? Internals.d.S(href, "string" === typeof options.precedence ? options.precedence : void 0, {
				crossOrigin,
				integrity,
				fetchPriority
			}) : "script" === as && Internals.d.X(href, {
				crossOrigin,
				integrity,
				fetchPriority,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0
			});
		}
	};
	exports.preinitModule = function(href, options) {
		if ("string" === typeof href) if ("object" === typeof options && null !== options) {
			if (null == options.as || "script" === options.as) {
				var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
				Internals.d.M(href, {
					crossOrigin,
					integrity: "string" === typeof options.integrity ? options.integrity : void 0,
					nonce: "string" === typeof options.nonce ? options.nonce : void 0
				});
			}
		} else options ?? Internals.d.M(href);
	};
	exports.preload = function(href, options) {
		if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
			var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
			Internals.d.L(href, as, {
				crossOrigin,
				integrity: "string" === typeof options.integrity ? options.integrity : void 0,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0,
				type: "string" === typeof options.type ? options.type : void 0,
				fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
				referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
				imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
				imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
				media: "string" === typeof options.media ? options.media : void 0
			});
		}
	};
	exports.preloadModule = function(href, options) {
		if ("string" === typeof href) if (options) {
			var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
			Internals.d.m(href, {
				as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
				crossOrigin,
				integrity: "string" === typeof options.integrity ? options.integrity : void 0
			});
		} else Internals.d.m(href);
	};
	exports.version = "19.2.6";
}));
//#endregion
//#region node_modules/.pnpm/react-dom@19.2.6_react@19.2.6/node_modules/react-dom/react-dom.react-server.js
var require_react_dom_react_server = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_dom_react_server_production();
}));
//#endregion
//#region node_modules/.pnpm/react-server-dom-webpack@19.2.6_react-dom@19.2.6_react@19.2.6__react@19.2.6_webpack@5.108.4_esbuild@0.28.1_/node_modules/react-server-dom-webpack/cjs/react-server-dom-webpack-server.edge.production.js
var require_react_server_dom_webpack_server_edge_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	globalThis.AsyncLocalStorage = __viteRscAsyncHooks.AsyncLocalStorage;
	/**
	* @license React
	* react-server-dom-webpack-server.edge.production.js
	*
	* Copyright (c) Meta Platforms, Inc. and affiliates.
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	var ReactDOM = require_react_dom_react_server(), React = require_react_react_server(), REACT_LEGACY_ELEMENT_TYPE = Symbol.for("react.element"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel");
	var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	function getIteratorFn(maybeIterable) {
		if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
		maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
		return "function" === typeof maybeIterable ? maybeIterable : null;
	}
	var ASYNC_ITERATOR = Symbol.asyncIterator;
	function handleErrorInNextTick(error) {
		setTimeout(function() {
			throw error;
		});
	}
	var LocalPromise = Promise, scheduleMicrotask = "function" === typeof queueMicrotask ? queueMicrotask : function(callback) {
		LocalPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
	}, currentView = null, writtenBytes = 0;
	function writeChunkAndReturn(destination, chunk) {
		if (0 !== chunk.byteLength) if (2048 < chunk.byteLength) 0 < writtenBytes && (destination.enqueue(new Uint8Array(currentView.buffer, 0, writtenBytes)), currentView = new Uint8Array(2048), writtenBytes = 0), destination.enqueue(chunk);
		else {
			var allowableBytes = currentView.length - writtenBytes;
			allowableBytes < chunk.byteLength && (0 === allowableBytes ? destination.enqueue(currentView) : (currentView.set(chunk.subarray(0, allowableBytes), writtenBytes), destination.enqueue(currentView), chunk = chunk.subarray(allowableBytes)), currentView = new Uint8Array(2048), writtenBytes = 0);
			currentView.set(chunk, writtenBytes);
			writtenBytes += chunk.byteLength;
		}
		return !0;
	}
	var textEncoder = new TextEncoder();
	function stringToChunk(content) {
		return textEncoder.encode(content);
	}
	function byteLengthOfChunk(chunk) {
		return chunk.byteLength;
	}
	function closeWithError(destination, error) {
		"function" === typeof destination.error ? destination.error(error) : destination.close();
	}
	var CLIENT_REFERENCE_TAG$1 = Symbol.for("react.client.reference"), SERVER_REFERENCE_TAG = Symbol.for("react.server.reference");
	function registerClientReferenceImpl(proxyImplementation, id, async) {
		return Object.defineProperties(proxyImplementation, {
			$$typeof: { value: CLIENT_REFERENCE_TAG$1 },
			$$id: { value: id },
			$$async: { value: async }
		});
	}
	var FunctionBind = Function.prototype.bind, ArraySlice = Array.prototype.slice;
	function bind() {
		var newFn = FunctionBind.apply(this, arguments);
		if (this.$$typeof === SERVER_REFERENCE_TAG) {
			var args = ArraySlice.call(arguments, 1), $$typeof = { value: SERVER_REFERENCE_TAG }, $$id = { value: this.$$id };
			args = { value: this.$$bound ? this.$$bound.concat(args) : args };
			return Object.defineProperties(newFn, {
				$$typeof,
				$$id,
				$$bound: args,
				bind: {
					value: bind,
					configurable: !0
				}
			});
		}
		return newFn;
	}
	var serverReferenceToString = {
		value: function() {
			return "function () { [omitted code] }";
		},
		configurable: !0,
		writable: !0
	}, PROMISE_PROTOTYPE = Promise.prototype, deepProxyHandlers = {
		get: function(target, name) {
			switch (name) {
				case "$$typeof": return target.$$typeof;
				case "$$id": return target.$$id;
				case "$$async": return target.$$async;
				case "name": return target.name;
				case "displayName": return;
				case "defaultProps": return;
				case "_debugInfo": return;
				case "toJSON": return;
				case Symbol.toPrimitive: return Object.prototype[Symbol.toPrimitive];
				case Symbol.toStringTag: return Object.prototype[Symbol.toStringTag];
				case "Provider": throw Error("Cannot render a Client Context Provider on the Server. Instead, you can export a Client Component wrapper that itself renders a Client Context Provider.");
				case "then": throw Error("Cannot await or return from a thenable. You cannot await a client module from a server component.");
			}
			throw Error("Cannot access " + (String(target.name) + "." + String(name)) + " on the server. You cannot dot into a client module from a server component. You can only pass the imported name through.");
		},
		set: function() {
			throw Error("Cannot assign to a client module from a server module.");
		}
	};
	function getReference(target, name) {
		switch (name) {
			case "$$typeof": return target.$$typeof;
			case "$$id": return target.$$id;
			case "$$async": return target.$$async;
			case "name": return target.name;
			case "defaultProps": return;
			case "_debugInfo": return;
			case "toJSON": return;
			case Symbol.toPrimitive: return Object.prototype[Symbol.toPrimitive];
			case Symbol.toStringTag: return Object.prototype[Symbol.toStringTag];
			case "__esModule":
				var moduleId = target.$$id;
				target.default = registerClientReferenceImpl(function() {
					throw Error("Attempted to call the default export of " + moduleId + " from the server but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
				}, target.$$id + "#", target.$$async);
				return !0;
			case "then":
				if (target.then) return target.then;
				if (target.$$async) return;
				var clientReference = registerClientReferenceImpl({}, target.$$id, !0), proxy = new Proxy(clientReference, proxyHandlers$1);
				target.status = "fulfilled";
				target.value = proxy;
				return target.then = registerClientReferenceImpl(function(resolve) {
					return Promise.resolve(resolve(proxy));
				}, target.$$id + "#then", !1);
		}
		if ("symbol" === typeof name) throw Error("Cannot read Symbol exports. Only named exports are supported on a client module imported on the server.");
		clientReference = target[name];
		clientReference || (clientReference = registerClientReferenceImpl(function() {
			throw Error("Attempted to call " + String(name) + "() from the server but " + String(name) + " is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
		}, target.$$id + "#" + name, target.$$async), Object.defineProperty(clientReference, "name", { value: name }), clientReference = target[name] = new Proxy(clientReference, deepProxyHandlers));
		return clientReference;
	}
	var proxyHandlers$1 = {
		get: function(target, name) {
			return getReference(target, name);
		},
		getOwnPropertyDescriptor: function(target, name) {
			var descriptor = Object.getOwnPropertyDescriptor(target, name);
			descriptor || (descriptor = {
				value: getReference(target, name),
				writable: !1,
				configurable: !1,
				enumerable: !1
			}, Object.defineProperty(target, name, descriptor));
			return descriptor;
		},
		getPrototypeOf: function() {
			return PROMISE_PROTOTYPE;
		},
		set: function() {
			throw Error("Cannot assign to a client module from a server module.");
		}
	}, ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, previousDispatcher = ReactDOMSharedInternals.d;
	ReactDOMSharedInternals.d = {
		f: previousDispatcher.f,
		r: previousDispatcher.r,
		D: prefetchDNS,
		C: preconnect,
		L: preload,
		m: preloadModule$1,
		X: preinitScript,
		S: preinitStyle,
		M: preinitModuleScript
	};
	function prefetchDNS(href) {
		if ("string" === typeof href && href) {
			var request = resolveRequest();
			if (request) {
				var hints = request.hints, key = "D|" + href;
				hints.has(key) || (hints.add(key), emitHint(request, "D", href));
			} else previousDispatcher.D(href);
		}
	}
	function preconnect(href, crossOrigin) {
		if ("string" === typeof href) {
			var request = resolveRequest();
			if (request) {
				var hints = request.hints, key = "C|" + (null == crossOrigin ? "null" : crossOrigin) + "|" + href;
				hints.has(key) || (hints.add(key), "string" === typeof crossOrigin ? emitHint(request, "C", [href, crossOrigin]) : emitHint(request, "C", href));
			} else previousDispatcher.C(href, crossOrigin);
		}
	}
	function preload(href, as, options) {
		if ("string" === typeof href) {
			var request = resolveRequest();
			if (request) {
				var hints = request.hints, key = "L";
				if ("image" === as && options) {
					var imageSrcSet = options.imageSrcSet, imageSizes = options.imageSizes, uniquePart = "";
					"string" === typeof imageSrcSet && "" !== imageSrcSet ? (uniquePart += "[" + imageSrcSet + "]", "string" === typeof imageSizes && (uniquePart += "[" + imageSizes + "]")) : uniquePart += "[][]" + href;
					key += "[image]" + uniquePart;
				} else key += "[" + as + "]" + href;
				hints.has(key) || (hints.add(key), (options = trimOptions(options)) ? emitHint(request, "L", [
					href,
					as,
					options
				]) : emitHint(request, "L", [href, as]));
			} else previousDispatcher.L(href, as, options);
		}
	}
	function preloadModule$1(href, options) {
		if ("string" === typeof href) {
			var request = resolveRequest();
			if (request) {
				var hints = request.hints, key = "m|" + href;
				if (hints.has(key)) return;
				hints.add(key);
				return (options = trimOptions(options)) ? emitHint(request, "m", [href, options]) : emitHint(request, "m", href);
			}
			previousDispatcher.m(href, options);
		}
	}
	function preinitStyle(href, precedence, options) {
		if ("string" === typeof href) {
			var request = resolveRequest();
			if (request) {
				var hints = request.hints, key = "S|" + href;
				if (hints.has(key)) return;
				hints.add(key);
				return (options = trimOptions(options)) ? emitHint(request, "S", [
					href,
					"string" === typeof precedence ? precedence : 0,
					options
				]) : "string" === typeof precedence ? emitHint(request, "S", [href, precedence]) : emitHint(request, "S", href);
			}
			previousDispatcher.S(href, precedence, options);
		}
	}
	function preinitScript(src, options) {
		if ("string" === typeof src) {
			var request = resolveRequest();
			if (request) {
				var hints = request.hints, key = "X|" + src;
				if (hints.has(key)) return;
				hints.add(key);
				return (options = trimOptions(options)) ? emitHint(request, "X", [src, options]) : emitHint(request, "X", src);
			}
			previousDispatcher.X(src, options);
		}
	}
	function preinitModuleScript(src, options) {
		if ("string" === typeof src) {
			var request = resolveRequest();
			if (request) {
				var hints = request.hints, key = "M|" + src;
				if (hints.has(key)) return;
				hints.add(key);
				return (options = trimOptions(options)) ? emitHint(request, "M", [src, options]) : emitHint(request, "M", src);
			}
			previousDispatcher.M(src, options);
		}
	}
	function trimOptions(options) {
		if (null == options) return null;
		var hasProperties = !1, trimmed = {}, key;
		for (key in options) null != options[key] && (hasProperties = !0, trimmed[key] = options[key]);
		return hasProperties ? trimmed : null;
	}
	function getChildFormatContext(parentContext, type, props) {
		switch (type) {
			case "img":
				type = props.src;
				var srcSet = props.srcSet;
				if (!("lazy" === props.loading || !type && !srcSet || "string" !== typeof type && null != type || "string" !== typeof srcSet && null != srcSet || "low" === props.fetchPriority || parentContext & 3) && ("string" !== typeof type || ":" !== type[4] || "d" !== type[0] && "D" !== type[0] || "a" !== type[1] && "A" !== type[1] || "t" !== type[2] && "T" !== type[2] || "a" !== type[3] && "A" !== type[3]) && ("string" !== typeof srcSet || ":" !== srcSet[4] || "d" !== srcSet[0] && "D" !== srcSet[0] || "a" !== srcSet[1] && "A" !== srcSet[1] || "t" !== srcSet[2] && "T" !== srcSet[2] || "a" !== srcSet[3] && "A" !== srcSet[3])) {
					var sizes = "string" === typeof props.sizes ? props.sizes : void 0;
					var input = props.crossOrigin;
					preload(type || "", "image", {
						imageSrcSet: srcSet,
						imageSizes: sizes,
						crossOrigin: "string" === typeof input ? "use-credentials" === input ? input : "" : void 0,
						integrity: props.integrity,
						type: props.type,
						fetchPriority: props.fetchPriority,
						referrerPolicy: props.referrerPolicy
					});
				}
				return parentContext;
			case "link":
				type = props.rel;
				srcSet = props.href;
				if (!(parentContext & 1 || null != props.itemProp || "string" !== typeof type || "string" !== typeof srcSet || "" === srcSet)) switch (type) {
					case "preload":
						preload(srcSet, props.as, {
							crossOrigin: props.crossOrigin,
							integrity: props.integrity,
							nonce: props.nonce,
							type: props.type,
							fetchPriority: props.fetchPriority,
							referrerPolicy: props.referrerPolicy,
							imageSrcSet: props.imageSrcSet,
							imageSizes: props.imageSizes,
							media: props.media
						});
						break;
					case "modulepreload":
						preloadModule$1(srcSet, {
							as: props.as,
							crossOrigin: props.crossOrigin,
							integrity: props.integrity,
							nonce: props.nonce
						});
						break;
					case "stylesheet": preload(srcSet, "stylesheet", {
						crossOrigin: props.crossOrigin,
						integrity: props.integrity,
						nonce: props.nonce,
						type: props.type,
						fetchPriority: props.fetchPriority,
						referrerPolicy: props.referrerPolicy,
						media: props.media
					});
				}
				return parentContext;
			case "picture": return parentContext | 2;
			case "noscript": return parentContext | 1;
			default: return parentContext;
		}
	}
	var supportsRequestStorage = "function" === typeof AsyncLocalStorage, requestStorage = supportsRequestStorage ? new AsyncLocalStorage() : null, TEMPORARY_REFERENCE_TAG = Symbol.for("react.temporary.reference"), proxyHandlers = {
		get: function(target, name) {
			switch (name) {
				case "$$typeof": return target.$$typeof;
				case "name": return;
				case "displayName": return;
				case "defaultProps": return;
				case "_debugInfo": return;
				case "toJSON": return;
				case Symbol.toPrimitive: return Object.prototype[Symbol.toPrimitive];
				case Symbol.toStringTag: return Object.prototype[Symbol.toStringTag];
				case "Provider": throw Error("Cannot render a Client Context Provider on the Server. Instead, you can export a Client Component wrapper that itself renders a Client Context Provider.");
				case "then": return;
			}
			throw Error("Cannot access " + String(name) + " on the server. You cannot dot into a temporary client reference from a server component. You can only pass the value through to the client.");
		},
		set: function() {
			throw Error("Cannot assign to a temporary client reference from a server module.");
		}
	};
	function createTemporaryReference(temporaryReferences, id) {
		var reference = Object.defineProperties(function() {
			throw Error("Attempted to call a temporary Client Reference from the server but it is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
		}, { $$typeof: { value: TEMPORARY_REFERENCE_TAG } });
		reference = new Proxy(reference, proxyHandlers);
		temporaryReferences.set(reference, id);
		return reference;
	}
	function noop() {}
	var SuspenseException = Error("Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render. You must either rethrow it immediately, or move the `use` call outside of the `try/catch` block. Capturing without rethrowing will lead to unexpected behavior.\n\nTo handle async errors, wrap your component in an error boundary, or call the promise's `.catch` method and pass the result to `use`.");
	function trackUsedThenable(thenableState, thenable, index) {
		index = thenableState[index];
		void 0 === index ? thenableState.push(thenable) : index !== thenable && (thenable.then(noop, noop), thenable = index);
		switch (thenable.status) {
			case "fulfilled": return thenable.value;
			case "rejected": throw thenable.reason;
			default:
				"string" === typeof thenable.status ? thenable.then(noop, noop) : (thenableState = thenable, thenableState.status = "pending", thenableState.then(function(fulfilledValue) {
					if ("pending" === thenable.status) {
						var fulfilledThenable = thenable;
						fulfilledThenable.status = "fulfilled";
						fulfilledThenable.value = fulfilledValue;
					}
				}, function(error) {
					if ("pending" === thenable.status) {
						var rejectedThenable = thenable;
						rejectedThenable.status = "rejected";
						rejectedThenable.reason = error;
					}
				}));
				switch (thenable.status) {
					case "fulfilled": return thenable.value;
					case "rejected": throw thenable.reason;
				}
				suspendedThenable = thenable;
				throw SuspenseException;
		}
	}
	var suspendedThenable = null;
	function getSuspendedThenable() {
		if (null === suspendedThenable) throw Error("Expected a suspended thenable. This is a bug in React. Please file an issue.");
		var thenable = suspendedThenable;
		suspendedThenable = null;
		return thenable;
	}
	var currentRequest$1 = null, thenableIndexCounter = 0, thenableState = null;
	function getThenableStateAfterSuspending() {
		var state = thenableState || [];
		thenableState = null;
		return state;
	}
	var HooksDispatcher = {
		readContext: unsupportedContext,
		use,
		useCallback: function(callback) {
			return callback;
		},
		useContext: unsupportedContext,
		useEffect: unsupportedHook,
		useImperativeHandle: unsupportedHook,
		useLayoutEffect: unsupportedHook,
		useInsertionEffect: unsupportedHook,
		useMemo: function(nextCreate) {
			return nextCreate();
		},
		useReducer: unsupportedHook,
		useRef: unsupportedHook,
		useState: unsupportedHook,
		useDebugValue: function() {},
		useDeferredValue: unsupportedHook,
		useTransition: unsupportedHook,
		useSyncExternalStore: unsupportedHook,
		useId,
		useHostTransitionStatus: unsupportedHook,
		useFormState: unsupportedHook,
		useActionState: unsupportedHook,
		useOptimistic: unsupportedHook,
		useMemoCache: function(size) {
			for (var data = Array(size), i = 0; i < size; i++) data[i] = REACT_MEMO_CACHE_SENTINEL;
			return data;
		},
		useCacheRefresh: function() {
			return unsupportedRefresh;
		}
	};
	HooksDispatcher.useEffectEvent = unsupportedHook;
	function unsupportedHook() {
		throw Error("This Hook is not supported in Server Components.");
	}
	function unsupportedRefresh() {
		throw Error("Refreshing the cache is not supported in Server Components.");
	}
	function unsupportedContext() {
		throw Error("Cannot read a Client Context from a Server Component.");
	}
	function useId() {
		if (null === currentRequest$1) throw Error("useId can only be used while React is rendering");
		var id = currentRequest$1.identifierCount++;
		return "_" + currentRequest$1.identifierPrefix + "S_" + id.toString(32) + "_";
	}
	function use(usable) {
		if (null !== usable && "object" === typeof usable || "function" === typeof usable) {
			if ("function" === typeof usable.then) {
				var index = thenableIndexCounter;
				thenableIndexCounter += 1;
				null === thenableState && (thenableState = []);
				return trackUsedThenable(thenableState, usable, index);
			}
			usable.$$typeof === REACT_CONTEXT_TYPE && unsupportedContext();
		}
		if (usable.$$typeof === CLIENT_REFERENCE_TAG$1) {
			if (null != usable.value && usable.value.$$typeof === REACT_CONTEXT_TYPE) throw Error("Cannot read a Client Context from a Server Component.");
			throw Error("Cannot use() an already resolved Client Reference.");
		}
		throw Error("An unsupported type was passed to use(): " + String(usable));
	}
	var DefaultAsyncDispatcher = {
		getCacheForType: function(resourceType) {
			var JSCompiler_inline_result = (JSCompiler_inline_result = resolveRequest()) ? JSCompiler_inline_result.cache : /* @__PURE__ */ new Map();
			var entry = JSCompiler_inline_result.get(resourceType);
			void 0 === entry && (entry = resourceType(), JSCompiler_inline_result.set(resourceType, entry));
			return entry;
		},
		cacheSignal: function() {
			var request = resolveRequest();
			return request ? request.cacheController.signal : null;
		}
	}, ReactSharedInternalsServer = React.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	if (!ReactSharedInternalsServer) throw Error("The \"react\" package in this environment is not configured correctly. The \"react-server\" condition must be enabled in any environment that runs React Server Components.");
	var isArrayImpl = Array.isArray, getPrototypeOf = Object.getPrototypeOf;
	function objectName(object) {
		object = Object.prototype.toString.call(object);
		return object.slice(8, object.length - 1);
	}
	function describeValueForErrorMessage(value) {
		switch (typeof value) {
			case "string": return JSON.stringify(10 >= value.length ? value : value.slice(0, 10) + "...");
			case "object":
				if (isArrayImpl(value)) return "[...]";
				if (null !== value && value.$$typeof === CLIENT_REFERENCE_TAG) return "client";
				value = objectName(value);
				return "Object" === value ? "{...}" : value;
			case "function": return value.$$typeof === CLIENT_REFERENCE_TAG ? "client" : (value = value.displayName || value.name) ? "function " + value : "function";
			default: return String(value);
		}
	}
	function describeElementType(type) {
		if ("string" === typeof type) return type;
		switch (type) {
			case REACT_SUSPENSE_TYPE: return "Suspense";
			case REACT_SUSPENSE_LIST_TYPE: return "SuspenseList";
		}
		if ("object" === typeof type) switch (type.$$typeof) {
			case REACT_FORWARD_REF_TYPE: return describeElementType(type.render);
			case REACT_MEMO_TYPE: return describeElementType(type.type);
			case REACT_LAZY_TYPE:
				var payload = type._payload;
				type = type._init;
				try {
					return describeElementType(type(payload));
				} catch (x) {}
		}
		return "";
	}
	var CLIENT_REFERENCE_TAG = Symbol.for("react.client.reference");
	function describeObjectForErrorMessage(objectOrArray, expandedName) {
		var objKind = objectName(objectOrArray);
		if ("Object" !== objKind && "Array" !== objKind) return objKind;
		objKind = -1;
		var length = 0;
		if (isArrayImpl(objectOrArray)) {
			var str = "[";
			for (var i = 0; i < objectOrArray.length; i++) {
				0 < i && (str += ", ");
				var value = objectOrArray[i];
				value = "object" === typeof value && null !== value ? describeObjectForErrorMessage(value) : describeValueForErrorMessage(value);
				"" + i === expandedName ? (objKind = str.length, length = value.length, str += value) : str = 10 > value.length && 40 > str.length + value.length ? str + value : str + "...";
			}
			str += "]";
		} else if (objectOrArray.$$typeof === REACT_ELEMENT_TYPE) str = "<" + describeElementType(objectOrArray.type) + "/>";
		else {
			if (objectOrArray.$$typeof === CLIENT_REFERENCE_TAG) return "client";
			str = "{";
			i = Object.keys(objectOrArray);
			for (value = 0; value < i.length; value++) {
				0 < value && (str += ", ");
				var name = i[value], encodedKey = JSON.stringify(name);
				str += ("\"" + name + "\"" === encodedKey ? name : encodedKey) + ": ";
				encodedKey = objectOrArray[name];
				encodedKey = "object" === typeof encodedKey && null !== encodedKey ? describeObjectForErrorMessage(encodedKey) : describeValueForErrorMessage(encodedKey);
				name === expandedName ? (objKind = str.length, length = encodedKey.length, str += encodedKey) : str = 10 > encodedKey.length && 40 > str.length + encodedKey.length ? str + encodedKey : str + "...";
			}
			str += "}";
		}
		return void 0 === expandedName ? str : -1 < objKind && 0 < length ? (objectOrArray = " ".repeat(objKind) + "^".repeat(length), "\n  " + str + "\n  " + objectOrArray) : "\n  " + str;
	}
	var hasOwnProperty = Object.prototype.hasOwnProperty, ObjectPrototype$1 = Object.prototype, stringify = JSON.stringify;
	function defaultErrorHandler(error) {
		console.error(error);
	}
	function RequestInstance(type, model, bundlerConfig, onError, onPostpone, onAllReady, onFatalError, identifierPrefix, temporaryReferences) {
		if (null !== ReactSharedInternalsServer.A && ReactSharedInternalsServer.A !== DefaultAsyncDispatcher) throw Error("Currently React only supports one RSC renderer at a time.");
		ReactSharedInternalsServer.A = DefaultAsyncDispatcher;
		var abortSet = /* @__PURE__ */ new Set(), pingedTasks = [], hints = /* @__PURE__ */ new Set();
		this.type = type;
		this.status = 10;
		this.flushScheduled = !1;
		this.destination = this.fatalError = null;
		this.bundlerConfig = bundlerConfig;
		this.cache = /* @__PURE__ */ new Map();
		this.cacheController = new AbortController();
		this.pendingChunks = this.nextChunkId = 0;
		this.hints = hints;
		this.abortableTasks = abortSet;
		this.pingedTasks = pingedTasks;
		this.completedImportChunks = [];
		this.completedHintChunks = [];
		this.completedRegularChunks = [];
		this.completedErrorChunks = [];
		this.writtenSymbols = /* @__PURE__ */ new Map();
		this.writtenClientReferences = /* @__PURE__ */ new Map();
		this.writtenServerReferences = /* @__PURE__ */ new Map();
		this.writtenObjects = /* @__PURE__ */ new WeakMap();
		this.temporaryReferences = temporaryReferences;
		this.identifierPrefix = identifierPrefix || "";
		this.identifierCount = 1;
		this.taintCleanupQueue = [];
		this.onError = void 0 === onError ? defaultErrorHandler : onError;
		this.onPostpone = void 0 === onPostpone ? noop : onPostpone;
		this.onAllReady = onAllReady;
		this.onFatalError = onFatalError;
		type = createTask(this, model, null, !1, 0, abortSet);
		pingedTasks.push(type);
	}
	var currentRequest = null;
	function resolveRequest() {
		if (currentRequest) return currentRequest;
		if (supportsRequestStorage) {
			var store = requestStorage.getStore();
			if (store) return store;
		}
		return null;
	}
	function serializeThenable(request, task, thenable) {
		var newTask = createTask(request, thenable, task.keyPath, task.implicitSlot, task.formatContext, request.abortableTasks);
		switch (thenable.status) {
			case "fulfilled": return newTask.model = thenable.value, pingTask(request, newTask), newTask.id;
			case "rejected": return erroredTask(request, newTask, thenable.reason), newTask.id;
			default:
				if (12 === request.status) return request.abortableTasks.delete(newTask), 21 === request.type ? (haltTask(newTask), finishHaltedTask(newTask, request)) : (task = request.fatalError, abortTask(newTask), finishAbortedTask(newTask, request, task)), newTask.id;
				"string" !== typeof thenable.status && (thenable.status = "pending", thenable.then(function(fulfilledValue) {
					"pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
				}, function(error) {
					"pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
				}));
		}
		thenable.then(function(value) {
			newTask.model = value;
			pingTask(request, newTask);
		}, function(reason) {
			0 === newTask.status && (erroredTask(request, newTask, reason), enqueueFlush(request));
		});
		return newTask.id;
	}
	function serializeReadableStream(request, task, stream) {
		function progress(entry) {
			if (0 === streamTask.status) if (entry.done) streamTask.status = 1, entry = streamTask.id.toString(16) + ":C\n", request.completedRegularChunks.push(stringToChunk(entry)), request.abortableTasks.delete(streamTask), request.cacheController.signal.removeEventListener("abort", abortStream), enqueueFlush(request), callOnAllReadyIfReady(request);
			else try {
				streamTask.model = entry.value, request.pendingChunks++, tryStreamTask(request, streamTask), enqueueFlush(request), reader.read().then(progress, error);
			} catch (x$11) {
				error(x$11);
			}
		}
		function error(reason) {
			0 === streamTask.status && (request.cacheController.signal.removeEventListener("abort", abortStream), erroredTask(request, streamTask, reason), enqueueFlush(request), reader.cancel(reason).then(error, error));
		}
		function abortStream() {
			if (0 === streamTask.status) {
				var signal = request.cacheController.signal;
				signal.removeEventListener("abort", abortStream);
				signal = signal.reason;
				21 === request.type ? (request.abortableTasks.delete(streamTask), haltTask(streamTask), finishHaltedTask(streamTask, request)) : (erroredTask(request, streamTask, signal), enqueueFlush(request));
				reader.cancel(signal).then(error, error);
			}
		}
		var supportsBYOB = stream.supportsBYOB;
		if (void 0 === supportsBYOB) try {
			stream.getReader({ mode: "byob" }).releaseLock(), supportsBYOB = !0;
		} catch (x) {
			supportsBYOB = !1;
		}
		var reader = stream.getReader(), streamTask = createTask(request, task.model, task.keyPath, task.implicitSlot, task.formatContext, request.abortableTasks);
		request.pendingChunks++;
		task = streamTask.id.toString(16) + ":" + (supportsBYOB ? "r" : "R") + "\n";
		request.completedRegularChunks.push(stringToChunk(task));
		request.cacheController.signal.addEventListener("abort", abortStream);
		reader.read().then(progress, error);
		return serializeByValueID(streamTask.id);
	}
	function serializeAsyncIterable(request, task, iterable, iterator) {
		function progress(entry) {
			if (0 === streamTask.status) if (entry.done) {
				streamTask.status = 1;
				if (void 0 === entry.value) var endStreamRow = streamTask.id.toString(16) + ":C\n";
				else try {
					var chunkId = outlineModelWithFormatContext(request, entry.value, 0);
					endStreamRow = streamTask.id.toString(16) + ":C" + stringify(serializeByValueID(chunkId)) + "\n";
				} catch (x) {
					error(x);
					return;
				}
				request.completedRegularChunks.push(stringToChunk(endStreamRow));
				request.abortableTasks.delete(streamTask);
				request.cacheController.signal.removeEventListener("abort", abortIterable);
				enqueueFlush(request);
				callOnAllReadyIfReady(request);
			} else try {
				streamTask.model = entry.value, request.pendingChunks++, tryStreamTask(request, streamTask), enqueueFlush(request), iterator.next().then(progress, error);
			} catch (x$12) {
				error(x$12);
			}
		}
		function error(reason) {
			0 === streamTask.status && (request.cacheController.signal.removeEventListener("abort", abortIterable), erroredTask(request, streamTask, reason), enqueueFlush(request), "function" === typeof iterator.throw && iterator.throw(reason).then(error, error));
		}
		function abortIterable() {
			if (0 === streamTask.status) {
				var signal = request.cacheController.signal;
				signal.removeEventListener("abort", abortIterable);
				var reason = signal.reason;
				21 === request.type ? (request.abortableTasks.delete(streamTask), haltTask(streamTask), finishHaltedTask(streamTask, request)) : (erroredTask(request, streamTask, signal.reason), enqueueFlush(request));
				"function" === typeof iterator.throw && iterator.throw(reason).then(error, error);
			}
		}
		iterable = iterable === iterator;
		var streamTask = createTask(request, task.model, task.keyPath, task.implicitSlot, task.formatContext, request.abortableTasks);
		request.pendingChunks++;
		task = streamTask.id.toString(16) + ":" + (iterable ? "x" : "X") + "\n";
		request.completedRegularChunks.push(stringToChunk(task));
		request.cacheController.signal.addEventListener("abort", abortIterable);
		iterator.next().then(progress, error);
		return serializeByValueID(streamTask.id);
	}
	function emitHint(request, code, model) {
		model = stringify(model);
		code = stringToChunk(":H" + code + model + "\n");
		request.completedHintChunks.push(code);
		enqueueFlush(request);
	}
	function readThenable(thenable) {
		if ("fulfilled" === thenable.status) return thenable.value;
		if ("rejected" === thenable.status) throw thenable.reason;
		throw thenable;
	}
	function createLazyWrapperAroundWakeable(request, task, wakeable) {
		switch (wakeable.status) {
			case "fulfilled": return wakeable.value;
			case "rejected": break;
			default: "string" !== typeof wakeable.status && (wakeable.status = "pending", wakeable.then(function(fulfilledValue) {
				"pending" === wakeable.status && (wakeable.status = "fulfilled", wakeable.value = fulfilledValue);
			}, function(error) {
				"pending" === wakeable.status && (wakeable.status = "rejected", wakeable.reason = error);
			}));
		}
		return {
			$$typeof: REACT_LAZY_TYPE,
			_payload: wakeable,
			_init: readThenable
		};
	}
	function voidHandler() {}
	function processServerComponentReturnValue(request, task, Component, result) {
		if ("object" !== typeof result || null === result || result.$$typeof === CLIENT_REFERENCE_TAG$1) return result;
		if ("function" === typeof result.then) return createLazyWrapperAroundWakeable(request, task, result);
		var iteratorFn = getIteratorFn(result);
		return iteratorFn ? (request = {}, request[Symbol.iterator] = function() {
			return iteratorFn.call(result);
		}, request) : "function" !== typeof result[ASYNC_ITERATOR] || "function" === typeof ReadableStream && result instanceof ReadableStream ? result : (request = {}, request[ASYNC_ITERATOR] = function() {
			return result[ASYNC_ITERATOR]();
		}, request);
	}
	function renderFunctionComponent(request, task, key, Component, props) {
		var prevThenableState = task.thenableState;
		task.thenableState = null;
		thenableIndexCounter = 0;
		thenableState = prevThenableState;
		props = Component(props, void 0);
		if (12 === request.status) throw "object" === typeof props && null !== props && "function" === typeof props.then && props.$$typeof !== CLIENT_REFERENCE_TAG$1 && props.then(voidHandler, voidHandler), null;
		props = processServerComponentReturnValue(request, task, Component, props);
		Component = task.keyPath;
		prevThenableState = task.implicitSlot;
		null !== key ? task.keyPath = null === Component ? key : Component + "," + key : null === Component && (task.implicitSlot = !0);
		request = renderModelDestructive(request, task, emptyRoot, "", props);
		task.keyPath = Component;
		task.implicitSlot = prevThenableState;
		return request;
	}
	function renderFragment(request, task, children) {
		return null !== task.keyPath ? (request = [
			REACT_ELEMENT_TYPE,
			REACT_FRAGMENT_TYPE,
			task.keyPath,
			{ children }
		], task.implicitSlot ? [request] : request) : children;
	}
	var serializedSize = 0;
	function deferTask(request, task) {
		task = createTask(request, task.model, task.keyPath, task.implicitSlot, task.formatContext, request.abortableTasks);
		pingTask(request, task);
		return serializeLazyID(task.id);
	}
	function renderElement(request, task, type, key, ref, props) {
		if (null !== ref && void 0 !== ref) throw Error("Refs cannot be used in Server Components, nor passed to Client Components.");
		if ("function" === typeof type && type.$$typeof !== CLIENT_REFERENCE_TAG$1 && type.$$typeof !== TEMPORARY_REFERENCE_TAG) return renderFunctionComponent(request, task, key, type, props);
		if (type === REACT_FRAGMENT_TYPE && null === key) return type = task.implicitSlot, null === task.keyPath && (task.implicitSlot = !0), props = renderModelDestructive(request, task, emptyRoot, "", props.children), task.implicitSlot = type, props;
		if (null != type && "object" === typeof type && type.$$typeof !== CLIENT_REFERENCE_TAG$1) switch (type.$$typeof) {
			case REACT_LAZY_TYPE:
				var init = type._init;
				type = init(type._payload);
				if (12 === request.status) throw null;
				return renderElement(request, task, type, key, ref, props);
			case REACT_FORWARD_REF_TYPE: return renderFunctionComponent(request, task, key, type.render, props);
			case REACT_MEMO_TYPE: return renderElement(request, task, type.type, key, ref, props);
		}
		else "string" === typeof type && (ref = task.formatContext, init = getChildFormatContext(ref, type, props), ref !== init && null != props.children && outlineModelWithFormatContext(request, props.children, init));
		request = key;
		key = task.keyPath;
		null === request ? request = key : null !== key && (request = key + "," + request);
		props = [
			REACT_ELEMENT_TYPE,
			type,
			request,
			props
		];
		task = task.implicitSlot && null !== request ? [props] : props;
		return task;
	}
	function pingTask(request, task) {
		var pingedTasks = request.pingedTasks;
		pingedTasks.push(task);
		1 === pingedTasks.length && (request.flushScheduled = null !== request.destination, 21 === request.type || 10 === request.status ? scheduleMicrotask(function() {
			return performWork(request);
		}) : setTimeout(function() {
			return performWork(request);
		}, 0));
	}
	function createTask(request, model, keyPath, implicitSlot, formatContext, abortSet) {
		request.pendingChunks++;
		var id = request.nextChunkId++;
		"object" !== typeof model || null === model || null !== keyPath || implicitSlot || request.writtenObjects.set(model, serializeByValueID(id));
		var task = {
			id,
			status: 0,
			model,
			keyPath,
			implicitSlot,
			formatContext,
			ping: function() {
				return pingTask(request, task);
			},
			toJSON: function(parentPropertyName, value) {
				serializedSize += parentPropertyName.length;
				var prevKeyPath = task.keyPath, prevImplicitSlot = task.implicitSlot;
				try {
					var JSCompiler_inline_result = renderModelDestructive(request, task, this, parentPropertyName, value);
				} catch (thrownValue) {
					if (parentPropertyName = task.model, parentPropertyName = "object" === typeof parentPropertyName && null !== parentPropertyName && (parentPropertyName.$$typeof === REACT_ELEMENT_TYPE || parentPropertyName.$$typeof === REACT_LAZY_TYPE), 12 === request.status) task.status = 3, 21 === request.type ? (prevKeyPath = request.nextChunkId++, prevKeyPath = parentPropertyName ? serializeLazyID(prevKeyPath) : serializeByValueID(prevKeyPath), JSCompiler_inline_result = prevKeyPath) : (prevKeyPath = request.fatalError, JSCompiler_inline_result = parentPropertyName ? serializeLazyID(prevKeyPath) : serializeByValueID(prevKeyPath));
					else if (value = thrownValue === SuspenseException ? getSuspendedThenable() : thrownValue, "object" === typeof value && null !== value && "function" === typeof value.then) {
						JSCompiler_inline_result = createTask(request, task.model, task.keyPath, task.implicitSlot, task.formatContext, request.abortableTasks);
						var ping = JSCompiler_inline_result.ping;
						value.then(ping, ping);
						JSCompiler_inline_result.thenableState = getThenableStateAfterSuspending();
						task.keyPath = prevKeyPath;
						task.implicitSlot = prevImplicitSlot;
						JSCompiler_inline_result = parentPropertyName ? serializeLazyID(JSCompiler_inline_result.id) : serializeByValueID(JSCompiler_inline_result.id);
					} else task.keyPath = prevKeyPath, task.implicitSlot = prevImplicitSlot, request.pendingChunks++, prevKeyPath = request.nextChunkId++, prevImplicitSlot = logRecoverableError(request, value, task), emitErrorChunk(request, prevKeyPath, prevImplicitSlot), JSCompiler_inline_result = parentPropertyName ? serializeLazyID(prevKeyPath) : serializeByValueID(prevKeyPath);
				}
				return JSCompiler_inline_result;
			},
			thenableState: null
		};
		abortSet.add(task);
		return task;
	}
	function serializeByValueID(id) {
		return "$" + id.toString(16);
	}
	function serializeLazyID(id) {
		return "$L" + id.toString(16);
	}
	function encodeReferenceChunk(request, id, reference) {
		request = stringify(reference);
		id = id.toString(16) + ":" + request + "\n";
		return stringToChunk(id);
	}
	function serializeClientReference(request, parent, parentPropertyName, clientReference) {
		var clientReferenceKey = clientReference.$$async ? clientReference.$$id + "#async" : clientReference.$$id, writtenClientReferences = request.writtenClientReferences, existingId = writtenClientReferences.get(clientReferenceKey);
		if (void 0 !== existingId) return parent[0] === REACT_ELEMENT_TYPE && "1" === parentPropertyName ? serializeLazyID(existingId) : serializeByValueID(existingId);
		try {
			var config = request.bundlerConfig, modulePath = clientReference.$$id;
			existingId = "";
			var resolvedModuleData = config[modulePath];
			if (resolvedModuleData) existingId = resolvedModuleData.name;
			else {
				var idx = modulePath.lastIndexOf("#");
				-1 !== idx && (existingId = modulePath.slice(idx + 1), resolvedModuleData = config[modulePath.slice(0, idx)]);
				if (!resolvedModuleData) throw Error("Could not find the module \"" + modulePath + "\" in the React Client Manifest. This is probably a bug in the React Server Components bundler.");
			}
			if (!0 === resolvedModuleData.async && !0 === clientReference.$$async) throw Error("The module \"" + modulePath + "\" is marked as an async ESM module but was loaded as a CJS proxy. This is probably a bug in the React Server Components bundler.");
			var JSCompiler_inline_result = !0 === resolvedModuleData.async || !0 === clientReference.$$async ? [
				resolvedModuleData.id,
				resolvedModuleData.chunks,
				existingId,
				1
			] : [
				resolvedModuleData.id,
				resolvedModuleData.chunks,
				existingId
			];
			request.pendingChunks++;
			var importId = request.nextChunkId++, json = stringify(JSCompiler_inline_result), processedChunk = stringToChunk(importId.toString(16) + ":I" + json + "\n");
			request.completedImportChunks.push(processedChunk);
			writtenClientReferences.set(clientReferenceKey, importId);
			return parent[0] === REACT_ELEMENT_TYPE && "1" === parentPropertyName ? serializeLazyID(importId) : serializeByValueID(importId);
		} catch (x) {
			return request.pendingChunks++, parent = request.nextChunkId++, parentPropertyName = logRecoverableError(request, x, null), emitErrorChunk(request, parent, parentPropertyName), serializeByValueID(parent);
		}
	}
	function outlineModelWithFormatContext(request, value, formatContext) {
		value = createTask(request, value, null, !1, formatContext, request.abortableTasks);
		retryTask(request, value);
		return value.id;
	}
	function serializeTypedArray(request, tag, typedArray) {
		request.pendingChunks++;
		var bufferId = request.nextChunkId++;
		emitTypedArrayChunk(request, bufferId, tag, typedArray, !1);
		return serializeByValueID(bufferId);
	}
	function serializeBlob(request, blob) {
		function progress(entry) {
			if (0 === newTask.status) if (entry.done) request.cacheController.signal.removeEventListener("abort", abortBlob), pingTask(request, newTask);
			else return model.push(entry.value), reader.read().then(progress).catch(error);
		}
		function error(reason) {
			0 === newTask.status && (request.cacheController.signal.removeEventListener("abort", abortBlob), erroredTask(request, newTask, reason), enqueueFlush(request), reader.cancel(reason).then(error, error));
		}
		function abortBlob() {
			if (0 === newTask.status) {
				var signal = request.cacheController.signal;
				signal.removeEventListener("abort", abortBlob);
				signal = signal.reason;
				21 === request.type ? (request.abortableTasks.delete(newTask), haltTask(newTask), finishHaltedTask(newTask, request)) : (erroredTask(request, newTask, signal), enqueueFlush(request));
				reader.cancel(signal).then(error, error);
			}
		}
		var model = [blob.type], newTask = createTask(request, model, null, !1, 0, request.abortableTasks), reader = blob.stream().getReader();
		request.cacheController.signal.addEventListener("abort", abortBlob);
		reader.read().then(progress).catch(error);
		return "$B" + newTask.id.toString(16);
	}
	var modelRoot = !1;
	function renderModelDestructive(request, task, parent, parentPropertyName, value) {
		task.model = value;
		if (value === REACT_ELEMENT_TYPE) return "$";
		if (null === value) return null;
		if ("object" === typeof value) {
			switch (value.$$typeof) {
				case REACT_ELEMENT_TYPE:
					var elementReference = null, writtenObjects = request.writtenObjects;
					if (null === task.keyPath && !task.implicitSlot) {
						var existingReference = writtenObjects.get(value);
						if (void 0 !== existingReference) if (modelRoot === value) modelRoot = null;
						else return existingReference;
						else -1 === parentPropertyName.indexOf(":") && (parent = writtenObjects.get(parent), void 0 !== parent && (elementReference = parent + ":" + parentPropertyName, writtenObjects.set(value, elementReference)));
					}
					if (3200 < serializedSize) return deferTask(request, task);
					parentPropertyName = value.props;
					parent = parentPropertyName.ref;
					request = renderElement(request, task, value.type, value.key, void 0 !== parent ? parent : null, parentPropertyName);
					"object" === typeof request && null !== request && null !== elementReference && (writtenObjects.has(request) || writtenObjects.set(request, elementReference));
					return request;
				case REACT_LAZY_TYPE:
					if (3200 < serializedSize) return deferTask(request, task);
					task.thenableState = null;
					parentPropertyName = value._init;
					value = parentPropertyName(value._payload);
					if (12 === request.status) throw null;
					return renderModelDestructive(request, task, emptyRoot, "", value);
				case REACT_LEGACY_ELEMENT_TYPE: throw Error("A React Element from an older version of React was rendered. This is not supported. It can happen if:\n- Multiple copies of the \"react\" package is used.\n- A library pre-bundled an old copy of \"react\" or \"react/jsx-runtime\".\n- A compiler tries to \"inline\" JSX instead of using the runtime.");
			}
			if (value.$$typeof === CLIENT_REFERENCE_TAG$1) return serializeClientReference(request, parent, parentPropertyName, value);
			if (void 0 !== request.temporaryReferences && (elementReference = request.temporaryReferences.get(value), void 0 !== elementReference)) return "$T" + elementReference;
			elementReference = request.writtenObjects;
			writtenObjects = elementReference.get(value);
			if ("function" === typeof value.then) {
				if (void 0 !== writtenObjects) {
					if (null !== task.keyPath || task.implicitSlot) return "$@" + serializeThenable(request, task, value).toString(16);
					if (modelRoot === value) modelRoot = null;
					else return writtenObjects;
				}
				request = "$@" + serializeThenable(request, task, value).toString(16);
				elementReference.set(value, request);
				return request;
			}
			if (void 0 !== writtenObjects) if (modelRoot === value) {
				if (writtenObjects !== serializeByValueID(task.id)) return writtenObjects;
				modelRoot = null;
			} else return writtenObjects;
			else if (-1 === parentPropertyName.indexOf(":") && (writtenObjects = elementReference.get(parent), void 0 !== writtenObjects)) {
				existingReference = parentPropertyName;
				if (isArrayImpl(parent) && parent[0] === REACT_ELEMENT_TYPE) switch (parentPropertyName) {
					case "1":
						existingReference = "type";
						break;
					case "2":
						existingReference = "key";
						break;
					case "3":
						existingReference = "props";
						break;
					case "4": existingReference = "_owner";
				}
				elementReference.set(value, writtenObjects + ":" + existingReference);
			}
			if (isArrayImpl(value)) return renderFragment(request, task, value);
			if (value instanceof Map) return value = Array.from(value), "$Q" + outlineModelWithFormatContext(request, value, 0).toString(16);
			if (value instanceof Set) return value = Array.from(value), "$W" + outlineModelWithFormatContext(request, value, 0).toString(16);
			if ("function" === typeof FormData && value instanceof FormData) return value = Array.from(value.entries()), "$K" + outlineModelWithFormatContext(request, value, 0).toString(16);
			if (value instanceof Error) return "$Z";
			if (value instanceof ArrayBuffer) return serializeTypedArray(request, "A", new Uint8Array(value));
			if (value instanceof Int8Array) return serializeTypedArray(request, "O", value);
			if (value instanceof Uint8Array) return serializeTypedArray(request, "o", value);
			if (value instanceof Uint8ClampedArray) return serializeTypedArray(request, "U", value);
			if (value instanceof Int16Array) return serializeTypedArray(request, "S", value);
			if (value instanceof Uint16Array) return serializeTypedArray(request, "s", value);
			if (value instanceof Int32Array) return serializeTypedArray(request, "L", value);
			if (value instanceof Uint32Array) return serializeTypedArray(request, "l", value);
			if (value instanceof Float32Array) return serializeTypedArray(request, "G", value);
			if (value instanceof Float64Array) return serializeTypedArray(request, "g", value);
			if (value instanceof BigInt64Array) return serializeTypedArray(request, "M", value);
			if (value instanceof BigUint64Array) return serializeTypedArray(request, "m", value);
			if (value instanceof DataView) return serializeTypedArray(request, "V", value);
			if ("function" === typeof Blob && value instanceof Blob) return serializeBlob(request, value);
			if (elementReference = getIteratorFn(value)) return parentPropertyName = elementReference.call(value), parentPropertyName === value ? (value = Array.from(parentPropertyName), "$i" + outlineModelWithFormatContext(request, value, 0).toString(16)) : renderFragment(request, task, Array.from(parentPropertyName));
			if ("function" === typeof ReadableStream && value instanceof ReadableStream) return serializeReadableStream(request, task, value);
			elementReference = value[ASYNC_ITERATOR];
			if ("function" === typeof elementReference) return null !== task.keyPath ? (request = [
				REACT_ELEMENT_TYPE,
				REACT_FRAGMENT_TYPE,
				task.keyPath,
				{ children: value }
			], request = task.implicitSlot ? [request] : request) : (parentPropertyName = elementReference.call(value), request = serializeAsyncIterable(request, task, value, parentPropertyName)), request;
			if (value instanceof Date) return "$D" + value.toJSON();
			request = getPrototypeOf(value);
			if (request !== ObjectPrototype$1 && (null === request || null !== getPrototypeOf(request))) throw Error("Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. Classes or null prototypes are not supported." + describeObjectForErrorMessage(parent, parentPropertyName));
			return value;
		}
		if ("string" === typeof value) {
			serializedSize += value.length;
			if ("Z" === value[value.length - 1] && parent[parentPropertyName] instanceof Date) return "$D" + value;
			if (1024 <= value.length && null !== byteLengthOfChunk) return request.pendingChunks++, task = request.nextChunkId++, emitTextChunk(request, task, value, !1), serializeByValueID(task);
			request = "$" === value[0] ? "$" + value : value;
			return request;
		}
		if ("boolean" === typeof value) return value;
		if ("number" === typeof value) return Number.isFinite(value) ? 0 === value && -Infinity === 1 / value ? "$-0" : value : Infinity === value ? "$Infinity" : -Infinity === value ? "$-Infinity" : "$NaN";
		if ("undefined" === typeof value) return "$undefined";
		if ("function" === typeof value) {
			if (value.$$typeof === CLIENT_REFERENCE_TAG$1) return serializeClientReference(request, parent, parentPropertyName, value);
			if (value.$$typeof === SERVER_REFERENCE_TAG) return task = request.writtenServerReferences, parentPropertyName = task.get(value), void 0 !== parentPropertyName ? request = "$h" + parentPropertyName.toString(16) : (parentPropertyName = value.$$bound, parentPropertyName = null === parentPropertyName ? null : Promise.resolve(parentPropertyName), request = outlineModelWithFormatContext(request, {
				id: value.$$id,
				bound: parentPropertyName
			}, 0), task.set(value, request), request = "$h" + request.toString(16)), request;
			if (void 0 !== request.temporaryReferences && (request = request.temporaryReferences.get(value), void 0 !== request)) return "$T" + request;
			if (value.$$typeof === TEMPORARY_REFERENCE_TAG) throw Error("Could not reference an opaque temporary reference. This is likely due to misconfiguring the temporaryReferences options on the server.");
			if (/^on[A-Z]/.test(parentPropertyName)) throw Error("Event handlers cannot be passed to Client Component props." + describeObjectForErrorMessage(parent, parentPropertyName) + "\nIf you need interactivity, consider converting part of this to a Client Component.");
			throw Error("Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with \"use server\". Or maybe you meant to call this function rather than return it." + describeObjectForErrorMessage(parent, parentPropertyName));
		}
		if ("symbol" === typeof value) {
			task = request.writtenSymbols;
			elementReference = task.get(value);
			if (void 0 !== elementReference) return serializeByValueID(elementReference);
			elementReference = value.description;
			if (Symbol.for(elementReference) !== value) throw Error("Only global symbols received from Symbol.for(...) can be passed to Client Components. The symbol Symbol.for(" + (value.description + ") cannot be found among global symbols.") + describeObjectForErrorMessage(parent, parentPropertyName));
			request.pendingChunks++;
			parentPropertyName = request.nextChunkId++;
			parent = encodeReferenceChunk(request, parentPropertyName, "$S" + elementReference);
			request.completedImportChunks.push(parent);
			task.set(value, parentPropertyName);
			return serializeByValueID(parentPropertyName);
		}
		if ("bigint" === typeof value) return "$n" + value.toString(10);
		throw Error("Type " + typeof value + " is not supported in Client Component props." + describeObjectForErrorMessage(parent, parentPropertyName));
	}
	function logRecoverableError(request, error) {
		var prevRequest = currentRequest;
		currentRequest = null;
		try {
			var onError = request.onError;
			var errorDigest = supportsRequestStorage ? requestStorage.run(void 0, onError, error) : onError(error);
		} finally {
			currentRequest = prevRequest;
		}
		if (null != errorDigest && "string" !== typeof errorDigest) throw Error("onError returned something with a type other than \"string\". onError should return a string and may return null or undefined but must not return anything else. It received something of type \"" + typeof errorDigest + "\" instead");
		return errorDigest || "";
	}
	function fatalError(request, error) {
		var onFatalError = request.onFatalError;
		onFatalError(error);
		null !== request.destination ? (request.status = 14, closeWithError(request.destination, error)) : (request.status = 13, request.fatalError = error);
		request.cacheController.abort(Error("The render was aborted due to a fatal error.", { cause: error }));
	}
	function emitErrorChunk(request, id, digest) {
		digest = { digest };
		id = id.toString(16) + ":E" + stringify(digest) + "\n";
		id = stringToChunk(id);
		request.completedErrorChunks.push(id);
	}
	function emitModelChunk(request, id, json) {
		id = id.toString(16) + ":" + json + "\n";
		id = stringToChunk(id);
		request.completedRegularChunks.push(id);
	}
	function emitTypedArrayChunk(request, id, tag, typedArray, debug) {
		debug ? request.pendingDebugChunks++ : request.pendingChunks++;
		debug = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
		typedArray = 2048 < typedArray.byteLength ? debug.slice() : debug;
		debug = typedArray.byteLength;
		id = id.toString(16) + ":" + tag + debug.toString(16) + ",";
		id = stringToChunk(id);
		request.completedRegularChunks.push(id, typedArray);
	}
	function emitTextChunk(request, id, text, debug) {
		if (null === byteLengthOfChunk) throw Error("Existence of byteLengthOfChunk should have already been checked. This is a bug in React.");
		debug ? request.pendingDebugChunks++ : request.pendingChunks++;
		text = stringToChunk(text);
		debug = text.byteLength;
		id = id.toString(16) + ":T" + debug.toString(16) + ",";
		id = stringToChunk(id);
		request.completedRegularChunks.push(id, text);
	}
	function emitChunk(request, task, value) {
		var id = task.id;
		"string" === typeof value && null !== byteLengthOfChunk ? emitTextChunk(request, id, value, !1) : value instanceof ArrayBuffer ? emitTypedArrayChunk(request, id, "A", new Uint8Array(value), !1) : value instanceof Int8Array ? emitTypedArrayChunk(request, id, "O", value, !1) : value instanceof Uint8Array ? emitTypedArrayChunk(request, id, "o", value, !1) : value instanceof Uint8ClampedArray ? emitTypedArrayChunk(request, id, "U", value, !1) : value instanceof Int16Array ? emitTypedArrayChunk(request, id, "S", value, !1) : value instanceof Uint16Array ? emitTypedArrayChunk(request, id, "s", value, !1) : value instanceof Int32Array ? emitTypedArrayChunk(request, id, "L", value, !1) : value instanceof Uint32Array ? emitTypedArrayChunk(request, id, "l", value, !1) : value instanceof Float32Array ? emitTypedArrayChunk(request, id, "G", value, !1) : value instanceof Float64Array ? emitTypedArrayChunk(request, id, "g", value, !1) : value instanceof BigInt64Array ? emitTypedArrayChunk(request, id, "M", value, !1) : value instanceof BigUint64Array ? emitTypedArrayChunk(request, id, "m", value, !1) : value instanceof DataView ? emitTypedArrayChunk(request, id, "V", value, !1) : (value = stringify(value, task.toJSON), emitModelChunk(request, task.id, value));
	}
	function erroredTask(request, task, error) {
		task.status = 4;
		error = logRecoverableError(request, error, task);
		emitErrorChunk(request, task.id, error);
		request.abortableTasks.delete(task);
		callOnAllReadyIfReady(request);
	}
	var emptyRoot = {};
	function retryTask(request, task) {
		if (0 === task.status) {
			task.status = 5;
			var parentSerializedSize = serializedSize;
			try {
				modelRoot = task.model;
				var resolvedModel = renderModelDestructive(request, task, emptyRoot, "", task.model);
				modelRoot = resolvedModel;
				task.keyPath = null;
				task.implicitSlot = !1;
				if ("object" === typeof resolvedModel && null !== resolvedModel) request.writtenObjects.set(resolvedModel, serializeByValueID(task.id)), emitChunk(request, task, resolvedModel);
				else {
					var json = stringify(resolvedModel);
					emitModelChunk(request, task.id, json);
				}
				task.status = 1;
				request.abortableTasks.delete(task);
				callOnAllReadyIfReady(request);
			} catch (thrownValue) {
				if (12 === request.status) if (request.abortableTasks.delete(task), task.status = 0, 21 === request.type) haltTask(task), finishHaltedTask(task, request);
				else {
					var errorId = request.fatalError;
					abortTask(task);
					finishAbortedTask(task, request, errorId);
				}
				else {
					var x = thrownValue === SuspenseException ? getSuspendedThenable() : thrownValue;
					if ("object" === typeof x && null !== x && "function" === typeof x.then) {
						task.status = 0;
						task.thenableState = getThenableStateAfterSuspending();
						var ping = task.ping;
						x.then(ping, ping);
					} else erroredTask(request, task, x);
				}
			} finally {
				serializedSize = parentSerializedSize;
			}
		}
	}
	function tryStreamTask(request, task) {
		var parentSerializedSize = serializedSize;
		try {
			emitChunk(request, task, task.model);
		} finally {
			serializedSize = parentSerializedSize;
		}
	}
	function performWork(request) {
		var prevDispatcher = ReactSharedInternalsServer.H;
		ReactSharedInternalsServer.H = HooksDispatcher;
		var prevRequest = currentRequest;
		currentRequest$1 = currentRequest = request;
		try {
			var pingedTasks = request.pingedTasks;
			request.pingedTasks = [];
			for (var i = 0; i < pingedTasks.length; i++) retryTask(request, pingedTasks[i]);
			flushCompletedChunks(request);
		} catch (error) {
			logRecoverableError(request, error, null), fatalError(request, error);
		} finally {
			ReactSharedInternalsServer.H = prevDispatcher, currentRequest$1 = null, currentRequest = prevRequest;
		}
	}
	function abortTask(task) {
		0 === task.status && (task.status = 3);
	}
	function finishAbortedTask(task, request, errorId) {
		3 === task.status && (errorId = serializeByValueID(errorId), task = encodeReferenceChunk(request, task.id, errorId), request.completedErrorChunks.push(task));
	}
	function haltTask(task) {
		0 === task.status && (task.status = 3);
	}
	function finishHaltedTask(task, request) {
		3 === task.status && request.pendingChunks--;
	}
	function flushCompletedChunks(request) {
		var destination = request.destination;
		if (null !== destination) {
			currentView = new Uint8Array(2048);
			writtenBytes = 0;
			try {
				for (var importsChunks = request.completedImportChunks, i = 0; i < importsChunks.length; i++) request.pendingChunks--, writeChunkAndReturn(destination, importsChunks[i]);
				importsChunks.splice(0, i);
				var hintChunks = request.completedHintChunks;
				for (i = 0; i < hintChunks.length; i++) writeChunkAndReturn(destination, hintChunks[i]);
				hintChunks.splice(0, i);
				var regularChunks = request.completedRegularChunks;
				for (i = 0; i < regularChunks.length; i++) request.pendingChunks--, writeChunkAndReturn(destination, regularChunks[i]);
				regularChunks.splice(0, i);
				var errorChunks = request.completedErrorChunks;
				for (i = 0; i < errorChunks.length; i++) request.pendingChunks--, writeChunkAndReturn(destination, errorChunks[i]);
				errorChunks.splice(0, i);
			} finally {
				request.flushScheduled = !1, currentView && 0 < writtenBytes && (destination.enqueue(new Uint8Array(currentView.buffer, 0, writtenBytes)), currentView = null, writtenBytes = 0);
			}
		}
		0 === request.pendingChunks && (12 > request.status && request.cacheController.abort(Error("This render completed successfully. All cacheSignals are now aborted to allow clean up of any unused resources.")), null !== request.destination && (request.status = 14, request.destination.close(), request.destination = null));
	}
	function startWork(request) {
		request.flushScheduled = null !== request.destination;
		supportsRequestStorage ? scheduleMicrotask(function() {
			requestStorage.run(request, performWork, request);
		}) : scheduleMicrotask(function() {
			return performWork(request);
		});
		setTimeout(function() {
			10 === request.status && (request.status = 11);
		}, 0);
	}
	function enqueueFlush(request) {
		!1 === request.flushScheduled && 0 === request.pingedTasks.length && null !== request.destination && (request.flushScheduled = !0, setTimeout(function() {
			request.flushScheduled = !1;
			flushCompletedChunks(request);
		}, 0));
	}
	function callOnAllReadyIfReady(request) {
		0 === request.abortableTasks.size && (request = request.onAllReady, request());
	}
	function startFlowing(request, destination) {
		if (13 === request.status) request.status = 14, closeWithError(destination, request.fatalError);
		else if (14 !== request.status && null === request.destination) {
			request.destination = destination;
			try {
				flushCompletedChunks(request);
			} catch (error) {
				logRecoverableError(request, error, null), fatalError(request, error);
			}
		}
	}
	function finishHalt(request, abortedTasks) {
		try {
			abortedTasks.forEach(function(task) {
				return finishHaltedTask(task, request);
			});
			var onAllReady = request.onAllReady;
			onAllReady();
			flushCompletedChunks(request);
		} catch (error) {
			logRecoverableError(request, error, null), fatalError(request, error);
		}
	}
	function finishAbort(request, abortedTasks, errorId) {
		try {
			abortedTasks.forEach(function(task) {
				return finishAbortedTask(task, request, errorId);
			});
			var onAllReady = request.onAllReady;
			onAllReady();
			flushCompletedChunks(request);
		} catch (error) {
			logRecoverableError(request, error, null), fatalError(request, error);
		}
	}
	function abort(request, reason) {
		if (!(11 < request.status)) try {
			request.status = 12;
			request.cacheController.abort(reason);
			var abortableTasks = request.abortableTasks;
			if (0 < abortableTasks.size) if (21 === request.type) abortableTasks.forEach(function(task) {
				return haltTask(task, request);
			}), setTimeout(function() {
				return finishHalt(request, abortableTasks);
			}, 0);
			else {
				var error = void 0 === reason ? Error("The render was aborted by the server without a reason.") : "object" === typeof reason && null !== reason && "function" === typeof reason.then ? Error("The render was aborted by the server with a promise.") : reason, digest = logRecoverableError(request, error, null), errorId = request.nextChunkId++;
				request.fatalError = errorId;
				request.pendingChunks++;
				emitErrorChunk(request, errorId, digest, error, !1, null);
				abortableTasks.forEach(function(task) {
					return abortTask(task, request, errorId);
				});
				setTimeout(function() {
					return finishAbort(request, abortableTasks, errorId);
				}, 0);
			}
			else {
				var onAllReady = request.onAllReady;
				onAllReady();
				flushCompletedChunks(request);
			}
		} catch (error$26) {
			logRecoverableError(request, error$26, null), fatalError(request, error$26);
		}
	}
	function resolveServerReference(bundlerConfig, id) {
		var name = "", resolvedModuleData = bundlerConfig[id];
		if (resolvedModuleData) name = resolvedModuleData.name;
		else {
			var idx = id.lastIndexOf("#");
			-1 !== idx && (name = id.slice(idx + 1), resolvedModuleData = bundlerConfig[id.slice(0, idx)]);
			if (!resolvedModuleData) throw Error("Could not find the module \"" + id + "\" in the React Server Manifest. This is probably a bug in the React Server Components bundler.");
		}
		return resolvedModuleData.async ? [
			resolvedModuleData.id,
			resolvedModuleData.chunks,
			name,
			1
		] : [
			resolvedModuleData.id,
			resolvedModuleData.chunks,
			name
		];
	}
	var chunkCache = /* @__PURE__ */ new Map();
	function requireAsyncModule(id) {
		var promise = __vite_rsc_require__(id);
		if ("function" !== typeof promise.then || "fulfilled" === promise.status) return null;
		promise.then(function(value) {
			promise.status = "fulfilled";
			promise.value = value;
		}, function(reason) {
			promise.status = "rejected";
			promise.reason = reason;
		});
		return promise;
	}
	function ignoreReject() {}
	function preloadModule(metadata) {
		for (var chunks = metadata[1], promises = [], i = 0; i < chunks.length;) {
			var chunkId = chunks[i++];
			chunks[i++];
			var entry = chunkCache.get(chunkId);
			if (void 0 === entry) {
				entry = __webpack_chunk_load__(chunkId);
				promises.push(entry);
				var resolve = chunkCache.set.bind(chunkCache, chunkId, null);
				entry.then(resolve, ignoreReject);
				chunkCache.set(chunkId, entry);
			} else null !== entry && promises.push(entry);
		}
		return 4 === metadata.length ? 0 === promises.length ? requireAsyncModule(metadata[0]) : Promise.all(promises).then(function() {
			return requireAsyncModule(metadata[0]);
		}) : 0 < promises.length ? Promise.all(promises) : null;
	}
	function requireModule(metadata) {
		var moduleExports = __vite_rsc_require__(metadata[0]);
		if (4 === metadata.length && "function" === typeof moduleExports.then) if ("fulfilled" === moduleExports.status) moduleExports = moduleExports.value;
		else throw moduleExports.reason;
		if ("*" === metadata[2]) return moduleExports;
		if ("" === metadata[2]) return moduleExports.__esModule ? moduleExports.default : moduleExports;
		if (hasOwnProperty.call(moduleExports, metadata[2])) return moduleExports[metadata[2]];
	}
	function appendBackingEntry(backingStore, key, value) {
		backingStore.data.append(key, value);
		value = backingStore.keys;
		null === value ? (backingStore.keys = Array.from(backingStore.data.keys()), backingStore.keyPointer = 0) : value.push(key);
	}
	var RESPONSE_SYMBOL = Symbol();
	function ReactPromise(status, value, reason) {
		this.status = status;
		this.value = value;
		this.reason = reason;
	}
	ReactPromise.prototype = Object.create(Promise.prototype);
	ReactPromise.prototype.then = function(resolve, reject) {
		switch (this.status) {
			case "resolved_model": initializeModelChunk(this);
		}
		switch (this.status) {
			case "fulfilled":
				if ("function" === typeof resolve) {
					for (var inspectedValue = this.value, cycleProtection = 0, visited = /* @__PURE__ */ new Set(); inspectedValue instanceof ReactPromise;) {
						cycleProtection++;
						if (inspectedValue === this || visited.has(inspectedValue) || 1e3 < cycleProtection) {
							"function" === typeof reject && reject(Error("Cannot have cyclic thenables."));
							return;
						}
						visited.add(inspectedValue);
						if ("fulfilled" === inspectedValue.status) inspectedValue = inspectedValue.value;
						else break;
					}
					resolve(this.value);
				}
				break;
			case "pending":
			case "blocked":
				"function" === typeof resolve && (null === this.value && (this.value = []), this.value.push(resolve));
				"function" === typeof reject && (null === this.reason && (this.reason = []), this.reason.push(reject));
				break;
			default: "function" === typeof reject && reject(this.reason);
		}
	};
	var ObjectPrototype = Object.prototype, ArrayPrototype = Array.prototype;
	function wakeChunk(response, listeners, value, chunk) {
		for (var i = 0; i < listeners.length; i++) {
			var listener = listeners[i];
			"function" === typeof listener ? listener(value) : fulfillReference(response, listener, value, chunk.reason);
		}
	}
	function rejectChunk(response, listeners, error) {
		for (var i = 0; i < listeners.length; i++) {
			var listener = listeners[i];
			"function" === typeof listener ? listener(error) : rejectReference(response, listener.handler, error);
		}
	}
	function triggerErrorOnChunk(response, chunk, error) {
		if ("pending" !== chunk.status && "blocked" !== chunk.status) chunk.reason.error(error);
		else {
			var listeners = chunk.reason;
			chunk.status = "rejected";
			chunk.reason = error;
			null !== listeners && rejectChunk(response, listeners, error);
		}
	}
	function createResolvedModelChunk(response, value, id) {
		var $jscomp$compprop2 = {};
		return new ReactPromise("resolved_model", value, ($jscomp$compprop2.id = id, $jscomp$compprop2[RESPONSE_SYMBOL] = response, $jscomp$compprop2));
	}
	function resolveModelChunk(response, chunk, value, id) {
		if ("pending" !== chunk.status) chunk = chunk.reason, "C" === value[0] ? chunk.close("C" === value ? "\"$undefined\"" : value.slice(1)) : chunk.enqueueModel(value);
		else {
			var resolveListeners = chunk.value, rejectListeners = chunk.reason;
			chunk.status = "resolved_model";
			chunk.value = value;
			value = {};
			chunk.reason = (value.id = id, value[RESPONSE_SYMBOL] = response, value);
			if (null !== resolveListeners) switch (initializeModelChunk(chunk), chunk.status) {
				case "fulfilled":
					wakeChunk(response, resolveListeners, chunk.value, chunk);
					break;
				case "blocked":
				case "pending":
					if (chunk.value) for (response = 0; response < resolveListeners.length; response++) chunk.value.push(resolveListeners[response]);
					else chunk.value = resolveListeners;
					if (chunk.reason) {
						if (rejectListeners) for (resolveListeners = 0; resolveListeners < rejectListeners.length; resolveListeners++) chunk.reason.push(rejectListeners[resolveListeners]);
					} else chunk.reason = rejectListeners;
					break;
				case "rejected": rejectListeners && rejectChunk(response, rejectListeners, chunk.reason);
			}
		}
	}
	function createResolvedIteratorResultChunk(response, value, done) {
		var $jscomp$compprop4 = {};
		return new ReactPromise("resolved_model", (done ? "{\"done\":true,\"value\":" : "{\"done\":false,\"value\":") + value + "}", ($jscomp$compprop4.id = -1, $jscomp$compprop4[RESPONSE_SYMBOL] = response, $jscomp$compprop4));
	}
	function resolveIteratorResultChunk(response, chunk, value, done) {
		resolveModelChunk(response, chunk, (done ? "{\"done\":true,\"value\":" : "{\"done\":false,\"value\":") + value + "}", -1);
	}
	function loadServerReference$1(response, metaData, parentObject, key) {
		function reject(error) {
			var rejectListeners = blockedPromise.reason, erroredPromise = blockedPromise;
			erroredPromise.status = "rejected";
			erroredPromise.value = null;
			erroredPromise.reason = error;
			null !== rejectListeners && rejectChunk(response, rejectListeners, error);
			rejectReference(response, handler, error);
		}
		var id = metaData.id;
		if ("string" !== typeof id || "then" === key) return null;
		var cachedPromise = metaData.$$promise;
		if (void 0 !== cachedPromise) {
			if ("fulfilled" === cachedPromise.status) return cachedPromise = cachedPromise.value, "__proto__" === key ? null : parentObject[key] = cachedPromise;
			initializingHandler ? (id = initializingHandler, id.deps++) : id = initializingHandler = {
				chunk: null,
				value: null,
				reason: null,
				deps: 1,
				errored: !1
			};
			cachedPromise.then(resolveReference.bind(null, response, id, parentObject, key), rejectReference.bind(null, response, id));
			return null;
		}
		var blockedPromise = new ReactPromise("blocked", null, null);
		metaData.$$promise = blockedPromise;
		var serverReference = resolveServerReference(response._bundlerConfig, id);
		cachedPromise = metaData.bound;
		if (id = preloadModule(serverReference)) cachedPromise instanceof ReactPromise && (id = Promise.all([id, cachedPromise]));
		else if (cachedPromise instanceof ReactPromise) id = Promise.resolve(cachedPromise);
		else return cachedPromise = requireModule(serverReference), id = blockedPromise, id.status = "fulfilled", id.value = cachedPromise;
		if (initializingHandler) {
			var handler = initializingHandler;
			handler.deps++;
		} else handler = initializingHandler = {
			chunk: null,
			value: null,
			reason: null,
			deps: 1,
			errored: !1
		};
		id.then(function() {
			var resolvedValue = requireModule(serverReference);
			if (metaData.bound) {
				var promiseValue = metaData.bound.value;
				promiseValue = isArrayImpl(promiseValue) ? promiseValue.slice(0) : [];
				if (1e3 < promiseValue.length) {
					reject(Error("Server Function has too many bound arguments. Received " + promiseValue.length + " but the limit is 1000."));
					return;
				}
				promiseValue.unshift(null);
				resolvedValue = resolvedValue.bind.apply(resolvedValue, promiseValue);
			}
			promiseValue = blockedPromise.value;
			var initializedPromise = blockedPromise;
			initializedPromise.status = "fulfilled";
			initializedPromise.value = resolvedValue;
			initializedPromise.reason = null;
			null !== promiseValue && wakeChunk(response, promiseValue, resolvedValue, initializedPromise);
			resolveReference(response, handler, parentObject, key, resolvedValue);
		}, reject);
		return null;
	}
	function reviveModel(response, parentObj, parentKey, value, reference, arrayRoot) {
		if ("string" === typeof value) return parseModelString(response, parentObj, parentKey, value, reference, arrayRoot);
		if ("object" === typeof value && null !== value) if (void 0 !== reference && void 0 !== response._temporaryReferences && response._temporaryReferences.set(value, reference), isArrayImpl(value)) {
			if (null === arrayRoot) {
				var childContext = {
					count: 0,
					fork: !1
				};
				response._rootArrayContexts.set(value, childContext);
			} else childContext = arrayRoot;
			1 < value.length && (childContext.fork = !0);
			bumpArrayCount(childContext, value.length + 1, response);
			for (parentObj = 0; parentObj < value.length; parentObj++) value[parentObj] = reviveModel(response, value, "" + parentObj, value[parentObj], void 0 !== reference ? reference + ":" + parentObj : void 0, childContext);
		} else for (childContext in value) hasOwnProperty.call(value, childContext) && ("__proto__" === childContext ? delete value[childContext] : (parentObj = void 0 !== reference && -1 === childContext.indexOf(":") ? reference + ":" + childContext : void 0, parentObj = reviveModel(response, value, childContext, value[childContext], parentObj, null), void 0 !== parentObj ? value[childContext] = parentObj : delete value[childContext]));
		return value;
	}
	function bumpArrayCount(arrayContext, slots, response) {
		if ((arrayContext.count += slots) > response._arraySizeLimit && arrayContext.fork) throw Error("Maximum array nesting exceeded. Large nested arrays can be dangerous. Try adding intermediate objects.");
	}
	var initializingHandler = null;
	function initializeModelChunk(chunk) {
		var prevHandler = initializingHandler;
		initializingHandler = null;
		var _chunk$reason = chunk.reason, response = _chunk$reason[RESPONSE_SYMBOL];
		_chunk$reason = _chunk$reason.id;
		_chunk$reason = -1 === _chunk$reason ? void 0 : _chunk$reason.toString(16);
		var resolvedModel = chunk.value;
		chunk.status = "blocked";
		chunk.value = null;
		chunk.reason = null;
		try {
			var rawModel = JSON.parse(resolvedModel);
			resolvedModel = {
				count: 0,
				fork: !1
			};
			var value = reviveModel(response, { "": rawModel }, "", rawModel, _chunk$reason, resolvedModel), resolveListeners = chunk.value;
			if (null !== resolveListeners) for (chunk.value = null, chunk.reason = null, rawModel = 0; rawModel < resolveListeners.length; rawModel++) {
				var listener = resolveListeners[rawModel];
				"function" === typeof listener ? listener(value) : fulfillReference(response, listener, value, resolvedModel);
			}
			if (null !== initializingHandler) {
				if (initializingHandler.errored) throw initializingHandler.reason;
				if (0 < initializingHandler.deps) {
					initializingHandler.value = value;
					initializingHandler.reason = resolvedModel;
					initializingHandler.chunk = chunk;
					return;
				}
			}
			chunk.status = "fulfilled";
			chunk.value = value;
			chunk.reason = resolvedModel;
		} catch (error) {
			chunk.status = "rejected", chunk.reason = error;
		} finally {
			initializingHandler = prevHandler;
		}
	}
	function reportGlobalError(response, error) {
		response._closed = !0;
		response._closedReason = error;
		response._chunks.forEach(function(chunk) {
			"pending" === chunk.status ? triggerErrorOnChunk(response, chunk, error) : "fulfilled" === chunk.status && null !== chunk.reason && (chunk = chunk.reason, "function" === typeof chunk.error && chunk.error(error));
		});
	}
	function getChunk(response, id) {
		var chunks = response._chunks, chunk = chunks.get(id);
		chunk || (chunk = response._formData.data.get(response._prefix + id), chunk = "string" === typeof chunk ? createResolvedModelChunk(response, chunk, id) : response._closed ? new ReactPromise("rejected", null, response._closedReason) : new ReactPromise("pending", null, null), chunks.set(id, chunk));
		return chunk;
	}
	function fulfillReference(response, reference, value, arrayRoot) {
		var handler = reference.handler, parentObject = reference.parentObject, key = reference.key, map = reference.map, path = reference.path;
		try {
			for (var localLength = 0, rootArrayContexts = response._rootArrayContexts, i = 1; i < path.length; i++) {
				var name = path[i];
				if ("object" !== typeof value || null === value || getPrototypeOf(value) !== ObjectPrototype && getPrototypeOf(value) !== ArrayPrototype || !hasOwnProperty.call(value, name)) throw Error("Invalid reference.");
				value = value[name];
				if (isArrayImpl(value)) localLength = 0, arrayRoot = rootArrayContexts.get(value) || arrayRoot;
				else if (arrayRoot = null, "string" === typeof value) localLength = value.length;
				else if ("bigint" === typeof value) {
					var n = Math.abs(Number(value));
					localLength = 0 === n ? 1 : Math.floor(Math.log10(n)) + 1;
				} else localLength = ArrayBuffer.isView(value) ? value.byteLength : 0;
			}
			var resolvedValue = map(response, value, parentObject, key);
			var referenceArrayRoot = reference.arrayRoot;
			null !== referenceArrayRoot && (null !== arrayRoot ? (arrayRoot.fork && (referenceArrayRoot.fork = !0), bumpArrayCount(referenceArrayRoot, arrayRoot.count, response)) : 0 < localLength && bumpArrayCount(referenceArrayRoot, localLength, response));
		} catch (error) {
			rejectReference(response, handler, error);
			return;
		}
		resolveReference(response, handler, parentObject, key, resolvedValue);
	}
	function resolveReference(response, handler, parentObject, key, resolvedValue) {
		"__proto__" !== key && (parentObject[key] = resolvedValue);
		"" === key && null === handler.value && (handler.value = resolvedValue);
		handler.deps--;
		0 === handler.deps && (parentObject = handler.chunk, null !== parentObject && "blocked" === parentObject.status && (key = parentObject.value, parentObject.status = "fulfilled", parentObject.value = handler.value, parentObject.reason = handler.reason, null !== key && wakeChunk(response, key, handler.value, parentObject)));
	}
	function rejectReference(response, handler, error) {
		handler.errored || (handler.errored = !0, handler.value = null, handler.reason = error, handler = handler.chunk, null !== handler && "blocked" === handler.status && triggerErrorOnChunk(response, handler, error));
	}
	function getOutlinedModel(response, reference, parentObject, key, referenceArrayRoot, map) {
		reference = reference.split(":");
		var id = parseInt(reference[0], 16), chunk = getChunk(response, id);
		switch (chunk.status) {
			case "resolved_model": initializeModelChunk(chunk);
		}
		switch (chunk.status) {
			case "fulfilled":
				id = chunk.value;
				chunk = chunk.reason;
				if (null !== chunk && "error" in chunk) throw Error("Expected an initialized chunk but got an initialized stream chunk instead. This payload may have been submitted by an older version of React.");
				for (var localLength = 0, rootArrayContexts = response._rootArrayContexts, i = 1; i < reference.length; i++) {
					localLength = reference[i];
					if ("object" !== typeof id || null === id || getPrototypeOf(id) !== ObjectPrototype && getPrototypeOf(id) !== ArrayPrototype || !hasOwnProperty.call(id, localLength)) throw Error("Invalid reference.");
					id = id[localLength];
					isArrayImpl(id) ? (localLength = 0, chunk = rootArrayContexts.get(id) || chunk) : (chunk = null, "string" === typeof id ? localLength = id.length : "bigint" === typeof id ? (localLength = Math.abs(Number(id)), localLength = 0 === localLength ? 1 : Math.floor(Math.log10(localLength)) + 1) : localLength = ArrayBuffer.isView(id) ? id.byteLength : 0);
				}
				parentObject = map(response, id, parentObject, key);
				null !== referenceArrayRoot && (null !== chunk ? (chunk.fork && (referenceArrayRoot.fork = !0), bumpArrayCount(referenceArrayRoot, chunk.count, response)) : 0 < localLength && bumpArrayCount(referenceArrayRoot, localLength, response));
				return parentObject;
			case "blocked": return initializingHandler ? (response = initializingHandler, response.deps++) : response = initializingHandler = {
				chunk: null,
				value: null,
				reason: null,
				deps: 1,
				errored: !1
			}, referenceArrayRoot = {
				handler: response,
				parentObject,
				key,
				map,
				path: reference,
				arrayRoot: referenceArrayRoot
			}, null === chunk.value ? chunk.value = [referenceArrayRoot] : chunk.value.push(referenceArrayRoot), null === chunk.reason ? chunk.reason = [referenceArrayRoot] : chunk.reason.push(referenceArrayRoot), null;
			case "pending": throw Error("Invalid forward reference.");
			default: return initializingHandler ? (initializingHandler.errored = !0, initializingHandler.value = null, initializingHandler.reason = chunk.reason) : initializingHandler = {
				chunk: null,
				value: null,
				reason: chunk.reason,
				deps: 0,
				errored: !0
			}, null;
		}
	}
	function createMap(response, model) {
		if (!isArrayImpl(model)) throw Error("Invalid Map initializer.");
		if (!0 === model.$$consumed) throw Error("Already initialized Map.");
		model.$$consumed = !0;
		return new Map(model);
	}
	function createSet(response, model) {
		if (!isArrayImpl(model)) throw Error("Invalid Set initializer.");
		if (!0 === model.$$consumed) throw Error("Already initialized Set.");
		model.$$consumed = !0;
		return new Set(model);
	}
	function extractIterator(response, model) {
		if (!isArrayImpl(model)) throw Error("Invalid Iterator initializer.");
		if (!0 === model.$$consumed) throw Error("Already initialized Iterator.");
		model.$$consumed = !0;
		return model[Symbol.iterator]();
	}
	function createModel(response, model, parentObject, key) {
		return "then" === key && "function" === typeof model ? null : model;
	}
	function parseTypedArray(response, reference, constructor, bytesPerElement, parentObject, parentKey, referenceArrayRoot) {
		function reject(error) {
			if (!handler.errored) {
				handler.errored = !0;
				handler.value = null;
				handler.reason = error;
				var chunk = handler.chunk;
				null !== chunk && "blocked" === chunk.status && triggerErrorOnChunk(response, chunk, error);
			}
		}
		reference = parseInt(reference.slice(2), 16);
		var key = response._prefix + reference;
		bytesPerElement = response._chunks;
		if (bytesPerElement.has(reference)) throw Error("Already initialized typed array.");
		bytesPerElement.set(reference, new ReactPromise("rejected", null, Error("Already initialized typed array.")));
		reference = response._formData.data.get(key).arrayBuffer();
		if (initializingHandler) {
			var handler = initializingHandler;
			handler.deps++;
		} else handler = initializingHandler = {
			chunk: null,
			value: null,
			reason: null,
			deps: 1,
			errored: !1
		};
		reference.then(function(buffer) {
			try {
				null !== referenceArrayRoot && bumpArrayCount(referenceArrayRoot, buffer.byteLength, response);
				var resolvedValue = constructor === ArrayBuffer ? buffer : new constructor(buffer);
				"__proto__" !== key && (parentObject[parentKey] = resolvedValue);
				"" === parentKey && null === handler.value && (handler.value = resolvedValue);
			} catch (x) {
				reject(x);
				return;
			}
			handler.deps--;
			0 === handler.deps && (buffer = handler.chunk, null !== buffer && "blocked" === buffer.status && (resolvedValue = buffer.value, buffer.status = "fulfilled", buffer.value = handler.value, buffer.reason = null, null !== resolvedValue && wakeChunk(response, resolvedValue, handler.value, buffer)));
		}, reject);
		return null;
	}
	function resolveStream(response, id, stream, controller) {
		var chunks = response._chunks;
		stream = new ReactPromise("fulfilled", stream, controller);
		chunks.set(id, stream);
		response = response._formData.data.getAll(response._prefix + id);
		for (id = 0; id < response.length; id++) chunks = response[id], "string" === typeof chunks && ("C" === chunks[0] ? controller.close("C" === chunks ? "\"$undefined\"" : chunks.slice(1)) : controller.enqueueModel(chunks));
	}
	function parseReadableStream(response, reference, type) {
		function enqueue(value) {
			"bytes" !== type || ArrayBuffer.isView(value) ? controller.enqueue(value) : flightController.error(Error("Invalid data for bytes stream."));
		}
		reference = parseInt(reference.slice(2), 16);
		if (response._chunks.has(reference)) throw Error("Already initialized stream.");
		var controller = null, closed = !1, stream = new ReadableStream({
			type,
			start: function(c) {
				controller = c;
			}
		}), previousBlockedChunk = null, flightController = {
			enqueueModel: function(json) {
				if (null === previousBlockedChunk) {
					var chunk = createResolvedModelChunk(response, json, -1);
					initializeModelChunk(chunk);
					"fulfilled" === chunk.status ? enqueue(chunk.value) : (chunk.then(enqueue, flightController.error), previousBlockedChunk = chunk);
				} else {
					chunk = previousBlockedChunk;
					var chunk$31 = new ReactPromise("pending", null, null);
					chunk$31.then(enqueue, flightController.error);
					previousBlockedChunk = chunk$31;
					chunk.then(function() {
						previousBlockedChunk === chunk$31 && (previousBlockedChunk = null);
						resolveModelChunk(response, chunk$31, json, -1);
					});
				}
			},
			close: function() {
				if (!closed) if (closed = !0, null === previousBlockedChunk) controller.close();
				else {
					var blockedChunk = previousBlockedChunk;
					previousBlockedChunk = null;
					blockedChunk.then(function() {
						return controller.close();
					});
				}
			},
			error: function(error) {
				if (!closed) if (closed = !0, null === previousBlockedChunk) controller.error(error);
				else {
					var blockedChunk = previousBlockedChunk;
					previousBlockedChunk = null;
					blockedChunk.then(function() {
						return controller.error(error);
					});
				}
			}
		};
		resolveStream(response, reference, stream, flightController);
		return stream;
	}
	function FlightIterator(next) {
		this.next = next;
	}
	FlightIterator.prototype = {};
	FlightIterator.prototype[ASYNC_ITERATOR] = function() {
		return this;
	};
	function parseAsyncIterable(response, reference, iterator) {
		reference = parseInt(reference.slice(2), 16);
		if (response._chunks.has(reference)) throw Error("Already initialized stream.");
		var buffer = [], closed = !1, nextWriteIndex = 0, $jscomp$compprop5 = {};
		$jscomp$compprop5 = ($jscomp$compprop5[ASYNC_ITERATOR] = function() {
			var nextReadIndex = 0;
			return new FlightIterator(function(arg) {
				if (void 0 !== arg) throw Error("Values cannot be passed to next() of AsyncIterables passed to Client Components.");
				if (nextReadIndex === buffer.length) {
					if (closed) return new ReactPromise("fulfilled", {
						done: !0,
						value: void 0
					}, null);
					buffer[nextReadIndex] = new ReactPromise("pending", null, null);
				}
				return buffer[nextReadIndex++];
			});
		}, $jscomp$compprop5);
		iterator = iterator ? $jscomp$compprop5[ASYNC_ITERATOR]() : $jscomp$compprop5;
		resolveStream(response, reference, iterator, {
			enqueueModel: function(value) {
				nextWriteIndex === buffer.length ? buffer[nextWriteIndex] = createResolvedIteratorResultChunk(response, value, !1) : resolveIteratorResultChunk(response, buffer[nextWriteIndex], value, !1);
				nextWriteIndex++;
			},
			close: function(value) {
				if (!closed) for (closed = !0, nextWriteIndex === buffer.length ? buffer[nextWriteIndex] = createResolvedIteratorResultChunk(response, value, !0) : resolveIteratorResultChunk(response, buffer[nextWriteIndex], value, !0), nextWriteIndex++; nextWriteIndex < buffer.length;) resolveIteratorResultChunk(response, buffer[nextWriteIndex++], "\"$undefined\"", !0);
			},
			error: function(error) {
				if (!closed) for (closed = !0, nextWriteIndex === buffer.length && (buffer[nextWriteIndex] = new ReactPromise("pending", null, null)); nextWriteIndex < buffer.length;) triggerErrorOnChunk(response, buffer[nextWriteIndex++], error);
			}
		});
		return iterator;
	}
	function parseModelString(response, obj, key, value, reference, arrayRoot) {
		if ("$" === value[0]) {
			switch (value[1]) {
				case "$": return null !== arrayRoot && bumpArrayCount(arrayRoot, value.length - 1, response), value.slice(1);
				case "@": return obj = parseInt(value.slice(2), 16), getChunk(response, obj);
				case "h": return arrayRoot = value.slice(2), getOutlinedModel(response, arrayRoot, obj, key, null, loadServerReference$1);
				case "T":
					if (void 0 === reference || void 0 === response._temporaryReferences) throw Error("Could not reference an opaque temporary reference. This is likely due to misconfiguring the temporaryReferences options on the server.");
					return createTemporaryReference(response._temporaryReferences, reference);
				case "Q": return arrayRoot = value.slice(2), getOutlinedModel(response, arrayRoot, obj, key, null, createMap);
				case "W": return arrayRoot = value.slice(2), getOutlinedModel(response, arrayRoot, obj, key, null, createSet);
				case "K":
					key = value.slice(2);
					obj = response._prefix + "_";
					key = obj + key + "_";
					arrayRoot = new FormData();
					for (response = response._formData;;) {
						value = response.keys;
						null === value && (value = response.keys = Array.from(response.data.keys()), response.keyPointer = 0);
						value = value[response.keyPointer];
						if (void 0 === value) break;
						if (value.startsWith(key)) {
							reference = response.data.getAll(value);
							for (var referencedFormDataKey = value.slice(key.length), i = 0; i < reference.length; i++) arrayRoot.append(referencedFormDataKey, reference[i]);
							response.data.delete(value);
							response.keyPointer++;
						} else if (value.startsWith(obj)) break;
						else response.keyPointer++;
					}
					return arrayRoot;
				case "i": return arrayRoot = value.slice(2), getOutlinedModel(response, arrayRoot, obj, key, null, extractIterator);
				case "I": return Infinity;
				case "-": return "$-0" === value ? -0 : -Infinity;
				case "N": return NaN;
				case "u": return;
				case "D": return new Date(Date.parse(value.slice(2)));
				case "n":
					obj = value.slice(2);
					if (300 < obj.length) throw Error("BigInt is too large. Received " + obj.length + " digits but the limit is 300.");
					null !== arrayRoot && bumpArrayCount(arrayRoot, obj.length, response);
					return BigInt(obj);
				case "A": return parseTypedArray(response, value, ArrayBuffer, 1, obj, key, arrayRoot);
				case "O": return parseTypedArray(response, value, Int8Array, 1, obj, key, arrayRoot);
				case "o": return parseTypedArray(response, value, Uint8Array, 1, obj, key, arrayRoot);
				case "U": return parseTypedArray(response, value, Uint8ClampedArray, 1, obj, key, arrayRoot);
				case "S": return parseTypedArray(response, value, Int16Array, 2, obj, key, arrayRoot);
				case "s": return parseTypedArray(response, value, Uint16Array, 2, obj, key, arrayRoot);
				case "L": return parseTypedArray(response, value, Int32Array, 4, obj, key, arrayRoot);
				case "l": return parseTypedArray(response, value, Uint32Array, 4, obj, key, arrayRoot);
				case "G": return parseTypedArray(response, value, Float32Array, 4, obj, key, arrayRoot);
				case "g": return parseTypedArray(response, value, Float64Array, 8, obj, key, arrayRoot);
				case "M": return parseTypedArray(response, value, BigInt64Array, 8, obj, key, arrayRoot);
				case "m": return parseTypedArray(response, value, BigUint64Array, 8, obj, key, arrayRoot);
				case "V": return parseTypedArray(response, value, DataView, 1, obj, key, arrayRoot);
				case "B": return obj = parseInt(value.slice(2), 16), response._formData.data.get(response._prefix + obj);
				case "R": return parseReadableStream(response, value, void 0);
				case "r": return parseReadableStream(response, value, "bytes");
				case "X": return parseAsyncIterable(response, value, !1);
				case "x": return parseAsyncIterable(response, value, !0);
			}
			value = value.slice(1);
			return getOutlinedModel(response, value, obj, key, arrayRoot, createModel);
		}
		null !== arrayRoot && bumpArrayCount(arrayRoot, value.length, response);
		return value;
	}
	function createResponse(bundlerConfig, formFieldPrefix, temporaryReferences) {
		var backingFormData = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : new FormData(), arraySizeLimit = 4 < arguments.length && void 0 !== arguments[4] ? arguments[4] : 1e6;
		return {
			_bundlerConfig: bundlerConfig,
			_prefix: formFieldPrefix,
			_formData: {
				data: backingFormData,
				keyPointer: -1,
				keys: null
			},
			_chunks: /* @__PURE__ */ new Map(),
			_closed: !1,
			_closedReason: null,
			_temporaryReferences: temporaryReferences,
			_rootArrayContexts: /* @__PURE__ */ new WeakMap(),
			_arraySizeLimit: arraySizeLimit
		};
	}
	function close(response) {
		reportGlobalError(response, Error("Connection closed."));
	}
	function loadServerReference(bundlerConfig, metaData) {
		var id = metaData.id;
		if ("string" !== typeof id) return null;
		var serverReference = resolveServerReference(bundlerConfig, id);
		bundlerConfig = preloadModule(serverReference);
		metaData = metaData.bound;
		return metaData instanceof Promise ? Promise.all([metaData, bundlerConfig]).then(function(_ref) {
			_ref = _ref[0];
			var fn = requireModule(serverReference);
			if (1e3 < _ref.length) throw Error("Server Function has too many bound arguments. Received " + _ref.length + " but the limit is 1000.");
			return fn.bind.apply(fn, [null].concat(_ref));
		}) : bundlerConfig ? Promise.resolve(bundlerConfig).then(function() {
			return requireModule(serverReference);
		}) : Promise.resolve(requireModule(serverReference));
	}
	function decodeBoundActionMetaData(body, serverManifest, formFieldPrefix, arraySizeLimit) {
		body = createResponse(serverManifest, formFieldPrefix, void 0, body, arraySizeLimit);
		close(body);
		body = getChunk(body, 0);
		body.then(function() {});
		if ("fulfilled" !== body.status) throw body.reason;
		return body.value;
	}
	exports.createClientModuleProxy = function(moduleId) {
		moduleId = registerClientReferenceImpl({}, moduleId, !1);
		return new Proxy(moduleId, proxyHandlers$1);
	};
	exports.createTemporaryReferenceSet = function() {
		return /* @__PURE__ */ new WeakMap();
	};
	exports.decodeAction = function(body, serverManifest) {
		var formData = new FormData(), action = null, seenActions = /* @__PURE__ */ new Set();
		body.forEach(function(value, key) {
			key.startsWith("$ACTION_") ? key.startsWith("$ACTION_REF_") ? seenActions.has(key) || (seenActions.add(key), value = "$ACTION_" + key.slice(12) + ":", value = decodeBoundActionMetaData(body, serverManifest, value), action = loadServerReference(serverManifest, value)) : key.startsWith("$ACTION_ID_") && !seenActions.has(key) && (seenActions.add(key), value = key.slice(11), action = loadServerReference(serverManifest, {
				id: value,
				bound: null
			})) : formData.append(key, value);
		});
		return null === action ? null : action.then(function(fn) {
			return fn.bind(null, formData);
		});
	};
	exports.decodeFormState = function(actionResult, body, serverManifest) {
		var keyPath = body.get("$ACTION_KEY");
		if ("string" !== typeof keyPath) return Promise.resolve(null);
		var metaData = null;
		body.forEach(function(value, key) {
			key.startsWith("$ACTION_REF_") && (value = "$ACTION_" + key.slice(12) + ":", metaData = decodeBoundActionMetaData(body, serverManifest, value));
		});
		if (null === metaData) return Promise.resolve(null);
		var referenceId = metaData.id;
		return Promise.resolve(metaData.bound).then(function(bound) {
			return null === bound ? null : [
				actionResult,
				keyPath,
				referenceId,
				bound.length - 1
			];
		});
	};
	exports.decodeReply = function(body, webpackMap, options) {
		if ("string" === typeof body) {
			var form = new FormData();
			form.append("0", body);
			body = form;
		}
		body = createResponse(webpackMap, "", options ? options.temporaryReferences : void 0, body, options ? options.arraySizeLimit : void 0);
		webpackMap = getChunk(body, 0);
		close(body);
		return webpackMap;
	};
	exports.decodeReplyFromAsyncIterable = function(iterable, webpackMap, options) {
		function progress(entry) {
			if (entry.done) close(response);
			else {
				entry = entry.value;
				var name = entry[0];
				entry = entry[1];
				if ("string" === typeof entry) {
					appendBackingEntry(response._formData, name, entry);
					var prefix = response._prefix;
					if (name.startsWith(prefix)) {
						var chunks = response._chunks;
						name = +name.slice(prefix.length);
						(chunks = chunks.get(name)) && resolveModelChunk(response, chunks, entry, name);
					}
				} else appendBackingEntry(response._formData, name, entry);
				iterator.next().then(progress, error);
			}
		}
		function error(reason) {
			reportGlobalError(response, reason);
			"function" === typeof iterator.throw && iterator.throw(reason).then(error, error);
		}
		var iterator = iterable[ASYNC_ITERATOR](), response = createResponse(webpackMap, "", options ? options.temporaryReferences : void 0, void 0, options ? options.arraySizeLimit : void 0);
		iterator.next().then(progress, error);
		return getChunk(response, 0);
	};
	exports.prerender = function(model, webpackMap, options) {
		return new Promise(function(resolve, reject) {
			var request = new RequestInstance(21, model, webpackMap, options ? options.onError : void 0, options ? options.onPostpone : void 0, function() {
				resolve({ prelude: new ReadableStream({
					type: "bytes",
					pull: function(controller) {
						startFlowing(request, controller);
					},
					cancel: function(reason) {
						request.destination = null;
						abort(request, reason);
					}
				}, { highWaterMark: 0 }) });
			}, reject, options ? options.identifierPrefix : void 0, options ? options.temporaryReferences : void 0);
			if (options && options.signal) {
				var signal = options.signal;
				if (signal.aborted) abort(request, signal.reason);
				else {
					var listener = function() {
						abort(request, signal.reason);
						signal.removeEventListener("abort", listener);
					};
					signal.addEventListener("abort", listener);
				}
			}
			startWork(request);
		});
	};
	exports.registerClientReference = function(proxyImplementation, id, exportName) {
		return registerClientReferenceImpl(proxyImplementation, id + "#" + exportName, !1);
	};
	exports.registerServerReference = function(reference, id, exportName) {
		return Object.defineProperties(reference, {
			$$typeof: { value: SERVER_REFERENCE_TAG },
			$$id: {
				value: null === exportName ? id : id + "#" + exportName,
				configurable: !0
			},
			$$bound: {
				value: null,
				configurable: !0
			},
			bind: {
				value: bind,
				configurable: !0
			},
			toString: serverReferenceToString
		});
	};
	exports.renderToReadableStream = function(model, webpackMap, options) {
		var request = new RequestInstance(20, model, webpackMap, options ? options.onError : void 0, options ? options.onPostpone : void 0, noop, noop, options ? options.identifierPrefix : void 0, options ? options.temporaryReferences : void 0);
		if (options && options.signal) {
			var signal = options.signal;
			if (signal.aborted) abort(request, signal.reason);
			else {
				var listener = function() {
					abort(request, signal.reason);
					signal.removeEventListener("abort", listener);
				};
				signal.addEventListener("abort", listener);
			}
		}
		return new ReadableStream({
			type: "bytes",
			start: function() {
				startWork(request);
			},
			pull: function(controller) {
				startFlowing(request, controller);
			},
			cancel: function(reason) {
				request.destination = null;
				abort(request, reason);
			}
		}, { highWaterMark: 0 });
	};
}));
//#endregion
//#region node_modules/.pnpm/@vitejs+plugin-rsc@0.5.26_react-dom@19.2.6_react@19.2.6__react-server-dom-webpack@19.2._0163e471c1626bdcb27d069e1de6a9e2/node_modules/@vitejs/plugin-rsc/dist/core/rsc.js
var import_server_edge = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports) => {
	var s = require_react_server_dom_webpack_server_edge_production();
	exports.renderToReadableStream = s.renderToReadableStream;
	exports.decodeReply = s.decodeReply;
	exports.decodeReplyFromAsyncIterable = s.decodeReplyFromAsyncIterable;
	exports.decodeAction = s.decodeAction;
	exports.decodeFormState = s.decodeFormState;
	exports.registerServerReference = s.registerServerReference;
	exports.registerClientReference = s.registerClientReference;
	exports.createClientModuleProxy = s.createClientModuleProxy;
	exports.createTemporaryReferenceSet = s.createTemporaryReferenceSet;
})))(), 1);
var init = false;
var requireModule;
function setRequireModule(options) {
	if (init) return;
	init = true;
	requireModule = (id) => {
		return options.load(removeReferenceCacheTag(id));
	};
	globalThis.__vite_rsc_server_require__ = memoize(async (id) => {
		if (id.startsWith("$$decode-client:")) {
			id = id.slice(SERVER_DECODE_CLIENT_PREFIX.length);
			id = removeReferenceCacheTag(id);
			const target = {};
			const getOrCreateClientReference = (name) => {
				return target[name] ??= import_server_edge.registerClientReference(() => {
					throw new Error(`Unexpectedly client reference export '${name}' is called on server`);
				}, id, name);
			};
			return new Proxy(target, { getOwnPropertyDescriptor(_target, name) {
				if (typeof name !== "string" || name === "then") return Reflect.getOwnPropertyDescriptor(target, name);
				getOrCreateClientReference(name);
				return Reflect.getOwnPropertyDescriptor(target, name);
			} });
		}
		return requireModule(id);
	});
	setInternalRequire();
}
async function loadServerAction(id) {
	const [file, name] = id.split("#");
	return (await requireModule(file))[name];
}
function createServerManifest() {
	const cacheTag = "";
	return new Proxy({}, { get(_target, $$id, _receiver) {
		tinyassert(typeof $$id === "string");
		let [id, name] = $$id.split("#");
		tinyassert(id);
		tinyassert(name);
		return {
			id: SERVER_REFERENCE_PREFIX + id + cacheTag,
			name,
			chunks: [],
			async: true
		};
	} });
}
function createClientManifest(options) {
	const cacheTag = "";
	return new Proxy({}, { get(_target, $$id, _receiver) {
		tinyassert(typeof $$id === "string");
		let [id, name] = $$id.split("#");
		tinyassert(id);
		tinyassert(name);
		options?.onClientReference?.({
			id,
			name
		});
		return {
			id: id + cacheTag,
			name,
			chunks: [],
			async: true
		};
	} });
}
//#endregion
//#region node_modules/.pnpm/react-server-dom-webpack@19.2.6_react-dom@19.2.6_react@19.2.6__react@19.2.6_webpack@5.108.4_esbuild@0.28.1_/node_modules/react-server-dom-webpack/cjs/react-server-dom-webpack-client.edge.production.js
/**
* @license React
* react-server-dom-webpack-client.edge.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_server_dom_webpack_client_edge_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var ReactDOM = require_react_dom_react_server(), hasOwnProperty = Object.prototype.hasOwnProperty;
	function requireModule(metadata) {
		var moduleExports = __vite_rsc_require__(metadata[0]);
		if (4 === metadata.length && "function" === typeof moduleExports.then) if ("fulfilled" === moduleExports.status) moduleExports = moduleExports.value;
		else throw moduleExports.reason;
		if ("*" === metadata[2]) return moduleExports;
		if ("" === metadata[2]) return moduleExports.__esModule ? moduleExports.default : moduleExports;
		if (hasOwnProperty.call(moduleExports, metadata[2])) return moduleExports[metadata[2]];
	}
	ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_LAZY_TYPE = Symbol.for("react.lazy");
	Array.isArray;
	Function.prototype.bind;
	Array.prototype.slice;
	function ReactPromise(status, value, reason) {
		this.status = status;
		this.value = value;
		this.reason = reason;
	}
	ReactPromise.prototype = Object.create(Promise.prototype);
	ReactPromise.prototype.then = function(resolve, reject) {
		switch (this.status) {
			case "resolved_model":
				initializeModelChunk(this);
				break;
			case "resolved_module": initializeModuleChunk(this);
		}
		switch (this.status) {
			case "fulfilled":
				"function" === typeof resolve && resolve(this.value);
				break;
			case "pending":
			case "blocked":
				"function" === typeof resolve && (null === this.value && (this.value = []), this.value.push(resolve));
				"function" === typeof reject && (null === this.reason && (this.reason = []), this.reason.push(reject));
				break;
			case "halted": break;
			default: "function" === typeof reject && reject(this.reason);
		}
	};
	function wakeChunk(listeners, value, chunk) {
		for (var i = 0; i < listeners.length; i++) {
			var listener = listeners[i];
			"function" === typeof listener ? listener(value) : fulfillReference(listener, value, chunk);
		}
	}
	function rejectChunk(listeners, error) {
		for (var i = 0; i < listeners.length; i++) {
			var listener = listeners[i];
			"function" === typeof listener ? listener(error) : rejectReference(listener, error);
		}
	}
	function resolveBlockedCycle(resolvedChunk, reference) {
		var referencedChunk = reference.handler.chunk;
		if (null === referencedChunk) return null;
		if (referencedChunk === resolvedChunk) return reference.handler;
		reference = referencedChunk.value;
		if (null !== reference) for (referencedChunk = 0; referencedChunk < reference.length; referencedChunk++) {
			var listener = reference[referencedChunk];
			if ("function" !== typeof listener && (listener = resolveBlockedCycle(resolvedChunk, listener), null !== listener)) return listener;
		}
		return null;
	}
	function triggerErrorOnChunk(response, chunk, error) {
		"pending" !== chunk.status && "blocked" !== chunk.status ? chunk.reason.error(error) : (response = chunk.reason, chunk.status = "rejected", chunk.reason = error, null !== response && rejectChunk(response, error));
	}
	var initializingHandler = null;
	function initializeModelChunk(chunk) {
		var prevHandler = initializingHandler;
		initializingHandler = null;
		var resolvedModel = chunk.value, response = chunk.reason;
		chunk.status = "blocked";
		chunk.value = null;
		chunk.reason = null;
		try {
			var value = JSON.parse(resolvedModel, response._fromJSON), resolveListeners = chunk.value;
			if (null !== resolveListeners) for (chunk.value = null, chunk.reason = null, resolvedModel = 0; resolvedModel < resolveListeners.length; resolvedModel++) {
				var listener = resolveListeners[resolvedModel];
				"function" === typeof listener ? listener(value) : fulfillReference(listener, value, chunk);
			}
			if (null !== initializingHandler) {
				if (initializingHandler.errored) throw initializingHandler.reason;
				if (0 < initializingHandler.deps) {
					initializingHandler.value = value;
					initializingHandler.chunk = chunk;
					return;
				}
			}
			chunk.status = "fulfilled";
			chunk.value = value;
		} catch (error) {
			chunk.status = "rejected", chunk.reason = error;
		} finally {
			initializingHandler = prevHandler;
		}
	}
	function initializeModuleChunk(chunk) {
		try {
			var value = requireModule(chunk.value);
			chunk.status = "fulfilled";
			chunk.value = value;
		} catch (error) {
			chunk.status = "rejected", chunk.reason = error;
		}
	}
	function fulfillReference(reference, value) {
		var response = reference.response, handler = reference.handler, parentObject = reference.parentObject, key = reference.key, map = reference.map, path = reference.path;
		try {
			for (var i = 1; i < path.length; i++) {
				for (; "object" === typeof value && null !== value && value.$$typeof === REACT_LAZY_TYPE;) {
					var referencedChunk = value._payload;
					if (referencedChunk === handler.chunk) value = handler.value;
					else {
						switch (referencedChunk.status) {
							case "resolved_model":
								initializeModelChunk(referencedChunk);
								break;
							case "resolved_module": initializeModuleChunk(referencedChunk);
						}
						switch (referencedChunk.status) {
							case "fulfilled":
								value = referencedChunk.value;
								continue;
							case "blocked":
								var cyclicHandler = resolveBlockedCycle(referencedChunk, reference);
								if (null !== cyclicHandler) {
									value = cyclicHandler.value;
									continue;
								}
							case "pending":
								path.splice(0, i - 1);
								null === referencedChunk.value ? referencedChunk.value = [reference] : referencedChunk.value.push(reference);
								null === referencedChunk.reason ? referencedChunk.reason = [reference] : referencedChunk.reason.push(reference);
								return;
							case "halted": return;
							default:
								rejectReference(reference, referencedChunk.reason);
								return;
						}
					}
				}
				var name = path[i];
				if ("object" === typeof value && null !== value && hasOwnProperty.call(value, name)) value = value[name];
				else throw Error("Invalid reference.");
			}
			for (; "object" === typeof value && null !== value && value.$$typeof === REACT_LAZY_TYPE;) {
				var referencedChunk$44 = value._payload;
				if (referencedChunk$44 === handler.chunk) value = handler.value;
				else {
					switch (referencedChunk$44.status) {
						case "resolved_model":
							initializeModelChunk(referencedChunk$44);
							break;
						case "resolved_module": initializeModuleChunk(referencedChunk$44);
					}
					switch (referencedChunk$44.status) {
						case "fulfilled":
							value = referencedChunk$44.value;
							continue;
					}
					break;
				}
			}
			var mappedValue = map(response, value, parentObject, key);
			"__proto__" !== key && (parentObject[key] = mappedValue);
			"" === key && null === handler.value && (handler.value = mappedValue);
			if (parentObject[0] === REACT_ELEMENT_TYPE && "object" === typeof handler.value && null !== handler.value && handler.value.$$typeof === REACT_ELEMENT_TYPE) {
				var element = handler.value;
				switch (key) {
					case "3": element.props = mappedValue;
				}
			}
		} catch (error) {
			rejectReference(reference, error);
			return;
		}
		handler.deps--;
		0 === handler.deps && (reference = handler.chunk, null !== reference && "blocked" === reference.status && (value = reference.value, reference.status = "fulfilled", reference.value = handler.value, reference.reason = handler.reason, null !== value && wakeChunk(value, handler.value, reference)));
	}
	function rejectReference(reference, error) {
		var handler = reference.handler;
		reference = reference.response;
		handler.errored || (handler.errored = !0, handler.value = null, handler.reason = error, handler = handler.chunk, null !== handler && "blocked" === handler.status && triggerErrorOnChunk(reference, handler, error));
	}
}));
(/* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_server_dom_webpack_client_edge_production();
})))();
function renderToReadableStream$2(data, options, extraOptions) {
	return import_server_edge.renderToReadableStream(data, createClientManifest({ onClientReference: extraOptions?.onClientReference }), options);
}
function registerClientReference(proxy, id, name) {
	return import_server_edge.registerClientReference(proxy, id, name);
}
var decodeReply = (body, options) => import_server_edge.decodeReply(body, createServerManifest(), options);
function decodeAction(body) {
	return import_server_edge.decodeAction(body, createServerManifest());
}
function decodeFormState(actionResult, body) {
	return import_server_edge.decodeFormState(actionResult, body, createServerManifest());
}
var createTemporaryReferenceSet = import_server_edge.createTemporaryReferenceSet;
//#endregion
//#region \0virtual:vite-rsc/server-references
var server_references_default = {};
//#endregion
//#region node_modules/.pnpm/@vitejs+plugin-rsc@0.5.26_react-dom@19.2.6_react@19.2.6__react-server-dom-webpack@19.2._0163e471c1626bdcb27d069e1de6a9e2/node_modules/@vitejs/plugin-rsc/dist/rsc.js
initialize();
function initialize() {
	setRequireModule({ load: async (id) => {
		{
			const import_ = server_references_default[id];
			if (!import_) throw new Error(`server reference not found '${id}'`);
			return import_();
		}
	} });
}
function renderToReadableStream$1(data, options, extraOptions) {
	return renderToReadableStream$2(data, options, { onClientReference(metadata) {
		const deps = assetsManifest.clientReferenceDeps[metadata.id] ?? {
			js: [],
			css: []
		};
		extraOptions?.onClientReference?.({
			id: metadata.id,
			name: metadata.name,
			deps
		});
	} });
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/rsc-stream-hints.js
var REACT_FLIGHT_STYLESHEET_PRELOAD_HINT = /(\d*:HL\[.*?),"stylesheet"(\]|,)/g;
/**
* React Flight emits HL hints with "stylesheet" for CSS preloads, but the
* HTML spec requires "style" for <link rel="preload">. Rewrite each complete
* Flight line so SSR embeds, navigation, and server actions see valid hints.
*/
function normalizeReactFlightHintLine(line) {
	return line.replace(REACT_FLIGHT_STYLESHEET_PRELOAD_HINT, "$1,\"style\"$2");
}
function normalizeReactFlightPreloadHints(stream) {
	const decoder = new TextDecoder();
	const encoder = new TextEncoder();
	let carry = "";
	return stream.pipeThrough(new TransformStream({
		transform(chunk, controller) {
			const text = carry + decoder.decode(chunk, { stream: true });
			const lastNewline = text.lastIndexOf("\n");
			if (lastNewline === -1) {
				carry = text;
				return;
			}
			carry = text.slice(lastNewline + 1);
			controller.enqueue(encoder.encode(normalizeReactFlightHintLine(text.slice(0, lastNewline + 1))));
		},
		flush(controller) {
			const text = carry + decoder.decode();
			if (text) controller.enqueue(encoder.encode(normalizeReactFlightHintLine(text)));
		}
	}));
}
function createRscRenderer(render) {
	return (model, options) => normalizeReactFlightPreloadHints(render(model, options));
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/readonly-url-search-params.js
var import_react_react_server = /* @__PURE__ */ __toESM(require_react_react_server(), 1);
var ReadonlyURLSearchParamsError = class extends Error {
	constructor() {
		super("Method unavailable on `ReadonlyURLSearchParams`. Read more: https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams");
	}
};
/**
* Read-only URLSearchParams wrapper matching Next.js runtime behavior.
* Mutation methods remain present for instanceof/API compatibility but throw.
*/
var ReadonlyURLSearchParams = class extends URLSearchParams {
	append(_name, _value) {
		throw new ReadonlyURLSearchParamsError();
	}
	delete(_name, _value) {
		throw new ReadonlyURLSearchParamsError();
	}
	set(_name, _value) {
		throw new ReadonlyURLSearchParamsError();
	}
	sort() {
		throw new ReadonlyURLSearchParamsError();
	}
};
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/url-safety.js
/**
* Shared URL safety utilities for Link, Form, and navigation shims.
*
* Centralizes dangerous URI scheme detection so all components and
* navigation functions use the same validation logic.
*/
/**
* Detect dangerous URI schemes that should never be navigated to.
*
* Adapted from Next.js's javascript URL detector:
* packages/next/src/client/lib/javascript-url.ts
* https://github.com/vercel/next.js/blob/canary/packages/next/src/client/lib/javascript-url.ts
*
* URL parsing ignores leading C0 control characters / spaces, and treats
* embedded tab/newline characters in the scheme as insignificant. We mirror
* that behavior here so obfuscated values like `java\nscript:` and
* `\x00javascript:` are still blocked.
*
* Vinext intentionally extends this handling to `data:` and `vbscript:` too,
* since both are also dangerous navigation targets.
*/
var LEADING_IGNORED = "[\\u0000-\\u001F \\u200B\\uFEFF]*";
var SCHEME_IGNORED = "[\\r\\n\\t]*";
function buildDangerousSchemeRegex(scheme) {
	const chars = scheme.split("").join(SCHEME_IGNORED);
	return new RegExp(`^${LEADING_IGNORED}${chars}${SCHEME_IGNORED}:`, "i");
}
var DANGEROUS_SCHEME_RES = [
	buildDangerousSchemeRegex("javascript"),
	buildDangerousSchemeRegex("data"),
	buildDangerousSchemeRegex("vbscript")
];
var DANGEROUS_URL_BLOCK_MESSAGE = "Next.js has blocked a javascript: URL as a security precaution.";
function isDangerousScheme(url) {
	const str = "" + url;
	return DANGEROUS_SCHEME_RES.some((re) => re.test(str));
}
function assertSafeNavigationUrl(url) {
	if (isDangerousScheme(url)) throw new Error(DANGEROUS_URL_BLOCK_MESSAGE);
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/utils/hash.js
/**
* FNV-1a hash producing a 64-bit result (two 32-bit rounds with different seeds).
* Used for deterministic key generation where collisions must be rare.
*/
function fnv1a64(input) {
	let h1 = 2166136261;
	for (let i = 0; i < input.length; i++) {
		h1 ^= input.charCodeAt(i);
		h1 = h1 * 16777619 >>> 0;
	}
	let h2 = 84696351;
	for (let i = 0; i < input.length; i++) {
		h2 ^= input.charCodeAt(i);
		h2 = h2 * 16777619 >>> 0;
	}
	return h1.toString(36) + h2.toString(36);
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/artifact-compatibility.js
function createArtifactCompatibilityEnvelope(input = {}) {
	return {
		schemaVersion: 1,
		graphVersion: input.graphVersion ?? null,
		deploymentVersion: input.deploymentVersion ?? null,
		appElementsSchemaVersion: 1,
		rscPayloadSchemaVersion: 1,
		rootBoundaryId: input.rootBoundaryId ?? null,
		renderEpoch: input.renderEpoch ?? null
	};
}
function createArtifactCompatibilityGraphVersion(input) {
	return `app-route-graph:${fnv1a64(JSON.stringify([input.routePattern, input.rootBoundaryId]))}`;
}
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isStringOrNull(value) {
	return typeof value === "string" || value === null;
}
function hasCurrentSchemaVersions(record) {
	return record.schemaVersion === 1 && record.appElementsSchemaVersion === 1 && record.rscPayloadSchemaVersion === 1;
}
function parseArtifactCompatibilityEnvelope(value) {
	if (!isRecord(value)) return null;
	if (!hasCurrentSchemaVersions(value)) return null;
	if (!isStringOrNull(value.graphVersion)) return null;
	if (!isStringOrNull(value.deploymentVersion)) return null;
	if (!isStringOrNull(value.rootBoundaryId)) return null;
	if (!isStringOrNull(value.renderEpoch)) return null;
	return {
		schemaVersion: 1,
		graphVersion: value.graphVersion,
		deploymentVersion: value.deploymentVersion,
		appElementsSchemaVersion: 1,
		rscPayloadSchemaVersion: 1,
		rootBoundaryId: value.rootBoundaryId,
		renderEpoch: value.renderEpoch
	};
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-elements-wire.js
var APP_INTERCEPTION_SEPARATOR = "\0";
var APP_ARTIFACT_COMPATIBILITY_KEY = "__artifactCompatibility";
var APP_INTERCEPTION_CONTEXT_KEY = "__interceptionContext";
var APP_LAYOUT_IDS_KEY = "__layoutIds";
var APP_LAYOUT_FLAGS_KEY = "__layoutFlags";
var APP_ROUTE_KEY = "__route";
var APP_ROOT_LAYOUT_KEY = "__rootLayout";
var APP_UNMATCHED_SLOT_WIRE_VALUE = "__VINEXT_UNMATCHED_SLOT__";
var UNMATCHED_SLOT = Symbol.for("vinext.unmatchedSlot");
function appendInterceptionContext(identity, interceptionContext) {
	return interceptionContext === null ? identity : `${identity}${APP_INTERCEPTION_SEPARATOR}${interceptionContext}`;
}
function createAppPayloadRouteId(routePath, interceptionContext) {
	return appendInterceptionContext(`route:${routePath}`, interceptionContext);
}
function createAppPayloadPageId(routePath, interceptionContext) {
	return appendInterceptionContext(`page:${routePath}`, interceptionContext);
}
function createAppPayloadLayoutId(treePath) {
	return `layout:${treePath}`;
}
function createAppPayloadTemplateId(treePath) {
	return `template:${treePath}`;
}
function createAppPayloadSlotId(slotName, treePath) {
	return `slot:${slotName}:${treePath}`;
}
function createAppPayloadCacheKey(rscUrl, interceptionContext) {
	return appendInterceptionContext(rscUrl, interceptionContext);
}
function parsePathWithInterception(input) {
	const separatorIndex = input.indexOf(APP_INTERCEPTION_SEPARATOR);
	const path = separatorIndex === -1 ? input : input.slice(0, separatorIndex);
	if (!path.startsWith("/")) return null;
	return {
		interceptionContext: separatorIndex === -1 ? null : input.slice(separatorIndex + 1),
		path
	};
}
/**
* AppElements tree paths are absolute route-tree paths on the wire.
* Bare segment names are not valid layout/template/slot tree identities.
*/
function parseTreePath(input) {
	return input.startsWith("/") ? input : null;
}
function parseAppElementsWireElementKey(key) {
	if (key.startsWith("route:")) {
		const parsed = parsePathWithInterception(key.slice(6));
		if (!parsed) return null;
		return {
			interceptionContext: parsed.interceptionContext,
			kind: "route",
			path: parsed.path
		};
	}
	if (key.startsWith("page:")) {
		const parsed = parsePathWithInterception(key.slice(5));
		if (!parsed) return null;
		return {
			interceptionContext: parsed.interceptionContext,
			kind: "page",
			path: parsed.path
		};
	}
	if (key.startsWith("layout:")) {
		const treePath = parseTreePath(key.slice(7));
		return treePath ? {
			kind: "layout",
			treePath
		} : null;
	}
	if (key.startsWith("template:")) {
		const treePath = parseTreePath(key.slice(9));
		return treePath ? {
			kind: "template",
			treePath
		} : null;
	}
	if (key.startsWith("slot:")) {
		const body = key.slice(5);
		const separatorIndex = body.indexOf(":");
		if (separatorIndex <= 0) return null;
		const name = body.slice(0, separatorIndex);
		const treePath = parseTreePath(body.slice(separatorIndex + 1));
		return treePath ? {
			kind: "slot",
			name,
			treePath
		} : null;
	}
	return null;
}
function isAppElementsWireSlotId(key) {
	if (!key.startsWith("slot:")) return false;
	const body = key.slice(5);
	const separatorIndex = body.indexOf(":");
	return separatorIndex > 0 && body.charCodeAt(separatorIndex + 1) === 47;
}
function createAppElementsWireMetadataEntries(input) {
	return {
		[APP_ROUTE_KEY]: input.routeId,
		[APP_INTERCEPTION_CONTEXT_KEY]: input.interceptionContext,
		[APP_LAYOUT_IDS_KEY]: [...input.layoutIds ?? []],
		[APP_ROOT_LAYOUT_KEY]: input.rootLayoutTreePath
	};
}
function normalizeAppElements(elements) {
	let needsNormalization = false;
	for (const [key, value] of Object.entries(elements)) if (isAppElementsWireSlotId(key) && value === "__VINEXT_UNMATCHED_SLOT__") {
		needsNormalization = true;
		break;
	}
	if (!needsNormalization) return elements;
	const normalized = {};
	for (const [key, value] of Object.entries(elements)) normalized[key] = isAppElementsWireSlotId(key) && value === "__VINEXT_UNMATCHED_SLOT__" ? UNMATCHED_SLOT : value;
	return normalized;
}
function isLayoutFlagsRecord(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
	for (const v of Object.values(value)) if (v !== "s" && v !== "d") return false;
	return true;
}
function parseLayoutFlags(value) {
	if (isLayoutFlagsRecord(value)) return value;
	return {};
}
function parseLayoutIds(value) {
	if (value === void 0) return [];
	if (!Array.isArray(value)) throw new Error("[vinext] Invalid __layoutIds in App Router payload: expected layout id string[]");
	const layoutIds = [];
	for (const entry of value) {
		if (typeof entry !== "string") throw new Error("[vinext] Invalid __layoutIds in App Router payload: expected layout id string[]");
		if (parseAppElementsWireElementKey(entry)?.kind !== "layout") throw new Error("[vinext] Invalid __layoutIds in App Router payload: expected layout ids");
		layoutIds.push(entry);
	}
	return layoutIds;
}
/**
* Type predicate for a plain (non-null, non-array) record of app payload values.
* Used to distinguish the App Router payload object from bare React elements at
* the render boundary. Narrows to `Readonly<Record<string, unknown>>` because
* the outgoing payload carries heterogeneous values (ReactNodes for the rendered
* tree, plus metadata like `__layoutFlags` which is a plain object). Delegates
* to React's canonical `isValidElement` so we don't depend on React's internal
* `$$typeof` marker scheme.
*/
function isAppElementsRecord(value) {
	if (typeof value !== "object" || value === null) return false;
	if (Array.isArray(value)) return false;
	if ((0, import_react_react_server.isValidElement)(value)) return false;
	return true;
}
function withLayoutFlags(elements, layoutFlags) {
	return {
		...elements,
		[APP_LAYOUT_FLAGS_KEY]: layoutFlags
	};
}
function buildOutgoingAppPayload(input) {
	if (!isAppElementsRecord(input.element)) return input.element;
	return {
		...input.element,
		[APP_LAYOUT_FLAGS_KEY]: input.layoutFlags,
		[APP_ARTIFACT_COMPATIBILITY_KEY]: input.artifactCompatibility ?? createArtifactCompatibilityEnvelope()
	};
}
function readArtifactCompatibilityMetadata(value) {
	if (value === void 0) return createArtifactCompatibilityEnvelope();
	return parseArtifactCompatibilityEnvelope(value) ?? createArtifactCompatibilityEnvelope();
}
function readAppElementsMetadata(elements) {
	const routeId = elements[APP_ROUTE_KEY];
	if (typeof routeId !== "string") throw new Error("[vinext] Missing __route string in App Router payload");
	const interceptionContext = elements[APP_INTERCEPTION_CONTEXT_KEY];
	if (interceptionContext !== void 0 && interceptionContext !== null && typeof interceptionContext !== "string") throw new Error("[vinext] Invalid __interceptionContext in App Router payload");
	const rootLayoutTreePath = elements[APP_ROOT_LAYOUT_KEY];
	if (rootLayoutTreePath === void 0) throw new Error("[vinext] Missing __rootLayout key in App Router payload");
	if (rootLayoutTreePath !== null && typeof rootLayoutTreePath !== "string") throw new Error("[vinext] Invalid __rootLayout in App Router payload: expected string or null");
	const layoutFlags = parseLayoutFlags(elements[APP_LAYOUT_FLAGS_KEY]);
	const layoutIds = parseLayoutIds(elements[APP_LAYOUT_IDS_KEY]);
	return {
		artifactCompatibility: readArtifactCompatibilityMetadata(elements[APP_ARTIFACT_COMPATIBILITY_KEY]),
		interceptionContext: interceptionContext ?? null,
		layoutIds,
		layoutFlags,
		routeId,
		rootLayoutTreePath
	};
}
var AppElementsWire = {
	keys: {
		artifactCompatibility: APP_ARTIFACT_COMPATIBILITY_KEY,
		interceptionContext: APP_INTERCEPTION_CONTEXT_KEY,
		layoutIds: APP_LAYOUT_IDS_KEY,
		layoutFlags: APP_LAYOUT_FLAGS_KEY,
		rootLayout: APP_ROOT_LAYOUT_KEY,
		route: APP_ROUTE_KEY
	},
	unmatchedSlotValue: APP_UNMATCHED_SLOT_WIRE_VALUE,
	createMetadataEntries: createAppElementsWireMetadataEntries,
	decode: normalizeAppElements,
	encodeCacheKey: createAppPayloadCacheKey,
	encodeLayoutId: createAppPayloadLayoutId,
	encodeOutgoingPayload: buildOutgoingAppPayload,
	encodePageId: createAppPayloadPageId,
	encodeRouteId: createAppPayloadRouteId,
	encodeSlotId: createAppPayloadSlotId,
	encodeTemplateId: createAppPayloadTemplateId,
	isSlotId: isAppElementsWireSlotId,
	parseElementKey: parseAppElementsWireElementKey,
	readMetadata: readAppElementsMetadata,
	withLayoutFlags
};
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-mounted-slots-header.js
/**
* Normalize the `x-vinext-mounted-slots` header for request handling and cache keying.
*
* The browser sends mounted slot ids as a space-separated list in the order slots were
* rendered, which changes across navigations. This normalizes to a canonical form
* (sorted, deduplicated) so equivalent slot sets map to the same RSC cache entry.
*
* Consumed by:
*   - app-rsc-request-normalization (request lifecycle, reads incoming header)
*   - app-elements (outgoing x-vinext-mounted-slots construction)
*   - isr-cache (RSC cache key generation)
*/
function normalizeMountedSlotsHeader(raw) {
	if (!raw) return null;
	return Array.from(new Set(raw.split(/\s+/).filter(Boolean))).sort().join(" ") || null;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-rsc-render-mode.js
var APP_RSC_RENDER_MODE_NAVIGATION = "navigation";
var APP_RSC_RENDER_MODE_REFRESH_PRESERVE_UI = "refresh-preserve-ui";
var APP_RSC_RENDER_MODE_ACTION_RERENDER_PRESERVE_UI = "action-rerender-preserve-ui";
function shouldSuppressLoadingBoundaries(mode) {
	return mode === "refresh-preserve-ui" || mode === "action-rerender-preserve-ui";
}
function shouldUsePreserveUiCacheVariant(mode) {
	return shouldSuppressLoadingBoundaries(mode);
}
function parseAppRscRenderMode(value) {
	switch (value) {
		case APP_RSC_RENDER_MODE_REFRESH_PRESERVE_UI: return APP_RSC_RENDER_MODE_REFRESH_PRESERVE_UI;
		case APP_RSC_RENDER_MODE_ACTION_RERENDER_PRESERVE_UI: return APP_RSC_RENDER_MODE_ACTION_RERENDER_PRESERVE_UI;
		default: return APP_RSC_RENDER_MODE_NAVIGATION;
	}
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-rsc-cache-busting.js
/**
* RSC cache-busting hashes cover the headers that make a `.rsc` payload vary.
* Client-side variant headers must survive transit through CDNs and reverse
* proxies; stripping them changes the server hash and turns stale URLs into
* repeated canonicalization redirects.
*/
var VINEXT_RSC_CACHE_BUSTING_SEARCH_PARAM = "_rsc";
var VINEXT_RSC_VARY_HEADER = [
	"RSC",
	"Accept",
	NEXT_ROUTER_STATE_TREE_HEADER,
	NEXT_ROUTER_PREFETCH_HEADER,
	NEXT_ROUTER_SEGMENT_PREFETCH_HEADER,
	NEXT_URL_HEADER,
	VINEXT_INTERCEPTION_CONTEXT_HEADER,
	VINEXT_MOUNTED_SLOTS_HEADER,
	VINEXT_RSC_RENDER_MODE_HEADER
].join(", ");
var CACHE_BUSTING_DIGEST_BYTES = 12;
var textEncoder = new TextEncoder();
function encodeBase64Url(bytes) {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}
function normalizeHeaderValue(value) {
	return value ?? "0";
}
function normalizeRenderModeHeaderValue(value) {
	const renderMode = parseAppRscRenderMode(value);
	return renderMode === "navigation" ? null : renderMode;
}
function createCacheBustingInput(headers, options = {}) {
	const values = [
		headers.get(NEXT_ROUTER_PREFETCH_HEADER),
		headers.get(NEXT_ROUTER_SEGMENT_PREFETCH_HEADER),
		headers.get(NEXT_ROUTER_STATE_TREE_HEADER),
		headers.get(NEXT_URL_HEADER),
		headers.get(VINEXT_INTERCEPTION_CONTEXT_HEADER),
		headers.get(VINEXT_MOUNTED_SLOTS_HEADER),
		...options.includeRenderModeHeader === false ? [] : [normalizeRenderModeHeaderValue(headers.get(VINEXT_RSC_RENDER_MODE_HEADER))]
	];
	if (values.every((value) => value === null)) return null;
	return values.map(normalizeHeaderValue).join(",");
}
async function sha256CacheBustingHash(input) {
	const digest = await globalThis.crypto.subtle.digest("SHA-256", textEncoder.encode(input));
	return encodeBase64Url(new Uint8Array(digest).subarray(0, CACHE_BUSTING_DIGEST_BYTES));
}
function computeLegacyRscCacheBustingSearchParam(headers) {
	const input = createCacheBustingInput(headers);
	return input === null ? "" : fnv1a64(input);
}
async function computePreviousRscCacheBustingSearchParam(headers) {
	const input = createCacheBustingInput(headers, { includeRenderModeHeader: false });
	if (input === null) return null;
	return sha256CacheBustingHash(input);
}
function computePreviousLegacyRscCacheBustingSearchParam(headers) {
	const input = createCacheBustingInput(headers, { includeRenderModeHeader: false });
	return input === null ? null : fnv1a64(input);
}
function getSearchPairsWithoutRscCacheBusting(url) {
	return (url.search.startsWith("?") ? url.search.slice(1) : url.search).split("&").filter((pair) => pair.length > 0 && !isRscCacheBustingSearchPair(pair));
}
function isRscCacheBustingSearchPair(pair) {
	const separatorIndex = pair.indexOf("=");
	const rawKey = separatorIndex === -1 ? pair : pair.slice(0, separatorIndex);
	try {
		return decodeURIComponent(rawKey.replaceAll("+", " ")) === VINEXT_RSC_CACHE_BUSTING_SEARCH_PARAM;
	} catch {
		return rawKey === VINEXT_RSC_CACHE_BUSTING_SEARCH_PARAM;
	}
}
async function computeRscCacheBustingSearchParam(headers) {
	const input = createCacheBustingInput(headers);
	if (input === null) return "";
	return sha256CacheBustingHash(input);
}
function setRscCacheBustingSearchParam(url, hash) {
	const pairs = getSearchPairsWithoutRscCacheBusting(url);
	pairs.push(hash.length > 0 ? `${VINEXT_RSC_CACHE_BUSTING_SEARCH_PARAM}=${hash}` : VINEXT_RSC_CACHE_BUSTING_SEARCH_PARAM);
	url.search = `?${pairs.join("&")}`;
}
function stripRscCacheBustingSearchParam(url) {
	const pairs = getSearchPairsWithoutRscCacheBusting(url);
	url.search = pairs.length > 0 ? `?${pairs.join("&")}` : "";
}
/**
* Remove a trailing `.rsc` suffix from a pathname. Returns the pathname
* unchanged when the suffix is absent.
*/
function stripRscSuffix(pathname) {
	return pathname.endsWith(".rsc") ? pathname.slice(0, -4) : pathname;
}
function toRscRequestPath(href) {
	const hashIndex = href.indexOf("#");
	const beforeHash = hashIndex === -1 ? href : href.slice(0, hashIndex);
	const queryIndex = beforeHash.indexOf("?");
	const pathname = queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex);
	const query = queryIndex === -1 ? "" : beforeHash.slice(queryIndex);
	return `${pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname}.rsc${query}`;
}
async function createRscRequestUrl(href, headers) {
	const url = new URL(toRscRequestPath(href), "http://vinext.local");
	setRscCacheBustingSearchParam(url, await computeRscCacheBustingSearchParam(headers));
	return `${url.pathname}${url.search}`;
}
async function createRscRedirectLocation(location, request) {
	const requestUrl = new URL(request.url);
	const destinationUrl = new URL(location, requestUrl);
	if (destinationUrl.origin !== requestUrl.origin) return destinationUrl.toString();
	const rscPath = await createRscRequestUrl(`${destinationUrl.pathname}${destinationUrl.search}`, request.headers);
	return `${destinationUrl.origin}${rscPath}`;
}
async function resolveInvalidRscCacheBustingRequest(options) {
	if (!options.isRscRequest || options.request.method !== "GET" && options.request.method !== "HEAD") return null;
	const url = new URL(options.request.url);
	const actualHash = url.searchParams.get(VINEXT_RSC_CACHE_BUSTING_SEARCH_PARAM);
	const expectedHash = await computeRscCacheBustingSearchParam(options.request.headers);
	if (actualHash === null && expectedHash === "") return null;
	const acceptedHashes = new Set([expectedHash]);
	if (actualHash !== null && actualHash !== expectedHash) {
		acceptedHashes.add(computeLegacyRscCacheBustingSearchParam(options.request.headers));
		if (normalizeRenderModeHeaderValue(options.request.headers.get("X-Vinext-Rsc-Render-Mode")) === null) {
			const previousHash = await computePreviousRscCacheBustingSearchParam(options.request.headers);
			const previousLegacyHash = computePreviousLegacyRscCacheBustingSearchParam(options.request.headers);
			if (previousHash !== null) acceptedHashes.add(previousHash);
			if (previousLegacyHash !== null) acceptedHashes.add(previousLegacyHash);
		}
	}
	if (actualHash !== null && acceptedHashes.has(actualHash)) return null;
	setRscCacheBustingSearchParam(url, expectedHash);
	return new Response(null, {
		status: 307,
		headers: { Location: `${url.pathname}${url.search}` }
	});
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/navigation.js
var _SERVER_INSERTED_HTML_CTX_KEY = Symbol.for("vinext.serverInsertedHTMLContext");
function getServerInsertedHTMLContext() {
	if (typeof import_react_react_server.createContext !== "function") return null;
	const globalState = globalThis;
	if (!globalState[_SERVER_INSERTED_HTML_CTX_KEY]) globalState[_SERVER_INSERTED_HTML_CTX_KEY] = import_react_react_server.createContext(null);
	return globalState[_SERVER_INSERTED_HTML_CTX_KEY] ?? null;
}
getServerInsertedHTMLContext();
var GLOBAL_ACCESSORS_KEY = Symbol.for("vinext.navigation.globalAccessors");
var _GLOBAL_ACCESSORS_KEY = GLOBAL_ACCESSORS_KEY;
var _GLOBAL_HYDRATION_CONTEXT_KEY = Symbol.for("vinext.navigation.clientHydrationContext");
function _getGlobalAccessors() {
	return globalThis[_GLOBAL_ACCESSORS_KEY];
}
function _getClientHydrationContext() {
	const globalState = globalThis;
	if (Object.prototype.hasOwnProperty.call(globalState, _GLOBAL_HYDRATION_CONTEXT_KEY)) return globalState[_GLOBAL_HYDRATION_CONTEXT_KEY] ?? null;
}
function _setClientHydrationContext(ctx) {
	globalThis[_GLOBAL_HYDRATION_CONTEXT_KEY] = ctx;
}
var _serverContext = null;
var _getServerContext = () => {
	if (typeof window !== "undefined") {
		const hydrationContext = _getClientHydrationContext();
		return hydrationContext !== void 0 ? hydrationContext : _serverContext;
	}
	const g = _getGlobalAccessors();
	return g ? g.getServerContext() : _serverContext;
};
var _setServerContext = (ctx) => {
	if (typeof window !== "undefined") {
		_serverContext = ctx;
		_setClientHydrationContext(ctx);
		return;
	}
	const g = _getGlobalAccessors();
	if (g) g.setServerContext(ctx);
	else _serverContext = ctx;
};
/**
* Register ALS-backed state accessors. Called by navigation-state.ts on import.
* @internal
*/
function _registerStateAccessors(accessors) {
	_getServerContext = accessors.getServerContext;
	_setServerContext = accessors.setServerContext;
	accessors.getInsertedHTMLCallbacks;
	accessors.clearInsertedHTMLCallbacks;
}
/**
* Get the navigation context for the current SSR/RSC render.
* Reads from AsyncLocalStorage when available (concurrent-safe),
* otherwise falls back to module-level state.
*/
function getNavigationContext() {
	return _getServerContext();
}
/**
* Set the navigation context for the current SSR/RSC render.
* Called by the framework entry before rendering each request.
*/
function setNavigationContext(ctx) {
	_setServerContext(ctx);
}
var isServer = typeof window === "undefined";
var _CLIENT_NAV_STATE_KEY = Symbol.for("vinext.clientNavigationState");
function getClientNavigationState() {
	if (isServer) return null;
	const globalState = window;
	globalState[_CLIENT_NAV_STATE_KEY] ??= {
		listeners: /* @__PURE__ */ new Set(),
		cachedSearch: window.location.search,
		cachedReadonlySearchParams: new ReadonlyURLSearchParams(window.location.search),
		cachedPathname: stripBasePath(window.location.pathname, ""),
		clientParams: {},
		clientParamsJson: "{}",
		pendingClientParams: null,
		pendingClientParamsJson: null,
		pendingPathname: null,
		pendingPathnameNavId: null,
		originalPushState: window.history.pushState.bind(window.history),
		originalReplaceState: window.history.replaceState.bind(window.history),
		patchInstalled: false,
		hasPendingNavigationUpdate: false,
		suppressUrlNotifyCount: 0,
		navigationSnapshotActiveCount: 0
	};
	return globalState[_CLIENT_NAV_STATE_KEY];
}
function notifyNavigationListeners() {
	const state = getClientNavigationState();
	if (!state) return;
	for (const fn of state.listeners) fn();
}
function syncCommittedUrlStateFromLocation() {
	const state = getClientNavigationState();
	if (!state) return false;
	let changed = false;
	const pathname = stripBasePath(window.location.pathname, "");
	if (pathname !== state.cachedPathname) {
		state.cachedPathname = pathname;
		changed = true;
	}
	const search = window.location.search;
	if (search !== state.cachedSearch) {
		state.cachedSearch = search;
		state.cachedReadonlySearchParams = new ReadonlyURLSearchParams(search);
		changed = true;
	}
	return changed;
}
/**
* Commit pending client navigation state to committed snapshots.
*
* navId is optional: callers that don't own pendingPathname (for example,
* superseded pre-paint cleanup) may pass undefined to flush URL/params state
* without clearing pendingPathname owned by the active navigation. Such callers
* must opt in explicitly if they also own an activated render snapshot.
*/
function commitClientNavigationState(navId, options) {
	if (isServer) return;
	const state = getClientNavigationState();
	if (!state) return;
	if ((navId !== void 0 || options?.releaseSnapshot === true) && state.navigationSnapshotActiveCount > 0) state.navigationSnapshotActiveCount -= 1;
	const urlChanged = syncCommittedUrlStateFromLocation();
	if (state.pendingClientParams !== null && state.pendingClientParamsJson !== null) {
		state.clientParams = state.pendingClientParams;
		state.clientParamsJson = state.pendingClientParamsJson;
		state.pendingClientParams = null;
		state.pendingClientParamsJson = null;
	}
	if (state.pendingPathnameNavId === null || navId !== void 0 && state.pendingPathnameNavId === navId) {
		state.pendingPathname = null;
		state.pendingPathnameNavId = null;
	}
	const shouldNotify = urlChanged || state.hasPendingNavigationUpdate;
	state.hasPendingNavigationUpdate = false;
	if (shouldNotify) notifyNavigationListeners();
}
/**
* Restore scroll position from a history state object (used on popstate).
*
* When an RSC navigation is in flight (back/forward triggers both this
* handler and the browser entry's popstate handler which calls
* __VINEXT_RSC_NAVIGATE__), we must wait for the new content to render
* before scrolling. Otherwise the user sees old content flash at the
* restored scroll position.
*
* This handler fires before the browser entry's popstate handler (because
* navigation.ts is loaded before hydration completes), so we defer via a
* microtask to give the browser entry handler a chance to set
* __VINEXT_RSC_PENDING__. Promise.resolve() schedules a microtask
* that runs after all synchronous event listeners have completed.
*/
function restoreScrollPosition(state) {
	if (state && typeof state === "object" && "__vinext_scrollY" in state) {
		const { __vinext_scrollX: x, __vinext_scrollY: y } = state;
		Promise.resolve().then(() => {
			const pending = window.__VINEXT_RSC_PENDING__ ?? null;
			if (pending) pending.then(() => {
				requestAnimationFrame(() => {
					window.scrollTo(x, y);
				});
			});
			else requestAnimationFrame(() => {
				window.scrollTo(x, y);
			});
		});
	}
}
if (!isServer) {
	const state = getClientNavigationState();
	if (state && !state.patchInstalled) {
		state.patchInstalled = true;
		window.addEventListener("popstate", (event) => {
			if (typeof window.__VINEXT_RSC_NAVIGATE__ !== "function") {
				commitClientNavigationState();
				restoreScrollPosition(event.state);
			}
		});
		window.history.pushState = function patchedPushState(data, unused, url) {
			state.originalPushState.call(window.history, data, unused, url);
			if (state.suppressUrlNotifyCount === 0) commitClientNavigationState();
		};
		window.history.replaceState = function patchedReplaceState(data, unused, url) {
			state.originalReplaceState.call(window.history, data, unused, url);
			if (state.suppressUrlNotifyCount === 0) commitClientNavigationState();
		};
	}
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/client-hook-error.js
/**
* Shared error helper for client-only hooks called in Server Components.
*
* Used by `.react-server.ts` shim variants to provide a clear, actionable
* error message when a developer forgets the "use client" directive.
*
* @see https://github.com/cloudflare/vinext/issues/834
*/
function buildClientHookErrorMessage(hookName) {
	return `${hookName} only works in Client Components. Add the "use client" directive at the top of the file to use it. Read more: https://nextjs.org/docs/messages/react-client-hook-in-server-component`;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/internal/cookie-serialize.js
/**
* RFC 6265 §4.1.1: cookie-name is a token (RFC 2616 §2.2).
* Allowed: any visible ASCII (0x21-0x7E) except separators: ()<>@,;:\"/[]?={}
*/
var VALID_COOKIE_NAME_RE = /^[\x21\x23-\x27\x2A\x2B\x2D\x2E\x30-\x39\x41-\x5A\x5E-\x7A\x7C\x7E]+$/;
function validateCookieName(name) {
	if (!name || !VALID_COOKIE_NAME_RE.test(name)) throw new Error(`Invalid cookie name: ${JSON.stringify(name)}`);
}
/**
* Validate cookie attribute values (path, domain) to prevent injection
* via semicolons, newlines, or other control characters.
*/
function validateCookieAttributeValue(value, attributeName) {
	for (let i = 0; i < value.length; i++) {
		const code = value.charCodeAt(i);
		if (code <= 31 || code === 127 || value[i] === ";") throw new Error(`Invalid cookie ${attributeName} value: ${JSON.stringify(value)}`);
	}
}
/**
* Build a Set-Cookie header string from a cookie name, value, and attributes.
*
* - Encodes the value with `encodeURIComponent`.
* - Defaults `Path` to `/` (matching @edge-runtime/cookies and Next.js).
* - Validates path/domain to reject control characters and semicolons.
* - Emits attributes in the order: Path, Domain, Max-Age, Expires, HttpOnly,
*   Secure, SameSite.
*
* The caller is responsible for validating the cookie name (typically before
* mutating any internal state) via `validateCookieName`.
*/
function serializeSetCookie(name, value, options) {
	const parts = [`${name}=${encodeURIComponent(value)}`];
	const path = options?.path ?? "/";
	validateCookieAttributeValue(path, "Path");
	parts.push(`Path=${path}`);
	if (options?.domain) {
		validateCookieAttributeValue(options.domain, "Domain");
		parts.push(`Domain=${options.domain}`);
	}
	if (options?.maxAge !== void 0) parts.push(`Max-Age=${options.maxAge}`);
	if (options?.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
	if (options?.httpOnly) parts.push("HttpOnly");
	if (options?.secure) parts.push("Secure");
	if (options?.sameSite) parts.push(`SameSite=${options.sameSite}`);
	return parts.join("; ");
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/internal/parse-cookie-header.js
/**
* Port of the current Next.js/@edge-runtime request cookie parser semantics.
*
* Important details:
* - split on a semicolon-plus-optional-spaces pattern
* - preserve whitespace around names/values otherwise
* - bare tokens become "true"
* - malformed percent-encoded values are skipped
* - duplicate names collapse to the last value via Map.set()
*/
function parseCookieHeader(cookieHeader) {
	const cookies = /* @__PURE__ */ new Map();
	for (const pair of cookieHeader.split(/; */)) {
		if (!pair) continue;
		const splitAt = pair.indexOf("=");
		if (splitAt === -1) {
			cookies.set(pair, "true");
			continue;
		}
		const key = pair.slice(0, splitAt);
		const value = pair.slice(splitAt + 1);
		try {
			cookies.set(key, decodeURIComponent(value));
		} catch {}
	}
	return cookies;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/headers.js
var _FALLBACK_KEY$4 = Symbol.for("vinext.nextHeadersShim.fallback");
var _g$6 = globalThis;
var _als$2 = getOrCreateAls("vinext.nextHeadersShim.als");
var _fallbackState$3 = _g$6[_FALLBACK_KEY$4] ??= {
	headersContext: null,
	dynamicUsageDetected: false,
	invalidDynamicUsageError: null,
	pendingSetCookies: [],
	draftModeCookieHeader: null,
	phase: "render"
};
(/* @__PURE__ */ new Date(0)).toUTCString();
function splitMiddlewareSetCookieHeader(value) {
	const cookies = [];
	let start = 0;
	let inExpires = false;
	let expiresCommaSeen = false;
	for (let i = 0; i < value.length; i++) {
		if (value.slice(i, i + 8).toLowerCase() === "expires=") {
			inExpires = true;
			expiresCommaSeen = false;
			i += 7;
			continue;
		}
		const ch = value[i];
		if (inExpires && ch === ";") {
			inExpires = false;
			expiresCommaSeen = false;
			continue;
		}
		if (ch !== ",") continue;
		if (inExpires && !expiresCommaSeen) {
			expiresCommaSeen = true;
			continue;
		}
		const cookie = value.slice(start, i).trim();
		if (cookie) cookies.push(cookie);
		start = i + 1;
		inExpires = false;
		expiresCommaSeen = false;
	}
	const cookie = value.slice(start).trim();
	if (cookie) cookies.push(cookie);
	return cookies;
}
function setCookieNameValue(setCookie) {
	const equalsIndex = setCookie.indexOf("=");
	if (equalsIndex <= 0) return null;
	const name = setCookie.slice(0, equalsIndex).trim();
	const valueEnd = setCookie.indexOf(";", equalsIndex + 1);
	const encodedValue = setCookie.slice(equalsIndex + 1, valueEnd === -1 ? void 0 : valueEnd);
	let value;
	try {
		value = decodeURIComponent(encodedValue);
	} catch {
		value = encodedValue;
	}
	return {
		name,
		value
	};
}
function rebuildCookiesFromHeader(ctx, cookieHeader) {
	ctx.cookies.clear();
	if (cookieHeader === null) return;
	const nextCookies = parseCookieHeader(cookieHeader);
	for (const [name, value] of nextCookies) ctx.cookies.set(name, value);
}
function mergeMiddlewareSetCookies(ctx, rawHeader) {
	if (rawHeader === null) return false;
	let merged = false;
	for (const setCookie of splitMiddlewareSetCookieHeader(rawHeader)) {
		const entry = setCookieNameValue(setCookie);
		if (!entry) continue;
		ctx.cookies.set(entry.name, entry.value);
		merged = true;
	}
	return merged;
}
function _getState$2() {
	if (isInsideUnifiedScope()) return getRequestContext();
	return _als$2.getStore() ?? _fallbackState$3;
}
/**
* Dynamic usage flag — set when a component calls connection(), cookies(),
* headers(), or noStore() during rendering. When true, ISR caching is
* bypassed and the response gets Cache-Control: no-store.
*/
/**
* Mark the current render as requiring dynamic (uncached) rendering.
* Called by connection(), cookies(), headers(), and noStore().
*/
function markDynamicUsage() {
	const state = _getState$2();
	if (state.headersContext?.forceStatic) return;
	state.dynamicUsageDetected = true;
}
/**
* Check, consume, and return any invalid dynamic usage error recorded during
* the render (e.g. cookies() called inside "use cache"). This error persists
* even if the throw was caught by user-code try/catch, so it can surface on
* client-side navigations where the static shell validation is skipped.
* Ported from Next.js: workStore.invalidDynamicUsageError in
* packages/next/src/server/app-render/app-render.tsx
* https://github.com/vercel/next.js/commit/f5e54c06726b571a042fce67417e40a29f6b8689
*/
function consumeInvalidDynamicUsageError() {
	const state = _getState$2();
	const err = state.invalidDynamicUsageError;
	state.invalidDynamicUsageError = null;
	return err;
}
/**
* Check and reset the dynamic usage flag.
* Called by the server after rendering to decide on caching.
*/
function consumeDynamicUsage() {
	const state = _getState$2();
	const used = state.dynamicUsageDetected;
	state.dynamicUsageDetected = false;
	return used;
}
function _setStatePhase(state, phase) {
	const previous = state.phase;
	state.phase = phase;
	return previous;
}
function setHeadersAccessPhase(phase) {
	return _setStatePhase(_getState$2(), phase);
}
/**
* Set the headers/cookies context for the current RSC render.
* Called by the framework's RSC entry before rendering each request.
*
* @deprecated Prefer runWithHeadersContext() which uses als.run() for
* proper per-request isolation. This function mutates the ALS store
* in-place and is only safe for cleanup (ctx=null) within an existing
* als.run() scope.
*/
/**
* Returns the current live HeadersContext from ALS (or the fallback).
* Used after applyMiddlewareRequestHeaders() to build a post-middleware
* request context for afterFiles/fallback rewrite has/missing evaluation.
*/
function getHeadersContext() {
	return _getState$2().headersContext;
}
function setHeadersContext(ctx) {
	const state = _getState$2();
	if (ctx !== null) {
		state.headersContext = ctx;
		state.dynamicUsageDetected = false;
		state.pendingSetCookies = [];
		state.draftModeCookieHeader = null;
		state.phase = "render";
	} else {
		state.headersContext = null;
		state.phase = "render";
	}
}
/**
* Apply middleware-forwarded request headers to the current headers context.
*
* When Next.js middleware calls `NextResponse.next()` or `NextResponse.rewrite()`
* with `{ request: { headers } }`, the modified headers are encoded on the
* middleware response. This function decodes that protocol and applies the
* resulting request header set to the live `HeadersContext`. When an override
* list is present, omitted headers are deleted as part of the rebuild.
*
* Cached `readonlyHeaders` and `readonlyCookies` snapshots on the
* HeadersContext must be invalidated whenever this function rebuilds the
* underlying `headers`/`cookies`. Otherwise a middleware that reads
* `headers()` (or `cookies()`) before returning a request-header override —
* for example `@clerk/nextjs`, whose `clerkClient()` reads `headers()` via
* `buildRequestLike()` during middleware execution — primes a sealed snapshot
* built from the *pre*-override request, and any subsequent `headers()` call
* from a Server Component would return that stale snapshot instead of the
* middleware-modified view.
*/
function applyMiddlewareRequestHeaders(middlewareResponseHeaders) {
	const state = _getState$2();
	if (!state.headersContext) return;
	const ctx = state.headersContext;
	const previousCookieHeader = ctx.headers.get("cookie");
	const middlewareSetCookieHeader = middlewareResponseHeaders.get(MIDDLEWARE_SET_COOKIE_HEADER);
	const nextHeaders = buildRequestHeadersFromMiddlewareResponse(ctx.headers, middlewareResponseHeaders);
	if (!nextHeaders && middlewareSetCookieHeader === null) return;
	if (nextHeaders) {
		ctx.headers = nextHeaders;
		ctx.readonlyHeaders = void 0;
		const nextCookieHeader = nextHeaders.get("cookie");
		if (previousCookieHeader !== nextCookieHeader) {
			rebuildCookiesFromHeader(ctx, nextCookieHeader);
			ctx.readonlyCookies = void 0;
			ctx.mutableCookies = void 0;
		}
	}
	if (mergeMiddlewareSetCookies(ctx, middlewareSetCookieHeader)) {
		ctx.readonlyCookies = void 0;
		ctx.mutableCookies = void 0;
	}
}
/** Methods on `Headers` that mutate state. Hoisted to module scope — static. */
var _HEADERS_MUTATING_METHODS = new Set([
	"set",
	"delete",
	"append"
]);
/**
* Create a HeadersContext from a standard Request object.
*
* Performance note: In Workerd (Cloudflare Workers), `new Headers(request.headers)`
* copies the entire header map across the V8/C++ boundary, which shows up as
* ~815 ms self-time in production profiles when requests carry many headers.
* We defer this copy with a lazy proxy:
*
* - Reads (`get`, `has`, `entries`, …) are forwarded directly to the original
*   immutable `request.headers` — zero copy cost on the hot path.
* - The first mutating call (`set`, `delete`, `append`) materialises
*   `new Headers(request.headers)` once, then applies the mutation to the copy.
*   All subsequent operations go to the copy.
*
* This means the ~815 ms copy only occurs when middleware actually rewrites
* request headers via `NextResponse.next({ request: { headers } })`, which is
* uncommon.  Pure read requests (the vast majority) pay zero copy cost.
*
* Cookie parsing is also deferred: the `cookie` header string is not split
* until the first call to `cookies()` or `draftMode()`.
*/
function headersContextFromRequest(request) {
	let _mutable = null;
	const headersProxy = new Proxy(request.headers, { get(target, prop) {
		const src = _mutable ?? target;
		if (typeof prop === "string" && _HEADERS_MUTATING_METHODS.has(prop)) return (...args) => {
			if (!_mutable) _mutable = new Headers(target);
			return _mutable[prop](...args);
		};
		const value = Reflect.get(src, prop, src);
		return typeof value === "function" ? value.bind(src) : value;
	} });
	let _cookies = null;
	function getCookies() {
		if (_cookies) return _cookies;
		_cookies = parseCookieHeader(headersProxy.get("cookie") || "");
		return _cookies;
	}
	return {
		headers: headersProxy,
		get cookies() {
			return getCookies();
		}
	};
}
/** Accumulated Set-Cookie headers from cookies().set() / .delete() calls */
/**
* Get and clear all pending Set-Cookie headers generated by cookies().set()/delete().
* Called by the framework after rendering to attach headers to the response.
*/
function getAndClearPendingCookies() {
	const state = _getState$2();
	const cookies = state.pendingSetCookies;
	state.pendingSetCookies = [];
	return cookies;
}
var DRAFT_MODE_COOKIE = "__prerender_bypass";
(/* @__PURE__ */ new Date(0)).toUTCString();
function getDraftSecret() {
	return "84c887cb-17b9-4edc-8486-7eab4eda1d9d";
}
/**
* Get any Set-Cookie header generated by draftMode().enable()/disable().
* Called by the framework after rendering to attach the header to the response.
*/
function getDraftModeCookieHeader() {
	const state = _getState$2();
	const header = state.draftModeCookieHeader;
	state.draftModeCookieHeader = null;
	return header;
}
function isDraftModeRequest(request) {
	const cookieHeader = request.headers.get("cookie");
	if (!cookieHeader) return false;
	return parseCookieHeader(cookieHeader).get(DRAFT_MODE_COOKIE) === getDraftSecret();
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/thenable-params.js
function hasParamProperty(obj, prop) {
	return Object.prototype.hasOwnProperty.call(obj, prop);
}
var wellKnownProperties = new Set([
	"hasOwnProperty",
	"isPrototypeOf",
	"propertyIsEnumerable",
	"toString",
	"valueOf",
	"toLocaleString",
	"then",
	"catch",
	"finally",
	"status",
	"value",
	"error",
	"displayName",
	"_debugInfo",
	"toJSON",
	"$$typeof",
	"__esModule",
	"@@iterator"
]);
function isWellKnownProperty(prop) {
	return wellKnownProperties.has(prop);
}
function makeThenableParams(obj) {
	const plain = { ...obj };
	const promise = Promise.resolve(plain);
	return new Proxy(promise, {
		get(target, prop, receiver) {
			if (!isWellKnownProperty(prop) && hasParamProperty(plain, prop)) return Reflect.get(plain, prop);
			const value = Reflect.get(target, prop, receiver);
			return typeof value === "function" ? value.bind(target) : value;
		},
		getOwnPropertyDescriptor(target, prop) {
			if (!isWellKnownProperty(prop) && hasParamProperty(plain, prop)) return {
				configurable: true,
				enumerable: true,
				value: Reflect.get(plain, prop),
				writable: true
			};
			return Reflect.getOwnPropertyDescriptor(target, prop);
		},
		has(target, prop) {
			return Reflect.has(target, prop) || !isWellKnownProperty(prop) && hasParamProperty(plain, prop);
		},
		ownKeys() {
			return Reflect.ownKeys(plain).filter((prop) => !isWellKnownProperty(prop));
		}
	});
}
//#endregion
//#region node_modules/.pnpm/react@19.2.6/node_modules/react/cjs/react-jsx-runtime.react-server.production.js
/**
* @license React
* react-jsx-runtime.react-server.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_jsx_runtime_react_server_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var React = require_react_react_server(), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	if (!React.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) throw Error("The \"react\" package in this environment is not configured correctly. The \"react-server\" condition must be enabled in any environment that runs React Server Components.");
	function jsxProd(type, config, maybeKey) {
		var key = null;
		void 0 !== maybeKey && (key = "" + maybeKey);
		void 0 !== config.key && (key = "" + config.key);
		if ("key" in config) {
			maybeKey = {};
			for (var propName in config) "key" !== propName && (maybeKey[propName] = config[propName]);
		} else maybeKey = config;
		config = maybeKey.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== config ? config : null,
			props: maybeKey
		};
	}
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.jsx = jsxProd;
	exports.jsxs = jsxProd;
}));
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/metadata.js
var import_jsx_runtime_react_server = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_jsx_runtime_react_server_production();
})))();
/**
* Resolve viewport config from a module. Handles both static `viewport` export
* and async `generateViewport()` function.
*/
async function resolveModuleViewport(mod, params) {
	if (typeof mod.generateViewport === "function") {
		const asyncParams = makeThenableParams(params);
		return await mod.generateViewport({ params: asyncParams });
	}
	if (mod.viewport && typeof mod.viewport === "object") return mod.viewport;
	return null;
}
/**
* Merge viewport configs from multiple sources (layouts + page).
* Later entries override earlier ones.
*/
var DEFAULT_VIEWPORT = {
	width: "device-width",
	initialScale: 1
};
function mergeViewport(viewportList) {
	const merged = { ...DEFAULT_VIEWPORT };
	for (const vp of viewportList) Object.assign(merged, vp);
	return merged;
}
/**
* React component that renders viewport meta tags into <head>.
*/
function ViewportHead({ viewport }) {
	const elements = [];
	let key = 0;
	const parts = [];
	if (viewport.width !== void 0) parts.push(`width=${viewport.width}`);
	if (viewport.height !== void 0) parts.push(`height=${viewport.height}`);
	if (viewport.initialScale !== void 0) parts.push(`initial-scale=${viewport.initialScale}`);
	if (viewport.minimumScale !== void 0) parts.push(`minimum-scale=${viewport.minimumScale}`);
	if (viewport.maximumScale !== void 0) parts.push(`maximum-scale=${viewport.maximumScale}`);
	if (viewport.userScalable !== void 0) parts.push(`user-scalable=${viewport.userScalable ? "yes" : "no"}`);
	if (parts.length > 0) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "viewport",
		content: parts.join(", ")
	}, key++));
	if (viewport.themeColor) {
		if (typeof viewport.themeColor === "string") elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "theme-color",
			content: viewport.themeColor
		}, key++));
		else if (Array.isArray(viewport.themeColor)) for (const entry of viewport.themeColor) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "theme-color",
			content: entry.color,
			...entry.media ? { media: entry.media } : {}
		}, key++));
	}
	if (viewport.colorScheme) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "color-scheme",
		content: viewport.colorScheme
	}, key++));
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: elements });
}
function isPlainObject$1(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof URL);
}
function isOtherMetadata(value) {
	if (!isPlainObject$1(value)) return false;
	return Object.values(value).every((item) => {
		if (typeof item === "string") return true;
		return Array.isArray(item) && item.every((nestedItem) => typeof nestedItem === "string");
	});
}
/**
* Extract a plain string title from a metadata title value.
*/
function resolveStringTitle(title) {
	if (typeof title === "string") return title;
	if (title && typeof title === "object") return title.absolute ?? title.default ?? void 0;
}
/**
* Post-process merged metadata to cross-fill openGraph and Twitter fields.
*
* Next.js runs this once after all layouts/pages and file-based metadata
* have been resolved. When openGraph exists, it auto-fills missing
* twitter:title/description/images from openGraph (falling back to root
* metadata title/description). Existing openGraph/twitter objects also inherit
* missing title/description from root metadata.
*
* Ported from Next.js:
* https://github.com/vercel/next.js/blob/canary/packages/next/src/lib/metadata/resolve-metadata.ts
*/
function postProcessMetadata(merged) {
	const result = { ...merged };
	const resolvedTitle = resolveStringTitle(result.title);
	if (result.openGraph) {
		const og = { ...result.openGraph };
		if (!og.title && resolvedTitle) og.title = resolvedTitle;
		if (!og.description && result.description) og.description = result.description;
		result.openGraph = og;
	}
	if (result.openGraph) {
		const autoFill = {};
		const existingTwitter = result.twitter;
		const hasTwTitle = existingTwitter ? Boolean(existingTwitter.title) : false;
		const hasTwDescription = existingTwitter ? Boolean(existingTwitter.description) : false;
		const hasTwImages = existingTwitter ? Object.prototype.hasOwnProperty.call(existingTwitter, "images") && Boolean(existingTwitter.images) : false;
		if (!hasTwTitle) {
			if (result.openGraph.title) autoFill.title = result.openGraph.title;
			else if (resolvedTitle) autoFill.title = resolvedTitle;
		}
		if (!hasTwDescription) autoFill.description = result.openGraph.description || result.description || void 0;
		if (!hasTwImages) autoFill.images = result.openGraph.images;
		if (Object.keys(autoFill).length > 0) if (existingTwitter) result.twitter = {
			...existingTwitter,
			...autoFill
		};
		else result.twitter = autoFill;
	}
	if (result.twitter) {
		const tw = { ...result.twitter };
		if (!tw.title && resolvedTitle) tw.title = resolvedTitle;
		if (!tw.description && result.description) tw.description = result.description;
		result.twitter = tw;
	}
	if (result.twitter) {
		const tw = { ...result.twitter };
		if (!tw.card) {
			const images = tw.images;
			tw.card = (Array.isArray(images) ? images.length > 0 : Boolean(images)) ? "summary_large_image" : "summary";
		}
		result.twitter = tw;
	}
	return result;
}
/**
* Merge metadata from multiple sources (layouts + page).
*
* The list is ordered [rootLayout, nestedLayout, ..., page].
* Title template from layouts applies to the page title but NOT to
* the segment that defines the template itself. `title.absolute`
* skips all templates. `title.default` is the fallback when no
* child provides a title.
*
* For top-level keys, later entries override earlier ones. `other` custom meta
* tags are the exception: Next.js merges those across segments.
*/
function mergeMetadataEntries(entries) {
	if (entries.length === 0) return {};
	const merged = {};
	let parentTemplate;
	for (const entry of entries) {
		const meta = entry.metadata;
		const isPage = Boolean(entry.isPage);
		const contributesTitle = entry.contributesTitle !== false;
		if (contributesTitle && !isPage && meta.title && typeof meta.title === "object" && meta.title.template) parentTemplate = meta.title.template;
		for (const key of Object.keys(meta)) {
			if (key === "title") continue;
			const incoming = meta[key];
			const existing = merged[key];
			if (key === "other" && isOtherMetadata(existing) && isOtherMetadata(incoming)) merged.other = {
				...existing,
				...incoming
			};
			else merged[key] = incoming;
		}
		if (contributesTitle && meta.title !== void 0) merged.title = meta.title;
	}
	const finalTitle = merged.title;
	if (finalTitle) {
		if (typeof finalTitle === "string") {
			if (parentTemplate) merged.title = parentTemplate.replace("%s", finalTitle);
		} else if (typeof finalTitle === "object") {
			if (finalTitle.absolute) merged.title = finalTitle.absolute;
			else if (finalTitle.default) merged.title = finalTitle.default;
			else if (finalTitle.template && !finalTitle.default && !finalTitle.absolute) merged.title = void 0;
		}
	}
	return merged;
}
/**
* Resolve metadata from a module. Handles both static `metadata` export
* and async `generateMetadata()` function.
*
* @param parent - A Promise that resolves to the accumulated (merged) metadata
*   from all ancestor segments. Passed as the second argument to
*   `generateMetadata()`, matching Next.js's eager-execution-with-serial-
*   resolution approach. If not provided, defaults to a promise that resolves
*   to an empty object (so `await parent` never throws).
*/
async function resolveModuleMetadata(mod, params = {}, searchParams, parent = Promise.resolve({})) {
	if (typeof mod.generateMetadata === "function") {
		const asyncParams = makeThenableParams(params);
		const props = searchParams === void 0 ? { params: asyncParams } : {
			params: asyncParams,
			searchParams: makeThenableParams(searchParams)
		};
		return await mod.generateMetadata(props, parent);
	}
	if (mod.metadata && typeof mod.metadata === "object") return mod.metadata;
	return null;
}
/**
* React component that renders metadata as HTML head elements.
* Used by the RSC entry to inject into the <head>.
*/
function isIconDescriptor(value) {
	if (typeof value !== "object" || value === null || value instanceof URL || Array.isArray(value)) return false;
	const urlValue = Reflect.get(value, "url");
	return typeof urlValue === "string" || urlValue instanceof URL;
}
function isIconsMap(value) {
	return typeof value === "object" && !(value instanceof URL) && !Array.isArray(value) && !isIconDescriptor(value);
}
function normalizeUrlDescriptor(value, createDescriptor) {
	if (typeof value === "string" || value instanceof URL) return createDescriptor(value);
	return value;
}
function normalizeUrlDescriptorEntries(value, createDescriptor) {
	if (!value) return [];
	if (Array.isArray(value)) return value.map((entry) => normalizeUrlDescriptor(entry, createDescriptor));
	return [normalizeUrlDescriptor(value, createDescriptor)];
}
function MetadataHead({ metadata }) {
	const elements = [];
	let key = 0;
	const base = metadata.metadataBase;
	function resolveUrl(url) {
		if (!url) return void 0;
		const s = typeof url === "string" ? url : url instanceof URL ? url.toString() : String(url);
		if (!base) return s;
		if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("//")) return s;
		try {
			return new URL(s, base).toString();
		} catch {
			return s;
		}
	}
	const title = typeof metadata.title === "string" ? metadata.title : typeof metadata.title === "object" ? metadata.title.absolute || metadata.title.default : void 0;
	if (title) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("title", { children: title }, key++));
	if (metadata.description) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "description",
		content: metadata.description
	}, key++));
	if (metadata.generator) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "generator",
		content: metadata.generator
	}, key++));
	if (metadata.applicationName) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "application-name",
		content: metadata.applicationName
	}, key++));
	if (metadata.referrer) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "referrer",
		content: metadata.referrer
	}, key++));
	if (metadata.keywords) {
		const kw = Array.isArray(metadata.keywords) ? metadata.keywords.join(",") : metadata.keywords;
		elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "keywords",
			content: kw
		}, key++));
	}
	if (metadata.authors) {
		const authorList = Array.isArray(metadata.authors) ? metadata.authors : [metadata.authors];
		for (const author of authorList) {
			if (author.name) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
				name: "author",
				content: author.name
			}, key++));
			if (author.url) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
				rel: "author",
				href: author.url
			}, key++));
		}
	}
	if (metadata.creator) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "creator",
		content: metadata.creator
	}, key++));
	if (metadata.publisher) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "publisher",
		content: metadata.publisher
	}, key++));
	if (metadata.formatDetection) {
		const parts = [];
		if (metadata.formatDetection.telephone === false) parts.push("telephone=no");
		if (metadata.formatDetection.address === false) parts.push("address=no");
		if (metadata.formatDetection.email === false) parts.push("email=no");
		if (parts.length > 0) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "format-detection",
			content: parts.join(", ")
		}, key++));
	}
	if (metadata.category) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "category",
		content: metadata.category
	}, key++));
	if (metadata.robots) if (typeof metadata.robots === "string") elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
		name: "robots",
		content: metadata.robots
	}, key++));
	else {
		const { googleBot, ...robotsRest } = metadata.robots;
		const robotParts = [];
		for (const [k, v] of Object.entries(robotsRest)) if (v === true) robotParts.push(k);
		else if (v === false) robotParts.push(`no${k}`);
		else if (typeof v === "string" || typeof v === "number") robotParts.push(`${k}:${v}`);
		if (robotParts.length > 0) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "robots",
			content: robotParts.join(", ")
		}, key++));
		if (googleBot) if (typeof googleBot === "string") elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "googlebot",
			content: googleBot
		}, key++));
		else {
			const gbParts = [];
			for (const [k, v] of Object.entries(googleBot)) if (v === true) gbParts.push(k);
			else if (v === false) gbParts.push(`no${k}`);
			else if (typeof v === "string" || typeof v === "number") gbParts.push(`${k}:${v}`);
			if (gbParts.length > 0) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
				name: "googlebot",
				content: gbParts.join(", ")
			}, key++));
		}
	}
	if (metadata.openGraph) {
		const og = metadata.openGraph;
		if (og.title) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "og:title",
			content: og.title
		}, key++));
		if (og.description) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "og:description",
			content: og.description
		}, key++));
		if (og.url) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "og:url",
			content: resolveUrl(og.url)
		}, key++));
		if (og.siteName) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "og:site_name",
			content: og.siteName
		}, key++));
		if (og.type) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "og:type",
			content: og.type
		}, key++));
		if (og.locale) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "og:locale",
			content: og.locale
		}, key++));
		if (og.publishedTime) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "article:published_time",
			content: og.publishedTime
		}, key++));
		if (og.modifiedTime) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "article:modified_time",
			content: og.modifiedTime
		}, key++));
		if (og.authors) for (const author of og.authors) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "article:author",
			content: author
		}, key++));
		if (og.images) {
			const imgList = typeof og.images === "string" || og.images instanceof URL ? [{ url: og.images }] : Array.isArray(og.images) ? og.images : [og.images];
			for (const img of imgList) {
				const imgUrl = typeof img === "string" || img instanceof URL ? img : img.url;
				elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
					property: "og:image",
					content: resolveUrl(imgUrl)
				}, key++));
				if (typeof img !== "string" && !(img instanceof URL)) {
					if (img.width) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
						property: "og:image:width",
						content: String(img.width)
					}, key++));
					if (img.height) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
						property: "og:image:height",
						content: String(img.height)
					}, key++));
					if (img.type) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
						property: "og:image:type",
						content: img.type
					}, key++));
					if (img.alt) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
						property: "og:image:alt",
						content: img.alt
					}, key++));
				}
			}
		}
		if (og.videos) for (const video of og.videos) {
			elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
				property: "og:video",
				content: resolveUrl(video.url)
			}, key++));
			if (video.width) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
				property: "og:video:width",
				content: String(video.width)
			}, key++));
			if (video.height) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
				property: "og:video:height",
				content: String(video.height)
			}, key++));
		}
		if (og.audio) for (const audio of og.audio) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			property: "og:audio",
			content: resolveUrl(audio.url)
		}, key++));
	}
	if (metadata.twitter) {
		const tw = metadata.twitter;
		if (tw.card) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "twitter:card",
			content: tw.card
		}, key++));
		if (tw.site) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "twitter:site",
			content: tw.site
		}, key++));
		if (tw.siteId) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "twitter:site:id",
			content: tw.siteId
		}, key++));
		if (tw.title) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "twitter:title",
			content: tw.title
		}, key++));
		if (tw.description) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "twitter:description",
			content: tw.description
		}, key++));
		if (tw.creator) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "twitter:creator",
			content: tw.creator
		}, key++));
		if (tw.creatorId) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "twitter:creator:id",
			content: tw.creatorId
		}, key++));
		if (tw.images) {
			const imgList = typeof tw.images === "string" || tw.images instanceof URL ? [tw.images] : Array.isArray(tw.images) ? tw.images : [tw.images];
			for (const img of imgList) {
				const imgUrl = typeof img === "string" || img instanceof URL ? img : img.url;
				elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
					name: "twitter:image",
					content: resolveUrl(imgUrl)
				}, key++));
				if (typeof img !== "string" && !(img instanceof URL)) {
					if (img.type) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
						name: "twitter:image:type",
						content: img.type
					}, key++));
					if (img.width) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
						name: "twitter:image:width",
						content: String(img.width)
					}, key++));
					if (img.height) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
						name: "twitter:image:height",
						content: String(img.height)
					}, key++));
					if (img.alt) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
						name: "twitter:image:alt",
						content: img.alt
					}, key++));
				}
			}
		}
		if (tw.players) {
			const players = Array.isArray(tw.players) ? tw.players : [tw.players];
			for (const player of players) {
				const playerUrl = player.playerUrl.toString();
				const streamUrl = player.streamUrl.toString();
				elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
					name: "twitter:player",
					content: resolveUrl(playerUrl)
				}, key++));
				elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
					name: "twitter:player:stream",
					content: resolveUrl(streamUrl)
				}, key++));
				elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
					name: "twitter:player:width",
					content: String(player.width)
				}, key++));
				elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
					name: "twitter:player:height",
					content: String(player.height)
				}, key++));
			}
		}
		if (tw.app) {
			const { app } = tw;
			for (const platform of [
				"iphone",
				"ipad",
				"googleplay"
			]) {
				if (app.name) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
					name: `twitter:app:name:${platform}`,
					content: app.name
				}, key++));
				if (app.id[platform] !== void 0) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
					name: `twitter:app:id:${platform}`,
					content: String(app.id[platform])
				}, key++));
				if (app.url?.[platform] !== void 0) {
					const appUrl = app.url[platform].toString();
					elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
						name: `twitter:app:url:${platform}`,
						content: resolveUrl(appUrl)
					}, key++));
				}
			}
		}
	}
	if (metadata.icons) {
		const iconEntries = isIconsMap(metadata.icons) ? normalizeUrlDescriptorEntries(metadata.icons.icon, (url) => ({ url })) : normalizeUrlDescriptorEntries(metadata.icons, (url) => ({ url }));
		if (isIconsMap(metadata.icons) && metadata.icons.shortcut) {
			const shortcuts = Array.isArray(metadata.icons.shortcut) ? metadata.icons.shortcut : [metadata.icons.shortcut];
			for (const s of shortcuts) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
				rel: "shortcut icon",
				href: resolveUrl(s)
			}, key++));
		}
		if (iconEntries.length > 0) for (const i of iconEntries) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
			rel: "icon",
			href: resolveUrl(i.url),
			...i.sizes ? { sizes: i.sizes } : {},
			...i.type ? { type: i.type } : {},
			...i.media ? { media: i.media } : {}
		}, key++));
		if (isIconsMap(metadata.icons) && metadata.icons.apple) for (const a of normalizeUrlDescriptorEntries(metadata.icons.apple, (url) => ({ url }))) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
			rel: "apple-touch-icon",
			href: resolveUrl(a.url),
			...a.sizes ? { sizes: a.sizes } : {},
			...a.type ? { type: a.type } : {}
		}, key++));
		if (isIconsMap(metadata.icons) && metadata.icons.other) for (const o of metadata.icons.other) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
			rel: o.rel,
			href: resolveUrl(o.url),
			...o.sizes ? { sizes: o.sizes } : {}
		}, key++));
	}
	if (metadata.manifest) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
		rel: "manifest",
		href: resolveUrl(metadata.manifest)
	}, key++));
	if (metadata.alternates) {
		const alt = metadata.alternates;
		if (alt.canonical) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
			rel: "canonical",
			href: resolveUrl(alt.canonical)
		}, key++));
		if (alt.languages) for (const [lang, href] of Object.entries(alt.languages)) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
			rel: "alternate",
			hrefLang: lang,
			href: resolveUrl(href)
		}, key++));
		if (alt.media) for (const [media, href] of Object.entries(alt.media)) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
			rel: "alternate",
			media,
			href: resolveUrl(href)
		}, key++));
		if (alt.types) for (const [type, href] of Object.entries(alt.types)) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
			rel: "alternate",
			type,
			href: resolveUrl(href)
		}, key++));
	}
	if (metadata.verification) {
		const v = metadata.verification;
		if (v.google) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "google-site-verification",
			content: v.google
		}, key++));
		if (v.yahoo) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "y_key",
			content: v.yahoo
		}, key++));
		if (v.yandex) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "yandex-verification",
			content: v.yandex
		}, key++));
		if (v.other) for (const [name, content] of Object.entries(v.other)) {
			const values = Array.isArray(content) ? content : [content];
			for (const val of values) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
				name,
				content: val
			}, key++));
		}
	}
	if (metadata.appleWebApp) {
		const awa = metadata.appleWebApp;
		if (awa.capable !== false) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "mobile-web-app-capable",
			content: "yes"
		}, key++));
		if (awa.title) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "apple-mobile-web-app-title",
			content: awa.title
		}, key++));
		if (awa.statusBarStyle) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "apple-mobile-web-app-status-bar-style",
			content: awa.statusBarStyle
		}, key++));
		if (awa.startupImage) {
			const imgs = typeof awa.startupImage === "string" ? [{ url: awa.startupImage }] : awa.startupImage;
			for (const img of imgs) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("link", {
				rel: "apple-touch-startup-image",
				href: resolveUrl(img.url),
				...img.media ? { media: img.media } : {}
			}, key++));
		}
	}
	if (metadata.itunes) {
		const { appId, appArgument } = metadata.itunes;
		let content = `app-id=${appId}`;
		if (appArgument) content += `, app-argument=${appArgument}`;
		elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name: "apple-itunes-app",
			content
		}, key++));
	}
	if (metadata.appLinks) {
		const al = metadata.appLinks;
		for (const platform of [
			"ios",
			"iphone",
			"ipad",
			"android",
			"windows_phone",
			"windows",
			"windows_universal",
			"web"
		]) {
			const entries = al[platform];
			if (!entries) continue;
			const list = Array.isArray(entries) ? entries : [entries];
			for (const entry of list) for (const [k, v] of Object.entries(entry)) {
				if (v === void 0 || v === null) continue;
				const str = String(v);
				const content = k === "url" ? resolveUrl(str) : str;
				elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
					property: `al:${platform}:${k}`,
					content
				}, key++));
			}
		}
	}
	if (metadata.other) for (const [name, content] of Object.entries(metadata.other)) {
		const values = Array.isArray(content) ? content : [content];
		for (const val of values) elements.push(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", {
			name,
			content: val
		}, key++));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(import_jsx_runtime_react_server.Fragment, { children: elements });
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/server.js
var NextRequest = class extends Request {
	_nextUrl;
	_url;
	_cookies;
	constructor(input, init) {
		const { nextConfig: _nextConfig, ...requestInit } = init ?? {};
		if (input instanceof Request) {
			const requestInput = requestInit.body === void 0 && input.body && !input.bodyUsed ? input.clone() : input;
			super(requestInput, requestInit);
		} else super(input, requestInit);
		const url = typeof input === "string" ? new URL(input, "http://localhost") : input instanceof URL ? input : new URL(input.url, "http://localhost");
		const urlConfig = _nextConfig ? {
			basePath: _nextConfig.basePath,
			nextConfig: { i18n: _nextConfig.i18n }
		} : void 0;
		this._nextUrl = new NextURL(url, void 0, urlConfig);
		this._url = process.env.__NEXT_NO_MIDDLEWARE_URL_NORMALIZE ? url.toString() : this._nextUrl.toString();
		this._cookies = new RequestCookies(this.headers);
	}
	get nextUrl() {
		return this._nextUrl;
	}
	get url() {
		return this._url;
	}
	get cookies() {
		return this._cookies;
	}
	/**
	* Client IP address. Prefers Cloudflare's trusted CF-Connecting-IP header
	* over the spoofable X-Forwarded-For. Returns undefined if unavailable.
	*/
	get ip() {
		return this.headers.get("cf-connecting-ip") ?? this.headers.get("x-real-ip") ?? this.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? void 0;
	}
	/**
	* Geolocation data. Platform-dependent (e.g., Cloudflare, Vercel).
	* Returns undefined if not available.
	*/
	get geo() {
		const country = this.headers.get("cf-ipcountry") ?? this.headers.get("x-vercel-ip-country") ?? void 0;
		if (!country) return void 0;
		return {
			country,
			city: this.headers.get("cf-ipcity") ?? this.headers.get("x-vercel-ip-city") ?? void 0,
			region: this.headers.get("cf-region") ?? this.headers.get("x-vercel-ip-country-region") ?? void 0,
			latitude: this.headers.get("cf-iplatitude") ?? this.headers.get("x-vercel-ip-latitude") ?? void 0,
			longitude: this.headers.get("cf-iplongitude") ?? this.headers.get("x-vercel-ip-longitude") ?? void 0
		};
	}
	/**
	* The build ID of the Next.js application.
	* Delegates to `nextUrl.buildId` to match Next.js API surface.
	* Can be used in middleware to detect deployment skew between client and server.
	*/
	get buildId() {
		return this._nextUrl.buildId;
	}
};
/** Valid HTTP redirect status codes, matching Next.js's REDIRECTS set. */
var REDIRECT_STATUSES = new Set([
	301,
	302,
	303,
	307,
	308
]);
function validateURL(url) {
	assertSafeNavigationUrl(String(url));
	try {
		return String(new URL(String(url)));
	} catch (error) {
		throw new Error(`URL is malformed "${String(url)}". Please use only absolute URLs - https://nextjs.org/docs/messages/middleware-relative-urls`, { cause: error });
	}
}
var NextResponse = class NextResponse extends Response {
	_cookies;
	constructor(body, init) {
		super(body, init);
		this._cookies = new MiddlewareResponseCookies(this.headers);
	}
	get cookies() {
		return this._cookies;
	}
	/**
	* Create a JSON response.
	*/
	static json(body, init) {
		const headers = new Headers(init?.headers);
		if (!headers.has("content-type")) headers.set("content-type", "application/json");
		return new NextResponse(JSON.stringify(body), {
			...init,
			headers
		});
	}
	/**
	* Create a redirect response.
	*/
	static redirect(url, init) {
		const status = typeof init === "number" ? init : init?.status ?? 307;
		if (!REDIRECT_STATUSES.has(status)) throw new RangeError(`Failed to execute "redirect" on "response": Invalid status code`);
		const headers = new Headers(typeof init === "object" ? init?.headers : void 0);
		headers.set("Location", validateURL(url));
		return new NextResponse(null, {
			status,
			headers
		});
	}
	/**
	* Create a rewrite response (middleware pattern).
	* Sets the x-middleware-rewrite header.
	*/
	static rewrite(destination, init) {
		const headers = new Headers(init?.headers);
		headers.set(MIDDLEWARE_REWRITE_HEADER, validateURL(destination));
		if (init?.request?.headers) encodeMiddlewareRequestHeaders(headers, init.request.headers);
		return new NextResponse(null, {
			...init,
			headers
		});
	}
	/**
	* Continue to the next handler (middleware pattern).
	* Sets the x-middleware-next header.
	*/
	static next(init) {
		const headers = new Headers(init?.headers);
		headers.set(MIDDLEWARE_NEXT_HEADER, "1");
		if (init?.request?.headers) encodeMiddlewareRequestHeaders(headers, init.request.headers);
		return new NextResponse(null, {
			...init,
			headers
		});
	}
};
var NextURL = class NextURL {
	/** Internal URL stores the pathname WITHOUT basePath or locale prefix. */
	_url;
	_basePath;
	_locale;
	_defaultLocale;
	_locales;
	constructor(input, base, config) {
		this._url = new URL(input.toString(), base);
		this._basePath = config?.basePath ?? "";
		this._stripBasePath();
		const i18n = config?.nextConfig?.i18n;
		if (i18n) {
			this._locales = [...i18n.locales];
			this._defaultLocale = i18n.defaultLocale;
			this._analyzeLocale(this._locales);
		}
	}
	/** Strip basePath prefix from the internal pathname. */
	_stripBasePath() {
		if (!this._basePath) return;
		this._url.pathname = stripBasePath(this._url.pathname, this._basePath);
	}
	/** Extract locale from pathname, stripping it from the internal URL. */
	_analyzeLocale(locales) {
		const segments = this._url.pathname.split("/");
		const candidate = segments[1]?.toLowerCase();
		const match = locales.find((l) => l.toLowerCase() === candidate);
		if (match) {
			this._locale = match;
			this._url.pathname = "/" + segments.slice(2).join("/");
		} else this._locale = this._defaultLocale;
	}
	/**
	* Reconstruct the full pathname with basePath + locale prefix.
	* Mirrors Next.js's internal formatPathname().
	*/
	_formatPathname() {
		let prefix = this._basePath;
		if (this._locale && this._locale !== this._defaultLocale) prefix += "/" + this._locale;
		if (!prefix) return this._url.pathname;
		const inner = this._url.pathname;
		return inner === "/" ? prefix : prefix + inner;
	}
	get href() {
		const formatted = this._formatPathname();
		if (formatted === this._url.pathname) return this._url.href;
		const { href, pathname, search, hash } = this._url;
		const baseEnd = href.length - pathname.length - search.length - hash.length;
		return href.slice(0, baseEnd) + formatted + search + hash;
	}
	set href(value) {
		this._url.href = value;
		this._stripBasePath();
		if (this._locales) this._analyzeLocale(this._locales);
	}
	get origin() {
		return this._url.origin;
	}
	get protocol() {
		return this._url.protocol;
	}
	set protocol(value) {
		this._url.protocol = value;
	}
	get username() {
		return this._url.username;
	}
	set username(value) {
		this._url.username = value;
	}
	get password() {
		return this._url.password;
	}
	set password(value) {
		this._url.password = value;
	}
	get host() {
		return this._url.host;
	}
	set host(value) {
		this._url.host = value;
	}
	get hostname() {
		return this._url.hostname;
	}
	set hostname(value) {
		this._url.hostname = value;
	}
	get port() {
		return this._url.port;
	}
	set port(value) {
		this._url.port = value;
	}
	/** Returns the pathname WITHOUT basePath or locale prefix. */
	get pathname() {
		return this._url.pathname;
	}
	set pathname(value) {
		this._url.pathname = value;
	}
	get search() {
		return this._url.search;
	}
	set search(value) {
		this._url.search = value;
	}
	get searchParams() {
		return this._url.searchParams;
	}
	get hash() {
		return this._url.hash;
	}
	set hash(value) {
		this._url.hash = value;
	}
	get basePath() {
		return this._basePath;
	}
	set basePath(value) {
		this._basePath = value === "" ? "" : value.startsWith("/") ? value : "/" + value;
	}
	get locale() {
		return this._locale ?? "";
	}
	set locale(value) {
		if (this._locales) {
			if (!value) {
				this._locale = this._defaultLocale;
				return;
			}
			if (!this._locales.includes(value)) throw new TypeError(`The locale "${value}" is not in the configured locales: ${this._locales.join(", ")}`);
		}
		this._locale = this._locales ? value : this._locale;
	}
	get defaultLocale() {
		return this._defaultLocale;
	}
	get locales() {
		return this._locales ? [...this._locales] : void 0;
	}
	clone() {
		const config = {
			basePath: this._basePath,
			nextConfig: this._locales ? { i18n: {
				locales: [...this._locales],
				defaultLocale: this._defaultLocale
			} } : void 0
		};
		return new NextURL(this.href, void 0, config);
	}
	toString() {
		return this.href;
	}
	/**
	* The build ID of the Next.js application.
	* Set from `generateBuildId` in next.config.js, or a random UUID if not configured.
	* Can be used in middleware to detect deployment skew between client and server.
	* Matches the Next.js API: `request.nextUrl.buildId`.
	*/
	get buildId() {
		return "398d0a0d-0356-4371-b55b-58927a68fa1c";
	}
};
var RequestCookies = class {
	_headers;
	_parsed;
	constructor(headers) {
		this._headers = headers;
		this._parsed = parseCookieHeader(headers.get("cookie") ?? "");
	}
	get(name) {
		const value = this._parsed.get(name);
		return value !== void 0 ? {
			name,
			value
		} : void 0;
	}
	getAll(nameOrOptions) {
		const name = typeof nameOrOptions === "string" ? nameOrOptions : nameOrOptions?.name;
		return [...this._parsed.entries()].filter(([cookieName]) => name === void 0 || cookieName === name).map(([cookieName, value]) => ({
			name: cookieName,
			value
		}));
	}
	has(name) {
		return this._parsed.has(name);
	}
	set(nameOrOptions, value) {
		let cookieName;
		let cookieValue;
		if (typeof nameOrOptions === "string") {
			cookieName = nameOrOptions;
			cookieValue = value ?? "";
		} else {
			cookieName = nameOrOptions.name;
			cookieValue = nameOrOptions.value;
		}
		validateCookieName(cookieName);
		this._parsed.set(cookieName, cookieValue);
		this._syncHeader();
		return this;
	}
	delete(names) {
		if (Array.isArray(names)) {
			const results = names.map((name) => {
				validateCookieName(name);
				return this._parsed.delete(name);
			});
			this._syncHeader();
			return results;
		}
		validateCookieName(names);
		const result = this._parsed.delete(names);
		this._syncHeader();
		return result;
	}
	clear() {
		this._parsed.clear();
		this._syncHeader();
		return this;
	}
	get size() {
		return this._parsed.size;
	}
	toString() {
		return this._serialize();
	}
	_serialize() {
		return [...this._parsed.entries()].map(([n, v]) => `${n}=${encodeURIComponent(v)}`).join("; ");
	}
	_syncHeader() {
		if (this._parsed.size === 0) this._headers.delete("cookie");
		else this._headers.set("cookie", this._serialize());
	}
	[Symbol.iterator]() {
		return this.getAll().map((c) => [c.name, c])[Symbol.iterator]();
	}
};
var ReadonlyRequestCookiesError = class ReadonlyRequestCookiesError extends Error {
	constructor() {
		super("Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options");
	}
	static callable() {
		throw new ReadonlyRequestCookiesError();
	}
};
var REQUEST_HEADERS_MUTATING_METHODS = new Set([
	"set",
	"delete",
	"append"
]);
var ReadonlyRequestHeadersError = class ReadonlyRequestHeadersError extends Error {
	constructor() {
		super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers");
	}
	static callable() {
		throw new ReadonlyRequestHeadersError();
	}
};
function sealRequestHeaders(headers) {
	return new Proxy(headers, { get(target, prop) {
		if (typeof prop === "string" && REQUEST_HEADERS_MUTATING_METHODS.has(prop)) return ReadonlyRequestHeadersError.callable;
		const value = Reflect.get(target, prop, target);
		return typeof value === "function" ? value.bind(target) : value;
	} });
}
function sealRequestCookies(cookies) {
	return new Proxy(cookies, { get(target, prop) {
		if (prop === "set" || prop === "delete" || prop === "clear") return ReadonlyRequestCookiesError.callable;
		const value = Reflect.get(target, prop, target);
		return typeof value === "function" ? value.bind(target) : value;
	} });
}
var ResponseCookies = class {
	_headers;
	/** Internal map keyed by cookie name — single source of truth. */
	_parsed = /* @__PURE__ */ new Map();
	constructor(headers) {
		this._headers = headers;
		for (const header of headers.getSetCookie()) {
			const eq = header.indexOf("=");
			if (eq === -1) continue;
			const cookieName = header.slice(0, eq);
			const semi = header.indexOf(";", eq);
			const raw = header.slice(eq + 1, semi === -1 ? void 0 : semi);
			let value;
			try {
				value = decodeURIComponent(raw);
			} catch {
				value = raw;
			}
			this._parsed.set(cookieName, {
				serialized: header,
				entry: {
					name: cookieName,
					value
				}
			});
		}
	}
	set(...args) {
		const [name, value, opts] = parseCookieSetArgs(args);
		validateCookieName(name);
		const serialized = serializeSetCookie(name, value, opts);
		this._parsed.set(name, {
			serialized,
			entry: {
				name,
				value
			}
		});
		this._syncHeaders();
		return this;
	}
	get(...args) {
		const key = typeof args[0] === "string" ? args[0] : args[0].name;
		return this._parsed.get(key)?.entry;
	}
	has(name) {
		return this._parsed.has(name);
	}
	getAll(...args) {
		const all = [...this._parsed.values()].map((v) => v.entry);
		if (args.length === 0) return all;
		const key = typeof args[0] === "string" ? args[0] : args[0].name;
		return all.filter((c) => c.name === key);
	}
	delete(...args) {
		const [name, opts] = typeof args[0] === "string" ? [args[0], void 0] : [args[0].name, args[0]];
		return this.set({
			name,
			value: "",
			expires: /* @__PURE__ */ new Date(0),
			path: opts?.path,
			domain: opts?.domain,
			httpOnly: opts?.httpOnly,
			secure: opts?.secure,
			sameSite: opts?.sameSite
		});
	}
	[Symbol.iterator]() {
		return [...this._parsed.values()].map((v) => [v.entry.name, v.entry])[Symbol.iterator]();
	}
	/** Delete all Set-Cookie headers and re-append from the internal map. */
	_syncHeaders() {
		this._headers.delete("Set-Cookie");
		for (const { serialized } of this._parsed.values()) this._headers.append("Set-Cookie", serialized);
	}
};
var MiddlewareResponseCookies = class extends ResponseCookies {
	_responseHeaders;
	constructor(headers) {
		super(headers);
		this._responseHeaders = headers;
	}
	set(...args) {
		super.set(...args);
		this._syncMiddlewareCookieHeader();
		return this;
	}
	delete(...args) {
		super.delete(...args);
		this._syncMiddlewareCookieHeader();
		return this;
	}
	_syncMiddlewareCookieHeader() {
		const cookies = this._responseHeaders.getSetCookie();
		if (cookies.length === 0) {
			this._responseHeaders.delete(MIDDLEWARE_SET_COOKIE_HEADER);
			return;
		}
		this._responseHeaders.set(MIDDLEWARE_SET_COOKIE_HEADER, cookies.join(","));
	}
};
/**
* Parse the overloaded arguments for ResponseCookies.set():
*   - (name, value, options?) — positional form
*   - ({ name, value, ...options }) — object form
*/
function parseCookieSetArgs(args) {
	if (typeof args[0] === "string") return [
		args[0],
		args[1],
		args[2]
	];
	const { name, value, ...opts } = args[0];
	return [
		name,
		value,
		opts
	];
}
/**
* Minimal NextFetchEvent — extends FetchEvent where available,
* otherwise provides the waitUntil pattern standalone.
*/
var NextFetchEvent = class {
	sourcePage;
	_waitUntilPromises = [];
	constructor(params) {
		this.sourcePage = params.page;
	}
	waitUntil(promise) {
		this._waitUntilPromises.push(promise);
	}
	get waitUntilPromises() {
		return this._waitUntilPromises;
	}
	/** Drain all waitUntil promises. Returns a single promise that settles when all are done. */
	drainWaitUntil() {
		return Promise.allSettled(this._waitUntilPromises);
	}
};
globalThis.URLPattern;
//#endregion
//#region proxy.ts
var proxy_exports = /* @__PURE__ */ __exportAll({
	config: () => config,
	proxy: () => proxy
});
var ACCESS_COOKIE$1 = "alpha_access";
var ACCESS_TOKEN$1 = "alpha-unlocked-v1";
function isPublicPath(pathname) {
	return pathname === "/access" || pathname === "/api/access" || pathname.startsWith("/_next/") || pathname.startsWith("/favicon") || pathname.startsWith("/public/") || Boolean(pathname.match(/\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml)$/));
}
function proxy(request) {
	const { pathname } = request.nextUrl;
	if (isPublicPath(pathname)) return NextResponse.next();
	if (request.cookies.get(ACCESS_COOKIE$1)?.value === ACCESS_TOKEN$1) return NextResponse.next();
	if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Accès protégé" }, { status: 401 });
	const url = request.nextUrl.clone();
	url.pathname = "/access";
	url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
	return NextResponse.redirect(url);
}
var config = { matcher: ["/((?!_next/static|_next/image).*)"] };
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/utils/encode-cache-tag.js
/**
* Cache-tag canonicalisation.
*
* Tags can flow into HTTP headers (e.g. `x-next-cache-tags` on ISR responses,
* Cloudflare cache-tag headers, downstream Worker code) where Node's
* `validateHeaderValue` rejects any byte outside `\t\x20-\x7e` and crashes
* the response with `ERR_INVALID_CHAR`. Even on platforms with permissive
* header setters, divergence between storage form and wire form silently
* breaks invalidation when a `revalidateTag` call's tag does not byte-match
* the form that was stored.
*
* The fix is to apply this encoding at every public boundary so storage,
* comparison, and the wire all see the same ASCII-safe form. The fast-path
* returns the input unchanged for already-ASCII tags (the common case), so
* pre-encoded `%xx` input round-trips losslessly without `decodeURIComponent`
* mangling literal `%xx` characters.
*
* The replacement matches *runs* of out-of-class code units rather than each
* code unit individually so surrogate pairs (emoji, non-BMP characters) are
* handed to `encodeURIComponent` as a complete code point — a per-code-unit
* regex would split the pair and throw `URIError`.
*
* Mirrors Next.js's `packages/next/src/server/lib/encode-cache-tag.ts`
* (introduced in vercel/next.js#93601).
*/
var OUT_OF_CLASS_CHAR = /[^\t\x20-\x7e]/;
var OUT_OF_CLASS_RUN = /[^\t\x20-\x7e]+/g;
function encodeCacheTag(tag) {
	return OUT_OF_CLASS_CHAR.test(tag) ? tag.replace(OUT_OF_CLASS_RUN, (run) => encodeURIComponent(run)) : tag;
}
function encodeCacheTags(tags) {
	return tags.map(encodeCacheTag);
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/internal/work-unit-async-storage.js
/**
* Shim for next/dist/server/app-render/work-unit-async-storage.external
* and next/dist/client/components/request-async-storage.external
*
* Tracks the current rendering context type so that dynamic APIs
* (io, headers, cookies, etc.) can branch on whether they're
* inside a request, prerender, cache scope, or other context.
*
* Used by: @sentry/nextjs (runtime resolve for request context injection),
* io() for hanging-promise behavior during prerendering.
*/
var workUnitAsyncStorage = new AsyncLocalStorage$1();
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/utils/cache-control-metadata.js
function isUnknownRecord(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
function readRecordField(ctx, field) {
	const value = ctx?.[field];
	return isUnknownRecord(value) ? value : void 0;
}
function readCacheControlNumberField(ctx, field) {
	const value = readRecordField(ctx, "cacheControl")?.[field] ?? ctx?.[field];
	return typeof value === "number" ? value : void 0;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/cache.js
function readStringArrayField(ctx, field) {
	const value = ctx?.[field];
	if (!Array.isArray(value)) return [];
	return value.filter((item) => typeof item === "string");
}
var MemoryCacheHandler = class {
	store = /* @__PURE__ */ new Map();
	tagRevalidatedAt = /* @__PURE__ */ new Map();
	async get(key, _ctx) {
		const entry = this.store.get(key);
		if (!entry) return null;
		for (const tag of entry.tags) {
			const revalidatedAt = this.tagRevalidatedAt.get(tag);
			if (revalidatedAt && revalidatedAt >= entry.lastModified) {
				this.store.delete(key);
				return null;
			}
		}
		for (const tag of readStringArrayField(_ctx, "softTags")) {
			const revalidatedAt = this.tagRevalidatedAt.get(tag);
			if (revalidatedAt && revalidatedAt >= entry.lastModified) return null;
		}
		if (entry.expireAt !== null && Date.now() > entry.expireAt) {
			this.store.delete(key);
			return null;
		}
		if (entry.revalidateAt !== null && Date.now() > entry.revalidateAt) return {
			lastModified: entry.lastModified,
			value: entry.value,
			cacheState: "stale",
			cacheControl: entry.cacheControl
		};
		return {
			lastModified: entry.lastModified,
			value: entry.value,
			cacheControl: entry.cacheControl
		};
	}
	async set(key, data, ctx) {
		const tagSet = /* @__PURE__ */ new Set();
		if (data && "tags" in data && Array.isArray(data.tags)) for (const t of data.tags) tagSet.add(t);
		for (const t of readStringArrayField(ctx, "tags")) tagSet.add(t);
		const tags = [...tagSet];
		let effectiveRevalidate;
		let effectiveExpire;
		effectiveRevalidate = readCacheControlNumberField(ctx, "revalidate");
		effectiveExpire = readCacheControlNumberField(ctx, "expire");
		if (data && "revalidate" in data && typeof data.revalidate === "number") effectiveRevalidate = data.revalidate;
		if (effectiveRevalidate === 0) return;
		const now = Date.now();
		const revalidateAt = typeof effectiveRevalidate === "number" && effectiveRevalidate > 0 ? now + effectiveRevalidate * 1e3 : null;
		const expireAt = typeof effectiveExpire === "number" && effectiveExpire > 0 ? now + effectiveExpire * 1e3 : null;
		const cacheControl = typeof effectiveRevalidate === "number" ? effectiveExpire === void 0 ? { revalidate: effectiveRevalidate } : {
			revalidate: effectiveRevalidate,
			expire: effectiveExpire
		} : void 0;
		this.store.set(key, {
			value: data,
			tags,
			lastModified: now,
			revalidateAt,
			expireAt,
			cacheControl
		});
	}
	async revalidateTag(tags, _durations) {
		const tagList = Array.isArray(tags) ? tags : [tags];
		const now = Date.now();
		for (const tag of tagList) this.tagRevalidatedAt.set(tag, now);
	}
	resetRequestCache() {}
};
var _HANDLER_KEY = Symbol.for("vinext.cacheHandler");
var _gHandler = globalThis;
function _getActiveHandler() {
	return _gHandler[_HANDLER_KEY] ?? (_gHandler[_HANDLER_KEY] = new MemoryCacheHandler());
}
/**
* Get the active CacheHandler (for internal use or testing).
*/
function getCacheHandler() {
	return _getActiveHandler();
}
/**
* A fulfilled thenable that React can unwrap synchronously via `use()`
* without ever suspending. Reusing a single instance avoids allocating
* on every call — matching Next.js's browser/client implementation.
*
* @see https://github.com/vercel/next.js/blob/canary/packages/next/src/client/request/io.browser.ts
*/
var _resolvedIOPromise = Promise.resolve(void 0);
_resolvedIOPromise.status = "fulfilled";
_resolvedIOPromise.value = void 0;
var _FALLBACK_KEY$3 = Symbol.for("vinext.cache.fallback");
var _g$5 = globalThis;
var _cacheAls = getOrCreateAls("vinext.cache.als");
var _cacheFallbackState = _g$5[_FALLBACK_KEY$3] ??= {
	actionRevalidationKind: 0,
	requestScopedCacheLife: null,
	unstableCacheRevalidation: "foreground"
};
var ACTION_DID_NOT_REVALIDATE$1 = 0;
function _getCacheState() {
	if (isInsideUnifiedScope()) return getRequestContext();
	return _cacheAls.getStore() ?? _cacheFallbackState;
}
function getAndClearActionRevalidationKind() {
	const state = _getCacheState();
	const kind = state.actionRevalidationKind;
	state.actionRevalidationKind = ACTION_DID_NOT_REVALIDATE$1;
	return kind;
}
/**
* Read the request-scoped cache life without clearing it. Prerender response
* shaping needs the metadata before the manifest writer consumes it after the
* body has been fully rendered.
* @internal
*/
function _peekRequestScopedCacheLife() {
	const config = _getCacheState().requestScopedCacheLife;
	return config === null ? null : { ...config };
}
/**
* Consume and reset the request-scoped cache life. Returns null if none was set.
* @internal
*/
function _consumeRequestScopedCacheLife() {
	const state = _getCacheState();
	const config = state.requestScopedCacheLife;
	state.requestScopedCacheLife = null;
	return config;
}
getOrCreateAls("vinext.unstableCache.als");
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/fetch-cache.js
/**
* Extended fetch() with Next.js caching semantics.
*
* Patches `globalThis.fetch` during server rendering to support:
*
*   fetch(url, { next: { revalidate: 60, tags: ['posts'] } })
*   fetch(url, { cache: 'force-cache' })
*   fetch(url, { cache: 'no-store' })
*
* Cached responses are stored via the pluggable CacheHandler, so
* revalidateTag() and revalidatePath() invalidate fetch-level caches.
*
* Usage (in server entry):
*   import { withFetchCache, cleanupFetchCache } from './fetch-cache';
*   const cleanup = withFetchCache();
*   try { ... render ... } finally { cleanup(); }
*
* Or use the async helper:
*   await runWithFetchCache(async () => { ... render ... });
*/
/**
* Headers excluded from the cache key. These are W3C trace context headers
* that can break request caching and deduplication.
* All other headers ARE included in the cache key, matching Next.js behavior.
*/
var HEADER_BLOCKLIST = ["traceparent", "tracestate"];
var CACHE_KEY_PREFIX = "v3";
var MAX_CACHE_KEY_BODY_BYTES = 1024 * 1024;
var BodyTooLargeForCacheKeyError = class extends Error {
	constructor() {
		super("Fetch body too large for cache key generation");
	}
};
var SkipCacheKeyGenerationError = class extends Error {
	constructor() {
		super("Fetch body could not be serialized for cache key generation");
	}
};
/**
* Collect all headers from the request, excluding the blocklist.
* Merges headers from both the Request object and the init object,
* with init taking precedence (matching fetch() spec behavior).
*/
function collectHeaders(input, init) {
	const merged = {};
	if (input instanceof Request && input.headers) input.headers.forEach((v, k) => {
		merged[k] = v;
	});
	if (init?.headers) (init.headers instanceof Headers ? init.headers : new Headers(init.headers)).forEach((v, k) => {
		merged[k] = v;
	});
	for (const blocked of HEADER_BLOCKLIST) delete merged[blocked];
	return merged;
}
/**
* Check whether a fetch request carries any per-user auth headers.
* Used for the safety bypass (skip caching when auth headers are present
* without an explicit cache opt-in).
*/
var AUTH_HEADERS = [
	"authorization",
	"cookie",
	"x-api-key"
];
function hasAuthHeaders(input, init) {
	const headers = collectHeaders(input, init);
	return AUTH_HEADERS.some((name) => name in headers);
}
async function serializeFormData(formData, pushBodyChunk, getTotalBodyBytes) {
	for (const [key, val] of formData.entries()) {
		if (typeof val === "string") {
			pushBodyChunk(JSON.stringify([key, {
				kind: "string",
				value: val
			}]));
			continue;
		}
		if (val.size > MAX_CACHE_KEY_BODY_BYTES || getTotalBodyBytes() + val.size > MAX_CACHE_KEY_BODY_BYTES) throw new BodyTooLargeForCacheKeyError();
		pushBodyChunk(JSON.stringify([key, {
			kind: "file",
			name: val.name,
			type: val.type,
			value: await val.text()
		}]));
	}
}
function getParsedFormContentType(contentType) {
	const mediaType = contentType?.split(";")[0]?.trim().toLowerCase();
	if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") return mediaType;
}
function stripMultipartBoundary(contentType) {
	const [type, ...params] = contentType.split(";");
	const keptParams = params.map((param) => param.trim()).filter(Boolean).filter((param) => !/^boundary\s*=/i.test(param));
	const normalizedType = type.trim().toLowerCase();
	return keptParams.length > 0 ? `${normalizedType}; ${keptParams.join("; ")}` : normalizedType;
}
async function readRequestBodyChunksWithinLimit(request) {
	const contentLengthHeader = request.headers.get("content-length");
	if (contentLengthHeader) {
		const contentLength = Number(contentLengthHeader);
		if (Number.isFinite(contentLength) && contentLength > MAX_CACHE_KEY_BODY_BYTES) throw new BodyTooLargeForCacheKeyError();
	}
	const requestClone = request.clone();
	const contentType = requestClone.headers.get("content-type") ?? void 0;
	const reader = requestClone.body?.getReader();
	if (!reader) return {
		chunks: [],
		contentType
	};
	const chunks = [];
	let totalBodyBytes = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			totalBodyBytes += value.byteLength;
			if (totalBodyBytes > MAX_CACHE_KEY_BODY_BYTES) throw new BodyTooLargeForCacheKeyError();
			chunks.push(value);
		}
	} catch (err) {
		reader.cancel().catch(() => {});
		throw err;
	}
	return {
		chunks,
		contentType
	};
}
/**
* Serialize request body into string chunks for cache key inclusion.
* Handles all body types: string, Uint8Array, ReadableStream, FormData, Blob,
* and Request object bodies.
* Returns the serialized body chunks and optionally stashes the original body
* on init as `_ogBody` so it can still be used after stream consumption.
*/
async function serializeBody(input, init) {
	if (!init?.body && !(input instanceof Request && input.body)) return { bodyChunks: [] };
	const bodyChunks = [];
	const encoder = new TextEncoder();
	const decoder = new TextDecoder();
	let totalBodyBytes = 0;
	let canonicalizedContentType;
	const pushBodyChunk = (chunk) => {
		totalBodyBytes += encoder.encode(chunk).byteLength;
		if (totalBodyBytes > MAX_CACHE_KEY_BODY_BYTES) throw new BodyTooLargeForCacheKeyError();
		bodyChunks.push(chunk);
	};
	const getTotalBodyBytes = () => totalBodyBytes;
	if (init?.body instanceof Uint8Array) {
		if (init.body.byteLength > MAX_CACHE_KEY_BODY_BYTES) throw new BodyTooLargeForCacheKeyError();
		pushBodyChunk(decoder.decode(init.body));
		init._ogBody = init.body;
	} else if (init?.body && typeof init.body.getReader === "function") {
		const [bodyForHashing, bodyForFetch] = init.body.tee();
		init._ogBody = bodyForFetch;
		const reader = bodyForHashing.getReader();
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				if (typeof value === "string") pushBodyChunk(value);
				else {
					totalBodyBytes += value.byteLength;
					if (totalBodyBytes > MAX_CACHE_KEY_BODY_BYTES) throw new BodyTooLargeForCacheKeyError();
					bodyChunks.push(decoder.decode(value, { stream: true }));
				}
			}
			const finalChunk = decoder.decode();
			if (finalChunk) pushBodyChunk(finalChunk);
		} catch (err) {
			await reader.cancel();
			if (err instanceof BodyTooLargeForCacheKeyError) throw err;
			throw new SkipCacheKeyGenerationError();
		}
	} else if (init?.body instanceof URLSearchParams) {
		init._ogBody = init.body;
		pushBodyChunk(init.body.toString());
	} else if (init?.body && typeof init.body.keys === "function") {
		const formData = init.body;
		init._ogBody = init.body;
		await serializeFormData(formData, pushBodyChunk, getTotalBodyBytes);
	} else if (init?.body && typeof init.body.arrayBuffer === "function") {
		const blob = init.body;
		if (blob.size > MAX_CACHE_KEY_BODY_BYTES) throw new BodyTooLargeForCacheKeyError();
		pushBodyChunk(await blob.text());
		const arrayBuffer = await blob.arrayBuffer();
		init._ogBody = new Blob([arrayBuffer], { type: blob.type });
	} else if (typeof init?.body === "string") {
		if (init.body.length > MAX_CACHE_KEY_BODY_BYTES) throw new BodyTooLargeForCacheKeyError();
		pushBodyChunk(init.body);
		init._ogBody = init.body;
	} else if (input instanceof Request && input.body) {
		let chunks;
		let contentType;
		try {
			({chunks, contentType} = await readRequestBodyChunksWithinLimit(input));
		} catch (err) {
			if (err instanceof BodyTooLargeForCacheKeyError) throw err;
			throw new SkipCacheKeyGenerationError();
		}
		const formContentType = getParsedFormContentType(contentType);
		if (formContentType) try {
			await serializeFormData(await new Request(input.url, {
				method: input.method,
				headers: contentType ? { "content-type": contentType } : void 0,
				body: new Blob(chunks)
			}).formData(), pushBodyChunk, getTotalBodyBytes);
			canonicalizedContentType = formContentType === "multipart/form-data" && contentType ? stripMultipartBoundary(contentType) : void 0;
			return {
				bodyChunks,
				canonicalizedContentType
			};
		} catch (err) {
			if (err instanceof BodyTooLargeForCacheKeyError) throw err;
			throw new SkipCacheKeyGenerationError();
		}
		for (const chunk of chunks) pushBodyChunk(decoder.decode(chunk, { stream: true }));
		const finalChunk = decoder.decode();
		if (finalChunk) pushBodyChunk(finalChunk);
	}
	return {
		bodyChunks,
		canonicalizedContentType
	};
}
/**
* Generate a deterministic cache key from a fetch request.
*
* Matches Next.js behavior: the key is a SHA-256 hash of a JSON array
* containing URL, method, all headers (minus blocklist), all RequestInit
* options, and the serialized body.
*/
async function buildFetchCacheKey(input, init) {
	let url;
	let method = "GET";
	if (typeof input === "string") url = input;
	else if (input instanceof URL) url = input.toString();
	else {
		url = input.url;
		method = input.method || "GET";
	}
	if (init?.method) method = init.method;
	const headers = collectHeaders(input, init);
	const { bodyChunks, canonicalizedContentType } = await serializeBody(input, init);
	if (canonicalizedContentType) headers["content-type"] = canonicalizedContentType;
	const cacheString = JSON.stringify([
		CACHE_KEY_PREFIX,
		url,
		method,
		headers,
		init?.mode,
		init?.redirect,
		init?.credentials,
		init?.referrer,
		init?.referrerPolicy,
		init?.integrity,
		init?.cache,
		bodyChunks
	]);
	const buffer = new TextEncoder().encode(cacheString);
	const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
	return Array.prototype.map.call(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, "0")).join("");
}
var _PENDING_KEY = Symbol.for("vinext.fetchCache.pendingRefetches");
var _gPending = globalThis;
var pendingRefetches = _gPending[_PENDING_KEY] ??= /* @__PURE__ */ new Map();
var DEDUP_TIMEOUT_MS = 6e4;
var _ORIG_FETCH_KEY = Symbol.for("vinext.fetchCache.originalFetch");
var _gFetch = globalThis;
var originalFetch = _gFetch[_ORIG_FETCH_KEY] ??= globalThis.fetch;
var _FALLBACK_KEY$2 = Symbol.for("vinext.fetchCache.fallback");
var _g$4 = globalThis;
var _als$1 = getOrCreateAls("vinext.fetchCache.als");
var _noop = () => {};
var _responseBodyRegistry;
if (globalThis.FinalizationRegistry) _responseBodyRegistry = new FinalizationRegistry((weakRef) => {
	const stream = weakRef.deref();
	if (stream && !stream.locked) stream.cancel("Response object has been garbage collected").then(_noop, _noop);
});
var _fallbackState$2 = _g$4[_FALLBACK_KEY$2] ??= {
	currentRequestTags: [],
	currentFetchSoftTags: [],
	currentFetchCacheMode: null,
	isFetchDedupeActive: false,
	currentFetchDedupeEntries: /* @__PURE__ */ new Map()
};
function _getState$1() {
	if (isInsideUnifiedScope()) return getRequestContext();
	return _als$1.getStore() ?? _fallbackState$2;
}
/**
* Get tags collected during the current render pass.
* Useful for associating page-level cache entries with all the
* fetch tags used during rendering.
*/
function getCollectedFetchTags() {
	return [..._getState$1().currentRequestTags];
}
/**
* Set path-derived implicit tags for fetch cache reads in the current render.
*
* These are intentionally not persisted on fetch entries. They mirror Next.js
* `softTags`: `revalidatePath()` should make a fetch miss while rendering the
* affected route, without permanently coupling a shared fetch entry to one path.
*/
function setCurrentFetchSoftTags(tags) {
	_getState$1().currentFetchSoftTags = [...tags];
}
function setCurrentFetchCacheMode(mode) {
	_getState$1().currentFetchCacheMode = mode;
}
function isNoStoreFetch(cacheDirective, nextOpts) {
	return cacheDirective === "no-store" || cacheDirective === "no-cache" || nextOpts?.revalidate === false || nextOpts?.revalidate === 0;
}
function isCacheableFetch(cacheDirective, nextOpts) {
	return cacheDirective === "force-cache" || typeof nextOpts?.revalidate === "number" && nextOpts.revalidate > 0;
}
function hasExplicitRevalidateValue(nextOpts) {
	return nextOpts?.revalidate !== void 0;
}
function resolveSegmentCacheDirective(cacheDirective, nextOpts, mode) {
	if (!mode || mode === "auto") return cacheDirective;
	switch (mode) {
		case "force-cache": return "force-cache";
		case "force-no-store": return "no-store";
		case "only-cache":
			if (isNoStoreFetch(cacheDirective, nextOpts)) throw new Error("Route segment config `fetchCache = \"only-cache\"` conflicts with no-store fetch.");
			return cacheDirective ?? "force-cache";
		case "only-no-store":
			if (isCacheableFetch(cacheDirective, nextOpts)) throw new Error("Route segment config `fetchCache = \"only-no-store\"` conflicts with cacheable fetch.");
			return cacheDirective ?? "no-store";
		case "default-cache": return cacheDirective ?? (hasExplicitRevalidateValue(nextOpts) ? void 0 : "force-cache");
		case "default-no-store": return cacheDirective ?? (hasExplicitRevalidateValue(nextOpts) ? void 0 : "no-store");
	}
	return cacheDirective;
}
function getFetchCacheDirective(input, init) {
	if (init?.cache !== void 0) return init.cache;
	if (!(input instanceof Request) || input.cache === "default") return;
	return input.cache;
}
function buildFetchDedupeKey(request) {
	const filteredHeaders = Array.from(request.headers.entries()).filter(([key]) => !HEADER_BLOCKLIST.includes(key.toLowerCase()));
	return JSON.stringify([
		request.method,
		filteredHeaders,
		request.mode,
		request.redirect,
		request.credentials,
		request.referrer,
		request.referrerPolicy,
		request.integrity
	]);
}
function createFetchDedupeCandidate(input, init) {
	if (init?.signal) return null;
	const method = init?.method?.toUpperCase();
	if (method && method !== "GET" && method !== "HEAD") return null;
	if (init?.keepalive) return null;
	const request = typeof input === "string" || input instanceof URL ? new Request(input, init) : input;
	if (request.method !== "GET" && request.method !== "HEAD" || request.keepalive) return null;
	return {
		url: request.url,
		key: buildFetchDedupeKey(request)
	};
}
function buildDedupeClone(body, source) {
	const cloned = new Response(body, {
		status: source.status,
		statusText: source.statusText,
		headers: new Headers(source.headers)
	});
	Object.defineProperty(cloned, "url", {
		value: source.url,
		configurable: true,
		enumerable: true,
		writable: false
	});
	if (_responseBodyRegistry && cloned.body) _responseBodyRegistry.register(cloned, new WeakRef(cloned.body));
	return cloned;
}
function cloneDedupeResponse(response) {
	if (!response.body) return [buildDedupeClone(null, response), buildDedupeClone(null, response)];
	const [body1, body2] = response.body.tee();
	return [buildDedupeClone(body1, response), buildDedupeClone(body2, response)];
}
function dedupeFetch(input, init) {
	const state = _getState$1();
	if (!state.isFetchDedupeActive) return originalFetch(input, init);
	const candidate = createFetchDedupeCandidate(input, init);
	if (!candidate) return originalFetch(input, init);
	const entriesByUrl = state.currentFetchDedupeEntries;
	let entries = entriesByUrl.get(candidate.url);
	if (!entries) {
		entries = [];
		entriesByUrl.set(candidate.url, entries);
	}
	for (const entry of entries) {
		if (entry.key !== candidate.key) continue;
		return entry.promise.then(() => {
			if (!entry.response) throw new Error("[vinext] Missing deduped fetch response");
			const [responseForCaller, responseForFutureCaller] = cloneDedupeResponse(entry.response);
			entry.response = responseForFutureCaller;
			return responseForCaller;
		});
	}
	const promise = originalFetch(input, init);
	const entry = {
		key: candidate.key,
		promise,
		response: null
	};
	entries.push(entry);
	return promise.then((response) => {
		const [responseForCaller, responseForFutureCaller] = cloneDedupeResponse(response);
		entry.response = responseForFutureCaller;
		return responseForCaller;
	}, (err) => {
		const idx = entries.indexOf(entry);
		if (idx !== -1) entries.splice(idx, 1);
		throw err;
	});
}
/**
* Create a patched fetch function with Next.js caching semantics.
*
* The patched fetch:
* 1. Checks `cache` and `next` options to determine caching behavior
* 2. On cache hit, returns the cached response without hitting the network
* 3. On cache miss, fetches from network, stores in cache, returns response
* 4. Respects `next.revalidate` for TTL-based revalidation
* 5. Respects `next.tags` for tag-based invalidation via revalidateTag()
*/
function createPatchedFetch() {
	return async function patchedFetch(input, init) {
		const nextOpts = init?.next;
		const cacheDirective = resolveSegmentCacheDirective(getFetchCacheDirective(input, init), nextOpts, _getState$1().currentFetchCacheMode);
		if (!nextOpts && !cacheDirective) return dedupeFetch(input, init);
		if (cacheDirective === "no-store" || cacheDirective === "no-cache" || nextOpts?.revalidate === false || nextOpts?.revalidate === 0) return dedupeFetch(input, stripNextFromInit(init, cacheDirective));
		if (!(cacheDirective === "force-cache" || typeof nextOpts?.revalidate === "number" && nextOpts.revalidate > 0) && hasAuthHeaders(input, init)) return dedupeFetch(input, stripNextFromInit(init, cacheDirective));
		let revalidateSeconds;
		if (cacheDirective === "force-cache") revalidateSeconds = nextOpts?.revalidate && typeof nextOpts.revalidate === "number" ? nextOpts.revalidate : 31536e3;
		else if (typeof nextOpts?.revalidate === "number" && nextOpts.revalidate > 0) revalidateSeconds = nextOpts.revalidate;
		else if (nextOpts?.tags && nextOpts.tags.length > 0) revalidateSeconds = 31536e3;
		else return dedupeFetch(input, stripNextFromInit(init, cacheDirective));
		const tags = encodeCacheTags(nextOpts?.tags ?? []);
		const softTags = _getState$1().currentFetchSoftTags;
		let fetchInit = stripNextFromInit(init, cacheDirective);
		let cacheKey;
		try {
			cacheKey = await buildFetchCacheKey(input, fetchInit);
			fetchInit = stripNextFromInit(fetchInit, cacheDirective);
		} catch (err) {
			if (err instanceof BodyTooLargeForCacheKeyError || err instanceof SkipCacheKeyGenerationError) {
				fetchInit = stripNextFromInit(fetchInit, cacheDirective);
				return dedupeFetch(input, fetchInit);
			}
			throw err;
		}
		const handler = getCacheHandler();
		const reqTags = _getState$1().currentRequestTags;
		if (tags.length > 0) {
			for (const tag of tags) if (!reqTags.includes(tag)) reqTags.push(tag);
		}
		try {
			const cached = await handler.get(cacheKey, {
				kind: "FETCH",
				tags,
				softTags
			});
			if (cached?.value && cached.value.kind === "FETCH" && cached.cacheState !== "stale") {
				const cachedData = cached.value.data;
				return new Response(cachedData.body, {
					status: cachedData.status ?? 200,
					headers: cachedData.headers
				});
			}
			if (cached?.value && cached.value.kind === "FETCH" && cached.cacheState === "stale") {
				const staleData = cached.value.data;
				if (!pendingRefetches.has(cacheKey)) {
					const refetchPromise = originalFetch(input, fetchInit).then(async (freshResp) => {
						if (freshResp.status !== 200) return;
						const freshBody = await freshResp.text();
						const freshHeaders = {};
						freshResp.headers.forEach((v, k) => {
							if (k.toLowerCase() === "set-cookie") return;
							freshHeaders[k] = v;
						});
						const freshValue = {
							kind: "FETCH",
							data: {
								headers: freshHeaders,
								body: freshBody,
								url: typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url,
								status: freshResp.status
							},
							tags,
							revalidate: revalidateSeconds
						};
						await handler.set(cacheKey, freshValue, {
							fetchCache: true,
							tags,
							revalidate: revalidateSeconds
						});
					}).catch((err) => {
						const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
						console.error(`[vinext] fetch cache background revalidation failed for ${url} (key=${cacheKey.slice(0, 12)}...):`, err);
					}).finally(() => {
						if (pendingRefetches.get(cacheKey) === refetchPromise) pendingRefetches.delete(cacheKey);
						clearTimeout(timeoutId);
					});
					pendingRefetches.set(cacheKey, refetchPromise);
					const timeoutId = setTimeout(() => {
						if (pendingRefetches.get(cacheKey) === refetchPromise) pendingRefetches.delete(cacheKey);
					}, DEDUP_TIMEOUT_MS);
					getRequestExecutionContext()?.waitUntil(refetchPromise);
				}
				return new Response(staleData.body, {
					status: staleData.status ?? 200,
					headers: staleData.headers
				});
			}
		} catch (cacheErr) {
			console.error("[vinext] fetch cache read error:", cacheErr);
		}
		const response = await dedupeFetch(input, fetchInit);
		if (response.status === 200) {
			const cloned = response.clone();
			const body = await cloned.text();
			const headers = {};
			cloned.headers.forEach((v, k) => {
				if (k.toLowerCase() === "set-cookie") return;
				headers[k] = v;
			});
			const cacheValue = {
				kind: "FETCH",
				data: {
					headers,
					body,
					url: typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url,
					status: cloned.status
				},
				tags,
				revalidate: revalidateSeconds
			};
			handler.set(cacheKey, cacheValue, {
				fetchCache: true,
				tags,
				revalidate: revalidateSeconds
			}).catch((err) => {
				console.error("[vinext] fetch cache write error:", err);
			});
		}
		return response;
	};
}
/**
* Strip the `next` property from RequestInit before passing to real fetch.
* The `next` property is not a standard fetch option and would cause warnings
* in some environments.
*/
function stripNextFromInit(init, cacheOverride) {
	if (!init) return cacheOverride === void 0 ? void 0 : { cache: cacheOverride };
	const { next: _next, _ogBody, ...rest } = init;
	if (cacheOverride !== void 0) rest.cache = cacheOverride;
	if (_ogBody !== void 0) rest.body = _ogBody;
	return Object.keys(rest).length > 0 ? rest : void 0;
}
var _PATCH_KEY = Symbol.for("vinext.fetchCache.patchInstalled");
function _ensurePatchInstalled() {
	if (_g$4[_PATCH_KEY]) return;
	_g$4[_PATCH_KEY] = true;
	globalThis.fetch = createPatchedFetch();
}
function runWithFetchDedupe(fn) {
	_ensurePatchInstalled();
	const state = _getState$1();
	if (state.isFetchDedupeActive) return fn();
	if (isInsideUnifiedScope()) return runWithUnifiedStateMutation((uCtx) => {
		uCtx.isFetchDedupeActive = true;
		uCtx.currentFetchDedupeEntries = /* @__PURE__ */ new Map();
	}, fn);
	return _als$1.run({
		...state,
		isFetchDedupeActive: true,
		currentFetchDedupeEntries: /* @__PURE__ */ new Map()
	}, fn);
}
/**
* Install the patched fetch without creating a standalone ALS scope.
*
* `runWithFetchCache()` is the standalone helper: it installs the patch and
* creates an isolated per-request tag store. The unified request context owns
* that isolation itself via `currentRequestTags`, so callers inside
* `runWithRequestContext()` only need the process-global fetch monkey-patch.
*/
function ensureFetchPatch() {
	_ensurePatchInstalled();
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/csp.js
var ESCAPE_REGEX = /[&><\u2028\u2029]/;
function matchesDirectiveName(directive, name) {
	return directive === name || directive.startsWith(`${name} `);
}
function getScriptNonceFromHeader(cspHeaderValue) {
	const directives = cspHeaderValue.split(";").map((directive) => directive.trim());
	const directive = directives.find((value) => matchesDirectiveName(value, "script-src")) ?? directives.find((value) => matchesDirectiveName(value, "default-src"));
	if (!directive) return;
	const nonce = directive.split(" ").slice(1).map((source) => source.trim()).find((source) => source.startsWith("'nonce-") && source.length > 8 && source.endsWith("'"))?.slice(7, -1);
	if (!nonce) return;
	if (ESCAPE_REGEX.test(nonce)) throw new Error("Nonce value from Content-Security-Policy contained HTML escape characters.\nLearn more: https://nextjs.org/docs/messages/nonce-contained-invalid-characters");
	return nonce;
}
function getScriptNonceFromHeaders(headers) {
	const csp = headers?.get("content-security-policy") ?? headers?.get("content-security-policy-report-only");
	if (!csp) return;
	return getScriptNonceFromHeader(csp);
}
function getScriptNonceFromHeaderSources(...headersList) {
	for (const headers of headersList) {
		const nonce = getScriptNonceFromHeaders(headers);
		if (nonce) return nonce;
	}
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/middleware-response-headers.js
var ADDITIVE_RESPONSE_HEADER_NAMES = new Set(["set-cookie", "vary"]);
function mergeVaryHeader(target, value) {
	const existing = target.get("Vary");
	const tokens = (existing ? `${existing}, ${value}` : value).split(",").map((token) => token.trim()).filter((token) => token.length > 0);
	if (tokens.some((token) => token === "*")) {
		target.set("Vary", "*");
		return;
	}
	const seen = /* @__PURE__ */ new Set();
	const merged = [];
	for (const token of tokens) {
		const normalized = token.toLowerCase();
		if (seen.has(normalized)) continue;
		seen.add(normalized);
		merged.push(token);
	}
	target.set("Vary", merged.join(", "));
}
/**
* Merge middleware response headers into a target Headers object.
*
* Set-Cookie and Vary are accumulated (append) since multiple sources can
* contribute values. All other headers use set() so middleware owns singular
* response headers like Cache-Control.
*/
function mergeMiddlewareResponseHeaders(target, middlewareHeaders) {
	if (!middlewareHeaders) return;
	for (const [key, value] of middlewareHeaders) {
		if (key.toLowerCase() === "vary") {
			mergeVaryHeader(target, value);
			continue;
		}
		if (ADDITIVE_RESPONSE_HEADER_NAMES.has(key.toLowerCase())) {
			target.append(key, value);
			continue;
		}
		target.set(key, value);
	}
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/routing/utils.js
var PATH_DELIMITER_REGEX = /([/#?\\]|%(2f|23|3f|5c))/gi;
function encodePathDelimiters(segment) {
	return segment.replace(PATH_DELIMITER_REGEX, (char) => encodeURIComponent(char));
}
/**
* Decode a filesystem or URL path segment while preserving encoded path delimiters.
* Mirrors Next.js segment-wise decoding so "%5F" becomes "_" but "%2F" stays "%2F".
*/
function decodeRouteSegment(segment) {
	try {
		return encodePathDelimiters(decodeURIComponent(segment));
	} catch {
		return segment;
	}
}
/**
* Strict variant for request pipelines that should reject malformed percent-encoding.
*/
function decodeRouteSegmentStrict(segment) {
	return encodePathDelimiters(decodeURIComponent(segment));
}
/**
* Normalize a pathname for route matching by decoding each segment independently.
* This prevents encoded slashes from turning into real path separators.
*/
function normalizePathnameForRouteMatch(pathname) {
	return pathname.split("/").map((segment) => decodeRouteSegment(segment)).join("/");
}
/**
* Strict pathname normalization for live request handling.
* Throws on malformed percent-encoding so callers can return 400.
*/
function normalizePathnameForRouteMatchStrict(pathname) {
	return pathname.split("/").map((segment) => decodeRouteSegmentStrict(segment)).join("/");
}
function decodeMatchedParam(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}
/**
* Decode captured route params with `decodeURIComponent`, mirroring Next.js
* route-matcher.ts:25-27. Mutates the params object in place. Catch-all
* arrays are decoded element-wise. Malformed escapes are preserved (the
* strict normalization layer rejects them at the request boundary).
*/
function decodeMatchedParams(params) {
	for (const key of Object.keys(params)) {
		const value = params[key];
		if (Array.isArray(value)) params[key] = value.map(decodeMatchedParam);
		else params[key] = decodeMatchedParam(value);
	}
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/normalize-path.js
/**
* Path normalization utility for request handling.
*
* Normalizes URL pathnames to a canonical form BEFORE any matching occurs
* (middleware, routing, redirects, rewrites). This ensures middleware and
* the router always see the same path, preventing path-confusion issues like
* double-slash mismatches.
*
* Normalization rules:
*  1. Collapse consecutive slashes: //foo///bar → /foo/bar
*  2. Resolve single-dot segments:  /foo/./bar  → /foo/bar
*  3. Resolve double-dot segments:  /foo/../bar → /bar
*  4. Ensure leading slash:         foo/bar     → /foo/bar
*  5. Preserve root:                /           → /
*
* This function does NOT:
*  - Strip or add trailing slashes (handled separately by trailingSlash config)
*  - Decode percent-encoded characters (callers should decode before calling this)
*  - Lowercase the path (route matching is case-sensitive)
*/
function normalizePath(pathname) {
	if (pathname === "/" || pathname.length > 1 && pathname[0] === "/" && !pathname.includes("//") && !pathname.includes("/./") && !pathname.includes("/../") && !pathname.endsWith("/.") && !pathname.endsWith("/..")) return pathname;
	const segments = pathname.split("/");
	const resolved = [];
	for (const segment of segments) {
		if (segment === "" || segment === ".") continue;
		if (segment === "..") resolved.pop();
		else resolved.push(segment);
	}
	return "/" + resolved.join("/");
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/middleware-matcher.js
var EMPTY_MIDDLEWARE_REQUEST_CONTEXT = {
	headers: new Headers(),
	cookies: {},
	query: new URLSearchParams(),
	host: ""
};
var _mwPatternCache = /* @__PURE__ */ new Map();
function matchesMiddleware(pathname, matcher, request, i18nConfig) {
	if (!matcher) return true;
	if (typeof matcher === "string") return matchMatcherPattern(pathname, matcher, i18nConfig);
	if (!Array.isArray(matcher)) return false;
	const requestContext = request ? requestContextFromRequest(request) : EMPTY_MIDDLEWARE_REQUEST_CONTEXT;
	for (const m of matcher) {
		if (typeof m === "string") {
			if (matchMatcherPattern(pathname, m, i18nConfig)) return true;
			continue;
		}
		if (isValidMiddlewareMatcherObject(m)) {
			if (!matchObjectMatcher(pathname, m, i18nConfig)) continue;
			if (!checkHasConditions(m.has, m.missing, requestContext)) continue;
			return true;
		}
	}
	return false;
}
function isValidMiddlewareMatcherObject(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return false;
	if (!("source" in value) || typeof value.source !== "string") return false;
	for (const key of Object.keys(value)) if (key !== "source" && key !== "locale" && key !== "has" && key !== "missing") return false;
	if ("locale" in value && value.locale !== void 0 && value.locale !== false) return false;
	if ("has" in value && value.has !== void 0 && !Array.isArray(value.has)) return false;
	if ("missing" in value && value.missing !== void 0 && !Array.isArray(value.missing)) return false;
	return true;
}
function matchMatcherPattern(pathname, pattern, i18nConfig) {
	if (!i18nConfig) return matchPattern(pathname, pattern);
	return matchPattern(stripLocalePrefix(pathname, i18nConfig) ?? pathname, pattern);
}
function matchObjectMatcher(pathname, matcher, i18nConfig) {
	return matcher.locale === false ? matchPattern(pathname, matcher.source) : matchMatcherPattern(pathname, matcher.source, i18nConfig);
}
function stripLocalePrefix(pathname, i18nConfig) {
	if (pathname === "/") return null;
	const segments = pathname.split("/");
	const firstSegment = segments[1];
	if (!firstSegment || !i18nConfig.locales.includes(firstSegment)) return null;
	return removeTrailingSlash("/" + segments.slice(2).join("/"));
}
function matchPattern(pathname, pattern) {
	let cached = _mwPatternCache.get(pattern);
	if (cached === void 0) {
		cached = compileMatcherPattern(pattern);
		_mwPatternCache.set(pattern, cached);
	}
	if (cached === null) return pathname === pattern;
	return cached.test(pathname);
}
function extractConstraint(str, re) {
	if (str[re.lastIndex] !== "(") return null;
	const start = re.lastIndex + 1;
	let depth = 1;
	let i = start;
	while (i < str.length && depth > 0) {
		if (str[i] === "(") depth++;
		else if (str[i] === ")") depth--;
		i++;
	}
	if (depth !== 0) return null;
	re.lastIndex = i;
	return str.slice(start, i - 1);
}
function compileMatcherPattern(pattern) {
	const hasConstraints = /:[\w-]+[*+]?\(/.test(pattern);
	if (!hasConstraints && (pattern.includes("(") || pattern.includes("\\"))) return safeRegExp("^" + pattern + "$");
	let regexStr = "";
	const tokenRe = /\/:([\w-]+)\*|\/:([\w-]+)\+|:([\w-]+)|[.]|[^/:.]+|./g;
	let tok;
	while ((tok = tokenRe.exec(pattern)) !== null) if (tok[1] !== void 0) {
		const constraint = hasConstraints ? extractConstraint(pattern, tokenRe) : null;
		regexStr += constraint !== null ? `(?:/(${constraint}))?` : "(?:/.*)?";
	} else if (tok[2] !== void 0) {
		const constraint = hasConstraints ? extractConstraint(pattern, tokenRe) : null;
		regexStr += constraint !== null ? `(?:/(${constraint}))` : "(?:/.+)";
	} else if (tok[3] !== void 0) {
		const constraint = hasConstraints ? extractConstraint(pattern, tokenRe) : null;
		const isOptional = pattern[tokenRe.lastIndex] === "?";
		if (isOptional) tokenRe.lastIndex += 1;
		const group = constraint !== null ? `(${constraint})` : "([^/]+)";
		if (isOptional && regexStr.endsWith("/")) regexStr = regexStr.slice(0, -1) + `(?:/${group})?`;
		else if (isOptional) regexStr += `${group}?`;
		else regexStr += group;
	} else if (tok[0] === ".") regexStr += "\\.";
	else regexStr += tok[0];
	return safeRegExp("^" + regexStr + "$");
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/middleware-runtime.js
function isMiddlewareHandler(value) {
	return typeof value === "function";
}
function isMiddlewareConfigExport(value) {
	return !!value && typeof value === "object";
}
function middlewareFileLabel(isProxy) {
	return isProxy ? "Proxy" : "Middleware";
}
function middlewareExpectedExport(isProxy) {
	return isProxy ? "proxy" : "middleware";
}
function resolveMiddlewareModuleHandler(mod, options) {
	const handler = options.isProxy ? mod.proxy ?? mod.default : mod.middleware ?? mod.default;
	if (isMiddlewareHandler(handler)) return handler;
	const fileLabel = middlewareFileLabel(options.isProxy);
	const expectedExport = middlewareExpectedExport(options.isProxy);
	const fileSuffix = options.filePath ? ` "${options.filePath}"` : "";
	throw new Error(`The ${fileLabel} file${fileSuffix} must export a function named \`${expectedExport}\` or a \`default\` function.`);
}
function middlewareMatcher(mod) {
	const config = mod.config;
	if (!isMiddlewareConfigExport(config)) return void 0;
	return config.matcher;
}
function stripMiddlewareHeadersFromResponse(response) {
	const headers = new Headers(response.headers);
	processMiddlewareHeaders(headers);
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}
function collectMiddlewareHeaders(response) {
	const responseHeaders = new Headers();
	for (const [key, value] of response.headers) if (!key.startsWith("x-middleware-") || shouldKeepMiddlewareHeader(key)) responseHeaders.append(key, value);
	return responseHeaders;
}
function drainFetchEvent(fetchEvent) {
	const waitUntilPromises = fetchEvent.waitUntilPromises;
	const drained = fetchEvent.drainWaitUntil();
	const executionContext = getRequestExecutionContext();
	if (executionContext) executionContext.waitUntil(drained);
	return waitUntilPromises;
}
function resolveMiddlewarePathname(request) {
	const url = new URL(request.url);
	try {
		return normalizePath(normalizePathnameForRouteMatchStrict(url.pathname));
	} catch {
		return badRequestResponse();
	}
}
function createNextRequest(request, normalizedPathname, i18nConfig, basePath) {
	const url = new URL(request.url);
	let mwRequest = request.body && !request.bodyUsed ? request.clone() : request;
	if (normalizedPathname !== url.pathname) {
		const mwUrl = new URL(url);
		mwUrl.pathname = normalizedPathname;
		mwRequest = new Request(mwUrl, mwRequest);
	}
	const nextConfig = basePath || i18nConfig ? {
		basePath: basePath ?? "",
		i18n: i18nConfig ?? void 0
	} : void 0;
	return mwRequest instanceof NextRequest ? mwRequest : new NextRequest(mwRequest, nextConfig ? { nextConfig } : void 0);
}
async function executeMiddleware(options) {
	const middlewareFn = resolveMiddlewareModuleHandler(options.module, {
		filePath: options.filePath,
		isProxy: options.isProxy
	});
	const normalizedPathname = options.normalizedPathname ?? resolveMiddlewarePathname(options.request);
	if (normalizedPathname instanceof Response) return {
		continue: false,
		response: normalizedPathname
	};
	if (!matchesMiddleware(normalizedPathname, middlewareMatcher(options.module), options.request, options.i18nConfig)) return { continue: true };
	const nextRequest = createNextRequest(options.request, normalizedPathname, options.i18nConfig, options.basePath);
	const fetchEvent = new NextFetchEvent({ page: normalizedPathname });
	let response;
	try {
		response = await middlewareFn(nextRequest, fetchEvent);
	} catch (e) {
		console.error("[vinext] Middleware error:", e);
		const waitUntilPromises = drainFetchEvent(fetchEvent);
		return {
			continue: false,
			response: internalServerErrorResponse(options.includeErrorDetails ? "Middleware Error: " + (e instanceof Error ? e.message : String(e)) : "Internal Server Error"),
			waitUntilPromises
		};
	}
	const waitUntilPromises = drainFetchEvent(fetchEvent);
	if (!response) return {
		continue: true,
		waitUntilPromises
	};
	if (response.headers.get("x-middleware-next") === "1") return {
		continue: true,
		responseHeaders: collectMiddlewareHeaders(response),
		status: response.status !== 200 ? response.status : void 0,
		waitUntilPromises
	};
	if (response.status >= 300 && response.status < 400) {
		const location = response.headers.get("Location") ?? response.headers.get("location");
		if (location) {
			const responseHeaders = new Headers();
			for (const [key, value] of response.headers) if (!key.startsWith("x-middleware-") && key.toLowerCase() !== "location") responseHeaders.append(key, value);
			return {
				continue: false,
				redirectUrl: location,
				redirectStatus: response.status,
				response: stripMiddlewareHeadersFromResponse(response),
				responseHeaders,
				waitUntilPromises
			};
		}
	}
	const rewriteUrl = response.headers.get(MIDDLEWARE_REWRITE_HEADER);
	if (rewriteUrl) {
		let rewritePath;
		try {
			const rewriteParsed = new URL(rewriteUrl, options.request.url);
			const requestOrigin = new URL(options.request.url).origin;
			rewritePath = rewriteParsed.origin === requestOrigin ? rewriteParsed.pathname + rewriteParsed.search : rewriteParsed.href;
		} catch {
			rewritePath = rewriteUrl;
		}
		return {
			continue: true,
			rewriteUrl: rewritePath,
			rewriteStatus: response.status !== 200 ? response.status : void 0,
			responseHeaders: collectMiddlewareHeaders(response),
			status: response.status !== 200 ? response.status : void 0,
			waitUntilPromises
		};
	}
	return {
		continue: false,
		response: stripMiddlewareHeadersFromResponse(response),
		waitUntilPromises
	};
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-middleware.js
var FLIGHT_HEADER_SET = new Set(FLIGHT_HEADERS);
function requestWithoutFlightHeaders(request) {
	let hasFlightHeader = false;
	const headers = new Headers();
	for (const [key, value] of request.headers) if (FLIGHT_HEADER_SET.has(key.toLowerCase())) hasFlightHeader = true;
	else headers.append(key, value);
	if (!hasFlightHeader) return request;
	return cloneRequestWithHeaders(request.body ? request.clone() : request, headers);
}
function responseFromMiddlewareRedirect(result) {
	if (result.response) return result.response;
	const headers = new Headers(result.responseHeaders);
	if (result.redirectUrl) headers.set("Location", result.redirectUrl);
	return new Response(null, {
		status: result.redirectStatus ?? 307,
		headers
	});
}
function isExternalMiddlewareRewrite(rewriteUrl, request) {
	return new URL(rewriteUrl, request.url).origin !== new URL(request.url).origin;
}
function requestWithMiddlewareRequestHeaders(request, middlewareHeaders) {
	const nextHeaders = middlewareHeaders ? buildRequestHeadersFromMiddlewareResponse(request.headers, middlewareHeaders, { preserveCredentialHeaders: true }) : null;
	if (!nextHeaders) return request;
	const init = {
		method: request.method,
		headers: nextHeaders,
		body: request.body
	};
	if (request.body) Object.defineProperty(init, "duplex", {
		value: "half",
		enumerable: true
	});
	return new Request(request.url, init);
}
async function proxyExternalMiddlewareRewrite(request, rewriteUrl, context) {
	const proxyRequest = requestWithMiddlewareRequestHeaders(request, context.requestHeaders ?? context.headers);
	setHeadersContext(null);
	setNavigationContext(null);
	const proxyResponse = await proxyExternalRequest(proxyRequest, rewriteUrl);
	const headers = new Headers(proxyResponse.headers);
	processMiddlewareHeaders(headers);
	if (!context.headers) return new Response(proxyResponse.body, {
		status: proxyResponse.status,
		statusText: proxyResponse.statusText,
		headers
	});
	const middlewareHeaders = new Headers(context.headers);
	processMiddlewareHeaders(middlewareHeaders);
	mergeMiddlewareResponseHeaders(headers, middlewareHeaders);
	return new Response(proxyResponse.body, {
		status: proxyResponse.status,
		statusText: proxyResponse.statusText,
		headers
	});
}
function applyForwardedMiddlewareContext(request, context) {
	return { applied: false };
}
async function applyAppMiddleware(options) {
	const forwarded = applyForwardedMiddlewareContext(options.request, options.context);
	const middlewareRequest = requestWithoutFlightHeaders(options.request);
	let cleanPathname = options.cleanPathname;
	let search = null;
	if (forwarded.rewriteUrl) try {
		if (isExternalMiddlewareRewrite(forwarded.rewriteUrl, middlewareRequest)) return {
			kind: "response",
			response: await proxyExternalMiddlewareRewrite(middlewareRequest, forwarded.rewriteUrl, options.context)
		};
		const rewriteParsed = new URL(forwarded.rewriteUrl, middlewareRequest.url);
		cleanPathname = rewriteParsed.pathname;
		search = rewriteParsed.search;
	} catch (e) {
		console.error("[vinext] Failed to apply forwarded middleware rewrite:", e);
		forwarded.applied = false;
	}
	if (!forwarded.applied) {
		const result = await executeMiddleware({
			basePath: options.basePath,
			i18nConfig: options.i18nConfig,
			isProxy: options.isProxy,
			module: options.module,
			normalizedPathname: cleanPathname,
			request: middlewareRequest
		});
		if (!result.continue) {
			if (result.redirectUrl) return {
				kind: "response",
				response: responseFromMiddlewareRedirect(result)
			};
			if (result.response) return {
				kind: "response",
				response: result.response
			};
			return {
				kind: "response",
				response: internalServerErrorResponse()
			};
		}
		if (result.responseHeaders) options.context.headers = new Headers(result.responseHeaders);
		if (result.status !== void 0) options.context.status = result.status;
		if (result.rewriteUrl) {
			if (result.rewriteStatus !== void 0) options.context.status = result.rewriteStatus;
			if (isExternalUrl(result.rewriteUrl)) return {
				kind: "response",
				response: await proxyExternalMiddlewareRewrite(middlewareRequest, result.rewriteUrl, options.context)
			};
			const rewriteParsed = new URL(result.rewriteUrl, middlewareRequest.url);
			cleanPathname = rewriteParsed.pathname;
			search = rewriteParsed.search;
		}
	}
	if (options.context.headers) {
		options.context.requestHeaders = new Headers(options.context.headers);
		applyMiddlewareRequestHeaders(options.context.headers);
		processMiddlewareHeaders(options.context.headers);
	}
	return {
		kind: "continue",
		cleanPathname,
		search
	};
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/cache-control.js
var NEVER_CACHE_CONTROL = "private, no-cache, no-store, max-age=0, must-revalidate";
var STATIC_CACHE_CONTROL = "s-maxage=31536000, stale-while-revalidate";
var STALE_REVALIDATE_CACHE_CONTROL = "s-maxage=0, stale-while-revalidate";
var NO_STORE_CACHE_CONTROL$1 = "no-store, must-revalidate";
/**
* Matches Next.js's `getCacheControlHeader` stale window semantics while
* preserving vinext's legacy unbounded SWR header when no expire ceiling is
* available yet.
*
* Next.js source:
* https://github.com/vercel/next.js/blob/canary/packages/next/src/server/lib/cache-control.ts
*/
function buildRevalidateCacheControl(revalidateSeconds, expireSeconds) {
	if (expireSeconds === void 0) return `s-maxage=${revalidateSeconds}, stale-while-revalidate`;
	if (revalidateSeconds >= expireSeconds) return `s-maxage=${revalidateSeconds}`;
	return `s-maxage=${revalidateSeconds}, stale-while-revalidate=${expireSeconds - revalidateSeconds}`;
}
/**
* Builds Cache-Control for ISR cache reads. HIT responses and STALE responses
* with stored expire metadata use the same route policy because Next.js derives
* this header from cache-control metadata, not from the cache hit/stale state.
* STALE entries without expire metadata keep vinext's legacy `s-maxage=0`
* fallback so older cache entries are not treated as newly fresh downstream.
*/
function buildCachedRevalidateCacheControl(cacheState, revalidateSeconds, expireSeconds) {
	if (revalidateSeconds === Infinity) return STATIC_CACHE_CONTROL;
	if (cacheState === "STALE" && expireSeconds === void 0) return STALE_REVALIDATE_CACHE_CONTROL;
	return buildRevalidateCacheControl(revalidateSeconds, expireSeconds);
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-page-response.js
function applyTimingHeader(headers, timing) {
	if (!timing) return;
	const handlerStart = Math.round(timing.handlerStart);
	const compileMs = timing.compileEnd !== void 0 ? Math.round(timing.compileEnd - timing.handlerStart) : -1;
	const renderMs = timing.responseKind === "html" && timing.renderEnd !== void 0 && timing.compileEnd !== void 0 ? Math.round(timing.renderEnd - timing.compileEnd) : -1;
	headers.set(VINEXT_TIMING_HEADER, `${handlerStart},${compileMs},${renderMs}`);
}
function resolveAppPageRscResponsePolicy(options) {
	if (options.isDraftMode) return { cacheControl: NO_STORE_CACHE_CONTROL$1 };
	if (options.isForceDynamic || options.dynamicUsedDuringBuild) return { cacheControl: NO_STORE_CACHE_CONTROL$1 };
	if (options.revalidateSeconds === 0) return { cacheControl: NO_STORE_CACHE_CONTROL$1 };
	if ((options.isForceStatic || options.isDynamicError) && !options.revalidateSeconds || options.revalidateSeconds === Infinity) return {
		cacheControl: STATIC_CACHE_CONTROL,
		cacheState: "STATIC"
	};
	if (options.revalidateSeconds) return {
		cacheControl: buildRevalidateCacheControl(options.revalidateSeconds, options.expireSeconds),
		cacheState: options.isProduction ? "MISS" : void 0
	};
	return {};
}
function resolveAppPageHtmlResponsePolicy(options) {
	if (options.isDraftMode) return {
		cacheControl: NO_STORE_CACHE_CONTROL$1,
		shouldWriteToCache: false
	};
	if (options.isForceDynamic) return {
		cacheControl: NO_STORE_CACHE_CONTROL$1,
		shouldWriteToCache: false
	};
	if (options.hasScriptNonce) return {
		cacheControl: NO_STORE_CACHE_CONTROL$1,
		shouldWriteToCache: false
	};
	if (options.isProgressiveActionRender) return {
		cacheControl: NO_STORE_CACHE_CONTROL$1,
		shouldWriteToCache: false
	};
	if (options.revalidateSeconds === 0) return {
		cacheControl: NO_STORE_CACHE_CONTROL$1,
		shouldWriteToCache: false
	};
	if ((options.isForceStatic || options.isDynamicError) && options.revalidateSeconds === null) return {
		cacheControl: STATIC_CACHE_CONTROL,
		cacheState: "STATIC",
		shouldWriteToCache: false
	};
	if (options.dynamicUsedDuringRender) return {
		cacheControl: NO_STORE_CACHE_CONTROL$1,
		shouldWriteToCache: false
	};
	if (options.revalidateSeconds !== null && options.revalidateSeconds > 0 && options.revalidateSeconds !== Infinity) return {
		cacheControl: buildRevalidateCacheControl(options.revalidateSeconds, options.expireSeconds),
		cacheState: options.isProduction ? "MISS" : void 0,
		shouldWriteToCache: options.isProduction
	};
	if (options.revalidateSeconds === Infinity) return {
		cacheControl: STATIC_CACHE_CONTROL,
		cacheState: "STATIC",
		shouldWriteToCache: false
	};
	return { shouldWriteToCache: false };
}
function buildAppPageRscResponse(body, options) {
	const headers = new Headers({
		"Content-Type": "text/x-component; charset=utf-8",
		Vary: VINEXT_RSC_VARY_HEADER
	});
	if (options.params && Object.keys(options.params).length > 0) headers.set(VINEXT_PARAMS_HEADER, encodeURIComponent(JSON.stringify(options.params)));
	if (options.mountedSlotsHeader) headers.set(VINEXT_MOUNTED_SLOTS_HEADER, options.mountedSlotsHeader);
	if (options.policy.cacheControl) headers.set("Cache-Control", options.policy.cacheControl);
	if (options.policy.cacheState) headers.set(VINEXT_CACHE_HEADER, options.policy.cacheState);
	mergeMiddlewareResponseHeaders(headers, options.middlewareContext.headers);
	applyTimingHeader(headers, options.timing);
	return new Response(body, {
		status: options.middlewareContext.status ?? 200,
		headers
	});
}
function buildAppPageHtmlResponse(body, options) {
	const headers = new Headers({
		"Content-Type": "text/html; charset=utf-8",
		Vary: VINEXT_RSC_VARY_HEADER
	});
	if (options.policy.cacheControl) headers.set("Cache-Control", options.policy.cacheControl);
	if (options.policy.cacheState) headers.set(VINEXT_CACHE_HEADER, options.policy.cacheState);
	if (options.draftCookie) headers.append("Set-Cookie", options.draftCookie);
	if (options.fontLinkHeader) headers.set("Link", options.fontLinkHeader);
	mergeMiddlewareResponseHeaders(headers, options.middlewareContext.headers);
	applyTimingHeader(headers, options.timing);
	return new Response(body, {
		status: options.middlewareContext.status ?? 200,
		headers
	});
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/implicit-tags.js
var NEXT_CACHE_IMPLICIT_TAG_ID = "_N_T_";
function appendUnique(tags, tag) {
	if (!tags.includes(tag)) tags.push(tag);
}
function normalizeRouteSegment(segment) {
	if (!segment || segment === "." || segment.startsWith("@")) return null;
	return segment;
}
function buildRouteCachePath(routeSegments, leafKind) {
	const parts = [];
	for (const segment of routeSegments) {
		const normalized = normalizeRouteSegment(segment);
		if (normalized) parts.push(normalized);
	}
	parts.push(leafKind);
	return `/${parts.join("/")}`;
}
function appendDerivedTags(tags, routePath) {
	appendUnique(tags, `${NEXT_CACHE_IMPLICIT_TAG_ID}/layout`);
	if (!routePath.startsWith("/")) return;
	const routeParts = routePath.split("/");
	const leafIndex = routeParts.length - 1;
	for (let i = 1; i <= routeParts.length; i++) {
		let currentPathname = routeParts.slice(0, i).join("/");
		if (!currentPathname) continue;
		if (!(i - 1 === leafIndex)) currentPathname = `${currentPathname}/layout`;
		appendUnique(tags, `${NEXT_CACHE_IMPLICIT_TAG_ID}${currentPathname}`);
	}
}
function buildPageCacheTags(pathname, extraTags, routeSegments, leafKind) {
	const tags = [pathname, `${NEXT_CACHE_IMPLICIT_TAG_ID}${pathname}`];
	if (pathname === "/") appendUnique(tags, `${NEXT_CACHE_IMPLICIT_TAG_ID}/index`);
	if (pathname === "/index") appendUnique(tags, `${NEXT_CACHE_IMPLICIT_TAG_ID}/`);
	appendDerivedTags(tags, buildRouteCachePath(routeSegments, leafKind));
	for (const tag of extraTags) appendUnique(tags, tag);
	return tags.map(encodeCacheTag);
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-post-middleware-context.js
/**
* Build a request context from the live ALS HeadersContext, which reflects
* any x-middleware-request-* header mutations applied by middleware.
* Used for afterFiles and fallback rewrite has/missing evaluation — these
* run after middleware in the App Router execution order.
*
* Falls back to `requestContextFromRequest(request)` when no HeadersContext
* is set (no middleware ran, or middleware didn't set request headers).
*/
function buildPostMwRequestContext(request) {
	const url = new URL(request.url);
	const ctx = getHeadersContext();
	if (!ctx) return requestContextFromRequest(request);
	const cookiesRecord = Object.fromEntries(ctx.cookies);
	return {
		headers: ctx.headers,
		cookies: cookiesRecord,
		query: url.searchParams,
		host: normalizeHost(ctx.headers.get("host"), url.hostname)
	};
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/root-params.js
var _FALLBACK_KEY$1 = Symbol.for("vinext.rootParams.fallback");
var _g$3 = globalThis;
var _fallbackState$1 = _g$3[_FALLBACK_KEY$1] ??= { rootParams: null };
function getState() {
	if (isInsideUnifiedScope()) return getRequestContext();
	return _fallbackState$1;
}
function pickRootParams(params, rootParamNames) {
	const picked = {};
	for (const name of rootParamNames ?? []) picked[name] = params[name];
	return picked;
}
function setRootParams(params) {
	getState().rootParams = params;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-prerender-static-params.js
async function callAppPrerenderStaticParams(options) {
	setRootParams(pickRootParams(options.params, options.rootParamNamesByPattern[options.pattern]));
	try {
		return await options.fn({ params: options.params });
	} finally {
		setRootParams(null);
	}
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-prerender-endpoints.js
var STATIC_PARAMS_ENDPOINT = "/__vinext/prerender/static-params";
var PAGES_STATIC_PATHS_ENDPOINT = "/__vinext/prerender/pages-static-paths";
var JSON_HEADERS = { "content-type": "application/json" };
async function handleAppPrerenderEndpoint(request, options) {
	if (options.pathname === STATIC_PARAMS_ENDPOINT) return handleStaticParamsEndpoint(request, options);
	if (options.pathname === PAGES_STATIC_PATHS_ENDPOINT) {
		if (!options.loadPagesRoutes) return null;
		return handlePagesStaticPathsEndpoint(request, options);
	}
	return null;
}
async function handleStaticParamsEndpoint(request, options) {
	if (!isEnabled(options)) return notFoundResponse();
	const url = new URL(request.url);
	const pattern = url.searchParams.get("pattern");
	if (!pattern) return new Response("missing pattern", { status: 400 });
	const generateStaticParams = options.staticParamsMap[pattern];
	if (typeof generateStaticParams !== "function") return jsonNullResponse();
	try {
		return jsonResponse(await callAppPrerenderStaticParams({
			fn: generateStaticParams,
			params: parseParentParams(url.searchParams.get("parentParams")),
			pattern,
			rootParamNamesByPattern: options.rootParamNamesByPattern ?? {}
		}));
	} catch (error) {
		return jsonResponse({ error: String(error) }, 500);
	}
}
async function handlePagesStaticPathsEndpoint(request, options) {
	if (!isEnabled(options)) return notFoundResponse();
	const url = new URL(request.url);
	const pattern = url.searchParams.get("pattern");
	if (!pattern) return new Response("missing pattern", { status: 400 });
	try {
		const getStaticPaths = findPageRoute(await options.loadPagesRoutes?.(), pattern)?.module?.getStaticPaths;
		if (typeof getStaticPaths !== "function") return jsonNullResponse();
		return jsonResponse(await getStaticPaths({
			locales: parseLocales(url.searchParams.get("locales")),
			defaultLocale: url.searchParams.get("defaultLocale") ?? ""
		}));
	} catch (error) {
		return jsonResponse({ error: String(error) }, 500);
	}
}
function isEnabled(options) {
	return options.isPrerenderEnabled?.() ?? false;
}
function jsonResponse(body, status = 200) {
	return new Response(JSON.stringify(body), {
		headers: JSON_HEADERS,
		status
	});
}
function jsonNullResponse() {
	return new Response("null", {
		headers: JSON_HEADERS,
		status: 200
	});
}
function parseParentParams(raw) {
	if (!raw) return {};
	const value = JSON.parse(raw);
	if (!isPlainObject(value)) return {};
	const params = {};
	for (const [key, paramValue] of Object.entries(value)) if (typeof paramValue === "string" || paramValue === void 0 || isStringArray(paramValue)) params[key] = paramValue;
	return params;
}
function parseLocales(raw) {
	if (!raw) return [];
	const value = JSON.parse(raw);
	if (!Array.isArray(value)) return [];
	return value.filter((locale) => typeof locale === "string");
}
function findPageRoute(value, pattern) {
	if (!Array.isArray(value)) return void 0;
	for (const route of value) if (isPageRoute(route) && route.pattern === pattern) return route;
}
function isPageRoute(value) {
	if (!isPlainObject(value) || typeof value.pattern !== "string") return false;
	if (value.module === void 0) return true;
	if (!isPlainObject(value.module)) return false;
	return value.module.getStaticPaths === void 0 || typeof value.module.getStaticPaths === "function";
}
function isPlainObject(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isStringArray(value) {
	return Array.isArray(value) && value.every((item) => typeof item === "string");
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-rsc-response-finalizer.js
/**
* Apply App Router response finalization that must happen outside individual
* route dispatchers.
*
* Called once per request in the outer handler() wrapper, after all route
* handling, so that every response path (page, route handler, server action,
* metadata, not-found) gets headers applied consistently.
*
* Skips 3xx redirect responses. Response.redirect() creates immutable
* headers that throw on mutation, and Next.js does not apply config headers
* to redirects regardless.
*/
function finalizeAppRscResponse(response, request, options) {
	if (response.status >= 300 && response.status < 400) return response;
	if (!response.headers.has("x-vinext-static-file")) mergeVaryHeader(response.headers, VINEXT_RSC_VARY_HEADER);
	if (!options.configHeaders.length) return response;
	const url = new URL(request.url);
	let pathname;
	try {
		pathname = normalizePath(normalizePathnameForRouteMatch(url.pathname));
	} catch {
		pathname = url.pathname;
	}
	pathname = stripBasePath(pathname, options.basePath);
	applyConfigHeadersToResponse(response.headers, {
		configHeaders: options.configHeaders,
		pathname,
		requestContext: options.requestContext
	});
	return response;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-rsc-request-normalization.js
/**
* Normalize an App Router RSC request.
*
* Performs all security-sensitive and compatibility-sensitive preprocessing before
* route matching. The ordering of steps is security-critical — changing it introduces
* vulnerabilities:
*
*   1. Parse URL
*   2. Protocol-relative URL guard — on the raw pathname, BEFORE normalizePath collapses
*      `//` to `/`. If the guard ran after normalization, `//evil.com` → `/evil.com`
*      would bypass the check and reach the trailing-slash redirector, which echoes the
*      path into a `Location` header that browsers interpret as protocol-relative.
*   3. Strict percent-decode each segment — throws on malformed sequences (→ 400). Must
*      run before basePath check so %2F-encoded slashes cannot create fake basePath prefixes.
*   4. Collapse double-slashes, resolve `.` and `..` segments (normalizePath)
*   5. basePath check + strip — 404 when pathname lacks the basePath prefix.
*      `/__vinext/` bypasses this for internal prerender endpoints.
*   6. RSC detection: `.rsc` suffix only. RSC headers do not select payload
*      rendering at the canonical HTML URL, so caches that ignore Vary cannot
*      store Flight responses under HTML URLs.
*   7. cleanPathname — pathname with `.rsc` suffix stripped
*   8. Sanitize X-Vinext-Interception-Context — strip null bytes (header injection)
*   9. Normalize x-vinext-mounted-slots — dedup and sort for canonical cache keys
*   10. Read semantic render mode for refresh/action payload rendering
*
* @returns A 400 or 404 Response for invalid or out-of-scope inputs,
*          or a NormalizedRscRequest for valid requests.
*/
function normalizeRscRequest(request, basePath) {
	const url = new URL(request.url);
	const protoGuard = guardProtocolRelativeUrl(url.pathname);
	if (protoGuard) return protoGuard;
	let decoded;
	try {
		decoded = normalizePathnameForRouteMatchStrict(url.pathname);
	} catch {
		return badRequestResponse();
	}
	let pathname = normalizePath(decoded);
	if (basePath) {
		if (!hasBasePath(pathname, basePath) && !pathname.startsWith("/__vinext/")) return notFoundResponse();
		pathname = stripBasePath(pathname, basePath);
	}
	const isRscRequest = pathname.endsWith(".rsc");
	const cleanPathname = stripRscSuffix(pathname);
	const interceptionContextHeader = request.headers.get("X-Vinext-Interception-Context")?.replaceAll("\0", "") || null;
	const mountedSlotsHeader = normalizeMountedSlotsHeader(request.headers.get(VINEXT_MOUNTED_SLOTS_HEADER));
	const renderMode = isRscRequest ? parseAppRscRenderMode(request.headers.get(VINEXT_RSC_RENDER_MODE_HEADER)) : APP_RSC_RENDER_MODE_NAVIGATION;
	return {
		url,
		pathname,
		cleanPathname,
		isRscRequest,
		interceptionContextHeader,
		mountedSlotsHeader,
		renderMode
	};
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/routing/route-pattern.js
function routePatternPart(segment) {
	if (segment.startsWith("[[...") && segment.endsWith("]]")) return `:${segment.slice(5, -2)}*`;
	if (segment.startsWith("[...") && segment.endsWith("]")) return `:${segment.slice(4, -1)}+`;
	if (segment.startsWith("[") && segment.endsWith("]")) return `:${segment.slice(1, -1)}`;
	return segment;
}
function routePatternParts(pathname) {
	return pathname.split("/").filter(Boolean).map(routePatternPart);
}
function routePattern(pathname) {
	const parts = routePatternParts(pathname);
	return parts.length > 0 ? `/${parts.join("/")}` : "";
}
function appendParamValue(target, value) {
	if (Array.isArray(value)) {
		for (const entry of value) target.push(entry);
		return;
	}
	target.push(value);
}
function fillRoutePatternSegments(pathname, params) {
	const segments = pathname.split("/").filter(Boolean);
	const resolvedSegments = [];
	for (const segment of segments) {
		if (segment.startsWith("[[...") && segment.endsWith("]]")) {
			const value = params[segment.slice(5, -2)];
			if (value !== void 0 && value !== "") {
				if (Array.isArray(value) && value.length === 0) continue;
				appendParamValue(resolvedSegments, value);
			}
			continue;
		}
		if (segment.startsWith("[...") && segment.endsWith("]")) {
			const value = params[segment.slice(4, -1)];
			if (value === void 0 || (Array.isArray(value) ? value.length === 0 : value === "")) return null;
			appendParamValue(resolvedSegments, value);
			continue;
		}
		if (segment.startsWith("[") && segment.endsWith("]")) {
			const value = params[segment.slice(1, -1)];
			if (typeof value === "string") {
				resolvedSegments.push(value);
				continue;
			}
			if (Array.isArray(value) && value.length > 0) {
				if (value.length > 1) return null;
				resolvedSegments.push(value[0]);
				continue;
			}
			return null;
		}
		resolvedSegments.push(segment);
	}
	return resolvedSegments.length > 0 ? `/${resolvedSegments.join("/")}` : "/";
}
function matchRoutePattern(urlParts, patternParts) {
	const params = Object.create(null);
	function matchFrom(urlIndex, patternIndex) {
		if (patternIndex === patternParts.length) return urlIndex === urlParts.length;
		const patternPart = patternParts[patternIndex];
		if (patternPart.startsWith(":") && (patternPart.endsWith("+") || patternPart.endsWith("*"))) {
			const paramName = patternPart.slice(1, -1);
			const minLength = patternPart.endsWith("+") ? 1 : 0;
			for (let endIndex = urlIndex + minLength; endIndex <= urlParts.length; endIndex++) {
				const value = urlParts.slice(urlIndex, endIndex);
				if (value.length > 0) params[paramName] = value;
				else delete params[paramName];
				if (matchFrom(endIndex, patternIndex + 1)) return true;
			}
			delete params[paramName];
			return false;
		}
		if (patternPart.startsWith(":")) {
			if (urlIndex >= urlParts.length) return false;
			const paramName = patternPart.slice(1);
			params[paramName] = urlParts[urlIndex];
			if (matchFrom(urlIndex + 1, patternIndex + 1)) return true;
			delete params[paramName];
			return false;
		}
		if (urlIndex >= urlParts.length || urlParts[urlIndex] !== patternPart) return false;
		return matchFrom(urlIndex + 1, patternIndex + 1);
	}
	if (!matchFrom(0, 0)) return null;
	decodeMatchedParams(params);
	return params;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/metadata-routes.js
/** Escape the five XML special characters in text content and attribute values. */
function escapeXml(s) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
/**
* Convert a sitemap array to XML string.
*/
function sitemapToXml(entries) {
	const hasAlternates = entries.some((entry) => Object.keys(entry.alternates ?? {}).length > 0);
	const hasImages = entries.some((entry) => Boolean(entry.images?.length));
	const hasVideos = entries.some((entry) => Boolean(entry.videos?.length));
	let content = "";
	content += "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
	content += "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"";
	if (hasImages) content += " xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\"";
	if (hasVideos) content += " xmlns:video=\"http://www.google.com/schemas/sitemap-video/1.1\"";
	if (hasAlternates) content += " xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">\n";
	else content += ">\n";
	for (const entry of entries) {
		content += "<url>\n";
		content += `<loc>${escapeXml(entry.url)}</loc>\n`;
		const languages = entry.alternates?.languages;
		if (languages && Object.keys(languages).length) for (const language in languages) content += `<xhtml:link rel="alternate" hreflang="${escapeXml(language)}" href="${escapeXml(languages[language])}" />\n`;
		if (entry.images?.length) for (const image of entry.images) content += `<image:image>\n<image:loc>${escapeXml(image)}</image:loc>\n</image:image>\n`;
		if (entry.videos?.length) for (const video of entry.videos) {
			const videoFields = [
				"<video:video>",
				`<video:title>${escapeXml(String(video.title))}</video:title>`,
				`<video:thumbnail_loc>${escapeXml(String(video.thumbnail_loc))}</video:thumbnail_loc>`,
				`<video:description>${escapeXml(String(video.description))}</video:description>`,
				video.content_loc && `<video:content_loc>${escapeXml(String(video.content_loc))}</video:content_loc>`,
				video.player_loc && `<video:player_loc>${escapeXml(String(video.player_loc))}</video:player_loc>`,
				video.duration && `<video:duration>${video.duration}</video:duration>`,
				video.view_count && `<video:view_count>${video.view_count}</video:view_count>`,
				video.tag && `<video:tag>${escapeXml(String(video.tag))}</video:tag>`,
				video.rating && `<video:rating>${video.rating}</video:rating>`,
				video.expiration_date && `<video:expiration_date>${escapeXml(String(video.expiration_date))}</video:expiration_date>`,
				video.publication_date && `<video:publication_date>${escapeXml(String(video.publication_date))}</video:publication_date>`,
				video.family_friendly && `<video:family_friendly>${video.family_friendly}</video:family_friendly>`,
				video.requires_subscription && `<video:requires_subscription>${video.requires_subscription}</video:requires_subscription>`,
				video.live && `<video:live>${video.live}</video:live>`,
				video.restriction && `<video:restriction relationship="${escapeXml(String(video.restriction.relationship))}">${escapeXml(String(video.restriction.content))}</video:restriction>`,
				video.platform && `<video:platform relationship="${escapeXml(String(video.platform.relationship))}">${escapeXml(String(video.platform.content))}</video:platform>`,
				video.uploader && `<video:uploader${video.uploader.info ? ` info="${escapeXml(String(video.uploader.info))}"` : ""}>${escapeXml(String(video.uploader.content))}</video:uploader>`,
				"</video:video>\n"
			].filter(Boolean);
			content += videoFields.join("\n");
		}
		if (entry.lastModified) content += `<lastmod>${serializeDate(entry.lastModified)}</lastmod>\n`;
		if (entry.changeFrequency) content += `<changefreq>${entry.changeFrequency}</changefreq>\n`;
		if (typeof entry.priority === "number") content += `<priority>${entry.priority}</priority>\n`;
		content += "</url>\n";
	}
	content += "</urlset>\n";
	return content;
}
/**
* Convert a robots config to text format.
*/
function robotsToText(config) {
	const lines = [];
	const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
	for (const rule of rules) {
		const agents = Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent ?? "*"];
		for (const agent of agents) lines.push(`User-Agent: ${agent}`);
		if (rule.allow) {
			const allows = Array.isArray(rule.allow) ? rule.allow : [rule.allow];
			for (const allow of allows) lines.push(`Allow: ${allow}`);
		}
		if (rule.disallow) {
			const disallows = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
			for (const disallow of disallows) lines.push(`Disallow: ${disallow}`);
		}
		if (rule.crawlDelay !== void 0) lines.push(`Crawl-delay: ${rule.crawlDelay}`);
		if (rule.other) for (const key of Object.keys(rule.other)) {
			const value = rule.other[key];
			if (value == null) continue;
			const values = Array.isArray(value) ? value : [value];
			for (const v of values) lines.push(`${key}: ${v}`);
		}
		lines.push("");
	}
	if (config.sitemap) {
		const sitemaps = Array.isArray(config.sitemap) ? config.sitemap : [config.sitemap];
		for (const sitemap of sitemaps) lines.push(`Sitemap: ${sitemap}`);
	}
	if (config.host) lines.push(`Host: ${config.host}`);
	return lines.join("\n").trim() + "\n";
}
/**
* Convert a manifest config to JSON string.
*/
function manifestToJson(config) {
	return JSON.stringify(config, null, 2);
}
function serializeDate(value) {
	return value instanceof Date ? value.toISOString() : value;
}
function getMetadataRouteKind(route) {
	if (route.type === "favicon") return "favicon";
	if (route.type === "icon") return "icon";
	if (route.type === "apple-icon") return "apple";
	if (route.type === "opengraph-image") return "openGraph";
	if (route.type === "twitter-image") return "twitter";
	if (route.type === "manifest") return "manifest";
	return null;
}
function getMetadataImageRouteKind(route) {
	const kind = getMetadataRouteKind(route);
	if (kind === "icon" || kind === "apple" || kind === "openGraph" || kind === "twitter") return kind;
	return null;
}
var metadataImageIdPattern = /^[a-zA-Z0-9-_.]+$/;
function isValidMetadataImageId(id) {
	return metadataImageIdPattern.test(id);
}
function matchMetadataRoutePattern(urlParts, patternParts) {
	return matchRoutePattern(urlParts, patternParts);
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/metadata-route-response.js
var routeFunctionCache = /* @__PURE__ */ new WeakMap();
function isObject(value) {
	return typeof value === "object" && value !== null;
}
function readFunction(module, key) {
	if (!module) return null;
	const value = Reflect.get(module, key);
	if (typeof value !== "function") return null;
	return (props) => Reflect.apply(value, module, [props]);
}
function isSitemapEntries(value) {
	return Array.isArray(value);
}
function isRobotsConfig(value) {
	return isObject(value) && !Array.isArray(value);
}
function isManifestConfig(value) {
	return isObject(value) && !Array.isArray(value);
}
function isImageMetadataRoute(route) {
	return route.type === "icon" || route.type === "apple-icon" || route.type === "opengraph-image" || route.type === "twitter-image";
}
function getMetadataRouteFunctions(route) {
	const cached = routeFunctionCache.get(route);
	if (cached) return cached;
	const generateImageMetadata = route.isDynamic && isImageMetadataRoute(route) ? readFunction(route.module, "generateImageMetadata") : null;
	const functions = {
		defaultExport: route.isDynamic ? readFunction(route.module, "default") : null,
		generateImageMetadata,
		generateSitemaps: route.type === "sitemap" && route.isDynamic ? readFunction(route.module, "generateSitemaps") : null,
		hasGeneratedImageMetadata: route.isDynamic && isImageMetadataRoute(route) && Boolean(generateImageMetadata)
	};
	routeFunctionCache.set(route, functions);
	return functions;
}
function matchMetadataRoute(route, cleanPathname, functions) {
	if (route.patternParts) {
		const urlParts = cleanPathname.split("/").filter(Boolean);
		if (functions.hasGeneratedImageMetadata && urlParts.length > 0) {
			const params = matchMetadataRoutePattern(urlParts.slice(0, -1), route.patternParts);
			if (params) return {
				params,
				imageId: urlParts[urlParts.length - 1]
			};
		}
		const params = matchMetadataRoutePattern(urlParts, route.patternParts);
		return params ? {
			params,
			imageId: null
		} : null;
	}
	if (functions.hasGeneratedImageMetadata && cleanPathname.startsWith(`${route.servedUrl}/`)) {
		const imageSuffix = cleanPathname.slice(route.servedUrl.length + 1);
		if (!imageSuffix || imageSuffix.includes("/")) return null;
		return {
			params: Object.create(null),
			imageId: imageSuffix
		};
	}
	return cleanPathname === route.servedUrl ? {
		params: null,
		imageId: null
	} : null;
}
function findGeneratedSitemapId(entries, rawId) {
	if (!Array.isArray(entries)) return null;
	for (const entry of entries) {
		if (!isObject(entry) || Reflect.get(entry, "id") == null) throw new Error("id property is required for every item returned from generateSitemaps");
		const id = Reflect.get(entry, "id");
		if (String(id) === rawId) return rawId;
	}
	return null;
}
function makeThenableMetadataRouteId(id) {
	return Object.assign(Promise.resolve(id), {
		toString() {
			return id;
		},
		valueOf() {
			return id;
		},
		[Symbol.toPrimitive]() {
			return id;
		}
	});
}
async function handleGeneratedSitemap(route, cleanPathname, functions) {
	if (!functions.generateSitemaps || !functions.defaultExport) return null;
	const sitemapPrefix = route.servedUrl.slice(0, -4);
	if (!cleanPathname.startsWith(`${sitemapPrefix}/`) || !cleanPathname.endsWith(".xml")) return null;
	const rawId = cleanPathname.slice(sitemapPrefix.length + 1, -4);
	if (rawId.includes("/")) return null;
	const matchedId = findGeneratedSitemapId(await functions.generateSitemaps({}), rawId);
	if (!matchedId) return notFoundResponse();
	const result = await functions.defaultExport({ id: makeThenableMetadataRouteId(matchedId) });
	if (result instanceof Response) return result;
	if (!isSitemapEntries(result)) throw new TypeError("Metadata sitemap routes must return an array.");
	return new Response(sitemapToXml(result), { headers: {
		"Content-Type": route.contentType,
		"Cache-Control": "public, max-age=0, must-revalidate"
	} });
}
function findGeneratedImageId(imageMetadata, imageId, servedUrl) {
	if (!Array.isArray(imageMetadata)) return null;
	for (const item of imageMetadata) {
		if (!isObject(item) || Reflect.get(item, "id") == null) throw new Error("id property is required for every item returned from generateImageMetadata");
		const itemId = String(Reflect.get(item, "id"));
		if (!isValidMetadataImageId(itemId)) {
			console.warn(`[vinext] Skipping metadata route ${servedUrl} image id "${itemId}" because metadata image ids must match /^[a-zA-Z0-9-_.]+$/.`);
			continue;
		}
		if (itemId === imageId) return itemId;
	}
	return null;
}
async function callDynamicMetadataRoute(route, match, makeThenableParams, functions) {
	if (!functions.defaultExport) {
		console.warn(`[vinext] Dynamic metadata route ${route.servedUrl} has no default export.`);
		return notFoundResponse();
	}
	const paramsThenable = makeThenableParams(match.params ?? {});
	let result;
	if (functions.hasGeneratedImageMetadata) {
		if (match.imageId === null || !isValidMetadataImageId(match.imageId)) return notFoundResponse();
		if (!functions.generateImageMetadata) return notFoundResponse();
		const matchedImageId = findGeneratedImageId(await functions.generateImageMetadata({ params: paramsThenable }), match.imageId, route.servedUrl);
		if (!matchedImageId) return notFoundResponse();
		result = await functions.defaultExport({
			params: paramsThenable,
			id: makeThenableMetadataRouteId(matchedImageId)
		});
	} else result = await functions.defaultExport({ params: paramsThenable });
	if (result instanceof Response) return result;
	let body;
	if (route.type === "sitemap") {
		if (!isSitemapEntries(result)) throw new TypeError("Metadata sitemap routes must return an array.");
		body = sitemapToXml(result);
	} else if (route.type === "robots") {
		if (!isRobotsConfig(result)) throw new TypeError("Metadata robots routes must return an object.");
		body = robotsToText(result);
	} else if (route.type === "manifest") {
		if (!isManifestConfig(result)) throw new TypeError("Metadata manifest routes must return an object.");
		body = manifestToJson(result);
	} else if (isImageMetadataRoute(route)) throw new TypeError(`Dynamic metadata ${route.type} route ${route.servedUrl} must return a Response.`);
	else body = JSON.stringify(result);
	return new Response(body, { headers: {
		"Content-Type": route.contentType,
		"Cache-Control": "public, max-age=0, must-revalidate"
	} });
}
function serveStaticMetadataRoute(route) {
	if (typeof route.fileDataBase64 !== "string") throw new Error(`[vinext] Static metadata route ${route.servedUrl} is missing embedded file data.`);
	try {
		const binary = atob(route.fileDataBase64);
		const bytes = new Uint8Array(binary.length);
		for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
		return new Response(bytes, { headers: {
			"Content-Type": route.contentType,
			"Cache-Control": "public, max-age=0, must-revalidate"
		} });
	} catch (error) {
		const reason = error instanceof Error && error.message ? `: ${error.message}` : "";
		throw new Error(`[vinext] Failed to decode embedded metadata route file data for ${route.servedUrl}${reason}`, { cause: error });
	}
}
async function handleMetadataRouteRequest(options) {
	for (const route of options.metadataRoutes) {
		const functions = getMetadataRouteFunctions(route);
		if (route.type === "sitemap" && route.isDynamic) {
			if (functions.generateSitemaps) {
				const generatedSitemapResponse = await handleGeneratedSitemap(route, options.cleanPathname, functions);
				if (generatedSitemapResponse) return generatedSitemapResponse;
				continue;
			}
		}
		const match = matchMetadataRoute(route, options.cleanPathname, functions);
		if (!match) continue;
		return route.isDynamic ? callDynamicMetadataRoute(route, match, options.makeThenableParams, functions) : serveStaticMetadataRoute(route);
	}
	return null;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/prerender-work-unit-setup.js
/**
* Sets up the work unit async storage for prerendering.
*
* When VINEXT_PRERENDER=1, wraps execution in a workUnitAsyncStorage.run()
* with a PrerenderStore so that dynamic APIs (e.g., io()) can
* detect the prerender context and return hanging promises.
*
* Used by: app-rsc-entry.ts handler template.
*
* TODO: If future dynamic APIs need request-scoped stores for normal (non-prerender)
* requests, add a `{ type: "request" }` store during normal request handling.
*/
function runWithPrerenderWorkUnit(fn, options) {
	if (process.env.VINEXT_PRERENDER === "1") {
		const controller = new AbortController();
		const route = typeof options?.route === "function" ? options.route() : options?.route;
		return workUnitAsyncStorage.run({
			type: "prerender",
			renderSignal: controller.signal,
			route
		}, fn).finally(() => controller.abort());
	}
	return fn();
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-rsc-handler.js
function hasProperty(value, key) {
	return key in value;
}
function isExecutionContextLike(value) {
	if (!value || typeof value !== "object") return false;
	return hasProperty(value, "waitUntil") && typeof value.waitUntil === "function";
}
function redirectDestinationWithBasePath(destination, basePath) {
	if (!basePath || isExternalUrl(destination) || hasBasePath(destination, basePath)) return destination;
	return basePath + destination;
}
async function applyRewrite(options, cleanPathname) {
	if (!options.rewrites.length) return null;
	const rewritten = matchRewrite(cleanPathname, options.rewrites, options.requestContext);
	if (!rewritten) return null;
	if (isExternalUrl(rewritten)) {
		options.clearRequestContext();
		return proxyExternalRequest(options.request, rewritten);
	}
	return rewritten;
}
function applyConfigHeadersToMiddlewareRedirect(response, options) {
	if (response.status < 300 || response.status >= 400) return response;
	if (!options.configHeaders.length) return response;
	const headers = new Headers();
	applyConfigHeadersToResponse(headers, {
		configHeaders: options.configHeaders,
		pathname: options.pathname,
		requestContext: options.requestContext
	});
	if (!headers.entries().next().done) {
		mergeMiddlewareResponseHeaders(headers, response.headers);
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers
		});
	}
	return response;
}
async function handleAppRscRequest(options, request, preMiddlewareRequestContext) {
	const handlerStart = 0;
	const normalized = normalizeRscRequest(request, options.basePath);
	if (normalized instanceof Response) return normalized;
	const { url, isRscRequest, interceptionContextHeader, mountedSlotsHeader, renderMode } = normalized;
	let { pathname, cleanPathname } = normalized;
	const prerenderEndpointResponse = await handleAppPrerenderEndpoint(request, {
		isPrerenderEnabled() {
			return process.env.VINEXT_PRERENDER === "1";
		},
		loadPagesRoutes: options.loadPrerenderPagesRoutes,
		pathname,
		rootParamNamesByPattern: options.rootParamNamesByPattern,
		staticParamsMap: options.staticParamsMap
	});
	if (prerenderEndpointResponse) return prerenderEndpointResponse;
	const trailingSlashRedirect = normalizeTrailingSlash(pathname, options.basePath, options.trailingSlash, url.search);
	if (trailingSlashRedirect) return trailingSlashRedirect;
	const redirect = matchRedirect(stripRscSuffix(pathname), options.configRedirects, preMiddlewareRequestContext);
	if (redirect) {
		const destination = sanitizeDestination(redirectDestinationWithBasePath(redirect.destination, options.basePath));
		const location = isRscRequest && request.headers.get("RSC") === "1" ? await createRscRedirectLocation(destination, request) : destination;
		return new Response(null, {
			status: redirect.permanent ? 308 : 307,
			headers: { Location: location }
		});
	}
	const rscCacheBustingRedirect = await resolveInvalidRscCacheBustingRequest({
		isRscRequest,
		request
	});
	if (rscCacheBustingRedirect) return rscCacheBustingRedirect;
	const middlewareContext = {
		headers: null,
		requestHeaders: null,
		status: null
	};
	if (options.middlewareModule) {
		const middlewareResult = await applyAppMiddleware({
			basePath: options.basePath,
			cleanPathname,
			context: middlewareContext,
			i18nConfig: options.i18nConfig,
			isProxy: options.isMiddlewareProxy,
			module: options.middlewareModule,
			request
		});
		if (middlewareResult.kind === "response") return applyConfigHeadersToMiddlewareRedirect(middlewareResult.response, {
			configHeaders: options.configHeaders,
			pathname: cleanPathname,
			requestContext: preMiddlewareRequestContext
		});
		cleanPathname = middlewareResult.cleanPathname;
		if (middlewareResult.search !== null) url.search = middlewareResult.search;
	}
	const scriptNonce = getScriptNonceFromHeaderSources(request.headers, middlewareContext.headers);
	const postMiddlewareRequestContext = buildPostMwRequestContext(request);
	const beforeFilesRewrite = await applyRewrite({
		clearRequestContext: options.clearRequestContext,
		request,
		requestContext: postMiddlewareRequestContext,
		rewrites: options.configRewrites.beforeFiles
	}, cleanPathname);
	if (beforeFilesRewrite instanceof Response) return beforeFilesRewrite;
	if (beforeFilesRewrite) cleanPathname = beforeFilesRewrite;
	if (cleanPathname === "/_vinext/image") {
		const imageUrlResult = validateImageUrl(url.searchParams.get("url"), request.url);
		if (imageUrlResult instanceof Response) return imageUrlResult;
		return Response.redirect(new URL(imageUrlResult, url.origin).href, 302);
	}
	const metadataRouteResponse = await handleMetadataRouteRequest({
		metadataRoutes: options.metadataRoutes,
		cleanPathname,
		makeThenableParams: options.makeThenableParams
	});
	if (metadataRouteResponse) return metadataRouteResponse;
	const publicFileResponse = resolvePublicFileRoute({
		cleanPathname,
		middlewareContext,
		pathname,
		publicFiles: options.publicFiles,
		request
	});
	if (publicFileResponse) {
		options.clearRequestContext();
		return publicFileResponse;
	}
	if (isRscRequest) stripRscCacheBustingSearchParam(url);
	options.setNavigationContext({
		pathname: cleanPathname,
		searchParams: url.searchParams,
		params: {}
	});
	const actionId = request.headers.get("x-rsc-action") ?? request.headers.get("next-action");
	const contentType = request.headers.get("content-type") || "";
	const progressiveActionResult = await options.handleProgressiveActionRequest({
		actionId,
		cleanPathname,
		contentType,
		middlewareContext,
		request
	});
	if (progressiveActionResult instanceof Response) return progressiveActionResult;
	const isProgressiveActionRender = progressiveActionResult?.kind === "form-state";
	const formState = isProgressiveActionRender ? progressiveActionResult.formState : null;
	const serverActionResponse = await options.handleServerActionRequest({
		actionId,
		cleanPathname,
		contentType,
		interceptionContext: interceptionContextHeader,
		isRscRequest,
		middlewareContext,
		mountedSlotsHeader,
		request,
		searchParams: url.searchParams
	});
	if (serverActionResponse) return serverActionResponse;
	let match = options.matchRoute(cleanPathname);
	if (!match || match.route.isDynamic) {
		const afterFilesRewrite = await applyRewrite({
			clearRequestContext: options.clearRequestContext,
			request,
			requestContext: postMiddlewareRequestContext,
			rewrites: options.configRewrites.afterFiles
		}, cleanPathname);
		if (afterFilesRewrite instanceof Response) return afterFilesRewrite;
		if (afterFilesRewrite) {
			cleanPathname = afterFilesRewrite;
			match = options.matchRoute(cleanPathname);
		}
	}
	if (!match) {
		const fallbackRewrite = await applyRewrite({
			clearRequestContext: options.clearRequestContext,
			request,
			requestContext: postMiddlewareRequestContext,
			rewrites: options.configRewrites.fallback
		}, cleanPathname);
		if (fallbackRewrite instanceof Response) return fallbackRewrite;
		if (fallbackRewrite) {
			cleanPathname = fallbackRewrite;
			match = options.matchRoute(cleanPathname);
		}
	}
	if (!match) {
		const pagesFallbackResponse = await options.renderPagesFallback?.({
			isRscRequest,
			middlewareContext,
			request,
			url
		});
		if (pagesFallbackResponse) {
			options.clearRequestContext();
			return pagesFallbackResponse;
		}
		const renderedNotFoundResponse = await options.renderNotFound({
			isRscRequest,
			middlewareContext,
			request,
			route: null,
			scriptNonce
		});
		if (renderedNotFoundResponse) return renderedNotFoundResponse;
		options.clearRequestContext();
		const headers = new Headers();
		mergeMiddlewareResponseHeaders(headers, middlewareContext.headers);
		return notFoundResponse({ headers });
	}
	const { route, params } = match;
	options.setNavigationContext({
		pathname: cleanPathname,
		searchParams: url.searchParams,
		params
	});
	setRootParams(pickRootParams(params, route.rootParamNames));
	if (route.routeHandler) {
		setCurrentFetchSoftTags(buildPageCacheTags(cleanPathname, [], [...route.routeSegments], "route"));
		return options.dispatchMatchedRouteHandler({
			cleanPathname,
			middlewareContext,
			params,
			request,
			route,
			searchParams: url.searchParams
		});
	}
	return options.dispatchMatchedPage({
		cleanPathname,
		formState,
		handlerStart,
		interceptionContext: interceptionContextHeader,
		isProgressiveActionRender,
		isRscRequest,
		middlewareContext,
		mountedSlotsHeader,
		params,
		request,
		route,
		scriptNonce,
		searchParams: url.searchParams,
		renderMode
	});
}
function createAppRscHandler(options) {
	return async function appRscHandler(rawRequest, ctx) {
		await options.ensureInstrumentation?.();
		const mwCtx = rawRequest.headers.get(VINEXT_MW_CTX_HEADER);
		const filteredHeaders = filterInternalHeaders(rawRequest.headers);
		if (mwCtx !== null) filteredHeaders.set(VINEXT_MW_CTX_HEADER, mwCtx);
		const request = cloneRequestWithHeaders(rawRequest, filteredHeaders);
		const executionContext = isExecutionContextLike(ctx) ? ctx : getRequestExecutionContext() ?? null;
		return runWithRequestContext(createRequestContext({
			headersContext: headersContextFromRequest(request),
			executionContext,
			unstableCacheRevalidation: "background"
		}), () => runWithPrerenderWorkUnit(async () => {
			ensureFetchPatch();
			const preMiddlewareRequestContext = requestContextFromRequest(request);
			let response;
			try {
				response = await handleAppRscRequest(options, request, preMiddlewareRequestContext);
			} catch (error) {
				throw error;
			}
			return finalizeAppRscResponse(response, request, {
				basePath: options.basePath,
				configHeaders: options.configHeaders,
				requestContext: preMiddlewareRequestContext
			});
		}, { route: () => new URL(request.url).pathname }));
	};
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/instrumentation.js
/**
* Get the registered onRequestError handler (if any).
*
* Reads from globalThis so it works across Vite environment boundaries.
*/
function getOnRequestErrorHandler() {
	return globalThis.__VINEXT_onRequestErrorHandler__ ?? null;
}
/**
* Report a request error via the instrumentation handler.
*
* No-op if no onRequestError handler is registered.
*
* Reads the handler from globalThis so this function works correctly regardless
* of which environment it is called from.
*/
function reportRequestError(error, request, context) {
	const handler = getOnRequestErrorHandler();
	if (!handler) return Promise.resolve();
	const promise = (async () => {
		try {
			await handler(error, request, context);
		} catch (reportErr) {
			console.error("[vinext] onRequestError handler threw:", reportErr instanceof Error ? reportErr.message : String(reportErr));
		}
	})();
	getRequestExecutionContext()?.waitUntil(promise);
	return promise;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-route-handler-runtime.js
var ROUTE_HANDLER_HTTP_METHODS = [
	"GET",
	"HEAD",
	"POST",
	"PUT",
	"DELETE",
	"PATCH",
	"OPTIONS"
];
/**
* Checks whether a string is a recognized HTTP method for App Router route
* handlers. Invalid methods must be rejected with 400 before any auto-OPTIONS
* or 405 logic runs.
*
* @see https://github.com/vercel/next.js/blob/canary/packages/next/src/server/web/http.ts
*/
function isValidHTTPMethod(maybeMethod) {
	return ROUTE_HANDLER_HTTP_METHODS.includes(maybeMethod);
}
function collectRouteHandlerMethods(handler) {
	const methods = ROUTE_HANDLER_HTTP_METHODS.filter((method) => typeof handler[method] === "function");
	if (methods.includes("GET") && !methods.includes("HEAD")) methods.push("HEAD");
	return methods;
}
function buildRouteHandlerAllowHeader(exportedMethods) {
	const allow = new Set(exportedMethods);
	allow.add("OPTIONS");
	return Array.from(allow).sort().join(", ");
}
var _KNOWN_DYNAMIC_APP_ROUTE_HANDLERS_KEY = Symbol.for("vinext.appRouteHandlerRuntime.knownDynamicHandlers");
var _g$2 = globalThis;
var knownDynamicAppRouteHandlers = _g$2[_KNOWN_DYNAMIC_APP_ROUTE_HANDLERS_KEY] ??= /* @__PURE__ */ new Set();
function isKnownDynamicAppRoute(pattern) {
	return knownDynamicAppRouteHandlers.has(pattern);
}
function markKnownDynamicAppRoute(pattern) {
	knownDynamicAppRouteHandlers.add(pattern);
}
function bindMethodIfNeeded(value, target) {
	return typeof value === "function" ? value.bind(target) : value;
}
function buildNextConfig(options) {
	if (!options.basePath && !options.i18n) return null;
	return {
		basePath: options.basePath,
		i18n: options.i18n ?? void 0
	};
}
function rebuildRequestWithHeaders(input, headers) {
	const method = input.method;
	const hasBody = method !== "GET" && method !== "HEAD";
	const init = {
		method,
		headers,
		cache: input.cache,
		credentials: input.credentials,
		integrity: input.integrity,
		keepalive: input.keepalive,
		mode: input.mode,
		redirect: input.redirect,
		referrer: input.referrer,
		referrerPolicy: input.referrerPolicy,
		signal: input.signal
	};
	if (hasBody && input.body) {
		init.body = input.body;
		init.duplex = "half";
	}
	return new Request(input.url, init);
}
function cleanStaticUrl(url) {
	const cleanUrl = new URL(url);
	cleanUrl.protocol = "http:";
	cleanUrl.host = "localhost:3000";
	cleanUrl.username = "";
	cleanUrl.password = "";
	cleanUrl.search = "";
	cleanUrl.hash = "";
	return cleanUrl.href;
}
function readEmptyBodyAsArrayBuffer() {
	return new Response(null).arrayBuffer();
}
function readEmptyBodyAsBlob() {
	return new Response(null).blob();
}
function readEmptyBodyAsFormData() {
	return new Response(null).formData();
}
function readEmptyBodyAsJson() {
	return new Response(null).json();
}
function readEmptyBodyAsText() {
	return new Response(null).text();
}
function createTrackedAppRouteRequest(request, options = {}) {
	let didAccessDynamicRequest = false;
	const requestMode = options.requestMode ?? "auto";
	const nextConfig = buildNextConfig(options);
	const markDynamicAccess = (access) => {
		didAccessDynamicRequest = true;
		options.onDynamicAccess?.(access);
	};
	const wrapNextUrl = (nextUrl) => {
		return new Proxy(nextUrl, { get(target, prop) {
			switch (prop) {
				case "search":
				case "searchParams":
				case "url":
				case "href":
				case "toJSON":
				case "toString":
				case "origin":
					markDynamicAccess(`nextUrl.${String(prop)}`);
					return bindMethodIfNeeded(Reflect.get(target, prop, target), target);
				case "clone": return () => wrapNextUrl(target.clone());
				default: return bindMethodIfNeeded(Reflect.get(target, prop, target), target);
			}
		} });
	};
	const wrapForceStaticNextUrl = (nextUrl) => {
		const emptySearchParams = new URLSearchParams();
		const staticHref = cleanStaticUrl(nextUrl.href);
		return new Proxy(nextUrl, { get(target, prop) {
			switch (prop) {
				case "search": return "";
				case "searchParams": return emptySearchParams;
				case "href": return staticHref;
				case "url": return;
				case "toJSON":
				case "toString": return () => staticHref;
				case "clone": return () => wrapForceStaticNextUrl(target.clone());
				default: return bindMethodIfNeeded(Reflect.get(target, prop, target), target);
			}
		} });
	};
	const throwStaticGenerationError = (expression) => {
		throw new Error(options.staticGenerationErrorMessage?.(expression) ?? `Route handler with \`dynamic = "error"\` used ${expression}.`);
	};
	const wrapRequireStaticNextUrl = (nextUrl) => {
		return new Proxy(nextUrl, { get(target, prop) {
			switch (prop) {
				case "search":
				case "searchParams":
				case "url":
				case "href":
				case "toJSON":
				case "toString":
				case "origin": return throwStaticGenerationError(`nextUrl.${String(prop)}`);
				case "clone": return () => wrapRequireStaticNextUrl(target.clone());
				default: return bindMethodIfNeeded(Reflect.get(target, prop, target), target);
			}
		} });
	};
	const wrapRequest = (input) => {
		const requestHeaders = options.middlewareHeaders ? buildRequestHeadersFromMiddlewareResponse(input.headers, options.middlewareHeaders) : null;
		const requestWithOverrides = requestHeaders ? rebuildRequestWithHeaders(input, requestHeaders) : input;
		const nextRequest = requestWithOverrides instanceof NextRequest ? requestWithOverrides : new NextRequest(requestWithOverrides, { nextConfig: nextConfig ?? void 0 });
		let proxiedNextUrl = null;
		let forceStaticNextUrl = null;
		let requireStaticNextUrl = null;
		let forceStaticHeaders = null;
		let forceStaticCookies = null;
		return new Proxy(nextRequest, { get(target, prop) {
			if (requestMode === "force-static") switch (prop) {
				case "nextUrl":
					forceStaticNextUrl ??= wrapForceStaticNextUrl(target.nextUrl);
					return forceStaticNextUrl;
				case "headers":
					forceStaticHeaders ??= sealRequestHeaders(new Headers());
					return forceStaticHeaders;
				case "cookies":
					forceStaticCookies ??= sealRequestCookies(new RequestCookies(new Headers()));
					return forceStaticCookies;
				case "url": return cleanStaticUrl(target.nextUrl.href);
				case "ip":
				case "geo": return;
				case "body": return null;
				case "arrayBuffer": return readEmptyBodyAsArrayBuffer;
				case "blob": return readEmptyBodyAsBlob;
				case "formData": return readEmptyBodyAsFormData;
				case "json": return readEmptyBodyAsJson;
				case "text": return readEmptyBodyAsText;
				case "clone": return () => wrapRequest(target.clone());
				default: return bindMethodIfNeeded(Reflect.get(target, prop, target), target);
			}
			if (requestMode === "error") switch (prop) {
				case "nextUrl":
					requireStaticNextUrl ??= wrapRequireStaticNextUrl(target.nextUrl);
					return requireStaticNextUrl;
				case "headers":
				case "cookies":
				case "url":
				case "ip":
				case "geo":
				case "body":
				case "blob":
				case "json":
				case "text":
				case "arrayBuffer":
				case "formData": return throwStaticGenerationError(`request.${String(prop)}`);
				case "clone": return () => wrapRequest(target.clone());
				default: return bindMethodIfNeeded(Reflect.get(target, prop, target), target);
			}
			switch (prop) {
				case "nextUrl":
					proxiedNextUrl ??= wrapNextUrl(target.nextUrl);
					return proxiedNextUrl;
				case "headers":
				case "cookies":
				case "ip":
				case "geo":
				case "url":
				case "body":
				case "blob":
				case "json":
				case "text":
				case "arrayBuffer":
				case "formData":
					markDynamicAccess(`request.${String(prop)}`);
					return bindMethodIfNeeded(Reflect.get(target, prop, target), target);
				case "clone": return () => wrapRequest(target.clone());
				default: return bindMethodIfNeeded(Reflect.get(target, prop, target), target);
			}
		} });
	};
	return {
		request: wrapRequest(request),
		didAccessDynamicRequest() {
			return didAccessDynamicRequest;
		}
	};
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/next-error-digest.js
/**
* Pulls a stringified `digest` off an unknown thrown value, or returns null
* when the value is not a digest-bearing error.
*/
function getNextErrorDigest(error) {
	if (!error || typeof error !== "object" || !("digest" in error)) return null;
	return String(error.digest);
}
/**
* Parses a `NEXT_REDIRECT;<type>;<encodedUrl>;<status>` digest. Returns null
* when the digest is not a redirect digest or the encoded URL segment is
* missing. The `url` is decoded with `decodeURIComponent`; the `status`
* defaults to 307 when omitted; an omitted `type` is left as null so the
* caller can apply the correct context-sensitive default.
*/
function parseNextRedirectDigest(digest) {
	if (!digest.startsWith("NEXT_REDIRECT;")) return null;
	const parts = digest.split(";");
	const encodedUrl = parts[2];
	if (!encodedUrl) return null;
	const type = parts[1];
	return {
		status: parts[3] ? parseInt(parts[3], 10) : 307,
		type: type || null,
		url: decodeURIComponent(encodedUrl)
	};
}
/**
* Parses a `NEXT_NOT_FOUND` or `NEXT_HTTP_ERROR_FALLBACK;<status>` digest.
* Returns `{ status: 404 }` for `NEXT_NOT_FOUND` and the parsed status code
* for the fallback form. Returns null otherwise.
*/
function parseNextHttpErrorDigest(digest) {
	if (digest === "NEXT_NOT_FOUND") return { status: 404 };
	if (digest.startsWith("NEXT_HTTP_ERROR_FALLBACK;")) return { status: parseInt(digest.split(";")[1], 10) };
	return null;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-route-handler-policy.js
function isPossibleAppRouteActionRequest(request) {
	if (request.method.toUpperCase() !== "POST") return false;
	const contentType = request.headers.get("content-type");
	return request.headers.has("x-rsc-action") || request.headers.has("next-action") || contentType === "application/x-www-form-urlencoded" || contentType?.startsWith("multipart/form-data") === true;
}
function getAppRouteHandlerRevalidateSeconds(handler) {
	const { revalidate } = handler;
	if (revalidate === false) return Infinity;
	if (typeof revalidate !== "number" || !Number.isFinite(revalidate) || revalidate < 0) return null;
	return revalidate;
}
function hasAppRouteHandlerDefaultExport(handler) {
	return typeof handler.default === "function";
}
function resolveAppRouteHandlerMethod(handler, method) {
	const exportedMethods = collectRouteHandlerMethods(handler);
	const allowHeaderForOptions = buildRouteHandlerAllowHeader(exportedMethods);
	const shouldAutoRespondToOptions = method === "OPTIONS" && typeof handler.OPTIONS !== "function";
	let handlerFn = typeof handler[method] === "function" ? handler[method] : void 0;
	let isAutoHead = false;
	if (method === "HEAD" && typeof handler.HEAD !== "function" && typeof handler.GET === "function") {
		handlerFn = handler.GET;
		isAutoHead = true;
	}
	return {
		allowHeaderForOptions,
		exportedMethods,
		handlerFn,
		isAutoHead,
		shouldAutoRespondToOptions
	};
}
function shouldReadAppRouteHandlerCache(options) {
	return options.isProduction && options.revalidateSeconds !== null && options.revalidateSeconds > 0 && options.revalidateSeconds !== Infinity && options.dynamicConfig !== "force-dynamic" && !options.isKnownDynamic && (options.method === "GET" || options.isAutoHead) && typeof options.handlerFn === "function";
}
function shouldApplyAppRouteHandlerRevalidateHeader(options) {
	return options.revalidateSeconds !== null && !options.dynamicUsedInHandler && (options.method === "GET" || options.isAutoHead) && !options.handlerSetCacheControl;
}
function shouldWriteAppRouteHandlerCache(options) {
	return options.isProduction && options.revalidateSeconds !== null && options.revalidateSeconds > 0 && options.revalidateSeconds !== Infinity && options.dynamicConfig !== "force-dynamic" && shouldApplyAppRouteHandlerRevalidateHeader(options);
}
function resolveAppRouteHandlerSpecialError(error, requestUrl, options) {
	if (!(error && typeof error === "object" && "digest" in error)) return null;
	const digest = String(error.digest);
	const redirect = parseNextRedirectDigest(digest);
	if (redirect) return {
		kind: "redirect",
		location: new URL(redirect.url, requestUrl).toString(),
		statusCode: options?.isAction ? 303 : redirect.status
	};
	const httpError = parseNextHttpErrorDigest(digest);
	if (httpError) return {
		kind: "status",
		statusCode: httpError.status
	};
	return null;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-static-generation.js
function getAppPageStaticGenerationErrorMessage() {
	return "Page with `dynamic = \"error\"` used a dynamic API. This page was expected to be fully static, but headers(), cookies(), or searchParams was accessed. Remove the dynamic API usage or change the dynamic config to \"auto\" or \"force-dynamic\".";
}
function getAppRouteStaticGenerationErrorMessage(routePattern, expression) {
	return `Route ${routePattern ?? "unknown route"} with \`dynamic = "error"\` couldn't be rendered statically because it used ${expression ?? "a dynamic request API"}. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`;
}
function createStaticGenerationHeadersContext(options) {
	const context = {
		headers: new Headers(),
		cookies: /* @__PURE__ */ new Map()
	};
	if (options.dynamicConfig === "force-static") context.forceStatic = true;
	if (options.dynamicConfig === "error") context.accessError = new Error(options.routeKind === "route" ? getAppRouteStaticGenerationErrorMessage(options.routePattern) : getAppPageStaticGenerationErrorMessage());
	return context;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-route-handler-response.js
var APP_ROUTE_REWRITE_ERROR = "NextResponse.rewrite() was used in a app route handler, this is not currently supported. Please remove the invocation to continue.";
var APP_ROUTE_NEXT_ERROR = "NextResponse.next() was used in a app route handler, this is not supported. See here for more info: https://nextjs.org/docs/messages/next-response-next-in-app-route-handler";
function hasMiddlewareHeader(headers) {
	for (const key of headers.keys()) if (key.startsWith("x-middleware-")) return true;
	return false;
}
function buildRouteHandlerCacheControl(cacheState, revalidateSeconds, expireSeconds) {
	if (revalidateSeconds === 0) return NEVER_CACHE_CONTROL;
	if (revalidateSeconds === Infinity) return STATIC_CACHE_CONTROL;
	return buildCachedRevalidateCacheControl(cacheState, revalidateSeconds, expireSeconds);
}
function applyRouteHandlerMiddlewareContext(response, middlewareContext) {
	if (!middlewareContext.headers && middlewareContext.status == null) return response;
	const responseHeaders = new Headers(response.headers);
	mergeMiddlewareResponseHeaders(responseHeaders, middlewareContext.headers);
	return new Response(response.body, {
		status: middlewareContext.status ?? response.status,
		statusText: response.statusText,
		headers: responseHeaders
	});
}
function assertSupportedAppRouteHandlerResponse(response) {
	if (response.headers.has("x-middleware-rewrite")) throw new Error(APP_ROUTE_REWRITE_ERROR);
	if (response.headers.get("x-middleware-next") === "1") throw new Error(APP_ROUTE_NEXT_ERROR);
}
function buildRouteHandlerCachedResponse(cachedValue, options) {
	const headers = new Headers();
	for (const [key, value] of Object.entries(cachedValue.headers)) if (Array.isArray(value)) for (const entry of value) headers.append(key, entry);
	else headers.set(key, value);
	headers.set(VINEXT_CACHE_HEADER, options.cacheState);
	const revalidateSeconds = options.cacheControl?.revalidate ?? options.revalidateSeconds;
	const expireSeconds = options.cacheControl === void 0 ? void 0 : options.cacheControl.expire ?? options.expireSeconds;
	headers.set("Cache-Control", buildRouteHandlerCacheControl(options.cacheState, revalidateSeconds, expireSeconds));
	return new Response(options.isHead ? null : cachedValue.body, {
		status: cachedValue.status,
		headers
	});
}
function applyRouteHandlerRevalidateHeader(response, revalidateSeconds, expireSeconds) {
	response.headers.set("cache-control", buildRouteHandlerCacheControl("HIT", revalidateSeconds, expireSeconds));
}
function markRouteHandlerCacheMiss(response) {
	response.headers.set(VINEXT_CACHE_HEADER, "MISS");
}
function getSetCookieName(cookie) {
	const equalsIndex = cookie.indexOf("=");
	if (equalsIndex <= 0) return null;
	return cookie.slice(0, equalsIndex);
}
function applyMutableCookieFallbacks(headers, pendingCookies) {
	if (pendingCookies.length === 0) return;
	const returnedCookies = headers.getSetCookie();
	const returnedCookieNames = /* @__PURE__ */ new Set();
	for (const cookie of returnedCookies) {
		const name = getSetCookieName(cookie);
		if (name) returnedCookieNames.add(name);
	}
	const fallbackCookies = /* @__PURE__ */ new Map();
	const unkeyedFallbackCookies = [];
	for (const cookie of pendingCookies) {
		const name = getSetCookieName(cookie);
		if (!name) {
			unkeyedFallbackCookies.push(cookie);
			continue;
		}
		if (!returnedCookieNames.has(name)) fallbackCookies.set(name, cookie);
	}
	headers.delete("Set-Cookie");
	for (const cookie of unkeyedFallbackCookies) headers.append("Set-Cookie", cookie);
	for (const cookie of fallbackCookies.values()) headers.append("Set-Cookie", cookie);
	for (const cookie of returnedCookies) headers.append("Set-Cookie", cookie);
}
async function buildAppRouteCacheValue(response) {
	const body = await response.arrayBuffer();
	const headers = {};
	response.headers.forEach((value, key) => {
		if (key === "set-cookie" || key === "X-Vinext-Cache".toLowerCase() || key === "cache-control" || key.startsWith("x-middleware-")) return;
		headers[key] = value;
	});
	const setCookies = response.headers.getSetCookie?.() ?? [];
	if (setCookies.length > 0) headers["set-cookie"] = setCookies;
	return {
		kind: "APP_ROUTE",
		body,
		status: response.status,
		headers
	};
}
function finalizeRouteHandlerResponse(response, options) {
	const { pendingCookies, draftCookie, isHead } = options;
	if (pendingCookies.length === 0 && !draftCookie && !isHead && !hasMiddlewareHeader(response.headers)) return response;
	const headers = new Headers(response.headers);
	processMiddlewareHeaders(headers);
	applyMutableCookieFallbacks(headers, pendingCookies);
	if (draftCookie) headers.append("Set-Cookie", draftCookie);
	return new Response(isHead ? null : response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-route-handler-execution.js
function configureAppRouteStaticGenerationContext(options) {
	if (options.dynamicConfig === "force-static" || options.dynamicConfig === "error") {
		setHeadersContext(createStaticGenerationHeadersContext({
			dynamicConfig: options.dynamicConfig,
			routeKind: "route",
			routePattern: options.routePattern
		}));
		options.setHeadersAccessPhase?.("route-handler");
	}
}
async function runAppRouteHandler(options) {
	options.consumeDynamicUsage();
	configureAppRouteStaticGenerationContext(options);
	const trackedRequest = createTrackedAppRouteRequest(options.request, {
		basePath: options.basePath,
		i18n: options.i18n,
		middlewareHeaders: options.middlewareRequestHeaders,
		onDynamicAccess() {
			options.markDynamicUsage();
		},
		requestMode: options.dynamicConfig === "force-static" || options.dynamicConfig === "error" ? options.dynamicConfig : "auto",
		staticGenerationErrorMessage(expression) {
			return getAppRouteStaticGenerationErrorMessage(options.routePattern, expression);
		}
	});
	const response = await options.handlerFn(trackedRequest.request, { params: options.params });
	return {
		dynamicUsedInHandler: options.consumeDynamicUsage(),
		response
	};
}
async function executeAppRouteHandler(options) {
	const previousHeadersPhase = options.setHeadersAccessPhase("route-handler");
	try {
		const { dynamicUsedInHandler, response } = await runAppRouteHandler({
			...options,
			dynamicConfig: options.handler.dynamic
		});
		assertSupportedAppRouteHandlerResponse(response);
		const handlerSetCacheControl = response.headers.has("cache-control");
		if (dynamicUsedInHandler) markKnownDynamicAppRoute(options.routePattern);
		if (shouldApplyAppRouteHandlerRevalidateHeader({
			dynamicUsedInHandler,
			handlerSetCacheControl,
			isAutoHead: options.isAutoHead,
			method: options.method,
			revalidateSeconds: options.revalidateSeconds
		})) {
			const revalidateSeconds = options.revalidateSeconds;
			if (revalidateSeconds == null) throw new Error("Expected route handler revalidate seconds");
			applyRouteHandlerRevalidateHeader(response, revalidateSeconds, options.expireSeconds);
		}
		if (shouldWriteAppRouteHandlerCache({
			dynamicConfig: options.handler.dynamic,
			dynamicUsedInHandler,
			handlerSetCacheControl,
			isAutoHead: options.isAutoHead,
			isProduction: options.isProduction,
			method: options.method,
			revalidateSeconds: options.revalidateSeconds
		})) {
			markRouteHandlerCacheMiss(response);
			const routeClone = response.clone();
			const routeKey = options.isrRouteKey(options.cleanPathname);
			const revalidateSeconds = options.revalidateSeconds;
			if (revalidateSeconds == null) throw new Error("Expected route handler cache revalidate seconds");
			const routeTags = options.buildPageCacheTags(options.cleanPathname, options.getCollectedFetchTags());
			const routeWritePromise = (async () => {
				try {
					const routeCacheValue = await buildAppRouteCacheValue(routeClone);
					await options.isrSet(routeKey, routeCacheValue, revalidateSeconds, routeTags, options.expireSeconds);
					options.isrDebug?.("route cache written", routeKey);
				} catch (cacheErr) {
					console.error("[vinext] ISR route cache write error:", cacheErr);
				}
			})();
			options.executionContext?.waitUntil(routeWritePromise);
		}
		const pendingCookies = options.getAndClearPendingCookies();
		const draftCookie = options.getDraftModeCookieHeader();
		options.clearRequestContext();
		return applyRouteHandlerMiddlewareContext(finalizeRouteHandlerResponse(response, {
			pendingCookies,
			draftCookie,
			isHead: options.isAutoHead
		}), options.middlewareContext);
	} catch (error) {
		const pendingCookies = options.getAndClearPendingCookies();
		const draftCookie = options.getDraftModeCookieHeader();
		const specialError = resolveAppRouteHandlerSpecialError(error, options.request.url, { isAction: isPossibleAppRouteActionRequest(options.request) });
		options.clearRequestContext();
		if (specialError) {
			if (specialError.kind === "redirect") return applyRouteHandlerMiddlewareContext(finalizeRouteHandlerResponse(new Response(null, {
				status: specialError.statusCode,
				headers: { Location: specialError.location }
			}), {
				pendingCookies,
				draftCookie,
				isHead: options.isAutoHead
			}), options.middlewareContext);
			return applyRouteHandlerMiddlewareContext(new Response(null, { status: specialError.statusCode }), options.middlewareContext);
		}
		console.error("[vinext] Route handler error:", error);
		options.reportRequestError(error instanceof Error ? error : new Error(String(error)), {
			path: options.cleanPathname,
			method: options.request.method,
			headers: Object.fromEntries(options.request.headers.entries())
		}, {
			routerKind: "App Router",
			routePath: options.routePattern,
			routeType: "route"
		});
		return applyRouteHandlerMiddlewareContext(new Response(null, { status: 500 }), options.middlewareContext);
	} finally {
		options.setHeadersAccessPhase(previousHeadersPhase);
	}
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-route-handler-cache.js
function getCachedAppRouteValue(entry) {
	return entry?.value.value && entry.value.value.kind === "APP_ROUTE" ? entry.value.value : null;
}
async function readAppRouteHandlerCacheResponse(options) {
	const routeKey = options.isrRouteKey(options.cleanPathname);
	try {
		const cached = await options.isrGet(routeKey);
		const cachedValue = getCachedAppRouteValue(cached);
		if (cachedValue && !cached?.isStale) {
			options.isrDebug?.("HIT (route)", options.cleanPathname);
			options.clearRequestContext();
			return applyRouteHandlerMiddlewareContext(buildRouteHandlerCachedResponse(cachedValue, {
				cacheState: "HIT",
				cacheControl: cached?.value.cacheControl,
				expireSeconds: options.expireSeconds,
				isHead: options.isAutoHead,
				revalidateSeconds: options.revalidateSeconds
			}), options.middlewareContext);
		}
		if (cached?.isStale && cachedValue) {
			const staleValue = cachedValue;
			const revalidateSearchParams = new URLSearchParams(options.revalidateSearchParams);
			options.scheduleBackgroundRegeneration(routeKey, async () => {
				await options.runInRevalidationContext(async () => {
					options.setNavigationContext({
						pathname: options.cleanPathname,
						searchParams: revalidateSearchParams,
						params: options.params
					});
					const { dynamicUsedInHandler, response } = await runAppRouteHandler({
						basePath: options.basePath,
						consumeDynamicUsage: options.consumeDynamicUsage,
						dynamicConfig: options.dynamicConfig,
						handlerFn: options.handlerFn,
						i18n: options.i18n,
						markDynamicUsage: options.markDynamicUsage,
						params: makeThenableParams(options.params),
						request: new Request(options.requestUrl, { method: "GET" }),
						routePattern: options.routePattern,
						setHeadersAccessPhase: options.setHeadersAccessPhase
					});
					options.setNavigationContext(null);
					assertSupportedAppRouteHandlerResponse(response);
					if (dynamicUsedInHandler) {
						markKnownDynamicAppRoute(options.routePattern);
						options.isrDebug?.("route regen skipped (dynamic usage)", options.cleanPathname);
						return;
					}
					const routeTags = options.buildPageCacheTags(options.cleanPathname, options.getCollectedFetchTags());
					const routeCacheValue = await buildAppRouteCacheValue(response);
					await options.isrSet(routeKey, routeCacheValue, options.revalidateSeconds, routeTags, options.expireSeconds);
					options.isrDebug?.("route regen complete", routeKey);
				});
			});
			options.isrDebug?.("STALE (route)", options.cleanPathname);
			options.clearRequestContext();
			return applyRouteHandlerMiddlewareContext(buildRouteHandlerCachedResponse(staleValue, {
				cacheState: "STALE",
				cacheControl: cached.value.cacheControl,
				expireSeconds: options.expireSeconds,
				isHead: options.isAutoHead,
				revalidateSeconds: options.revalidateSeconds
			}), options.middlewareContext);
		}
	} catch (routeCacheError) {
		console.error("[vinext] ISR route cache read error:", routeCacheError);
	}
	return null;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-route-handler-dispatch.js
function isAppRouteHandlerFunction(value) {
	return typeof value === "function";
}
function buildRouteHandlerPageCacheTags(pathname, extraTags, routeSegments) {
	return buildPageCacheTags(pathname, extraTags, routeSegments, "route");
}
async function runInRouteHandlerRevalidationContext(options, renderFn) {
	await runWithRequestContext(createRequestContext({
		headersContext: createStaticGenerationHeadersContext({
			dynamicConfig: options.dynamicConfig,
			routeKind: "route",
			routePattern: options.routePattern
		}),
		executionContext: getRequestExecutionContext(),
		unstableCacheRevalidation: "foreground"
	}), async () => {
		ensureFetchPatch();
		setCurrentFetchSoftTags(buildRouteHandlerPageCacheTags(options.cleanPathname, [], options.routeSegments));
		await renderFn();
	});
}
async function dispatchAppRouteHandler(options) {
	const { route } = options;
	const handler = route.routeHandler;
	const method = options.request.method.toUpperCase();
	const revalidateSeconds = getAppRouteHandlerRevalidateSeconds(handler);
	const isDevelopment = options.isDevelopment ?? false;
	const isProduction = options.isProduction ?? true;
	if (hasAppRouteHandlerDefaultExport(handler) && isDevelopment) console.error("[vinext] Detected default export in route handler " + route.pattern + ". Export a named export for each HTTP method instead.");
	if (!isValidHTTPMethod(method)) {
		options.clearRequestContext();
		return applyRouteHandlerMiddlewareContext(new Response(null, { status: 400 }), options.middlewareContext);
	}
	const { allowHeaderForOptions, handlerFn, isAutoHead, shouldAutoRespondToOptions } = resolveAppRouteHandlerMethod(handler, method);
	if (shouldAutoRespondToOptions) {
		options.clearRequestContext();
		return applyRouteHandlerMiddlewareContext(new Response(null, {
			status: 204,
			headers: { Allow: allowHeaderForOptions }
		}), options.middlewareContext);
	}
	const resolvedHandlerFn = isAppRouteHandlerFunction(handlerFn) ? handlerFn : void 0;
	if (revalidateSeconds !== null && shouldReadAppRouteHandlerCache({
		dynamicConfig: handler.dynamic,
		handlerFn: resolvedHandlerFn,
		isAutoHead,
		isKnownDynamic: isKnownDynamicAppRoute(route.pattern),
		isProduction,
		method,
		revalidateSeconds
	}) && resolvedHandlerFn) {
		const cachedRouteResponse = await readAppRouteHandlerCacheResponse({
			basePath: options.basePath,
			buildPageCacheTags(pathname, extraTags) {
				return buildRouteHandlerPageCacheTags(pathname, extraTags, route.routeSegments);
			},
			cleanPathname: options.cleanPathname,
			clearRequestContext: options.clearRequestContext,
			consumeDynamicUsage,
			dynamicConfig: handler.dynamic,
			getCollectedFetchTags,
			handlerFn: resolvedHandlerFn,
			i18n: options.i18n,
			isAutoHead,
			isrDebug: options.isrDebug,
			isrGet: options.isrGet,
			isrRouteKey: options.isrRouteKey,
			isrSet: options.isrSet,
			markDynamicUsage,
			middlewareContext: options.middlewareContext,
			params: options.params,
			requestUrl: options.request.url,
			revalidateSearchParams: options.searchParams,
			expireSeconds: options.expireSeconds,
			revalidateSeconds,
			routePattern: route.pattern,
			runInRevalidationContext(renderFn) {
				return runInRouteHandlerRevalidationContext({
					cleanPathname: options.cleanPathname,
					dynamicConfig: handler.dynamic,
					routePattern: route.pattern,
					routeSegments: route.routeSegments
				}, renderFn);
			},
			scheduleBackgroundRegeneration(key, renderFn) {
				options.scheduleBackgroundRegeneration(key, renderFn, {
					routerKind: "App Router",
					routePath: route.pattern,
					routeType: "route"
				});
			},
			setHeadersAccessPhase,
			setNavigationContext
		});
		if (cachedRouteResponse) return cachedRouteResponse;
	}
	if (resolvedHandlerFn) return executeAppRouteHandler({
		basePath: options.basePath,
		buildPageCacheTags(pathname, extraTags) {
			return buildRouteHandlerPageCacheTags(pathname, extraTags, route.routeSegments);
		},
		cleanPathname: options.cleanPathname,
		clearRequestContext: options.clearRequestContext,
		consumeDynamicUsage,
		executionContext: getRequestExecutionContext(),
		getAndClearPendingCookies,
		getCollectedFetchTags,
		getDraftModeCookieHeader,
		handler,
		handlerFn: resolvedHandlerFn,
		i18n: options.i18n,
		isAutoHead,
		isProduction,
		isrDebug: options.isrDebug,
		isrRouteKey: options.isrRouteKey,
		isrSet: options.isrSet,
		markDynamicUsage,
		method,
		middlewareContext: options.middlewareContext,
		middlewareRequestHeaders: options.middlewareRequestHeaders,
		params: makeThenableParams(options.params),
		reportRequestError(error, request, context) {
			reportRequestError(error, request, context);
		},
		request: options.request,
		expireSeconds: options.expireSeconds,
		revalidateSeconds,
		routePattern: route.pattern,
		setHeadersAccessPhase
	});
	options.clearRequestContext();
	return applyRouteHandlerMiddlewareContext(new Response(null, { status: 405 }), options.middlewareContext);
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/utils/text-stream.js
/**
* Helpers for the repeated `new TextDecoder()` + `ReadableStream` chunk-loop
* pattern used across the server. Each helper handles the streaming-decode
* boundary correctly (final empty `decoder.decode()` flush so any incomplete
* trailing UTF-8 sequence is reported).
*
* Sites with additional load-bearing behaviour (line-buffered transforms,
* raw-byte accumulators, mixed string/Uint8Array streams, cache-key body
* canonicalisation) intentionally still inline their own decoder.
*/
/**
* Drain a UTF-8 byte stream and return the full decoded text. The stream
* reader is released on both success and failure.
*/
async function readStreamAsText(stream) {
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	const chunks = [];
	try {
		for (;;) {
			const { done, value } = await reader.read();
			if (done) break;
			chunks.push(decoder.decode(value, { stream: true }));
		}
		chunks.push(decoder.decode());
		return chunks.join("");
	} finally {
		reader.releaseLock();
	}
}
/**
* Drain a UTF-8 byte stream up to `maxBytes` of *raw* input, returning the
* decoded text. If the raw size limit is exceeded, the reader is cancelled
* and `onLimitExceeded` is invoked; it MUST throw — its return type is
* `never` to enforce that. Each caller passes its own error type.
*
* The size check is on raw bytes (pre-decode) to bound memory before
* paying the decoder cost.
*/
async function readStreamAsTextWithLimit(stream, maxBytes, onLimitExceeded) {
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	const chunks = [];
	let totalSize = 0;
	try {
		for (;;) {
			const result = await reader.read();
			if (result.done) break;
			totalSize += result.value.byteLength;
			if (totalSize > maxBytes) {
				await reader.cancel();
				onLimitExceeded();
			}
			chunks.push(decoder.decode(result.value, { stream: true }));
		}
		chunks.push(decoder.decode());
		return chunks.join("");
	} finally {
		reader.releaseLock();
	}
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/server-action-not-found.js
var SERVER_ACTION_NOT_FOUND_DOCS = "https://nextjs.org/docs/messages/failed-to-find-server-action";
var SERVER_ACTION_NOT_FOUND_BODY = "Server action not found.";
function getServerActionNotFoundPrefix(actionId) {
	return `Failed to find Server Action${actionId ? ` "${actionId}"` : ""}.`;
}
function getServerActionNotFoundMessage(actionId) {
	return `${getServerActionNotFoundPrefix(actionId)} This request might be from an older or newer deployment.\nRead more: ${SERVER_ACTION_NOT_FOUND_DOCS}`;
}
function getUnknownMessage(error) {
	if (error instanceof Error) return error.message;
	return typeof error === "string" ? error : "";
}
function isServerActionNotFoundError(error, actionId) {
	const message = getUnknownMessage(error);
	if (!message) return false;
	if (!actionId) return message.startsWith("Failed to find Server Action");
	if (message.startsWith(getServerActionNotFoundPrefix(actionId))) return true;
	return Boolean(actionId && message.includes(`[vite-rsc] invalid server reference '${actionId}'`));
}
function createServerActionNotFoundResponse() {
	return new Response(SERVER_ACTION_NOT_FOUND_BODY, {
		status: 404,
		headers: {
			[NEXTJS_ACTION_NOT_FOUND_HEADER]: "1",
			"content-type": "text/plain"
		}
	});
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-page-params.js
function getAppPageSegmentParamName(segment) {
	if (segment.startsWith("[[...") && segment.endsWith("]]") && segment.length > 7) return segment.slice(5, -2);
	if (segment.startsWith("[...") && segment.endsWith("]") && segment.length > 5) return segment.slice(4, -1);
	if (segment.startsWith("[") && segment.endsWith("]") && !segment.includes(".") && segment.length > 2) return segment.slice(1, -1);
	return null;
}
function isEmptyOptionalCatchAll(segment, paramValue) {
	return segment.startsWith("[[...") && Array.isArray(paramValue) && paramValue.length === 0;
}
function resolveAppPageSegmentParams(routeSegments, treePosition, matchedParams) {
	const segmentParams = {};
	const segments = routeSegments ?? [];
	const end = Math.min(Math.max(treePosition, 0), segments.length);
	for (let index = 0; index < end; index++) {
		const segment = segments[index];
		const paramName = getAppPageSegmentParamName(segment);
		if (!paramName) continue;
		const paramValue = matchedParams[paramName];
		if (paramValue === void 0 || isEmptyOptionalCatchAll(segment, paramValue)) continue;
		segmentParams[paramName] = paramValue;
	}
	return segmentParams;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-page-request.js
function pickRouteParams(matchedParams, routeParamNames) {
	const params = {};
	for (const paramName of routeParamNames) {
		const value = matchedParams[paramName];
		if (value !== void 0) params[paramName] = value;
	}
	return params;
}
function collectParentParamNames(routeSegments, boundaryPosition) {
	const limit = Math.max(0, Math.min(boundaryPosition, routeSegments.length));
	const names = [];
	for (const segment of routeSegments.slice(0, limit)) {
		const name = getAppPageSegmentParamName(segment);
		if (name && !names.includes(name)) names.push(name);
	}
	return names;
}
function getLayoutGenerateStaticParamsBoundary(layoutTreePosition) {
	return (layoutTreePosition ?? 0) - 1;
}
function resolveAppPageGenerateStaticParamsSources(options) {
	const sources = [];
	options.layouts?.forEach((layout, index) => {
		if (typeof layout?.generateStaticParams !== "function") return;
		sources.push({
			generateStaticParams: layout.generateStaticParams,
			parentParamNames: collectParentParamNames(options.routeSegments, getLayoutGenerateStaticParamsBoundary(options.layoutTreePositions?.[index]))
		});
	});
	if (typeof options.page?.generateStaticParams === "function") sources.push({
		generateStaticParams: options.page.generateStaticParams,
		parentParamNames: collectParentParamNames(options.routeSegments, Math.max(0, options.routeSegments.length - 1))
	});
	return sources;
}
function areStaticParamsAllowed(params, staticParams) {
	const paramKeys = Object.keys(params);
	return staticParams.some((staticParamSet) => paramKeys.every((key) => {
		const value = params[key];
		const staticValue = staticParamSet[key];
		if (staticValue === void 0) return true;
		if (Array.isArray(value)) return JSON.stringify(value) === JSON.stringify(staticValue);
		if (typeof staticValue === "string" || typeof staticValue === "number" || typeof staticValue === "boolean") return String(value) === String(staticValue);
		return JSON.stringify(value) === JSON.stringify(staticValue);
	}));
}
function normalizeGenerateStaticParams(generateStaticParams) {
	return (Array.isArray(generateStaticParams) ? generateStaticParams : [generateStaticParams]).flatMap((source) => {
		if (typeof source === "function") return [{
			generateStaticParams: source,
			parentParamNames: []
		}];
		if (typeof source?.generateStaticParams === "function") return [source];
		return [];
	});
}
async function validateAppPageDynamicParams(options) {
	if (!options.enforceStaticParamsOnly || !options.isDynamicRoute) return null;
	const generateStaticParamsSources = normalizeGenerateStaticParams(options.generateStaticParams);
	if (generateStaticParamsSources.length === 0) {
		options.clearRequestContext();
		return notFoundResponse();
	}
	for (const source of generateStaticParamsSources) {
		const staticParams = await runWithFetchDedupe(() => source.generateStaticParams({ params: pickRouteParams(options.params, source.parentParamNames) }));
		if (Array.isArray(staticParams) && !areStaticParamsAllowed(options.params, staticParams)) {
			options.clearRequestContext();
			return notFoundResponse();
		}
	}
	return null;
}
function resolveAppPageInterceptState(options) {
	if (!options.isRscRequest) return { kind: "none" };
	const intercept = options.findIntercept(options.cleanPathname);
	if (!intercept) return { kind: "none" };
	const sourceRoute = options.getSourceRoute(intercept.sourceRouteIndex);
	if (!sourceRoute) return { kind: "none" };
	if (sourceRoute === options.currentRoute) return {
		kind: "current-route",
		intercept
	};
	return {
		kind: "source-route",
		intercept,
		sourceRoute
	};
}
function resolveAppPageActionRerenderTarget(options) {
	const interceptState = resolveAppPageInterceptState({
		cleanPathname: options.cleanPathname,
		currentRoute: options.currentRoute,
		findIntercept: options.findIntercept,
		getRouteParamNames: options.getRouteParamNames,
		getSourceRoute: options.getSourceRoute,
		isRscRequest: options.isRscRequest,
		toInterceptOpts: options.toInterceptOpts
	});
	if (interceptState.kind === "source-route") return {
		interceptOpts: options.toInterceptOpts(interceptState.intercept),
		navigationParams: interceptState.intercept.matchedParams,
		params: pickRouteParams(interceptState.intercept.matchedParams, options.getRouteParamNames(interceptState.sourceRoute)),
		route: interceptState.sourceRoute
	};
	return {
		interceptOpts: interceptState.kind === "current-route" ? options.toInterceptOpts(interceptState.intercept) : void 0,
		navigationParams: options.currentParams,
		params: options.currentParams,
		route: options.currentRoute
	};
}
async function resolveAppPageIntercept(options) {
	const interceptState = resolveAppPageInterceptState({
		cleanPathname: options.cleanPathname,
		currentRoute: options.currentRoute,
		findIntercept: options.findIntercept,
		getRouteParamNames: options.getRouteParamNames,
		getSourceRoute: options.getSourceRoute,
		isRscRequest: options.isRscRequest,
		toInterceptOpts: options.toInterceptOpts
	});
	if (interceptState.kind === "source-route") {
		options.setNavigationContext({
			params: interceptState.intercept.matchedParams,
			pathname: options.cleanPathname,
			searchParams: options.searchParams
		});
		const interceptElement = await options.buildPageElement(interceptState.sourceRoute, pickRouteParams(interceptState.intercept.matchedParams, options.getRouteParamNames(interceptState.sourceRoute)), options.toInterceptOpts(interceptState.intercept), options.searchParams);
		return {
			interceptOpts: void 0,
			response: await options.renderInterceptResponse(interceptState.sourceRoute, interceptElement)
		};
	}
	return {
		interceptOpts: interceptState.kind === "current-route" ? options.toInterceptOpts(interceptState.intercept) : void 0,
		response: null
	};
}
async function buildAppPageElement(options) {
	try {
		return {
			element: await options.buildPageElement(),
			response: null
		};
	} catch (error) {
		const specialError = options.resolveSpecialError(error);
		if (specialError) return {
			element: null,
			response: await options.renderSpecialError(specialError)
		};
		const errorBoundaryResponse = await options.renderErrorBoundaryPage(error);
		if (errorBoundaryResponse) return {
			element: null,
			response: errorBoundaryResponse
		};
		throw error;
	}
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-server-action-execution.js
/**
* Matches Next.js' server action argument cap to prevent stack overflow in
* Function.prototype.apply when decoding hostile action payloads.
*/
var SERVER_ACTION_ARGS_LIMIT = 1e3;
var ACTION_DID_NOT_REVALIDATE = 0;
var ACTION_DID_REVALIDATE_STATIC_AND_DYNAMIC = 1;
function setActionRevalidatedHeader(headers, kind) {
	if (kind === ACTION_DID_NOT_REVALIDATE) return;
	headers.set(ACTION_REVALIDATED_HEADER, JSON.stringify(kind));
}
function resolveActionRevalidationKind(hasModifiedCookies) {
	const revalidationKind = getAndClearActionRevalidationKind();
	if (hasModifiedCookies) return ACTION_DID_REVALIDATE_STATIC_AND_DYNAMIC;
	return revalidationKind;
}
function isRequestBodyTooLarge(error) {
	return error instanceof Error && error.message === "Request body too large";
}
function isAppServerActionFunction(action) {
	return typeof action === "function";
}
function normalizeError(error) {
	return error instanceof Error ? error : new Error(String(error));
}
function validateServerActionArgs(args) {
	if (args.length > SERVER_ACTION_ARGS_LIMIT) throw new Error(`Server Action arguments list is too long (${args.length}). Maximum allowed is ${SERVER_ACTION_ARGS_LIMIT}.`);
}
async function readActionBodyWithLimit(request, maxBytes) {
	if (!request.body) return "";
	return readStreamAsTextWithLimit(request.body, maxBytes, () => {
		throw new Error("Request body too large");
	});
}
async function readActionFormDataWithLimit(request, maxBytes) {
	if (!request.body) return new FormData();
	const reader = request.body.getReader();
	const chunks = [];
	let totalSize = 0;
	for (;;) {
		const result = await reader.read();
		if (result.done) break;
		totalSize += result.value.byteLength;
		if (totalSize > maxBytes) {
			await reader.cancel();
			throw new Error("Request body too large");
		}
		chunks.push(result.value);
	}
	const combined = new Uint8Array(totalSize);
	let offset = 0;
	for (const chunk of chunks) {
		combined.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return new Response(combined, { headers: { "Content-Type": request.headers.get("content-type") || "" } }).formData();
}
function getActionControlResponse(error) {
	const digest = getNextErrorDigest(error);
	if (!digest) return null;
	const redirect = parseNextRedirectDigest(digest);
	if (redirect) return {
		kind: "redirect",
		url: redirect.url
	};
	const httpError = parseNextHttpErrorDigest(digest);
	if (httpError) {
		if (!Number.isInteger(httpError.status)) return null;
		return {
			kind: "status",
			statusCode: httpError.status
		};
	}
	return null;
}
function getActionRedirect(error) {
	const digest = getNextErrorDigest(error);
	if (!digest) return null;
	const redirect = parseNextRedirectDigest(digest);
	if (!redirect) return null;
	return {
		status: redirect.status,
		type: redirect.type ?? "push",
		url: redirect.url
	};
}
function getActionHttpFallbackStatus(error) {
	const digest = getNextErrorDigest(error);
	if (!digest) return null;
	const httpError = parseNextHttpErrorDigest(digest);
	if (!httpError || !Number.isInteger(httpError.status)) return null;
	return httpError.status;
}
function createServerActionErrorResponse(error, options) {
	options.getAndClearPendingCookies();
	console.error("[vinext] Server action error:", error);
	options.reportRequestError(normalizeError(error), {
		path: options.cleanPathname,
		method: options.request.method,
		headers: Object.fromEntries(options.request.headers.entries())
	}, {
		routerKind: "App Router",
		routePath: options.cleanPathname,
		routeType: "action"
	});
	options.clearRequestContext();
	return internalServerErrorResponse(void 0);
}
function createActionNotFoundResponse(actionId, options) {
	options.getAndClearPendingCookies();
	console.warn(getServerActionNotFoundMessage(actionId));
	options.clearRequestContext();
	return createServerActionNotFoundResponse();
}
function isProgressiveServerActionRequest(request, contentType, actionId) {
	return request.method.toUpperCase() === "POST" && contentType.startsWith("multipart/form-data") && !actionId;
}
async function handleProgressiveServerActionRequest(options) {
	if (!isProgressiveServerActionRequest(options.request, options.contentType, options.actionId)) return null;
	const csrfResponse = validateCsrfOrigin(options.request, options.allowedOrigins);
	if (csrfResponse) return csrfResponse;
	if (parseInt(options.request.headers.get("content-length") || "0", 10) > options.maxActionBodySize) {
		options.clearRequestContext();
		return payloadTooLargeResponse();
	}
	try {
		let body;
		try {
			body = await options.readFormDataWithLimit(options.request.clone(), options.maxActionBodySize);
		} catch (error) {
			if (isRequestBodyTooLarge(error)) {
				options.clearRequestContext();
				return payloadTooLargeResponse();
			}
			throw error;
		}
		const payloadResponse = await validateServerActionPayload(body);
		if (payloadResponse) {
			options.clearRequestContext();
			return payloadResponse;
		}
		const action = await options.decodeAction(body);
		if (!isAppServerActionFunction(action)) return null;
		let actionControlResponse = null;
		let actionResult;
		const previousHeadersPhase = options.setHeadersAccessPhase("action");
		try {
			actionResult = await action();
		} catch (error) {
			actionControlResponse = getActionControlResponse(error);
			if (!actionControlResponse) throw error;
		} finally {
			options.setHeadersAccessPhase(previousHeadersPhase);
		}
		if (!actionControlResponse) {
			getAndClearActionRevalidationKind();
			return {
				kind: "form-state",
				formState: await options.decodeFormState(actionResult, body) ?? null
			};
		}
		const actionPendingCookies = options.getAndClearPendingCookies();
		const actionDraftCookie = options.getDraftModeCookieHeader();
		const actionRevalidationKind = resolveActionRevalidationKind(actionPendingCookies.length > 0 || Boolean(actionDraftCookie));
		options.clearRequestContext();
		const headers = new Headers();
		if (actionControlResponse.kind === "redirect") headers.set("Location", new URL(actionControlResponse.url, options.request.url).toString());
		mergeMiddlewareResponseHeaders(headers, options.middlewareHeaders);
		for (const cookie of actionPendingCookies) headers.append("Set-Cookie", cookie);
		if (actionDraftCookie) headers.append("Set-Cookie", actionDraftCookie);
		setActionRevalidatedHeader(headers, actionRevalidationKind);
		return new Response(null, {
			status: actionControlResponse.kind === "redirect" ? 303 : actionControlResponse.statusCode,
			headers
		});
	} catch (error) {
		if (isServerActionNotFoundError(error, null)) return createActionNotFoundResponse(null, {
			clearRequestContext: options.clearRequestContext,
			getAndClearPendingCookies: options.getAndClearPendingCookies
		});
		getAndClearActionRevalidationKind();
		options.getAndClearPendingCookies();
		console.error("[vinext] Server action error:", error);
		options.reportRequestError(normalizeError(error), {
			path: options.cleanPathname,
			method: options.request.method,
			headers: Object.fromEntries(options.request.headers.entries())
		}, {
			routerKind: "App Router",
			routePath: options.cleanPathname,
			routeType: "action"
		});
		options.clearRequestContext();
		return internalServerErrorResponse(void 0);
	}
}
async function handleServerActionRscRequest(options) {
	if (options.request.method.toUpperCase() !== "POST" || !options.actionId) return null;
	const csrfResponse = validateCsrfOrigin(options.request, options.allowedOrigins);
	if (csrfResponse) return csrfResponse;
	if (parseInt(options.request.headers.get("content-length") || "0", 10) > options.maxActionBodySize) {
		options.clearRequestContext();
		return payloadTooLargeResponse();
	}
	try {
		let body;
		try {
			body = options.contentType.startsWith("multipart/form-data") ? await options.readFormDataWithLimit(options.request, options.maxActionBodySize) : await options.readBodyWithLimit(options.request, options.maxActionBodySize);
		} catch (error) {
			if (isRequestBodyTooLarge(error)) {
				options.clearRequestContext();
				return payloadTooLargeResponse();
			}
			throw error;
		}
		const payloadResponse = await validateServerActionPayload(body);
		if (payloadResponse) {
			options.clearRequestContext();
			return payloadResponse;
		}
		let action;
		try {
			action = await options.loadServerAction(options.actionId);
		} catch (error) {
			if (isServerActionNotFoundError(error, options.actionId)) return createActionNotFoundResponse(options.actionId, {
				clearRequestContext: options.clearRequestContext,
				getAndClearPendingCookies: options.getAndClearPendingCookies
			});
			throw error;
		}
		if (!isAppServerActionFunction(action)) return createActionNotFoundResponse(options.actionId, {
			clearRequestContext: options.clearRequestContext,
			getAndClearPendingCookies: options.getAndClearPendingCookies
		});
		const temporaryReferences = options.createTemporaryReferenceSet();
		const args = await options.decodeReply(body, { temporaryReferences });
		let returnValue;
		let actionRedirect = null;
		let actionStatus = 200;
		const previousHeadersPhase = options.setHeadersAccessPhase("action");
		try {
			try {
				validateServerActionArgs(args);
				returnValue = {
					ok: true,
					data: await action.apply(null, args)
				};
			} catch (error) {
				actionRedirect = getActionRedirect(error);
				if (actionRedirect) returnValue = {
					ok: true,
					data: void 0
				};
				else {
					const httpFallbackStatus = getActionHttpFallbackStatus(error);
					if (httpFallbackStatus !== null) {
						actionStatus = httpFallbackStatus;
						returnValue = {
							ok: false,
							data: error
						};
					} else {
						console.error("[vinext] Server action error:", error);
						returnValue = {
							ok: false,
							data: options.sanitizeErrorForClient(error)
						};
					}
				}
			}
		} finally {
			options.setHeadersAccessPhase(previousHeadersPhase);
		}
		if (actionRedirect) {
			const actionPendingCookies = options.getAndClearPendingCookies();
			const actionDraftCookie = options.getDraftModeCookieHeader();
			const actionRevalidationKind = resolveActionRevalidationKind(actionPendingCookies.length > 0 || Boolean(actionDraftCookie));
			options.clearRequestContext();
			const redirectHeaders = new Headers({
				"Content-Type": "text/x-component; charset=utf-8",
				Vary: VINEXT_RSC_VARY_HEADER
			});
			mergeMiddlewareResponseHeaders(redirectHeaders, options.middlewareHeaders);
			redirectHeaders.set(ACTION_REDIRECT_HEADER, actionRedirect.url);
			redirectHeaders.set(ACTION_REDIRECT_TYPE_HEADER, actionRedirect.type);
			redirectHeaders.set(ACTION_REDIRECT_STATUS_HEADER, String(actionRedirect.status));
			for (const cookie of actionPendingCookies) redirectHeaders.append("Set-Cookie", cookie);
			if (actionDraftCookie) redirectHeaders.append("Set-Cookie", actionDraftCookie);
			setActionRevalidatedHeader(redirectHeaders, actionRevalidationKind);
			return new Response("", {
				status: 200,
				headers: redirectHeaders
			});
		}
		const actionPendingCookies = options.getAndClearPendingCookies();
		const actionDraftCookie = options.getDraftModeCookieHeader();
		const actionRevalidationKind = resolveActionRevalidationKind(actionPendingCookies.length > 0 || Boolean(actionDraftCookie));
		if (actionRevalidationKind === ACTION_DID_NOT_REVALIDATE) {
			const onRenderError = options.createRscOnErrorHandler(options.request, options.cleanPathname, options.cleanPathname);
			const rscStream = await options.renderToReadableStream({ returnValue }, {
				temporaryReferences,
				onError: onRenderError
			});
			options.clearRequestContext();
			const actionHeaders = new Headers({
				"Content-Type": "text/x-component; charset=utf-8",
				Vary: VINEXT_RSC_VARY_HEADER
			});
			mergeMiddlewareResponseHeaders(actionHeaders, options.middlewareHeaders);
			return new Response(rscStream, {
				status: options.middlewareStatus ?? actionStatus,
				headers: actionHeaders
			});
		}
		const match = options.matchRoute(options.cleanPathname);
		let element;
		let errorPattern = match ? match.route.pattern : options.cleanPathname;
		if (match) {
			const { route: actionRoute, params: actionParams } = match;
			const actionRerenderTarget = resolveAppPageActionRerenderTarget({
				cleanPathname: options.cleanPathname,
				currentParams: actionParams,
				currentRoute: actionRoute,
				findIntercept: options.findIntercept,
				getRouteParamNames: options.getRouteParamNames,
				getSourceRoute: options.getSourceRoute,
				isRscRequest: options.isRscRequest,
				toInterceptOpts: options.toInterceptOpts
			});
			options.setNavigationContext({
				pathname: options.cleanPathname,
				searchParams: options.searchParams,
				params: actionRerenderTarget.navigationParams
			});
			setCurrentFetchCacheMode(options.resolveRouteFetchCacheMode?.(actionRerenderTarget.route) ?? null);
			element = options.buildPageElement({
				cleanPathname: options.cleanPathname,
				interceptOpts: actionRerenderTarget.interceptOpts,
				isRscRequest: options.isRscRequest,
				mountedSlotsHeader: options.mountedSlotsHeader,
				params: actionRerenderTarget.params,
				request: options.request,
				route: actionRerenderTarget.route,
				searchParams: options.searchParams,
				renderMode: APP_RSC_RENDER_MODE_ACTION_RERENDER_PRESERVE_UI
			});
			errorPattern = actionRerenderTarget.route.pattern;
		} else {
			const actionRouteId = options.createPayloadRouteId(options.cleanPathname, null);
			element = options.createNotFoundElement(actionRouteId);
		}
		const onRenderError = options.createRscOnErrorHandler(options.request, options.cleanPathname, errorPattern);
		const rscStream = await options.renderToReadableStream({
			root: element,
			returnValue
		}, {
			temporaryReferences,
			onError: onRenderError
		});
		const actionHeaders = new Headers({
			"Content-Type": "text/x-component; charset=utf-8",
			Vary: VINEXT_RSC_VARY_HEADER
		});
		mergeMiddlewareResponseHeaders(actionHeaders, options.middlewareHeaders);
		setActionRevalidatedHeader(actionHeaders, actionRevalidationKind);
		const actionResponse = new Response(rscStream, {
			status: options.middlewareStatus ?? actionStatus,
			headers: actionHeaders
		});
		if (actionPendingCookies.length > 0 || actionDraftCookie) {
			for (const cookie of actionPendingCookies) actionResponse.headers.append("Set-Cookie", cookie);
			if (actionDraftCookie) actionResponse.headers.append("Set-Cookie", actionDraftCookie);
		}
		return actionResponse;
	} catch (error) {
		getAndClearActionRevalidationKind();
		return createServerActionErrorResponse(error, {
			cleanPathname: options.cleanPathname,
			clearRequestContext: options.clearRequestContext,
			getAndClearPendingCookies: options.getAndClearPendingCookies,
			reportRequestError: options.reportRequestError,
			request: options.request
		});
	}
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-page-execution.js
function isPromiseLike(value) {
	return Boolean(value && (typeof value === "object" || typeof value === "function") && "then" in value && typeof value.then === "function");
}
function getAppPageStatusText(statusCode) {
	return statusCode === 403 ? "Forbidden" : statusCode === 401 ? "Unauthorized" : "Not Found";
}
function mergeAppPageSpecialErrorHeaders(response, middlewareContext) {
	const headers = new Headers(response.headers);
	mergeMiddlewareResponseHeaders(headers, middlewareContext?.headers ?? null);
	return new Response(response.body, {
		headers,
		status: response.status,
		statusText: response.statusText
	});
}
function resolveAppPageSpecialError(error) {
	if (!(error && typeof error === "object" && "digest" in error)) return null;
	const digest = String(error.digest);
	const redirect = parseNextRedirectDigest(digest);
	if (redirect) return {
		kind: "redirect",
		location: redirect.url,
		statusCode: redirect.status
	};
	const httpError = parseNextHttpErrorDigest(digest);
	if (httpError) return {
		kind: "http-access-fallback",
		statusCode: httpError.status
	};
	return null;
}
/**
* Resolves a redirect() target against the request URL and prepends the
* configured basePath when the target is an app-internal absolute path.
*
* Mirrors Next.js's `addPathPrefix(getURLFromRedirectError(err), basePath)`
* in `app-render.tsx`: a `redirect("/about")` call from a page mounted at
* `/blog` (basePath) produces `Location: /blog/about`.
*
* Skips prefixing when:
*  - basePath is unset / empty
*  - the target is a full URL pointing at a different origin (external redirect)
*  - the target already starts with the basePath (caller did the work themselves)
*/
function applyAppPageRedirectBasePath(location, requestUrl, basePath) {
	const resolved = new URL(location, requestUrl);
	const requestOrigin = new URL(requestUrl).origin;
	if (!basePath || resolved.origin !== requestOrigin) return resolved.toString();
	if (hasBasePath(resolved.pathname, basePath)) return resolved.toString();
	resolved.pathname = resolved.pathname === "/" ? basePath : `${basePath}${resolved.pathname}`;
	return resolved.toString();
}
async function buildAppPageSpecialErrorResponse(options) {
	if (options.specialError.kind === "redirect") {
		options.clearRequestContext();
		const prefixedLocation = applyAppPageRedirectBasePath(options.specialError.location, options.request.url, options.basePath);
		const location = options.isRscRequest ? await createRscRedirectLocation(prefixedLocation, options.request) : prefixedLocation;
		const headers = new Headers({ Location: location });
		mergeMiddlewareResponseHeaders(headers, options.middlewareContext?.headers ?? null);
		const pendingCookies = options.getAndClearPendingCookies?.() ?? [];
		for (const cookie of pendingCookies) headers.append("Set-Cookie", cookie);
		return new Response(null, {
			headers,
			status: options.specialError.statusCode
		});
	}
	if (options.renderFallbackPage) {
		const fallbackResponse = await options.renderFallbackPage(options.specialError.statusCode);
		if (fallbackResponse) return mergeAppPageSpecialErrorHeaders(fallbackResponse, options.middlewareContext);
	}
	options.clearRequestContext();
	return mergeAppPageSpecialErrorHeaders(new Response(getAppPageStatusText(options.specialError.statusCode), { status: options.specialError.statusCode }), options.middlewareContext);
}
/** See `LayoutFlags` type docblock in app-elements.ts for lifecycle. */
async function probeAppPageLayouts(options) {
	const layoutFlags = {};
	const cls = options.classification ?? null;
	return {
		response: await options.runWithSuppressedHookWarning(async () => {
			for (let layoutIndex = options.layoutCount - 1; layoutIndex >= 0; layoutIndex--) {
				const buildTimeResult = cls?.buildTimeClassifications?.get(layoutIndex);
				if (cls && buildTimeResult) {
					layoutFlags[cls.getLayoutId(layoutIndex)] = buildTimeResult === "static" ? "s" : "d";
					if (cls.debugClassification) cls.debugClassification(cls.getLayoutId(layoutIndex), cls.buildTimeReasons?.get(layoutIndex) ?? { layer: "no-classifier" });
					const errorResponse = await probeLayoutForErrors(options, layoutIndex);
					if (errorResponse) return errorResponse;
					continue;
				}
				if (cls) {
					try {
						const { dynamicDetected } = await cls.runWithIsolatedDynamicScope(() => options.probeLayoutAt(layoutIndex));
						layoutFlags[cls.getLayoutId(layoutIndex)] = dynamicDetected ? "d" : "s";
						if (cls.debugClassification) cls.debugClassification(cls.getLayoutId(layoutIndex), {
							layer: "runtime-probe",
							outcome: dynamicDetected ? "dynamic" : "static"
						});
					} catch (error) {
						layoutFlags[cls.getLayoutId(layoutIndex)] = "d";
						if (cls.debugClassification) cls.debugClassification(cls.getLayoutId(layoutIndex), {
							layer: "runtime-probe",
							outcome: "dynamic",
							error: error instanceof Error ? error.message : String(error)
						});
						const errorResponse = await options.onLayoutError(error, layoutIndex);
						if (errorResponse) return errorResponse;
					}
					continue;
				}
				const errorResponse = await probeLayoutForErrors(options, layoutIndex);
				if (errorResponse) return errorResponse;
			}
			return null;
		}),
		layoutFlags
	};
}
async function probeLayoutForErrors(options, layoutIndex) {
	try {
		const layoutResult = options.probeLayoutAt(layoutIndex);
		if (isPromiseLike(layoutResult)) await layoutResult;
	} catch (error) {
		return options.onLayoutError(error, layoutIndex);
	}
	return null;
}
async function probeAppPageComponent(options) {
	return options.runWithSuppressedHookWarning(async () => {
		try {
			const pageResult = options.probePage();
			if (isPromiseLike(pageResult)) if (options.awaitAsyncResult) await pageResult;
			else Promise.resolve(pageResult).catch(() => {});
		} catch (error) {
			return options.onError(error);
		}
		return null;
	});
}
async function readAppPageBinaryStream(stream) {
	const reader = stream.getReader();
	const chunks = [];
	let totalLength = 0;
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
		totalLength += value.byteLength;
	}
	const buffer = new Uint8Array(totalLength);
	let offset = 0;
	for (const chunk of chunks) {
		buffer.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return buffer.buffer;
}
function teeAppPageRscStreamForCapture(stream, shouldCapture) {
	if (!shouldCapture) return { ssrStream: stream };
	const [ssrStream, sideStream] = stream.tee();
	return {
		ssrStream,
		sideStream
	};
}
function buildAppPageFontLinkHeader(preloads) {
	if (!preloads || preloads.length === 0) return "";
	return preloads.map((preload) => `<${preload.href}>; rel=preload; as=font; type=${preload.type}; crossorigin`).join(", ");
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-rsc-errors.js
function hasDigest(error) {
	return Boolean(error && typeof error === "object" && "digest" in error);
}
function getThrownValueMessage(error) {
	return error instanceof Error ? error.message : String(error);
}
function getThrownValueStack(error) {
	return error instanceof Error ? error.stack || "" : "";
}
/**
* djb2 hash matching Next.js's string-hash package for RSC error digests.
*/
function errorDigest(input) {
	let hash = 5381;
	for (let i = input.length - 1; i >= 0; i--) hash = hash * 33 ^ input.charCodeAt(i);
	return (hash >>> 0).toString();
}
function sanitizeErrorForClient(error, nodeEnv = "production") {
	if (resolveAppPageSpecialError(error)) return error;
	if (nodeEnv !== "production") return error;
	const sanitized = /* @__PURE__ */ new Error("An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details. A digest property is included on this error instance which may provide additional details about the nature of the error.");
	sanitized.digest = errorDigest(getThrownValueMessage(error) + getThrownValueStack(error));
	return sanitized;
}
function createRscOnErrorHandler$1(options) {
	return (error) => {
		const nodeEnv = options.nodeEnv ?? "production";
		if (hasDigest(error)) return String(error.digest);
		if (nodeEnv !== "production" && error instanceof Error && error.message.includes("Only plain objects, and a few built-ins, can be passed to Client Components")) {
			console.error("[vinext] RSC serialization error: a non-plain object was passed from a Server Component to a Client Component.\n\nCommon causes:\n  * Passing a module namespace (import * as X) directly as a prop.\n    Unlike Next.js (webpack), Vite produces real ESM module namespace objects\n    which are not serializable. Fix: pass individual values instead,\n    e.g. <Comp value={module.value} />\n  * Passing a class instance (new Foo()) as a prop.\n    Fix: convert to a plain object, e.g. { id: foo.id, name: foo.name }\n  * Passing a Date, Map, or Set. Use .toISOString(), [...map.entries()], etc.\n  * Passing Object.create(null). Use { ...obj } to restore a prototype.\n\nOriginal error:", error.message);
			return;
		}
		if (options.requestInfo && options.errorContext && error) options.reportRequestError(error instanceof Error ? error : new Error(getThrownValueMessage(error)), options.requestInfo, options.errorContext);
		if (nodeEnv === "production" && error) return errorDigest(getThrownValueMessage(error) + getThrownValueStack(error));
	};
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-rsc-error-handler.js
/**
* Build a per-request RSC error handler that extracts request metadata from
* the incoming Web `Request`, wires it into a `createRscOnErrorHandler` call,
* and binds the configured `reportRequestError` reporter.
*
* Pure factory: takes all deps explicitly — no closure over module-level state.
*/
function createAppRscOnErrorHandler(reportRequestError, request, pathname, routePath) {
	const requestHeaders = Object.fromEntries(request.headers.entries());
	const requestInfo = {
		path: pathname,
		method: request.method,
		headers: requestHeaders
	};
	return createRscOnErrorHandler$1({
		errorContext: {
			routerKind: "App Router",
			routePath: routePath || pathname,
			routeType: "render"
		},
		reportRequestError,
		requestInfo
	});
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/error-boundary.js
var ErrorBoundary = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'ErrorBoundary' is called on server");
}, "b41f51b793fc", "ErrorBoundary");
var ForbiddenBoundary = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'ForbiddenBoundary' is called on server");
}, "b41f51b793fc", "ForbiddenBoundary");
var NotFoundBoundary = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'NotFoundBoundary' is called on server");
}, "b41f51b793fc", "NotFoundBoundary");
var RedirectBoundary = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'RedirectBoundary' is called on server");
}, "b41f51b793fc", "RedirectBoundary");
var UnauthorizedBoundary = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'UnauthorizedBoundary' is called on server");
}, "b41f51b793fc", "UnauthorizedBoundary");
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/layout-segment-context.js
/**
* Layout segment context provider.
*
* Must be "use client" so that Vite's RSC bundler renders this component in
* the SSR/browser environment where React.createContext is available. The RSC
* entry imports and renders LayoutSegmentProvider directly, but because of the
* "use client" boundary the actual execution happens on the SSR/client side
* where the context can be created and consumed by useSelectedLayoutSegment(s).
*
* Without "use client", this runs in the RSC environment where
* React.createContext is undefined, getLayoutSegmentContext() returns null,
* the provider becomes a no-op, and useSelectedLayoutSegments always returns [].
*
* The context is shared with navigation.ts via getLayoutSegmentContext()
* to avoid creating separate contexts in different modules.
*/
/**
* Wraps children with the layout segment context.
*
* Each layout in the App Router tree wraps its children with this provider,
* passing a map of parallel route key to segment path. The "children" key is
* always present (the default parallel route). Named parallel slots at this
* layout level add their own keys.
*
* Components inside the provider call useSelectedLayoutSegments(parallelRoutesKey)
* to read the segments for a specific parallel route.
*/
var LayoutSegmentProvider = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'LayoutSegmentProvider' is called on server");
}, "de0b278e36f9", "LayoutSegmentProvider");
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/slot.js
/**
* Holds resolved AppElements (not a Promise). React 19's use(Promise) during
* hydration triggers "async Client Component" for native Promises that lack
* React's internal .status property. Storing resolved values sidesteps this.
*/
var Children = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'Children' is called on server");
}, "595c47e84db4", "Children");
var ParallelSlot = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'ParallelSlot' is called on server");
}, "595c47e84db4", "ParallelSlot");
var Slot = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'Slot' is called on server");
}, "595c47e84db4", "Slot");
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-render-dependency.js
function createAppRenderDependency() {
	let released = false;
	let resolve;
	return {
		promise: new Promise((promiseResolve) => {
			resolve = promiseResolve;
		}),
		release() {
			if (released) return;
			released = true;
			resolve();
		}
	};
}
function renderAfterAppDependencies(children, dependencies) {
	if (dependencies.length === 0) return children;
	async function AwaitAppRenderDependencies() {
		await Promise.all(dependencies.map((dependency) => dependency.promise));
		return children;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(AwaitAppRenderDependencies, {});
}
function renderWithAppDependencyBarrier(children, dependency) {
	function ReleaseAppRenderDependency() {
		dependency.release();
		return null;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [children, /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ReleaseAppRenderDependency, {})] });
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-page-segment-state.js
function isOptionalCatchAllSegment(segment) {
	return segment.startsWith("[[...") && segment.endsWith("]]") && segment.length > 7;
}
function isCatchAllSegment(segment) {
	return segment.startsWith("[...") && segment.endsWith("]") && segment.length > 5;
}
function isDynamicSegment(segment) {
	return segment.startsWith("[") && segment.endsWith("]") && !segment.includes(".");
}
function isRouteGroupSegment(segment) {
	return segment.startsWith("(") && segment.endsWith(")");
}
function formatParamSegmentValue(value) {
	if (Array.isArray(value)) return value.join("/");
	return value;
}
function readSegmentParam(segment) {
	if (isOptionalCatchAllSegment(segment)) return {
		name: segment.slice(5, -2),
		type: "oc"
	};
	if (isCatchAllSegment(segment)) return {
		name: segment.slice(4, -1),
		type: "c"
	};
	if (isDynamicSegment(segment)) return {
		name: segment.slice(1, -1),
		type: "d"
	};
	return null;
}
function formatSegmentStateParamValue(param, params, fallbackSegment) {
	const value = params[param.name];
	if (param.type === "oc" && (value === void 0 || Array.isArray(value) && value.length === 0)) return "";
	return formatParamSegmentValue(value) ?? fallbackSegment;
}
function resolveSingleSegmentStateKey(segment, params) {
	const param = readSegmentParam(segment);
	if (!param) return segment;
	return `${param.name}|${formatSegmentStateParamValue(param, params, segment)}|${param.type}`;
}
function resolveAppPageChildSegments(routeSegments, treePosition, params) {
	const rawSegments = routeSegments.slice(treePosition);
	const resolvedSegments = [];
	for (const segment of rawSegments) {
		if (isOptionalCatchAllSegment(segment)) {
			const paramValue = params[segment.slice(5, -2)];
			if (Array.isArray(paramValue) && paramValue.length === 0) continue;
			const resolvedValue = formatParamSegmentValue(paramValue);
			if (resolvedValue !== void 0) resolvedSegments.push(resolvedValue);
			continue;
		}
		if (isCatchAllSegment(segment)) {
			const paramName = segment.slice(4, -1);
			resolvedSegments.push(formatParamSegmentValue(params[paramName]) ?? segment);
			continue;
		}
		if (isDynamicSegment(segment)) {
			const paramName = segment.slice(1, -1);
			resolvedSegments.push(formatParamSegmentValue(params[paramName]) ?? segment);
			continue;
		}
		resolvedSegments.push(segment);
	}
	return resolvedSegments;
}
function resolveAppPageSegmentStateKey(routeSegments, treePosition, params) {
	for (const segment of routeSegments.slice(treePosition)) if (!isRouteGroupSegment(segment)) return resolveSingleSegmentStateKey(segment, params);
	return "";
}
function resolveAppPageRouteStateKey(routeSegments, params) {
	const statePath = [];
	for (const segment of routeSegments) if (!isRouteGroupSegment(segment)) statePath.push(resolveSingleSegmentStateKey(segment, params));
	return statePath.length > 0 ? JSON.stringify(statePath) : "";
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-page-route-wiring.js
function getDefaultExport$1(module) {
	return module?.default ?? null;
}
function getErrorBoundaryExport(module) {
	return module?.default ?? null;
}
function createAppPageTreePath(routeSegments, treePosition) {
	const treePathSegments = routeSegments?.slice(0, treePosition) ?? [];
	if (treePathSegments.length === 0) return "/";
	return `/${treePathSegments.join("/")}`;
}
function createAppPageLayoutEntries(route) {
	return route.layouts.map((layoutModule, index) => {
		const treePosition = route.layoutTreePositions?.[index] ?? 0;
		const treePath = createAppPageTreePath(route.routeSegments, treePosition);
		return {
			errorModule: route.errorTreePositions ? null : route.errors?.[index] ?? null,
			forbiddenModule: route.forbiddens?.[index] ?? null,
			id: AppElementsWire.encodeLayoutId(treePath),
			layoutModule,
			notFoundModule: route.notFounds?.[index] ?? null,
			unauthorizedModule: route.unauthorizeds?.[index] ?? null,
			treePath,
			treePosition
		};
	});
}
function createAppPageTemplateEntries(route) {
	return (route.templates ?? []).map((templateModule, index) => {
		const treePosition = route.templateTreePositions?.[index] ?? 0;
		const treePath = createAppPageTreePath(route.routeSegments, treePosition);
		return {
			id: AppElementsWire.encodeTemplateId(treePath),
			templateModule,
			treePath,
			treePosition
		};
	});
}
function createAppPageErrorEntries(route) {
	return (route.errorPaths ?? route.errors ?? []).flatMap((errorModule, index) => {
		if (!errorModule) return [];
		const treePosition = route.errorTreePositions?.[index];
		if (treePosition === void 0) return [];
		return [{
			errorModule,
			treePosition
		}];
	});
}
function createAppPageParallelSlotEntries(layoutIndex, layoutEntries, route, getEffectiveSlotParams) {
	const parallelSlots = {};
	for (const [slotKey, slot] of Object.entries(route.slots ?? {})) {
		const slotName = slot.name;
		const targetIndex = slot.layoutIndex >= 0 ? slot.layoutIndex : layoutEntries.length - 1;
		if (targetIndex !== layoutIndex) continue;
		const treePath = layoutEntries[targetIndex]?.treePath ?? "/";
		const slotParams = getEffectiveSlotParams(slotKey, slotName);
		parallelSlots[slotName] = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(LayoutSegmentProvider, {
			segmentMap: { children: slot.routeSegments ? resolveAppPageChildSegments(slot.routeSegments, 0, slotParams) : [] },
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Slot, { id: AppElementsWire.encodeSlotId(slotName, treePath) })
		});
	}
	return Object.keys(parallelSlots).length > 0 ? parallelSlots : void 0;
}
function createAppPageRouteHead(metadata, viewport) {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("meta", { charSet: "utf-8" }),
		metadata ? /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(MetadataHead, { metadata }) : null,
		/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ViewportHead, { viewport })
	] });
}
function buildAppPageElements(options) {
	const interceptionContext = options.interceptionContext ?? null;
	const routeSegments = options.route.routeSegments ?? [];
	const routeResetKey = resolveAppPageRouteStateKey(routeSegments, options.matchedParams);
	const routeId = AppElementsWire.encodeRouteId(options.routePath, interceptionContext);
	const pageId = AppElementsWire.encodePageId(options.routePath, interceptionContext);
	const layoutEntries = createAppPageLayoutEntries(options.route);
	const templateEntries = createAppPageTemplateEntries(options.route);
	const errorEntries = createAppPageErrorEntries(options.route);
	const layoutEntriesByTreePosition = /* @__PURE__ */ new Map();
	const templateEntriesByTreePosition = /* @__PURE__ */ new Map();
	const errorEntriesByTreePosition = /* @__PURE__ */ new Map();
	for (const layoutEntry of layoutEntries) layoutEntriesByTreePosition.set(layoutEntry.treePosition, layoutEntry);
	for (const templateEntry of templateEntries) templateEntriesByTreePosition.set(templateEntry.treePosition, templateEntry);
	for (const errorEntry of errorEntries) errorEntriesByTreePosition.set(errorEntry.treePosition, errorEntry);
	const layoutIndicesByTreePosition = /* @__PURE__ */ new Map();
	for (let index = 0; index < layoutEntries.length; index++) layoutIndicesByTreePosition.set(layoutEntries[index].treePosition, index);
	const layoutDependenciesByIndex = /* @__PURE__ */ new Map();
	const layoutDependenciesBefore = [];
	const slotDependenciesByLayoutIndex = [];
	const templateDependenciesById = /* @__PURE__ */ new Map();
	const templateDependenciesBeforeById = /* @__PURE__ */ new Map();
	const pageDependencies = [];
	const rootLayoutTreePath = layoutEntries[0]?.treePath ?? null;
	const elements = { ...AppElementsWire.createMetadataEntries({
		interceptionContext,
		layoutIds: options.route.ids?.layouts ?? layoutEntries.map((entry) => entry.id),
		rootLayoutTreePath,
		routeId
	}) };
	const slotNameCounts = /* @__PURE__ */ new Map();
	for (const slot of Object.values(options.route.slots ?? {})) {
		const slotName = slot.name;
		slotNameCounts.set(slotName, (slotNameCounts.get(slotName) ?? 0) + 1);
	}
	const orderedTreePositions = Array.from(new Set([
		...layoutEntries.map((entry) => entry.treePosition),
		...templateEntries.map((entry) => entry.treePosition),
		...errorEntries.map((entry) => entry.treePosition)
	])).sort((left, right) => left - right);
	const resolveSlotOverride = (slotKey, slotName) => {
		const overrideByKey = options.slotOverrides?.[slotKey];
		if (overrideByKey) return overrideByKey;
		if (slotKey === slotName || (slotNameCounts.get(slotName) ?? 0) === 1) return options.slotOverrides?.[slotName];
	};
	const getEffectiveSlotParams = (slotKey, slotName) => resolveSlotOverride(slotKey, slotName)?.params ?? options.matchedParams;
	for (const treePosition of orderedTreePositions) {
		const layoutIndex = layoutIndicesByTreePosition.get(treePosition);
		if (layoutIndex !== void 0) {
			const layoutEntry = layoutEntries[layoutIndex];
			layoutDependenciesBefore[layoutIndex] = [...pageDependencies];
			if (getDefaultExport$1(layoutEntry.layoutModule)) {
				const layoutDependency = createAppRenderDependency();
				layoutDependenciesByIndex.set(layoutIndex, layoutDependency);
				pageDependencies.push(layoutDependency);
			}
			slotDependenciesByLayoutIndex[layoutIndex] = [...pageDependencies];
		}
		const templateEntry = templateEntriesByTreePosition.get(treePosition);
		if (!templateEntry || !getDefaultExport$1(templateEntry.templateModule)) continue;
		const templateDependency = createAppRenderDependency();
		templateDependenciesById.set(templateEntry.id, templateDependency);
		templateDependenciesBeforeById.set(templateEntry.id, [...pageDependencies]);
		pageDependencies.push(templateDependency);
	}
	elements[pageId] = renderAfterAppDependencies(options.element, pageDependencies);
	for (const templateEntry of templateEntries) {
		const templateComponent = getDefaultExport$1(templateEntry.templateModule);
		if (!templateComponent) continue;
		const TemplateComponent = templateComponent;
		const templateDependency = templateDependenciesById.get(templateEntry.id);
		const templateElement = templateDependency ? renderWithAppDependencyBarrier(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TemplateComponent, {
			params: options.matchedParams,
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Children, {})
		}), templateDependency) : /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(TemplateComponent, {
			params: options.matchedParams,
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Children, {})
		});
		elements[templateEntry.id] = renderAfterAppDependencies(templateElement, templateDependenciesBeforeById.get(templateEntry.id) ?? []);
	}
	for (let index = 0; index < layoutEntries.length; index++) {
		const layoutEntry = layoutEntries[index];
		const layoutComponent = getDefaultExport$1(layoutEntry.layoutModule);
		if (!layoutComponent) continue;
		const layoutProps = { params: options.makeThenableParams(resolveAppPageSegmentParams(options.route.routeSegments, layoutEntry.treePosition, options.matchedParams)) };
		for (const slot of Object.values(options.route.slots ?? {})) {
			const slotName = slot.name;
			if ((slot.layoutIndex >= 0 ? slot.layoutIndex : layoutEntries.length - 1) !== index) continue;
			layoutProps[slotName] = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ParallelSlot, { name: slotName });
		}
		const LayoutComponent = layoutComponent;
		const layoutDependency = layoutDependenciesByIndex.get(index);
		const layoutElement = layoutDependency ? renderWithAppDependencyBarrier(/* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(LayoutComponent, {
			...layoutProps,
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Children, {})
		}), layoutDependency) : /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(LayoutComponent, {
			...layoutProps,
			children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Children, {})
		});
		elements[layoutEntry.id] = renderAfterAppDependencies(layoutElement, layoutDependenciesBefore[index] ?? []);
	}
	for (const [slotKey, slot] of Object.entries(options.route.slots ?? {})) {
		const slotName = slot.name;
		const targetIndex = slot.layoutIndex >= 0 ? slot.layoutIndex : layoutEntries.length - 1;
		const treePath = layoutEntries[targetIndex]?.treePath ?? "/";
		const slotId = AppElementsWire.encodeSlotId(slotName, treePath);
		const slotOverride = resolveSlotOverride(slotKey, slotName);
		const slotParams = getEffectiveSlotParams(slotKey, slotName);
		const slotResetKey = resolveAppPageRouteStateKey(slot.routeSegments ?? [], slotParams);
		const overrideOrPageComponent = getDefaultExport$1(slotOverride?.pageModule) ?? getDefaultExport$1(slot.page);
		const defaultComponent = getDefaultExport$1(slot.default);
		if (!overrideOrPageComponent && defaultComponent && options.isRscRequest && options.mountedSlotIds?.has(slotId)) continue;
		const slotComponent = overrideOrPageComponent ?? defaultComponent;
		if (!slotComponent) {
			elements[slotId] = AppElementsWire.unmatchedSlotValue;
			continue;
		}
		const slotThenableParams = options.makeThenableParams(slotParams);
		const slotProps = { params: slotThenableParams };
		if (slotOverride?.props) Object.assign(slotProps, slotOverride.props);
		let slotElement = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(slotComponent, { ...slotProps });
		const interceptLayouts = slotOverride?.layoutModules ?? [];
		for (let layoutIndex = interceptLayouts.length - 1; layoutIndex >= 0; layoutIndex--) {
			const interceptLayoutComponent = getDefaultExport$1(interceptLayouts[layoutIndex]);
			if (!interceptLayoutComponent) continue;
			slotElement = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(interceptLayoutComponent, {
				params: slotThenableParams,
				children: slotElement
			});
		}
		const slotLayoutComponent = getDefaultExport$1(slot.layout);
		if (slotLayoutComponent) slotElement = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(slotLayoutComponent, {
			params: slotThenableParams,
			children: slotElement
		});
		const slotLoadingComponent = getDefaultExport$1(slot.loading);
		if (slotLoadingComponent && !shouldSuppressLoadingBoundaries(options.renderMode ?? "navigation")) slotElement = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(import_react_react_server.Suspense, {
			fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(slotLoadingComponent, {}),
			children: slotElement
		}, slotResetKey);
		const slotErrorComponent = getErrorBoundaryExport(slot.error);
		if (slotErrorComponent) slotElement = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ErrorBoundary, {
			resetKey: slotResetKey,
			fallback: slotErrorComponent,
			children: slotElement
		});
		elements[slotId] = renderAfterAppDependencies(slotElement, targetIndex >= 0 ? slotDependenciesByLayoutIndex[targetIndex] ?? [] : []);
	}
	let routeChildren = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(LayoutSegmentProvider, {
		segmentMap: { children: [] },
		children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Slot, { id: pageId })
	});
	routeChildren = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(RedirectBoundary, { children: routeChildren });
	const routeLoadingComponent = getDefaultExport$1(options.route.loading);
	if (routeLoadingComponent && !shouldSuppressLoadingBoundaries(options.renderMode ?? "navigation")) routeChildren = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(import_react_react_server.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(routeLoadingComponent, {}),
		children: routeChildren
	}, routeResetKey);
	const lastLayoutErrorModule = errorEntries.length > 0 ? errorEntries[errorEntries.length - 1].errorModule : null;
	const notFoundComponent = getDefaultExport$1(options.route.notFound) ?? getDefaultExport$1(options.rootNotFoundModule);
	if (notFoundComponent) routeChildren = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(NotFoundBoundary, {
		resetKey: routeResetKey,
		fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(notFoundComponent, {}),
		children: routeChildren
	});
	const forbiddenComponent = getDefaultExport$1(options.route.forbidden) ?? getDefaultExport$1(options.rootForbiddenModule);
	if (forbiddenComponent) routeChildren = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ForbiddenBoundary, {
		resetKey: routeResetKey,
		fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(forbiddenComponent, {}),
		children: routeChildren
	});
	const unauthorizedComponent = getDefaultExport$1(options.route.unauthorized) ?? getDefaultExport$1(options.rootUnauthorizedModule);
	if (unauthorizedComponent) routeChildren = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(UnauthorizedBoundary, {
		resetKey: routeResetKey,
		fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(unauthorizedComponent, {}),
		children: routeChildren
	});
	const pageErrorComponent = getErrorBoundaryExport(options.route.error);
	if (pageErrorComponent && options.route.error !== lastLayoutErrorModule) routeChildren = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ErrorBoundary, {
		resetKey: routeResetKey,
		fallback: pageErrorComponent,
		children: routeChildren
	});
	for (let index = orderedTreePositions.length - 1; index >= 0; index--) {
		const treePosition = orderedTreePositions[index];
		const segmentResetKey = resolveAppPageSegmentStateKey(routeSegments, treePosition, options.matchedParams);
		let segmentChildren = routeChildren;
		const layoutEntry = layoutEntriesByTreePosition.get(treePosition);
		const templateEntry = templateEntriesByTreePosition.get(treePosition);
		const errorEntry = errorEntriesByTreePosition.get(treePosition);
		if (layoutEntry) {
			const layoutNotFoundComponent = getDefaultExport$1(layoutEntry.notFoundModule);
			if (layoutNotFoundComponent) segmentChildren = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(NotFoundBoundary, {
				resetKey: segmentResetKey,
				fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(layoutNotFoundComponent, {}),
				children: segmentChildren
			});
			const layoutForbiddenComponent = getDefaultExport$1(layoutEntry.forbiddenModule);
			if (layoutForbiddenComponent) segmentChildren = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ForbiddenBoundary, {
				resetKey: segmentResetKey,
				fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(layoutForbiddenComponent, {}),
				children: segmentChildren
			});
			const layoutUnauthorizedComponent = getDefaultExport$1(layoutEntry.unauthorizedModule);
			if (layoutUnauthorizedComponent) segmentChildren = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(UnauthorizedBoundary, {
				resetKey: segmentResetKey,
				fallback: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(layoutUnauthorizedComponent, {}),
				children: segmentChildren
			});
		}
		const segmentErrorComponent = getErrorBoundaryExport(errorEntry?.errorModule ?? layoutEntry?.errorModule);
		if (segmentErrorComponent) segmentChildren = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ErrorBoundary, {
			resetKey: segmentResetKey,
			fallback: segmentErrorComponent,
			children: segmentChildren
		});
		if (templateEntry && getDefaultExport$1(templateEntry.templateModule)) segmentChildren = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Slot, {
			id: templateEntry.id,
			children: segmentChildren
		}, segmentResetKey);
		if (!layoutEntry) {
			routeChildren = segmentChildren;
			continue;
		}
		const layoutHasElement = getDefaultExport$1(layoutEntry.layoutModule) !== null;
		const layoutIndex = layoutIndicesByTreePosition.get(treePosition) ?? -1;
		const segmentMap = { children: resolveAppPageChildSegments(routeSegments, layoutEntry.treePosition, options.matchedParams) };
		for (const [slotKey, slot] of Object.entries(options.route.slots ?? {})) {
			const slotName = slot.name;
			if ((slot.layoutIndex >= 0 ? slot.layoutIndex : layoutEntries.length - 1) !== layoutIndex) continue;
			const slotParams = getEffectiveSlotParams(slotKey, slotName);
			segmentMap[slotName] = slot.routeSegments ? resolveAppPageChildSegments(slot.routeSegments, 0, slotParams) : [];
		}
		routeChildren = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(LayoutSegmentProvider, {
			segmentMap,
			children: layoutHasElement ? /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(Slot, {
				id: layoutEntry.id,
				parallelSlots: createAppPageParallelSlotEntries(layoutIndex, layoutEntries, options.route, getEffectiveSlotParams),
				children: segmentChildren
			}) : segmentChildren
		});
	}
	const globalErrorComponent = getErrorBoundaryExport(options.globalErrorModule);
	if (globalErrorComponent) routeChildren = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)(ErrorBoundary, {
		fallback: globalErrorComponent,
		children: routeChildren
	});
	elements[routeId] = /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsxs)(import_jsx_runtime_react_server.Fragment, { children: [createAppPageRouteHead(options.resolvedMetadata, options.resolvedViewport), routeChildren] });
	return elements;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/file-based-metadata.js
function routeApplies(routePath, routePrefix) {
	if (!routePrefix) return true;
	return routePath === routePrefix || routePath.startsWith(`${routePrefix}/`);
}
function routeScore(routePrefix) {
	return routePrefix.split("/").filter(Boolean).length;
}
function routeSegmentsApply(routeSegments, routePrefixSegments) {
	if (routePrefixSegments.length > routeSegments.length) return false;
	for (let index = 0; index < routePrefixSegments.length; index++) if (routeSegments[index] !== routePrefixSegments[index]) return false;
	return true;
}
function removeParallelRouteSegments(routeSegments) {
	return routeSegments.filter((segment) => !segment.startsWith("@"));
}
function routeSegmentsApplyWithParallelSlots(routeSegments, routePrefixSegments) {
	if (routeSegmentsApply(routeSegments, routePrefixSegments)) return true;
	const visiblePrefixSegments = removeParallelRouteSegments(routePrefixSegments);
	return visiblePrefixSegments.length !== routePrefixSegments.length && routeSegmentsApply(routeSegments, visiblePrefixSegments);
}
function routeSpecificity(route) {
	return route.routeSegments?.length ?? routeScore(route.routePrefix);
}
function selectDeepestRoutes(metadataRoutes, kind, routePath, params, routeSegments) {
	if (!metadataRoutes || metadataRoutes.length === 0) return [];
	let selectedScore = -1;
	const selectedRoutes = [];
	for (const route of metadataRoutes) {
		if ((route.headData?.kind ?? getMetadataRouteKind(route)) !== kind) continue;
		if (routeSegments && route.routeSegments) {
			if (!routeSegmentsApplyWithParallelSlots(routeSegments, route.routeSegments)) continue;
			const currentScore = routeSpecificity(route);
			if (currentScore > selectedScore) {
				selectedScore = currentScore;
				selectedRoutes.length = 0;
				selectedRoutes.push(route);
				continue;
			}
			if (currentScore === selectedScore) selectedRoutes.push(route);
			continue;
		}
		const routePrefix = route.routePrefix;
		const resolvedRoutePrefix = fillRoutePatternSegments(routePrefix, params);
		const normalizedRoutePrefix = routePattern(routePrefix);
		if (!routeApplies(routePath, routePrefix) && !routeApplies(routePath, normalizedRoutePrefix) && (!resolvedRoutePrefix || !routeApplies(routePath, resolvedRoutePrefix))) continue;
		const currentScore = routeSpecificity(route);
		if (currentScore > selectedScore) {
			selectedScore = currentScore;
			selectedRoutes.length = 0;
			selectedRoutes.push(route);
			continue;
		}
		if (currentScore === selectedScore) selectedRoutes.push(route);
	}
	return selectedRoutes;
}
function isStringOrUrl(value) {
	return typeof value === "string" || typeof value === "object" && value instanceof URL;
}
function normalizeIconDescriptor(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
	const urlValue = Reflect.get(value, "url");
	if (!isStringOrUrl(urlValue)) return null;
	const entry = { url: urlValue };
	const sizesValue = Reflect.get(value, "sizes");
	if (typeof sizesValue === "string") entry.sizes = sizesValue;
	const typeValue = Reflect.get(value, "type");
	if (typeof typeValue === "string") entry.type = typeValue;
	const mediaValue = Reflect.get(value, "media");
	if (typeof mediaValue === "string") entry.media = mediaValue;
	return entry;
}
function normalizeIconValue(value) {
	if (isStringOrUrl(value)) return { url: value };
	return normalizeIconDescriptor(value);
}
function normalizeIconValueList(values) {
	const normalizedEntries = [];
	for (const value of values) {
		const normalizedValue = normalizeIconValue(value);
		if (normalizedValue) normalizedEntries.push(normalizedValue);
	}
	return normalizedEntries;
}
function normalizeIconEntries(icon) {
	const normalizedTopLevelValue = normalizeIconValue(icon);
	if (normalizedTopLevelValue) return [normalizedTopLevelValue];
	if (Array.isArray(icon)) return normalizeIconValueList(icon);
	if (!isIconMap(icon)) return [];
	const iconValue = icon.icon;
	if (!iconValue) return [];
	if (Array.isArray(iconValue)) return normalizeIconValueList(iconValue);
	const normalizedValue = normalizeIconValue(iconValue);
	return normalizedValue ? [normalizedValue] : [];
}
function isIconMap(value) {
	if (!value || typeof value !== "object" || value instanceof URL || Array.isArray(value)) return false;
	return normalizeIconValue(value) === null;
}
function cloneIconMap(value) {
	if (!value) return {};
	if (isIconMap(value)) return { ...value };
	const iconEntries = normalizeIconEntries(value);
	return iconEntries.length > 0 ? { icon: iconEntries } : {};
}
function buildIconEntry(headData) {
	if (headData.kind !== "favicon" && headData.kind !== "icon") return null;
	const iconEntry = { url: headData.href };
	if (headData.sizes) iconEntry.sizes = headData.sizes;
	if (headData.type) iconEntry.type = headData.type;
	return iconEntry;
}
function buildAppleEntry(headData) {
	if (headData.kind !== "apple") return null;
	const appleEntry = { url: headData.href };
	if (headData.sizes) appleEntry.sizes = headData.sizes;
	if (headData.type) appleEntry.type = headData.type;
	return appleEntry;
}
function normalizeAppleEntry(value) {
	if (isStringOrUrl(value)) return { url: value };
	return { ...value };
}
function buildSocialEntry(headData) {
	if (headData.kind !== "openGraph" && headData.kind !== "twitter") return null;
	const socialEntry = { url: headData.href };
	if (headData.width !== void 0) socialEntry.width = headData.width;
	if (headData.height !== void 0) socialEntry.height = headData.height;
	if (headData.alt) socialEntry.alt = headData.alt;
	if (headData.type) socialEntry.type = headData.type;
	return socialEntry;
}
function normalizeMetadataImageId(route, id) {
	const normalizedId = String(id);
	if (!isValidMetadataImageId(normalizedId)) {
		console.warn(`[vinext] Skipping metadata route ${route.servedUrl} image id "${normalizedId}" because metadata image ids must match /^[a-zA-Z0-9-_.]+$/.`);
		return null;
	}
	return normalizedId;
}
function withContentHash(href, contentHash) {
	if (!contentHash) return href;
	return `${href}?${contentHash}`;
}
function hasOwnProperty(source, key) {
	return Boolean(source && Object.prototype.hasOwnProperty.call(source, key));
}
function hasOpenGraphImages(metadata) {
	return hasOwnProperty(metadata?.openGraph, "images");
}
function hasTwitterImages(metadata) {
	return hasOwnProperty(metadata?.twitter, "images");
}
function hasIcons(metadata) {
	return Boolean(metadata?.icons);
}
function getMetadataSourceForRoute(route, options, fallbackMetadata) {
	if (!options?.metadataSources) return fallbackMetadata;
	if (!route.routeSegments) return null;
	for (let index = options.metadataSources.length - 1; index >= 0; index--) {
		const source = options.metadataSources[index];
		if (routeSegmentsApplyWithParallelSlots(source.routeSegments, route.routeSegments)) return source.metadata;
	}
	return null;
}
function socialRouteHasExplicitImagesAtSource(route, kind, options, fallbackMetadata) {
	const sourceMetadata = getMetadataSourceForRoute(route, options, fallbackMetadata);
	return kind === "openGraph" ? hasOpenGraphImages(sourceMetadata) : hasTwitterImages(sourceMetadata);
}
function iconRouteHasExplicitIconsAtSource(route, options, fallbackMetadata) {
	return hasIcons(fallbackMetadata) || hasIcons(getMetadataSourceForRoute(route, options, null));
}
function readStringProperty(source, key) {
	const value = Reflect.get(source, key);
	return typeof value === "string" ? value : void 0;
}
function readNumberProperty(source, key) {
	const value = Reflect.get(source, key);
	return typeof value === "number" ? value : void 0;
}
function readStringOrNumberProperty(source, key) {
	const value = Reflect.get(source, key);
	if (typeof value === "string" || typeof value === "number") return value;
}
function readSizeProperty(source) {
	const sizeValue = Reflect.get(source, "size");
	if (typeof sizeValue !== "object" || sizeValue === null) return;
	const width = readNumberProperty(sizeValue, "width");
	const height = readNumberProperty(sizeValue, "height");
	if (width === void 0 && height === void 0) return;
	return {
		width,
		height
	};
}
function readDynamicImageMetadataSource(source) {
	return {
		id: readStringOrNumberProperty(source, "id"),
		alt: readStringProperty(source, "alt"),
		contentType: readStringProperty(source, "contentType"),
		size: readSizeProperty(source)
	};
}
async function resolveDynamicImageMetadataSources(route, params) {
	if (!route.module || typeof route.module !== "object") return [];
	const generateImageMetadata = Reflect.get(route.module, "generateImageMetadata");
	if (typeof generateImageMetadata !== "function") return [readDynamicImageMetadataSource(route.module)];
	const result = await generateImageMetadata({ params: makeThenableParams(params) });
	if (!Array.isArray(result)) return [];
	const sources = [];
	for (const entry of result) if (typeof entry === "object" && entry !== null) {
		const source = readDynamicImageMetadataSource(entry);
		if (source.id === void 0) {
			console.warn(`[vinext] Skipping metadata route ${route.servedUrl} image metadata entry because generateImageMetadata entries must include an id.`);
			continue;
		}
		sources.push(source);
	}
	return sources;
}
async function resolveRouteHeadData(route, params) {
	if (!route.isDynamic || !route.module || typeof route.module !== "object") return route.headData ? [route.headData] : [];
	const routeKind = getMetadataImageRouteKind(route);
	if (!routeKind) return route.headData ? [route.headData] : [];
	const resolvedUrl = fillRoutePatternSegments(route.servedUrl, params);
	if (!resolvedUrl) {
		console.warn(`[vinext] Skipping metadata route ${route.servedUrl} because params did not fill all dynamic segments.`);
		return [];
	}
	const metadataSources = await resolveDynamicImageMetadataSources(route, params);
	const resolvedHeadData = [];
	for (const metadataSource of metadataSources) {
		let hrefBase = resolvedUrl;
		if (metadataSource.id !== void 0) {
			const normalizedId = normalizeMetadataImageId(route, metadataSource.id);
			if (!normalizedId) continue;
			hrefBase = `${resolvedUrl}/${normalizedId}`;
		}
		const href = withContentHash(hrefBase, route.contentHash);
		const contentType = metadataSource.contentType ?? route.contentType;
		const size = metadataSource.size;
		if (routeKind === "icon" || routeKind === "apple") {
			let sizes;
			if (size?.width !== void 0 && size.height !== void 0) sizes = `${size.width}x${size.height}`;
			resolvedHeadData.push({
				kind: routeKind,
				href,
				sizes,
				type: contentType
			});
			continue;
		}
		resolvedHeadData.push({
			kind: routeKind,
			href,
			alt: metadataSource.alt,
			height: size?.height,
			type: contentType,
			width: size?.width
		});
	}
	return resolvedHeadData;
}
async function resolveHeadDataList(routes, params) {
	return (await Promise.all(routes.map((route) => resolveRouteHeadData(route, params)))).flat();
}
async function applyFileBasedMetadata(metadata, routePath, params, metadataRoutes, options) {
	if (!metadataRoutes || metadataRoutes.length === 0) return metadata;
	const routeSegments = options?.routeSegments ?? null;
	const faviconRoutes = selectDeepestRoutes(metadataRoutes, "favicon", routePath, params, routeSegments);
	const iconRoutes = selectDeepestRoutes(metadataRoutes, "icon", routePath, params, routeSegments).filter((route) => !iconRouteHasExplicitIconsAtSource(route, options, metadata));
	const appleRoutes = selectDeepestRoutes(metadataRoutes, "apple", routePath, params, routeSegments).filter((route) => !iconRouteHasExplicitIconsAtSource(route, options, metadata));
	const openGraphRoutes = selectDeepestRoutes(metadataRoutes, "openGraph", routePath, params, routeSegments).filter((route) => !socialRouteHasExplicitImagesAtSource(route, "openGraph", options, metadata));
	const twitterRoutes = selectDeepestRoutes(metadataRoutes, "twitter", routePath, params, routeSegments).filter((route) => !socialRouteHasExplicitImagesAtSource(route, "twitter", options, metadata));
	const manifestRoutes = selectDeepestRoutes(metadataRoutes, "manifest", routePath, params, routeSegments);
	const [faviconHeadData, iconHeadData, appleHeadData, openGraphHeadData, twitterHeadData, manifestHeadData] = await Promise.all([
		resolveHeadDataList(faviconRoutes, params),
		resolveHeadDataList(iconRoutes, params),
		resolveHeadDataList(appleRoutes, params),
		resolveHeadDataList(openGraphRoutes, params),
		resolveHeadDataList(twitterRoutes, params),
		resolveHeadDataList(manifestRoutes, params)
	]);
	if (!metadata && faviconHeadData.length === 0 && iconHeadData.length === 0 && appleHeadData.length === 0 && openGraphHeadData.length === 0 && twitterHeadData.length === 0 && manifestHeadData.length === 0) return null;
	const nextMetadata = metadata ? { ...metadata } : {};
	const faviconEntries = [];
	for (const headData of faviconHeadData) {
		const iconEntry = buildIconEntry(headData);
		if (iconEntry) faviconEntries.push(iconEntry);
	}
	if (faviconEntries.length > 0) {
		const nextIcons = cloneIconMap(nextMetadata.icons);
		const normalizedIcons = normalizeIconEntries(nextIcons);
		nextIcons.icon = [...faviconEntries, ...normalizedIcons];
		nextMetadata.icons = nextIcons;
	}
	{
		const nextIcons = cloneIconMap(nextMetadata.icons);
		const iconEntries = [];
		for (const headData of iconHeadData) {
			const iconEntry = buildIconEntry(headData);
			if (iconEntry) iconEntries.push(iconEntry);
		}
		if (iconEntries.length > 0) {
			const normalizedIcons = normalizeIconEntries(nextIcons);
			nextIcons.icon = [...iconEntries, ...normalizedIcons];
		}
		const appleEntries = [];
		for (const headData of appleHeadData) {
			const appleEntry = buildAppleEntry(headData);
			if (appleEntry) appleEntries.push(appleEntry);
		}
		if (appleEntries.length > 0) {
			const existingApple = nextIcons.apple;
			const normalizedAppleEntries = [];
			if (Array.isArray(existingApple)) for (const entry of existingApple) normalizedAppleEntries.push(normalizeAppleEntry(entry));
			else if (existingApple) normalizedAppleEntries.push(normalizeAppleEntry(existingApple));
			nextIcons.apple = [...appleEntries, ...normalizedAppleEntries];
		}
		if (iconEntries.length > 0 || appleEntries.length > 0) nextMetadata.icons = nextIcons;
	}
	if (openGraphHeadData.length > 0) {
		const socialEntries = [];
		for (const headData of openGraphHeadData) {
			const socialEntry = buildSocialEntry(headData);
			if (socialEntry) socialEntries.push(socialEntry);
		}
		if (socialEntries.length > 0) {
			const nextOpenGraph = nextMetadata.openGraph ? { ...nextMetadata.openGraph } : {};
			nextOpenGraph.images = socialEntries;
			nextMetadata.openGraph = nextOpenGraph;
		}
	}
	if (twitterHeadData.length > 0) {
		const socialEntries = [];
		for (const headData of twitterHeadData) {
			const socialEntry = buildSocialEntry(headData);
			if (socialEntry) socialEntries.push(socialEntry);
		}
		if (socialEntries.length > 0) {
			const nextTwitter = nextMetadata.twitter ? { ...nextMetadata.twitter } : {};
			nextTwitter.images = socialEntries;
			nextMetadata.twitter = nextTwitter;
		}
	}
	if (manifestHeadData.length > 0 && manifestHeadData[0].kind === "manifest") nextMetadata.manifest = manifestHeadData[0].href;
	return nextMetadata;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-page-head.js
function resolveActiveParallelRouteHeadInputs(options) {
	return Object.entries(options.slots ?? {}).map(([slotKey, slot]) => {
		if (options.interceptSlotKey === slotKey && options.interceptPage) return {
			layoutModules: options.interceptLayouts ?? [],
			pageModule: options.interceptPage,
			params: options.interceptParams ?? options.params,
			routeSegments: options.routeSegments
		};
		return {
			layoutModules: slot.layout ? [slot.layout] : [],
			pageModule: slot.page,
			params: options.params,
			routeSegments: options.routeSegments
		};
	});
}
function isPresent(value) {
	return value !== null && value !== void 0;
}
function collectAppPageSearchParams(searchParams) {
	const pageSearchParams = Object.create(null);
	let hasSearchParams = false;
	searchParams?.forEach((value, key) => {
		hasSearchParams = true;
		const currentValue = pageSearchParams[key];
		if (Array.isArray(currentValue)) {
			pageSearchParams[key] = [...currentValue, value];
			return;
		}
		if (currentValue !== void 0) {
			pageSearchParams[key] = [currentValue, value];
			return;
		}
		pageSearchParams[key] = value;
	});
	return {
		hasSearchParams,
		pageSearchParams
	};
}
function createMetadataSources(metadataResults, routeSegments, layoutTreePositions, pageMetadata, includePageSource) {
	const metadataSources = metadataResults.map((metadata, index) => ({
		routeSegments: routeSegments.slice(0, layoutTreePositions[index] ?? 0),
		metadata
	}));
	if (includePageSource) metadataSources.push({
		routeSegments,
		metadata: pageMetadata
	});
	return metadataSources;
}
function createLayoutInputs(layoutModules, layoutTreePositions) {
	const layoutInputs = [];
	for (let index = 0; index < layoutModules.length; index++) {
		const layoutModule = layoutModules[index];
		if (!isPresent(layoutModule)) continue;
		layoutInputs.push({
			module: layoutModule,
			treePosition: layoutTreePositions[index] ?? 0
		});
	}
	return layoutInputs;
}
async function resolveLayoutMetadata(layoutInputs, params, routeSegments) {
	const layoutMetadataPromises = [];
	let accumulatedMetadata = Promise.resolve({});
	for (const layoutInput of layoutInputs) {
		const parentForLayout = accumulatedMetadata;
		const layoutParams = resolveAppPageSegmentParams(routeSegments, layoutInput.treePosition, params);
		const metadataPromise = resolveModuleMetadata(layoutInput.module, layoutParams, void 0, parentForLayout);
		layoutMetadataPromises.push(metadataPromise);
		metadataPromise.catch(() => null);
		accumulatedMetadata = metadataPromise.then(async (metadataResult) => {
			if (metadataResult) return mergeMetadataEntries([{ metadata: await parentForLayout }, { metadata: metadataResult }]);
			return parentForLayout;
		});
		accumulatedMetadata.catch(() => null);
	}
	return Promise.all(layoutMetadataPromises);
}
async function resolveLayoutViewport(layoutInputs, params, routeSegments) {
	return Promise.all(layoutInputs.map((layoutInput) => {
		const layoutParams = resolveAppPageSegmentParams(routeSegments, layoutInput.treePosition, params);
		return resolveModuleViewport(layoutInput.module, layoutParams);
	}));
}
async function resolveParallelRouteHead(parallelRoute, fallbackParams, fallbackRouteSegments, pageSearchParams, parent) {
	const params = parallelRoute.params ?? fallbackParams;
	const routeSegments = parallelRoute.routeSegments ?? fallbackRouteSegments;
	const metadataResults = [];
	const viewportResults = [];
	const metadataSources = [];
	let accumulatedMetadata = parent;
	const layoutModules = [...parallelRoute.layoutModules ?? [], parallelRoute.layoutModule].filter(isPresent);
	const layoutViewportPromises = layoutModules.map((layoutModule) => resolveModuleViewport(layoutModule, params));
	const pageViewportPromise = parallelRoute.pageModule ? resolveModuleViewport(parallelRoute.pageModule, params) : Promise.resolve(null);
	for (const layoutViewportPromise of layoutViewportPromises) layoutViewportPromise.catch(() => null);
	pageViewportPromise.catch(() => null);
	for (const layoutModule of layoutModules) {
		const layoutMetadata = await resolveModuleMetadata(layoutModule, params, void 0, accumulatedMetadata);
		metadataResults.push(layoutMetadata);
		metadataSources.push({
			metadata: layoutMetadata,
			routeSegments
		});
		if (layoutMetadata) {
			accumulatedMetadata = accumulatedMetadata.then(async (parentMetadata) => mergeMetadataEntries([{ metadata: parentMetadata }, { metadata: layoutMetadata }]));
			accumulatedMetadata.catch(() => null);
		}
	}
	if (parallelRoute.pageModule) {
		const pageMetadata = await resolveModuleMetadata(parallelRoute.pageModule, params, pageSearchParams, accumulatedMetadata);
		metadataResults.push(pageMetadata);
		metadataSources.push({
			metadata: pageMetadata,
			routeSegments
		});
	}
	viewportResults.push(...await Promise.all(layoutViewportPromises));
	const pageViewport = await pageViewportPromise;
	if (parallelRoute.pageModule) viewportResults.push(pageViewport);
	return {
		metadataResults,
		metadataSources,
		viewportResults
	};
}
async function resolveAppPageHead(options) {
	return await runWithFetchDedupe(() => resolveAppPageHeadInner(options));
}
async function resolveAppPageHeadInner(options) {
	const routeSegments = options.routeSegments ?? [];
	const layoutTreePositions = options.layoutTreePositions ?? [];
	const layoutInputs = createLayoutInputs(options.layoutModules, layoutTreePositions);
	const layoutSourcePositions = layoutInputs.map((input) => input.treePosition);
	const { hasSearchParams, pageSearchParams } = collectAppPageSearchParams(options.searchParams);
	const layoutMetadataPromise = resolveLayoutMetadata(layoutInputs, options.params, routeSegments);
	const layoutViewportPromise = resolveLayoutViewport(layoutInputs, options.params, routeSegments);
	const layoutMetadataResultsForParent = layoutMetadataPromise.then((metadataResults) => metadataResults.filter(isPresent));
	layoutMetadataResultsForParent.catch(() => null);
	const pageParentPromise = layoutMetadataResultsForParent.then((metadataResults) => metadataResults.length > 0 ? mergeMetadataEntries(metadataResults.map((metadata) => ({ metadata }))) : {});
	pageParentPromise.catch(() => null);
	const pageMetadataPromise = options.pageModule ? resolveModuleMetadata(options.pageModule, options.params, pageSearchParams, pageParentPromise) : Promise.resolve(null);
	const pageViewportPromise = options.pageModule ? resolveModuleViewport(options.pageModule, options.params) : Promise.resolve(null);
	const parallelRouteHeadPromise = Promise.all((options.parallelRoutes ?? []).map((parallelRoute) => resolveParallelRouteHead(parallelRoute, options.params, routeSegments, pageSearchParams, pageParentPromise)));
	const [layoutMetadataResults, layoutViewportResults, pageMetadata, pageViewport, parallelRouteHeads] = await Promise.all([
		layoutMetadataPromise,
		layoutViewportPromise,
		pageMetadataPromise,
		pageViewportPromise,
		parallelRouteHeadPromise
	]);
	const parallelMetadataResults = parallelRouteHeads.flatMap((head) => head.metadataResults);
	const parallelViewportResults = parallelRouteHeads.flatMap((head) => head.viewportResults);
	const parallelMetadataSources = parallelRouteHeads.flatMap((head) => head.metadataSources);
	const metadataEntries = [
		...layoutMetadataResults.filter(isPresent).map((metadata) => ({ metadata })),
		...pageMetadata ? [{
			isPage: true,
			metadata: pageMetadata
		}] : [],
		...parallelMetadataResults.filter(isPresent).map((metadata) => ({
			contributesTitle: false,
			metadata
		}))
	];
	const viewportList = [
		...layoutViewportResults.filter(isPresent),
		...pageViewport ? [pageViewport] : [],
		...parallelViewportResults.filter(isPresent)
	];
	const resolvedMetadataBase = metadataEntries.length > 0 ? mergeMetadataEntries(metadataEntries) : null;
	const metadataSources = createMetadataSources(layoutMetadataResults, routeSegments, layoutSourcePositions, pageMetadata, Boolean(options.pageModule));
	metadataSources.push(...parallelMetadataSources);
	let metadata = resolvedMetadataBase;
	try {
		metadata = await applyFileBasedMetadata(resolvedMetadataBase, options.routePath, options.params, options.metadataRoutes, {
			routeSegments,
			metadataSources
		});
	} catch (error) {
		if (!options.fallbackOnFileMetadataError) throw error;
		console.error(`[vinext] File-based metadata resolution failed while rendering error boundary for ${options.routePath}:`, error);
	}
	if (metadata) metadata = postProcessMetadata(metadata);
	return {
		hasSearchParams,
		metadata,
		pageSearchParams,
		viewport: mergeViewport(viewportList)
	};
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-page-boundary.js
function resolveAppPageHttpAccessBoundaryComponent(options) {
	let boundaryModule;
	if (options.statusCode === 403) boundaryModule = options.routeForbiddenModule ?? options.rootForbiddenModule;
	else if (options.statusCode === 401) boundaryModule = options.routeUnauthorizedModule ?? options.rootUnauthorizedModule;
	else boundaryModule = options.routeNotFoundModule ?? options.rootNotFoundModule;
	return options.getDefaultExport(boundaryModule) ?? null;
}
function resolveAppPageParentHttpAccessBoundaryModule(options) {
	let routeModules = options.routeNotFoundModules;
	let rootModule = options.rootNotFoundModule;
	if (options.statusCode === 403) {
		routeModules = options.routeForbiddenModules;
		rootModule = options.rootForbiddenModule;
	} else if (options.statusCode === 401) {
		routeModules = options.routeUnauthorizedModules;
		rootModule = options.rootUnauthorizedModule;
	}
	if (routeModules) for (let index = options.layoutIndex - 1; index >= 0; index--) {
		const module = routeModules[index];
		if (module) return module;
	}
	return rootModule ?? null;
}
function resolveAppPageErrorBoundary(options) {
	const pageErrorComponent = options.getDefaultExport(options.pageErrorModule);
	if (pageErrorComponent) return {
		component: pageErrorComponent,
		isGlobalError: false
	};
	const segmentErrorModules = options.errorModules ?? options.layoutErrorModules;
	if (segmentErrorModules) for (let index = segmentErrorModules.length - 1; index >= 0; index--) {
		const segmentErrorComponent = options.getDefaultExport(segmentErrorModules[index]);
		if (segmentErrorComponent) return {
			component: segmentErrorComponent,
			isGlobalError: false
		};
	}
	const globalErrorComponent = options.getDefaultExport(options.globalErrorModule);
	return {
		component: globalErrorComponent ?? null,
		isGlobalError: Boolean(globalErrorComponent)
	};
}
function wrapAppPageBoundaryElement(options) {
	let element = options.element;
	if (!options.skipLayoutWrapping) for (let index = options.layoutModules.length - 1; index >= 0; index--) {
		const layoutComponent = options.getDefaultExport(options.layoutModules[index]);
		if (!layoutComponent) continue;
		const treePosition = options.layoutTreePositions ? options.layoutTreePositions[index] : 0;
		const asyncParams = options.makeThenableParams(resolveAppPageSegmentParams(options.routeSegments, treePosition, options.matchedParams));
		element = options.renderLayout(layoutComponent, element, asyncParams);
		if (options.isRscRequest && options.renderLayoutSegmentProvider && options.resolveChildSegments) {
			const childSegments = options.resolveChildSegments(options.routeSegments ?? [], treePosition, options.matchedParams);
			element = options.renderLayoutSegmentProvider({ children: childSegments }, element);
		}
	}
	if (options.isRscRequest && options.includeGlobalErrorBoundary && options.globalErrorComponent) element = options.renderErrorBoundary(options.globalErrorComponent, element);
	return element;
}
async function renderAppPageBoundaryResponse(options) {
	const rscStream = runWithFetchDedupe(() => options.renderToReadableStream(options.element, { onError: options.createRscOnErrorHandler() }));
	if (options.isRscRequest) {
		const headers = new Headers({
			"Content-Type": "text/x-component; charset=utf-8",
			Vary: VINEXT_RSC_VARY_HEADER
		});
		mergeMiddlewareResponseHeaders(headers, options.middlewareHeaders ?? null);
		return new Response(rscStream, {
			status: options.status,
			headers
		});
	}
	return options.createHtmlResponse(rscStream, options.status);
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-page-stream.js
function createAppPageFontData(options) {
	return {
		links: options.getLinks(),
		preloads: options.getPreloads(),
		styles: options.getStyles()
	};
}
async function renderAppPageHtmlStream(options) {
	const ssrOptions = {
		formState: options.formState ?? null,
		scriptNonce: options.scriptNonce,
		sideStream: options.sideStream,
		capturedRscDataRef: options.capturedRscDataRef,
		waitForAllReady: options.waitForAllReady
	};
	return options.ssrHandler.handleSsr(options.rscStream, options.navigationContext, options.fontData, ssrOptions);
}
/**
* Wraps a stream so that `onFlush` is called when the last byte has been read
* by the downstream consumer (i.e. when the HTTP layer finishes draining the
* response body). This is the correct place to clear per-request context,
* because the RSC/SSR pipeline is lazy — components execute while the stream
* is being consumed, not when the stream handle is first obtained.
*/
function deferUntilStreamConsumed(stream, onFlush) {
	let called = false;
	const once = () => {
		if (!called) {
			called = true;
			onFlush();
		}
	};
	const cleanup = new TransformStream({ flush() {
		once();
	} });
	const reader = stream.pipeThrough(cleanup).getReader();
	return new ReadableStream({
		pull(controller) {
			return reader.read().then(({ done, value }) => {
				if (done) controller.close();
				else controller.enqueue(value);
			}, (error) => {
				once();
				controller.error(error);
			});
		},
		cancel(reason) {
			once();
			return reader.cancel(reason);
		}
	});
}
async function renderAppPageHtmlResponse(options) {
	const safeStream = deferUntilStreamConsumed(await renderAppPageHtmlStream(options), () => {
		options.clearRequestContext();
	});
	const headers = new Headers({
		"Content-Type": "text/html; charset=utf-8",
		Vary: VINEXT_RSC_VARY_HEADER
	});
	if (options.fontLinkHeader) headers.set("Link", options.fontLinkHeader);
	mergeMiddlewareResponseHeaders(headers, options.middlewareHeaders ?? null);
	return new Response(safeStream, {
		status: options.status,
		headers
	});
}
async function renderAppPageHtmlStreamWithRecovery(options) {
	try {
		const htmlStream = await options.renderHtmlStream();
		options.onShellRendered?.();
		return {
			htmlStream,
			response: null
		};
	} catch (error) {
		const specialError = options.resolveSpecialError(error);
		if (specialError) return {
			htmlStream: null,
			response: await options.renderSpecialErrorResponse(specialError)
		};
		const boundaryResponse = await options.renderErrorBoundaryResponse(error);
		if (boundaryResponse) return {
			htmlStream: null,
			response: boundaryResponse
		};
		throw error;
	}
}
function createAppPageRscErrorTracker(baseOnError) {
	let capturedError = null;
	let capturedSpecialError = null;
	return {
		getCapturedError() {
			return capturedError;
		},
		getCapturedSpecialError() {
			return capturedSpecialError;
		},
		onRenderError(error, requestInfo, errorContext) {
			if (error && typeof error === "object" && "digest" in error) {
				if (capturedSpecialError === null) capturedSpecialError = error;
			} else capturedError = error;
			return baseOnError(error, requestInfo, errorContext);
		}
	};
}
function shouldRerenderAppPageWithGlobalError(options) {
	return Boolean(options.capturedError) && !options.hasLocalBoundary;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-page-boundary-render.js
function getDefaultExport(module) {
	return module?.default ?? null;
}
function wrapRenderedBoundaryElement(options) {
	return wrapAppPageBoundaryElement({
		element: options.element,
		getDefaultExport,
		globalErrorComponent: getDefaultExport(options.globalErrorModule),
		includeGlobalErrorBoundary: options.includeGlobalErrorBoundary,
		isRscRequest: options.isRscRequest,
		layoutModules: options.layoutModules,
		layoutTreePositions: options.layoutTreePositions,
		makeThenableParams: options.makeThenableParams,
		matchedParams: options.matchedParams,
		renderErrorBoundary(GlobalErrorComponent, children) {
			return (0, import_react_react_server.createElement)(ErrorBoundary, {
				fallback: GlobalErrorComponent,
				children
			});
		},
		renderLayout(LayoutComponent, children, asyncParams) {
			return (0, import_react_react_server.createElement)(LayoutComponent, {
				children,
				params: asyncParams
			});
		},
		renderLayoutSegmentProvider(segmentMap, children) {
			return (0, import_react_react_server.createElement)(LayoutSegmentProvider, { segmentMap }, children);
		},
		resolveChildSegments: options.resolveChildSegments,
		routeSegments: options.routeSegments ?? [],
		skipLayoutWrapping: options.skipLayoutWrapping
	});
}
function createAppPageBoundaryLayoutEntries(route, layoutModules) {
	if (!route || layoutModules.length === 0) return [];
	return createAppPageLayoutEntries({
		errors: route.errors,
		layoutTreePositions: route.layoutTreePositions,
		layouts: layoutModules,
		notFounds: null,
		routeSegments: route.routeSegments
	});
}
function resolveHttpAccessFallbackHeadRouteSegments(route, layoutModules) {
	if (!route?.routeSegments) return;
	if (!route.layouts || layoutModules.length >= route.layouts.length) return route.routeSegments;
	const lastIncludedLayoutIndex = layoutModules.length - 1;
	if (lastIncludedLayoutIndex < 0) return [];
	const segmentCount = route.layoutTreePositions?.[lastIncludedLayoutIndex] ?? 0;
	return route.routeSegments.slice(0, segmentCount);
}
function resolveHttpAccessFallbackHeadLayoutTreePositions(route, layoutModules) {
	if (!route?.layouts || layoutModules.length >= route.layouts.length) return route?.layoutTreePositions;
	return route.layoutTreePositions?.slice(0, layoutModules.length);
}
function createAppPageBoundaryRscPayload(options) {
	const routeId = AppElementsWire.encodeRouteId(options.pathname, null);
	const layoutEntries = createAppPageBoundaryLayoutEntries(options.route, options.layoutModules);
	return {
		...AppElementsWire.createMetadataEntries({
			interceptionContext: null,
			layoutIds: layoutEntries.map((entry) => entry.id),
			rootLayoutTreePath: layoutEntries[0]?.treePath ?? null,
			routeId
		}),
		[routeId]: options.element
	};
}
async function renderAppPageBoundaryElementResponse(options) {
	const pathname = new URL(options.requestUrl).pathname;
	return renderAppPageBoundaryResponse({
		async createHtmlResponse(rscStream, responseStatus) {
			const fontData = createAppPageFontData({
				getLinks: options.getFontLinks,
				getPreloads: options.getFontPreloads,
				getStyles: options.getFontStyles
			});
			const ssrHandler = await options.loadSsrHandler();
			return renderAppPageHtmlResponse({
				clearRequestContext: options.clearRequestContext,
				fontData,
				fontLinkHeader: options.buildFontLinkHeader(fontData.preloads),
				middlewareHeaders: options.middlewareContext.headers,
				navigationContext: options.getNavigationContext(),
				rscStream,
				scriptNonce: options.scriptNonce,
				ssrHandler,
				status: responseStatus
			});
		},
		createRscOnErrorHandler() {
			return options.createRscOnErrorHandler(pathname, options.routePattern ?? pathname);
		},
		element: createAppPageBoundaryRscPayload({
			element: options.element,
			layoutModules: options.layoutModules,
			pathname,
			route: options.route
		}),
		isRscRequest: options.isRscRequest,
		middlewareHeaders: options.middlewareContext.headers,
		renderToReadableStream: options.renderToReadableStream,
		status: options.status
	});
}
async function renderAppPageHttpAccessFallback(options) {
	const boundaryComponent = options.boundaryComponent ?? resolveAppPageHttpAccessBoundaryComponent({
		getDefaultExport,
		rootForbiddenModule: options.rootForbiddenModule,
		rootNotFoundModule: options.rootNotFoundModule,
		rootUnauthorizedModule: options.rootUnauthorizedModule,
		routeForbiddenModule: options.route?.forbidden,
		routeNotFoundModule: options.route?.notFound,
		routeUnauthorizedModule: options.route?.unauthorized,
		statusCode: options.statusCode
	});
	if (!boundaryComponent) return null;
	const layoutModules = options.layoutModules ?? options.route?.layouts ?? options.rootLayouts;
	const routeSegments = resolveHttpAccessFallbackHeadRouteSegments(options.route, layoutModules);
	const { metadata, viewport } = await resolveAppPageHead({
		layoutModules,
		layoutTreePositions: resolveHttpAccessFallbackHeadLayoutTreePositions(options.route, layoutModules),
		metadataRoutes: options.metadataRoutes,
		params: options.matchedParams,
		routePath: options.route?.pattern ?? new URL(options.requestUrl).pathname,
		routeSegments
	});
	const headElements = [(0, import_react_react_server.createElement)("meta", {
		charSet: "utf-8",
		key: "charset"
	}), (0, import_react_react_server.createElement)("meta", {
		content: "noindex",
		key: "robots",
		name: "robots"
	})];
	if (metadata) headElements.push((0, import_react_react_server.createElement)(MetadataHead, {
		key: "metadata",
		metadata
	}));
	headElements.push((0, import_react_react_server.createElement)(ViewportHead, {
		key: "viewport",
		viewport
	}));
	const element = wrapRenderedBoundaryElement({
		element: (0, import_react_react_server.createElement)(import_react_react_server.Fragment, null, ...headElements, (0, import_react_react_server.createElement)(boundaryComponent)),
		globalErrorModule: options.globalErrorModule,
		includeGlobalErrorBoundary: true,
		isRscRequest: options.isRscRequest,
		layoutModules,
		layoutTreePositions: options.route?.layoutTreePositions,
		makeThenableParams: options.makeThenableParams,
		matchedParams: options.matchedParams,
		resolveChildSegments: options.resolveChildSegments,
		routeSegments: options.route?.routeSegments
	});
	return renderAppPageBoundaryElementResponse({
		...options,
		element,
		layoutModules,
		route: options.route,
		routePattern: options.route?.pattern,
		status: options.statusCode
	});
}
async function renderAppPageErrorBoundary(options) {
	const errorBoundary = resolveAppPageErrorBoundary({
		getDefaultExport,
		errorModules: options.route?.errorPaths,
		globalErrorModule: options.globalErrorModule,
		layoutErrorModules: options.route?.errors,
		pageErrorModule: options.route?.error
	});
	if (!errorBoundary.component) return null;
	const rawError = options.error instanceof Error ? options.error : new Error(String(options.error));
	rewriteClientHookError(rawError);
	const errorObject = options.sanitizeErrorForClient(rawError);
	const matchedParams = options.matchedParams ?? options.route?.params ?? {};
	const layoutModules = options.route?.layouts ?? options.rootLayouts;
	const pathname = new URL(options.requestUrl).pathname;
	const headElements = [(0, import_react_react_server.createElement)("meta", {
		charSet: "utf-8",
		key: "charset"
	})];
	if (!errorBoundary.isGlobalError) try {
		const { metadata, viewport } = await resolveAppPageHead({
			fallbackOnFileMetadataError: true,
			layoutModules,
			layoutTreePositions: options.route?.layoutTreePositions,
			metadataRoutes: options.metadataRoutes,
			params: matchedParams,
			routePath: options.route?.pattern ?? pathname,
			routeSegments: options.route?.routeSegments
		});
		if (metadata) headElements.push((0, import_react_react_server.createElement)(MetadataHead, {
			key: "metadata",
			metadata
		}));
		headElements.push((0, import_react_react_server.createElement)(ViewportHead, {
			key: "viewport",
			viewport
		}));
	} catch (error) {
		console.error(`[vinext] App page error boundary head resolution failed for ${options.route?.pattern ?? pathname}:`, error);
	}
	const element = wrapRenderedBoundaryElement({
		element: (0, import_react_react_server.createElement)(import_react_react_server.Fragment, null, ...headElements, (0, import_react_react_server.createElement)(errorBoundary.component, { error: errorObject })),
		globalErrorModule: options.globalErrorModule,
		includeGlobalErrorBoundary: !errorBoundary.isGlobalError,
		isRscRequest: options.isRscRequest,
		layoutModules,
		layoutTreePositions: options.route?.layoutTreePositions,
		makeThenableParams: options.makeThenableParams,
		matchedParams,
		resolveChildSegments: options.resolveChildSegments,
		routeSegments: options.route?.routeSegments,
		skipLayoutWrapping: errorBoundary.isGlobalError
	});
	return renderAppPageBoundaryElementResponse({
		...options,
		element,
		layoutModules,
		route: options.route,
		routePattern: options.route?.pattern,
		status: 200
	});
}
var _clientHookPattern = /\b(useState|useEffect|useReducer|useRef|useContext|useLayoutEffect|useInsertionEffect|useSyncExternalStore|useTransition|useImperativeHandle|useDeferredValue|useActionState|useOptimistic|useEffectEvent)\b.*is not a function/;
function rewriteClientHookError(error) {
	const match = error.message.match(_clientHookPattern);
	if (match) error.message = buildClientHookErrorMessage(`${match[1]}()`);
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-fallback-renderer.js
var EMPTY_MW_CTX = {
	headers: null,
	status: null
};
function createAppFallbackRenderer(options) {
	const { clearRequestContext, createRscOnErrorHandler: buildRscOnErrorHandler, fontProviders, getNavigationContext, globalErrorModule, makeThenableParams, metadataRoutes, resolveChildSegments, rootBoundaries, rscRenderer, sanitizer, ssrLoader } = options;
	const { rootForbiddenModule, rootLayouts, rootNotFoundModule, rootUnauthorizedModule } = rootBoundaries;
	return {
		renderHttpAccessFallback(route, statusCode, isRscRequest, request, opts, scriptNonce, middlewareContext) {
			return renderAppPageHttpAccessFallback({
				boundaryComponent: opts?.boundaryComponent ?? null,
				buildFontLinkHeader: fontProviders.buildFontLinkHeader,
				clearRequestContext,
				createRscOnErrorHandler(pathname, routePath) {
					return buildRscOnErrorHandler(request, pathname, routePath);
				},
				getFontLinks: fontProviders.getFontLinks,
				getFontPreloads: fontProviders.getFontPreloads,
				getFontStyles: fontProviders.getFontStyles,
				getNavigationContext,
				globalErrorModule,
				isRscRequest,
				layoutModules: opts?.layouts ?? null,
				loadSsrHandler: ssrLoader,
				makeThenableParams,
				matchedParams: opts?.matchedParams ?? route?.params ?? {},
				middlewareContext: middlewareContext ?? EMPTY_MW_CTX,
				metadataRoutes,
				requestUrl: request.url,
				resolveChildSegments,
				rootForbiddenModule,
				rootLayouts,
				rootNotFoundModule,
				rootUnauthorizedModule,
				route,
				renderToReadableStream: rscRenderer,
				scriptNonce,
				statusCode
			});
		},
		renderNotFound(route, isRscRequest, request, matchedParams, scriptNonce, middlewareContext) {
			return this.renderHttpAccessFallback(route, 404, isRscRequest, request, { matchedParams }, scriptNonce, middlewareContext);
		},
		renderErrorBoundary(route, error, isRscRequest, request, matchedParams, scriptNonce, middlewareContext) {
			return renderAppPageErrorBoundary({
				buildFontLinkHeader: fontProviders.buildFontLinkHeader,
				clearRequestContext,
				createRscOnErrorHandler(pathname, routePath) {
					return buildRscOnErrorHandler(request, pathname, routePath);
				},
				error,
				getFontLinks: fontProviders.getFontLinks,
				getFontPreloads: fontProviders.getFontPreloads,
				getFontStyles: fontProviders.getFontStyles,
				getNavigationContext,
				globalErrorModule,
				isRscRequest,
				loadSsrHandler: ssrLoader,
				makeThenableParams,
				matchedParams: matchedParams ?? route?.params ?? {},
				middlewareContext: middlewareContext ?? EMPTY_MW_CTX,
				metadataRoutes,
				requestUrl: request.url,
				resolveChildSegments,
				rootLayouts,
				route,
				renderToReadableStream: rscRenderer,
				sanitizeErrorForClient: sanitizer,
				scriptNonce
			});
		}
	};
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-page-element-builder.js
/**
* Build the App Router element tree for a matched route.
*
* This is the central element-construction path for the App Router RSC
* handler. It resolves page head metadata (including parallel route metadata),
* creates the page React element, and wires it into the nested layout +
* boundary tree via {@link buildAppPageElements}.
*
* The function is extracted from the generated RSC entry template so it can
* be unit-tested independently of the code-generation machinery.
*
* Next.js equivalent: the component tree construction in
* {@link https://github.com/vercel/next.js/blob/canary/packages/next/src/server/app-render/create-component-tree.tsx|create-component-tree.tsx}
* and the page head resolution in
* {@link https://github.com/vercel/next.js/blob/canary/packages/next/src/server/app-render/create-metadata.tsx|create-metadata.tsx}.
*/
async function buildPageElements$1(options) {
	const { route, params, routePath, pageRequest, globalErrorModule, rootNotFoundModule, rootForbiddenModule, rootUnauthorizedModule, metadataRoutes } = options;
	const { opts, searchParams, isRscRequest, mountedSlotsHeader, renderMode = APP_RSC_RENDER_MODE_NAVIGATION } = pageRequest;
	const pageModule = route.page;
	const PageComponent = pageModule?.default;
	if (!!pageModule && !PageComponent) {
		const interceptionContext = opts?.interceptionContext ?? null;
		const noExportRouteId = AppElementsWire.encodeRouteId(routePath, interceptionContext);
		let noExportRootLayout = null;
		const noExportLayoutIds = route.ids?.layouts ?? route.layouts.map((_, index) => AppElementsWire.encodeLayoutId(createAppPageTreePath(route.routeSegments, route.layoutTreePositions?.[index] ?? 0)));
		if (route.layouts?.length > 0) {
			const treePosition = route.layoutTreePositions?.[0] ?? 0;
			noExportRootLayout = createAppPageTreePath(route.routeSegments, treePosition);
		}
		return {
			...AppElementsWire.createMetadataEntries({
				interceptionContext,
				layoutIds: noExportLayoutIds,
				rootLayoutTreePath: noExportRootLayout,
				routeId: noExportRouteId
			}),
			[noExportRouteId]: (0, import_react_react_server.createElement)("div", null, "Page has no default export")
		};
	}
	const { hasSearchParams, metadata: resolvedMetadata, pageSearchParams, viewport: resolvedViewport } = await resolveAppPageHead({
		layoutModules: route.layouts,
		layoutTreePositions: route.layoutTreePositions,
		metadataRoutes,
		pageModule: route.page ?? null,
		parallelRoutes: resolveActiveParallelRouteHeadInputs({
			interceptLayouts: opts?.interceptLayouts ?? null,
			interceptPage: opts?.interceptPage ?? null,
			interceptParams: opts?.interceptParams ?? null,
			interceptSlotKey: opts?.interceptSlotKey ?? null,
			params,
			routeSegments: route.routeSegments ?? [],
			slots: route.slots ?? null
		}),
		params,
		routePath: route.pattern,
		routeSegments: route.routeSegments ?? null,
		searchParams
	});
	const pageProps = { params: makeThenableParams(params) };
	if (searchParams) {
		pageProps.searchParams = makeThenableParams(pageSearchParams);
		if (hasSearchParams) markDynamicUsage();
	}
	const mountedSlotIds = mountedSlotsHeader ? new Set(mountedSlotsHeader.split(" ")) : null;
	const slotOverrides = buildSlotOverrides(route, params, routePath, opts);
	return buildAppPageElements({
		element: PageComponent ? (0, import_react_react_server.createElement)(PageComponent, pageProps) : null,
		globalErrorModule: globalErrorModule ?? null,
		isRscRequest,
		mountedSlotIds,
		makeThenableParams,
		matchedParams: params,
		resolvedMetadata,
		resolvedViewport,
		interceptionContext: opts?.interceptionContext ?? null,
		routePath,
		rootNotFoundModule: rootNotFoundModule ?? null,
		rootForbiddenModule: rootForbiddenModule ?? null,
		rootUnauthorizedModule: rootUnauthorizedModule ?? null,
		route,
		slotOverrides,
		renderMode
	});
}
/**
* Build the per-request `slotOverrides` map. Combines:
*  - Interception overrides (existing behavior — swap in the intercepting page
*    and its layouts when the request is intercepted into this slot).
*  - Slot-specific param extraction for inherited slots whose URL pattern
*    has different param names than the route's. The runtime matches the
*    cleaned request path against `slot.slotPatternParts` to produce
*    slot-scoped params, which `app-page-route-wiring` then hands to the
*    slot page instead of the route's matched params.
*
* `routePath` is the already-normalized request pathname (basePath stripped,
* RSC suffix removed). Re-parsing `request.url` here would re-introduce the
* basePath and silently break the match for any app that configures one.
*/
function buildSlotOverrides(route, routeParams, routePath, opts) {
	const overrides = {};
	if (opts && opts.interceptSlotKey && opts.interceptPage) overrides[opts.interceptSlotKey] = {
		layoutModules: opts.interceptLayouts || null,
		pageModule: opts.interceptPage,
		params: opts.interceptParams || routeParams
	};
	const slots = route.slots;
	if (slots) {
		let urlParts = null;
		const routeParamSet = collectParamNameSet(route.params);
		for (const [slotKey, slot] of Object.entries(slots)) {
			const patternParts = slot.slotPatternParts;
			const paramNames = slot.slotParamNames;
			if (!patternParts || patternParts.length === 0) continue;
			if (paramNames && paramNames.every((name) => routeParamSet.has(name))) continue;
			if (urlParts === null) urlParts = routePath.split("/").filter(Boolean);
			const matched = matchRoutePattern(urlParts, patternParts);
			if (!matched) continue;
			const existing = overrides[slotKey];
			overrides[slotKey] = existing ? {
				...existing,
				params: matched
			} : { params: matched };
		}
	}
	return Object.keys(overrides).length > 0 ? overrides : null;
}
function collectParamNameSet(params) {
	const set = /* @__PURE__ */ new Set();
	if (params) for (const name of params) set.add(name);
	return set;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/isr-cache.js
/**
* ISR (Incremental Static Regeneration) cache layer.
*
* Wraps the pluggable CacheHandler with stale-while-revalidate semantics:
* - Fresh hit: serve immediately
* - Stale hit: serve immediately + trigger background regeneration
* - Miss: render synchronously, cache, serve
*
* Background regeneration is deduped — only one regeneration per cache key
* runs at a time, preventing thundering herd on popular pages.
*
* This layer works with any CacheHandler backend (memory, Redis, KV, etc.)
* because it only uses the standard get/set interface.
*/
/**
* Get a cache entry with staleness information.
*
* Returns { value, isStale: false } for fresh entries,
* { value, isStale: true } for expired-but-usable entries,
* or null for cache misses.
*/
async function isrGet(key) {
	const result = await getCacheHandler().get(key);
	if (!result || !result.value) return null;
	if (result.cacheState === "expired") return null;
	return {
		value: result,
		isStale: result.cacheState === "stale"
	};
}
/**
* Store a value in the ISR cache with a revalidation period.
*/
async function isrSet(key, data, revalidateSeconds, tags, expireSeconds) {
	await getCacheHandler().set(key, data, {
		cacheControl: expireSeconds === void 0 ? { revalidate: revalidateSeconds } : {
			revalidate: revalidateSeconds,
			expire: expireSeconds
		},
		revalidate: revalidateSeconds,
		tags: tags ?? []
	});
}
var _PENDING_REGEN_KEY = Symbol.for("vinext.isrCache.pendingRegenerations");
var _g$1 = globalThis;
var pendingRegenerations = _g$1[_PENDING_REGEN_KEY] ??= /* @__PURE__ */ new Map();
/**
* Trigger a background regeneration for a cache key.
*
* If a regeneration for this key is already in progress, this is a no-op.
* The renderFn should produce the new cache value and call isrSet internally.
*
* On Cloudflare Workers the regeneration promise is registered with
* `ctx.waitUntil()` via the ALS-backed ExecutionContext, keeping the isolate
* alive until the regeneration completes even after the Response is returned.
*
* When `errorContext` is provided and the render function fails, the error
* is reported via `reportRequestError` (instrumentation hook) with
* `revalidateReason: "stale"`.
*/
function triggerBackgroundRegeneration(key, renderFn, errorContext) {
	if (pendingRegenerations.has(key)) return;
	const promise = renderFn().catch((err) => {
		console.error(`[vinext] ISR background regeneration failed for ${key}:`, err);
		if (errorContext) reportRequestError(err instanceof Error ? err : new Error(String(err)), {
			path: key,
			method: "GET",
			headers: {}
		}, {
			routerKind: errorContext.routerKind,
			routePath: errorContext.routePath,
			routeType: errorContext.routeType,
			revalidateReason: "stale"
		});
	}).finally(() => {
		pendingRegenerations.delete(key);
	});
	pendingRegenerations.set(key, promise);
	getRequestExecutionContext()?.waitUntil(promise);
}
/**
* Build a CachedAppPageValue for the App Router ISR cache.
*/
function buildAppPageCacheValue(html, rscData, status) {
	return {
		kind: "APP_PAGE",
		html,
		rscData,
		headers: void 0,
		postponed: void 0,
		status
	};
}
function normalizeCachePathname(pathname) {
	return pathname === "/" ? "/" : pathname.replace(/\/$/, "");
}
function buildCacheKey(prefix, pathname, suffix) {
	const normalized = normalizeCachePathname(pathname);
	const suffixPart = suffix ? `:${suffix}` : "";
	const key = `${prefix}:${normalized}${suffixPart}`;
	if (key.length <= 200) return key;
	return `${prefix}:__hash:${fnv1a64(normalized)}${suffixPart}`;
}
/**
* Compute an App Router ISR key for one cache artifact.
*
* App pages store HTML, RSC payloads, and route-handler responses separately.
* The suffix mirrors Next.js's separate on-disk app artifacts while keeping the
* Cloudflare KV key under its 512-byte limit for long pathnames.
*/
function appIsrCacheKey(pathname, suffix, buildId = "398d0a0d-0356-4371-b55b-58927a68fa1c") {
	return buildCacheKey(buildId ? `app:${buildId}` : "app", pathname, suffix);
}
function appIsrHtmlKey(pathname) {
	return appIsrCacheKey(pathname, "html");
}
/**
* Build the ISR cache key for an RSC payload.
*
* Note: the key format changed from `rsc:<hash>` to `rsc:slots:<hash>` (and
* optionally `rsc:slots:<hash>:preserve-ui`). Existing cached entries under
* the old format will become unreachable after deployment. This is acceptable
* because ISR entries have TTLs and will be regenerated on the next request.
*/
function appIsrRscKey(pathname, mountedSlotsHeader, renderMode = APP_RSC_RENDER_MODE_NAVIGATION) {
	const normalizedMountedSlotsHeader = normalizeMountedSlotsHeader(mountedSlotsHeader);
	const variant = [normalizedMountedSlotsHeader ? `slots:${fnv1a64(normalizedMountedSlotsHeader)}` : null, shouldUsePreserveUiCacheVariant(renderMode) ? "preserve-ui" : null].filter((part) => part !== null).join(":");
	return appIsrCacheKey(pathname, variant ? `rsc:${variant}` : "rsc");
}
function appIsrRouteKey(pathname) {
	return appIsrCacheKey(pathname, "route");
}
var _REVALIDATE_KEY = Symbol.for("vinext.isrCache.revalidateDurations");
_g$1[_REVALIDATE_KEY] ??= /* @__PURE__ */ new Map();
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-page-cache.js
var NO_STORE_CACHE_CONTROL = "no-store, must-revalidate";
function buildAppPageCacheControl(cacheState, revalidateSeconds, expireSeconds) {
	return buildCachedRevalidateCacheControl(cacheState, revalidateSeconds, expireSeconds);
}
function buildAppPageCachedHeaders(options) {
	const headers = new Headers({
		"Cache-Control": options.cacheControl,
		"Content-Type": options.contentType,
		Vary: VINEXT_RSC_VARY_HEADER,
		[VINEXT_CACHE_HEADER]: options.cacheState
	});
	if (options.mountedSlotsHeader) headers.set(VINEXT_MOUNTED_SLOTS_HEADER, options.mountedSlotsHeader);
	mergeMiddlewareResponseHeaders(headers, options.middlewareHeaders ?? null);
	return headers;
}
function getCachedAppPageValue(entry) {
	return entry?.value.value && entry.value.value.kind === "APP_PAGE" ? entry.value.value : null;
}
function resolveAppPageCacheWritePolicy(options) {
	let revalidateSeconds = options.revalidateSeconds;
	let expireSeconds = options.expireSeconds;
	const requestCacheLife = options.requestCacheLife;
	if (requestCacheLife?.revalidate !== void 0) revalidateSeconds = revalidateSeconds === null ? requestCacheLife.revalidate : Math.min(revalidateSeconds, requestCacheLife.revalidate);
	if (requestCacheLife?.expire !== void 0) expireSeconds = requestCacheLife.expire;
	if (revalidateSeconds === null || revalidateSeconds <= 0 || !Number.isFinite(revalidateSeconds)) return null;
	return {
		expireSeconds,
		revalidateSeconds
	};
}
function buildAppPageCachedResponse(cachedValue, options) {
	const status = options.middlewareStatus ?? (cachedValue.status || 200);
	const revalidateSeconds = options.cacheControl?.revalidate ?? options.revalidateSeconds;
	const expireSeconds = options.cacheControl === void 0 ? void 0 : options.cacheControl.expire ?? options.expireSeconds;
	const cacheControl = buildAppPageCacheControl(options.cacheState, revalidateSeconds, expireSeconds);
	if (options.isRscRequest) {
		if (!cachedValue.rscData) return null;
		const rscHeaders = buildAppPageCachedHeaders({
			cacheControl,
			cacheState: options.cacheState,
			contentType: "text/x-component; charset=utf-8",
			middlewareHeaders: options.middlewareHeaders,
			mountedSlotsHeader: options.mountedSlotsHeader
		});
		return new Response(cachedValue.rscData, {
			status,
			headers: rscHeaders
		});
	}
	if (typeof cachedValue.html !== "string" || cachedValue.html.length === 0) return null;
	const htmlHeaders = buildAppPageCachedHeaders({
		cacheControl,
		cacheState: options.cacheState,
		contentType: "text/html; charset=utf-8",
		middlewareHeaders: options.middlewareHeaders
	});
	return new Response(cachedValue.html, {
		status,
		headers: htmlHeaders
	});
}
async function readAppPageCacheResponse(options) {
	const isrKey = options.isRscRequest ? options.isrRscKey(options.cleanPathname, options.mountedSlotsHeader, options.renderMode) : options.isrHtmlKey(options.cleanPathname);
	try {
		const cached = await options.isrGet(isrKey);
		const cachedValue = getCachedAppPageValue(cached);
		if (cachedValue && !cached?.isStale) {
			const hitResponse = buildAppPageCachedResponse(cachedValue, {
				cacheState: "HIT",
				cacheControl: cached?.value.cacheControl,
				expireSeconds: options.expireSeconds,
				isRscRequest: options.isRscRequest,
				middlewareHeaders: options.middlewareHeaders,
				middlewareStatus: options.middlewareStatus,
				mountedSlotsHeader: options.mountedSlotsHeader,
				revalidateSeconds: options.revalidateSeconds
			});
			if (hitResponse) {
				options.isrDebug?.(options.isRscRequest ? "HIT (RSC)" : "HIT (HTML)", options.cleanPathname);
				options.clearRequestContext();
				return hitResponse;
			}
			options.isrDebug?.("MISS (empty cached entry)", options.cleanPathname);
		}
		if (cached?.isStale && cachedValue) {
			const regenerationKey = options.isRscRequest ? options.isrRscKey(options.cleanPathname, options.mountedSlotsHeader, options.renderMode) : options.isrHtmlKey(options.cleanPathname);
			options.scheduleBackgroundRegeneration(regenerationKey, async () => {
				const revalidatedPage = await options.renderFreshPageForCache();
				const revalidateSeconds = revalidatedPage.cacheControl?.revalidate ?? options.revalidateSeconds;
				const expireSeconds = revalidatedPage.cacheControl?.expire ?? options.expireSeconds;
				const writes = [options.isrSet(options.isrRscKey(options.cleanPathname, options.mountedSlotsHeader, options.renderMode), buildAppPageCacheValue("", revalidatedPage.rscData, 200), revalidateSeconds, revalidatedPage.tags, expireSeconds)];
				if (!options.isRscRequest) writes.push(options.isrSet(options.isrHtmlKey(options.cleanPathname), buildAppPageCacheValue(revalidatedPage.html, void 0, 200), revalidateSeconds, revalidatedPage.tags, expireSeconds));
				await Promise.all(writes);
				options.isrDebug?.("regen complete", options.cleanPathname);
			});
			const staleResponse = buildAppPageCachedResponse(cachedValue, {
				cacheState: "STALE",
				cacheControl: cached.value.cacheControl,
				expireSeconds: options.expireSeconds,
				isRscRequest: options.isRscRequest,
				middlewareHeaders: options.middlewareHeaders,
				middlewareStatus: options.middlewareStatus,
				mountedSlotsHeader: options.mountedSlotsHeader,
				revalidateSeconds: options.revalidateSeconds
			});
			if (staleResponse) {
				options.isrDebug?.(options.isRscRequest ? "STALE (RSC)" : "STALE (HTML)", options.cleanPathname);
				options.clearRequestContext();
				return staleResponse;
			}
			options.isrDebug?.("STALE MISS (empty stale entry)", options.cleanPathname);
		}
		if (!cached) options.isrDebug?.("MISS (no cache entry)", options.cleanPathname);
	} catch (isrReadError) {
		console.error("[vinext] ISR cache read error:", isrReadError);
	}
	return null;
}
function finalizeAppPageHtmlCacheResponse(response, options) {
	if (!response.body) return response;
	const [streamForClient, streamForCache] = response.body.tee();
	const htmlKey = options.isrHtmlKey(options.cleanPathname);
	const rscKey = options.isrRscKey(options.cleanPathname, null);
	const clientHeaders = new Headers(response.headers);
	if (options.preserveClientResponseHeaders !== true) {
		clientHeaders.set("Cache-Control", NO_STORE_CACHE_CONTROL);
		clientHeaders.set(VINEXT_CACHE_HEADER, "MISS");
	}
	const cachePromise = (async () => {
		try {
			const cachedHtml = await readStreamAsText(streamForCache);
			if (options.capturedDynamicUsageBeforeContextCleanup?.() === true || options.consumeDynamicUsage()) {
				options.isrDebug?.("HTML cache write skipped (dynamic usage during render)", htmlKey);
				return;
			}
			const cachePolicy = resolveAppPageCacheWritePolicy({
				expireSeconds: options.expireSeconds,
				requestCacheLife: options.getRequestCacheLife?.(),
				revalidateSeconds: options.revalidateSeconds
			});
			if (!cachePolicy) {
				options.isrDebug?.("HTML cache write skipped (no cache policy)", htmlKey);
				return;
			}
			const pageTags = options.getPageTags();
			const writes = [options.isrSet(htmlKey, buildAppPageCacheValue(cachedHtml, void 0, 200), cachePolicy.revalidateSeconds, pageTags, cachePolicy.expireSeconds)];
			if (options.capturedRscDataPromise) writes.push(options.capturedRscDataPromise.then((rscData) => options.isrSet(rscKey, buildAppPageCacheValue("", rscData, 200), cachePolicy.revalidateSeconds, pageTags, cachePolicy.expireSeconds)));
			await Promise.all(writes);
			options.isrDebug?.("HTML cache written", htmlKey);
		} catch (cacheError) {
			console.error("[vinext] ISR cache write error:", cacheError);
		}
	})();
	options.waitUntil?.(cachePromise);
	return new Response(streamForClient, {
		status: response.status,
		statusText: response.statusText,
		headers: clientHeaders
	});
}
function finalizeAppPageRscCacheResponse(response, options) {
	if (!scheduleAppPageRscCacheWrite(options)) return response;
	if (options.preserveClientResponseHeaders === true) return response;
	const clientHeaders = new Headers(response.headers);
	clientHeaders.set("Cache-Control", NO_STORE_CACHE_CONTROL);
	clientHeaders.set(VINEXT_CACHE_HEADER, "MISS");
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: clientHeaders
	});
}
function scheduleAppPageRscCacheWrite(options) {
	const capturedRscDataPromise = options.capturedRscDataPromise;
	if (!capturedRscDataPromise || options.dynamicUsedDuringBuild) return false;
	const rscKey = options.isrRscKey(options.cleanPathname, options.mountedSlotsHeader, options.renderMode);
	const cachePromise = (async () => {
		try {
			const rscData = await capturedRscDataPromise;
			if (options.consumeDynamicUsage()) {
				options.isrDebug?.("RSC cache write skipped (dynamic usage during render)", rscKey);
				return;
			}
			const cachePolicy = resolveAppPageCacheWritePolicy({
				expireSeconds: options.expireSeconds,
				requestCacheLife: options.getRequestCacheLife?.(),
				revalidateSeconds: options.revalidateSeconds
			});
			if (!cachePolicy) {
				options.isrDebug?.("RSC cache write skipped (no cache policy)", rscKey);
				return;
			}
			await options.isrSet(rscKey, buildAppPageCacheValue("", rscData, 200), cachePolicy.revalidateSeconds, options.getPageTags(), cachePolicy.expireSeconds);
			options.isrDebug?.("RSC cache written", rscKey);
		} catch (cacheError) {
			console.error("[vinext] ISR RSC cache write error:", cacheError);
		}
	})();
	options.waitUntil?.(cachePromise);
	return true;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-page-method.js
function isNonGetOrHead(method) {
	const normalizedMethod = method.toUpperCase();
	return normalizedMethod !== "GET" && normalizedMethod !== "HEAD";
}
function isStaticOrSsgAppPageCandidate(options) {
	if (options.dynamicConfig === "force-dynamic" || options.revalidateSeconds === 0) return false;
	if (options.dynamicConfig === "force-static" || options.dynamicConfig === "error") return true;
	if (options.revalidateSeconds !== null && options.revalidateSeconds > 0) return true;
	if (options.hasGenerateStaticParams) return true;
	return !options.isDynamicRoute;
}
function resolveAppPageMethodResponse(options) {
	if (!isNonGetOrHead(options.request.method)) return null;
	if (isPossibleAppRouteActionRequest(options.request)) return null;
	if (!isStaticOrSsgAppPageCandidate(options)) return null;
	const headers = new Headers();
	mergeMiddlewareResponseHeaders(headers, options.middlewareHeaders ?? null);
	return methodNotAllowedResponse("GET, HEAD", { headers });
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-page-probe.js
async function probeAppPageBeforeRender(options) {
	let layoutFlags = {};
	if (options.layoutCount > 0) {
		const layoutProbeResult = await probeAppPageLayouts({
			layoutCount: options.layoutCount,
			async onLayoutError(layoutError, layoutIndex) {
				const specialError = options.resolveSpecialError(layoutError);
				if (!specialError) return null;
				return options.renderLayoutSpecialError(specialError, layoutIndex);
			},
			probeLayoutAt: options.probeLayoutAt,
			runWithSuppressedHookWarning(probe) {
				return options.runWithSuppressedHookWarning(probe);
			},
			classification: options.classification
		});
		layoutFlags = layoutProbeResult.layoutFlags;
		if (layoutProbeResult.response) return {
			response: layoutProbeResult.response,
			layoutFlags
		};
	}
	if (options.hasLoadingBoundary) return {
		response: null,
		layoutFlags
	};
	return {
		response: await probeAppPageComponent({
			awaitAsyncResult: true,
			async onError(pageError) {
				const specialError = options.resolveSpecialError(pageError);
				if (specialError) return options.renderPageSpecialError(specialError);
				return null;
			},
			probePage: options.probePage,
			runWithSuppressedHookWarning(probe) {
				return options.runWithSuppressedHookWarning(probe);
			}
		}),
		layoutFlags
	};
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-page-render.js
function buildResponseTiming(options) {
	if (options.isProduction) return;
	return {
		compileEnd: options.compileEnd,
		handlerStart: options.handlerStart,
		renderEnd: options.renderEnd,
		responseKind: options.responseKind
	};
}
function readRequestCacheLifeForPrerender(options) {
	return options.peekRequestCacheLife?.() ?? options.getRequestCacheLife();
}
function applyRequestCacheLife(options) {
	let revalidateSeconds = options.revalidateSeconds;
	let expireSeconds = options.expireSeconds;
	const requestCacheLife = options.requestCacheLife;
	if (requestCacheLife?.revalidate !== void 0) revalidateSeconds = revalidateSeconds === null ? requestCacheLife.revalidate : Math.min(revalidateSeconds, requestCacheLife.revalidate);
	if (requestCacheLife?.expire !== void 0) expireSeconds = requestCacheLife.expire;
	return {
		expireSeconds,
		revalidateSeconds
	};
}
function readRootBoundaryId(element) {
	const rootLayoutTreePath = element[AppElementsWire.keys.rootLayout];
	return typeof rootLayoutTreePath === "string" ? rootLayoutTreePath : null;
}
function createAppPageArtifactCompatibility(element, routePattern) {
	if (!isAppElementsRecord(element)) return;
	const rootBoundaryId = readRootBoundaryId(element);
	return createArtifactCompatibilityEnvelope({
		graphVersion: createArtifactCompatibilityGraphVersion({
			routePattern,
			rootBoundaryId
		}),
		deploymentVersion: "398d0a0d-0356-4371-b55b-58927a68fa1c",
		rootBoundaryId
	});
}
/**
* Wraps an RSC response body to report invalid dynamic usage errors after the
* stream is fully consumed. In dev mode, errors from cookies()/headers() inside
* "use cache" may be caught by user try/catch and silently swallowed — this
* wrapper waits for the stream to drain and surfaces any recorded error to the
* terminal (and, via HMR, the browser dev overlay).
* Ported from Next.js: https://github.com/vercel/next.js/commit/f5e54c06726b571a042fce67417e40a29f6b8689
*/
function wrapRscResponseForDevErrorReporting(response, consumeInvalidDynamicUsageError) {
	const originalBody = response.body;
	if (!originalBody) return response;
	let consumed = false;
	const onConsumed = () => {
		if (consumed) return;
		consumed = true;
		const error = consumeInvalidDynamicUsageError();
		if (error) console.error("[vinext] Invalid dynamic usage:", error);
	};
	const cleanup = new TransformStream({ flush() {
		onConsumed();
	} });
	const reader = originalBody.pipeThrough(cleanup).getReader();
	const wrappedStream = new ReadableStream({
		pull(controller) {
			return reader.read().then(({ done, value }) => {
				if (done) controller.close();
				else controller.enqueue(value);
			}, (streamError) => {
				onConsumed();
				controller.error(streamError);
			});
		},
		cancel(reason) {
			onConsumed();
			return reader.cancel(reason);
		}
	});
	return new Response(wrappedStream, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});
}
async function renderAppPageLifecycle(options) {
	const preRenderResult = await probeAppPageBeforeRender({
		hasLoadingBoundary: options.hasLoadingBoundary,
		layoutCount: options.layoutCount,
		probeLayoutAt(layoutIndex) {
			return options.probeLayoutAt(layoutIndex);
		},
		probePage() {
			return options.probePage();
		},
		renderLayoutSpecialError(specialError, layoutIndex) {
			return options.renderLayoutSpecialError(specialError, layoutIndex);
		},
		renderPageSpecialError(specialError) {
			return options.renderPageSpecialError(specialError);
		},
		resolveSpecialError: resolveAppPageSpecialError,
		runWithSuppressedHookWarning(probe) {
			return options.runWithSuppressedHookWarning(probe);
		},
		classification: options.classification
	});
	if (preRenderResult.response) return preRenderResult.response;
	const layoutFlags = preRenderResult.layoutFlags;
	const artifactCompatibility = createAppPageArtifactCompatibility(options.element, options.routePattern);
	const outgoingElement = AppElementsWire.encodeOutgoingPayload({
		element: options.element,
		layoutFlags,
		...artifactCompatibility ? { artifactCompatibility } : {}
	});
	const compileEnd = options.isProduction ? void 0 : performance.now();
	const rscErrorTracker = createAppPageRscErrorTracker(options.createRscOnErrorHandler(options.cleanPathname, options.routePattern));
	const rscStream = runWithFetchDedupe(() => options.renderToReadableStream(outgoingElement, { onError: rscErrorTracker.onRenderError }));
	let revalidateSeconds = options.revalidateSeconds;
	let expireSeconds = options.expireSeconds;
	const shouldCaptureRscForCacheMetadata = options.isProgressiveActionRender !== true && (options.isProduction || options.isPrerender === true) && (revalidateSeconds === null || revalidateSeconds > 0 && revalidateSeconds !== Infinity) && !options.isDraftMode && !options.isForceDynamic;
	const rscCapture = teeAppPageRscStreamForCapture(rscStream, shouldCaptureRscForCacheMetadata);
	const rscForResponse = rscCapture.ssrStream;
	const capturedRscDataRef = { value: null };
	if (rscCapture.sideStream && options.isRscRequest) capturedRscDataRef.value = readAppPageBinaryStream(rscCapture.sideStream);
	if (options.isRscRequest) {
		if (options.isPrerender === true) {
			await settleCapturedRscRenderForCacheMetadata(capturedRscDataRef.value);
			({expireSeconds, revalidateSeconds} = applyRequestCacheLife({
				expireSeconds,
				requestCacheLife: readRequestCacheLifeForPrerender(options),
				revalidateSeconds
			}));
		}
		const dynamicUsedDuringBuild = options.consumeDynamicUsage();
		const rscResponsePolicy = resolveAppPageRscResponsePolicy({
			dynamicUsedDuringBuild,
			isDraftMode: options.isDraftMode,
			isDynamicError: options.isDynamicError,
			isForceDynamic: options.isForceDynamic,
			isForceStatic: options.isForceStatic,
			isProduction: options.isProduction,
			expireSeconds,
			revalidateSeconds
		});
		const rscResponse = buildAppPageRscResponse(rscForResponse, {
			middlewareContext: options.middlewareContext,
			mountedSlotsHeader: options.mountedSlotsHeader,
			params: options.params,
			policy: rscResponsePolicy,
			timing: buildResponseTiming({
				compileEnd,
				handlerStart: options.handlerStart,
				isProduction: options.isProduction,
				responseKind: "rsc"
			})
		});
		return finalizeAppPageRscCacheResponse(!options.isProduction && rscResponse.body && options.consumeInvalidDynamicUsageError ? wrapRscResponseForDevErrorReporting(rscResponse, options.consumeInvalidDynamicUsageError) : rscResponse, {
			capturedRscDataPromise: options.isProduction && shouldCaptureRscForCacheMetadata ? capturedRscDataRef.value : null,
			cleanPathname: options.cleanPathname,
			consumeDynamicUsage: options.consumeDynamicUsage,
			dynamicUsedDuringBuild,
			getPageTags() {
				return options.getPageTags();
			},
			getRequestCacheLife() {
				return options.getRequestCacheLife();
			},
			isrDebug: options.isrDebug,
			isrRscKey: options.isrRscKey,
			isrSet: options.isrSet,
			mountedSlotsHeader: options.mountedSlotsHeader,
			renderMode: options.renderMode,
			preserveClientResponseHeaders: rscResponsePolicy.cacheState !== "MISS",
			expireSeconds,
			revalidateSeconds,
			waitUntil(promise) {
				options.waitUntil?.(promise);
			}
		});
	}
	const fontData = createAppPageFontData({
		getLinks: options.getFontLinks,
		getPreloads: options.getFontPreloads,
		getStyles: options.getFontStyles
	});
	const fontLinkHeader = buildAppPageFontLinkHeader(fontData.preloads);
	let renderEnd;
	const htmlRender = await renderAppPageHtmlStreamWithRecovery({
		onShellRendered() {
			if (!options.isProduction) renderEnd = performance.now();
		},
		renderErrorBoundaryResponse(error) {
			return options.renderErrorBoundaryResponse(error);
		},
		async renderHtmlStream() {
			const ssrHandler = await options.loadSsrHandler();
			return renderAppPageHtmlStream({
				capturedRscDataRef,
				fontData,
				navigationContext: options.getNavigationContext(),
				formState: options.formState ?? null,
				rscStream: rscForResponse,
				scriptNonce: options.scriptNonce,
				sideStream: rscCapture.sideStream,
				ssrHandler,
				waitForAllReady: options.isPrerender
			});
		},
		renderSpecialErrorResponse(specialError) {
			return options.renderPageSpecialError(specialError);
		},
		resolveSpecialError: resolveAppPageSpecialError
	});
	if (htmlRender.response) return htmlRender.response;
	const htmlStream = htmlRender.htmlStream;
	if (!htmlStream) throw new Error("[vinext] Expected an HTML stream when no fallback response was returned");
	if (options.hasLoadingBoundary) {
		const captured = rscErrorTracker.getCapturedSpecialError();
		if (captured) {
			const specialError = resolveAppPageSpecialError(captured);
			if (specialError) {
				htmlStream.cancel().catch(() => {});
				return options.renderPageSpecialError(specialError);
			}
		}
	}
	if (shouldRerenderAppPageWithGlobalError({
		capturedError: rscErrorTracker.getCapturedError(),
		hasLocalBoundary: options.routeHasLocalBoundary
	})) {
		const cleanResponse = await options.renderErrorBoundaryResponse(rscErrorTracker.getCapturedError());
		if (cleanResponse) return cleanResponse;
	}
	if (options.isPrerender === true) {
		await settleCapturedRscRenderForCacheMetadata(capturedRscDataRef.value);
		({expireSeconds, revalidateSeconds} = applyRequestCacheLife({
			expireSeconds,
			requestCacheLife: readRequestCacheLifeForPrerender(options),
			revalidateSeconds
		}));
	}
	const draftCookie = options.getDraftModeCookieHeader();
	const dynamicUsedDuringRender = options.consumeDynamicUsage();
	let dynamicUsedBeforeContextCleanup = dynamicUsedDuringRender;
	const safeHtmlStream = deferUntilStreamConsumed(htmlStream, () => {
		dynamicUsedBeforeContextCleanup = dynamicUsedBeforeContextCleanup || options.consumeDynamicUsage();
		options.clearRequestContext();
	});
	const htmlResponsePolicy = resolveAppPageHtmlResponsePolicy({
		dynamicUsedDuringRender,
		isProgressiveActionRender: options.isProgressiveActionRender === true,
		hasScriptNonce: Boolean(options.scriptNonce),
		isDraftMode: options.isDraftMode,
		isDynamicError: options.isDynamicError,
		isForceDynamic: options.isForceDynamic,
		isForceStatic: options.isForceStatic,
		isProduction: options.isProduction,
		expireSeconds,
		revalidateSeconds
	});
	const htmlResponseTiming = buildResponseTiming({
		compileEnd,
		handlerStart: options.handlerStart,
		isProduction: options.isProduction,
		renderEnd,
		responseKind: "html"
	});
	const shouldSpeculativelyWriteCache = options.isProduction && shouldCaptureRscForCacheMetadata && revalidateSeconds === null && !options.isDynamicError && !options.isForceStatic && !options.scriptNonce && options.isProgressiveActionRender !== true && !dynamicUsedDuringRender;
	if (htmlResponsePolicy.shouldWriteToCache || shouldSpeculativelyWriteCache) {
		const isrResponse = buildAppPageHtmlResponse(safeHtmlStream, {
			draftCookie,
			fontLinkHeader,
			middlewareContext: options.middlewareContext,
			policy: htmlResponsePolicy,
			timing: htmlResponseTiming
		});
		if (options.isPrerender === true) return isrResponse;
		return finalizeAppPageHtmlCacheResponse(isrResponse, {
			capturedDynamicUsageBeforeContextCleanup() {
				return dynamicUsedBeforeContextCleanup;
			},
			capturedRscDataPromise: capturedRscDataRef.value,
			cleanPathname: options.cleanPathname,
			consumeDynamicUsage: options.consumeDynamicUsage,
			getPageTags() {
				return options.getPageTags();
			},
			getRequestCacheLife() {
				return options.getRequestCacheLife();
			},
			isrDebug: options.isrDebug,
			isrHtmlKey: options.isrHtmlKey,
			isrRscKey: options.isrRscKey,
			isrSet: options.isrSet,
			preserveClientResponseHeaders: !htmlResponsePolicy.shouldWriteToCache,
			expireSeconds,
			revalidateSeconds,
			waitUntil(cachePromise) {
				options.waitUntil?.(cachePromise);
			}
		});
	}
	return buildAppPageHtmlResponse(safeHtmlStream, {
		draftCookie,
		fontLinkHeader,
		middlewareContext: options.middlewareContext,
		policy: htmlResponsePolicy,
		timing: htmlResponseTiming
	});
}
async function settleCapturedRscRenderForCacheMetadata(capturedRscDataPromise) {
	if (!capturedRscDataPromise) return;
	try {
		await capturedRscDataPromise;
	} catch {}
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-page-dispatch.js
function shouldReadAppPageCache(options) {
	return options.isProduction && !options.isProgressiveActionRender && !options.isDraftMode && !options.isForceDynamic && (options.isRscRequest || !options.scriptNonce) && (options.revalidateSeconds === null || options.revalidateSeconds > 0);
}
function buildAppPageTags(cleanPathname, extraTags, routeSegments) {
	return buildPageCacheTags(cleanPathname, extraTags, [...routeSegments], "page");
}
async function runAppPageRevalidationContext(options, renderFn) {
	return runWithRequestContext(createRequestContext({
		headersContext: createStaticGenerationHeadersContext({
			dynamicConfig: options.dynamicConfig,
			routeKind: "page",
			routePattern: options.routePattern
		}),
		currentFetchCacheMode: options.currentFetchCacheMode ?? null,
		executionContext: getRequestExecutionContext(),
		unstableCacheRevalidation: "foreground"
	}), async () => {
		ensureFetchPatch();
		setCurrentFetchSoftTags(buildAppPageTags(options.cleanPathname, [], options.routeSegments));
		options.setNavigationContext({
			pathname: options.cleanPathname,
			searchParams: new URLSearchParams(),
			params: options.params
		});
		return await runWithFetchDedupe(renderFn);
	});
}
function getCapturedRscDataPromise(capturedRscDataPromise) {
	if (!capturedRscDataPromise) throw new Error("[vinext] Expected captured RSC data while regenerating an app page cache entry");
	return capturedRscDataPromise;
}
function toInterceptOptions(interceptionContext, intercept) {
	return {
		interceptionContext,
		interceptLayouts: intercept.interceptLayouts,
		interceptPage: intercept.page,
		interceptParams: intercept.matchedParams,
		interceptSlotKey: intercept.slotKey
	};
}
async function dispatchAppPage(options) {
	return await runWithFetchDedupe(() => dispatchAppPageInner(options));
}
async function dispatchAppPageInner(options) {
	const route = options.route;
	const dynamicConfig = options.dynamicConfig;
	const currentRevalidateSeconds = options.revalidateSeconds;
	const isForceStatic = dynamicConfig === "force-static";
	const isDynamicError = dynamicConfig === "error";
	const isForceDynamic = dynamicConfig === "force-dynamic";
	const isDraftMode = isDraftModeRequest(options.request);
	setCurrentFetchSoftTags(buildAppPageTags(options.cleanPathname, [], route.routeSegments));
	setCurrentFetchCacheMode(options.fetchCache ?? null);
	if (options.hasPageModule && !options.hasPageDefaultExport) {
		options.clearRequestContext();
		return new Response("Page has no default export", { status: 500 });
	}
	const methodResponse = resolveAppPageMethodResponse({
		dynamicConfig,
		hasGenerateStaticParams: options.hasGenerateStaticParams,
		isDynamicRoute: route.isDynamic,
		middlewareHeaders: options.middlewareContext.headers,
		request: options.request,
		revalidateSeconds: currentRevalidateSeconds
	});
	if (methodResponse) {
		options.clearRequestContext();
		return methodResponse;
	}
	if ((isForceStatic || isDynamicError) && !isDraftMode) {
		setHeadersContext(createStaticGenerationHeadersContext({
			dynamicConfig,
			routeKind: "page",
			routePattern: route.pattern
		}));
		options.setNavigationContext({
			pathname: options.cleanPathname,
			searchParams: new URLSearchParams(),
			params: options.params
		});
	}
	if (shouldReadAppPageCache({
		isDraftMode,
		isForceDynamic,
		isProgressiveActionRender: options.isProgressiveActionRender === true,
		isProduction: options.isProduction,
		isRscRequest: options.isRscRequest,
		revalidateSeconds: currentRevalidateSeconds,
		scriptNonce: options.scriptNonce
	})) {
		const cachedPageResponse = await readAppPageCacheResponse({
			cleanPathname: options.cleanPathname,
			clearRequestContext: options.clearRequestContext,
			isRscRequest: options.isRscRequest,
			isrDebug: options.isrDebug,
			isrGet: options.isrGet,
			isrHtmlKey: options.isrHtmlKey,
			isrRscKey: options.isrRscKey,
			isrSet: options.isrSet,
			middlewareHeaders: options.middlewareContext.headers,
			middlewareStatus: options.middlewareContext.status,
			mountedSlotsHeader: options.mountedSlotsHeader,
			renderMode: options.renderMode,
			expireSeconds: options.expireSeconds,
			revalidateSeconds: currentRevalidateSeconds ?? 0,
			renderFreshPageForCache: async () => runAppPageRevalidationContext({
				cleanPathname: options.cleanPathname,
				currentFetchCacheMode: options.fetchCache ?? null,
				dynamicConfig,
				params: options.params,
				routePattern: route.pattern,
				routeSegments: route.routeSegments,
				setNavigationContext: options.setNavigationContext
			}, async () => {
				const revalidatedElement = await options.buildPageElement(route, options.params, void 0, new URLSearchParams());
				const revalidatedOnError = options.createRscOnErrorHandler(options.cleanPathname, route.pattern);
				const revalidatedRscCapture = teeAppPageRscStreamForCapture(options.renderToReadableStream(revalidatedElement, { onError: revalidatedOnError }), true);
				const revalidatedSsrEntry = await options.loadSsrHandler();
				const revalidatedCapturedRscRef = { value: null };
				const html = await readStreamAsText(await revalidatedSsrEntry.handleSsr(revalidatedRscCapture.ssrStream, options.getNavigationContext(), {
					links: options.getFontLinks(),
					styles: options.getFontStyles(),
					preloads: options.getFontPreloads()
				}, revalidatedRscCapture.sideStream ? {
					sideStream: revalidatedRscCapture.sideStream,
					capturedRscDataRef: revalidatedCapturedRscRef
				} : void 0));
				const rscData = await getCapturedRscDataPromise(revalidatedCapturedRscRef.value);
				const cacheLife = _consumeRequestScopedCacheLife();
				options.clearRequestContext();
				return {
					html,
					rscData,
					tags: buildAppPageTags(options.cleanPathname, getCollectedFetchTags(), route.routeSegments),
					cacheControl: typeof cacheLife?.revalidate === "number" ? {
						revalidate: cacheLife.revalidate,
						expire: cacheLife.expire
					} : void 0
				};
			}),
			scheduleBackgroundRegeneration(key, renderFn) {
				options.scheduleBackgroundRegeneration(key, renderFn, {
					routerKind: "App Router",
					routePath: route.pattern,
					routeType: "render"
				});
			}
		});
		if (cachedPageResponse) return cachedPageResponse;
	}
	const dynamicParamsResponse = await validateAppPageDynamicParams({
		clearRequestContext: options.clearRequestContext,
		enforceStaticParamsOnly: options.dynamicParamsConfig === false,
		generateStaticParams: options.generateStaticParams,
		isDynamicRoute: route.isDynamic,
		params: options.params
	});
	if (dynamicParamsResponse) return dynamicParamsResponse;
	const interceptResult = await resolveAppPageIntercept({
		buildPageElement(interceptRoute, interceptParams, interceptOpts, interceptSearchParams) {
			setCurrentFetchCacheMode(options.resolveRouteFetchCacheMode?.(interceptRoute) ?? null);
			return options.buildPageElement(interceptRoute, interceptParams, interceptOpts, interceptSearchParams);
		},
		cleanPathname: options.cleanPathname,
		currentRoute: route,
		findIntercept(pathname) {
			return options.findIntercept(pathname);
		},
		getRouteParamNames(sourceRoute) {
			return sourceRoute.params;
		},
		getSourceRoute(sourceRouteIndex) {
			return options.getSourceRoute(sourceRouteIndex);
		},
		isRscRequest: options.isRscRequest,
		renderInterceptResponse(sourceRoute, interceptElement) {
			const interceptOnError = options.createRscOnErrorHandler(options.cleanPathname, sourceRoute.pattern);
			const interceptStream = options.renderToReadableStream(interceptElement, { onError: interceptOnError });
			const interceptHeaders = new Headers({
				"Content-Type": "text/x-component; charset=utf-8",
				Vary: VINEXT_RSC_VARY_HEADER
			});
			mergeMiddlewareResponseHeaders(interceptHeaders, options.middlewareContext.headers);
			return new Response(interceptStream, {
				status: options.middlewareContext.status ?? 200,
				headers: interceptHeaders
			});
		},
		searchParams: options.searchParams,
		setNavigationContext: options.setNavigationContext,
		toInterceptOpts(intercept) {
			return toInterceptOptions(options.interceptionContext, intercept);
		}
	});
	if (interceptResult.response) return interceptResult.response;
	const pageBuildResult = await buildAppPageElement({
		buildPageElement() {
			return options.buildPageElement(route, options.params, interceptResult.interceptOpts, options.searchParams);
		},
		renderErrorBoundaryPage(buildError) {
			return options.renderErrorBoundaryPage(buildError);
		},
		renderSpecialError(specialError) {
			return renderPageSpecialError(options, specialError);
		},
		resolveSpecialError: resolveAppPageSpecialError
	});
	if (pageBuildResult.response) return pageBuildResult.response;
	return renderAppPageLifecycle({
		cleanPathname: options.cleanPathname,
		clearRequestContext: options.clearRequestContext,
		consumeDynamicUsage,
		consumeInvalidDynamicUsageError,
		createRscOnErrorHandler(pathname, routePath) {
			return options.createRscOnErrorHandler(pathname, routePath);
		},
		element: pageBuildResult.element,
		getDraftModeCookieHeader,
		getFontLinks: options.getFontLinks,
		getFontPreloads: options.getFontPreloads,
		getFontStyles: options.getFontStyles,
		getNavigationContext: options.getNavigationContext,
		getPageTags() {
			return buildAppPageTags(options.cleanPathname, getCollectedFetchTags(), route.routeSegments);
		},
		getRequestCacheLife() {
			return _consumeRequestScopedCacheLife();
		},
		peekRequestCacheLife() {
			return _peekRequestScopedCacheLife();
		},
		handlerStart: options.handlerStart,
		hasLoadingBoundary: shouldSuppressLoadingBoundaries(options.renderMode ?? "navigation") ? false : Boolean(route.loading?.default),
		formState: options.formState ?? null,
		isProgressiveActionRender: options.isProgressiveActionRender === true,
		isDynamicError,
		isDraftMode,
		isForceDynamic,
		isForceStatic,
		isPrerender: process.env.VINEXT_PRERENDER === "1",
		isProduction: options.isProduction,
		isRscRequest: options.isRscRequest,
		isrDebug: options.isrDebug,
		isrHtmlKey: options.isrHtmlKey,
		isrRscKey: options.isrRscKey,
		isrSet: options.isrSet,
		expireSeconds: options.expireSeconds,
		layoutCount: route.layouts.length,
		loadSsrHandler: options.loadSsrHandler,
		middlewareContext: options.middlewareContext,
		params: options.params,
		probeLayoutAt(layoutIndex) {
			return options.probeLayoutAt(layoutIndex);
		},
		probePage() {
			return options.probePage();
		},
		classification: {
			getLayoutId(index) {
				const treePosition = route.layoutTreePositions?.[index] ?? 0;
				return AppElementsWire.encodeLayoutId(createAppPageTreePath([...route.routeSegments], treePosition));
			},
			buildTimeClassifications: route.__buildTimeClassifications,
			buildTimeReasons: route.__buildTimeReasons,
			debugClassification: options.debugClassification,
			async runWithIsolatedDynamicScope(fn) {
				const priorDynamic = consumeDynamicUsage();
				try {
					return {
						result: await fn(),
						dynamicDetected: consumeDynamicUsage()
					};
				} finally {
					consumeDynamicUsage();
					if (priorDynamic) markDynamicUsage();
				}
			}
		},
		revalidateSeconds: currentRevalidateSeconds,
		mountedSlotsHeader: options.mountedSlotsHeader,
		renderMode: options.renderMode ?? "navigation",
		renderErrorBoundaryResponse(renderError) {
			return options.renderErrorBoundaryPage(renderError);
		},
		renderLayoutSpecialError(specialError, layoutIndex) {
			return renderLayoutSpecialError(options, specialError, layoutIndex);
		},
		renderPageSpecialError(specialError) {
			return renderPageSpecialError(options, specialError);
		},
		renderToReadableStream: options.renderToReadableStream,
		routeHasLocalBoundary: Boolean(route.error?.default || route.errors?.some((errorModule) => errorModule?.default)),
		routePattern: route.pattern,
		runWithSuppressedHookWarning(probe) {
			return options.runWithSuppressedHookWarning(probe);
		},
		scriptNonce: options.scriptNonce,
		waitUntil(cachePromise) {
			getRequestExecutionContext()?.waitUntil(cachePromise);
		}
	});
}
async function renderLayoutSpecialError(options, specialError, layoutIndex) {
	return buildAppPageSpecialErrorResponse({
		basePath: options.basePath,
		clearRequestContext: options.clearRequestContext,
		getAndClearPendingCookies,
		isRscRequest: options.isRscRequest,
		middlewareContext: options.middlewareContext,
		renderFallbackPage(statusCode) {
			const parentBoundary = resolveAppPageParentHttpAccessBoundaryModule({
				layoutIndex,
				rootForbiddenModule: options.rootForbiddenModule,
				rootNotFoundModule: options.rootNotFoundModule,
				rootUnauthorizedModule: options.rootUnauthorizedModule,
				routeForbiddenModules: options.route.forbiddens,
				routeNotFoundModules: options.route.notFounds,
				routeUnauthorizedModules: options.route.unauthorizeds,
				statusCode
			})?.default;
			return options.renderHttpAccessFallbackPage(statusCode, {
				boundaryComponent: parentBoundary,
				layouts: options.route.layouts.slice(0, layoutIndex),
				matchedParams: options.params
			}, null);
		},
		request: options.request,
		specialError
	});
}
async function renderPageSpecialError(options, specialError) {
	return buildAppPageSpecialErrorResponse({
		basePath: options.basePath,
		clearRequestContext: options.clearRequestContext,
		getAndClearPendingCookies,
		isRscRequest: options.isRscRequest,
		middlewareContext: options.middlewareContext,
		renderFallbackPage(statusCode) {
			return options.renderHttpAccessFallbackPage(statusCode, { matchedParams: options.params }, null);
		},
		request: options.request,
		specialError
	});
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-segment-config.js
var DYNAMIC_VALUES = new Set([
	"auto",
	"error",
	"force-dynamic",
	"force-static"
]);
var FETCH_CACHE_VALUES = new Set([
	"auto",
	"default-cache",
	"default-no-store",
	"force-cache",
	"force-no-store",
	"only-cache",
	"only-no-store"
]);
function isRouteSegmentDynamic(value) {
	return DYNAMIC_VALUES.has(value);
}
function isRouteSegmentFetchCache(value) {
	return FETCH_CACHE_VALUES.has(value);
}
function resolveRevalidateSeconds(current, value) {
	if (value === false) {
		if (current === null) return Infinity;
		return current === Infinity ? Infinity : current;
	}
	if (typeof value !== "number") return current;
	if (current === null) return value;
	return value < current ? value : current;
}
function isCacheFetchCacheMode(value) {
	return value === "default-cache" || value === "force-cache" || value === "only-cache";
}
function describeFetchCacheConflict(value) {
	return `Route segment config has incompatible fetchCache values including "${value}".`;
}
/**
* Resolve the route segment config that applies to an App page route.
*
* Next.js collects config from every segment in the loader tree and reduces it
* into the effective route config. The generated vinext entry already knows
* the concrete layout/page modules for a route, so it should only describe
* those modules and delegate the behavior to this helper.
*/
function resolveAppPageSegmentConfig(options) {
	const segments = [...options.layouts ?? [], options.page];
	const config = { revalidateSeconds: null };
	let hasForceCache = false;
	let hasForceNoStore = false;
	let hasOnlyCache = false;
	let hasOnlyNoStore = false;
	let hasParentDefaultNoStore = false;
	for (const segment of segments) {
		if (!segment) continue;
		if (isRouteSegmentDynamic(segment.dynamic)) config.dynamicConfig = segment.dynamic;
		if (segment.dynamicParams === false) config.dynamicParamsConfig = false;
		else if (segment.dynamicParams === true && config.dynamicParamsConfig !== false) config.dynamicParamsConfig = true;
		if (isRouteSegmentFetchCache(segment.fetchCache)) {
			const fetchCache = segment.fetchCache;
			if (hasParentDefaultNoStore && (fetchCache === "auto" || isCacheFetchCacheMode(fetchCache))) throw new Error(describeFetchCacheConflict(fetchCache));
			if (fetchCache === "force-cache") hasForceCache = true;
			if (fetchCache === "force-no-store") hasForceNoStore = true;
			if (fetchCache === "only-cache") hasOnlyCache = true;
			if (fetchCache === "only-no-store") hasOnlyNoStore = true;
			if ((hasForceCache || hasOnlyCache) && (hasForceNoStore || hasOnlyNoStore)) throw new Error(describeFetchCacheConflict(fetchCache));
			if (fetchCache === "default-no-store") hasParentDefaultNoStore = true;
			if (hasForceCache) config.fetchCache = "force-cache";
			else if (hasForceNoStore) config.fetchCache = "force-no-store";
			else if (hasOnlyCache) config.fetchCache = "only-cache";
			else if (hasOnlyNoStore) config.fetchCache = "only-no-store";
			else config.fetchCache = fetchCache;
		}
		config.revalidateSeconds = resolveRevalidateSeconds(config.revalidateSeconds, segment.revalidate);
	}
	if (config.dynamicConfig === "force-dynamic") config.revalidateSeconds = 0;
	if (config.fetchCache === void 0) {
		if (config.dynamicConfig === "force-dynamic") config.fetchCache = "force-no-store";
		else if (config.dynamicConfig === "error") config.fetchCache = "only-cache";
	}
	if (config.dynamicParamsConfig === void 0 && (config.dynamicConfig === "error" || config.dynamicConfig === "force-static")) config.dynamicParamsConfig = false;
	return config;
}
function resolveAppPageFetchCacheMode(options) {
	return resolveAppPageSegmentConfig(options).fetchCache ?? null;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/routing/route-trie.js
function createNode() {
	return {
		staticChildren: /* @__PURE__ */ new Map(),
		dynamicChild: null,
		catchAllChild: null,
		optionalCatchAllChild: null,
		route: null
	};
}
/**
* Build a trie from pre-sorted routes.
*
* Routes must have a `patternParts` property (string[] of URL segments).
* Pattern segment conventions:
*   - `:name`  — dynamic segment
*   - `:name+` — catch-all (1+ segments)
*   - `:name*` — optional catch-all (0+ segments)
*   - anything else — static segment
*
* First route to claim a terminal position wins (routes are pre-sorted
* by precedence, so insertion order preserves correct priority).
*/
function buildRouteTrie(routes) {
	const root = createNode();
	for (const route of routes) {
		const parts = route.patternParts;
		if (parts.length === 0) {
			if (root.route === null) root.route = route;
			continue;
		}
		let node = root;
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			if (part.endsWith("+") && part.startsWith(":")) {
				if (i !== parts.length - 1) break;
				const paramName = part.slice(1, -1);
				if (node.catchAllChild === null) node.catchAllChild = {
					paramName,
					route
				};
				break;
			}
			if (part.endsWith("*") && part.startsWith(":")) {
				if (i !== parts.length - 1) break;
				const paramName = part.slice(1, -1);
				if (node.optionalCatchAllChild === null) node.optionalCatchAllChild = {
					paramName,
					route
				};
				break;
			}
			if (part.startsWith(":")) {
				const paramName = part.slice(1);
				if (node.dynamicChild === null) node.dynamicChild = {
					paramName,
					node: createNode()
				};
				node = node.dynamicChild.node;
				if (i === parts.length - 1) {
					if (node.route === null) node.route = route;
				}
				continue;
			}
			let child = node.staticChildren.get(part);
			if (!child) {
				child = createNode();
				node.staticChildren.set(part, child);
			}
			node = child;
			if (i === parts.length - 1) {
				if (node.route === null) node.route = route;
			}
		}
	}
	return root;
}
/**
* Match a URL against the trie.
*
* Returns decoded param values — `decodeURIComponent` is applied to
* individual param entries so that `%2F` → `/`, `%23` → `#`, etc.
* Segment boundaries (the original `/` splits) are preserved by the
* upstream normalization layer; this step only decodes the captured
* param strings the caller sees.
*
* Mirrors Next.js route-matcher.ts:25-27.
*
* @param root - Trie root built by `buildRouteTrie`
* @param urlParts - Pre-split URL segments (no empty strings)
* @returns Match result with route and extracted params, or null
*/
function trieMatch(root, urlParts) {
	const result = match(root, urlParts, 0);
	if (result) decodeMatchedParams(result.params);
	return result;
}
function createParams() {
	return Object.create(null);
}
function match(node, urlParts, index) {
	if (index === urlParts.length) {
		if (node.route !== null) return {
			route: node.route,
			params: createParams()
		};
		if (node.optionalCatchAllChild !== null) return {
			route: node.optionalCatchAllChild.route,
			params: createParams()
		};
		return null;
	}
	const segment = urlParts[index];
	const staticChild = node.staticChildren.get(segment);
	if (staticChild) {
		const result = match(staticChild, urlParts, index + 1);
		if (result !== null) return result;
	}
	if (node.dynamicChild !== null) {
		const result = match(node.dynamicChild.node, urlParts, index + 1);
		if (result !== null) {
			result.params[node.dynamicChild.paramName] = segment;
			return result;
		}
	}
	if (node.catchAllChild !== null) {
		const remaining = urlParts.slice(index);
		const params = createParams();
		params[node.catchAllChild.paramName] = remaining;
		return {
			route: node.catchAllChild.route,
			params
		};
	}
	if (node.optionalCatchAllChild !== null) {
		const remaining = urlParts.slice(index);
		const params = createParams();
		params[node.optionalCatchAllChild.paramName] = remaining;
		return {
			route: node.optionalCatchAllChild.route,
			params
		};
	}
	return null;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-rsc-route-matching.js
function createRouteParams() {
	return Object.create(null);
}
function appRscPathnameParts(pathname) {
	const pathOnly = pathname.split("?")[0];
	return normalizePathnameForRouteMatch(pathOnly === "/" ? "/" : pathOnly.replace(/\/$/, "")).split("/").filter(Boolean);
}
function createAppRscRouteMatcher(routes) {
	const routeTrie = buildRouteTrie(routes);
	const interceptLookup = createInterceptLookup(routes);
	return {
		matchRoute(url) {
			return trieMatch(routeTrie, appRscPathnameParts(url));
		},
		findIntercept(pathname, sourcePathname = null) {
			const urlParts = appRscPathnameParts(pathname);
			for (const entry of interceptLookup) {
				const params = matchAppRscRoutePattern(urlParts, entry.targetPatternParts);
				if (params !== null) {
					let sourceParams = createRouteParams();
					if (sourcePathname !== null) {
						const sourceRoute = routes[entry.sourceRouteIndex];
						const sourceParts = appRscPathnameParts(sourcePathname);
						const matchedSourceParams = sourceRoute ? matchAppRscRoutePattern(sourceParts, sourceRoute.patternParts) : null;
						if (matchedSourceParams !== null) sourceParams = matchedSourceParams;
					}
					return {
						...entry,
						matchedParams: mergeMatchedParams(sourceParams, params)
					};
				}
			}
			return null;
		}
	};
}
function createInterceptLookup(routes) {
	const interceptLookup = [];
	for (let routeIndex = 0; routeIndex < routes.length; routeIndex++) {
		const route = routes[routeIndex];
		if (!route.slots) continue;
		for (const [slotKey, slotModule] of Object.entries(route.slots)) {
			if (!slotModule.intercepts) continue;
			for (const intercept of slotModule.intercepts) interceptLookup.push({
				sourceRouteIndex: routeIndex,
				slotKey,
				targetPattern: intercept.targetPattern,
				targetPatternParts: intercept.targetPattern.split("/").filter(Boolean),
				interceptLayouts: intercept.interceptLayouts,
				page: intercept.page,
				params: intercept.params
			});
		}
	}
	return interceptLookup;
}
function matchAppRscRoutePattern(urlParts, patternParts) {
	return matchRoutePattern(urlParts, patternParts);
}
function mergeMatchedParams(sourceParams, targetParams) {
	return Object.assign(createRouteParams(), sourceParams, targetParams);
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/navigation-state.js
/**
* Server-only navigation state backed by AsyncLocalStorage.
*
* This module provides request-scoped isolation for navigation context
* and useServerInsertedHTML callbacks. Without ALS, concurrent requests
* on Cloudflare Workers would share module-level state and leak data
* (pathnames, params, CSS-in-JS styles) between requests.
*
* This module is server-only — it imports node:async_hooks and must NOT
* be bundled for the browser. The dual-environment navigation.ts shim
* uses a registration pattern so it works in both environments.
*/
var _FALLBACK_KEY = Symbol.for("vinext.navigation.fallback");
var _g = globalThis;
var _als = getOrCreateAls("vinext.navigation.als");
var _fallbackState = _g[_FALLBACK_KEY] ??= {
	serverContext: null,
	serverInsertedHTMLCallbacks: []
};
function _getState() {
	if (isInsideUnifiedScope()) return getRequestContext();
	return _als.getStore() ?? _fallbackState;
}
var _accessors = {
	getServerContext() {
		return _getState().serverContext;
	},
	setServerContext(ctx) {
		_getState().serverContext = ctx;
	},
	getInsertedHTMLCallbacks() {
		return _getState().serverInsertedHTMLCallbacks;
	},
	clearInsertedHTMLCallbacks() {
		_getState().serverInsertedHTMLCallbacks = [];
	}
};
_registerStateAccessors(_accessors);
globalThis[GLOBAL_ACCESSORS_KEY] = _accessors;
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/build/google-fonts/sort-variants.js
function sortFontsVariantValues(valA, valB) {
	if (valA.includes(",") && valB.includes(",")) {
		const [aPrefix, aSuffix] = valA.split(",", 2);
		const [bPrefix, bSuffix] = valB.split(",", 2);
		if (aPrefix === bPrefix) return parseInt(aSuffix) - parseInt(bSuffix);
		return parseInt(aPrefix) - parseInt(bPrefix);
	}
	return parseInt(valA) - parseInt(valB);
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/build/google-fonts/build-url.js
function buildGoogleFontsUrl$1(fontFamily, axes, display) {
	const variants = [];
	if (axes.wght) for (const wght of axes.wght) if (!axes.ital) variants.push([["wght", wght], ...axes.variableAxes ?? []]);
	else for (const ital of axes.ital) variants.push([
		["ital", ital],
		["wght", wght],
		...axes.variableAxes ?? []
	]);
	else if (axes.variableAxes) variants.push([...axes.variableAxes]);
	if (axes.variableAxes) for (const variant of variants) variant.sort(([a], [b]) => {
		const aIsLowercase = a.charCodeAt(0) > 96;
		const bIsLowercase = b.charCodeAt(0) > 96;
		if (aIsLowercase && !bIsLowercase) return -1;
		if (bIsLowercase && !aIsLowercase) return 1;
		return a > b ? 1 : -1;
	});
	let url = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}`;
	if (variants.length > 0) {
		const keyList = variants[0].map(([key]) => key).join(",");
		const valueLists = variants.map((variant) => variant.map(([, val]) => val).join(",")).sort(sortFontsVariantValues).join(";");
		url = `${url}:${keyList}@${valueLists}`;
	}
	return `${url}&display=${display}`;
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/font-google-base.js
/**
* next/font/google shim
*
* Provides a compatible shim for Next.js Google Fonts.
*
* Two modes:
* 1. **Dev / CDN mode** (default): Loads fonts from Google Fonts CDN via <link> tags.
* 2. **Self-hosted mode** (production build): The vinext:google-fonts Vite plugin
*    fetches font CSS + .woff2 files at build time, caches them locally, and injects
*    @font-face CSS pointing at local assets. No requests to Google at runtime.
*
* Usage:
*   import { Inter } from 'next/font/google';
*   const inter = Inter({ subsets: ['latin'], weight: ['400', '700'] });
*   // inter.className -> stable CSS class for this font/options pair
*   // inter.style -> { fontFamily: "'Inter', sans-serif" }
*   // inter.variable -> CSS class that sets the font CSS variable
*/
/**
* Escape a string for safe interpolation inside a CSS single-quoted string.
*
* Prevents CSS injection by escaping characters that could break out of
* a `'...'` CSS string context: backslashes, single quotes, and newlines.
*/
function escapeCSSString(value) {
	return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\a ").replace(/\r/g, "\\d ");
}
/**
* Validate a CSS custom property name (e.g. `--font-inter`).
*
* Custom properties must start with `--` and only contain alphanumeric
* characters, hyphens, and underscores. Anything else could be used to
* break out of the CSS declaration and inject arbitrary rules.
*
* Returns the name if valid, undefined otherwise.
*/
function sanitizeCSSVarName(name) {
	if (/^--[a-zA-Z0-9_-]+$/.test(name)) return name;
}
/**
* Sanitize a CSS font-family fallback name.
*
* Generic family names (sans-serif, serif, monospace, etc.) are used as-is.
* Named families are wrapped in escaped quotes. This prevents injection via
* crafted fallback values like `); } body { color: red; } .x {`.
*/
function sanitizeFallback(name) {
	const generics = new Set([
		"serif",
		"sans-serif",
		"monospace",
		"cursive",
		"fantasy",
		"system-ui",
		"ui-serif",
		"ui-sans-serif",
		"ui-monospace",
		"ui-rounded",
		"emoji",
		"math",
		"fangsong"
	]);
	const trimmed = name.trim();
	if (generics.has(trimmed)) return trimmed;
	return `'${escapeCSSString(trimmed)}'`;
}
var injectedFonts = /* @__PURE__ */ new Set();
/**
* Convert a font family name to a CSS variable name.
* e.g., "Inter" -> "--font-inter", "Roboto Mono" -> "--font-roboto-mono"
*/
function toVarName(family) {
	return "--font-" + family.toLowerCase().replace(/\s+/g, "-");
}
function fontClassSegment(family) {
	return family.toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "") || "font";
}
function normalizeStringSetOption(value) {
	if (!value) return "";
	return [...new Set((Array.isArray(value) ? value : [value]).map((item) => item.trim()).filter(Boolean))].sort().join(",");
}
function normalizeWeightOption(value) {
	const normalized = normalizeStringSetOption(value);
	return normalized === "variable" ? "" : normalized;
}
function normalizeStyleOption(value) {
	const values = new Set((Array.isArray(value) ? value : value ? [value] : []).map((item) => item.trim()).filter(Boolean));
	const hasItalic = values.has("italic");
	const hasNormal = values.has("normal");
	if (!hasItalic) return "";
	return hasNormal ? "italic,normal" : "italic";
}
function normalizeFallbackOption(value) {
	if (!value) return "";
	return value.map((item) => item.trim()).join(",");
}
function normalizeBooleanOption(value) {
	if (value === void 0) return "";
	return value ? "1" : "0";
}
function normalizeStringOrBooleanOption(value) {
	if (value === void 0) return "";
	return typeof value === "boolean" ? normalizeBooleanOption(value) : value;
}
function hashString(value) {
	let hash = 2166136261;
	for (let i = 0; i < value.length; i++) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 16777619) >>> 0;
	}
	return hash.toString(36).padStart(7, "0");
}
function createFontIdentity(family, options, cssVarName, fallback) {
	return hashString([
		family,
		cssVarName,
		normalizeWeightOption(options.weight),
		normalizeStyleOption(options.style),
		normalizeStringSetOption(options.subsets),
		options.display ?? "swap",
		normalizeBooleanOption(options.preload),
		normalizeFallbackOption(fallback),
		normalizeStringOrBooleanOption(options.adjustFontFallback),
		normalizeStringSetOption(options.axes),
		options._selfHostedCSS ?? ""
	].join("\0"));
}
/**
* Build a Google Fonts CSS URL.
*
* In production this code path is dead. The build plugin
* (`vinext:google-fonts` in `src/plugins/fonts.ts`) statically resolves
* each font call's axis values against the bundled metadata, fetches the
* Google Fonts CSS, and injects the resulting CSS as `_selfHostedCSS` so
* the runtime never queries Google. The shim only reaches this builder
* when the plugin's static parser bails (dynamic options, eval-only
* shapes), which is dev-only.
*
* The dev fallback intentionally has no metadata: shipping the 388 KB
* `font-data.json` to the Worker bundle would dwarf the rest of the shim,
* and the production path already has the metadata-aware variant. The
* tradeoff is that the dev fallback cannot resolve a variable font's
* actual `wght` axis range. It emits no axis segment when no `weight` is
* given, which makes Google return the default static face (200) instead
* of the broken `:wght@100..900` URL that issue #885 reports.
*/
function buildGoogleFontsUrl(family, options) {
	const weights = options.weight ? Array.isArray(options.weight) ? options.weight : [options.weight] : [];
	const styles = options.style ? Array.isArray(options.style) ? options.style : [options.style] : [];
	const hasItalic = styles.includes("italic");
	const hasNormal = styles.includes("normal");
	const ital = hasItalic ? [...hasNormal ? ["0"] : [], "1"] : void 0;
	const normalizedWeights = weights.length === 1 && weights[0] === "variable" ? [] : weights;
	return buildGoogleFontsUrl$1(family, {
		wght: normalizedWeights.length > 0 ? normalizedWeights : ital ? ["400"] : void 0,
		ital
	}, options.display ?? "swap");
}
/**
* Inject a <link> tag for the font (client-side only).
* On the server, we track font URLs for SSR head injection.
*/
function injectFontStylesheet(url) {
	if (injectedFonts.has(url)) return;
	injectedFonts.add(url);
	if (typeof document !== "undefined") {
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = url;
		document.head.appendChild(link);
	}
}
/** Track which className CSS rules have been injected. */
var injectedClassRules = /* @__PURE__ */ new Set();
/**
* Inject a CSS rule that maps a className to a font-family.
*
* This is what makes `<div className={inter.className}>` apply the font.
* Next.js generates equivalent rules at build time.
*
* In Next.js, the .className class ONLY sets font-family — it does NOT
* set CSS variables. CSS variables are handled separately by the .variable class.
*/
function injectClassNameRule(className, fontFamily) {
	if (injectedClassRules.has(className)) return;
	injectedClassRules.add(className);
	const css = `.${className} { font-family: ${fontFamily}; }\n`;
	if (typeof document === "undefined") {
		ssrFontStyles$1.push(css);
		return;
	}
	const style = document.createElement("style");
	style.textContent = css;
	style.setAttribute("data-vinext-font-class", className);
	document.head.appendChild(style);
}
/** Track which variable class CSS rules have been injected. */
var injectedVariableRules = /* @__PURE__ */ new Set();
/**
* Inject a CSS rule that sets a CSS variable on an element.
* This is what makes `<html className={inter.variable}>` set the CSS variable
* that can be referenced by other styles (e.g., Tailwind's font-sans).
*
* In Next.js, the .variable class ONLY sets the CSS variable — it does NOT
* set font-family. This is critical because apps commonly apply multiple
* .variable classes to <body> (e.g., geistSans.variable + geistMono.variable).
* If we also set font-family here, the last class wins due to CSS cascade,
* causing all text to use that font (e.g., everything becomes monospace).
*/
function injectVariableClassRule(variableClassName, cssVarName, fontFamily) {
	if (injectedVariableRules.has(variableClassName)) return;
	injectedVariableRules.add(variableClassName);
	const css = `.${variableClassName} { ${cssVarName}: ${fontFamily}; }\n`;
	if (typeof document === "undefined") {
		ssrFontStyles$1.push(css);
		return;
	}
	const style = document.createElement("style");
	style.textContent = css;
	style.setAttribute("data-vinext-font-variable", variableClassName);
	document.head.appendChild(style);
}
var ssrFontStyles$1 = [];
/**
* Get collected SSR font class styles (used by the renderer).
* Note: We don't clear the arrays because fonts are loaded at module import
* time and need to persist across all requests in the Workers environment.
*/
function getSSRFontStyles$1() {
	return [...ssrFontStyles$1];
}
var ssrFontUrls = [];
/**
* Get collected SSR font URLs (used by the renderer).
* Note: We don't clear the arrays because fonts are loaded at module import
* time and need to persist across all requests in the Workers environment.
*/
function getSSRFontLinks() {
	return [...ssrFontUrls];
}
var ssrFontPreloads$1 = [];
var ssrFontPreloadHrefs = /* @__PURE__ */ new Set();
/**
* Get collected SSR font preload data (used by the renderer).
* Returns an array of { href, type } objects for emitting
* <link rel="preload" as="font" ...> tags.
*/
function getSSRFontPreloads$1() {
	return [...ssrFontPreloads$1];
}
/**
* Determine the MIME type for a font file based on its extension.
*/
function getFontMimeType(pathOrUrl) {
	if (pathOrUrl.endsWith(".woff2")) return "font/woff2";
	if (pathOrUrl.endsWith(".woff")) return "font/woff";
	if (pathOrUrl.endsWith(".ttf")) return "font/ttf";
	if (pathOrUrl.endsWith(".otf")) return "font/opentype";
	return "font/woff2";
}
/**
* Extract font file URLs from @font-face CSS rules.
* Parses url('...') references from the CSS text.
*/
function extractFontUrlsFromCSS(css) {
	const urls = [];
	const urlRegex = /url\(['"]?([^'")]+)['"]?\)/g;
	let match;
	while ((match = urlRegex.exec(css)) !== null) {
		const url = match[1];
		if (url && url.startsWith("/")) urls.push(url);
	}
	return urls;
}
/**
* Collect font file URLs from self-hosted CSS for preload link generation.
* Only collects on the server (SSR). Deduplicates by href using a Set for O(1) lookups.
*/
function collectFontPreloadsFromCSS(css) {
	if (typeof document !== "undefined") return;
	const urls = extractFontUrlsFromCSS(css);
	for (const href of urls) if (!ssrFontPreloadHrefs.has(href)) {
		ssrFontPreloadHrefs.add(href);
		ssrFontPreloads$1.push({
			href,
			type: getFontMimeType(href)
		});
	}
}
/** Track injected self-hosted @font-face blocks (deduplicate) */
var injectedSelfHosted = /* @__PURE__ */ new Set();
/**
* Inject self-hosted @font-face CSS (from the build plugin).
* This replaces the CDN <link> tag with inline CSS.
*/
function injectSelfHostedCSS(css) {
	if (injectedSelfHosted.has(css)) return;
	injectedSelfHosted.add(css);
	collectFontPreloadsFromCSS(css);
	if (typeof document === "undefined") {
		ssrFontStyles$1.push(css);
		return;
	}
	const style = document.createElement("style");
	style.textContent = css;
	style.setAttribute("data-vinext-font-selfhosted", "true");
	document.head.appendChild(style);
}
function createFontLoader(family) {
	return function fontLoader(options = {}) {
		const fallback = options.fallback ?? ["sans-serif"];
		const fontFamily = `'${escapeCSSString(family)}', ${fallback.map(sanitizeFallback).join(", ")}`;
		const defaultVarName = toVarName(family);
		const cssVarName = options.variable ? sanitizeCSSVarName(options.variable) ?? defaultVarName : defaultVarName;
		const id = createFontIdentity(family, options, cssVarName, fallback);
		const classSegment = fontClassSegment(family);
		const className = `__font_${classSegment}_${id}`;
		const variableClassName = `__variable_${classSegment}_${id}`;
		if (options._selfHostedCSS) injectSelfHostedCSS(options._selfHostedCSS);
		else {
			const url = buildGoogleFontsUrl(family, options);
			injectFontStylesheet(url);
			if (typeof document === "undefined") {
				if (!ssrFontUrls.includes(url)) ssrFontUrls.push(url);
			}
		}
		injectClassNameRule(className, fontFamily);
		injectVariableClassRule(variableClassName, cssVarName, fontFamily);
		return {
			className,
			style: { fontFamily },
			variable: variableClassName
		};
	};
}
var googleFonts = new Proxy({}, { get(_target, prop) {
	if (typeof prop !== "string") return void 0;
	if (prop === "__esModule") return true;
	if (prop === "default") return googleFonts;
	return createFontLoader(prop.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2"));
} });
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/shims/font-local.js
var ssrFontStyles = [];
var ssrFontPreloads = [];
/**
* Get collected SSR font styles (used by the renderer).
* Note: We don't clear the arrays because fonts are loaded at module import
* time and need to persist across all requests in the Workers environment.
*/
function getSSRFontStyles() {
	return [...ssrFontStyles];
}
/**
* Get collected SSR font preload data (used by the renderer).
* Returns an array of { href, type } objects for emitting
* <link rel="preload" as="font" ...> tags.
*/
function getSSRFontPreloads() {
	return [...ssrFontPreloads];
}
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-hook-warning-suppression.js
var suppressHookWarningAls = new AsyncLocalStorage$1();
var _origConsoleError = console.error;
console.error = (...args) => {
	if (suppressHookWarningAls.getStore() === true && typeof args[0] === "string" && args[0].includes("Invalid hook call")) return;
	_origConsoleError.apply(console, args);
};
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-request-context.js
/**
* Set navigation context in the ALS-backed store. "use client" components
* rendered during SSR need the pathname/searchParams/params but the SSR
* environment has a separate module instance of next/navigation.
*
* Clearing nav context (ctx === null) also clears root params.
*/
function setAppNavigationContext(ctx) {
	setNavigationContext(ctx);
	if (ctx === null) setRootParams(null);
}
/**
* Clear all per-request ALS state owned by the App Router handler.
* Must be called before returning a non-page response (redirect, public
* file proxy, etc.) to prevent state leaking between requests on Workers.
*
* Clears: headers, navigation context, root params.
*/
function clearAppRequestContext() {
	setHeadersContext(null);
	setAppNavigationContext(null);
}
//#endregion
//#region node_modules/.pnpm/@netlify+runtime-utils@2.3.0/node_modules/@netlify/runtime-utils/dist/main.js
var getString = (input) => typeof input === "string" ? input : JSON.stringify(input);
var base64Decode = globalThis.Buffer ? (input) => Buffer.from(input, "base64").toString() : (input) => atob(input);
var base64Encode = globalThis.Buffer ? (input) => Buffer.from(getString(input)).toString("base64") : (input) => btoa(getString(input));
var getEnvironment = () => {
	const { Deno, Netlify, process } = globalThis;
	return Netlify?.env ?? Deno?.env ?? {
		delete: (key) => delete process?.env[key],
		get: (key) => process?.env[key],
		has: (key) => Boolean(process?.env[key]),
		set: (key, value) => {
			if (process?.env) process.env[key] = value;
		},
		toObject: () => process?.env ?? {}
	};
};
//#endregion
//#region node_modules/.pnpm/@netlify+otel@6.0.3/node_modules/@netlify/otel/dist/main.js
var GET_TRACER = "__netlify__getTracer";
var getTracer = (name, version) => {
	return globalThis[GET_TRACER]?.(name, version);
};
function withActiveSpan(tracer, name, optionsOrFn, contextOrFn, fn) {
	const func = typeof contextOrFn === "function" ? contextOrFn : typeof optionsOrFn === "function" ? optionsOrFn : fn;
	if (!func) throw new Error("function to execute with active span is missing");
	if (!tracer) return func();
	return tracer.withActiveSpan(name, optionsOrFn, contextOrFn, func);
}
//#endregion
//#region node_modules/.pnpm/@netlify+blobs@10.7.9/node_modules/@netlify/blobs/dist/chunk-YAGWSQMB.js
var getEnvironmentContext = () => {
	const context = globalThis.netlifyBlobsContext || getEnvironment().get("NETLIFY_BLOBS_CONTEXT");
	if (typeof context !== "string" || !context) return {};
	const data = base64Decode(context);
	try {
		return JSON.parse(data);
	} catch {}
	return {};
};
var MissingBlobsEnvironmentError = class extends Error {
	constructor(requiredProperties) {
		super(`The environment has not been configured to use Netlify Blobs. To use it manually, supply the following properties when creating a store: ${requiredProperties.join(", ")}`);
		this.name = "MissingBlobsEnvironmentError";
	}
};
var BASE64_PREFIX = "b64;";
var METADATA_HEADER_INTERNAL = "x-amz-meta-user";
var METADATA_HEADER_EXTERNAL = "netlify-blobs-metadata";
var METADATA_MAX_SIZE = 2 * 1024;
var encodeMetadata = (metadata) => {
	if (!metadata) return null;
	const payload = `b64;${base64Encode(JSON.stringify(metadata))}`;
	if (METADATA_HEADER_EXTERNAL.length + payload.length > METADATA_MAX_SIZE) throw new Error("Metadata object exceeds the maximum size");
	return payload;
};
var decodeMetadata = (header) => {
	if (!header?.startsWith(BASE64_PREFIX)) return {};
	const decodedData = base64Decode(header.slice(BASE64_PREFIX.length));
	return JSON.parse(decodedData);
};
var getMetadataFromResponse = (response) => {
	if (!response.headers) return {};
	const value = response.headers.get(METADATA_HEADER_EXTERNAL) || response.headers.get("x-amz-meta-user");
	try {
		return decodeMetadata(value);
	} catch {
		throw new Error("An internal error occurred while trying to retrieve the metadata for an entry. Please try updating to the latest version of the Netlify Blobs client.");
	}
};
var NF_ERROR = "x-nf-error";
var NF_REQUEST_ID = "x-nf-request-id";
var BlobsInternalError = class extends Error {
	constructor(res) {
		let details = res.headers.get(NF_ERROR) || `${res.status} status code`;
		if (res.headers.has(NF_REQUEST_ID)) details += `, ID: ${res.headers.get(NF_REQUEST_ID)}`;
		super(`Netlify Blobs has generated an internal error (${details})`);
		this.name = "BlobsInternalError";
	}
};
var collectIterator = async (iterator) => {
	const result = [];
	for await (const item of iterator) result.push(item);
	return result;
};
function withSpan(span, name, fn) {
	if (span) return fn(span);
	return withActiveSpan(getTracer(), name, (span2) => {
		return fn(span2);
	});
}
var BlobsConsistencyError = class extends Error {
	constructor() {
		super(`Netlify Blobs has failed to perform a read using strong consistency because the environment has not been configured with a 'uncachedEdgeURL' property`);
		this.name = "BlobsConsistencyError";
	}
};
var regions = {
	"us-east-1": true,
	"us-east-2": true,
	"eu-central-1": true,
	"ap-southeast-1": true,
	"ap-southeast-2": true
};
var isValidRegion = (input) => Object.keys(regions).includes(input);
var InvalidBlobsRegionError = class extends Error {
	constructor(region) {
		super(`${region} is not a supported Netlify Blobs region. Supported values are: ${Object.keys(regions).join(", ")}.`);
		this.name = "InvalidBlobsRegionError";
	}
};
var DEFAULT_RETRY_DELAY = getEnvironment().get("NODE_ENV") === "test" ? 1 : 5e3;
var MIN_RETRY_DELAY = 1e3;
var MAX_RETRY = 5;
var RATE_LIMIT_HEADER = "X-RateLimit-Reset";
var fetchAndRetry = async (fetch, url, options, attemptsLeft = MAX_RETRY) => {
	try {
		const res = await fetch(url, options);
		if (attemptsLeft > 0 && (res.status === 429 || res.status >= 500)) {
			await sleep(getDelay(res.headers.get(RATE_LIMIT_HEADER)));
			return fetchAndRetry(fetch, url, options, attemptsLeft - 1);
		}
		return res;
	} catch (error) {
		if (attemptsLeft === 0) throw error;
		await sleep(getDelay());
		return fetchAndRetry(fetch, url, options, attemptsLeft - 1);
	}
};
var getDelay = (rateLimitReset) => {
	if (!rateLimitReset) return DEFAULT_RETRY_DELAY;
	return Math.max(Number(rateLimitReset) * 1e3 - Date.now(), MIN_RETRY_DELAY);
};
var sleep = (ms) => new Promise((resolve) => {
	setTimeout(resolve, ms);
});
var SIGNED_URL_ACCEPT_HEADER = "application/json;type=signed-url";
var Client = class {
	constructor({ apiURL, consistency, edgeURL, fetch, region, siteID, token, uncachedEdgeURL }) {
		this.apiURL = apiURL;
		this.consistency = consistency ?? "eventual";
		this.edgeURL = edgeURL;
		this.fetch = fetch ?? globalThis.fetch;
		this.region = region;
		this.siteID = siteID;
		this.token = token;
		this.uncachedEdgeURL = uncachedEdgeURL;
		if (!this.fetch) throw new Error("Netlify Blobs could not find a `fetch` client in the global scope. You can either update your runtime to a version that includes `fetch` (like Node.js 18.0.0 or above), or you can supply your own implementation using the `fetch` property.");
	}
	async getFinalRequest({ consistency: opConsistency, key, metadata, method, parameters = {}, storeName }) {
		const encodedMetadata = encodeMetadata(metadata);
		const consistency = opConsistency ?? this.consistency;
		let urlPath = `/${this.siteID}`;
		if (storeName) urlPath += `/${storeName}`;
		if (key) urlPath += `/${key}`;
		if (this.edgeURL) {
			if (consistency === "strong" && !this.uncachedEdgeURL) throw new BlobsConsistencyError();
			const headers = { authorization: `Bearer ${this.token}` };
			if (encodedMetadata) headers[METADATA_HEADER_INTERNAL] = encodedMetadata;
			if (this.region) urlPath = `/region:${this.region}${urlPath}`;
			const url2 = new URL(urlPath, consistency === "strong" ? this.uncachedEdgeURL : this.edgeURL);
			for (const key2 in parameters) url2.searchParams.set(key2, parameters[key2]);
			return {
				headers,
				url: url2.toString()
			};
		}
		const apiHeaders = { authorization: `Bearer ${this.token}` };
		const url = new URL(`/api/v1/blobs${urlPath}`, this.apiURL ?? "https://api.netlify.com");
		for (const key2 in parameters) url.searchParams.set(key2, parameters[key2]);
		if (this.region) url.searchParams.set("region", this.region);
		if (storeName === void 0 || key === void 0) return {
			headers: apiHeaders,
			url: url.toString()
		};
		if (encodedMetadata) apiHeaders[METADATA_HEADER_EXTERNAL] = encodedMetadata;
		if (method === "head" || method === "delete") return {
			headers: apiHeaders,
			url: url.toString()
		};
		const res = await this.fetch(url.toString(), {
			headers: {
				...apiHeaders,
				accept: SIGNED_URL_ACCEPT_HEADER
			},
			method
		});
		if (res.status !== 200) throw new BlobsInternalError(res);
		const { url: signedURL } = await res.json();
		return {
			headers: encodedMetadata ? { [METADATA_HEADER_INTERNAL]: encodedMetadata } : void 0,
			url: signedURL
		};
	}
	async makeRequest({ body, conditions = {}, consistency, headers: extraHeaders, key, metadata, method, parameters, storeName }) {
		const { headers: baseHeaders = {}, url } = await this.getFinalRequest({
			consistency,
			key,
			metadata,
			method,
			parameters,
			storeName
		});
		const headers = {
			...baseHeaders,
			...extraHeaders
		};
		if (method === "put") headers["cache-control"] = "max-age=0, stale-while-revalidate=60";
		if ("onlyIfMatch" in conditions && conditions.onlyIfMatch) headers["if-match"] = conditions.onlyIfMatch;
		else if ("onlyIfNew" in conditions && conditions.onlyIfNew) headers["if-none-match"] = "*";
		const options = {
			body,
			headers,
			method
		};
		if (body instanceof ReadableStream) options.duplex = "half";
		return fetchAndRetry(this.fetch, url, options);
	}
};
var getClientOptions = (options, contextOverride) => {
	const context = contextOverride ?? getEnvironmentContext();
	const siteID = context.siteID ?? options.siteID;
	const token = context.token ?? options.token;
	if (!siteID || !token) throw new MissingBlobsEnvironmentError(["siteID", "token"]);
	if (options.region !== void 0 && !isValidRegion(options.region)) throw new InvalidBlobsRegionError(options.region);
	return {
		apiURL: context.apiURL ?? options.apiURL,
		consistency: options.consistency,
		edgeURL: context.edgeURL ?? options.edgeURL,
		fetch: options.fetch,
		region: options.region,
		siteID,
		token,
		uncachedEdgeURL: context.uncachedEdgeURL ?? options.uncachedEdgeURL
	};
};
//#endregion
//#region node_modules/.pnpm/@netlify+blobs@10.7.9/node_modules/@netlify/blobs/dist/main.js
var DEPLOY_STORE_PREFIX = "deploy:";
var LEGACY_STORE_INTERNAL_PREFIX = "netlify-internal/legacy-namespace/";
var SITE_STORE_PREFIX = "site:";
var STATUS_OK = 200;
var STATUS_PRE_CONDITION_FAILED = 412;
var Store = class _Store {
	constructor(options) {
		this.client = options.client;
		if ("deployID" in options) {
			_Store.validateDeployID(options.deployID);
			let name = DEPLOY_STORE_PREFIX + options.deployID;
			if (options.name) name += `:${options.name}`;
			this.name = name;
		} else if (options.name.startsWith(LEGACY_STORE_INTERNAL_PREFIX)) {
			const storeName = options.name.slice(LEGACY_STORE_INTERNAL_PREFIX.length);
			_Store.validateStoreName(storeName);
			this.name = storeName;
		} else {
			_Store.validateStoreName(options.name);
			this.name = SITE_STORE_PREFIX + options.name;
		}
	}
	async delete(key) {
		const res = await this.client.makeRequest({
			key,
			method: "delete",
			storeName: this.name
		});
		if (![
			200,
			204,
			404
		].includes(res.status)) throw new BlobsInternalError(res);
	}
	async deleteAll() {
		let totalDeletedBlobs = 0;
		let hasMore = true;
		while (hasMore) {
			const res = await this.client.makeRequest({
				method: "delete",
				storeName: this.name
			});
			if (res.status !== 200) throw new BlobsInternalError(res);
			const data = await res.json();
			if (typeof data.blobs_deleted !== "number") throw new BlobsInternalError(res);
			totalDeletedBlobs += data.blobs_deleted;
			hasMore = typeof data.has_more === "boolean" && data.has_more;
		}
		return { deletedBlobs: totalDeletedBlobs };
	}
	async get(key, options) {
		return withSpan(options?.span, "blobs.get", async (span) => {
			const { consistency, type } = options ?? {};
			span?.setAttributes({
				"blobs.store": this.name,
				"blobs.key": key,
				"blobs.type": type,
				"blobs.method": "GET",
				"blobs.consistency": consistency
			});
			const res = await this.client.makeRequest({
				consistency,
				key,
				method: "get",
				storeName: this.name
			});
			span?.setAttributes({
				"blobs.response.body.size": res.headers.get("content-length") ?? void 0,
				"blobs.response.status": res.status
			});
			if (res.status === 404) return null;
			if (res.status !== 200) throw new BlobsInternalError(res);
			if (type === void 0 || type === "text") return res.text();
			if (type === "arrayBuffer") return res.arrayBuffer();
			if (type === "blob") return res.blob();
			if (type === "json") return res.json();
			if (type === "stream") return res.body;
			throw new BlobsInternalError(res);
		});
	}
	async getMetadata(key, options = {}) {
		return withSpan(options?.span, "blobs.getMetadata", async (span) => {
			span?.setAttributes({
				"blobs.store": this.name,
				"blobs.key": key,
				"blobs.method": "HEAD",
				"blobs.consistency": options.consistency
			});
			const res = await this.client.makeRequest({
				consistency: options.consistency,
				key,
				method: "head",
				storeName: this.name
			});
			span?.setAttributes({ "blobs.response.status": res.status });
			if (res.status === 404) return null;
			if (res.status !== 200 && res.status !== 304) throw new BlobsInternalError(res);
			return {
				etag: res?.headers.get("etag") ?? void 0,
				metadata: getMetadataFromResponse(res)
			};
		});
	}
	async getWithMetadata(key, options) {
		return withSpan(options?.span, "blobs.getWithMetadata", async (span) => {
			const { consistency, etag: requestETag, type } = options ?? {};
			const headers = requestETag ? { "if-none-match": requestETag } : void 0;
			span?.setAttributes({
				"blobs.store": this.name,
				"blobs.key": key,
				"blobs.method": "GET",
				"blobs.consistency": options?.consistency,
				"blobs.type": type,
				"blobs.request.etag": requestETag
			});
			const res = await this.client.makeRequest({
				consistency,
				headers,
				key,
				method: "get",
				storeName: this.name
			});
			const responseETag = res?.headers.get("etag") ?? void 0;
			span?.setAttributes({
				"blobs.response.body.size": res.headers.get("content-length") ?? void 0,
				"blobs.response.etag": responseETag,
				"blobs.response.status": res.status
			});
			if (res.status === 404) return null;
			if (res.status !== 200 && res.status !== 304) throw new BlobsInternalError(res);
			const result = {
				etag: responseETag,
				metadata: getMetadataFromResponse(res)
			};
			if (res.status === 304 && requestETag) return {
				data: null,
				...result
			};
			if (type === void 0 || type === "text") return {
				data: await res.text(),
				...result
			};
			if (type === "arrayBuffer") return {
				data: await res.arrayBuffer(),
				...result
			};
			if (type === "blob") return {
				data: await res.blob(),
				...result
			};
			if (type === "json") return {
				data: await res.json(),
				...result
			};
			if (type === "stream") return {
				data: res.body,
				...result
			};
			throw new Error(`Invalid 'type' property: ${type}. Expected: arrayBuffer, blob, json, stream, or text.`);
		});
	}
	list(options = {}) {
		return withSpan(options.span, "blobs.list", (span) => {
			span?.setAttributes({
				"blobs.store": this.name,
				"blobs.method": "GET",
				"blobs.list.paginate": options.paginate ?? false
			});
			const iterator = this.getListIterator(options);
			if (options.paginate) return iterator;
			return collectIterator(iterator).then((items) => items.reduce((acc, item) => ({
				blobs: [...acc.blobs, ...item.blobs],
				directories: [...acc.directories, ...item.directories]
			}), {
				blobs: [],
				directories: []
			}));
		});
	}
	async set(key, data, options = {}) {
		return withSpan(options.span, "blobs.set", async (span) => {
			span?.setAttributes({
				"blobs.store": this.name,
				"blobs.key": key,
				"blobs.method": "PUT",
				"blobs.data.size": typeof data == "string" ? data.length : data instanceof Blob ? data.size : data.byteLength,
				"blobs.data.type": typeof data == "string" ? "string" : data instanceof Blob ? "blob" : "arrayBuffer",
				"blobs.atomic": Boolean(options.onlyIfMatch ?? options.onlyIfNew)
			});
			_Store.validateKey(key);
			const conditions = _Store.getConditions(options);
			const res = await this.client.makeRequest({
				conditions,
				body: data,
				key,
				metadata: options.metadata,
				method: "put",
				storeName: this.name
			});
			const etag = res.headers.get("etag") ?? "";
			span?.setAttributes({
				"blobs.response.etag": etag,
				"blobs.response.status": res.status
			});
			if (conditions) return res.status === STATUS_PRE_CONDITION_FAILED ? { modified: false } : {
				etag,
				modified: true
			};
			if (res.status === STATUS_OK) return {
				etag,
				modified: true
			};
			throw new BlobsInternalError(res);
		});
	}
	async setJSON(key, data, options = {}) {
		return withSpan(options.span, "blobs.setJSON", async (span) => {
			span?.setAttributes({
				"blobs.store": this.name,
				"blobs.key": key,
				"blobs.method": "PUT",
				"blobs.data.type": "json"
			});
			_Store.validateKey(key);
			const conditions = _Store.getConditions(options);
			const payload = JSON.stringify(data);
			const headers = { "content-type": "application/json" };
			const res = await this.client.makeRequest({
				...conditions,
				body: payload,
				headers,
				key,
				metadata: options.metadata,
				method: "put",
				storeName: this.name
			});
			const etag = res.headers.get("etag") ?? "";
			span?.setAttributes({
				"blobs.response.etag": etag,
				"blobs.response.status": res.status
			});
			if (conditions) return res.status === STATUS_PRE_CONDITION_FAILED ? { modified: false } : {
				etag,
				modified: true
			};
			if (res.status === STATUS_OK) return {
				etag,
				modified: true
			};
			throw new BlobsInternalError(res);
		});
	}
	static formatListResultBlob(result) {
		if (!result.key) return null;
		return {
			etag: result.etag,
			key: result.key
		};
	}
	static getConditions(options) {
		if ("onlyIfMatch" in options && "onlyIfNew" in options) throw new Error(`The 'onlyIfMatch' and 'onlyIfNew' options are mutually exclusive. Using 'onlyIfMatch' will make the write succeed only if there is an entry for the key with the given content, while 'onlyIfNew' will make the write succeed only if there is no entry for the key.`);
		if ("onlyIfMatch" in options && options.onlyIfMatch) {
			if (typeof options.onlyIfMatch !== "string") throw new Error(`The 'onlyIfMatch' property expects a string representing an ETag.`);
			return { onlyIfMatch: options.onlyIfMatch };
		}
		if ("onlyIfNew" in options && options.onlyIfNew) {
			if (typeof options.onlyIfNew !== "boolean") throw new Error(`The 'onlyIfNew' property expects a boolean indicating whether the write should fail if an entry for the key already exists.`);
			return { onlyIfNew: true };
		}
	}
	static validateKey(key) {
		if (key === "") throw new Error("Blob key must not be empty.");
		if (key.startsWith("/") || key.startsWith("%2F")) throw new Error("Blob key must not start with forward slash (/).");
		if (new TextEncoder().encode(key).length > 600) throw new Error("Blob key must be a sequence of Unicode characters whose UTF-8 encoding is at most 600 bytes long.");
	}
	static validateDeployID(deployID) {
		if (!/^\w{1,24}$/.test(deployID)) throw new Error(`'${deployID}' is not a valid Netlify deploy ID.`);
	}
	static validateStoreName(name) {
		if (name.includes("/") || name.includes("%2F")) throw new Error("Store name must not contain forward slashes (/).");
		if (new TextEncoder().encode(name).length > 64) throw new Error("Store name must be a sequence of Unicode characters whose UTF-8 encoding is at most 64 bytes long.");
	}
	getListIterator(options) {
		const { client, name: storeName } = this;
		const parameters = {};
		if (options?.prefix) parameters.prefix = options.prefix;
		if (options?.directories) parameters.directories = "true";
		return { [Symbol.asyncIterator]() {
			let currentCursor = null;
			let done = false;
			return { async next() {
				return withSpan(options?.span, "blobs.list.next", async (span) => {
					span?.setAttributes({
						"blobs.store": storeName,
						"blobs.method": "GET",
						"blobs.list.paginate": options?.paginate ?? false,
						"blobs.list.done": done,
						"blobs.list.cursor": currentCursor ?? void 0
					});
					if (done) return {
						done: true,
						value: void 0
					};
					const nextParameters = { ...parameters };
					if (currentCursor !== null) nextParameters.cursor = currentCursor;
					const res = await client.makeRequest({
						method: "get",
						parameters: nextParameters,
						storeName
					});
					span?.setAttributes({ "blobs.response.status": res.status });
					let blobs = [];
					let directories = [];
					if (![
						200,
						204,
						404
					].includes(res.status)) throw new BlobsInternalError(res);
					if (res.status === 404) done = true;
					else {
						const page = await res.json();
						if (page.next_cursor) currentCursor = page.next_cursor;
						else done = true;
						blobs = (page.blobs ?? []).map(_Store.formatListResultBlob).filter(Boolean);
						directories = page.directories ?? [];
					}
					return {
						done: false,
						value: {
							blobs,
							directories
						}
					};
				});
			} };
		} };
	}
};
var getStore = (input, options) => {
	if (typeof input === "string") {
		const contextOverride = options?.siteID && options?.token ? {
			siteID: options?.siteID,
			token: options?.token
		} : void 0;
		return new Store({
			client: new Client(getClientOptions(options ?? {}, contextOverride)),
			name: input
		});
	}
	if (typeof input?.name === "string") {
		const { name } = input;
		const clientOptions = getClientOptions(input, input?.siteID && input?.token ? {
			siteID: input?.siteID,
			token: input?.token
		} : void 0);
		if (!name) throw new MissingBlobsEnvironmentError(["name"]);
		return new Store({
			client: new Client(clientOptions),
			name
		});
	}
	if (typeof input?.deployID === "string") {
		const clientOptions = getClientOptions(input);
		const { deployID } = input;
		if (!deployID) throw new MissingBlobsEnvironmentError(["deployID"]);
		return new Store({
			client: new Client(clientOptions),
			deployID
		});
	}
	throw new Error("The `getStore` method requires the name of the store as a string or as the `name` property of an options object");
};
//#endregion
//#region app/lib/imported-schools.ts
var importedSchools = [
	{
		"externalId": "1",
		"name": "Aix - La Nativité Ecole -",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "BIZOT-ESPIARD MARIE FRANCOISE",
		"registeredCount": 0,
		"city": "Aix en Provence",
		"address": "8 rue Jean Andreani",
		"department": "13 : Bouches-du-Rhône; 13000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "2",
		"name": "Aix - Collège du Sacré Coeur - Collège",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "Sordi Christiane",
		"registeredCount": 2,
		"city": "Aix en Provence",
		"address": "29 cours des Arts et Métiers",
		"department": "13 : Bouches-du-Rhône; 13000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "8",
		"name": "Asnières - Ecole Sainte Geneviève -",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 14,
		"city": "Asnières",
		"address": "50 avenue de la Marne",
		"department": "92 : Hauts-de-Seine; 92600; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "10",
		"name": "Bordeaux - Saint Genès La Salle - Collège",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "CHARVET EMMANUELLE",
		"registeredCount": 0,
		"city": "Bordeaux",
		"address": "160 rue de Saint-Genès",
		"department": "33 : Gironde; 33000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "11",
		"name": "Bordeaux - Saint Joseph de Tivoli - De la 5ème à la 3ème",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 4,
		"city": "Bordeaux",
		"address": "40 Avenue d'Eysines",
		"department": "33 : Gironde; 33000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "12",
		"name": "Boulogne - Notre Dame de Boulogne - Lycée",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "PICOT Benoit",
		"registeredCount": 0,
		"city": "Boulogne-Billancourt",
		"address": "8 rue du Parchamp, 92100",
		"department": "92 : Hauts-de-Seine; 92000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "15",
		"name": "Chaville - Saint Thomas de Villeneuve - Collège Lycée",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "LATOUR Amélie",
		"registeredCount": 0,
		"city": "Chaville",
		"address": "1646 avenue Roger Salengro",
		"department": "92 : Hauts-de-Seine; 92370; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "18",
		"name": "Loches - Saint Denis International School - Lycée",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Loches",
		"address": "19 Avenue du Général de Gaulle",
		"department": "37 : Indre-et-Loire; 37600; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "21",
		"name": "Le Vésinet - Ecole Le Bon Sauveur - Ecole",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "Chenneviere Arlette",
		"registeredCount": 95,
		"city": "Le Vésinet",
		"address": "6 Rue Henri Cloppet",
		"department": "78 : Yvelines; 78110; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "22",
		"name": "Lyon - Charles de Foucauld - Collège",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "Touil Sabrina",
		"registeredCount": 3,
		"city": "Lyon",
		"address": "9 rue de l'Est",
		"department": "69 : Rhône; 69003; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "23",
		"name": "Lyon - Saint Marc - Lycée",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Lyon",
		"address": "10 rue Sainte Hélène",
		"department": "69 : Rhône; 69002; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "24",
		"name": "Marseille - Saint Joseph de la Madeleine - Collège Lycée",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "LAMI Oussama",
		"registeredCount": 0,
		"city": "Marseille",
		"address": "172 Bis Boulevard de la Libération",
		"department": "13 : Bouches-du-Rhône; 13004; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "26",
		"name": "Montreuil - Henri Matisse - Collège Lycée",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "Asri Mustapha",
		"registeredCount": 4,
		"city": "Montreuil",
		"address": "88 bis Rue Jules Guesde",
		"department": "93 : Seine-Saint-Denis; 93100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "27",
		"name": "Rennes - Notre Dame du Vieux Cours - Collège",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "Sarazin Thomas",
		"registeredCount": 1,
		"city": "Rennes",
		"address": "11 rue de Plélo, 35000 Rennes",
		"department": "35 : Ille-et-Vilaine; 35000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "28",
		"name": "Rennes - Notre Dame du Vieux Cours - Ecole",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "Sarazin Thomas",
		"registeredCount": 6,
		"city": "Rennes",
		"address": "11 rue de Plélo, 35000 Rennes",
		"department": "35 : Ille-et-Vilaine; 35000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "29",
		"name": "Paris - Charles de Foucauld - Ecole",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "CHIBANI Sihem",
		"registeredCount": 22,
		"city": "Paris",
		"address": "12 rue des Jonquilles 75014",
		"department": "75 : Paris; 75014; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "30",
		"name": "Paris - Institut de la Tour - Collège",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "de Condé Philippe",
		"registeredCount": 6,
		"city": "Paris",
		"address": "86 rue de la Tour 75016",
		"department": "75 : Paris; 75016; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "31",
		"name": "Paris - Institut de la Tour - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Paris",
		"address": "86 rue de la Tour",
		"department": "75 : Paris; 75016; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "34",
		"name": "Paris - Institut Sainte Geneviève - 4ème 2nde",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "CHEVRIER Noah",
		"registeredCount": 1,
		"city": "Paris",
		"address": "64 rue d'Assas, 75006",
		"department": "75 : Paris; 75006; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "35",
		"name": "Paris - Institut Sainte Geneviève - 6ème 5ème",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "CHEVRIER Noah",
		"registeredCount": 2,
		"city": "Paris",
		"address": "64 rue d'Assas 75006",
		"department": "75 : Paris; 75006; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "38",
		"name": "Paris - Rocroy Saint Vincent de Paul - Ecole",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 9,
		"city": "Paris",
		"address": "6 rue de Rocroy 75010",
		"department": "75 : Paris; 75010; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "41",
		"name": "Rueil - Collège Saint Charles Notre Dame -",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "LOGEAIS BLANDINE",
		"registeredCount": 1,
		"city": "Rueil Malmaison",
		"address": "15 Rue René Cassin, 92500",
		"department": "92 : Hauts-de-Seine; 92500; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "45",
		"name": "Toulouse - Ensemble scolaire les Maristes - Collège - Lycée",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Toulouse",
		"address": "134-136 Avenue de Lespinet",
		"department": "31 : Haute-Garonne; 31000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "49",
		"name": "Tours - Notre Dame La Riche - 2nde 3ème",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "LENGAGNE Céline",
		"registeredCount": 1,
		"city": "Tours",
		"address": "42 rue Delpérier",
		"department": "37 : Indre-et-Loire; 37000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "51",
		"name": "Tours - Notre Dame La Riche - 6ème 5ème 4ème",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "LENGAGNE Céline",
		"registeredCount": 2,
		"city": "Tours",
		"address": "42 rue Delpérier",
		"department": "37 : Indre-et-Loire; 37000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "54",
		"name": "Valence - Saint Victor - Collège Lycée",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "CRETON Brigitte",
		"registeredCount": 0,
		"city": "Valence",
		"address": "3 Rue de la Cécile",
		"department": "26 : Drôme; 26000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "61",
		"name": "Dijon - Collège Saint Bénigne -",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "CLAVIER Thristan",
		"registeredCount": 0,
		"city": "Dijon",
		"address": "7 rue du Pommard",
		"department": "21 : Côte-d'Or; 21231; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "62",
		"name": "Tassin - Institution Saint Joseph - De la 5ème à la Terminale",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "HILAIRE CATHERINE",
		"registeredCount": 1,
		"city": "Tassin la Demi Lune",
		"address": "7 Rue du Lieutenant Henri Audras",
		"department": "69 : Rhône; 69160; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "66",
		"name": "Gex - Collège Jeanne d'Arc - Collège",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "Taoubi Ilias",
		"registeredCount": 7,
		"city": "Gex",
		"address": "273 Rue de Genève",
		"department": "01 : Ain; 01170; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "70",
		"name": "Meudon - Institut Notre Dame - 6ème 5ème",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "Sibous Farid",
		"registeredCount": 0,
		"city": "Meudon",
		"address": "18 rue de la République, 92190 Meudon",
		"department": "92 : Hauts-de-Seine; 92190; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "74",
		"name": "Mulhouse - Institut Jeanne d'Arc - Collège",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Mulhouse",
		"address": "15 rue Chanoine Brun",
		"department": "68 : Haut-Rhin; 68100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "75",
		"name": "Mulhouse - Institut Jeanne d'Arc - Ecole",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 17,
		"city": "Mulhouse",
		"address": "3 rue Chanoine Winterer",
		"department": "68 : Haut-Rhin; 68100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "78",
		"name": "Le Mesnil Esnard - La Providence Nicolas Barré - 6&5",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Le Mesnil-Esnard",
		"address": "6 Rue de Neuvillette",
		"department": "76 : Seine-Maritime; 76000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "83",
		"name": "Toulon - Cours Fénelon Ecole - Etude Alpha au primaire",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "Pisaneschi Alysson Stéphanie Raymonde",
		"registeredCount": 26,
		"city": "Toulon",
		"address": "251 Rue Pourquoi Pas, 83000 Toulon",
		"department": "83 : Var; 83000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "85",
		"name": "Toulon - Cours Fénelon Ecole - Etude Surveillée",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Toulon",
		"address": "251 Rue Pourquoi Pas, 83000 Toulon",
		"department": "83 : Var; 83000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "87",
		"name": "Rennes - Collège Saint Hélier -",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "RIOUAL Nathalie",
		"registeredCount": 2,
		"city": "Rennes",
		"address": "7 Rue Frère Salomon",
		"department": "35 : Ille-et-Vilaine; 35000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "93",
		"name": "Tassin - Institution Saint Joseph - Primaire et 6ème",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "HILAIRE CATHERINE",
		"registeredCount": 6,
		"city": "Tassin la Demi Lune",
		"address": "7 Rue du Lieutenant Henri Audras",
		"department": "69 : Rhône; 69160; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "96",
		"name": "Lyon - Belmont - Lycée",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Lyon",
		"address": "43 rue Pasteur",
		"department": "69 : Rhône; 75007; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "99",
		"name": "Beaune - Collège Saint Coeur -",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Beaune",
		"address": "3 rue du faubourg saint Nicolas, 21200 Beaune",
		"department": "21 : Côte-d'Or; 21200; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "109",
		"name": "Aix - La Nativité Collège La Beauvalle -",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "Paquola Christine",
		"registeredCount": 0,
		"city": "Aix en Provence",
		"address": "8 Rue Jean Andreani",
		"department": "13 : Bouches-du-Rhône; 13080; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "121",
		"name": "Bayonne - Collège La Salle Saint Bernard -",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "Estique Maïténa",
		"registeredCount": 13,
		"city": "Bayonne",
		"address": "16 Rue Antoine Labarthe, 64100 Bayonne",
		"department": "64 : Pyrénées-Atlantiques; 64100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "126",
		"name": "Bayonne - Ecole La Salle Saint Bernard -",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "Estique Maïténa",
		"registeredCount": 9,
		"city": "Bayonne",
		"address": "16 rue Antoine Labarthe 64100 Bayonne",
		"department": "64 : Pyrénées-Atlantiques; 64100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "129",
		"name": "Courbevoie - Lycée Montalembert -",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Courbevoie",
		"address": "238 Boulevard Saint-Denis",
		"department": "92 : Hauts-de-Seine; 92026; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "130",
		"name": "Courbevoie - Groupe Scolaire Sainte Geneviève - Ecole",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "Barkate Badiâ",
		"registeredCount": 27,
		"city": "Courbevoie",
		"address": "6 Rue Jean Pierre Timbaud",
		"department": "92 : Hauts-de-Seine; 92026; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "131",
		"name": "Pontoise - Notre Dame de la Compassion - Collège Lycée",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "HENON HELENE",
		"registeredCount": 14,
		"city": "Pontoise",
		"address": "8 Place Nicolas Flamel, 95300 Pontoise",
		"department": "95 : Val-d'Oise; 95300; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "134",
		"name": "Fontainebleau - Jeanne d'Arc Saint Aspais - Collège Lycée",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "Leclair François Xavier",
		"registeredCount": 11,
		"city": "Fontainebleau",
		"address": "1 rue Saint Merry",
		"department": "77 : Seine-et-Marne; 77300; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "144",
		"name": "La Celle Saint Cloud - Sainte Marie -",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "KOUAME PULCHERIE",
		"registeredCount": 34,
		"city": "La Celle Saint-Cloud",
		"address": "15 rue Béranger ; 78170 La Celle Saint Cloud",
		"department": "78 : Yvelines; 78170; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "146",
		"name": "Angers - Ecole Sainte Bernadette - Etude Surveillée",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Angers",
		"address": "15 rue Nicolas Bataille, 49000 Angers",
		"department": "49 : Maine-et-Loire; 49000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "147",
		"name": "Angers - Ecole Sainte Bernadette - Etude Alpha",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "Elliot-Saudrais Maudwenn",
		"registeredCount": 6,
		"city": "Angers",
		"address": "15 rue Nicolas Bataille, 49000 Angers",
		"department": "49 : Maine-et-Loire; 49000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "149",
		"name": "Rennes - Assomption - Collège Lycée",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Rennes",
		"address": "18 Bd Paul Painlevé Rennes",
		"department": "35 : Ille-et-Vilaine; 35000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "151",
		"name": "Saint Gaudens - Ensemble Scolaire Sainte Thérèse -",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "Auxemery Niamh",
		"registeredCount": 6,
		"city": "Saint Gaudens",
		"address": "16 Rue du Bugatet",
		"department": "31 : Haute-Garonne; 31800; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "152",
		"name": "Marseille - Ecole catholique Endoume -",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Marseille",
		"address": "20 Bd Bensa 13007 MARSEILLE",
		"department": "13 : Bouches-du-Rhône; 13007; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "155",
		"name": "Asnières - Institution Sainte Geneviève - Collège et 2nd",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "LAMY BRUNO",
		"registeredCount": 10,
		"city": "Asnières sur Seine",
		"address": "48 Av. de la Marne, 92600 Asnières-sur-Seine",
		"department": "92 : Hauts-de-Seine; 92600; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "158",
		"name": "Rouffach - Saint Joseph - Ecole",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "Bouarioua Adel",
		"registeredCount": 12,
		"city": "Rouffach",
		"address": "Institution Saint-Joseph 11 rue Poincaré 68250 Rouffach",
		"department": "68 : Haut-Rhin; 68250; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "162",
		"name": "Le Vésinet - Sainte Jeanne d'Arc - Primaire",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "Piens Valérie",
		"registeredCount": 61,
		"city": "Le Vésinet",
		"address": "2-6 rue Armand-Chardron 78110 Le Vésinet",
		"department": "78 : Yvelines; 78110; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "163",
		"name": "Paris - Ecole Nouvelle Saint Thomas d'Aquin - Etude Alpha",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 10,
		"city": "Paris",
		"address": "7 Rue Perronet, 75007 Paris",
		"department": "75 : Paris; 75007; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "167",
		"name": "Uzès - Ecole Sainte Anne -",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 6,
		"city": "Uzès",
		"address": "7 Rue Boucairie, 30700 Uzès",
		"department": "30 : Gard; 30700; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "171",
		"name": "Saint Germain en Laye - Institut Notre Dame - Ecole",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "Henique Fabienne",
		"registeredCount": 55,
		"city": "Saint Germain en Laye",
		"address": "22 ter, rue Alexandre Dumas 78100 Saint-Germain-en-Laye",
		"department": "78 : Yvelines; 79100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "173",
		"name": "Lyon - Ecole du Saint Sacrement - Etude Surveillée",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 16,
		"city": "Lyon",
		"address": "15 Rue Etienne Dolet, 69003 Lyon",
		"department": "69 : Rhône; 69003; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "174",
		"name": "Tours - Institution Saint Martin - CM1 Collège",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 12,
		"city": "Tours",
		"address": "47 Rue Néricault Destouches, 37000 Tours",
		"department": "37 : Indre-et-Loire; 37000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "178",
		"name": "Voiron - Notre Dame des Victoires -",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Voiron",
		"address": "1 Rue de la Terrasse, 38500 Voiron",
		"department": "38 : Isère; 38500; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "179",
		"name": "Nancy - Notre Dame Saint Sigisbert - Ecole",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "SCADUTO Marie",
		"registeredCount": 9,
		"city": "Nancy",
		"address": "40 quai Claude Le Lorrain",
		"department": "54 : Meurthe-et-Moselle; 54000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "182",
		"name": "Le Mesnil Esnard - La Providence Nicolas Barré - 4&3",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Le Mesnil-Esnard",
		"address": "6 Rue de Neuvillette",
		"department": "76 : Seine-Maritime; 76000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "187",
		"name": "Paris - Ecole ENC Blomet - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 4,
		"city": "Paris",
		"address": "5 rue Blomet",
		"department": "75 : Paris; 75015; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "188",
		"name": "Pertuis - Ensemble Scolaire Notre Dame - Ecole",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Pertuis",
		"address": "150 Chem. de Val Joanis, 84120 Pertuis",
		"department": "84 : Vaucluse; 84120; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "193",
		"name": "Sèvres - Groupe Scolaire Jeanne d'Arc - Ecole",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 15,
		"city": "Sèvres",
		"address": "7 rue de Rueil, 92310 Sèvres",
		"department": "92 : Hauts-de-Seine; 92310; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "197",
		"name": "Asnières - Saint Joseph - Ecole",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 41,
		"city": "Asnières",
		"address": "1, rue du Bac, 92600 Asnières",
		"department": "92 : Hauts-de-Seine; 92600; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "198",
		"name": "Lyon - Providence Trinitaires - Ecole",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 5,
		"city": "Lyon",
		"address": "13 Rue Bony, 69004 Lyon",
		"department": "69 : Rhône; 69004; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "199",
		"name": "Paris - Collège Charles Péguy - 6ème 5ème",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Paris",
		"address": "64 Rue Saint,Maur Paris 11",
		"department": "75 : Paris; 75011; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "200",
		"name": "Paris - Collège Lycée Charles Péguy - 4ème 3ème",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Paris",
		"address": "80 avenue Parmentier, Paris 11",
		"department": "75 : Paris; 75011; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "205",
		"name": "Saint Grégoire - Ecole Notre Dame -",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 8,
		"city": "Saint Grégoire",
		"address": "12 rue Abbé Pierre 35760 Saint Grégoire",
		"department": "35 : Ille-et-Vilaine; 35760; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "206",
		"name": "Paris - Sainte Catherine Labouré - Ecole",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 7,
		"city": "Paris",
		"address": "29 Rue Gassendi, 75014 Paris",
		"department": "75 : Paris; 75014; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "209",
		"name": "Saint Cloud - Ecole Saint Joseph - Etude Surveillée",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 8,
		"city": "Saint Cloud",
		"address": "8 Rue Emile Verhaeren, 92210 Saint-Cloud",
		"department": "92 : Hauts-de-Seine; 92210; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "212",
		"name": "Chelles - Gasnier Guy Sainte Bathilde - Etude Surveillée",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Chelles",
		"address": "1 rue Jean Véron 77500 CHELLES",
		"department": "77 : Seine-et-Marne; 77500; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "215",
		"name": "Paris - Sainte Elisabeth - Maternelle Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Paris",
		"address": "112 rue de Lourmel 75015 Paris",
		"department": "75 : Paris; 75015; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "216",
		"name": "Paris - Institution Saint Joseph de Grenelle - Etude Surveillée",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 5,
		"city": "Paris",
		"address": "13 Pl. Etienne Pernet, 75015 Paris",
		"department": "75 : Paris; 75015; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "221",
		"name": "Nîmes - Ecole Saint Vincent - Surveillance primaire",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Nîmes",
		"address": "32 rue des mûriers d'Espagne",
		"department": "30 : Gard; 30000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "224",
		"name": "Louveciennes - Ecole Sainte Jeanne d'Arc - Etude Alpha",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "Migati Nadia",
		"registeredCount": 52,
		"city": "Louveciennes",
		"address": "22 rue du Général Leclerc, 78430 Louveciennes",
		"department": "78 : Yvelines; 78430; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "225",
		"name": "Paris - Ecole Saint Laurent -",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 7,
		"city": "Paris",
		"address": "184 rue Lafayette 75010 Paris",
		"department": "75 : Paris; 75010; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "226",
		"name": "Paris - Collège Sainte Elisabeth - Etude Alpha",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 10,
		"city": "Paris",
		"address": "112 rue de Lourmel 75015 Paris",
		"department": "75 : Paris; 75015; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "227",
		"name": "Marly le Roi - Blanche de Louvencourt - Ecole",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "Sabbague Agnes",
		"registeredCount": 47,
		"city": "Marly-le-Roi",
		"address": "1 rue de Louvencourt Marly le Roi 78160",
		"department": "78 : Yvelines; 78160; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "230",
		"name": "Toulouse - Collège Sainte Marie des Ursulines -",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "Oleiwan Dany",
		"registeredCount": 2,
		"city": "Toulouse",
		"address": "34 avenue de la Colonne 31500 Toulouse",
		"department": "31 : Haute-Garonne; 31500; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "231",
		"name": "Toulouse - Sainte Marie de Nevers - Lycée",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Toulouse",
		"address": "10 rue du Périgord 31000 Toulouse",
		"department": "31 : Haute-Garonne; 31000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "232",
		"name": "Bois Colombes - Ecole Saint François d'Assise -",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 7,
		"city": "Bois Colombes",
		"address": "67 rue Paul Déroulède 92270 Bois-Colombes",
		"department": "92 : Hauts-de-Seine; 92270; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "235",
		"name": "Brest - Ecole La Croix Rouge -",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "CLOUX Manon Carole Kelly Sarah",
		"registeredCount": 3,
		"city": "Brest",
		"address": "2 rue Mirabeau 29200 Brest",
		"department": "29 : Finistère; 29200; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "238",
		"name": "Chambéry - Collège Saint François de Sales -",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "Asbai daoudi Wassim",
		"registeredCount": 1,
		"city": "Chambéry",
		"address": "6 place Cardinal Garonne 73000 Chambéry",
		"department": "73 : Savoie; 73000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "239",
		"name": "Paris - Ecole La Rochefoucauld - Etude Alpha",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "THONNAT Raphaëlle",
		"registeredCount": 22,
		"city": "Paris",
		"address": "11, rue Cler 75007 Paris",
		"department": "75 : Paris; 75007; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "240",
		"name": "Saint Germain en Laye - Institut Saint Thomas de Villeneuve - Primaire",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "Garcia Fanny",
		"registeredCount": 55,
		"city": "Saint Germain en Laye",
		"address": "15, rue des Louviers 78100 Saint-Germain-en-Laye",
		"department": "78 : Yvelines; 78100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "241",
		"name": "Villeurbanne - Ecole Sainte Thérèse l'Espérance - Surveillance cantine",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Villeurbanne",
		"address": "229 rue Francis du Pressencé 69100 Villeurbanne",
		"department": "69 : Rhône; 69100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "243",
		"name": "Lyon - Ecole Saint Nom de Jésus - Surveillance cantine",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Lyon",
		"address": "95 rue Tête d’or 69006 Lyon",
		"department": "69 : Rhône; 69006; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "244",
		"name": "Corbeil Essonnes - Sainte Marie - Ecole",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Corbeil Essonnes",
		"address": "39 Rue Champlouis, 91100 Corbeil-Essonnes",
		"department": "91 : Essonne; 91100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "245",
		"name": "Paris - Collège et Lycée La Rochefoucauld - Etude Alpha",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "gobinet suzy",
		"registeredCount": 7,
		"city": "Paris",
		"address": "22 rue Malar, 75007 Paris",
		"department": "75 : Paris; 75007; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "246",
		"name": "Montreuil - Ecole Henri Matisse - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Montreuil",
		"address": "88 bis Rue Jules Guesde, 93100 Montreuil",
		"department": "93 : Seine-Saint-Denis; 93100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "247",
		"name": "Montpellier - Saint François d'Assise - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 3,
		"city": "Montpellier",
		"address": "24, boulevard de Strasbourg",
		"department": "34 : Hérault; 67000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "248",
		"name": "Boulogne - Saint Alexandre - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Boulogne-Billancourt",
		"address": "23 Bd Jean Jaurès, 92100 Boulogne-Billancourt",
		"department": "92 : Hauts-de-Seine; 92100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "250",
		"name": "Avignon - Lycée Louis Pasteur - Etude Alpha",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Avignon",
		"address": "13 rue du Pont Trouca 84011 Avignon",
		"department": "84 : Vaucluse; 84011; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "251",
		"name": "Villeurbanne - Ecole Sainte Thérèse l'Espérance - Etude Alpha",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "SEVENIER Alexandra",
		"registeredCount": 6,
		"city": "Villeurbanne",
		"address": "229 rue François de Pressencé 69100 Villeurbanne",
		"department": "69 : Rhône; 69100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "254",
		"name": "Ecully - Ecole Sainte Blandine - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "Bridon Domitille",
		"registeredCount": 5,
		"city": "Ecully",
		"address": "4 Place de la Libération",
		"department": "69 : Rhône; 69081; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "255",
		"name": "Paris - Ecole La Rochefoucauld Surveillance -",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "Barkate Badiâ",
		"registeredCount": 9,
		"city": "Paris",
		"address": "11, rue Cler 75007 Paris",
		"department": "75 : Paris; 75007; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "256",
		"name": "Sèvres - Groupe Scolaire Jeanne d'Arc - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Sèvres",
		"address": "7 rue de Rueil, 92310 Sèvres",
		"department": "92 : Hauts-de-Seine; 92310; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "257",
		"name": "Nîmes - Institution Saint Stanislas - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Nîmes",
		"address": "16 Rue Chassaintes 30000 Nîmes",
		"department": "30 : Gard; 30000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "258",
		"name": "Louveciennes - Ecole Sainte Jeanne d'Arc - Récré",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Louveciennes",
		"address": "22 rue du Général Leclerc, 78430 Louveciennes",
		"department": "78 : Yvelines; 78430; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "259",
		"name": "Paris - Ecole Sévigné - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 4,
		"city": "Paris",
		"address": "95 boulevard Arago",
		"department": "75 : Paris; 75014; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "262",
		"name": "Paris - Ecole du Saint Esprit - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 4,
		"city": "Paris",
		"address": "56 rue des Meuniers",
		"department": "75 : Paris; 75012; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "264",
		"name": "Nantes - Saint Félix - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Nantes",
		"address": "2 rue Soubzmain",
		"department": "44 : Loire-Atlantique; 44000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "267",
		"name": "Montmagny - Notre Dame de la Providence - Etude Surveillée",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Montmagny",
		"address": "10 rue du Château",
		"department": "95 : Val-d'Oise; 95427; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "269",
		"name": "Asnières - Institution Saint Joseph - Surveillance cantine",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Asnières sur Seine",
		"address": "1, rue du Bac, 92600 Asnières",
		"department": "92 : Hauts-de-Seine; 92600; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "270",
		"name": "Cachan - Ecole Saint Joseph - Surveillance cantine",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Cachan",
		"address": "2 ter rue de la Citadelle 94230 Cachan",
		"department": "94 : Val-de-Marne; 94230; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "272",
		"name": "Le Vésinet - Sainte Jeanne d'Arc - Surveillance cantine",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 3,
		"city": "Le Vésinet",
		"address": "6 Rue Armand Chardron 78110 Le Vésinet",
		"department": "78 : Yvelines; 78110; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "273",
		"name": "Valence - Campus Montplaisir - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Valence",
		"address": "14, rue Barthélémy Laffemas, Valence",
		"department": "26 : Drôme; 26000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "274",
		"name": "Valence - Lycée Montplaisir - Accueil",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Valence",
		"address": "75 rue Montplaisir, 26000 Valence",
		"department": "26 : Drôme; 26000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "276",
		"name": "Chambéry - Collège Notre Dame de la Villette -",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Chambéry",
		"address": "200 avenue du Collège",
		"department": "73 : Savoie; 73000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "277",
		"name": "Lyon - Saint Pothin Ozanam - Etude Surveillée",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Lyon",
		"address": "35 rue Bugeaud",
		"department": "69 : Rhône; 69006; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "278",
		"name": "Nantes - Collège Saint Jacques de Compostelle - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 3,
		"city": "Nantes",
		"address": "11 rue Gabriel Goudy",
		"department": "44 : Loire-Atlantique; 44000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "279",
		"name": "Montrouge - Ecole Jeanne d'Arc - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Montrouge",
		"address": "Place Emile Cresp",
		"department": "92 : Hauts-de-Seine; 92120; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "280",
		"name": "Sevran - École Sainte Agnès - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Sevran",
		"address": "25 avenue du Général Leclerc 93270 Sevran",
		"department": "93 : Seine-Saint-Denis; 93270; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "281",
		"name": "Corenc - École et Collège Le Rondeau Montfleury - Surveillance Cantine",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Corenc",
		"address": "1 Chemin de la Croix de Montfleury",
		"department": "38 : Isère; 38700; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "283",
		"name": "La Garenne Colombes - Ecole Sainte Geneviève - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "La Garenne Colombes",
		"address": "23 Rue d'Estienne d'Orves, 92250 La Garenne-Colombes",
		"department": "92 : Hauts-de-Seine; 92250; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "284",
		"name": "Paris - Ecole Sévigné - DST",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Paris",
		"address": "28 rue Pierre Nicole 75005 Paris",
		"department": "75 : Paris; 75005; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "285",
		"name": "Paris - Sainte Catherine Labouré - Récurrent DST + Cantine",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Paris",
		"address": "29, rue Gassendi",
		"department": "75 : Paris; 75014; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "286",
		"name": "Paris - Sainte Catherine Labouré - Ponctuel",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Paris",
		"address": "29, rue Gassendi",
		"department": "75 : Paris; 75014; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "294",
		"name": "Lyon - Notre Dame Saint Joseph - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Lyon",
		"address": "Primaire :103 rue de la Guillotière 69007 Lyon // Maternelle : 95 rue Montesquieu",
		"department": "69 : Rhône; 69007; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "296",
		"name": "Arpajon - Ecole Sainte Jeanne d'Arc - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Arpajon",
		"address": "2 rue l'Aître 91290 Arpajon",
		"department": "91 : Essonne; 91290; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "297",
		"name": "Sucy en Brie - Collège Petit Val - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Sucy en Brie",
		"address": "12 Av. Albert Pleuvry 94370 Sucy-en-Brie",
		"department": "94 : Val-de-Marne; 94370; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "299",
		"name": "Poitiers - Saint Jacques de Compostelle - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Poitiers",
		"address": "2 Av. de la Révolution 86000 Poitiers",
		"department": "86 : Vienne; 86000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "300",
		"name": "Asnières - Ecole Saint Joseph - Surveillance cantine",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Asnières",
		"address": "1, rue du Bac, 92600 Asnières",
		"department": "92 : Hauts-de-Seine; 92600; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "306",
		"name": "Fontainebleau - Jeanne d'Arc Saint Aspais - Internat",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "Leclair François Xavier",
		"registeredCount": 0,
		"city": "Fontainebleau",
		"address": "1 rue Saint Merry Fontainebleau",
		"department": "77 : Seine-et-Marne; 77920; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "308",
		"name": "Rueil - Collège Saint Charles Notre Dame - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Rueil Malmaison",
		"address": "15 Rue René Cassin, 92500",
		"department": "92 : Hauts-de-Seine; 92500; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "309",
		"name": "Montpellier - Ecole Saint François Regis - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Montpellier",
		"address": "4 enclos Tissié Sarrus 34 000 Montpellier",
		"department": "34 : Hérault; 34000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "315",
		"name": "Pérenchies - Collège Sainte Marie - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Pérenchies",
		"address": "4 rue Gambetta 59840 Pérenchies",
		"department": "59 : Nord; 59840; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "318",
		"name": "Paris - Ecole Saint François d'Eylau - Surveillance cantine",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 3,
		"city": "Paris",
		"address": "20 Avenue Bugeaud 75116 Paris",
		"department": "75 : Paris; 75116; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "320",
		"name": "Orléans - Ecole Notre Dame de la Consolation - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Orléans",
		"address": "323 rue du Faubourg Bannier",
		"department": "45 : Loiret; 45000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "324",
		"name": "Saint Martin de Crau - Ecole Sacré Coeur - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Saint Martin de Crau",
		"address": "15 rue Logisson 13310 Saint Martin de Crau",
		"department": "13 : Bouches-du-Rhône; 13310; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "325",
		"name": "Tours - Collège Sainte Jeanne d'Arc - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Tours",
		"address": "50 Rue du Sergent Bobillot, 37000 Tours",
		"department": "37 : Indre-et-Loire; 37000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "327",
		"name": "Paris - La Preschool des Batignolles - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Paris",
		"address": "49 rue Lemercier 75017 Paris",
		"department": "75 : Paris; 75017; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "328",
		"name": "Paris - Ecole Lamazou - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 5,
		"city": "Paris",
		"address": "80 rue Boileau 75016 Paris",
		"department": "75 : Paris; 75016; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "329",
		"name": "Senlis - Collège Anne Marie Javouhey - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Senlis",
		"address": "6 rue Anne-Marie Javouhey 60300 Senlis",
		"department": "60 : Oise; 60300; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "330",
		"name": "Paris - Ursule et Zoé - Halte Garderie",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Paris",
		"address": "14 rue des Renaudes 75017 Paris",
		"department": "75 : Paris; 75017; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "331",
		"name": "Rognonas - Ecole Alpilles Durance - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 3,
		"city": "Rognonas",
		"address": "2 boulevard de Verdun",
		"department": "13 : Bouches-du-Rhône; 13870; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "332",
		"name": "Argenteuil - Ecole Notre Dame - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 3,
		"city": "Argenteuil",
		"address": "4 rue de Somme Py 95100 Argenteuil",
		"department": "95 : Val-d'Oise; 95100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "334",
		"name": "Verneuil sur Seine - Ecole Notre Dame les Oiseaux - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Verneuil sur Seine",
		"address": "106 Grande Rue, 78480 Verneuil-sur-Seine",
		"department": "78 : Yvelines; 78480; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "336",
		"name": "Poissy - Institution Notre Dame - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 6,
		"city": "Poissy",
		"address": "14 avenue Blanche de Castille 78300 Poissy",
		"department": "78 : Yvelines; 78300; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "337",
		"name": "Paris - Ecole Saint Honoré d'Eylau - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 3,
		"city": "Paris",
		"address": "66 avenue Raymond Poincaré 75116 Paris",
		"department": "75 : Paris; 75116; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "338",
		"name": "Pont Sainte Maxence - Institut Saint Joseph du Moncel - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Pont Sainte Maxence",
		"address": "8 Pl. de l'Église, 60700 Pont-Sainte-Maxence",
		"department": "60 : Oise; 60700; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "339",
		"name": "Strasbourg - Ecole Sainte Anne - Etude Alpha",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "Gattelet Rémi",
		"registeredCount": 4,
		"city": "Strasbourg",
		"address": "128 Route du Polygone, 67100 Strasbourg",
		"department": "67 : Bas-Rhin; 67100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "342",
		"name": "Marseille - Ecole Jeanne d'Arc - Etude Alpha",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "Barry Mody Hady",
		"registeredCount": 5,
		"city": "Marseille",
		"address": "43 rue Jean Mermoz 13008 Marseille",
		"department": "13 : Bouches-du-Rhône; 13008; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "344",
		"name": "Grenoble - Institution Saint Bruno - Ecole",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 5,
		"city": "Grenoble",
		"address": "27 Av. de Vizille, 38000 Grenoble",
		"department": "38 : Isère; 38000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "345",
		"name": "Vourles - Ecole Louis Querbes - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 3,
		"city": "Vourles",
		"address": "10 rue Louis Querbes 69390 VOURLES",
		"department": "69 : Rhône; 69390; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "347",
		"name": "Saint Jean de Luz - Saint Thomas d'Aquin - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Saint Jean de Luz",
		"address": "2 Rue Biscarbidea 64500 Saint-Jean-de-Luz",
		"department": "64 : Pyrénées-Atlantiques; 64500; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "348",
		"name": "Bordeaux - Ecole du Bon Pasteur - Aide aux devoirs",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Bordeaux",
		"address": "5 Rue de l'École Normale, 33200 Bordeaux Caudéran",
		"department": "33 : Gironde; 33200; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "349",
		"name": "Brignais - Ecole Saint Clair - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Brignais",
		"address": "6 Rue Paul Bovier Lapierre, 69530 Brignais",
		"department": "69 : Rhône; 69530; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "351",
		"name": "Paris - La Salle Notre Dame de la Gare - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Paris",
		"address": "20 Rue de Domrémy, 75013 Paris",
		"department": "75 : Paris; 75013; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "354",
		"name": "Oullins - Collège Lycée Saint Thomas d'Aquin - Etude Alpha",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "Carlin Claire",
		"registeredCount": 0,
		"city": "Oullins",
		"address": "56/70 rue du Perron 69600 Oullins",
		"department": "69 : Rhône; 69600; 1.0; 1.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "355",
		"name": "Montigny le Bretonneux - Ecole les Sources - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Montigny le Bretonneux",
		"address": "13 All. des Romarins, 78180 Montigny-le-Bretonneux",
		"department": "78 : Yvelines; 78180; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "356",
		"name": "Vorey - Ecole Sainte Thérèse - Etude surveillée",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Vorey",
		"address": "Rue Sainte-Thérèse, 43800 Vorey",
		"department": "43 : Haute-Loire; 43800; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "357",
		"name": "Paris - La Providence Passy - Etude Surveillée",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Paris",
		"address": "52 Rue de la Pompe, 75116 Paris",
		"department": "75 : Paris; 75116; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "359",
		"name": "Neuilly sur Seine - Sainte Croix de Neuilly - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Neuilly",
		"address": "30 Av. du Roule, 92200 Neuilly-sur-Seine",
		"department": "92 : Hauts-de-Seine; 92200; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "361",
		"name": "Paris - Ecole Notre Dame de la Gare - Etude CP CE1",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 10,
		"city": "Paris",
		"address": "24b rue Charcot, 75013 Paris",
		"department": "75 : Paris; 75013; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "362",
		"name": "Paris - Ecole Notre Dame de la Gare - Etude CE2 CM1 CM2",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 13,
		"city": "Paris",
		"address": "20 Rue de Domrémy, 75013 Paris",
		"department": "75 : Paris; 75013; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "363",
		"name": "Chevry - Ecole Sainte Marie - Etude surveillée",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Chevry",
		"address": "584 rue Saint Maurice 01170 Chevry",
		"department": "01 : Ain; 01170; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "364",
		"name": "Cannes - Assomption Lochabair - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 4,
		"city": "Cannes",
		"address": "24 Boulevard Oxford",
		"department": "06 : Alpes-Maritimes; 06400; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "365",
		"name": "Lyon - Ecole La Rédemption - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Lyon",
		"address": "35 Rue Lieutenant Colonel Prévost, 69006 Lyon",
		"department": "69 : Rhône; 69006; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "366",
		"name": "Grenoble - Ecole ELAG - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Grenoble",
		"address": "31 Rue de la Bajatière, 38100 Grenoble",
		"department": "38 : Isère; 38100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "367",
		"name": "Caluire - Ecole Sainte Marie - Etude Surveillée",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Caluire et Cuire",
		"address": "10 Av. Pierre Terrasse, 69300 Caluire-et-Cuire",
		"department": "69 : Rhône; 69300; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "368",
		"name": "Lyon - Lycée Charles de Foucauld - Stage",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Lyon",
		"address": "6 Rue Bara, 69003 Lyon",
		"department": "69 : Rhône; 69003; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "369",
		"name": "Saint Denis - La Salle Notre Dame de la Compassion - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 3,
		"city": "Saint Denis",
		"address": "6-8 Place de La Résistance et de La Déportation 93200 Saint-Denis",
		"department": "93 : Seine-Saint-Denis; 93200; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "370",
		"name": "Paris - Collège Saint Louis de Gonzague - Etude surveillée",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Paris",
		"address": "12 rue Benjamin Franklin, 75016 Paris",
		"department": "75 : Paris; 75016; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "371",
		"name": "Annecy - Ecole Saint Joseph - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Annecy",
		"address": "14 Av. Berthollet, 74000 Annecy",
		"department": "74 : Haute-Savoie; 74000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "372",
		"name": "Saint Germain en Laye - Institut Notre Dame - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 4,
		"city": "Saint Germain en Laye",
		"address": "22 ter, rue Alexandre Dumas 78100 Saint-Germain-en-Laye",
		"department": "78 : Yvelines; 78100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "373",
		"name": "Decines - Ecole Jeanne d'Arc - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Decines",
		"address": "189 Rue Emile Zola, 69150 Décines-Charpieu",
		"department": "69 : Rhône; 69150; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "374",
		"name": "Lyon - Ecole Saint Andre - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Lyon",
		"address": "66 Rue Pasteur, 69007 Lyon",
		"department": "69 : Rhône; 69007; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "375",
		"name": "Paris - Ecole Sévigné - Surveillance Barbusse",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Paris",
		"address": "39 rue Henri Barbusse 75005 Paris",
		"department": "75 : Paris; 75005; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "376",
		"name": "Lyon - Ecole du Saint Sacrement - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Lyon",
		"address": "15 Rue Etienne Dolet, 69003 Lyon",
		"department": "69 : Rhône; 69003; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "377",
		"name": "Saint Remy de Provence - Ecole Saint Martin - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Saint Rémy de Provence",
		"address": "2 Av. Louis Mistral, 13210 Saint-Rémy-de-Provence",
		"department": "13 : Bouches-du-Rhône; 13210; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "379",
		"name": "Orléans - Collège Cours Saint Charles -",
		"category": "Étude Alpha",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Orléans",
		"address": "25 rue des Grands Champs",
		"department": "45 : Loiret; 45000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "380",
		"name": "Paris - Ecole Saint Laurent - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Paris",
		"address": "184 rue Lafayette 75010 Paris",
		"department": "75 : Paris; 75010; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "381",
		"name": "Palaiseau - Institution Saint Martin - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Palaiseau",
		"address": "36 avenue du 8 mai 1945 91120 Palaiseau",
		"department": "91 : Essonne; 91120; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "382",
		"name": "Carhaix Plouguer - Collège Saint Trémeur - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Carhaix Plouguer",
		"address": "1 rue Cazuguel, 29833 Carhaix-Plouguer",
		"department": "29 : Finistère; 29833; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "383",
		"name": "Bethune - Ecole Saint Vaast - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Bethune",
		"address": "141 Rue Paul Doumer 62400 Béthune",
		"department": "62 : Pas-de-Calais; 62400; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "384",
		"name": "Bethune - Ecole Notre Dame de Lourdes - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Bethune",
		"address": "58, rue du Tir 62400 BETHUNE",
		"department": "62 : Pas-de-Calais; 62400; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "386",
		"name": "Saint Jean de Vedas - Ecole Saint Jean Baptiste - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Saint Jean de Vedas",
		"address": "10 rue des Escholiers 34430 Saint Jean de Vedas",
		"department": "34 : Hérault; 33430; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "387",
		"name": "Villeurbanne - Lycée Immaculée Conception - Surveillance DST",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Villeurbanne",
		"address": "74 Place Grandclément 69100 Villeurbanne",
		"department": "69 : Rhône; 69100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "388",
		"name": "Rezé - Ecole Notre Dame - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 3,
		"city": "Rezé",
		"address": "29 rue Font Launay 44401 Rezé",
		"department": "44 : Loire-Atlantique; 44401; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "391",
		"name": "Paris - La Salle Notre Dame de la Gare - Surveillance Charcot",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Paris",
		"address": "24b rue Charcot, 75013 Paris",
		"department": "75 : Paris; 75013; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "393",
		"name": "Chalon sur Saône - Ensemble Scolaire Saint Charles - Site Saint Dominique",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 3,
		"city": "Chalon sur Saône",
		"address": "20 avenue de Paris - 71100 Chalon-sur-Saône",
		"department": "71 : Saône-et-Loire; 71100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "394",
		"name": "Chalon sur Saône - Ensemble Scolaire Saint Charles - Site Le Devoir",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Chalon sur Saône",
		"address": "Chemin du Pensionnat - 71100 Chalon-sur-Saône",
		"department": "71 : Saône-et-Loire; 71100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "395",
		"name": "Maisons Laffite - Ecole Sainte Marie - Etude Surveillée",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 3,
		"city": "Maisons Laffite",
		"address": "8 rue du Fossé 78600 Maisons Laffite",
		"department": "78 : Yvelines; 78600; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "396",
		"name": "Paris - Groupe Scolaire Fénelon Sainte Marie - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Paris",
		"address": "17 bis rue de Tocqueville 75017 Paris",
		"department": "75 : Paris; 75017; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "398",
		"name": "Notre Dame - Établissement test -",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Chamalières",
		"address": "1 rue du test",
		"department": "63 : Puy-de-Dôme; 63400; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "400",
		"name": "Paris - Groupe Scolaire Fénelon Sainte Marie - Coordination cantine",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Paris",
		"address": "95 bis rue de Monceau 75008 Paris",
		"department": "75 : Paris; 75008; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "401",
		"name": "Lyon - Ecole Immaculée Conception - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Lyon",
		"address": "187 rue Vendôme 69003 Lyon",
		"department": "69 : Rhône; 69003; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "402",
		"name": "Chinon - Collège Saint Joseph - Etude dirigée",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Chinon",
		"address": "1 rue Buffon 37500 Chinon",
		"department": "37 : Indre-et-Loire; 37500; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "404",
		"name": "Boulogne - Notre Dame de Boulogne - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Boulogne Billancourt",
		"address": "8 rue du Parchamp",
		"department": "92 : Hauts-de-Seine; 92100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "405",
		"name": "Annecy - Les Tilleuls - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Annecy",
		"address": "60 avenue Gambetta 74000 Annecy",
		"department": "74 : Haute-Savoie; 74000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "406",
		"name": "Annecy - Les Tilleuls - Etude",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Annecy",
		"address": "60 avenue Gambetta 74000 Annecy",
		"department": "74 : Haute-Savoie; 74000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "407",
		"name": "Le Vésinet - Collège Le Bon Sauveur - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Le Vésinet",
		"address": "6 Rue Henri Cloppet, 78110",
		"department": "78 : Yvelines; 78110; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "408",
		"name": "Chatou - Ecole Jeanne d'Arc Notre Dame - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Chatou",
		"address": "6 rue du général Colin",
		"department": "78 : Yvelines; 78400; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "409",
		"name": "Cannes - Assomption Lochabair - Etude",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Cannes",
		"address": "24 Boulevard Oxford",
		"department": "06 : Alpes-Maritimes; 06400; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "410",
		"name": "Bayonne - Ecole La Salle Saint Bernard - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Bayonne",
		"address": "16 Rue Antoine Labarthe, 64100 Bayonne",
		"department": "64 : Pyrénées-Atlantiques; 64100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "411",
		"name": "Poissy - Institution Notre Dame - Garderie",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Poissy",
		"address": "14 avenue Blanche de Castille 78300 Poissy",
		"department": "78 : Yvelines; 78300; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "412",
		"name": "Valence - Sainte Anne - Collège",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Valence",
		"address": "14-20 Rue Henry Chalement, Valence",
		"department": "26 : Drôme; 26000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "414",
		"name": "Gières - Don Bosco - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Gières",
		"address": "19 rue de la Plaine",
		"department": "38 : Isère; 38610; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "415",
		"name": "Melun - Institution Sainte Marie - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Melun",
		"address": "10 boulevard Gambetta",
		"department": "77 : Seine-et-Marne; 77000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "416",
		"name": "Strasbourg - Ecole Sainte Anne - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Strasbourg",
		"address": "128 Route du Polygone, 67100 Strasbourg",
		"department": "67 : Bas-Rhin; 67100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "417",
		"name": "Dammarie Les Lys - Ecole Sainte Marie - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Dammarie Les Lys",
		"address": "223 rue Pierre Curie",
		"department": "71 : Saône-et-Loire; 77190; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "418",
		"name": "Aix - La Nativité Ecole - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Aix En Provence",
		"address": "8 rue Jean Andreani",
		"department": "13 : Bouches-du-Rhône; 13097; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "419",
		"name": "Paris - Collège et Lycée La Rochefoucauld - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Paris",
		"address": "22 rue Malar",
		"department": "75 : Paris; 75007; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "421",
		"name": "Paris - Ecole Sainte Catherine - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Paris",
		"address": "15 rue des Bernardins",
		"department": "75 : Paris; 75005; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "422",
		"name": "La Celle Saint Cloud - Sainte Marie - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "La Celle Saint-Cloud",
		"address": "15 rue Béranger",
		"department": "78 : Yvelines; 78170; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "423",
		"name": "Orléans - Ecole Sainte Croix Saint Euverte - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Orléans",
		"address": "116 rue de Coulmiers",
		"department": "45 : Loiret; 45000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "424",
		"name": "Paris - Ecole Notre Dame Saint Roch - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 4,
		"city": "Paris",
		"address": "37 rue Saint Roch",
		"department": "75 : Paris; 75001; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "425",
		"name": "Le Perreux sur Marne - Notre Dame de Toutes Grâces - Etude",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Le Perreux sur Marne",
		"address": "14 rue de la Cascade",
		"department": "94 : Val-de-Marne; 94170; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "426",
		"name": "Le Perreux sur Marne - Notre Dame de Toutes Grâces - Garderie",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Le Perreux sur Marne",
		"address": "14 rue de la Cascade",
		"department": "94 : Val-de-Marne; 94170; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "427",
		"name": "Bouillargues - Ecole Charles Péguy - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Bouillargues",
		"address": "2 parking Charles Péguy - rue du Pont de la République",
		"department": "30 : Gard; 30230; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "428",
		"name": "Orgères - Ecole Sacré Coeur - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Orgères",
		"address": "4 rue de Coteaux",
		"department": "35 : Ille-et-Vilaine; 35230; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "429",
		"name": "Franconville - Institution Jeanne d'Arc - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Franconville",
		"address": "2 bis Boulevard Toussaint Lucas",
		"department": "95 : Val-d'Oise; 95130; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "430",
		"name": "Lyon - Saint Louis Saint Bruno - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Lyon",
		"address": "16 rue des Chartreux",
		"department": "69 : Rhône; 69001; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "431",
		"name": "Lagny sur Marne - Ecole Saint Joseph de Cluny - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Lagny sur Marne",
		"address": "15 Boulevard Charpentier",
		"department": "71 : Saône-et-Loire; 77400; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "432",
		"name": "Paris - Collège Lycée Charles Péguy - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Paris",
		"address": "80 avenue Parmentier",
		"department": "75 : Paris; 75011; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "433",
		"name": "Valence - Campus ISTM Montplaisir -",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Valence",
		"address": "14 rue Barthélemy de Laffemas",
		"department": "26 : Drôme; 26000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "434",
		"name": "Alpha Education - DEMO",
		"category": "Prestation de service",
		"zone": "Aucune zone",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Clermont-Ferrand",
		"address": "1 place Claude Wolff",
		"department": "63 : Puy-de-Dôme; 63400; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "435",
		"name": "Toulon - Bon Accueil - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Toulon",
		"address": "455 Boulevard Jules Michelet",
		"department": "83 : Var; 8300; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "436",
		"name": "Anse - Ecole Saint François - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Anse",
		"address": "14 Ancienne Grande Rue",
		"department": "69 : Rhône; 69480; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "437",
		"name": "Marseille - Notre Dame de Sion - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Marseille",
		"address": "231 rue du Paradis",
		"department": "13 : Bouches-du-Rhône; 13006; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "438",
		"name": "Valence - Ecole Saint Joseph - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Valence",
		"address": "137 Avenue Victor Hugo",
		"department": "26 : Drôme; 26000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "439",
		"name": "Lyon - Ecole Notre Dame des Anges Assomption - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Lyon",
		"address": "5 rue Clément Marota",
		"department": "69 : Rhône; 69007; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "440",
		"name": "Tarascon - Ecole du Petit Castelet - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Tarascon",
		"address": "Petite route d'Arles 467 chemin du Petit Castelet",
		"department": "13 : Bouches-du-Rhône; 13150; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "441",
		"name": "Tarascon - Ecole du Petit Castelet - Etude",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Tarascon",
		"address": "Petite route d'Arles 467 chemin du Petit Castelet",
		"department": "13 : Bouches-du-Rhône; 13150; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "442",
		"name": "Tours - Institution Marmoutier - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Tours",
		"address": "17 quai Marmoutier",
		"department": "37 : Indre-et-Loire; 37100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "443",
		"name": "Marseille - Collège Sacré Coeur - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Marseille",
		"address": "22 Rue Barthélemy",
		"department": "13 : Bouches-du-Rhône; 13001; 5.38645; 43.2973",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "444",
		"name": "Paris - Ecole ENC Saint Jean - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 3,
		"city": "Paris",
		"address": "89 rue Olivier de Serres",
		"department": "75 : Paris; 75015; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "445",
		"name": "Paris - Ecole Saint Honoré d'Eylau - Ponctuel",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Paris",
		"address": "66 avenue Raymond Poincaré",
		"department": "75 : Paris; 75116; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "446",
		"name": "Marseille - Perrimond -",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Marseille",
		"address": "244 chemin du Roucas Blanc",
		"department": "13 : Bouches-du-Rhône; 13007; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "447",
		"name": "Meaux - Collège Sainte Marie - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Meaux",
		"address": "40 rue Alfred Maury",
		"department": "71 : Saône-et-Loire; 77100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "448",
		"name": "Paris - Ecole Saint Joseph - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 3,
		"city": "Paris",
		"address": "154 Rue Saint-Maur",
		"department": "75 : Paris; 75011; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "449",
		"name": "Ambares - Ecole Saint Michel Saint Pierre - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Ambares",
		"address": "5 rue du Président Coty",
		"department": "33 : Gironde; 33440; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "450",
		"name": "Lyon - Ecole Chevreul Sainte Croix - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Lyon",
		"address": "62bis Rue de la Charité",
		"department": "69 : Rhône; 69002; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "451",
		"name": "Le Chesnay - Blanche de Castille - Etude Alpha",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 21,
		"city": "Le Chesnay Rocquencourt",
		"address": "19 rue Pasteur",
		"department": "78 : Yvelines; 78150; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "452",
		"name": "Charenton le Pont - Notre Dame des Missions - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Charenton le Pont",
		"address": "4 Rue du Président Kennedy",
		"department": "94 : Val-de-Marne; 94220; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "453",
		"name": "Montreuil le Gast - Ecole Notre Dame - Surveillance",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Montreuil-le-Gast",
		"address": "12 Rue des Genêts",
		"department": "35 : Ille-et-Vilaine; 35520; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "454",
		"name": "Bordeaux - Saint Joseph de Tivoli - Lycée",
		"category": "Étude Alpha",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Bordeaux",
		"address": "40 Avenue d'Eysines",
		"department": "33 : Gironde; 33; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "455",
		"name": "Clermont Ferrand - Ensemble Scolaire Massillon -",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 3,
		"city": "Clermont-Ferrand",
		"address": "5 rue Bansac",
		"department": "63 : Puy-de-Dôme; 63037; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "456",
		"name": "Olivet - Cours Henri Guillaumet -",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Olivet",
		"address": "336 rue d'Alsace",
		"department": "45 : Loiret; 45160; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "457",
		"name": "Paris - Groupe Scolaire Fénelon Sainte Marie - DST",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Paris",
		"address": "24 rue du Général Foy",
		"department": "75 : Paris; 75008; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "458",
		"name": "Perpignan - Institution Saint Louis de Gonzague -",
		"category": "Étude Alpha",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 16,
		"city": "Perpignan",
		"address": "71 Avenue Dr Albert Schweitzer",
		"department": "66 : Pyrénées-Orientales; 66000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "alpha"
	},
	{
		"externalId": "459",
		"name": "Versailles - Ensemble Scolaire Saint Jean Hulst -",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Versailles",
		"address": "26 rue du Maréchal de Lattre de Tassigny",
		"department": "78 : Yvelines; 78000; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "460",
		"name": "Senlis - Ecole Notre Dame du Sacré Coeur -",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Senlis",
		"address": "10 rue du Cimetière Saint-Rieul",
		"department": "60 : Oise; 60300; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "461",
		"name": "Craponne - Ecole Jeanne d'Arc -",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Craponne",
		"address": "15 rue Centrale",
		"department": "69 : Rhône; 69290; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "462",
		"name": "Annecy (Seynod) - Les Cordeliers Saint François Saint Pierre -",
		"category": "Prestation de service",
		"zone": "Zone A",
		"coordinator": "",
		"registeredCount": 2,
		"city": "Seynod (Annecy)",
		"address": "Avenue de Cran",
		"department": "74 : Haute-Savoie; 74600; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "463",
		"name": "Meaux - Ecole Sainte Geneviève -",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 6,
		"city": "Meaux",
		"address": "12 rue de la Visitation",
		"department": "77 : Seine-et-Marne; 77100; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "464",
		"name": "Vincennes - Ecole Saint Joseph -",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 1,
		"city": "Vincennes",
		"address": "13 Rue Daumesnil, 94300 Vincennes",
		"department": "94 : Val-de-Marne; 94300; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "465",
		"name": "Bethune - Lycée Saint Dominique -",
		"category": "Prestation de service",
		"zone": "Zone B",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Bethune",
		"address": "92 rue de l'Université",
		"department": "62 : Pas-de-Calais; 62400; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "466",
		"name": "Paris - Ecole Saint Georges -",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "Paris",
		"address": "17 rue Bouret",
		"department": "75 : Paris; 75019; 0.0; 0.0",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	},
	{
		"externalId": "467",
		"name": "Paris - Ecole Sainte Louise -",
		"category": "Prestation de service",
		"zone": "Zone C",
		"coordinator": "",
		"registeredCount": 0,
		"city": "",
		"address": "",
		"department": "",
		"upcomingWeek": "",
		"pastSessions": "",
		"typicalWeek": "",
		"contractSigned": "",
		"actions": "",
		"schoolType": "mise-a-dispo"
	}
];
//#endregion
//#region app/lib/shared-data.ts
var STORE_NAME = "task-tracker";
var TASKS_KEY = "tasks.json";
var PEOPLE_KEY = "people.json";
var RECURRING_TASKS_KEY = "recurring-tasks.json";
var OBJECTIVES_KEY = "objectives.json";
var LINKS_KEY = "links.json";
var JOURNAL_POSTS_KEY = "journal-posts.json";
var MASS_COMMUNICATIONS_KEY = "mass-communications.json";
var STAFFING_SESSIONS_KEY = "staffing-sessions.json";
var TUTOR_REPORTS_KEY = "tutor-reports.json";
var TUTOR_REPORT_COMMENTS_KEY = "tutor-report-comments.json";
var TUTOR_TRACKING_KEY = "tutor-tracking.json";
var AVAILABILITY_IMPORTS_KEY = "availability-imports.json";
var TUTOR_ASSIGNMENT_IMPORTS_KEY = "tutor-assignment-imports.json";
var UPCOMING_SESSION_IMPORTS_KEY = "upcoming-session-imports.json";
var ACTUAL_SESSION_IMPORTS_KEY = "actual-session-imports.json";
var STAFFING_AUDITS_KEY = "staffing-audits.json";
var TUTOR_INTEREST_IMPORTS_KEY = "tutor-interest-imports.json";
var TUTOR_COVERAGE_NOTES_KEY = "tutor-coverage-notes.json";
var UNSTAFFED_EXCLUSIONS_KEY = "unstaffed-exclusions.json";
var ENROLLMENT_IMPORTS_KEY = "enrollment-imports.json";
var SCHOOL_WATCHLIST_KEY = "school-watchlist.json";
var SCHOOLS_KEY = "schools.json";
var STUDENT_HISTORY_KEY = "student-history.json";
var FILE_IMPORT_TRASH_KEY = "file-import-trash.json";
var memory = globalThis;
var defaultObjectives = [{
	id: "objective-september-2600",
	kind: "counter",
	title: "Objectif septembre",
	description: "Mobiliser l'equipe Alpha Education autour de la rentree et garder le cap chaque semaine.",
	targetLabel: "eleves",
	currentValue: 160,
	targetValue: 2600,
	startDate: "",
	endDate: "",
	status: "progress",
	progressNote: "",
	personIds: [],
	createdAt: "2026-09-01T00:00:00.000Z"
}, {
	id: "objective-weekly-supervision-1300",
	kind: "counter",
	title: "Seances de surveillance par semaine",
	description: "Transformer l'organisation de l'equipe en volume de seances concret chaque semaine.",
	targetLabel: "seances",
	currentValue: 130,
	targetValue: 1300,
	startDate: "",
	endDate: "",
	status: "progress",
	progressNote: "",
	personIds: [],
	createdAt: "2026-09-01T00:00:00.000Z"
}];
function taskStore() {
	return getStore({
		name: STORE_NAME,
		consistency: "strong"
	});
}
function canUseMemoryFallback() {
	return false;
}
function publicPerson(person) {
	const { email: _email, ...rest } = person;
	return {
		...rest,
		hasEmail: Boolean(_email)
	};
}
function cleanText(value) {
	return typeof value === "string" ? value.trim() : "";
}
function numberFromText(value) {
	const match = value.replace(",", ".").match(/\d+(?:\.\d+)?/);
	if (!match) return null;
	const parsed = Number(match[0]);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
function cleanPositiveNumber(value, allowZero = false) {
	const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value.replace(",", ".")) : null;
	if (parsed === null || !Number.isFinite(parsed)) return null;
	if (allowZero && parsed === 0) return 0;
	return parsed > 0 ? parsed : null;
}
function dateValueForSort(value) {
	const parsed = value ? new Date(value).getTime() : 0;
	return Number.isFinite(parsed) ? parsed : 0;
}
function cleanYear(value) {
	const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : null;
	if (parsed === null || !Number.isInteger(parsed)) return (/* @__PURE__ */ new Date()).getFullYear();
	return parsed >= 2e3 && parsed <= 2100 ? parsed : (/* @__PURE__ */ new Date()).getFullYear();
}
function campaignDates(year) {
	const dates = [];
	const cursor = new Date(Date.UTC(year, 7, 25));
	const end = new Date(Date.UTC(year, 8, 30));
	while (cursor <= end) {
		dates.push(cursor.toISOString().slice(0, 10));
		cursor.setUTCDate(cursor.getUTCDate() + 1);
	}
	return dates;
}
function isStatus(value) {
	return value === "todo" || value === "progress" || value === "done";
}
function isPriority(value) {
	return value === "low" || value === "medium" || value === "high";
}
function isObjectiveKind(value) {
	return value === "counter" || value === "qualitative";
}
function isObjectiveStatus(value) {
	return value === "todo" || value === "progress" || value === "done";
}
function isEmail(value) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function sanitizePerson(raw, existing) {
	const typedEmail = cleanText(raw.email).toLowerCase();
	return {
		id: cleanText(raw.id) || existing?.id || crypto.randomUUID(),
		name: cleanText(raw.name) || existing?.name || "",
		email: typedEmail ? isEmail(typedEmail) ? typedEmail : "" : existing?.email || "",
		active: typeof raw.active === "boolean" ? raw.active : existing?.active ?? true,
		createdAt: cleanText(raw.createdAt) || existing?.createdAt || (/* @__PURE__ */ new Date()).toISOString()
	};
}
function sanitizeTask(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const rawEstimatedHours = typeof raw.estimatedHours === "number" ? raw.estimatedHours : typeof raw.estimatedHours === "string" && raw.estimatedHours.trim() ? Number(raw.estimatedHours) : null;
	return {
		id: cleanText(raw.id) || crypto.randomUUID(),
		title: cleanText(raw.title),
		description: cleanText(raw.description),
		owner: cleanText(raw.owner),
		assigneeId: cleanText(raw.assigneeId) || null,
		startDate: cleanText(raw.startDate) || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		endDate: cleanText(raw.endDate),
		estimatedHours: typeof rawEstimatedHours === "number" && Number.isFinite(rawEstimatedHours) && rawEstimatedHours > 0 ? rawEstimatedHours : null,
		status: isStatus(raw.status) ? raw.status : "todo",
		priority: isPriority(raw.priority) ? raw.priority : "medium",
		verified: raw.verified === true,
		verificationOwner: cleanText(raw.verificationOwner),
		verificationComment: cleanText(raw.verificationComment),
		comments: Array.isArray(raw.comments) ? raw.comments.filter((comment) => Boolean(comment && typeof comment === "object")).map((comment) => ({
			id: cleanText(comment.id) || crypto.randomUUID(),
			text: cleanText(comment.text),
			author: cleanText(comment.author) || "Anonyme",
			createdAt: cleanText(comment.createdAt) || now
		})).filter((comment) => comment.text) : [],
		completionNotifications: Array.isArray(raw.completionNotifications) ? raw.completionNotifications.filter((item) => Boolean(item && typeof item === "object")).map((item) => ({
			personId: cleanText(item.personId),
			sentAt: cleanText(item.sentAt) || now
		})).filter((item) => item.personId) : [],
		createdAt: cleanText(raw.createdAt) || now
	};
}
function sanitizeRecurringTask(raw) {
	const rawEstimatedHours = typeof raw.estimatedHours === "number" ? raw.estimatedHours : typeof raw.estimatedHours === "string" && raw.estimatedHours.trim() ? Number(raw.estimatedHours) : null;
	return {
		id: cleanText(raw.id) || crypto.randomUUID(),
		title: cleanText(raw.title),
		description: cleanText(raw.description),
		owner: cleanText(raw.owner),
		assigneeId: cleanText(raw.assigneeId) || null,
		estimatedHours: typeof rawEstimatedHours === "number" && Number.isFinite(rawEstimatedHours) && rawEstimatedHours > 0 ? rawEstimatedHours : null,
		priority: isPriority(raw.priority) ? raw.priority : "medium",
		createdAt: cleanText(raw.createdAt) || (/* @__PURE__ */ new Date()).toISOString()
	};
}
function sanitizeObjective(raw) {
	const legacyTarget = numberFromText(cleanText(raw.targetLabel));
	const targetLabel = cleanText(raw.targetLabel).replace(/\d+/g, "").trim().replace(/^\/+/, "").trim();
	return {
		id: cleanText(raw.id) || crypto.randomUUID(),
		kind: isObjectiveKind(raw.kind) ? raw.kind : cleanPositiveNumber(raw.targetValue, false) || legacyTarget ? "counter" : "qualitative",
		title: cleanText(raw.title),
		description: cleanText(raw.description),
		targetLabel: targetLabel || "eleves",
		currentValue: cleanPositiveNumber(raw.currentValue, true),
		targetValue: cleanPositiveNumber(raw.targetValue, false) ?? legacyTarget,
		startDate: cleanText(raw.startDate),
		endDate: cleanText(raw.endDate),
		status: isObjectiveStatus(raw.status) ? raw.status : "progress",
		progressNote: cleanText(raw.progressNote),
		personIds: Array.isArray(raw.personIds) ? raw.personIds.map(cleanText).filter(Boolean) : [],
		createdAt: cleanText(raw.createdAt) || (/* @__PURE__ */ new Date()).toISOString()
	};
}
function sanitizeSharedLink(raw) {
	const url = cleanText(raw.url);
	return {
		id: cleanText(raw.id) || crypto.randomUUID(),
		title: cleanText(raw.title),
		description: cleanText(raw.description),
		url: url.startsWith("http://") || url.startsWith("https://") ? url : url ? `https://${url}` : "",
		createdAt: cleanText(raw.createdAt) || (/* @__PURE__ */ new Date()).toISOString()
	};
}
function sanitizeSocialLike(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		id: cleanText(raw.id) || crypto.randomUUID(),
		author: cleanText(raw.author) || "Anonyme",
		createdAt: cleanText(raw.createdAt) || now
	};
}
function sanitizeSocialComment(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		id: cleanText(raw.id) || crypto.randomUUID(),
		text: cleanText(raw.text),
		author: cleanText(raw.author) || "Anonyme",
		createdAt: cleanText(raw.createdAt) || now
	};
}
function sanitizeJournalPost(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		id: cleanText(raw.id) || crypto.randomUUID(),
		title: cleanText(raw.title),
		content: cleanText(raw.content),
		author: cleanText(raw.author) || "Equipe Alpha",
		tags: Array.isArray(raw.tags) ? raw.tags.map(cleanText).filter(Boolean) : cleanText(raw.tags).split(",").map((tag) => tag.trim()).filter(Boolean),
		personIds: Array.isArray(raw.personIds) ? raw.personIds.map(cleanText).filter(Boolean) : [],
		likes: Array.isArray(raw.likes) ? raw.likes.filter((like) => Boolean(like && typeof like === "object")).map(sanitizeSocialLike) : [],
		comments: Array.isArray(raw.comments) ? raw.comments.filter((comment) => Boolean(comment && typeof comment === "object")).map(sanitizeSocialComment).filter((comment) => comment.text) : [],
		publishedAt: cleanText(raw.publishedAt) || now,
		createdAt: cleanText(raw.createdAt) || now,
		updatedAt: cleanText(raw.updatedAt) || cleanText(raw.createdAt) || now
	};
}
function isCommunicationAudience(value) {
	return value === "tuteurs" || value === "candidats" || value === "etablissements" || value === "parents" || value === "coordinateurs";
}
function isCommunicationStatus(value) {
	return value === "draft" || value === "sent" || value === "to-follow-up" || value === "cancelled";
}
function sanitizeMassCommunication(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const tags = Array.isArray(raw.tags) ? raw.tags.map(cleanText).filter(Boolean) : cleanText(raw.tags).split(",").map((tag) => tag.trim()).filter(Boolean);
	const audiences = Array.isArray(raw.audiences) ? raw.audiences.filter(isCommunicationAudience) : [];
	const recipients = Array.isArray(raw.recipients) ? raw.recipients.map(cleanText).filter(Boolean) : cleanText(raw.recipients).split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
	return {
		id: cleanText(raw.id) || crypto.randomUUID(),
		title: cleanText(raw.title),
		messageSummary: cleanText(raw.messageSummary),
		audiences,
		recipients: Array.from(new Set(recipients)),
		channel: cleanText(raw.channel) || "Email",
		status: isCommunicationStatus(raw.status) ? raw.status : "sent",
		sentAt: cleanText(raw.sentAt),
		followUpDate: cleanText(raw.followUpDate),
		author: cleanText(raw.author) || "Equipe Alpha",
		notes: cleanText(raw.notes),
		tags: Array.from(new Set(tags)),
		createdAt: cleanText(raw.createdAt) || now,
		updatedAt: cleanText(raw.updatedAt) || cleanText(raw.createdAt) || now
	};
}
function cleanSessionCount(value) {
	const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : 0;
	return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}
function sanitizeStaffingPerson(raw) {
	const record = raw && typeof raw === "object" ? raw : {};
	return {
		staffedSessions: cleanSessionCount(record.staffedSessions),
		unstaffedSessions: cleanSessionCount(record.unstaffedSessions)
	};
}
function sanitizeStaffingDay(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const people = raw.people && typeof raw.people === "object" ? raw.people : {};
	const date = cleanText(raw.date) || now.slice(0, 10);
	const sanitizedPeople = {
		pierre: sanitizeStaffingPerson(people.pierre),
		julie: sanitizeStaffingPerson(people.julie),
		kelly: sanitizeStaffingPerson(people.kelly)
	};
	const peopleTotals = Object.values(sanitizedPeople).reduce((totals, person) => {
		totals.staffed += person.staffedSessions;
		totals.unstaffed += person.unstaffedSessions;
		return totals;
	}, {
		staffed: 0,
		unstaffed: 0
	});
	return {
		id: cleanText(raw.id) || `staffing-${date}`,
		date,
		people: sanitizedPeople,
		totalStaffedSessions: raw.totalStaffedSessions === void 0 || raw.totalStaffedSessions === null ? peopleTotals.staffed : cleanSessionCount(raw.totalStaffedSessions),
		totalUnstaffedSessions: raw.totalUnstaffedSessions === void 0 || raw.totalUnstaffedSessions === null ? peopleTotals.unstaffed : cleanSessionCount(raw.totalUnstaffedSessions),
		createdAt: cleanText(raw.createdAt) || now,
		updatedAt: cleanText(raw.updatedAt) || cleanText(raw.createdAt) || now
	};
}
function sanitizeTutorReportEntry(raw) {
	return {
		id: cleanText(raw.id) || crypto.randomUUID(),
		tutorId: cleanText(raw.tutorId),
		lastName: cleanText(raw.lastName),
		firstName: cleanText(raw.firstName),
		phone: cleanText(raw.phone),
		school: cleanText(raw.school),
		studentCount: cleanSessionCount(raw.studentCount),
		missingReportCount: cleanSessionCount(raw.missingReportCount),
		comment: cleanText(raw.comment)
	};
}
function sanitizeTutorReportSnapshot(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const date = cleanText(raw.date) || now.slice(0, 10);
	return {
		id: cleanText(raw.id) || `tutor-reports-${date}`,
		date,
		comment: cleanText(raw.comment),
		entries: Array.isArray(raw.entries) ? raw.entries.filter((entry) => Boolean(entry && typeof entry === "object")).map(sanitizeTutorReportEntry).filter((entry) => entry.tutorId || entry.lastName || entry.firstName || entry.phone || entry.school) : [],
		createdAt: cleanText(raw.createdAt) || now,
		updatedAt: cleanText(raw.updatedAt) || cleanText(raw.createdAt) || now
	};
}
function sanitizeTutorReportComment(raw) {
	const legacyKey = cleanText(raw.tutorKey);
	return {
		tutorId: cleanText(raw.tutorId) || (/^id:(.+)$/i.exec(legacyKey)?.[1] ?? ""),
		comment: cleanText(raw.comment),
		updatedAt: cleanText(raw.updatedAt) || (/* @__PURE__ */ new Date()).toISOString()
	};
}
function sanitizeTutorTrackingRecord(raw) {
	const tutorId = cleanText(raw.tutorId);
	const lastName = cleanText(raw.lastName);
	const firstName = cleanText(raw.firstName);
	const phone = cleanText(raw.phone);
	return {
		key: tutorId ? `id:${tutorId.toLocaleLowerCase("fr")}` : "",
		tutorId,
		lastName,
		firstName,
		phone,
		email: cleanText(raw.email),
		school: cleanText(raw.school),
		wantedCity: cleanText(raw.wantedCity),
		level: cleanText(raw.level)
	};
}
function sanitizeTutorTrackingSnapshot(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const date = cleanText(raw.date) || now.slice(0, 10);
	return {
		id: cleanText(raw.id) || `tutor-tracking-${date}`,
		date,
		displayName: cleanText(raw.displayName) || cleanText(raw.fileName) || `Liste tuteurs du ${date}`,
		fileName: cleanText(raw.fileName) || "liste-tuteurs.csv",
		sourceRowCount: Math.max(0, Math.round(Number(raw.sourceRowCount) || (Array.isArray(raw.records) ? raw.records.length : 0))),
		records: Array.isArray(raw.records) ? raw.records.filter((record) => Boolean(record && typeof record === "object")).map(sanitizeTutorTrackingRecord).filter((record) => record.tutorId) : [],
		createdAt: cleanText(raw.createdAt) || now,
		updatedAt: cleanText(raw.updatedAt) || cleanText(raw.createdAt) || now
	};
}
function parseTutorTrackingCsv(value) {
	const csvRows = parseCsvRows(value).filter((row) => row.some(Boolean));
	if (!csvRows.length) return {
		records: [],
		sourceRowCount: 0
	};
	const firstRow = csvRows[0].map(normalizedHeader);
	const hasHeader = firstRow.some((cell) => [
		"id",
		"idtuteur",
		"nom",
		"nomtuteur",
		"nomdusage",
		"prenom",
		"prenomtuteur",
		"telephone",
		"numerodetelephone",
		"email",
		"villesouhaitee",
		"villesouhaitees",
		"niveau"
	].includes(cell));
	const headers = hasHeader ? firstRow : [
		"id",
		"nom",
		"prenom",
		"telephone",
		"etablissement",
		"email",
		"villesouhaitee"
	];
	const dataRows = hasHeader ? csvRows.slice(1) : csvRows;
	const indexFor = (aliases) => {
		for (const alias of aliases) {
			const index = headers.findIndex((header) => header === alias);
			if (index >= 0) return index;
		}
		return -1;
	};
	const valueAt = (row, index) => index >= 0 ? row[index] || "" : "";
	const idIndex = indexFor([
		"id",
		"idtuteur",
		"tutorid",
		"identifiant"
	]);
	const lastNameIndex = indexFor([
		"nomtuteur",
		"nomdusage",
		"nom",
		"lastname",
		"name"
	]);
	const firstNameIndex = indexFor([
		"prenom",
		"prenomtuteur",
		"firstname"
	]);
	const phoneIndex = indexFor([
		"telephone",
		"numerodetelephone",
		"tel",
		"phone",
		"mobile"
	]);
	const emailIndex = indexFor([
		"email",
		"mail",
		"courriel"
	]);
	const schoolIndex = indexFor([
		"etablissement",
		"etablissements",
		"school",
		"ecole"
	]);
	const wantedCityIndex = indexFor([
		"villesouhaitees",
		"villesouhaitee",
		"villesouhaites",
		"villesouhaite",
		"ville"
	]);
	const levelIndex = indexFor(["niveau"]);
	const byKey = /* @__PURE__ */ new Map();
	dataRows.forEach((row) => {
		const record = sanitizeTutorTrackingRecord({
			tutorId: valueAt(row, idIndex),
			lastName: valueAt(row, lastNameIndex),
			firstName: valueAt(row, firstNameIndex),
			phone: valueAt(row, phoneIndex),
			email: valueAt(row, emailIndex),
			school: valueAt(row, schoolIndex),
			wantedCity: valueAt(row, wantedCityIndex),
			level: valueAt(row, levelIndex)
		});
		if (record.tutorId) byKey.set(record.key, record);
	});
	return {
		records: Array.from(byKey.values()).sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, "fr")),
		sourceRowCount: dataRows.length
	};
}
function sanitizeTutorTrackingComment(raw) {
	const legacyKey = cleanText(raw.tutorKey);
	return {
		tutorId: cleanText(raw.tutorId) || (/^id:(.+)$/i.exec(legacyKey)?.[1] ?? ""),
		comment: cleanText(raw.comment),
		updatedAt: cleanText(raw.updatedAt) || (/* @__PURE__ */ new Date()).toISOString()
	};
}
function sanitizeTutorTrackingData(raw) {
	return {
		snapshots: Array.isArray(raw.snapshots) ? raw.snapshots.filter((snapshot) => Boolean(snapshot && typeof snapshot === "object")).map(sanitizeTutorTrackingSnapshot).sort((a, b) => dateValueForSort(b.date) - dateValueForSort(a.date) || dateValueForSort(b.createdAt) - dateValueForSort(a.createdAt)) : [],
		comments: Array.isArray(raw.comments) ? raw.comments.filter((comment) => Boolean(comment && typeof comment === "object")).map(sanitizeTutorTrackingComment).filter((comment) => comment.tutorId) : []
	};
}
function tutorTrackingLegacyKey(record) {
	return `name:${`${record.lastName} ${record.firstName} ${record.phone || record.email}`.trim().toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
}
function migrateTutorTrackingData(raw) {
	const sourceSnapshots = Array.isArray(raw.snapshots) ? raw.snapshots.filter((snapshot) => Boolean(snapshot && typeof snapshot === "object")) : [];
	const resolve = createTutorRecordResolver(sourceSnapshots.flatMap((snapshot) => Array.isArray(snapshot.records) ? snapshot.records.filter((record) => Boolean(record && typeof record === "object")).map(sanitizeTutorTrackingRecord) : []));
	const resolvedSnapshots = sourceSnapshots.map((snapshot) => ({
		...snapshot,
		records: Array.isArray(snapshot.records) ? snapshot.records.filter((record) => Boolean(record && typeof record === "object")).map((rawRecord) => {
			const record = sanitizeTutorTrackingRecord(rawRecord);
			const tutor = resolve({
				tutorId: record.tutorId,
				phone: record.phone,
				name: `${record.firstName} ${record.lastName}`
			});
			return {
				...rawRecord,
				tutorId: record.tutorId || tutor?.tutorId || ""
			};
		}) : []
	}));
	const resolvedRecords = resolvedSnapshots.flatMap((snapshot) => Array.isArray(snapshot.records) ? snapshot.records.map((record) => sanitizeTutorTrackingRecord(record)) : []);
	const idsByLegacyKey = /* @__PURE__ */ new Map();
	resolvedRecords.forEach((record) => {
		if (!record.tutorId) return;
		const key = tutorTrackingLegacyKey(record);
		const ids = idsByLegacyKey.get(key) ?? /* @__PURE__ */ new Set();
		ids.add(record.tutorId);
		idsByLegacyKey.set(key, ids);
	});
	const comments = Array.isArray(raw.comments) ? raw.comments.filter((comment) => Boolean(comment && typeof comment === "object")).map((comment) => {
		const legacyKey = cleanText(comment.tutorKey);
		const legacyId = /^id:(.+)$/i.exec(legacyKey)?.[1] ?? "";
		const ids = idsByLegacyKey.get(legacyKey);
		return {
			...comment,
			tutorId: cleanText(comment.tutorId) || legacyId || (ids?.size === 1 ? Array.from(ids)[0] : "")
		};
	}) : [];
	return sanitizeTutorTrackingData({
		...raw,
		snapshots: resolvedSnapshots,
		comments
	});
}
function sanitizeUnstaffedExclusions(raw) {
	return {
		sessionIds: Array.isArray(raw.sessionIds) ? Array.from(new Set(raw.sessionIds.map(cleanText).filter(Boolean))) : [],
		sourceKeys: Array.isArray(raw.sourceKeys) ? Array.from(new Set(raw.sourceKeys.map(cleanText).filter(Boolean))) : [],
		updatedAt: cleanText(raw.updatedAt) || (/* @__PURE__ */ new Date()).toISOString()
	};
}
function sanitizeAvailabilityRow(raw) {
	return {
		tutorId: cleanText(raw.tutorId),
		lastName: cleanText(raw.lastName),
		firstName: cleanText(raw.firstName),
		grade: cleanText(raw.grade),
		phone: cleanText(raw.phone),
		date: cleanText(raw.date),
		school: cleanText(raw.school),
		className: cleanText(raw.className),
		timeSlot: cleanText(raw.timeSlot),
		sessionId: cleanText(raw.sessionId),
		visitCount: cleanText(raw.visitCount),
		group: cleanText(raw.group),
		studentCount: cleanText(raw.studentCount),
		groupScore: cleanText(raw.groupScore)
	};
}
function parseCsvLine(line, delimiter) {
	const cells = [];
	let current = "";
	let quoted = false;
	for (let index = 0; index < line.length; index += 1) {
		const char = line[index];
		const next = line[index + 1];
		if (char === "\"" && quoted && next === "\"") {
			current += "\"";
			index += 1;
		} else if (char === "\"") quoted = !quoted;
		else if ((delimiter ? char === delimiter : char === "," || char === ";" || char === "	") && !quoted) {
			cells.push(current.trim());
			current = "";
		} else current += char;
	}
	cells.push(current.trim());
	return cells;
}
function detectCsvDelimiter(value) {
	const firstLine = value.split(/\r?\n/).find((line) => line.trim()) || "";
	return [
		";",
		"	",
		","
	].map((delimiter) => ({
		delimiter,
		count: parseCsvLine(firstLine, delimiter).length
	})).sort((a, b) => b.count - a.count)[0]?.delimiter || ";";
}
function parseCsvRows(value) {
	const delimiter = detectCsvDelimiter(value);
	const rows = [];
	let row = [];
	let current = "";
	let quoted = false;
	for (let index = 0; index < value.length; index += 1) {
		const char = value[index];
		const next = value[index + 1];
		if (char === "\"" && quoted && next === "\"") {
			current += "\"";
			index += 1;
		} else if (char === "\"") quoted = !quoted;
		else if (char === delimiter && !quoted) {
			row.push(current.trim());
			current = "";
		} else if ((char === "\n" || char === "\r") && !quoted) {
			if (char === "\r" && next === "\n") index += 1;
			row.push(current.trim());
			if (row.some(Boolean)) rows.push(row);
			row = [];
			current = "";
		} else current += char;
	}
	row.push(current.trim());
	if (row.some(Boolean)) rows.push(row);
	return rows;
}
function normalizedHeader(value) {
	return value.trim().toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "");
}
function parseAvailabilityCsv(value) {
	const rows = parseCsvRows(value).filter((row) => row.some(Boolean));
	if (!rows.length) return [];
	const firstRow = rows[0].map(normalizedHeader);
	const hasHeader = firstRow.some((cell) => [
		"id",
		"nomtuteur",
		"prenomtuteur",
		"date",
		"heureducreneau",
		"iddelaseance"
	].includes(cell));
	const headers = hasHeader ? firstRow : [
		"id",
		"nomtuteur",
		"prenomtuteur",
		"grade",
		"telephone",
		"date",
		"etablissement",
		"classe",
		"heureducreneau",
		"iddelaseance",
		"nombredevisites",
		"groupe",
		"nbreleves",
		"scorepourlegroupe"
	];
	const dataRows = hasHeader ? rows.slice(1) : rows;
	const indexFor = (aliases) => {
		for (const alias of aliases) {
			const index = headers.findIndex((header) => header === alias);
			if (index >= 0) return index;
		}
		return -1;
	};
	const valueAt = (row, index) => index >= 0 ? row[index] || "" : "";
	const idIndex = indexFor([
		"id",
		"idtuteur",
		"tutorid"
	]);
	const lastNameIndex = indexFor([
		"nomtuteur",
		"nom",
		"lastname"
	]);
	const firstNameIndex = indexFor([
		"prenomtuteur",
		"prenom",
		"firstname"
	]);
	const gradeIndex = indexFor(["grade"]);
	const phoneIndex = indexFor([
		"telephone",
		"tel",
		"phone"
	]);
	const dateIndex = indexFor(["date"]);
	const schoolIndex = indexFor([
		"etablissement",
		"etablissements",
		"school"
	]);
	const classIndex = indexFor(["classe", "class"]);
	const timeSlotIndex = indexFor([
		"heureducreneau",
		"heurecreneau",
		"creneau",
		"horaire"
	]);
	const sessionIdIndex = indexFor([
		"iddelaseance",
		"idseance",
		"sessionid"
	]);
	const visitCountIndex = indexFor([
		"nombredevisites",
		"visites",
		"nbvisites"
	]);
	const groupIndex = indexFor(["groupe", "group"]);
	const studentCountIndex = indexFor([
		"nbreleves",
		"nbeleves",
		"nombreeleves"
	]);
	const groupScoreIndex = indexFor(["scorepourlegroupe", "scoregroupe"]);
	return dataRows.map((row) => sanitizeAvailabilityRow({
		tutorId: valueAt(row, idIndex),
		lastName: valueAt(row, lastNameIndex),
		firstName: valueAt(row, firstNameIndex),
		grade: valueAt(row, gradeIndex),
		phone: valueAt(row, phoneIndex),
		date: valueAt(row, dateIndex),
		school: valueAt(row, schoolIndex),
		className: valueAt(row, classIndex),
		timeSlot: valueAt(row, timeSlotIndex),
		sessionId: valueAt(row, sessionIdIndex),
		visitCount: valueAt(row, visitCountIndex),
		group: valueAt(row, groupIndex),
		studentCount: valueAt(row, studentCountIndex),
		groupScore: valueAt(row, groupScoreIndex)
	})).filter((row) => row.tutorId && row.date);
}
function sanitizeAvailabilityImport(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		id: cleanText(raw.id) || crypto.randomUUID(),
		importedAt: cleanText(raw.importedAt) || now,
		displayName: cleanText(raw.displayName) || cleanText(raw.fileName) || "Import de disponibilités",
		fileName: cleanText(raw.fileName) || "disponibilites.csv",
		rows: Array.isArray(raw.rows) ? raw.rows.filter((row) => Boolean(row && typeof row === "object")).map(sanitizeAvailabilityRow).filter((row) => row.tutorId && row.date) : [],
		rawCsv: typeof raw.rawCsv === "string" ? raw.rawCsv : "",
		hasRawCsv: raw.hasRawCsv === true || typeof raw.rawCsv === "string" && raw.rawCsv.length > 0,
		createdAt: cleanText(raw.createdAt) || now
	};
}
function sanitizeTutorAssignmentRow(raw) {
	return {
		tutorId: cleanText(raw.tutorId),
		firstName: cleanText(raw.firstName),
		lastName: cleanText(raw.lastName),
		grade: cleanText(raw.grade),
		phone: cleanText(raw.phone),
		school: cleanText(raw.school),
		category: cleanText(raw.category),
		date: cleanText(raw.date),
		timeSlot: cleanText(raw.timeSlot),
		level: cleanText(raw.level),
		absent: raw.absent === true || [
			"oui",
			"yes",
			"true",
			"1"
		].includes(cleanText(raw.absent).toLocaleLowerCase("fr"))
	};
}
function parseTutorAssignmentCsv(value) {
	const csvRows = parseCsvRows(value).filter((row) => row.some(Boolean));
	if (!csvRows.length) return {
		rows: [],
		sourceRowCount: 0
	};
	const headers = csvRows[0].map(normalizedHeader);
	const indexFor = (aliases) => {
		for (const alias of aliases) {
			const index = headers.findIndex((header) => header === alias);
			if (index >= 0) return index;
		}
		return -1;
	};
	const valueAt = (row, index) => index >= 0 ? row[index] || "" : "";
	const tutorIdIndex = indexFor([
		"iddututeur",
		"idtuteur",
		"id"
	]);
	const lastNameIndex = indexFor([
		"nomdututeur",
		"nomtuteur",
		"nom"
	]);
	const firstNameIndex = indexFor([
		"prenomdututeur",
		"prenomtuteur",
		"prenom"
	]);
	const gradeIndex = indexFor(["gradedututeur", "grade"]);
	const phoneIndex = indexFor([
		"numerodetelephone",
		"telephone",
		"telephoneportable"
	]);
	const schoolIndex = indexFor(["etablissement", "ecole"]);
	const categoryIndex = indexFor(["categorie"]);
	const dateIndex = indexFor(["datedelaprestation", "date"]);
	const timeSlotIndex = indexFor([
		"horairesducreneau",
		"heureducreneau",
		"creneau"
	]);
	const levelIndex = indexFor(["niveau", "classe"]);
	const absentIndex = indexFor(["absent", "absence"]);
	if (tutorIdIndex < 0 || dateIndex < 0 || timeSlotIndex < 0) throw new Error("Colonnes tuteur, date ou horaires introuvables dans le CSV des séances affectées");
	const dataRows = csvRows.slice(1);
	return {
		sourceRowCount: dataRows.length,
		rows: dataRows.map((row) => sanitizeTutorAssignmentRow({
			tutorId: valueAt(row, tutorIdIndex),
			lastName: valueAt(row, lastNameIndex),
			firstName: valueAt(row, firstNameIndex),
			grade: valueAt(row, gradeIndex),
			phone: valueAt(row, phoneIndex),
			school: valueAt(row, schoolIndex),
			category: valueAt(row, categoryIndex),
			date: valueAt(row, dateIndex),
			timeSlot: valueAt(row, timeSlotIndex),
			level: valueAt(row, levelIndex),
			absent: valueAt(row, absentIndex)
		})).filter((row) => row.tutorId && row.date && row.timeSlot)
	};
}
function sanitizeTutorAssignmentImport(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		id: cleanText(raw.id) || crypto.randomUUID(),
		importedAt: cleanText(raw.importedAt) || now,
		displayName: cleanText(raw.displayName) || cleanText(raw.fileName) || "Séances affectées",
		fileName: cleanText(raw.fileName) || "seances-affectees.csv",
		sourceRowCount: Math.max(0, Math.round(Number(raw.sourceRowCount) || 0)),
		rows: Array.isArray(raw.rows) ? raw.rows.filter((row) => Boolean(row && typeof row === "object")).map(sanitizeTutorAssignmentRow).filter((row) => row.tutorId && row.date && row.timeSlot) : [],
		createdAt: cleanText(raw.createdAt) || now
	};
}
function sanitizeUpcomingSessionRow(raw) {
	return {
		sessionId: cleanText(raw.sessionId),
		schoolId: cleanText(raw.schoolId),
		school: cleanText(raw.school),
		category: cleanText(raw.category),
		date: cleanText(raw.date),
		startTime: cleanText(raw.startTime),
		endTime: cleanText(raw.endTime),
		durationHours: cleanText(raw.durationHours),
		group: cleanText(raw.group),
		studentCount: Math.max(0, Math.round(Number(raw.studentCount) || 0)),
		classes: Array.isArray(raw.classes) ? Array.from(new Set(raw.classes.map(cleanText).filter(Boolean))) : [],
		room: cleanText(raw.room)
	};
}
function sanitizeUpcomingSessionSchool(raw) {
	return {
		schoolId: cleanText(raw.schoolId),
		name: cleanText(raw.name),
		categories: Array.isArray(raw.categories) ? Array.from(new Set(raw.categories.map(cleanText).filter(Boolean))) : []
	};
}
function sanitizeUpcomingSessionSchoolStaffing(raw) {
	return {
		schoolId: cleanText(raw.schoolId),
		name: cleanText(raw.name),
		date: cleanText(raw.date),
		staffedSessions: Math.max(0, Math.round(Number(raw.staffedSessions) || 0)),
		unstaffedSessions: Math.max(0, Math.round(Number(raw.unstaffedSessions) || 0))
	};
}
function sanitizeUpcomingSessionTutor(raw) {
	return {
		tutorId: cleanText(raw.tutorId),
		firstName: cleanText(raw.firstName),
		lastName: cleanText(raw.lastName),
		phone: cleanText(raw.phone)
	};
}
function sanitizeUpcomingStaffingSession(raw) {
	return {
		sessionId: cleanText(raw.sessionId),
		sourceRowCount: Math.max(0, Math.round(Number(raw.sourceRowCount) || 0)),
		schoolId: cleanText(raw.schoolId),
		school: cleanText(raw.school),
		category: cleanText(raw.category),
		date: cleanText(raw.date),
		startTime: cleanText(raw.startTime),
		endTime: cleanText(raw.endTime),
		group: cleanText(raw.group),
		tutors: Array.isArray(raw.tutors) ? raw.tutors.filter((item) => Boolean(item && typeof item === "object")).map(sanitizeUpcomingSessionTutor).filter((item) => item.tutorId) : []
	};
}
function parseUpcomingSessionsCsv(value) {
	const csvRows = parseCsvRows(value).filter((row) => row.some(Boolean));
	if (!csvRows.length) return {
		rows: [],
		schools: [],
		schoolStaffing: [],
		staffingSessions: [],
		sourceRowCount: 0,
		sourceSessionCount: 0
	};
	const headers = csvRows[0].map(normalizedHeader);
	const indexFor = (aliases) => {
		for (const alias of aliases) {
			const index = headers.findIndex((header) => header === alias);
			if (index >= 0) return index;
		}
		return -1;
	};
	const valueAt = (row, index) => index >= 0 ? row[index] || "" : "";
	const schoolIdIndex = indexFor(["idecole", "idetablissement"]);
	const schoolIndex = indexFor(["ecole", "etablissement"]);
	const categoryIndex = indexFor(["categorie", "type"]);
	const dateIndex = indexFor(["date"]);
	const startIndex = indexFor([
		"heureducreneau",
		"heuredebut",
		"debut"
	]);
	const endIndex = indexFor([
		"heurefin",
		"heuredefin",
		"fin"
	]);
	const durationIndex = indexFor(["heures", "duree"]);
	const sessionIdIndex = indexFor(["idseance", "iddelaseance"]);
	const groupIndex = indexFor(["groupe"]);
	const declaredStudentCountIndex = indexFor(["nbreleves", "nombreeleves"]);
	const roomIndex = indexFor(["salle"]);
	const tutorIdIndex = indexFor(["idtuteur", "iddututeur"]);
	const tutorFirstNameIndex = indexFor(["prenomtuteur", "prenomdututeur"]);
	const tutorLastNameIndex = indexFor(["nomtuteur", "nomdututeur"]);
	const tutorPhoneIndex = indexFor([
		"numerodutelephonedetuteur",
		"numerotuteur",
		"telephone",
		"numerodetelephone"
	]);
	const studentIdIndex = indexFor(["ideleve", "iddeleve"]);
	const classIndex = indexFor(["classe"]);
	if (sessionIdIndex < 0 || schoolIndex < 0 || dateIndex < 0 || tutorIdIndex < 0) throw new Error("Colonnes ID séance, établissement, date ou ID tuteur introuvables dans le CSV");
	const sessions = /* @__PURE__ */ new Map();
	const schools = /* @__PURE__ */ new Map();
	const dataRows = csvRows.slice(1);
	dataRows.forEach((row) => {
		const schoolId = valueAt(row, schoolIdIndex).trim();
		const schoolName = valueAt(row, schoolIndex).trim();
		const category = valueAt(row, categoryIndex).trim();
		if (schoolName) {
			const schoolKey = schoolId || `missing:${normalizeSchoolName(schoolName)}`;
			const school = schools.get(schoolKey) ?? {
				schoolId,
				name: schoolName,
				categories: [],
				categorySet: /* @__PURE__ */ new Set()
			};
			if (category) school.categorySet.add(category);
			schools.set(schoolKey, school);
		}
		const sessionId = valueAt(row, sessionIdIndex).trim();
		if (!sessionId) return;
		const existing = sessions.get(sessionId) ?? {
			sessionId,
			sourceRowCount: 0,
			schoolId,
			school: schoolName,
			category,
			date: valueAt(row, dateIndex),
			startTime: valueAt(row, startIndex),
			endTime: valueAt(row, endIndex),
			durationHours: valueAt(row, durationIndex),
			group: valueAt(row, groupIndex),
			studentCount: 0,
			classes: [],
			room: valueAt(row, roomIndex),
			tutors: /* @__PURE__ */ new Map(),
			studentIds: /* @__PURE__ */ new Set(),
			classSet: /* @__PURE__ */ new Set(),
			declaredStudentCount: 0
		};
		const tutorId = valueAt(row, tutorIdIndex).trim();
		existing.sourceRowCount += 1;
		const studentId = valueAt(row, studentIdIndex).trim();
		const className = valueAt(row, classIndex).trim();
		if (tutorId) {
			const previous = existing.tutors.get(tutorId);
			existing.tutors.set(tutorId, {
				tutorId,
				firstName: previous?.firstName || valueAt(row, tutorFirstNameIndex).trim(),
				lastName: previous?.lastName || valueAt(row, tutorLastNameIndex).trim(),
				phone: previous?.phone || valueAt(row, tutorPhoneIndex).trim()
			});
		}
		if (studentId) existing.studentIds.add(studentId);
		if (className) existing.classSet.add(className);
		existing.declaredStudentCount = Math.max(existing.declaredStudentCount, Math.round(Number(valueAt(row, declaredStudentCountIndex).replace(",", ".")) || 0));
		sessions.set(sessionId, existing);
	});
	const rows = Array.from(sessions.values()).filter((session) => session.date && session.school && session.tutors.size === 0).map((session) => sanitizeUpcomingSessionRow({
		...session,
		classes: Array.from(session.classSet).sort((a, b) => a.localeCompare(b, "fr")),
		studentCount: session.studentIds.size || session.declaredStudentCount
	})).sort((a, b) => `${a.date}-${a.startTime}-${a.school}`.localeCompare(`${b.date}-${b.startTime}-${b.school}`, "fr"));
	const schoolCatalog = Array.from(schools.values()).map((school) => sanitizeUpcomingSessionSchool({
		...school,
		categories: Array.from(school.categorySet).sort((a, b) => a.localeCompare(b, "fr"))
	})).sort((a, b) => a.name.localeCompare(b.name, "fr"));
	const staffingSessions = Array.from(sessions.values()).filter((session) => session.sessionId && session.date && session.school).map((session) => sanitizeUpcomingStaffingSession({
		...session,
		tutors: Array.from(session.tutors.values())
	})).sort((a, b) => `${a.date}-${a.startTime}-${a.school}-${a.sessionId}`.localeCompare(`${b.date}-${b.startTime}-${b.school}-${b.sessionId}`, "fr"));
	const staffingBySchool = /* @__PURE__ */ new Map();
	sessions.forEach((session) => {
		if (!session.school) return;
		const schoolKey = `${session.schoolId || `missing:${normalizeSchoolName(session.school)}`}:${session.date}`;
		const staffing = staffingBySchool.get(schoolKey) ?? {
			schoolId: session.schoolId,
			name: session.school,
			date: session.date,
			staffedSessions: 0,
			unstaffedSessions: 0
		};
		if (session.tutors.size > 0) staffing.staffedSessions += 1;
		else staffing.unstaffedSessions += 1;
		staffingBySchool.set(schoolKey, staffing);
	});
	return {
		rows,
		schools: schoolCatalog,
		schoolStaffing: Array.from(staffingBySchool.values()).sort((a, b) => a.name.localeCompare(b.name, "fr")),
		staffingSessions,
		sourceRowCount: dataRows.length,
		sourceSessionCount: sessions.size
	};
}
function sanitizeUpcomingSessionImport(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		id: cleanText(raw.id) || crypto.randomUUID(),
		importedAt: cleanText(raw.importedAt) || now,
		displayName: cleanText(raw.displayName) || cleanText(raw.fileName) || "Séances à venir",
		fileName: cleanText(raw.fileName) || "semaines-a-venir.csv",
		sourceRowCount: Math.max(0, Math.round(Number(raw.sourceRowCount) || 0)),
		sourceSessionCount: Math.max(0, Math.round(Number(raw.sourceSessionCount) || 0)),
		schools: Array.isArray(raw.schools) ? raw.schools.filter((school) => Boolean(school && typeof school === "object")).map(sanitizeUpcomingSessionSchool).filter((school) => school.name) : [],
		schoolStaffing: Array.isArray(raw.schoolStaffing) ? raw.schoolStaffing.filter((school) => Boolean(school && typeof school === "object")).map(sanitizeUpcomingSessionSchoolStaffing).filter((school) => school.name) : [],
		staffingSessions: Array.isArray(raw.staffingSessions) ? raw.staffingSessions.filter((session) => Boolean(session && typeof session === "object")).map(sanitizeUpcomingStaffingSession).filter((session) => session.sessionId && session.date && session.school) : [],
		rows: Array.isArray(raw.rows) ? raw.rows.filter((row) => Boolean(row && typeof row === "object")).map(sanitizeUpcomingSessionRow).filter((row) => row.sessionId && row.date && row.school) : [],
		createdAt: cleanText(raw.createdAt) || now
	};
}
function sanitizeActualSessionRow(raw) {
	return {
		sessionId: cleanText(raw.sessionId),
		date: cleanText(raw.date),
		school: cleanText(raw.school)
	};
}
function parseActualSessionsCsv(value) {
	const csvRows = parseCsvRows(value).filter((row) => row.some(Boolean));
	if (!csvRows.length) return {
		rows: [],
		sourceRowCount: 0
	};
	const headers = csvRows[0].map(normalizedHeader);
	const indexFor = (aliases) => {
		for (const alias of aliases) {
			const index = headers.findIndex((header) => header === alias);
			if (index >= 0) return index;
		}
		return -1;
	};
	const dateIndex = indexFor(["date", "datedelaprestation"]);
	const sessionIdIndex = indexFor([
		"semainereelle",
		"idseance",
		"iddelaseance"
	]);
	const schoolIndex = indexFor(["etablissement", "ecole"]);
	if (dateIndex < 0 || sessionIdIndex < 0 || schoolIndex < 0) throw new Error("Colonnes Date, Semaine réelle ou Établissement introuvables dans le CSV");
	const unique = /* @__PURE__ */ new Map();
	const dataRows = csvRows.slice(1);
	dataRows.forEach((row) => {
		const parsed = sanitizeActualSessionRow({
			date: row[dateIndex] || "",
			sessionId: row[sessionIdIndex] || "",
			school: row[schoolIndex] || ""
		});
		if (!parsed.date || !parsed.sessionId) return;
		unique.set(`${parsed.date}:${parsed.sessionId}`, parsed);
	});
	return {
		rows: Array.from(unique.values()).sort((a, b) => `${a.date}-${a.school}-${a.sessionId}`.localeCompare(`${b.date}-${b.school}-${b.sessionId}`, "fr")),
		sourceRowCount: dataRows.length
	};
}
function sanitizeActualSessionImport(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const rows = Array.isArray(raw.rows) ? raw.rows.filter((row) => Boolean(row && typeof row === "object")).map(sanitizeActualSessionRow).filter((row) => row.sessionId && row.date) : [];
	return {
		id: cleanText(raw.id) || crypto.randomUUID(),
		importedAt: cleanText(raw.importedAt) || now,
		displayName: cleanText(raw.displayName) || cleanText(raw.fileName) || "Semaine réelle",
		fileName: cleanText(raw.fileName) || "semaine-reelle.csv",
		sourceRowCount: Math.max(0, Math.round(Number(raw.sourceRowCount) || 0)),
		dates: Array.from(new Set(rows.map((row) => row.date))).sort(),
		rows,
		createdAt: cleanText(raw.createdAt) || now
	};
}
function isStaffingAuditOwner(value) {
	return value === "" || value === "kelly" || value === "pierre" || value === "julie";
}
function isStaffingAuditClassification(value) {
	return value === "staffed" || value === "unstaffed" || value === "ambiguous";
}
function isStaffingAuditResolution(value) {
	return value === "" || value === "staffed" || value === "unstaffed";
}
function isStaffingAuditSessionCategory(value) {
	return value === "alpha" || value === "surveillance" || value === "service";
}
function staffingAuditSessionCategory(schoolName, school, storedCategory) {
	const normalizedName = normalizeSchoolName(schoolName);
	const normalizedCategory = normalizeSchoolName(school?.category || "");
	if (normalizedName.includes("alpha")) return "alpha";
	if (normalizedName.includes("surveill")) return "surveillance";
	if (normalizedCategory.includes("alpha") || school?.schoolType === "alpha") return "alpha";
	if (normalizedCategory.includes("surveill")) return "surveillance";
	return isStaffingAuditSessionCategory(storedCategory) ? storedCategory : "service";
}
function normalizeStaffingAuditDate(value) {
	const raw = cleanText(value);
	if (!raw) return "";
	const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/);
	const frenchMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[T\s].*)?$/);
	const parts = isoMatch ? {
		year: Number(isoMatch[1]),
		month: Number(isoMatch[2]),
		day: Number(isoMatch[3])
	} : frenchMatch ? {
		year: Number(frenchMatch[3]),
		month: Number(frenchMatch[2]),
		day: Number(frenchMatch[1])
	} : null;
	if (!parts) return "";
	const candidate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
	if (candidate.getUTCFullYear() !== parts.year || candidate.getUTCMonth() !== parts.month - 1 || candidate.getUTCDate() !== parts.day) return "";
	return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}
function sanitizeStaffingAuditSession(raw) {
	const rawDate = cleanText(raw.date);
	const school = cleanText(raw.school);
	const tutors = Array.isArray(raw.tutors) ? raw.tutors.filter((item) => Boolean(item && typeof item === "object")).map((item) => ({
		tutorId: cleanText(item.tutorId),
		name: cleanText(item.name || item.displayName)
	})).filter((item) => item.tutorId || item.name) : Array.isArray(raw.tutorNames) ? raw.tutorNames.map((name) => ({
		tutorId: "",
		name: cleanText(name)
	})).filter((item) => item.name) : [];
	return {
		sessionId: cleanText(raw.sessionId),
		date: normalizeStaffingAuditDate(rawDate) || rawDate,
		school,
		schoolId: cleanText(raw.schoolId),
		category: staffingAuditSessionCategory(school, void 0, raw.category),
		sourceRowCount: raw.sourceRowCount === void 0 || raw.sourceRowCount === null || raw.sourceRowCount === "" ? null : Math.max(0, Math.round(Number(raw.sourceRowCount) || 0)),
		portfolioOwner: isStaffingAuditOwner(raw.portfolioOwner) ? raw.portfolioOwner : "",
		detectedStatus: isStaffingAuditClassification(raw.detectedStatus) ? raw.detectedStatus : "ambiguous",
		resolution: isStaffingAuditResolution(raw.resolution) ? raw.resolution : "",
		treated: raw.treated === true,
		tutors: (() => {
			const identified = /* @__PURE__ */ new Map();
			const unidentified = [];
			tutors.forEach((item) => {
				if (item.tutorId) identified.set(item.tutorId, item);
				else unidentified.push(item);
			});
			return [...identified.values(), ...unidentified];
		})()
	};
}
function sanitizeStaffingAuditDay(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const rawDate = cleanText(raw.date);
	return {
		date: normalizeStaffingAuditDate(rawDate) || rawDate,
		sourceFileName: cleanText(raw.sourceFileName) || "rapports.csv",
		sourceRowCount: Math.max(0, Math.round(Number(raw.sourceRowCount) || 0)),
		sessions: Array.isArray(raw.sessions) ? raw.sessions.filter((item) => Boolean(item && typeof item === "object")).map(sanitizeStaffingAuditSession).filter((item) => item.sessionId && item.date) : [],
		createdAt: cleanText(raw.createdAt) || now,
		updatedAt: cleanText(raw.updatedAt) || now
	};
}
function tutorPhoneKey(value) {
	return value.replace(/\D/g, "");
}
function createTutorRecordResolver(records) {
	const byId = new Map(records.filter((record) => record.tutorId).map((record) => [record.tutorId.trim(), record]));
	const index = (keyFor) => {
		const idsByKey = /* @__PURE__ */ new Map();
		records.forEach((record) => {
			const key = keyFor(record);
			if (!key || !record.tutorId.trim()) return;
			const ids = idsByKey.get(key) ?? /* @__PURE__ */ new Set();
			ids.add(record.tutorId.trim());
			idsByKey.set(key, ids);
		});
		return new Map(Array.from(idsByKey.entries()).filter(([, ids]) => ids.size === 1).map(([key, ids]) => [key, Array.from(ids)[0]]));
	};
	const idByPhone = index((record) => tutorPhoneKey(record.phone));
	const idByName = index((record) => normalizeSchoolName(`${record.firstName} ${record.lastName}`));
	return (input) => {
		const directId = input.tutorId?.trim() || "";
		if (directId) return byId.get(directId) ?? {
			tutorId: directId,
			firstName: "",
			lastName: ""
		};
		const phoneId = idByPhone.get(tutorPhoneKey(input.phone || ""));
		if (phoneId) return byId.get(phoneId);
		const nameId = idByName.get(normalizeSchoolName(input.name || ""));
		return nameId ? byId.get(nameId) : void 0;
	};
}
function resolveStaffingAuditTutorIds(days, records) {
	const resolve = createTutorRecordResolver(records);
	let changed = false;
	return {
		days: days.map((day) => ({
			...day,
			sessions: day.sessions.map((session) => {
				const tutors = session.tutors.map((tutor) => {
					if (tutor.tutorId) return tutor;
					const record = resolve({ name: tutor.name });
					if (!record?.tutorId) return tutor;
					changed = true;
					return {
						...tutor,
						tutorId: record.tutorId
					};
				});
				const byId = /* @__PURE__ */ new Map();
				const unidentified = [];
				tutors.forEach((tutor) => {
					if (tutor.tutorId) byId.set(tutor.tutorId, tutor);
					else unidentified.push(tutor);
				});
				return {
					...session,
					tutors: [...byId.values(), ...unidentified]
				};
			})
		})),
		changed
	};
}
function resolveTutorReportTutorIds(reports, records) {
	const resolve = createTutorRecordResolver(records);
	let changed = false;
	return {
		reports: reports.map((report) => ({
			...report,
			entries: report.entries.map((entry) => {
				if (entry.tutorId) return entry;
				const tutor = resolve({
					tutorId: entry.tutorId,
					phone: entry.phone,
					name: `${entry.firstName} ${entry.lastName}`
				});
				if (!tutor?.tutorId) return entry;
				changed = true;
				return {
					...entry,
					tutorId: tutor.tutorId
				};
			})
		})),
		changed
	};
}
function parseStaffingAuditCsv(value, fileName, schools, tutorRecords = []) {
	const csvRows = parseCsvRows(value).filter((row) => row.some(Boolean));
	if (!csvRows.length) return {
		days: [],
		invalidDateRowCount: 0
	};
	const headers = csvRows[0].map(normalizedHeader);
	const indexFor = (aliases) => {
		for (const alias of aliases) {
			const index = headers.findIndex((header) => header === alias);
			if (index >= 0) return index;
		}
		return -1;
	};
	const dateIndex = indexFor(["date", "datedelaprestation"]);
	const sessionIdIndex = indexFor([
		"semainereelle",
		"idseance",
		"iddelaseance"
	]);
	const schoolIndex = indexFor(["etablissement", "ecole"]);
	const tutorFirstNameIndex = indexFor(["prenomtuteur", "prenomdututeur"]);
	const tutorLastNameIndex = indexFor(["nomtuteur", "nomdututeur"]);
	const tutorPhoneIndex = indexFor([
		"numerotuteur",
		"numerodututeur",
		"telephone",
		"numerodetelephone"
	]);
	const tutorIdIndex = indexFor([
		"id",
		"idtuteur",
		"iddututeur",
		"tutorid",
		"idpersonne"
	]);
	if (dateIndex < 0 || sessionIdIndex < 0 || schoolIndex < 0) throw new Error("Colonnes Date, Semaine réelle ou Établissement introuvables dans le CSV");
	const schoolByName = new Map(schools.map((school) => [normalizeSchoolName(school.name), school]));
	const sessions = /* @__PURE__ */ new Map();
	const resolveTutor = createTutorRecordResolver(tutorRecords);
	const rows = csvRows.slice(1);
	const rowCountByDate = /* @__PURE__ */ new Map();
	let invalidDateRowCount = 0;
	rows.forEach((row, rowIndex) => {
		const date = normalizeStaffingAuditDate(row[dateIndex]);
		const sessionId = cleanText(row[sessionIdIndex]);
		if (!date) {
			invalidDateRowCount += 1;
			return;
		}
		rowCountByDate.set(date, (rowCountByDate.get(date) || 0) + 1);
		if (!sessionId) return;
		const key = `${date}:${sessionId}`;
		const school = cleanText(row[schoolIndex]);
		const firstName = tutorFirstNameIndex >= 0 ? cleanText(row[tutorFirstNameIndex]) : "";
		const lastName = tutorLastNameIndex >= 0 ? cleanText(row[tutorLastNameIndex]) : "";
		const phone = tutorPhoneIndex >= 0 ? cleanText(row[tutorPhoneIndex]) : "";
		const tutorId = tutorIdIndex >= 0 ? cleanText(row[tutorIdIndex]) : "";
		const tutorName = `${firstName} ${lastName}`.trim();
		const item = sessions.get(key) ?? {
			sessionId,
			date,
			school,
			sourceRowCount: 0,
			tutors: /* @__PURE__ */ new Map(),
			tutorKeyByPhone: /* @__PURE__ */ new Map()
		};
		item.sourceRowCount += 1;
		if (phone || tutorName) {
			const matchedTutor = resolveTutor({
				tutorId,
				phone,
				name: tutorName
			});
			const normalizedPhone = tutorPhoneKey(phone);
			const phoneKey = phone ? `phone:${normalizedPhone || phone.toLocaleLowerCase("fr")}` : "";
			const previousPhoneKey = normalizedPhone ? item.tutorKeyByPhone.get(normalizedPhone) : "";
			const previousTutorId = previousPhoneKey ? item.tutors.get(previousPhoneKey)?.tutorId : "";
			const resolvedId = matchedTutor?.tutorId || tutorId || previousTutorId || "";
			const tutorKey = resolvedId ? `id:${resolvedId}` : phoneKey || `unresolved-row:${rowIndex}`;
			if (resolvedId && previousPhoneKey && previousPhoneKey !== tutorKey) item.tutors.delete(previousPhoneKey);
			item.tutors.set(tutorKey, {
				tutorId: resolvedId,
				name: tutorName || `${matchedTutor?.firstName || ""} ${matchedTutor?.lastName || ""}`.trim() || phone
			});
			if (normalizedPhone) item.tutorKeyByPhone.set(normalizedPhone, tutorKey);
		}
		if (!item.school && school) item.school = school;
		sessions.set(key, item);
	});
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const byDate = /* @__PURE__ */ new Map();
	sessions.forEach((item) => {
		const school = schoolByName.get(normalizeSchoolName(item.school));
		const identifiedTutorIds = new Set(Array.from(item.tutors.values()).map((tutor) => tutor.tutorId).filter(Boolean));
		const detectedStatus = item.tutors.size > 1 || identifiedTutorIds.size > 0 && identifiedTutorIds.size !== item.tutors.size ? "ambiguous" : item.tutors.size === 1 ? "staffed" : "unstaffed";
		const session = sanitizeStaffingAuditSession({
			sessionId: item.sessionId,
			date: item.date,
			school: item.school,
			schoolId: school?.externalId ?? "",
			category: staffingAuditSessionCategory(item.school, school),
			sourceRowCount: item.sourceRowCount,
			portfolioOwner: school?.portfolioOwner ?? "",
			detectedStatus,
			resolution: "",
			treated: false,
			tutors: Array.from(item.tutors.values())
		});
		byDate.set(item.date, [...byDate.get(item.date) ?? [], session]);
	});
	return {
		days: Array.from(byDate.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, daySessions]) => sanitizeStaffingAuditDay({
			date,
			sourceFileName: fileName,
			sourceRowCount: rowCountByDate.get(date) || 0,
			sessions: daySessions.sort((a, b) => a.school.localeCompare(b.school, "fr") || a.sessionId.localeCompare(b.sessionId)),
			createdAt: now,
			updatedAt: now
		})),
		invalidDateRowCount
	};
}
function enrichStaffingAuditDaysWithSchools(days, schools) {
	const schoolByName = new Map(schools.map((school) => [normalizeSchoolName(school.name), school]));
	return days.map((day) => ({
		...day,
		sessions: day.sessions.map((session) => {
			const school = schoolByName.get(normalizeSchoolName(session.school));
			return {
				...session,
				schoolId: session.schoolId || school?.externalId || "",
				category: staffingAuditSessionCategory(session.school, school, session.category)
			};
		})
	}));
}
function sanitizeTutorInterestRow(raw) {
	return {
		personId: cleanText(raw.personId),
		firstName: cleanText(raw.firstName),
		lastName: cleanText(raw.lastName),
		phone: cleanText(raw.phone),
		sessionId: cleanText(raw.sessionId),
		date: cleanText(raw.date),
		school: cleanText(raw.school),
		className: cleanText(raw.className),
		timeSlot: cleanText(raw.timeSlot),
		group: cleanText(raw.group),
		studentCount: cleanText(raw.studentCount),
		validated: raw.validated === true || [
			"oui",
			"yes",
			"true",
			"1",
			"valide",
			"validé"
		].includes(cleanText(raw.validated).toLocaleLowerCase("fr")),
		declaredAt: cleanText(raw.declaredAt)
	};
}
function parseTutorInterestsCsv(value) {
	const csvRows = parseCsvRows(value).filter((row) => row.some(Boolean));
	if (!csvRows.length) return {
		rows: [],
		sourceRowCount: 0
	};
	const headers = csvRows[0].map(normalizedHeader);
	const indexFor = (aliases) => {
		for (const alias of aliases) {
			const index = headers.findIndex((header) => header === alias);
			if (index >= 0) return index;
		}
		return -1;
	};
	const valueAt = (row, index) => index >= 0 ? row[index] || "" : "";
	const personIdIndex = indexFor([
		"idtuteurcandidat",
		"idcandidat",
		"idtuteur",
		"id"
	]);
	const lastNameIndex = indexFor(["nom", "nomtuteur"]);
	const firstNameIndex = indexFor(["prenom", "prenomtuteur"]);
	const phoneIndex = indexFor(["telephone", "numerodetelephone"]);
	const sessionIdIndex = indexFor([
		"seanceid",
		"idseance",
		"iddelaseance"
	]);
	const dateIndex = indexFor(["dateseance", "date"]);
	const schoolIndex = indexFor(["etablissement", "ecole"]);
	const classIndex = indexFor(["classe"]);
	const timeSlotIndex = indexFor([
		"heureducreneau",
		"horaire",
		"creneau"
	]);
	const groupIndex = indexFor(["groupe"]);
	const studentCountIndex = indexFor(["nombreeleves", "nbreleves"]);
	const validatedIndex = indexFor(["valide", "validation"]);
	const createdAtIndex = indexFor(["datedecreation", "creation"]);
	if (personIdIndex < 0 || sessionIdIndex < 0 || dateIndex < 0) throw new Error("Colonnes ID tuteur/candidat, Séance ID ou Date séance introuvables dans le CSV d’intérêts");
	const dataRows = csvRows.slice(1);
	return {
		sourceRowCount: dataRows.length,
		rows: dataRows.map((row) => sanitizeTutorInterestRow({
			personId: valueAt(row, personIdIndex),
			lastName: valueAt(row, lastNameIndex),
			firstName: valueAt(row, firstNameIndex),
			phone: valueAt(row, phoneIndex),
			sessionId: valueAt(row, sessionIdIndex),
			date: valueAt(row, dateIndex),
			school: valueAt(row, schoolIndex),
			className: valueAt(row, classIndex),
			timeSlot: valueAt(row, timeSlotIndex),
			group: valueAt(row, groupIndex),
			studentCount: valueAt(row, studentCountIndex),
			validated: valueAt(row, validatedIndex),
			declaredAt: valueAt(row, createdAtIndex)
		})).filter((row) => row.personId && row.sessionId && row.date)
	};
}
function sanitizeTutorInterestImport(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		id: cleanText(raw.id) || crypto.randomUUID(),
		importedAt: cleanText(raw.importedAt) || now,
		displayName: cleanText(raw.displayName) || cleanText(raw.fileName) || "Intérêts tuteurs et candidats",
		fileName: cleanText(raw.fileName) || "interets-tuteurs-candidats.csv",
		sourceRowCount: Math.max(0, Math.round(Number(raw.sourceRowCount) || 0)),
		rows: Array.isArray(raw.rows) ? raw.rows.filter((row) => Boolean(row && typeof row === "object")).map(sanitizeTutorInterestRow).filter((row) => row.personId && row.sessionId && row.date) : [],
		createdAt: cleanText(raw.createdAt) || now
	};
}
function sanitizeTutorCoverageNote(raw) {
	const status = raw.status === "unavailable" || raw.status === "confirmed" || raw.status === "contacted" ? raw.status : "to-check";
	return {
		id: cleanText(raw.id) || crypto.randomUUID(),
		tutorId: cleanText(raw.tutorId),
		date: cleanText(raw.date),
		status,
		note: cleanText(raw.note),
		updatedAt: cleanText(raw.updatedAt) || (/* @__PURE__ */ new Date()).toISOString()
	};
}
function sanitizeEnrollmentRow(raw) {
	return {
		studentId: cleanText(raw.studentId),
		firstName: cleanText(raw.firstName),
		lastName: cleanText(raw.lastName),
		className: cleanText(raw.className),
		school: cleanText(raw.school),
		slots: cleanText(raw.slots)
	};
}
function parseEnrollmentCsv(value) {
	const csvRows = parseCsvRows(value).filter((row) => row.some(Boolean));
	if (!csvRows.length) return {
		rows: [],
		sourceRowCount: 0
	};
	const headers = csvRows[0].map(normalizedHeader);
	const indexFor = (aliases) => {
		for (const alias of aliases) {
			const index = headers.findIndex((header) => header === alias);
			if (index >= 0) return index;
		}
		return -1;
	};
	const valueAt = (row, index) => index >= 0 ? row[index] || "" : "";
	const studentIdIndex = indexFor([
		"iddelenfant",
		"iddelefant",
		"idenfant",
		"studentid"
	]);
	const firstNameIndex = indexFor([
		"prenomdelenfant",
		"prenomenfant",
		"firstname"
	]);
	const lastNameIndex = indexFor([
		"nomdelenfant",
		"nomenfant",
		"lastname"
	]);
	const classIndex = indexFor(["classe", "class"]);
	const schoolIndex = indexFor([
		"ecole",
		"etablissement",
		"school"
	]);
	const slotsIndex = indexFor([
		"creneaux",
		"creneau",
		"slots"
	]);
	if (studentIdIndex < 0 || slotsIndex < 0) throw new Error("Colonnes « Id de l’enfant » ou « Creneaux » introuvables");
	const dataRows = csvRows.slice(1);
	return {
		rows: dataRows.map((row) => sanitizeEnrollmentRow({
			studentId: valueAt(row, studentIdIndex),
			firstName: valueAt(row, firstNameIndex),
			lastName: valueAt(row, lastNameIndex),
			className: valueAt(row, classIndex),
			school: valueAt(row, schoolIndex),
			slots: valueAt(row, slotsIndex)
		})).filter((row) => row.studentId && row.slots),
		sourceRowCount: dataRows.length
	};
}
function sanitizeEnrollmentImport(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		id: cleanText(raw.id) || crypto.randomUUID(),
		importedAt: cleanText(raw.importedAt) || now,
		displayName: cleanText(raw.displayName) || cleanText(raw.fileName) || "Export inscriptions",
		fileName: cleanText(raw.fileName) || "parents.csv",
		sourceRowCount: Math.max(0, Math.round(Number(raw.sourceRowCount) || 0)),
		rows: Array.isArray(raw.rows) ? raw.rows.filter((row) => Boolean(row && typeof row === "object")).map(sanitizeEnrollmentRow).filter((row) => row.studentId && row.slots) : [],
		createdAt: cleanText(raw.createdAt) || now
	};
}
function isSchoolWatchTag(value) {
	return value === "Nouvel établissement" || value === "Nouveau besoin" || value === "Suivi particulier";
}
function isSchoolWatchStatus(value) {
	return value === "active" || value === "resolved";
}
function sanitizeSchoolWatchItem(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		id: cleanText(raw.id) || crypto.randomUUID(),
		schoolId: cleanText(raw.schoolId),
		reason: cleanText(raw.reason),
		tags: Array.isArray(raw.tags) ? Array.from(new Set(raw.tags.filter(isSchoolWatchTag))) : [],
		status: isSchoolWatchStatus(raw.status) ? raw.status : "active",
		comments: Array.isArray(raw.comments) ? raw.comments.filter((comment) => Boolean(comment && typeof comment === "object")).map((comment) => ({
			id: cleanText(comment.id) || crypto.randomUUID(),
			text: cleanText(comment.text),
			author: cleanText(comment.author) || "Equipe Alpha",
			createdAt: cleanText(comment.createdAt) || now
		})).filter((comment) => comment.text) : [],
		createdAt: cleanText(raw.createdAt) || now,
		updatedAt: cleanText(raw.updatedAt) || cleanText(raw.createdAt) || now,
		resolvedAt: cleanText(raw.resolvedAt)
	};
}
function isSchoolEventKind(value) {
	return value === "event" || value === "comment" || value === "action";
}
function isSchoolType(value) {
	return value === "alpha" || value === "mise-a-dispo" || value === "mixed";
}
function normalizeSchoolName(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, " ").trim();
}
function schoolFromImport(item) {
	const now = "2026-08-31T00:00:00.000Z";
	return {
		id: item.externalId ? `school-${item.externalId}` : crypto.randomUUID(),
		externalId: item.externalId,
		name: item.name,
		category: item.category,
		schoolType: item.schoolType,
		portfolioOwner: "",
		zone: item.zone,
		coordinator: item.coordinator,
		registeredCount: item.registeredCount,
		city: item.city,
		address: item.address,
		department: item.department,
		upcomingWeek: item.upcomingWeek,
		pastSessions: item.pastSessions,
		typicalWeek: item.typicalWeek,
		contractSigned: item.contractSigned,
		actions: item.actions,
		contact: item.coordinator,
		nextAction: item.actions,
		notes: "",
		events: [],
		createdAt: now,
		updatedAt: now
	};
}
function mergeImportedSchools(schools) {
	const importedByExternalId = new Map(importedSchools.map((item) => [item.externalId, schoolFromImport(item)]));
	const importedByName = new Map(importedSchools.map((item) => [normalizeSchoolName(item.name), schoolFromImport(item)]));
	const matchedExternalIds = /* @__PURE__ */ new Set();
	const matchedNames = /* @__PURE__ */ new Set();
	const enrichedSchools = schools.map((school) => {
		const imported = (school.externalId ? importedByExternalId.get(school.externalId) : null) ?? importedByName.get(normalizeSchoolName(school.name));
		if (!imported) return school;
		if (imported.externalId) matchedExternalIds.add(imported.externalId);
		matchedNames.add(normalizeSchoolName(imported.name));
		return {
			...imported,
			...school,
			externalId: school.externalId || imported.externalId,
			category: school.category || imported.category,
			schoolType: !school.category && school.schoolType === "mixed" ? imported.schoolType : school.schoolType,
			portfolioOwner: school.portfolioOwner,
			zone: school.zone || imported.zone,
			coordinator: school.coordinator || imported.coordinator,
			registeredCount: school.registeredCount ?? imported.registeredCount,
			city: school.city || imported.city,
			address: school.address || imported.address,
			department: school.department || imported.department,
			upcomingWeek: school.upcomingWeek || imported.upcomingWeek,
			pastSessions: school.pastSessions || imported.pastSessions,
			typicalWeek: school.typicalWeek || imported.typicalWeek,
			contractSigned: school.contractSigned || imported.contractSigned,
			actions: school.actions || imported.actions,
			contact: school.contact || imported.contact,
			nextAction: school.nextAction || imported.nextAction,
			notes: school.notes,
			events: school.events,
			createdAt: school.createdAt,
			updatedAt: school.updatedAt
		};
	});
	const knownNames = new Set(enrichedSchools.map((school) => normalizeSchoolName(school.name)).filter(Boolean));
	const missingImportedSchools = importedSchools.filter((item) => {
		const externalMatch = item.externalId && matchedExternalIds.has(item.externalId);
		const name = normalizeSchoolName(item.name);
		return !externalMatch && !matchedNames.has(name) && !knownNames.has(name);
	}).map(schoolFromImport);
	return [...enrichedSchools, ...missingImportedSchools].sort((a, b) => a.name.localeCompare(b.name, "fr"));
}
function sanitizeSchool(raw) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const category = cleanText(raw.category);
	return {
		id: cleanText(raw.id) || crypto.randomUUID(),
		externalId: cleanText(raw.externalId),
		name: cleanText(raw.name),
		category,
		schoolType: isSchoolType(raw.schoolType) ? raw.schoolType : category.toLocaleLowerCase("fr").includes("prestation") ? "mise-a-dispo" : category.toLocaleLowerCase("fr").includes("alpha") ? "alpha" : "mixed",
		portfolioOwner: raw.portfolioOwner === "kelly" || raw.portfolioOwner === "pierre" || raw.portfolioOwner === "julie" ? raw.portfolioOwner : "",
		zone: cleanText(raw.zone),
		coordinator: cleanText(raw.coordinator),
		registeredCount: cleanPositiveNumber(raw.registeredCount, true),
		city: cleanText(raw.city),
		address: cleanText(raw.address),
		department: cleanText(raw.department),
		upcomingWeek: cleanText(raw.upcomingWeek),
		pastSessions: cleanText(raw.pastSessions),
		typicalWeek: cleanText(raw.typicalWeek),
		contractSigned: cleanText(raw.contractSigned),
		actions: cleanText(raw.actions),
		contact: cleanText(raw.contact),
		nextAction: cleanText(raw.nextAction),
		notes: cleanText(raw.notes),
		events: Array.isArray(raw.events) ? raw.events.filter((event) => Boolean(event && typeof event === "object")).map((event) => ({
			id: cleanText(event.id) || crypto.randomUUID(),
			kind: isSchoolEventKind(event.kind) ? event.kind : "event",
			title: cleanText(event.title),
			note: cleanText(event.note),
			author: cleanText(event.author) || "Equipe Alpha",
			tags: Array.isArray(event.tags) ? event.tags.map(cleanText).filter(Boolean) : cleanText(event.tags).split(",").map((tag) => tag.trim()).filter(Boolean),
			likes: Array.isArray(event.likes) ? event.likes.filter((like) => Boolean(like && typeof like === "object")).map(sanitizeSocialLike) : [],
			comments: Array.isArray(event.comments) ? event.comments.filter((comment) => Boolean(comment && typeof comment === "object")).map(sanitizeSocialComment).filter((comment) => comment.text) : [],
			date: cleanText(event.date) || cleanText(event.createdAt) || now,
			createdAt: cleanText(event.createdAt) || now
		})).filter((event) => event.title || event.note).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [],
		createdAt: cleanText(raw.createdAt) || now,
		updatedAt: cleanText(raw.updatedAt) || cleanText(raw.createdAt) || now
	};
}
function sanitizeStudentHistoryYear(raw) {
	const year = cleanYear(raw.year);
	const entriesByDate = new Map(Array.isArray(raw.entries) ? raw.entries.filter((entry) => Boolean(entry && typeof entry === "object")).map((entry) => {
		const value = cleanPositiveNumber(entry.value, true);
		return [cleanText(entry.date), value];
	}).filter(([date]) => date) : []);
	return {
		year,
		entries: campaignDates(year).map((date) => ({
			date,
			value: entriesByDate.get(date) ?? null
		})),
		createdAt: cleanText(raw.createdAt) || (/* @__PURE__ */ new Date()).toISOString()
	};
}
async function readTasks() {
	try {
		const tasks = await taskStore().get(TASKS_KEY, {
			type: "json",
			consistency: "strong"
		});
		return Array.isArray(tasks) ? tasks.filter((task) => Boolean(task && typeof task === "object")).map(sanitizeTask) : [];
	} catch {
		return memory.__petitSuiviTasks ?? [];
	}
}
async function writeTasks(tasks) {
	try {
		await taskStore().setJSON(TASKS_KEY, tasks);
	} catch {
		memory.__petitSuiviTasks = tasks;
	}
}
async function readPeople() {
	try {
		const people = await taskStore().get(PEOPLE_KEY, {
			type: "json",
			consistency: "strong"
		});
		return Array.isArray(people) ? people.filter((person) => Boolean(person && typeof person === "object")).map((person) => sanitizePerson(person)).filter((person) => person.name) : [];
	} catch {
		return memory.__petitSuiviPeople ?? [];
	}
}
async function readRecurringTasks() {
	try {
		const recurringTasks = await taskStore().get(RECURRING_TASKS_KEY, {
			type: "json",
			consistency: "strong"
		});
		return Array.isArray(recurringTasks) ? recurringTasks.filter((task) => Boolean(task && typeof task === "object")).map(sanitizeRecurringTask).filter((task) => task.title && task.owner) : [];
	} catch {
		return memory.__petitSuiviRecurringTasks ?? [];
	}
}
async function writeRecurringTasks(recurringTasks) {
	try {
		await taskStore().setJSON(RECURRING_TASKS_KEY, recurringTasks);
	} catch {
		memory.__petitSuiviRecurringTasks = recurringTasks;
	}
}
async function readObjectives() {
	try {
		const objectives = await taskStore().get(OBJECTIVES_KEY, {
			type: "json",
			consistency: "strong"
		});
		const savedObjectives = Array.isArray(objectives) ? objectives.filter((objective) => Boolean(objective && typeof objective === "object")).map(sanitizeObjective).filter((objective) => objective.title) : defaultObjectives;
		const savedIds = new Set(savedObjectives.map((objective) => objective.id));
		return [...defaultObjectives.filter((objective) => !savedIds.has(objective.id)), ...savedObjectives];
	} catch {
		return memory.__petitSuiviObjectives ?? defaultObjectives;
	}
}
async function writeObjectives(objectives) {
	try {
		await taskStore().setJSON(OBJECTIVES_KEY, objectives);
	} catch {
		memory.__petitSuiviObjectives = objectives;
	}
}
async function readLinks() {
	try {
		const links = await taskStore().get(LINKS_KEY, {
			type: "json",
			consistency: "strong"
		});
		return Array.isArray(links) ? links.filter((link) => Boolean(link && typeof link === "object")).map(sanitizeSharedLink).filter((link) => link.title && link.url) : [];
	} catch {
		return memory.__petitSuiviLinks ?? [];
	}
}
async function writeLinks(links) {
	try {
		await taskStore().setJSON(LINKS_KEY, links);
	} catch {
		memory.__petitSuiviLinks = links;
	}
}
async function readJournalPosts() {
	try {
		const posts = await taskStore().get(JOURNAL_POSTS_KEY, {
			type: "json",
			consistency: "strong"
		});
		return Array.isArray(posts) ? posts.filter((post) => Boolean(post && typeof post === "object")).map(sanitizeJournalPost).filter((post) => post.title && post.content).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()) : [];
	} catch {
		return memory.__petitSuiviJournalPosts ?? [];
	}
}
async function writeJournalPosts(posts) {
	try {
		await taskStore().setJSON(JOURNAL_POSTS_KEY, posts);
	} catch {
		memory.__petitSuiviJournalPosts = posts;
	}
}
async function readMassCommunications() {
	try {
		const communications = await taskStore().get(MASS_COMMUNICATIONS_KEY, {
			type: "json",
			consistency: "strong"
		});
		return Array.isArray(communications) ? communications.filter((communication) => Boolean(communication && typeof communication === "object")).map(sanitizeMassCommunication).filter((communication) => communication.title).sort((a, b) => dateValueForSort(b.sentAt || b.followUpDate || b.createdAt) - dateValueForSort(a.sentAt || a.followUpDate || a.createdAt)) : [];
	} catch {
		return memory.__petitSuiviMassCommunications ?? [];
	}
}
async function writeMassCommunications(communications) {
	try {
		await taskStore().setJSON(MASS_COMMUNICATIONS_KEY, communications);
	} catch {
		memory.__petitSuiviMassCommunications = communications;
	}
}
async function readStaffingSessions() {
	try {
		const staffing = await taskStore().get(STAFFING_SESSIONS_KEY, {
			type: "json",
			consistency: "strong"
		});
		return Array.isArray(staffing) ? staffing.filter((day) => Boolean(day && typeof day === "object")).map(sanitizeStaffingDay).sort((a, b) => dateValueForSort(b.date) - dateValueForSort(a.date)) : [];
	} catch {
		return memory.__petitSuiviStaffingSessions ?? [];
	}
}
async function writeStaffingSessions(staffing) {
	try {
		await taskStore().setJSON(STAFFING_SESSIONS_KEY, staffing);
	} catch {
		memory.__petitSuiviStaffingSessions = staffing;
	}
}
async function readTutorReports() {
	try {
		const reports = await taskStore().get(TUTOR_REPORTS_KEY, {
			type: "json",
			consistency: "strong"
		});
		return Array.isArray(reports) ? reports.filter((snapshot) => Boolean(snapshot && typeof snapshot === "object")).map(sanitizeTutorReportSnapshot).sort((a, b) => dateValueForSort(b.date) - dateValueForSort(a.date)) : [];
	} catch {
		return memory.__petitSuiviTutorReports ?? [];
	}
}
async function writeTutorReports(reports) {
	try {
		await taskStore().setJSON(TUTOR_REPORTS_KEY, reports);
	} catch {
		memory.__petitSuiviTutorReports = reports;
	}
}
async function readTutorReportComments() {
	let rawComments = [];
	try {
		const comments = await taskStore().get(TUTOR_REPORT_COMMENTS_KEY, {
			type: "json",
			consistency: "strong"
		});
		rawComments = Array.isArray(comments) ? comments.filter((comment) => Boolean(comment && typeof comment === "object")) : [];
	} catch {
		rawComments = memory.__petitSuiviTutorReportComments ?? [];
	}
	const [reports, tracking] = await Promise.all([readTutorReports(), readTutorTracking()]);
	const resolvedReports = resolveTutorReportTutorIds(reports, tracking.snapshots.flatMap((snapshot) => snapshot.records)).reports;
	const idsByLegacyKey = /* @__PURE__ */ new Map();
	resolvedReports.forEach((report) => report.entries.forEach((entry) => {
		if (!entry.tutorId) return;
		const legacyKey = `name:${`${entry.lastName} ${entry.firstName} ${entry.phone}`.trim().toLocaleLowerCase("fr").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
		const ids = idsByLegacyKey.get(legacyKey) ?? /* @__PURE__ */ new Set();
		ids.add(entry.tutorId);
		idsByLegacyKey.set(legacyKey, ids);
	}));
	return rawComments.map((raw) => {
		const oldKey = cleanText(raw.tutorKey);
		const legacyId = /^id:(.+)$/i.exec(oldKey)?.[1] ?? "";
		const mappedIds = idsByLegacyKey.get(oldKey);
		const tutorId = cleanText(raw.tutorId) || legacyId || (mappedIds?.size === 1 ? Array.from(mappedIds)[0] : "");
		return sanitizeTutorReportComment({
			...raw,
			tutorId
		});
	}).filter((comment) => comment.tutorId);
}
async function writeTutorReportComments(comments) {
	try {
		await taskStore().setJSON(TUTOR_REPORT_COMMENTS_KEY, comments);
	} catch {
		memory.__petitSuiviTutorReportComments = comments;
	}
}
async function readTutorTracking() {
	try {
		const store = taskStore();
		const tracking = await store.get(TUTOR_TRACKING_KEY, {
			type: "json",
			consistency: "strong"
		});
		if (!tracking || typeof tracking !== "object") return {
			snapshots: [],
			comments: []
		};
		const migrated = migrateTutorTrackingData(tracking);
		if (JSON.stringify(migrated) !== JSON.stringify(tracking)) await store.setJSON(TUTOR_TRACKING_KEY, migrated);
		return migrated;
	} catch {
		return memory.__petitSuiviTutorTracking ?? {
			snapshots: [],
			comments: []
		};
	}
}
async function writeTutorTracking(tracking) {
	const sanitizedTracking = sanitizeTutorTrackingData(tracking);
	try {
		await taskStore().setJSON(TUTOR_TRACKING_KEY, sanitizedTracking);
	} catch {
		memory.__petitSuiviTutorTracking = sanitizedTracking;
	}
}
async function createTutorTrackingSnapshotFromCsv(input) {
	const date = cleanText(input.date);
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("La date liée à l’import est invalide");
	const { records, sourceRowCount } = parseTutorTrackingCsv(input.rawCsv);
	if (!records.length) throw new Error("Aucun tuteur valide trouvé dans ce CSV");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const tracking = await readTutorTracking();
	const fileName = cleanText(input.fileName) || "liste-tuteurs.csv";
	const snapshot = sanitizeTutorTrackingSnapshot({
		id: crypto.randomUUID(),
		date,
		displayName: fileName.replace(/\.[^.]+$/, "") || `Liste tuteurs du ${date}`,
		fileName,
		sourceRowCount,
		records,
		createdAt: now,
		updatedAt: now
	});
	const nextTracking = sanitizeTutorTrackingData({
		...tracking,
		snapshots: [snapshot, ...tracking.snapshots]
	});
	await writeTutorTracking(nextTracking);
	return {
		snapshot,
		tracking: nextTracking
	};
}
async function updateTutorTrackingSnapshotName(id, displayName) {
	const cleanedName = cleanText(displayName);
	if (!cleanedName) throw new Error("Le nom de l’import est obligatoire");
	const tracking = await readTutorTracking();
	if (!tracking.snapshots.some((snapshot) => snapshot.id === id)) throw new Error("Import introuvable");
	const nextTracking = sanitizeTutorTrackingData({
		...tracking,
		snapshots: tracking.snapshots.map((snapshot) => snapshot.id === id ? {
			...snapshot,
			displayName: cleanedName
		} : snapshot)
	});
	await writeTutorTracking(nextTracking);
	return nextTracking;
}
async function readUnstaffedExclusions() {
	try {
		const exclusions = await taskStore().get(UNSTAFFED_EXCLUSIONS_KEY, {
			type: "json",
			consistency: "strong"
		});
		return exclusions && typeof exclusions === "object" ? sanitizeUnstaffedExclusions(exclusions) : {
			sessionIds: [],
			sourceKeys: [],
			updatedAt: ""
		};
	} catch {
		return memory.__petitSuiviUnstaffedExclusions ?? {
			sessionIds: [],
			sourceKeys: [],
			updatedAt: ""
		};
	}
}
async function writeUnstaffedExclusions(exclusions) {
	const sanitized = sanitizeUnstaffedExclusions(exclusions);
	try {
		await taskStore().setJSON(UNSTAFFED_EXCLUSIONS_KEY, sanitized);
	} catch {
		memory.__petitSuiviUnstaffedExclusions = sanitized;
	}
	return sanitized;
}
async function readAvailabilityImports() {
	try {
		const store = taskStore();
		const imports = await store.get(AVAILABILITY_IMPORTS_KEY, {
			type: "json",
			consistency: "strong"
		});
		if (!Array.isArray(imports)) return [];
		const sanitizedImports = imports.filter((item) => Boolean(item && typeof item === "object")).map(sanitizeAvailabilityImport);
		return (await Promise.all(sanitizedImports.map(async (item) => {
			if (item.rows.length > 0) return {
				...item,
				rawCsv: "",
				hasRawCsv: item.hasRawCsv || Boolean(item.rawCsv)
			};
			const rows = await store.get(availabilityRowsKey(item.id), {
				type: "json",
				consistency: "strong"
			});
			return {
				...item,
				rows: Array.isArray(rows) ? rows.filter((row) => Boolean(row && typeof row === "object")).map(sanitizeAvailabilityRow).filter((row) => row.tutorId && row.date) : [],
				rawCsv: ""
			};
		}))).sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt));
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		return memory.__petitSuiviAvailabilityImports ?? [];
	}
}
async function writeAvailabilityImports(imports) {
	const sanitizedImports = imports.map((item) => sanitizeAvailabilityImport(item));
	try {
		const store = taskStore();
		await Promise.all(sanitizedImports.map((item) => Promise.all([item.rawCsv ? store.set(availabilityRawKey(item.id), item.rawCsv) : Promise.resolve(), store.setJSON(availabilityRowsKey(item.id), item.rows)])));
		await store.setJSON(AVAILABILITY_IMPORTS_KEY, sanitizedImports.map((item) => ({
			...item,
			rows: [],
			rawCsv: "",
			hasRawCsv: item.hasRawCsv || Boolean(item.rawCsv)
		})));
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		memory.__petitSuiviAvailabilityImports = sanitizedImports;
	}
}
function availabilityRawKey(id) {
	return `availability-imports/${id}.csv`;
}
function availabilityRowsKey(id) {
	return `availability-imports/${id}.rows.json`;
}
async function readAvailabilityIndex() {
	const imports = await taskStore().get(AVAILABILITY_IMPORTS_KEY, {
		type: "json",
		consistency: "strong"
	});
	return Array.isArray(imports) ? imports.filter((item) => Boolean(item && typeof item === "object")).map(sanitizeAvailabilityImport).sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt)) : [];
}
async function readAvailabilityImportSummaries() {
	return (await readAvailabilityIndex()).map((item) => ({
		...item,
		rows: [],
		rawCsv: ""
	}));
}
async function readAvailabilityImportById(id) {
	const cleanedId = cleanText(id);
	if (!cleanedId) return null;
	try {
		const store = taskStore();
		const selected = (await readAvailabilityIndex()).find((item) => item.id === cleanedId);
		if (!selected) return null;
		if (selected.rows.length) return selected;
		const rows = await store.get(availabilityRowsKey(selected.id), {
			type: "json",
			consistency: "strong"
		});
		return {
			...selected,
			rows: Array.isArray(rows) ? rows.filter((row) => Boolean(row && typeof row === "object")).map(sanitizeAvailabilityRow).filter((row) => row.tutorId && row.date) : [],
			rawCsv: ""
		};
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		return (memory.__petitSuiviAvailabilityImports ?? []).find((item) => item.id === cleanedId) ?? null;
	}
}
async function createAvailabilityImportFromCsv(input) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const rows = parseAvailabilityCsv(input.rawCsv);
	if (!rows.length) throw new Error("Aucune disponibilité valide dans ce CSV");
	const nextImport = sanitizeAvailabilityImport({
		id: crypto.randomUUID(),
		importedAt: now,
		displayName: input.fileName.replace(/\.[^.]+$/, "") || "Import de disponibilités",
		fileName: input.fileName || "disponibilites.csv",
		rows,
		rawCsv: input.rawCsv,
		hasRawCsv: true,
		createdAt: now
	});
	const store = taskStore();
	await store.set(availabilityRawKey(nextImport.id), input.rawCsv);
	await store.setJSON(availabilityRowsKey(nextImport.id), rows);
	const existingImports = await readAvailabilityIndex();
	const nextIndex = [{
		...nextImport,
		rows: [],
		rawCsv: "",
		hasRawCsv: true
	}, ...existingImports.filter((item) => item.id !== nextImport.id).map((item) => ({
		...item,
		rows: [],
		rawCsv: ""
	}))].sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt));
	await store.setJSON(AVAILABILITY_IMPORTS_KEY, nextIndex);
	return {
		...nextImport,
		rawCsv: ""
	};
}
async function updateAvailabilityImportName(id, displayName) {
	const store = taskStore();
	const existingImports = await readAvailabilityIndex();
	const matchingImport = existingImports.find((item) => item.id === id);
	if (!matchingImport) throw new Error("Import introuvable");
	const cleanedName = cleanText(displayName);
	if (!cleanedName) throw new Error("Le nom de l’import est obligatoire");
	const nextImports = existingImports.map((item) => item.id === id ? {
		...item,
		displayName: cleanedName,
		rows: [],
		rawCsv: ""
	} : {
		...item,
		rows: [],
		rawCsv: ""
	});
	await store.setJSON(AVAILABILITY_IMPORTS_KEY, nextImports);
	return {
		...matchingImport,
		displayName: cleanedName
	};
}
async function deleteAvailabilityImportById(id) {
	await moveFileImportToTrash("availability", id);
}
async function readAvailabilityRawCsv(id) {
	const rawCsv = await taskStore().get(availabilityRawKey(id), {
		type: "text",
		consistency: "strong"
	});
	if (rawCsv) return rawCsv;
	return (await readAvailabilityIndex()).find((item) => item.id === id)?.rawCsv || "";
}
function tutorAssignmentRowsKey(id) {
	return `tutor-assignment-imports/${id}.rows.json`;
}
async function readTutorAssignmentIndex() {
	const imports = await taskStore().get(TUTOR_ASSIGNMENT_IMPORTS_KEY, {
		type: "json",
		consistency: "strong"
	});
	return Array.isArray(imports) ? imports.filter((item) => Boolean(item && typeof item === "object")).map(sanitizeTutorAssignmentImport).sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt)) : [];
}
async function readTutorAssignmentImportSummaries() {
	return (await readTutorAssignmentIndex()).map((item) => ({
		...item,
		rows: []
	}));
}
async function readTutorAssignmentImportById(id) {
	const cleanedId = cleanText(id);
	if (!cleanedId) return null;
	try {
		const store = taskStore();
		const selected = (await readTutorAssignmentIndex()).find((item) => item.id === cleanedId);
		if (!selected) return null;
		if (selected.rows.length) return selected;
		const rows = await store.get(tutorAssignmentRowsKey(selected.id), {
			type: "json",
			consistency: "strong"
		});
		return {
			...selected,
			rows: Array.isArray(rows) ? rows.filter((row) => Boolean(row && typeof row === "object")).map(sanitizeTutorAssignmentRow).filter((row) => row.tutorId && row.date && row.timeSlot) : []
		};
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		return (memory.__petitSuiviTutorAssignmentImports ?? []).find((item) => item.id === cleanedId) ?? null;
	}
}
async function readTutorAssignmentImports() {
	try {
		const store = taskStore();
		const imports = await readTutorAssignmentIndex();
		return (await Promise.all(imports.map(async (item) => {
			if (item.rows.length) return item;
			const rows = await store.get(tutorAssignmentRowsKey(item.id), {
				type: "json",
				consistency: "strong"
			});
			return {
				...item,
				rows: Array.isArray(rows) ? rows.filter((row) => Boolean(row && typeof row === "object")).map(sanitizeTutorAssignmentRow).filter((row) => row.tutorId && row.date && row.timeSlot) : []
			};
		}))).sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt));
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		return memory.__petitSuiviTutorAssignmentImports ?? [];
	}
}
async function readLatestTutorAssignmentImport() {
	try {
		const store = taskStore();
		const latest = (await readTutorAssignmentIndex())[0];
		if (!latest) return null;
		if (latest.rows.length) return latest;
		const rows = await store.get(tutorAssignmentRowsKey(latest.id), {
			type: "json",
			consistency: "strong"
		});
		return {
			...latest,
			rows: Array.isArray(rows) ? rows.filter((row) => Boolean(row && typeof row === "object")).map(sanitizeTutorAssignmentRow).filter((row) => row.tutorId && row.date && row.timeSlot) : []
		};
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		return (memory.__petitSuiviTutorAssignmentImports ?? [])[0] ?? null;
	}
}
async function createTutorAssignmentImportFromCsv(input) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const parsed = parseTutorAssignmentCsv(input.rawCsv);
	if (!parsed.rows.length) throw new Error("Aucune séance affectée valide dans ce CSV");
	const nextImport = sanitizeTutorAssignmentImport({
		id: crypto.randomUUID(),
		importedAt: now,
		displayName: input.fileName.replace(/\.[^.]+$/, "") || "Séances affectées",
		fileName: input.fileName || "seances-affectees.csv",
		sourceRowCount: parsed.sourceRowCount,
		rows: parsed.rows,
		createdAt: now
	});
	try {
		const store = taskStore();
		await store.setJSON(tutorAssignmentRowsKey(nextImport.id), nextImport.rows);
		const existing = await readTutorAssignmentIndex();
		await store.setJSON(TUTOR_ASSIGNMENT_IMPORTS_KEY, [{
			...nextImport,
			rows: []
		}, ...existing.filter((item) => item.id !== nextImport.id).map((item) => ({
			...item,
			rows: []
		}))]);
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		memory.__petitSuiviTutorAssignmentImports = [nextImport, ...memory.__petitSuiviTutorAssignmentImports ?? []];
	}
	return nextImport;
}
async function updateTutorAssignmentImportName(id, displayName) {
	const store = taskStore();
	const existing = await readTutorAssignmentIndex();
	if (!existing.some((item) => item.id === id)) throw new Error("Import introuvable");
	const cleanedName = cleanText(displayName);
	if (!cleanedName) throw new Error("Le nom de l’import est obligatoire");
	await store.setJSON(TUTOR_ASSIGNMENT_IMPORTS_KEY, existing.map((item) => item.id === id ? {
		...item,
		displayName: cleanedName,
		rows: []
	} : {
		...item,
		rows: []
	}));
}
async function deleteTutorAssignmentImportById(id) {
	await moveFileImportToTrash("assignments", id);
}
function upcomingSessionRowsKey(id) {
	return `upcoming-session-imports/${id}.rows.json`;
}
function upcomingStaffingSessionsKey(id) {
	return `upcoming-session-imports/${id}.staffing.json`;
}
async function readUpcomingSessionIndex() {
	const imports = await taskStore().get(UPCOMING_SESSION_IMPORTS_KEY, {
		type: "json",
		consistency: "strong"
	});
	return Array.isArray(imports) ? imports.filter((item) => Boolean(item && typeof item === "object")).map(sanitizeUpcomingSessionImport).sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt)) : [];
}
async function readUpcomingSessionImportSummaries() {
	try {
		return (await readUpcomingSessionIndex()).map((item) => ({
			...item,
			rows: [],
			staffingSessions: []
		}));
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		return (memory.__petitSuiviUpcomingSessionImports ?? []).map((item) => ({
			...item,
			rows: [],
			staffingSessions: []
		}));
	}
}
async function readUpcomingSessionImports() {
	try {
		const store = taskStore();
		const imports = await readUpcomingSessionIndex();
		return (await Promise.all(imports.map(async (item) => {
			if (item.rows.length && item.staffingSessions.length) return item;
			const [rows, staffingSessions] = await Promise.all([store.get(upcomingSessionRowsKey(item.id), {
				type: "json",
				consistency: "strong"
			}), store.get(upcomingStaffingSessionsKey(item.id), {
				type: "json",
				consistency: "strong"
			})]);
			return {
				...item,
				rows: Array.isArray(rows) ? rows.filter((row) => Boolean(row && typeof row === "object")).map(sanitizeUpcomingSessionRow).filter((row) => row.sessionId && row.date && row.school) : [],
				staffingSessions: Array.isArray(staffingSessions) ? staffingSessions.filter((row) => Boolean(row && typeof row === "object")).map(sanitizeUpcomingStaffingSession).filter((row) => row.sessionId && row.date && row.school) : []
			};
		}))).sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt));
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		return memory.__petitSuiviUpcomingSessionImports ?? [];
	}
}
async function readUpcomingSessionImportById(id) {
	const cleanedId = cleanText(id);
	if (!cleanedId) return null;
	try {
		const store = taskStore();
		const selected = (await readUpcomingSessionIndex()).find((item) => item.id === cleanedId);
		if (!selected) return null;
		if (selected.rows.length && selected.staffingSessions.length) return selected;
		const [rows, staffingSessions] = await Promise.all([store.get(upcomingSessionRowsKey(selected.id), {
			type: "json",
			consistency: "strong"
		}), store.get(upcomingStaffingSessionsKey(selected.id), {
			type: "json",
			consistency: "strong"
		})]);
		return {
			...selected,
			rows: Array.isArray(rows) ? rows.filter((row) => Boolean(row && typeof row === "object")).map(sanitizeUpcomingSessionRow).filter((row) => row.sessionId && row.date && row.school) : [],
			staffingSessions: Array.isArray(staffingSessions) ? staffingSessions.filter((row) => Boolean(row && typeof row === "object")).map(sanitizeUpcomingStaffingSession).filter((row) => row.sessionId && row.date && row.school) : []
		};
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		return (memory.__petitSuiviUpcomingSessionImports ?? []).find((item) => item.id === cleanedId) ?? null;
	}
}
async function createUpcomingSessionImportFromCsv(input) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const parsed = parseUpcomingSessionsCsv(input.rawCsv);
	if (!parsed.rows.length && !parsed.schools.length) throw new Error("Aucune séance ni aucun établissement valide trouvé dans ce CSV");
	const nextImport = sanitizeUpcomingSessionImport({
		id: crypto.randomUUID(),
		importedAt: now,
		displayName: input.fileName.replace(/\.[^.]+$/, "") || "Séances à venir",
		fileName: input.fileName || "semaines-a-venir.csv",
		sourceRowCount: parsed.sourceRowCount,
		sourceSessionCount: parsed.sourceSessionCount,
		schools: parsed.schools,
		schoolStaffing: parsed.schoolStaffing,
		staffingSessions: parsed.staffingSessions,
		rows: parsed.rows,
		createdAt: now
	});
	try {
		const store = taskStore();
		await Promise.all([store.setJSON(upcomingSessionRowsKey(nextImport.id), nextImport.rows), store.setJSON(upcomingStaffingSessionsKey(nextImport.id), nextImport.staffingSessions)]);
		const existing = await readUpcomingSessionIndex();
		await store.setJSON(UPCOMING_SESSION_IMPORTS_KEY, [{
			...nextImport,
			rows: [],
			staffingSessions: []
		}, ...existing.filter((item) => item.id !== nextImport.id).map((item) => ({
			...item,
			rows: [],
			staffingSessions: []
		}))]);
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		memory.__petitSuiviUpcomingSessionImports = [nextImport, ...memory.__petitSuiviUpcomingSessionImports ?? []];
	}
	return nextImport;
}
async function updateUpcomingSessionImportName(id, displayName) {
	const store = taskStore();
	const existing = await readUpcomingSessionIndex();
	if (!existing.some((item) => item.id === id)) throw new Error("Import introuvable");
	const cleanedName = cleanText(displayName);
	if (!cleanedName) throw new Error("Le nom de l’import est obligatoire");
	await store.setJSON(UPCOMING_SESSION_IMPORTS_KEY, existing.map((item) => item.id === id ? {
		...item,
		displayName: cleanedName,
		rows: [],
		staffingSessions: []
	} : {
		...item,
		rows: [],
		staffingSessions: []
	}));
}
async function deleteUpcomingSessionImportById(id) {
	await moveFileImportToTrash("upcomingSessions", id);
}
async function readActualSessionImports() {
	try {
		const imports = await taskStore().get(ACTUAL_SESSION_IMPORTS_KEY, {
			type: "json",
			consistency: "strong"
		});
		return Array.isArray(imports) ? imports.filter((item) => Boolean(item && typeof item === "object")).map(sanitizeActualSessionImport).sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt)) : [];
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		return memory.__petitSuiviActualSessionImports ?? [];
	}
}
async function readActualSessionImportSummaries() {
	return (await readActualSessionImports()).map((item) => ({
		...item,
		rows: []
	}));
}
async function createActualSessionImportFromCsv(input) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const parsed = parseActualSessionsCsv(input.rawCsv);
	if (!parsed.rows.length) throw new Error("Aucun ID valide trouvé dans la colonne Semaine réelle");
	const nextImport = sanitizeActualSessionImport({
		id: crypto.randomUUID(),
		importedAt: now,
		displayName: input.fileName.replace(/\.[^.]+$/, "") || "Semaine réelle",
		fileName: input.fileName || "semaine-reelle.csv",
		sourceRowCount: parsed.sourceRowCount,
		rows: parsed.rows,
		createdAt: now
	});
	try {
		const store = taskStore();
		const existing = await readActualSessionImports();
		await store.setJSON(ACTUAL_SESSION_IMPORTS_KEY, [nextImport, ...existing.filter((item) => item.id !== nextImport.id)]);
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		memory.__petitSuiviActualSessionImports = [nextImport, ...memory.__petitSuiviActualSessionImports ?? []];
	}
	return nextImport;
}
async function updateActualSessionImportName(id, displayName) {
	const existing = await readActualSessionImports();
	if (!existing.some((item) => item.id === id)) throw new Error("Import introuvable");
	const cleanedName = cleanText(displayName);
	if (!cleanedName) throw new Error("Le nom de l’import est obligatoire");
	await taskStore().setJSON(ACTUAL_SESSION_IMPORTS_KEY, existing.map((item) => item.id === id ? {
		...item,
		displayName: cleanedName
	} : item));
}
async function deleteActualSessionImportById(id) {
	const existing = await readActualSessionImports();
	await taskStore().setJSON(ACTUAL_SESSION_IMPORTS_KEY, existing.filter((item) => item.id !== id));
}
async function readStaffingAudits() {
	try {
		const data = await taskStore().get(STAFFING_AUDITS_KEY, {
			type: "json",
			consistency: "strong"
		});
		return Array.isArray(data) ? data.filter((item) => Boolean(item && typeof item === "object")).map(sanitizeStaffingAuditDay).filter((item) => item.date).sort((a, b) => b.date.localeCompare(a.date)) : [];
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		return memory.__petitSuiviStaffingAudits ?? [];
	}
}
async function writeStaffingAudits(days) {
	const normalizedDays = days.map((day) => sanitizeStaffingAuditDay(day)).filter((day) => day.date).sort((a, b) => b.date.localeCompare(a.date));
	try {
		await taskStore().setJSON(STAFFING_AUDITS_KEY, normalizedDays);
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		memory.__petitSuiviStaffingAudits = normalizedDays;
	}
}
async function saveStaffingAudit(day, overwrite) {
	const prepared = sanitizeStaffingAuditDay(day);
	if (!prepared.date || !prepared.sessions.length) throw new Error("Journée de staffing invalide");
	const existing = await readStaffingAudits();
	const previous = existing.find((item) => item.date === prepared.date);
	if (previous && !overwrite) return {
		conflict: true,
		days: existing
	};
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const saved = {
		...prepared,
		createdAt: previous?.createdAt || now,
		updatedAt: now
	};
	const next = [saved, ...existing.filter((item) => item.date !== saved.date)].sort((a, b) => b.date.localeCompare(a.date));
	try {
		await taskStore().setJSON(STAFFING_AUDITS_KEY, next);
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		memory.__petitSuiviStaffingAudits = next;
	}
	return {
		conflict: false,
		day: saved,
		days: next
	};
}
async function updateStaffingAuditSession(input) {
	const day = (await readStaffingAudits()).find((item) => item.date === input.date);
	if (!day) throw new Error("Bilan introuvable");
	if (!day.sessions.some((item) => item.sessionId === input.sessionId)) throw new Error("Séance introuvable");
	const sessions = day.sessions.map((session) => session.sessionId === input.sessionId ? {
		...session,
		portfolioOwner: input.portfolioOwner === void 0 ? session.portfolioOwner : isStaffingAuditOwner(input.portfolioOwner) ? input.portfolioOwner : session.portfolioOwner,
		resolution: input.resolution === void 0 ? session.resolution : isStaffingAuditResolution(input.resolution) ? input.resolution : session.resolution,
		treated: input.treated === void 0 ? session.treated : input.treated === true
	} : session);
	return saveStaffingAudit({
		...day,
		sessions,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	}, true);
}
function tutorInterestRowsKey(id) {
	return `tutor-interest-imports/${id}.rows.json`;
}
async function readTutorInterestIndex() {
	const imports = await taskStore().get(TUTOR_INTEREST_IMPORTS_KEY, {
		type: "json",
		consistency: "strong"
	});
	return Array.isArray(imports) ? imports.filter((item) => Boolean(item && typeof item === "object")).map(sanitizeTutorInterestImport).sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt)) : [];
}
async function readTutorInterestImportSummaries() {
	try {
		return (await readTutorInterestIndex()).map((item) => ({
			...item,
			rows: []
		}));
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		return (memory.__petitSuiviTutorInterestImports ?? []).map((item) => ({
			...item,
			rows: []
		}));
	}
}
async function readTutorInterestImportById(id) {
	const cleanedId = cleanText(id);
	if (!cleanedId) return null;
	try {
		const store = taskStore();
		const selected = (await readTutorInterestIndex()).find((item) => item.id === cleanedId);
		if (!selected) return null;
		if (selected.rows.length) return selected;
		const rows = await store.get(tutorInterestRowsKey(selected.id), {
			type: "json",
			consistency: "strong"
		});
		return {
			...selected,
			rows: Array.isArray(rows) ? rows.filter((row) => Boolean(row && typeof row === "object")).map(sanitizeTutorInterestRow).filter((row) => row.personId && row.sessionId && row.date) : []
		};
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		return (memory.__petitSuiviTutorInterestImports ?? []).find((item) => item.id === cleanedId) ?? null;
	}
}
async function readTutorInterestImports() {
	try {
		const store = taskStore();
		const imports = await readTutorInterestIndex();
		return (await Promise.all(imports.map(async (item) => {
			if (item.rows.length) return item;
			const rows = await store.get(tutorInterestRowsKey(item.id), {
				type: "json",
				consistency: "strong"
			});
			return {
				...item,
				rows: Array.isArray(rows) ? rows.filter((row) => Boolean(row && typeof row === "object")).map(sanitizeTutorInterestRow).filter((row) => row.personId && row.sessionId && row.date) : []
			};
		}))).sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt));
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		return memory.__petitSuiviTutorInterestImports ?? [];
	}
}
async function createTutorInterestImportFromCsv(input) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const parsed = parseTutorInterestsCsv(input.rawCsv);
	if (!parsed.rows.length) throw new Error("Aucune déclaration d’intérêt valide dans ce CSV");
	const nextImport = sanitizeTutorInterestImport({
		id: crypto.randomUUID(),
		importedAt: now,
		displayName: input.fileName.replace(/\.[^.]+$/, "") || "Intérêts tuteurs et candidats",
		fileName: input.fileName || "interets-tuteurs-candidats.csv",
		sourceRowCount: parsed.sourceRowCount,
		rows: parsed.rows,
		createdAt: now
	});
	try {
		const store = taskStore();
		await store.setJSON(tutorInterestRowsKey(nextImport.id), nextImport.rows);
		const existing = await readTutorInterestIndex();
		await store.setJSON(TUTOR_INTEREST_IMPORTS_KEY, [{
			...nextImport,
			rows: []
		}, ...existing.filter((item) => item.id !== nextImport.id).map((item) => ({
			...item,
			rows: []
		}))]);
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		memory.__petitSuiviTutorInterestImports = [nextImport, ...memory.__petitSuiviTutorInterestImports ?? []];
	}
	return nextImport;
}
async function updateTutorInterestImportName(id, displayName) {
	const store = taskStore();
	const existing = await readTutorInterestIndex();
	if (!existing.some((item) => item.id === id)) throw new Error("Import introuvable");
	const cleanedName = cleanText(displayName);
	if (!cleanedName) throw new Error("Le nom de l’import est obligatoire");
	await store.setJSON(TUTOR_INTEREST_IMPORTS_KEY, existing.map((item) => item.id === id ? {
		...item,
		displayName: cleanedName,
		rows: []
	} : {
		...item,
		rows: []
	}));
}
async function deleteTutorInterestImportById(id) {
	await moveFileImportToTrash("interests", id);
}
async function readTutorCoverageNotes() {
	try {
		const notes = await taskStore().get(TUTOR_COVERAGE_NOTES_KEY, {
			type: "json",
			consistency: "strong"
		});
		return Array.isArray(notes) ? notes.filter((item) => Boolean(item && typeof item === "object")).map(sanitizeTutorCoverageNote).filter((item) => item.tutorId && item.date) : [];
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		return memory.__petitSuiviTutorCoverageNotes ?? [];
	}
}
async function upsertTutorCoverageNote(input) {
	const nextNote = sanitizeTutorCoverageNote({
		...input,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	});
	if (!nextNote.tutorId || !nextNote.date) throw new Error("Tuteur ou date manquant");
	const nextNotes = [nextNote, ...(await readTutorCoverageNotes()).filter((item) => !(item.tutorId === nextNote.tutorId && item.date === nextNote.date))];
	try {
		await taskStore().setJSON(TUTOR_COVERAGE_NOTES_KEY, nextNotes);
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		memory.__petitSuiviTutorCoverageNotes = nextNotes;
	}
	return nextNote;
}
function enrollmentRowsKey(id) {
	return `enrollment-imports/${id}.rows.json`;
}
async function readEnrollmentIndex() {
	const imports = await taskStore().get(ENROLLMENT_IMPORTS_KEY, {
		type: "json",
		consistency: "strong"
	});
	return Array.isArray(imports) ? imports.filter((item) => Boolean(item && typeof item === "object")).map(sanitizeEnrollmentImport).sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt)) : [];
}
async function readEnrollmentImportSummaries() {
	return (await readEnrollmentIndex()).map((item) => ({
		...item,
		rows: []
	}));
}
async function readEnrollmentImportById(id) {
	const cleanedId = cleanText(id);
	if (!cleanedId) return null;
	try {
		const store = taskStore();
		const selected = (await readEnrollmentIndex()).find((item) => item.id === cleanedId);
		if (!selected) return null;
		if (selected.rows.length) return selected;
		const rows = await store.get(enrollmentRowsKey(selected.id), {
			type: "json",
			consistency: "strong"
		});
		return {
			...selected,
			rows: Array.isArray(rows) ? rows.filter((row) => Boolean(row && typeof row === "object")).map(sanitizeEnrollmentRow).filter((row) => row.studentId && row.slots) : []
		};
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		return (memory.__petitSuiviEnrollmentImports ?? []).find((item) => item.id === cleanedId) ?? null;
	}
}
async function readEnrollmentImports() {
	try {
		const store = taskStore();
		const imports = await readEnrollmentIndex();
		return (await Promise.all(imports.map(async (item) => {
			if (item.rows.length) return item;
			const rows = await store.get(enrollmentRowsKey(item.id), {
				type: "json",
				consistency: "strong"
			});
			return {
				...item,
				rows: Array.isArray(rows) ? rows.filter((row) => Boolean(row && typeof row === "object")).map(sanitizeEnrollmentRow).filter((row) => row.studentId && row.slots) : []
			};
		}))).sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt));
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		return memory.__petitSuiviEnrollmentImports ?? [];
	}
}
async function createEnrollmentImportFromCsv(input) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const parsed = parseEnrollmentCsv(input.rawCsv);
	if (!parsed.rows.length) throw new Error("Aucun élève avec des créneaux dans ce CSV");
	const nextImport = sanitizeEnrollmentImport({
		id: crypto.randomUUID(),
		importedAt: now,
		displayName: input.fileName.replace(/\.[^.]+$/, "") || "Export inscriptions",
		fileName: input.fileName || "parents.csv",
		sourceRowCount: parsed.sourceRowCount,
		rows: parsed.rows,
		createdAt: now
	});
	try {
		const store = taskStore();
		await store.setJSON(enrollmentRowsKey(nextImport.id), nextImport.rows);
		const existing = await readEnrollmentIndex();
		const nextIndex = [{
			...nextImport,
			rows: []
		}, ...existing.filter((item) => item.id !== nextImport.id).map((item) => ({
			...item,
			rows: []
		}))].sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt));
		await store.setJSON(ENROLLMENT_IMPORTS_KEY, nextIndex);
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		memory.__petitSuiviEnrollmentImports = [nextImport, ...memory.__petitSuiviEnrollmentImports ?? []];
	}
	return nextImport;
}
async function updateEnrollmentImportName(id, displayName) {
	const store = taskStore();
	const existing = await readEnrollmentIndex();
	if (!existing.find((item) => item.id === id)) throw new Error("Import introuvable");
	const cleanedName = cleanText(displayName);
	if (!cleanedName) throw new Error("Le nom de l’import est obligatoire");
	await store.setJSON(ENROLLMENT_IMPORTS_KEY, existing.map((item) => item.id === id ? {
		...item,
		displayName: cleanedName,
		rows: []
	} : {
		...item,
		rows: []
	}));
}
async function deleteEnrollmentImportById(id) {
	await moveFileImportToTrash("enrollments", id);
}
function trashPayloadKey(kind, id) {
	return `file-import-trash/${kind}/${id}.json`;
}
function sanitizeTrashedFileImport(raw) {
	const kind = [
		"availability",
		"assignments",
		"interests",
		"upcomingSessions",
		"enrollments",
		"tutors"
	].includes(raw.kind) ? raw.kind : "availability";
	const sourceRowCount = Math.max(0, Math.round(Number(raw.sourceRowCount) || 0));
	return {
		kind,
		id: cleanText(raw.id),
		importedAt: cleanText(raw.importedAt),
		displayName: cleanText(raw.displayName) || cleanText(raw.fileName) || "Import sans nom",
		fileName: cleanText(raw.fileName),
		...sourceRowCount ? { sourceRowCount } : {},
		...cleanText(raw.date) ? { date: cleanText(raw.date) } : {},
		deletedAt: cleanText(raw.deletedAt) || (/* @__PURE__ */ new Date()).toISOString()
	};
}
async function readFileImportTrashPayloads() {
	try {
		const index = await taskStore().get(FILE_IMPORT_TRASH_KEY, {
			type: "json",
			consistency: "strong"
		});
		return (Array.isArray(index) ? index.filter((item) => Boolean(item && typeof item === "object")).map(sanitizeTrashedFileImport).filter((item) => item.id) : []).sort((a, b) => dateValueForSort(b.deletedAt) - dateValueForSort(a.deletedAt));
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		return (memory.__petitSuiviFileImportTrash ?? []).map((item) => item.summary);
	}
}
async function readFileImportTrash() {
	return readFileImportTrashPayloads();
}
async function saveTrashEntry(summary, record) {
	try {
		const store = taskStore();
		const current = await readFileImportTrashPayloads();
		await store.setJSON(trashPayloadKey(summary.kind, summary.id), {
			summary,
			record
		});
		await store.setJSON(FILE_IMPORT_TRASH_KEY, [summary, ...current.filter((item) => !(item.kind === summary.kind && item.id === summary.id))]);
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		memory.__petitSuiviFileImportTrash = [{
			summary,
			record
		}, ...(memory.__petitSuiviFileImportTrash ?? []).filter((item) => !(item.summary.kind === summary.kind && item.summary.id === summary.id))];
	}
}
async function moveFileImportToTrash(kind, id) {
	const cleanedId = cleanText(id);
	if (!cleanedId) throw new Error("Identifiant manquant");
	const store = taskStore();
	let record;
	if (kind === "availability") record = (await readAvailabilityIndex()).find((item) => item.id === cleanedId);
	else if (kind === "assignments") record = (await readTutorAssignmentIndex()).find((item) => item.id === cleanedId);
	else if (kind === "interests") record = (await readTutorInterestIndex()).find((item) => item.id === cleanedId);
	else if (kind === "upcomingSessions") record = (await readUpcomingSessionIndex()).find((item) => item.id === cleanedId);
	else if (kind === "enrollments") record = (await readEnrollmentIndex()).find((item) => item.id === cleanedId);
	else record = (await readTutorTracking()).snapshots.find((item) => item.id === cleanedId);
	if (!record) throw new Error("Import introuvable");
	const deletedAt = (/* @__PURE__ */ new Date()).toISOString();
	const summary = sanitizeTrashedFileImport({
		kind,
		id: record.id,
		importedAt: "date" in record ? record.updatedAt || record.createdAt || record.date : record.importedAt,
		displayName: record.displayName,
		fileName: record.fileName,
		sourceRowCount: "sourceRowCount" in record ? record.sourceRowCount : void 0,
		date: "date" in record ? record.date : "",
		deletedAt
	});
	await saveTrashEntry(summary, record);
	if (kind === "availability") {
		const existing = await readAvailabilityIndex();
		await store.setJSON(AVAILABILITY_IMPORTS_KEY, existing.filter((item) => item.id !== cleanedId).map((item) => ({
			...item,
			rows: [],
			rawCsv: ""
		})));
	} else if (kind === "assignments") {
		const existing = await readTutorAssignmentIndex();
		await store.setJSON(TUTOR_ASSIGNMENT_IMPORTS_KEY, existing.filter((item) => item.id !== cleanedId).map((item) => ({
			...item,
			rows: []
		})));
	} else if (kind === "interests") {
		const existing = await readTutorInterestIndex();
		await store.setJSON(TUTOR_INTEREST_IMPORTS_KEY, existing.filter((item) => item.id !== cleanedId).map((item) => ({
			...item,
			rows: []
		})));
	} else if (kind === "upcomingSessions") {
		const existing = await readUpcomingSessionIndex();
		await store.setJSON(UPCOMING_SESSION_IMPORTS_KEY, existing.filter((item) => item.id !== cleanedId).map((item) => ({
			...item,
			rows: [],
			staffingSessions: []
		})));
	} else if (kind === "enrollments") {
		const existing = await readEnrollmentIndex();
		await store.setJSON(ENROLLMENT_IMPORTS_KEY, existing.filter((item) => item.id !== cleanedId).map((item) => ({
			...item,
			rows: []
		})));
	} else {
		const tracking = await readTutorTracking();
		await writeTutorTracking({
			...tracking,
			snapshots: tracking.snapshots.filter((item) => item.id !== cleanedId)
		});
	}
	return summary;
}
async function restoreFileImportFromTrash(kind, id) {
	const cleanedId = cleanText(id);
	if (!cleanedId) throw new Error("Identifiant manquant");
	let summary;
	let record;
	try {
		const payload = await taskStore().get(trashPayloadKey(kind, cleanedId), {
			type: "json",
			consistency: "strong"
		});
		if (payload && typeof payload === "object") {
			const rawPayload = payload;
			summary = rawPayload.summary && typeof rawPayload.summary === "object" ? sanitizeTrashedFileImport(rawPayload.summary) : void 0;
			record = rawPayload.record;
		}
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		const payload = (memory.__petitSuiviFileImportTrash ?? []).find((item) => item.summary.kind === kind && item.summary.id === cleanedId);
		summary = payload?.summary;
		record = payload?.record;
	}
	if (!summary || !record || typeof record !== "object") throw new Error("Fichier introuvable dans la corbeille");
	const store = taskStore();
	if (kind === "availability") {
		const restored = sanitizeAvailabilityImport(record);
		const existing = await readAvailabilityIndex();
		if (restored.rows.length) await store.setJSON(availabilityRowsKey(restored.id), restored.rows);
		if (restored.rawCsv) await store.set(availabilityRawKey(restored.id), restored.rawCsv);
		await store.setJSON(AVAILABILITY_IMPORTS_KEY, [restored, ...existing.filter((item) => item.id !== cleanedId)].map((item) => ({
			...item,
			rows: [],
			rawCsv: ""
		})).sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt)));
	} else if (kind === "assignments") {
		const restored = sanitizeTutorAssignmentImport(record);
		const existing = await readTutorAssignmentIndex();
		if (restored.rows.length) await store.setJSON(tutorAssignmentRowsKey(restored.id), restored.rows);
		await store.setJSON(TUTOR_ASSIGNMENT_IMPORTS_KEY, [restored, ...existing.filter((item) => item.id !== cleanedId)].map((item) => ({
			...item,
			rows: []
		})).sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt)));
	} else if (kind === "interests") {
		const restored = sanitizeTutorInterestImport(record);
		const existing = await readTutorInterestIndex();
		if (restored.rows.length) await store.setJSON(tutorInterestRowsKey(restored.id), restored.rows);
		await store.setJSON(TUTOR_INTEREST_IMPORTS_KEY, [restored, ...existing.filter((item) => item.id !== cleanedId)].map((item) => ({
			...item,
			rows: []
		})).sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt)));
	} else if (kind === "upcomingSessions") {
		const restored = sanitizeUpcomingSessionImport(record);
		const existing = await readUpcomingSessionIndex();
		if (restored.rows.length) await store.setJSON(upcomingSessionRowsKey(restored.id), restored.rows);
		if (restored.staffingSessions.length) await store.setJSON(upcomingStaffingSessionsKey(restored.id), restored.staffingSessions);
		await store.setJSON(UPCOMING_SESSION_IMPORTS_KEY, [restored, ...existing.filter((item) => item.id !== cleanedId)].map((item) => ({
			...item,
			rows: [],
			staffingSessions: []
		})).sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt)));
	} else if (kind === "enrollments") {
		const restored = sanitizeEnrollmentImport(record);
		const existing = await readEnrollmentIndex();
		if (restored.rows.length) await store.setJSON(enrollmentRowsKey(restored.id), restored.rows);
		await store.setJSON(ENROLLMENT_IMPORTS_KEY, [restored, ...existing.filter((item) => item.id !== cleanedId)].map((item) => ({
			...item,
			rows: []
		})).sort((a, b) => dateValueForSort(b.importedAt) - dateValueForSort(a.importedAt)));
	} else {
		const restored = sanitizeTutorTrackingSnapshot(record);
		const tracking = await readTutorTracking();
		await writeTutorTracking({
			...tracking,
			snapshots: [restored, ...tracking.snapshots.filter((item) => item.id !== cleanedId)]
		});
	}
	try {
		const current = await readFileImportTrashPayloads();
		await store.setJSON(FILE_IMPORT_TRASH_KEY, current.filter((item) => !(item.kind === kind && item.id === cleanedId)));
		await store.delete(trashPayloadKey(kind, cleanedId));
	} catch (error) {
		if (!canUseMemoryFallback()) throw error;
		memory.__petitSuiviFileImportTrash = (memory.__petitSuiviFileImportTrash ?? []).filter((item) => !(item.summary.kind === kind && item.summary.id === cleanedId));
	}
	return summary;
}
async function readSchoolWatchlist() {
	try {
		const watchlist = await taskStore().get(SCHOOL_WATCHLIST_KEY, {
			type: "json",
			consistency: "strong"
		});
		return Array.isArray(watchlist) ? watchlist.filter((item) => Boolean(item && typeof item === "object")).map(sanitizeSchoolWatchItem).filter((item) => item.schoolId && item.reason).sort((a, b) => dateValueForSort(b.updatedAt || b.createdAt) - dateValueForSort(a.updatedAt || a.createdAt)) : [];
	} catch {
		return memory.__petitSuiviSchoolWatchlist ?? [];
	}
}
async function writeSchoolWatchlist(watchlist) {
	try {
		await taskStore().setJSON(SCHOOL_WATCHLIST_KEY, watchlist);
	} catch {
		memory.__petitSuiviSchoolWatchlist = watchlist;
	}
}
async function readSchools() {
	try {
		const schools = await taskStore().get(SCHOOLS_KEY, {
			type: "json",
			consistency: "strong"
		});
		return mergeImportedSchools(Array.isArray(schools) ? schools.filter((school) => Boolean(school && typeof school === "object")).map(sanitizeSchool).filter((school) => school.name).sort((a, b) => a.name.localeCompare(b.name, "fr")) : []);
	} catch {
		return mergeImportedSchools(memory.__petitSuiviSchools ?? []);
	}
}
async function writeSchools(schools) {
	try {
		await taskStore().setJSON(SCHOOLS_KEY, schools);
	} catch {
		memory.__petitSuiviSchools = schools;
	}
}
async function readStudentHistory() {
	try {
		const history = await taskStore().get(STUDENT_HISTORY_KEY, {
			type: "json",
			consistency: "strong"
		});
		return Array.isArray(history) ? history.filter((year) => Boolean(year && typeof year === "object")).map(sanitizeStudentHistoryYear).sort((a, b) => b.year - a.year) : [];
	} catch {
		return memory.__petitSuiviStudentHistory ?? [];
	}
}
async function writeStudentHistory(history) {
	try {
		await taskStore().setJSON(STUDENT_HISTORY_KEY, history);
	} catch {
		memory.__petitSuiviStudentHistory = history;
	}
}
async function writePeople(people) {
	try {
		await taskStore().setJSON(PEOPLE_KEY, people);
	} catch {
		memory.__petitSuiviPeople = people;
	}
}
function escapeHtml(value) {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;");
}
function formatDuration(hours) {
	if (!hours) return "non renseignee";
	const totalMinutes = Math.round(hours * 60);
	if (totalMinutes < 60) return `${totalMinutes} min`;
	const wholeHours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	return minutes ? `${wholeHours} h ${minutes} min` : `${wholeHours} h`;
}
async function sendEmail(to, subject, html) {
	const apiKey = process.env.RESEND_API_KEY;
	const from = process.env.ASSIGNMENT_FROM_EMAIL;
	if (!apiKey || !from) return {
		sent: false,
		reason: "missing-config"
	};
	const response = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			from,
			to,
			subject,
			html,
			...process.env.ASSIGNMENT_REPLY_TO_EMAIL ? { reply_to: process.env.ASSIGNMENT_REPLY_TO_EMAIL } : {}
		})
	});
	return {
		sent: response.ok,
		reason: response.ok ? "sent" : "send-failed"
	};
}
function taskUrl() {
	return process.env.URL || "";
}
async function notifyAssignment(task, person, openTasks) {
	if (!person.email) return {
		sent: false,
		reason: "missing-email"
	};
	const otherTasks = openTasks.filter((item) => item.status !== "done" && item.id !== task.id && item.assigneeId === person.id);
	const reminders = otherTasks.length ? `<h3>Vos autres taches non terminees</h3><ul>${otherTasks.map((item) => `<li>${escapeHtml(item.title)}</li>`).join("")}</ul>` : "";
	const link = taskUrl() ? `<p><a href="${escapeHtml(taskUrl())}">Ouvrir le suivi des taches</a></p>` : "";
	return sendEmail(person.email, `Nouvelle tache assignee : ${task.title}`, `<h2>${escapeHtml(task.title)}</h2>
     <p>${escapeHtml(task.description || "Aucune description.")}</p>
     <p><strong>Responsable :</strong> ${escapeHtml(task.owner)}</p>
     <p><strong>Duree estimee :</strong> ${escapeHtml(formatDuration(task.estimatedHours))}</p>
     <p><strong>Priorite :</strong> ${escapeHtml(task.priority)}</p>
     ${reminders}
     ${link}`);
}
async function notifyCompletion(task, people) {
	const link = taskUrl() ? `<p><a href="${escapeHtml(taskUrl())}">Ouvrir le suivi des taches</a></p>` : "";
	const html = `<h1>La tache est terminee</h1>
    <p>Bonjour,</p>
    <p>La tache suivante vient d'etre marquee comme terminee :</p>
    <h2>${escapeHtml(task.title)}</h2>
    <p>${escapeHtml(task.description || "Aucune description.")}</p>
    <p><strong>Statut :</strong> terminee</p>
    <p><strong>Responsable :</strong> ${escapeHtml(task.owner)}</p>
    <p><strong>Duree estimee :</strong> ${escapeHtml(formatDuration(task.estimatedHours))}</p>
    <p><strong>Periode :</strong> ${escapeHtml(task.endDate || task.startDate)}</p>
    <p><strong>Priorite :</strong> ${escapeHtml(task.priority)}</p>
    ${link}`;
	return await Promise.all(people.map(async (person) => ({
		personId: person.id,
		...await sendEmail(person.email, `La tache est terminee : ${task.title}`, html)
	})));
}
//#endregion
//#region app/api/tasks/[taskId]/notify-completion/route.ts
var route_exports$27 = /* @__PURE__ */ __exportAll({
	POST: () => POST$12,
	dynamic: () => dynamic$26,
	runtime: () => runtime$26
});
var dynamic$26 = "force-dynamic";
var runtime$26 = "nodejs";
function json$26(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function POST$12(request, context) {
	const { taskId } = await context.params;
	try {
		const body = await request.json();
		if (!Array.isArray(body.personIds)) return json$26({ error: "Invalid recipient list" }, 400);
		const requestedIds = body.personIds.filter((id) => typeof id === "string");
		const tasks = await readTasks();
		const taskIndex = tasks.findIndex((task) => task.id === taskId);
		const task = tasks[taskIndex];
		if (!task) return json$26({ error: "Task not found" }, 404);
		if (task.status !== "done") return json$26({ error: "Task is not done" }, 409);
		const people = await readPeople();
		const peopleById = new Map(people.map((person) => [person.id, person]));
		const validPeople = requestedIds.map((id) => peopleById.get(id)).filter((person) => Boolean(person?.active && person.email));
		const notifiedIds = validPeople.map((person) => person.id);
		const ignoredIds = requestedIds.filter((id) => !notifiedIds.includes(id));
		const sentIds = (await notifyCompletion(task, validPeople)).filter((result) => result.sent).map((result) => result.personId);
		const now = (/* @__PURE__ */ new Date()).toISOString();
		tasks[taskIndex] = {
			...task,
			completionNotifications: [...task.completionNotifications, ...sentIds.map((personId) => ({
				personId,
				sentAt: now
			}))]
		};
		await writeTasks(tasks);
		return json$26({
			sent: sentIds.length,
			notifiedIds: sentIds,
			ignoredIds: [...ignoredIds, ...notifiedIds.filter((id) => !sentIds.includes(id))],
			tasks
		});
	} catch {
		return json$26({ error: "Unable to notify completion" }, 500);
	}
}
var Resources = ((React, deps, RemoveDuplicateServerCss, precedence) => {
	return function Resources() {
		return React.createElement(React.Fragment, null, [...deps.css.map((href) => React.createElement("link", {
			key: "css:" + href,
			rel: "stylesheet",
			...precedence ? { precedence } : {},
			href,
			"data-rsc-css-href": href
		})), RemoveDuplicateServerCss && React.createElement(RemoveDuplicateServerCss, { key: "remove-duplicate-css" })]);
	};
})(import_react_react_server.default, assetsManifest.serverResources["app/layout.tsx"], void 0, "vite-rsc/importer-resources");
//#endregion
//#region app/layout.tsx
var layout_exports = /* @__PURE__ */ __exportAll({
	default: () => $$wrap_RootLayout,
	metadata: () => metadata
});
var metadata = {
	title: "Alpha Education — Todo équipes",
	description: "Le suivi partagé des équipes Alpha Education pour organiser les priorités, les objectifs et les tâches de rentrée.",
	icons: {
		icon: "/favicon.svg",
		shortcut: "/favicon.svg"
	}
};
function RootLayout({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("html", {
		lang: "fr",
		children: /* @__PURE__ */ (0, import_jsx_runtime_react_server.jsx)("body", { children })
	});
}
var $$wrap_RootLayout = /* @__PURE__ */ __vite_rsc_wrap_css__(RootLayout, "default");
function __vite_rsc_wrap_css__(value, name) {
	if (typeof value !== "function") return value;
	function __wrapper(props) {
		return import_react_react_server.createElement(import_react_react_server.Fragment, null, import_react_react_server.createElement(Resources), import_react_react_server.createElement(value, props));
	}
	Object.defineProperty(__wrapper, "name", { value: name });
	return __wrapper;
}
//#endregion
//#region app/page.tsx
var page_exports$1 = /* @__PURE__ */ __exportAll({ default: () => page_default$1 });
var page_default$1 = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "6efdf509a785", "default");
//#endregion
//#region app/access/page.tsx
var page_exports = /* @__PURE__ */ __exportAll({ default: () => page_default });
var page_default = /* @__PURE__ */ registerClientReference(() => {
	throw new Error("Unexpectedly client reference export 'default' is called on server");
}, "40c69a55bf09", "default");
//#endregion
//#region app/api/access/route.ts
var route_exports$26 = /* @__PURE__ */ __exportAll({ POST: () => POST$11 });
var ACCESS_CODE = "Alpha_The_Best";
var ACCESS_COOKIE = "alpha_access";
var ACCESS_TOKEN = "alpha-unlocked-v1";
function json$25(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function POST$11(request) {
	try {
		const body = await request.json();
		if ((typeof body.code === "string" ? body.code.trim() : "") !== ACCESS_CODE) return json$25({
			ok: false,
			error: "Code incorrect"
		}, 401);
		const response = json$25({ ok: true });
		response.cookies.set({
			name: ACCESS_COOKIE,
			value: ACCESS_TOKEN,
			httpOnly: true,
			sameSite: "lax",
			secure: true,
			path: "/",
			maxAge: 3600 * 24 * 60
		});
		return response;
	} catch {
		return json$25({
			ok: false,
			error: "Demande invalide"
		}, 400);
	}
}
//#endregion
//#region app/api/actual-session-imports/route.ts
var route_exports$25 = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE$6,
	GET: () => GET$25,
	PATCH: () => PATCH$7,
	POST: () => POST$10,
	dynamic: () => dynamic$25,
	runtime: () => runtime$25
});
var dynamic$25 = "force-dynamic";
var runtime$25 = "nodejs";
function json$24(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$25(request) {
	try {
		return json$24({ imports: new URL(request.url).searchParams.get("summary") === "1" ? await readActualSessionImportSummaries() : await readActualSessionImports() });
	} catch (error) {
		return json$24({
			error: "Impossible de charger les semaines réelles",
			detail: error instanceof Error ? error.message : "Impossible de charger les semaines réelles"
		}, 500);
	}
}
async function POST$10(request) {
	try {
		const url = new URL(request.url);
		const rawCsv = await request.text();
		if (!rawCsv.trim()) return json$24({ error: "Fichier CSV vide" }, 400);
		return json$24({ import: await createActualSessionImportFromCsv({
			fileName: url.searchParams.get("fileName") || "semaine-reelle.csv",
			rawCsv
		}) }, 201);
	} catch (error) {
		return json$24({
			error: "Impossible d’importer la semaine réelle",
			detail: error instanceof Error ? error.message : "Impossible d’importer la semaine réelle"
		}, 500);
	}
}
async function PATCH$7(request) {
	try {
		const body = await request.json();
		if (typeof body.id !== "string" || typeof body.displayName !== "string") return json$24({ error: "Nom invalide" }, 400);
		await updateActualSessionImportName(body.id, body.displayName);
		return json$24({ imports: await readActualSessionImportSummaries() });
	} catch (error) {
		return json$24({
			error: "Impossible de renommer l’import",
			detail: error instanceof Error ? error.message : "Impossible de renommer l’import"
		}, 500);
	}
}
async function DELETE$6(request) {
	try {
		const id = new URL(request.url).searchParams.get("id");
		if (!id) return json$24({ error: "Identifiant manquant" }, 400);
		await deleteActualSessionImportById(id);
		return json$24({ imports: await readActualSessionImportSummaries() });
	} catch (error) {
		return json$24({
			error: "Impossible de supprimer l’import",
			detail: error instanceof Error ? error.message : "Impossible de supprimer l’import"
		}, 500);
	}
}
//#endregion
//#region app/api/availability-imports/route.ts
var route_exports$24 = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE$5,
	GET: () => GET$24,
	PATCH: () => PATCH$6,
	POST: () => POST$9,
	PUT: () => PUT$16,
	dynamic: () => dynamic$24,
	runtime: () => runtime$24
});
var dynamic$24 = "force-dynamic";
var runtime$24 = "nodejs";
function json$23(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$24(request) {
	try {
		const url = new URL(request.url);
		const rawImportId = url.searchParams.get("id");
		if (rawImportId && url.searchParams.get("raw") === "1") {
			const rawCsv = await readAvailabilityRawCsv(rawImportId);
			if (!rawCsv) return json$23({ error: "Raw CSV not found" }, 404);
			return new NextResponse(rawCsv, {
				status: 200,
				headers: {
					"Cache-Control": "no-store",
					"Content-Type": "text/csv; charset=utf-8"
				}
			});
		}
		if (rawImportId) {
			const selectedImport = await readAvailabilityImportById(rawImportId);
			return selectedImport ? json$23({ import: selectedImport }) : json$23({ error: "Import introuvable" }, 404);
		}
		if (url.searchParams.get("summary") === "1") return json$23({ imports: await readAvailabilityImportSummaries() });
		return json$23({ imports: await readAvailabilityImports() });
	} catch (error) {
		return json$23({
			error: "Unable to load availability imports",
			detail: error instanceof Error ? error.message : "Unable to load availability imports"
		}, 500);
	}
}
async function POST$9(request) {
	try {
		const body = await request.json();
		if (typeof body.rawCsv !== "string" || !body.rawCsv.trim()) return json$23({ error: "Invalid CSV" }, 400);
		return json$23({
			import: await createAvailabilityImportFromCsv({
				fileName: typeof body.fileName === "string" ? body.fileName : "disponibilites.csv",
				rawCsv: body.rawCsv
			}),
			imports: await readAvailabilityImportSummaries()
		}, 201);
	} catch (error) {
		return json$23({
			error: "Unable to import availability CSV",
			detail: error instanceof Error ? error.message : "Unable to import availability CSV"
		}, 500);
	}
}
async function PUT$16(request) {
	try {
		const body = await request.json();
		if (!Array.isArray(body.imports)) return json$23({ error: "Invalid availability imports" }, 400);
		await writeAvailabilityImports(body.imports.filter((item) => Boolean(item && typeof item === "object")).map(sanitizeAvailabilityImport).sort((a, b) => new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime()));
		return json$23({ imports: await readAvailabilityImports() });
	} catch (error) {
		return json$23({
			error: "Unable to save availability imports",
			detail: error instanceof Error ? error.message : "Unable to save availability imports"
		}, 500);
	}
}
async function PATCH$6(request) {
	try {
		const body = await request.json();
		if (typeof body.id !== "string" || typeof body.displayName !== "string") return json$23({ error: "Invalid import name" }, 400);
		await updateAvailabilityImportName(body.id, body.displayName);
		return json$23({ imports: await readAvailabilityImportSummaries() });
	} catch (error) {
		return json$23({
			error: "Unable to rename availability import",
			detail: error instanceof Error ? error.message : "Unable to rename availability import"
		}, 500);
	}
}
async function DELETE$5(request) {
	try {
		const id = new URL(request.url).searchParams.get("id");
		if (!id) return json$23({ error: "Missing import id" }, 400);
		await deleteAvailabilityImportById(id);
		return json$23({ imports: await readAvailabilityImportSummaries() });
	} catch (error) {
		return json$23({
			error: "Unable to delete availability import",
			detail: error instanceof Error ? error.message : "Unable to delete availability import"
		}, 500);
	}
}
//#endregion
//#region app/api/dashboard/route.ts
var route_exports$23 = /* @__PURE__ */ __exportAll({
	GET: () => GET$23,
	dynamic: () => dynamic$23,
	runtime: () => runtime$23
});
var dynamic$23 = "force-dynamic";
var runtime$23 = "nodejs";
async function GET$23() {
	try {
		const [schools, tasks, links, journalPosts, communications, staffingDays, watchlist, objectives, history, availabilityImports] = await Promise.all([
			readSchools(),
			readTasks(),
			readLinks(),
			readJournalPosts(),
			readMassCommunications(),
			readStaffingSessions(),
			readSchoolWatchlist(),
			readObjectives(),
			readStudentHistory(),
			readAvailabilityImportSummaries()
		]);
		const latestStaffingDay = staffingDays.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
		const latestUnstaffed = latestStaffingDay ? latestStaffingDay.totalUnstaffedSessions ?? Object.values(latestStaffingDay.people).reduce((sum, person) => sum + person.unstaffedSessions, 0) : 0;
		return NextResponse.json({
			objectives: objectives.filter((objective) => objective.kind === "counter"),
			counts: {
				tasks: tasks.filter((task) => task.status !== "done").length,
				links: links.length,
				watchlist: watchlist.filter((item) => item.status === "active").length,
				schools: schools.length,
				communications: communications.length,
				staffing: latestUnstaffed,
				availability: availabilityImports.length,
				objectives: objectives.filter((objective) => objective.kind === "qualitative").length,
				history: history.length,
				journal: journalPosts.length
			}
		}, { headers: { "Cache-Control": "no-store" } });
	} catch (error) {
		const detail = error instanceof Error ? error.message : "Dashboard indisponible";
		return NextResponse.json({
			error: "Dashboard indisponible",
			detail
		}, {
			status: 500,
			headers: { "Cache-Control": "no-store" }
		});
	}
}
//#endregion
//#region app/api/enrollment-imports/route.ts
var route_exports$22 = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE$4,
	GET: () => GET$22,
	PATCH: () => PATCH$5,
	POST: () => POST$8,
	dynamic: () => dynamic$22,
	runtime: () => runtime$22
});
var dynamic$22 = "force-dynamic";
var runtime$22 = "nodejs";
function json$22(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$22(request) {
	try {
		const searchParams = new URL(request.url).searchParams;
		const id = searchParams.get("id");
		if (id) {
			const selectedImport = await readEnrollmentImportById(id);
			return selectedImport ? json$22({ import: selectedImport }) : json$22({ error: "Import introuvable" }, 404);
		}
		if (searchParams.get("summary") === "1") return json$22({ imports: await readEnrollmentImportSummaries() });
		return json$22({ imports: await readEnrollmentImports() });
	} catch (error) {
		return json$22({
			error: "Impossible de charger les imports",
			detail: error instanceof Error ? error.message : "Impossible de charger les imports"
		}, 500);
	}
}
async function POST$8(request) {
	try {
		const url = new URL(request.url);
		const rawCsv = await request.text();
		if (!rawCsv.trim()) return json$22({ error: "Fichier CSV vide" }, 400);
		return json$22({
			import: await createEnrollmentImportFromCsv({
				fileName: url.searchParams.get("fileName") || "parents.csv",
				rawCsv
			}),
			imports: await readEnrollmentImportSummaries()
		}, 201);
	} catch (error) {
		return json$22({
			error: "Impossible d’importer le CSV",
			detail: error instanceof Error ? error.message : "Impossible d’importer le CSV"
		}, 500);
	}
}
async function PATCH$5(request) {
	try {
		const body = await request.json();
		if (typeof body.id !== "string" || typeof body.displayName !== "string") return json$22({ error: "Nom d’import invalide" }, 400);
		await updateEnrollmentImportName(body.id, body.displayName);
		return json$22({ imports: await readEnrollmentImportSummaries() });
	} catch (error) {
		return json$22({
			error: "Impossible de renommer l’import",
			detail: error instanceof Error ? error.message : "Impossible de renommer l’import"
		}, 500);
	}
}
async function DELETE$4(request) {
	try {
		const id = new URL(request.url).searchParams.get("id");
		if (!id) return json$22({ error: "Identifiant manquant" }, 400);
		await deleteEnrollmentImportById(id);
		return json$22({ imports: await readEnrollmentImportSummaries() });
	} catch (error) {
		return json$22({
			error: "Impossible de supprimer l’import",
			detail: error instanceof Error ? error.message : "Impossible de supprimer l’import"
		}, 500);
	}
}
//#endregion
//#region app/api/file-trash/route.ts
var route_exports$21 = /* @__PURE__ */ __exportAll({
	GET: () => GET$21,
	POST: () => POST$7,
	dynamic: () => dynamic$21,
	runtime: () => runtime$21
});
var dynamic$21 = "force-dynamic";
var runtime$21 = "nodejs";
function json$21(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$21() {
	try {
		return json$21({ imports: await readFileImportTrash() });
	} catch (error) {
		return json$21({
			error: "Corbeille indisponible",
			detail: error instanceof Error ? error.message : "Corbeille indisponible"
		}, 500);
	}
}
async function POST$7(request) {
	try {
		const body = await request.json();
		if (!body.kind || !body.id) return json$21({ error: "Fichier à restaurer invalide" }, 400);
		await restoreFileImportFromTrash(body.kind, body.id);
		return json$21({ imports: await readFileImportTrash() });
	} catch (error) {
		return json$21({
			error: "Restauration impossible",
			detail: error instanceof Error ? error.message : "Restauration impossible"
		}, 500);
	}
}
//#endregion
//#region app/api/journal-posts/route.ts
var route_exports$20 = /* @__PURE__ */ __exportAll({
	GET: () => GET$20,
	PUT: () => PUT$15,
	dynamic: () => dynamic$20,
	runtime: () => runtime$20
});
var dynamic$20 = "force-dynamic";
var runtime$20 = "nodejs";
function json$20(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$20() {
	return json$20({ posts: await readJournalPosts() });
}
async function PUT$15(request) {
	try {
		const body = await request.json();
		if (!Array.isArray(body.posts)) return json$20({ error: "Invalid journal post list" }, 400);
		const posts = body.posts.filter((post) => Boolean(post && typeof post === "object")).map(sanitizeJournalPost).filter((post) => post.title && post.content).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
		await writeJournalPosts(posts);
		return json$20({ posts });
	} catch {
		return json$20({ error: "Unable to save journal posts" }, 500);
	}
}
//#endregion
//#region app/api/links/route.ts
var route_exports$19 = /* @__PURE__ */ __exportAll({
	GET: () => GET$19,
	PUT: () => PUT$14,
	dynamic: () => dynamic$19,
	runtime: () => runtime$19
});
var dynamic$19 = "force-dynamic";
var runtime$19 = "nodejs";
function json$19(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$19() {
	return json$19({ links: await readLinks() });
}
async function PUT$14(request) {
	try {
		const body = await request.json();
		if (!Array.isArray(body.links)) return json$19({ error: "Invalid link list" }, 400);
		const links = body.links.filter((link) => Boolean(link && typeof link === "object")).map(sanitizeSharedLink).filter((link) => link.title && link.url);
		await writeLinks(links);
		return json$19({ links });
	} catch {
		return json$19({ error: "Unable to save links" }, 500);
	}
}
//#endregion
//#region app/api/mass-communications/route.ts
var route_exports$18 = /* @__PURE__ */ __exportAll({
	GET: () => GET$18,
	PUT: () => PUT$13,
	dynamic: () => dynamic$18,
	runtime: () => runtime$18
});
var dynamic$18 = "force-dynamic";
var runtime$18 = "nodejs";
function json$18(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$18() {
	return json$18({ communications: await readMassCommunications() });
}
async function PUT$13(request) {
	try {
		const body = await request.json();
		if (!Array.isArray(body.communications)) return json$18({ error: "Invalid communication list" }, 400);
		const communications = body.communications.filter((communication) => Boolean(communication && typeof communication === "object")).map(sanitizeMassCommunication).filter((communication) => communication.title).sort((a, b) => new Date(b.sentAt || b.followUpDate || b.createdAt).getTime() - new Date(a.sentAt || a.followUpDate || a.createdAt).getTime());
		await writeMassCommunications(communications);
		return json$18({ communications });
	} catch {
		return json$18({ error: "Unable to save communications" }, 500);
	}
}
//#endregion
//#region app/api/objectives/route.ts
var route_exports$17 = /* @__PURE__ */ __exportAll({
	GET: () => GET$17,
	PUT: () => PUT$12,
	dynamic: () => dynamic$17,
	runtime: () => runtime$17
});
var dynamic$17 = "force-dynamic";
var runtime$17 = "nodejs";
function json$17(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$17() {
	return json$17({ objectives: await readObjectives() });
}
async function PUT$12(request) {
	try {
		const body = await request.json();
		if (!Array.isArray(body.objectives)) return json$17({ error: "Invalid objective list" }, 400);
		const objectives = body.objectives.filter((objective) => Boolean(objective && typeof objective === "object")).map(sanitizeObjective).filter((objective) => objective.title);
		await writeObjectives(objectives);
		return json$17({ objectives });
	} catch {
		return json$17({ error: "Unable to save objectives" }, 500);
	}
}
//#endregion
//#region app/api/people/route.ts
var route_exports$16 = /* @__PURE__ */ __exportAll({
	GET: () => GET$16,
	PUT: () => PUT$11,
	dynamic: () => dynamic$16,
	runtime: () => runtime$16
});
var dynamic$16 = "force-dynamic";
var runtime$16 = "nodejs";
function json$16(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$16() {
	return json$16({ people: (await readPeople()).map(publicPerson) });
}
async function PUT$11(request) {
	try {
		const body = await request.json();
		if (!Array.isArray(body.people)) return json$16({ error: "Invalid people list" }, 400);
		const existing = await readPeople();
		const existingById = new Map(existing.map((person) => [person.id, person]));
		const people = body.people.filter((person) => Boolean(person && typeof person === "object")).map((person) => sanitizePerson(person, existingById.get(typeof person.id === "string" ? person.id : ""))).filter((person) => person.name);
		await writePeople(people);
		return json$16({ people: people.map(publicPerson) });
	} catch {
		return json$16({ error: "Unable to save people" }, 500);
	}
}
//#endregion
//#region app/api/recurring-tasks/route.ts
var route_exports$15 = /* @__PURE__ */ __exportAll({
	GET: () => GET$15,
	PUT: () => PUT$10,
	dynamic: () => dynamic$15,
	runtime: () => runtime$15
});
var dynamic$15 = "force-dynamic";
var runtime$15 = "nodejs";
function json$15(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$15() {
	return json$15({ recurringTasks: await readRecurringTasks() });
}
async function PUT$10(request) {
	try {
		const body = await request.json();
		if (!Array.isArray(body.recurringTasks)) return json$15({ error: "Invalid recurring task list" }, 400);
		const recurringTasks = body.recurringTasks.filter((task) => Boolean(task && typeof task === "object")).map(sanitizeRecurringTask).filter((task) => task.title && task.owner);
		await writeRecurringTasks(recurringTasks);
		return json$15({ recurringTasks });
	} catch {
		return json$15({ error: "Unable to save recurring tasks" }, 500);
	}
}
//#endregion
//#region app/api/school-watchlist/route.ts
var route_exports$14 = /* @__PURE__ */ __exportAll({
	GET: () => GET$14,
	PUT: () => PUT$9,
	dynamic: () => dynamic$14,
	runtime: () => runtime$14
});
var dynamic$14 = "force-dynamic";
var runtime$14 = "nodejs";
function json$14(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$14() {
	return json$14({ watchlist: await readSchoolWatchlist() });
}
async function PUT$9(request) {
	try {
		const body = await request.json();
		if (!Array.isArray(body.watchlist)) return json$14({ error: "Invalid school watchlist" }, 400);
		const watchlist = body.watchlist.filter((item) => Boolean(item && typeof item === "object")).map(sanitizeSchoolWatchItem).filter((item) => item.schoolId && item.reason).sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
		await writeSchoolWatchlist(watchlist);
		return json$14({ watchlist });
	} catch {
		return json$14({ error: "Unable to save school watchlist" }, 500);
	}
}
//#endregion
//#region app/api/schools/route.ts
var route_exports$13 = /* @__PURE__ */ __exportAll({
	GET: () => GET$13,
	POST: () => POST$6,
	PUT: () => PUT$8,
	dynamic: () => dynamic$13,
	runtime: () => runtime$13
});
var dynamic$13 = "force-dynamic";
var runtime$13 = "nodejs";
function json$13(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$13() {
	return json$13({ schools: await readSchools() });
}
function inferredSchoolType(categories) {
	const normalized = categories.join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
	const hasAlpha = normalized.includes("alpha") || normalized.includes("etude");
	const hasService = normalized.includes("surveillance") || normalized.includes("prestation") || normalized.includes("service");
	if (hasAlpha && hasService) return "mixed";
	if (hasAlpha) return "alpha";
	if (hasService) return "mise-a-dispo";
	return "mixed";
}
async function POST$6(request) {
	try {
		const body = await request.json();
		if (!Array.isArray(body.schools)) return json$13({ error: "Liste d’établissements invalide" }, 400);
		const existing = await readSchools();
		const knownIds = new Set(existing.map((school) => school.externalId).filter(Boolean));
		const requestIds = /* @__PURE__ */ new Set();
		const skippedIds = [];
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const created = body.schools.flatMap((raw) => {
			if (!raw || typeof raw !== "object") return [];
			const item = raw;
			const externalId = typeof item.externalId === "string" ? item.externalId.trim() : "";
			const name = typeof item.name === "string" ? item.name.trim() : "";
			const categories = Array.isArray(item.categories) ? Array.from(new Set(item.categories.filter((value) => typeof value === "string").map((value) => value.trim()).filter(Boolean))) : [];
			if (!externalId || !name) return [];
			if (knownIds.has(externalId) || requestIds.has(externalId)) {
				skippedIds.push(externalId);
				return [];
			}
			requestIds.add(externalId);
			return [sanitizeSchool({
				id: `school-${externalId}`,
				externalId,
				name,
				category: categories.join(" · "),
				schoolType: inferredSchoolType(categories),
				portfolioOwner: "",
				city: name.split(" - ")[0]?.trim() || "",
				zone: "",
				coordinator: "",
				registeredCount: null,
				address: "",
				department: "",
				upcomingWeek: "",
				pastSessions: "",
				typicalWeek: "",
				contractSigned: "",
				actions: "",
				contact: "",
				nextAction: "",
				notes: "",
				events: [],
				createdAt: now,
				updatedAt: now
			})];
		});
		const schools = [...created, ...existing].sort((a, b) => a.name.localeCompare(b.name, "fr"));
		await writeSchools(schools);
		return json$13({
			schools,
			created,
			skippedIds
		}, 201);
	} catch (error) {
		return json$13({
			error: "Impossible de créer les établissements",
			detail: error instanceof Error ? error.message : "Impossible de créer les établissements"
		}, 500);
	}
}
async function PUT$8(request) {
	try {
		const body = await request.json();
		if (!Array.isArray(body.schools)) return json$13({ error: "Invalid school list" }, 400);
		const schools = body.schools.filter((school) => Boolean(school && typeof school === "object")).map(sanitizeSchool).filter((school) => school.name).sort((a, b) => a.name.localeCompare(b.name, "fr"));
		const usedIds = /* @__PURE__ */ new Set();
		const duplicateId = schools.find((school) => {
			if (!school.externalId) return false;
			if (usedIds.has(school.externalId)) return true;
			usedIds.add(school.externalId);
			return false;
		});
		if (duplicateId) return json$13({ error: `L’ID établissement ${duplicateId.externalId} est déjà utilisé` }, 409);
		await writeSchools(schools);
		return json$13({ schools });
	} catch {
		return json$13({ error: "Unable to save schools" }, 500);
	}
}
//#endregion
//#region app/api/staffing-audits/route.ts
var route_exports$12 = /* @__PURE__ */ __exportAll({
	GET: () => GET$12,
	PATCH: () => PATCH$4,
	POST: () => POST$5,
	PUT: () => PUT$7,
	dynamic: () => dynamic$12,
	runtime: () => runtime$12
});
var dynamic$12 = "force-dynamic";
var runtime$12 = "nodejs";
function json$12(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$12() {
	try {
		const [days, schools, tracking] = await Promise.all([
			readStaffingAudits(),
			readSchools(),
			readTutorTracking()
		]);
		const resolved = resolveStaffingAuditTutorIds(days, tracking.snapshots.flatMap((snapshot) => snapshot.records));
		if (resolved.changed) await writeStaffingAudits(resolved.days);
		return json$12({ days: enrichStaffingAuditDaysWithSchools(resolved.days, schools) });
	} catch (error) {
		return json$12({
			error: "Impossible de charger les bilans staffing",
			detail: error instanceof Error ? error.message : "Impossible de charger les bilans staffing"
		}, 500);
	}
}
async function POST$5(request) {
	try {
		const url = new URL(request.url);
		const rawCsv = await request.text();
		if (!rawCsv.trim()) return json$12({ error: "Fichier CSV vide" }, 400);
		const [schools, tracking] = await Promise.all([readSchools(), readTutorTracking()]);
		const roster = tracking.snapshots.flatMap((snapshot) => snapshot.records);
		const parsed = parseStaffingAuditCsv(rawCsv, url.searchParams.get("fileName") || "rapports.csv", schools, roster);
		if (!parsed.days.length) return json$12({
			error: "Aucune séance exploitable trouvée",
			detail: parsed.invalidDateRowCount ? `${parsed.invalidDateRowCount} ligne(s) possèdent une date vide ou illisible. Formats acceptés : JJ/MM/AAAA, JJ-MM-AAAA ou AAAA-MM-JJ.` : "Vérifiez que les colonnes Date et Semaine réelle contiennent des valeurs."
		}, 400);
		return json$12({
			days: parsed.days,
			invalidDateRowCount: parsed.invalidDateRowCount
		});
	} catch (error) {
		return json$12({
			error: "Impossible d’analyser le fichier",
			detail: error instanceof Error ? error.message : "Impossible d’analyser le fichier"
		}, 400);
	}
}
async function PUT$7(request) {
	try {
		const body = await request.json();
		if (!body.day || typeof body.day !== "object") return json$12({ error: "Journée invalide" }, 400);
		const result = await saveStaffingAudit(body.day, body.overwrite === true);
		const schools = await readSchools();
		const days = enrichStaffingAuditDaysWithSchools(result.days, schools);
		if (result.conflict) return json$12({
			error: "Un bilan existe déjà pour cette date",
			conflict: true,
			days
		}, 409);
		return json$12({
			...result,
			day: result.day ? enrichStaffingAuditDaysWithSchools([result.day], schools)[0] : void 0,
			days
		});
	} catch (error) {
		return json$12({
			error: "Impossible d’enregistrer le bilan",
			detail: error instanceof Error ? error.message : "Impossible d’enregistrer le bilan"
		}, 500);
	}
}
async function PATCH$4(request) {
	try {
		const body = await request.json();
		if (typeof body.date !== "string" || typeof body.sessionId !== "string") return json$12({ error: "Séance invalide" }, 400);
		const result = await updateStaffingAuditSession({
			date: body.date,
			sessionId: body.sessionId,
			portfolioOwner: body.portfolioOwner,
			resolution: body.resolution,
			treated: body.treated
		});
		const schools = await readSchools();
		return json$12({
			...result,
			day: result.day ? enrichStaffingAuditDaysWithSchools([result.day], schools)[0] : void 0,
			days: enrichStaffingAuditDaysWithSchools(result.days, schools)
		});
	} catch (error) {
		return json$12({
			error: "Impossible de modifier la séance",
			detail: error instanceof Error ? error.message : "Impossible de modifier la séance"
		}, 500);
	}
}
//#endregion
//#region app/api/staffing-sessions/route.ts
var route_exports$11 = /* @__PURE__ */ __exportAll({
	GET: () => GET$11,
	PUT: () => PUT$6,
	dynamic: () => dynamic$11,
	runtime: () => runtime$11
});
var dynamic$11 = "force-dynamic";
var runtime$11 = "nodejs";
function json$11(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$11() {
	return json$11({ staffing: await readStaffingSessions() });
}
async function PUT$6(request) {
	try {
		const body = await request.json();
		if (!Array.isArray(body.staffing)) return json$11({ error: "Invalid staffing list" }, 400);
		const daysByDate = /* @__PURE__ */ new Map();
		body.staffing.filter((day) => Boolean(day && typeof day === "object")).map(sanitizeStaffingDay).forEach((day) => {
			daysByDate.set(day.date, day);
		});
		const staffing = Array.from(daysByDate.values()).sort((a, b) => (/* @__PURE__ */ new Date(`${b.date}T12:00:00`)).getTime() - (/* @__PURE__ */ new Date(`${a.date}T12:00:00`)).getTime());
		await writeStaffingSessions(staffing);
		return json$11({ staffing });
	} catch {
		return json$11({ error: "Unable to save staffing sessions" }, 500);
	}
}
//#endregion
//#region app/api/student-history/route.ts
var route_exports$10 = /* @__PURE__ */ __exportAll({
	GET: () => GET$10,
	PUT: () => PUT$5,
	dynamic: () => dynamic$10,
	runtime: () => runtime$10
});
var dynamic$10 = "force-dynamic";
var runtime$10 = "nodejs";
function json$10(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$10() {
	return json$10({ history: await readStudentHistory() });
}
async function PUT$5(request) {
	try {
		const body = await request.json();
		if (!Array.isArray(body.history)) return json$10({ error: "Invalid student history" }, 400);
		const yearsByValue = /* @__PURE__ */ new Map();
		body.history.filter((year) => Boolean(year && typeof year === "object")).map(sanitizeStudentHistoryYear).forEach((year) => yearsByValue.set(year.year, year));
		const history = Array.from(yearsByValue.values()).sort((a, b) => b.year - a.year);
		await writeStudentHistory(history);
		return json$10({ history });
	} catch {
		return json$10({ error: "Unable to save student history" }, 500);
	}
}
//#endregion
//#region app/api/tasks/route.ts
var route_exports$9 = /* @__PURE__ */ __exportAll({
	GET: () => GET$9,
	PUT: () => PUT$4,
	dynamic: () => dynamic$9,
	runtime: () => runtime$9
});
var dynamic$9 = "force-dynamic";
var runtime$9 = "nodejs";
function json$9(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$9() {
	return json$9({ tasks: await readTasks() });
}
async function PUT$4(request) {
	try {
		const body = await request.json();
		if (!Array.isArray(body.tasks)) return json$9({ error: "Invalid task list" }, 400);
		const previousTasks = await readTasks();
		const previousById = new Map(previousTasks.map((task) => [task.id, task]));
		const tasks = body.tasks.filter((task) => Boolean(task && typeof task === "object")).map(sanitizeTask).filter((task) => task.title && task.owner && task.startDate);
		await writeTasks(tasks);
		if (body.sendAssignmentEmail ?? body.notifyAssignments ?? true) {
			const people = await readPeople();
			const peopleById = new Map(people.map((person) => [person.id, person]));
			const assignedTasks = tasks.filter((task) => {
				const previous = previousById.get(task.id);
				return task.assigneeId && task.assigneeId !== previous?.assigneeId;
			});
			await Promise.all(assignedTasks.map((task) => {
				const person = task.assigneeId ? peopleById.get(task.assigneeId) : null;
				return person?.active && person.email ? notifyAssignment(task, person, tasks) : null;
			}));
		}
		return json$9({ tasks });
	} catch {
		return json$9({ error: "Unable to save tasks" }, 500);
	}
}
//#endregion
//#region app/api/tutor-activity/route.ts
var route_exports$8 = /* @__PURE__ */ __exportAll({
	GET: () => GET$8,
	dynamic: () => dynamic$8,
	runtime: () => runtime$8
});
var dynamic$8 = "force-dynamic";
var runtime$8 = "nodejs";
function json$8(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
function dateValue(value) {
	const parsed = Date.parse(value.includes("T") ? value : `${value}T12:00:00`);
	return Number.isFinite(parsed) ? parsed : 0;
}
function uniqueSorted(items, direction) {
	const unique = /* @__PURE__ */ new Map();
	items.forEach((item) => {
		const key = item.sessionId || `${item.date}|${item.timeSlot}|${item.school}`;
		if (!unique.has(key)) unique.set(key, {
			...item,
			key
		});
	});
	return Array.from(unique.values()).sort((a, b) => {
		const difference = dateValue(a.date) - dateValue(b.date);
		return (direction === "asc" ? difference : -difference) || a.timeSlot.localeCompare(b.timeSlot, "fr") || a.school.localeCompare(b.school, "fr");
	});
}
async function GET$8(request) {
	try {
		const requestedIds = (new URL(request.url).searchParams.get("ids") || "").split(",").map((value) => value.trim()).filter(Boolean);
		const tutorIds = Array.from(new Set(requestedIds)).slice(0, 30);
		if (!tutorIds.length) return json$8({ activities: {} });
		const wantedIds = new Set(tutorIds);
		const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		const [availabilitySummaries, interestSummaries, upcomingSummaries, assignmentSummaries] = await Promise.all([
			readAvailabilityImportSummaries(),
			readTutorInterestImportSummaries(),
			readUpcomingSessionImportSummaries(),
			readTutorAssignmentImportSummaries()
		]);
		const [availabilityImport, interestImport, upcomingImport, ...assignmentImports] = await Promise.all([
			availabilitySummaries[0] ? readAvailabilityImportById(availabilitySummaries[0].id) : Promise.resolve(null),
			interestSummaries[0] ? readTutorInterestImportById(interestSummaries[0].id) : Promise.resolve(null),
			upcomingSummaries[0] ? readUpcomingSessionImportById(upcomingSummaries[0].id) : Promise.resolve(null),
			...assignmentSummaries.slice(0, 12).map((summary) => readTutorAssignmentImportById(summary.id))
		]);
		const activities = Object.fromEntries(tutorIds.map((tutorId) => [tutorId, {
			tutorId,
			upcomingSessions: [],
			pastSessions: [],
			availabilities: [],
			interests: []
		}]));
		availabilityImport?.rows.forEach((row) => {
			if (!wantedIds.has(row.tutorId) || !activities[row.tutorId]) return;
			activities[row.tutorId].availabilities.push({
				key: row.sessionId || `${row.date}|${row.timeSlot}|${row.school}`,
				date: row.date,
				timeSlot: row.timeSlot,
				school: row.school,
				category: row.group,
				sessionId: row.sessionId
			});
		});
		interestImport?.rows.forEach((row) => {
			if (!wantedIds.has(row.personId) || !activities[row.personId]) return;
			activities[row.personId].interests.push({
				key: row.sessionId || `${row.date}|${row.timeSlot}|${row.school}`,
				date: row.date,
				timeSlot: row.timeSlot,
				school: row.school,
				category: row.group,
				sessionId: row.sessionId,
				validated: row.validated
			});
		});
		upcomingImport?.staffingSessions.forEach((session) => {
			session.tutors.forEach((tutor) => {
				if (!wantedIds.has(tutor.tutorId) || !activities[tutor.tutorId]) return;
				activities[tutor.tutorId].upcomingSessions.push({
					key: session.sessionId || `${session.date}|${session.startTime}-${session.endTime}|${session.school}`,
					date: session.date,
					timeSlot: [session.startTime, session.endTime].filter(Boolean).join(" → "),
					school: session.school,
					category: session.category,
					sessionId: session.sessionId
				});
			});
		});
		assignmentImports.filter(Boolean).forEach((assignmentImport) => {
			assignmentImport?.rows.forEach((row) => {
				if (!wantedIds.has(row.tutorId) || !activities[row.tutorId]) return;
				const item = {
					key: `${row.date}|${row.timeSlot}|${row.school}`,
					date: row.date,
					timeSlot: row.timeSlot,
					school: row.school,
					category: row.category,
					sessionId: ""
				};
				if (row.date >= today) activities[row.tutorId].upcomingSessions.push(item);
				else activities[row.tutorId].pastSessions.push(item);
			});
		});
		Object.values(activities).forEach((activity) => {
			activity.upcomingSessions = uniqueSorted(activity.upcomingSessions, "asc").filter((item) => item.date >= today).slice(0, 20);
			activity.pastSessions = uniqueSorted(activity.pastSessions, "desc").slice(0, 20);
			activity.availabilities = uniqueSorted(activity.availabilities, "asc").slice(0, 30);
			activity.interests = uniqueSorted(activity.interests, "asc").slice(0, 30);
		});
		return json$8({
			activities,
			sources: {
				availability: availabilityImport?.displayName || "",
				interests: interestImport?.displayName || "",
				upcoming: upcomingImport?.displayName || "",
				assignments: assignmentImports.filter(Boolean).length
			}
		});
	} catch (error) {
		return json$8({
			error: "Impossible de charger l’activité des tuteurs",
			detail: error instanceof Error ? error.message : "Impossible de charger l’activité des tuteurs"
		}, 500);
	}
}
//#endregion
//#region app/api/tutor-assignment-imports/route.ts
var route_exports$7 = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE$3,
	GET: () => GET$7,
	PATCH: () => PATCH$3,
	POST: () => POST$4,
	dynamic: () => dynamic$7,
	runtime: () => runtime$7
});
var dynamic$7 = "force-dynamic";
var runtime$7 = "nodejs";
function json$7(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$7(request) {
	try {
		const searchParams = new URL(request.url).searchParams;
		if (searchParams.get("latest") === "1") return json$7({ import: await readLatestTutorAssignmentImport() });
		const id = searchParams.get("id");
		if (id) {
			const selectedImport = await readTutorAssignmentImportById(id);
			return selectedImport ? json$7({ import: selectedImport }) : json$7({ error: "Import introuvable" }, 404);
		}
		return json$7({ imports: searchParams.get("summary") === "1" ? await readTutorAssignmentImportSummaries() : await readTutorAssignmentImports() });
	} catch (error) {
		return json$7({
			error: "Impossible de charger les séances affectées",
			detail: error instanceof Error ? error.message : "Impossible de charger les séances affectées"
		}, 500);
	}
}
async function POST$4(request) {
	try {
		const url = new URL(request.url);
		const rawCsv = await request.text();
		if (!rawCsv.trim()) return json$7({ error: "Fichier CSV vide" }, 400);
		return json$7({
			import: await createTutorAssignmentImportFromCsv({
				fileName: url.searchParams.get("fileName") || "seances-affectees.csv",
				rawCsv
			}),
			imports: await readTutorAssignmentImportSummaries()
		}, 201);
	} catch (error) {
		return json$7({
			error: "Impossible d’importer les séances affectées",
			detail: error instanceof Error ? error.message : "Impossible d’importer les séances affectées"
		}, 500);
	}
}
async function PATCH$3(request) {
	try {
		const body = await request.json();
		if (typeof body.id !== "string" || typeof body.displayName !== "string") return json$7({ error: "Nom invalide" }, 400);
		await updateTutorAssignmentImportName(body.id, body.displayName);
		return json$7({ imports: await readTutorAssignmentImportSummaries() });
	} catch (error) {
		return json$7({
			error: "Impossible de renommer l’import",
			detail: error instanceof Error ? error.message : "Impossible de renommer l’import"
		}, 500);
	}
}
async function DELETE$3(request) {
	try {
		const id = new URL(request.url).searchParams.get("id");
		if (!id) return json$7({ error: "Identifiant manquant" }, 400);
		await deleteTutorAssignmentImportById(id);
		return json$7({ imports: await readTutorAssignmentImportSummaries() });
	} catch (error) {
		return json$7({
			error: "Impossible de supprimer l’import",
			detail: error instanceof Error ? error.message : "Impossible de supprimer l’import"
		}, 500);
	}
}
//#endregion
//#region app/api/tutor-coverage-notes/route.ts
var route_exports$6 = /* @__PURE__ */ __exportAll({
	GET: () => GET$6,
	POST: () => POST$3,
	dynamic: () => dynamic$6,
	runtime: () => runtime$6
});
var dynamic$6 = "force-dynamic";
var runtime$6 = "nodejs";
function json$6(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$6() {
	try {
		return json$6({ notes: await readTutorCoverageNotes() });
	} catch (error) {
		return json$6({
			error: "Impossible de charger les annotations",
			detail: error instanceof Error ? error.message : "Impossible de charger les annotations"
		}, 500);
	}
}
async function POST$3(request) {
	try {
		return json$6({
			note: await upsertTutorCoverageNote(await request.json()),
			notes: await readTutorCoverageNotes()
		});
	} catch (error) {
		return json$6({
			error: "Impossible de sauvegarder l’annotation",
			detail: error instanceof Error ? error.message : "Impossible de sauvegarder l’annotation"
		}, 500);
	}
}
//#endregion
//#region app/api/tutor-interest-imports/route.ts
var route_exports$5 = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE$2,
	GET: () => GET$5,
	PATCH: () => PATCH$2,
	POST: () => POST$2,
	dynamic: () => dynamic$5,
	runtime: () => runtime$5
});
var dynamic$5 = "force-dynamic";
var runtime$5 = "nodejs";
function json$5(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$5(request) {
	try {
		const searchParams = new URL(request.url).searchParams;
		const id = searchParams.get("id");
		if (id) {
			const selectedImport = await readTutorInterestImportById(id);
			return selectedImport ? json$5({ import: selectedImport }) : json$5({ error: "Import introuvable" }, 404);
		}
		return json$5({ imports: searchParams.get("summary") === "1" ? await readTutorInterestImportSummaries() : await readTutorInterestImports() });
	} catch (error) {
		return json$5({
			error: "Impossible de charger les intérêts",
			detail: error instanceof Error ? error.message : "Impossible de charger les intérêts"
		}, 500);
	}
}
async function POST$2(request) {
	try {
		const url = new URL(request.url);
		const rawCsv = await request.text();
		if (!rawCsv.trim()) return json$5({ error: "Fichier CSV vide" }, 400);
		return json$5({ import: await createTutorInterestImportFromCsv({
			fileName: url.searchParams.get("fileName") || "interets-tuteurs-candidats.csv",
			rawCsv
		}) }, 201);
	} catch (error) {
		return json$5({
			error: "Impossible d’importer les intérêts",
			detail: error instanceof Error ? error.message : "Impossible d’importer les intérêts"
		}, 500);
	}
}
async function PATCH$2(request) {
	try {
		const body = await request.json();
		if (typeof body.id !== "string" || typeof body.displayName !== "string") return json$5({ error: "Nom invalide" }, 400);
		await updateTutorInterestImportName(body.id, body.displayName);
		return json$5({ imports: await readTutorInterestImportSummaries() });
	} catch (error) {
		return json$5({
			error: "Impossible de renommer l’import",
			detail: error instanceof Error ? error.message : "Impossible de renommer l’import"
		}, 500);
	}
}
async function DELETE$2(request) {
	try {
		const id = new URL(request.url).searchParams.get("id");
		if (!id) return json$5({ error: "Identifiant manquant" }, 400);
		await deleteTutorInterestImportById(id);
		return json$5({ imports: await readTutorInterestImportSummaries() });
	} catch (error) {
		return json$5({
			error: "Impossible de supprimer l’import",
			detail: error instanceof Error ? error.message : "Impossible de supprimer l’import"
		}, 500);
	}
}
//#endregion
//#region app/api/tutor-report-comments/route.ts
var route_exports$4 = /* @__PURE__ */ __exportAll({
	GET: () => GET$4,
	PUT: () => PUT$3,
	dynamic: () => dynamic$4,
	runtime: () => runtime$4
});
var dynamic$4 = "force-dynamic";
var runtime$4 = "nodejs";
function json$4(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$4() {
	return json$4({ comments: await readTutorReportComments() });
}
async function PUT$3(request) {
	try {
		const body = await request.json();
		if (!Array.isArray(body.comments)) return json$4({ error: "Invalid tutor report comment list" }, 400);
		const commentsByTutor = /* @__PURE__ */ new Map();
		body.comments.filter((comment) => Boolean(comment && typeof comment === "object")).map(sanitizeTutorReportComment).filter((comment) => comment.tutorId).forEach((comment) => {
			commentsByTutor.set(comment.tutorId, comment);
		});
		const comments = Array.from(commentsByTutor.values()).sort((a, b) => a.tutorId.localeCompare(b.tutorId, "fr"));
		await writeTutorReportComments(comments);
		return json$4({ comments });
	} catch {
		return json$4({ error: "Unable to save tutor report comments" }, 500);
	}
}
//#endregion
//#region app/api/tutor-reports/route.ts
var route_exports$3 = /* @__PURE__ */ __exportAll({
	GET: () => GET$3,
	PUT: () => PUT$2,
	dynamic: () => dynamic$3,
	runtime: () => runtime$3
});
var dynamic$3 = "force-dynamic";
var runtime$3 = "nodejs";
function json$3(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$3() {
	const [reports, tracking] = await Promise.all([readTutorReports(), readTutorTracking()]);
	const resolved = resolveTutorReportTutorIds(reports, tracking.snapshots.flatMap((snapshot) => snapshot.records));
	if (resolved.changed) await writeTutorReports(resolved.reports);
	return json$3({ reports: resolved.reports });
}
async function PUT$2(request) {
	try {
		const body = await request.json();
		if (!Array.isArray(body.reports)) return json$3({ error: "Invalid tutor report list" }, 400);
		const reportsByDate = /* @__PURE__ */ new Map();
		body.reports.filter((report) => Boolean(report && typeof report === "object")).map(sanitizeTutorReportSnapshot).forEach((report) => {
			reportsByDate.set(report.date, report);
		});
		const resolved = resolveTutorReportTutorIds(Array.from(reportsByDate.values()).sort((a, b) => (/* @__PURE__ */ new Date(`${b.date}T12:00:00`)).getTime() - (/* @__PURE__ */ new Date(`${a.date}T12:00:00`)).getTime()), (await readTutorTracking()).snapshots.flatMap((snapshot) => snapshot.records));
		await writeTutorReports(resolved.reports);
		return json$3({ reports: resolved.reports });
	} catch {
		return json$3({ error: "Unable to save tutor reports" }, 500);
	}
}
//#endregion
//#region app/api/tutor-tracking/route.ts
var route_exports$2 = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE$1,
	GET: () => GET$2,
	PATCH: () => PATCH$1,
	POST: () => POST$1,
	PUT: () => PUT$1,
	dynamic: () => dynamic$2,
	runtime: () => runtime$2
});
var dynamic$2 = "force-dynamic";
var runtime$2 = "nodejs";
function json$2(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$2(request) {
	const tracking = await readTutorTracking();
	const searchParams = new URL(request.url).searchParams;
	if (searchParams.get("latest") === "1") return json$2({ snapshot: tracking.snapshots[0] ?? null });
	if (searchParams.get("summary") === "1") return json$2({ imports: tracking.snapshots.map((snapshot) => ({
		id: snapshot.id,
		importedAt: snapshot.updatedAt || snapshot.createdAt || snapshot.date,
		displayName: snapshot.displayName,
		fileName: snapshot.fileName,
		sourceRowCount: snapshot.sourceRowCount || snapshot.records.length,
		date: snapshot.date
	})) });
	return json$2({ tracking });
}
async function POST$1(request) {
	try {
		const body = await request.json();
		if (typeof body.date !== "string" || typeof body.rawCsv !== "string" || !body.rawCsv.trim()) return json$2({ error: "Date ou fichier CSV invalide" }, 400);
		return json$2(await createTutorTrackingSnapshotFromCsv({
			date: body.date,
			fileName: typeof body.fileName === "string" ? body.fileName : "liste-tuteurs.csv",
			rawCsv: body.rawCsv
		}), 201);
	} catch (error) {
		return json$2({
			error: "Import tuteurs impossible",
			detail: error instanceof Error ? error.message : "Import tuteurs impossible"
		}, 500);
	}
}
async function PUT$1(request) {
	try {
		const body = await request.json();
		if (!body.tracking || typeof body.tracking !== "object") return json$2({ error: "Invalid tutor tracking" }, 400);
		const tracking = sanitizeTutorTrackingData(body.tracking);
		await writeTutorTracking(tracking);
		return json$2({ tracking });
	} catch {
		return json$2({ error: "Unable to save tutor tracking" }, 500);
	}
}
async function PATCH$1(request) {
	try {
		const body = await request.json();
		if (typeof body.id !== "string" || typeof body.displayName !== "string") return json$2({ error: "Nom d’import invalide" }, 400);
		return json$2({ tracking: await updateTutorTrackingSnapshotName(body.id, body.displayName) });
	} catch (error) {
		return json$2({
			error: "Renommage impossible",
			detail: error instanceof Error ? error.message : "Renommage impossible"
		}, 500);
	}
}
async function DELETE$1(request) {
	try {
		const id = new URL(request.url).searchParams.get("id");
		if (!id) return json$2({ error: "Identifiant manquant" }, 400);
		await moveFileImportToTrash("tutors", id);
		return json$2({ tracking: await readTutorTracking() });
	} catch (error) {
		return json$2({
			error: "Suppression impossible",
			detail: error instanceof Error ? error.message : "Suppression impossible"
		}, 500);
	}
}
//#endregion
//#region app/api/unstaffed-exclusions/route.ts
var route_exports$1 = /* @__PURE__ */ __exportAll({
	GET: () => GET$1,
	PUT: () => PUT,
	dynamic: () => dynamic$1,
	runtime: () => runtime$1
});
var dynamic$1 = "force-dynamic";
var runtime$1 = "nodejs";
function json$1(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET$1() {
	return json$1({ exclusions: await readUnstaffedExclusions() });
}
async function PUT(request) {
	try {
		const body = await request.json();
		if (!body.exclusions || typeof body.exclusions !== "object") return json$1({ error: "Exclusions invalides" }, 400);
		return json$1({ exclusions: await writeUnstaffedExclusions(sanitizeUnstaffedExclusions(body.exclusions)) });
	} catch (error) {
		return json$1({
			error: "Sauvegarde impossible",
			detail: error instanceof Error ? error.message : "Sauvegarde impossible"
		}, 500);
	}
}
//#endregion
//#region app/api/upcoming-session-imports/route.ts
var route_exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	PATCH: () => PATCH,
	POST: () => POST,
	dynamic: () => dynamic,
	runtime: () => runtime
});
var dynamic = "force-dynamic";
var runtime = "nodejs";
function json(data, status = 200) {
	return NextResponse.json(data, {
		status,
		headers: { "Cache-Control": "no-store" }
	});
}
async function GET(request) {
	try {
		const searchParams = new URL(request.url).searchParams;
		const id = searchParams.get("id");
		if (id) {
			const selectedImport = await readUpcomingSessionImportById(id);
			return selectedImport ? json({ import: selectedImport }) : json({ error: "Import introuvable" }, 404);
		}
		return json({ imports: searchParams.get("summary") === "1" ? await readUpcomingSessionImportSummaries() : await readUpcomingSessionImports() });
	} catch (error) {
		return json({
			error: "Impossible de charger les séances à venir",
			detail: error instanceof Error ? error.message : "Impossible de charger les séances à venir"
		}, 500);
	}
}
async function POST(request) {
	try {
		const url = new URL(request.url);
		const rawCsv = await request.text();
		if (!rawCsv.trim()) return json({ error: "Fichier CSV vide" }, 400);
		const createdImport = await createUpcomingSessionImportFromCsv({
			fileName: url.searchParams.get("fileName") || "semaines-a-venir.csv",
			rawCsv
		});
		const schools = await readSchools();
		const existingIds = new Set(schools.map((school) => school.externalId).filter(Boolean));
		return json({
			import: createdImport,
			schoolDetection: {
				newCount: createdImport.schools.filter((school) => school.schoolId && !existingIds.has(school.schoolId)).length,
				existingCount: createdImport.schools.filter((school) => school.schoolId && existingIds.has(school.schoolId)).length,
				missingIdCount: createdImport.schools.filter((school) => !school.schoolId).length
			}
		}, 201);
	} catch (error) {
		return json({
			error: "Impossible d’importer les séances à venir",
			detail: error instanceof Error ? error.message : "Impossible d’importer les séances à venir"
		}, 500);
	}
}
async function PATCH(request) {
	try {
		const body = await request.json();
		if (typeof body.id !== "string" || typeof body.displayName !== "string") return json({ error: "Nom invalide" }, 400);
		await updateUpcomingSessionImportName(body.id, body.displayName);
		return json({ imports: await readUpcomingSessionImportSummaries() });
	} catch (error) {
		return json({
			error: "Impossible de renommer l’import",
			detail: error instanceof Error ? error.message : "Impossible de renommer l’import"
		}, 500);
	}
}
async function DELETE(request) {
	try {
		const id = new URL(request.url).searchParams.get("id");
		if (!id) return json({ error: "Identifiant manquant" }, 400);
		await deleteUpcomingSessionImportById(id);
		return json({ imports: await readUpcomingSessionImportSummaries() });
	} catch (error) {
		return json({
			error: "Impossible de supprimer l’import",
			detail: error instanceof Error ? error.message : "Impossible de supprimer l’import"
		}, 500);
	}
}
//#endregion
//#region \0virtual:vinext-rsc-entry
var renderToReadableStream = createRscRenderer(renderToReadableStream$1);
function _getSSRFontStyles() {
	return [...getSSRFontStyles$1(), ...getSSRFontStyles()];
}
function _getSSRFontPreloads() {
	return [...getSSRFontPreloads$1(), ...getSSRFontPreloads()];
}
var __isrDebug = process.env.NEXT_PRIVATE_DEBUG_CACHE ? console.debug.bind(console, "[vinext] ISR:") : void 0;
var __classDebug = process.env.VINEXT_DEBUG_CLASSIFICATION ? function(layoutId, reason) {
	console.debug("[vinext] CLS:", layoutId, reason);
} : void 0;
function __resolveRouteFetchCacheMode(route) {
	return resolveAppPageFetchCacheMode({
		layouts: route.layouts,
		page: route.page
	});
}
function __VINEXT_CLASS(routeIdx) { return ((routeIdx) => {
    switch (routeIdx) {
      case 0: return new Map([[0, "static"]]);
      case 1: return new Map([[0, "static"]]);
      case 2: return new Map([[0, "static"]]);
      case 3: return new Map([[0, "static"]]);
      case 4: return new Map([[0, "static"]]);
      case 5: return new Map([[0, "static"]]);
      case 6: return new Map([[0, "static"]]);
      case 7: return new Map([[0, "static"]]);
      case 8: return new Map([[0, "static"]]);
      case 9: return new Map([[0, "static"]]);
      case 10: return new Map([[0, "static"]]);
      case 11: return new Map([[0, "static"]]);
      case 12: return new Map([[0, "static"]]);
      case 13: return new Map([[0, "static"]]);
      case 14: return new Map([[0, "static"]]);
      case 15: return new Map([[0, "static"]]);
      case 16: return new Map([[0, "static"]]);
      case 17: return new Map([[0, "static"]]);
      case 18: return new Map([[0, "static"]]);
      case 19: return new Map([[0, "static"]]);
      case 20: return new Map([[0, "static"]]);
      case 21: return new Map([[0, "static"]]);
      case 22: return new Map([[0, "static"]]);
      case 23: return new Map([[0, "static"]]);
      case 24: return new Map([[0, "static"]]);
      case 25: return new Map([[0, "static"]]);
      case 26: return new Map([[0, "static"]]);
      case 27: return new Map([[0, "static"]]);
      case 28: return new Map([[0, "static"]]);
      case 29: return new Map([[0, "static"]]);
      default: return null;
    }
  })(routeIdx); }
function __VINEXT_CLASS_REASONS(routeIdx) {
	return null;
}
var routes = [
	{
		__buildTimeClassifications: __VINEXT_CLASS(0),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(0) : null,
		ids: {
			"route": "route:/api/tasks/:taskId/notify-completion",
			"page": null,
			"routeHandler": "route-handler:/api/tasks/:taskId/notify-completion",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/tasks/:taskId/notify-completion",
		patternParts: [
			"api",
			"tasks",
			":taskId",
			"notify-completion"
		],
		isDynamic: true,
		params: ["taskId"],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$27,
		layouts: [layout_exports],
		routeSegments: [
			"api",
			"tasks",
			"[taskId]",
			"notify-completion"
		],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(1),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(1) : null,
		ids: {
			"route": "route:/",
			"page": "page:/",
			"routeHandler": null,
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/",
		patternParts: [],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: page_exports$1,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: [],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(2),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(2) : null,
		ids: {
			"route": "route:/access",
			"page": "page:/access",
			"routeHandler": null,
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/access",
		patternParts: ["access"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: page_exports,
		routeHandler: null,
		layouts: [layout_exports],
		routeSegments: ["access"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(3),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(3) : null,
		ids: {
			"route": "route:/api/access",
			"page": null,
			"routeHandler": "route-handler:/api/access",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/access",
		patternParts: ["api", "access"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$26,
		layouts: [layout_exports],
		routeSegments: ["api", "access"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(4),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(4) : null,
		ids: {
			"route": "route:/api/actual-session-imports",
			"page": null,
			"routeHandler": "route-handler:/api/actual-session-imports",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/actual-session-imports",
		patternParts: ["api", "actual-session-imports"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$25,
		layouts: [layout_exports],
		routeSegments: ["api", "actual-session-imports"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(5),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(5) : null,
		ids: {
			"route": "route:/api/availability-imports",
			"page": null,
			"routeHandler": "route-handler:/api/availability-imports",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/availability-imports",
		patternParts: ["api", "availability-imports"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$24,
		layouts: [layout_exports],
		routeSegments: ["api", "availability-imports"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(6),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(6) : null,
		ids: {
			"route": "route:/api/dashboard",
			"page": null,
			"routeHandler": "route-handler:/api/dashboard",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/dashboard",
		patternParts: ["api", "dashboard"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$23,
		layouts: [layout_exports],
		routeSegments: ["api", "dashboard"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(7),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(7) : null,
		ids: {
			"route": "route:/api/enrollment-imports",
			"page": null,
			"routeHandler": "route-handler:/api/enrollment-imports",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/enrollment-imports",
		patternParts: ["api", "enrollment-imports"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$22,
		layouts: [layout_exports],
		routeSegments: ["api", "enrollment-imports"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(8),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(8) : null,
		ids: {
			"route": "route:/api/file-trash",
			"page": null,
			"routeHandler": "route-handler:/api/file-trash",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/file-trash",
		patternParts: ["api", "file-trash"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$21,
		layouts: [layout_exports],
		routeSegments: ["api", "file-trash"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(9),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(9) : null,
		ids: {
			"route": "route:/api/journal-posts",
			"page": null,
			"routeHandler": "route-handler:/api/journal-posts",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/journal-posts",
		patternParts: ["api", "journal-posts"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$20,
		layouts: [layout_exports],
		routeSegments: ["api", "journal-posts"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(10),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(10) : null,
		ids: {
			"route": "route:/api/links",
			"page": null,
			"routeHandler": "route-handler:/api/links",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/links",
		patternParts: ["api", "links"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$19,
		layouts: [layout_exports],
		routeSegments: ["api", "links"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(11),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(11) : null,
		ids: {
			"route": "route:/api/mass-communications",
			"page": null,
			"routeHandler": "route-handler:/api/mass-communications",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/mass-communications",
		patternParts: ["api", "mass-communications"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$18,
		layouts: [layout_exports],
		routeSegments: ["api", "mass-communications"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(12),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(12) : null,
		ids: {
			"route": "route:/api/objectives",
			"page": null,
			"routeHandler": "route-handler:/api/objectives",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/objectives",
		patternParts: ["api", "objectives"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$17,
		layouts: [layout_exports],
		routeSegments: ["api", "objectives"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(13),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(13) : null,
		ids: {
			"route": "route:/api/people",
			"page": null,
			"routeHandler": "route-handler:/api/people",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/people",
		patternParts: ["api", "people"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$16,
		layouts: [layout_exports],
		routeSegments: ["api", "people"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(14),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(14) : null,
		ids: {
			"route": "route:/api/recurring-tasks",
			"page": null,
			"routeHandler": "route-handler:/api/recurring-tasks",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/recurring-tasks",
		patternParts: ["api", "recurring-tasks"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$15,
		layouts: [layout_exports],
		routeSegments: ["api", "recurring-tasks"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(15),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(15) : null,
		ids: {
			"route": "route:/api/school-watchlist",
			"page": null,
			"routeHandler": "route-handler:/api/school-watchlist",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/school-watchlist",
		patternParts: ["api", "school-watchlist"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$14,
		layouts: [layout_exports],
		routeSegments: ["api", "school-watchlist"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(16),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(16) : null,
		ids: {
			"route": "route:/api/schools",
			"page": null,
			"routeHandler": "route-handler:/api/schools",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/schools",
		patternParts: ["api", "schools"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$13,
		layouts: [layout_exports],
		routeSegments: ["api", "schools"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(17),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(17) : null,
		ids: {
			"route": "route:/api/staffing-audits",
			"page": null,
			"routeHandler": "route-handler:/api/staffing-audits",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/staffing-audits",
		patternParts: ["api", "staffing-audits"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$12,
		layouts: [layout_exports],
		routeSegments: ["api", "staffing-audits"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(18),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(18) : null,
		ids: {
			"route": "route:/api/staffing-sessions",
			"page": null,
			"routeHandler": "route-handler:/api/staffing-sessions",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/staffing-sessions",
		patternParts: ["api", "staffing-sessions"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$11,
		layouts: [layout_exports],
		routeSegments: ["api", "staffing-sessions"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(19),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(19) : null,
		ids: {
			"route": "route:/api/student-history",
			"page": null,
			"routeHandler": "route-handler:/api/student-history",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/student-history",
		patternParts: ["api", "student-history"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$10,
		layouts: [layout_exports],
		routeSegments: ["api", "student-history"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(20),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(20) : null,
		ids: {
			"route": "route:/api/tasks",
			"page": null,
			"routeHandler": "route-handler:/api/tasks",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/tasks",
		patternParts: ["api", "tasks"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$9,
		layouts: [layout_exports],
		routeSegments: ["api", "tasks"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(21),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(21) : null,
		ids: {
			"route": "route:/api/tutor-activity",
			"page": null,
			"routeHandler": "route-handler:/api/tutor-activity",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/tutor-activity",
		patternParts: ["api", "tutor-activity"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$8,
		layouts: [layout_exports],
		routeSegments: ["api", "tutor-activity"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(22),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(22) : null,
		ids: {
			"route": "route:/api/tutor-assignment-imports",
			"page": null,
			"routeHandler": "route-handler:/api/tutor-assignment-imports",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/tutor-assignment-imports",
		patternParts: ["api", "tutor-assignment-imports"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$7,
		layouts: [layout_exports],
		routeSegments: ["api", "tutor-assignment-imports"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(23),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(23) : null,
		ids: {
			"route": "route:/api/tutor-coverage-notes",
			"page": null,
			"routeHandler": "route-handler:/api/tutor-coverage-notes",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/tutor-coverage-notes",
		patternParts: ["api", "tutor-coverage-notes"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$6,
		layouts: [layout_exports],
		routeSegments: ["api", "tutor-coverage-notes"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(24),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(24) : null,
		ids: {
			"route": "route:/api/tutor-interest-imports",
			"page": null,
			"routeHandler": "route-handler:/api/tutor-interest-imports",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/tutor-interest-imports",
		patternParts: ["api", "tutor-interest-imports"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$5,
		layouts: [layout_exports],
		routeSegments: ["api", "tutor-interest-imports"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(25),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(25) : null,
		ids: {
			"route": "route:/api/tutor-report-comments",
			"page": null,
			"routeHandler": "route-handler:/api/tutor-report-comments",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/tutor-report-comments",
		patternParts: ["api", "tutor-report-comments"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$4,
		layouts: [layout_exports],
		routeSegments: ["api", "tutor-report-comments"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(26),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(26) : null,
		ids: {
			"route": "route:/api/tutor-reports",
			"page": null,
			"routeHandler": "route-handler:/api/tutor-reports",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/tutor-reports",
		patternParts: ["api", "tutor-reports"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$3,
		layouts: [layout_exports],
		routeSegments: ["api", "tutor-reports"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(27),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(27) : null,
		ids: {
			"route": "route:/api/tutor-tracking",
			"page": null,
			"routeHandler": "route-handler:/api/tutor-tracking",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/tutor-tracking",
		patternParts: ["api", "tutor-tracking"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$2,
		layouts: [layout_exports],
		routeSegments: ["api", "tutor-tracking"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(28),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(28) : null,
		ids: {
			"route": "route:/api/unstaffed-exclusions",
			"page": null,
			"routeHandler": "route-handler:/api/unstaffed-exclusions",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/unstaffed-exclusions",
		patternParts: ["api", "unstaffed-exclusions"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports$1,
		layouts: [layout_exports],
		routeSegments: ["api", "unstaffed-exclusions"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	},
	{
		__buildTimeClassifications: __VINEXT_CLASS(29),
		__buildTimeReasons: __classDebug ? __VINEXT_CLASS_REASONS(29) : null,
		ids: {
			"route": "route:/api/upcoming-session-imports",
			"page": null,
			"routeHandler": "route-handler:/api/upcoming-session-imports",
			"rootBoundary": "root-boundary:/",
			"layouts": ["layout:/"],
			"templates": [],
			"slots": {}
		},
		pattern: "/api/upcoming-session-imports",
		patternParts: ["api", "upcoming-session-imports"],
		isDynamic: false,
		params: [],
		rootParamNames: [],
		page: null,
		routeHandler: route_exports,
		layouts: [layout_exports],
		routeSegments: ["api", "upcoming-session-imports"],
		templateTreePositions: [],
		layoutTreePositions: [0],
		templates: [],
		errors: [null],
		errorPaths: [],
		errorTreePositions: [],
		slots: {},
		loading: null,
		error: null,
		notFound: null,
		notFounds: [null],
		forbidden: null,
		forbiddens: [null],
		unauthorized: null,
		unauthorizeds: [null]
	}
];
var __routeMatcher = createAppRscRouteMatcher(routes);
var metadataRoutes = [];
var rootNotFoundModule = null;
var rootForbiddenModule = null;
var rootUnauthorizedModule = null;
var rootLayouts = [layout_exports];
var createRscOnErrorHandler = (request, pathname, routePath) => createAppRscOnErrorHandler(reportRequestError, request, pathname, routePath);
var __fallbackRenderer = createAppFallbackRenderer({
	rootBoundaries: {
		rootForbiddenModule,
		rootLayouts,
		rootNotFoundModule,
		rootUnauthorizedModule
	},
	globalErrorModule: null,
	metadataRoutes,
	ssrLoader() {
		return import("./ssr/index.js");
	},
	fontProviders: {
		buildFontLinkHeader: buildAppPageFontLinkHeader,
		getFontLinks: getSSRFontLinks,
		getFontPreloads: _getSSRFontPreloads,
		getFontStyles: _getSSRFontStyles
	},
	makeThenableParams,
	sanitizer: sanitizeErrorForClient,
	rscRenderer: renderToReadableStream,
	getNavigationContext,
	resolveChildSegments: resolveAppPageChildSegments,
	clearRequestContext() {
		clearAppRequestContext();
	},
	createRscOnErrorHandler(request, pathname, routePath) {
		return createRscOnErrorHandler(request, pathname, routePath);
	}
});
function matchRoute(url) {
	return __routeMatcher.matchRoute(url);
}
/**
* Check if a pathname matches any intercepting route.
* Returns the match info or null.
*/
function findIntercept(pathname, sourcePathname = null) {
	return __routeMatcher.findIntercept(pathname, sourcePathname);
}
async function buildPageElements(route, params, routePath, pageRequest) {
	return buildPageElements$1({
		route,
		params,
		routePath,
		pageRequest,
		globalErrorModule: null,
		rootNotFoundModule: null,
		rootForbiddenModule: null,
		rootUnauthorizedModule: null,
		metadataRoutes
	});
}
var __basePath = "";
var __trailingSlash = false;
var __i18nConfig = null;
var __configRedirects = [];
var __configRewrites = {
	"beforeFiles": [],
	"afterFiles": [],
	"fallback": []
};
var __configHeaders = [];
var __publicFiles = new Set([
	"/favicon.svg",
	"/file.svg",
	"/globe.svg",
	"/logo-etude-alpha-carre.png",
	"/recrutement-tuteurs-surveillants-alpha-600x360.png",
	"/recrutement-tuteurs-surveillants-alpha-hd.png",
	"/surveillant-cour-alpha-600x360.png",
	"/surveillant-cour-alpha-hd.png",
	"/window.svg"
]);
var __allowedOrigins = [];
var __expireTime = 31536e3;
var __allowedDevOrigins = [];
var __safeDevHosts = [
	"localhost",
	"127.0.0.1",
	"[::1]"
];
function __forbidden() {
	return new Response("Forbidden", {
		status: 403,
		headers: { "Content-Type": "text/plain" }
	});
}
function __validateDevRequestOrigin(request) {
	if (request.headers.get("sec-fetch-mode") === "no-cors" && request.headers.get("sec-fetch-site") === "cross-site") {
		console.warn("[vinext] Blocked cross-site no-cors request to " + new URL(request.url).pathname);
		return __forbidden();
	}
	const origin = request.headers.get("origin");
	if (!origin) return null;
	if (origin === "null") {
		if (!__allowedDevOrigins.includes("null")) {
			console.warn("[vinext] Blocked request with Origin: null. Add \"null\" to allowedDevOrigins to allow sandboxed contexts.");
			return __forbidden();
		}
		return null;
	}
	let originHostname;
	try {
		originHostname = new URL(origin).hostname.toLowerCase();
	} catch {
		return __forbidden();
	}
	if (__safeDevHosts.includes(originHostname) || originHostname.endsWith(".localhost")) return null;
	const hostHeader = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "").split(",")[0].trim().split(":")[0].toLowerCase();
	if (hostHeader && originHostname === hostHeader) return null;
	for (const pattern of __allowedDevOrigins) if (pattern.startsWith("*.")) {
		const suffix = pattern.slice(1);
		if (originHostname === pattern.slice(2) || originHostname.endsWith(suffix)) return null;
	} else if (originHostname === pattern) return null;
	console.warn(`[vinext] Blocked cross-origin request from "${origin}" to ${new URL(request.url).pathname}. To allow this origin, add it to allowedDevOrigins in next.config.js.`);
	return __forbidden();
}
/**
* Maximum server-action request body size.
* Configurable via experimental.serverActions.bodySizeLimit in next.config.
* Defaults to 1MB, matching the Next.js default.
* @see https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions#bodysizelimit
* Prevents unbounded request body buffering.
*/
var __MAX_ACTION_BODY_SIZE = 1048576;
var _virtual_vinext_rsc_entry_default = createAppRscHandler({
	basePath: __basePath,
	clearRequestContext() {
		clearAppRequestContext();
	},
	configHeaders: __configHeaders,
	configRedirects: __configRedirects,
	configRewrites: __configRewrites,
	dispatchMatchedPage({ cleanPathname, formState, handlerStart, interceptionContext, isProgressiveActionRender, isRscRequest, middlewareContext, mountedSlotsHeader, params, request, route, scriptNonce, searchParams, renderMode }) {
		const PageComponent = route.page?.default;
		const __segmentConfig = resolveAppPageSegmentConfig({
			layouts: route.layouts,
			page: route.page
		});
		const __generateStaticParams = resolveAppPageGenerateStaticParamsSources({
			layouts: route.layouts,
			layoutTreePositions: route.layoutTreePositions,
			page: route.page,
			routeSegments: route.routeSegments
		});
		const _asyncRouteParams = makeThenableParams(params);
		return dispatchAppPage({
			basePath: __basePath,
			buildPageElement(targetRoute, targetParams, targetOpts, targetSearchParams) {
				return buildPageElements(targetRoute, targetParams, cleanPathname, {
					opts: targetOpts,
					searchParams: targetSearchParams,
					isRscRequest,
					request,
					mountedSlotsHeader,
					renderMode
				});
			},
			cleanPathname,
			clearRequestContext() {
				clearAppRequestContext();
			},
			createRscOnErrorHandler(pathname, routePath) {
				return createRscOnErrorHandler(request, pathname, routePath);
			},
			debugClassification: __classDebug,
			dynamicConfig: __segmentConfig.dynamicConfig,
			dynamicParamsConfig: __segmentConfig.dynamicParamsConfig,
			fetchCache: __segmentConfig.fetchCache ?? null,
			findIntercept(pathname) {
				return findIntercept(pathname, interceptionContext);
			},
			generateStaticParams: __generateStaticParams,
			getFontLinks: getSSRFontLinks,
			getFontPreloads: _getSSRFontPreloads,
			getFontStyles: _getSSRFontStyles,
			getNavigationContext,
			getSourceRoute(sourceRouteIndex) {
				return routes[sourceRouteIndex];
			},
			hasGenerateStaticParams: __generateStaticParams.length > 0,
			hasPageDefaultExport: !!PageComponent,
			hasPageModule: !!route.page,
			handlerStart,
			interceptionContext,
			expireSeconds: __expireTime,
			formState,
			isProgressiveActionRender,
			isProduction: true,
			isRscRequest,
			isrDebug: __isrDebug,
			isrGet,
			isrHtmlKey: appIsrHtmlKey,
			isrRscKey: appIsrRscKey,
			isrSet,
			loadSsrHandler() {
				return import("./ssr/index.js");
			},
			middlewareContext,
			mountedSlotsHeader,
			params,
			probeLayoutAt(li) {
				const LayoutComp = route.layouts[li]?.default;
				if (!LayoutComp) return null;
				return LayoutComp({
					params: makeThenableParams(resolveAppPageSegmentParams(route.routeSegments, route.layoutTreePositions?.[li] ?? 0, params)),
					children: null
				});
			},
			probePage() {
				if (!PageComponent) return null;
				return PageComponent({
					params: _asyncRouteParams,
					searchParams: makeThenableParams(collectAppPageSearchParams(searchParams).searchParamsObject)
				});
			},
			renderErrorBoundaryPage(renderErr) {
				return __fallbackRenderer.renderErrorBoundary(route, renderErr, isRscRequest, request, params, scriptNonce, middlewareContext);
			},
			renderHttpAccessFallbackPage(statusCode, opts, currentMiddlewareContext) {
				return __fallbackRenderer.renderHttpAccessFallback(route, statusCode, isRscRequest, request, opts, scriptNonce, currentMiddlewareContext);
			},
			renderToReadableStream,
			request,
			revalidateSeconds: __segmentConfig.revalidateSeconds,
			resolveRouteFetchCacheMode(targetRoute) {
				return __resolveRouteFetchCacheMode(targetRoute);
			},
			rootForbiddenModule,
			rootNotFoundModule,
			rootUnauthorizedModule,
			route,
			runWithSuppressedHookWarning(probe) {
				return suppressHookWarningAls.run(true, probe);
			},
			scheduleBackgroundRegeneration(key, renderFn, errorContext) {
				triggerBackgroundRegeneration(key, renderFn, errorContext);
			},
			scriptNonce,
			searchParams,
			setNavigationContext: setAppNavigationContext,
			renderMode
		});
	},
	dispatchMatchedRouteHandler({ cleanPathname, middlewareContext, params, request, route, searchParams }) {
		return dispatchAppRouteHandler({
			basePath: __basePath,
			cleanPathname,
			clearRequestContext() {
				clearAppRequestContext();
			},
			i18n: __i18nConfig,
			isrDebug: __isrDebug,
			isrGet,
			isrRouteKey: appIsrRouteKey,
			isrSet,
			middlewareContext,
			middlewareRequestHeaders: middlewareContext.requestHeaders,
			params,
			request,
			route: {
				pattern: route.pattern,
				routeHandler: route.routeHandler,
				routeSegments: route.routeSegments
			},
			scheduleBackgroundRegeneration: triggerBackgroundRegeneration,
			searchParams
		});
	},
	handleProgressiveActionRequest({ actionId, cleanPathname, contentType, middlewareContext, request }) {
		return handleProgressiveServerActionRequest({
			actionId,
			allowedOrigins: __allowedOrigins,
			cleanPathname,
			clearRequestContext() {
				clearAppRequestContext();
			},
			contentType,
			decodeAction,
			decodeFormState,
			getAndClearPendingCookies,
			getDraftModeCookieHeader,
			maxActionBodySize: __MAX_ACTION_BODY_SIZE,
			middlewareHeaders: middlewareContext.headers,
			readFormDataWithLimit: readActionFormDataWithLimit,
			reportRequestError,
			request,
			setHeadersAccessPhase
		});
	},
	handleServerActionRequest({ actionId, cleanPathname, contentType, interceptionContext, isRscRequest, middlewareContext, mountedSlotsHeader, request, searchParams }) {
		return handleServerActionRscRequest({
			actionId,
			allowedOrigins: __allowedOrigins,
			buildPageElement({ route: actionRoute, params: actionParams, cleanPathname: actionCleanPathname, interceptOpts, searchParams: actionSearchParams, isRscRequest: actionIsRscRequest, request: actionRequest, mountedSlotsHeader: actionMountedSlotsHeader, renderMode: actionRenderMode }) {
				return buildPageElements(actionRoute, actionParams, actionCleanPathname, {
					opts: interceptOpts,
					searchParams: actionSearchParams,
					isRscRequest: actionIsRscRequest,
					request: actionRequest,
					mountedSlotsHeader: actionMountedSlotsHeader,
					renderMode: actionRenderMode
				});
			},
			cleanPathname,
			clearRequestContext() {
				clearAppRequestContext();
			},
			contentType,
			createNotFoundElement(actionRouteId) {
				return {
					...AppElementsWire.createMetadataEntries({
						interceptionContext: null,
						rootLayoutTreePath: null,
						routeId: actionRouteId
					}),
					[actionRouteId]: (0, import_react_react_server.createElement)("div", null, "Page not found")
				};
			},
			createPayloadRouteId(pathnameToRender, currentInterceptionContext) {
				return AppElementsWire.encodeRouteId(pathnameToRender, currentInterceptionContext);
			},
			createRscOnErrorHandler(actionRequest, actionPathname, routePattern) {
				return createRscOnErrorHandler(actionRequest, actionPathname, routePattern);
			},
			createTemporaryReferenceSet,
			decodeReply,
			findIntercept(pathnameToMatch) {
				return findIntercept(pathnameToMatch, interceptionContext);
			},
			getAndClearPendingCookies,
			getDraftModeCookieHeader,
			getRouteParamNames(sourceRoute) {
				return sourceRoute.params;
			},
			getSourceRoute(sourceRouteIndex) {
				return routes[sourceRouteIndex];
			},
			isRscRequest,
			loadServerAction,
			matchRoute(pathnameToMatch) {
				return matchRoute(pathnameToMatch);
			},
			maxActionBodySize: __MAX_ACTION_BODY_SIZE,
			middlewareHeaders: middlewareContext.headers,
			middlewareStatus: middlewareContext.status,
			mountedSlotsHeader,
			readBodyWithLimit: readActionBodyWithLimit,
			readFormDataWithLimit: readActionFormDataWithLimit,
			renderToReadableStream,
			reportRequestError,
			request,
			sanitizeErrorForClient(error) {
				return sanitizeErrorForClient(error);
			},
			searchParams,
			setHeadersAccessPhase,
			setNavigationContext: setAppNavigationContext,
			toInterceptOpts(intercept) {
				return {
					interceptionContext,
					interceptLayouts: intercept.interceptLayouts,
					interceptSlotKey: intercept.slotKey,
					interceptPage: intercept.page,
					interceptParams: intercept.matchedParams
				};
			}
		});
	},
	i18nConfig: __i18nConfig,
	isMiddlewareProxy: true,
	makeThenableParams,
	matchRoute,
	metadataRoutes,
	middlewareModule: proxy_exports,
	publicFiles: __publicFiles,
	renderNotFound({ isRscRequest, matchedParams, middlewareContext, request, route, scriptNonce }) {
		return __fallbackRenderer.renderNotFound(route, isRscRequest, request, matchedParams, scriptNonce, middlewareContext);
	},
	rootParamNamesByPattern: {},
	setNavigationContext: setAppNavigationContext,
	staticParamsMap: {},
	trailingSlash: __trailingSlash,
	validateDevRequestOrigin: __validateDevRequestOrigin
});
//#endregion
//#region node_modules/.pnpm/vinext@0.0.50_@vitejs+plugin-react@6.0.2_vite@8.0.13_@types+node@22.19.19_esbuild@0.28._09055b837d8aa4555372357075757799/node_modules/vinext/dist/server/app-router-entry.js
/**
* Default Cloudflare Worker entry point for vinext App Router.
*
* Use this directly in wrangler.jsonc:
*   "main": "vinext/server/app-router-entry"
*
* Or import and delegate to it from a custom worker:
*   import handler from "vinext/server/app-router-entry";
*   return handler.fetch(request, env, ctx);
*
* This file runs in the RSC environment. Configure the Cloudflare plugin with:
*   cloudflare({ viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] } })
*/
var app_router_entry_default = { async fetch(request, env, ctx) {
	return handleRequest(request, env, ctx);
} };
async function handleRequest(request, env, ctx) {
	const url = new URL(request.url);
	if (isOpenRedirectShaped(url.pathname)) return notFoundResponse();
	try {
		decodeURIComponent(url.pathname);
	} catch {
		return badRequestResponse();
	}
	{
		const filteredHeaders = filterInternalHeaders(request.headers);
		request = cloneRequestWithHeaders(request, filteredHeaders);
	}
	const handleFn = () => _virtual_vinext_rsc_entry_default(request, ctx);
	const result = await (ctx ? runWithExecutionContext(ctx, handleFn) : handleFn());
	if (result instanceof Response) {
		if (env?.ASSETS) {
			const assetFetcher = env.ASSETS;
			const assetResponse = await resolveStaticAssetSignal(result, { fetchAsset: (path) => Promise.resolve(assetFetcher.fetch(new Request(new URL(path, request.url)))) });
			if (assetResponse) return assetResponse;
		}
		return result;
	}
	if (result === null || result === void 0) return notFoundResponse();
	return new Response(String(result), { status: 200 });
}
//#endregion
//#region \0virtual:cloudflare/worker-entry
var worker_entry_default = { async fetch(request, env, ctx) {
	if (new URL(request.url).pathname === "/_vinext/image") return handleImageOptimization(request, {
		fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
		transformImage: async (body, { width, format, quality }) => {
			return (await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({
				format,
				quality
			})).response();
		}
	}, [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES]);
	return app_router_entry_default.fetch(request, env, ctx);
} };
//#endregion
export { worker_entry_default as default };
