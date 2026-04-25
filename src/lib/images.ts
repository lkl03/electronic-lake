/**
 * Phone image resolver.
 *
 * NO unstable_cache here — the catalog JSON is the persistence layer.
 * This function is called once per phone during catalog generation.
 * Results are stored in catalog.phones[n].images and never re-fetched
 * until the catalog is regenerated.
 *
 * Primary:  Google Custom Search API  (GOOGLE_SEARCH_API_KEY + GOOGLE_SEARCH_CX)
 * Fallback: Wikipedia REST API
 */

// ─── Config ───────────────────────────────────────────────────────────────────

const BLOCKED_HOSTS = [
  "amazon",
  "ebay",
  "aliexpress",
  "mercadolibre",
  "olx",
  "shutterstock",
  "gettyimages",
  "istockphoto",
  "alamy",
  "depositphotos",
];

// ─── Google Custom Search ─────────────────────────────────────────────────────

async function googleImageSearch(query: string): Promise<string | null> {
  const key = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;

  if (!key || !cx) {
    console.log("[images] Google not configured (missing env vars)");
    return null;
  }

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", key);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", query);
  url.searchParams.set("searchType", "image");
  url.searchParams.set("num", "5");
  url.searchParams.set("imgType", "photo");

  console.log(`[images] Google search: "${query}"`);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[images] Google error ${res.status}: ${body.slice(0, 300)}`);
      return null;
    }

    const data = (await res.json()) as { items?: Array<{ link?: string }> };
    const items = data.items ?? [];
    console.log(`[images] Google returned ${items.length} result(s) for "${query}"`);

    for (const item of items) {
      const link = item.link ?? "";
      if (!link.startsWith("https")) continue;
      if (BLOCKED_HOSTS.some((b) => link.includes(b))) continue;
      console.log(`[images] ✓ Google pick: ${link.slice(0, 100)}`);
      return link;
    }

    console.log(`[images] No usable Google result for "${query}"`);
    return null;
  } catch (err) {
    console.error("[images] Google fetch error:", err);
    return null;
  }
}

// ─── Wikipedia (fallback) ─────────────────────────────────────────────────────

const WIKI_UA = "ElectronicLake/1.0 (https://electroniclake.vercel.app)";

type WikiSummary = {
  thumbnail?: { source: string };
  originalimage?: { source: string };
};
type WikiSearch = {
  query?: { search?: Array<{ title: string }> };
};

async function wikipediaImage(title: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(title.replace(/\s+/g, "_"));
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
      { headers: { "User-Agent": WIKI_UA }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as WikiSummary;
    const src = data.originalimage?.source ?? data.thumbnail?.source ?? null;
    if (!src || src.includes("Replacement_") || src.endsWith(".svg")) return null;
    return src;
  } catch {
    return null;
  }
}

async function wikipediaSearch(query: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: query,
      srlimit: "5",
      format: "json",
      srnamespace: "0",
      origin: "*",
    });
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?${params}`,
      { headers: { "User-Agent": WIKI_UA }, cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as WikiSearch;
    for (const result of data?.query?.search ?? []) {
      const t = result.title.toLowerCase();
      if (t.includes("list of") || t.includes("comparison")) continue;
      const img = await wikipediaImage(result.title);
      if (img) return img;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Resolve the best available image for a phone.
 * Tries Google Custom Search first, then Wikipedia.
 * NOT cached — results are stored in the catalog JSON after generation.
 */
export async function resolvePhoneImage(
  brand: string,
  model: string
): Promise<string | null> {
  // Strip RAM prefix: "8+256GB" → "256GB"
  const cleanModel = model.replace(/\b\d+\+/g, "");

  console.log(`[images] Resolving: ${brand} ${cleanModel}`);

  // 1. Google (primary)
  const googleQueries = [
    `${brand} ${cleanModel} smartphone`,
    `${brand} ${cleanModel}`,
  ];
  for (const q of googleQueries) {
    const img = await googleImageSearch(q);
    if (img) return img;
  }

  // 2. Wikipedia direct (fallback)
  const wikiTitles = [
    `${brand} ${cleanModel}`,
    cleanModel,
    `${cleanModel} (smartphone)`,
  ];
  for (const t of wikiTitles) {
    const img = await wikipediaImage(t);
    if (img) {
      console.log(`[images] Wikipedia direct: ${img.slice(0, 80)}`);
      return img;
    }
  }

  // 3. Wikipedia search (last resort)
  const wikiImg = await wikipediaSearch(`${brand} ${cleanModel} smartphone`);
  if (wikiImg) {
    console.log(`[images] Wikipedia search: ${wikiImg.slice(0, 80)}`);
    return wikiImg;
  }

  console.log(`[images] No image found for: ${brand} ${cleanModel}`);
  return null;
}
