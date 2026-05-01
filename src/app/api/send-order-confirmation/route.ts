import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';

interface OrderConfirmationRequest {
  customerName: string;
  customerEmail: string;
  orderId: number;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress?: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
  };
}

export async function POST(request: Request) {
  try {
    const body: OrderConfirmationRequest = await request.json();
    const { customerName, customerEmail, orderId, total, items, shippingAddress } = body;

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

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price / 100).toFixed(2)}</td>
      </tr>
    `).join('');

    const addressHtml = shippingAddress && shippingAddress.line1 ? `
      <div style="background: #f8f9fa; padding: 16px; border-radius: 12px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #111;">📍 Shipping Address:</p>
        <p style="margin: 0; color: #666; line-height: 1.6;">
          ${shippingAddress.line1}<br />
          ${shippingAddress.line2 ? shippingAddress.line2 + '<br />' : ''}
          ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}<br />
          ${shippingAddress.country}
        </p>
      </div>
    ` : '';

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
              <div style="width: 80px; height: 80px; background: #d1fae5; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span style="font-size: 40px;">✅</span>
              </div>
            </div>

            <h1 style="text-align: center; color: #111; font-size: 28px; margin: 0 0 12px 0; font-weight: 600;">
              Order Confirmed!
            </h1>
            <p style="text-align: center; color: #666; font-size: 16px; margin: 0 0 30px 0;">
              Thank you for your purchase, ${customerName.split(' ')[0]}!
            </p>

            <div style="background: #f8f9fa; border-radius: 16px; padding: 24px; margin-bottom: 30px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
                <div>
                  <p style="margin: 0; color: #999; font-size: 13px;">ORDER NUMBER</p>
                  <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: 700; color: #111;">#${orderId}</p>
                </div>
                <div style="text-align: right;">
                  <p style="margin: 0; color: #999; font-size: 13px;">TOTAL</p>
                  <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: 700; color: #111;">$${(total / 100).toFixed(2)}</p>
                </div>
              </div>

              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 8px 12px; color: #999; font-size: 12px; font-weight: 500;">ITEM</th>
                    <th style="text-align: center; padding: 8px 12px; color: #999; font-size: 12px; font-weight: 500;">QTY</th>
                    <th style="text-align: right; padding: 8px 12px; color: #999; font-size: 12px; font-weight: 500;">PRICE</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            ${addressHtml}

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 24px; color: white; margin-bottom: 30px;">
              <h3 style="margin: 0 0 12px 0; font-size: 18px;">🎉 What's Next?</h3>
              <p style="margin: 0; opacity: 0.9; line-height: 1.6;">
                Your order has been confirmed and is being prepared. We'll send you another email when it ships with tracking information!
              </p>
            </div>

            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #999; font-size: 13px;">
                Questions? Reply to this email or contact us at <a href="mailto:hello@knotxandkrafts.com" style="color: #667eea;">hello@knotxandkrafts.com</a>
              </p>
              <p style="margin: 12px 0 0 0; color: #ccc; font-size: 12px;">
                © ${new Date().getFullYear()} KnotXandKrafts. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transport.sendMail({
      from: sender,
      to: customerEmail,
      subject: `✅ Order Confirmed - #${orderId} | KnotXandKrafts`,
      html,
      category: "Order Confirmation",
    });

    console.log(`Order confirmation email sent to ${customerEmail} for order #${orderId}`);

    return NextResponse.json({ success: true, message: 'Order confirmation email sent' });
  } catch (error: any) {
    console.error('Send order confirmation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
