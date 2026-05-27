// src/app/api/admin/notify-new-booking/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";

export async function POST(req: NextRequest) {
  try {
    const {
      bookingId,
      customerName,
      customerEmail,
      serviceName,
      bookingDate,
      bookingTime,
      braiderName,
      totalAmount,
    } = await req.json();

    const TOKEN = process.env.MAILTRAP_TOKEN;
    const adminEmail = process.env.SUPER_ADMIN_EMAIL;

    if (!TOKEN || !adminEmail) {
      return NextResponse.json({ success: false, message: "Missing env vars" }, { status: 500 });
    }

    const transport = nodemailer.createTransport(MailtrapTransport({ token: TOKEN }));

    const sender = {
      address: process.env.MAILTRAP_FROM_EMAIL || "admin@KnotXandKrafts.com",
      name: process.env.MAILTRAP_FROM_NAME || "KnotXandKrafts",
    };

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111;">🆕 New Service Booking</h2>
        <p>A new booking has been confirmed via Stripe.</p>
        
        <div style="background: #f8f5f0; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p><strong>Booking ID:</strong> #${bookingId}</p>
          <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
          <p><strong>Service:</strong> ${serviceName}</p>
          <p><strong>Date & Time:</strong> ${bookingDate} at ${bookingTime}</p>
          <p><strong>Braider:</strong> ${braiderName}</p>
          <p><strong>Total Paid:</strong> $${(totalAmount / 100).toFixed(2)}</p>
        </div>

        <p>Please check the admin dashboard for more details.</p>
      </div>
    `;

    await transport.sendMail({
      from: sender,
      to: adminEmail,
      subject: `🆕 New Booking: ${customerName} - ${serviceName}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notify new booking error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
