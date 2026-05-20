import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip tracking for admin, API, and static files
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Fire and forget tracking (non-blocking)
  const userId = request.cookies.get('userId')?.value; // Adjust based on your auth
  const displayName = request.cookies.get('displayName')?.value;

  fetch(`${request.nextUrl.origin}/api/track-visit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: pathname,
      userId,
      displayName,
      userType: userId ? 'registered' : 'guest',
    }),
  }).catch(() => {}); // Prevent errors from breaking requests

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - static files
     * - admin routes
     */
    '/((?!api|_next/static|_next/image|favicon.ico|admin).*)',
  ],
};
