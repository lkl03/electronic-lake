import { head, put, list } from "@vercel/blob";
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

export async function readCatalog(): Promise<Catalog> {
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
    const data = (await res.json()) as Catalog;
    return data;
  } catch (err) {
    console.error("readCatalog error", err);
    return EMPTY;
  }
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
