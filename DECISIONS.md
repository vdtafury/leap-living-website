# DECISIONS.md — LEAP LIVING

Single place for accepted decisions, open questions, and known contradictions. When something is resolved, move it up and record the date and who decided.

## A. Accepted decisions

| ID | Decision | Date |
|---|---|---|
| D-01 | Modular Monolith + Clean Architecture; no microservices | 2026-11-08 |
| D-02 | Public site and admin are **English only**; no i18n infrastructure | 2026-11-08 |
| D-03 | Self-hosted on Tasjeel cPanel; no external paid/third-party services without approval | 2026-11-08 |
| D-04 | MySQL/MariaDB (per host) + Prisma | 2026-11-08 |
| D-05 | Admin Dashboard + custom CMS + internal CRM are core product, built in phases | 2026-11-08 |
| D-06 | Publication status and availability status are separate | 2026-11-08 |
| D-07 | Draft → Preview → Publish; public reads published only | 2026-11-08 |
| D-08 | Permission-based RBAC from day one; start with few roles, add roles as data | 2026-11-08 |
| D-09 | Persist form submissions before emailing (outbox) | 2026-11-08 |
| D-10 | WordPress site is preserved untouched until explicit approval | 2026-11-08 |
| D-11 | Delivery is phased (MVP first); architecture leaves seams for later modules | 2026-11-08 |
| D-12 | Develop and build **locally first**; deploy to Tasjeel only after host verification and explicit approval | 2026-11-10 |
| D-13 | **Brand & UI Colour System approved:** Core Brand (`#3B9EA1`, `#DDDDDD`, `#FFFFFF`) + Supporting UI (`Dark Teal #185C5E`, `Secondary Teal #287F82`, `Page Background #F5F7F6`, `Headings #252B2B`, `Body Text #626B69`, `Borders #E2E7E5` / `#DDDDDD`). Target distribution ~55% White/Off-white, ~20% Dark/Charcoal, ~15% Teal, ~10% Grey/Neutral | 2026-11-10 |
| D-14 | **Homepage Design Baseline approved:** CEO approved the second homepage design (`docs/source-materials/homepage-approved-design.jpg`) as the foundation for the site, with eyebrow `CERTAINTY THROUGH PRECISION` and headline `Unlock your next move` | 2026-11-10 |
| D-15 | **Services Section — Add Consultancy:** Add `Consultancy` (`Real Estate Consultancy`) to the Services section on the website | 2026-11-10 |
| D-16 | **No People on Homepage:** Do not display any photos of people on the Homepage, including Mohab Samak's portrait and client avatar photos | 2026-11-10 |
| D-17 | **CEO Title:** Remove `Founder &` from Mohab Samak's title everywhere; use **`CEO`** only (`Mohab Samak / CEO`) | 2026-11-10 |
| D-18 | **Header CTA — `Free Valuation` Button:** Add a `Free Valuation` button in the top Header alongside `Private Advisory` | 2026-11-10 |
| D-19 | **Mortgage Calculator:** Add an interactive Mortgage Calculator section to the website (inspired by Provident Estate) | 2026-11-10 |
| D-20 | **Project phases:** 6 phases (Phase 0 → Phase 5, `ROADMAP.md`) plus backlog. Owner chose to work continuously until the project is finished, with frequent changes expected; phases are used as a work order only — no fixed milestones, deadlines, or per-phase sign-off. Production deployment still requires explicit written approval | 2026-11-11 |

## B. Proposed, pending Phase 0 evidence

| ID | Proposal | Depends on |
|---|---|---|
| P-01 | Build off-server, deploy Next.js standalone bundle | Server memory limits, Node selector behavior (verified locally in `poc/`) |
| P-02 | Release folders + `current` pointer for rollback | Whether the Node app root can be repointed |
| P-03 | CMS sections via typed registry with draft/published JSON | none (design choice) |
| P-04 | `transactionType` × `segment` instead of "Buy/Rent/Commercial" as one field | O-09 |

## C. Open questions (need an answer; do not guess)

### Brand and content
| ID | Question | Who |
|---|---|---|
| O-01 | ~~Which line is the official tagline/hero message~~ **RESOLVED (2026-11-10):** CEO approved `CERTAINTY THROUGH PRECISION` (eyebrow) + `Unlock your next move` (hero headline) in `D-14`. | Resolved |
| O-02 | Vector logos (`logo-primary.svg`, `logo-horizontal.svg`, `logo-mark.svg`, `logo-wordmark.svg`) and exact colours (`#3B9EA1`, `#DDDDDD`, `#FFFFFF` + UI tokens) are now extracted and confirmed. Still open: commercial font licence for `Sony Sketch EF` if ever used (currently pairing `Poppins` with editorial display serif per approved homepage design). | EVOX / Client |
| O-03 | Inner page layouts follow the CEO-approved Homepage design system (`D-13`, `D-14`). | Resolved |
| O-04 | Real office address, social links, opening hours. Is "Office 1204, Al Saqr Business Tower" real or only a mock-up? (Currently showing `Dubai, United Arab Emirates` per approved design footer). | Client |
| O-05 | Credentials strip in the CEO-approved homepage design shows `21+ Years`, `AED 12B+`, `100% Fiduciary`, `Direct Access`. Confirm final production sign-off before public launch. | Client |
| O-06 | Permission to show developer logos/names and each relationship wording; same for employer logos in the CEO profile | Client |
| O-07 | Photo licences for non-people architectural photography. *(Note: CEO photo and all people photos are excluded from the Homepage per `D-16`.)* | Client |
| O-08 | Legal pages text (Privacy Policy, Terms), licence/registration numbers to display, whether listing permit numbers must be shown | Client / legal |

