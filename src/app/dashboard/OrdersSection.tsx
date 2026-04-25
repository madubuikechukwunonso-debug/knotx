'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrdersSection() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders/mine")
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (date: any) => 
    date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h2 className="text-2xl font-medium mb-6">My Orders</h2>
        <p className="text-black/40">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8">
      <h2 className="text-2xl font-medium mb-6">My Orders</h2>

      {orders.length === 0 ? (
        <div className="bg-[#f6f6f6] py-12 text-center rounded-3xl">
          <p className="mb-2 text-sm text-black/40">No orders yet</p>
          <Link
            href="/shop"
            className="border-b border-black pb-0.5 text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-black/10 rounded-3xl p-6">
              <div className="flex justify-between items-start text-sm mb-3">
                <div>
                  <span className="font-medium">Order #{order.id}</span>
                  <span className="text-black/50 ml-2">• {formatDate(order.createdAt)}</span>
                </div>
                <span
                  className={`px-4 py-1 rounded-3xl text-xs font-medium ${
                    order.status === "shipped" || order.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : order.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {order.status?.toUpperCase() || "PENDING"}
                </span>
              </div>

              {/* Order items summary */}
              <div className="mb-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: any) => (
                    <div key={item.id} className="text-sm mb-1">
                      {item.product?.name || "Product"} × {item.quantity}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-black/60">Order total: ${order.total}</p>
                )}
              </div>

              {order.trackingNumber && (
                <p className="text-xs text-black/60 mb-4">
                  Tracking: <span className="font-medium">{order.trackingNumber}</span>
                </p>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                {order.trackingNumber && (
                  <button className="text-xs sm:text-sm underline hover:no-underline">
                    Track Package
                  </button>
                )}
                <button className="text-xs sm:text-sm underline hover:no-underline">
                  Download Invoice
                </button>
                <button className="text-xs sm:text-sm underline hover:no-underline">
                  Reorder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
