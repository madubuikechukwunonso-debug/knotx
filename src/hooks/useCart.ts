'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cart');
      setItems(stored ? JSON.parse(stored) : []);
    } catch {
      setItems([]);
    }
  }, []);

  const persist = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem('cart', JSON.stringify(next));
  };

  const addItem = useCallback((item: CartItem) => {
    persist((() => {
      const existing = items.find((i) => i.productId === item.productId);
      if (existing) {
        return items.map((i) => i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...items, item];
    })());
  }, [items]);

  const removeItem = useCallback((productId: number) => {
    persist(items.filter((i) => i.productId !== productId));
  }, [items]);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    persist(items.map((i) => i.productId === productId ? { ...i, quantity } : i));
  }, [items, removeItem]);

  const clearCart = useCallback(() => {
    persist([]);
  }, []);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  return <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
