export function InfoMarquee() {
  const items = [
    { k: "Envíos", v: "Todo el país" },
    { k: "Garantía", v: "6 meses" },
    { k: "Pagos", v: "Transferencia · USD · Cripto" },
  ];
  const track = Array.from({ length: 6 }, () => items).flat();

  return (
    <div
      className="overflow-hidden border-y border-ink/15 bg-paper-soft"
      aria-hidden
    >
      <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap py-3">
        {track.map((it, i) => (
          <span key={i} className="flex items-center gap-3">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-moss" />
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-ink/50">
              {it.k}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/80">
              {it.v}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
