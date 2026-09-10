import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "alpha_access";
const ACCESS_TOKEN = "alpha-unlocked-v1";

function isPublicPath(pathname: string) {
  return (
    pathname === "/access" ||
    pathname === "/api/access" ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public/") ||
    Boolean(pathname.match(/\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml)$/))
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();

  const hasAccess = request.cookies.get(ACCESS_COOKIE)?.value === ACCESS_TOKEN;
  if (hasAccess) return NextResponse.next();

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
