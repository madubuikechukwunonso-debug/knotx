"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, ShoppingBag, Home, UserPlus } from "lucide-react";

export default function ShopSuccessPage() {
  const { user, isAuthenticated } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Get session_id from URL
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    setSessionId(sid);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="px-6 pb-20 pt-24 lg:pt-32">
        <div className="mx-auto max-w-2xl text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-14 w-14 text-emerald-600" />
          </div>

          {/* Title */}
          <h1 className="mb-4 font-serif text-4xl font-light text-black">
            Payment Successful!
          </h1>

          <p className="mb-8 text-lg text-black/60">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          {/* Order Info */}
          {sessionId && (
            <div className="mb-8 rounded-2xl bg-[#f6f6f6] p-6 text-left">
              <p className="text-sm text-black/50 mb-2">Order Reference</p>
              <p className="font-mono text-sm text-black break-all">{sessionId}</p>
              <p className="mt-4 text-xs text-black/50">
                A confirmation email has been sent to your email address.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            {isAuthenticated ? (
              // LOGGED IN USER
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-black px-8 py-4 text-sm font-medium uppercase tracking-widest text-white transition-all hover:bg-black/90"
                >
                  <UserPlus className="h-4 w-4" />
                  Go to Dashboard
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-black px-8 py-4 text-sm font-medium uppercase tracking-widest text-black transition-all hover:bg-black hover:text-white"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Back to Shop
                </Link>
              </>
            ) : (
              // NON-LOGGED IN USER
              <>
                <div className="mb-4 w-full rounded-2xl border border-amber-200 bg-amber-50 p-6 text-left">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <UserPlus className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-amber-900">Create an account to track your orders</p>
                      <p className="mt-1 text-sm text-amber-700">
                        Register now to view your order history, save addresses, and get exclusive offers.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-black px-8 py-4 text-sm font-medium uppercase tracking-widest text-white transition-all hover:bg-black/90"
                >
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-black px-8 py-4 text-sm font-medium uppercase tracking-widest text-black transition-all hover:bg-black hover:text-white"
                >
                  <Home className="h-4 w-4" />
                  Return Home
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-black px-8 py-4 text-sm font-medium uppercase tracking-widest text-black transition-all hover:bg-black hover:text-white"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Back to Shop
                </Link>
              </>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-sm text-black/50">
            <p>Need help with your order?</p>
            <Link href="/contact" className="text-black underline hover:no-underline">
              Contact our support team
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
