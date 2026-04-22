export function HeaderMarquee() {
  const phrases = [
    "Los modelos más recientes de Xiaomi, Samsung, iPhone y más",
    "Importación directa · Caja sellada",
    "Garantía 6 meses · Envíos a todo el país",
  ];
  const track = Array.from({ length: 6 }, () => phrases).flat();

  return (
    <div
      className="overflow-hidden border-b border-paper/15 bg-ink text-paper"
      aria-hidden
    >
      <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap py-2.5">
        {track.map((p, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="inline-block h-1 w-1 rounded-full bg-moss" />
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-paper/85">
              {p}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
