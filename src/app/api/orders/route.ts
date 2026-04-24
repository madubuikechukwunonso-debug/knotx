import { NextRequest, NextResponse } from "next/server";
import {
  createOrder,
  getOrderById,
  listOrders,
} from "@/modules/orders/orders.service";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const id = searchParams.get("id");

    if (id) {
      const orderId = Number(id);

      if (!Number.isInteger(orderId) || orderId <= 0) {
        return NextResponse.json(
          { ok: false, message: "Invalid order id" },
          { status: 400 },
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

    const orders = await listOrders();

    const myOrders = orders.filter(
      (order) =>
        order.userId === session.userId && order.userType === session.userType,
    );

    return NextResponse.json({ ok: true, orders: myOrders });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "Failed to load orders",
      },
      { status: 500 },
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

    return NextResponse.json({ ok: true, order });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "Failed to create order",
      },
      { status: 500 },
    );
  }
}
