import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // If user has session and tries to access auth pages, redirect to home
  if (sessionCookie && ['/sign-in', '/sign-up'].includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user has no session and tries to access protected routes, redirect to sign-in
  const protectedRoutes = [
    '/accounts',
    '/categories',
    '/transactions',
    '/settings',
  ]; // Add your protected routes here
  if (
    !sessionCookie &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Special case for root path - redirect to sign-in if no session
  if (!sessionCookie && pathname === '/') {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/sign-in',
    '/sign-up',
    '/accounts/:path*',
    '/categories/:path*',
    '/transactions/:path*',
    '/settings/:path*',
  ], // Update matcher accordingly
};
