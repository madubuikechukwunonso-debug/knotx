'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { Check, ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const formatPrice = (cents:number)=>`$${(cents/100).toFixed(2)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    setPending(true);
    try {
      const response = await fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ items: items.map((i)=>({productId:i.productId, quantity:i.quantity})), customerName, customerEmail, userId: user?.id, userType: user?.userType })});
      if (!response.ok) throw new Error('Order failed');
      setSubmitted(true); clearCart();
    } catch {} finally { setPending(false); }
  };

  if (items.length === 0 && !submitted) {
    router.push('/cart');
    return null;
  }

  if (submitted) {
    return <div className="min-h-screen bg-white"><Navigation/><div className="px-6 pb-20 pt-24 lg:pt-32"><div className="mx-auto max-w-md text-center"><div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black"><Check className="h-8 w-8 text-white"/></div><h2 className="mb-4 font-serif text-3xl font-light lg:text-4xl">Order Placed</h2><p className="mb-8 text-sm text-black/50">Thank you for your order! We&apos;ll send a confirmation email shortly. Your items will be processed and shipped soon.</p><Link href="/shop" className="inline-block border-b border-black pb-1 text-sm uppercase tracking-widest transition-opacity hover:opacity-60">Continue Shopping</Link></div></div></div>;
  }

  return <div className="min-h-screen bg-white"><Navigation/><div className="px-6 pb-20 pt-24 lg:pt-32"><div className="mx-auto max-w-4xl"><Link href="/cart" className="mb-8 inline-flex items-center gap-2 text-sm text-black/50 transition-colors hover:text-black"><ArrowLeft className="h-4 w-4"/>Back to cart</Link><h1 className="mb-10 font-serif text-4xl font-light sm:text-5xl">Checkout</h1><div className="flex flex-col gap-12 lg:flex-row"><div className="flex-1"><form onSubmit={handleSubmit} className="space-y-6"><div><h3 className="mb-4 text-xs font-medium uppercase tracking-widest">Contact Information</h3><div className="space-y-4"><div><label className="mb-1 block text-xs text-black/50">Full Name</label><input value={customerName} onChange={(e)=>setCustomerName(e.target.value)} className="w-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-black" required /></div><div><label className="mb-1 block text-xs text-black/50">Email</label><input type="email" value={customerEmail} onChange={(e)=>setCustomerEmail(e.target.value)} className="w-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-black" required /></div></div></div><div><h3 className="mb-4 text-xs font-medium uppercase tracking-widest">Payment (Mock)</h3><div className="bg-[#f6f6f6] p-6 text-center"><p className="text-sm text-black/50">This is a demo checkout. No real payment will be processed.</p><p className="mt-2 text-xs text-black/30">Stripe integration ready for production</p></div></div><button type="submit" disabled={pending} className="w-full bg-black py-4 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-black/80 disabled:opacity-50">{pending ? 'Processing...' : `Pay ${formatPrice(totalPrice)}`}</button></form></div><div className="w-full lg:w-80"><div className="bg-[#f6f6f6] p-6 lg:p-8"><h2 className="mb-6 text-xs font-medium uppercase tracking-widest">Order Summary</h2><div className="mb-6 space-y-4">{items.map((item)=><div key={item.productId} className="flex justify-between text-sm"><span className="text-black/60">{item.name} x {item.quantity}</span><span>{formatPrice(item.price * item.quantity)}</span></div>)}</div><div className="border-t border-black/10 pt-4"><div className="flex justify-between font-medium"><span>Total</span><span>{formatPrice(totalPrice)}</span></div></div></div></div></div></div></div></div>;
}
