import { readCatalog } from "@/lib/catalog";
import { ProductGrid } from "@/components/ProductGrid";

export const revalidate = 60;

export default async function HomePage() {
  const catalog = await readCatalog();
  const phones = catalog.phones;

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#96ca51]/15 via-white to-white px-6 py-16 sm:px-10 sm:py-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#5a8c24] shadow-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#96ca51]" />
            Stock actualizado
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            Los mejores celulares,
            <br />
            al mejor precio.
          </h1>
          <p className="mt-5 max-w-xl text-base text-neutral-600 sm:text-lg">
            Importación directa con garantía. Elegí tu equipo y coordinamos por
            WhatsApp en minutos.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#catalogo"
              className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              Ver catálogo
            </a>
            <a
              href={`https://wa.me/${
                process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491138184414"
              }?text=${encodeURIComponent(
                "Hola! Me contacto a través de su web."
              )}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:border-neutral-300"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section id="catalogo" className="mt-16 scroll-mt-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Catálogo
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {phones.length} {phones.length === 1 ? "modelo" : "modelos"} disponibles
            </p>
          </div>
        </div>
        <ProductGrid phones={phones} />
      </section>
    </div>
  );
}
