"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { readCatalogFresh, writeCatalog } from "@/lib/catalog";
import {
  buildPhone,
  enrichSpecs,
  extractPhonesFromMessage,
} from "@/lib/groq";
import { resolvePhoneImage } from "@/lib/images";
import type { Catalog, Phone } from "@/lib/types";

export type ActionResult =
  | { ok: true; catalog: Catalog; warnings?: string[] }
  | { ok: false; error: string };

export type DollarResult =
  | { ok: true; rate: number }
  | { ok: false; error: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireAuth() {
  const store = await cookies();
  if (store.get("admin_auth")?.value !== "1") throw new Error("No autorizado");
}

function invalidateCache() {
  revalidateTag("catalog", "max");
  revalidatePath("/");
  revalidatePath("/producto/[slug]", "page");
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(password: string): Promise<{ ok: boolean }> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password !== expected) return { ok: false };
  const store = await cookies();
  store.set("admin_auth", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return { ok: true };
}

export async function logout() {
  const store = await cookies();
  store.delete("admin_auth");
}

// ─── Dollar ───────────────────────────────────────────────────────────────────

export async function fetchDollarBlue(): Promise<DollarResult> {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/blue", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { venta?: number };
    const venta = data.venta;
    if (!venta || typeof venta !== "number") throw new Error("Respuesta inesperada");
    return { ok: true, rate: Math.round(venta + 20) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo obtener el dólar blue.",
    };
  }
}

// ─── Diagnostics ─────────────────────────────────────────────────────────────

export type GoogleTestResult =
  | { ok: true; imageUrl: string; query: string }
  | { ok: false; error: string; status?: number; detail?: string };

export async function testGoogleImages(): Promise<GoogleTestResult> {
  const key = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;

  if (!key) return { ok: false, error: "GOOGLE_SEARCH_API_KEY no está configurado en Vercel." };
  if (!cx)  return { ok: false, error: "GOOGLE_SEARCH_CX no está configurado en Vercel." };

  const query = "Samsung Galaxy S25 smartphone";
  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", key);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", query);
  url.searchParams.set("searchType", "image");
  url.searchParams.set("num", "3");

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const body = await res.json() as {
      items?: Array<{ link?: string }>;
      error?: { message?: string; errors?: Array<{ message?: string }> };
    };

    if (!res.ok) {
      const msg = body.error?.message ?? body.error?.errors?.[0]?.message ?? `HTTP ${res.status}`;
      return { ok: false, error: msg, status: res.status, detail: JSON.stringify(body.error, null, 2) };
    }

    const link = body.items?.[0]?.link ?? "";
    if (!link) return { ok: false, error: "La API respondió OK pero devolvió 0 resultados de imagen. Asegurate de que la búsqueda de imágenes esté habilitada en tu Programmable Search Engine." };

    return { ok: true, imageUrl: link, query };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error de red al contactar Google." };
  }
}

// ─── Generate ─────────────────────────────────────────────────────────────────

