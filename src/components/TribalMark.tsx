type TribalMarkProps = {
  className?: string;
  strokeWidth?: number;
  title?: string;
};

export function TribalMark({
  className,
  strokeWidth = 7,
  title,
}: TribalMarkProps) {
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
