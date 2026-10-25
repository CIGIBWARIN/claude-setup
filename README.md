# claude-setup

My Claude Code setup: subagents, slash commands, skills, a rule, and plugins. The same command works on Windows, macOS, and Linux.

## Install (one step, nothing needed beforehand)

Run the command in the folder you want Claude to work in. It writes `./.claude`; commit that folder so cloud sessions and other machines get the setup too.

**Windows (PowerShell):**
```
irm https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.ps1 | iex
```

**macOS / Linux:**
```
curl -fsSL https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.sh | bash
```

**Set up every project on this machine instead** (writes `~/.claude`):
```
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.ps1))) --user
curl -fsSL https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.sh | bash -s -- --user
```

If you already have Node.js 20.12 or newer, `npx -y github:CIGIBWARIN/claude-setup [--user]` does the same thing on any OS.

Anything missing is installed automatically:

| | Windows | macOS / Linux |
|---|---|---|
| Git (Claude Code needs it on Windows) | winget | not needed |
| Node.js | winget (LTS) | private copy in `~/.local/share/claude-setup-node`, checksum-verified, no sudo |
| Claude Code | official installer | official installer |
| Python 3.10+ (for security-guidance) | winget | Homebrew on macOS; apt, dnf, pacman, zypper, or apk on Linux (asks for sudo) |
| Language servers | npm | npm |

Then the installer:

1. Copies the agents, commands, skills, and rule into the target folder.
2. Installs the plugins at project or user scope, to match the mode.

If Claude Code was installed fresh, run `claude` once to sign in.

When it's done, restart Claude and run `/mcp` once to authorize Context7.

Options:

- `--force` replaces files you've edited locally. By default they're left alone. Replaced copies are saved to `~/.claude/backups`.
- `--no-tools` skips step 2 and step 3.
- `--no-plugins` skips step 4.

Re-running the command is safe. Files that are already up to date are skipped.

## Saving changes made on this PC

Run these in a clone of this repo:

```
node setup.mjs export                       # copy tracked items from ~/.claude + current user plugins into the repo
node setup.mjs export skills/my-new-skill   # also start tracking something new under ~/.claude
git commit -am "Update setup" && git push
```

## What's here

- `home/` mirrors `.claude/`. The files to track are listed in `managed-paths.txt`.
- `plugins.txt` lists plugins from the official Anthropic marketplace.
- `npm-globals.txt` lists the language servers that `pyright-lsp` and `typescript-lsp` need.

### From ECC

These were hand-picked from [affaan-m/ECC](https://github.com/affaan-m/ECC), which is MIT-licensed. See `ECC-LICENSE.txt`, and `ecc-commit.txt` for the commit.

- **Agents:** planner, architect, code-architect, code-explorer, code-reviewer, security-reviewer, silent-failure-hunter, python-reviewer, fastapi-reviewer, typescript-reviewer, database-reviewer, build-error-resolver, tdd-guide, refactor-cleaner, performance-optimizer, doc-updater, type-design-analyzer, pr-test-analyzer, code-simplifier, comment-analyzer. Their "Use PROACTIVELY / MUST BE USED" wording was removed so they don't spawn on every edit.
- **Skills:** tdd-workflow, verification-loop, search-first, python-patterns, python-testing, fastapi-patterns, database-migrations, postgres-patterns, docker-patterns, api-design, error-handling, codebase-onboarding, deployment-patterns, e2e-testing, browser-qa, architecture-decision-records, safety-guard.
- **Commands:** `/feature-dev`, `/build-fix`, `/test-coverage`, `/refactor-clean`, `/python-review`, `/fastapi-review`, `/update-docs`, `/update-codemaps`, `/checkpoint`, `/save-session`, `/resume-session`, `/learn`.
- **Rule:** `rules/ecc/python-fastapi.md`, which loads only for FastAPI-style paths.

These parts of ECC were skipped on purpose:

- The hook runtime, which is slow on Windows.
- The always-on `rules/common`, which costs about 5k tokens per session and mandates TDD.
- Duplicates of built-in commands: `/code-review`, `/security-review`, `/plan`, `/aside`.
- Anything that is paid or needs an account: AgentShield, Exa, fal.ai, and `/astra-review`, which sends diffs to OpenAI.

### Plugins

| Plugin | Purpose |
|---|---|
| pyright-lsp / typescript-lsp | Type errors and code navigation after edits. Needs the npm language servers. |
| context7 | Up-to-date library docs from a hosted Upstash service. Authorize it with `/mcp`. |
| security-guidance | Warns on risky patterns as you edit, and runs an LLM security review at the end of each turn. Needs Python 3.10+. |
| claude-md-management | Audits and maintains CLAUDE.md files. |
| [i-have-adhd](https://github.com/ayghri/i-have-adhd) | ADHD-friendly replies: the next action comes first, steps are numbered, the current state is restated, and progress is visible. The installer turns it on for every session by creating `~/.claude/.i-have-adhd-always`. Delete that file to go back to turning it on with `/i-have-adhd`, or say "stop adhd mode" to turn it off for one session. |
| [ponytail](https://github.com/DietrichGebert/ponytail) | Keeps Claude from over-engineering: no abstractions or libraries you didn't ask for, and the stdlib first. It logs each task's cost to a local CSV in `~/.config/ponytail/`. Its webhook is off unless you configure one. |
| [taste-skill](https://github.com/Leonxlnx/taste-skill) | Art direction for websites and app screens. It pulls images from open collections with no API key and checks pages in a real browser (Chrome or Edge, Node 22+). It replaces Anthropic's frontend-design plugin. |

| **guardrails** (in this repo, `plugins/guardrails`) | Stops test slop and doc sprawl. At session start it loads short rules (`rules.md`): write tests only for behavior that can actually break, have no coverage targets, and keep docs in proportion to the change. When Claude creates a new doc file, it gets a nudge to delete it unless you asked for it. To install it on its own, run `/plugin install guardrails --marketplace CIGIBWARIN/claude-setup`. |

I also changed the ECC test skills so they don't push for coverage. `tdd-workflow` now runs only when you call `/tdd-workflow`. I removed the 80% coverage mandates from `tdd-guide`, `python-testing`, `planner` and `verification-loop`. `/test-coverage` still aims for a coverage target, because you run it on purpose.

Plugins from outside the official marketplace come from the GitHub repos listed in `marketplaces.txt`. Project installs also record those repos in `.claude/settings.json` so cloud sessions can resolve them.
