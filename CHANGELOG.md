# Changelog

All notable changes to The Observatory are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/).

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
