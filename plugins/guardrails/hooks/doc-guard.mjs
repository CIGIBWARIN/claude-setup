// PostToolUse(Write): when Claude creates a typical unrequested doc (summary, guide, notes, changelog...), remind it to keep it only if asked.
// Matches by name, not by .md alone, so article drafts, notes vaults and skill files stay quiet.
import path from 'node:path';

const SLOP = /(^|[-_ .])(readme|summary|summaries|guide|notes|changelog|report|implementation|architecture|overview|usage|setup|howto|walkthrough|explanation|changes|progress|status)([-_ .]|$)/;

let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  try {
    const { tool_input: ti = {}, tool_response: tr = {} } = JSON.parse(input);
    const file = String(ti.file_path || tr.filePath || '');
    const p = file.replace(/\\/g, '/').toLowerCase();
    const name = path.posix.basename(p);
    const isDocFile = /\.(md|mdx|rst|adoc|txt)$/.test(name);
    const slopName = SLOP.test(name.replace(/\.[^.]+$/, ''));
    const inDocsDir = /(^|\/)docs\//.test(p);
    // Claude's own files (plans, memory, skills, agents) and scratch files are not project docs.
    const internal = /\/\.claude\/|scratchpad|claude\.md$|skill\.md$/.test(p);
    if (tr.type !== 'create' || !isDocFile || !(slopName || inDocsDir) || internal) return;
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: `You just created ${path.basename(file)}, a documentation file. Keep it only if the user asked for it; otherwise delete it and put the key points in your reply instead.`,
      },
    }));
  } catch {
    // Malformed input: stay silent rather than interrupt the session.
  }
});
