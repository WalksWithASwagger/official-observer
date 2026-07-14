#!/usr/bin/env node
/**
 * Curation wave gate — fail if Public seed breaks W1 / soft W2 checks.
 * Usage: node scripts/wave-gate.mjs [path-to-entities.json]
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const path = resolve(process.argv[2] ?? "data/entities.json");
const entities = JSON.parse(readFileSync(path, "utf8"));

const errors = [];
const warnings = [];

const events = entities.filter((e) => e.type === "event");
for (const e of events) {
  if (!e.nextDate) errors.push(`W1: ${e.id} missing nextDate`);
  if (!e.joinUrl) errors.push(`W1: ${e.id} missing joinUrl`);
}

const initiatives = entities.filter((e) => e.type === "initiative");
for (const e of initiatives) {
  const hasWeb =
    Boolean(e.joinUrl) ||
    (e.links ?? []).some((l) => /website/i.test(l.label) || Boolean(l.url));
  if (!hasWeb) errors.push(`W1: ${e.id} missing Website/joinUrl`);
}

const chapters = entities.filter((e) => (e.tags ?? []).includes("chapter"));
const regions = new Set(chapters.map((e) => e.region).filter(Boolean));
for (const need of ["comox-valley", "fraser-valley", "victoria", "vancouver"]) {
  if (!regions.has(need) && !chapters.some((c) => c.region === need)) {
    warnings.push(`W2: no chapter-tagged entity for region ${need}`);
  }
}

console.log(
  JSON.stringify(
    {
      path,
      entities: entities.length,
      events: events.length,
      chapters: chapters.map((c) => c.id),
      errors,
      warnings,
      ok: errors.length === 0,
    },
    null,
    2,
  ),
);
process.exit(errors.length === 0 ? 0 : 1);
