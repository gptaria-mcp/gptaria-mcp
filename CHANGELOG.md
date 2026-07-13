# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
