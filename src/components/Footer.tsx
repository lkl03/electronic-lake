import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-ink/15 bg-ink text-paper grain">
      <div className="relative z-10 mx-auto flex max-w-[1440px] items-center justify-center px-5 py-16 md:px-10 md:py-20">
        <Logo width={260} height={100} className="h-20 w-auto md:h-24" />
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
