"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import type { Catalog, Phone } from "@/lib/types";
import { formatArs } from "@/lib/whatsapp";
import { getBrandPlaceholder } from "@/lib/placeholders";
import {
  deletePhone,
  deletePhones,
  fetchDollarBlue,
  generateCatalog,
  logout,
  updatePhone,
  updatePricing,
} from "./actions";

type Feedback = { type: "success" | "error"; text: string; warnings?: string[]; at?: string };

// ─────────────────────────────────────────────────────────────────────────────
// Root dashboard
// ─────────────────────────────────────────────────────────────────────────────
export function AdminDashboard({ initial }: { initial: Catalog }) {
  const [catalog, setCatalog] = useState<Catalog>(initial);
  const [activeTab, setActiveTab] = useState<"generate" | "catalog">("generate");

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 border-b border-ink/15 pb-8">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
            Panel de administración
          </span>
          <h1 className="mt-2 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] tracking-[-0.025em]">
            Electronic <span className="font-display-italic text-moss">Lake.</span>
          </h1>
        </div>
        <form action={logout}>
          <button type="submit" className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 transition-colors hover:text-ink">
            Cerrar sesión →
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-full border border-ink/15 bg-paper-soft p-1 w-fit">
        {(["generate", "catalog"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors ${
              activeTab === tab
                ? "bg-ink text-paper"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            {tab === "generate"
              ? "Generar catálogo"
              : `Catálogo${catalog.phones.length > 0 ? ` · ${catalog.phones.length}` : ""}`}
          </button>
        ))}
      </div>

      {activeTab === "generate" ? (
        <GenerateSection catalog={catalog} setCatalog={setCatalog} setActiveTab={setActiveTab} />
      ) : (
        <CatalogSection catalog={catalog} setCatalog={setCatalog} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate section (importer message → Groq → margins → publish)
// ─────────────────────────────────────────────────────────────────────────────
function GenerateSection({
  catalog,
  setCatalog,
  setActiveTab,
}: {
  catalog: Catalog;
  setCatalog: (c: Catalog) => void;
  setActiveTab: (t: "generate" | "catalog") => void;
}) {
  const [message, setMessage] = useState(catalog.sourceMessage ?? "");
  const [dollarRate, setDollarRate] = useState(catalog.dollarRate || 1000);
  const [dollarLabel, setDollarLabel] = useState<string | null>(null);
  const [margins, setMargins] = useState<Record<string, number>>(() =>
    Object.fromEntries(catalog.phones.map((p) => [p.slug, p.marginUsd ?? 0]))
  );
  const [generateFeedback, setGenerateFeedback] = useState<Feedback | null>(null);
  const [pricingFeedback, setPricingFeedback] = useState<Feedback | null>(null);
  const [pendingGenerate, startGenerate] = useTransition();
  const [pendingPricing, startPricing] = useTransition();
  const [pendingDollar, startDollar] = useTransition();
  const [localCatalog, setLocalCatalog] = useState<Catalog>(catalog);

  useEffect(() => {
    setMargins(Object.fromEntries(localCatalog.phones.map((p) => [p.slug, p.marginUsd ?? 0])));
  }, [localCatalog]);

  // Auto-fetch dollar on mount
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    startDollar(async () => {
      const res = await fetchDollarBlue();
      if (res.ok) {
        setDollarRate(res.rate);
        setDollarLabel(`Blue venta + $20 = $${res.rate.toLocaleString("es-AR")}`);
      }
    });
  }, []);

  const onRefreshDollar = () => {
    startDollar(async () => {
      const res = await fetchDollarBlue();
      if (res.ok) {
        setDollarRate(res.rate);
        setDollarLabel(`Actualizado · Blue venta + $20 = $${res.rate.toLocaleString("es-AR")}`);
      }
    });
  };

  const onGenerate = () => {
    setGenerateFeedback(null);
    startGenerate(async () => {
      const res = await generateCatalog(message, dollarRate);
      if (!res.ok) { setGenerateFeedback({ type: "error", text: res.error }); return; }
      setLocalCatalog(res.catalog);
      setCatalog(res.catalog);
      setGenerateFeedback({
        type: "success",
        text: `${res.catalog.phones.length} modelos detectados. Ajustá ganancias y publicá.`,
        warnings: res.warnings,
        at: new Date().toLocaleTimeString("es-AR", { timeStyle: "short" }),
      });
    });
  };

  const onApplyPricing = () => {
    setPricingFeedback(null);
    startPricing(async () => {
      const res = await updatePricing(dollarRate, margins);
      if (!res.ok) { setPricingFeedback({ type: "error", text: res.error }); return; }
      setLocalCatalog(res.catalog);
      setCatalog(res.catalog);
      setPricingFeedback({
        type: "success",
        text: "✓ Precios publicados en el sitio.",
        at: new Date().toLocaleTimeString("es-AR", { timeStyle: "short" }),
      });
    });
  };

  const setMargin = (slug: string, val: number) =>
    setMargins((p) => ({ ...p, [slug]: Math.max(0, val || 0) }));

  const anyPending = pendingGenerate || pendingPricing;

  return (
    <div className="space-y-14">
      {/* Importer message + dollar */}
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-moss">01 · Importar</span>
          <h2 className="mt-3 font-display text-3xl leading-[1.05] tracking-[-0.02em]">
            Generar<br /><span className="font-display-italic text-moss">catálogo.</span>
          </h2>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55 leading-relaxed">
            Groq detecta modelos, specs e imágenes. Las ganancias previas se preservan por modelo.
          </p>
        </div>

        <div className="space-y-7 md:col-span-9">
          <div>
            <label htmlFor="msg" className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60">
              Mensaje del importador
            </label>
            <textarea
              id="msg" rows={10} value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`REDMI NOTE 15 8+256GB — U$275\niPhone 16 Pro 128GB → U$1100\nSAMSUNG S26 12+256GB — U$880`}
              className="mt-3 block w-full border border-ink/20 bg-paper-soft px-4 py-3 font-mono text-sm leading-relaxed text-ink placeholder:text-ink/30 focus:border-moss focus:outline-none"
            />
          </div>

          {/* Dollar — read-only */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60">
              Valor del dólar · ARS
            </label>
            <div className="mt-2 flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <div className={`border-b ${pendingDollar ? "border-moss/50" : "border-ink/25"} py-3`}>
                  <span className="font-display text-3xl tracking-[-0.02em] text-ink">
                    {pendingDollar ? "…" : `$${dollarRate.toLocaleString("es-AR")}`}
                  </span>
                </div>
                <span className="absolute right-0 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-[0.22em] text-ink/35">
                  solo lectura
                </span>
              </div>
              <button
                type="button" onClick={onRefreshDollar} disabled={pendingDollar || anyPending}
                className="shrink-0 rounded-full border border-moss px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-moss transition-colors hover:bg-moss hover:text-ink disabled:opacity-50"
              >
                {pendingDollar ? "…" : "Actualizar ↺"}
              </button>
            </div>
            {dollarLabel && (
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-moss/80">{dollarLabel}</p>
            )}
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
              ARS = (USD importador + ganancia) × dólar · redondeado
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-ink/15 pt-7">
            <button
              type="button" onClick={onGenerate} disabled={anyPending || pendingDollar}
              className="rounded-full bg-ink px-7 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-paper transition-colors hover:bg-moss hover:text-ink disabled:opacity-50"
            >
              {pendingGenerate ? <Spinner label="Procesando con Groq…" /> : "Generar catálogo →"}
            </button>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/35">~20 s</span>
          </div>

          <FeedbackBanner feedback={generateFeedback} />
        </div>
      </div>

      {/* Margin editor */}
      {localCatalog.phones.length > 0 && (
        <section className="border-t border-ink/15 bg-ink text-paper grain">
          <div className="relative z-10 px-6 py-12 md:px-10 md:py-16">
            <div className="grid gap-10 md:grid-cols-12">
              <div className="md:col-span-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-moss">02 · Precios</span>
                <h2 className="mt-3 font-display text-3xl leading-[1.05] tracking-[-0.02em]">
                  Ganancia<br /><span className="font-display-italic text-moss">por modelo.</span>
                </h2>
                <button
                  type="button" onClick={onApplyPricing} disabled={anyPending}
                  className="mt-6 w-full rounded-full bg-moss px-6 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-paper disabled:opacity-50"
                >
                  {pendingPricing ? <Spinner label="Guardando…" dark /> : "Publicar precios →"}
                </button>
                <p className="mt-3 font-mono text-[10px] text-paper/40 leading-loose">
                  {String(localCatalog.phones.length).padStart(2, "0")} modelos
                  {localCatalog.updatedAt && (
                    <><br />Act. {new Date(localCatalog.updatedAt).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}</>
                  )}
                </p>
                {pricingFeedback && (
                  <div className={`mt-5 border-l-2 px-4 py-3 font-mono text-[10px] ${pricingFeedback.type === "success" ? "border-moss text-moss" : "border-red-400 text-red-400"}`}>
                    <p>{pricingFeedback.text}</p>
                    {pricingFeedback.at && <p className="mt-1 opacity-60">{pricingFeedback.at}</p>}
                  </div>
                )}
                {pricingFeedback?.type === "success" && (
                  <button
                    onClick={() => setActiveTab("catalog")}
                    className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-moss underline underline-offset-4"
                  >
                    Ver catálogo →
                  </button>
                )}
              </div>

              <div className="md:col-span-9">
                <div className="hidden grid-cols-[auto_1fr_auto_auto_auto] gap-x-6 border-b border-paper/15 pb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/40 md:grid">
                  <span>№</span><span>Modelo</span>
                  <span className="text-right">USD imp.</span>
                  <span className="text-right">Ganancia</span>
                  <span className="text-right">Final ARS / USD</span>
                </div>
                <ul>
                  {localCatalog.phones.map((p, i) => {
                    const margin = margins[p.slug] ?? 0;
                    const liveArs = Math.round((p.usd + margin) * dollarRate);
                    return (
                      <li key={p.slug} className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1.5 border-b border-paper/10 py-3 md:grid-cols-[auto_1fr_auto_auto_auto] md:gap-x-6">
                        <span className="font-mono text-[9px] text-paper/35">№{String(i + 1).padStart(2, "0")}</span>
                        <div>
                          <p className="font-display text-base leading-tight text-paper md:text-lg">
                            {p.brand} <span className="font-display-italic text-moss">{p.model}</span>
                            {p.variant ? ` ${p.variant}` : ""}
                            {p.storage ? <span className="text-paper/55"> · {p.storage}</span> : null}
                          </p>
                          <p className="font-mono text-[9px] text-paper/40 md:hidden">
                            {p.usd} + {margin} = {p.usd + margin} USD · {formatArs(liveArs)}
                          </p>
                        </div>
                        <span className="hidden text-right font-mono text-sm text-paper/65 md:block">{p.usd}</span>
                        <div className="col-span-2 flex items-center justify-end gap-1 md:col-span-1">
                          <span className="font-mono text-[10px] text-paper/40">+</span>
                          <input
                            type="number" min={0} step={1} inputMode="numeric" value={margin}
                            onChange={(e) => setMargin(p.slug, Number(e.target.value))}
                            className="w-20 border-0 border-b border-paper/20 bg-transparent px-0 py-1 text-right font-mono text-sm text-paper focus:border-moss focus:outline-none focus:ring-0"
                          />
                        </div>
                        <div className="hidden text-right md:block">
                          <span className="font-mono text-sm text-paper">{formatArs(liveArs)}</span>
                          <br /><span className="font-mono text-[10px] text-paper/40">USD {p.usd + margin}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Catalog CRUD section
// ─────────────────────────────────────────────────────────────────────────────
function CatalogSection({ catalog, setCatalog }: { catalog: Catalog; setCatalog: (c: Catalog) => void }) {
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [bulkPending, startBulk] = useTransition();
  const [bulkError, setBulkError] = useState<string | null>(null);

  const filtered = catalog.phones.filter((p) => {
    const q = search.toLowerCase();
    return !q || `${p.brand} ${p.model} ${p.variant ?? ""} ${p.storage ?? ""}`.toLowerCase().includes(q);
  });

  const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.slug));

  const toggleSelect = (slug: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((p) => next.delete(p.slug));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((p) => next.add(p.slug));
        return next;
      });
    }
  };

  const handleDeleteSelected = () => {
    if (selected.size === 0) return;
    setBulkError(null);
    startBulk(async () => {
      const res = await deletePhones(Array.from(selected));
      if (!res.ok) { setBulkError(res.error); return; }
      setCatalog(res.catalog);
      setSelected(new Set());
      setEditingSlug(null);
    });
  };

  const handleDeleteAll = () => {
    setBulkError(null);
    startBulk(async () => {
      const res = await deletePhones(catalog.phones.map((p) => p.slug));
      if (!res.ok) { setBulkError(res.error); return; }
      setCatalog(res.catalog);
      setSelected(new Set());
      setEditingSlug(null);
      setConfirmDeleteAll(false);
    });
  };

  if (catalog.phones.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="font-display text-3xl text-ink/40">Catálogo vacío.</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/35">
          Generá el catálogo en la otra pestaña.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-moss">03 · Catálogo</span>
          <h2 className="mt-1 font-display text-3xl leading-tight tracking-[-0.02em]">
            {catalog.phones.length} modelo{catalog.phones.length !== 1 ? "s" : ""}
            {" "}<span className="font-display-italic text-moss">cargados.</span>
          </h2>
          {catalog.updatedAt && (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
              Últ. actualización: {new Date(catalog.updatedAt).toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          )}
        </div>
        <input
          type="search" placeholder="Buscar modelo…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs border border-ink/20 bg-paper-soft px-4 py-2.5 font-mono text-sm text-ink placeholder:text-ink/35 focus:border-moss focus:outline-none md:w-auto"
        />
      </div>

      {/* Bulk action toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-y border-ink/12 py-3">
        {/* Select-all checkbox */}
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={allFilteredSelected}
            onChange={toggleSelectAll}
            className="h-3.5 w-3.5 accent-moss"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
            {allFilteredSelected ? "Deseleccionar todo" : "Seleccionar todo"}
          </span>
        </label>

        {selected.size > 0 && (
          <>
            <span className="font-mono text-[10px] text-ink/40">|</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
              {selected.size} seleccionado{selected.size !== 1 ? "s" : ""}
            </span>
            <button
              onClick={handleDeleteSelected} disabled={bulkPending}
              className="rounded-full border border-red-300 bg-red-50 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              {bulkPending ? "…" : `Eliminar seleccionados (${selected.size})`}
            </button>
          </>
        )}

        <span className="ml-auto font-mono text-[10px] text-ink/30">|</span>

        {/* Delete all */}
        {!confirmDeleteAll ? (
          <button
            onClick={() => setConfirmDeleteAll(true)}
            disabled={bulkPending}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40 transition-colors hover:text-red-600 disabled:opacity-40"
          >
            Eliminar todo el catálogo
          </button>
        ) : (
          <span className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-700">
              ¿Seguro?
            </span>
            <button
              onClick={handleDeleteAll} disabled={bulkPending}
              className="rounded-full bg-red-600 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {bulkPending ? "…" : "Sí, borrar todo"}
            </button>
            <button
              onClick={() => setConfirmDeleteAll(false)}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/50 hover:text-ink"
            >
              Cancelar
            </button>
          </span>
        )}
      </div>

      {bulkError && (
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-red-700">{bulkError}</p>
      )}

      {/* Rows */}
      <ul className="divide-y divide-ink/10">
        {filtered.map((p, i) => (
          <CatalogRow
            key={p.slug} phone={p} index={i}
            dollarRate={catalog.dollarRate}
            isEditing={editingSlug === p.slug}
            isSelected={selected.has(p.slug)}
            onToggleSelect={() => toggleSelect(p.slug)}
            onEdit={() => setEditingSlug(editingSlug === p.slug ? null : p.slug)}
            onSaved={(next) => { setCatalog(next); setEditingSlug(null); }}
            onDeleted={(next) => { setCatalog(next); setEditingSlug(null); setSelected((s) => { const n = new Set(s); n.delete(p.slug); return n; }); }}
          />
        ))}
      </ul>

      {filtered.length === 0 && search && (
        <p className="py-10 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink/40">
          Sin resultados para &ldquo;{search}&rdquo;
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single catalog row + inline editor
// ─────────────────────────────────────────────────────────────────────────────
function CatalogRow({
  phone, index, dollarRate, isEditing, isSelected, onToggleSelect, onEdit, onSaved, onDeleted,
}: {
  phone: Phone; index: number; dollarRate: number;
  isEditing: boolean; isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onSaved: (c: Catalog) => void;
  onDeleted: (c: Catalog) => void;
}) {
  const [pendingSave, startSave] = useTransition();
  const [pendingDel, startDel] = useTransition();
  const [feedback, setFeedback] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);

  // Edit state
  const [brand, setBrand] = useState(phone.brand);
  const [model, setModel] = useState(phone.model);
  const [variant, setVariant] = useState(phone.variant ?? "");
  const [storage, setStorage] = useState(phone.storage ?? "");
  const [color, setColor] = useState(phone.color ?? "");
  const [condition, setCondition] = useState<Phone["condition"]>(phone.condition ?? "nuevo");
  const [usd, setUsd] = useState(phone.usd);
  const [marginUsd, setMarginUsd] = useState(phone.marginUsd ?? 0);
  const [imagesRaw, setImagesRaw] = useState(phone.images.join("\n"));
  const [highlights, setHighlights] = useState(phone.highlights.join("\n"));

  const onSave = () => {
    setFeedback("");
    startSave(async () => {
      const res = await updatePhone(phone.slug, {
        brand, model,
        variant: variant || undefined,
        storage: storage || undefined,
        color: color || undefined,
        condition,
        usd: Number(usd),
        marginUsd: Number(marginUsd),
        images: imagesRaw.split("\n").map((u) => u.trim()).filter(Boolean),
        highlights: highlights.split("\n").map((h) => h.trim()).filter(Boolean),
      });
      if (!res.ok) { setFeedback(res.error); return; }
      onSaved(res.catalog);
    });
  };

  const onDelete = () => {
    setFeedback("");
    startDel(async () => {
      const res = await deletePhone(phone.slug);
      if (!res.ok) { setFeedback(res.error); setConfirmDel(false); return; }
      onDeleted(res.catalog);
    });
  };

  const liveArs = Math.round((Number(usd) + Number(marginUsd)) * dollarRate);
  const imgSrc = phone.images[0] || getBrandPlaceholder(phone.brand);

  return (
    <li className="group">
      {/* Summary row */}
      <div className="flex items-center gap-3 py-4 pr-2">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="h-3.5 w-3.5 shrink-0 accent-moss"
        />
        <span className="w-6 shrink-0 font-mono text-[10px] text-ink/35">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-mist/30">
          <Image src={imgSrc} alt={phone.model} fill className="object-contain p-1" sizes="56px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg leading-tight tracking-[-0.01em]">
            {phone.brand} <span className="font-display-italic text-moss">{phone.model}</span>
            {phone.variant ? ` ${phone.variant}` : ""}
            {phone.storage ? <span className="text-ink/55"> · {phone.storage}</span> : null}
          </p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">
            {formatArs(phone.priceArs)} · USD {phone.usd + (phone.marginUsd ?? 0)}
            {phone.images.length === 0 && (
              <span className="ml-3 text-amber-600">sin imagen</span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onEdit}
            className={`rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
              isEditing ? "border-moss bg-moss text-ink" : "border-ink/25 text-ink/60 hover:border-ink hover:text-ink"
            }`}
          >
            {isEditing ? "Cancelar" : "Editar"}
          </button>

          {/* Inline delete confirmation */}
          {!confirmDel ? (
            <button
              onClick={() => setConfirmDel(true)}
              className="rounded-full border border-red-200 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-red-500 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-700"
            >
              Eliminar
            </button>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-red-700">¿Seguro?</span>
              <button
                onClick={onDelete} disabled={pendingDel}
                className="rounded-full bg-red-600 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-white hover:bg-red-700 disabled:opacity-50"
              >
                {pendingDel ? "…" : "Sí"}
              </button>
              <button
                onClick={() => setConfirmDel(false)}
                className="rounded-full border border-ink/20 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-ink/60 hover:text-ink"
              >
                No
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Inline editor */}
      {isEditing && (
        <div className="mb-4 border border-ink/15 bg-paper-soft p-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Marca" value={brand} onChange={setBrand} />
            <Field label="Modelo" value={model} onChange={setModel} />
            <Field label="Variante" value={variant} onChange={setVariant} placeholder="e.g. 5G, Plus, Ultra" />
            <Field label="Storage" value={storage} onChange={setStorage} placeholder="e.g. 8+256GB" />
            <Field label="Color" value={color} onChange={setColor} placeholder="opcional" />
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60">Condición</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Phone["condition"])}
                className="mt-2 block w-full border border-ink/20 bg-paper px-3 py-2.5 font-mono text-sm text-ink focus:border-moss focus:outline-none"
              >
                <option value="nuevo">Nuevo</option>
                <option value="usado">Usado</option>
                <option value="seminuevo">Seminuevo</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60">USD importador</label>
              <input
                type="number" min={0} step={1} value={usd}
                onChange={(e) => setUsd(Number(e.target.value))}
                className="mt-2 block w-full border border-ink/20 bg-paper px-3 py-2.5 font-mono text-sm text-ink focus:border-moss focus:outline-none"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60">Ganancia USD</label>
              <input
                type="number" min={0} step={1} value={marginUsd}
                onChange={(e) => setMarginUsd(Number(e.target.value))}
                className="mt-2 block w-full border border-ink/20 bg-paper px-3 py-2.5 font-mono text-sm text-ink focus:border-moss focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <div className="w-full rounded border border-moss/30 bg-moss/10 px-4 py-2.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">Precio calculado</p>
                <p className="mt-1 font-display text-xl text-moss">{formatArs(liveArs)}</p>
                <p className="font-mono text-[10px] text-ink/45">USD {Number(usd) + Number(marginUsd)}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60">
              URLs de imágenes <span className="normal-case text-ink/35">(una por línea)</span>
            </label>
            <textarea
              rows={4} value={imagesRaw}
              onChange={(e) => setImagesRaw(e.target.value)}
              placeholder="https://ejemplo.com/foto.jpg"
              className="mt-2 block w-full border border-ink/20 bg-paper px-3 py-2.5 font-mono text-xs leading-relaxed text-ink placeholder:text-ink/30 focus:border-moss focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {imagesRaw.split("\n").filter((u) => u.trim()).slice(0, 4).map((url, i) => (
                <div key={i} className="relative h-16 w-16 bg-mist/30">
                  <Image src={url.trim()} alt="" fill className="object-contain p-1" sizes="64px" onError={() => {}} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60">
              Highlights <span className="normal-case text-ink/35">(uno por línea)</span>
            </label>
            <textarea
              rows={3} value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder="Chip A17 Pro&#10;Cámara 48MP&#10;Pantalla 120Hz"
              className="mt-2 block w-full border border-ink/20 bg-paper px-3 py-2.5 font-mono text-sm leading-relaxed text-ink placeholder:text-ink/30 focus:border-moss focus:outline-none"
            />
          </div>

          {feedback && (
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-red-700">{feedback}</p>
          )}

          <div className="flex items-center gap-3 border-t border-ink/10 pt-5">
            <button
              onClick={onSave} disabled={pendingSave}
              className="rounded-full bg-ink px-6 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-paper transition-colors hover:bg-moss hover:text-ink disabled:opacity-50"
            >
              {pendingSave ? <Spinner label="Guardando…" /> : "Guardar cambios →"}
            </button>
            <button onClick={onEdit} className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/50 hover:text-ink">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60">{label}</label>
      <input
        type="text" value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 block w-full border border-ink/20 bg-paper px-3 py-2.5 font-mono text-sm text-ink placeholder:text-ink/30 focus:border-moss focus:outline-none"
      />
    </div>
  );
}

function Spinner({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <span className={`inline-block h-2.5 w-2.5 animate-spin rounded-full border-2 ${dark ? "border-ink/30 border-t-ink" : "border-paper/30 border-t-paper"}`} />
      {label}
    </span>
  );
}

function FeedbackBanner({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) return null;
  return (
    <div role="status" className={`border-l-2 px-5 py-4 font-mono text-[11px] uppercase tracking-[0.18em] ${feedback.type === "success" ? "border-moss bg-moss/10 text-pine" : "border-red-700 bg-red-50 text-red-800"}`}>
      <div className="flex items-start justify-between gap-4">
        <p>{feedback.text}</p>
        {feedback.at && <span className="shrink-0 text-[10px] opacity-60">{feedback.at}</span>}
      </div>
      {feedback.warnings && feedback.warnings.length > 0 && (
        <ul className="mt-3 space-y-1 normal-case tracking-normal">
          {feedback.warnings.map((w, i) => <li key={i} className="opacity-80">· {w}</li>)}
        </ul>
      )}
    </div>
  );
}
