# claude-setup

One command makes Claude Code noticeably better, and then it adapts itself to each project. The setup is deliberately small, because every extra rule or skill costs context in every session, and outdated instructions hold newer models back.

## Install

Run this in the folder you want Claude to work in. It first installs anything that's missing: Git, Node.js, Claude Code, Python, and language servers.

**Windows (PowerShell):**
```
irm https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.ps1 | iex
```

**macOS / Linux:**
```
curl -fsSL https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.sh | bash
```

A project install writes only `.claude/settings.json`. Commit it to get the same setup in cloud sessions and for teammates.

To set up every project on the machine instead, add `--user`:

- **Windows:** `& ([scriptblock]::Create((irm https://raw.githubusercontent.com/CIGIBWARIN/claude-setup/main/install.ps1))) --user`
- **macOS / Linux:** `... | bash -s -- --user`

After installing:

1. Restart Claude.
2. If Claude Code was installed fresh, run `claude` once to sign in.
3. Run `/mcp` once to authorize Context7.

To update, run the same command again.

## What makes the difference

These are the habits that separate a great result in 45 minutes from 4 hours of slop. Each one is built in:

| Habit | Where |
|---|---|
| **A target, and a way to check it.** Claude pins a concrete target (reference images, the exact expected output, or a number), then loops: build, look at the real output, compare, fix. | `/toolkit:build-to-target` |
| **Done means verified.** Before saying something works, Claude runs the narrowest check that proves it, and says what it couldn't verify. | `guardrails` rules |
| **A lean CLAUDE.md for each project, learned from your sessions.** Claude detects the stack and writes the verified commands. It also turns off plugins the project doesn't use, and turns tasks you repeat into project skills. Claude offers this automatically in any project without a CLAUDE.md. | `/toolkit:specialize` |
| **Simplest solution first.** Before writing code, Claude asks whether there's a simpler way. | `guardrails` rules |
| **No test slop or doc sprawl.** Claude writes tests only for what can break, with no coverage targets, and adds no new doc files unless you ask. | `guardrails` |
| **Ask, don't guess.** When a request is ambiguous, Claude asks one question at a time until it's confident. | `guardrails` rules |

Helper agents get the same rules.

## Plugins

| Plugin | Why |
|---|---|
| `guardrails` (this repo) | The rules above, plus a nudge when Claude creates a doc file you didn't ask for. |
| `toolkit` (this repo) | `build-to-target`, `specialize`, and `verification-loop`. `/tdd-workflow` and `/launch-check` (a 20-item pre-launch website checklist) run only when you call them. Also `/build-fix` for minimal build fixes, and a silent-failure-hunter agent. |
| `pyright-lsp`, `typescript-lsp` | Show type errors right after each edit. `specialize` turns them off in projects that don't use the language. |
| `context7` | Up-to-date library docs for the version you're using, so Claude invents fewer APIs. |
| `security-guidance` | Warns about risky code patterns on each edit. Commits and pushes are reviewed with Sonnet. Its per-turn Opus review (about 30k tokens a turn) is turned off in `settings.json`. |
| [taste-skill](https://github.com/Leonxlnx/taste-skill) | Art direction for web UI, with real images and a check in a real browser. Web projects only. |
| [i-have-adhd](https://github.com/ayghri/i-have-adhd) | Answers lead with the next action, steps are numbered, and progress stays visible. It's always on. Say "stop adhd mode" to turn it off for a session, or delete `~/.claude/.i-have-adhd-always` to make it on-demand. |

Everything runs on your Claude subscription's usage limits, and nothing is billed separately. Don't set `ANTHROPIC_API_KEY`, which would switch Claude Code to API billing.

## Free habits

- Start complex tasks in plan mode (Shift+Tab twice).
- Run `/clear` when you switch tasks, and `/compact` when context passes about 60%. Long sessions re-read everything on every turn.
- Run `/context` to see what's using tokens.
- Use the built-in `/code-review`, `/security-review` and `/simplify`. Nothing here duplicates them.
- Every few months, run a task with `claude --bare` (no hooks, plugins or LSP), and keep only what still helps.

## Customize

- **Plugins:** edit `plugins.txt`. For third-party plugins, also add their source to `marketplaces.txt`.
- **Rules:** edit `plugins/guardrails/rules.md`.
- **Environment defaults:** edit `settings.json`. Values already set on a machine take priority.

Then push, and re-run the install command on each machine.

## License

[MIT](LICENSE): free to use. If you republish or repackage it, keep the copyright notice. Some toolkit files come from [ECC](https://github.com/affaan-m/ECC), also MIT (`plugins/toolkit/LICENSE-ECC.txt`).
