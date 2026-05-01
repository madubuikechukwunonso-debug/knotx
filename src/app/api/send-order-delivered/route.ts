import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';

interface OrderDeliveredRequest {
  customerName: string;
  customerEmail: string;
  orderId: number;
  deliveredAt: string;
}

export async function POST(request: Request) {
  try {
    const body: OrderDeliveredRequest = await request.json();
    const { customerName, customerEmail, orderId, deliveredAt } = body;

    const TOKEN = process.env.MAILTRAP_TOKEN;
    if (!TOKEN) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const transport = nodemailer.createTransport(
      MailtrapTransport({ token: TOKEN })
    );

    const sender = {
      address: "admin@KnotXandKrafts.com",
      name: "KnotXandKrafts",
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <div style="display: inline-block; background: #111; color: white; padding: 12px 24px; border-radius: 50px; font-size: 14px; font-weight: 600; letter-spacing: 1px;">
                KNOTXANDKRAFTS
              </div>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 80px; height: 80px; background: #dcfce7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span style="font-size: 40px;">🎉</span>
              </div>
            </div>

            <h1 style="text-align: center; color: #111; font-size: 28px; margin: 0 0 12px 0; font-weight: 600;">
              Your Order Has Been Delivered!
            </h1>
            <p style="text-align: center; color: #666; font-size: 16px; margin: 0 0 30px 0;">
              We hope you love your new items, ${customerName.split(' ')[0]}!
            </p>

            <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 20px; padding: 32px; text-align: center; margin-bottom: 30px;">
              <p style="margin: 0; color: #166534; font-size: 18px; font-weight: 600;">
                ✅ Order #${orderId} Delivered
              </p>
              <p style="margin: 12px 0 0 0; color: #4ade80; font-size: 14px;">
                ${new Date(deliveredAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <p style="color: #666; font-size: 15px; line-height: 1.7;">
                We'd love to hear about your experience! Your feedback helps us create better products.
              </p>
              <a href="https://knotxandkrafts.com/rateus" style="display: inline-block; background: #111; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; margin-top: 16px;">
                Rate Your Experience ⭐
              </a>
            </div>

            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #999; font-size: 13px;">
                Thank you for shopping with us! 💚
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transport.sendMail({
      from: sender,
      to: customerEmail,
      subject: `🎉 Order Delivered - #${orderId} | KnotXandKrafts`,
      html,
      category: "Order Delivered",
    });

    console.log(`Delivery confirmation sent to ${customerEmail} for order #${orderId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Send order delivered error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
