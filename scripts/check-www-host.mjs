#!/usr/bin/env node

import assert from "node:assert/strict";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { readFile } from "node:fs/promises";

const APEX = "official.observer";
const WWW = `www.${APEX}`;
const APEX_ORIGIN = `https://${APEX}`;

const vercel = JSON.parse(
  await readFile(new URL("../vercel.json", import.meta.url), "utf8"),
);
const nextConfig = await readFile(
  new URL("../next.config.ts", import.meta.url),
  "utf8",
);

function wwwRedirects(rules) {
  return (rules ?? []).filter(
    (rule) =>
      rule.permanent === true &&
      String(rule.destination).startsWith(`${APEX_ORIGIN}`) &&
      (rule.has ?? []).some(
        (condition) => condition.type === "host" && condition.value === WWW,
      ),
  );
}

const vercelWww = wwwRedirects(vercel.redirects);
assert.ok(
  vercelWww.some((rule) => rule.source === "/"),
  "vercel.json must permanently redirect www / to the apex origin",
);
assert.ok(
  vercelWww.some(
    (rule) => rule.source === "/:path*" && rule.destination === `${APEX_ORIGIN}/:path*`,
  ),
  "vercel.json must permanently redirect www /:path* to the apex",
);

assert.match(nextConfig, /const APEX_HOST = "official\.observer"/);
assert.match(nextConfig, /const WWW_HOST = `www\.\$\{APEX_HOST\}`/);
assert.ok(
  nextConfig.includes('type: "host", value: WWW_HOST'),
  "next.config.ts must match the www host",
);
assert.ok(
  nextConfig.includes("destination: `https://${APEX_HOST}/`"),
  "next.config.ts must redirect www / to the apex origin",
);
assert.ok(
  nextConfig.includes("destination: `https://${APEX_HOST}/:path*`"),
  "next.config.ts must redirect www /:path* to the apex",
);
assert.match(nextConfig, /permanent:\s*true/);

console.log("www host redirect config ok");

const httpBase = process.env.WWW_CHECK_BASE_URL;
if (!httpBase) {
  process.exit(0);
}

const baseUrl = httpBase.replace(/\/$/, "");
const usingLiveWww = new URL(baseUrl).hostname === WWW;

function requestOnce(url, hostHeader) {
  const parsed = new URL(url);
  const transport = parsed.protocol === "https:" ? httpsRequest : httpRequest;
  return new Promise((resolve, reject) => {
    const req = transport(
      {
        hostname: parsed.hostname,
        port: parsed.port || undefined,
        path: `${parsed.pathname}${parsed.search}`,
        method: "GET",
        headers: hostHeader ? { host: hostHeader } : undefined,
      },
      (response) => {
        response.resume();
        resolve({
          status: response.statusCode ?? 0,
          location: response.headers.location,
        });
      },
    );
    req.on("error", reject);
    req.end();
  });
}

async function assertRedirect(pathWithQuery, expectedPathWithQuery) {
  const requestUrl = `${baseUrl}${pathWithQuery}`;
  const response = await requestOnce(
    requestUrl,
    usingLiveWww ? undefined : WWW,
  );
  assert.ok(
    [301, 308].includes(response.status),
    `${requestUrl} should 301/308, got ${response.status}`,
  );
  assert.ok(response.location, `${requestUrl} should send Location`);
  assert.equal(
    new URL(response.location, APEX_ORIGIN).href,
    `${APEX_ORIGIN}${expectedPathWithQuery}`,
  );
}

await assertRedirect("/", "/");
await assertRedirect("/about?x=1", "/about?x=1");
console.log(`www host HTTP redirect checks passed against ${baseUrl}`);
