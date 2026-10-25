# claude-setup

My Claude Code setup for Windows: subagents, slash commands, skills, a rule, and plugins. It applies at user level, so it covers every project on the PC.

## New PC

You need Claude Code, Git, and a signed-in GitHub CLI.

```powershell
gh repo clone claude-setup $HOME\claude-setup
cd $HOME\claude-setup
pwsh -ExecutionPolicy Bypass -File .\setup.ps1
```

`setup.ps1` does the following:

1. Installs Node.js LTS and Python 3.13 through winget, if they're missing.
2. Installs the language servers listed in `npm-globals.txt`.
3. Copies `home\*` into `~/.claude`. Anything already there is moved to `~/.claude/backups/` first.
4. Installs the plugins listed in `plugins.txt`.

Afterwards, restart Claude and run `/mcp` once to authorize Context7. `-SkipTools` skips steps 1 and 2. `-SkipPlugins` skips step 4.

## Saving changes made on a PC

```powershell
.\export.ps1                              # re-copy tracked items + current plugin list into the repo
.\export.ps1 -Add skills/my-new-skill     # also start tracking something new under ~/.claude
git commit -am "Update setup"; git push
```

On your other PCs, run `git pull` and then `.\setup.ps1 -SkipTools`.

## What's here

- `home/`: mirrors `~/.claude`. The files to track are listed in `managed-paths.txt`.
- `plugins.txt`: user-scope plugins from the official Anthropic marketplace.
- `npm-globals.txt`: language servers used by `pyright-lsp` and `typescript-lsp`.

### From ECC

These were hand-picked from [affaan-m/ECC](https://github.com/affaan-m/ECC). It's MIT-licensed; see `ECC-LICENSE.txt`, and `ecc-commit.txt` for the commit.

- **Agents:** planner, architect, code-architect, code-explorer, code-reviewer, security-reviewer, silent-failure-hunter, python-reviewer, fastapi-reviewer, typescript-reviewer, database-reviewer, build-error-resolver, tdd-guide, refactor-cleaner, performance-optimizer, doc-updater, type-design-analyzer, pr-test-analyzer, code-simplifier, comment-analyzer. Their "Use PROACTIVELY / MUST BE USED" wording was removed so they don't spawn on every edit.
- **Skills:** tdd-workflow, verification-loop, search-first, python-patterns, python-testing, fastapi-patterns, database-migrations, postgres-patterns, docker-patterns, api-design, error-handling, codebase-onboarding, deployment-patterns, e2e-testing, browser-qa, architecture-decision-records, safety-guard.
- **Commands:** `/feature-dev`, `/build-fix`, `/test-coverage`, `/refactor-clean`, `/python-review`, `/fastapi-review`, `/update-docs`, `/update-codemaps`, `/checkpoint`, `/save-session`, `/resume-session`, `/learn`.
- **Rule:** `rules/ecc/python-fastapi.md`, which loads only for FastAPI-style paths.

These parts of ECC were skipped on purpose:

- The hook runtime: Node runs on every tool call, which is slow on Windows.
- The always-on `rules/common`: about 5k tokens per session, and it mandates TDD.
- Duplicates of built-ins: `/code-review`, `/security-review`, `/plan`, `/aside`.
- Anything paid or tied to an account: AgentShield, Exa, fal.ai, and `/astra-review`, which sends your diff to OpenAI.

### Plugins

| Plugin | Purpose |
|---|---|
| pyright-lsp / typescript-lsp | Type errors and code navigation after edits. Needs the npm language servers. |
| context7 | Up-to-date library docs. A hosted Upstash service; run `/mcp` to authorize it. |
| security-guidance | Warns on risky code patterns during edits and runs an LLM security review at the end of a turn. Needs Python 3.10+. |
| claude-md-management | Audits and maintains CLAUDE.md files. |

Not synced: anything a cloud session needs. Cloud sessions only see a project's own committed `.claude/` folder.
