"use client";

import { useState, useTransition } from "react";
import type { Catalog } from "@/lib/types";
import { formatArs } from "@/lib/whatsapp";
import { generateCatalog, logout, updateDollarRate } from "./actions";

export function AdminDashboard({ initial }: { initial: Catalog }) {
  const [catalog, setCatalog] = useState<Catalog>(initial);
  const [message, setMessage] = useState(initial.sourceMessage ?? "");
  const [dollarRate, setDollarRate] = useState(initial.dollarRate || 1000);
  const [feedback, setFeedback] = useState<
    | { type: "success" | "error"; text: string; warnings?: string[] }
    | null
  >(null);
  const [pending, startTransition] = useTransition();
  const [pendingRate, startRateTransition] = useTransition();

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

  const onUpdateRate = () => {
    setFeedback(null);
    startRateTransition(async () => {
      const res = await updateDollarRate(dollarRate);
      if (!res.ok) {
        setFeedback({ type: "error", text: res.error });
        return;
      }
      setCatalog(res.catalog);
      setFeedback({ type: "success", text: "Precios recalculados." });
    });
  };

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
            imágenes; el dólar define el precio final en pesos.
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

            <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
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
                  className="mt-2 block w-full border-0 border-b border-ink/25 bg-transparent px-0 py-3 font-display text-3xl tracking-[-0.02em] text-ink focus:border-moss focus:outline-none focus:ring-0"
                />
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
                  Precio ARS = USD × dólar · redondeado
                </p>
              </div>
              <button
                type="button"
                onClick={onUpdateRate}
                disabled={pendingRate || pending}
                className="h-[46px] rounded-full border border-ink px-6 font-mono text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-50"
              >
                {pendingRate ? "Actualizando…" : "Solo dólar →"}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-ink/15 pt-8">
              <button
                type="button"
                onClick={onGenerate}
                disabled={pending || pendingRate}
                className="rounded-full bg-ink px-7 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-paper transition-colors hover:bg-moss hover:text-ink disabled:opacity-50"
              >
                {pending ? "Procesando con Groq…" : "Generar catálogo →"}
              </button>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/40">
                Puede tardar ~20 s
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

      <section className="border-t border-ink/15 bg-ink text-paper grain">
        <div className="relative z-10 px-6 py-14 md:px-10 md:py-20">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-moss">
                03 · Estado
              </span>
              <h2 className="mt-3 font-display text-3xl leading-[1.05] tracking-[-0.02em]">
                Catálogo
                <br />
                <span className="font-display-italic text-moss">actual.</span>
              </h2>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/55">
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
              {catalog.phones.length === 0 ? (
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper/50">
                  Todavía no hay modelos cargados.
                </p>
              ) : (
                <ul>
                  {catalog.phones.map((p, i) => (
                    <li
                      key={p.slug}
                      className="grid grid-cols-[auto_1fr_auto] items-baseline gap-4 border-b border-paper/15 py-4"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/40">
                        № {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="font-display text-xl leading-tight tracking-[-0.015em] text-paper">
                          {p.brand}{" "}
                          <span className="font-display-italic text-moss">
                            {p.model}
                          </span>
                          {p.variant ? ` ${p.variant}` : ""}
                          {p.storage ? ` · ${p.storage}` : ""}
                        </p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/50">
                          USD {p.usd} ·{" "}
                          {p.images.length > 0 ? "con imagen" : "sin imagen"}
                        </p>
                      </div>
                      <span className="font-mono text-sm tracking-tight text-paper">
                        {formatArs(p.priceArs)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
