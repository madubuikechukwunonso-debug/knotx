// src/app/api/bootstrap-admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/server/queries/connection";   // now works with alias
import { localUsers } from "@/db/schema";             // now works with alias
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const email = process.env.INITIAL_ADMIN_EMAIL;
    const password = process.env.INITIAL_ADMIN_PASSWORD;
    const name = process.env.INITIAL_ADMIN_NAME || "Admin";
    const username = process.env.INITIAL_ADMIN_USERNAME || "admin";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing INITIAL_ADMIN_* environment variables" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if admin already exists
    const existing = await db
      .select()
      .from(localUsers)
      .where(eq(localUsers.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Admin user already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.insert(localUsers).values({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      displayName: name.trim(),
      passwordHash,
      role: "super_admin",
      isActive: 1,
      isBlocked: 0,
    });

    console.log("✅ Default admin user created successfully");

    return NextResponse.json({
      success: true,
      message: "Default admin user created successfully",
      email,
    });
  } catch (error: any) {
    console.error("Bootstrap admin error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create admin user" },
      { status: 500 }
    );
  }
}
