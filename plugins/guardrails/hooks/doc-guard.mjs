// PostToolUse(Write): in code projects, when Claude creates a typical unrequested doc (a summary of changes, an implementation
// write-up, a progress log), remind it to keep it only if asked. Writing, notes and research projects are left alone.
import path from 'node:path';
import { isCodeProject } from './project.mjs';

const SLOP = /(^|[-_ .])(summary|summaries|changes|changelog|implementation|progress|walkthrough|overview|architecture)([-_ .]|$)/;

let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  try {
    const { tool_input: ti = {}, tool_response: tr = {} } = JSON.parse(input);
    const file = String(ti.file_path || tr.filePath || '');
    const p = file.replace(/\\/g, '/').toLowerCase();
    const name = path.posix.basename(p);
    if (tr.type !== 'create' || !/\.(md|mdx|rst|txt)$/.test(name) || !isCodeProject()) return;
    // Claude's own files (plans, memory, skills) and scratch files are not project docs.
    if (/\/\.claude\/|scratchpad|claude\.md$|skill\.md$/.test(p)) return;
    const looksLikeSlop = SLOP.test(name.replace(/\.[^.]+$/, '')) || /(^|\/)docs\//.test(p) || /(^|\/)readme\.md$/.test(p) && p.split('/').length > 2 && /\/(src|lib|app|tests?)\//.test(p);
    if (!looksLikeSlop) return;
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: `You just created ${path.basename(file)}, a documentation file. Keep it only if the user asked for it; otherwise delete it and put the key points in your reply.`,
      },
    }));
  } catch {
    // Malformed input: stay silent rather than interrupt the session.
  }
});
