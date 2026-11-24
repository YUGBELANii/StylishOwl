"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "stylishowl-cart-v1";

export function StoreCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed.filter((item) =>
          typeof item.variantId === "string" &&
          typeof item.quantity === "number" &&
          item.quantity > 0 &&
          Number.isFinite(item.unitPrice)
        ));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    addItem: (item) => setItems((current) => {
      const existing = current.find((line) => line.variantId === item.variantId);
      if (existing) return current.map((line) =>
        line.variantId === item.variantId ? { ...line, quantity: line.quantity + 1 } : line
      );
      return [...current, { ...item, quantity: 1 }];
    }),
    updateQuantity: (variantId, quantity) => setItems((current) =>
      quantity < 1 ? current.filter((item) => item.variantId !== variantId) :
      current.map((item) => item.variantId === variantId ? { ...item, quantity: Math.min(quantity, 10) } : item)
    ),
    removeItem: (variantId) => setItems((current) => current.filter((item) => item.variantId !== variantId)),
    clearCart: () => setItems([]),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useStoreCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useStoreCart must be used inside StoreCartProvider.");
  return value;
}
