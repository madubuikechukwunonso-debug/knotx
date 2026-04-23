import { cookies } from "next/headers";
import * as jose from "jose";

export const SESSION_COOKIE = "knotx_session";

export type SessionRole = "user" | "worker" | "admin" | "super_admin";
export type SessionUserType = "local" | "oauth";

export type SessionPayload = {
  userId: number;
  userType: SessionUserType;
  role: SessionRole;
  email: string;
  name: string;
};

const SESSION_SECRET = process.env.APP_SECRET || "dev-secret-change-me";
const secret = new TextEncoder().encode(SESSION_SECRET);

export async function signSessionToken(payload: SessionPayload) {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, secret, {
      clockTolerance: 60,
    });

    return payload as unknown as SessionPayload;
  } catch (error) {
    console.error("verifySessionToken failed:", error);
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await signSessionToken(payload);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return token;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}
