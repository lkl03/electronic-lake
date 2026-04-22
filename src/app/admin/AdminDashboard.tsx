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
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Panel de administración
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Cargá el listado del importador y Groq extrae modelos, specs e
            imágenes automáticamente.
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-900"
          >
            Cerrar sesión
          </button>
        </form>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">
          Generar catálogo
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Pegá el mensaje del importador (precios en USD) y definí el valor del
          dólar.
        </p>

        <div className="mt-6 grid gap-6">
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-neutral-700"
            >
              Mensaje del importador
            </label>
            <textarea
              id="message"
              rows={10}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="iPhone 15 Pro Max 256GB — USD 1200
Samsung S24 Ultra 512GB — USD 950
Xiaomi Redmi Note 13 128GB — USD 220"
              className="mt-1 block w-full rounded-lg border border-neutral-200 px-3 py-2 font-mono text-sm text-neutral-900 shadow-sm focus:border-[#96ca51] focus:outline-none focus:ring-2 focus:ring-[#96ca51]/30"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr,auto]">
            <div>
              <label
                htmlFor="dollar"
                className="block text-sm font-medium text-neutral-700"
              >
                Valor del dólar (ARS)
              </label>
              <input
                id="dollar"
                type="number"
                min={1}
                step={1}
                value={dollarRate}
                onChange={(e) => setDollarRate(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-[#96ca51] focus:outline-none focus:ring-2 focus:ring-[#96ca51]/30"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Precio ARS = USD × dólar (redondeado).
              </p>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={onUpdateRate}
                disabled={pendingRate || pending}
                className="h-[42px] rounded-full border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-900 transition-colors hover:border-neutral-300 disabled:opacity-60"
              >
                {pendingRate ? "Actualizando…" : "Solo actualizar dólar"}
              </button>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={onGenerate}
              disabled={pending || pendingRate}
              className="inline-flex items-center gap-2 rounded-full bg-[#96ca51] px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-[#8abf40] disabled:opacity-60"
            >
              {pending ? "Procesando con Groq…" : "Generar catálogo"}
            </button>
          </div>

          {feedback && (
            <div
              role="status"
              className={`rounded-xl border px-4 py-3 text-sm ${
                feedback.type === "success"
                  ? "border-[#96ca51]/30 bg-[#96ca51]/10 text-[#3e6818]"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <p>{feedback.text}</p>
              {feedback.warnings && feedback.warnings.length > 0 && (
                <ul className="mt-2 list-disc pl-4 text-xs opacity-80">
                  {feedback.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Catálogo actual
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              {catalog.phones.length} modelos · actualizado{" "}
              {catalog.updatedAt &&
                new Date(catalog.updatedAt).toLocaleString("es-AR")}
            </p>
          </div>
        </div>
        {catalog.phones.length === 0 ? (
          <p className="mt-6 text-sm text-neutral-500">
            Todavía no hay modelos cargados.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-neutral-100">
            {catalog.phones.map((p) => (
              <li
                key={p.slug}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-neutral-900">
                    {p.brand} {p.model}
                    {p.variant ? ` ${p.variant}` : ""}
                    {p.storage ? ` · ${p.storage}` : ""}
                  </p>
                  <p className="text-xs text-neutral-500">
                    USD {p.usd} · {p.images.length > 0 ? "con imagen" : "sin imagen"}
                  </p>
                </div>
                <span className="font-semibold text-neutral-900">
                  {formatArs(p.priceArs)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
