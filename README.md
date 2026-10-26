# claude-setup

**The one add-on to install for every Claude Code session.** [Claude Code](https://claude.com/claude-code) isn't only for coding. People use it to build apps and websites, write and edit content, research, analyze data, design, and automate busywork, anywhere working on real files beats a chat window. This add-on covers the 90% that matters in all of those. Claude plans before big changes, checks its work before calling it done, skips slop, watches videos, writes like a person, and coaches you as you go. Then it adapts itself to each project.

It's deliberately small. Every extra rule or skill costs context in every session, and outdated instructions make newer models worse. So the core stays lean, and anything specialized is added per project, only where it fits.

## Install

Run this in the folder you want Claude to work in. It first installs anything that's missing: Git, Node.js, Python, Claude Code, ffmpeg and yt-dlp for video, and language servers.

**Windows (PowerShell):**
```
irm https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.ps1 | iex
```

**macOS / Linux:**
```
curl -fsSL https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.sh | bash
```

Then:

1. Restart Claude.
2. If Claude Code was installed fresh, run `claude` once to sign in.
3. Run `/mcp` once to authorize Context7.

A project install writes only `.claude/settings.json`. Commit it so cloud sessions and teammates get the same setup.

To set up every folder on the machine instead, add `--user`:

- **Windows:** `& ([scriptblock]::Create((irm https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.ps1))) --user`
- **macOS / Linux:** `... | bash -s -- --user`

**To update,** run the same command again, or `/toolkit:update`.

## Your first command

Claude offers the right one when you open a project, so you don't need to remember any of them.

| Situation | Command | What happens |
|---|---|---|
| Empty folder or new idea | `/toolkit:kickoff` | Asks what you're making (an app, writing, research, data or design). Picks the simplest setup, and produces a real first result. |
| Existing project (recommended first step) | `/toolkit:specialize` | Tailors Claude to the project. It writes a short CLAUDE.md with the real commands or workflow, turns off plugins you don't need, suggests packs that fit, and turns tasks you repeat into project skills. |
| Older code that needs fixing | `/toolkit:cleanup` | Saves a restore point, then fixes dead code, over-engineering, test slop, doc bloat, silent failures and hardcoded secrets. Each fix is verified and committed separately. |
| Every few weeks | `/toolkit:update` | Updates Claude Code and the plugins, cleans up after deleted projects, and checks that CLAUDE.md still matches the project. |

## How it works

### When a session starts

The `guardrails` plugin adds a short set of rules to the session. Together with the coaching below, they come to about 1,000 tokens:

- **Done means verified.** Claude runs the narrowest check that proves something works, and says what it couldn't verify.
- **Simplest solution first.** Before writing code, Claude asks whether there's a simpler way.
- **Ask, don't guess.** Claude asks one question at a time when a request is ambiguous.
- **No test slop.** Tests only for things that can break, and no coverage targets.
- **No doc bloat.** No new doc files unless you ask. Docs stay in proportion to the change.

Helper agents that Claude starts get the same rules.

### Coaching

Claude does the pro move itself when it can. When a move needs you, it adds one `Tip:` line at the end of a reply. You get at most one tip per reply, and Claude never repeats a tip in the same session.

| When | Claude does or suggests |
|---|---|
| A big or vague task | Writes a plan first. Tip: Shift+Tab twice for plan mode. |
| You switch to an unrelated task | Tip: `/clear` |
| The chat gets long | Tip: `/compact` |
| Visual work with no target | Asks for a screenshot or reference, then uses build-to-target. |
| Something works (in git) | Offers to commit a checkpoint. |
| Before shipping | Tip: `/code-review`, `/security-review`, `/toolkit:launch-check` |
| A vague bug report | Asks for the exact error or a screenshot. |
| You share a video | Watches it with `/watch`. |
| Writing for others | Polishes it with humanizer. |
| A file Claude can't see | Tip: drag it into the chat. |
| The same task a second time | Offers to save it as a skill. Tip: `/schedule` for recurring work. |

### Project nudges

Each session, Claude may make one offer, chosen by the folder's state:

| Folder state | Claude offers |
|---|---|
| Empty | `/toolkit:kickoff` |
| No CLAUDE.md | `/toolkit:specialize`, or `/toolkit:cleanup` for older code |
| CLAUDE.md older than 30 days | `/toolkit:update` |
| Your home folder, or a drive root | nothing |

### While you work

- **Doc nudge:** when Claude creates a typical unrequested doc (a summary, guide, notes, changelog or `docs/` page), it's reminded to keep it only if you asked. Article drafts and other files stay untouched.
- **security-guidance:** warns about risky code as it's written, and reviews each commit and push.
- **Language servers:** show type errors right after each edit to Python or TypeScript/JavaScript.

## What's included

| Plugin | What it does |
|---|---|
| `guardrails` (this repo) | The rules, the coaching, and the nudges above. |
| `toolkit` (this repo) | Run only when you call them: `/kickoff`, `/specialize`, `/cleanup`, `/update`, `/launch-check` (20-item website pre-launch checklist) and `/tdd-workflow`. Always available: `/build-to-target` (pin a target, then loop build, look, compare, fix), `/verification-loop`, and `/build-fix`, plus a silent-failure-hunter agent. |
| [watch](https://github.com/bradautomates/claude-video) | `/watch <link or file>`. Claude watches a video through frames and a transcript, locally, with no account needed. |
| [humanizer](https://github.com/blader/humanizer) | Removes the signs of AI writing from posts, emails and pages. |
| `context7` | Up-to-date docs for the libraries you use, so Claude invents fewer APIs. |
| `security-guidance` | Risky-code warnings, plus commit and push reviews on Sonnet. Its per-turn Opus review (about 30k tokens a turn) is turned off in `settings.json`. |
| `pyright-lsp`, `typescript-lsp` | Type errors after each edit. `specialize` turns them off where they aren't used. |
| [taste-skill](https://github.com/Leonxlnx/taste-skill) | Art direction for web pages and app screens, checked in a real browser. |
| [i-have-adhd](https://github.com/ayghri/i-have-adhd) | Answers lead with the next action, steps are numbered, and progress stays visible. It's always on. Say "stop adhd mode" to turn it off for a session, or delete `~/.claude/.i-have-adhd-always` to make it on-demand. |

If you sign in with a Claude account, Claude Code usually also has Anthropic's own skills: Word, Excel, PowerPoint and PDF files, deep research, and a skill creator. This repo doesn't duplicate those, or built-ins like `/code-review`, `/security-review`, `/simplify`, `/schedule` and plan mode.

### Optional packs

`/toolkit:specialize` suggests these only when a project fits, and installs them in that project alone:

- **Marketing and copy:** marketingskills.
- **Trend research:** last30days, covering Reddit, Hacker News, YouTube and more.
- **Obsidian vaults:** obsidian-skills.
- **Data files:** duckdb.
- **Video creation:** HyperFrames.
- **Business roles:** Anthropic's sales, finance, legal, product and small-business plugins.

The full list is in [`packs.md`](plugins/toolkit/skills/specialize/packs.md).

## Cost and privacy

Everything runs on your Claude subscription's usage limits, and nothing is billed separately. Don't set `ANTHROPIC_API_KEY`, which would switch Claude Code to API billing.

Some parts go online:

- **Context7** looks up library names.
- **`/watch`** downloads the video you give it.
- **Taste** fetches free images and fonts.
- **security-guidance** reviews commits through your Claude sign-in.

Nothing else sends your files anywhere.

## Removing it

**Rule:** anything large is installed once per device and shared by every project, never copied into each one. A project only gets small files like `.claude/settings.json` and CLAUDE.md, so deleting the folder removes everything that belonged to it. The project's own dependencies, such as a `venv` or `node_modules`, are the only exception, and claude-setup doesn't create those.

Shared tools are installed once per machine: Git, Node, Python, Claude Code, ffmpeg and yt-dlp (about 330 MB), the language servers (about 60 MB) and the plugin files. Each project adds only `.claude/settings.json`.

- **Remove it from one project:** run `npx -y github:CIGIBWARIN/claude-setup --remove` in that folder. Your own settings in that file are kept.
- **Deleted a project folder?** Run `npx -y github:CIGIBWARIN/claude-setup --prune` to clear the plugin entries it left behind. `/toolkit:update` also does this.
- **Remove it from the whole machine:** run `npx -y github:CIGIBWARIN/claude-setup --remove --user`. The shared tools stay installed.

## Customize

- **Plugins:** edit `plugins.txt`. For third-party plugins, also add their source to `marketplaces.txt`.
- **Rules:** edit `plugins/guardrails/rules.md`. For coaching, edit `coach.md`.
- **Packs:** edit `plugins/toolkit/skills/specialize/packs.md`.
- **Environment defaults:** edit `settings.json`. Values already set on a machine take priority.

Then push, and re-run the install command on each machine. Every few months, try a session with `claude --bare` (no plugins), and keep only what still helps.

## License

[MIT](LICENSE): free to use. If you republish or repackage it, keep the copyright notice. Some toolkit files come from [ECC](https://github.com/affaan-m/ECC), also MIT (`plugins/toolkit/LICENSE-ECC.txt`).
