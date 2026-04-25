// src/app/api/profile/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const { displayName, email } = await req.json();

    // TODO: Add proper authentication check in production
    // For now we update the first LocalUser (demo). In real app use session token.

    const updatedUser = await prisma.localUser.updateMany({
      where: { email: { not: "" } }, // update the first user for demo
      data: {
        displayName: displayName || undefined,
        email: email || undefined,
      },
    });

    if (updatedUser.count === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Profile updated" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 });
  }
}
