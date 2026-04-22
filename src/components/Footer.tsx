export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24">
      <div className="mx-auto w-full max-w-screen-2xl px-4 pb-12 pt-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 border-t border-neutral-200 pt-10 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-block h-8 w-8 rounded-full bg-[#96ca51]"
            />
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                Electronic Lake
              </p>
              <p className="text-xs text-neutral-500">
                Celulares con garantía y envío a todo el país.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-sm text-neutral-600">
            <a
              href={
                process.env.NEXT_PUBLIC_INSTAGRAM_URL ??
                "https://www.instagram.com/electronic_lake/"
              }
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-neutral-900"
            >
              Instagram
            </a>
            <a
              href={`https://wa.me/${
                process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491138184414"
              }`}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-neutral-900"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
      <div className="bg-[#212121]">
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
