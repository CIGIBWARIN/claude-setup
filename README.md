# claude-setup

Claude Code at its best in one command, without spending time configuring it. This is a curated, deliberately small set of plugins that fixes the common complaints:

- tests that don't test anything real
- doc files nobody asked for
- "done" claims that were never checked
- surprise token bills

## Install

Run this in the folder you want Claude to work in. It installs anything that's missing first: Git, Node.js, Claude Code, Python, and the language servers.

**Windows (PowerShell):**
```
irm https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.ps1 | iex
```

**macOS / Linux:**
```
curl -fsSL https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.sh | bash
```

In project mode the only file it writes is `.claude/settings.json`. Commit it, and cloud sessions and teammates get the same setup.

To set up every project on the machine instead, add `--user`. On Windows that's `& ([scriptblock]::Create((irm https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.ps1))) --user`. On macOS and Linux it's `... | bash -s -- --user`.

If you already have Node.js 20.12 or newer, `npx -y github:CIGIBWARIN/claude-setup [--user]` does the same thing.

After installing, restart Claude. If Claude Code was installed fresh, run `claude` once to sign in. Run `/mcp` once to authorize Context7.

**To update, run the same command again.** Plugins follow this repo's commits.

## What you get

| Problem | Fix | Plugin |
|---|---|---|
| Test slop and coverage padding | Tests only for behavior that can break. No coverage targets. Never weaken a test to make it pass. | `guardrails` (this repo) |
| Docs nobody asked for | No new doc files unless you ask. Docs stay in proportion to the change. Claude gets a nudge whenever it creates one. | `guardrails` |
| "It works" without checking | Claude runs the narrowest check that proves it, and says what's unverified. | `guardrails` |
| Answers buried in text | The next action comes first, steps are numbered, and progress is visible. On by default. | [i-have-adhd](https://github.com/ayghri/i-have-adhd) |
| Wrong or invented APIs | Type errors show up right after each edit. Docs are current for the library version you use. | `pyright-lsp`, `typescript-lsp`, `context7` |
| Generic AI-looking web pages | Art direction, real images from open collections, and a check in a real browser. | [taste-skill](https://github.com/Leonxlnx/taste-skill) |
| Insecure code | Pattern warnings on every edit, and an LLM review on each commit and push (on Sonnet). | `security-guidance` |
| Stale CLAUDE.md | `/claude-md-improver` and `/revise-claude-md`. | `claude-md-management` |
| Language-specific review | Python, FastAPI, TypeScript, and Postgres reviewers, a build-error fixer, and a silent-failure hunter, plus reference skills for pytest, migrations, Docker, API design, and error handling. `/tdd-workflow` runs only when you call it. | `toolkit` (this repo, trimmed from [ECC](https://github.com/affaan-m/ECC)) |

### What's deliberately left out

Most "Claude Code setups" make things worse by adding too much. Every skill and agent description costs context in every session, and every hook costs time on every tool call. So this setup doesn't include:

- **Anything Claude Code already does.** Plan and Explore agents, `/code-review`, `/security-review`, `/simplify`, `/resume` and `/init` are built in. ECC's 20 agents and 12 commands were cut to 6 agents and 3 commands for this reason.
- **Always-on rule packs** that mandate TDD, 80% coverage, or a PRD for every change.
- **Hooks on every tool call.** The only per-tool hook is guardrails' check on file writes.
- **Per-turn LLM reviews.** security-guidance's diff review after every turn costs about 30k Opus tokens each time, so it's off. Commit and push reviews stay on, and run on Sonnet. To change either, see `settings.json`.
- **Anything paid or tied to an account,** except Context7's free sign-in.

## Customize

- **Add or remove a plugin:** edit `plugins.txt`. For a plugin outside the official marketplace, also add its GitHub repo to `marketplaces.txt`.
- **Change the rules:** edit `plugins/guardrails/rules.md`.
- **Change the env defaults:** edit `settings.json`. A value you've already set on a machine always wins over this file.

Push your changes, then re-run the install command on each machine.

Turn ADHD mode off for a single session by saying "stop adhd mode". To make ADHD mode on-demand instead of always on, delete `~/.claude/.i-have-adhd-always`; you then start it with `/i-have-adhd`.

## Layout

```
install.ps1 / install.sh   bootstrap missing dependencies, then run setup.mjs
setup.mjs                  add marketplaces, install/update plugins, apply settings.json
plugins.txt                plugins to enable
marketplaces.txt           third-party plugin sources (GitHub)
npm-globals.txt            language servers
settings.json              env defaults merged into Claude settings
plugins/guardrails/        session rules + new-doc-file nudge
plugins/toolkit/           trimmed ECC agents, commands, and skills (MIT, see LICENSE-ECC.txt)
```
