"use client";

import { useCart } from "@/lib/cart";
import type { Phone } from "@/lib/types";

export function AddToCartButton({
  phone,
  variant = "primary",
}: {
  phone: Phone;
  variant?: "primary" | "ghost";
}) {
  const add = useCart((s) => s.add);
  if (variant === "ghost") {
    return (
      <button
        onClick={() => add(phone)}
        className="rounded-full border border-ink px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-paper"
      >
        Agregar al carrito
      </button>
    );
  }
  return (
    <button
      onClick={() => add(phone)}
      className="inline-flex items-center gap-3 rounded-full bg-moss px-7 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-moss"
    >
      Agregar al carrito →
    </button>
  );
}
