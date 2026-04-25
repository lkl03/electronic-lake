"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { readCatalog, writeCatalog } from "@/lib/catalog";
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

export async function fetchDollarBlue(): Promise<DollarResult> {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/blue", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { venta?: number; compra?: number };
    const venta = data.venta;
    if (!venta || typeof venta !== "number") {
      throw new Error("Respuesta inesperada de la API");
    }
    return { ok: true, rate: Math.round(venta + 20) };
  } catch (err) {
    console.error("fetchDollarBlue", err);
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : "No se pudo obtener el dólar blue.",
    };
  }
}

export async function login(password: string): Promise<{ ok: boolean }> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return { ok: false };
  if (password !== expected) return { ok: false };
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

async function requireAuth() {
  const store = await cookies();
  if (store.get("admin_auth")?.value !== "1") {
    throw new Error("No autorizado");
  }
}

export async function generateCatalog(
  sourceMessage: string,
  dollarRate: number
): Promise<ActionResult> {
  try {
    await requireAuth();
    if (!sourceMessage.trim()) {
      return { ok: false, error: "El mensaje del importador está vacío." };
    }
    if (!dollarRate || dollarRate <= 0) {
      return { ok: false, error: "El valor del dólar debe ser mayor a 0." };
    }

    const extracted = await extractPhonesFromMessage(sourceMessage);
    if (extracted.length === 0) {
      return {
        ok: false,
        error:
          "No se pudo extraer ningún celular del mensaje. Revisá el formato.",
      };
    }

    const previous = await readCatalog();
    const prevMargins = new Map<string, number>();
    for (const p of previous.phones) {
      prevMargins.set(p.slug, p.marginUsd ?? 0);
    }

    const warnings: string[] = [];
    const phones: Phone[] = await Promise.all(
      extracted.map(async (e) => {
        const [specsRes, imgRes] = await Promise.all([
          enrichSpecs(e),
          resolvePhoneImage(e.brand, [e.model, e.variant].filter(Boolean).join(" ")),
        ]);
        if (!imgRes) {
          warnings.push(`Sin imagen automática: ${e.brand} ${e.model}`);
        }
        const draft = buildPhone(e, dollarRate, {
          specs: specsRes.specs,
          highlights: specsRes.highlights,
          images: imgRes ? [imgRes] : [],
        });
        const carriedMargin = prevMargins.get(draft.slug) ?? 0;
        return {
          ...draft,
          marginUsd: carriedMargin,
          priceArs: Math.round((draft.usd + carriedMargin) * dollarRate),
        };
      })
    );

    const catalog: Catalog = {
      updatedAt: new Date().toISOString(),
      dollarRate,
      sourceMessage,
      phones,
    };
    await writeCatalog(catalog);
    revalidateTag("catalog", "max");
    revalidatePath("/");
    revalidatePath("/producto/[slug]", "page");
    return { ok: true, catalog, warnings };
  } catch (err) {
    console.error(err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error inesperado",
    };
  }
}

export async function updatePricing(
  dollarRate: number,
  marginsBySlug: Record<string, number>
): Promise<ActionResult> {
  try {
    await requireAuth();
    if (!dollarRate || dollarRate <= 0) {
      return { ok: false, error: "Valor de dólar inválido." };
    }
    const current = await readCatalog();
    if (current.phones.length === 0) {
      return { ok: false, error: "No hay catálogo para recalcular." };
    }
    const phones = current.phones.map((p) => {
      const rawMargin = marginsBySlug[p.slug];
      const marginUsd = Math.max(
        0,
        Number.isFinite(rawMargin) ? Number(rawMargin) : p.marginUsd ?? 0
      );
      return {
        ...p,
        marginUsd,
        priceArs: Math.round((p.usd + marginUsd) * dollarRate),
      };
    });
    const next: Catalog = {
      ...current,
      dollarRate,
      updatedAt: new Date().toISOString(),
      phones,
    };
    await writeCatalog(next);
    revalidateTag("catalog", "max");
    revalidatePath("/");
    revalidatePath("/producto/[slug]", "page");
    return { ok: true, catalog: next };
  } catch (err) {
    console.error(err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Error inesperado",
    };
  }
}

// ─── CRUD ──────────────────────────────────────────────────────────────────

export async function deletePhones(slugs: string[]): Promise<ActionResult> {
  try {
    await requireAuth();
    if (!slugs.length) return { ok: false, error: "No hay modelos seleccionados." };
    const current = await readCatalog();
    const slugSet = new Set(slugs);
    const phones = current.phones.filter((p) => !slugSet.has(p.slug));
    const next: Catalog = { ...current, phones, updatedAt: new Date().toISOString() };
    await writeCatalog(next);
    revalidateTag("catalog", "max");
    revalidatePath("/");
    revalidatePath("/producto/[slug]", "page");
    return { ok: true, catalog: next };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error inesperado" };
  }
}

export async function deletePhone(slug: string): Promise<ActionResult> {
  try {
    await requireAuth();
    const current = await readCatalog();
    const phones = current.phones.filter((p) => p.slug !== slug);
    const next: Catalog = { ...current, phones, updatedAt: new Date().toISOString() };
    await writeCatalog(next);
    revalidateTag("catalog", "max");
    revalidatePath("/");
    revalidatePath("/producto/[slug]", "page");
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
    const current = await readCatalog();
    const idx = current.phones.findIndex((p) => p.slug === slug);
    if (idx === -1) return { ok: false, error: "Modelo no encontrado." };
    const phone = current.phones[idx];
    const usd = patch.usd ?? phone.usd;
    const marginUsd = patch.marginUsd ?? phone.marginUsd ?? 0;
    const updated: Phone = {
      ...phone,
      ...patch,
      usd,
      marginUsd,
      priceArs: Math.round((usd + marginUsd) * current.dollarRate),
    };
    const phones = [...current.phones];
    phones[idx] = updated;
    const next: Catalog = { ...current, phones, updatedAt: new Date().toISOString() };
    await writeCatalog(next);
    revalidateTag("catalog", "max");
    revalidatePath("/");
    revalidatePath(`/producto/${slug}`, "page");
    return { ok: true, catalog: next };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error inesperado" };
  }
}
