// src/app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.localUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "No account found with this email" },
        { status: 404 }
      );
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old OTPs
    await prisma.otpVerification.deleteMany({
      where: { email: email.toLowerCase() },
    });

    // Save new OTP
    await prisma.otpVerification.create({
      data: {
        email: email.toLowerCase(),
        otp,
        expiresAt,
      },
    });

    // === Mailtrap Setup (using your provided pattern) ===
    const TOKEN = process.env.MAILTRAP_TOKEN;
    if (!TOKEN) {
      return NextResponse.json(
        { success: false, error: "MAILTRAP_TOKEN not configured" },
        { status: 500 }
      );
    }

    const transport = nodemailer.createTransport(
      MailtrapTransport({ token: TOKEN })
    );

    const sender = {
      address: process.env.MAILTRAP_FROM_EMAIL || "admin@KnotXandKrafts.com",
      name: process.env.MAILTRAP_FROM_NAME || "KnotXandKrafts",
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email - KnotXandKrafts</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 40px 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); padding: 40px 40px 36px; text-align: center;">
              <div style="width: 72px; height: 72px; background: rgba(255,255,255,0.1); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto 18px;">
                <span style="font-size: 36px;">🔐</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Verify Your Email</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px;">Complete your registration</p>
            </div>

            <div style="padding: 40px;">
              <p style="font-size: 17px; color: #111; margin: 0 0 20px;">Hi there,</p>
              
              <p style="color: #555; line-height: 1.7; font-size: 15px; margin-bottom: 28px;">
                Thank you for creating an account with <strong>KnotXandKrafts</strong>.<br>
                Please use the verification code below to complete your registration:
              </p>

              <!-- OTP Box -->
              <div style="background: #f8fafc; border: 2px dashed #64748b; border-radius: 16px; padding: 32px 24px; text-align: center; margin-bottom: 32px;">
                <p style="color: #64748b; font-size: 13px; margin: 0 0 8px; font-weight: 600; letter-spacing: 1px;">YOUR VERIFICATION CODE</p>
                <div style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #111; font-family: 'SF Mono', monospace;">
                  ${otp}
                </div>
              </div>

              <p style="color: #555; font-size: 14.5px; line-height: 1.6;">
                This code will expire in <strong>10 minutes</strong>.
              </p>

              <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </div>

            <div style="background: #fafafa; padding: 22px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #f0f0f0;">
              © ${new Date().getFullYear()} KnotXandKrafts. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    await transport.sendMail({
      from: sender,
      to: email,
      subject: "🔐 Your Verification Code - KnotXandKrafts",
      html,
      category: "Email Verification",
    });

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
