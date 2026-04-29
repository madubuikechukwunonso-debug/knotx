'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, Check, ArrowLeft, User, X, CreditCard } from 'lucide-react';

type Slot = { 
  staffUserId: number; 
  staffName: string; 
  time: string;
};

type Service = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  depositAmount: number;
  durationMinutes: number;
  slotDurationMinutes: number;
  image?: string | null;
};

type StaffOption = {
  staffUserId: number;
  staffName: string;
  availableTimes: string[];
};

export default function BookingPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  
  const [selectedService, setSelectedService] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStaffUserId, setSelectedStaffUserId] = useState<number | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  const [pending, setPending] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

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
        .then((d) => {
          const slots: Slot[] = d.slots || [];
          setAvailableSlots(slots);

          // Group slots by staff
          const grouped: Record<number, { staffName: string; times: string[] }> = {};
          
          slots.forEach((slot) => {
            if (!grouped[slot.staffUserId]) {
              grouped[slot.staffUserId] = {
                staffName: slot.staffName,
                times: []
              };
            }
            grouped[slot.staffUserId].times.push(slot.time);
          });

          const staffList: StaffOption[] = Object.entries(grouped).map(([id, data]) => ({
            staffUserId: Number(id),
            staffName: data.staffName,
            availableTimes: data.times.sort()
          }));

          setStaffOptions(staffList);
        })
        .catch(() => {
          setAvailableSlots([]);
          setStaffOptions([]);
        });
    } else {
      setStaffOptions([]);
      setAvailableSlots([]);
    }
  }, [selectedDate, selectedService]);

  // Get available start times for selected staff that can fit the full service
  const getAvailableStartTimes = () => {
    if (!selectedStaffUserId || !selectedService) return [];

    const service = services.find(s => s.id === selectedService);
    if (!service) return [];

    const staffSlots = availableSlots.filter(s => s.staffUserId === selectedStaffUserId);
    const allTimes = staffSlots.map(s => s.time).sort();

    const duration = service.durationMinutes;
    const validStartTimes: string[] = [];

    allTimes.forEach((startTime) => {
      const [h, m] = startTime.split(':').map(Number);
      const startMinutes = h * 60 + m;
      const endMinutes = startMinutes + duration;

      let canFit = true;
      for (let t = startMinutes; t < endMinutes; t += 30) {
        const timeStr = `${Math.floor(t / 60).toString().padStart(2, '0')}:${(t % 60).toString().padStart(2, '0')}`;
        if (!allTimes.includes(timeStr)) {
          canFit = false;
          break;
        }
      }

      if (canFit) {
        validStartTimes.push(startTime);
      }
    });

    return validStartTimes;
  };

  const availableStartTimes = getAvailableStartTimes();

  const handleStaffSelect = (staffUserId: number) => {
    setSelectedStaffUserId(staffUserId);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  // Main payment flow - works for both logged-in and guest users
  const handlePayAndBook = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !selectedStaffUserId) return;

    setPending(true);

    try {
      const response = await fetch('/api/booking/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService,
          staffUserId: selectedStaffUserId,
          date: selectedDate,
          time: selectedTime,
          customerName: customerName || user?.name,
          customerEmail: customerEmail || user?.email,
          customerPhone: customerPhone || undefined,
          notes: notes || undefined,
          userId: user?.id,
          userType: user?.userType || 'guest',
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to start payment. Please try again.');
        setPending(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Something went wrong. Please try again.');
      setPending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !selectedDate || !selectedTime || !selectedStaffUserId) return;

    // If not logged in, show guest modal
    if (!user) {
      setShowGuestModal(true);
      return;
    }

    // Logged in user → go directly to Stripe
    await handlePayAndBook();
  };

  const handleGuestContinue = async () => {
    if (!customerName || !customerEmail) {
      alert('Please enter your name and email.');
      return;
    }

    setShowGuestModal(false);
    await handlePayAndBook();
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];

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
            Select service → Date → Braider → Start Time → Pay Deposit
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
                      setSelectedDate('');
                      setSelectedStaffUserId(undefined);
                      setSelectedTime('');
                    }}
                    className={`group border rounded-3xl overflow-hidden transition-all hover:shadow-md text-left ${
                      selectedService === service.id ? 'border-black ring-2 ring-black' : 'border-black/10 hover:border-black/30'
                    }`}
                  >
                    <div className="aspect-video relative bg-emerald-100">
                      {service.image ? (
                        <img src={service.image} alt={service.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-emerald-300">No image</div>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="font-medium">{service.name}</p>
                      <div className="mt-3 flex justify-between text-sm">
                        <div>
                          <span className="text-black/50">Full Price</span>
                          <p className="font-semibold">${(service.price / 100).toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-600">Deposit</span>
                          <p className="font-semibold text-emerald-700">${(service.depositAmount / 100).toFixed(2)}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-black/50">{service.durationMinutes} minutes</p>
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
                      setSelectedStaffUserId(undefined);
                      setSelectedTime('');
                    }}
                    min={today}
                    max={maxDate}
                    className="w-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-black rounded-2xl"
                    required
                  />
                </div>
              </div>
            )}

            {/* 3. Select Braider */}
            {selectedDate && staffOptions.length > 0 && (
              <div>
                <h3 className="mb-4 text-xs font-medium uppercase tracking-widest">3. Select Your Braider</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {staffOptions.map((staff) => (
                    <button
                      key={staff.staffUserId}
                      type="button"
                      onClick={() => handleStaffSelect(staff.staffUserId)}
                      className={`border rounded-3xl p-5 text-left transition-all ${
                        selectedStaffUserId === staff.staffUserId 
                          ? 'border-black bg-black text-white' 
                          : 'border-black/10 hover:border-black/30'
                      }`}
                    >
                      <div className="font-medium text-lg">{staff.staffName}</div>
                      <div className="text-xs mt-1 opacity-75">
                        {staff.availableTimes.length} available start times
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Select Start Time */}
            {selectedStaffUserId && availableStartTimes.length > 0 && (
              <div>
                <h3 className="mb-4 text-xs font-medium uppercase tracking-widest">4. Select Start Time</h3>
                <p className="text-xs text-black/50 mb-3">
                  Only times where the full {services.find(s => s.id === selectedService)?.durationMinutes} minute service fits are shown.
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableStartTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => handleTimeSelect(time)}
                      className={`border px-5 py-3 text-sm rounded-2xl transition-all flex items-center gap-2 ${
                        selectedTime === time 
                          ? 'border-black bg-black text-white' 
                          : 'border-black/10 hover:border-black/30'
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Your Details + Pay Button */}
            {selectedTime && (
              <div className="space-y-6">
                <h3 className="text-xs font-medium uppercase tracking-widest">5. Your Details</h3>
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

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={pending}
                    className="w-full flex items-center justify-center gap-3 bg-black hover:bg-black/90 disabled:bg-black/70 text-white px-12 py-5 text-sm font-medium uppercase tracking-widest rounded-2xl transition-colors"
                  >
                    <CreditCard className="h-5 w-5" />
                    {pending ? 'Redirecting to Stripe...' : `Pay Deposit & Confirm Booking`}
                  </button>
                  <p className="text-center text-xs text-black/50 mt-3">
                    You will be redirected to Stripe to complete the deposit payment securely.
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
      <Footer />

      {/* GUEST MODAL */}
      {showGuestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 relative">
            <button 
              onClick={() => setShowGuestModal(false)}
              className="absolute top-6 right-6 text-black/50 hover:text-black"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-serif">Continue as Guest?</h3>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Warning:</strong> As a guest, you won&apos;t be able to track your orders or view booking history in real time.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-black/50 mb-1">Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border border-black/20 px-4 py-3 rounded-2xl focus:border-emerald-500 outline-none"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-black/50 mb-1">Email Address</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full border border-black/20 px-4 py-3 rounded-2xl focus:border-emerald-500 outline-none"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={() => setShowGuestModal(false)}
                className="flex-1 py-4 border border-black/20 rounded-2xl text-sm font-medium hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                onClick={handleGuestContinue}
                disabled={!customerName || !customerEmail || pending}
                className="flex-1 py-4 bg-black text-white rounded-2xl text-sm font-medium disabled:opacity-50"
              >
                Continue to Stripe
              </button>
            </div>

            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-emerald-600 hover:underline">
                Sign in or create account instead
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
