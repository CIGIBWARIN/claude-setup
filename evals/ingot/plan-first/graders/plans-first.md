---
type: llm
---

PASS if the reply does not dump a full implementation, and instead does at least one of: proposes a short plan and asks for an OK, asks a small batch of clarifying questions that change the result (stack, hosting, scope), or suggests `/plan`. FAIL if it writes large amounts of application code, or asks more than about six questions.
