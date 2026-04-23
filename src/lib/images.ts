import { unstable_cache } from "next/cache";

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
    // Filter out generic "person" or "logo" thumbnails (too small or wrong type)
    if (src && (src.includes("Replacement_") || src.endsWith(".svg"))) return null;
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
      // Skip articles that are clearly not about the phone itself
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

async function resolveOne(brand: string, rawQuery: string): Promise<string | null> {
  // Strip RAM part from storage (e.g. "8+256GB" → "256GB") for better Wikipedia search
  const cleanQuery = rawQuery.replace(/\b\d+\+/g, "");

  const candidates = [
    rawQuery,
    cleanQuery,
    `${cleanQuery} smartphone`,
    `${cleanQuery} phone`,
  ];
  for (const q of candidates) {
    const direct = await fetchWikipediaImage(q);
    if (direct) return direct;
  }

  // Fallback: Wikipedia full-text search
  const searchQueries = [
    cleanQuery,
    `${brand} ${cleanQuery.split(" ").slice(-2).join(" ")}`,
  ];
  for (const q of searchQueries) {
    const found = await searchWikipediaPage(q);
    if (found) return found;
  }

  return null;
}

export const resolvePhoneImage = unstable_cache(
  async (brand: string, model: string): Promise<string | null> => {
    // model here is already "Model Variant" without storage
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
  ["phone-image-v2"],
  { revalidate: 60 * 60 * 24 * 30 }
);
