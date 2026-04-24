import { unstable_cache } from "next/cache";

// ─── Types ──────────────────────────────────────────────────────────────────

type DDGImageResult = {
  image?: string;
  url?: string;
  title?: string;
  width?: number;
  height?: number;
};

type WikiSummary = {
  thumbnail?: { source: string };
  originalimage?: { source: string };
};

type WikiSearchResult = {
  query?: { search?: Array<{ title: string }> };
};

// ─── DuckDuckGo (primary) ────────────────────────────────────────────────────

const DDG_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function getDDGVQD(query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
      {
        headers: {
          "User-Agent": DDG_UA,
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
        next: { revalidate: 60 * 60 * 24 },
      }
    );
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/vqd=["']([^"']+)["']/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

async function fetchDDGImageResults(query: string): Promise<DDGImageResult[]> {
  try {
    const vqd = await getDDGVQD(query);
    if (!vqd) return [];

    const params = new URLSearchParams({
      l: "us-en",
      o: "json",
      q: query,
      vqd,
      f: ",,,",
      p: "1",
    });

    const res = await fetch(`https://duckduckgo.com/i.js?${params}`, {
      headers: {
        "User-Agent": DDG_UA,
        Referer: "https://duckduckgo.com/",
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.9",
        "X-Requested-With": "XMLHttpRequest",
      },
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!res.ok) return [];
    const data = (await res.json()) as { results?: DDGImageResult[] };
    return data.results ?? [];
  } catch {
    return [];
  }
}

// Domains with high-quality product shots
const PREFERRED = [
  "gsmarena.com",
  "phonearena.com",
  "kimovil.com",
  "91mobiles.com",
  "notebookcheck.net",
  "techradar.com",
  "theverge.com",
  "cnet.com",
  "rtings.com",
  "androidauthority.com",
  "sammobile.com",
  "xda-developers.com",
];

// Domains to skip (ads, generic stock, icons)
const BLOCKED = [
  "amazon.com",
  "ebay.com",
  "aliexpress",
  "mercadolibre",
  "logo",
  "icon",
  "wallpaper",
  "clipart",
  "shutterstock",
  "gettyimages",
  "istockphoto",
];

function scoreDDGResult(r: DDGImageResult): number {
  const url = (r.image ?? "").toLowerCase();
  const source = (r.url ?? "").toLowerCase();
  if (!url.startsWith("https")) return -1;
  if (BLOCKED.some((b) => url.includes(b) || source.includes(b))) return -1;
  let score = 0;
  if (PREFERRED.some((p) => source.includes(p))) score += 10;
  // Prefer landscape-ish or portrait images (not tiny squares)
  const w = r.width ?? 0;
  const h = r.height ?? 0;
  if (w >= 400 && h >= 400) score += 3;
  if (w >= 200 && h >= 200) score += 1;
  return score;
}

async function resolveDDG(query: string): Promise<string | null> {
  const results = await fetchDDGImageResults(query);
  if (results.length === 0) return null;

  const scored = results
    .map((r) => ({ r, score: scoreDDGResult(r) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.r.image ?? null;
}

// ─── Wikipedia (fallback) ─────────────────────────────────────────────────────

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

// ─── Core resolver ───────────────────────────────────────────────────────────

async function resolveOne(brand: string, rawQuery: string): Promise<string | null> {
  // Strip RAM prefix from storage (e.g. "8+256GB" → "256GB")
  const cleanQuery = rawQuery.replace(/\b\d+\+/g, "");

  // DDG: try a few search terms
  const ddgQueries = [
    `${cleanQuery} official`,
    cleanQuery,
    `${cleanQuery} smartphone`,
    `${brand} ${cleanQuery.split(" ").slice(-2).join(" ")}`,
  ];
  for (const q of ddgQueries) {
    const img = await resolveDDG(q);
    if (img) return img;
  }

  // Wikipedia fallback
  const wikiQueries = [
    rawQuery,
    cleanQuery,
    `${cleanQuery} smartphone`,
    `${cleanQuery} phone`,
  ];
  for (const q of wikiQueries) {
    const img = await fetchWikipediaImage(q);
    if (img) return img;
  }
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
  ["phone-image-v3"],
  { revalidate: 60 * 60 * 24 * 30 }
);
