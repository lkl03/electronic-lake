import { TribalMark } from "./TribalMark";

export function Footer() {
  const year = new Date().getFullYear();
  const whatsapp =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491138184414";
  const instagram =
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ??
    "https://www.instagram.com/electronic_lake/";
  const facebook =
    process.env.NEXT_PUBLIC_FACEBOOK_URL ??
    "https://www.facebook.com/ELECTRONICLAKE18";

  return (
    <footer className="relative mt-24 border-t border-ink/15 bg-ink text-paper grain">
      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col items-start gap-12 px-5 py-16 md:flex-row md:items-center md:justify-between md:gap-16 md:px-10 md:py-24">
        {/* Contact block */}
        <div className="flex flex-col gap-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-paper/50">
            Contacto
          </span>
          <ul className="flex flex-col gap-3 font-display text-3xl leading-none tracking-[-0.015em] md:flex-row md:flex-wrap md:gap-8 md:text-4xl">
            <li>
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                  "Hola! Me contacto a través de su web."
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-baseline gap-2 link-pull hover:text-moss"
              >
                WhatsApp
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/40">
                  ↗
                </span>
              </a>
            </li>
            <li>
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-baseline gap-2 link-pull hover:text-moss"
              >
                Instagram
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/40">
                  ↗
                </span>
              </a>
            </li>
            <li>
              <a
                href={facebook}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-baseline gap-2 link-pull hover:text-moss"
              >
                Facebook
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/40">
                  ↗
                </span>
              </a>
            </li>
          </ul>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/45">
            Electronic Lake · Buenos Aires · AR
          </div>
        </div>

        {/* Overlapping rotating tribal marks */}
        <div
          className="relative h-40 w-40 shrink-0 self-center sm:h-52 sm:w-52 md:h-64 md:w-64 lg:h-72 lg:w-72"
          aria-hidden
        >
          <TribalMark
            className="orbit-slow absolute inset-0 h-full w-full text-paper"
            strokeWidth={6}
          />
          <TribalMark
            className="orbit-reverse absolute inset-0 h-full w-full text-moss"
            strokeWidth={6}
          />
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
