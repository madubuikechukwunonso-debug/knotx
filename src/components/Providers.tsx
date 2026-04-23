'use client';
import { CartProvider } from '@/hooks/useCart';
import { Toaster } from 'sonner';
import type { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <Toaster richColors position="top-right" />
    </CartProvider>
  );
}
