import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orderItems, orders, products } from '../../../db/schema';
import type { OrderInput } from './orders.types';

export async function createOrder(input: OrderInput) {
  const database = db();
  let total = 0;
  const itemsWithPrice: { productId: number; quantity: number; price: number }[] = [];

  for (const item of input.items) {
    const [product] = await database.select().from(products).where(eq(products.id, item.productId)).limit(1);
    if (!product) throw new Error(`Product ${item.productId} not found`);
    total += product.price * item.quantity;
    itemsWithPrice.push({ productId: item.productId, quantity: item.quantity, price: product.price });
  }

  const result = await database.insert(orders).values({
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    total,
    status: 'pending',
    shippingStatus: 'pending',
    userId: input.userId,
    userType: input.userType,
  });

  const orderId = Number(result[0].insertId);
  for (const item of itemsWithPrice) {
    await database.insert(orderItems).values({ ...item, orderId });
  }

  return { id: orderId, total, status: 'pending', customerName: input.customerName, customerEmail: input.customerEmail };
}

export async function listMyOrders(user?: { id: number; userType: 'local' | 'oauth'; email?: string | null }) {
  if (!user) return [];
  const database = db();
  if (user.userType === 'local' && user.email) {
    return database.select().from(orders).where(eq(orders.customerEmail, user.email)).orderBy(desc(orders.createdAt));
  }
  return database.select().from(orders).where(and(eq(orders.userId, user.id), eq(orders.userType, user.userType))).orderBy(desc(orders.createdAt));
}
