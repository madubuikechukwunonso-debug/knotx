'use client';

import { useEffect, useState } from "react";

export default function OrdersSection() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/orders/mine")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []));
  }, []);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg">
      <h2 className="text-2xl font-serif mb-6">My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        orders.map((o) => (
          <div key={o.id} className="border p-4 rounded-2xl mb-4">
            Order #{o.id} - ${o.total}
          </div>
        ))
      )}
    </div>
  );
}
