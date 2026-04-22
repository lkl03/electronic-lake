import { unstable_cache } from "next/cache";

type WikiSummary = {
  type?: string;
  thumbnail?: { source: string; width: number; height: number };
  originalimage?: { source: string; width: number; height: number };
};

async function fetchWikipediaImage(query: string): Promise<string | null> {
  const title = encodeURIComponent(query.replace(/\s+/g, "_"));
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`,
      {
        headers: {
          "User-Agent": "ElectronicLake/1.0 (https://electroniclake.ar)",
          Accept: "application/json",
        },
        next: { revalidate: 60 * 60 * 24 * 30 },
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as WikiSummary;
    return data.originalimage?.source ?? data.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

async function resolveOne(query: string): Promise<string | null> {
  const candidates = [query, `${query} smartphone`, `${query} phone`];
  for (const q of candidates) {
    const wiki = await fetchWikipediaImage(q);
    if (wiki) return wiki;
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
      const img = await resolveOne(q);
      if (img) return img;
    }
    return null;
  },
  ["phone-image-v1"],
  { revalidate: 60 * 60 * 24 * 30 }
);
