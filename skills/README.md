# GPTaria skills

Three [Agent Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills)
that let an AI assistant (Claude Code, Claude Desktop, Cursor, Windsurf, …) work
with [GPTaria](https://www.gptaria.com) — publish projects, respond to them, and
publish portfolio cases — straight from your editor.

| Skill | For | What it does |
| --- | --- | --- |
| [`gptaria-publish-project`](./gptaria-publish-project/SKILL.md) | Clients | Publish a project brief, then analyze the responses you receive |
| [`gptaria-submit-response`](./gptaria-submit-response/SKILL.md) | Builders | Assemble a response from your own code/past work and submit it |
| [`gptaria-publish-case`](./gptaria-publish-case/SKILL.md) | Builders | Publish a dev.to-style portfolio case |

Each skill wraps the **GPTaria MCP server** (`../mcp-server`), which in turn wraps
the **REST API v1**. Layering: `REST API → MCP server → skill`
(see [../docs/api.md](../docs/api.md)).

## One-time setup

1. **Create an API key** at [Settings → API keys](https://www.gptaria.com/settings).
   The raw key is shown once — store it as `GPTARIA_API_KEY`.
   - Live keys: `gptaria_live_…` (persist).
   - Sandbox keys: `gptaria_sbx_…` — every call is validated against the real gates
     but **nothing is persisted** (`{ "dry_run": true }`). Debug your automation
     safely, then switch to a live key.
2. **Connect the MCP server.** Install once (`cd mcp-server && npm install`), then add
   it to your MCP client. Example (`claude_desktop_config.json` / Claude Code
   `.mcp.json`):
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
3. **Install the skills.** Copy the folders you want into your skills directory
   (`~/.claude/skills/` or a project's `.claude/skills/`), or install this repo as a
   plugin. The assistant loads a skill automatically when your request matches its
   `description`.

## Tools exposed by the MCP server

| Tool | Scope | Notes |
| --- | --- | --- |
| `list_projects()` | `projects:read` | Open projects you can respond to |
| `list_responses({ project_id })` | `projects:read` | Responses on a project (for analysis) |
| `create_project({ … })` | `projects:write` | Publish a brief (clients only) |
| `create_response({ … })` | `responses:write` | Respond to a project (builders only) |
| `create_case({ … })` | `cases:write` | Publish a portfolio case (draft by default) |

The API enforces the **same gates as the website** — account role, active access
pass, the 3-hour Super Expert window, and the AI-token balance required for
auto-translation. There is no bypass path; test against a sandbox key first.

## No REST-only? You can skip the MCP

Every skill also lists the plain REST call, so a bot that calls the API directly
works too:

```bash
curl -H "Authorization: Bearer $GPTARIA_API_KEY" https://www.gptaria.com/api/v1/projects
```
