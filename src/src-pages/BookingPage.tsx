// src/src-pages/BookingPage.tsx   (or wherever your booking page lives)
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, Check, ArrowLeft } from 'lucide-react';

type Slot = { staffUserId: number; staffName: string; time: string };

type Service = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  depositAmount: number;
  durationMinutes: number;
  slotDurationMinutes: number;
  image?: string | null;           // ← Added
};

export default function BookingPage() {
  const { user } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedService, setSelectedService] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedStaffUserId, setSelectedStaffUserId] = useState<number | undefined>(undefined);

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  // Load services
  useEffect(() => {
    fetch('/api/booking/availability')
      .then((r) => r.json())
      .then((d) => setServices(d.services || []))
      .catch(() => setServices([]));
  }, []);

  // Load available slots when date + service selected
  useEffect(() => {
    if (selectedDate && selectedService) {
      fetch('/api/booking/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, serviceId: selectedService }),
      })
        .then((r) => r.json())
        .then((d) => setAvailableSlots(d.slots || []))
        .catch(() => setAvailableSlots([]));
    }
  }, [selectedDate, selectedService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime || !selectedStaffUserId) return;

    setPending(true);
    try {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone: customerPhone || undefined,
          serviceId: selectedService,
          staffUserId: selectedStaffUserId,
          date: selectedDate,
          time: selectedTime,
          notes: notes || undefined,
          userId: user?.id,
          userType: user?.userType,
        }),
      });

      if (!response.ok) throw new Error();
      setSubmitted(true);
    } finally {
      setPending(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="px-6 pb-20 pt-24 lg:pt-32">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-4 font-serif text-3xl font-light lg:text-4xl">Booking Confirmed</h2>
            <p className="mb-8 text-sm text-black/50">
              We&apos;ve received your booking request. Our team will confirm your appointment shortly via email.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 border-b border-black pb-1 text-sm uppercase tracking-widest transition-opacity hover:opacity-60"
            >
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="px-6 pb-20 pt-24 lg:pt-32">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-black/50 transition-colors hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <h1 className="mb-4 font-serif text-4xl font-light sm:text-5xl lg:text-6xl">Book Appointment</h1>
          <p className="mb-12 max-w-lg text-sm text-black/50">
            Select your preferred service, date, and time. A deposit is required to secure your spot.
          </p>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* 1. Select Service */}
            <div>
              <h3 className="mb-4 text-xs font-medium uppercase tracking-widest">1. Select Service</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => {
                      setSelectedService(service.id);
                      setSelectedTime('');
                      setSelectedStaffUserId(undefined);
                    }}
                    className={`group border rounded-3xl overflow-hidden transition-all hover:shadow-md ${
                      selectedService === service.id ? 'border-black ring-2 ring-black' : 'border-black/10 hover:border-black/30'
                    }`}
                  >
                    {/* Image */}
                    <div className="aspect-video relative bg-emerald-100">
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.name}
                          className="h-full w-full object-cover transition-transform group-active:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-emerald-300">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="p-5 text-left">
                      <p className="font-medium">{service.name}</p>
                      {service.description && (
                        <p className="mt-1 text-xs text-black/60 line-clamp-2">{service.description}</p>
                      )}

                      <div className="mt-4 flex justify-between text-sm">
                        <div>
                          <span className="text-black/50">Full Price</span>
                          <p className="font-semibold">${(service.price / 100).toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-600">Deposit</span>
                          <p className="font-semibold text-emerald-700">${(service.depositAmount / 100).toFixed(2)}</p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-black/50">
                        {service.durationMinutes} min • {service.slotDurationMinutes} min slots
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Select Date */}
            {selectedService && (
              <div>
                <h3 className="mb-4 text-xs font-medium uppercase tracking-widest">2. Select Date</h3>
                <div className="max-w-xs">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime('');
                      setSelectedStaffUserId(undefined);
                    }}
                    min={today}
                    max={maxDate}
                    className="w-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-black rounded-2xl"
                    required
                  />
                </div>
              </div>
            )}

            {/* 3. Select Time */}
            {selectedDate && (
              <div>
                <h3 className="mb-4 text-xs font-medium uppercase tracking-widest">3. Select Time</h3>
                {availableSlots.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={`${slot.staffUserId}-${slot.time}`}
                        type="button"
                        onClick={() => {
                          setSelectedTime(slot.time);
                          setSelectedStaffUserId(slot.staffUserId);
                        }}
                        className={`border px-5 py-3 text-sm rounded-2xl transition-all ${
                          selectedTime === slot.time && selectedStaffUserId === slot.staffUserId
                            ? 'border-black bg-black text-white'
                            : 'border-black/10 hover:border-black/30'
                        }`}
                      >
                        <Clock className="mr-1 inline h-3 w-3" />
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-black/40">No available slots for this date. Please select another date.</p>
                )}
              </div>
            )}

            {/* 4. Your Details */}
            {selectedTime && (
              <div className="space-y-6">
                <h3 className="text-xs font-medium uppercase tracking-widest">4. Your Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-black/50">Name</label>
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 text-sm rounded-2xl outline-none focus:border-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-black/50">Email</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 text-sm rounded-2xl outline-none focus:border-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-black/50">Phone (optional)</label>
                    <input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 text-sm rounded-2xl outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-black/50">Notes (optional)</label>
                    <input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 text-sm rounded-2xl outline-none focus:border-black"
                      placeholder="Any special requests?"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full bg-black px-12 py-5 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-black/90 disabled:opacity-50"
                >
                  {pending ? 'Booking...' : 'Confirm Booking & Pay Deposit'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
