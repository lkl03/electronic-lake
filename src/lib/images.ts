/**
 * Phone image resolver — Serper.dev Images API
 *
 * Requires env var:  SERPER_API_KEY
 * Docs:             https://serper.dev
 *
 * No caching at this level. Results are stored in catalog.phones[n].images
 * and persist until the catalog is regenerated.
 */

// ─── Config ───────────────────────────────────────────────────────────────────

const BLOCKED = [
  "amazon.", "ebay.", "aliexpress.", "mercadolibre.", "olx.",
  "shutterstock.", "gettyimages.", "istockphoto.", "alamy.", "depositphotos.",
  "walmart.", "bestbuy.", "target.", "temu.",
];

const PREFERRED = [
  "samsung.com", "apple.com", "mi.com", "motorola.com",
  "gsmarena.com", "phonearena.com", "notebookcheck.net",
];

type SerperImage = {
  title?: string;
  imageUrl?: string;
  link?: string;
  source?: string;
};

type SerperResponse = {
  images?: SerperImage[];
};

// ─── Serper image search ──────────────────────────────────────────────────────

async function serperImageSearch(query: string): Promise<string | null> {
  const key = process.env.SERPER_API_KEY;
  if (!key) {
    console.error("[images] SERPER_API_KEY not set");
    return null;
  }

  console.log(`[images] Serper → "${query}"`);

  try {
    const res = await fetch("https://google.serper.dev/images", {
      method: "POST",
      headers: {
        "X-API-KEY": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, gl: "us", hl: "en", num: 10 }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`[images] Serper ${res.status}: ${(await res.text()).slice(0, 300)}`);
      return null;
    }

    const data = (await res.json()) as SerperResponse;
    const items = data.images ?? [];
    console.log(`[images] ${items.length} result(s) for "${query}"`);

    const isValid = (img: SerperImage): string | null => {
      const url = img.imageUrl ?? "";
      const src = `${img.link ?? ""} ${img.source ?? ""}`.toLowerCase();
      if (!url.startsWith("https")) return null;
      if (BLOCKED.some((b) => url.includes(b) || src.includes(b))) return null;
      return url;
    };

    // 1. Try preferred sources first
    for (const item of items) {
      const url = isValid(item);
      if (!url) continue;
      const src = `${item.link ?? ""} ${item.source ?? ""}`.toLowerCase();
      if (PREFERRED.some((p) => src.includes(p))) {
        console.log(`[images] ✓ preferred: ${url.slice(0, 100)}`);
        return url;
      }
    }

    // 2. First valid non-blocked result
    for (const item of items) {
      const url = isValid(item);
      if (url) {
        console.log(`[images] ✓ ${url.slice(0, 100)}`);
        return url;
      }
    }

    console.log(`[images] no usable result for "${query}"`);
    return null;
  } catch (err) {
    console.error("[images] fetch error:", err);
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Resolve the best product image for a phone via Serper.dev.
 * Called once per phone during catalog generation.
 * Returns null (never throws) — catalog generation continues with a warning.
 */
export async function resolvePhoneImage(
  brand: string,
  model: string
): Promise<string | null> {
  // Strip RAM prefix: "8+256GB" → "256GB"
  const clean = model.replace(/\b\d+\+/g, "").trim();

  const queries = [
    `${brand} ${clean} smartphone official image`,
    `${brand} ${clean} product image`,
    `${brand} ${clean}`,
    clean,
  ];

  for (const q of queries) {
    const img = await serperImageSearch(q);
    if (img) return img;
  }

  console.log(`[images] ✗ no image for "${brand} ${clean}"`);
  return null;
}
