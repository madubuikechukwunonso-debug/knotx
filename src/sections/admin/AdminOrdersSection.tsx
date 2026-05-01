'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    name: string;
    image: string | null;
  };
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  total: number;
  status: string;
  shippingStatus: string;
  shippingCarrier: string | null;
  trackingNumber: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface AdminOrdersSectionProps {
  orders: Order[];
}

export default function AdminOrdersSection({ orders: initialOrders }: AdminOrdersSectionProps) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);

  const statusOptions = [
    { value: 'paid', label: 'Paid', color: 'emerald', emoji: '💳' },
    { value: 'shipped', label: 'Shipped', color: 'blue', emoji: '🚚' },
    { value: 'fulfilled', label: 'Fulfilled/Delivered', color: 'green', emoji: '✅' },
    { value: 'cancelled', label: 'Cancelled', color: 'red', emoji: '❌' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'fulfilled': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const openEditModal = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
    setShowStatusDropdown(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('id', orderId.toString());
      formData.append('status', newStatus);

      const response = await fetch('/api/admin/orders/update-status', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, shippingStatus: newStatus === 'fulfilled' ? 'shipped' : 'pending' }
            : order
        ));
        
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ 
            ...selectedOrder, 
            status: newStatus,
            shippingStatus: newStatus === 'fulfilled' ? 'shipped' : 'pending'
          });
        }

        const statusLabels: Record<string, string> = {
          'paid': 'Order marked as PAID - Confirmation email sent!',
          'shipped': 'Order marked as SHIPPED - Shipping notification sent!',
          'fulfilled': 'Order marked as FULFILLED - Delivery confirmation sent!',
          'cancelled': 'Order marked as CANCELLED - Cancellation email sent!'
        };
        
        console.log(statusLabels[newStatus] || 'Status updated');
        
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
      setShowStatusDropdown(null);
    }
  };

  const updateOrderDetails = async (formData: FormData) => {
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      const response = await fetch('/api/admin/orders/update', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        
        setOrders(prev => prev.map(order => 
          order.id === selectedOrder.id ? { ...order, ...updatedOrder } : order
        ));
        
        closeModal();
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('id', selectedOrder!.id.toString());
    updateOrderDetails(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Orders</h1>
          <p className="text-emerald-600 text-sm mt-1">{orders.length} total orders</p>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-emerald-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-emerald-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Order</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Address</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Items</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-emerald-900 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-emerald-500">
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-emerald-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm font-medium text-emerald-950">#{order.id}</div>
                    <div className="text-xs text-emerald-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-sm">{order.customerName}</div>
                    <div className="text-xs text-emerald-600">{order.customerEmail}</div>
                    {order.customerPhone && <div className="text-xs text-emerald-500">{order.customerPhone}</div>}
                  </td>
                  <td className="px-6 py-4">
                    {order.shippingAddressLine1 ? (
                      <div className="text-xs leading-tight max-w-[200px]">
                        <div className="truncate">{order.shippingAddressLine1}</div>
                        {order.shippingCity && (
                          <div className="text-emerald-500 truncate">
                            {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-emerald-400 italic">No address</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-emerald-950">${(order.total / 100).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setShowStatusDropdown(showStatusDropdown === order.id ? null : order.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                        <span className="text-[10px]">▼</span>
                      </button>

                      {showStatusDropdown === order.id && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-emerald-200 rounded-xl shadow-lg py-1 z-50 min-w-[180px]">
                          {statusOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => updateOrderStatus(order.id, option.value)}
                              disabled={updating}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-emerald-50 flex items-center gap-2.5 disabled:opacity-50"
                            >
                              <span>{option.emoji}</span>
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(order)}
                        className="p-2 hover:bg-emerald-100 rounded-xl transition-colors"
                        title="Edit Order"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-emerald-100 bg-white rounded-3xl shadow-sm border border-emerald-100">
        {orders.length === 0 ? (
          <div className="px-6 py-12 text-center text-emerald-500">No orders yet</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-sm font-medium text-emerald-950">#{order.id}</div>
                  <div className="text-xs text-emerald-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowStatusDropdown(showStatusDropdown === order.id ? null : order.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                  >
                    {order.status} <span className="text-[10px]">▼</span>
                  </button>

                  {showStatusDropdown === order.id && (
                    <div className="absolute top-full right-0 mt-1 bg-white border border-emerald-200 rounded-xl shadow-lg py-1 z-50 min-w-[180px]">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateOrderStatus(order.id, option.value)}
                          disabled={updating}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-emerald-50 flex items-center gap-2.5 disabled:opacity-50"
                        >
                          <span>{option.emoji}</span>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="font-medium text-sm">{order.customerName}</div>
                <div className="text-xs text-emerald-600">{order.customerEmail}</div>
              </div>

              {order.shippingAddressLine1 && (
                <div className="bg-emerald-50 rounded-xl p-3 text-xs">
                  <div className="font-medium text-emerald-700 mb-1">📍 Shipping</div>
                  <div className="text-emerald-600 leading-tight">
                    {order.shippingAddressLine1}<br />
                    {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm pt-2 border-t border-emerald-100">
                <div className="text-emerald-600">{order.items.length} items</div>
                <div className="font-semibold text-emerald-950">${(order.total / 100).toFixed(2)}</div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => openEditModal(order)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-2xl text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Order
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* EDIT ORDER MODAL */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-emerald-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="text-xl font-semibold text-emerald-950">Edit Order #{selectedOrder.id}</h3>
                <p className="text-sm text-emerald-600">{selectedOrder.customerName}</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-emerald-100 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6h12v12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-emerald-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-emerald-700 mb-1">Name</label>
                    <input 
                      type="text" 
                      name="customerName" 
                      defaultValue={selectedOrder.customerName}
                      className="w-full rounded-2xl border border-emerald-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-emerald-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      name="customerEmail" 
                      defaultValue={selectedOrder.customerEmail}
                      className="w-full rounded-2xl border border-emerald-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-emerald-700 mb-1">Phone</label>
                    <input 
                      type="tel" 
                      name="customerPhone" 
                      defaultValue={selectedOrder.customerPhone || ''}
                      className="w-full rounded-2xl border border-emerald-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-emerald-700 mb-1">Total (cents)</label>
                    <input 
                      type="number" 
                      name="total" 
                      defaultValue={selectedOrder.total}
                      className="w-full rounded-2xl border border-emerald-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                  <span>🚚</span> Shipping Address
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-emerald-700 mb-1">Address Line 1</label>
                    <input 
                      type="text" 
                      name="shippingAddressLine1" 
                      defaultValue={selectedOrder.shippingAddressLine1 || ''}
                      className="w-full rounded-2xl border border-emerald-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" 
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-emerald-700 mb-1">Address Line 2</label>
                    <input 
                      type="text" 
                      name="shippingAddressLine2" 
                      defaultValue={selectedOrder.shippingAddressLine2 || ''}
                      className="w-full rounded-2xl border border-emerald-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" 
                      placeholder="Apt 4B (optional)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-emerald-700 mb-1">City</label>
                      <input 
                        type="text" 
                        name="shippingCity" 
                        defaultValue={selectedOrder.shippingCity || ''}
                        className="w-full rounded-2xl border border-emerald-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" 
                        placeholder="Toronto"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-emerald-700 mb-1">Province/State</label>
                      <input 
                        type="text" 
                        name="shippingState" 
                        defaultValue={selectedOrder.shippingState || ''}
                        className="w-full rounded-2xl border border-emerald-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" 
                        placeholder="ON"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-emerald-700 mb-1">Postal Code</label>
                      <input 
                        type="text" 
                        name="shippingPostalCode" 
                        defaultValue={selectedOrder.shippingPostalCode || ''}
                        className="w-full rounded-2xl border border-emerald-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" 
                        placeholder="M5V 2T6"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-emerald-700 mb-1">Country</label>
                      <input 
                        type="text" 
                        name="shippingCountry" 
                        defaultValue={selectedOrder.shippingCountry || 'Canada'}
                        className="w-full rounded-2xl border border-emerald-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-emerald-900 mb-3">Quick Status Update</h4>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateOrderStatus(selectedOrder.id, option.value)}
                      disabled={updating || selectedOrder.status === option.value}
                      className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 ${
                        selectedOrder.status === option.value 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      }`}
                    >
                      <span>{option.emoji}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-emerald-500 mt-2">💡 Emails are automatically sent when status changes</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-emerald-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-medium hover:bg-emerald-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
