import type { NextConfig } from "next";

const APEX_HOST = "official.observer";
const WWW_HOST = `www.${APEX_HOST}`;

const EMBED_HOSTS =
  "'self' https://bc-ai.ca https://*.bc-ai.ca https://futureproof.website https://*.futureproof.website";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: WWW_HOST }],
        destination: `https://${APEX_HOST}/`,
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: WWW_HOST }],
        destination: `https://${APEX_HOST}/:path*`,
        permanent: true,
      },
    ];
  },
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
