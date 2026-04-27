// src/sections/admin/AdminOrdersSection.tsx
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import AdminOrderTable from './AdminOrderTable';

const prisma = new PrismaClient();

async function getOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { product: true },
      },
      user: true,
    },
  });
}

// Server Actions
async function createOrder(formData: FormData) {
  'use server';

  await prisma.order.create({
    data: {
      customerName: formData.get('customerName') as string,
      customerEmail: formData.get('customerEmail') as string,
      customerPhone: formData.get('customerPhone') as string || undefined,
      total: parseInt(formData.get('total') as string),
      status: formData.get('status') as string,
      shippingStatus: formData.get('shippingStatus') as string,
      shippingCarrier: formData.get('shippingCarrier') as string || undefined,
      trackingNumber: formData.get('trackingNumber') as string || undefined,
    },
  });

  revalidatePath('/admin/orders');
}

async function updateOrder(formData: FormData) {
  'use server';

  const id = parseInt(formData.get('id') as string);

  await prisma.order.update({
    where: { id },
    data: {
      customerName: formData.get('customerName') as string,
      customerEmail: formData.get('customerEmail') as string,
      customerPhone: formData.get('customerPhone') as string || undefined,
      total: parseInt(formData.get('total') as string),
      status: formData.get('status') as string,
      shippingStatus: formData.get('shippingStatus') as string,
      shippingCarrier: formData.get('shippingCarrier') as string || undefined,
      trackingNumber: formData.get('trackingNumber') as string || undefined,
      fulfilledAt: formData.get('fulfilledAt') ? new Date(formData.get('fulfilledAt') as string) : undefined,
    },
  });

  revalidatePath('/admin/orders');
}

async function deleteOrder(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  await prisma.order.delete({ where: { id } });
  revalidatePath('/admin/orders');
}

export default async function AdminOrdersSection() {
  const orders = await getOrders();

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Orders</h1>
          <p className="text-black/60">Manage customer orders, fulfillment, and shipping</p>
        </div>
        <AdminOrderTable
          orders={orders}
          onCreate={createOrder}
          onUpdate={updateOrder}
          onDelete={deleteOrder}
        />
      </div>
    </div>
  );
}
