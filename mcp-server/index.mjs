#!/usr/bin/env node
/**
 * GPTaria MCP server (DEVELOPER_PLATFORM.md §2 "the plugin for Claude").
 *
 * Exposes the GPTaria REST API v1 as MCP tools so an AI assistant (Claude
 * Desktop / Claude Code / Cursor / …) can list projects and create responses &
 * cases from the user's editor. Auth is the user's GPTaria API key.
 *
 * Setup:
 *   cd mcp-server && npm install
 *   GPTARIA_API_KEY=gptaria_live_xxx GPTARIA_BASE_URL=https://www.gptaria.com node index.mjs
 * A sandbox key (gptaria_sbx_…) validates without persisting — debug your bot
 * safely. Reads (list_projects) hit real data for both key types.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const API_KEY = process.env.GPTARIA_API_KEY;
const BASE_URL = (process.env.GPTARIA_BASE_URL || 'https://www.gptaria.com').replace(/\/$/, '');

if (!API_KEY) {
  console.error('Set GPTARIA_API_KEY (a gptaria_live_… or gptaria_sbx_… key).');
  process.exit(1);
}

async function api(path, init = {}) {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${body?.error?.code ?? ''}: ${body?.error?.message ?? text}`);
  }
  return body;
}

function ok(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

const server = new McpServer({ name: 'gptaria', version: '0.1.0' });

server.registerTool(
  'list_projects',
  {
    title: 'List open projects',
    description: 'List open GPTaria projects (briefs) you can respond to.',
    inputSchema: {},
  },
  async () => ok(await api('/projects')),
);

server.registerTool(
  'create_project',
  {
    title: 'Publish a project (Pro order)',
    description:
      'Publish a project brief via a Pro order (€10 / 399 UAH). Requires a client account. Creates the project as a draft and returns a `payment.checkout_url` — the user opens it and pays to publish; the €10 covers auto-translation into every platform language. Once live, pull the responses with list_responses and work on them in your own assistant. A sandbox key validates without creating a draft or a charge.',
    inputSchema: {
      title: z.string().min(10).max(200).describe('Project title'),
      description: z.string().min(50).max(2000).describe('What needs to be built'),
      source_language: z.enum(['en', 'ru', 'uk', 'el']).default('en'),
      budget: z.number().int().min(0).optional().describe('Whole units of your currency (uk→UAH, else EUR); omit = negotiable'),
      category: z
        .enum(['software', 'video', 'audio', 'image', 'content', 'marketing', 'social', 'other'])
        .optional(),
    },
  },
  async (body) => ok(await api('/projects', { method: 'POST', body: JSON.stringify(body) })),
);

server.registerTool(
  'list_responses',
  {
    title: 'List responses on a project',
    description:
      'List the responses (builder proposals) on a project so you can analyse, compare, and rank them. Reads are live for both key types.',
    inputSchema: {
      project_id: z.string().describe('Project (storm) UUID from list_projects'),
    },
  },
  async ({ project_id }) => ok(await api(`/projects/${project_id}/responses`)),
);

server.registerTool(
  'create_response',
  {
    title: 'Create a response',
    description:
      'Submit a response to a project. Markdown body (≥50 chars). Requires a builder account with an active access pass. A sandbox key validates without persisting.',
    inputSchema: {
      project_id: z.string().describe('Project (storm) UUID from list_projects'),
      source_message: z.string().min(50).describe('Markdown response body'),
      source_language: z.enum(['en', 'ru', 'uk']).default('en'),
      budget_cents: z.number().int().positive().optional(),
      budget_currency: z.enum(['EUR', 'USD', 'UAH']).optional(),
    },
  },
  async ({ project_id, ...body }) =>
    ok(await api(`/projects/${project_id}/responses`, { method: 'POST', body: JSON.stringify(body) })),
);

server.registerTool(
  'create_case',
  {
    title: 'Create a case',
    description:
      'Create a portfolio case (dev.to-style Markdown). Defaults to a draft; set published:true to publish.',
    inputSchema: {
      title: z.string().min(3).max(120),
      body_markdown: z.string().min(1),
      description: z.string().max(300).optional(),
      tags: z.array(z.string()).optional(),
      source_language: z.enum(['en', 'ru', 'uk', 'el']).default('en'),
      published: z.boolean().default(false),
    },
  },
  async (body) => ok(await api('/cases', { method: 'POST', body: JSON.stringify(body) })),
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`GPTaria MCP server ready → ${BASE_URL}`);
