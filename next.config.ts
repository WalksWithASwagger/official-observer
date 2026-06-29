import type { NextConfig } from "next";

const EMBED_HOSTS =
  "'self' https://bc-ai.ca https://*.bc-ai.ca https://futureproof.website https://*.futureproof.website";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${EMBED_HOSTS};`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
