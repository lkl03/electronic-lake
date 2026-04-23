"use client";

import { useEffect, useState, useTransition } from "react";
import type { Catalog } from "@/lib/types";
import { formatArs } from "@/lib/whatsapp";
import {
  fetchDollarBlue,
  generateCatalog,
  logout,
  updatePricing,
} from "./actions";

type Feedback = {
  type: "success" | "error";
  text: string;
  warnings?: string[];
  at?: string;
};

export function AdminDashboard({ initial }: { initial: Catalog }) {
  const [catalog, setCatalog] = useState<Catalog>(initial);
  const [message, setMessage] = useState(initial.sourceMessage ?? "");
  const [dollarRate, setDollarRate] = useState(initial.dollarRate || 1000);
  const [margins, setMargins] = useState<Record<string, number>>(() =>
    Object.fromEntries(initial.phones.map((p) => [p.slug, p.marginUsd ?? 0]))
  );

  const [generateFeedback, setGenerateFeedback] = useState<Feedback | null>(null);
  const [pricingFeedback, setPricingFeedback] = useState<Feedback | null>(null);
  const [dollarFeedback, setDollarFeedback] = useState<string | null>(null);

  const [pending, startTransition] = useTransition();
  const [pendingPricing, startPricingTransition] = useTransition();
  const [pendingDollar, startDollarTransition] = useTransition();

  useEffect(() => {
    setMargins(
      Object.fromEntries(
        catalog.phones.map((p) => [p.slug, p.marginUsd ?? 0])
      )
    );
  }, [catalog]);

  const onFetchDollar = () => {
    setDollarFeedback(null);
    startDollarTransition(async () => {
      const res = await fetchDollarBlue();
      if (!res.ok) {
        setDollarFeedback(`Error: ${res.error}`);
        return;
      }
      setDollarRate(res.rate);
      setDollarFeedback(`Blue venta + $20 = $${res.rate.toLocaleString("es-AR")}`);
    });
  };

  const onGenerate = () => {
    setGenerateFeedback(null);
    startTransition(async () => {
      const res = await generateCatalog(message, dollarRate);
      if (!res.ok) {
        setGenerateFeedback({ type: "error", text: res.error });
        return;
      }
      setCatalog(res.catalog);
      setGenerateFeedback({
        type: "success",
        text: `${res.catalog.phones.length} modelos detectados. Revisá las ganancias y publicá.`,
        warnings: res.warnings,
        at: new Date().toLocaleTimeString("es-AR", { timeStyle: "short" }),
      });
    });
  };

  const onApplyPricing = () => {
    setPricingFeedback(null);
    startPricingTransition(async () => {
      const res = await updatePricing(dollarRate, margins);
      if (!res.ok) {
        setPricingFeedback({ type: "error", text: res.error });
        return;
      }
      setCatalog(res.catalog);
      setPricingFeedback({
        type: "success",
        text: `✓ Precios publicados en el sitio.`,
        at: new Date().toLocaleTimeString("es-AR", { timeStyle: "short" }),
      });
    });
  };

  const setMargin = (slug: string, value: number) =>
    setMargins((prev) => ({ ...prev, [slug]: Math.max(0, value || 0) }));

  const anyPending = pending || pendingPricing;

  return (
    <div className="space-y-14">
      {/* Header */}
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
            Pegá el listado del importador, obtené el dólar blue, ajustá ganancias
            por modelo y publicá.
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

      {/* Step 1 – Generate */}
      <section>
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-moss">
              02 · Importar
            </span>
            <h2 className="mt-3 font-display text-3xl leading-[1.05] tracking-[-0.02em]">
              Generar
              <br />
              <span className="font-display-italic text-moss">catálogo.</span>
            </h2>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55 leading-relaxed">
              Groq detecta modelos, specs e imágenes. Las ganancias previas se
              preservan por modelo.
            </p>
          </div>

          <div className="space-y-8 md:col-span-9">
            {/* Importer message */}
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
                placeholder={`REDMI NOTE 15 8+256GB — U$275\niPhone 16 Pro 128GB → U$1100\nSAMSUNG S26 12+256GB — U$880`}
                className="mt-3 block w-full border border-ink/20 bg-paper-soft px-4 py-3 font-mono text-sm leading-relaxed text-ink placeholder:text-ink/30 focus:border-moss focus:outline-none"
              />
            </div>

            {/* Dollar rate */}
            <div>
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1">
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
                    className="mt-2 block w-full border-0 border-b border-ink/25 bg-transparent px-0 py-3 font-display text-3xl tracking-[-0.02em] text-ink focus:border-moss focus:outline-none focus:ring-0"
                  />
                </div>
                <button
                  type="button"
                  onClick={onFetchDollar}
                  disabled={pendingDollar}
                  className="shrink-0 rounded-full border border-moss px-5 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-moss transition-colors hover:bg-moss hover:text-ink disabled:opacity-50"
                >
                  {pendingDollar ? "Consultando…" : "Blue + $20 →"}
                </button>
              </div>
              {dollarFeedback && (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-moss">
                  {dollarFeedback}
                </p>
              )}
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
                ARS = (USD importador + ganancia) × dólar · redondeado
              </p>
            </div>

            {/* Generate button */}
            <div className="flex flex-wrap items-center gap-4 border-t border-ink/15 pt-8">
              <button
                type="button"
                onClick={onGenerate}
                disabled={anyPending || pendingDollar}
                className="rounded-full bg-ink px-7 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-paper transition-colors hover:bg-moss hover:text-ink disabled:opacity-50"
              >
                {pending ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border-2 border-paper/40 border-t-paper" />
                    Procesando con Groq…
                  </span>
                ) : (
                  "Generar catálogo →"
                )}
              </button>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
                ~20 s · el dólar y las ganancias se aplican en el paso siguiente
              </span>
            </div>

            <FeedbackBanner feedback={generateFeedback} />
          </div>
        </div>
      </section>

      {/* Step 2 – Margins + publish */}
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
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/55 leading-relaxed">
                  Ingresá la ganancia en USD. El precio final en ARS se
                  calcula en vivo con el dólar actual.
                </p>

                <button
                  type="button"
                  onClick={onApplyPricing}
                  disabled={anyPending}
                  className="mt-8 w-full rounded-full bg-moss px-6 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-paper disabled:opacity-50"
                >
                  {pendingPricing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
                      Guardando…
                    </span>
                  ) : (
                    "Publicar precios →"
                  )}
                </button>

                <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/45 leading-loose">
                  {String(catalog.phones.length).padStart(2, "0")} modelo
                  {catalog.phones.length === 1 ? "" : "s"}
                  {catalog.updatedAt && (
                    <>
                      <br />
                      Últ. actualización:
                      <br />
                      {new Date(catalog.updatedAt).toLocaleString("es-AR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </>
                  )}
                </div>

                {pricingFeedback && (
                  <div
                    className={`mt-6 border-l-2 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] ${
                      pricingFeedback.type === "success"
                        ? "border-moss text-moss"
                        : "border-red-400 text-red-400"
                    }`}
                  >
                    <p>{pricingFeedback.text}</p>
                    {pricingFeedback.at && (
                      <p className="mt-1 opacity-60">{pricingFeedback.at}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="md:col-span-9">
                <div className="hidden grid-cols-[auto_1fr_auto_auto_auto] gap-x-6 border-b border-paper/15 pb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-paper/45 md:grid">
                  <span>№</span>
                  <span>Modelo</span>
                  <span className="text-right">USD imp.</span>
                  <span className="text-right">Ganancia USD</span>
                  <span className="text-right">Final ARS</span>
                </div>

                <ul>
                  {catalog.phones.map((p, i) => {
                    const margin = margins[p.slug] ?? p.marginUsd ?? 0;
                    const liveArs = Math.round((p.usd + margin) * dollarRate);
                    const liveUsd = p.usd + margin;
                    return (
                      <li
                        key={p.slug}
                        className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 border-b border-paper/15 py-4 md:grid-cols-[auto_1fr_auto_auto_auto] md:gap-x-6"
                      >
                        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/40">
                          № {String(i + 1).padStart(2, "0")}
                        </span>

                        <div>
                          <p className="font-display text-lg leading-tight tracking-[-0.015em] text-paper md:text-xl">
                            {p.brand}{" "}
                            <span className="font-display-italic text-moss">
                              {p.model}
                            </span>
                            {p.variant ? ` ${p.variant}` : ""}
                            {p.storage ? (
                              <span className="text-paper/60"> · {p.storage}</span>
                            ) : null}
                          </p>
                          {/* Mobile summary */}
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/50 md:hidden">
                            USD {p.usd} · +{margin} = {liveUsd} ·{" "}
                            {formatArs(liveArs)}
                          </p>
                        </div>

                        <span className="hidden text-right font-mono text-sm text-paper/75 md:block">
                          {p.usd}
                        </span>

                        {/* Margin input */}
                        <div className="col-span-2 flex items-center justify-between gap-2 md:col-span-1 md:justify-end">
                          <span className="font-mono text-[10px] text-paper/45 md:hidden">
                            Ganancia
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="font-mono text-[11px] text-paper/50">+</span>
                            <input
                              type="number"
                              min={0}
                              step={1}
                              inputMode="numeric"
                              value={margin}
                              onChange={(e) =>
                                setMargin(p.slug, Number(e.target.value))
                              }
                              className="w-24 border-0 border-b border-paper/25 bg-transparent px-0 py-1 text-right font-mono text-sm text-paper focus:border-moss focus:outline-none focus:ring-0"
                            />
                          </div>
                        </div>

                        {/* Live ARS */}
                        <div className="hidden text-right md:block">
                          <span className="font-mono text-sm text-paper">
                            {formatArs(liveArs)}
                          </span>
                          <br />
                          <span className="font-mono text-[10px] text-paper/45">
                            USD {liveUsd}
                          </span>
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

function FeedbackBanner({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) return null;
  return (
    <div
      role="status"
      className={`border-l-2 px-5 py-4 font-mono text-[11px] uppercase tracking-[0.18em] ${
        feedback.type === "success"
          ? "border-moss bg-moss/10 text-pine"
          : "border-red-700 bg-red-50 text-red-800"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <p>{feedback.text}</p>
        {feedback.at && (
          <span className="shrink-0 text-[10px] opacity-60">{feedback.at}</span>
        )}
      </div>
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
  );
}
