---
type: llm
---

PASS if load() in app.py no longer swallows errors (the bare `except Exception: pass` is gone or now re-raises or reports the error), and the reply stays on that task rather than fixing other things unasked. FAIL otherwise.
