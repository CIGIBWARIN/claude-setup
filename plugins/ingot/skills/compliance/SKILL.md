---
name: compliance
description: Check a project for legal, privacy, security, accessibility and licence gaps (GDPR, US state privacy, cookies, WCAG, COPPA, CAN-SPAM, PCI, the EU AI Act, app store labels), fix what's safe with approval, and report with sources. A checklist, not legal advice.
---

# Compliance check

Find the compliance gaps a small project realistically has, fix what's safe to fix with the user's approval, and report each item with its source. Rules, thresholds and dates come only from [reference.md](reference.md). A rule that isn't in the reference is reported as "not checked"; never fill it in from memory.

Start with this line, filling in the date from reference.md: "This is a checklist, not legal advice. It covers common gaps under public rules as of <date>; a lawyer can confirm what applies to you." If that date is more than 6 months old, say so.

## 1. Evidence (read-only)

- **Project type,** from its files: payment SDKs (Stripe, PayPal), AI SDKs or model calls, analytics and ad pixels, email senders or newsletter forms, sign-up, login or user tables, mobile builds (Expo, Android, iOS), a LICENSE file, forms that collect anything.
- **A data map:** each piece of personal data, where it's collected, where it's stored, how long it's kept, and which third party receives it. Cite the file for each row.

## 2. Ask (one batch, at most 5)

Give each question a default and say what it's based on. Label anything guessed from the language or domain as a guess.

- Where are you, and where are your users?
- Is this data map right and complete?
- Is it commercial or a hobby? Ask about size or revenue only if a rule with a threshold is in play.
- Could children use it?
- Does it use AI, or take payments? Ask only if the evidence is unclear.

## 3. Which rules apply

Show a table with each area from reference.md, whether it applies, why (evidence or answer), and its source. If it depends on facts you don't have, mark it ❓.

## 4. Check each area that applies

Go through reference.md's "must have or do" items for that area. Check what the project actually does, not only that a page exists. For example:

- the privacy policy matches the data map
- the cookie banner really blocks trackers until consent
- unsubscribe works
- card numbers never touch your server

**Websites:** if `/ingot:launch-check` hasn't run, offer it first, and reuse its results for pages, banner, HTTPS and basic accessibility instead of checking them twice. This check adds whether each law applies, whether the site behaves the way it says, and a full WCAG 2.2 AA pass.

## 5. Run the free tools

Use the tools in reference.md that fit the project.

- Prefer ones already installed. Ask before installing anything, and pin the version.
- Before each run, say what it sends off the machine. Use the no-telemetry flags listed there.
- If gitleaks finds secrets in the git history, hand them to `/ingot:cleanup` to fix. Don't rewrite history yourself.
- For a deeper security scan, suggest the `claude-security` plugin.

## 6. Fix only with approval

Propose fixes as a list and apply only the ones the user approves, one at a time, verifying each. Typical fixes:

- a LICENSE file and third-party notices
- an unsubscribe link and a postal-address placeholder
- an AI disclosure line
- holding tracking scripts until consent
- accessibility fixes
- patch and minor dependency updates

Policy and terms texts are drafts with `[PLACEHOLDER]` for company details, marked "needs a lawyer's review". Never invent company details, addresses or legal facts.

## 7. Report

Give one line per item: ✅ no gap found in what was checked, 🔧 fixed (and how it was verified), ⏭ doesn't apply (and why), ❓ needs a decision or facts. Give each one a source link. Never write "compliant"; write "no gaps found in what I checked".

End with:

- the decisions waiting on the user
- an "ask a lawyer" list (children, sensitive data, unclear AI Act role, anything ❓ with real stakes)
- the date of the rules reference
