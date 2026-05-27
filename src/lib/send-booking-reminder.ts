// src/lib/send-booking-reminder.ts
import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';

interface BookingWithDetails {
  id: number;
  customerName: string;
  customerEmail: string;
  serviceType: string;
  date: string;
  time: string;
  staffUserId?: number | null;
}

export async function sendBookingReminder(
  booking: BookingWithDetails,
  type: '24h' | '12h' | '1h',
  braiderEmail?: string | null
) {
  const TOKEN = process.env.MAILTRAP_TOKEN;
  if (!TOKEN) {
    console.error('MAILTRAP_TOKEN not configured');
    return;
  }

  const transport = nodemailer.createTransport(
    MailtrapTransport({ token: TOKEN })
  );

  const sender = {
    address: process.env.MAILTRAP_FROM_EMAIL || 'admin@KnotXandKrafts.com',
    name: process.env.MAILTRAP_FROM_NAME || 'KnotXandKrafts',
  };

  let subject = '';
  let html = '';

  const appointmentDateTime = `${booking.date} at ${booking.time}`;

  if (type === '24h') {
    subject = `Reminder: Your appointment is tomorrow - ${booking.serviceType}`;
    html = generateReminderEmail(booking, '24 hours', true);
  } else if (type === '12h') {
    subject = `Reminder: Your appointment is in 12 hours - ${booking.serviceType}`;
    html = generateReminderEmail(booking, '12 hours', true);
  } else if (type === '1h') {
    subject = `Final Reminder: Appointment in 1 hour - ${booking.serviceType}`;
    html = generateReminderEmail(booking, '1 hour', false);
  }

  const recipients: string[] = [];

  if (type === '24h' || type === '12h') {
    recipients.push(booking.customerEmail);
  }

  if (braiderEmail) recipients.push(braiderEmail);
  if (type === '1h' && process.env.ADMIN_EMAIL) {
    recipients.push(process.env.ADMIN_EMAIL);
  }

  if (recipients.length === 0) return;

  await transport.sendMail({
    from: sender,
    to: recipients,
    subject,
    html,
  });

  console.log(`✅ Sent ${type} reminder for booking #${booking.id}`);
}

function generateReminderEmail(
  booking: BookingWithDetails,
  timeFrame: string,
  includeCustomer: boolean
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #111;">Appointment Reminder</h2>
      <p>Hi${includeCustomer ? ` ${booking.customerName}` : ''},</p>
      
      <p>This is a reminder that you have an upcoming appointment:</p>
      
      <div style="background: #f8f5f0; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <p><strong>Service:</strong> ${booking.serviceType}</p>
        <p><strong>Date & Time:</strong> ${booking.date} at ${booking.time}</p>
      </div>

      <p>This appointment is in <strong>${timeFrame}</strong>.</p>

      ${
        includeCustomer
          ? `<p>If you need to reschedule or cancel, please contact us as soon as possible.</p>`
          : `<p>Please prepare for the upcoming appointment.</p>`
      }

      <p>Thank you,<br/>KnotXandKrafts Team</p>
    </div>
  `;
}
