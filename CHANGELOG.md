# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Project clarifications: `list_project_comments` and `create_project_comment`
  tools (and `GET`/`POST /api/v1/projects/:id/comments`). A client can add a
  public clarification to their own brief — a logo, design wishes, a reference —
  that every viewer sees, straight from their AI. Owner-only write; public read.
- Ported the profile + case-summary tools so the public server matches the full
  surface: `generate_case_summary`, `get_profile`, `update_profile` (and the
  `POST /api/v1/cases/:id/summary`, `GET`/`PATCH /api/v1/me` endpoints + the
  `profile:read`/`profile:write` scopes). The server now exposes all 10 tools.

### Changed

- Skills now instruct the assistant to publish **only through the `gptaria` MCP
  tools** and to never read a source repository / `docs/` to "figure out how it
  works". Added a fallback: when the tools aren't available, tell the user to
  connect the MCP server (plugin or `npx`) instead of inspecting files — so a
  first-time user with only the plugin installed gets a clean path.

## [0.1.0] — 2026-07-13

Initial public release.

### Added

- **MCP server** (`mcp-server/`) exposing the GPTaria REST API v1 over stdio,
  with five tools: `list_projects`, `list_responses`, `create_project`,
  `create_response`, `create_case`.
- **Agent Skills** (`skills/`): `gptaria-publish-project`,
  `gptaria-submit-response`, `gptaria-publish-case`.
- **Docs** (`docs/`): getting started, REST API reference, and the Pro-order
  publish flow. `examples/` with an MCP client config and curl snippets.
- Sandbox support: `gptaria_sbx_…` keys validate every call against the real
  rules without persisting or charging.

[Unreleased]: https://github.com/gptaria-mcp/gptaria-mcp/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/gptaria-mcp/gptaria-mcp/releases/tag/v0.1.0
