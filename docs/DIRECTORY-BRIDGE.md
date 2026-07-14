# Directory → Observatory Draft bridge

One-way densification hints. Differentiator stays **graph-not-table**.

## Source

[`bc-ai-directory-public`](https://github.com/WalksWithASwagger/bc-ai-directory-public)
(or the live directory export used by bc-ai.ca).

## Hard filters (before any Draft row)

1. Drop rows that look like people (person name patterns, `type=person`, bio-only).
2. Drop Email / Phone / Warm-Intro / Owner fields — never copy them.
3. Require at least one of: Website, LinkedIn, public org homepage.
4. Map region only to the six Observatory enums; ambiguous → leave empty (stay Draft).

## Process

1. Curator reviews a batch (≤25).
2. Create or update **Observatory Entities** rows as **Draft** (Stable ID optional until Public).
3. Add initiative ties + Blurb; create Draft relationships only when both ends exist.
4. Promote with the Public checklist in [CURATION.md](./CURATION.md).
5. Never set Status=Public from a script.

## Partner embeds

CSP allowlist lives in `next.config.ts` (`EMBED_HOSTS`). To add a host: PR with
domain + one-line justification. Documented in [API.md](./API.md).
