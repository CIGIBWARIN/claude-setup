#!/usr/bin/env node
// Fast checks that need no Claude sign-in: syntax, JSON, list consistency and hook behavior.
// Runs on every push (.github/workflows/check.yml); run it locally with `node evals/check.mjs`.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const hooks = path.join(repo, 'plugins', 'ingot', 'hooks');
const problems = [];
const check = (ok, what) => { if (!ok) problems.push(what); };
const lines = (f) => fs.readFileSync(path.join(repo, f), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));

// Syntax of every script.
for (const f of ['setup.mjs', 'evals/run.mjs', 'evals/check.mjs', ...fs.readdirSync(hooks).map((h) => `plugins/ingot/hooks/${h}`)]) {
  if (!f.endsWith('.mjs')) continue;
  const r = spawnSync(process.execPath, ['--check', path.join(repo, f)], { encoding: 'utf8' });
  check(r.status === 0, `${f} has a syntax error: ${r.stderr.trim().split('\n')[0]}`);
}

// JSON files Claude Code or the installer read.
for (const f of ['settings.json', 'package.json', '.claude-plugin/marketplace.json', 'plugins/ingot/.claude-plugin/plugin.json', 'plugins/ingot/hooks/hooks.json']) {
  try { JSON.parse(fs.readFileSync(path.join(repo, f), 'utf8')); } catch (e) { problems.push(`${f} is not valid JSON: ${e.message}`); }
}

// Every plugin's marketplace is declared, and nothing is both shipped and retired.
const markets = new Set(lines('marketplaces.txt').map((l) => l.split(/\s+/)[0]));
for (const p of lines('plugins.txt')) check(markets.has(p.split('@')[1]), `plugins.txt: ${p} has no marketplace in marketplaces.txt`);
for (const p of lines('retired.txt')) check(!lines('plugins.txt').includes(p), `${p} is in both plugins.txt and retired.txt`);

// Hooks, run the way Claude Code runs them, in a throwaway code project.
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ingot-check-'));
const home = path.join(root, 'home'), tmp = path.join(root, 'project');
fs.mkdirSync(home);
fs.mkdirSync(tmp);
fs.writeFileSync(path.join(tmp, 'app.py'), '');
const hook = (file, args, input, env = {}) => {
  const clean = { ...process.env, HOME: home, USERPROFILE: home, CLAUDE_CODE_DESKTOP_APP_VERSION: '', INGOT_STYLE: '', INGOT_COACH: '', INGOT_CATEGORY: '', ...env };
  const r = spawnSync(process.execPath, [path.join(hooks, file), ...args], { cwd: tmp, input: JSON.stringify(input), encoding: 'utf8', env: clean });
  try { return JSON.parse(r.stdout).hookSpecificOutput.additionalContext; } catch { return ''; }
};
for (const [surface, expect, absent] of [['cli', '`/plan <task>`', 'mode menu'], ['claude-desktop', 'mode menu', '`/plan <task>`']]) {
  for (const coach of ['light', 'full', 'extra']) {
    const c = hook('session-rules.mjs', [], { source: 'startup' }, { CLAUDE_CODE_ENTRYPOINT: surface, INGOT_COACH: coach, INGOT_STYLE: 'core' });
    check(c.includes('## Working rules'), `session hook (${surface}, ${coach}): no working rules`);
    check(c.includes('## Coding'), `session hook (${surface}, ${coach}): a code project got no coding rules`);
    check(!/\{(cli|desktop)\}/.test(c), `session hook (${surface}, ${coach}): a {cli}/{desktop} tag was left in`);
    check(c.includes(expect) && !c.includes(absent), `session hook (${surface}, ${coach}): wrong surface's tips`);
    check(c.length < 10000, `session hook (${surface}, ${coach}): ${c.length} chars, over Claude Code's 10,000 limit`);
  }
}
check(hook('session-rules.mjs', ['SubagentStart'], {}).includes('## Working rules'), 'subagent hook: no rules');
check(hook('session-rules.mjs', [], { source: 'startup' }).includes('/ingot:start'), 'session hook: no /ingot:start offer in an untuned project');
check(!hook('session-rules.mjs', [], { source: 'clear' }).includes('/ingot:start'), 'session hook: offer repeated after /clear');
const docGuard = (name) => hook('doc-guard.mjs', [], { tool_input: { file_path: path.join(tmp, name) }, tool_response: { type: 'create' } });
check(docGuard('SUMMARY.md').includes('documentation file'), 'doc-guard: no reminder for SUMMARY.md');
check(!docGuard('notes.txt'), 'doc-guard: reminder for an ordinary file');
// A project's first file in docs/ is suspect; docs/ folders a project maintains, and archived copies, are not.
fs.mkdirSync(path.join(tmp, 'docs'));
fs.writeFileSync(path.join(tmp, 'docs', 'guide.md'), '');
check(docGuard('docs/guide.md').includes('documentation file'), 'doc-guard: no reminder for the first file in a new docs/ folder');
fs.mkdirSync(path.join(tmp, 'docs', 'archive', '2026-10-10'), { recursive: true });
fs.writeFileSync(path.join(tmp, 'docs', 'STATUS.md'), '');
check(!docGuard('docs/STATUS.md'), 'doc-guard: reminder in a docs/ folder the project maintains');
check(!docGuard('docs/archive/2026-10-10/progress-notes.md'), 'doc-guard: reminder for an archived copy');
check(/asked, including any files or tests it names/.test(hook('session-rules.mjs', ['SubagentStart'], {})), 'subagent rules: helpers may not write the tests they were asked for');
fs.rmSync(root, { recursive: true, force: true });

if (problems.length) {
  console.log(`${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('All checks passed.');
