---
name: cleanup
description: Fix the worst problems in an existing project (dead code, over-engineering, test slop, doc bloat, silent failures, hardcoded secrets) in safe, verified, separately committed steps. Use when asked to clean up or fix old code.
---

# Cleanup

Fix the worst problems without breaking anything. Every change must be reversible and verified.

## 1. Make it safe

1. Before any commit, scan for secrets and bulky files:
   - Grep for keys, tokens and passwords (`api_key`, `secret`, `token`, `password`, `sk-`, `-----BEGIN`).
   - List files over 50 MB, plus data, backup and dependency folders.
2. Add all of those to `.gitignore`. Move any hardcoded secret into a `.env` file now.
3. If the folder isn't a git repo, run `git init` and commit as "baseline before cleanup".
4. If it is a repo, make sure the working tree is clean (ask if it isn't), then create a `cleanup` branch.
5. Never delete `.env` files, backups, data, logs, or anything in folders named `backups`, `_to_delete` or `archive`. Ask about those.

## 2. Learn the project

If Claude was never tuned here, run `/ingot:specialize` first to get the real commands. Then find the one check that proves the project works (its tests, a build, or running it) and run it once as the "before" baseline.

## 3. Find the glaring issues, and show the list before changing anything

Rank by impact, and give each finding a file and a concrete reason:

1. **Secrets** already in code or git history. Tell the user to rotate any that were committed.
2. **Silent failures:** swallowed errors, empty catch blocks and bad fallbacks. Use the silent-failure-hunter agent.
3. **Dead code:** files, functions and dependencies nothing uses. Grep for each one before calling it unused.
4. **Over-engineering:** abstractions, wrappers or options with only one real use. Replace each with the plain version.
5. **Test slop:** tests that check nothing real, only check mocks, or duplicate each other. Keep every test that would catch a real bug.
6. **Doc bloat:** stray summary files, essay comments and duplicate READMEs. Keep one short, accurate README.
7. **Duplication:** near-copies that must change together. Merge them.

Skip anything that's only style. List only problems with a real cost.

## 4. Fix one category at a time, after approval

Make the changes, rerun the baseline check, then commit as `cleanup: <category>`. If the check fails, fix it or revert that category before moving on.

## 5. Report

Report:

- the number of files and lines before and after
- what changed in each category, and how it was verified
- what still needs the user's decision

Then offer to merge the `cleanup` branch. If the project is a website, offer `/ingot:launch-check`.
