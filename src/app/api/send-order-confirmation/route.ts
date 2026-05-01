import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';

export async function POST(request: Request) {
  try {
    const { customerName, customerEmail, orderId, total, items } = await request.json();

    const TOKEN = process.env.MAILTRAP_TOKEN;
    if (!TOKEN) return NextResponse.json({ success: false }, { status: 500 });

    const transport = nodemailer.createTransport(MailtrapTransport({ token: TOKEN }));

    const sender = {
      address: process.env.MAILTRAP_FROM_EMAIL || "admin@KnotXandKrafts.com",
      name: process.env.MAILTRAP_FROM_NAME || "KnotXandKrafts",
    };

    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.name} × ${item.quantity}</td>
        <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #eee;">$${(item.price * item.quantity / 100).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Confirmation #${orderId}</h2>
        <p>Hi ${customerName},</p>
        <p>Thank you for your order! We've received your payment and will process it shortly.</p>
        
        <h3>Order Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
          <tr>
            <td style="padding: 12px 0; font-weight: bold;">Total</td>
            <td style="padding: 12px 0; text-align: right; font-weight: bold;">$${(total / 100).toFixed(2)}</td>
          </tr>
        </table>

        <p>We'll send you a shipping confirmation email when your order ships.</p>
        <p>Questions? Reply to this email.</p>
      </div>
    `;

    await transport.sendMail({
      from: sender,
      to: customerEmail,
      subject: `Order Confirmation #${orderId} - KnotXandKrafts`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
