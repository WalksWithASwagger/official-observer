import type { MetadataRoute } from "next";

const BASE = "https://official.observer";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/embed`, changeFrequency: "weekly", priority: 0.5 },
  ];
}
