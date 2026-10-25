// SessionStart / SubagentStart (event name as argv[2]): inject the guardrails into every session and helper agent.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

try {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  let rules = fs.readFileSync(path.join(root, 'rules.md'), 'utf8');
  // Main session only: helper agents don't talk to the user, so no coaching or nudges there.
  if (!process.argv[2]) {
    rules += fs.readFileSync(path.join(root, 'coach.md'), 'utf8');
    // One nudge per session: an empty folder gets kickoff; a git project without a CLAUDE.md gets specialize or cleanup.
    const files = fs.readdirSync('.').filter((f) => !['.git', '.claude', '.gitignore'].includes(f));
    if (files.length === 0) {
      rules += '\n## This project\n- The folder is empty. Once, early in the session, offer to run /toolkit:kickoff to start it right.\n';
    } else if (fs.existsSync('.git') && !fs.existsSync('CLAUDE.md')) {
      rules += '\n## This project\n- It has no CLAUDE.md yet. Once, early in the session, offer /toolkit:specialize to tailor Claude to it, or /toolkit:cleanup if it is older code that needs fixing.\n';
    }
  }
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: process.argv[2] || 'SessionStart', additionalContext: 'Guardrails for this session:\n\n' + rules },
  }));
} catch {
  // Never block a session over a missing rules file.
}
