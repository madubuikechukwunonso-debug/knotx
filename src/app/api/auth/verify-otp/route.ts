// src/app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const verification = await prisma.otpVerification.findFirst({
      where: {
        email: email.toLowerCase(),
        otp: otp.trim(),
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP code" },
        { status: 400 }
      );
    }

    // Mark user as verified
    await prisma.localUser.updateMany({
      where: { email: email.toLowerCase() },
      data: { isActive: true },
    });

    // Delete used OTP
    await prisma.otpVerification.delete({
      where: { id: verification.id },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Verification failed" },
      { status: 500 }
    );
  }
}
