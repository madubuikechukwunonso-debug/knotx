import bcrypt from 'bcryptjs';
import { eq, or } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { db } from './db';
import { SESSION_COOKIE, signSession, type SessionPayload } from './session';
import { localUsers } from '../../db/schema';
import { env } from './env';

export async function bootstrapInitialAdmin() {
  if (!env.initialAdminEmail || !env.initialAdminPassword) return;
  const database = db();
  const [existing] = await database
    .select()
    .from(localUsers)
    .where(or(eq(localUsers.email, env.initialAdminEmail), eq(localUsers.role, 'super_admin')))
    .limit(1);

  if (existing && existing.role === 'super_admin') return;

  const passwordHash = await bcrypt.hash(env.initialAdminPassword, 10);
  if (existing) {
    await database
      .update(localUsers)
      .set({
        username: env.initialAdminUsername || existing.username,
        email: env.initialAdminEmail,
        displayName: env.initialAdminName,
        passwordHash,
        role: 'super_admin',
        isActive: 1,
        isBlocked: 0,
      })
      .where(eq(localUsers.id, existing.id));
    return;
  }

  await database.insert(localUsers).values({
    username: env.initialAdminUsername || env.initialAdminEmail.split('@')[0],
    email: env.initialAdminEmail,
    displayName: env.initialAdminName,
    passwordHash,
    role: 'super_admin',
    isActive: 1,
    isBlocked: 0,
  });
}

export async function authenticateCredentials(identifier: string, password: string) {
  const database = db();
  const [user] = await database
    .select()
    .from(localUsers)
    .where(or(eq(localUsers.username, identifier), eq(localUsers.email, identifier)))
    .limit(1);

  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid || user.isBlocked || !user.isActive) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.displayName || user.username,
    role: user.role,
    userType: 'local' as const,
  };
}

export async function registerCredentials(input: { username: string; email: string; password: string; displayName?: string }) {
  const database = db();
  const [byUsername] = await database.select().from(localUsers).where(eq(localUsers.username, input.username)).limit(1);
  if (byUsername) throw new Error('Username already taken');
  const [byEmail] = await database.select().from(localUsers).where(eq(localUsers.email, input.email)).limit(1);
  if (byEmail) throw new Error('Email already registered');
  const passwordHash = await bcrypt.hash(input.password, 10);
  const result = await database.insert(localUsers).values({
    username: input.username,
    email: input.email,
    displayName: input.displayName || input.username,
    passwordHash,
    role: 'user',
    isActive: 1,
    isBlocked: 0,
  });
  const id = Number(result[0].insertId);
  return { id, username: input.username, email: input.email, name: input.displayName || input.username, role: 'user', userType: 'local' as const };
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return token;
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
}
