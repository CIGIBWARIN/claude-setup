# Ingot

**The densest setup for [Claude Code](https://claude.com/claude-code): the most capability in the least context.** One install puts Claude Code at its best for coding, content, agentic and research work. The best advice for working with Claude Code is spread across docs, videos and repos. Ingot applies it for you: Claude plans before big changes, checks its work before calling it done, skips slop, watches videos, writes like a person, and coaches you as you go. Then it adapts itself to each project. You don't pick tools or learn setup.

## Get started

Ingot is turned on **per project**: you run the install line inside each project folder. The big shared tools (Node.js, Python, Git, ffmpeg and the plugin downloads) are installed once per PC and reused, so the second project takes seconds. Ingot works in both the terminal and the Claude desktop app.

1. **Open a normal terminal in your project folder.** You don't need admin. For a new project, make an empty folder first.
   - **Windows:** open the folder in File Explorer, right-click an empty spot, and choose "Open in Terminal". Don't pick "Run as administrator".
   - **Mac:** open Terminal, type `cd ` (with a space), drag the folder into the window, and press Enter.
   - **Desktop app:** open the folder in the Code tab, then open its terminal pane with Ctrl+` (backtick).
2. **Paste the line for your system and press Enter.** It installs anything that's missing.

   **Windows:**
   ```
   irm https://raw.githubusercontent.com/CIGIBWARIN/ingot/main/install.ps1 | iex
   ```
   **macOS / Linux:**
   ```
   curl -fsSL https://raw.githubusercontent.com/CIGIBWARIN/ingot/main/install.sh | bash
   ```
   - **Windows** may show a permission prompt if it needs to install Git or Node.js. Click Yes.
   - **Mac / Linux** may ask for your password if it needs a system package such as Python or ffmpeg. Don't put `sudo` in front of the line, because that would set Ingot up for the admin account instead of you.
   - **Mac:** installing Python and ffmpeg needs [Homebrew](https://brew.sh). Install it first if you don't have it.
3. **Start Claude in that folder.**
   - **Terminal:** open a new terminal in the folder, type `claude` and press Enter. If Claude Code was just installed, it asks you to sign in once.
   - **Desktop app:** start a new session in the Code tab with that folder. If the installer just installed Node.js or Git, quit the app completely and reopen it first, so it can find them.

Claude then offers `/ingot:start`, which tunes it to the project.

The installer writes the setup into the project's `.claude/settings.json`. If the project is in git, commit that file, and teammates and cloud sessions get the same setup.

## Commands

Type these inside Claude, in a project with Ingot. You only need to remember the first one: `/ingot:start` picks the right next command for the folder.

| Command | What it does | Claude offers it when |
|---|---|---|
| `/ingot:start` | Looks at the folder and runs the right command below, or shows a status table: category, settings, plugins, packs | a folder Ingot hasn't tuned yet |
| `/ingot:kickoff` | Asks what you're making, picks the simplest setup, and produces a real first result | the folder is empty, or you have a new idea |
| `/ingot:specialize` | Sets the project's category, writes a short CLAUDE.md with the real commands or workflow, turns off tools the project doesn't use, suggests packs, and learns from your past sessions | an existing project Ingot hasn't tuned |
| `/ingot:workflow` | Maps how the whole project gets done (not just the code) from evidence and a few questions, then applies only the improvements you approve | you ask to optimize or speed up how you work |
| `/ingot:cleanup` | Saves a restore point, then fixes dead code, over-engineering, test slop, doc bloat, silent failures and hardcoded secrets, each verified and committed on its own | older code needs fixing |
| `/ingot:build-to-target` | Pins a target (a screenshot, a page, an example), then builds, looks, compares and fixes until the real result matches | you're making something you'll look at or run |
| `/ingot:launch-check` | Checks and fixes the 20 things websites usually miss (security, SEO, accessibility, speed, legal), and offers free hosting on GitHub Pages | you type it, before a site goes live |
| `/ingot:compliance` | Checks legal, privacy, security, accessibility and licence gaps (GDPR, US state privacy, cookies, WCAG, COPPA, CAN-SPAM, payments, the EU AI Act), runs free scanners, fixes what you approve, and reports each item with its source. A checklist, not legal advice | you ask whether a project is compliant or safe to launch |
| `/ingot:settings` | Shows or changes the reply style, the coaching level and the project's category, e.g. `/ingot:settings style core coach extra` | you type it |
| `/ingot:update` | Updates Claude Code, Ingot, the plugins and the tools, and re-checks CLAUDE.md | the project was last tuned over a month ago |

## Installer options

| You want to | Run | Where |
|---|---|---|
| Turn Ingot on for a project | the install line | in the project folder |
| Update | the install line again, or `/ingot:update` inside Claude | in the project folder |
| Turn Ingot off for a project | the install line with `--remove` | in the project folder |
| Turn Ingot on for every project on this PC | the install line with `--user` | any folder |

None of these need admin. The installer refuses to run in your home, Desktop, Documents or Downloads folder, because those hold many projects rather than one. To add an option such as `--user` or `--remove`, the install line looks like this:

- **Windows:** `& ([scriptblock]::Create((irm https://raw.githubusercontent.com/CIGIBWARIN/ingot/main/install.ps1))) --user`
- **macOS / Linux:** `curl -fsSL https://raw.githubusercontent.com/CIGIBWARIN/ingot/main/install.sh | bash -s -- --user`

To turn a PC-wide setup off again, use `--remove --user`.

## Terminal and desktop app

Ingot works the same way in both, because they share the same settings, plugins and project files. The differences are in the app itself:

| | Terminal (`claude`) | Desktop app (Code tab) |
|---|---|---|
| Coaching tips | name slash commands, such as `/plan`, `/clear` and `/model` | name the app's menus and shortcuts instead, such as the mode menu (Ctrl+Shift+M), New session (Ctrl+N) and the model picker |
| Spinner tips while Claude works | shown | not shown |
| Updating Claude Code | `claude update` (or `/ingot:update`) | Help > Check for Updates (Claude > Check for Updates on a Mac); the app has its own copy |
| Screenshots | paste with Ctrl+V (Alt+V on Windows) | drag them in or use the + button |
| Extras | `claude -p` for scripts | browser, diff and terminal panes, scheduled tasks, side chats |

The desktop app doesn't load plugins in WSL sessions, so open Windows folders directly instead.

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

On top of those come the project's category rules, coaching, the reply style and at most one project offer. With the defaults that is about 700 to 850 tokens, plus about 350 for the short descriptions of Ingot's commands that Claude Code lists. With every category, the `core` style and `extra` coaching it tops out near 1,800 plus that list. Helper agents that Claude starts get only three lines (about 80 tokens).

**Coaching.** Claude does the pro move itself when it can. When a move needs you, it ends a reply with a `Tip:` line, and only when that tip's moment has just happened. Each tip appears at most once per session. There are four levels:

| Level | What Claude coaches |
|---|---|
| `off` | nothing |
| `light` | `/plan` for big tasks, `/clear` after two failed corrections, `/code-review` before you ship |
| `full` (default) | the core habits: also `/compact`, `/clear` between tasks, `@`-mentioning files, screenshots for visual work, `/watch`, Learning mode when you want to learn to code, checkpoint commits, `/security-review`, `/verify`, and saving repeated tasks as skills |
| `extra` | any slash command that fits the moment, such as `/rewind`, `/btw`, `/context`, `/model`, `/goal` or `/loop`, up to two tips per reply |

In the terminal, habits that don't need timing appear as spinner tips while Claude works, which costs no context. One example: Esc twice undoes Claude's file edits.

**Reply style.** `lite` is the default: the answer comes first, steps are numbered, progress is said plainly. `core` is a full ADHD-friendly set, with the next action first, state restated each turn, visible wins and lists of 5 items at most. `off` turns both off.

**Settings.** Change the reply style, coaching level or category with `/ingot:settings`. Changes apply from the next session.

**Project offers.** Claude offers `/ingot:start` once per new session in a folder Ingot hasn't tuned. If you decline, Claude records that and doesn't ask again. Folders like home, Desktop, Documents and Downloads never get an offer.

**While you work:**

- in code projects, a reminder when Claude creates a stray summary or progress doc
- warnings about risky code, and a review of each commit
- type errors right after each edit

## What's included

| Plugin | What it does |
|---|---|
| `ingot` (this repo) | The rules, categories, coaching, reply style and project offers, the [commands](#commands), and a silent-failure-hunter agent. |
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
- logos and brand kits
- launch videos for finished projects
- a startup founder kit (pricing, validation, pitch deck)
- 3D: three.js web scenes and Blender
- scroll and timeline animation (GSAP) and shadcn/ui components
- games: Godot, Phaser and PixiJS
- data files and local SQL (DuckDB)
- slides
- fiction
- video creation
- trend research
- academic research
- Obsidian
- mobile apps
- financial modeling
- Anthropic's business-role plugins
- type checking for other languages (Go, Rust, Java, C# and more)
- Chrome DevTools for web performance
- building Claude plugins and MCP servers
- diagrams

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

- **Installed once per PC and shared by every project:** Git, Node.js 22 or newer, Python, Claude Code, ffmpeg and yt-dlp (about 330 MB), the language servers (about 60 MB) and the plugin files. Large tools are never copied into each project.
- **Per project:** Claude adds only small files, such as `.claude/settings.json`, `CLAUDE.md` and `.claude/.ingot-checked`.
- **Just the Ingot plugin,** without the other plugins and tools: inside Claude, type `/plugin marketplace add CIGIBWARIN/ingot#stable`, then `/plugin install ingot@ingot`.
- **If something fails,** the installer ends with a "Not installed:" list that says how to fix each item.

## Removing it

Each of these is the install line with options added, as shown in [Installer options](#installer-options).

- **Turn it off for one project:** add `--remove`, in that folder. Your own settings in that file are kept. If Ingot is also on PC-wide, it is switched off for just this project.
- **Turn off a PC-wide setup (`--user`):** add `--remove --user`. Projects you set up one by one keep working.
- Shared tools like Node and Python stay installed either way.
- **After deleting project folders:** add `--prune` to clear their leftover plugin entries. `/ingot:update` also does this.

## Customize

Ingot installs from this repo, so to customize it, fork it first and replace `CIGIBWARIN/ingot` with your fork in `install.ps1`, `install.sh` and `marketplaces.txt`.

| To change | Edit |
|---|---|
| Plugins | `plugins.txt` (third-party plugins also need their source added to `marketplaces.txt`) |
| Working rules | `plugins/ingot/rules.md` |
| Category rules | `plugins/ingot/categories/*.md` |
| Coaching | `plugins/ingot/coach/*.md` |
| Reply styles | `plugins/ingot/style/*.md` |
| Packs | `plugins/ingot/skills/specialize/packs.md` |
| Defaults and spinner tips | `settings.json` (values already set in a project take priority) |

Then push to your fork, and run your fork's install line again in each project. Every few months, try a session with `claude --safe-mode`, which runs with no add-ons, and keep only what still helps.

**Maintainers:** users get the `stable` branch, so work on `main` reaches nobody until it is released. GitHub runs `node evals/check.mjs` on every push. `node evals/run.mjs` runs the evals on your subscription. When both pass, release with `git push origin main:stable`. `/maintain` inside this repo reviews upstream changes and runs the evals before any pin moves.

## License

[MIT](LICENSE): free to use. If you republish or repackage it, keep the copyright notice. It includes material adapted from [ECC](https://github.com/affaan-m/ECC) (MIT, `plugins/ingot/LICENSE-ECC.txt`) and [i-have-adhd](https://github.com/ayghri/i-have-adhd) (MIT, `plugins/ingot/LICENSE-i-have-adhd.txt`).
