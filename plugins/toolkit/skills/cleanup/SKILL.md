---
name: cleanup
description: One-command cleanup of an existing project. It finds and fixes the most glaring problems (dead code, over-engineering, test slop, doc bloat, silent failures, hardcoded secrets) in safe, verified, separately committed steps.
disable-model-invocation: true
---

# Cleanup

Fix the worst problems in this project without breaking it. Every change must be reversible and verified.

## 1. Make it safe

- If the folder isn't a git repo, run `git init`. Add a `.gitignore` that covers secrets, dependencies and build output, then commit everything as "baseline before cleanup".
- If it is a git repo, make sure the working tree is clean (ask if it isn't), then create a `cleanup` branch.
- Never delete `.env` files, backups, data, logs, or anything in folders named `backups`, `_to_delete` or `archive`. Ask about those.

## 2. Learn the project

If there's no CLAUDE.md, run `/toolkit:specialize` first. You need the real commands to build, test and run the project. If there are no tests at all, find the command that proves the project still works, such as running it, building it or loading it. Run it once now as the "before" check.

## 3. Find the glaring issues, then show the list before touching anything

Rank the findings by impact. Each one needs a concrete file and reason:

1. **Hardcoded secrets.** Move them to env vars. Tell the user to rotate any secret that was committed.
2. **Silent failures:** empty catch blocks, swallowed errors, bad fallbacks. Use the silent-failure-hunter agent.
3. **Dead code:** files, functions and dependencies nothing uses. Grep for each one before calling it unused.
4. **Over-engineering:** abstractions, wrappers, config and options with a single real use. Replace each with the plain version.
5. **Test slop:** tests that assert nothing real, only check mocks, or duplicate each other. Keep every test that would catch a real bug.
6. **Doc bloat:** summary `.md` files, essay comments, duplicate READMEs. Keep one short, accurate README.
7. **Duplication:** near-copies that have to change together. Merge them.

Skip style preferences. Only list things with a real cost.

## 4. Fix one category at a time, after approval

For each category:

1. Make the changes.
2. Run the "before" check again.
3. Commit with a message like `cleanup: remove dead code`.

If a check fails, fix it or revert that category. Don't move on with a broken project.

## 5. Report

- Lines and files before and after.
- What was removed or fixed, per category, with how each was verified.
- What still needs the user's decision.
- How to undo: `git log` shows one commit per category. On the `cleanup` branch, merge it when happy.
- If the project is a website, offer to run `/toolkit:launch-check`.
