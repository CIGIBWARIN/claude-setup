---
name: specialize
description: Tailor Claude to the current project, whatever it is (code, writing or content, research, data, design, or business work). It writes a lean CLAUDE.md with the real commands or workflow, turns off plugins the project doesn't need, suggests optional packs that fit, and turns repeated work from past sessions into project skills. Use when starting in a project, when the user says tune, specialize, or optimize Claude for this, or every few weeks.
---

# Specialize Claude for this project

The goal is the smallest project setup that makes Claude right the first time. Deleting beats adding.

## 1. Work out what kind of project this is

Look at the files. A project can be several of these at once:

- **Code:** manifests like package.json, pyproject.toml, requirements*.txt, Cargo.toml, go.mod, Makefile, Dockerfile or manifest.json, plus source files.
- **Writing or content:** drafts, posts, scripts or newsletters in .md, .docx or .txt. Look for a style guide, published or drafts folders, and media assets.
- **Research:** notes, sources, PDFs, an Obsidian vault (`.obsidian/`).
- **Data:** CSV, Excel, Parquet or JSON datasets, notebooks, reports.
- **Design:** images, Figma exports, HTML or CSS mockups, brand assets.
- **Business or ops:** proposals, contracts, spreadsheets, SOPs.

If the purpose is still unclear, ask one question: "What is this project for, and who is it for?"

## 2. Find how work gets done here

- **Code:** find the exact commands to install, build, test, lint and run. Run the build or test command once to confirm it works. Mark any command you couldn't verify "(unverified)".
- **Everything else:** find where inputs live and where finished work goes. Then find the house style: voice, tone, formats, file naming and the audience. Pull these from existing finished work, and don't invent them.

## 3. Write or trim the project CLAUDE.md (60 lines at most)

Include only what Claude can't infer on its own:

- one line on what the project is and who it's for
- the verified commands, or the workflow steps
- a map of the top-level folders, one line each
- conventions: code style that differs from the defaults, or the writing voice and formats
- known gotchas

If a CLAUDE.md already exists, keep the user's own rules. Delete stale, duplicated or obvious lines. Don't add generic advice.

## 4. Turn off plugins this project doesn't use

In `.claude/settings.json`, set `enabledPlugins` to `false` for:

- `pyright-lsp@claude-plugins-official` if there are no .py files
- `typescript-lsp@claude-plugins-official` if there are no .ts, .tsx, .js or .jsx files
- `taste-skill@taste-skill` if there's no web UI

Never turn off guardrails, toolkit, i-have-adhd, security-guidance, humanizer or watch. Skip this step for an empty project.

## 5. Suggest packs that fit

Read `packs.md` in this skill's folder. If the project clearly matches a pack, suggest up to 2, one line each on why. Install only the ones the user approves, following the steps in `packs.md`.

## 6. Learn from past sessions

Past transcripts are in `~/.claude/projects/<slug>/*.jsonl`. The slug is the project's full path with `:`, `\`, `/` and `_` replaced by `-`, for example `C--Users-me-code-app`.

1. Read the newest 10 transcripts. Look only at user messages and failed tool results.
2. Look for three things:
   - an instruction the user had to repeat, which becomes one line in CLAUDE.md
   - a wrong command, path or format Claude kept using, which gets fixed in CLAUDE.md
   - a multi-step task done three or more times, which becomes a project skill in `.claude/skills/<name>/SKILL.md`, under 40 lines. Propose 2 at most.
3. Show the proposed skills and ask before writing them.

## 7. Report

- What changed, with lines added and removed in CLAUDE.md.
- Which plugins were turned off.
- Which packs were suggested or installed.
- What you proposed but didn't do.

Commit the changes only if the user asks.
