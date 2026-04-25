import { head, put, list } from "@vercel/blob";
import { unstable_cache } from "next/cache";
import type { Catalog } from "./types";

const BLOB_PATH = "catalog.json";

const EMPTY: Catalog = {
  updatedAt: new Date(0).toISOString(),
  dollarRate: 1000,
  phones: [],
};

function hasBlobToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function fetchFromBlob(): Promise<Catalog> {
  if (!hasBlobToken()) return EMPTY;
  try {
    const blobs = await list({ prefix: BLOB_PATH, limit: 1 });
    const entry = blobs.blobs.find((b) => b.pathname === BLOB_PATH);
    if (!entry) return EMPTY;
    const meta = await head(entry.url);
    const res = await fetch(meta.downloadUrl ?? entry.url, {
      cache: "no-store",
    });
    if (!res.ok) return EMPTY;
    return (await res.json()) as Catalog;
  } catch (err) {
    console.error("catalog fetch error", err);
    return EMPTY;
  }
}

/**
 * Cached read — used by ISR pages (revalidates every 60 s, tagged "catalog").
 * Do NOT use inside Server Actions — use readCatalogFresh() instead.
 */
export const readCatalog = unstable_cache(fetchFromBlob, ["catalog-v1"], {
  revalidate: 60,
  tags: ["catalog"],
});

/**
 * Always-fresh read — bypasses unstable_cache entirely.
 * Use in every Server Action so stale cache doesn't cause false errors.
 */
export async function readCatalogFresh(): Promise<Catalog> {
  return fetchFromBlob();
}

export async function writeCatalog(catalog: Catalog): Promise<void> {
  if (!hasBlobToken()) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not set — create a Vercel Blob store and add the token."
    );
  }
  await put(BLOB_PATH, JSON.stringify(catalog, null, 2), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
    addRandomSuffix: false,
    cacheControlMaxAge: 0,
  });
}
