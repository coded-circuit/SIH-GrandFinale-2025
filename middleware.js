import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }
  const passwordProtectionEnabled =
    process.env.NEXT_PUBLIC_PASSWORD_PROTECTION === "true";

  if (!passwordProtectionEnabled) {
    return NextResponse.next();
  }
  const passwordCookie = request.cookies.get("password_verified");
  if (passwordCookie?.value === "true") {
    return NextResponse.next();
  }
  if (pathname === "/password") {
    return NextResponse.next();
  }
  const response = NextResponse.redirect(new URL("/password", request.url));
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
