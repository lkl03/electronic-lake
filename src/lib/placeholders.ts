const MAP: Record<string, string> = {
  iphone: "/placeholders/iphone.svg",
  apple: "/placeholders/iphone.svg",
  samsung: "/placeholders/samsung.svg",
  xiaomi: "/placeholders/xiaomi.svg",
  redmi: "/placeholders/xiaomi.svg",
  poco: "/placeholders/xiaomi.svg",
  mi: "/placeholders/xiaomi.svg",
  motorola: "/placeholders/motorola.svg",
  moto: "/placeholders/motorola.svg",
};

export function getBrandPlaceholder(brand: string): string {
  const key = brand.toLowerCase().trim();
  return MAP[key] ?? "/placeholders/default.svg";
}
