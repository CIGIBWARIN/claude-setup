---
name: maintain
description: Maintainer review for the Ingot repo. It checks upstream changes in the third-party plugins and ECC, new Claude Code built-ins that make parts of this repo redundant, context cost, and new resources worth adding. Proposes changes, applies the approved ones, validates, then asks before committing.
disable-model-invocation: true
---

# Maintain Ingot

Goal: one install that keeps Claude Code at its best for coding, content, agentic and research work, with nothing always-on that doesn't earn its context cost.

1. **Third-party plugins** (`marketplaces.txt`): for each GitHub repo, read the commits since the last review (`gh api repos/<owner>/<repo>/commits?since=<date>`).
   - Read any changes to hooks, scripts or MCP config, since that code runs on users' machines.
   - Flag new network calls, account requirements or paid tiers.
   - Recommend keeping, bumping the pin or dropping each one.
   - **Before moving a pin,** run `node evals/run.mjs <marketplace> --ref <new tag>`. Bump the tag in `marketplaces.txt` only if it passes, and say what changed in the scores.
   - **Cases that need a shell** (`claude-video`, `ingot/verify-before-done`) can't run on native Windows. On this PC, run them in the signed-in WSL sandbox: `wsl -d ingot-evals -- bash -lc "cd ~/ingot && git pull -q && node evals/run.mjs claude-video"`.
2. **ECC upstream:** compare `plugins/ingot/ecc-commit.txt` against `affaan-m/ECC` HEAD for `silent-failure-hunter.md`.
   - Port only real fixes.
   - Update `ecc-commit.txt` if you do.
3. **Claude Code built-ins:** read the changelog since the last review (https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md).
   - If a built-in now does what one of our rules, tips or skills does, propose removing ours.
   - If a built-in is worth pointing users to, propose a coach line or a spinner tip in `settings.json`.
4. **Context cost:**
   - Run `claude plugin details <id>` for each plugin in `plugins.txt`.
   - Measure the hook-injected text: `plugins/ingot/rules.md`, `coach/*.md`, `style/*.md` and `categories/*.md`.
   - Propose trimming anything heavy that doesn't earn its place. Rules should state judgement, not long checklists.
5. **Resources:** look at the official marketplace and popular community skills for free options with no account requirement that clearly beat something here.
   - Core is only for things nearly every session uses. Niche items go in `plugins/ingot/skills/specialize/packs.md`.
   - Check that every pack in `packs.md` still installs.
6. **Compliance rules:** open `plugins/ingot/skills/compliance/reference.md`. Re-check each row against its source link, update anything that changed (thresholds, dates, new rules), and set the date at the top. Never change a rule without a source.
7. **Apply and validate:** show the proposed changes as a list and apply the ones approved.
   - Run `claude plugin validate .`.
   - Test the hooks by piping sample JSON into `node plugins/ingot/hooks/*.mjs`.
   - Run `node --check setup.mjs`.
   - If rules, coaching or skills changed, run `node evals/run.mjs ingot`.
   - Commit and push only when the user says so. Pushing `main` reaches no users.
8. **Release:** when `node evals/check.mjs`, the GitHub check and the affected evals pass, and the user says to release, run `git push origin main:stable`. Users get it the next time they run the install line or `/ingot:update`.
