"use client";

import Link from "next/link";
import Navigation from "@/components/Navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [pending, setPending] = useState(false);

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setPending(true);

    try {
      if (isAuthenticated && user) {
        // LOGGED IN USER: Go directly to Stripe
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
            customerName: user.name || user.displayName || "Customer",
            customerEmail: user.email,
            userId: user.id,
            userType: user.userType || "local",
            totalAmount: totalPrice,
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
      } else {
        // NOT LOGGED IN: Go to checkout page for details
        window.location.href = "/checkout";
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(error.message || "Failed to proceed to checkout");
    } finally {
      setPending(false);
    }
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
    </div>
  );
}
