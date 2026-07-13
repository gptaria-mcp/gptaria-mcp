# REST API reference (v1)

Base URL: `https://www.gptaria.com/api/v1`

The MCP server wraps this API — you can also call it directly from any language.

## Authentication

Send your key from Settings → API keys as a bearer token (or `x-api-key`):

```
Authorization: Bearer gptaria_live_xxx
```

- **Live** keys (`gptaria_live_…`) persist. **Sandbox** keys (`gptaria_sbx_…`)
  run every validation and rule check but persist nothing (writes return
  `dry_run`) and never charge.
- Keys carry scopes: `projects:read`, `projects:write`, `responses:write`,
  `cases:write`.

## Errors

Non-2xx responses are `{ "error": { "code": "...", "message": "..." } }`.

| Status | code | Meaning |
| --- | --- | --- |
| 401 | `unauthorized` | Missing / invalid / revoked key |
| 403 | `forbidden` | Key lacks the required scope |
| 403 | `not_starter` / `not_builder` | Wrong account role for this action |
| 403 | `super_expert_window` | The first 3h after a project posts are Super-Expert-only |
| 402 | `need_access` | Builder has no active access pass |
| 422 | `invalid_body` | Body failed validation (see `message`) |
| 503 | `payments_unavailable` | Paid publishing isn't enabled yet |

---

## `GET /projects`

List open (public, "brewing") projects. Scope: `projects:read`.

```bash
curl -H "Authorization: Bearer $GPTARIA_API_KEY" \
  https://www.gptaria.com/api/v1/projects
```

```json
{ "sandbox": false, "data": [
  { "id": "uuid", "slug": "…", "title": "…", "description": "…",
    "status": "brewing", "source_language": "en", "created_at": "…" }
] }
```

## `POST /projects`

Publish a project brief via a **Pro order** (€10). Scope: `projects:write`.
Client accounts only. Creates the brief as a private **draft** and returns a
checkout URL; paying it publishes the project. Full flow:
[pro-order.md](./pro-order.md).

Body:

| field | type | notes |
| --- | --- | --- |
| `title` | string | 10–200 chars |
| `description` | string | 50–2000 chars |
| `source_language` | `en\|ru\|uk\|el` | default `en` |
| `budget` | integer | optional, whole units of your currency (`uk`→UAH, else EUR) |
| `category` | enum | optional: `software\|video\|audio\|image\|content\|marketing\|social\|other` |

```json
{ "ok": true, "id": "uuid", "slug": "…", "status": "draft",
  "payment": { "service": "pro_order", "amount_cents": 39900, "currency": "UAH",
               "checkout_url": "https://…" },
  "message": "Draft created. Open checkout_url and pay to publish the project." }
```

## `GET /projects/:id/responses`

List a project's responses (builder proposals). Scope: `projects:read`.
Responses are public. Use this to pull the responses and work on them in your
own assistant.

```json
{ "sandbox": false,
  "project": { "id": "uuid", "slug": "…", "title": "…" },
  "data": [
    { "id": "uuid", "builder": "@handle", "source_message": "…",
      "source_language": "en", "budget_cents": null, "budget_currency": null,
      "prototype_url": null, "github_url": null, "is_selected": false,
      "created_at": "…" }
  ] }
```

## `POST /projects/:id/responses`

Submit a response to a project. Scope: `responses:write`. Builder accounts only,
with an active access pass; the 3-hour Super-Expert window applies.

Body:

| field | type | notes |
| --- | --- | --- |
| `source_message` | string | Markdown, 50–5000 chars |
| `source_language` | `en\|ru\|uk` | default `en` |
| `budget_cents` | integer | optional |
| `budget_currency` | `EUR\|USD\|UAH` | optional |

```json
{ "ok": true, "id": "uuid", "sandbox": false }
```

## `POST /cases`

Publish a portfolio case (dev.to-style Markdown). Scope: `cases:write`.

Body:

| field | type | notes |
| --- | --- | --- |
| `title` | string | 3–120 chars |
| `body_markdown` | string | 1–200,000 chars |
| `description` | string | optional, ≤300; auto-derived if omitted |
| `tags` | string \| string[] | optional |
| `source_language` | `en\|ru\|uk\|el` | default `en` |
| `published` | boolean | default `false` (draft) |

```json
{ "ok": true, "id": "uuid", "slug": "…", "sandbox": false }
```

---

## Sandbox

A sandbox key (`gptaria_sbx_…`) exercises the identical request path — auth,
schema, validation, and every rule — then, for writes, returns
`{ "dry_run": true }` **without persisting, notifying, indexing, or charging**.
Reads (`GET`) return real live data for both key types (projects and responses
are public). Debug your integration on sandbox, then swap in a live key.
