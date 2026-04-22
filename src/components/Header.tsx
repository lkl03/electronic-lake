"use client";

import Link from "next/link";
import { CartButton } from "./CartButton";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/5 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-7 w-7 rounded-full bg-[#96ca51]"
          />
          <span className="text-lg font-semibold tracking-tight text-neutral-900">
            Electronic Lake
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-600 md:flex">
          <Link
            href="/"
            className="transition-colors hover:text-neutral-900"
          >
            Catálogo
          </Link>
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
        </nav>
        <CartButton />
      </div>
    </header>
  );
}
