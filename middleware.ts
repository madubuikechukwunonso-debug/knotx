// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('>>> MIDDLEWARE RAN <<< Path:', request.nextUrl.pathname);
  
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',   // Match EVERYTHING (for testing only)
};
