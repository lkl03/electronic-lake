"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

export function CartButton() {
  const open = useCart((s) => s.open);
  const totalQty = useCart((s) => s.items.reduce((n, it) => n + it.qty, 0));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Abrir carrito (${totalQty} productos)`}
      className="relative inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#96ca51]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      <span>Carrito</span>
      {mounted && totalQty > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#96ca51] px-1.5 text-xs font-semibold text-neutral-900">
          {totalQty}
        </span>
      )}
    </button>
  );
}
