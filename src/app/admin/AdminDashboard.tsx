"use client";

import { useEffect, useState, useTransition } from "react";
import type { Catalog } from "@/lib/types";
import { formatArs } from "@/lib/whatsapp";
import { generateCatalog, logout, updatePricing } from "./actions";

export function AdminDashboard({ initial }: { initial: Catalog }) {
  const [catalog, setCatalog] = useState<Catalog>(initial);
  const [message, setMessage] = useState(initial.sourceMessage ?? "");
  const [dollarRate, setDollarRate] = useState(initial.dollarRate || 1000);
  const [margins, setMargins] = useState<Record<string, number>>(() =>
    Object.fromEntries(initial.phones.map((p) => [p.slug, p.marginUsd ?? 0]))
  );
  const [feedback, setFeedback] = useState<
    | { type: "success" | "error"; text: string; warnings?: string[] }
    | null
  >(null);
  const [pending, startTransition] = useTransition();
  const [pendingPricing, startPricingTransition] = useTransition();

  // Re-sync margins whenever the catalog refreshes (e.g. after generating)
  useEffect(() => {
    setMargins(
      Object.fromEntries(
        catalog.phones.map((p) => [p.slug, p.marginUsd ?? 0])
      )
    );
  }, [catalog]);

  const onGenerate = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await generateCatalog(message, dollarRate);
      if (!res.ok) {
        setFeedback({ type: "error", text: res.error });
        return;
      }
      setCatalog(res.catalog);
      setFeedback({
        type: "success",
        text: `Catálogo actualizado (${res.catalog.phones.length} modelos).`,
        warnings: res.warnings,
      });
    });
  };

  const onApplyPricing = () => {
    setFeedback(null);
    startPricingTransition(async () => {
      const res = await updatePricing(dollarRate, margins);
      if (!res.ok) {
        setFeedback({ type: "error", text: res.error });
        return;
      }
      setCatalog(res.catalog);
      setFeedback({
        type: "success",
        text: "Precios y ganancias aplicadas.",
      });
    });
  };

  const setMargin = (slug: string, value: number) =>
    setMargins((prev) => ({ ...prev, [slug]: Math.max(0, value || 0) }));

  const anyPending = pending || pendingPricing;

  return (
    <div className="space-y-14">
      <div className="flex items-start justify-between gap-6 border-b border-ink/15 pb-10">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/50">
            01 · Panel
          </span>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,4rem)] leading-[0.95] tracking-[-0.025em]">
            Administración
            <br />
            <span className="font-display-italic text-moss">del catálogo.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/70">
            Pegá el listado del importador. Groq extrae modelos, specs e
            imágenes. Después definís el dólar y la ganancia por modelo en USD.
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 transition-colors hover:text-ink"
          >
            Cerrar sesión →
          </button>
        </form>
      </div>

      <section>
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-moss">
              02 · Entrada
            </span>
            <h2 className="mt-3 font-display text-3xl leading-[1.05] tracking-[-0.02em]">
              Generar
              <br />
              <span className="font-display-italic text-moss">catálogo.</span>
            </h2>
          </div>

          <div className="space-y-8 md:col-span-9">
            <div>
              <label
                htmlFor="message"
                className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60"
              >
                Mensaje del importador
              </label>
              <textarea
                id="message"
                rows={10}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`iPhone 15 Pro Max 256GB — USD 1200\nSamsung S24 Ultra 512GB — USD 950\nXiaomi Redmi Note 13 128GB — USD 220`}
                className="mt-3 block w-full border border-ink/20 bg-paper-soft px-4 py-3 font-mono text-sm leading-relaxed text-ink placeholder:text-ink/30 focus:border-moss focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="dollar"
                className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink/60"
              >
                Valor del dólar · ARS
              </label>
              <input
                id="dollar"
                type="number"
                min={1}
                step={1}
                value={dollarRate}
                onChange={(e) => setDollarRate(Number(e.target.value))}
                className="mt-2 block w-full max-w-sm border-0 border-b border-ink/25 bg-transparent px-0 py-3 font-display text-3xl tracking-[-0.02em] text-ink focus:border-moss focus:outline-none focus:ring-0"
              />
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
                ARS = (USD importador + ganancia USD) × dólar · redondeado
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-ink/15 pt-8">
              <button
                type="button"
                onClick={onGenerate}
                disabled={anyPending}
                className="rounded-full bg-ink px-7 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-paper transition-colors hover:bg-moss hover:text-ink disabled:opacity-50"
              >
                {pending ? "Procesando con Groq…" : "Generar catálogo →"}
              </button>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
                Puede tardar ~20 s · Las ganancias por modelo se preservan
              </span>
            </div>

            {feedback && (
              <div
                role="status"
                className={`border-l-2 px-5 py-4 font-mono text-[11px] uppercase tracking-[0.18em] ${
                  feedback.type === "success"
                    ? "border-moss bg-moss/10 text-pine"
                    : "border-red-700 bg-red-50 text-red-800"
                }`}
              >
                <p>{feedback.text}</p>
                {feedback.warnings && feedback.warnings.length > 0 && (
                  <ul className="mt-3 space-y-1 normal-case tracking-normal">
                    {feedback.warnings.map((w, i) => (
                      <li key={i} className="opacity-80">
                        · {w}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Margin editor + live preview */}
      {catalog.phones.length > 0 && (
        <section className="border-t border-ink/15 bg-ink text-paper grain">
          <div className="relative z-10 px-6 py-14 md:px-10 md:py-20">
            <div className="grid gap-10 md:grid-cols-12">
              <div className="md:col-span-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-moss">
                  03 · Precios
                </span>
                <h2 className="mt-3 font-display text-3xl leading-[1.05] tracking-[-0.02em]">
                  Ganancia
                  <br />
                  <span className="font-display-italic text-moss">
                    por modelo.
                  </span>
                </h2>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/55">
                  Ajustá la ganancia en USD de cada modelo. El precio final se
                  calcula en vivo; guardá para publicarlo en el sitio.
                </p>
                <button
                  type="button"
                  onClick={onApplyPricing}
                  disabled={anyPending}
                  className="mt-8 w-full rounded-full bg-moss px-6 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-paper disabled:opacity-50"
                >
                  {pendingPricing
                    ? "Guardando…"
                    : "Aplicar precios →"}
                </button>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/40">
                  {String(catalog.phones.length).padStart(2, "0")} modelo
                  {catalog.phones.length === 1 ? "" : "s"}
                  {catalog.updatedAt && (
                    <>
                      <br />
                      Act.{" "}
                      {new Date(catalog.updatedAt).toLocaleString("es-AR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </>
                  )}
                </p>
              </div>

              <div className="md:col-span-9">
                <div className="hidden grid-cols-[auto_1fr_auto_auto_auto] gap-x-6 gap-y-1 border-b border-paper/15 pb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-paper/45 md:grid">
                  <span>№</span>
                  <span>Modelo</span>
                  <span className="text-right">USD imp.</span>
                  <span className="text-right">Ganancia USD</span>
                  <span className="text-right">Final ARS</span>
                </div>

                <ul>
                  {catalog.phones.map((p, i) => {
                    const margin = margins[p.slug] ?? p.marginUsd ?? 0;
                    const totalUsd = p.usd + margin;
                    const livePrice = Math.round(totalUsd * dollarRate);
                    return (
                      <li
                        key={p.slug}
                        className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 border-b border-paper/15 py-4 md:grid-cols-[auto_1fr_auto_auto_auto] md:gap-x-6"
                      >
                        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/40">
                          № {String(i + 1).padStart(2, "0")}
                        </span>

                        <div className="col-start-2 row-start-1">
                          <p className="font-display text-lg leading-tight tracking-[-0.015em] text-paper md:text-xl">
                            {p.brand}{" "}
                            <span className="font-display-italic text-moss">
                              {p.model}
                            </span>
                            {p.variant ? ` ${p.variant}` : ""}
                            {p.storage ? ` · ${p.storage}` : ""}
                          </p>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/50 md:hidden">
                            USD {p.usd} · +{margin} · Final{" "}
                            {formatArs(livePrice)}
                          </p>
                        </div>

                        <span className="hidden text-right font-mono text-sm text-paper/80 md:block">
                          {p.usd}
                        </span>

                        <div className="col-span-3 flex items-center justify-between gap-3 md:col-span-1 md:block md:text-right">
                          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper/45 md:hidden">
                            Ganancia USD
                          </span>
                          <div className="flex items-baseline justify-end gap-1">
                            <span className="font-mono text-[11px] text-paper/50">
                              +
                            </span>
                            <input
                              type="number"
                              min={0}
                              step={1}
                              inputMode="numeric"
                              value={margin}
                              onChange={(e) =>
                                setMargin(p.slug, Number(e.target.value))
                              }
                              className="w-24 border-0 border-b border-paper/25 bg-transparent px-0 py-1 text-right font-mono text-sm text-paper placeholder:text-paper/30 focus:border-moss focus:outline-none focus:ring-0"
                            />
                          </div>
                        </div>

                        <span className="hidden text-right font-mono text-sm tracking-tight text-paper md:block">
                          {formatArs(livePrice)}
                        </span>
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
