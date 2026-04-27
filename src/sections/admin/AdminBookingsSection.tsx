// src/sections/admin/AdminBookingsSection.tsx
import { PrismaClient } from '@prisma/client';
import { Plus, Eye, Calendar, Clock, DollarSign } from 'lucide-react';

const prisma = new PrismaClient();

export default async function AdminBookingsSection() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      customerName: true,
      customerEmail: true,
      serviceType: true,
      price: true,
      date: true,
      time: true,
      status: true,
      durationMinutes: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Bookings</h1>
          <p className="text-emerald-600 text-sm mt-1">
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''} • Appointments & reservations
          </p>
        </div>

        <button
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-3xl transition-colors shadow-sm w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus size={20} />
          <span className="font-medium">New Booking</span>
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Date &amp; Time</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Customer</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Service</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Amount</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Status</th>
                <th className="px-6 py-5 text-right font-medium text-emerald-700 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="hover:bg-emerald-50 transition-colors group"
                >
                  {/* Date & Time */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-emerald-600" />
                      <div>
                        <p className="font-medium text-emerald-950">{booking.date}</p>
                        <div className="flex items-center gap-1 text-xs text-emerald-500">
                          <Clock size={14} />
                          {booking.time}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-5">
                    <div>
                      <p className="font-medium text-emerald-950">{booking.customerName}</p>
                      <p className="text-xs text-emerald-500 truncate max-w-[160px]">{booking.customerEmail}</p>
                    </div>
                  </td>

                  {/* Service */}
                  <td className="px-6 py-5">
                    <p className="font-medium text-emerald-700">{booking.serviceType}</p>
                    <p className="text-xs text-emerald-400">{booking.durationMinutes} min</p>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1 font-semibold text-emerald-950">
                      <DollarSign size={16} className="text-emerald-600" />
                      {(booking.price / 100).toFixed(2)}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-3xl ${
                        booking.status === 'confirmed' || booking.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : booking.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {booking.status.toUpperCase()}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 text-right">
                    <button
                      className="p-3 hover:bg-emerald-100 rounded-2xl transition-colors text-emerald-700 inline-flex items-center gap-1"
                      title="View booking details"
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
        {bookings.length === 0 && (
          <div className="px-6 py-16 text-center">
            <Calendar className="h-12 w-12 mx-auto text-emerald-300 mb-4" />
            <p className="text-emerald-500 text-lg">No bookings yet</p>
            <p className="text-xs text-emerald-400 mt-2">
              When customers book appointments they will appear here instantly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
