"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart";
import { buildCheckoutMessage, buildWhatsAppUrl, formatArs } from "@/lib/whatsapp";

export function CartDrawer() {
  const { isOpen, close, items, setQty, remove, clear, totalArs } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
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
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">Tu carrito</h2>
          <button
            onClick={close}
            aria-label="Cerrar carrito"
            className="rounded-full p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="py-16 text-center text-sm text-neutral-500">
              Tu carrito está vacío.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {items.map((it) => {
                const title = [it.brand, it.model, it.variant]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <li key={it.slug} className="flex gap-3 py-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">
                        {title}
                      </p>
                      <p className="mt-1 text-sm text-neutral-600">
                        {formatArs(it.priceArs)}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => setQty(it.slug, it.qty - 1)}
                          aria-label="Disminuir"
                          className="h-8 w-8 rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm">
                          {it.qty}
                        </span>
                        <button
                          onClick={() => setQty(it.slug, it.qty + 1)}
                          aria-label="Aumentar"
                          className="h-8 w-8 rounded-full border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100"
                        >
                          +
                        </button>
                        <button
                          onClick={() => remove(it.slug)}
                          className="ml-2 text-xs text-neutral-400 underline underline-offset-2 hover:text-red-500"
                        >
                          quitar
                        </button>
                      </div>
                    </div>
                    <div className="text-right text-sm font-semibold text-neutral-900">
                      {formatArs(it.priceArs * it.qty)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-3 border-t border-neutral-200 px-6 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Total</span>
              <span className="text-lg font-bold text-neutral-900">
                {formatArs(total)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#96ca51] px-5 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-[#8abf40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden
              >
                <path d="M20.52 3.48A11.83 11.83 0 0 0 12.06 0C5.47 0 .12 5.34.12 11.92c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64a11.9 11.9 0 0 0 5.79 1.48h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.18-3.48-8.43ZM12.07 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.97.99-3.62-.23-.37a9.87 9.87 0 0 1-1.52-5.27c0-5.47 4.45-9.92 9.93-9.92 2.65 0 5.14 1.03 7.02 2.91a9.86 9.86 0 0 1 2.9 7.02c0 5.47-4.45 9.91-9.96 9.91Zm5.45-7.42c-.3-.15-1.77-.87-2.04-.97-.28-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07a8.14 8.14 0 0 1-2.4-1.48 9 9 0 0 1-1.66-2.07c-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51-.17-.01-.37-.01-.57-.01s-.52.07-.8.37c-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.63.71.22 1.36.19 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
              </svg>
              Finalizar por WhatsApp
            </button>
            <button
              onClick={clear}
              className="w-full text-xs text-neutral-400 underline underline-offset-2 hover:text-neutral-600"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
