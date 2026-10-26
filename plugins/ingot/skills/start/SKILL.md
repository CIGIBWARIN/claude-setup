---
name: start
description: Ingot's entry point. Routes this folder to kickoff (empty), specialize (not tuned), cleanup (messy code) or update (tuned over 30 days ago), else shows status. Use when the user says start or set up, asks what to do here, or accepts Ingot's offer.
---

# Ingot start

## 1. Read the folder

- **Files:** list them, ignoring dotfiles, `desktop.ini` and `Thumbs.db`.
- **Tuning stamp:** check whether `.claude/.ingot-checked` exists (the older `.claude/.claude-setup-checked` counts too), and note its date.
- **Instructions:** check whether `CLAUDE.md`, `.claude/CLAUDE.md` or `AGENTS.md` exists.

## 2. Route

| Folder state | Do |
|---|---|
| Empty | run `/ingot:kickoff` |
| Has code that looks neglected, and the user wants it fixed (stray summary docs, dead files, failing build, no tests anywhere, secrets in code) | offer `/ingot:cleanup`, then `/ingot:specialize` |
| No tuning stamp | run `/ingot:specialize` |
| Stamp older than 30 days | run `/ingot:update` |
| Otherwise | show the status below |

If two rows fit, ask once which the user wants, recommending the first.

## 3. Status (when nothing needs doing)

Show these in a short table:

- **Category and settings:** the project's category, the reply style and the coaching level, as `/ingot:settings` would show them.
- **Plugins:** which ones are enabled for this project, from `claude plugin list --json` and the project's `.claude/settings.json`.
- **Packs:** any installed in this project.
- **Last tuned:** the date of the stamp.

Then list the commands, one line each:

- `/ingot:specialize` re-tunes the project
- `/ingot:cleanup` fixes old code
- `/ingot:build-to-target` builds to a target and checks the result
- `/ingot:launch-check` runs a website pre-launch check
- `/ingot:settings` changes the reply style and coaching level
- `/ingot:update` refreshes everything
