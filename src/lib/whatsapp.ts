import type { CartItem } from "./types";

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491138184414";

export function formatArs(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildWhatsAppUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

export function buildCheckoutMessage(items: CartItem[]): string {
  if (items.length === 0) return "";
  const lines = items.map((it) => {
    const title = [it.brand, it.model, it.variant].filter(Boolean).join(" ");
    const qty = it.qty > 1 ? ` x${it.qty}` : "";
    return `• ${title}${qty} — ${formatArs(it.priceArs * it.qty)}`;
  });
  const total = items.reduce((sum, it) => sum + it.priceArs * it.qty, 0);
  return [
    "Hola! Me contacto a través de su web.",
    "",
    "Quiero comprar:",
    ...lines,
    "",
    `Total: ${formatArs(total)}`,
  ].join("\n");
}

export function buildProductInquiryMessage(title: string): string {
  return `Hola! Me contacto a través de su web. Estoy interesado en: ${title}.`;
}
