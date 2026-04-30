// src/app/api/send-invoice/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface InvoiceRequest {
  customerName: string;
  customerEmail: string;
  serviceName: string;
  servicePrice: number;
  depositAmount: number;
  selectedAddons: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  bookingDate: string;
  bookingTime: string;
  braiderName: string;
}

export async function POST(request: Request) {
  try {
    const body: InvoiceRequest = await request.json();

    const {
      customerName,
      customerEmail,
      serviceName,
      servicePrice,
      depositAmount,
      selectedAddons,
      totalAmount,
      bookingDate,
      bookingTime,
      braiderName,
    } = body;

    const outstandingBalance = totalAmount - depositAmount;
    const formatCurrency = (amount: number) => `$${(amount / 100).toFixed(2)} CAD`;

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    let addonsHtml = '';
    if (selectedAddons && selectedAddons.length > 0) {
      addonsHtml = selectedAddons.map(addon => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${addon.name} × ${addon.quantity}</td>
          <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #eee;">${formatCurrency(addon.price * addon.quantity)}</td>
        </tr>
      `).join('');
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><title>Booking Invoice - KnotX</title></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 40px 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            
            <div style="background: #111; color: white; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600;">KnotX</h1>
              <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">Booking Invoice</p>
            </div>

            <div style="padding: 40px;">
              <p style="font-size: 18px; margin: 0 0 24px;">Hi ${customerName || 'there'},</p>
              
              <p style="color: #444; line-height: 1.6; margin-bottom: 32px;">
                Thank you for booking with KnotX! Here's your invoice for the appointment.
              </p>

              <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <h3 style="margin: 0 0 16px; color: #111; font-size: 16px;">Appointment Details</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #666;">Service</span>
                  <span style="font-weight: 500;">${serviceName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #666;">Braider</span>
                  <span style="font-weight: 500;">${braiderName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #666;">Date</span>
                  <span style="font-weight: 500;">${bookingDate}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #666;">Time</span>
                  <span style="font-weight: 500;">${bookingTime}</span>
                </div>
              </div>

              <div style="margin-bottom: 32px;">
                <h3 style="margin: 0 0 16px; color: #111; font-size: 16px;">Payment Summary</h3>
                <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                  <div style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between;">
                    <span>Service</span>
                    <span style="font-weight: 600;">${formatCurrency(servicePrice)}</span>
                  </div>
                  
                  ${addonsHtml ? `
                    <div style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb;">
                      <div style="margin-bottom: 8px; font-weight: 600;">Add-ons</div>
                      <table style="width: 100%; border-collapse: collapse;">
                        ${addonsHtml}
                      </table>
                    </div>
                  ` : ''}
                  
                  <div style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; background: #f8fafc;">
                    <span style="font-weight: 600;">Total</span>
                    <span style="font-weight: 700; color: #111;">${formatCurrency(totalAmount)}</span>
                  </div>
                  
                  <div style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; background: #ecfdf5;">
                    <span style="color: #10b981; font-weight: 600;">Deposit Paid</span>
                    <span style="font-weight: 700; color: #10b981;">${formatCurrency(depositAmount)}</span>
                  </div>
                  
                  <div style="padding: 16px 20px; display: flex; justify-content: space-between; background: #fef3c7;">
                    <span style="color: #d97706; font-weight: 700;">Outstanding Balance</span>
                    <span style="font-weight: 800; color: #d97706; font-size: 18px;">${formatCurrency(outstandingBalance)}</span>
                  </div>
                </div>
              </div>

              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                Your appointment is confirmed. Please arrive 10 minutes early. 
                The outstanding balance will be due on the day of your appointment.
              </p>

              <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #888; font-size: 13px; margin: 0;">
                  Questions? Reply to this email or contact us at <a href="mailto:hello@knotx.ca" style="color: #111;">hello@knotx.ca</a>
                </p>
              </div>
            </div>

            <div style="background: #111; color: #888; text-align: center; padding: 20px; font-size: 12px;">
              © ${new Date().getFullYear()} KnotX. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"KnotX" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `Your KnotX Booking Invoice - ${serviceName}`,
      html,
    });

    return NextResponse.json({ success: true, message: 'Invoice sent successfully' });

  } catch (error: any) {
    console.error('Send invoice error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send invoice' },
      { status: 500 }
    );
  }
}
