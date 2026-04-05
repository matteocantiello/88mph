import type { MetadataRoute } from "next";
import { getMetadata } from "@/lib/data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://88mph.fm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const metadata = await getMetadata();
  const now = new Date();

  const chartPages = metadata.charts
    .filter((e) => e.available)
    .map((e) => ({
      url: `${SITE_URL}/${e.country}/${e.year}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/suggest`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    ...chartPages,
  ];
}
