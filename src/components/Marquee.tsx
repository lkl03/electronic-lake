import { Logo } from "./Logo";
import type { Phone } from "@/lib/types";

export function Marquee({ phones }: { phones: Phone[] }) {
  if (phones.length === 0) return null;
  const track = [...phones, ...phones, ...phones];
  return (
    <div
      className="overflow-hidden border-y border-paper/15 bg-ink/60"
      aria-hidden
    >
      <div className="marquee-track flex w-max items-center gap-12 whitespace-nowrap py-5">
        {track.map((p, i) => (
          <span key={i} className="flex items-center gap-12">
            <span className="font-display text-4xl leading-none text-paper/90 md:text-5xl">
              {p.brand}{" "}
              <span className="font-display-italic text-moss">{p.model}</span>
            </span>
            <Logo className="h-5 w-5 shrink-0 text-paper/40" strokeWidth={7} />
          </span>
        ))}
      </div>
    </div>
  );
}
