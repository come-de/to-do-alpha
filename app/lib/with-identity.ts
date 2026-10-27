import { getUser, verifyRequestOrigin } from "@netlify/identity";
import { NextResponse } from "next/server";

type RouteHandler = (...args: never[]) => Response | Promise<Response>;

/** Enforce a verified Netlify Identity session on every data API handler. */
export function withIdentity<Handler extends RouteHandler>(handler: Handler): Handler {
  const guarded = async (...args: Parameters<Handler>) => {
    const request = args[0] as Request | undefined;
    if (request && request.method !== "GET" && request.method !== "HEAD" && request.method !== "OPTIONS") {
      try {
        // Netlify can forward Next.js requests with an internal URL. Trust only
        // the deployment's configured public origin, never forwarded headers.
        const allowedOrigins = [new URL(request.url).origin];
        if (process.env.URL) allowedOrigins.push(new URL(process.env.URL).origin);
        verifyRequestOrigin(request, { allowedOrigins });
      } catch {
        console.warn("[api-origin] rejected", { method: request.method, path: new URL(request.url).pathname, originPresent: Boolean(request.headers.get("origin")) });
        return NextResponse.json({ error: "Origine de requête invalide" }, {
          status: 403,
          headers: { "Cache-Control": "no-store" },
        });
      }
    }

    const traceImport = request?.method === "POST" && new URL(request.url).pathname === "/api/tutor-report-audit";
    if (traceImport) console.info("[tutor-report-import] auth:start");
    const user = await getUser();
    if (traceImport) console.info("[tutor-report-import] auth:done", { authenticated: Boolean(user) });
    if (!user) {
      return NextResponse.json({ error: "Authentification requise" }, {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      });
    }

    return handler(...args);
  };
  return guarded as Handler;
}
