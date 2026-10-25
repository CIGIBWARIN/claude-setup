---
name: update
description: Bring this Claude Code setup up to date. It updates Claude Code, the plugin sources and the plugins, then checks that the project's CLAUDE.md still matches reality. Run inside the claude-setup repo itself to also review upstream changes for the next release.
disable-model-invocation: true
---

# Update

Run each step, then report what changed. Ask before anything you can't undo.

## 1. Claude Code and plugins (everyone)

1. Run `claude update`.
2. Run `claude plugin marketplace update`. This refreshes every plugin source.
3. For each plugin in `claude plugin list --json`, run `claude plugin update <id> --scope <its scope>`.
4. Run `npx -y github:CIGIBWARIN/claude-setup --prune` to clear plugin entries left behind by deleted project folders.
5. List what moved from one version to another. "Restart to apply" means the user needs to restart Claude.

## 2. This project (everyone, in a project folder)

- If there's a CLAUDE.md, run each command it lists. Fix any command that fails, and remove lines about files or folders that no longer exist. Keep the user's own rules.
- If there's no CLAUDE.md, offer to run `/toolkit:specialize`.

## 3. Maintainer review (only inside the claude-setup repo)

Skip this section unless the current folder has `.claude-plugin/marketplace.json` with `"name": "claude-setup"`.

1. **Third-party plugins** in `marketplaces.txt`: for each GitHub repo, compare the latest commit with the last reviewed one using `gh api repos/<owner>/<repo>/compare/<old>...HEAD`, or check recent commits if there's no record yet. Read any changes to hooks, scripts or MCP config. That code runs on users' machines. Flag anything that adds network calls, account requirements or paid services. Recommend keeping, pinning or dropping each one.
2. **ECC upstream:** compare `plugins/toolkit/ecc-commit.txt` against `affaan-m/ECC` HEAD for the files we adapted (`tdd-workflow`, `verification-loop`, `build-fix`, `build-error-resolver`, `silent-failure-hunter`). Port only real fixes. Keep our trims: no coverage targets and no report files.
3. **New Claude Code built-ins:** read the recent release notes (`claude --version`, then the changelog). If a built-in now does what one of our skills, rules or plugins does, propose removing ours.
4. **Weight check:** run `claude plugin details <name>` for each plugin to see its token cost. Propose trimming anything heavy that doesn't earn its place. Every few months, suggest a test session with `claude --bare`.
5. **New resources:** look through the official marketplace and popular community skills for free options with no account requirement that clearly beat something here. Core is only for things nearly every session uses. Anything niche goes in `plugins/toolkit/skills/specialize/packs.md`. Propose at most one core change, and check that every pack in `packs.md` still installs.

Then:

1. Show the proposed changes as a list.
2. Apply the ones the user approves.
3. Update `ecc-commit.txt` if the ECC changes were ported.
4. Run `claude plugin validate .`.
5. Commit and push only after the user says so.

## Report

Give one line each for:

- what was updated
- what was fixed
- what needs a restart
- any decisions waiting on the user
