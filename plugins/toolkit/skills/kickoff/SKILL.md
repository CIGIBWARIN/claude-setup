---
name: kickoff
description: Give a new project a strong start. Figure out what the user is building, pick the simplest stack that fits, set up git, build the smallest working version, prove it runs, and leave a lean CLAUDE.md.
disable-model-invocation: true
---

# Kickoff

Go from idea to a working first version the user can see, with nothing extra.

## 1. Understand the idea

Ask one question at a time, and stop as soon as you know enough:

- What is it, and who is it for? One sentence.
- Where does it run? A website, a phone, a desktop app, a script, a browser extension, a bot.
- What's the one thing it must do in its first version?

If the user already said all of this, skip straight to step 2.

## 2. Pick the simplest stack that fits

- Prefer what needs the fewest moving parts. Use plain HTML/CSS/JS before a framework, and one file before many. Add a database only when the data must persist across users or devices.
- Use what the user already knows or has installed, where that's reasonable.
- State the choice and the reason in one or two lines, plus one bigger alternative. Then proceed unless the user objects.

## 3. Set up

- Run `git init`. Add a `.gitignore` for the stack that covers secrets, dependencies and build output.
- Put secrets in a `.env` file, plus a `.env.example` holding placeholder values.
- Don't add CI, Docker, linters, test frameworks or folder scaffolding yet. Add each one when it's needed.

## 4. Build the smallest version that works end to end

- Build the one core feature, running for real. For anything visual, use `/toolkit:build-to-target`: pin a target look, build, look at the result, and fix it.
- Run it and show the user how to open or use it. Give the exact command or URL.

## 5. Leave it in good shape

1. Write a CLAUDE.md of 30 lines or fewer: what it is, the commands to run it (checked), and the layout.
2. Commit with the message "first working version".
3. Suggest the next 3 steps, smallest first.
