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
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
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

  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [price, setPrice] = useState(0);

  const handleServiceChange = (serviceId: string) => {
    const id = parseInt(serviceId);
    const selected = services.find((s) => s.id === id);

    if (selected) {
      setSelectedServiceId(id);
      setDurationMinutes(selected.durationMinutes);
      setPrice(selected.price);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    formData.append('durationMinutes', durationMinutes.toString());
    formData.append('price', price.toString());

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
        className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-4 w-4" />
        New Booking
      </button>

      {/* Table */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-medium whitespace-nowrap text-muted-foreground">Customer</th>
                <th className="px-4 py-4 text-left text-xs font-medium whitespace-nowrap text-muted-foreground">Service</th>
                <th className="px-4 py-4 text-left text-xs font-medium whitespace-nowrap text-muted-foreground">Date & Time</th>
                <th className="px-4 py-4 text-left text-xs font-medium whitespace-nowrap text-muted-foreground">Price</th>
                <th className="px-4 py-4 text-left text-xs font-medium whitespace-nowrap text-muted-foreground">Status</th>
                <th className="px-4 py-4 text-right text-xs font-medium whitespace-nowrap text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-foreground">{booking.customerName}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {booking.customerEmail}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-foreground">{booking.serviceType}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground whitespace-nowrap">
                    {booking.date} • {booking.time}
                  </td>
                  <td className="px-4 py-4 font-medium text-foreground whitespace-nowrap">
                    ${(booking.price / 100).toFixed(2)} CAD
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-block rounded-2xl px-3 py-1 text-xs font-medium ${statusColors[booking.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => {
                        setEditingBooking(booking);
                        setModalOpen(true);
                      }}
                      className="mr-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(booking.id)} 
                      className="text-red-500 hover:text-red-600 transition-colors"
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
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full mx-auto shadow-2xl max-h-[90vh] overflow-auto">
            <form action={handleSubmit} className="p-8 space-y-6">
              <h2 className="text-2xl font-serif text-foreground">
                {editingBooking ? 'Edit Booking' : 'New Booking'}
              </h2>

              {editingBooking && <input type="hidden" name="id" value={editingBooking.id} />}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Customer Name</label>
                  <input 
                    name="customerName" 
                    defaultValue={editingBooking?.customerName} 
                    required 
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Email</label>
                  <input 
                    name="customerEmail" 
                    type="email" 
                    defaultValue={editingBooking?.customerEmail} 
                    required 
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Phone (optional)</label>
                  <input 
                    name="customerPhone" 
                    defaultValue={editingBooking?.customerPhone || ''} 
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Service</label>
                  <select
                    name="serviceType"
                    required
                    defaultValue={editingBooking?.serviceType || ''}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
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
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Date</label>
                  <input 
                    name="date" 
                    type="date" 
                    defaultValue={editingBooking?.date} 
                    required 
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Time</label>
                  <input 
                    name="time" 
                    type="time" 
                    defaultValue={editingBooking?.time} 
                    required 
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Duration (min)</label>
                  <input
                    name="durationMinutes"
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                    required
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Price (cents)</label>
                  <input
                    name="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value))}
                    required
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Payment Status</label>
                  <select 
                    name="paymentStatus" 
                    defaultValue={editingBooking?.paymentStatus || 'unpaid'} 
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-muted-foreground">Booking Status</label>
                <select 
                  name="status" 
                  defaultValue={editingBooking?.status || 'pending'} 
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-muted-foreground">Notes</label>
                <textarea 
                  name="notes" 
                  defaultValue={editingBooking?.notes || ''} 
                  rows={3} 
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground" 
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
                  className="flex-1 py-4 rounded-2xl border border-border font-medium hover:bg-muted text-foreground"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-medium hover:bg-primary/90"
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
