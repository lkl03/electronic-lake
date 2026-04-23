import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readCatalog } from "@/lib/catalog";
import {
  buildProductInquiryMessage,
  buildWhatsAppUrl,
  formatArs,
} from "@/lib/whatsapp";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Logo } from "@/components/Logo";
import type { PhoneSpecs } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  const catalog = await readCatalog();
  return catalog.phones.map((p) => ({ slug: p.slug }));
}

const SPEC_LABELS: Record<keyof PhoneSpecs, string> = {
  display: "Pantalla",
  processor: "Procesador",
  ram: "Memoria",
  storage: "Almacenamiento",
  camera: "Cámara",
  battery: "Batería",
  os: "Sistema",
  connectivity: "Conectividad",
  extras: "Extras",
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = await readCatalog();
  const phone = catalog.phones.find((p) => p.slug === slug);
  if (!phone) notFound();

  const title = [phone.brand, phone.model, phone.variant]
    .filter(Boolean)
    .join(" ");
  const whatsappHref = buildWhatsAppUrl(buildProductInquiryMessage(title));

  const specEntries = (Object.keys(SPEC_LABELS) as (keyof PhoneSpecs)[])
    .map((key) => [key, phone.specs[key]] as const)
    .filter(([, v]) => !!v);

  const index = catalog.phones.findIndex((p) => p.slug === slug);
  const num = String(index + 1).padStart(2, "0");
  const total = catalog.phones.length;

  return (
    <article>
      <div className="border-b border-ink/15">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 font-mono text-[10px] uppercase tracking-[0.25em] text-ink/55 md:px-10">
          <Link href="/" className="flex items-center gap-2 hover:text-ink">
            ← Volver al catálogo
          </Link>
          <span>
            № {num} / {String(total).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-10 md:py-24">
        <div className="md:col-span-7">
          <div className="relative aspect-[4/5] overflow-hidden bg-mist/40">
            <span className="absolute left-6 top-6 z-10 font-mono text-[10px] uppercase tracking-[0.25em] text-ink/40">
              {phone.brand}
            </span>
            {phone.images[0] ? (
              <Image
                src={phone.images[0]}
                alt={title}
                fill
                sizes="(min-width:1024px) 60vw, 100vw"
                className="object-contain p-16"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Logo width={200} height={200} className="h-32 w-auto opacity-50" />
              </div>
            )}
          </div>
          {phone.images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {phone.images.slice(0, 4).map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square overflow-hidden bg-mist/40"
                >
                  <Image
                    src={img}
                    alt={`${title} — vista ${idx + 1}`}
                    fill
                    sizes="20vw"
                    className="object-contain p-4"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-5 md:pt-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
            {phone.brand}
          </div>
          <h1 className="mt-2 font-display text-[clamp(2.25rem,5vw,4rem)] leading-[0.95] tracking-[-0.025em]">
            {phone.model}
            {phone.variant && (
              <>
                <br />
                <span className="font-display-italic text-moss">
                  {phone.variant}
                </span>
              </>
            )}
          </h1>

          <div className="mt-6 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.22em]">
            {phone.storage && (
              <span className="rounded-full border border-ink/20 px-3 py-1 text-ink/70">
                {phone.storage}
              </span>
            )}
            {phone.color && (
              <span className="rounded-full border border-ink/20 px-3 py-1 text-ink/70">
                {phone.color}
              </span>
            )}
            {phone.condition && (
              <span className="rounded-full bg-moss/90 px-3 py-1 text-ink">
                {phone.condition}
              </span>
            )}
          </div>

          <div className="mt-10 border-y border-ink/15 py-6">
            <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
                  Precio ARS
                </div>
                <div className="mt-1 font-display text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-[-0.02em]">
                  {formatArs(phone.priceArs)}
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
                  Precio USD
                </div>
                <div className="mt-1 font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-none tracking-[-0.02em] text-moss">
                  USD {phone.usd + (phone.marginUsd ?? 0)}
                </div>
              </div>
            </div>
            <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/45">
              Dólar ref. ${catalog.dollarRate.toLocaleString("es-AR")}
            </div>
          </div>

          {phone.highlights.length > 0 && (
            <ul className="mt-8 space-y-3">
              {phone.highlights.map((h, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-base leading-relaxed text-ink/85"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-moss" />
                  {h}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <AddToCartButton phone={phone} />
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-ink px-6 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Consultar por WhatsApp →
            </a>
          </div>
        </div>
      </div>

      {specEntries.length > 0 && (
        <section className="border-t border-ink/15 bg-ink text-paper grain">
          <div className="relative z-10 mx-auto grid max-w-[1440px] gap-10 px-5 py-20 md:grid-cols-12 md:gap-6 md:px-10 md:py-28">
            <div className="md:col-span-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-moss">
                05 · Especificaciones
              </span>
              <h3 className="mt-4 font-display text-4xl leading-[1.05] tracking-[-0.02em] md:text-5xl">
                Ficha
                <br />
                <span className="font-display-italic text-moss">
                  técnica.
                </span>
              </h3>
            </div>
            <dl className="md:col-span-9 md:pt-2">
              {specEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="leader border-b border-paper/15 py-4 font-mono text-sm text-paper/90"
                >
                  <dt className="uppercase tracking-[0.18em] text-paper/60">
                    {SPEC_LABELS[key]}
                  </dt>
                  <span className="leader-rule" aria-hidden />
                  <dd className="text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}
    </article>
  );
}
