// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ messages: [] }, { status: 401 });
    }

    const user = await prisma.localUser.findUnique({
      where: { id: session.userId },
      select: { email: true },
    });

    if (!user?.email) {
      return NextResponse.json({ messages: [] });
    }

    const messages = await prisma.contactMessage.findMany({
      where: {
        email: user.email.toLowerCase(),
      },
      orderBy: { createdAt: "desc" },
      include: {
        replies: {
          orderBy: { sentAt: "asc" },
          select: { id: true, body: true, sentAt: true },
        },
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, name, email, subject } = await req.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const newMessage = await prisma.contactMessage.create({
      data: {
        name: name && typeof name === "string" ? name.trim() : "Website Visitor",
        email: cleanEmail,
        subject: subject && typeof subject === "string" ? subject.trim() : null,
        message: message.trim(),
        status: "new",
        read: false,
      },
    });

    // ============================================
    // NOTIFY ADMIN ONLY ON THE USER'S FIRST MESSAGE
    // ============================================
    const messageCount = await prisma.contactMessage.count({
      where: { email: cleanEmail },
    });

    if (messageCount === 1) {
      await sendAdminNewMessageNotification({
        name: newMessage.name,
        email: cleanEmail,
        subject: newMessage.subject,
        message: newMessage.message,
      });
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

// ============================================
// ADMIN NOTIFICATION (Mailtrap)
// ============================================
async function sendAdminNewMessageNotification({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string | null;
  message: string;
}) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn("[Messages] ADMIN_EMAIL not set. Skipping admin notification.");
      return;
    }

    const TOKEN = process.env.MAILTRAP_TOKEN;
    if (!TOKEN) {
      console.warn("[Messages] MAILTRAP_TOKEN not set. Skipping admin notification.");
      return;
    }

    const transport = nodemailer.createTransport(
      MailtrapTransport({ token: TOKEN })
    );

    const sender = {
      address: process.env.MAILTRAP_FROM_EMAIL || "admin@KnotXandKrafts.com",
      name: process.env.MAILTRAP_FROM_NAME || "KnotXandKrafts",
    };

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f5f0; padding: 40px 20px;">
        <div style="background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
          <h2 style="color: #111; margin: 0 0 8px; font-size: 22px;">📩 New Customer Inquiry</h2>
          <p style="color: #666; margin: 0 0 24px;">This is the customer's <strong>first message</strong>.</p>

          <div style="background: #f8f5f0; padding: 24px; border-radius: 16px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 0 0 8px;"><strong>Email:</strong> ${email}</p>
            ${subject ? `<p style="margin: 0 0 8px;"><strong>Subject:</strong> ${subject}</p>` : ""}
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee;">
              <p style="margin: 0 0 8px; font-weight: 600; color: #111;">Message:</p>
              <p style="margin: 0; color: #333; white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
          </div>

          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://knotxandkrafts.com'}/admin/messages" 
             style="display: inline-block; background: #111; color: white; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 500; font-size: 14px;">
            View Conversation in Admin →
          </a>
        </div>
        
        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 24px;">
          This notification was sent because this is the first message from this customer.
        </p>
      </div>
    `;

    await transport.sendMail({
      from: sender,
      to: adminEmail,
      subject: `📩 New Message from ${name}`,
      html,
      category: "New Customer Message",
    });

    console.log(`[Messages] Admin notified about first message from ${email}`);
  } catch (err) {
    console.error("[Messages] Failed to send admin notification:", err);
    // Do not throw — we don't want to break the user's message sending
  }
}
