"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { CartButton } from "./CartButton";

export function Header() {
  return (
    <header className="relative z-30 border-b border-ink/15 bg-paper">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-5 py-5 md:px-10">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="Electronic Lake — inicio"
        >
          <Logo
            className="h-9 w-9 text-ink transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.15,1)] group-hover:rotate-[120deg] group-hover:text-moss"
            strokeWidth={7}
          />
          <div className="leading-none">
            <div className="font-display text-xl tracking-[-0.015em]">
              Electronic Lake
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-ink/50">
              Celulares · Buenos Aires
            </div>
          </div>
        </Link>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-9 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/70">
            <li>
              <Link href="/#catalogo" className="link-pull hover:text-ink">
                Catálogo
              </Link>
            </li>
            <li>
              <a
                href={
                  process.env.NEXT_PUBLIC_INSTAGRAM_URL ??
                  "https://www.instagram.com/electronic_lake/"
                }
                target="_blank"
                rel="noreferrer"
                className="link-pull hover:text-ink"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${
                  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491138184414"
                }`}
                target="_blank"
                rel="noreferrer"
                className="link-pull hover:text-ink"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </nav>

        <CartButton />
      </div>
    </header>
  );
}
