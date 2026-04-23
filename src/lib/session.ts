import { cookies } from 'next/headers';
import * as jose from 'jose';
import { env } from './env';

export const SESSION_COOKIE = 'knotx_session';
const secret = new TextEncoder().encode(env.appSecret);

export type SessionPayload = {
  userId: number;
  userType: 'local' | 'oauth';
  role: 'user' | 'worker' | 'admin' | 'super_admin';
  email?: string | null;
  name?: string | null;
};

export async function signSession(payload: SessionPayload) {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}
