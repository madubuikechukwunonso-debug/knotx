// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ============================================
  // SKIP TRACKING FOR THESE PATHS
  // ============================================
  if (
    pathname.startsWith('/admin') ||           // Admin panel
    pathname.startsWith('/api') ||             // API routes
    pathname.startsWith('/_next') ||           // Next.js internals
    pathname.includes('.') ||                  // Static files (images, css, js, etc.)
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // ============================================
  // EXTRACT USER INFO FROM COOKIES (if logged in)
  // ============================================
  const userId = request.cookies.get('userId')?.value || null;
  const displayName = request.cookies.get('displayName')?.value || null;

  // Determine user type
  const userType = userId ? 'registered' : 'guest';

  // ============================================
  // GET IP ADDRESS (Vercel + General Support)
  // ============================================
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

  // Get user agent
  const userAgent = request.headers.get('user-agent') || null;

  // ============================================
  // FIRE TRACKING REQUEST (Non-blocking)
  // ============================================
  try {
    // We don't await this so it doesn't slow down page rendering
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
    }).catch(() => {
      // Silently ignore tracking errors so they don't affect users
    });
  } catch (error) {
    // Fail silently - tracking should never break the site
  }

  return NextResponse.next();
}

// ============================================
// MATCHER CONFIGURATION
// ============================================
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - admin routes
     */
    '/((?!api|_next/static|_next/image|favicon.ico|admin).*)',
  ],
};
