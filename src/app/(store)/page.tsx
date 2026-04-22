import { readCatalog } from "@/lib/catalog";
import { ProductGrid } from "@/components/ProductGrid";
import { InfoMarquee } from "@/components/InfoMarquee";
import { HeroParticles } from "@/components/HeroParticles";

export const revalidate = 60;

export default async function HomePage() {
  const catalog = await readCatalog();
  const phones = catalog.phones;
  const hasCatalog =
    catalog.updatedAt !== new Date(0).toISOString() && phones.length > 0;

  return (
    <>
      {/* HERO ——————————————————————————————————————— */}
      <section className="relative overflow-hidden bg-ink text-paper grain">
        {/* Soft radial halo */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(150,202,81,0.18),transparent_65%)]" />
        <HeroParticles />

        <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-[1440px] flex-col items-center justify-center gap-10 px-5 py-24 text-center md:min-h-[86vh] md:px-10 md:py-32">
          <h1 className="rise font-display text-[clamp(3.5rem,13vw,11rem)] font-light leading-[0.88] tracking-[-0.04em] text-paper">
            electronic <span className="text-moss">lake</span>
          </h1>

          <p
            className="rise max-w-2xl text-balance font-mono text-[11px] uppercase tracking-[0.28em] text-paper/70 sm:text-xs"
            style={{ animationDelay: "180ms" }}
          >
            Teléfonos importados · Nuevos y en caja sellada
            <span className="mx-3 text-moss">|</span>
            Envíos en el día
          </p>

          <a
            href="#catalogo"
            className="rise group inline-flex items-center gap-3 rounded-full bg-moss px-8 py-4 font-mono text-[11px] uppercase tracking-[0.28em] text-ink shadow-[0_12px_40px_-8px_rgba(150,202,81,0.5)] transition-all hover:scale-[1.03] hover:bg-paper"
            style={{ animationDelay: "360ms" }}
          >
            Ver catálogo
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>

        {/* soft bottom fade for continuity into catalog */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-ink" />
      </section>

      {/* INFO MARQUEE ————————————————————————————————— */}
      <InfoMarquee />

      {/* CATALOG ——————————————————————————————————————— */}
      <section id="catalogo" className="scroll-mt-6">
        <div className="mx-auto max-w-[1440px] px-5 pt-20 md:px-10 md:pt-28">
          <div className="grid items-end gap-6 border-b border-ink/20 pb-10 md:grid-cols-12">
            <div className="md:col-span-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
                01 · Catálogo
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
              02 · Contacto
            </span>
          </div>
          <div className="md:col-span-7">
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[-0.025em]">
              ¿Buscás algo
              <br />
              <span className="font-display-italic text-moss">
                que no está en la lista?
              </span>
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/70">
              Modelos no listados, computadoras u otros dispositivos
              tecnológicos — contactanos y te ayudamos a conseguirlo.
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
              Escribinos →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
