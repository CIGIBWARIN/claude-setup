// PostToolUse(Write): in code projects, when Claude creates a typical unrequested doc (a summary of changes, an implementation
// write-up, a progress log), remind it to keep it only if asked. Writing, notes and research projects are left alone.
import path from 'node:path';
import { isCodeProject, safeList } from './project.mjs';

const SLOP = /(^|[-_ .])(summary|summaries|changes|changelog|implementation|progress|walkthrough|overview|architecture)([-_ .]|$)/;

let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  try {
    const { tool_input: ti = {}, tool_response: tr = {} } = JSON.parse(input);
    const file = String(ti.file_path || tr.filePath || '');
    // Desktop app sessions can run in <repo>/.claude/worktrees/<name>/; judge files by their path inside the worktree.
    const p = file.replace(/\\/g, '/').toLowerCase().replace(/^.*\/\.claude\/worktrees\/[^/]+\//, '/');
    const name = path.posix.basename(p);
    if (tr.type !== 'create' || !/\.(md|mdx|rst|txt)$/.test(name) || !isCodeProject()) return;
    // Claude's own files (plans, memory, skills), scratch files and archived copies of docs are not new project docs.
    if (/\/\.claude\/|scratchpad|\/archive\/|claude\.md$|skill\.md$/.test(p)) return;
    // A new file in docs/ is suspect only where the project keeps no docs yet; a maintained docs/ folder is deliberate.
    const docsDir = file.replace(/\\/g, '/').match(/^(.*?\/docs)\//i)?.[1];
    const newDocsFolder = docsDir && safeList(docsDir).length <= 1;
    const looksLikeSlop = SLOP.test(name.replace(/\.[^.]+$/, '')) || newDocsFolder || /(^|\/)readme\.md$/.test(p) && p.split('/').length > 2 && /\/(src|lib|app|tests?)\//.test(p);
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
