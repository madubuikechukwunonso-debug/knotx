// src/app/api/bootstrap-admin/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

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

    // Check if admin already exists
    const existing = await prisma.localUser.findFirst({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Admin user already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.localUser.create({
      data: {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        displayName: name.trim(),
        passwordHash,
        role: "super_admin",
        isActive: true,
        isBlocked: false,
      },
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
