---
name: gptaria-publish-case
description: Publish a portfolio case study to GPTaria in dev.to-style Markdown, generated from your project's code, description, and screenshots. Use when a builder has finished work and wants to turn it into a public, SEO-indexed case on their GPTaria profile. Requires a GPTaria builder account and an API key.
---

# Publish a GPTaria case

Turn finished work into a **case** — a dev.to-style Markdown article on the builder's
GPTaria profile. Cases are public, SEO-indexed, and serve as portfolio proof.

> **Publish through the `gptaria` MCP tool — don't read the GPTaria source to do it.**
> To publish, just call `create_case`. Never open, clone, or search the GPTaria or
> `gptaria-mcp` repositories, `docs/`, or other `SKILL.md` files to "figure out how it
> works" — you don't need them. (Reading the builder's OWN project code to write the
> case is fine — that's the content you're describing.)
>
> **If the GPTaria tools aren't available in this session,** the MCP server isn't
> connected. Don't hand-craft API calls from source — tell the user to connect it
> (`/plugin marketplace add gptaria-mcp/gptaria-mcp` → `/plugin install gptaria-mcp`,
> or add `npx -y gptaria-mcp` with `GPTARIA_API_KEY` to the MCP config —
> https://github.com/gptaria-mcp/gptaria-mcp), then retry.

## When to use
- A builder finished a project and wants to publish it as a case from the editor.
- Generate the write-up from the repo + a short description + screenshots.

## Prerequisites
- A GPTaria **builder account** and an **API key** (Settings → API keys), stored as
  `GPTARIA_API_KEY`.
- Sandbox keys (`gptaria_sbx_…`) validate without persisting — draft/dry-run first.
- The **Verified** mark on a case is a separate paid product bought in the app; the
  API publishes normal (unverified) cases.

## Tools
With the GPTaria MCP server connected:
- `create_case({ title, body_markdown, description?, tags?, source_language, published })`

REST equivalent (header `Authorization: Bearer $GPTARIA_API_KEY`):
- `POST /api/v1/cases`

## Workflow
1. **Write the case as dev.to-style Markdown** (`body_markdown`, ≥1 char, up to
   ~200,000). A strong structure:
   - the problem / goal,
   - the approach and key decisions,
   - the important code (fenced blocks; name real tools — Cursor, Claude, Bolt, …),
   - the result: screenshots, a prototype/live link, metrics,
   - what you would do next.
2. **Fill the metadata:**
   - `title` — 3–120 chars.
   - `description` *(optional, ≤300)* — the excerpt/summary; auto-derived from the
     body if omitted.
   - `tags` *(optional)* — an array of strings, or a comma-separated string.
   - `source_language` — `en | ru | uk | el`.
   - `published` — defaults to **false** (draft), mirroring dev.to. Set `true` only
     after the user confirms they want it public.
3. **Draft first** (`published: false`). The response includes a `slug`; review it at
   `https://www.gptaria.com/case/<slug>`, then publish once the user approves.
4. Success returns `{ "ok": true, "id": "…", "slug": "…" }`.

## Media
Image upload is a separate step — **host images yourself and embed the hosted URL**
in the Markdown (`![alt](https://…)`). Do not paste base64 blobs into the body.

## Guardrails
- **Do not set `published: true` without explicit confirmation** — a published case
  is public and indexed.
- No secrets or credentials in code blocks.
- Only claim work the builder actually did; cases are a public reputation surface.
