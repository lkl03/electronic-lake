"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
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
        return buildPhone(e, dollarRate, {
          specs: specsRes.specs,
          highlights: specsRes.highlights,
          images: imgRes ? [imgRes] : [],
        });
      })
    );

    const catalog: Catalog = {
      updatedAt: new Date().toISOString(),
      dollarRate,
      sourceMessage,
      phones,
    };
    await writeCatalog(catalog);
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

export async function updateDollarRate(
  dollarRate: number
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
    const phones = current.phones.map((p) => ({
      ...p,
      priceArs: Math.round(p.usd * dollarRate),
    }));
    const next: Catalog = {
      ...current,
      dollarRate,
      updatedAt: new Date().toISOString(),
      phones,
    };
    await writeCatalog(next);
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