export async function generateCatalog(
  sourceMessage: string,
  dollarRate: number
): Promise<ActionResult> {
  try {
    await requireAuth();
    if (!sourceMessage.trim()) return { ok: false, error: "El mensaje del importador está vacío." };
    if (!dollarRate || dollarRate <= 0) return { ok: false, error: "El valor del dólar debe ser mayor a 0." };

    const extracted = await extractPhonesFromMessage(sourceMessage);
    if (extracted.length === 0) {
      return { ok: false, error: "No se pudo extraer ningún celular del mensaje. Revisá el formato." };
    }

    // Read previous catalog to carry margins forward
    const previous = await readCatalogFresh();
    const prevMargins = new Map(previous.phones.map((p) => [p.slug, p.marginUsd ?? 0]));

    const warnings: string[] = [];
    const phones: Phone[] = await Promise.all(
      extracted.map(async (e) => {
        const [specsRes, imgRes] = await Promise.all([
          enrichSpecs(e),
          resolvePhoneImage(e.brand, [e.model, e.variant].filter(Boolean).join(" ")),
        ]);
        if (!imgRes) warnings.push(`Sin imagen: ${e.brand} ${e.model}`);
        const draft = buildPhone(e, dollarRate, {
          specs: specsRes.specs,
          highlights: specsRes.highlights,
          images: imgRes ? [imgRes] : [],
        });
        const margin = prevMargins.get(draft.slug) ?? 0;
        return { ...draft, marginUsd: margin, priceArs: Math.round((draft.usd + margin) * dollarRate) };
      })
    );

    const catalog: Catalog = {
      updatedAt: new Date().toISOString(),
      dollarRate,
      sourceMessage,
      phones,
    };
    await writeCatalog(catalog);
    invalidateCache();
    return { ok: true, catalog, warnings };
  } catch (err) {
    console.error("[generateCatalog]", err);
    return { ok: false, error: err instanceof Error ? err.message : "Error inesperado" };
  }
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

/**
 * Apply margins + dollar rate to an existing catalog snapshot.
 * The client passes `currentCatalog` directly — no blob read needed,
 * which eliminates all stale-cache failures.
 */
export async function updatePricing(
  dollarRate: number,
  marginsBySlug: Record<string, number>,
  currentCatalog: Catalog
): Promise<ActionResult> {
  try {
    await requireAuth();
    if (!dollarRate || dollarRate <= 0) return { ok: false, error: "Valor de dólar inválido." };
    if (!currentCatalog.phones.length) return { ok: false, error: "No hay modelos en el catálogo." };

    const phones = currentCatalog.phones.map((p) => {
      const raw = marginsBySlug[p.slug];
      const marginUsd = Math.max(0, Number.isFinite(raw) ? Number(raw) : p.marginUsd ?? 0);
      return { ...p, marginUsd, priceArs: Math.round((p.usd + marginUsd) * dollarRate) };
    });

    const next: Catalog = {
      ...currentCatalog,
      dollarRate,
      updatedAt: new Date().toISOString(),
      phones,
    };
    await writeCatalog(next);
    invalidateCache();
    return { ok: true, catalog: next };
  } catch (err) {
    console.error("[updatePricing]", err);
    return { ok: false, error: err instanceof Error ? err.message : "Error inesperado" };
  }
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function deletePhones(slugs: string[]): Promise<ActionResult> {
  try {
    await requireAuth();
    if (!slugs.length) return { ok: false, error: "No hay modelos seleccionados." };
    const current = await readCatalogFresh();
    const set = new Set(slugs);
    const next: Catalog = {
      ...current,
      phones: current.phones.filter((p) => !set.has(p.slug)),
      updatedAt: new Date().toISOString(),
    };
    await writeCatalog(next);
    invalidateCache();
    return { ok: true, catalog: next };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error inesperado" };
  }
}

export async function deletePhone(slug: string): Promise<ActionResult> {
  try {
    await requireAuth();
    const current = await readCatalogFresh();
    const next: Catalog = {
      ...current,
      phones: current.phones.filter((p) => p.slug !== slug),
      updatedAt: new Date().toISOString(),
    };
    await writeCatalog(next);
    invalidateCache();
    return { ok: true, catalog: next };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error inesperado" };
  }
}

export async function updatePhone(
  slug: string,
  patch: Partial<Pick<Phone, "brand" | "model" | "variant" | "storage" | "color" | "condition" | "usd" | "marginUsd" | "images" | "highlights">>
): Promise<ActionResult> {
  try {
    await requireAuth();
    const current = await readCatalogFresh();
    const idx = current.phones.findIndex((p) => p.slug === slug);
    if (idx === -1) return { ok: false, error: "Modelo no encontrado." };
    const phone = current.phones[idx];
    const usd = patch.usd ?? phone.usd;
    const marginUsd = patch.marginUsd ?? phone.marginUsd ?? 0;
    const phones = [...current.phones];
    phones[idx] = {
      ...phone,
      ...patch,
      usd,
      marginUsd,
      priceArs: Math.round((usd + marginUsd) * current.dollarRate),
    };
    const next: Catalog = { ...current, phones, updatedAt: new Date().toISOString() };
    await writeCatalog(next);
    invalidateCache();
    return { ok: true, catalog: next };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error inesperado" };
  }
}
