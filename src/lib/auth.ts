import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { localUsers } from "../../db/schema";
import type { SessionRole } from "@/lib/session";

type CredentialsLoginInput = {
  identifier: string;
  password: string;
};

type CredentialsRegisterInput = {
  username: string;
  email: string;
  password: string;
  displayName?: string;
};

export type AuthUser = {
  id: number;
  userType: "local" | "oauth";
  role: SessionRole;
  email: string;
  name: string;
};

export async function loginCredentials(
  input: CredentialsLoginInput,
): Promise<AuthUser> {
  const identifier = input.identifier.trim();
  const password = input.password;

  if (!identifier || !password) {
    throw new Error("Identifier and password are required");
  }

  const users = await db()
    .select()
    .from(localUsers)
    .where(
      or(
        eq(localUsers.username, identifier),
        eq(localUsers.email, identifier),
      ),
    )
    .limit(1);

  if (users.length === 0) {
    throw new Error("Invalid credentials");
  }

  const user = users[0];
  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    throw new Error("Invalid credentials");
  }

  if (user.isBlocked || !user.isActive) {
    throw new Error("This account is unavailable");
  }

  return {
    id: user.id,
    userType: "local",
    role: user.role as SessionRole,
    email: user.email,
    name: user.displayName || user.username,
  };
}

export async function registerCredentials(
  input: CredentialsRegisterInput,
): Promise<AuthUser> {
  const username = input.username.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const displayName = input.displayName?.trim();

  if (!username || !email || !password) {
    throw new Error("Username, email and password are required");
  }

  const existingUsername = await db()
    .select()
    .from(localUsers)
    .where(eq(localUsers.username, username))
    .limit(1);

  if (existingUsername.length > 0) {
    throw new Error("Username already taken");
  }

  const existingEmail = await db()
    .select()
    .from(localUsers)
    .where(eq(localUsers.email, email))
    .limit(1);

  if (existingEmail.length > 0) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await db().insert(localUsers).values({
    username,
    email,
    displayName: displayName || username,
    passwordHash,
    role: "user",
    isActive: 1,
    isBlocked: 0,
  });

  const userId = Number(result[0].insertId);

  return {
    id: userId,
    userType: "local",
    role: "user",
    email,
    name: displayName || username,
  };
}
