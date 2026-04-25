// src/app/api/profile/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const { id, currentPassword, newPassword } = await req.json();

    console.log("Received password change request for user ID:", id);

    if (!id || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "All fields are required (id, currentPassword, newPassword)" },
        { status: 400 }
      );
    }

    const user = await prisma.localUser.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await prisma.localUser.update({
      where: { id: Number(id) },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to change password" },
      { status: 500 }
    );
  }
}
