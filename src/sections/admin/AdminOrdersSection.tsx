// src/sections/admin/AdminOrdersSection.tsx
import { PrismaClient } from '@prisma/client';
import { Plus, Eye, DollarSign, Calendar, Package } from 'lucide-react';

const prisma = new PrismaClient();

export default async function AdminOrdersSection() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: {
            select: { name: true },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Orders</h1>
          <p className="text-emerald-600 text-sm mt-1">
            {orders.length} order{orders.length !== 1 ? 's' : ''} • Real-time fulfillment
          </p>
        </div>

        <button
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-3xl transition-colors shadow-sm w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus size={20} />
          <span className="font-medium">New Manual Order</span>
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Order #</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Customer</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Amount</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Items</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Status</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Date</th>
                <th className="px-6 py-5 text-right font-medium text-emerald-700 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-emerald-50 transition-colors group"
                >
                  {/* Order ID */}
                  <td className="px-6 py-5 font-mono text-emerald-950 font-medium">
                    #{order.id}
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-5">
                    <div>
                      <p className="font-medium text-emerald-950">{order.customerName}</p>
                      <p className="text-xs text-emerald-500 truncate">{order.customerEmail}</p>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1 font-semibold text-emerald-950">
                      <DollarSign size={16} className="text-emerald-600" />
                      {(order.total / 100).toFixed(2)}
                    </div>
                  </td>

                  {/* Items Count */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-emerald-600" />
                      <span className="font-medium text-emerald-700">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-3xl ${
                        order.status === 'completed' || order.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : order.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-5 text-emerald-600 text-sm">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 text-right">
                    <button
                      className="p-3 hover:bg-emerald-100 rounded-2xl transition-colors text-emerald-700 inline-flex items-center gap-1"
                      title="View order details"
                    >
                      <Eye size={18} />
                      <span className="text-xs font-medium hidden sm:inline">View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {orders.length === 0 && (
          <div className="px-6 py-16 text-center">
            <Calendar className="h-12 w-12 mx-auto text-emerald-300 mb-4" />
            <p className="text-emerald-500 text-lg">No orders yet</p>
            <p className="text-xs text-emerald-400 mt-2">
              When customers place orders they will appear here instantly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
