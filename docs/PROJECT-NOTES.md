# Project Notes — The Observatory

The why, the architecture, and what's next. (User-facing intro lives in
[README](../README.md); release history in [CHANGELOG](../CHANGELOG.md);
curation workflow in [CURATION.md](./CURATION.md).)

## What this is

A public, interactive **living map** of three connected initiatives — **BC + AI**,
**ED + AI**, and **Futureproof** — showing organizations, projects, events, and
initiatives and how they relate. People are reserved in the schema but never
published.

## Key decisions

1. **Graph, not a directory.** A Dealroom-style tabular directory already exists
   (`bc-ai-directory`). The differentiated, name-aligned ("Observer") play is an
   interactive graph that surfaces *interconnection*, not just records.
2. **Static seed + optional live backend.** Version-controlled JSON in `/data`
   powers first paint and offline/dev use. When Neon + Notion env are set,
   `/api/graph` and `/api/sync/notion` serve the Public Observatory layer.
3. **Canonical Notion export layer.** Sync reads only **Observatory Entities**
   and **Observatory Relationships** — never operational DBs (AI Ecosystem Map,
   Master Calendar, Projects DB, Social Calendar).
4. **Greenfield + open data.** Seed data is hand-authored from public facts only
   and licensed CC BY 4.0.

## Architecture

```
data/entities.json ─┐
                    ├─> lib/data.ts ─> useDataset() ─┐
data/relationships ─┘     ▲                         │
                          │ fallback                ▼
              /api/graph ← Neon ← /api/sync/notion  Observatory UI
                          (Status=Public only)       (graph + panel + search)
```

- **`lib/graph.ts`** builds the graphology graph, sizes nodes by degree, colors
  by primary initiative, and runs ForceAtlas2 for layout.
- **`GraphController`** (inside `Observatory.tsx`) loads the graph, registers
  click/hover events, and drives node/edge reducers for filtering + highlighting.
- Sigma is client-only, so the graph is loaded via `next/dynamic` with
  `ssr: false` to avoid SSR/WebGL issues.
- Entity panel, search, scorecard, and deep links all consume the **live**
  `useDataset()` result (static seed until `/api/graph` hydrates).

## Schema (site)

- **Type:** `org` · `project` · `event` · `initiative` (`person` reserved, never synced)
- **Region:** `vancouver` · `comox-valley` · `fraser-valley` · `victoria` ·
  `provincial` · `national`
- **Initiatives:** `bc-ai` · `ed-ai` · `futureproof`
- **Public gate:** Notion `Status = Public` only (Draft / Archived excluded)

## How to extend the data

- **Preferred (live):** curate Observatory Entities / Relationships in Notion —
  see [CURATION.md](./CURATION.md).
- **Fallback / PR path:** edit `data/entities.json` + `data/relationships.json`.
  See [CONTRIBUTING.md](../CONTRIBUTING.md).

## Verification

- `npm run build` — production build (also runs typecheck + data validator).
- `npm run dev` — local graph at http://localhost:3000.
- Live: https://official.observer · embed: https://official.observer/embed

## Roadmap

Grounded in the real ecosystem (nonprofit, 8+ programs, Futureproof as the 2026
gravitational center). The map is a public **front door** that also takes ops
load off the team. Hard rule throughout: **public-safe entities only** — no PII,
no Chatham House content, no funding figures, no AInBC governance dossier.

- [x] **Custom domain** — live at https://official.observer (Porkbun A-record).
- [x] **Phase 1 — Populate the real ecosystem** *(0.2.0)* — 39 public entities /
      62+ relationships; people removed; `region` tags added.
- [x] **Phase 2 — Living "pulse" layer** *(0.3.0)* — Pulse panel: Futureproof
      countdown + what's-next.
- [x] **Phase 3 — UX** *(0.3.0–0.4.0)* — deep links, color-by toggle + legend,
      **type-based node icons**, **camera fly-to**.
- [x] **Phase 4 — Geographic BC view** *(0.3.0–0.4.0)* — keyless d3-geo map,
      focused on SW BC, **click-a-region → graph filter**.
- [x] **Phase 5 — Front door + embed** *(0.3.0–0.4.0)* — `/embed` (hardened,
      framing CSP, snippet), Scorecard, **"Get involved" links**, **OG share image**.
- [x] **Backend backbone** — Neon provisioned; `/api/graph` serves live Postgres
      (44 entities / 72 edges, including `joinUrl`). `NOTION_TOKEN` (varlock),
      Observatory DB IDs, `CRON_SECRET`, and `NEXT_PUBLIC_GRAPH_API` set on
      Vercel. Notion → Neon sync verified at 44 Public / 72 Public.
- [~] **Phase 6 — Curate → pipeline** — schema + sync accept org/event/project/
      initiative. First Projects-DB promotions are Public; continue Draft →
      Public curation per [CURATION.md](./CURATION.md) (Ecosystem Map orgs,
      Master Calendar events).

## Canonical Notion layer

The sync reads two purpose-built DBs — not the operational ones. Only
`Status = Public` rows sync.

**Active sync targets** (accessible to the Cursor MCP / `NOTION_TOKEN`
integration; seeded 2026-07-14 under Futureproof Festival hub):

- **Observatory Entities** — `39dc6f79-9a33-811a-8ccf-c1585676b06d`
- **Observatory Relationships** — `39dc6f79-9a33-8108-8eab-e7172f77d307`

Earlier Atlas-hosted IDs (`855bcffe-…`, `c5ead7b3-…`) remain historical; they
were not shared with the integration and are not used by sync.

Live Public set: **44 entities / 72 relationships** (includes five Projects-DB
promotions: FATALE, GNI, Sandboxing AI, METACREATION, Compass Datacenters Lab).

### Inventory → export mapping (do not sync operational DBs)

| Source | Use |
| --- | --- |
| AI Ecosystem Map (~839) | Curate into Observatory Entities as Organization (Draft first) |
| Master Calendar: BC + AI (~173) | Selective Event entities; Join URL ← Registration Link |
| Projects DB (~11) | Selective Project entities; public Blurb rewrite |
| Futureproof Social Calendar | Hints for URLs / framing only |

## Going live with Notion sync (remaining KK action)

Already done:

1. Neon provisioned (`POSTGRES_URL` / `DATABASE_URL` on Vercel).
2. `NOTION_TOKEN` (varlock `kk-shared:local:NOTION_TOKEN`), Observatory DB IDs,
   `CRON_SECRET`, and `NEXT_PUBLIC_GRAPH_API=/api/graph` set on Vercel.
3. `/api/graph` serves live Postgres; Notion → Neon sync verified at 44/72.

Next curation (Phase 6):

1. Share older Atlas Observatory DBs with Cursor MCP **or** continue curating
   into the active Futureproof-hub Observatory DBs.
2. Promote high-confidence Ecosystem Map orgs (Website + Blurb + Region).
3. Selective Master Calendar → Event entities (Join URL ← Registration Link).
4. Nightly cron (`0 8 * * *` UTC) already scheduled — confirm one Vercel cron run.
