---
name: style
description: Switch Claude's reply style. lite (the default) puts the answer first and numbers steps. core is the full ADHD-friendly set, with the next action first, state restated every turn and visible wins. off turns both off.
argument-hint: lite | core | off
disable-model-invocation: true
---

# Reply style

1. Read the requested style from the arguments: `lite`, `core` or `off`. If none is given, show the current value of `env.CLAUDE_SETUP_STYLE` in `~/.claude/settings.json` (it's `lite` when unset) and ask which one they want.
2. Set `env.CLAUDE_SETUP_STYLE` to that value in `~/.claude/settings.json`. Keep every other setting.
3. Say it applies from the next session, which means a restart or `/clear`.
