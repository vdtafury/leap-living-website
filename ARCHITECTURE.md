# ARCHITECTURE.md — LEAP LIVING

Status: **Proposed baseline, pending Phase 0 verification on the real hosting.** Stack versions are not locked until the proof of concept passes (`INFRASTRUCTURE.md`).

## 1. Style

**Modular Monolith + Clean Architecture.** One deployable Next.js application. Business logic is split into domain modules with explicit public interfaces. No microservices, no multi-tenancy, no Kubernetes, no distributed infrastructure unless a real business need is approved.

Why: one small hosting account, one team, one database, and a product that will grow in features rather than in traffic. A monolith with strict module boundaries is the cheapest design that can still be split later.

## 2. Target stack (to be verified)

| Area | Choice | Note |
|---|---|---|
| Framework | Next.js (App Router), React, TypeScript strict | Pin a stable version compatible with the host's Node.js |
| Styling / UI | Tailwind CSS, Radix UI primitives, Lucide icons, Motion (sparingly) | |
| Validation | Zod | Server-side is mandatory |
| Forms | React Hook Form | |
| Tables | TanStack Table | Admin lists |
| Database | MySQL or MariaDB (whichever Tasjeel provides) | Check version and connection limits |
| ORM | Prisma | Verify engine/OS and MariaDB compatibility |
| Auth | Better Auth **or** a verified server-side session solution | Decide after PoC (`DECISIONS.md` O-12) |
| Images | Sharp, if it runs on the host | Fallback plan required |
| Email | Nodemailer + the host's SMTP | Through an outbox table |
| Logging | Pino | Structured JSON to files under `storage/logs` |
| Tests | Vitest (unit/integration), Playwright (E2E) | |

Do not add anything else without justification. Do not install localization packages.

## 3. Layers and dependency rule

```
presentation  ─┐
application    ├─▶ domain      (domain depends on nothing)
infrastructure ─┘
```

- **domain:** entities, value objects, enums, policies, domain errors, repository **interfaces**. Pure TypeScript.
- **application:** use cases (commands/queries), DTOs, Zod validators, authorization checks. Orchestrates domain + repositories.
- **infrastructure:** Prisma repositories, mappers, adapters (storage, email, cache). Implements domain interfaces.
- **presentation:** module-specific React components, forms, tables, filter UIs.
- `src/app` (routing) and `src/components` (shared design system) sit on top. `src/server` holds shared technical infrastructure.

Rules:
- Routing files (`src/app/**`) contain no business logic and no direct DB calls. They call module public interfaces.
- A module exposes only what is exported from its `index.ts`. Other modules import nothing else from it.
- Modules do not import each other's infrastructure. Cross-module needs go through the other module's public interface or a domain event/port.
- No circular dependencies. Add a lint rule (import boundaries) once the first modules exist.

## 4. Request flow

```
Browser
  → Route Handler / Server Action / Server Component page
  → authenticate (session) → authorize (permission check) → validate (Zod)
  → application use case (inside a transaction when multi-step)
  → repository (Prisma) → MySQL/MariaDB
  → audit event + cache invalidation (when applicable)
  → response
```

Authentication and authorization happen **in the application layer next to the data access**, not only in middleware/proxy. Middleware/proxy may redirect unauthenticated users for UX, never as the sole control.

## 5. Modules and when they appear

| Module | Responsibility | Phase |
|---|---|---|
| `authentication`, `authorization`, `users` | Login, sessions, permission engine, user admin | 1 |
| `audit-logs` | Write events from day one; UI later | 1 (write) / 4 (UI) |
| `settings` | Typed key/value site and system settings | 1 |
| `media` | Upload, validation, metadata, variants, references | 1 |
| `properties` | Listings, locations, features, images, search | 1 |
| `notifications` | Email outbox, templates | 1 |
| `inquiries` | Public form submissions persisted | 1 |
| `content` | Pages, sections, drafts, publishing, revisions | 2 (basic) / 4 (revisions) |
| `developers` | Developers/partners and logos | 2–4 |
| `leads` | CRM: status, assignment, notes, activity | 3 |
| `valuations`, `viewing-requests` | Dedicated request workflows | 3 |
| `analytics` | Aggregates from real data only | 5+ |
| `jobs` | DB-backed job runner for cron | when first needed |

