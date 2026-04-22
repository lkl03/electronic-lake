import type { Phone } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ phones }: { phones: Phone[] }) {
  if (phones.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
        <p className="text-sm text-neutral-600">
          Todavía no hay productos cargados. El administrador puede cargar el
          catálogo desde{" "}
          <a
            href="/admin"
            className="font-semibold text-[#6a9e2f] underline underline-offset-2"
          >
            /admin
          </a>
          .
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {phones.map((p) => (
        <ProductCard key={p.slug} phone={p} />
      ))}
    </div>
  );
}
