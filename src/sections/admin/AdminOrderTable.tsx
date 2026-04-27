// src/sections/admin/AdminOrderTable.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Plus } from 'lucide-react';

type Order = {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  total: number;
  status: string;
  shippingStatus: string;
  shippingCarrier?: string | null;
  trackingNumber?: string | null;
  fulfilledAt?: Date | null;
  createdAt: Date;
  items: Array<{
    quantity: number;
    product: { name: string };
  }>;
};

type Props = {
  orders: Order[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const shippingColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-emerald-100 text-emerald-800',
};

export default function AdminOrderTable({
  orders,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const handleSubmit = async (formData: FormData) => {
    if (editingOrder) {
      formData.append('id', editingOrder.id.toString());
      await onUpdate(formData);
    } else {
      await onCreate(formData);
    }
    setModalOpen(false);
    setEditingOrder(null);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this order permanently? This cannot be undone.')) {
      const formData = new FormData();
      formData.append('id', id.toString());
      await onDelete(formData);
      router.refresh();
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setEditingOrder(null);
          setModalOpen(true);
        }}
        className="flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-black/90"
      >
        <Plus className="h-4 w-4" />
        New Order
      </button>

      {/* Table */}
      <div className="rounded-3xl border border-black/10 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-black/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium">Order</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Items</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Total</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Shipping</th>
              <th className="px-6 py-4 text-right text-xs font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-black/5">
                <td className="px-6 py-4 text-sm font-medium">#{order.id}</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-xs text-black/50">{order.customerEmail}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </td>
                <td className="px-6 py-4 font-medium">
                  ${(order.total / 100).toFixed(2)} CAD
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block rounded-2xl px-3 py-1 text-xs font-medium ${
                      statusColors[order.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block rounded-2xl px-3 py-1 text-xs font-medium ${
                      shippingColors[order.shippingStatus] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {order.shippingStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {
                      setEditingOrder(order);
                      setModalOpen(true);
                    }}
                    className="mr-3 text-black/70 hover:text-black"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full mx-auto shadow-2xl max-h-[90vh] overflow-auto">
            <form action={handleSubmit} className="p-8 space-y-6">
              <h2 className="text-2xl font-serif">
                {editingOrder ? `Order #${editingOrder.id}` : 'New Order'}
              </h2>

              {editingOrder && <input type="hidden" name="id" value={editingOrder.id} />}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium mb-1">Customer Name</label>
                  <input
                    name="customerName"
                    defaultValue={editingOrder?.customerName}
                    required
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Email</label>
                  <input
                    name="customerEmail"
                    type="email"
                    defaultValue={editingOrder?.customerEmail}
                    required
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Phone (optional)</label>
                <input
                  name="customerPhone"
                  defaultValue={editingOrder?.customerPhone || ''}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-medium mb-1">Total (cents)</label>
                  <input
                    name="total"
                    type="number"
                    defaultValue={editingOrder?.total || 0}
                    required
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Order Status</label>
                  <select
                    name="status"
                    defaultValue={editingOrder?.status || 'pending'}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Shipping Status</label>
                  <select
                    name="shippingStatus"
                    defaultValue={editingOrder?.shippingStatus || 'pending'}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  >
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium mb-1">Shipping Carrier</label>
                  <input
                    name="shippingCarrier"
                    defaultValue={editingOrder?.shippingCarrier || ''}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Tracking Number</label>
                  <input
                    name="trackingNumber"
                    defaultValue={editingOrder?.trackingNumber || ''}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
              </div>

              {editingOrder && (
                <div>
                  <label className="block text-xs font-medium mb-1">Fulfilled At</label>
                  <input
                    name="fulfilledAt"
                    type="datetime-local"
                    defaultValue={
                      editingOrder.fulfilledAt
                        ? new Date(editingOrder.fulfilledAt).toISOString().slice(0, 16)
                        : ''
                    }
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingOrder(null);
                  }}
                  className="flex-1 py-4 rounded-2xl border border-black/10 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-black text-white font-medium"
                >
                  {editingOrder ? 'Save Changes' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
