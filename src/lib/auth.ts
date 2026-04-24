// src/lib/auth.ts
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "./prisma";
import { env } from "./env";

export async function loginUser(identifier: string, password: string) {
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

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    throw new Error("Invalid credentials");
  }

  if (user.isBlocked || !user.isActive) {
    throw new Error("This account is unavailable");
  }

  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(env.appSecret));

  return { token, user };
}

export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}) {
  const existing = await prisma.localUser.findFirst({
    where: {
      OR: [
        { email: data.email.toLowerCase() },
        { username: data.username },
      ],
    },
  });

  if (existing) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.localUser.create({
    data: {
      username: data.username.trim(),
      email: data.email.trim().toLowerCase(),
      displayName: data.displayName?.trim() || data.username,
      passwordHash,
      role: "user",
      isActive: true,
      isBlocked: false,
    },
  });

  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(env.appSecret));

  return { token, user };
}
