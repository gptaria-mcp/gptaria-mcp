# GPTaria MCP server

**Post a project brief, respond with a working prototype, and publish portfolio
cases on [GPTaria](https://www.gptaria.com) — straight from Claude Code, Claude
Desktop, Cursor or Windsurf.** An [MCP](https://modelcontextprotocol.io)
(Model Context Protocol) server that wraps the GPTaria REST API v1 over stdio, so
your AI assistant can publish and work on projects **without leaving the editor**.

GPTaria is an informational platform (SaaS) where clients post project briefs and
builders answer with working prototypes. Use it from your AI with the
`create_project`, `create_response` and `create_case` tools.

## Tools

- `list_projects` — list open project briefs you can respond to
- `list_responses` — list a project's responses (proposals), to work on in your AI
- `list_project_comments` — list a client's clarifications on a project
- `create_project` — publish a project brief from your AI (Pro order)
- `create_project_comment` — add a public clarification to your own brief
- `create_response` — respond to a project with your approach + a working prototype
- `create_case` — publish a portfolio case (dev.to-style Markdown)
- `generate_case_summary` — generate a case's AI summary block from your editor
- `get_profile` / `update_profile` — read / edit your own public profile

## Setup

```bash
npm install
GPTARIA_API_KEY=gptaria_live_xxx GPTARIA_BASE_URL=https://www.gptaria.com node index.mjs
```

Or run it straight from npm with no clone:

```bash
GPTARIA_API_KEY=gptaria_sbx_xxx npx -y gptaria-mcp
```

| Env var | Default | Notes |
| --- | --- | --- |
| `GPTARIA_API_KEY` | — (required) | Your key from Settings → API keys. A **sandbox** key (`gptaria_sbx_…`) validates without persisting. |
| `GPTARIA_BASE_URL` | `https://www.gptaria.com` | Override only for self-hosted / testing. |

Create an API key at **https://www.gptaria.com/settings** → *API keys*. The raw
key is shown once — store it in an env var, never commit it.

## Connect it to Claude Code / Claude Desktop / Cursor / Windsurf

`claude_desktop_config.json` (Claude Desktop) / `.mcp.json` (Claude Code) /
Cursor or Windsurf MCP settings:

```json
{
  "mcpServers": {
    "gptaria": {
      "command": "npx",
      "args": ["-y", "gptaria-mcp"],
      "env": {
        "GPTARIA_API_KEY": "gptaria_live_xxx",
        "GPTARIA_BASE_URL": "https://www.gptaria.com"
      }
    }
  }
}
```

See [../docs/getting-started.md](../docs/getting-started.md) for the full walk-through.

## How it works

The server is a thin wrapper: each tool calls the matching
`https://www.gptaria.com/api/v1/*` endpoint with your key as a bearer token, and
returns the JSON. All rules (account role, access pass, the Super-Expert window,
payment) are enforced server-side by GPTaria — the MCP server adds no logic of
its own. Full endpoint reference: [../docs/api.md](../docs/api.md).

**Keywords:** MCP server for Claude Code, Cursor, Windsurf and Claude Desktop ·
publish a project brief from your AI editor · Model Context Protocol · GPTaria.
