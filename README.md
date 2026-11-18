# LEAP LIVING

Premium English-only real-estate consultancy platform for Dubai (`leapliving.ae`), a multi-page public site fed from the database, with an Admin Dashboard and CMS (Phases 1–2) built as a modular monolith; CRM comes next.

## Directory Structure

| Path | Purpose |
|---|---|
| `web/` | Main Next.js (App Router + TypeScript strict + Prisma + Sharp) web application |
| `web/src/app/` | Multi-page public routes (`/`, `/buy`, `/rent`, `/sell`, `/projects`, `/projects/[slug]`, `/properties/[slug]`, `/about`, `/contact`) and infrastructure API routes. The mortgage calculator is on the homepage (`/#mortgage-calculator`); `/mortgage` redirects there |
| `web/src/app/admin/` | Admin panel: sign-in, dashboard, properties, projects, images, homepage / about / site settings (draft → preview → publish), developers, form requests, email queue, users, audit log |
| `web/src/modules/` | Business modules (`domain` / `application` / `infrastructure` + `index.ts`): authorization, users, audit-logs, listings, media, developers, content, inquiries, reporting |
| `web/src/components/` | Modular UI components organized by domain (`layout`, `home`, `property`, `project`, `tools`, `forms`, `ui`) |
| `web/src/styles/` | Stylesheets: shared ones (`NN-*.css`, via `app/globals.css`), homepage-only (`home/`) and account pages (`account/`), each loaded only where used (D-49) |
| `web/e2e/` | Browser tests (Playwright): carousel, hero search, accounts, review wall. `npm run test:e2e` after `npm run build` |
| `.github/workflows/ci.yml` | Checks on every pull request: lint, types, unit tests, build, `verify.sh`, browser tests |
| `web/src/data/` | Starter content imported into the database on first run (`catalog.ts`, `content-defaults.ts`, `site.ts`); after that everything is edited in `/admin` |
| `web/public/brand/` | Only the brand files the site serves (header/footer logos at 3× display size, favicons, JSON-LD logo, link-preview image) |
| `docs/client-assets/brand-kit/` | Full brand lockup set (all colours, full size), derived strictly from the client-supplied `leap-living-logo.png`; not published |
| `web/public/images/` | High-resolution architectural photography sourced from public stock repositories (zero people) |
| `docs/business/` | Approved company copy (`client-content.md`) |
| `docs/deployment/` | cPanel deployment guidance |
| `docs/source-materials/` | Original client assets (git-ignored except `README.md`) |

## Governance Documents

Start with [`AGENTS.md`](./AGENTS.md) before any change. Current phase and handoff status live in [`STATUS.md`](./STATUS.md).
