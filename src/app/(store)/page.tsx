import { readCatalog } from "@/lib/catalog";
import { ProductGrid } from "@/components/ProductGrid";
import { InfoMarquee } from "@/components/InfoMarquee";

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
        <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-[1440px] flex-col items-center justify-center gap-10 px-5 py-20 text-center md:min-h-[80vh] md:px-10 md:py-28">
          <HeroArt />

          <a
            href="#catalogo"
            className="group inline-flex items-center gap-3 rounded-full bg-moss px-8 py-4 font-mono text-[11px] uppercase tracking-[0.28em] text-ink shadow-[0_12px_40px_-8px_rgba(150,202,81,0.5)] transition-all hover:scale-[1.03] hover:bg-paper"
          >
            Ver catálogo
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
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

function HeroArt() {
  return (
    <div
      aria-hidden
      className="relative flex h-[320px] w-[320px] items-center justify-center sm:h-[420px] sm:w-[420px] md:h-[520px] md:w-[520px]"
    >
      {/* soft green halo */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(150,202,81,0.28),transparent_62%)] breathe" />

      {/* outer rotating ring */}
      <svg
        viewBox="0 0 400 400"
        className="orbit-slow absolute inset-0 h-full w-full text-moss"
        fill="none"
        stroke="currentColor"
      >
        <circle
          cx="200"
          cy="200"
          r="190"
          strokeWidth="1"
          strokeDasharray="2 9"
          opacity="0.45"
        />
        <circle cx="200" cy="10" r="3" fill="currentColor" />
        <circle cx="200" cy="390" r="2" fill="currentColor" opacity="0.55" />
      </svg>

      {/* mid reverse ring */}
      <svg
        viewBox="0 0 400 400"
        className="orbit-reverse absolute inset-0 h-full w-full text-moss/70"
        fill="none"
        stroke="currentColor"
      >
        <circle
          cx="200"
          cy="200"
          r="150"
          strokeWidth="1"
          strokeDasharray="1 14"
          opacity="0.6"
        />
        <circle cx="350" cy="200" r="4" fill="currentColor" />
        <circle cx="60" cy="200" r="2.5" fill="currentColor" opacity="0.6" />
      </svg>

      {/* central phone silhouette */}
      <div className="drift relative z-10">
        <svg
          viewBox="0 0 160 240"
          className="h-[180px] w-auto text-moss drop-shadow-[0_12px_40px_rgba(150,202,81,0.35)] sm:h-[220px] md:h-[280px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <defs>
            <linearGradient id="screen" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#96ca51" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1a3a1f" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <rect
            x="15"
            y="10"
            width="130"
            height="220"
            rx="22"
            ry="22"
            fill="url(#screen)"
          />
          <rect
            x="15"
            y="10"
            width="130"
            height="220"
            rx="22"
            ry="22"
          />
          <line x1="55" y1="24" x2="105" y2="24" strokeWidth="2" opacity="0.6" />
          <circle cx="80" cy="215" r="4" fill="currentColor" />
          {/* inner signal waves */}
          <path
            d="M55 120 Q80 95 105 120"
            strokeWidth="2"
            opacity="0.75"
            className="breathe"
          />
          <path
            d="M45 135 Q80 85 115 135"
            strokeWidth="1.5"
            opacity="0.5"
          />
          <path
            d="M35 150 Q80 75 125 150"
            strokeWidth="1"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* orbiting dots */}
      <div className="orbit-slow absolute inset-0">
        <span className="absolute left-1/2 top-0 block h-3 w-3 -translate-x-1/2 rounded-full bg-moss shadow-[0_0_20px_rgba(150,202,81,0.9)]" />
      </div>
      <div className="orbit-reverse absolute inset-6">
        <span className="absolute right-0 top-1/2 block h-2 w-2 -translate-y-1/2 rounded-full bg-paper/80" />
      </div>
    </div>
  );
}
