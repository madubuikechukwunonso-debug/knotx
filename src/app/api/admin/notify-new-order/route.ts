// src/app/api/admin/notify-new-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";

export async function POST(req: NextRequest) {
  try {
    const {
      orderId,
      customerName,
      customerEmail,
      total,
      itemCount,
      items, // ← Accept items array
    } = await req.json();

    const TOKEN = process.env.MAILTRAP_TOKEN;
    const adminEmail = process.env.SUPER_ADMIN_EMAIL;

    if (!TOKEN || !adminEmail) {
      return NextResponse.json({ success: false }, { status: 500 });
    }

    const transport = nodemailer.createTransport(MailtrapTransport({ token: TOKEN }));

    const sender = {
      address: process.env.MAILTRAP_FROM_EMAIL || "admin@KnotXandKrafts.com",
      name: process.env.MAILTRAP_FROM_NAME || "KnotXandKrafts",
    };

    // Build product list HTML
    let itemsHtml = "";
    if (items && items.length > 0) {
      itemsHtml = `
        <p><strong>Products Ordered:</strong></p>
        <ul style="padding-left: 20px; margin: 10px 0;">
          ${items.map((item: any) => `
            <li>
              <strong>${item.name || "Product"}</strong> 
              × ${item.quantity} 
              — $${(item.price / 100).toFixed(2)}
            </li>
          `).join("")}
        </ul>
      `;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111;">🛒 New Product Order</h2>
        <p>A new order has been placed and paid via Stripe.</p>
       
        <div style="background: #f8f5f0; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
          <p><strong>Total:</strong> $${(total / 100).toFixed(2)}</p>
          <p><strong>Total Items:</strong> ${itemCount}</p>
          
          ${itemsHtml}
        </div>

        <p>Please check the admin dashboard to process this order.</p>
      </div>
    `;

    await transport.sendMail({
      from: sender,
      to: adminEmail,
      subject: `🛒 New Order #${orderId} from ${customerName}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notify new order error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
