# Observatory — agent memory (2026-07-14)

Supersedes older notes that said “only open item = NOTION_TOKEN” or Atlas DB IDs as canonical.

## Live truth

- Site: https://official.observer
- Sync: Notion Observatory DBs → Neon → `/api/graph` (Status=Public only)
- **Active Entities DB:** `39dc6f79-9a33-811a-8ccf-c1585676b06d`
- **Active Relationships DB:** `39dc6f79-9a33-8108-8eab-e7172f77d307`
- Token: varlock `kk-shared:local:NOTION_TOKEN` (Cursor MCP / KK Brain)
- Atlas IDs `855bcffe-…` / `c5ead7b3-…` are historical / not shared — do not use for sync
- Stable ID + Next Date properties exist on Entities; sync prefers Stable ID
- Public API: `/api/v1/graph`, `/api/v1/entities/:id`
- Entity pages: `/e/[id]`

## Verify (shipped 2026-07-14)

```bash
npm run validate && node scripts/wave-gate.mjs && npm run build
curl -sS https://official.observer/api/v1/graph | jq '{version, n:(.entities|length), next:(.entities|map(select(.nextDate))|length)}'
```

Expect: validate + wave-gate ok; build green; live `version:1`, ~44 entities, Next Dates present.

## Do not

- Sync operational DBs (Ecosystem Map, Master Calendar, Projects, Social)
- Publish people / PII
- Invent Other/Unknown region values beyond the six enums
