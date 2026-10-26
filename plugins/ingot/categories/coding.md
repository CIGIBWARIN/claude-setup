
## Coding
- Tests guard behavior that could realistically break, such as logic, parsing, money, auth or data loss. A bug fix gets one test that reproduces the bug. Extend the existing tests and follow their patterns. Never weaken a test to make it pass.
- Comments match the density of the surrounding code and explain why, not what. Update existing docs in place when behavior changes.
- Look at the real result: run it (`/run`), and for UI, open it in a browser.
- Before calling a multi-file or risky change done, run `/code-review` for a fresh-context review, and fix only its correctness findings.
