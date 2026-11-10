# LEAP LIVING

Premium English-only real-estate consultancy platform for Dubai (`leapliving.ae`), organized around a dedicated multi-page public experience and preparing the modular monolith architecture for Phase 1+ Admin Dashboard, CMS, and CRM.

## Directory Structure

| Path | Purpose |
|---|---|
| `web/` | Main Next.js (App Router + TypeScript strict + Prisma + Sharp) web application |
| `web/src/app/` | Multi-page public routes (`/`, `/buy`, `/rent`, `/sell`, `/projects`, `/projects/[slug]`, `/properties/[slug]`, `/mortgage`, `/about`, `/contact`) and infrastructure API routes |
| `web/src/components/` | Modular UI components organized by domain (`layout`, `home`, `property`, `project`, `tools`, `forms`, `ui`) |
| `web/src/data/` | Typed portfolio showcase & service catalog (`catalog.ts`) |
| `web/public/brand/` | Brand logo lockups derived strictly from the client-supplied `leap-living-logo.png` |
| `web/public/images/` | High-resolution architectural photography sourced from public stock repositories (zero people) |
| `docs/business/` | Approved company copy (`client-content.md`) |
| `docs/deployment/` | cPanel deployment guidance |
| `docs/source-materials/` | Original client assets (git-ignored except `README.md`) |

## Governance Documents

Start with [`AGENTS.md`](./AGENTS.md) before any change. Current phase and handoff status live in [`STATUS.md`](./STATUS.md).
