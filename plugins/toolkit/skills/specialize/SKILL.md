---
name: specialize
description: Tailor Claude to the current project. It detects the stack, writes or trims a lean CLAUDE.md with the real, verified commands, turns off plugins this project doesn't need, and turns repeated work from past sessions into project skills. Use when starting in a new project, when the user says tune, specialize, or optimize Claude for this repo, or every few weeks.
---

# Specialize Claude for this project

The goal is the smallest project setup that makes Claude right the first time. Deleting beats adding.

## 1. Detect the stack and the real commands

- Read the manifests that exist: package.json, pyproject.toml, requirements*.txt, Cargo.toml, go.mod, Makefile, Dockerfile, compose files, and manifest.json for extensions.
- List the languages by file extension (`git ls-files`, or a shallow directory listing that skips node_modules, .git, and virtualenvs).
- Find the exact commands to install, build, test, lint, and run or serve. Run the build or test command once to confirm it works. A command you didn't verify gets "(unverified)" next to it.

## 2. Write or trim the project CLAUDE.md (60 lines at most)

Include only what Claude can't infer from the code:

- one line on what the project is
- the verified commands from step 1
- a map of the top-level directories, one line each
- conventions that differ from the defaults, and known gotchas

If a CLAUDE.md already exists, keep the user's own rules. Delete stale, duplicated, or obvious lines. Don't add generic advice like "write clean code".

## 3. Turn off plugins this project doesn't use

In `.claude/settings.json`, set `enabledPlugins` to `false` for:

- `pyright-lsp@claude-plugins-official` if there are no .py files
- `typescript-lsp@claude-plugins-official` if there are no .ts, .tsx, .js, or .jsx files
- `taste-skill@taste-skill` if there's no web UI (no .html, .css, .jsx, .tsx, .vue, or .svelte files)

Never turn off guardrails, toolkit, i-have-adhd, or security-guidance. Skip this step for an empty project.

## 4. Learn from past sessions

Past transcripts are in `~/.claude/projects/<slug>/*.jsonl`. The slug is the project's full path with `:`, `\`, `/`, and `_` replaced by `-`, for example `C--Users-me-code-app`.

1. Read the newest 10 transcripts. Look only at user messages and failed tool results.
2. Look for three things:
   - an instruction the user had to repeat, which becomes one line in CLAUDE.md
   - a wrong command or path Claude kept using, which gets fixed in CLAUDE.md
   - a multi-step task done three or more times, which becomes a project skill in `.claude/skills/<name>/SKILL.md`, under 40 lines. Propose 2 at most.
3. Show the proposed skills and ask before writing them.

## 5. Report

- What changed, with lines added and removed in CLAUDE.md.
- Which plugins were turned off.
- What you proposed but didn't do.

Commit the changes only if the user asks.
