import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function getOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

async function updateOrderStatus(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  const status = formData.get('status') as string;
  
  await prisma.order.update({
    where: { id },
    data: { 
      status,
      shippingStatus: status === 'fulfilled' ? 'shipped' : 'pending',
      fulfilledAt: status === 'fulfilled' ? new Date() : null,
    },
  });
  revalidatePath('/admin/orders');
}

export default async function AdminOrdersSection() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif text-emerald-950">Orders</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-emerald-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-emerald-900">Order #</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-emerald-900">Customer</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-emerald-900">Items</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-emerald-900">Total</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-emerald-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-emerald-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-100">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 text-sm font-medium">#{order.id}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium">{order.customerName}</div>
                  <div className="text-xs text-emerald-600">{order.customerEmail}</div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </td>
                <td className="px-6 py-4 text-sm font-semibold">
                  ${(order.total / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                    order.status === 'fulfilled' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <form action={updateOrderStatus} className="flex gap-2">
                    <input type="hidden" name="id" value={order.id} />
                    <select name="status" className="text-sm border rounded px-2 py-1">
                      <option value="paid">Paid</option>
                      <option value="fulfilled">Fulfilled</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button type="submit" className="px-3 py-1 bg-emerald-600 text-white text-sm rounded">
                      Update
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
