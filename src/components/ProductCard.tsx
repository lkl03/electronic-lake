"use client";

import Image from "next/image";
import Link from "next/link";
import type { Phone } from "@/lib/types";
import { formatArs } from "@/lib/whatsapp";
import { useCart } from "@/lib/cart";

export function ProductCard({ phone }: { phone: Phone }) {
  const add = useCart((s) => s.add);
  const image = phone.images[0];
  const title = [phone.brand, phone.model, phone.variant]
    .filter(Boolean)
    .join(" ");
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg">
      <Link
        href={`/producto/${phone.slug}`}
        className="relative aspect-square overflow-hidden bg-neutral-50"
        aria-label={`Ver ${title}`}
      >
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#96ca51]/10 to-neutral-100 text-4xl text-neutral-300">
            📱
          </div>
        )}
        {phone.condition && phone.condition !== "nuevo" && (
          <span className="absolute left-3 top-3 rounded-full bg-neutral-900/90 px-2.5 py-1 text-xs font-medium text-white">
            {phone.condition}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            {phone.brand}
          </p>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold text-neutral-900">
            {phone.model}
            {phone.variant ? ` ${phone.variant}` : ""}
          </h3>
          {phone.storage && (
            <p className="mt-1 text-sm text-neutral-600">{phone.storage}</p>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-neutral-900">
            {formatArs(phone.priceArs)}
          </p>
          <button
            onClick={() => add(phone)}
            aria-label={`Agregar ${title} al carrito`}
            className="rounded-full bg-[#96ca51] px-4 py-2 text-xs font-semibold text-neutral-900 transition-colors hover:bg-[#8abf40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          >
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
