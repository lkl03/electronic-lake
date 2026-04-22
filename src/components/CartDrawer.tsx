"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import {
  buildCheckoutMessage,
  buildWhatsAppUrl,
  formatArs,
} from "@/lib/whatsapp";
import { Logo } from "./Logo";

export function CartDrawer() {
  const { isOpen, close, items, setQty, remove, clear, totalArs } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  const total = totalArs();

  const handleCheckout = () => {
    const msg = buildCheckoutMessage(items);
    window.open(buildWhatsAppUrl(msg), "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div
        aria-hidden={!isOpen}
        onClick={close}
        className={`fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-paper text-ink shadow-[-20px_0_60px_-10px_rgba(0,0,0,0.25)] transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.15,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink/15 px-6 py-5">
          <div className="flex items-center gap-3">
            <Logo className="h-6 w-6 text-ink" />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/50">
                № {String(items.length).padStart(2, "0")}
              </div>
              <h2 className="font-display text-2xl leading-none">Tu selección</h2>
            </div>
          </div>
          <button
            onClick={close}
            aria-label="Cerrar"
            className="rounded-full border border-ink/15 p-2 text-ink/60 transition-colors hover:border-ink hover:text-ink"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Logo className="h-16 w-16 text-moss/50" />
              <p className="mt-6 font-display text-2xl italic text-ink/70">
                Todavía sin selección
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/40">
                Elegí tu próximo equipo
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-ink/10">
              {items.map((it, idx) => {
                const title = [it.brand, it.model, it.variant]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <li key={it.slug} className="flex gap-4 py-5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <p className="font-display text-lg leading-tight">
                        {title}
                      </p>
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-ink/55">
                        {formatArs(it.priceArs)}
                      </p>
                      <div className="mt-3 flex items-center gap-2 font-mono text-xs">
                        <button
                          onClick={() => setQty(it.slug, it.qty - 1)}
                          aria-label="Disminuir"
                          className="h-7 w-7 rounded-full border border-ink/20 text-ink/60 transition-colors hover:border-ink hover:text-ink"
                        >
                          −
                        </button>
                        <span className="w-6 text-center">{it.qty}</span>
                        <button
                          onClick={() => setQty(it.slug, it.qty + 1)}
                          aria-label="Aumentar"
                          className="h-7 w-7 rounded-full border border-ink/20 text-ink/60 transition-colors hover:border-ink hover:text-ink"
                        >
                          +
                        </button>
                        <button
                          onClick={() => remove(it.slug)}
                          className="ml-3 text-[10px] uppercase tracking-[0.2em] text-ink/40 underline underline-offset-4 hover:text-ink"
                        >
                          quitar
                        </button>
                      </div>
                    </div>
                    <div className="font-display text-xl">
                      {formatArs(it.priceArs * it.qty)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-ink/15 bg-ink px-6 py-6 text-paper">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/60">
                Total
              </span>
              <span className="font-display text-3xl leading-none">
                {formatArs(total)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-moss px-6 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-paper"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden
              >
                <path d="M20.52 3.48A11.83 11.83 0 0 0 12.06 0C5.47 0 .12 5.34.12 11.92c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64a11.9 11.9 0 0 0 5.79 1.48h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.18-3.48-8.43ZM12.07 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.97.99-3.62-.23-.37a9.87 9.87 0 0 1-1.52-5.27c0-5.47 4.45-9.92 9.93-9.92 2.65 0 5.14 1.03 7.02 2.91a9.86 9.86 0 0 1 2.9 7.02c0 5.47-4.45 9.91-9.96 9.91Zm5.45-7.42c-.3-.15-1.77-.87-2.04-.97-.28-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07a8.14 8.14 0 0 1-2.4-1.48 9 9 0 0 1-1.66-2.07c-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51-.17-.01-.37-.01-.57-.01s-.52.07-.8.37c-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.63.71.22 1.36.19 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
              </svg>
              Finalizar por WhatsApp →
            </button>
            <button
              onClick={clear}
              className="mt-3 w-full text-[10px] uppercase tracking-[0.22em] text-paper/40 underline underline-offset-4 hover:text-paper"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
