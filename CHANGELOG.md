# Changelog

All notable changes to The Observatory are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [0.4.1] — 2026-06-28

Polish & hardening (no new features).

### Added
- **SEO** — `app/robots.ts` + `app/sitemap.ts`.
- **Stronger data validator** — now also checks `data/events.json` (entityId
  references resolve, `YYYY-MM-DD` dates), requires `https` on all URLs/joinUrls,
  and warns on entities missing a `region`. Still gates the build via `prebuild`.
- **Accessibility** — `aria-label`s on the search input (+ `type="search"`) and
  the clear-region-filter control.

## [0.4.0] — 2026-06-28

Phase 3/5 leftovers + polish.

### Added
- **Type-based node icons** — white line-glyph per entity type over the colored
  disc (`@sigma/node-image`, `lib/icons.ts`).
- **"Get involved" links** — `joinUrl` field → button in the entity panel
  (BC+AI, Futureproof populated).
- **Map → graph region filter** — click a region bubble to filter the graph,
  with a dismissible chip.
- **Camera fly-to** on selection / search / deep-link.
- **Embeddable `/embed`** hardened — `frame-ancestors` CSP for bc-ai.ca /
  futureproof.website, attribution link, iframe snippet in README + `/about`.
- **Mobile layout pass** — entity panel as a bottom sheet, secondary panels
  hidden on small screens, stacked top controls.
- **OG / social share image** — dynamic branded card with live stats + metadata.

### Fixed
- `.env.example` is now actually tracked (was caught by the default `.env*` ignore).

## [0.3.0] — 2026-06-28

Roadmap Phases 2–5 + backend backbone.

### Added
- **Pulse layer** — Futureproof countdown + "what's next" upcoming events
  (`data/events.json`, `lib/events.ts`, `PulsePanel`).
- **Deep links** — `?node=<id>` opens an entity and syncs to the URL on select.
- **Color-by toggle** (initiative ↔ type) with a legend.
- **Scorecard** — ecosystem stats strip (`lib/stats.ts`).
- **Geographic BC view** — keyless d3-geo map of chapters by region, with a
  Graph|Map toggle (`MapView`, `lib/regions.ts`, `data/bc-geo.json`).
- **`/embed` route** — chrome-less graph for iframing on other sites.
- **Backend backbone** — `/api/graph` (Postgres with static fallback),
  `/api/sync/notion` (orgs sync gated by `Status=public`, nightly Vercel cron),
  `lib/db.ts`, `scripts/seed.mjs`, and a `useDataset()` hook that hydrates from
  the API when `NEXT_PUBLIC_GRAPH_API` is set.
- **Validator gate** — `scripts/validate-data.mjs` wired to `prebuild`;
  hard-fails on person/PII, dangling edges, or invalid enums.

### Notes
- Backend runs in **static-fallback mode** until Neon is provisioned and a
  `NOTION_TOKEN` is set — both are KK actions. App is fully functional without them.

## [0.2.0] — 2026-06-28

Populated the map with the real public ecosystem and removed individuals.

### Changed
- **Map now reflects the real ecosystem** — grew from 18 seed nodes to **39
  entities / 62 relationships**: the nonprofit, all recurring programs (Vancouver
  AI Meetup, ED+AI, Comox Valley, Fraser Valley, Film Club, Office Hours, MAC, AI
  Happy Hour, Life Sciences SIG), Futureproof Festival + its tracks, The Upgrade /
  RAP, Wild Salmon Programme, and partners/venues/sponsors/academic/government.
- Entities now carry a `region` tag (vancouver / comox-valley / fraser-valley /
  victoria / provincial / national) to seed a future geographic view.

### Removed
- **All individual people.** v1 is orgs/events/programs/initiatives only — zero
  PII, zero consent surface. (`person` stays in the schema for later, with consent.)

### Privacy
- Hard public/private gate enforced: nothing sourced from private datasets
  (people index, SQLite DBs, CRM), Chatham House content, funding figures,
  unannounced transitions, or the AInBC governance dossier.

### Fixed
- Filter bar now shows only entity types present in the data (no empty "Person").

## [0.1.0] — 2026-06-28

Initial public release. A living map of the BC + AI, ED + AI, and Futureproof
ecosystem, rendered as an interactive WebGL graph with no backend.

### Added
- **Interactive graph** (`components/Observatory.tsx`) — Sigma.js + graphology
  with a ForceAtlas2 layout; nodes colored by initiative, sized by degree.
- **Click-to-inspect panel** (`components/EntityPanel.tsx`) — entity type,
  blurb, initiative tags, links, and every connection (clickable to traverse).
- **Neighbor highlighting** — selecting/hovering a node dims the rest of the
  graph to isolate its network.
- **Filter bar** (`components/FilterBar.tsx`) — toggle by initiative and by
  entity type.
- **Search** (`components/SearchBox.tsx`) — MiniSearch fuzzy/prefix search that
  focuses the matched node.
- **About page** (`app/about/page.tsx`) — what it is, how it works, data license.
- **Data layer** (`lib/`) — typed schema (`types.ts`), JSON loader (`data.ts`),
  graph builder (`graph.ts`).
- **Seed dataset** — 18 entities / 32 relationships in `data/`, public facts
  only, published CC BY 4.0.
- Licensing: MIT for code, CC BY 4.0 for `data/`.

### Infrastructure
- Scaffolded with Next.js 16 (App Router) + TypeScript + Tailwind v4.
- Public repo: https://github.com/WalksWithASwagger/official-observer
- Deployed to Vercel: https://official-observer.vercel.app

[0.1.0]: https://github.com/WalksWithASwagger/official-observer/releases/tag/v0.1.0
