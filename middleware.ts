import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const roleProtectedRoutes: Record<string, string[]> = {
  '/settings': ['admin'],
  '/governance/audits': ['admin', 'esg_manager', 'compliance_officer'],
};

export async function middleware(req: NextRequest) {
  const publicPaths = ['/login', '/signup', '/api/auth/login', '/api/auth/signup'];
  const path = req.nextUrl.pathname;

  if (publicPaths.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const decoded = await verifyToken(token);

    for (const [route, roles] of Object.entries(roleProtectedRoutes)) {
      if (path.startsWith(route) && !roles.includes(decoded.role)) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/environmental/:path*', '/social/:path*', '/governance/:path*', '/gamification/:path*', '/reports/:path*'],
}
