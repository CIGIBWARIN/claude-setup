---
name: maintain
description: Maintainer review for the claude-setup repo. It checks upstream changes in the third-party plugins and ECC, new Claude Code built-ins that make parts of this repo redundant, context cost, and new resources worth adding. Proposes changes, applies the approved ones, validates, then asks before committing.
disable-model-invocation: true
---

# Maintain claude-setup

Goal: one install that keeps Claude Code at its best for coding, content, agentic and research work, with nothing always-on that doesn't earn its context cost.

1. **Third-party plugins** (`marketplaces.txt`): for each GitHub repo, read the commits since the last review (`gh api repos/<owner>/<repo>/commits?since=<date>`).
   - Read any changes to hooks, scripts or MCP config, since that code runs on users' machines.
   - Flag new network calls, account requirements or paid tiers.
   - Recommend keeping, pinning or dropping each one.
2. **ECC upstream:** compare `plugins/toolkit/ecc-commit.txt` against `affaan-m/ECC` HEAD for `silent-failure-hunter.md`.
   - Port only real fixes.
   - Update `ecc-commit.txt` if you do.
3. **Claude Code built-ins:** read the changelog since the last review (https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md).
   - If a built-in now does what one of our rules, tips or skills does, propose removing ours.
   - If a built-in is worth pointing users to, propose a coach line or a spinner tip in `settings.json`.
4. **Context cost:**
   - Run `claude plugin details <id>` for each plugin in `plugins.txt`.
   - Measure the hook-injected text: `plugins/guardrails/rules.md`, `coach.md`, `style/*.md` and `categories/*.md`.
   - Propose trimming anything heavy that doesn't earn its place. Rules should state judgement, not long checklists.
5. **Resources:** look at the official marketplace and popular community skills for free options with no account requirement that clearly beat something here.
   - Core is only for things nearly every session uses. Niche items go in `plugins/toolkit/skills/specialize/packs.md`.
   - Check that every pack in `packs.md` still installs.
6. **Apply and validate:** show the proposed changes as a list and apply the ones approved.
   - Run `claude plugin validate .`.
   - Test the hooks by piping sample JSON into `node plugins/guardrails/hooks/*.mjs`.
   - Run `node --check setup.mjs`.
   - Commit and push only when the user says so.
