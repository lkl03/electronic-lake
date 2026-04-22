import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readCatalog } from "@/lib/catalog";
import { formatArs, buildWhatsAppUrl, buildProductInquiryMessage } from "@/lib/whatsapp";
import { AddToCartButton } from "@/components/AddToCartButton";
import type { PhoneSpecs } from "@/lib/types";

export const revalidate = 60;

export async function generateStaticParams() {
  const catalog = await readCatalog();
  return catalog.phones.map((p) => ({ slug: p.slug }));
}

const SPEC_LABELS: Record<keyof PhoneSpecs, string> = {
  display: "Pantalla",
  processor: "Procesador",
  ram: "Memoria RAM",
  storage: "Almacenamiento",
  camera: "Cámara",
  battery: "Batería",
  os: "Sistema operativo",
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

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
      >
        ← Volver al catálogo
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50">
            {phone.images[0] ? (
              <Image
                src={phone.images[0]}
                alt={title}
                fill
                sizes="(min-width:1024px) 50vw, 100vw"
                className="object-contain p-10"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#96ca51]/10 to-neutral-100 text-6xl text-neutral-300">
                📱
              </div>
            )}
          </div>
          {phone.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {phone.images.slice(0, 4).map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50"
                >
                  <Image
                    src={img}
                    alt={`${title} - vista ${idx + 1}`}
                    fill
                    sizes="25vw"
                    className="object-contain p-3"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-wider text-neutral-500">
            {phone.brand}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {phone.model}
            {phone.variant ? ` ${phone.variant}` : ""}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {phone.storage && (
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                {phone.storage}
              </span>
            )}
            {phone.color && (
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                {phone.color}
              </span>
            )}
            {phone.condition && (
              <span className="rounded-full bg-[#96ca51]/15 px-3 py-1 text-xs font-medium text-[#5a8c24]">
                {phone.condition}
              </span>
            )}
          </div>

          <p className="mt-6 text-4xl font-bold text-neutral-900">
            {formatArs(phone.priceArs)}
          </p>

          {phone.highlights.length > 0 && (
            <ul className="mt-6 space-y-2">
              {phone.highlights.map((h, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-neutral-700"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#96ca51]" />
                  {h}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <AddToCartButton phone={phone} />
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:border-neutral-300"
            >
              Consultar por WhatsApp
            </a>
          </div>

          {specEntries.length > 0 && (
            <section className="mt-10 border-t border-neutral-200 pt-8">
              <h2 className="text-lg font-semibold text-neutral-900">
                Especificaciones técnicas
              </h2>
              <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {specEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between gap-4 border-b border-neutral-100 py-2 text-sm sm:block sm:border-b-0"
                  >
                    <dt className="text-neutral-500">{SPEC_LABELS[key]}</dt>
                    <dd className="text-right font-medium text-neutral-900 sm:text-left">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
