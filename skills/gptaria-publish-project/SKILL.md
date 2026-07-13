---
name: gptaria-publish-project
description: Publish a project brief to GPTaria from your own AI via a €10 Pro order, then pull the builder responses over MCP and work on them in your own assistant. Use when a client has worked out an idea — often already developed with an AI in this editor — and wants to post it as a GPTaria project and collect prototype responses without leaving the editor. Requires a GPTaria client account and an API key.
---

# Publish a GPTaria project (Pro order) and pull responses

[GPTaria](https://www.gptaria.com) is an informational platform where clients post
project briefs and builders respond with working prototypes. This skill is the
**client "Pro order"** flow: post a brief you worked out with your own AI, pay the
€10 publication fee, then pull the responses over MCP and build on them here.

## When to use
- The user has an idea (often already developed with an AI in this editor) and wants
  it posted on GPTaria without re-typing it into the web form.
- The user wants to pull the responses a project received and work on them (compare,
  pick, implement) in their own assistant.

## What the €10 Pro order gives you
- **Programmatic publishing** — post the brief straight from your AI (no re-typing).
- **Auto-translation into every platform language is bundled** into the €10 (you are
  *not* charged AI tokens for it).
- After it goes live, **pull the responses over MCP** and work on them here. GPTaria
  does **not** analyze responses for you — that happens in your own assistant.

Manual publishing via the website form stays free; the €10 is for the programmatic
path (it's also the anti-spam gate on the write API).

## Prerequisites
- A GPTaria **client account** (role: project-starter). Builders cannot publish — a
  builder key returns `403 not_starter`.
- An **API key** from Settings → API keys, stored as `GPTARIA_API_KEY`.
- Ability to complete a **€10 / 399 UAH checkout** in a browser (card / Apple Pay /
  Google Pay; PayPal via Paddle internationally). You (the user) pay — the assistant
  never enters payment details.

## Tools
With the GPTaria MCP server connected:
- `create_project({ title, description, source_language, budget?, category? })`
- `list_responses({ project_id })`
- `list_projects()`

REST equivalents (header `Authorization: Bearer $GPTARIA_API_KEY`):
- `POST /api/v1/projects`
- `GET  /api/v1/projects/:id/responses`
- `GET  /api/v1/projects`

## Workflow — publish a project
1. **Write the brief in ONE language** (the source language), in the user's own
   words. GPTaria does not generate the brief — your model does.
   - `title` — 10–200 chars, concrete (what to build).
   - `description` — 50–2000 chars: the goal, the must-haves, what "done" looks like.
     Name real tools where relevant (Cursor, Claude, Bolt, Lovable, …).
   - `source_language` — `en | ru | uk | el`.
   - `budget` *(optional)* — a whole number in the poster's currency (`uk` → UAH,
     else EUR). Omit for "negotiable".
   - `category` *(optional)* — `software | video | audio | image | content |
     marketing | social | other`.
2. **Show the user the final title + description and get explicit confirmation** —
   this starts a €10 payment and, once paid, publishes publicly.
3. Call `create_project`. It returns a **draft** and a `payment.checkout_url`:
   ```json
   { "ok": true, "id": "…", "slug": "…", "status": "draft",
     "payment": { "service": "pro_order", "amount_cents": 39900, "currency": "UAH",
                  "checkout_url": "https://…" } }
   ```
   The project is **not public yet.**
4. **Give the user the `checkout_url` to open and pay €10.** Do not attempt to pay
   for them. After payment the project auto-publishes (public, translated) and
   builders can respond.
5. Keep the `id` — you need it to pull responses.

## Workflow — pull and work on responses
1. `list_responses({ project_id })` → `{ builder, source_message, budget_cents,
   budget_currency, prototype_url, github_url, is_selected, created_at }[]`.
2. **Work on them here, in the user's own assistant** — summarize each approach,
   compare stacks, help the user pick, and help implement/build from a chosen
   prototype. (This is the point of the Pro order — the responses come to your
   editor.)
3. `is_selected: true` marks a builder the client has already picked.

## Guardrails
- **Never call `create_project` without explicit confirmation** — it starts a €10
  charge and leads to a public post. Show the final brief first.
- **Never enter payment details** — hand the `checkout_url` to the user.
- Keep the brief in the user's own words; do not invent requirements.
- Payment for the work is arranged **directly with the builder, off-platform** —
  GPTaria never handles money for the work.
- Do not post prohibited content (violence/weapons, drugs, hacking, fraud, CSAM, …).
