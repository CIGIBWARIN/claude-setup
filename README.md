# claude-setup

My Claude Code setup: subagents, slash commands, skills, a rule, and plugins. The same command works on Windows, macOS, and Linux.

## Install

You need Node.js 20.12 or newer and Claude Code. Because the repo is private, git also has to be signed in to GitHub. If it isn't, run `gh auth login` and then `gh auth setup-git`.

**Set up the folder you're in** (writes `./.claude`). Commit that folder so cloud sessions and other machines get it too:

```
npx -y github:CIGIBWARIN/claude-setup
```

**Set up every project on this machine** (writes `~/.claude`):

```
npx -y github:CIGIBWARIN/claude-setup --user
```

What it does:

1. Copies the agents, commands, skills, and rule into the target folder.
2. Installs Python 3.10+ if it's missing (winget on Windows, Homebrew on macOS; on Linux it prints the command to run).
3. Installs the `pyright` and `typescript-language-server` language servers through npm.
4. Installs the plugins at project or user scope, to match the mode.

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
