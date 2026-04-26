/**
 * Phone image resolver — Google Custom Search only.
 *
 * Requires env vars:
 *   GOOGLE_SEARCH_API_KEY  — Google Cloud Console API key
 *   GOOGLE_SEARCH_CX       — Programmable Search Engine ID
 *
 * No caching here. Results are stored in catalog.phones[n].images
 * and persist until the catalog is regenerated.
 */

const BLOCKED = [
  "amazon.", "ebay.", "aliexpress.", "mercadolibre.", "olx.",
  "shutterstock.", "gettyimages.", "istockphoto.", "alamy.", "depositphotos.",
  "walmart.", "bestbuy.", "target.", "temu.",
];

async function googleSearch(query: string): Promise<string | null> {
  const key = process.env.GOOGLE_SEARCH_API_KEY;
  const cx  = process.env.GOOGLE_SEARCH_CX;

  if (!key || !cx) {
    console.error("[images] ❌ GOOGLE_SEARCH_API_KEY or GOOGLE_SEARCH_CX not set");
    return null;
  }

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", key);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", query);
  url.searchParams.set("searchType", "image");
  url.searchParams.set("num", "5");
  url.searchParams.set("imgType", "photo");

  console.log(`[images] Google → "${query}"`);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[images] Google ${res.status}: ${body.slice(0, 400)}`);
      return null;
    }

    const data = (await res.json()) as { items?: Array<{ link?: string }> };
    const items = data.items ?? [];
    console.log(`[images] ${items.length} result(s) for "${query}"`);

    for (const { link = "" } of items) {
      if (!link.startsWith("https")) continue;
      if (BLOCKED.some((b) => link.includes(b))) continue;
      console.log(`[images] ✓ ${link.slice(0, 100)}`);
      return link;
    }

    console.log(`[images] no usable result for "${query}"`);
    return null;
  } catch (err) {
    console.error("[images] fetch error:", err);
    return null;
  }
}

/**
 * Resolve the best product image for a phone via Google Custom Search.
 * Called once per phone during catalog generation.
 */
export async function resolvePhoneImage(
  brand: string,
  model: string
): Promise<string | null> {
  // Strip RAM prefix: "8+256GB" → "256GB"
  const clean = model.replace(/\b\d+\+/g, "").trim();

  const queries = [
    `${brand} ${clean} smartphone`,
    `${brand} ${clean}`,
    clean,
  ];

  for (const q of queries) {
    const img = await googleSearch(q);
    if (img) return img;
  }

  console.log(`[images] ✗ no image for "${brand} ${clean}"`);
  return null;
}
