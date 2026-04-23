import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Admin · Electronic Lake",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-paper-soft text-ink">
      <header className="sticky top-0 z-30 border-b border-ink/15 bg-ink text-paper">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <Logo width={120} height={120} className="h-9 w-9 object-contain" />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/55">
              / panel
            </span>
          </div>
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper/70 transition-colors hover:text-moss"
          >
            ← Ver sitio
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
