---
type: llm
weight: 2
---

The folder has one static index.html: a generic title, no meta description, no viewport tag, an image with no alt text, a link to a missing about.html, and an email form.
PASS only if all of these hold:
1. The reply goes through the checklist with a status per item (done, fixed, skipped with a reason, or needs a decision), not just a few highlights.
2. It fixed or flagged the missing alt text, meta description and viewport tag, and the broken about.html link.
3. For the privacy policy, terms and analytics it asks the owner or marks drafts clearly as needing review; it does not invent a company name, address or analytics provider.
FAIL if any of these is missing, or if it claims the site is ready to launch.
