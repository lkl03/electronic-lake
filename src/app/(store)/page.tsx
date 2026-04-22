import { readCatalog } from "@/lib/catalog";
import { ProductGrid } from "@/components/ProductGrid";
import { Marquee } from "@/components/Marquee";
import { Logo } from "@/components/Logo";

export const revalidate = 60;

export default async function HomePage() {
  const catalog = await readCatalog();
  const phones = catalog.phones;
  const hasCatalog =
    catalog.updatedAt !== new Date(0).toISOString() && phones.length > 0;
  const issueDate = new Date().toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
  });

  return (
    <>
      {/* HERO ——————————————————————————————————————— */}
      <section className="relative overflow-hidden bg-ink text-paper grain">
        {/* oversized watermark logo */}
        <div className="pointer-events-none absolute -right-32 top-1/2 hidden -translate-y-1/2 md:block">
          <Logo
            className="h-[720px] w-[720px] text-moss/[0.07]"
            strokeWidth={3}
          />
        </div>

        {/* masthead strip */}
        <div className="relative z-10 border-b border-paper/15">
          <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-4 px-5 py-3 font-mono text-[9px] uppercase tracking-[0.25em] text-paper/60 md:grid-cols-4 md:px-10">
            <span>№ 01 · 2026</span>
            <span className="text-right md:text-left">
              Buenos Aires · Argentina
            </span>
            <span className="text-right md:text-left">
              Importación directa
            </span>
            <span className="text-right">Coordinación · WhatsApp</span>
          </div>
        </div>

        {/* hero body */}
        <div className="relative z-10 mx-auto grid max-w-[1440px] gap-8 px-5 py-20 md:grid-cols-12 md:gap-6 md:px-10 md:py-32">
          <aside className="md:col-span-2">
            <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-moss">
                01 ·
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/60">
                Edición
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/40 md:mt-auto">
                {issueDate}
              </span>
            </div>
          </aside>

          <div className="md:col-span-10">
            <h1 className="rise font-display text-[clamp(3.75rem,13vw,14rem)] font-light leading-[0.82] tracking-[-0.04em] text-paper">
              Teléfonos,
              <br />
              <span className="font-display-italic text-moss">elegidos</span>
              <span className="text-paper">.</span>
            </h1>

            <div className="mt-10 grid gap-10 border-t border-paper/15 pt-10 md:grid-cols-[1.2fr_auto] md:items-end">
              <p
                className="rise max-w-xl text-lg leading-[1.5] text-paper/80 md:text-xl"
                style={{ animationDelay: "180ms" }}
              >
                Un catálogo chico y curado de celulares importados.
                Precios al día en pesos, garantía real y envíos a todo
                el país.
              </p>
              <div
                className="rise flex flex-wrap gap-3"
                style={{ animationDelay: "360ms" }}
              >
                <a
                  href="#catalogo"
                  className="rounded-full bg-moss px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-paper"
                >
                  Ver catálogo →
                </a>
                <a
                  href={`https://wa.me/${
                    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491138184414"
                  }?text=${encodeURIComponent(
                    "Hola! Me contacto a través de su web."
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-paper/30 px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-paper transition-colors hover:border-moss hover:text-moss"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee ticker */}
        {hasCatalog && <Marquee phones={phones} />}
      </section>

      {/* INTRO / EDITORIAL ——————————————————————————— */}
      <section className="border-b border-ink/15">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-5 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
              02 · Nota del editor
            </span>
          </div>
          <div className="md:col-span-7">
            <p className="font-display text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.15] tracking-[-0.015em] text-ink">
              Antes que tienda, somos{" "}
              <span className="font-display-italic text-moss">lectores</span>{" "}
              del mercado. Cada modelo pasa por tres filtros:{" "}
              <em className="font-display-italic">precio justo</em>,
              procedencia verificada y una garantía que realmente
              responde.
            </p>
          </div>
          <div className="md:col-span-3">
            <dl className="space-y-5 border-l border-ink/15 pl-6">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
                  Envíos
                </dt>
                <dd className="mt-1 font-display text-xl">
                  Todo el país
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
                  Garantía
                </dt>
                <dd className="mt-1 font-display text-xl">6 meses</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
                  Pagos
                </dt>
                <dd className="mt-1 font-display text-xl">
                  Transferencia · USD · cripto
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CATALOG HEADER ——————————————————————————————— */}
      <section id="catalogo" className="scroll-mt-6">
        <div className="mx-auto max-w-[1440px] px-5 pt-20 md:px-10 md:pt-28">
          <div className="grid items-end gap-6 border-b border-ink/20 pb-10 md:grid-cols-12">
            <div className="md:col-span-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
                03 · Catálogo
              </span>
            </div>
            <div className="md:col-span-7">
              <h2 className="font-display text-[clamp(3rem,8vw,6rem)] leading-[0.9] tracking-[-0.03em]">
                En <span className="font-display-italic text-moss">stock</span>
                <span>.</span>
              </h2>
            </div>
            <div className="md:col-span-3 md:text-right">
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/60">
                {phones.length.toString().padStart(2, "0")}{" "}
                modelo{phones.length === 1 ? "" : "s"}
              </div>
              {hasCatalog && (
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
                  Dólar ref. ${catalog.dollarRate.toLocaleString("es-AR")}
                </div>
              )}
            </div>
          </div>
        </div>

        <ProductGrid phones={phones} />
      </section>

      {/* CONTACT ——————————————————————————————————————— */}
      <section className="border-t border-ink/15 bg-paper-soft">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-24 md:grid-cols-12 md:px-10 md:py-32">
          <div className="md:col-span-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
              04 · Contacto
            </span>
          </div>
          <div className="md:col-span-7">
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[-0.025em]">
              ¿Buscás algo
              <br />
              <span className="font-display-italic text-moss">
                en particular?
              </span>
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/70">
              Escribinos por WhatsApp. Te respondemos el mismo día con
              disponibilidad, precio y tiempos.
            </p>
          </div>
          <div className="md:col-span-3 md:text-right">
            <a
              href={`https://wa.me/${
                process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491138184414"
              }?text=${encodeURIComponent(
                "Hola! Me contacto a través de su web."
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-paper transition-colors hover:bg-moss hover:text-ink"
            >
              Abrir WhatsApp →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
