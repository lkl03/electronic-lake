import Image from "next/image";

type LogoProps = {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  alt?: string;
};

export function Logo({
  className,
  width = 160,
  height = 160,
  priority,
  alt = "Electronic Lake",
}: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
