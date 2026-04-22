"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { CartButton } from "./CartButton";
import { HeaderMarquee } from "./HeaderMarquee";

export function Header() {
  return (
    <div className="sticky top-0 z-40">
      <header className="border-b border-ink/15 bg-paper/95 backdrop-blur-md supports-[backdrop-filter]:bg-paper/80">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-5 py-3 md:px-10 md:py-4">
          <Link
            href="/"
            className="flex items-center"
            aria-label="Electronic Lake — inicio"
          >
            <Logo
              width={380}
              height={130}
              priority
              className="h-24 w-auto md:h-28"
            />
          </Link>

          <CartButton />
        </div>
      </header>
      <HeaderMarquee />
    </div>
  );
}
