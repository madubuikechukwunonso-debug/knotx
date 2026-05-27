// src/lib/send-admin-notification.ts
import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';

interface AdminNotificationParams {
  type: 'new_booking' | 'new_order';
  title: string;
  details: string;
}

export async function sendAdminNotification({ type, title, details }: AdminNotificationParams) {
  const TOKEN = process.env.MAILTRAP_TOKEN;
  const adminEmail = process.env.SUPER_ADMIN_EMAIL;

  if (!TOKEN || !adminEmail) {
    console.error('Missing MAILTRAP_TOKEN or SUPER_ADMIN_EMAIL');
    return;
  }

  const transport = nodemailer.createTransport(
    MailtrapTransport({ token: TOKEN })
  );

  const sender = {
    address: process.env.MAILTRAP_FROM_EMAIL || 'admin@KnotXandKrafts.com',
    name: process.env.MAILTRAP_FROM_NAME || 'KnotXandKrafts',
  };

  const subject = type === 'new_booking' 
    ? `🆕 New Service Booking: ${title}` 
    : `🛒 New Product Order: ${title}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2>${subject}</h2>
      <p><strong>${title}</strong></p>
      <div style="background: #f8f5f0; padding: 16px; border-radius: 8px; margin: 16px 0;">
        ${details}
      </div>
      <p style="color: #666; font-size: 13px;">This is an automated notification from KnotXandKrafts.</p>
    </div>
  `;

  await transport.sendMail({
    from: sender,
    to: adminEmail,
    subject,
    html,
  });

  console.log(`✅ Admin notification sent: ${type}`);
}
