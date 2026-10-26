# Ingot

**The densest setup for [Claude Code](https://claude.com/claude-code): the most capability in the least context.** One install puts Claude Code at its best for coding, content, agentic and research work. The best advice for working with Claude Code is spread across docs, videos and repos. Ingot applies it for you: Claude plans before big changes, checks its work before calling it done, skips slop, watches videos, writes like a person, and coaches you as you go. Then it adapts itself to each project. You don't pick tools or learn setup.

## Get started

1. **Open a terminal.**
   - Windows: press Start, type PowerShell, and press Enter.
   - Mac: open Terminal.
2. **Paste the line for your system and press Enter.** It installs anything that's missing.

   **Windows:**
   ```
   irm https://raw.githubusercontent.com/CIGIBWARIN/ingot/main/install.ps1 | iex
   ```
   **macOS / Linux:**
   ```
   curl -fsSL https://raw.githubusercontent.com/CIGIBWARIN/ingot/main/install.sh | bash
   ```
3. **Open a new terminal in your project folder, type `claude` and press Enter.** If Claude Code was just installed, it asks you to sign in once.

Claude then offers `/ingot:start` once. To update later, run the same line again, or type `/ingot:update` inside Claude.

## One command: `/ingot:start`

`/ingot:start` looks at the folder and does the right thing:

| Folder | It runs | What that does |
|---|---|---|
| Empty, or a new idea | `/ingot:kickoff` | Asks what you're making, picks the simplest setup, and produces a real first result. |
| An existing project | `/ingot:specialize` | Sets the project's category, writes a short CLAUDE.md with the real commands or workflow, turns off tools the project doesn't use, suggests packs, and learns from your past sessions. |
| Older code that needs fixing | `/ingot:cleanup` | Saves a restore point, then fixes dead code, over-engineering, test slop, doc bloat, silent failures and hardcoded secrets. Each fix is verified and committed on its own. |
| Last tuned over a month ago | `/ingot:update` | Updates Claude Code, the plugins and the tools, and re-checks CLAUDE.md. |
| Already tuned | a status table | Shows the category, settings, plugins and packs, plus every Ingot command. |

## Two levels of specialization

**General:** each project gets one or more categories, and each category loads its own short rules:

| Category | For | Its rules |
|---|---|---|
| **coding** | apps, sites, scripts, extensions | Tests only where things can break. Comments match the code around them. Look at the real result. |
| **content** | writing, social, newsletters, video, visual design | Match the existing voice. Never invent quotes or stats. Humanizer pass on final drafts. `/watch` for video references. |
| **agentic** | automations, ops, scheduled and browser tasks | Preview and confirm before anything that touches the outside world. Safe re-runs, a log of each run, `/schedule` for recurring work. |
| **research** | sources, data, analysis, reports | Every claim sourced. Facts and opinions kept apart. Raw data left untouched, and the working for every number shown. |

Until a project has been specialized, Claude assumes coding if it finds code, and loads no category rules otherwise.

**Specific:** `/ingot:specialize` then tailors Claude to the project itself:

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

On top of those come the project's category rules, coaching, the reply style and at most one project offer. With the defaults that is about 600 to 700 tokens. With every category, the `core` style and `extra` coaching it tops out near 1,700. Helper agents that Claude starts get only three lines (about 80 tokens).

**Coaching.** Claude does the pro move itself when it can. When a move needs you, it ends a reply with a `Tip:` line, and only when that tip's moment has just happened. Each tip appears at most once per session. There are four levels:

| Level | What Claude coaches |
|---|---|
| `off` | nothing |
| `light` | `/plan` for big tasks, `/clear` after two failed corrections, `/code-review` before you ship |
| `full` (default) | the core habits: also `/compact`, `/clear` between tasks, `@`-mentioning files, screenshots for visual work, `/watch`, checkpoint commits, `/security-review`, and saving repeated tasks as skills |
| `extra` | any slash command that fits the moment, such as `/rewind`, `/btw`, `/context`, `/model`, `/goal` or `/loop`, up to two tips per reply |

Habits that don't need timing appear as spinner tips while Claude works, which costs no context. One example: Esc twice undoes Claude's last steps.

**Reply style.** `lite` is the default: the answer comes first, steps are numbered, progress is said plainly. `core` is a full ADHD-friendly set, with the next action first, state restated each turn, visible wins and lists of 5 items at most. `off` turns both off.

**Settings.** `/ingot:settings` shows and changes the reply style, the coaching level and the project's category, for example `/ingot:settings style core coach extra`. Changes apply from the next session.

**Project offers.** Claude offers `/ingot:start` once per new session in a folder Ingot hasn't tuned. If you decline, Claude records that and doesn't ask again. Folders like home, Desktop, Documents and Downloads never get an offer.

**While you work:**

- in code projects, a reminder when Claude creates a stray summary or progress doc
- warnings about risky code, and a review of each commit
- type errors right after each edit

## What's included

| Plugin | What it does |
|---|---|
| `ingot` (this repo) | The rules, categories, coaching, reply style and project offers, plus `/ingot:start`, `kickoff`, `specialize`, `cleanup`, `update`, `settings`, `launch-check` (a 20-item website pre-launch check), `build-to-target` (pin a target, then build, look, compare and fix), and a silent-failure-hunter agent. |
| [watch](https://github.com/bradautomates/claude-video) | `/watch <link or file>`: Claude watches videos using frames and a transcript, locally, with no account. |
| [humanizer](https://github.com/blader/humanizer) | Removes the signs of AI writing from posts, emails and pages. |
| `context7` | Up-to-date docs for the libraries a project uses. |
| `security-guidance` | Warns about risky code and reviews commits and pushes, using Sonnet. The per-turn review is off, which saves about 30k tokens a turn. |
| `pyright-lsp`, `typescript-lsp` | Type errors after each edit, for Python and TypeScript/JavaScript. |
| [taste-skill](https://github.com/Leonxlnx/taste-skill) | Art direction for web pages and app screens, checked in a real browser. |

**Third-party plugins are pinned** to releases that passed Ingot's evals (`evals/`). Ingot never edits them; it only decides when they load. A new release is adopted only after its evals pass again.

**Optional packs** go into individual projects through `/ingot:specialize`:

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

See [`packs.md`](plugins/ingot/skills/specialize/packs.md).

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
- **Per project:** Claude adds only small files, such as `.claude/settings.json`, `CLAUDE.md` and `.claude/.ingot-checked`.
- **Default scope:** the installer sets up the whole device. Add `--project` to also write the setup into the current folder's `.claude/settings.json`. Commit that file so cloud sessions and teammates get the same setup. The forms are:
  - **Windows:** `& ([scriptblock]::Create((irm https://raw.githubusercontent.com/CIGIBWARIN/ingot/main/install.ps1))) --project`
  - **macOS / Linux:** `... | bash -s -- --project`
- **Just the Ingot plugin,** without the other plugins and tools: type `/plugin install ingot --marketplace CIGIBWARIN/ingot` inside Claude.
- **If something fails,** the installer ends with a "Not installed:" list that says how to fix each item.
- **Coming from claude-setup:** run the install line again. It replaces the old `guardrails` and `toolkit` plugins with `ingot` and keeps your settings.

## Removing it

- **Remove it from the device:** `npx -y github:CIGIBWARIN/ingot --remove`. Shared tools like Node and Python stay installed.
- **Remove it from one project:** run `npx -y github:CIGIBWARIN/ingot --remove --project` in that folder. Your own settings in that file are kept.
- **After deleting project folders:** `npx -y github:CIGIBWARIN/ingot --prune` clears their leftover plugin entries. `/ingot:update` also does this.

## Customize

| To change | Edit |
|---|---|
| Plugins | `plugins.txt` (third-party plugins also need their source added to `marketplaces.txt`) |
| Working rules | `plugins/ingot/rules.md` |
| Category rules | `plugins/ingot/categories/*.md` |
| Coaching | `plugins/ingot/coach/*.md` |
| Reply styles | `plugins/ingot/style/*.md` |
| Packs | `plugins/ingot/skills/specialize/packs.md` |
| Defaults and spinner tips | `settings.json` (values already set on a device take priority) |

Then push, and run the install line again on each device. Every few months, try a session with `claude --safe-mode`, which runs with no add-ons, and keep only what still helps.

**Maintainers:** `node evals/run.mjs` runs the evals on your subscription, and `/maintain` inside this repo reviews upstream changes and runs the evals before any pin moves.

## License

[MIT](LICENSE): free to use. If you republish or repackage it, keep the copyright notice. It includes material adapted from [ECC](https://github.com/affaan-m/ECC) (MIT, `plugins/ingot/LICENSE-ECC.txt`) and [i-have-adhd](https://github.com/ayghri/i-have-adhd) (MIT, `plugins/ingot/LICENSE-i-have-adhd.txt`).
