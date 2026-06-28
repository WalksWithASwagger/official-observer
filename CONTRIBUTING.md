# Contributing

The Observatory is community data. Corrections and additions are welcome.

## Add or fix an entity

1. Open [`data/entities.json`](./data/entities.json).
2. Add an object (or edit an existing one):

   ```json
   {
     "id": "org-example",
     "type": "org",
     "name": "Example Org",
     "blurb": "One sentence on what they do.",
     "initiatives": ["bc-ai"],
     "tags": ["optional", "keywords"],
     "links": [{ "label": "example.com", "url": "https://example.com" }]
   }
   ```

   - `id` must be unique and kebab-case (convention: `type-shortname`).
   - `type` is one of: `person`, `org`, `project`, `event`, `initiative`.
   - `initiatives` is one or more of: `bc-ai`, `ed-ai`, `futureproof`.

## Connect it

Add edges in [`data/relationships.json`](./data/relationships.json):

```json
{ "source": "org-example", "target": "init-bc-ai", "type": "part-of" }
```

- `source` and `target` must match entity `id`s.
- `type` is a short verb phrase (`runs`, `partners`, `produces`, `part-of`, …).
- `weight` (optional) thickens the edge and pulls nodes closer.

## Ground rules

- **Public information only.** Don't add private contact details or anything not
  already public. By contributing you agree your additions are released under
  [CC BY 4.0](./data/LICENSE).
- Keep blurbs to one neutral sentence.
- Run `npm run build` before opening a PR to confirm the JSON parses.

Then open a pull request describing what you changed and your source.
