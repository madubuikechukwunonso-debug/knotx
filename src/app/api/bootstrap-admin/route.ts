import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { localUsers } from "../../../../db/schema";

export async function GET() {
  try {
    const email = process.env.INITIAL_ADMIN_EMAIL;
    const password = process.env.INITIAL_ADMIN_PASSWORD;
    const name = process.env.INITIAL_ADMIN_NAME || "Admin";
    const username = process.env.INITIAL_ADMIN_USERNAME || "admin";

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing INITIAL_ADMIN_* environment variables",
        },
        { status: 400 },
      );
    }

    const database = db();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    const existing = await database
      .select()
      .from(localUsers)
      .where(
        or(
          eq(localUsers.email, normalizedEmail),
          eq(localUsers.username, normalizedUsername),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Admin user already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await database.insert(localUsers).values({
      username: normalizedUsername,
      email: normalizedEmail,
      displayName: name.trim(),
      passwordHash,
      role: "super_admin",
      isActive: 1,
      isBlocked: 0,
    });

    return NextResponse.json({
      success: true,
      message: "Default admin user created successfully",
      email: normalizedEmail,
    });
  } catch (error: any) {
    console.error("Bootstrap admin error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to create admin user",
      },
      { status: 500 },
    );
  }
}
