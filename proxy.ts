import { NextRequest, NextResponse } from "next/server";

function isPublicPath(pathname: string) {
  return (
    pathname === "/access" ||
    // Netlify Identity owns these endpoints. They must stay reachable before
    // login so invitation, recovery, and login callbacks can complete.
    pathname === "/.netlify/identity" ||
    pathname.startsWith("/.netlify/identity/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public/") ||
    Boolean(pathname.match(/\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml)$/))
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();

  // This only avoids redirecting an existing session. API handlers independently
  // verify the signed Netlify Identity JWT with getUser().
  const hasIdentitySession = Boolean(request.cookies.get("nf_jwt")?.value);
  if (hasIdentitySession) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Accès protégé" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/access";
  url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
