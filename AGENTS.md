# AGENTS.md — LEAP LIVING

> Mandatory. Read this file fully before every task, in every session, whichever AI model you are.
> You have no memory of earlier sessions. The files in this repository are your memory.

## 0. Reading order

1. `AGENTS.md` (this file)
2. `STATUS.md` — where the project is right now, what is next, what is blocked
3. `PROJECT_CONTEXT.md` — business, brand, approved content, what is NOT approved
4. `ARCHITECTURE.md` — structure, boundaries, extension points
5. `ROADMAP.md` — read the current phase only (as named in `STATUS.md`)
6. `DECISIONS.md` — accepted decisions, open questions, known contradictions
7. As needed: `DESIGN_SYSTEM.md`, `SECURITY.md`, `INFRASTRUCTURE.md`
8. Client material: `docs/business/client-content.md` and `docs/source-materials/`

If two files disagree, `DECISIONS.md` wins, then `AGENTS.md`, then the rest. Report the conflict; do not silently pick one.

## 1. What this project is

LEAP LIVING is a luxury real-estate **consultancy** in Dubai, UAE (not a listings marketplace). The product is **one application with two faces**:

- a premium, English-only public website;
- a secure, English-only Admin Dashboard + custom CMS + internal CRM that controls everything the website shows.

Both share one codebase, one database, and the same domain modules. The company will grow and the system must grow with it, but **growth happens in phases** (see §3). Build small, build correctly, leave clean seams.

## 2. Hard rules (never break)

1. **English only.** No Arabic, RTL, i18n libraries, `[locale]` routes, translation files or language switchers. Do not install `next-intl` or similar.
2. **No external paid or third-party infrastructure** without written approval: no Vercel, AWS, Azure, Supabase, Neon, Redis Cloud, S3, Resend, external CMS/analytics. Hosting is the client's existing Tasjeel cPanel account.
3. **Do not touch production.** Never deploy to production, change DNS, or modify/delete the existing WordPress site without explicit approval from the owner in the current conversation.
4. **Never invent content.** No fake company facts, property listings, prices, testimonials, statistics, credentials, partnerships, licence numbers, phone numbers or emails. Use only what is in `PROJECT_CONTEXT.md` / `docs/business/client-content.md`, and respect each item's status (§6).
5. **Authorization is server-side.** Hiding a button is not security. Every mutation and every protected read is authorized in the application layer.
6. **Draft ≠ Published, Published ≠ Available.** Publication status and commercial availability are separate fields. An unpublished property is never public.
7. **Persist before notifying.** Every form submission is saved to the database before any email is attempted. Email failure must never lose a customer request.
8. **No secrets in Git or browser code.** Never log passwords, tokens, or session secrets.
9. **Do not claim what you did not verify.** Never say tests passed, a build works, or a feature is complete unless you ran it and saw the result. Quote the real command output summary.
10. **Do not claim High Availability or uptime guarantees.** Single cPanel account = no failover.

## 3. Scope control: grow, don't sprawl

- Work **only on the current phase** in `STATUS.md`. Later-phase ideas go to the backlog in `ROADMAP.md`; do not implement them.
- **Design for extension, build only what is needed now.** Concretely:
  - Put replaceable technical concerns behind small interfaces (storage, email, jobs, search, cache). See the "Extension points" table in `ARCHITECTURE.md`.
  - Build the RBAC engine permission-based from day one. Start with few roles; add roles as **data**, not code changes.
  - Write audit-log events from the first mutation, even if the audit-log UI comes later.
  - CMS sections are typed blocks from a registry; new section types are added without schema migrations.
- **Do not** create empty folders, placeholder modules, speculative abstractions, or "enterprise-looking" files that have no behavior and no test. Create a file when its feature is implemented.
- **Do not** add a dependency without stating why, checking it is maintained, and pinning an exact version. No `latest`.

## 4. Task protocol (follow every time)

1. **Orient:** read `STATUS.md`, then the files for the area you will touch.
2. **Inspect before changing:** open the existing code. Never assume a file's contents. Search the repo for existing helpers before writing new ones.
3. **Plan:** for anything bigger than a small fix, write a short plan (files to touch, risks, tests) and wait for approval if the change is architectural, touches the schema, auth, or security.
4. **Implement the smallest correct change.** Follow existing conventions. Do not rewrite or reformat unrelated code.
5. **Verify:** run, and report the outcome of: type-check, lint, relevant tests, and a build when relevant. Fix what you broke.
6. **Review your own diff** before reporting. Remove debug code, stray files, and unrelated edits.
7. **Update docs** if behavior, architecture, schema, or a decision changed.
8. **Update `STATUS.md`** (what changed, what passed, what is next, what is blocked).
9. **Report** using the format in §10.

Rules for small/fast models, because mistakes are cheaper to prevent than to fix:
- Make one logical change per step. Prefer many small verified steps over one large one.
- Always re-read a file right before editing it.
- If a command fails, read the error and fix the cause. Do not retry blindly or suppress the error.
- If unsure, stop and ask. A question is cheaper than a wrong migration.

