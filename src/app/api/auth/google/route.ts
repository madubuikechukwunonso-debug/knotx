// src/app/api/auth/google/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/google/callback`;

  if (!googleClientId) {
    return NextResponse.json(
      { error: "Google OAuth is not configured" },
      { status: 500 }
    );
  }

  const state = crypto.randomUUID();

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?` +
      new URLSearchParams({
        client_id: googleClientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        state: state,
        access_type: "offline",
        prompt: "consent",
      }).toString()
  );

  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
