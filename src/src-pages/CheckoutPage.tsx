"use client";

import { useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          customerName,
          customerEmail,
          userId: user?.id,
          userType: user?.userType,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Order failed");
      }

      setSubmitted(true);
      clearCart();
    } catch (err: any) {
      setError(err?.message || "Order failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="px-6 pb-20 pt-24 lg:pt-32">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/cart"
            className="mb-8 inline-flex items-center gap-2 text-sm text-black/50 transition-colors hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>

          <h1 className="mb-10 font-serif text-4xl font-light sm:text-5xl">
            Checkout
          </h1>

          {submitted ? (
            <div className="border border-black/10 p-8 text-center">
              <h2 className="font-serif text-3xl">Order placed</h2>
              <p className="mt-4 text-black/60">
                Your order has been submitted successfully.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-block border-b border-black pb-1 text-sm uppercase tracking-widest"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">
                    Full Name
                  </label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border border-black/10 px-4 py-3 outline-none focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full border border-black/10 px-4 py-3 outline-none focus:border-black"
                    required
                  />
                </div>

                {error ? (
                  <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={pending || items.length === 0}
                  className="bg-black px-6 py-4 text-sm uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? "Processing..." : "Place Order"}
                </button>
              </form>

              <div className="h-fit border border-black/10 p-6">
                <h2 className="mb-6 text-sm uppercase tracking-widest text-black/50">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-sm">{item.name}</p>
                        <p className="text-xs text-black/50">
                          Qty {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-black/10 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm uppercase tracking-widest">
                      Total
                    </span>
                    <span className="text-lg">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
