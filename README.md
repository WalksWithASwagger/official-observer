# The Observatory

A public, interactive **living map** of the BC + AI, ED + AI, and Futureproof
ecosystem — the people, organizations, projects, and events, and how they
connect.

It's a WebGL knowledge graph rendered entirely in the browser from
version-controlled open data. **No database, no backend** — every node and edge
lives in [`/data`](./data).

![status: early](https://img.shields.io/badge/status-early-orange)

## What you can do

- **Explore** the ecosystem as a graph; hubs are sized by how connected they are.
- **Filter** by initiative (BC + AI / ED + AI / Futureproof) and by entity type.
- **Search** any person, org, project, or event and jump to it.
- **Click** any node to see its blurb, links, and every connection.

## Tech

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript + Tailwind v4
- [Sigma.js](https://www.sigmajs.org) + [graphology](https://graphology.github.io) (WebGL graph + ForceAtlas2 layout)
- [MiniSearch](https://github.com/lucaong/minisearch) for client-side search
- Deploys on [Vercel](https://vercel.com)

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## The data model

Two files drive the whole map:

- [`data/entities.json`](./data/entities.json) — nodes. Each has an `id`, `type`
  (`person` · `org` · `project` · `event` · `initiative`), `name`, `blurb`,
  `initiatives`, and optional `tags` / `links`.
- [`data/relationships.json`](./data/relationships.json) — edges. Each has a
  `source`, `target`, `type` (e.g. `runs`, `partners`, `produces`), and optional
  `weight`.

Add an entity, add its relationships, reload — it's on the map.

## Embed it

The live graph is embeddable via the chrome-less `/embed` route (framing is
allowed for `bc-ai.ca` and `futureproof.website`):

```html
<iframe
  src="https://official.observer/embed"
  width="100%" height="600"
  style="border:0;border-radius:12px"
  title="The Observatory"
  loading="lazy"
></iframe>
```

## Contributing

Corrections and additions are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

Code is [MIT](./LICENSE). The dataset in [`/data`](./data) is
[CC BY 4.0](./data/LICENSE).
