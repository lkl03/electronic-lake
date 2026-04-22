"use client";

import { useCart } from "@/lib/cart";
import type { Phone } from "@/lib/types";

export function AddToCartButton({ phone }: { phone: Phone }) {
  const add = useCart((s) => s.add);
  return (
    <button
      onClick={() => add(phone)}
      className="inline-flex items-center gap-2 rounded-full bg-[#96ca51] px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-[#8abf40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
    >
      Agregar al carrito
    </button>
  );
}
