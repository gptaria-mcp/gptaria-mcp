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
`cases:write`. A call missing the needed scope returns `403 forbidden`.

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

Restart the client. You should now see the five `gptaria` tools.

## 4. (Optional) install the skills

The [skills](../skills) turn the tools into guided workflows the assistant loads
automatically when your request matches. Copy the folders you want into your
assistant's skills directory (e.g. `~/.claude/skills/`).

## First calls

Ask your assistant, or call the tools directly:

- *"List the open GPTaria projects"* → `list_projects`
- Builders: *"Respond to project &lt;id&gt; with this approach…"* → `create_response`
- Builders: *"Publish this as a case"* → `create_case`
- Clients: *"Publish this brief to GPTaria"* → `create_project` (see
  [pro-order.md](./pro-order.md))

Prefer plain HTTP? Every tool maps to a REST endpoint — see [api.md](./api.md).
