"use client";

import Image from "next/image";
import Link from "next/link";
import type { Phone } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { getBrandPlaceholder } from "@/lib/placeholders";

function formatPesos(n: number): string {
  return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(n);
}

export function ProductCard({
  phone,
  index,
}: {
  phone: Phone;
  index: number;
}) {
  const add = useCart((s) => s.add);
  const num = String(index + 1).padStart(2, "0");
  const title = [phone.brand, phone.model].filter(Boolean).join(" ");

  return (
    <article className="group relative flex flex-col border-b border-ink/15 md:border-r md:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0">
      <Link
        href={`/producto/${phone.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-mist/30"
        aria-label={`Ver ${title}`}
      >
        <span className="absolute left-5 top-5 z-10 font-mono text-[10px] uppercase tracking-[0.25em] text-ink/40">
          № {num}
        </span>
        {phone.condition && phone.condition !== "nuevo" && (
          <span className="absolute right-5 top-5 z-10 bg-ink px-2 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-paper">
            {phone.condition}
          </span>
        )}
        <Image
          src={phone.images[0] || getBrandPlaceholder(phone.brand)}
          alt={title}
          fill
          sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
          className="object-contain p-10 transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.15,1)] group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-ink/10 transition-all duration-500 group-hover:bg-moss" />
      </Link>
      <div className="flex flex-1 flex-col px-6 py-7 md:px-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
          {phone.brand}
        </div>
        <h3 className="mt-1 font-display text-[28px] leading-[1.05] tracking-[-0.015em]">
          {phone.model}
          {phone.variant && (
            <>
              {" "}
              <span className="font-display-italic text-ink/80">
                {phone.variant}
              </span>
            </>
          )}
        </h3>
        <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/55">
          {[phone.storage, phone.color].filter(Boolean).join(" · ") || " "}
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 pt-8">
          <div>
            <div className="font-display text-[26px] leading-none tracking-[-0.02em]">
              ${formatPesos(phone.priceArs)}
            </div>
            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">
              USD {(phone.usd + (phone.marginUsd ?? 0))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                add(phone);
              }}
              aria-label={`Agregar ${title}`}
              className="rounded-full border border-ink bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-paper transition-colors hover:bg-moss hover:text-ink"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
