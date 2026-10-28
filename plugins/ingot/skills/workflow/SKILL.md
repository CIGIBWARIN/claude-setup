---
name: workflow
description: Optimize how this whole project gets done, not just its code. Gathers evidence (git history, past sessions, scripts, docs), interviews the user, maps the real workflow, then applies only approved improvements. Use when asked to optimize, streamline or speed up a project's workflow.
---

# Workflow

Goal: make the whole way this project gets done faster and less error-prone, from idea to finished result in someone's hands. That includes the code, but also everything around it: planning, content, data entry, reviews, deploys, handoffs, approvals and repeated chores. Work from evidence and the user's own words, never from assumptions. Until the user confirms something you inferred, label it "assumption".

## 1. Gather evidence (read-only)

Note each finding with its source.

- **What the project is for, and who uses it:** README, CLAUDE.md or AGENTS.md, docs.
- **How work really happens:**
  - `git log` shows the rhythm, what gets fixed again and again, reverts and long gaps.
  - Past Claude sessions for this folder show repeated requests, corrections and multi-step tasks done by hand. Find them as `/ingot:specialize` section 6 does (auto memory first, then the user messages of the newest transcripts), and don't read raw transcript files.
- **Steps outside the code:** scripts, CI, deploy files, task or status lists, scheduled jobs, and any service, dashboard, spreadsheet or person the docs or sessions mention.

Don't assume it's software. A content, research, business or operations project has a workflow too.

## 2. Ask what the evidence can't show

Ask one batch of at most 5 questions. Give each one your evidence-based guess as the default answer, and say where the guess came from.

- What does one full cycle look like, from start to done?
- Where does time go that feels wasted, and what gets put off?
- What breaks or has to be redone most often?
- Who else is involved, and where does work wait on someone?
- What must not change: tools, rules, people or deadlines?

## 3. Map the current workflow

Write it as numbered steps. Each step has who does it, the tool, a rough time and its pain point. Mark every step that is still an assumption. Show the map, and correct it with the user before proposing anything.

## 4. Find the biggest wins

For each pain point, name the root cause and its evidence. Then rank the fixes by time saved × how often it happens ÷ effort. Prefer, in this order:

1. Remove the step.
2. Let Claude do it: a project skill, or a line in CLAUDE.md.
3. Automate it: a script, hook, scheduled task or CI job.
4. Add a tool or a pack from `/ingot:specialize`.

For each fix, say what it costs (setup time, context, accounts, money) and how you'll know it worked. Leave out anything the evidence doesn't support, and say what stays uncertain.

## 5. Agree, then apply one at a time

Show at most 5 changes in a table: change, why (evidence), effort, how to check. Apply only the ones the user approves, one at a time, and run each once to verify it. Never change shared systems, accounts or other people's processes without an explicit yes. Add a short "Workflow" section to CLAUDE.md naming what changed and how to use it.

## 6. Report

Give one line each for:

- what changed and how to use it
- what to watch, to tell whether it helped
- what was left out, and why

Offer to run `/ingot:workflow` again in a few weeks and compare against today's map.
