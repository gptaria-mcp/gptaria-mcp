# Getting started

Connect an AI assistant to GPTaria in three steps.

## 1. Create an API key

Go to **https://www.gptaria.com/settings** → *API keys* and create a key.

- The **raw key is shown once** — copy it and store it as an environment variable
  (`GPTARIA_API_KEY`). Never commit it.
- Pick **sandbox** while you build: a `gptaria_sbx_…` key runs every real
  validation and rule check but **persists nothing** and never charges — write
  calls return `{ "dry_run": true }`. Switch to a `gptaria_live_…` key when ready.

Scopes a key carries: `projects:read`, `projects:write`, `responses:write`,
`cases:write`, `profile:read`, `profile:write`. A call missing the needed scope
returns `403 forbidden`.

## 2. Run the MCP server

```bash
git clone https://github.com/gptaria-mcp/gptaria-mcp.git
cd gptaria-mcp/mcp-server
npm install
GPTARIA_API_KEY=gptaria_sbx_xxx node index.mjs
# → "GPTaria MCP server ready → https://www.gptaria.com"
```

## 3. Point your assistant at it

Add the server to your MCP client config, using the **absolute path** to
`index.mjs`:

```json
{
  "mcpServers": {
    "gptaria": {
      "command": "node",
      "args": ["/absolute/path/to/gptaria-mcp/mcp-server/index.mjs"],
      "env": {
        "GPTARIA_API_KEY": "gptaria_sbx_xxx",
        "GPTARIA_BASE_URL": "https://www.gptaria.com"
      }
    }
  }
}
```

- **Claude Desktop** — `claude_desktop_config.json` (Settings → Developer → Edit Config)
- **Claude Code** — `.mcp.json` in your project, or `claude mcp add`
- **Cursor** — Settings → MCP → Add Server
- **Windsurf** — `mcp_config.json`

Restart the client. You should now see the `gptaria` tools.

## 4. (Optional) install the skills

The [skills](../skills) turn the tools into guided workflows the assistant loads
automatically when your request matches. Copy the folders you want into your
assistant's skills directory (e.g. `~/.claude/skills/`).

## The tools

Ask your assistant in plain language, or call the tools directly. The full set:

| Tool | For | What it does |
| --- | --- | --- |
| `list_projects` | anyone | List open ("brewing") projects |
| `list_responses` | anyone | List a project's responses (proposals) |
| `list_project_comments` | anyone | List a project's client clarifications |
| `create_project` | clients | Publish a brief via a €10 Pro order — returns a `checkout_url` (see [pro-order.md](./pro-order.md)) |
| `create_project_comment` | clients | Add a public clarification to your OWN brief (owner-only) |
| `create_response` | builders | Submit a response to a project (needs an active access pass) |
| `create_case` | builders | Publish a portfolio case (draft by default) |
| `generate_case_summary` | builders | Generate a case's AI summary block from your editor |
| `get_profile` / `update_profile` | anyone | Read / edit your own public profile |

Debug the whole surface on a **sandbox** key first — every write returns
`{ "dry_run": true }` without persisting or charging. Prefer plain HTTP? Every
tool maps to a REST endpoint — see [api.md](./api.md).
