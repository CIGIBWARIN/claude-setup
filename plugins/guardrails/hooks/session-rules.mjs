// SessionStart / SubagentStart (event name as argv[2]): inject the guardrails into every session and helper agent.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

try {
  const rules = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'rules.md'), 'utf8');
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: process.argv[2] || 'SessionStart', additionalContext: 'Guardrails for this session:\n\n' + rules },
  }));
} catch {
  // Never block a session over a missing rules file.
}
