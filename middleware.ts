import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const pathname = req.nextUrl.pathname;

  const protectedPaths = [
    "/dashboard",
    "/environmental",
    "/social",
    "/governance",
    "/gamification",
    "/reports",
    "/settings",
  ];

  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const user = await verifyToken(token);

      const adminOnlyPaths = ["/settings"];
      if (adminOnlyPaths.some((path) => pathname.startsWith(path))) {
        if (!["admin", "department_head"].includes(user.role)) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/environmental/:path*",
    "/social/:path*",
    "/governance/:path*",
    "/gamification/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};