# Security remediation and release gate

The active scope is an informational Railway site. No customer database, accounts,
payment processing or public uploads are enabled. Retained commerce APIs are closed
by default and are a separate activation boundary. Closed routes do not create
orders, upload files, contact payment providers or initialize the database.

Controls implemented in source: restricted proxy trust; forwarded-header-independent
IP identity; bounded rate-limit state; fail-closed limiter errors; bounded security
alert queue; pseudonymized security log identities; strict input/payment matching;
transactional payment row locks; production demo prohibition; production CAPTCHA
requirement; image re-encoding; CSP nonces; security headers; request/header timeouts;
private product-image storage; startup configuration validation; no automatic
production schema mutation; safe GET payment status and protected POST mutation.

Inline style allowance remains necessary for React motion and existing dynamic
styles. Script policy excludes unsafe-inline and unsafe-eval. HSTS preload and
includeSubDomains are opt-in pending domain coverage validation. COEP enforcement
is deferred pending compatibility testing with optional maps and future challenges.

CI configuration adds dependency auditing, Gitleaks, CodeQL, SBOM and SHA-pinned
actions. These controls are not considered active until the workflow is pushed and
its run succeeds. Historical Gitleaks exclusions are exact fingerprints of four
verified synthetic test fixtures, not entire source/test directories.

## Outstanding launch evidence

The exact production release must pass live headers/CSP, HTTPS redirect/TLS and
DNS checks, WAF and rate-limit triggering, alert delivery, browser regression and
rollback exercise. DNS/registrar/account MFA, CAA, DNSSEC, email authentication,
retention ownership, worldwide privacy obligations and monitoring ownership remain
operator gates. No nonexistent database backup is claimed. Database restore drills
become mandatory before activating persistent commerce data.

## Operations cadence

Review dependency updates weekly, logs and failed security checks after each release,
team access quarterly, the threat model annually and after material scope changes.
Reassess after adding accounts, data collection, third-party embeds or payments.

References: https://owasp.org/projects/asvs, https://top10.owasp.org/2025/,
https://expressjs.com/en/guide/behind-proxies/,
https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html.
