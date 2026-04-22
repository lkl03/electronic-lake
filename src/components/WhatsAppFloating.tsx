import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

export function WhatsAppFloating() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hola! Me contacto a través de su web."
  )}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Abrir WhatsApp"
      className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.55)] ring-1 ring-white/10 transition-all hover:scale-105 hover:shadow-[0_14px_40px_-8px_rgba(37,211,102,0.7)] md:h-16 md:w-16"
    >
      <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[#25D366] opacity-60 animate-[pulse-ring_2.2s_ease-out_infinite]" />
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        className="h-7 w-7 md:h-8 md:w-8"
        aria-hidden
      >
        <path d="M19.11 17.23c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.72-1.34-1.6-1.5-1.87-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.02-.22-.53-.45-.46-.61-.47l-.52-.01c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.98 2.63 1.11 2.81c.14.18 1.93 2.94 4.67 4.13.65.28 1.16.45 1.56.58.65.21 1.25.18 1.72.11.52-.08 1.6-.65 1.82-1.28.22-.63.22-1.17.16-1.28-.07-.11-.25-.18-.52-.32zM16.03 4c-6.62 0-12 5.38-12 12 0 2.11.55 4.17 1.59 5.98L4 28l6.22-1.63A11.98 11.98 0 0 0 16.03 28c6.62 0 12-5.38 12-12s-5.38-12-12-12zm0 21.87c-1.88 0-3.72-.5-5.32-1.46l-.38-.22-3.69.97.99-3.59-.25-.37a9.87 9.87 0 0 1-1.52-5.3c0-5.46 4.45-9.91 9.93-9.91s9.91 4.45 9.91 9.91c0 5.47-4.45 9.97-9.67 9.97z" />
      </svg>
    </a>
  );
}
