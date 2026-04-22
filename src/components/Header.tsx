"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { CartButton } from "./CartButton";

export function Header() {
  return (
    <header className="relative z-30 border-b border-ink/15 bg-paper">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-5 py-4 md:px-10">
        <Link
          href="/"
          className="flex items-center"
          aria-label="Electronic Lake — inicio"
        >
          <Logo
            width={180}
            height={60}
            priority
            className="h-11 w-auto md:h-12"
          />
        </Link>

        <CartButton />
      </div>
    </header>
  );
}
