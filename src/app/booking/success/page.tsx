'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { CheckCircle } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="px-6 pb-20 pt-24 lg:pt-32">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </div>
          
          <h1 className="mb-4 font-serif text-4xl font-light text-emerald-950">
            Payment Successful!
          </h1>
          
          <p className="mb-6 text-lg text-black/60">
            Your deposit has been processed and your booking is confirmed.
          </p>

          <div className="mb-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-left">
            <div className="mb-3 flex items-center gap-2 text-emerald-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">What happens next?</span>
            </div>
            <ul className="space-y-2 text-sm text-emerald-800">
              <li>• You&apos;ll receive a confirmation email shortly</li>
              <li>• The braider will contact you to confirm the exact time</li>
              <li>• Sign up with the same email to track this booking anytime</li>
            </ul>
          </div>

          {sessionId && (
            <p className="mb-8 text-xs text-black/40">
              Session ID: {sessionId}
            </p>
          )}

          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left">
            <p className="mb-3 text-sm font-medium text-amber-800">
              Guest booking confirmed
            </p>
            <p className="text-sm text-amber-700">
              You booked as a guest. Create a free account with the same email you used to track this booking, reschedule, or view updates in real time.
            </p>
            <Link 
              href="/register" 
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-amber-600 bg-white px-6 py-2.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
            >
              Create Free Account
            </Link>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link 
              href="/book" 
              className="inline-flex items-center justify-center gap-2 border border-black px-8 py-3 text-sm font-medium uppercase tracking-widest transition-colors hover:bg-black hover:text-white"
            >
              Book Another Appointment
            </Link>
            
            <Link 
              href="/" 
              className="inline-flex items-center justify-center gap-2 bg-black px-8 py-3 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-black/80"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="text-black/60">Loading booking confirmation...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
