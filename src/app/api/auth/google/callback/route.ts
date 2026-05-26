// src/app/api/auth/google/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = req.cookies.get("google_oauth_state")?.value;

  const baseUrl = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");

  // CSRF Protection
  if (!state || !storedState || state !== storedState) {
    console.error("Google OAuth: Invalid state");
    return NextResponse.redirect(`${baseUrl}/login?error=invalid_state`);
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!code || !googleClientId || !googleClientSecret) {
    console.error("Google OAuth: Missing credentials");
    return NextResponse.redirect(`${baseUrl}/login?error=google_config_error`);
  }

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Google token exchange failed:", tokenData);
      return NextResponse.redirect(`${baseUrl}/login?error=token_exchange_failed`);
    }

    // 2. Get user profile from Google
    const userInfoRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const googleUser = await userInfoRes.json();

    if (!googleUser.email) {
      return NextResponse.redirect(`${baseUrl}/login?error=no_email_from_google`);
    }

    // 3. Find or create user
    let user = await prisma.localUser.findUnique({
      where: { email: googleUser.email.toLowerCase() },
    });

    if (!user) {
      const baseUsername = googleUser.email.split("@")[0];
      user = await prisma.localUser.create({
        data: {
          email: googleUser.email.toLowerCase(),
          username: `${baseUsername}_${Date.now()}`,
          displayName: googleUser.name || baseUsername,
          passwordHash: "GOOGLE_AUTH",
          role: "user",
          isActive: true,
        },
      });
    }

    // 4. Create JWT session
    const secret = new TextEncoder().encode(
      process.env.APP_SECRET || "dev-secret-change-me"
    );

    const sessionPayload = {
      userId: user.id,
      userType: "oauth",
      role: user.role,
      email: user.email,
      name: user.displayName || user.username,
    };

    const token = await new SignJWT(sessionPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    // 5. Set session cookie and redirect to Dashboard
    const response = NextResponse.redirect(`${baseUrl}/dashboard`);

    response.cookies.set("knotx_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    response.cookies.set("google_oauth_state", "", { maxAge: 0, path: "/" });

    return response;

  } catch (error: any) {
    console.error("Google OAuth Callback Error:", error);
    return NextResponse.redirect(`${baseUrl}/login?error=google_auth_failed`);
  }
}
