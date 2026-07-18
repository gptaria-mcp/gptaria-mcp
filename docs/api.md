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
  `cases:write`, `profile:read`, `profile:write`.

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

## `GET /projects/:id/comments`

List a project's clarifications (owner-posted updates to the brief). Scope:
`projects:read`. Public — anyone can read them.

```json
{ "sandbox": false,
  "project": { "id": "uuid", "slug": "…", "title": "…" },
  "data": [
    { "id": "uuid", "author": "@handle", "body": "…", "created_at": "…" }
  ] }
```

## `POST /projects/:id/comments`

Add a clarification to a project. Scope: `projects:write`. **Owner only** — the
caller must be the project's client (starter); the project must be public and
open (`brewing`). Use this when, after publishing, the brief needs more — a
logo, design wishes, a reference — so every builder sees the update.

Body:

| field | type | notes |
| --- | --- | --- |
| `body` | string | 1–4000 chars |

```json
{ "ok": true, "id": "uuid", "sandbox": false }
```

Errors specific to this endpoint: `403 not_owner` (not your project),
`404 not_found` (no open public project with that id).

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

## `POST /cases/:id/summary`

Generate a case's AI summary block from its body. Scope: `cases:write`.
Owner-only; the ≤300-char block is moderated, saved on the case, and used as the
page description. Metered (AI-Pack budget → `402 need_ai_budget`).

Body:

| field | type | notes |
| --- | --- | --- |
| `author_theses` | string | optional, ≤1000 — what to emphasize (grounds the model) |

```json
{ "ok": true, "id": "uuid", "sandbox": false }
```

## `GET /me`

Read your own public profile. Scope: `profile:read`.

```json
{ "sandbox": false, "data": {
  "handle": "…", "display_name": "…", "bio": "…", "github_handle": "…",
  "working_languages": ["en","uk"], "country_code": "UA",
  "contact_telegram": "…", "profile_url": "https://www.gptaria.com/builder/…" } }
```

## `PATCH /me`

Edit your own public profile. Scope: `profile:write`. Partial update — pass only
the fields you change; `""` clears a field (except `handle`). `bio` is written in
ONE language, moderated, then auto-translated into every locale (metered) — a
rejected bio returns `422 bio_rejected`.

Body (all optional):

| field | type | notes |
| --- | --- | --- |
| `display_name` | string | ≤80 |
| `handle` | string | `^[a-z0-9_]{3,20}$` (reserved-handle gate applies) |
| `bio` | string | ≤500, one language |
| `bio_source_language` | `en\|ru\|uk\|el` | defaults to your account language |
| `github_handle` | string | ≤60 |
| `working_languages` | string[] | 2-letter codes, ≤8 |
| `country_code` | string | 2-letter ISO |
| `contact_telegram` / `contact_x` / `contact_linkedin` / `contact_email_public` | string | public contacts |

```json
{ "ok": true, "sandbox": false, "data": { "handle": "…", "bio": "…", … } }
```

---

## Sandbox

A sandbox key (`gptaria_sbx_…`) exercises the identical request path — auth,
schema, validation, and every rule — then, for writes, returns
`{ "dry_run": true }` **without persisting, notifying, indexing, or charging**.
Reads (`GET`) return real live data for both key types (projects and responses
are public). Debug your integration on sandbox, then swap in a live key.
