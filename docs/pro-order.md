# Publishing a project — the Pro order

Clients publish a project brief **programmatically, straight from their own AI**
via a **Pro order** (€10 / 399 ₴). You work out the idea with your assistant,
post it to GPTaria without re-typing, then pull the responses back over MCP and
work on them in the same assistant.

> Manual publishing through the website form stays free. The €10 is for the
> programmatic path — it's also the anti-spam gate on the write API.

## What the €10 covers

- Publishing the brief from your AI (no re-typing into a web form).
- **Auto-translation of the brief into every platform language is bundled** — you
  are not charged separately for it.
- After it goes live, pull the responses over MCP and work on them in your own
  assistant. (GPTaria does not analyze responses for you — that happens in your
  AI.)

## Flow

```
create_project ──▶ draft + checkout_url ──▶ you pay €10 ──▶ project goes live
                                                              │
list_responses ◀── builders respond ◀─────────────────────────┘
```

1. **`create_project`** (MCP) or **`POST /api/v1/projects`** (REST) creates the
   brief as a private **draft** and returns a `payment.checkout_url`. The project
   is **not public yet**.

   ```json
   { "ok": true, "id": "uuid", "slug": "…", "status": "draft",
     "payment": { "service": "pro_order", "amount_cents": 39900,
                  "currency": "UAH", "checkout_url": "https://…" } }
   ```

2. **Open `checkout_url` and pay** (card / Apple Pay / Google Pay; PayPal
   internationally). Your assistant hands you the link — it never enters payment
   details.

3. On payment the project **auto-publishes** (public, translated) and builders
   can respond. Keep the `id`.

4. **`list_responses({ project_id })`** — pull the proposals and work on them
   (compare, pick, implement) in your own assistant.

## Writing a good brief

- `title` (10–200) — concrete: what to build.
- `description` (50–2000) — the goal, the must-haves, what "done" looks like.
  Name the tools you'd expect (Cursor, Claude, Bolt, Lovable, …).
- `source_language` — the language you wrote it in (`en | ru | uk | el`).
- `budget` (optional) — a number in your currency; omit for "negotiable".

## Notes

- Payment for the actual work is arranged **directly with the builder,
  off-platform** — GPTaria never handles money for the work.
- Prohibited content (violence/weapons, drugs, hacking, fraud, …) is not allowed.
- Test the whole flow first with a **sandbox** key — `create_project` then
  returns a validation result without creating a draft or a charge.
