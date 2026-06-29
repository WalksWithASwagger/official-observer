#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entities = JSON.parse(readFileSync(join(root, "data/entities.json"), "utf8"));
const relationships = JSON.parse(readFileSync(join(root, "data/relationships.json"), "utf8"));

const TYPES = new Set(["person", "org", "project", "event", "initiative"]);
const INITIATIVES = new Set(["bc-ai", "ed-ai", "futureproof"]);
const REGIONS = new Set([
  "vancouver", "comox-valley", "fraser-valley", "victoria", "provincial", "national",
]);

const errors = [];
const warnings = [];
const ids = new Set();

for (const e of entities) {
  if (ids.has(e.id)) errors.push(`duplicate id: ${e.id}`);
  ids.add(e.id);
  // Privacy gate: this is a PUBLIC map — no individuals.
  if (e.type === "person") errors.push(`person entity not allowed on public map: ${e.id}`);
  if (!TYPES.has(e.type)) errors.push(`invalid type "${e.type}" on ${e.id}`);
  for (const i of e.initiatives ?? []) {
    if (!INITIATIVES.has(i)) errors.push(`invalid initiative "${i}" on ${e.id}`);
  }
  if (e.region && !REGIONS.has(e.region)) errors.push(`invalid region "${e.region}" on ${e.id}`);
}

const referenced = new Set();
for (const r of relationships) {
  referenced.add(r.source);
  referenced.add(r.target);
  if (!ids.has(r.source)) errors.push(`dangling edge source: ${r.source}`);
  if (!ids.has(r.target)) errors.push(`dangling edge target: ${r.target}`);
}

for (const e of entities) {
  if (!referenced.has(e.id)) warnings.push(`orphan node (no edges): ${e.id}`);
}

for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`\nFAILED: ${errors.length} error(s).`);
  process.exit(1);
}
console.log(
  `✓ data valid — ${entities.length} entities, ${relationships.length} relationships, ${warnings.length} warning(s), 0 person nodes.`,
);
