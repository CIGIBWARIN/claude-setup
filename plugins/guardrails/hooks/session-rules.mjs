// SessionStart: inject the test/doc guardrails into every session.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

try {
  const rules = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'rules.md'), 'utf8');
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: 'Guardrails for this session:\n\n' + rules },
  }));
} catch {
  // Never block a session over a missing rules file.
}
