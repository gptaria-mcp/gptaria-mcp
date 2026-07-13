# Contributing

Thanks for your interest in improving **GPTaria MCP** — the MCP server, Agent
Skills, and docs that connect AI assistants to [GPTaria](https://www.gptaria.com).

## Ways to contribute

- **Bugs / ideas** — open an [issue](../../issues). For the MCP server or a skill,
  include your client (Claude Code, Claude Desktop, Cursor, …) and the exact tool
  call or request.
- **Docs** — fixes and clarifications to `docs/`, `README.md`, or the skills are
  always welcome.
- **Code** — improvements to `mcp-server/` or new/updated skills.

## Develop the MCP server

```bash
cd mcp-server
npm install
GPTARIA_API_KEY=gptaria_sbx_xxx node index.mjs
```

Always test with a **sandbox** key (`gptaria_sbx_…`) — every write is validated
against the real rules but persists nothing and never charges. Create a key at
[gptaria.com/settings](https://www.gptaria.com/settings) → *API keys*.

The server is intentionally thin: each tool maps 1:1 to a
[REST endpoint](./docs/api.md). Keep business logic on the server side (GPTaria),
not in the MCP layer.

## Skills

Each skill is a folder under `skills/` with a `SKILL.md` that starts with YAML
frontmatter:

```yaml
---
name: kebab-case-name       # must match the folder name
description: One sentence on WHEN to use it (<= 1024 chars)
---
```

Keep skills accurate to the tools and rules; test the flow end-to-end on sandbox.

## Pull requests

1. Fork and branch from `main`.
2. Keep changes focused; match the existing style.
3. Run the checks locally:
   ```bash
   node --check mcp-server/index.mjs   # server parses
   node scripts/validate.mjs           # JSON + skill frontmatter
   ```
   CI runs the same validation on every PR.
4. Describe **what** and **why** in the PR (the template guides you).

## Conduct

By participating you agree to the [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

Contributions are licensed under the repository's [MIT License](./LICENSE).