Create a module when its phase starts. Do not scaffold future modules.

## 6. Key domain rules

**Property**
- `publicationStatus`: DRAFT | PUBLISHED | ARCHIVED. **Controls public visibility.**
- `availabilityStatus`: AVAILABLE | UNDER_OFFER | SOLD | RENTED | OFF_MARKET. **Commercial state only.**
- Public queries always require `publicationStatus = PUBLISHED` and `deletedAt IS NULL`. Never derive visibility from availability.
- `transactionType` (SALE | RENT) and `segment` (RESIDENTIAL | COMMERCIAL) — pending O-09.
- Price: `Decimal` + `currency` (ISO code, default AED). Area: `Decimal` + `areaUnit`.
- Unique `slug`, unique `referenceNumber`. Soft delete via `deletedAt`. Optional `permitNumber`.
- Ordering via `sortOrder`; `featured` boolean.
- Later: slug history for redirects when slugs change.

**Content (CMS)**
- A `Page` has ordered `PageSection`s. Each section has a `type` and typed JSON `content`.
- A **section type registry** (code) maps `type` → Zod schema + admin editor + public renderer. Adding a section type needs no DB migration.
- Each content record has a **draft** and a **published** version. The public site reads **published only**.
- Publishing is an explicit action that copies draft → published inside a transaction, writes a `ContentRevision`, records actor + timestamp, and invalidates the cache tags.
- Preview: a protected route reads the draft using a signed, short-lived preview token or an authenticated admin session.
- Global settings (company name, contact details, nav, footer, default SEO) are typed settings with the same draft/publish behavior where practical.

**Leads / requests**
- Every public form writes an `Inquiry` (with type) in a transaction, then queues an `EmailOutbox` row. Never send mail inline as the only record.
- A viewing request is not an appointment until an admin confirms.

**Authorization**
- Permission-based RBAC: `Permission` rows (e.g. `property.create`, `content.publish`, `lead.assign`), `Role` ↔ `Permission`, `User` ↔ `Role`.
- Code checks **permissions**, never role names.
- Roles ship as seed data. Start with Super Admin + one editor-type role; add Property Manager, Sales/Advisory, Content Manager, Administrator by data when their modules exist.
- A user can never grant a role/permission they do not hold; only Super Admin manages Super Admin.

## 7. Extension points (how the system grows without rewrites)

Each technical concern sits behind a small interface in `src/server/*`. Swapping the implementation must not touch domain or application code.

| Concern | Today | Later option | Seam |
|---|---|---|---|
| File storage | Local disk (`storage/`) | Object storage | `StorageService` interface; public vs private buckets as separate roots |
| Email | Nodemailer + host SMTP | Transactional email provider | `EmailService` + outbox table |
| Background work | DB job table + cPanel cron | Queue worker / Redis | `JobRegistry`, idempotent handlers |
| Search | MySQL indexed queries (+ FULLTEXT) | Dedicated search engine | `PropertySearchPort` in `properties` |
| Cache | Next.js cache with tags | Shared cache | `cache-tags.ts` + invalidation helpers |
| CRM | Internal `leads` module | External CRM | Domain events / outbound adapter in `leads` |
| Analytics | Aggregates from own DB | Dedicated analytics | `analytics` module reads, never writes |
| Auth | Chosen session/auth lib | SSO, 2FA | `server/authentication` wrapper |
| Hosting | Tasjeel cPanel | VPS / container | Env-driven config, no host-specific code outside `scripts/` and `server/*` |
| New page/section | Registry entry | — | Section type registry |
| New property category/field | Schema + form + filter | — | Property module only |
| New role | Seed data | — | Permission table |
| API consumers (mobile app, partners) | — | Public API | `/api/v1/*` versioned from the start |

