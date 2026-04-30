// src/app/api/send-invoice/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';

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
      totalAmount: passedTotalAmount,
      bookingDate,
      bookingTime,
      braiderName,
    } = body;

    const addonsTotal = selectedAddons?.reduce((sum, addon) =>
      sum + (addon.price * addon.quantity), 0) || 0;
   
    const calculatedTotalAmount = servicePrice + addonsTotal;
    const actualDepositPaid = depositAmount || 0;
    const outstandingBalance = calculatedTotalAmount - actualDepositPaid;

    const formatCurrency = (amount: number) => `$${(amount / 100).toFixed(2)} CAD`;

    const TOKEN = process.env.MAILTRAP_TOKEN;

    if (!TOKEN) {
      console.error('MAILTRAP_TOKEN is not configured');
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const transport = nodemailer.createTransport(
      MailtrapTransport({
        token: TOKEN,
      })
    );

    const sender = {
      address: process.env.MAILTRAP_FROM_EMAIL || "admin@KnotXandKrafts.com",
      name: process.env.MAILTRAP_FROM_NAME || "KnotXandKrafts",
    };

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
        <head>
          <meta charset="utf-8">
          <title>Booking Invoice - KnotXandKrafts</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 40px 20px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #111 0%, #1a1a1a 100%); color: white; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 1px;">KnotXandKrafts</h1>
              <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">Booking Invoice</p>
            </div>

            <div style="padding: 40px;">
              <p style="font-size: 18px; margin: 0 0 24px;">Hi ${customerName || 'there'},</p>
              
              <p style="color: #444; line-height: 1.6; margin-bottom: 32px;">
                Thank you for booking with KnotXandKrafts! Here's your invoice for the appointment.
              </p>

              <!-- BEAUTIFUL GREEN APPOINTMENT DETAILS CARD -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 20px; padding: 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 28px 24px 24px 24px;">
                          
                          <!-- Header with icon -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                            <tr>
                              <td>
                                <table cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="width: 44px; height: 44px; background: rgba(255,255,255,0.25); border-radius: 50%; text-align: center; vertical-align: middle;">
                                      <span style="font-size: 22px; color: white;">🌿</span>
                                    </td>
                                    <td style="padding-left: 14px;">
                                      <span style="color: white; font-size: 20px; font-weight: 700; letter-spacing: 0.3px;">Appointment Details</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>

                          <!-- Service Row -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 14px;">
                            <tr>
                              <td style="width: 50%;">
                                <span style="color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 500;">Service</span>
                              </td>
                              <td style="width: 50%; text-align: right;">
                                <span style="color: white; font-weight: 700; font-size: 15px;">${serviceName}</span>
                              </td>
                            </tr>
                          </table>

                          <!-- Braider Row -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 14px;">
                            <tr>
                              <td style="width: 50%;">
                                <span style="color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 500;">Braider</span>
                              </td>
                              <td style="width: 50%; text-align: right;">
                                <span style="color: white; font-weight: 700; font-size: 15px;">${braiderName}</span>
                              </td>
                            </tr>
                          </table>

                          <!-- Date Row -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 14px;">
                            <tr>
                              <td style="width: 50%;">
                                <span style="color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 500;">Date</span>
                              </td>
                              <td style="width: 50%; text-align: right;">
                                <span style="color: white; font-weight: 700; font-size: 15px;">${bookingDate}</span>
                              </td>
                            </tr>
                          </table>

                          <!-- Time Row -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 50%;">
                                <span style="color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 500;">Time</span>
                              </td>
                              <td style="width: 50%; text-align: right;">
                                <span style="color: white; font-weight: 700; font-size: 15px;">${bookingTime}</span>
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Payment Summary -->
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
                    <span style="font-weight: 700; color: #111;">${formatCurrency(calculatedTotalAmount)}</span>
                  </div>
                  
                  <div style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; background: #ecfdf5;">
                    <span style="color: #10b981; font-weight: 600;">Deposit Paid</span>
                    <span style="font-weight: 700; color: #10b981;">${formatCurrency(actualDepositPaid)}</span>
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
                  Questions? Reply to this email or contact us at <a href="mailto:admin@knotxandkrafts.com" style="color: #111;">hello@knotxandkrafts.ca</a>
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #111; color: #888; text-align: center; padding: 20px; font-size: 12px;">
              © ${new Date().getFullYear()} KnotXandKrafts. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    await transport.sendMail({
      from: sender,
      to: customerEmail,
      subject: `Your KnotXandKrafts Booking Invoice - ${serviceName}`,
      html,
      category: "Booking Invoice",
    });

    console.log(`Invoice email sent to ${customerEmail}`);
    return NextResponse.json({
      success: true,
      message: 'Invoice sent successfully via Mailtrap'
    });

  } catch (error: any) {
    console.error('Send invoice error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send invoice' },
      { status: 500 }
    );
  }
}
