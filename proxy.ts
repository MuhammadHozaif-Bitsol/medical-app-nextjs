import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const authSession = request.cookies.get("auth_session");
  const url = request.nextUrl.clone();

  // Redirect to login if unauthenticated on protected routes
  if (!authSession) {
    if (
      url.pathname.startsWith("/patient") ||
      url.pathname.startsWith("/staff") ||
      url.pathname === "/"
    ) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  } else {
    // If authenticated, perform role checks
    try {
      const session = JSON.parse(authSession.value);

      // Prevent patients from accessing staff routes
      if (session.role === "patient" && url.pathname.startsWith("/staff")) {
        url.pathname = "/patient/doctors";
        return NextResponse.redirect(url);
      }

      // Prevent staff from accessing patient routes
      if (session.role === "staff" && url.pathname.startsWith("/patient")) {
        url.pathname = "/staff/dashboard";
        return NextResponse.redirect(url);
      }

      // Redirect from root or login to appropriate dashboard
      if (
        url.pathname === "/" ||
        url.pathname === "/login" ||
        url.pathname === "/register"
      ) {
        url.pathname =
          session.role === "staff" ? "/staff/dashboard" : "/patient/doctors";
        return NextResponse.redirect(url);
      }
    } catch (e) {
      // Invalid cookie json
      request.cookies.delete("auth_session");
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
