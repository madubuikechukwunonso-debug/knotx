// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Token and new password are required" },
        { status: 400 }
      );
    }

    const secret = new TextEncoder().encode(
      process.env.APP_SECRET || "dev-secret-change-me"
    );

    // Verify the reset token
    const { payload } = await jwtVerify(token, secret);

    if (payload.purpose !== "password-reset" || !payload.userId) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const userId = payload.userId as number;

    // Hash the new password (you can improve this with bcrypt later)
    // For now we store it directly. Consider using bcrypt in production.
    const passwordHash = newPassword; // TODO: Replace with bcrypt.hash(newPassword, 10)

    await prisma.localUser.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: "Invalid or expired reset token" },
      { status: 400 }
    );
  }
}
