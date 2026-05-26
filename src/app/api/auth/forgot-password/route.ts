// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";
import { SignJWT } from "jose";

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

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a reset link has been sent.",
      });
    }

    // Generate secure reset token (valid for 1 hour)
    const secret = new TextEncoder().encode(
      process.env.APP_SECRET || "dev-secret-change-me"
    );

    const resetToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      purpose: "password-reset",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);

    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    // Send email using Mailtrap
    const TOKEN = process.env.MAILTRAP_TOKEN;
    if (!TOKEN) {
      console.error("MAILTRAP_TOKEN is not configured");
      return NextResponse.json(
        { success: false, message: "Email service not configured" },
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
          <title>Reset Your Password - KnotXandKrafts</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 40px 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); padding: 40px 40px 36px; text-align: center;">
              <div style="width: 72px; height: 72px; background: rgba(255,255,255,0.1); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto 18px;">
                <span style="font-size: 36px;">🔑</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Reset Your Password</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 15px;">KnotXandKrafts</p>
            </div>

            <div style="padding: 40px;">
              <p style="font-size: 17px; color: #111; margin: 0 0 20px;">Hi ${user.displayName || user.username},</p>
              
              <p style="color: #555; line-height: 1.7; font-size: 15px; margin-bottom: 28px;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>

              <!-- Reset Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background: #111827; color: white; padding: 14px 32px; 
                          text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
                  Reset Password
                </a>
              </div>

              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
              </p>

              <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #eee; text-align: center;">
                <p style="color: #888; font-size: 13px; margin: 0;">
                  Need help? Contact us at <a href="mailto:support@knotxandkrafts.com" style="color: #111;">support@knotxandkrafts.com</a>
                </p>
              </div>
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
      to: user.email,
      subject: "🔑 Reset Your Password - KnotXandKrafts",
      html,
      category: "Password Reset",
    });

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a reset link has been sent.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process request" },
      { status: 500 }
    );
  }
}
