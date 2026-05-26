// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`[Middleware] Path: ${pathname}`);

  // Skip tracking for these paths
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Get session
  const sessionCookie = request.cookies.get('knotx_session')?.value;
  let userId = null;
  let displayName = null;
  let userType = 'guest';

  if (sessionCookie) {
    try {
      const secret = new TextEncoder().encode(process.env.APP_SECRET || 'dev-secret-change-me');
      const { payload } = await jwtVerify(sessionCookie, secret);
      userId = payload.userId ? String(payload.userId) : null;
      displayName = payload.name as string || null;
      userType = 'registered';
    } catch (e) {
      console.log('[Middleware] Invalid session cookie');
    }
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             request.headers.get('x-real-ip') || 'unknown';

  console.log(`[Middleware] Tracking visit → Page: ${pathname}, IP: ${ip}, Type: ${userType}`);

  // Fire tracking request
  fetch(`${request.nextUrl.origin}/api/track-visit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: pathname,
      userId,
      displayName,
      userType,
      ip,
      userAgent: request.headers.get('user-agent'),
    }),
  }).catch(err => console.error('[Middleware] Track fetch failed:', err));

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
