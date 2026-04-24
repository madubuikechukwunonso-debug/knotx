// src/modules/orders/orders.service.ts
import { prisma } from "@/lib/prisma";

export async function createOrder(input: {
  items: { productId: number; quantity: number }[];
  customerName: string;
  customerEmail: string;
  userId?: number;
  userType?: string;
}) {
  // Calculate total (you can enhance this later with real price lookup)
  let total = 0;

  const orderItems = await Promise.all(
    input.items.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) throw new Error(`Product ${item.productId} not found`);
      total += product.price * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      };
    })
  );

  const order = await prisma.order.create({
    data: {
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      userId: input.userId,
      userType: input.userType,
      total,
      status: "pending",
      shippingStatus: "pending",
      items: {
        create: orderItems,
      },
    },
    include: {
      items: true,
    },
  });

  return order;
}

export async function listOrders() {
  return prisma.order.findMany({
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(id: number) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });
}
