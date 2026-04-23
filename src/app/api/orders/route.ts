import { NextRequest, NextResponse } from "next/server";
import {
  createOrder,
  getOrderById,
  listMyOrders,
} from "@/modules/orders/orders.service";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const id = searchParams.get("id");
  if (id) {
    const order = await getOrderById(Number(id));
    return NextResponse.json({ ok: true, order });
  }

  if (searchParams.get("mine") !== "1") {
    return NextResponse.json({ ok: true, orders: [] });
  }

  const session = await getSession();
  const orders = await listMyOrders(session || undefined);

  return NextResponse.json({ ok: true, orders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await getSession();

    const order = await createOrder({
      items: body.items || [],
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
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
