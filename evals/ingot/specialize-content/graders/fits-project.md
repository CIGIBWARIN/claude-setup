---
type: llm
weight: 2
---

The folder is a gardening newsletter: a style guide, published issues and drafts, no code. Writes inside `.claude/` are blocked in this test, so reporting the settings it would set counts as setting them.
PASS only if all of these hold:
1. The final reply reports the category as content (research may be added, coding may not).
2. It wrote or changed a CLAUDE.md, and the rules it describes putting there come from the style guide or the existing files; rules it only inferred are offered as suggestions, not written in.
3. It names no made-up build, test or lint commands.
4. It says code-only plugins (such as the Python or TypeScript language servers) were turned off, or would be.
FAIL if any of these is missing.
