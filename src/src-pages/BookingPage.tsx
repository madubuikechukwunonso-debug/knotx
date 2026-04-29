'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, Check, ArrowLeft, User } from 'lucide-react';

type Slot = { staffUserId: number; staffName: string; time: string };
type Service = { id: number; name: string; durationMinutes: number; price: number; depositAmount?: number; image?: string | null };
type Braider = { staffUserId: number; name: string; bio?: string | null };

export default function BookingPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [braiders, setBraiders] = useState<Braider[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedService, setSelectedService] = useState<number | ''>('');
  const [selectedBraiderId, setSelectedBraiderId] = useState<number | undefined>(undefined);
  const [selectedBraiderName, setSelectedBraiderName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showGuestWarning, setShowGuestWarning] = useState(false);

  // Fetch services
  useEffect(() => {
    fetch('/api/booking/availability')
      .then(r => r.json())
      .then(d => setServices(d.services || []))
      .catch(() => setServices([]));
  }, []);

  // Sync customer info when user logs in
  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '');
      setCustomerEmail(user.email || '');
      setShowGuestWarning(false);
    }
  }, [user]);

  // Fetch braiders when service selected
  useEffect(() => {
    if (selectedService) {
      fetch(`/api/booking/availability?serviceId=${selectedService}`)
        .then(r => r.json())
        .then(d => setBraiders(d.braiders || []))
        .catch(() => setBraiders([]));
      setSelectedBraiderId(undefined);
      setSelectedBraiderName('');
      setSelectedDate('');
      setSelectedTime('');
      setAvailableSlots([]);
      setShowGuestWarning(false);
    }
  }, [selectedService]);

  // Fetch slots when date + service + braider selected
  useEffect(() => {
    if (selectedDate && selectedService && selectedBraiderId) {
      fetch('/api/booking/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          serviceId: selectedService,
          staffUserId: selectedBraiderId,
        }),
      })
        .then(r => r.json())
        .then(d => setAvailableSlots(d.slots || []))
        .catch(() => setAvailableSlots([]));
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, selectedService, selectedBraiderId]);

  const handleServiceSelect = (serviceId: number) => {
    setSelectedService(serviceId);
    setSelectedTime('');
    setSelectedBraiderId(undefined);
    setSelectedBraiderName('');
    setShowGuestWarning(false);
  };

  const handleBraiderSelect = (braider: Braider) => {
    setSelectedBraiderId(braider.staffUserId);
    setSelectedBraiderName(braider.name);
    setSelectedTime('');
    setAvailableSlots([]);
    setShowGuestWarning(false);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setSelectedTime('');
    setShowGuestWarning(false);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (!user) {
      setShowGuestWarning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime || !selectedBraiderId) return;

    setCheckoutLoading(true);
    try {
      const selectedServiceData = services.find(s => s.id === selectedService);
      const depositAmount = selectedServiceData?.depositAmount || Math.round((selectedServiceData?.price || 0) * 0.3);

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService,
          staffUserId: selectedBraiderId,
          staffName: selectedBraiderName,
          date: selectedDate,
          time: selectedTime,
          customerName,
          customerEmail,
          customerPhone: customerPhone || undefined,
          notes: notes || undefined,
          depositAmount,
          serviceName: selectedServiceData?.name,
          userId: user?.id,
          userType: user?.userType,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.message || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start payment. Please try again.');
    } finally {
      setCheckoutLoading(false);
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
              We&apos;ve received your booking request and payment. Our team will confirm your appointment shortly via email.
            </p>
            <Link href="/" className="inline-flex items-center gap-2 border-b border-black pb-1 text-sm uppercase tracking-widest transition-opacity hover:opacity-60">
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
            Select your preferred braider, service, date, and time. Pay a deposit to secure your booking.
          </p>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* 1. Select Service */}
            <div>
              <h3 className="mb-4 text-xs font-medium uppercase tracking-widest">1. Select Service</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {services.map(service => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceSelect(service.id)}
                    className={`border overflow-hidden text-left transition-all ${selectedService === service.id ? 'border-black bg-black text-white' : 'border-black/10 hover:border-black/30'}`}
                  >
                    {service.image && (
                      <div className="relative h-32 w-full overflow-hidden">
                        <img 
                          src={service.image} 
                          alt={service.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className={`mt-1 text-xs ${selectedService === service.id ? 'text-white/60' : 'text-black/40'}`}>
                        {Math.round(service.durationMinutes / 60)} hrs · ${(service.price / 100).toFixed(0)} 
                        {service.depositAmount ? ` (Deposit $${(service.depositAmount / 100).toFixed(0)})` : ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Select Braider (after service) */}
            {selectedService && (
              <div className="animate-fade-in-up">
                <h3 className="mb-4 text-xs font-medium uppercase tracking-widest">2. Select Braider</h3>
                {braiders.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {braiders.map(braider => (
                      <button
                        key={braider.staffUserId}
                        type="button"
                        onClick={() => handleBraiderSelect(braider)}
                        className={`border p-4 text-left transition-all flex items-start gap-3 ${selectedBraiderId === braider.staffUserId ? 'border-black bg-black text-white' : 'border-black/10 hover:border-black/30'}`}
                      >
                        <div className="mt-0.5">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{braider.name}</p>
                          {braider.bio && (
                            <p className={`mt-1 text-xs line-clamp-2 ${selectedBraiderId === braider.staffUserId ? 'text-white/60' : 'text-black/40'}`}>
                              {braider.bio}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-black/40">No braiders available for this service.</p>
                )}
              </div>
            )}

            {/* 3. Select Date (after braider) */}
            {selectedBraiderId && (
              <div className="animate-fade-in-up">
                <h3 className="mb-4 text-xs font-medium uppercase tracking-widest">3. Select Date</h3>
                <div className="relative max-w-xs">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    min={today}
                    max={maxDate}
                    className="w-full border border-black/10 pl-10 pr-4 py-3 text-sm outline-none transition-colors focus:border-black"
                    required
                  />
                </div>
              </div>
            )}

            {/* 4. Select Time (after date) */}
            {selectedDate && selectedBraiderId && (
              <div className="animate-fade-in-up">
                <h3 className="mb-4 text-xs font-medium uppercase tracking-widest">4. Select Time with {selectedBraiderName}</h3>
                {availableSlots.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => handleTimeSelect(slot.time)}
                        className={`border px-4 py-2 text-sm transition-all ${selectedTime === slot.time ? 'border-black bg-black text-white' : 'border-black/10 hover:border-black/30'}`}
                      >
                        <Clock className="mr-1 inline h-3 w-3" />
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-black/40">No available slots for this date with the selected braider. Please choose another date.</p>
                )}
              </div>
            )}

            {/* Guest Sign-in Prompt / Warning */}
            {selectedTime && !user && !showGuestWarning && (
              <div className="animate-fade-in-up border border-amber-400 bg-amber-50 rounded-3xl p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-amber-700" />
                  </div>
                  <h3 className="text-xl font-serif text-amber-900">Sign in to track your booking</h3>
                </div>
                <p className="text-amber-800 text-sm leading-relaxed">
                  You&apos;re not currently signed in. Signing in allows you to track your service in real-time, receive instant updates, manage appointments, and view your booking history.
                </p>
                <div className="bg-white/80 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
                  <strong>Warning:</strong> If you continue as a guest, you won&apos;t be able to keep track of your service in real time. We&apos;ll still email you confirmation and updates, but you won&apos;t have a live dashboard.
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link 
                    href="/login?redirect=/book" 
                    className="flex-1 text-center border border-amber-600 hover:bg-amber-100 text-amber-800 px-6 py-3.5 rounded-2xl text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <button 
                    type="button"
                    onClick={() => setShowGuestWarning(true)}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3.5 rounded-2xl text-sm font-medium transition-colors"
                  >
                    Continue as Guest
                  </button>
                </div>
              </div>
            )}

            {/* 5. Your Details */}
            {selectedTime && (user || showGuestWarning) && (
              <div className="animate-fade-in-up space-y-4">
                <h3 className="mb-4 text-xs font-medium uppercase tracking-widest">5. Your Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-black/50">Name</label>
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-black/50">Email</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-black/50">Phone (optional)</label>
                    <input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-black/50">Notes (optional)</label>
                    <input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
                      placeholder="Any special requests?"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={checkoutLoading || pending}
                  className="mt-4 w-full bg-black px-12 py-4 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-black/80 disabled:opacity-50 sm:w-auto"
                >
                  {checkoutLoading ? 'Processing Payment...' : 'Pay Deposit & Book Appointment'}
                </button>
                <p className="text-xs text-black/40 text-center sm:text-left">
                  A deposit is required to secure your appointment. The remaining balance is due at the time of service.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
