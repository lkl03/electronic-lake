"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Phone } from "./types";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (phone: Phone) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  totalQty: () => number;
  totalArs: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      add: (phone) =>
        set((s) => {
          const existing = s.items.find((it) => it.slug === phone.slug);
          if (existing) {
            return {
              items: s.items.map((it) =>
                it.slug === phone.slug ? { ...it, qty: it.qty + 1 } : it
              ),
              isOpen: true,
            };
          }
          return {
            items: [
              ...s.items,
              {
                slug: phone.slug,
                brand: phone.brand,
                model: phone.model,
                variant: phone.variant,
                priceArs: phone.priceArs,
                qty: 1,
              },
            ],
            isOpen: true,
          };
        }),
      remove: (slug) =>
        set((s) => ({ items: s.items.filter((it) => it.slug !== slug) })),
      setQty: (slug, qty) =>
        set((s) => ({
          items: s.items
            .map((it) => (it.slug === slug ? { ...it, qty } : it))
            .filter((it) => it.qty > 0),
        })),
      clear: () => set({ items: [] }),
      totalQty: () => get().items.reduce((n, it) => n + it.qty, 0),
      totalArs: () =>
        get().items.reduce((n, it) => n + it.priceArs * it.qty, 0),
    }),
    { name: "electronic-lake-cart" }
  )
);
