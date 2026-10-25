---
name: kickoff
description: Give a new project a strong start, whether it's an app or website, a script or automation, or a writing, research, data or design project. Figure out what the user is making, pick the simplest setup that fits, produce a first real result, and leave a lean CLAUDE.md.
disable-model-invocation: true
---

# Kickoff

Go from idea to a first real result the user can see, with nothing extra.

## 1. Understand the idea

Ask one question at a time, and stop as soon as you know enough:

- What are you making, and who is it for? One sentence.
- What kind is it? An app or website, a script or automation, writing or content, research, data analysis, or design.
- What's the one result the first version must deliver?

If the user already said all of this, skip straight to step 2.

## 2. Pick the simplest setup that fits

- **Software:** pick the stack with the fewest moving parts. Use plain HTML/CSS/JS before a framework, and one file before many. Add a database only when data must persist across users or devices. Prefer what the user already knows or has installed.
- **Writing or content:** start with a few folders at most (for example `drafts/`, `final/`, `assets/`) and a short voice and audience section in CLAUDE.md. Use `/watch` for video references, and let humanizer polish the prose.
- **Research or data:** keep `sources/` or `data/` for inputs and one output file such as a report, notes or a notebook. Record where every number or claim came from.
- **Design:** pin a visual target first (references or a short brief), then use `/toolkit:build-to-target`.

State the choice and the reason in one or two lines, plus one bigger alternative. Then proceed unless the user objects. If an optional pack from `/toolkit:specialize` clearly fits, such as marketing, research or video, mention it in one line.

## 3. Set up

- Run `git init` so every step can be undone. Add a `.gitignore` that covers secrets, dependencies and build output.
- For software, put secrets in a `.env` file, plus a `.env.example` holding placeholder values.
- Don't add CI, Docker, linters, test frameworks or extra scaffolding yet. Add each one when it's needed.

## 4. Produce the first real result

- Make the one core thing for real: a running app, a working script, a finished first draft, a first analysis with its sources, or a design that matches its target. For anything visual, use `/toolkit:build-to-target`.
- Show the user how to see or use it. Give the exact command, URL or file path.

## 5. Leave it in good shape

1. Write a CLAUDE.md of 30 lines or fewer: what it is, who it's for, the commands or workflow (checked), and the layout.
2. Commit with the message "first version".
3. Suggest the next 3 steps, smallest first.
