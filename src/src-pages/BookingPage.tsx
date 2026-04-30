'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { Clock, Check, ArrowLeft, User, Plus, Minus, X, Calendar } from 'lucide-react';

type Slot = { staffUserId: number; staffName: string; time: string };
type Service = {
  id: number;
  name: string;
  durationMinutes: number;
  price: number;
  depositAmount?: number;
  image?: string | null;
  hairRequirement?: string | null;
  categoryId?: number | null;
};
type Braider = { staffUserId: number; name: string; bio?: string | null };
type Category = { id: number; name: string; slug: string };
type Addon = { id: number; name: string; price: number; description?: string | null; categoryId?: number | null };

export default function BookingPage() {
  const { user } = useAuth();
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  const [selectedService, setSelectedService] = useState<number | ''>('');
  const [selectedServiceData, setSelectedServiceData] = useState<Service | null>(null);
  const [braiders, setBraiders] = useState<Braider[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedBraiderId, setSelectedBraiderId] = useState<number | undefined>(undefined);
  const [selectedBraiderName, setSelectedBraiderName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<{ addon: Addon; quantity: number }[]>([]);
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showGuestWarning, setShowGuestWarning] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<'addons' | 'braider' | 'datetime' | 'details'>('addons');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, svcRes, addRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/booking/availability'),
          fetch('/api/addons'),
        ]);
        const cats = await catRes.json();
        const svcs = await svcRes.json();
        const ads = await addRes.json();

        setCategories(cats || []);
        setAllServices(svcs.services || []);
        setAddons(ads || []);
      } catch (e) {
        console.error('Failed to load data');
      }
    };
    fetchData();
  }, []);

  // Filter services by category
  useEffect(() => {
    if (!selectedCategoryId) {
      setFilteredServices(allServices);
    } else {
      const filtered = allServices.filter(s => s.categoryId === selectedCategoryId);
      setFilteredServices(filtered);
    }
  }, [selectedCategoryId, allServices]);

  // Sync user info
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
      const svc = allServices.find(s => s.id === selectedService);
      setSelectedServiceData(svc || null);

      fetch(`/api/booking/availability?serviceId=${selectedService}`)
        .then(r => r.json())
        .then(d => setBraiders(d.braiders || []))
        .catch(() => setBraiders([]));
    }
  }, [selectedService, allServices]);

  // Fetch slots
  useEffect(() => {
    if (selectedDate && selectedService && selectedBraiderId) {
      fetch('/api/booking/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, serviceId: selectedService, staffUserId: selectedBraiderId }),
      })
        .then(r => r.json())
        .then(d => setAvailableSlots(d.slots || []))
        .catch(() => setAvailableSlots([]));
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, selectedService, selectedBraiderId]);

  const openServiceModal = (serviceId: number) => {
    setSelectedService(serviceId);
    setSelectedAddons([]);
    setSelectedBraiderId(undefined);
    setSelectedBraiderName('');
    setSelectedDate('');
    setSelectedTime('');
    setAvailableSlots([]);
    setShowGuestWarning(false);
    setModalStep('addons');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedService('');
    setSelectedServiceData(null);
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  };

  const handleBraiderSelect = (braider: Braider) => {
    setSelectedBraiderId(braider.staffUserId);
    setSelectedBraiderName(braider.name);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (!user) {
      setShowGuestWarning(true);
    }
  };

  const updateAddonQuantity = (addon: Addon, newQuantity: number) => {
    if (newQuantity < 0) return;

    setSelectedAddons(prev => {
      const existing = prev.findIndex(item => item.addon.id === addon.id);
      
      if (existing !== -1) {
        if (newQuantity === 0) {
          return prev.filter((_, index) => index !== existing);
        } else {
          const updated = [...prev];
          updated[existing] = { ...updated[existing], quantity: newQuantity };
          return updated;
        }
      } else if (newQuantity > 0) {
        return [...prev, { addon, quantity: newQuantity }];
      }
      return prev;
    });
  };

  const getAddonQuantity = (addonId: number) => {
    const item = selectedAddons.find(a => a.addon.id === addonId);
    return item ? item.quantity : 0;
  };

  const calculateTotal = () => {
    if (!selectedServiceData) return 0;
    const base = selectedServiceData.price || 0;
    const addonTotal = selectedAddons.reduce((sum, item) => sum + (item.addon.price * item.quantity), 0);
    return base + addonTotal;
  };

  const calculateDeposit = () => {
    if (!selectedServiceData) return 0;
    return selectedServiceData.depositAmount || Math.round((selectedServiceData.price || 0) * 0.3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime || !selectedBraiderId) return;

    setCheckoutLoading(true);
    try {
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
          depositAmount: calculateDeposit(),
          serviceName: selectedServiceData?.name,
          userId: user?.id,
          selectedAddons: JSON.stringify(
            selectedAddons.map(item => ({
              id: item.addon.id,
              name: item.addon.name,
              price: item.addon.price,
              quantity: item.quantity
            }))
          ),
          totalAmount: calculateTotal(),
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || 'Failed to create checkout session');
      }
    } catch (error) {
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
            <p className="mb-8 text-sm text-black/50">We&apos;ve received your booking request and payment.</p>
            <Link href="/" className="inline-flex items-center gap-2 border-b border-black pb-1 text-sm uppercase tracking-widest">
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
        <div className="mx-auto max-w-5xl">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-black/50 hover:text-black">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <h1 className="mb-4 font-serif text-4xl font-light sm:text-5xl lg:text-6xl">Book Appointment</h1>
          <p className="mb-12 max-w-lg text-sm text-black/50">Choose a category, select your service, and add any extras.</p>

          {/* CATEGORY SELECTION */}
          <div className="mb-10">
            <h2 className="text-xl font-medium mb-4">1. Choose Category</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleCategorySelect(null)}
                className={`px-6 py-3 rounded-2xl border text-sm font-medium transition-all ${selectedCategoryId === null ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-300 hover:border-emerald-400'}`}
              >
                All Services
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-6 py-3 rounded-2xl border text-sm font-medium transition-all ${selectedCategoryId === cat.id ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-300 hover:border-emerald-400'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* SERVICE SELECTION */}
          <div className="mb-10">
            <h2 className="text-xl font-medium mb-4">2. Select Service</h2>
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => {
                  const fullPrice = service.price || 0;
                  const deposit = service.depositAmount || Math.round(fullPrice * 0.3);

                  return (
                    <div
                      key={service.id}
                      onClick={() => openServiceModal(service.id)}
                      className="group cursor-pointer rounded-3xl border overflow-hidden transition-all hover:shadow-xl border-gray-200 hover:border-emerald-300"
                    >
                      <div className="h-56 bg-black relative overflow-hidden">
                        {service.image ? (
                          <img 
                            src={service.image} 
                            alt={service.name} 
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            No image
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-xl pr-4">{service.name}</h3>
                          <div className="text-right">
                            <div className="font-medium text-emerald-600">${(fullPrice / 100).toFixed(2)}</div>
                            <div className="text-xs text-gray-500">Full Price</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <Clock className="h-4 w-4" />
                          <span>{service.durationMinutes} min</span>
                        </div>

                        <div className="mb-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Deposit</span>
                            <span className="font-medium text-emerald-600">${(deposit / 100).toFixed(2)}</span>
                          </div>
                          
                          {service.hairRequirement && (
                            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-xl text-sm">
                              <span className="font-semibold">Hair Required:</span> {service.hairRequirement}
                            </div>
                          )}
                        </div>

                        <button className="mt-2 text-sm font-medium text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                          Select this service <span className="text-lg">→</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No services in this category yet. Please try another category.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SERVICE MODAL */}
      {showModal && selectedServiceData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-serif">{selectedServiceData.name}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-black">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* ADDONS STEP */}
              {modalStep === 'addons' && (
                <div>
                  <h3 className="text-xl font-medium mb-4">Add Extras (Optional)</h3>
                  <p className="text-sm text-gray-600 mb-6">You can select multiple quantities of each addon.</p>
                  
                  {addons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {addons
                        .filter(addon => !addon.categoryId || addon.categoryId === selectedCategoryId)
                        .map((addon) => {
                          const quantity = getAddonQuantity(addon.id);
                          return (
                            <div key={addon.id} className="border border-gray-200 rounded-2xl p-5">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <div className="font-medium">{addon.name}</div>
                                  {addon.description && <div className="text-xs text-gray-600">{addon.description}</div>}
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-emerald-600">+${(addon.price / 100).toFixed(2)}</div>
                                  <div className="text-xs text-gray-500">each</div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => updateAddonQuantity(addon, quantity - 1)}
                                    className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-xl hover:bg-gray-100 active:bg-gray-200"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <div className="w-10 text-center font-semibold text-lg">{quantity}</div>
                                  <button
                                    onClick={() => updateAddonQuantity(addon, quantity + 1)}
                                    className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-xl hover:bg-gray-100 active:bg-gray-200"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="text-sm text-gray-600">
                                  = ${(addon.price * quantity / 100).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-gray-500 mb-6">No add-ons available for this category.</p>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setModalStep('braider')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-medium text-base transition-colors"
                    >
                      Continue to Select Braider
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 border border-gray-300 hover:bg-gray-100 py-3.5 rounded-2xl font-medium text-base transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* BRAIDER STEP */}
              {modalStep === 'braider' && (
                <div>
                  <h3 className="text-xl font-medium mb-4">Choose Braider</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {braiders.length > 0 ? braiders.map((braider) => (
                      <button
                        key={braider.staffUserId}
                        onClick={() => handleBraiderSelect(braider)}
                        className={`p-5 rounded-2xl border text-left transition-all ${selectedBraiderId === braider.staffUserId ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'}`}
                      >
                        <div className="font-medium flex items-center gap-2">
                          <User className="h-5 w-5" /> {braider.name}
                        </div>
                        {braider.bio && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{braider.bio}</p>}
                      </button>
                    )) : <p className="text-gray-500">No braiders available for this service.</p>}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setModalStep('addons')}
                      className="flex-1 border border-gray-300 hover:bg-gray-100 py-3.5 rounded-2xl font-medium text-base transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setModalStep('datetime')}
                      disabled={!selectedBraiderId}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3.5 rounded-2xl font-medium text-base transition-colors"
                    >
                      Continue to Date & Time
                    </button>
                  </div>
                </div>
              )}

              {/* DATE & TIME STEP */}
              {modalStep === 'datetime' && (
                <div>
                  <h3 className="text-xl font-medium mb-4">Choose Date & Time</h3>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        min={today}
                        max={maxDate}
                        className="w-full border border-gray-300 rounded-2xl px-4 py-4 text-lg focus:outline-none focus:border-emerald-500"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Calendar className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">Available Times</label>
                      {availableSlots.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {availableSlots.map((slot, index) => (
                            <button
                              key={index}
                              onClick={() => handleTimeSelect(slot.time)}
                              className={`px-5 py-3 rounded-2xl border text-sm font-medium transition-all ${selectedTime === slot.time ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-300 hover:border-emerald-400'}`}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No available times for this date.</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setModalStep('braider')}
                      className="flex-1 border border-gray-300 hover:bg-gray-100 py-3.5 rounded-2xl font-medium text-base transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setModalStep('details')}
                      disabled={!selectedTime}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3.5 rounded-2xl font-medium text-base transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* DETAILS STEP - GUEST WARNING OR FORM */}
              {modalStep === 'details' && (
                <div>
                  {/* GUEST WARNING - SHOWN ALONE FOR NON-REGISTERED USERS */}
                  {showGuestWarning && !user ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                        <User className="h-8 w-8 text-amber-600" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">Booking as a Guest</h3>
                      <p className="text-amber-700 mb-6 max-w-md mx-auto">
                        You are booking as a guest. We recommend creating an account for easier management of future bookings.
                      </p>
                      
                      <div className="flex flex-col gap-3 max-w-xs mx-auto">
                        <Link 
                          href="/login" 
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-center py-3.5 rounded-2xl font-medium text-base transition-colors"
                        >
                          Login
                        </Link>
                        <Link 
                          href="/register" 
                          className="w-full border border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-center py-3.5 rounded-2xl font-medium text-base transition-colors"
                        >
                          Create Account
                        </Link>
                        <button
                          type="button"
                          onClick={() => setShowGuestWarning(false)}
                          className="w-full bg-black hover:bg-black/90 text-white text-center py-3.5 rounded-2xl font-medium text-base transition-colors"
                        >
                          Continue as Guest
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* FORM FOR REGISTERED USERS OR AFTER CONTINUING AS GUEST */
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <h3 className="text-xl font-medium mb-4">Your Details</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Full Name</label>
                          <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-4 py-3" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Email</label>
                          <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-4 py-3" required />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-4 py-3" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-4 py-3" rows={3} />
                      </div>

                      {/* TOTAL SUMMARY */}
                      <div className="bg-emerald-50 rounded-2xl p-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Service</span>
                          <span>${((selectedServiceData?.price || 0) / 100).toFixed(2)}</span>
                        </div>
                        {selectedAddons.length > 0 && (
                          <div className="flex justify-between text-sm mb-2 text-emerald-700">
                            <span>Add-ons</span>
                            <span>+${(selectedAddons.reduce((sum, item) => sum + (item.addon.price * item.quantity), 0) / 100).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="border-t border-emerald-200 pt-3 mt-3 flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span>${(calculateTotal() / 100).toFixed(2)} CAD</span>
                        </div>
                        <div className="text-xs text-emerald-600 mt-1">
                          Deposit due now: ${(calculateDeposit() / 100).toFixed(2)}
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setModalStep('datetime')}
                          className="flex-1 border border-gray-300 hover:bg-gray-100 py-3.5 rounded-2xl font-medium text-base transition-colors"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={checkoutLoading || !selectedTime}
                          className="flex-1 bg-black hover:bg-black/90 disabled:bg-gray-400 text-white py-3.5 rounded-2xl font-medium text-base transition-colors"
                        >
                          {checkoutLoading ? 'Processing...' : `Pay Deposit & Book →`}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
