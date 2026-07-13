# Security Policy

## Reporting a vulnerability

**Please do not open a public issue for security vulnerabilities.**

Report privately via GitHub's **[Security Advisories](../../security/advisories/new)**
("Report a vulnerability" on the Security tab), or through the contact on
[gptaria.com](https://www.gptaria.com). We aim to acknowledge within a few
business days and will keep you updated on the fix.

Please include:

- what the issue is and its impact,
- steps to reproduce (or a proof of concept),
- affected version / commit.

## Scope

This repository is the **client surface**: the MCP server (`mcp-server/`), the
skills, and docs. The MCP server is a thin wrapper over the GPTaria REST API — it
adds no authorization logic of its own; all access rules are enforced server-side
by the platform.

For issues in the **GPTaria platform or API itself**, report through
[gptaria.com](https://www.gptaria.com).

## Handling API keys

- Never commit an API key. Keep `GPTARIA_API_KEY` in an environment variable.
- Use **sandbox** keys (`gptaria_sbx_…`) for development — they persist nothing
  and never charge.
- Rotate or revoke keys anytime in Settings → API keys.
