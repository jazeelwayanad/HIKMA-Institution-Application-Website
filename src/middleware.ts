import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';
const key = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Protect Admin Routes
  if (pathname.startsWith('/admin')) {
    // Exclude login page itself to avoid infinite loop
    if (pathname === '/admin-login') {
      return NextResponse.next();
    }

    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, key);
      if (payload.adminRole !== 'admin') {
        return NextResponse.redirect(new URL('/admin-login', request.url));
      }
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*'],
};
