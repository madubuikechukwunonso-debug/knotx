// src/sections/admin/AdminBookingTable.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Plus } from 'lucide-react';

type Booking = {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  serviceType: string;
  durationMinutes: number;
  price: number;
  date: string;
  time: string;
  status: string;
  paymentStatus: string;
  notes?: string | null;
  createdAt: Date;
};

type Service = {
  id: number;
  name: string;
  price: number;
  durationMinutes: number;
};

type Props = {
  bookings: Booking[];
  services?: Service[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminBookingTable({
  bookings,
  services = [],
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // State for auto-filling duration & price when selecting a service
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [price, setPrice] = useState(0);

  const handleServiceChange = (serviceId: string) => {
    const id = parseInt(serviceId);
    const selectedService = services.find((s) => s.id === id);

    if (selectedService) {
      setSelectedServiceId(id);
      setDurationMinutes(selectedService.durationMinutes);
      setPrice(selectedService.price);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    if (editingBooking) {
      formData.append('id', editingBooking.id.toString());
      await onUpdate(formData);
    } else {
      await onCreate(formData);
    }
    setModalOpen(false);
    setEditingBooking(null);
    setSelectedServiceId(null);
    setDurationMinutes(60);
    setPrice(0);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this booking permanently?')) {
      const formData = new FormData();
      formData.append('id', id.toString());
      await onDelete(formData);
      router.refresh();
    }
  };

  const openNewBooking = () => {
    setEditingBooking(null);
    setSelectedServiceId(null);
    setDurationMinutes(60);
    setPrice(0);
    setModalOpen(true);
  };

  return (
    <>
      <button
        onClick={openNewBooking}
        className="flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-black/90"
      >
        <Plus className="h-4 w-4" />
        New Booking
      </button>

      {/* Table */}
      <div className="rounded-3xl border border-black/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="bg-black/5">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-medium whitespace-nowrap">Customer</th>
                <th className="px-4 py-4 text-left text-xs font-medium whitespace-nowrap">Service</th>
                <th className="px-4 py-4 text-left text-xs font-medium whitespace-nowrap">Date & Time</th>
                <th className="px-4 py-4 text-left text-xs font-medium whitespace-nowrap">Price</th>
                <th className="px-4 py-4 text-left text-xs font-medium whitespace-nowrap">Status</th>
                <th className="px-4 py-4 text-right text-xs font-medium whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-black/5">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-xs text-black/50 truncate max-w-[180px]">
                        {booking.customerEmail}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium">{booking.serviceType}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-black/70 whitespace-nowrap">
                    {booking.date} • {booking.time}
                  </td>
                  <td className="px-4 py-4 font-medium whitespace-nowrap">
                    ${(booking.price / 100).toFixed(2)} CAD
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block rounded-2xl px-3 py-1 text-xs font-medium ${
                        statusColors[booking.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => {
                        setEditingBooking(booking);
                        setModalOpen(true);
                      }}
                      className="mr-3 text-black/70 hover:text-black"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(booking.id)}
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
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full mx-auto shadow-2xl max-h-[90vh] overflow-auto">
            <form action={handleSubmit} className="p-8 space-y-6">
              <h2 className="text-2xl font-serif">
                {editingBooking ? 'Edit Booking' : 'New Booking'}
              </h2>

              {editingBooking && <input type="hidden" name="id" value={editingBooking.id} />}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium mb-1">Customer Name</label>
                  <input
                    name="customerName"
                    defaultValue={editingBooking?.customerName}
                    required
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Email</label>
                  <input
                    name="customerEmail"
                    type="email"
                    defaultValue={editingBooking?.customerEmail}
                    required
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium mb-1">Phone (optional)</label>
                  <input
                    name="customerPhone"
                    defaultValue={editingBooking?.customerPhone || ''}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>

                {/* === SERVICE DROPDOWN === */}
                <div>
                  <label className="block text-xs font-medium mb-1">Service</label>
                  <select
                    name="serviceType"
                    required
                    defaultValue={editingBooking?.serviceType || ''}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name} — ${(service.price / 100).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-medium mb-1">Date</label>
                  <input
                    name="date"
                    type="date"
                    defaultValue={editingBooking?.date}
                    required
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Time</label>
                  <input
                    name="time"
                    type="time"
                    defaultValue={editingBooking?.time}
                    required
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Duration (min)</label>
                  <input
                    name="durationMinutes"
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                    required
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium mb-1">Price (cents)</label>
                  <input
                    name="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value))}
                    required
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Payment Status</label>
                  <select
                    name="paymentStatus"
                    defaultValue={editingBooking?.paymentStatus || 'unpaid'}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Booking Status</label>
                <select
                  name="status"
                  defaultValue={editingBooking?.status || 'pending'}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Notes</label>
                <textarea
                  name="notes"
                  defaultValue={editingBooking?.notes || ''}
                  rows={3}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingBooking(null);
                    setSelectedServiceId(null);
                  }}
                  className="flex-1 py-4 rounded-2xl border border-black/10 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-black text-white font-medium"
                >
                  {editingBooking ? 'Save Changes' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
