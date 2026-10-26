---
name: update
description: Bring Ingot up to date. It updates Claude Code, the plugins, the shared tools and the defaults, removes leftovers from deleted projects, and re-checks the project's CLAUDE.md. Use when the user asks to update, or when Claude offers it.
---

# Update

## 1. Everything shared

1. Run `claude update`. This updates the terminal version of Claude Code. The desktop app has its own copy, so in the desktop app also tell the user to use Help > Check for Updates (Claude > Check for Updates on a Mac).
2. In the project folder, run `npx -y github:CIGIBWARIN/ingot`. This re-runs the installer for this project (and for the whole PC too, if Ingot was set up with `--user`). It adds new plugins, removes retired ones, updates the rest along with yt-dlp and the language servers, and re-applies the defaults.
3. Run `npx -y github:CIGIBWARIN/ingot --prune` to clear plugin entries left by deleted project folders.
4. If either command reports a "Not installed:" block, pass it on word for word.

## 2. This project (when inside one)

- **With a CLAUDE.md:**
  - run each command it lists, and fix any that fail
  - remove lines about files or folders that no longer exist
  - keep the user's own rules
- **No CLAUDE.md, or Claude was never tuned here:** offer `/ingot:specialize`.
- **Afterwards:** create or refresh the empty file `.claude/.ingot-checked`.

## 3. Report

Give one line each for:

- what was updated
- what was fixed
- whether a restart is needed, and if so say "restart Claude"
- any decisions waiting on the user

Then add a tip: `/doctor` checks the setup for problems and suggests trims to CLAUDE.md.
