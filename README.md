# GPTaria MCP

Connect your AI assistant (Claude Code, Claude Desktop, Cursor, Windsurf, …) to
[GPTaria](https://www.gptaria.com) — publish projects, respond to them, and
publish portfolio cases straight from your editor.

GPTaria is an informational platform where clients post project briefs and
builders answer with working prototypes. This repo is the **developer surface**:
an [MCP](https://modelcontextprotocol.io) server that wraps the GPTaria REST API,
plus ready-to-install [Agent Skills](./skills) that turn the tools into guided
workflows.

```
REST API  →  MCP server  →  Agent skills
(foundation)  (AI tools)     (guided workflows)
```

## Tools

| Tool | For | What it does |
| --- | --- | --- |
| `list_projects` | anyone | List open projects (briefs) you can respond to |
| `list_responses` | clients | List a project's responses, to work on them in your own AI |
| `create_project` | clients | Publish a project brief via a Pro order (€10) |
| `create_response` | builders | Submit a response (proposal) to a project |
| `create_case` | builders | Publish a portfolio case (draft by default) |

Every tool enforces the **same rules as the website** — account role, active
access pass, the Super-Expert window, and payment where required. There is no
bypass path; test against a **sandbox** key first.

## Quick start

1. **Create an API key** at [gptaria.com/settings](https://www.gptaria.com/settings)
   → *API keys*. The raw key is shown once — store it as `GPTARIA_API_KEY`.
   - Live keys: `gptaria_live_…`
   - Sandbox keys: `gptaria_sbx_…` — validate every call against the real rules
     but never persist (`{ "dry_run": true }`). Debug safely, then switch to live.
2. **Run the MCP server** and point your assistant at it:
   ```bash
   cd mcp-server
   npm install
   GPTARIA_API_KEY=gptaria_live_xxx node index.mjs
   ```
   See [docs/getting-started.md](./docs/getting-started.md) for the Claude
   Desktop / Claude Code / Cursor config.
3. **Install the skills** (optional convenience layer) — copy the folders you
   want from [`skills/`](./skills) into your assistant's skills directory.

No MCP? Every endpoint is a plain REST call too — see
[docs/api.md](./docs/api.md) and [examples/curl.md](./examples/curl.md).

## Contents

- [`mcp-server/`](./mcp-server) — the MCP server (Node, stdio) and its setup
- [`skills/`](./skills) — three Agent Skills (publish a project, submit a
  response, publish a case)
- [`docs/`](./docs) — [getting started](./docs/getting-started.md),
  [REST API reference](./docs/api.md), [the Pro order flow](./docs/pro-order.md)
- [`examples/`](./examples) — MCP client config + curl examples

## Links

- Platform: **https://www.gptaria.com**
- MCP: **https://modelcontextprotocol.io**

## License

[MIT](./LICENSE)
