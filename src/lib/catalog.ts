import { put, list } from "@vercel/blob";
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

async function blobRead(): Promise<Catalog> {
  if (!hasBlobToken()) return EMPTY;
  try {
    const blobs = await list({ prefix: BLOB_PATH, limit: 1 });
    const entry = blobs.blobs.find((b) => b.pathname === BLOB_PATH);
    if (!entry) return EMPTY;
    // Fetch with no-store to always get the latest bytes from the origin
    const res = await fetch(entry.url, { cache: "no-store" });
    if (!res.ok) return EMPTY;
    return (await res.json()) as Catalog;
  } catch (err) {
    console.error("catalog fetch error", err);
    return EMPTY;
  }
}

/**
 * Read the catalog.
 * Pages declare `export const revalidate = 60` for ISR; on-demand revalidation
 * is handled by revalidatePath() in Server Actions — no unstable_cache needed.
 */
export async function readCatalog(): Promise<Catalog> {
  return blobRead();
}

/**
 * Always-fresh read — use in Server Actions to avoid any per-request memoization.
 */
export async function readCatalogFresh(): Promise<Catalog> {
  return blobRead();
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
