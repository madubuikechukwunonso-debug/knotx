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
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
            <span style="color: #555; font-size: 14px;">${addon.name} × ${addon.quantity}</span>
          </td>
          <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #f0f0f0;">
            <span style="color: #333; font-weight: 600; font-size: 14px;">${formatCurrency(addon.price * addon.quantity)}</span>
          </td>
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
          <div style="max-width: 620px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
            
            <!-- WHITE HEADER -->
            <div style="background: white; padding: 40px 40px 32px 40px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <div style="display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 14px;">
                  <span style="color: white; font-size: 26px;">🌿</span>
                </div>
                <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #111; letter-spacing: -0.5px;">KnotXandKrafts</h1>
              </div>
              <p style="margin: 0; color: #666; font-size: 15px; font-weight: 500;">Booking Invoice</p>
            </div>

            <div style="padding: 40px;">
              <p style="font-size: 18px; margin: 0 0 8px; color: #111;">Hi ${customerName || 'there'},</p>
              
              <p style="color: #555; line-height: 1.7; margin-bottom: 36px; font-size: 15px;">
                Thank you for booking with KnotXandKrafts! Here's your invoice for the appointment.
              </p>

              <!-- GREEN APPOINTMENT DETAILS CARD -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 36px;">
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 18px; padding: 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 26px 26px 22px 26px;">
                          
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 18px;">
                            <tr>
                              <td>
                                <span style="color: white; font-size: 18px; font-weight: 700; letter-spacing: 0.2px;">Appointment Details</span>
                              </td>
                            </tr>
                          </table>

                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 13px;">
                            <tr>
                              <td style="width: 48%;">
                                <span style="color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 500;">Service</span>
                              </td>
                              <td style="width: 52%; text-align: right;">
                                <span style="color: white; font-weight: 700; font-size: 15px;">${serviceName}</span>
                              </td>
                            </tr>
                          </table>

                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 13px;">
                            <tr>
                              <td style="width: 48%;">
                                <span style="color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 500;">Braider</span>
                              </td>
                              <td style="width: 52%; text-align: right;">
                                <span style="color: white; font-weight: 700; font-size: 15px;">${braiderName}</span>
                              </td>
                            </tr>
                          </table>

                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 13px;">
                            <tr>
                              <td style="width: 48%;">
                                <span style="color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 500;">Date</span>
                              </td>
                              <td style="width: 52%; text-align: right;">
                                <span style="color: white; font-weight: 700; font-size: 15px;">${bookingDate}</span>
                              </td>
                            </tr>
                          </table>

                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 48%;">
                                <span style="color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 500;">Time</span>
                              </td>
                              <td style="width: 52%; text-align: right;">
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

              <!-- WHITE PAYMENT SUMMARY CARD -->
              <div style="margin-bottom: 36px;">
                <h3 style="margin: 0 0 14px; color: #111; font-size: 17px; font-weight: 700;">Payment Summary</h3>
               
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
                  
                  <!-- Service -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 18px 22px; border-bottom: 1px solid #f5f5f5;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <span style="color: #555; font-size: 14.5px;">Service</span>
                            </td>
                            <td style="text-align: right;">
                              <span style="color: #222; font-weight: 700; font-size: 15px;">${formatCurrency(servicePrice)}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Add-ons -->
                  ${addonsHtml ? `
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 18px 22px; border-bottom: 1px solid #f5f5f5;">
                          <div style="margin-bottom: 10px;">
                            <span style="color: #555; font-size: 14.5px; font-weight: 600;">Add-ons</span>
                          </div>
                          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                            ${addonsHtml}
                          </table>
                        </td>
                      </tr>
                    </table>
                  ` : ''}

                  <!-- Total -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 18px 22px; border-bottom: 1px solid #f5f5f5; background: #fafafa;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <span style="color: #333; font-size: 15px; font-weight: 700;">Total</span>
                            </td>
                            <td style="text-align: right;">
                              <span style="color: #111; font-weight: 800; font-size: 16px;">${formatCurrency(calculatedTotalAmount)}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Deposit Paid -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 18px 22px; border-bottom: 1px solid #f5f5f5; background: #ecfdf5;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <span style="color: #10b981; font-size: 15px; font-weight: 700;">Deposit Paid</span>
                            </td>
                            <td style="text-align: right;">
                              <span style="color: #10b981; font-weight: 800; font-size: 16px;">${formatCurrency(actualDepositPaid)}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Outstanding Balance -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 20px 22px; background: #fef3c7;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <span style="color: #d97706; font-size: 16px; font-weight: 800;">Outstanding Balance</span>
                            </td>
                            <td style="text-align: right;">
                              <span style="color: #b45309; font-weight: 900; font-size: 20px;">${formatCurrency(outstandingBalance)}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                </div>
              </div>

              <p style="color: #666; font-size: 14.5px; line-height: 1.7; margin-bottom: 8px;">
                Your appointment is confirmed. Please arrive 10 minutes early.
              </p>
              <p style="color: #666; font-size: 14.5px; line-height: 1.7;">
                The outstanding balance will be due on the day of your appointment.
              </p>

              <div style="margin-top: 42px; padding-top: 26px; border-top: 1px solid #eee; text-align: center;">
                <p style="color: #888; font-size: 13px; margin: 0;">
                  Questions? Reply to this email or contact us at <a href="mailto:admin@knotxandkrafts.com" style="color: #111; text-decoration: none; font-weight: 500;">hello@knotxandkrafts.ca</a>
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #fafafa; color: #888; text-align: center; padding: 22px; font-size: 12px; border-top: 1px solid #f0f0f0;">
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