Future languages are **not planned**. Do not build for them. Keep copy out of domain code so a future change would be a bounded task (it would require a new approved decision).

## 8. Caching

- Public pages use controlled Next.js caching with **tags** (e.g. `property:{id}`, `properties:list`, `page:{key}`, `settings:site`).
- Publishing/unpublishing/updating calls the matching invalidation helper in the application layer.
- No Redis requirement. Define invalidation before enabling caching on a page.

## 9. Jobs and email

- `EmailOutbox` (status, attempts, nextAttemptAt, lastError) and a `Job` table for other work.
- A script (or a protected endpoint with a secret) triggered by **cPanel Cron** processes due rows. Handlers are idempotent. Retries use backoff and a max-attempt limit; failures stay visible in the admin.
- cPanel cron granularity and Node availability must be verified in Phase 0.

## 10. Storage

- `storage/uploads/public/**` — images served through a controlled route (`/media/[...path]`) or a static mapping; filenames are generated, never user-provided.
- `storage/uploads/private/**` — NDAs/client documents; never publicly addressable; served only through an authenticated, authorized route that streams the file.
- In production, storage lives **outside** the web document root and survives deployments (shared directory, not inside a release folder).

## 11. Testing layout

`tests/unit`, `tests/integration` (real test DB), `tests/e2e` (Playwright), `tests/security`, `tests/fixtures`. A feature is done when its acceptance criteria and tests pass (`ROADMAP.md`).

## 12. Target directory structure (condensed)

This is the **target**, not a to-do list. Create things when their feature is built.

```
leap-living/
├── AGENTS.md  ARCHITECTURE.md  PROJECT_CONTEXT.md  ROADMAP.md  STATUS.md
├── DECISIONS.md  DESIGN_SYSTEM.md  INFRASTRUCTURE.md  SECURITY.md  README.md
├── .env.example  .gitignore  (.nvmrc after Phase 0)
├── prisma/            schema.prisma, migrations/, seed.ts (+ seeds/ when needed)
├── prisma.config.ts   (single Prisma config, project root; verify against the Prisma version in use)
├── public/            brand/, images/, icons/, fonts/
├── scripts/           deployment/, database/, backups/, maintenance/, diagnostics/
├── docs/              architecture/, api/, deployment/, operations/, business/, design/,
│                      database/, security/, quality/, source-materials/
├── src/
│   ├── proxy-or-middleware   (inside src/ when using the src directory; name depends on Next.js version — verify)
│   ├── app/
│   │   ├── (website)/         page.tsx, about, buy[/slug], rent[/slug], sell, contact,
│   │   │                      private-advisory, privacy-policy, terms-and-conditions
│   │   ├── admin/
│   │   │   ├── (auth)/login, forgot-password, reset-password
│   │   │   └── (protected)/dashboard, properties, inquiries, leads, valuations,
│   │   │                    viewing-requests, content, media, developers, users, roles,
│   │   │                    seo, settings, audit-logs, analytics
│   │   ├── api/v1/…           and api/health, api/auth
│   │   ├── media/[...path]/route.ts
│   │   └── robots.ts  sitemap.ts  globals.css
│   ├── modules/<name>/{domain,application,infrastructure,presentation}/ + index.ts
│   ├── components/{ui,layout,forms,feedback,shared}
│   ├── server/{database,authentication,authorization,email,storage,security,cache,jobs,observability}
│   ├── config/  hooks/  styles/  types/  utils/
├── tests/{unit,integration,e2e,security,performance,fixtures}
└── storage/  (runtime, never committed) uploads/{public,private}, temp, logs, backups
```

Corrections to the earlier draft tree: no `[locale]`, `i18n/`, or `messages/`; one `api/` block (not two); one Prisma config at the root; middleware/proxy placed inside `src/` when `src/` is used; no `partners/` and `testimonials/` modules until real content exists (developers cover partners; testimonials only with approved content).
