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

## Open questions / roadmap

- **Custom domain** — currently on `official-observer.vercel.app`. Decide the
  real domain (e.g. `observer.bc-ai.ca`) and wire DNS in Vercel.
- **Data density** — optionally import the already-CC-BY `bc-ai-directory.json`
  (962 orgs / 1,297 people) as an explicit, public-only step.
- **"Pulse" layer (Concept C)** — a "what's happening now" view (new orgs,
  upcoming events, momentum) layered on the graph.
- **Geographic view** — MapLibre map if/when entities carry coordinates.
