import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/session";

function isProtectedRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/patient") ||
    pathname.startsWith("/staff") ||
    pathname === "/"
  );
}

function getHomeRouteByRole(role: unknown): string {
  return role === "staff" ? "/staff/dashboard" : "/patient/doctors";
}

function determineRedirect(
  pathname: string,
  sessionRole: unknown,
): string | null {
  if (!sessionRole) {
    return isProtectedRoute(pathname) ? "/login" : null;
  }

  if (sessionRole === "patient" && pathname.startsWith("/staff")) {
    return "/patient/doctors";
  }

  if (sessionRole === "staff" && pathname.startsWith("/patient")) {
    return "/staff/dashboard";
  }

  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return getHomeRouteByRole(sessionRole);
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("auth_session");
  const session = sessionCookie ? await verifyToken(sessionCookie.value) : null;
  const redirectTarget = determineRedirect(
    request.nextUrl.pathname,
    session?.role,
  );

  if (redirectTarget) {
    const url = request.nextUrl.clone();
    url.pathname = redirectTarget;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
