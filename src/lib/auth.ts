// src/lib/auth.ts
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "./prisma";
import { env } from "./env";

export type AuthUser = {
  id: number;
  userType: "local";
  role: string;
  email: string;
  name: string;
};

export async function loginCredentials(identifier: string, password: string): Promise<AuthUser> {
  const user = await prisma.localUser.findFirst({
    where: {
      OR: [
        { email: identifier.toLowerCase() },
        { username: identifier },
      ],
    },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

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
    role: user.role,
    email: user.email,
    name: user.displayName || user.username,
  };
}

export async function registerCredentials(data: {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}): Promise<AuthUser> {
  const username = data.username.trim();
  const email = data.email.trim().toLowerCase();
  const password = data.password;
  const displayName = data.displayName?.trim();

  const existing = await prisma.localUser.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existing) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.localUser.create({
    data: {
      username,
      email,
      displayName: displayName || username,
      passwordHash,
      role: "user",
      isActive: true,
      isBlocked: false,
    },
  });

  return {
    id: user.id,
    userType: "local",
    role: user.role,
    email: user.email,
    name: user.displayName || user.username,
  };
}
