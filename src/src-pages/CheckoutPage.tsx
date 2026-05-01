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
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddressLine1, setShippingAddressLine1] = useState("");
  const [shippingAddressLine2, setShippingAddressLine2] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("Canada");

  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);

    try {
      const response = await fetch("/api/stripe/checkout-shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            name: item.name,
            price: item.price,
          })),
          customerName,
          customerEmail,
          customerPhone,
          shippingAddressLine1,
          shippingAddressLine2,
          shippingCity,
          shippingState,
          shippingPostalCode,
          shippingCountry,
          userId: user?.id,
          userType: user?.userType || "guest",
          totalAmount: totalPrice,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Checkout failed");
      }

      const { url } = await response.json();

      if (url) {
        clearCart();
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      setError(err?.message || "Checkout failed");
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="px-6 pb-20 pt-24 lg:pt-32">
          <div className="mx-auto max-w-5xl text-center">
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
        </div>
      </div>
    );
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

          <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h3 className="mb-4 text-sm uppercase tracking-[0.22em] text-black/55">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">
                      Full Name *
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
                      Email *
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 outline-none focus:border-black"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 outline-none focus:border-black"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-sm uppercase tracking-[0.22em] text-black/55">
                  Shipping Address
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">
                      Address Line 1 *
                    </label>
                    <input
                      value={shippingAddressLine1}
                      onChange={(e) => setShippingAddressLine1(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 outline-none focus:border-black"
                      placeholder="123 Main Street"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">
                      Address Line 2
                    </label>
                    <input
                      value={shippingAddressLine2}
                      onChange={(e) => setShippingAddressLine2(e.target.value)}
                      className="w-full border border-black/10 px-4 py-3 outline-none focus:border-black"
                      placeholder="Apt 4B (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">
                        City *
                      </label>
                      <input
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        className="w-full border border-black/10 px-4 py-3 outline-none focus:border-black"
                        placeholder="Toronto"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">
                        Province/State *
                      </label>
                      <input
                        value={shippingState}
                        onChange={(e) => setShippingState(e.target.value)}
                        className="w-full border border-black/10 px-4 py-3 outline-none focus:border-black"
                        placeholder="ON"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">
                        Postal Code *
                      </label>
                      <input
                        value={shippingPostalCode}
                        onChange={(e) => setShippingPostalCode(e.target.value)}
                        className="w-full border border-black/10 px-4 py-3 outline-none focus:border-black"
                        placeholder="M5V 2T6"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-black/55">
                        Country *
                      </label>
                      <input
                        value={shippingCountry}
                        onChange={(e) => setShippingCountry(e.target.value)}
                        className="w-full border border-black/10 px-4 py-3 outline-none focus:border-black"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error ? (
                <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={pending || items.length === 0}
                className="w-full bg-black px-6 py-4 text-sm uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Processing..." : "Proceed to Payment"}
              </button>

              <p className="text-center text-xs text-black/50">
                You'll be redirected to Stripe to complete payment securely
              </p>
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
                      <p className="text-xs text-black/50">Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-black/10 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-widest">Total</span>
                  <span className="text-lg">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className="mt-4 text-xs text-black/50">
                <p>✓ Secure payment via Stripe</p>
                <p>✓ Order confirmed after payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
