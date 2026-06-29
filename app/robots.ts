import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://official.observer/sitemap.xml",
    host: "https://official.observer",
  };
}
