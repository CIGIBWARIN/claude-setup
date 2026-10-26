# claude-setup

**One install that puts [Claude Code](https://claude.com/claude-code) at its best for coding, content, agentic and research work.** The best advice for working with Claude Code is spread across docs, videos and repos. This add-on applies it for you: Claude plans before big changes, checks its work before calling it done, skips slop, watches videos, writes like a person, and coaches you as you go. Then it adapts itself to each project. You don't pick tools or learn setup.

## Get started

1. **Open a terminal.**
   - Windows: press Start, type PowerShell, and press Enter.
   - Mac: open Terminal.
2. **Paste the line for your system and press Enter.** It installs anything that's missing.

   **Windows:**
   ```
   irm https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.ps1 | iex
   ```
   **macOS / Linux:**
   ```
   curl -fsSL https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.sh | bash
   ```
3. **Open a new terminal in your project folder, type `claude` and press Enter.** If Claude Code was just installed, it asks you to sign in once.

Claude then offers the right first step for that folder. To update later, run the same line again, or type `/toolkit:update` inside Claude.

## What happens in each folder

| Folder | Claude offers | What it does |
|---|---|---|
| Empty, or a new idea | `/toolkit:kickoff` | Asks what you're making, picks the simplest setup, and produces a real first result. |
| An existing project | `/toolkit:specialize` | Sets the project's category, writes a short CLAUDE.md with the real commands or workflow, turns off tools the project doesn't use, suggests packs, and learns from your past sessions. |
| Older code that needs fixing | `/toolkit:cleanup` | Saves a restore point, then fixes dead code, over-engineering, test slop, doc bloat, silent failures and hardcoded secrets. Each fix is verified and committed on its own. |
| Last tuned over a month ago | `/toolkit:update` | Updates Claude Code, the plugins and the tools, and re-checks CLAUDE.md. |

## Two levels of specialization

**General:** each project gets one or more categories, and each category loads its own short rules:

| Category | For | Its rules |
|---|---|---|
| **coding** | apps, sites, scripts, extensions | Tests only where things can break. Comments match the code around them. Look at the real result. |
| **content** | writing, social, newsletters, video, visual design | Match the existing voice. Never invent quotes or stats. Humanizer pass on final drafts. `/watch` for video references. |
| **agentic** | automations, ops, scheduled and browser tasks | Preview and confirm before anything that touches the outside world. Safe re-runs, a log of each run, `/schedule` for recurring work. |
| **research** | sources, data, analysis, reports | Every claim sourced. Facts and opinions kept apart. Raw data left untouched, and the working for every number shown. |

Until a project has been specialized, Claude assumes coding if it finds code, and loads no category rules otherwise.

**Specific:** `/toolkit:specialize` then tailors Claude to the project itself:

- its commands or workflow, voice and layout, written into a CLAUDE.md of 60 lines or fewer
- the plugins it doesn't need, turned off
- up to two matching packs
- skills for tasks you repeat

## How it works

**Every session starts with four short working rules:**

- **Done means verified:** run a check and say what it showed.
- **Simplest thing that fully works.**
- **Only what was asked.**
- **Ask once, with batched questions, when it really matters.**

On top of those come the project's category rules, coaching, the reply style and at most one project offer. All of that comes to about 600 to 1,200 tokens, depending on the category and style. Helper agents that Claude starts get only three lines (about 80 tokens).

**Coaching.** Claude does the pro move itself when it can. When a move needs you, it ends a reply with one `Tip:` line, and only when that tip's moment has just happened:

- `/plan` for big tasks
- `/clear` after two failed corrections or a change of topic
- `/compact <what to keep>` when a chat runs long
- dragging in or `@`-mentioning files
- `/code-review` before you ship

Every tip appears at most once per session. Habits that don't need timing appear as spinner tips while Claude works, which costs no context. One example: Esc twice undoes Claude's last steps.

**Reply style.** `lite` is the default: the answer comes first, steps are numbered, progress is said plainly. `core` is a full ADHD-friendly set, with the next action first, state restated each turn, visible wins and lists of 5 items at most. `off` turns both off. Switch with `/toolkit:style lite`, `core` or `off`.

**Project offers.** Claude makes one offer per new session (see the table above). If you decline, Claude records that and doesn't ask again. Folders like home, Desktop, Documents and Downloads never get an offer.

**While you work:**

- in code projects, a reminder when Claude creates a stray summary or progress doc
- warnings about risky code, and a review of each commit
- type errors right after each edit

## What's included

| Plugin | What it does |
|---|---|
| `guardrails` (this repo) | The rules, categories, coaching, reply style and project offers. |
| `toolkit` (this repo) | `/kickoff`, `/specialize`, `/cleanup`, `/update`, `/style`, `/launch-check` (a 20-item website pre-launch check), `/build-to-target` (pin a target, then build, look, compare and fix), and a silent-failure-hunter agent. |
| [watch](https://github.com/bradautomates/claude-video) | `/watch <link or file>`: Claude watches videos using frames and a transcript, locally, with no account. |
| [humanizer](https://github.com/blader/humanizer) | Removes the signs of AI writing from posts, emails and pages. |
| `context7` | Up-to-date docs for the libraries a project uses. |
| `security-guidance` | Warns about risky code and reviews commits and pushes, using Sonnet. The per-turn review is off, which saves about 30k tokens a turn. |
| `pyright-lsp`, `typescript-lsp` | Type errors after each edit, for Python and TypeScript/JavaScript. |
| [taste-skill](https://github.com/Leonxlnx/taste-skill) | Art direction for web pages and app screens, checked in a real browser. |

**Optional packs** go into individual projects through `/toolkit:specialize`:

- agent-browser for browser automation
- marketing and copy
- slides
- fiction
- video creation
- trend research
- academic research
- Obsidian
- mobile apps
- financial modeling
- Anthropic's business-role plugins

See [`packs.md`](plugins/toolkit/skills/specialize/packs.md).

**Already built in, so not added here:**

- your Claude account's Word, Excel, PowerPoint, PDF, deep-research and skill-creator skills
- Claude Code's `/code-review`, `/security-review`, `/simplify`, `/run`, `/plan`, `/schedule` and `/doctor`
- auto memory and the built-in browser

## Cost and privacy

Everything runs on your Claude subscription's usage limits, and nothing is billed separately. Don't set `ANTHROPIC_API_KEY`, because that switches Claude Code to API billing.

These parts go online:

- **context7:** looks up library names
- **`/watch`:** downloads the video you give it
- **taste:** fetches free images and fonts
- **security-guidance:** reviews commits through your Claude sign-in

Nothing else sends your files anywhere.

## Install details

- **Installed once per device and shared by every project:** Git, Node.js 22 or newer, Python, Claude Code, ffmpeg and yt-dlp (about 330 MB), the language servers (about 60 MB) and the plugin files. Large tools are never copied into each project.
- **Per project:** Claude adds only small files, such as `.claude/settings.json`, `CLAUDE.md` and `.claude/.claude-setup-checked`.
- **Default scope:** the installer sets up the whole device. Add `--project` to also write the setup into the current folder's `.claude/settings.json`. Commit that file so cloud sessions and teammates get the same setup. The forms are:
  - **Windows:** `& ([scriptblock]::Create((irm https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.ps1))) --project`
  - **macOS / Linux:** `... | bash -s -- --project`
- **If something fails,** the installer ends with a "Not installed:" list that says how to fix each item.

## Removing it

- **Remove it from the device:** `npx -y github:CIGIBWARIN/claude-setup --remove`. Shared tools like Node and Python stay installed.
- **Remove it from one project:** run `npx -y github:CIGIBWARIN/claude-setup --remove --project` in that folder. Your own settings in that file are kept.
- **After deleting project folders:** `npx -y github:CIGIBWARIN/claude-setup --prune` clears their leftover plugin entries. `/toolkit:update` also does this.

## Customize

| To change | Edit |
|---|---|
| Plugins | `plugins.txt` (third-party plugins also need their source added to `marketplaces.txt`) |
| Working rules | `plugins/guardrails/rules.md` |
| Category rules | `plugins/guardrails/categories/*.md` |
| Coaching | `plugins/guardrails/coach.md` |
| Reply styles | `plugins/guardrails/style/*.md` |
| Packs | `plugins/toolkit/skills/specialize/packs.md` |
| Defaults and spinner tips | `settings.json` (values already set on a device take priority) |

Then push, and run the install line again on each device. Every few months, try a session with `claude --safe-mode`, which runs with no add-ons, and keep only what still helps. Maintainers can run `/maintain` inside this repo for an upstream review.

## License

[MIT](LICENSE): free to use. If you republish or repackage it, keep the copyright notice. It includes material adapted from [ECC](https://github.com/affaan-m/ECC) (MIT, `plugins/toolkit/LICENSE-ECC.txt`) and [i-have-adhd](https://github.com/ayghri/i-have-adhd) (MIT, `plugins/guardrails/LICENSE-i-have-adhd.txt`).
