"use client";

import Link from "next/link";
import Navigation from "@/components/Navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useState } from "react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [pending, setPending] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (isAuthenticated && user) {
      // LOGGED IN USER: Go directly to Stripe
      setPending(true);
      try {
        // ============================================
        // FETCH USER'S SAVED SHIPPING ADDRESS
        // ============================================
        let shippingAddress = {
          shippingAddressLine1: '',
          shippingAddressLine2: '',
          shippingCity: '',
          shippingState: '',
          shippingPostalCode: '',
          shippingCountry: 'Canada',
        };

        try {
          const profileRes = await fetch('/api/user/profile');
          if (profileRes.ok) {
            const profile = await profileRes.json();
            shippingAddress = {
              shippingAddressLine1: profile.shippingAddressLine1 || '',
              shippingAddressLine2: profile.shippingAddressLine2 || '',
              shippingCity: profile.shippingCity || '',
              shippingState: profile.shippingState || '',
              shippingPostalCode: profile.shippingPostalCode || '',
              shippingCountry: profile.shippingCountry || 'Canada',
            };
            console.log('✅ Fetched user shipping address:', shippingAddress);
          }
        } catch (profileError) {
          console.log('Could not fetch profile, using empty address');
        }

        // ============================================
        // CREATE STRIPE CHECKOUT WITH ADDRESS
        // ============================================
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
            customerName: user.name || "Customer",
            customerEmail: user.email,
            userId: user.id,
            userType: user.userType || "local",
            totalAmount: totalPrice,
            // Include user's saved shipping address
            ...shippingAddress,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || "Failed to create checkout session");
        }

        const { url } = await response.json();
        
        if (url) {
          clearCart();
          window.location.href = url;
        } else {
          throw new Error("No checkout URL returned");
        }
      } catch (error: any) {
        console.error("Checkout error:", error);
        alert(error.message || "Failed to proceed to checkout");
      } finally {
        setPending(false);
      }
    } else {
      // NOT LOGGED IN: Show beautiful guest warning modal
      setShowGuestModal(true);
    }
  };

  const proceedAsGuest = () => {
    setShowGuestModal(false);
    window.location.href = "/checkout";
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="px-6 pb-20 pt-24 lg:pt-32">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/shop"
            className="mb-8 inline-flex items-center gap-2 text-sm text-black/50 transition-colors hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>

          <h1 className="mb-10 font-serif text-4xl font-light sm:text-5xl">
            Shopping Cart
          </h1>

          {items.length === 0 ? (
            <div className="py-20 text-center">
              <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-black/10" />
              <p className="mb-4 text-lg text-black/40">Your cart is empty</p>
              <Link
                href="/shop"
                className="border-b border-black pb-1 text-sm uppercase tracking-widest transition-opacity hover:opacity-60"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-12 lg:flex-row">
              <div className="flex-1">
                <div className="space-y-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 border-b border-black/5 pb-6"
                    >
                      <div className="h-32 w-24 shrink-0 bg-[#f6f6f6]">
                        <img
                          src={item.image || "/images/products/hair-oil.jpg"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-medium">{item.name}</h3>
                          <p className="mt-1 text-sm text-black/50">
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 border border-black/10">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="p-2 transition-colors hover:bg-black/5"
                              type="button"
                            >
                              <Minus className="h-3 w-3" />
                            </button>

                            <span className="w-6 text-center text-sm">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="p-2 transition-colors hover:bg-black/5"
                              type="button"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-black/40 transition-colors hover:text-black"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-[360px]">
                <div className="sticky top-28 border border-black/10 p-6">
                  <h2 className="mb-6 text-sm uppercase tracking-widest text-black/50">
                    Order Summary
                  </h2>

                  <div className="mb-4 flex items-center justify-between text-sm">
                    <span className="text-black/60">Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>

                  <div className="mb-4 flex items-center justify-between text-sm">
                    <span className="text-black/60">Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>

                  <div className="mb-6 border-t border-black/10 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm uppercase tracking-widest">
                        Total
                      </span>
                      <span className="text-lg">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={pending || items.length === 0}
                    className="block w-full bg-black px-6 py-4 text-center text-sm uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pending ? "Processing..." : "Proceed to Checkout"}
                  </button>

                  {!isAuthenticated && (
                    <p className="mt-3 text-center text-xs text-black/50">
                      You'll be asked for shipping details
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GUEST WARNING MODAL */}
      {showGuestModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowGuestModal(false)}
              className="absolute top-6 right-6 text-black/40 hover:text-black transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
                <ShoppingBag className="h-10 w-10 text-amber-600" />
              </div>

              <h3 className="text-2xl font-semibold text-black mb-3">
                Checking Out as a Guest
              </h3>

              <p className="text-black/60 mb-6 leading-relaxed">
                You are trying to pay for a product as a guest. 
                <span className="font-medium text-black"> Login or signup</span> to keep track of your items and view your order history.
              </p>

              <div className="bg-[#f6f6f6] rounded-2xl p-4 mb-6 text-left">
                <p className="text-sm font-medium text-black mb-2">With an account you can:</p>
                <ul className="text-sm text-black/60 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> Track your orders in real-time
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> Save your shipping addresses
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> View past purchases & re-order
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span> Earn rewards & get exclusive offers
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full bg-black text-white py-4 rounded-2xl text-sm uppercase tracking-widest font-medium hover:bg-black/90 transition-colors"
                >
                  Login / Sign Up
                </Link>

                <button
                  onClick={proceedAsGuest}
                  className="block w-full border-2 border-black py-4 rounded-2xl text-sm uppercase tracking-widest font-medium hover:bg-black hover:text-white transition-all"
                >
                  Proceed as a Guest
                </button>
              </div>

              <p className="mt-4 text-xs text-black/50">
                💡 As a guest, you'll still receive order updates via email
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
