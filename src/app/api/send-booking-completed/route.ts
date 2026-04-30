import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';

export async function POST(request: Request) {
  try {
    const { customerName, customerEmail, serviceName, bookingDate, bookingTime, braiderName } = await request.json();

    const TOKEN = process.env.MAILTRAP_TOKEN;
    if (!TOKEN) return NextResponse.json({ success: false, error: 'MAILTRAP_TOKEN not configured' }, { status: 500 });

    const transport = nodemailer.createTransport(MailtrapTransport({ token: TOKEN }));

    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><title>Thank You - KnotXandKrafts</title></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 40px 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
            
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 40px 36px; text-align: center;">
              <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                <span style="font-size: 32px;">🎉</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Thank You!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 15px;">We hope you loved your experience</p>
            </div>

            <div style="padding: 40px;">
              <p style="font-size: 17px; color: #111; margin: 0 0 24px;">Hi ${customerName},</p>
              
              <p style="color: #555; line-height: 1.7; font-size: 15px; margin-bottom: 28px;">
                Thank you for choosing KnotXandKrafts! We hope you had a wonderful experience with ${braiderName}.
              </p>

              <div style="background: #f8fafc; border-radius: 14px; padding: 24px; margin-bottom: 32px; text-align: center;">
                <div style="margin-bottom: 16px;">
                  <span style="color: #666; font-size: 13px; font-weight: 500;">SERVICE</span><br>
                  <span style="color: #111; font-weight: 700; font-size: 17px;">${serviceName}</span>
                </div>
                <div>
                  <span style="color: #666; font-size: 13px; font-weight: 500;">DATE</span><br>
                  <span style="color: #111; font-weight: 700; font-size: 16px;">${bookingDate} at ${bookingTime}</span>
                </div>
              </div>

              <!-- RATE US BUTTON -->
              <div style="text-align: center; margin: 36px 0;">
                <a href="https://knotxandkrafts.com/rateus" 
                   style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);">
                  ⭐ Rate Your Experience
                </a>
                <p style="color: #888; font-size: 12px; margin-top: 12px;">Your feedback helps us improve!</p>
              </div>

              <p style="color: #555; font-size: 14.5px; line-height: 1.7; text-align: center;">
                We can't wait to see you again soon! 💜
              </p>

              <div style="margin-top: 36px; padding-top: 24px; border-top: 1px solid #eee; text-align: center;">
                <p style="color: #888; font-size: 13px; margin: 0;">
                  Follow us on Instagram <a href="https://instagram.com/knotxandkrafts" style="color: #111;">@knotxandkrafts</a>
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
      subject: `🎉 Thank You for Booking with KnotXandKrafts!`,
      html,
      category: "Booking Completed",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Completed email error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