## 5. Code rules

- TypeScript `strict`. No untracked `any`; no `@ts-ignore` without a comment explaining why.
- **Layers inside every business module:** `domain` → `application` → `infrastructure` / `presentation`. Dependencies point inward only. Domain code never imports Next.js, React, Prisma, or anything from `infrastructure`.
- UI components never touch the database. Pages and route handlers call module **public interfaces** (`modules/<name>/index.ts`) only; never import another module's internals.
- Server Components by default; Client Components only where interaction requires them.
- Validate every external input with **Zod on the server** (client validation is only for usability).
- Multi-step writes use database **transactions**.
- Money: use `Decimal`, never floating point. Store timestamps in UTC.
- Server-side pagination and filtering for all lists.
- The public site and the admin use the **same** domain services. Never duplicate a business rule in two places.
- Server Actions and Route Handlers are public HTTP endpoints. Authenticate and authorize inside them.
- Keep copy (UI text) out of domain logic. Editable public content lives in the CMS/database, not hardcoded.
- Naming: folders `kebab-case`; React components `PascalCase`; functions/variables `camelCase`; DB columns follow the Prisma schema convention in `docs/database` once written.

## 6. Content and data rules

Every piece of content has a status. Check it before using it.

| Status | Meaning | May be used in… |
|---|---|---|
| `CLIENT-SUPPLIED` | Comes from client documents in `docs/source-materials/` | Development and staging. Needs client sign-off before production. |
| `SAMPLE` | Mock-up or placeholder data (e.g. names/phones on brand mock-ups, the AI-generated homepage image) | Never as real content. |
| `UNVERIFIED` | A claim with no source (e.g. "AED 12B+", "100% Fiduciary") | Never, until approved in writing. |
| `APPROVED` | Client confirmed for publication | Anywhere. |

- Seed/demo data must be obviously fake (e.g. title prefix `SAMPLE —`), gated to non-production, and never mixed with real data.
- Third-party logos (the developer list, employer logos) require the owners' permission before production. Do not imply a partnership or endorsement without evidence.
- Do not use images from the supplied PDFs on the public site until licensing/originals are confirmed (`OPEN_QUESTIONS` in `DECISIONS.md`).

## 7. Security summary

Full detail in `SECURITY.md`. Non-negotiables: server-side RBAC, hashed passwords (Argon2id or the vetted auth library's secure default), HTTP-only + SameSite + Secure cookies, CSRF protection for cookie-authenticated mutations, rate limiting on forms and login, validated file uploads (magic bytes, size, safe names), private files stored outside the public root, security headers + CSP, audit log for sensitive actions, parameterized queries only.
Do not rely on middleware/proxy alone for authentication: re-check authorization next to the data access.

## 8. Git conventions

- Never commit to `main` directly. Branch per task: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
- Small commits, imperative messages (`feat(properties): add publish action`).
- Never commit: `.env*` (except `.env.example`), `storage/`, `node_modules/`, `.next/`, backups, logs, real client data.
- Migrations are committed and never edited after being applied anywhere shared.

## 9. Commands

> Run from `web/`. Local development uses SQLite (`DATABASE_URL="file:./storage/dev.db"` in `web/.env`); the production database is still pending host verification (`D-04`, `INFRASTRUCTURE.md`).

```
install:    npm ci                  # compiles better-sqlite3; needs python3, make, g++
generate:   npm run prisma:generate # writes the Prisma client to web/generated (git-ignored)
dev:        npm run dev
typecheck:  npm run typecheck
lint:       npm run lint            # ESLint 9 + eslint-config-next (0 errors required)
test:       npm run test            # Vitest, files: src/**/*.test.ts
build:      npm run build
db migrate: npm run prisma:migrate  # prisma migrate dev
verify:     BASE=http://localhost:3000 ./scripts/verify.sh   # needs a running server, ImageMagick and `file`
```

## 10. Report format (end of every task)

```
## Summary
What changed and why (2–5 lines).

## Files changed
- path — what/why

## Verification
- typecheck: PASS/FAIL/NOT RUN
- lint:      PASS/FAIL/NOT RUN
- tests:     PASS/FAIL/NOT RUN (which)
- build:     PASS/FAIL/NOT RUN

## Not done / risks / open questions
- …

## Next step
- …
```

## 11. Stop and ask the owner when

- A change affects the database schema, authentication, authorization, security, or deployment.
- Required client information or assets are missing (see `DECISIONS.md` → Open questions). Do not guess or fabricate.
- Two documents contradict each other.
- A task would need a new dependency, new service, or cost.
- Anything would touch production or the live WordPress site.

## 12. Keeping the docs alive

These files are the project's memory. If you change something that makes them wrong, fix them in the same task. Add decisions to `DECISIONS.md`. Never leave `STATUS.md` stale at the end of a session.
