---
name: settings
description: Show or change Ingot's settings. Covers the reply style (off, lite or core), the coaching level (off, light, full or extra), and this project's category (coding, content, agentic or research).
argument-hint: "[style lite|core|off] [coach off|light|full|extra] [category coding,content,agentic,research]"
disable-model-invocation: true
---

# Ingot settings

| Setting | Values | Default | Stored in |
|---|---|---|---|
| `style` | `off`; `lite` (answer first, numbered steps); `core` (full ADHD-friendly set) | `lite` | `~/.claude/settings.json` as `env.INGOT_STYLE` |
| `coach` | `off`; `light` (3 key tips); `full` (core tips); `extra` (also suggests any fitting slash command) | `full` | `~/.claude/settings.json` as `env.INGOT_COACH` |
| `category` | one or more of `coding`, `content`, `agentic`, `research` | auto (coding if code is found) | this project's `.claude/settings.json` as `env.INGOT_CATEGORY` |

1. **With no arguments,** show the current values from those files, using the defaults for anything unset. Then ask which one to change.
2. **With arguments,** write each value to its file and keep every other setting. Reject any value not in the table.
3. **Finish** by saying the change applies from the next session (a restart, or `/clear`).
