import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();
  const whatsapp =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491138184414";
  const instagram =
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ??
    "https://www.instagram.com/electronic_lake/";

  return (
    <footer className="relative mt-24 border-t border-ink/15 bg-ink text-paper grain">
      <div className="relative z-10 mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-6">
            <Logo className="h-14 w-14 text-moss" strokeWidth={7} />
            <h3 className="mt-8 font-display text-5xl leading-[0.95] tracking-[-0.02em] md:text-7xl">
              Un catálogo
              <br />
              <span className="font-display-italic text-moss">
                que respira.
              </span>
            </h3>
            <p className="mt-8 max-w-md text-base leading-relaxed text-paper/75">
              Curaduría chica, precios en vivo y trato cercano. Escribinos —
              te respondemos el mismo día.
            </p>
          </div>

          <div className="md:col-span-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/50">
              Contacto
            </div>
            <ul className="mt-5 space-y-2 font-display text-2xl leading-tight">
              <li>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="link-pull hover:text-moss"
                >
                  WhatsApp →
                </a>
              </li>
              <li>
                <a
                  href={instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="link-pull hover:text-moss"
                >
                  Instagram →
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/50">
              Índice
            </div>
            <ul className="mt-5 space-y-2 font-display text-2xl leading-tight">
              <li>
                <a href="/" className="link-pull hover:text-moss">
                  Catálogo
                </a>
              </li>
              <li>
                <a href="/admin" className="link-pull hover:text-moss">
                  Admin
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col justify-between gap-4 border-t border-paper/15 pt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/55 md:flex-row">
          <span>Electronic Lake · Buenos Aires · AR</span>
          <span>Importación directa · Garantía</span>
          <span>№01 / 2026</span>
        </div>
      </div>

      <div className="relative z-10 bg-[#212121]">
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-2 sm:px-6 lg:px-8">
          <p className="footer-credit text-center text-xs text-white/80">
            ©{year} | diseñado y desarrollado por{" "}
            <a
              href="https://eterlab.co/"
              target="_blank"
              rel="noreferrer"
              className="italic text-white/90 transition-colors hover:text-white"
            >
              eterlab.
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
