'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import { User, Calendar, ShoppingBag, ArrowLeft, LogOut } from 'lucide-react';

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  // Load user's bookings and orders
  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/booking/create?mine=1')
        .then((r) => r.json())
        .then((d) => setMyBookings(d.bookings || []))
        .catch(() => {});

      fetch('/api/orders?mine=1')
        .then((r) => r.json())
        .then((d) => setMyOrders(d.orders || []))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const formatPrice = (c: number) => `$${(c / 100).toFixed(2)}`;
  const formatDate = (date: any) =>
    date
      ? new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'N/A';

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/20 border-t-black" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="px-6 pb-20 pt-24 lg:pt-32">
        <div className="mx-auto max-w-4xl">
          {/* Back button */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-black/50 transition-colors hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* User header */}
          <div className="mb-12 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-light lg:text-4xl">{user.name}</h1>
              <p className="text-sm text-black/50">{user.email}</p>
            </div>

            <button
              onClick={logout}
              className="ml-auto flex items-center gap-2 text-sm text-black/50 transition-colors hover:text-black"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* My Bookings */}
            <div>
              <h2 className="mb-6 flex items-center gap-2 text-xs font-medium uppercase tracking-widest">
                <Calendar className="h-4 w-4" />
                My Bookings
              </h2>

              {myBookings.length > 0 ? (
                <div className="space-y-4">
                  {myBookings.map((booking) => (
                    <div key={booking.id} className="border border-black/5 p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <p className="text-sm font-medium capitalize">
                          {String(booking.serviceType || 'service').replace(/-/g, ' ')}
                        </p>
                        <span className="bg-yellow-50 px-2 py-1 text-xs uppercase text-yellow-600">
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-xs text-black/50">
                        {booking.date} at {booking.time}
                      </p>
                      {booking.notes && (
                        <p className="mt-2 text-xs text-black/30">{booking.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#f6f6f6] py-8 text-center">
                  <p className="mb-2 text-sm text-black/40">No bookings yet</p>
                  <Link
                    href="/booking"
                    className="border-b border-black pb-0.5 text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
                  >
                    Book Now
                  </Link>
                </div>
              )}
            </div>

            {/* My Orders */}
            <div>
              <h2 className="mb-6 flex items-center gap-2 text-xs font-medium uppercase tracking-widest">
                <ShoppingBag className="h-4 w-4" />
                My Orders
              </h2>

              {myOrders.length > 0 ? (
                <div className="space-y-4">
                  {myOrders.map((order) => (
                    <div key={order.id} className="border border-black/5 p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <p className="text-sm font-medium">Order #{order.id}</p>
                        <span className="bg-black/5 px-2 py-1 text-xs uppercase">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-black/50">{formatPrice(order.total)}</p>
                      <p className="mt-1 text-xs text-black/30">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#f6f6f6] py-8 text-center">
                  <p className="mb-2 text-sm text-black/40">No orders yet</p>
                  <Link
                    href="/shop"
                    className="border-b border-black pb-0.5 text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
                  >
                    Shop Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
