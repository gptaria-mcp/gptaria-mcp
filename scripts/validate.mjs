#!/usr/bin/env node
/**
 * Repo validation — run in CI and locally (`node scripts/validate.mjs`).
 * Checks JSON files parse and every skill has valid frontmatter.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';

let errors = 0;
const fail = (msg) => {
  console.error(`✗ ${msg}`);
  errors++;
};
const ok = (msg) => console.log(`✓ ${msg}`);

// 1) JSON files parse.
for (const f of ['mcp-server/package.json', 'examples/claude-desktop.json']) {
  if (!existsSync(f)) {
    fail(`missing ${f}`);
    continue;
  }
  try {
    JSON.parse(readFileSync(f, 'utf8'));
    ok(`JSON valid: ${f}`);
  } catch (e) {
    fail(`JSON invalid: ${f} — ${e.message}`);
  }
}

// 2) Every skill folder has a SKILL.md with valid frontmatter.
const skillsDir = 'skills';
for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const dir = entry.name;
  const path = `${skillsDir}/${dir}/SKILL.md`;
  if (!existsSync(path)) {
    fail(`${dir}: no SKILL.md`);
    continue;
  }
  const md = readFileSync(path, 'utf8');
  const fm = md.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) {
    fail(`${dir}: no YAML frontmatter`);
    continue;
  }
  const name = (fm[1].match(/^name:\s*(.+)$/m) || [])[1]?.trim();
  const desc = (fm[1].match(/^description:\s*(.+)$/m) || [])[1]?.trim();
  if (name !== dir) fail(`${dir}: frontmatter name "${name}" must equal the folder name`);
  else if (!/^[a-z0-9-]{1,64}$/.test(name)) fail(`${dir}: name must be kebab-case (a-z 0-9 -)`);
  else if (!desc) fail(`${dir}: missing description`);
  else if (desc.length > 1024) fail(`${dir}: description > 1024 chars`);
  else ok(`skill valid: ${dir}`);
}

if (errors) {
  console.error(`\n${errors} problem(s) found.`);
  process.exit(1);
}
console.log('\nAll checks passed.');
