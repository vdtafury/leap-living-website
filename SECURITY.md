# SECURITY.md — LEAP LIVING

The platform holds personal data of high-net-worth clients and confidential documents. Treat security as a feature, not a final step.

## 1. Authentication and sessions

- Use a vetted auth solution (decision O-12). If implementing password auth yourself: **Argon2id** with sensible parameters; never roll your own crypto.
- Sessions: random identifiers, stored server-side, rotated on login, invalidated on logout and password change. Cookies: `HttpOnly`, `Secure`, `SameSite=Lax` or `Strict`, scoped path, sensible expiry; idle and absolute timeouts for admin.
- Login: rate limit per IP and per account, generic error messages, lockout/backoff, audit failed attempts.
- Password policy: minimum length, breached-password check if feasible, no composition theatre. Password reset via single-use, short-lived, hashed tokens. Optional 2FA later (extension point).
- The seeded first admin must be forced to change the password; seed credentials come from env and are never committed.

## 2. Authorization

- Permission-based RBAC checked in the **application layer** on every mutation and every protected read. Never by role name in business code.
- Object-level checks (e.g. a Sales user may open only leads assigned to them if the permission is scoped).
- No privilege escalation: a user cannot assign roles/permissions they lack; only Super Admin manages Super Admin.
- Middleware/proxy is for redirects/UX only; do not treat it as the security boundary (past framework middleware bypass issues are a reminder).
- Server Actions are public endpoints: authenticate, authorize, validate in every one.

## 3. Input, output, and requests

- Zod validation server-side for all inputs, including query strings and route params.
- Parameterized queries only (Prisma). Raw SQL requires review and parameter binding.
- Escape/encode output. Rich text from the CMS must be sanitized (allow-list) before storing or rendering.
- CSRF: cookie-authenticated mutating requests are protected (framework origin checks and/or tokens); verify behavior for Route Handlers.
- Rate limiting on: login, password reset, all public forms. Store counters in DB or memory per instance, consistent with the single-account hosting.
- Honeypot/time-trap for forms; add CAPTCHA only with approval (it is an external service).

## 4. Files and media

- Validate real content (magic bytes), allowed types only (e.g. JPEG, PNG, WebP; PDF for private docs), size limits, dimension limits.
- Generate safe filenames; never use user-supplied paths; prevent path traversal; strip image metadata (EXIF/GPS) from public images.
- Public and private storage are separate roots. Private files are never served statically; stream through an authorized route.
- SVG uploads are disabled unless sanitized (script risk).
- Do not delete media referenced by published content without a replacement or explicit confirmation.

## 5. Transport and headers

- HTTPS everywhere; HSTS once stable.
- Security headers: Content-Security-Policy (start strict, loosen only with reasons), X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame protection (`frame-ancestors`).
- `robots`: admin and private routes `noindex`; staging environment fully `noindex` and, ideally, behind basic auth.
- Preview links: signed, short-lived, `noindex`.

## 6. Secrets and configuration

- Secrets only in environment variables (set in the cPanel Node app screen). Never in Git, logs, client bundles, or the CMS.
- `.env.example` lists names only. Rotate secrets if exposure is suspected.
- Never log passwords, tokens, session IDs, or full request bodies of forms.

## 7. Audit log

Record: login/logout, failed logins, user/role/permission changes, property create/update/publish/unpublish/delete, content publish/restore, media deletion, lead assignment/status changes, settings changes, private-file access. Fields: actor, action, target type/id, timestamp (UTC), IP (if policy allows), non-sensitive metadata. The audit log is append-only from the application's point of view.

## 8. Privacy and data protection

- Collect only needed fields; explain purpose on forms; privacy notice page required before launch (text from client/legal).
- Retention: define how long leads and valuation requests are kept and how they are anonymised/deleted. Implement a scripted cleanup (`scripts/maintenance/`).
- Limit who can see lead data (permission-scoped). Exports (if ever added) are permissioned and audited.
- Backups contain personal data: protect and expire them.
- Applicable UAE data-protection obligations and cross-border transfer questions (the host is in a London data centre) must be confirmed with the client's legal advisor. Do not state compliance claims on the website without that.

## 9. Dependencies and supply chain

- Pin exact versions; commit the lockfile; run audit in CI; avoid abandoned packages.
- Prefer versions at least two weeks old; review changelogs for security fixes before upgrades.
- Inspect any third-party agent skill/script before installing; reject suspicious or unnecessary ones.

## 10. Security test checklist (`tests/security`)

Unauthenticated access to admin routes/APIs denied · missing-permission action denied (crafted requests) · IDOR on leads/properties denied · unpublished content never public · upload abuse cases rejected · rate limits trigger · session fixation/rotation · password reset token single use/expiry · headers present · private file route requires auth · audit events written for each sensitive action.

## 11. As built (Phases 1–2, 2026-11-18)

How the rules above are implemented today; keep this in sync with the code.

| Area | Implementation | Where |
|---|---|---|
| Passwords | Argon2id (`@node-rs/argon2` 2.2.2, m=19456 KiB, t=2, p=1); 12–128 chars, common-password list, must not contain the username | `src/server/auth/password.ts` |
| Sessions | 32 random bytes in cookie `__Host-ll_session` (production/framed) / `ll_session` (local); DB stores only SHA-256; idle 2 h, absolute 12 h, touched every 5 min; deleted on logout, password change, reset, deactivation | `src/server/auth/session-token.ts`, `modules/users` |
| Login | Generic error; 5 failures → 15 min account lock; 20 attempts / 15 min / IP; success and failure audited | `modules/users/application/auth.ts` |
| First admin | From `ADMIN_USER`/`ADMIN_PASSWORD` only while there are no users; `mustChangePassword` blocks every other page and API until changed | `modules/users/application/bootstrap.ts` |
| Authorization | `authorize(actor, permission)` inside every application function (reads included); pages use `requireActor(permission)` for UX only. Only a Super Admin assigns or changes a Super Admin; nobody grants a role with permissions they lack | `modules/authorization` |
| CSRF | Every signed-in mutation: same-site check (Origin → `Sec-Fetch-Site` → Referer, else refuse) **and** a token bound to the session (`sha256("csrf:v1:" + sessionId)`) in a hidden field or `x-csrf-token` | `src/server/auth/csrf.ts`, `current.ts`, `api-guard.ts` |
| Uploads | Permission + CSRF; 5 MB cap before parsing; magic bytes must match the declared type; decoded and re-encoded by sharp to WebP (drops metadata and appended payloads); 50 MP pixel limit; random UUID names; served by `/media/[...path]` with traversal checks | `modules/media`, `src/server/images.ts`, `storage.ts` |
| Forms | Zod, honeypot, same-origin, 16 KB cap, 5 saved / 10 min / IP, IP stored only as HMAC; request + email written in one transaction | `modules/inquiries` |
| Email | SMTP credentials in env only; nothing sent until configured; failures kept with the error, retry from the admin | `modules/inquiries/infrastructure/mailer.ts` |
| Drafts | Public reads only published listings and the published copy of content; preview needs `content.view`; `/admin` is noindex and disallowed in robots | `modules/listings`, `modules/content` |
| Audit | Append-only `AuditLog` (no update/delete in code): logins, password changes, users, listings, content, media, developers, inquiry status, email retries | `modules/audit-logs` |
| Tests | `src/server/auth/auth-helpers.test.ts`, `src/modules/*/**.test.ts`, `src/app/api/routes.test.ts` (forged cookies, Basic auth, missing/foreign CSRF token, cross-site, deactivated user, forced password change) | |

