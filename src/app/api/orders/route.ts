// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  createOrder,
  getOrderById,
  listOrders,
} from "@/modules/orders/orders.service";
import { getSession } from "@/lib/session";
import { sendAdminNotification } from "@/lib/send-admin-notification";

interface Order {
  id: number;
  userId?: number | null;
  userType?: "local" | "oauth" | "guest" | null;
  customerName?: string | null;
  customerEmail?: string | null;
  total?: number | null;
  status?: string | null;
  createdAt?: Date | string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (id) {
      const orderId = Number(id);
      if (!Number.isInteger(orderId) || orderId <= 0) {
        return NextResponse.json(
          { ok: false, message: "Invalid order id" },
          { status: 400 }
        );
      }
      const order = await getOrderById(orderId);
      return NextResponse.json({ ok: true, order });
    }

    if (searchParams.get("mine") !== "1") {
      return NextResponse.json({ ok: true, orders: [] });
    }

    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ ok: true, orders: [] });
    }

    const orders = (await listOrders()) as Order[];
    const myOrders = orders.filter(
      (order) =>
        order.userId === session.userId && order.userType === session.userType
    );

    return NextResponse.json({ ok: true, orders: myOrders });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "Failed to load orders",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await getSession();

    const order = await createOrder({
      items: body.items || [],
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      userId: session?.userId,
      userType: session?.userType,
    });

    // ============================================
    // SEND NOTIFICATION TO SUPER ADMIN
    // ============================================
    const itemCount = body.items?.length || 0;

    await sendAdminNotification({
      type: "new_order",
      title: `${body.customerName || "Customer"} placed an order`,
      details: `
        <p><strong>Customer:</strong> ${body.customerName || "N/A"}</p>
        <p><strong>Email:</strong> ${body.customerEmail || "N/A"}</p>
        <p><strong>Total:</strong> $${((order.total || 0) / 100).toFixed(2)}</p>
        <p><strong>Items:</strong> ${itemCount} item(s)</p>
        <p><strong>Order ID:</strong> #${order.id}</p>
      `,
    });

    return NextResponse.json({ ok: true, order });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "Failed to create order",
      },
      { status: 500 }
    );
  }
}
