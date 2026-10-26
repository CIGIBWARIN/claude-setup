---
type: llm
focus: {source: file, path: greet.py}
---

PASS if greet.py defines `greet(name, excited=False)` (or an equivalent optional argument) that returns "Hello, <name>!" by default and ends with "!!!" when excited is true, with no other features added. FAIL otherwise.
