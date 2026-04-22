import type { Phone } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { Logo } from "./Logo";

export function ProductGrid({ phones }: { phones: Phone[] }) {
  if (phones.length === 0) {
    return (
      <div className="border-t border-ink/15">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-28 text-center">
          <Logo className="h-14 w-14 text-moss/70" strokeWidth={7} />
          <p className="mt-8 font-display text-4xl italic leading-tight text-ink/80 md:text-5xl">
            Catálogo próximamente.
          </p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.25em] text-ink/50">
            Estamos actualizando el stock
          </p>
          <a
            href={`https://wa.me/${
              process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491138184414"
            }`}
            target="_blank"
            rel="noreferrer"
            className="mt-8 rounded-full border border-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Consultar por WhatsApp →
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="border-t border-ink/15">
      <div className="mx-auto grid max-w-[1440px] md:grid-cols-2 lg:grid-cols-3">
        {phones.map((p, i) => (
          <ProductCard key={p.slug} phone={p} index={i} />
        ))}
      </div>
    </div>
  );
}
