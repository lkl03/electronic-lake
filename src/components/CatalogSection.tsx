"use client";

import { useState, useMemo } from "react";
import type { Phone } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { Logo } from "./Logo";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type SortKey = "price-asc" | "price-desc" | "name-asc" | "name-desc" | "default";

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-ink/25 text-ink/60 hover:border-ink/60 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CatalogSection({ phones }: { phones: Phone[] }) {
  // unique brands from catalog
  const brands = useMemo(() => {
    const set = new Set(phones.map((p) => p.brand));
    return Array.from(set).sort();
  }, [phones]);

  // filter state
  const [search, setSearch] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortKey>("default");

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
  };

  const clearAll = () => {
    setSearch("");
    setSelectedBrands(new Set());
    setMinPrice("");
    setMaxPrice("");
    setSort("default");
  };

  const hasFilters =
    search ||
    selectedBrands.size > 0 ||
    minPrice ||
    maxPrice ||
    sort !== "default";

  // derive filtered + sorted list
  const filtered = useMemo(() => {
    let list = [...phones];

    if (search.trim()) {
      const q = normalize(search.trim());
      list = list.filter((p) => {
        const text = normalize(
          [p.brand, p.model, p.variant, p.storage, p.color]
            .filter(Boolean)
            .join(" ")
        );
        return text.includes(q);
      });
    }

    if (selectedBrands.size > 0) {
      list = list.filter((p) => selectedBrands.has(p.brand));
    }

    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    if (min !== null && !isNaN(min)) list = list.filter((p) => p.priceArs >= min);
    if (max !== null && !isNaN(max)) list = list.filter((p) => p.priceArs <= max);

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.priceArs - b.priceArs);
        break;
      case "price-desc":
        list.sort((a, b) => b.priceArs - a.priceArs);
        break;
      case "name-asc":
        list.sort((a, b) =>
          `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`)
        );
        break;
      case "name-desc":
        list.sort((a, b) =>
          `${b.brand} ${b.model}`.localeCompare(`${a.brand} ${a.model}`)
        );
        break;
    }

    return list;
  }, [phones, search, selectedBrands, minPrice, maxPrice, sort]);

  if (phones.length === 0) {
    return (
      <div className="border-t border-ink/15">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-28 text-center">
          <Logo width={120} height={120} className="h-20 w-auto opacity-70" />
          <p className="mt-8 font-display text-4xl italic leading-tight text-ink/80 md:text-5xl">
            Catálogo próximamente.
          </p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.25em] text-ink/50">
            Estamos actualizando el stock
          </p>
          <a
            href={`https://wa.me/${
              process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491138184414"
            }`}
            target="_blank"
            rel="noreferrer"
            className="mt-8 rounded-full border border-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Consultar por WhatsApp →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-ink/15">
      {/* ── Filter bar ── */}
      <div className="mx-auto max-w-[1440px] px-5 py-6 md:px-10">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[11px] text-ink/35">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar modelo…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-ink/20 bg-transparent py-2 pl-9 pr-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink placeholder:text-ink/35 focus:border-ink/50 focus:outline-none"
            />
          </div>

          {/* Brand pills */}
          {brands.map((brand) => (
            <FilterPill
              key={brand}
              label={brand}
              active={selectedBrands.has(brand)}
              onClick={() => toggleBrand(brand)}
            />
          ))}

          {/* Price range */}
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              placeholder="Min $"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-24 rounded-full border border-ink/20 bg-transparent px-3 py-1.5 font-mono text-[10px] tracking-[0.1em] text-ink placeholder:text-ink/35 focus:border-ink/50 focus:outline-none"
            />
            <span className="font-mono text-[10px] text-ink/35">—</span>
            <input
              type="number"
              placeholder="Max $"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-24 rounded-full border border-ink/20 bg-transparent px-3 py-1.5 font-mono text-[10px] tracking-[0.1em] text-ink placeholder:text-ink/35 focus:border-ink/50 focus:outline-none"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-full border border-ink/20 bg-paper px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink focus:border-ink/50 focus:outline-none"
          >
            <option value="default">Orden original</option>
            <option value="price-asc">Precio ↑</option>
            <option value="price-desc">Precio ↓</option>
            <option value="name-asc">A → Z</option>
            <option value="name-desc">Z → A</option>
          </select>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45 transition-colors hover:text-ink"
            >
              × Limpiar
            </button>
          )}
        </div>

        {/* Result count */}
        {hasFilters && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
            {filtered.length === 0
              ? "Sin resultados"
              : `${filtered.length} modelo${filtered.length === 1 ? "" : "s"}`}
          </p>
        )}
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="mx-auto max-w-[1440px] px-5 py-20 text-center md:px-10">
          <p className="font-display text-3xl italic text-ink/40">
            Sin resultados para esa búsqueda.
          </p>
          <button
            onClick={clearAll}
            className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-moss underline underline-offset-4"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="mx-auto grid max-w-[1440px] md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <ProductCard key={p.slug} phone={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
