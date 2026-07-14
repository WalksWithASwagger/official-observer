# Observatory curation playbook

How to grow the public map safely. Operational Notion databases are **sources
only** — never the sync target.

## Canonical databases (sync sources)

| Database | ID | Role |
| --- | --- | --- |
| **Observatory Entities** | `39dc6f79-9a33-811a-8ccf-c1585676b06d` | Nodes |
| **Observatory Relationships** | `39dc6f79-9a33-8108-8eab-e7172f77d307` | Edges |

Nightly sync (`/api/sync/notion`) exports only rows where **Status = Public**.
Relationships also require both Source and Target to be Public entities.

## Do not touch

Leave these operational databases and their property semantics alone:

- AI Ecosystem Map (esp. Status, BC Region, Related Organizations, Relationship)
- Master Calendar: BC + AI (esp. Status lifecycle)
- Projects DB (esp. Status, Owner)
- Futureproof Social Content Calendar (esp. Status workflow)

Never export: Email, Phone, Primary Contact, Key People, Warm-Intro Vector,
Owner→people relations, internal notes, Opt-Out rows.

## Entity schema (Observatory Entities)

| Property | Allowed values |
| --- | --- |
| Type | Organization, Project, Initiative, Event (never Person) |
| Status | Draft, Public, Archived — only **Public** syncs |
| **Stable ID** | Text — public graph id (e.g. `org-bc-ai-ecosystem-association`). Set once; never change after Public. Sync prefers this over `type-slug(name)`. |
| Initiatives | BC + AI, ED + AI, Futureproof |
| Region | Vancouver, Comox Valley, Fraser Valley, Victoria, Provincial, National |
| Blurb | One neutral public sentence |
| Website / LinkedIn / Join URL | Public URLs only |
| **Next Date** | Date — required for Public Events (feeds Pulse). Past dates OK for archive; Pulse shows ≥ today only. |

## Promote Draft → Public (entities)

Prefer reviewing existing Draft rows (~509 orgs seeded from the AI Ecosystem
Map) over bulk re-import.

Checklist before flipping Status to **Public**:

1. Type is Organization, Project, Initiative, or Event — not a person.
2. Blurb is one neutral public sentence (no strategy, funding, private claims).
3. Region is set to one of the six allowed values (or leave Draft if unknown).
4. Website and/or LinkedIn present when the entity is public-facing.
5. Join URL (if any) points at a public landing / registration / membership page.
6. Initiatives filled for BC + AI / ED + AI / Futureproof relevance.
7. No PII or operational outreach fields copied in.

### Region hints (never auto-Public)

| Source signal | Region |
| --- | --- |
| City/Region ~ Vancouver | Vancouver |
| Comox / Courtenay / Cumberland | Comox Valley |
| Victoria | Victoria |
| Fraser / Abbotsford / Surrey-east | Fraser Valley |
| Province-wide / Zoom-only BC programs | Provincial |
| Outside BC / Canada-wide | National |
| Interior / Northern / ambiguous Island | leave empty → stay Draft |

### Source → Type guidance

| Source DB | How to use |
| --- | --- |
| AI Ecosystem Map | Primary org seed; curate Drafts already in Observatory Entities |
| Master Calendar | Selective **Event** rows; Join URL ← Registration Link |
| Projects DB | Selective **Project** rows; rewrite Document Summary → Blurb; drop Owner |
| Futureproof Social Calendar | URL / framing hints only — never promote posts as entities |

## Promote relationships

Create edges only in **Observatory Relationships**:

- Source + Target → Observatory Entities pages
- Type → short public verb (`runs`, `hosts`, `partners`, `sponsors`, …)
- Weight → optional 1–5
- Status → Draft until both ends are Public and the verb is publicly accurate

Then set Status = Public. Sync drops any edge whose endpoints are not Public.

## After curation

1. Ensure `NOTION_TOKEN` on Vercel can read both Observatory DBs.
2. `POST /api/sync/notion` with `Authorization: Bearer $CRON_SECRET`.
3. Confirm counts on https://official.observer/api/graph.
4. Nightly cron (`0 8 * * *` UTC) keeps Public rows fresh.

The repo seed in `data/*.json` remains the offline/PR fallback and can be
re-seeded into Neon via `node scripts/seed.mjs`.

## Curation waves (Phase 6)

Do not bulk-Public Draft orgs without lens testing at ~100 and ~250 nodes.
Run `node scripts/wave-gate.mjs` against `data/entities.json` (or live API) before each promote batch.

| Wave | Target | Status |
| --- | --- | --- |
| W0 Projects | Selective Projects → Public | Done (+5 in live 44) |
| W1 Hub | Every Public Event has Next Date + Join URL; Initiatives have Website | Gate enforced in seed + wave-gate |
| W2 Chapters | Comox, Fraser Valley, Victoria/VIATEC, Vancouver programs tagged `chapter` | Spine tagged; densify edges ongoing |
| W3 Partners | Batches of high-confidence orgs (Website + Blurb + Region + initiative) | Ready — ≤25/week from Draft pool |
| W4 Calendar | Selective Master Calendar → Event entities (next 90 days) | Manual copy into Observatory Events only |
| W5 Expand | Batches of ≤25 Draft→Public with weekly graph QA | After hub lens stays readable at N≈100 |

**Atlas Draft pool (~509):** optional import into Observatory Entities when shared with the integration — not a blocker for W1–W4.

Soft cap: prefer intentional density over volume. Social calendar posts never become entities.

## Directory bridge (Draft hints only)

See [DIRECTORY-BRIDGE.md](./DIRECTORY-BRIDGE.md). One-way suggestions from
`bc-ai-directory-public` → Observatory Entities **Draft**. Never people; never auto-Public.