### Product and data
| ID | Question | Who |
|---|---|---|
| O-09 | Property model: confirm `transactionType` (SALE/RENT) × `segment` (RESIDENTIAL/COMMERCIAL) | Client |
| O-10 | Who enters property data, and is there data to import (from WordPress or spreadsheets)? | Client |
| O-11 | Which emails receive lead notifications and from which sender address? Who are the first dashboard users and roles? | Client |
| O-13 | Does the valuation form need document uploads (private storage) in the first release? | Client |
| O-14 | Retention period for leads and requests | Client / legal |

### Technical
| ID | Question | Resolved by |
|---|---|---|
| O-12 | Auth library vs custom sessions | Phase 0 + review |
| O-15 | Is Sharp usable on the host? Image variant strategy | Phase 0 |
| O-16 | Staging subdomain name; DNS/SSL for it | Client / hosting |
| O-17 | Where do off-account backups go? | Client |
| O-18 | Exact Node/Next/Prisma versions to pin | Phase 0 |
| O-19 | Which SMTP path for sending `@leapliving.ae` mail: M365 SMTP credentials, or host SMTP with SPF/DKIM/DMARC configured for the host? DMARC is currently absent and SPF `-all` includes only M365. | Client / hosting |
| O-20 | cPanel/WHM version and CloudLinux Node.js Selector versions available (needed to pin Node/Next/Prisma) | Phase 0 |

## D. Contradictions found and how they are handled

| ID | Contradiction | Handling |
|---|---|---|
| C-01 | Early architecture tree had `[locale]`, `i18n/`, `messages/en.json`, `ar.json`; spec says English only | Removed. English only (D-02) |
| C-02 | Spec lists 5 roles + granular RBAC from day one; pragmatic delivery wants a smaller start | Permission engine from day one, roles added by data (D-08) |
| C-03 | Website summary (6 simple pages) vs full spec (CMS, CRM, admin) | Full spec is the product; summary is the public page list only |
| C-04 | Spec says 26 Figma screens; CEO approved the second homepage design (`homepage-approved-design.jpg`) | Approved homepage design is the baseline (`D-14`) |
| C-05 | Earlier spec colour tokens vs Brand Guidelines + UI Colour Spec | **RESOLVED (`D-13`):** Core Brand (`#3B9EA1`, `#DDDDDD`, `#FFFFFF`) + Approved UI Colors (`#185C5E`, `#287F82`, `#F5F7F6`, `#252B2B`, `#626B69`, `#E2E7E5`) |
| C-06 | Contact data differs across sources (profile: +971 52 145 9888 / contact@leapliving.ae; mock-ups: other numbers/emails) | Profile data used; mock-up data is SAMPLE |
| C-07 | Hero copy in the mock-up vs the official tagline | **RESOLVED (`D-14`):** Both appear together in the approved design (`CERTAINTY THROUGH PRECISION` eyebrow + `Unlock your next move` headline) |
| C-08 | "Buy / Rent / Commercial" mixes transaction and category | P-04 / O-09 |
| C-09 | Early tree placed `middleware.ts` at the root while using `src/` | Must live inside `src/`; name depends on Next.js version (verify) |
| C-10 | Early tree duplicated the `api/` block and Prisma config location | Single `api/`; single root `prisma.config.ts` |
| C-11 | The mock-up says "Explore Verified Properties"; approved design uses "Explore Properties" | Use "Explore Properties" (`D-14`) |
| C-12 | Benchmark-based model rankings given earlier were inconsistent | Choose the coding model by a small real task |
| C-13 | **Mission/Vision wording differs** between `BRAND_GUIDELINES.pdf` and `Company + CEO Profile.pdf` | Both preserved in `docs/business/client-content.md`; client to confirm preferred variant |
| C-14 | Brand PDF specifies **Sony Sketch EF** for headlines while approved homepage uses editorial display serif + **Poppins** | Use Poppins + editorial display serif per approved homepage design (`DESIGN_SYSTEM.md` §4) |
| C-15 | Working tree had duplicate root docs and nested `leap-living-root-files/` tree | **RESOLVED (2026-11-10):** Consolidated into single clean root layout |
| C-16 | `docs/source-materials/README.md` listed wrong filenames | **RESOLVED (2026-11-10):** Updated to match exact files + extracted vector SVGs |
| C-17 | `DESIGN_SYSTEM.md` tint values and missing SVG logos | **RESOLVED (2026-11-10):** Exact tint values recorded and 8 vector SVGs extracted from `BRAND GUIDELINES.pdf` |
| C-18 | Brand collateral (letterhead, email signature) carries SAMPLE contact data and the Al Saqr Business Tower address | O-04; never publish sample contact data |
| C-19 | No DMARC for `leapliving.ae`; SPF `-all` includes only M365 | O-19 |
| C-20 | Company Profile listed Mohab Samak as `Founder & CEO` and included his portrait; latest meeting changed title to `CEO` only and prohibited people photos on Homepage | **RESOLVED (`D-16`, `D-17`):** Use `CEO` only and zero photos of people on the Homepage |
