---
name: launch-check
description: Pre-launch checklist for a website. Checks and fixes the 20 things sites usually miss (security, SEO, accessibility, speed, legal, forms) and reports pass, fixed, or needs a decision for each.
disable-model-invocation: true
---

# Launch check

Go through every item. For each one, first check whether it's already done, then fix it if you can, then verify the fix. Skip any item that doesn't apply, and say why in one line. Don't redo work that's already done.

## Security
1. **Secrets off the frontend.** Search the client bundle and the repo for keys and tokens. Move them server-side or into env vars.
2. **HTTPS forced.** HTTP should redirect to HTTPS, set in the host or server config. Add HSTS if the host supports it.
3. **Form validation** on the server, not only in the browser.
4. **Spam protection on forms.** Start with a honeypot field plus a rate limit. Ask before adding a captcha service.

## Search and sharing
5. A **meta title and description** on every page, each one unique.
6. **Social preview:** `og:title`, `og:description`, and `og:image` at 1200x630, plus the Twitter card tags.
7. A **favicon**, plus an apple-touch-icon.
8. **sitemap.xml and robots.txt.** robots.txt should point to the sitemap.
9. **No broken links.** Crawl the internal links and check the external ones.
10. A **custom 404 page** that links back home.

## Accessibility and UX
11. **Alt text** on every meaningful image. Decorative images get `alt=""`.
12. **Color contrast** of at least 4.5:1 for body text.
13. **Mobile friendly:** set the viewport meta tag, check at 375px width, and make tap targets at least 44px.
14. **One clear call to action** per page.

## Speed
15. **Compressed images.** Use WebP or AVIF, the right size for where they're shown, and lazy-load anything below the fold.
16. **Page load speed.** Measure it, for example with Lighthouse or the browser's performance tools. Fix the largest problem first.

## Legal and analytics

Each item here needs the user's input. Ask, don't invent.

17. A **privacy policy page.**
18. A **terms and conditions page.** Draft both from what the site actually collects, mark them clearly as drafts that need the owner's review, and leave placeholders for the company name and contact details.
19. **Analytics.** Ask which provider the user wants. A cookieless option avoids the need for a consent banner.
20. A **cookie consent banner,** only if the site sets non-essential cookies, such as analytics or ads cookies.

## Going live
If the site isn't online yet and it's static (plain HTML, or a framework's static build), offer GitHub Pages: it's free and needs only a GitHub account. Turn it on with the official Pages workflow (`gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow`, plus a workflow that builds and uploads the site). A private repo needs a paid GitHub plan for Pages, so say so before making a repo public.

## Report

Give one line per item: ✅ already done, 🔧 fixed (and how you verified it), ⏭ skipped (and why), or ❓ needs a decision. List the decisions at the end.
