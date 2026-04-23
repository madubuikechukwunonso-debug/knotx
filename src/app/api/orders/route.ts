import { NextResponse } from 'next/server';
import { createOrderSchema } from '@/modules/orders/orders.validation';
import { createOrder, listMyOrders } from '@/modules/orders/orders.service';
import { getSession } from '@/lib/session';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('mine') !== '1') return NextResponse.json({ ok: true, orders: [] });
  const session = await getSession();
  const orders = await listMyOrders(session || undefined);
  return NextResponse.json({ ok: true, orders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = createOrderSchema.parse(body);
    const order = await createOrder(input);
    return NextResponse.json({ ok: true, order });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error?.message || 'Order failed' }, { status: 500 });
  }
}
