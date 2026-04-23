import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orderItems, orders, products } from "../../../db/schema";
import type { CreateOrderInput, OrderSessionUser } from "./orders.types";

export async function createOrder(input: CreateOrderInput) {
  let total = 0;
  const itemDetails: { productId: number; quantity: number; price: number }[] =
    [];

  for (const item of input.items) {
    const productRows = await db()
      .select()
      .from(products)
      .where(eq(products.id, item.productId))
      .limit(1);

    if (productRows.length === 0) {
      throw new Error(`Product ${item.productId} not found`);
    }

    const product = productRows[0];
    total += product.price * item.quantity;

    itemDetails.push({
      productId: item.productId,
      quantity: item.quantity,
      price: product.price,
    });
  }

  const orderResult = await db().insert(orders).values({
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    total,
    status: "pending",
    shippingStatus: "pending",
    userId: input.userId,
    userType: input.userType,
  });

  const orderId = Number(orderResult[0].insertId);

  for (const item of itemDetails) {
    await db().insert(orderItems).values({
      orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    });
  }

  const created = await db()
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  return created[0];
}

export async function getOrderById(id: number) {
  const orderRows = await db()
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (orderRows.length === 0) {
    return null;
  }

  const items = await db()
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id));

  return {
    ...orderRows[0],
    items,
  };
}

export async function listOrders() {
  return db().select().from(orders).orderBy(desc(orders.createdAt));
}

export async function listMyOrders(user?: OrderSessionUser) {
  if (!user) {
    return [];
  }

  if (user.userType === "local") {
    return db()
      .select()
      .from(orders)
      .where(eq(orders.customerEmail, user.email || ""))
      .orderBy(desc(orders.createdAt));
  }

  return db()
    .select()
    .from(orders)
    .where(
      and(eq(orders.userId, user.userId), eq(orders.userType, user.userType)),
    )
    .orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(id: number, status: string) {
  await db().update(orders).set({ status }).where(eq(orders.id, id));

  const updated = await db()
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  return updated[0];
}
