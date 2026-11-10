# ROADMAP.md — LEAP LIVING

Principle: **build the foundation correctly, then grow in vertical slices.** Each phase ends with something working end-to-end and tested. Do not start a phase until the previous one's acceptance criteria are met and the owner approves.

Current phase is recorded in `STATUS.md`.

## Phase 0 — Audit, proof of concept, and pre-meeting design baseline
**Goal:** know whether the stack can run on Tasjeel before building on it, and prepare the CEO-approved Homepage design with the 6 meeting modifications for review.

Tasks
- Inspect repo, docs, `docs/source-materials/`, and what is missing (`DECISIONS.md`).
- Consolidate repo structure, extract official vector SVG logos from `BRAND GUIDELINES.pdf`, and apply approved Brand & UI colour system (`#3B9EA1`, `#185C5E`, `#287F82`, `#F5F7F6`, `#FFFFFF`, `#252B2B`, `#626B69`, `#E2E7E5`, `#DDDDDD`).
- Implement the CEO-approved Homepage design (`docs/source-materials/homepage-approved-design.jpg`) + the 6 meeting modifications in the local application (`poc/`):
  1. Add `Consultancy` (`Real Estate Consultancy`) to the Services section.
  2. Remove all photos of people from the Homepage (including Mohab Samak's portrait and client avatars).
  3. Change CEO title from `Founder & CEO` to `CEO` only.
  4. Apply the approved second Homepage design as the visual baseline.
  5. Add `Free Valuation` button in the top Header.
  6. Add interactive `Mortgage Calculator` section (inspired by Provident Estate).
- Verify hosting per `INFRASTRUCTURE.md` once cPanel credentials are provided.

Acceptance
- Written compatibility report with PASS/FAIL/UNKNOWN per item and evidence.
- Local PoC + Approved Homepage design builds (`output: 'standalone'`), typechecks, and passes all automated verification checks.

## Phase 1 — Foundation and core listing (MVP)

**Goal:** an admin can log in, add a property with images, and visitors can browse, calculate mortgages, request free valuations, and enquire.

Scope
- Project scaffold, tooling, design tokens (`DESIGN_SYSTEM.md` §3), base UI components, CI checks.
- Prisma schema for: users, roles, permissions, sessions, audit log, settings, media, properties (+ images, features, locations), inquiries, email outbox.
- Auth + permission-based RBAC (seed: Super Admin + one editor role). Audit events written for sensitive actions.
- Admin shell, dashboard overview (real counts only), property CRUD with draft/publish, availability status, featured, ordering, media upload.
- Public: Home (CEO-approved baseline + all 6 meeting modifications, reading real DB data), Buy, Rent, property detail, Mortgage Calculator, Contact form, Free Valuation / Sell form (all forms persist first, then email via outbox).
- Health endpoint, logging, rate limiting on forms and login.

Acceptance
- Unpublished property is unreachable by URL, list, search, sitemap, and API.
- All forms validate on server with Zod, persist, rate-limit, and show success/failure states.
- Email failure leaves the inquiry saved and the outbox row retryable.
- Authorization tests: a user without permission cannot call the action even by crafting the request.
- Upload tests: wrong MIME/magic bytes, oversize, and path-traversal names are rejected.
- Typecheck, lint, unit, integration, and key E2E (login → create → publish → visible) pass.
- Deployed to **staging** only.

## Phase 2 — CMS for website content

Scope
- `content` module: pages, typed sections, section registry, draft → preview → publish, basic revision record.
- Editable: Home sections (hero, CTAs, credentials strip, featured properties, services including Consultancy, leadership without people photos, mortgage calculator parameters, client perspectives, valuation CTA), About, global settings (company info, nav, footer, social, default SEO).
- Developers module with logos and display order.
- Public pages read **published** content only; cache tags invalidated on publish.

Acceptance
- Change hero text in admin → no effect publicly until Publish → effect after Publish without code change.
- Preview works for authorized users only.
- Content mutations require permissions; tests prove it.

## Phase 3 — CRM and request workflows

Scope
- `leads` (status, assignment, internal notes, activity timeline), dedicated valuation and viewing-request modules, filters/search, link to property.
- Roles added by data: Sales/Advisory (sees assigned leads), Property Manager, Content Manager, Administrator.

Acceptance
- Sales user sees only permitted leads; direct URL access to others is denied.
- Status changes and assignments appear in the audit log.
- A viewing request is shown as "requested" until an admin confirms.

## Phase 4 — Governance and polish

Scope
- Audit-log UI, full revision history with restore, SEO management (per page/property, sitemap, robots, indexing controls), password reset flow, session management, user/role admin UI, private-advisory page and confidential documents (private storage).

Acceptance
- Restoring a revision recreates the content and is itself audited.
- Private documents are not reachable without authentication and permission.

## Phase 5 — Quality, performance, staging, release

Scope
- Full E2E and security suites, accessibility pass (WCAG 2.2 AA target), Lighthouse checks, query/index review, backup + restore drill, rollback drill, runbooks.

Acceptance
- Release gates in this file all green; restore and rollback demonstrated on staging.
- **Production deployment only after explicit written approval**, with a cut-over plan that leaves the WordPress site restorable.

## Backlog (not scheduled — do not implement)

Analytics dashboard from real data · saved searches / buyer profiles · property comparison · PDF brochures/dossiers · external CRM integration · additional branches · mobile app / public API consumers · advanced search engine · newsletter · blog/insights section (market analysis content) · additional administrators and approval workflows (publish requires approval) · slug redirect history · multi-currency display rates.

## Release gates (all phases)

- TypeScript strict passes; ESLint passes; no unexplained `any`.
- Unit + integration + relevant E2E pass; security tests for the touched area pass.
- No secrets in the repo; `.env.example` updated.
- Accessibility basics: keyboard navigation, focus states, labels, contrast.
- Loading, empty, error, and confirmation states exist for every flow.
- Docs and `STATUS.md` updated.
