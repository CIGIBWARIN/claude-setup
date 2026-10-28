# Compliance reference

**Rules as of 2026-10-28.** Refresh this file (and its date) when you update the skill; `/maintain` checks it.

## Rules by area

| Area | Rule, and who it covers | What the project must have or do | Source |
|---|---|---|---|
| Personal data | GDPR and UK GDPR: anyone offering goods or services to people in the EU or UK, or monitoring them, at any size. Purely personal use is exempt | A privacy notice: what is collected, why, the lawful basis, how long it's kept, who receives it, and the user's rights. Deletion and export on request. Agreements with processors. An EU or UK representative if based outside (Art. 27) | https://eur-lex.europa.eu/eli/reg/2016/679/oj · https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/ |
| Cookies, pixels, local storage | EU ePrivacy Art. 5(3); UK PECR | Consent before any non-essential storage. UK (Data (Use and Access) Act 2025): analytics is exempt if clearly explained with an easy way to object. EU: analytics still needs consent | https://eur-lex.europa.eu/eli/dir/2002/58/oj · https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/ |
| US state privacy | CCPA/CPRA: businesses with over $26,625,000 annual revenue, or 100,000+ California consumers or households, or 50%+ of revenue from selling or sharing data. Texas TDPSA: everyone doing business in Texas except SBA-defined small businesses, which still need consent to sell sensitive data | Notice at collection and "Do Not Sell or Share" / opt-out links where covered. Most solo projects are below the CCPA thresholds; say which threshold you checked, don't guess | https://cppa.ca.gov/regulations/cpi_adjustment.html · https://www.texasattorneygeneral.gov/consumer-protection/file-consumer-complaint/consumer-privacy-rights/texas-data-privacy-and-security-act |
| Accessibility | ADA Title III covers business websites; the DOJ sets no technical standard, and WCAG is the usual yardstick. European Accessibility Act since 28 June 2025 for e-commerce and other listed services; service microenterprises (under 10 staff and at most €2M) are exempt | WCAG 2.2 AA. An accessibility statement where the EAA applies | https://www.ada.gov/resources/web-guidance/ · https://www.w3.org/TR/WCAG22/ · https://eur-lex.europa.eu/eli/dir/2019/882/oj |
| Children | COPPA: services aimed at under-13s, or with actual knowledge of them; the amended rule is binding since 22 April 2026. UK Children's code: services likely to be used by under-18s | Verifiable parental consent, high-privacy defaults. Always on the "ask a lawyer" list | https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule · https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/ |
| Email | CAN-SPAM: any commercial email; up to $53,088 per violating email. EU and UK: consent or a soft opt-in | Honest From and subject lines, a postal address, a working unsubscribe honoured within 10 business days | https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business |
| Payments | PCI DSS: anyone taking cards | Use the provider's hosted checkout or elements so card numbers never touch your server; TLS 1.2+; verify webhook signatures; the yearly self-assessment | https://docs.stripe.com/security/guide |
| AI features | EU AI Act Art. 50: applies from 2 August 2026; providers of AI systems already on the market before then have until 2 December 2026 for the Art. 50(2) content-marking duty | Tell people they're talking to an AI unless that's obvious; label deepfakes; machine-readable marking of generated content if you are the provider. Whether you are a "provider" or a "deployer" is a ❓ for a lawyer | https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50 · https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act |
| Mobile apps | Apple privacy labels and privacy manifests; Google Play Data safety | Labels that match what the code and its SDKs collect; a privacy policy URL; account deletion inside the app if it has accounts | https://developer.apple.com/app-store/app-privacy-details/ · https://support.google.com/googleplay/android-developer/answer/10787469 |
| Open source | Each dependency's licence terms. EU Cyber Resilience Act: commercial products with digital elements must report actively exploited vulnerabilities from 11 September 2026; non-commercial open source is out of scope | A LICENSE file; keep dependencies' copyright and licence notices; flag GPL/AGPL code mixed into closed or differently licensed code | https://www.apache.org/licenses/LICENSE-2.0 · https://digital-strategy.ec.europa.eu/en/policies/cra-reporting |

## Free tools (no account)

Pin versions when installing, because supply-chain attacks hit security tools too.

| Checks | Tool | Size | What it sends | Command |
|---|---|---|---|---|
| Known vulnerabilities in dependencies | osv-scanner | ~56 MB | package names and versions to osv.dev (`--offline-vulnerabilities` avoids it) | `osv-scanner scan source -r .` |
| npm dependencies | npm audit | built in | the dependency list to the npm registry | `npm audit --omit=dev` |
| Python dependencies | pip-audit | <1 MB | package names to PyPI or OSV | `pip-audit -r requirements.txt` |
| Secrets, including git history | gitleaks | ~8 MB | nothing | `gitleaks git . --redact` |
| Code security patterns | Semgrep CE (needs Python 3.10+) | 56-70 MB | downloads rules; usage metrics unless `--metrics=off`; never sends code | `semgrep scan --config p/default --metrics=off` |
| Licences (npm) | license-checker-rseidelsohn | <1 MB | nothing | `npx license-checker-rseidelsohn@5 --summary` |
| Licences (Python) | pip-licenses | <1 MB | nothing | `pip-licenses --format=markdown` |
| Accessibility | Lighthouse (uses the installed Chrome) | ~19 MB | asks about crash reports on first run | `npx lighthouse@13 <url> --only-categories=accessibility --no-enable-error-reporting` |
| Accessibility (deeper) | pa11y with axe | downloads its own Chrome, hundreds of MB | nothing | `npx pa11y@10 --runner axe <url>` |
| Software bill of materials | syft | ~28 MB | an update check unless `SYFT_CHECK_FOR_APP_UPDATE=false` | `syft dir:. -o cyclonedx-json=sbom.json` |
