import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';

interface OrderShippedRequest {
  customerName: string;
  customerEmail: string;
  orderId: number;
  trackingNumber: string;
  shippingCarrier: string;
  estimatedDelivery: string;
}

export async function POST(request: Request) {
  try {
    const body: OrderShippedRequest = await request.json();
    const { customerName, customerEmail, orderId, trackingNumber, shippingCarrier, estimatedDelivery } = body;

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
              <div style="width: 80px; height: 80px; background: #dbeafe; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span style="font-size: 40px;">🚚</span>
              </div>
            </div>

            <h1 style="text-align: center; color: #111; font-size: 28px; margin: 0 0 12px 0; font-weight: 600;">
              Your Order Has Shipped!
            </h1>
            <p style="text-align: center; color: #666; font-size: 16px; margin: 0 0 30px 0;">
              Great news, ${customerName.split(' ')[0]}! Your order is on its way.
            </p>

            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 20px; padding: 32px; color: white; text-align: center; margin-bottom: 30px;">
              <p style="margin: 0 0 8px 0; opacity: 0.8; font-size: 14px;">TRACKING NUMBER</p>
              <p style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; letter-spacing: 2px;">${trackingNumber}</p>
              
              <div style="background: rgba(255,255,255,0.2); border-radius: 12px; padding: 16px; margin-top: 20px;">
                <p style="margin: 0 0 4px 0; font-size: 13px; opacity: 0.8;">CARRIER</p>
                <p style="margin: 0; font-size: 18px; font-weight: 600;">${shippingCarrier}</p>
              </div>
            </div>

            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 30px;">
              <p style="margin: 0; color: #166534; font-size: 15px;">
                📅 <strong>Estimated Delivery:</strong> ${estimatedDelivery}
              </p>
            </div>

            <p style="text-align: center; color: #666; font-size: 15px; line-height: 1.6;">
              You can track your package using the tracking number above on the carrier's website.
            </p>

            <div style="text-align: center; padding-top: 30px; border-top: 1px solid #eee; margin-top: 30px;">
              <p style="margin: 0; color: #999; font-size: 13px;">
                Questions? Contact us at <a href="mailto:hello@knotxandkrafts.com" style="color: #3b82f6;">hello@knotxandkrafts.com</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transport.sendMail({
      from: sender,
      to: customerEmail,
      subject: `🚚 Order Shipped - #${orderId} | KnotXandKrafts`,
      html,
      category: "Order Shipped",
    });

    console.log(`Shipping notification sent to ${customerEmail} for order #${orderId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Send order shipped error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
