// SessionStart / SubagentStart (event name as argv[2]): inject the guardrails into every session and helper agent.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

try {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  let rules = fs.readFileSync(path.join(root, 'rules.md'), 'utf8');
  // Main session only: helper agents don't talk to the user, so no coaching or nudges there.
  if (!process.argv[2]) {
    rules += fs.readFileSync(path.join(root, 'coach.md'), 'utf8');
    // At most one nudge per session, picked from the folder's state. Home and drive roots are not projects.
    const cwd = path.resolve('.');
    const notProject = cwd === path.resolve(os.homedir()) || cwd === path.parse(cwd).root;
    const files = notProject ? [] : fs.readdirSync('.').filter((f) => !['.git', '.claude', '.gitignore'].includes(f));
    const nudge = (text) => { rules += `\n## This project\n- ${text} Offer it once, early in the session, in one line.\n`; };
    const ageDays = fs.existsSync('CLAUDE.md') ? (Date.now() - fs.statSync('CLAUDE.md').mtimeMs) / 864e5 : 0;
    if (notProject) {
      // No nudge outside a project folder.
    } else if (files.length === 0) {
      nudge('The folder is empty: /toolkit:kickoff starts it right (any kind of project, not just code).');
    } else if (!fs.existsSync('CLAUDE.md')) {
      nudge('It has no CLAUDE.md yet: /toolkit:specialize tailors Claude to it (code, writing, research, data or design). If it is older code that needs fixing, /toolkit:cleanup instead.');
    } else if (ageDays > 30) {
      nudge(`Its CLAUDE.md is ${Math.floor(ageDays)} days old: /toolkit:update refreshes plugins and checks CLAUDE.md still matches the project.`);
    }
  }
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: process.argv[2] || 'SessionStart', additionalContext: 'Guardrails for this session:\n\n' + rules },
  }));
} catch {
  // Never block a session over a missing rules file.
}
