---
name: specialize
description: Tailor Claude to the current project. Sets the project's general category (coding, content, agentic or research), which picks the rules and tools that load. Then handles the specifics: a lean CLAUDE.md with the real commands or workflow, unused plugins turned off, matching packs, and skills learned from past sessions. Use on first opening a project, when the user asks to tune, specialize or optimize Claude for it, or every few weeks.
---

# Specialize Claude for this project

Two levels: first the general category, then this project's specifics. Aim for the smallest setup that gets Claude right the first time. Deleting beats adding.

## 1. General: pick the category

Look at the files, then pick one or two categories:

| Category | Signs |
|---|---|
| `coding` | apps, sites, scripts, extensions; manifests like package.json or pyproject.toml; source files |
| `content` | writing, social posts, newsletters, scripts, video or visual design; drafts in .md, .docx or .txt; brand assets |
| `agentic` | automations, ops, scheduled jobs, browser or admin tasks; workflow notes, configs for outside services |
| `research` | sources, notes, PDFs, datasets, analysis, reports; an Obsidian vault |

If it's still unclear, ask one question: what is this project for, and who is it for? Then set `env.INGOT_CATEGORY` in `.claude/settings.json` (for example `"coding"` or `"content,research"`) and keep every other setting. From the next session on, that category's rules load automatically.

## 2. Specific: how work gets done here

- **Coding:** find the exact commands to install, build, test, lint and run. Run the build or test once to confirm it works, and mark anything you couldn't verify "(unverified)".
- **Everything else:** find where inputs live, where finished work goes, and the house style (voice, tone, formats, naming, audience). Take these from existing finished work, never invent them.

## 3. Write or trim CLAUDE.md (60 lines at most)

Include only what Claude can't infer: one line on what the project is and who it's for; the verified commands or workflow steps; a map of the top-level folders, one line each; conventions that differ from the defaults; and known gotchas.

If a CLAUDE.md, `.claude/CLAUDE.md` or `AGENTS.md` already exists, edit that file. Keep the user's own rules, and delete stale, duplicated or obvious lines.

## 4. Turn off what this project doesn't use

In `.claude/settings.json` `enabledPlugins`, set these to `false`:

- **Projects with no code:** `pyright-lsp@claude-plugins-official`, `typescript-lsp@claude-plugins-official`, `context7@claude-plugins-official` and `security-guidance@claude-plugins-official`.
- **Code projects without Python:** `pyright-lsp@claude-plugins-official`.
- **Code projects without TS/JS:** `typescript-lsp@claude-plugins-official`.
- **Projects with no web UI:** `taste-skill@taste-skill`.

Never turn off ingot, humanizer or watch.

## 5. Suggest packs that fit

Read `packs.md` in this skill's folder. Suggest up to 2 packs that clearly match the category and the project, with one line each on why. Install only the ones the user approves, following `packs.md`.

## 6. Learn from past sessions

1. Auto memory already saves the user's corrections, so start with those. For a shared CLAUDE.md, promote only the ones that apply to anyone working on the project.
2. Then check past transcripts. List `~/.claude/projects/` and pick the folder whose name equals this project's full path with every character that isn't a letter or digit replaced by `-`, for example `C:\Users\Ann Lee\my.site` becomes `C--Users-Ann-Lee-my-site`.
3. Don't read the raw files. Pull out only the user messages from the newest 10 transcripts:
   `node -e "const fs=require('fs'),d=process.argv[1];for(const f of fs.readdirSync(d).filter(f=>f.endsWith('.jsonl')).map(f=>[f,fs.statSync(d+'/'+f).mtimeMs]).sort((a,b)=>b[1]-a[1]).slice(0,10).map(x=>x[0]))for(const l of fs.readFileSync(d+'/'+f,'utf8').split('\n')){try{const m=JSON.parse(l);if(m.type==='user'&&typeof m.message?.content==='string')console.log(m.message.content.slice(0,300))}catch{}}" "<folder>"`
4. Look for:
   - instructions the user had to repeat, which become one CLAUDE.md line
   - wrong commands or paths, which get fixed in CLAUDE.md
   - multi-step tasks done 3 or more times, which become a project skill in `.claude/skills/<name>/SKILL.md` of under 40 lines. Propose 2 at most, and ask before writing.

## 7. Finish

1. Create or refresh the empty file `.claude/.ingot-checked`. This keeps Claude from nagging, and its date tells `/ingot:update` when this was last done.
2. Report:
   - the category
   - the CLAUDE.md change, in lines added and removed
   - which plugins were turned off
   - which packs were suggested or installed
   - anything proposed but not done

Offer to commit the changes, but don't commit unasked.
