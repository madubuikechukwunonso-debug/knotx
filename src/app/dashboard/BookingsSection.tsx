'use client';

import { useEffect, useState } from "react";
import { prisma } from "@/lib/prisma"; // For client components we use fetch or server components

export default function BookingsSection() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/booking/mine")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings || []));
  }, []);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg">
      <h2 className="text-2xl font-serif mb-6">My Bookings</h2>
      {/* Real data from Prisma via API */}
      {bookings.length === 0 ? (
        <p>No bookings yet</p>
      ) : (
        bookings.map((b) => (
          <div key={b.id} className="border p-4 rounded-2xl mb-4">
            {b.serviceType} on {b.date} at {b.time}
          </div>
        ))
      )}
    </div>
  );
}
