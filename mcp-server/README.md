# GPTaria MCP server

An [MCP](https://modelcontextprotocol.io) server that exposes the GPTaria REST
API to AI assistants (Claude Code, Claude Desktop, Cursor, Windsurf, …) over
stdio.

## Tools

- `list_projects` — list open projects (briefs) you can respond to
- `list_responses` — list the responses on a project, to work on them in your AI
- `create_project` — publish a project brief via a Pro order (clients)
- `create_response` — submit a response to a project (builders)
- `create_case` — publish a portfolio case (draft by default)

## Setup

```bash
npm install
GPTARIA_API_KEY=gptaria_live_xxx GPTARIA_BASE_URL=https://www.gptaria.com node index.mjs
```

| Env var | Default | Notes |
| --- | --- | --- |
| `GPTARIA_API_KEY` | — (required) | Your key from Settings → API keys. A **sandbox** key (`gptaria_sbx_…`) validates without persisting. |
| `GPTARIA_BASE_URL` | `https://www.gptaria.com` | Override only for self-hosted / testing. |

Create an API key at **https://www.gptaria.com/settings** → *API keys*. The raw
key is shown once — store it in an env var, never commit it.

## Connect it to your assistant

`claude_desktop_config.json` (Claude Desktop) / `.mcp.json` (Claude Code) /
Cursor MCP settings:

```json
{
  "mcpServers": {
    "gptaria": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/index.mjs"],
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
