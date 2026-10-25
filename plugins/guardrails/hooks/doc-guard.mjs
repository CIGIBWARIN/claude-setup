// PostToolUse(Write): when Claude creates a brand-new doc file, remind it to keep it only if the user asked.
import path from 'node:path';

let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  try {
    const { tool_input: ti = {}, tool_response: tr = {} } = JSON.parse(input);
    const file = String(ti.file_path || tr.filePath || '');
    const p = file.replace(/\\/g, '/').toLowerCase();
    const isDoc = /\.(md|mdx|rst|adoc)$/.test(p) || /(^|\/)docs\//.test(p);
    // Claude's own files (plans, memory, skills, agents) and temp/scratch files are not project docs.
    const internal = /\/\.claude\/|\/temp\/|\/tmp\/|scratchpad|claude\.md$|skill\.md$/.test(p);
    if (tr.type !== 'create' || !isDoc || internal) return;
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: `You just created a new documentation file (${path.basename(file)}). Keep it only if the user asked for documentation; otherwise delete it and put the key points in your reply instead.`,
      },
    }));
  } catch {
    // Malformed input: stay silent rather than interrupt the session.
  }
});
