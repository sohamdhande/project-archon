import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow /api/login and /api/logout without auth
  if (pathname === '/api/login' || pathname === '/api/logout') {
    return NextResponse.next();
  }

  // Allow GET requests to public API routes (leaderboard, attendance grid)
  if (request.method === 'GET' && pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    return handleUnauthorized(request, pathname);
  }

  const payload = await verifyJwt(token);
  if (!payload || payload.role !== 'admin') {
    return handleUnauthorized(request, pathname);
  }

  return NextResponse.next();
}

function handleUnauthorized(request: NextRequest, pathname: string) {
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
    response.cookies.delete('token');
    return response;
  }

  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.delete('token');
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/((?!login).*)'],
};
