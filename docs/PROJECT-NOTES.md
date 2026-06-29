# Project Notes — The Observatory

The why, the architecture, and what's next. (User-facing intro lives in
[README](../README.md); release history in [CHANGELOG](../CHANGELOG.md).)

## What this is

A public, interactive **living map** of three connected initiatives — **BC + AI**,
**ED + AI**, and **Futureproof** — showing their people, organizations, projects,
and events and how they relate.

## Key decisions

1. **Graph, not a directory.** A Dealroom-style tabular directory already exists
   (`bc-ai-directory`). The differentiated, name-aligned ("Observer") play is an
   interactive graph that surfaces *interconnection*, not just records.
2. **No backend.** The whole graph builds in the browser from two
   version-controlled JSON files. Deliberately *not* a fork of the private
   `notion-local` apps (`digital-twin` / `kk-portal`), which carry heavy
   Postgres + Neo4j + FastAPI infra. This keeps the project public, simple, and
   free of ops burden.
3. **Greenfield + open data.** Started clean. Seed data is hand-authored from
   public facts only and licensed CC BY 4.0, so the repo can be public from day
   one with nothing private to leak.

## Architecture

```
data/entities.json ─┐
                    ├─> lib/data.ts ─> lib/graph.ts ─(graphology + ForceAtlas2)─┐
data/relationships ─┘                                                          │
                                                                              ▼
app/page.tsx ─> components/ObservatoryClient.tsx ─(dynamic, ssr:false)─> Observatory
                                                                              │
                              ┌───────────────────────────────────────────────┤
                              ▼                ▼                ▼               ▼
                        GraphController   FilterBar         SearchBox      EntityPanel
                        (Sigma reducers)  (initiative/type) (MiniSearch)   (detail + connections)
```

- **`lib/graph.ts`** builds the graphology graph, sizes nodes by degree, colors
  by primary initiative, and runs ForceAtlas2 for layout.
- **`GraphController`** (inside `Observatory.tsx`) loads the graph, registers
  click/hover events, and drives node/edge reducers for filtering + highlighting.
- Sigma is client-only, so the graph is loaded via `next/dynamic` with
  `ssr: false` to avoid SSR/WebGL issues.

## How to extend the data

Edit `data/entities.json` + `data/relationships.json`, reload. See
[CONTRIBUTING.md](../CONTRIBUTING.md) for the schema and rules.

## Verification

- `npm run build` — production build (also runs typecheck).
- `npm run dev` — local graph at http://localhost:3000.
- Browser-verified 2026-06-28: graph renders, color-by-initiative, click-to-
  inspect, neighbor highlighting, search, filters — no console errors. Live
  production (https://official-observer.vercel.app) returns 200.

## Roadmap

Grounded in the real ecosystem (nonprofit, 8+ programs, Futureproof as the 2026
gravitational center). The map is a public **front door** that also takes ops
load off the team. Hard rule throughout: **public-safe entities only** — no PII,
no Chatham House content, no funding figures, no AInBC governance dossier.

- [x] **Custom domain** — live at https://official.observer (Porkbun A-record).
- [x] **Phase 1 — Populate the real ecosystem** *(0.2.0)* — 39 public entities /
      62 relationships; people removed; `region` tags added.
- [x] **Phase 2 — Living "pulse" layer** *(0.3.0)* — Pulse panel: Futureproof
      countdown + what's-next.
- [x] **Phase 3 — UX** *(0.3.0–0.4.0)* — deep links, color-by toggle + legend,
      **type-based node icons**, **camera fly-to**.
- [x] **Phase 4 — Geographic BC view** *(0.3.0–0.4.0)* — keyless d3-geo map,
      focused on SW BC, **click-a-region → graph filter**.
- [x] **Phase 5 — Front door + embed** *(0.3.0–0.4.0)* — `/embed` (hardened,
      framing CSP, snippet), Scorecard, **"Get involved" links**, **OG share image**.
- [~] **Backend backbone** *(0.3.0, code complete)* — `/api/graph` + Notion orgs
      sync + validator. **Runs in static-fallback until KK provisions Neon + sets
      `NOTION_TOKEN`** (see below).
- [ ] **Phase 6 — Curate → pipeline (beyond orgs)** — extend the Notion schema
      (events/projects/initiatives + relationships) so more than orgs auto-feed.

## Canonical Notion layer (seeded 2026-06-29)

The sync reads two purpose-built DBs under **BC + AI Community Atlas** — not the
operational DBs. Only `Status = Public` rows sync.

- **Observatory Entities** — `855bcffe-1cad-4edd-a1af-4f381119194d`
  (39 Public = the live map; ~509 Draft orgs pulled from the AI Ecosystem Map,
  website+blurb, no Opt-Out, for incremental Public approval).
- **Observatory Relationships** — `c5ead7b3-f7e3-444d-8994-00b2c99d411b`
  (62 Public edges).

## Going live with the backend (KK actions)

1. **Provision Neon** (Vercel dashboard → Storage → Neon, or `vercel`
   marketplace). Sets `POSTGRES_URL`/`DATABASE_URL`.
2. Add to Vercel env:
   - `NOTION_TOKEN` (integration with access to the two Observatory DBs)
   - `OBSERVATORY_ENTITIES_DB_ID=855bcffe-1cad-4edd-a1af-4f381119194d`
   - `OBSERVATORY_RELATIONSHIPS_DB_ID=c5ead7b3-f7e3-444d-8994-00b2c99d411b`
   - `CRON_SECRET=<random>`
   - `NEXT_PUBLIC_GRAPH_API=/api/graph`
3. Trigger `POST /api/sync/notion` once (Bearer `CRON_SECRET`) → confirm 39
   entities / 62 edges land in Postgres and render on official.observer. Nightly
   cron keeps it fresh; flip Draft orgs → Public to add them over time.
