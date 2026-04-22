// Deterministic pseudo-random so SSR/CSR match
function seeded(i: number) {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

type Particle = {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
  green: boolean;
  opacity: number;
};

const COUNT = 160;

function buildParticles(): Particle[] {
  return Array.from({ length: COUNT }, (_, i) => {
    const r = (n: number) => seeded(i * 7 + n);
    return {
      left: r(1) * 100,
      top: r(2) * 100,
      size: 1 + r(3) * 6,
      duration: 5 + r(4) * 14,
      delay: -r(5) * 20,
      driftX: (r(6) - 0.5) * 420,
      driftY: (r(7) - 0.5) * 380,
      green: r(8) > 0.4,
      opacity: 0.25 + r(9) * 0.75,
    };
  });
}

export function HeroParticles() {
  const particles = buildParticles();
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute block rounded-full particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.green ? "#96ca51" : "#edeae0",
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            boxShadow: p.green
              ? `0 0 ${p.size * 3}px rgba(150,202,81,0.55)`
              : `0 0 ${p.size * 2}px rgba(237,234,224,0.35)`,
            // @ts-expect-error custom CSS vars
            "--dx": `${p.driftX}px`,
            "--dy": `${p.driftY}px`,
          }}
        />
      ))}
    </div>
  );
}
