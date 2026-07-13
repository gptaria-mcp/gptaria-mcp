---
name: gptaria-submit-response
description: Draft and submit a response (proposal) to an open GPTaria project from your editor, assembled from your own code, past work, and prototypes. Use when a builder wants to respond to a GPTaria project brief with a concrete approach rather than a generic pitch. Requires a GPTaria builder account with an active access pass and an API key.
---

# Respond to a GPTaria project

This skill is the **builder** side: find an open project and submit a response built
from your own code and past work — without leaving your editor.

## When to use
- A builder wants to respond to an open GPTaria project.
- Pattern: "this task is like the one I solved in repo A; take the auth part from
  project B; add these screenshots" → assemble a response draft from the builder's
  own material and submit it.

## Prerequisites
- A GPTaria **builder account**. Clients cannot respond — a client key returns
  `403 not_builder`.
- An **active access pass** (Day Pass / 30-day Pass / Super Expert). No pass →
  `402 need_access`.
- Mind the **Super Expert window**: for the first 3 hours after a project is posted,
  only Super Experts may respond (`403 super_expert_window`). Either wait out the
  window or hold a Super Expert pass.
- An **API key** (Settings → API keys). Sandbox keys (`gptaria_sbx_…`) run every gate
  but never persist — dry-run first.

## Tools
With the GPTaria MCP server connected:
- `list_projects()`
- `create_response({ project_id, source_message, source_language, budget_cents?, budget_currency? })`

REST equivalents (header `Authorization: Bearer $GPTARIA_API_KEY`):
- `GET  /api/v1/projects`
- `POST /api/v1/projects/:id/responses`

## Workflow
1. `list_projects()` → choose the project; keep its `id`.
2. **Assemble the response body** (`source_message` — Markdown, 50–5000 chars) from
   the builder's real material, not boilerplate:
   - the concrete approach to *this* brief;
   - relevant snippets or links from the builder's own repos / past cases;
   - a link to a working prototype if one exists.
   Write it in the builder's language (`source_language`: `en | ru | uk`). It is
   auto-translated into the platform languages after submission.
3. *(Optional)* quote a price with `budget_cents` (integer, minor units) +
   `budget_currency` (`EUR | USD | UAH`). Remember: money for the work is settled
   **directly, off-platform** — this field is only an indicative quote.
4. **Dry-run with a sandbox key** → `{ "dry_run": true }` means every gate passed
   (role, pass, window). Then submit with the live key → `{ "ok": true, "id": "…" }`.
5. The project's client is notified automatically.

## Guardrails
- One honest, specific response per project — no spam or duplicate submissions.
- Never put secrets in the body (no API keys / tokens / credentials in snippets).
- The response is public and auto-translated; write it to be read by the client in
  their own language.
- Do not fabricate experience or prototypes you cannot back up.
