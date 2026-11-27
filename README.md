# LEAP LIVING

Premium English-only real-estate consultancy platform for Dubai (`leapliving.ae`), hosted on Tasjeel cPanel (CloudLinux 8, Node 22, Passenger, SQLite). One modular monolith containing the public website, visitor accounts, Admin Dashboard + custom CMS, and two-way Pixxi CRM integration.

## Directory Structure

| Path | Purpose |
|---|---|
| `web/` | Main Next.js 16 (App Router + TypeScript strict + Prisma/SQLite + Sharp) application |
| `web/src/app/` | Public routes (`/`, `/buy`, `/rent`, `/sell`, `/projects`, `/projects/[slug]`, `/properties/[slug]`, `/about`, `/contact`), visitor accounts (`/account/**`), and API/media routes (`/api/inquiries`, `/api/upload`, `/api/webhooks/pixxi`, `/api/health`, `/media/[...path]`) |
| `web/src/app/admin/` | Admin panel: dashboard, properties, projects, images, homepage / about (incl. Meet the Team) / site settings (draft → preview → publish), developers, form requests, website accounts, client reviews, email queue, Pixxi CRM sync & lead queue, users, audit log |
| `web/src/modules/` | 12 business modules (`domain` / `application` / `infrastructure` + `index.ts`): `authorization`, `users`, `audit-logs`, `listings`, `media`, `developers`, `content`, `inquiries`, `customers`, `reviews`, `pixxi-crm`, `reporting` |
| `web/src/components/` | UI components organized by domain (`layout`, `home`, `property`, `project`, `listings`, `about`, `account`, `tools`, `forms`, `ui`) |
| `web/src/styles/` | Modular stylesheets (`01-…32-*.css` via `globals.css`, plus route-scoped `home/` and `account/`) |
| `web/e2e/` | Playwright browser tests (10 specs: accounts, carousel, listings, mortgage, plan, property-detail, reviews, search, sell, team) |
| `.github/workflows/` | `ci.yml` (lint, types, unit tests, build, `verify.sh`, Playwright), `deploy-staging.yml` (auto-build Node 22 / glibc 2.28 bundle & SSH deploy to `staging.leapliving.ae` with rollback), `package-cpanel.yml` (manual bundle artifact) |
| `web/src/data/` | Starter content imported into SQLite on first start (`catalog.ts`, `content-defaults.ts`, `site.ts`); afterwards everything is managed in `/admin` or synced from Pixxi CRM |
| `web/public/brand/` | Published brand files (logos, favicons, OG image) |
| `docs/client-assets/brand-kit/` | Full brand lockup set derived from client logo (not published) |
| `docs/business/` | Approved company copy (`client-content.md`) and client meeting questions (`meeting-questions.md`) |
| `docs/deployment/` | Tasjeel cPanel staging guide (`cpanel-staging.md`) and host compatibility report (`compatibility-report.md`) |
| `docs/source-materials/` | Original client assets (git-ignored except `README.md`) |

## Governance Documents

Start with [`AGENTS.md`](./AGENTS.md) before any change. Current phase and handoff status live in [`STATUS.md`](./STATUS.md); accepted decisions and open questions live in [`DECISIONS.md`](./DECISIONS.md).
