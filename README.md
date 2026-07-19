# The Observatory

A public, interactive **living map** of the BC + AI, ED + AI, and Futureproof
ecosystem — the organizations, projects, events, and initiatives, and how they
connect.

It's a WebGL knowledge graph. The repo ships version-controlled open data in
[`/data`](./data); production hydrates from Notion → Neon via `/api/graph`
(Status=Public only). Live: https://official.observer · **v0.6.0**.

![status: early](https://img.shields.io/badge/status-early-orange)

## What you can do

- **Explore** the ecosystem as a graph; hubs are sized by how connected they are.
- **Filter** by initiative (BC + AI / ED + AI / Futureproof) and by entity type;
  default **hub lens** hides orgs until you opt in.
- **Search** any org, project, event, or initiative and jump to it.
- **Click** any node to see its blurb, links, and every connection — or open
  `/e/<stableId>` for a shareable page.
- **Pulse** shows upcoming Public events (from Notion **Next Date**) plus the
  Futureproof countdown.
- **Download** the Public graph as JSON: [`/api/v1/graph`](https://official.observer/api/v1/graph)
  (CC BY 4.0). See [docs/API.md](./docs/API.md).

## Tech

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript + Tailwind v4
- [Sigma.js](https://www.sigmajs.org) + [graphology](https://graphology.github.io) (WebGL graph + ForceAtlas2 layout)
- [MiniSearch](https://github.com/lucaong/minisearch) for client-side search
- Optional: Neon Postgres + Notion sync (Status=Public gate)
- Deploys on [Vercel](https://vercel.com)

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run check:seo # verify raw HTML against a running server on localhost:3000
```

Set `SEO_CHECK_BASE_URL` to run the search-discovery check against another local
port.

## The data model

Two files drive the seed map (and remain the fallback when no DB is configured):

- [`data/entities.json`](./data/entities.json) — nodes. Each has an `id`, `type`
  (`org` · `project` · `event` · `initiative`; `person` reserved), `name`,
  `blurb`, `initiatives`, optional `region` / `tags` / `links` / `joinUrl` /
  `nextDate`.
- [`data/relationships.json`](./data/relationships.json) — edges. Each has a
  `source`, `target`, `type` (e.g. `runs`, `partners`, `produces`), and optional
  `weight`.

Live production mirrors the same shape from **Observatory Entities** and
**Observatory Relationships** (Public rows only; sync prefers Notion
**Stable ID**). Curation: [docs/CURATION.md](./docs/CURATION.md). Ops truth:
[docs/AGENT-MEMORY.md](./docs/AGENT-MEMORY.md).

Add an entity, add its relationships, reload — it's on the map.

## Embed it

The live graph is embeddable via the chrome-less `/embed` route (framing is
allowed for `bc-ai.ca` and `futureproof.website`):

```html
<iframe
  src="https://official.observer/embed?node=initiative-bc-ai"
  width="100%" height="600"
  style="border:0;border-radius:12px"
  title="The Observatory"
  loading="lazy"
></iframe>
```

Query params: `node=<stableId>`, `initiative=bc-ai|ed-ai|futureproof`.
To allowlist another host, PR `EMBED_HOSTS` in `next.config.ts` (see
[docs/API.md](./docs/API.md)).

## Contributing

Corrections and additions are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

Code is [MIT](./LICENSE). The dataset in [`/data`](./data) is
[CC BY 4.0](./data/LICENSE).
