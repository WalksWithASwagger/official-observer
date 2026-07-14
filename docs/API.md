# Observatory public API

Base URL: `https://official.observer`

License: **CC BY 4.0** for dataset payloads. Attribute “The Observatory / BC + AI”.

## Endpoints

### `GET /api/v1/graph`

Full Public graph.

```json
{
  "version": 1,
  "license": "CC-BY-4.0",
  "entities": [ /* Entity */ ],
  "relationships": [ /* Relationship */ ]
}
```

Cache: `s-maxage=300`. CORS: `*`.

### `GET /api/v1/entities/:id`

Single entity plus incident edges.

### `GET /api/graph`

Legacy alias (same graph body without `version`/`license` envelope). Prefer v1.

## Entity shape

See [`lib/types.ts`](../lib/types.ts). Notable fields: `id` (stable), `type`, `name`, `blurb`, `initiatives`, `region`, `tags`, `links`, `joinUrl`, `nextDate`.

## Embed partners

CSP `frame-ancestors` allowlist (see `next.config.ts`):

- `bc-ai.ca` / `*.bc-ai.ca`
- `futureproof.website` / `*.futureproof.website`

To add a host: open a PR updating `EMBED_HOSTS` in `next.config.ts` with the partner domain and a one-line justification.

Embed query params:

- `node=<stableId>` — select entity on load
- `initiative=bc-ai|ed-ai|futureproof` — filter to one initiative

## Directory bridge

See [DIRECTORY-BRIDGE.md](./DIRECTORY-BRIDGE.md).

`bc-ai-directory-public` may suggest Draft Observatory orgs (people filtered out). Never auto-Public. Process: curator reviews → Observatory Entities Draft → Public gate.
