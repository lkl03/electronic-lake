"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

export function CartButton() {
  const open = useCart((s) => s.open);
  const totalQty = useCart((s) =>
    s.items.reduce((n, it) => n + it.qty, 0)
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Abrir carrito (${totalQty} productos)`}
      className="group relative inline-flex items-center gap-3 rounded-full border border-ink bg-ink px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-paper transition-colors hover:bg-moss hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
    >
      <span>Carrito</span>
      <span
        className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold transition-colors ${
          mounted && totalQty > 0
            ? "bg-moss text-ink group-hover:bg-ink group-hover:text-moss"
            : "bg-paper/15 text-paper/60 group-hover:bg-ink/20 group-hover:text-ink/70"
        }`}
      >
        {mounted ? totalQty : 0}
      </span>
    </button>
  );
}
