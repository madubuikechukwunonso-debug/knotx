import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, htmlBody } = body;

    if (!subject || !htmlBody) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    // ============================================
    // FETCH ALL RECIPIENTS (Subscribers + Local Users)
    // ============================================
    const [subscribers, localUsers] = await Promise.all([
      prisma.subscriber.findMany({
        where: { isActive: true },
        select: { email: true, name: true },
      }),
      prisma.localUser.findMany({
        select: { email: true, displayName: true },
      }),
    ]);

    // Combine unique emails (avoid duplicates)
    const allRecipients = new Map<string, string>();

    // Add subscribers
    subscribers.forEach((sub) => {
      allRecipients.set(sub.email, sub.name || 'Valued Customer');
    });

    // Add local users (if not already in subscribers)
    localUsers.forEach((user) => {
      if (!allRecipients.has(user.email)) {
        allRecipients.set(user.email, user.displayName || 'Valued Customer');
      }
    });

    const recipientCount = allRecipients.size;

    if (recipientCount === 0) {
      return NextResponse.json(
        { error: 'No active recipients found' },
        { status: 400 }
      );
    }

    // ============================================
    // MAILTRAP CONFIGURATION
    // ============================================
    const TOKEN = process.env.MAILTRAP_TOKEN;
    if (!TOKEN) {
      return NextResponse.json(
        { error: 'MAILTRAP_TOKEN is not configured in environment variables' },
        { status: 500 }
      );
    }

    const transport = nodemailer.createTransport(
      MailtrapTransport({ token: TOKEN })
    );

    const sender = {
      address: "admin@knotxandkrafts.com",
      name: "Knotx & Krafts",
    };

    // ============================================
    // SEND NEWSLETTER (using BCC for privacy)
    // ============================================
    const bccList = Array.from(allRecipients.keys());

    await transport.sendMail({
      from: sender,
      to: sender.address,           // Send to yourself (visible in Mailtrap)
      bcc: bccList,                 // All recipients in BCC (hidden from each other)
      subject: subject,
      html: htmlBody,
      category: "Newsletter Campaign",
    });

    console.log(`✅ Newsletter sent to ${recipientCount} recipients`);

    return NextResponse.json({
      success: true,
      recipientCount,
      message: `Campaign successfully sent to ${recipientCount} recipients`,
    });
  } catch (error: any) {
    console.error('Send campaign error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send campaign' },
      { status: 500 }
    );
  }
}
