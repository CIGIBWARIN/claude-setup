## Tests: only ones that earn their place
- Write a test only for behavior that could realistically break: branching logic, parsing, money, auth, data loss. For a bug fix, write one regression test that reproduces the bug.
- Don't test trivial getters, constructors, constants, pure wiring, framework or library behavior, things the type checker already catches, or "the mock was called" with no real assertion.
- Write one focused test per behavior. Parametrize instead of copy-pasting cases. Extend the existing test files and follow their patterns.
- Unless the user asked for tests, new test code should be smaller than the code change it covers. There's no coverage target unless the user sets one.
- Don't add a test framework to a project that has none unless the user asks. Use an assert-based self-check instead.
- Never weaken, skip, or delete an existing test to make it pass.

## Docs: proportional to the change
- Don't create new documentation files (READMEs, guides, `docs/` pages, summaries of what you did) unless the user asks. Put the explanation in your reply.
- When a change alters behavior that's already documented, update that doc in place with as few lines as possible.
- A comment or docstring is one line and says why, not what. Don't write module-level essays, restate the code, or add changelog-style comments.
- Keep documentation in proportion: a small change gets at most a line or two.
