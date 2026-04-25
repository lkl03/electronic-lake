import { unstable_cache } from "next/cache";

// ─── Google Custom Search (primary, when configured) ─────────────────────────

type GoogleItem = { link?: string; image?: { contextLink?: string } };
type GoogleResponse = { items?: GoogleItem[] };

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

async function resolveGoogleImage(query: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;
  if (!apiKey || !cx) return null;

  try {
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("cx", cx);
    url.searchParams.set("q", query);
    url.searchParams.set("searchType", "image");
    url.searchParams.set("num", "5");
    url.searchParams.set("imgType", "photo");
    url.searchParams.set("safe", "off");

    const res = await fetch(url.toString(), {
      next: { revalidate: 60 * 60 * 24 * 7 }, // cache 7 days
    });
    if (!res.ok) {
      console.warn("[images] Google API error", res.status);
      return null;
    }

    const data = (await res.json()) as GoogleResponse;
    const items = data.items ?? [];

    for (const item of items) {
      const link = item.link ?? "";
      if (!link.startsWith("https")) continue;
      if (BLOCKED_HOSTS.some((b) => link.includes(b))) continue;
      return link;
    }
    return null;
  } catch (err) {
    console.warn("[images] Google search failed", err);
    return null;
  }
}

// ─── Wikipedia (fallback) ─────────────────────────────────────────────────────

type WikiSummary = {
  thumbnail?: { source: string };
  originalimage?: { source: string };
};

type WikiSearchResult = {
  query?: { search?: Array<{ title: string }> };
};

const WIKI_AGENT = "ElectronicLake/1.0 (https://electroniclake.vercel.app)";

async function fetchWikipediaImage(title: string): Promise<string | null> {
  const encoded = encodeURIComponent(title.replace(/\s+/g, "_"));
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`,
      {
        headers: { "User-Agent": WIKI_AGENT, Accept: "application/json" },
        next: { revalidate: 60 * 60 * 24 * 30 },
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as WikiSummary;
    const src = data.originalimage?.source ?? data.thumbnail?.source ?? null;
    if (src && (src.includes("Replacement_") || src.endsWith(".svg")))
      return null;
    return src;
  } catch {
    return null;
  }
}

async function searchWikipediaPage(query: string): Promise<string | null> {
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
      `https://en.wikipedia.org/w/api.php?${params.toString()}`,
      {
        headers: { "User-Agent": WIKI_AGENT },
        next: { revalidate: 60 * 60 * 24 * 30 },
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as WikiSearchResult;
    const results = data?.query?.search ?? [];
    for (const result of results) {
      const t = result.title.toLowerCase();
      if (t.includes("list of") || t.includes("comparison")) continue;
      const img = await fetchWikipediaImage(result.title);
      if (img) return img;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Core resolver ────────────────────────────────────────────────────────────

async function resolveOne(brand: string, rawQuery: string): Promise<string | null> {
  // Strip RAM prefix: "8+256GB" → "256GB"
  const cleanQuery = rawQuery.replace(/\b\d+\+/g, "");

  // 1. Try Google Custom Search (if configured)
  const googleQueries = [
    `${brand} ${cleanQuery} smartphone`,
    `${brand} ${cleanQuery}`,
  ];
  for (const q of googleQueries) {
    const img = await resolveGoogleImage(q);
    if (img) return img;
  }

  // 2. Wikipedia direct lookup
  const wikiQueries = [rawQuery, cleanQuery, `${cleanQuery} smartphone`, `${cleanQuery} phone`];
  for (const q of wikiQueries) {
    const img = await fetchWikipediaImage(q);
    if (img) return img;
  }

  // 3. Wikipedia full-text search
  const searchQueries = [
    cleanQuery,
    `${brand} ${cleanQuery.split(" ").slice(-2).join(" ")}`,
  ];
  for (const q of searchQueries) {
    const img = await searchWikipediaPage(q);
    if (img) return img;
  }

  return null;
}

export const resolvePhoneImage = unstable_cache(
  async (brand: string, model: string): Promise<string | null> => {
    const queries = [
      `${brand} ${model}`,
      `${brand}_${model.replace(/\s+/g, "_")}`,
      model,
    ];
    for (const q of queries) {
      const img = await resolveOne(brand, q);
      if (img) return img;
    }
    return null;
  },
  ["phone-image-v4"],
  { revalidate: 60 * 60 * 24 * 30 }
);
