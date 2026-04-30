import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';

export async function POST(request: Request) {
  try {
    const { customerName, customerEmail, serviceName, bookingDate, bookingTime, braiderName, cancellationReason } = await request.json();

    const TOKEN = process.env.MAILTRAP_TOKEN;
    if (!TOKEN) return NextResponse.json({ success: false, error: 'MAILTRAP_TOKEN not configured' }, { status: 500 });

    const transport = nodemailer.createTransport(MailtrapTransport({ token: TOKEN }));

    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><title>Booking Canceled - KnotXandKrafts</title></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 40px 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
            
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 40px 36px; text-align: center;">
              <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                <span style="font-size: 32px;">❌</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Booking Canceled</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px;">We're sorry to see you go</p>
            </div>

            <div style="padding: 40px;">
              <p style="font-size: 17px; color: #111; margin: 0 0 24px;">Hi ${customerName},</p>
              
              <p style="color: #555; line-height: 1.7; font-size: 15px; margin-bottom: 28px;">
                Your booking has been canceled. Here are the details:
              </p>

              <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 14px; padding: 24px; margin-bottom: 28px;">
                <div style="margin-bottom: 14px;">
                  <span style="color: #991b1b; font-size: 13px; font-weight: 500;">SERVICE</span><br>
                  <span style="color: #7f1d1d; font-weight: 700; font-size: 16px;">${serviceName}</span>
                </div>
                <div style="margin-bottom: 14px;">
                  <span style="color: #991b1b; font-size: 13px; font-weight: 500;">DATE & TIME</span><br>
                  <span style="color: #7f1d1d; font-weight: 700; font-size: 16px;">${bookingDate} at ${bookingTime}</span>
                </div>
                <div>
                  <span style="color: #991b1b; font-size: 13px; font-weight: 500;">BRAIDER</span><br>
                  <span style="color: #7f1d1d; font-weight: 700; font-size: 16px;">${braiderName}</span>
                </div>
              </div>

              ${cancellationReason ? `
                <div style="background: #f8fafc; border-radius: 12px; padding: 18px 20px; margin-bottom: 28px;">
                  <span style="color: #666; font-size: 13px; font-weight: 500;">REASON</span><br>
                  <span style="color: #444; font-size: 15px;">${cancellationReason}</span>
                </div>
              ` : ''}

              <p style="color: #555; font-size: 14.5px; line-height: 1.7;">
                If you'd like to reschedule, please visit our website or reply to this email.
              </p>

              <div style="margin-top: 36px; padding-top: 24px; border-top: 1px solid #eee; text-align: center;">
                <p style="color: #888; font-size: 13px; margin: 0;">
                  We hope to see you again soon at <a href="https://knotxandkrafts.com" style="color: #111;">KnotXandKrafts</a>
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
      to: customerEmail,
      subject: `❌ Booking Canceled - ${serviceName}`,
      html,
      category: "Booking Canceled",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Canceled email error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
