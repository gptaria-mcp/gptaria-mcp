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

// Don't exit when the key is missing — the server still starts and exposes
// `tools/list` so registries/scanners (Smithery, etc.) can enumerate the tools.
// A tool CALL without a key fails with a clear, actionable message.
if (!API_KEY) {
  console.error(
    'GPTARIA_API_KEY is not set — tools are listed but calls will fail. ' +
      'Get a key at https://www.gptaria.com/settings → API keys.',
  );
}

async function api(path, init = {}) {
  if (!API_KEY) {
    throw new Error(
      'Set GPTARIA_API_KEY (a gptaria_live_… or gptaria_sbx_… key) to use this tool — ' +
        'get one at https://www.gptaria.com/settings → API keys.',
    );
  }
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

const server = new McpServer(
  { name: 'gptaria', title: 'GPTaria MCP', version: '0.2.2' },
  {
    instructions:
      'Post a project brief, respond with a working prototype, and publish portfolio ' +
      'cases on GPTaria (https://www.gptaria.com) from your AI editor. Tools cover ' +
      'listing/creating projects, responses, clarifications, cases, and your profile. ' +
      'Set GPTARIA_API_KEY (Settings → API keys); a gptaria_sbx_… key is safe for testing.',
  },
);

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

server.registerTool(
  'list_project_comments',
  {
    title: 'List a project’s clarifications',
    description:
      'List the client’s clarifications on a project (updates the owner added to the brief — a logo, design wishes, a reference). Public read.',
    inputSchema: {
      project_id: z.string().describe('Project (storm) UUID from list_projects'),
    },
  },
  async ({ project_id }) => ok(await api(`/projects/${project_id}/comments`)),
);

server.registerTool(
  'create_project_comment',
  {
    title: 'Add a clarification to your project',
    description:
      'As the project’s client, add a public clarification to your own brief (a logo, design wishes, a reference) that every viewer sees — so builders respond against the latest requirements. Owner-only (the caller must be the project’s client). A sandbox key validates without persisting.',
    inputSchema: {
      project_id: z.string().describe('Your project (storm) UUID'),
      body: z.string().min(1).max(4000).describe('The clarification text'),
    },
  },
  async ({ project_id, ...body }) =>
    ok(await api(`/projects/${project_id}/comments`, { method: 'POST', body: JSON.stringify(body) })),
);

server.registerTool(
  'generate_case_summary',
  {
    title: 'Generate a case summary block',
    description:
      "Generate the AI summary block for one of your cases AFTER you've written it — a grounded ≤300-char 'what this project is' block (plus key facts + entities) built only from the case body. It's moderated, saved on the case (shown on your public profile and as the page's description), and lets the page get indexed once the case is verified. Uses your AI tokens. A sandbox key generates without saving.",
    inputSchema: {
      case_id: z.string().describe('Case UUID (from create_case / your cases)'),
      author_theses: z
        .string()
        .max(1000)
        .optional()
        .describe('Optional: what to emphasize (grounds the model, invents nothing)'),
    },
  },
  async ({ case_id, ...body }) =>
    ok(await api(`/cases/${case_id}/summary`, { method: 'POST', body: JSON.stringify(body) })),
);

server.registerTool(
  'get_profile',
  {
    title: 'Get your profile',
    description:
      'Read your own GPTaria public profile (bio, display name, GitHub, working languages, public contacts, profile URL). Use it before update_profile to see what is already set.',
    inputSchema: {},
  },
  async () => ok(await api('/me')),
);

server.registerTool(
  'update_profile',
  {
    title: 'Update your profile',
    description:
      'Fill out / edit your own GPTaria public profile so people can see who you are and how to reach you. Partial update — pass only the fields you want to change; an empty string clears a field (except handle). Write `bio` in ONE language: the platform moderates it and auto-translates it into every other language (this uses your AI tokens). Avatar photo is set on the website. A sandbox key validates without persisting.',
    inputSchema: {
      display_name: z.string().max(80).optional().describe('Your public display name'),
      handle: z
        .string()
        .regex(/^[a-z0-9_]{3,20}$/)
        .optional()
        .describe('URL handle: 3–20 chars, lowercase letters, digits, underscore'),
      bio: z
        .string()
        .max(500)
        .optional()
        .describe('Short profile description (≤500 chars), in ONE language — auto-translated'),
      bio_source_language: z
        .enum(['en', 'ru', 'uk', 'el'])
        .optional()
        .describe('Language the bio is written in (defaults to your account language)'),
      github_handle: z.string().max(60).optional().describe('GitHub username (with or without @)'),
      working_languages: z
        .array(z.string().regex(/^[a-z]{2}$/))
        .max(8)
        .optional()
        .describe("Spoken languages as 2-letter codes, e.g. ['en','uk']"),
      country_code: z.string().length(2).optional().describe('2-letter ISO country code, e.g. UA'),
      contact_telegram: z.string().max(100).optional().describe('Public Telegram handle'),
      contact_x: z.string().max(100).optional().describe('Public X (Twitter) handle'),
      contact_linkedin: z.string().max(200).optional().describe('Public LinkedIn handle or URL'),
      contact_email_public: z.string().email().max(200).optional().describe('Public contact email'),
    },
  },
  async (body) => ok(await api('/me', { method: 'PATCH', body: JSON.stringify(body) })),
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`GPTaria MCP server ready → ${BASE_URL}`);
