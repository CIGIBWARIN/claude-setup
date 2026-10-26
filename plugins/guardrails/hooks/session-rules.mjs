// SessionStart / SubagentStart (event name as argv[2]): inject the working rules, the project's category rules,
// coaching, reply style and at most one project nudge. Helper agents get only the short subagent rules.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { safeList, isCodeProject } from './project.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, '')); } catch { return {}; } };

// Settings live in env (set by settings.json) or, as a fallback, in the settings files themselves.
function setting(key) {
  if (process.env[key]) return process.env[key];
  for (const f of ['.claude/settings.local.json', '.claude/settings.json', path.join(os.homedir(), '.claude', 'settings.json')]) {
    const v = readJson(f).env?.[key];
    if (v) return v;
  }
  return '';
}

const CATEGORIES = ['coding', 'content', 'agentic', 'research'];
// Category comes from /toolkit:specialize (CLAUDE_SETUP_CATEGORY); before that, code files imply coding.
function categories() {
  const set = setting('CLAUDE_SETUP_CATEGORY').toLowerCase().split(/[\s,]+/).filter((c) => CATEGORIES.includes(c));
  if (set.length) return set;
  return isCodeProject() ? ['coding'] : [];
}

function nudge() {
  const cwd = path.resolve('.');
  const home = path.resolve(os.homedir());
  const personal = ['Desktop', 'Documents', 'Downloads', 'OneDrive'].map((d) => path.join(home, d));
  if (cwd === home || cwd === path.parse(cwd).root || personal.includes(cwd) || /[\\/]OneDrive[^\\/]*$/.test(cwd)) return '';
  const files = safeList('.').filter((f) => !f.startsWith('.') && !['desktop.ini', 'Thumbs.db'].includes(f));
  const stamp = '.claude/.claude-setup-checked';
  const offer = (text) => `\n## This project\n- ${text} Offer it once, early, in one line. If the user declines, create the empty file \`${stamp}\` so it isn't offered again.\n`;
  if (files.length === 0) return offer('The folder is empty: /toolkit:kickoff starts any kind of project right.');
  if (!fs.existsSync(stamp)) {
    const hasInstructions = ['CLAUDE.md', '.claude/CLAUDE.md', 'AGENTS.md', 'CLAUDE.local.md'].some((f) => fs.existsSync(f));
    return offer(`${hasInstructions ? 'Claude was never tuned for this project' : 'It has no CLAUDE.md yet'}: /toolkit:specialize sets its category (coding, content, agentic, research) and tailors Claude to it. For older code that needs fixing, /toolkit:cleanup instead.`);
  }
  const days = (Date.now() - fs.statSync(stamp).mtimeMs) / 864e5;
  return days > 30 ? offer(`It was last tuned ${Math.floor(days)} days ago: /toolkit:update refreshes everything and re-checks CLAUDE.md.`) : '';
}

try {
  const sub = process.argv[2] === 'SubagentStart';
  let input = {};
  try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch {}
  let context = read(sub ? 'subagent.md' : 'rules.md');
  if (!sub) {
    for (const c of categories()) context += read(`categories/${c}.md`);
    context += read('coach.md');
    // Reply style: lite (default), core (full ADHD-friendly set) or off. Switch with /toolkit:style.
    const style = (setting('CLAUDE_SETUP_STYLE') || 'lite').toLowerCase();
    if (style === 'lite' || style === 'core') context += read(`style/${style}.md`);
    // Nudges only on a fresh start, so /clear and /compact don't repeat them.
    if (!input.source || input.source === 'startup') context += nudge();
  }
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: sub ? 'SubagentStart' : 'SessionStart', additionalContext: context } }));
} catch {
  // Never block a session over a missing rules file.
}
