import type { MetadataRoute } from "next";
import { readCatalog } from "@/lib/catalog";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://electronic-lake.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await readCatalog();
  const now = new Date();
  const products = catalog.phones.map((p) => ({
    url: `${siteUrl}/producto/${p.slug}`,
    lastModified: catalog.updatedAt ? new Date(catalog.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...products,
  ];
}
