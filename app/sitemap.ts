import type { MetadataRoute } from "next";
import { dataset } from "@/lib/data";

const BASE = "https://official.observer";

export default function sitemap(): MetadataRoute.Sitemap {
  const entityUrls = dataset.entities.map((e) => ({
    url: `${BASE}/e/${e.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/embed`, changeFrequency: "weekly", priority: 0.5 },
    ...entityUrls,
  ];
}
