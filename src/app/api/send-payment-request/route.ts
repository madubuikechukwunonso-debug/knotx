import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';

interface PaymentRequestBody {
  customerName: string;
  customerEmail: string;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  paymentLink: string;
  depositAmount: number;
  bookingId: number;
}

export async function POST(request: Request) {
  try {
    const body: PaymentRequestBody = await request.json();
    const {
      customerName,
      customerEmail,
      serviceName,
      bookingDate,
      bookingTime,
      paymentLink,
      depositAmount,
      bookingId,
    } = body;

    if (!customerEmail || !paymentLink) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ============================================
    // MAILTRAP CONFIGURATION
    // ============================================
    const TOKEN = process.env.MAILTRAP_TOKEN;
    if (!TOKEN) {
      console.error('MAILTRAP_TOKEN is not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const transport = nodemailer.createTransport(
      MailtrapTransport({ token: TOKEN })
    );

    const sender = {
      address: "hello@demomailtrap.co",
      name: "Knotx & Krafts",
    };

    const formatCurrency = (amount: number) => `$${(amount / 100).toFixed(2)} CAD`;

    // ============================================
    // EMAIL HTML
    // ============================================
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Complete Your Booking - Knotx & Krafts</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8f5f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <div style="background: #111; padding: 32px 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Knotx & Krafts
              </h1>
              <p style="color: #888; margin: 8px 0 0; font-size: 14px;">Hair Braiding Studio</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px;">
              <h2 style="color: #111; font-size: 24px; margin: 0 0 12px;">Hi ${customerName},</h2>
              
              <p style="color: #444; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                Thank you for booking with us! To secure your appointment, please complete your deposit payment.
              </p>

              <!-- Booking Summary -->
              <div style="background: #f8f5f0; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <h3 style="margin: 0 0 16px; color: #111; font-size: 18px;">Booking Summary</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Service</td>
                    <td style="padding: 8px 0; color: #111; font-size: 14px; font-weight: 500; text-align: right;">${serviceName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Date</td>
                    <td style="padding: 8px 0; color: #111; font-size: 14px; font-weight: 500; text-align: right;">${bookingDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Time</td>
                    <td style="padding: 8px 0; color: #111; font-size: 14px; font-weight: 500; text-align: right;">${bookingTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0 0; color: #111; font-size: 16px; font-weight: 600; border-top: 1px solid #ddd;">Deposit Due</td>
                    <td style="padding: 12px 0 0; color: #111; font-size: 18px; font-weight: 700; text-align: right; border-top: 1px solid #ddd;">
                      ${formatCurrency(depositAmount)}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${paymentLink}" 
                   style="display: inline-block; background: #111; color: white; text-decoration: none; padding: 16px 48px; border-radius: 9999px; font-size: 16px; font-weight: 600; letter-spacing: 0.5px;">
                  Pay Deposit Now →
                </a>
              </div>

              <p style="color: #666; font-size: 14px; line-height: 1.7; text-align: center; margin: 0 0 24px;">
                This link will take you to a secure Stripe checkout page.<br>
                The remaining balance will be due on the day of your appointment.
              </p>

              <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #eee; text-align: center;">
                <p style="color: #888; font-size: 13px; margin: 0;">
                  Questions? Reply to this email or contact us at 
                  <a href="mailto:hello@knotxandkrafts.com" style="color: #111;">hello@knotxandkrafts.com</a>
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #111; color: #888; text-align: center; padding: 20px; font-size: 12px;">
              © ${new Date().getFullYear()} Knotx & Krafts. All rights reserved.<br>
              Booking #${bookingId}
            </div>
          </div>
        </body>
      </html>
    `;

    // ============================================
    // SEND EMAIL
    // ============================================
    await transport.sendMail({
      from: sender,
      to: customerEmail,
      subject: `Complete Your Deposit for ${serviceName} - Knotx & Krafts`,
      html,
      category: "Booking Payment Request",
    });

    console.log(`Payment request email sent to ${customerEmail} for booking #${bookingId}`);

    return NextResponse.json({
      success: true,
      message: 'Payment request email sent successfully',
    });
  } catch (error: any) {
    console.error('Send payment request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send payment request' },
      { status: 500 }
    );
  }
}
