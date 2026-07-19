#!/usr/bin/env node

import assert from "node:assert/strict";

const baseUrl = (process.env.SEO_CHECK_BASE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

async function fetchText(path) {
  const response = await fetch(`${baseUrl}${path}`);
  assert.equal(response.status, 200, `${path} should return 200`);
  return { response, text: await response.text() };
}

function canonicalFrom(html) {
  const tag = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i)?.[0];
  return tag?.match(/\bhref=["']([^"']+)["']/i)?.[1];
}

function jsonLdFrom(html) {
  return [...html.matchAll(/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
    (match) => JSON.parse(match[1]),
  );
}

const { text: home } = await fetchText("/");
assert.equal((home.match(/<h1\b/gi) ?? []).length, 1, "homepage raw HTML should contain one H1");
assert.match(home, /The Observatory/);
assert.match(home, /A public, interactive living map of the BC \+ AI, ED \+ AI, and Futureproof ecosystem\./);
assert.match(home, /href=["']\/about["']/);
assert.match(home, /href=["']\/api\/v1\/graph["']/);
assert.equal(
  new URL(canonicalFrom(home)).href,
  "https://official.observer/",
);

const graph = jsonLdFrom(home).flatMap((entry) => entry["@graph"] ?? [entry]);
const website = graph.find((entry) => entry["@type"] === "WebSite");
const dataset = graph.find((entry) => entry["@type"] === "Dataset");
assert.equal(website?.url, "https://official.observer/");
assert.equal(dataset?.license, "https://creativecommons.org/licenses/by/4.0/");
assert.equal(
  dataset?.distribution?.contentUrl,
  "https://official.observer/api/v1/graph",
);
assert.equal(dataset?.distribution?.encodingFormat, "application/json");

const serializedStructuredData = JSON.stringify(graph);
for (const forbidden of ["Person", "Draft", "Notion", "POSTGRES", "DATABASE_URL"]) {
  assert.equal(
    serializedStructuredData.includes(forbidden),
    false,
    `structured data should not contain ${forbidden}`,
  );
}

const { text: entity } = await fetchText("/e/initiative-bc-ai");
assert.equal(
  canonicalFrom(entity),
  "https://official.observer/e/initiative-bc-ai",
);

const { response: llmsResponse, text: llms } = await fetchText("/llms.txt");
assert.match(llmsResponse.headers.get("content-type") ?? "", /^text\/plain\b/);
for (const publicUrl of [
  "https://official.observer/",
  "https://official.observer/about",
  "https://official.observer/api/v1/graph",
  "https://creativecommons.org/licenses/by/4.0/",
  "https://github.com/WalksWithASwagger/official-observer",
]) {
  assert.ok(llms.includes(publicUrl), `llms.txt should link to ${publicUrl}`);
}
for (const forbidden of ["Draft", "Notion", "POSTGRES", "DATABASE_URL", "Person"]) {
  assert.equal(llms.includes(forbidden), false, `llms.txt should not contain ${forbidden}`);
}

console.log(`Search discovery checks passed against ${baseUrl}`);
