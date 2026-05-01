import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';

interface OrderCancelledRequest {
  customerName: string;
  customerEmail: string;
  orderId: number;
  cancelledAt: string;
  reason?: string;
}

export async function POST(request: Request) {
  try {
    const body: OrderCancelledRequest = await request.json();
    const { customerName, customerEmail, orderId, cancelledAt, reason } = body;

    const TOKEN = process.env.MAILTRAP_TOKEN;
    if (!TOKEN) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const transport = nodemailer.createTransport(
      MailtrapTransport({ token: TOKEN })
    );

    const sender = {
      address: "hello@demomailtrap.co",
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
              <div style="width: 80px; height: 80px; background: #fee2e2; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span style="font-size: 40px;">😔</span>
              </div>
            </div>

            <h1 style="text-align: center; color: #111; font-size: 28px; margin: 0 0 12px 0; font-weight: 600;">
              Order Cancelled
            </h1>
            <p style="text-align: center; color: #666; font-size: 16px; margin: 0 0 30px 0;">
              We're sorry, ${customerName.split(' ')[0]}. Your order has been cancelled.
            </p>

            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 30px;">
              <p style="margin: 0; color: #991b1b; font-size: 15px;">
                <strong>Order #${orderId}</strong> has been cancelled
              </p>
              ${reason ? `<p style="margin: 12px 0 0 0; color: #b91c1c; font-size: 14px;">Reason: ${reason}</p>` : ''}
            </div>

            <div style="background: #f0fdf4; border-radius: 16px; padding: 24px; margin-bottom: 30px;">
              <h3 style="margin: 0 0 12px 0; color: #166534; font-size: 16px;">💚 What Happens Next?</h3>
              <p style="margin: 0; color: #4ade80; font-size: 14px; line-height: 1.6;">
                If you were charged, a full refund will be processed within 3-5 business days. You'll receive a separate email once the refund is complete.
              </p>
            </div>

            <div style="text-align: center;">
              <p style="color: #666; font-size: 15px; margin-bottom: 20px;">
                We hope to serve you better next time!
              </p>
              <a href="https://knotxandkrafts.com/shop" style="display: inline-block; background: #111; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 600;">
                Browse Our Shop
              </a>
            </div>

            <div style="text-align: center; padding-top: 30px; border-top: 1px solid #eee; margin-top: 30px;">
              <p style="margin: 0; color: #999; font-size: 13px;">
                Questions? Contact us at <a href="mailto:hello@knotxandkrafts.com" style="color: #111;">hello@knotxandkrafts.com</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transport.sendMail({
      from: sender,
      to: customerEmail,
      subject: `❌ Order Cancelled - #${orderId} | KnotXandKrafts`,
      html,
      category: "Order Cancelled",
    });

    console.log(`Cancellation email sent to ${customerEmail} for order #${orderId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Send order cancelled error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
