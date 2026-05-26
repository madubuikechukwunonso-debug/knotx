// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ============================================
  // SKIP TRACKING FOR THESE PATHS
  // ============================================
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // ============================================
  // EXTRACT USER INFO FROM JWT SESSION
  // ============================================
  let userId: string | null = null;
  let displayName: string | null = null;
  let userType: string = 'guest';

  const sessionCookie = request.cookies.get('knotx_session')?.value;

  if (sessionCookie) {
    try {
      const secret = new TextEncoder().encode(
        process.env.APP_SECRET || 'dev-secret-change-me'
      );

      const { payload } = await jwtVerify(sessionCookie, secret);

      if (payload.userId) {
        userId = String(payload.userId);
        displayName = payload.name as string || null;
        userType = 'registered';
      }
    } catch (error) {
      // Invalid or expired session - treat as guest
      console.error('Invalid session in middleware');
    }
  }

  // ============================================
  // GET REAL CLIENT IP
  // ============================================
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

  const userAgent = request.headers.get('user-agent') || null;

  // ============================================
  // FIRE TRACKING REQUEST (Non-blocking)
  // ============================================
  fetch(`${request.nextUrl.origin}/api/track-visit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      page: pathname,
      userId: userId,
      displayName: displayName,
      userType: userType,
      ip: ip,
      userAgent: userAgent,
    }),
  }).catch((error) => {
    console.error('Visitor tracking failed:', error);
  });

  return NextResponse.next();
}

// ============================================
// MATCHER CONFIGURATION
// ============================================
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - API routes
     * - Next.js internals
     * - Static files
     * - Favicon
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
