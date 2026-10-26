// SessionStart / SubagentStart (event name as argv[2]): inject the working rules, the project's category rules,
// coaching, reply style and at most one project offer. Helper agents get only the short subagent rules.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { safeList, isCodeProject } from './project.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, '')); } catch { return {}; } };

// Settings come from env (settings.json "env") or, as a fallback, the settings files themselves.
// Names before the Ingot rename (CLAUDE_SETUP_*) still work.
function setting(name) {
  const keys = [`INGOT_${name}`, `CLAUDE_SETUP_${name}`];
  for (const k of keys) if (process.env[k]) return process.env[k];
  for (const f of ['.claude/settings.local.json', '.claude/settings.json', path.join(os.homedir(), '.claude', 'settings.json')]) {
    const env = readJson(f).env ?? {};
    for (const k of keys) if (env[k]) return env[k];
  }
  return '';
}

const pick = (name, allowed, fallback) => { const v = setting(name).toLowerCase(); return allowed.includes(v) ? v : fallback; };

const CATEGORIES = ['coding', 'content', 'agentic', 'research'];
// Category comes from /ingot:specialize (INGOT_CATEGORY); before that, code files imply coding.
function categories() {
  const set = setting('CATEGORY').toLowerCase().split(/[\s,]+/).filter((c) => CATEGORIES.includes(c));
  if (set.length) return set;
  return isCodeProject() ? ['coding'] : [];
}

function offer() {
  const cwd = path.resolve('.');
  const home = path.resolve(os.homedir());
  const personal = ['Desktop', 'Documents', 'Downloads', 'OneDrive'].map((d) => path.join(home, d));
  if (cwd === home || cwd === path.parse(cwd).root || personal.includes(cwd) || /[\\/]OneDrive[^\\/]*$/.test(cwd)) return '';
  const files = safeList('.').filter((f) => !f.startsWith('.') && !['desktop.ini', 'Thumbs.db'].includes(f));
  const stamp = ['.claude/.ingot-checked', '.claude/.claude-setup-checked'].find((f) => fs.existsSync(f));
  const say = (why) => `\n## This project\n- ${why}: offer \`/ingot:start\` once, early, in one line. If the user declines, create the empty file \`.claude/.ingot-checked\` so it isn't offered again.\n`;
  if (files.length === 0) return say('The folder is empty, so it can start a new project of any kind');
  if (!stamp) {
    const hasInstructions = ['CLAUDE.md', '.claude/CLAUDE.md', 'AGENTS.md', 'CLAUDE.local.md'].some((f) => fs.existsSync(f));
    return say(hasInstructions ? 'Ingot never tuned this project' : 'This project has no CLAUDE.md yet, so Ingot can tune Claude to it');
  }
  const days = (Date.now() - fs.statSync(stamp).mtimeMs) / 864e5;
  return days > 30 ? say(`Ingot last tuned this project ${Math.floor(days)} days ago, so it can refresh it`) : '';
}

try {
  const sub = process.argv[2] === 'SubagentStart';
  let input = {};
  try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch {}
  let context = read(sub ? 'subagent.md' : 'rules.md');
  if (!sub) {
    for (const c of categories()) context += read(`categories/${c}.md`);
    // Coaching: off, light, full (default) or extra; extra adds to full. Reply style: off, lite (default) or core.
    const coach = pick('COACH', ['off', 'light', 'full', 'extra'], 'full');
    if (coach === 'light') context += read('coach/light.md');
    if (coach === 'full' || coach === 'extra') context += read('coach/full.md');
    if (coach === 'extra') context += read('coach/extra.md');
    const style = pick('STYLE', ['off', 'lite', 'core'], 'lite');
    if (style !== 'off') context += read(`style/${style}.md`);
    // Offers only on a fresh start, so /clear and /compact don't repeat them.
    if (!input.source || input.source === 'startup') context += offer();
  }
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: sub ? 'SubagentStart' : 'SessionStart', additionalContext: context } }));
} catch {
  // Never block a session over a missing rules file.
}
