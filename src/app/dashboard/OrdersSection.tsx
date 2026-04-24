"use client";

export default function OrdersSection() {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8">
      <h2 className="text-2xl font-medium mb-6">My Orders</h2>

      <div className="space-y-6">
        <div className="border border-black/10 rounded-3xl p-6">
          <div className="flex justify-between text-sm">
            <p className="text-black/60">#39281 • Mar 15</p>
            <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-3xl text-xs">Shipped</span>
          </div>
          <h3 className="font-medium mt-2">Botanical Hair Growth Oil × 2</h3>
          <p className="text-xs text-black/60 mt-1">Tracking: TRK-9384723</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="text-xs sm:text-sm underline">Track Package</button>
            <button className="text-xs sm:text-sm underline">Download Invoice</button>
            <button className="text-xs sm:text-sm underline">Reorder</button>
          </div>
        </div>
      </div>
    </div>
  );
}
