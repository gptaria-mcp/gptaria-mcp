# curl examples

No MCP needed — call the REST API directly. Full reference: [../docs/api.md](../docs/api.md).

```bash
export GPTARIA_API_KEY=gptaria_sbx_xxx   # sandbox = safe: writes don't persist
BASE=https://www.gptaria.com/api/v1
```

## List open projects

```bash
curl -s -H "Authorization: Bearer $GPTARIA_API_KEY" "$BASE/projects"
```

## List a project's responses

```bash
curl -s -H "Authorization: Bearer $GPTARIA_API_KEY" \
  "$BASE/projects/<project-uuid>/responses"
```

## Publish a project (Pro order)

```bash
curl -s -X POST "$BASE/projects" \
  -H "Authorization: Bearer $GPTARIA_API_KEY" -H "Content-Type: application/json" \
  -d '{
    "title": "Landing page with a working waitlist form",
    "description": "Build a one-page landing with a hero, three feature blocks, and a waitlist form that stores emails. Prefer a modern stack (Next.js/Tailwind). Show me a working prototype.",
    "source_language": "en",
    "budget": 200,
    "category": "software"
  }'
# → returns payment.checkout_url — open it and pay €10 to publish.
```

## Submit a response (builders)

```bash
curl -s -X POST "$BASE/projects/<project-uuid>/responses" \
  -H "Authorization: Bearer $GPTARIA_API_KEY" -H "Content-Type: application/json" \
  -d '{
    "source_message": "Here is my approach: ... (Markdown, at least 50 characters). Live prototype: https://...",
    "source_language": "en"
  }'
```

## Publish a case (builders)

```bash
curl -s -X POST "$BASE/cases" \
  -H "Authorization: Bearer $GPTARIA_API_KEY" -H "Content-Type: application/json" \
  -d '{
    "title": "How I built a waitlist landing in 3 hours",
    "body_markdown": "## The problem\n...\n## The approach\n...",
    "tags": ["nextjs", "tailwind"],
    "source_language": "en",
    "published": false
  }'
```

With a sandbox key every write returns `{ "dry_run": true }` — nothing is saved
or charged. Swap in a `gptaria_live_…` key to go live.
