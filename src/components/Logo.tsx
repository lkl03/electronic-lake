type LogoProps = {
  className?: string;
  strokeWidth?: number;
  title?: string;
};

export function Logo({ className, strokeWidth = 6, title }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <circle cx="50" cy="32" r="22" />
      <circle cx="32" cy="62" r="22" />
      <circle cx="68" cy="62" r="22" />
    </svg>
  );
}

export function LogoWordmark({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <Logo className="h-8 w-8" />
      <span className="font-display text-xl leading-none tracking-[-0.01em]">
        Electronic Lake
      </span>
    </div>
  );
}
