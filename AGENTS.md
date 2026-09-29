<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Environment

Use `.env.schema` as the only agent-readable env contract. Do not open
`.env`, `.env.local`, `.vercel/.env.*.local`, or files under
`~/.agents/env/values/`.

The schema optionally `@import`s `~/.agents/env/values/.env.shared.local`
with an explicit `pick` of `NOTION_TOKEN`, then the project values file
`~/.agents/env/values/.env.official-observer.local` by path
(`allowMissing=true`). Missing imports are valid in CI and cloud runs.

`npm run dev` loads local env through `varlock run --inject vars`. Run
secret-free lint, typecheck, and build directly. Do not wrap
`npm run build` or `npm run start` with Varlock. Validate with:

```bash
npm run env:validate
```
