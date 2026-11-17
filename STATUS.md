# STATUS.md — LEAP LIVING

> Handoff file. Update at the end of **every** session. The next agent starts here.

## Current phase

**Phase 0 — Multi-page public platform, pre-meeting delivery.** The public site is built and hardened: forms are saved to the database, admin endpoints are locked, and security headers and SEO are in place. Staging deployment on the client's Tasjeel cPanel is prepared but **on hold** (owner, 2026-11-17). ROADMAP is a guide, not a contract: quality comes first (owner).

## Last updated

2026-11-17 — by: Antigravity agent. Mobile data optimization (phones stay on lightweight 84KB WebP frame-0 poster instead of loading 150MB video); cleaned Git history with `git-filter-repo` dropping pack size from 333MB to 23.8MB; verified 75/75 PASS and force-pushed to `feat/multi-page-platform`.

### Previous update

2026-11-17 — by: Arena agent. Applied the owner's point-by-point decisions: hero original only, fluid width, Insights removed, leapliving.ae data, forms → database, locked APIs, security headers, SEO, branded 404, CSS split, tests 8 → 47.

## State of the repository

- **Repository:** `https://github.com/vdtafury/leap-living-website`. It is **public**, so never commit `.env`, databases, uploads or the original hero video. Working branch `feat/multi-page-platform`; the Next.js app lives in `web/`.
- **Pages (`web/src/app/`):**
  - `/`, `/buy`, `/rent`, `/properties/[slug]`;
  - `/projects`, `/projects/[slug]`;
  - `/sell`, `/mortgage`, `/about`, `/contact`;
  - a branded 404 (`not-found.tsx`) and error page (`error.tsx`);
  - `robots.txt`, `sitemap.xml`.
- **Homepage order:**
  1. header
  2. full-screen hero (client video, Buy/Rent search)
  3. developer marquee (28 developers, client sheet order)
  4. featured properties carousel
  5. advisory bento
  6. projects
  7. teal CTA band
  8. client perspectives (one testimonial at a time)
  9. stats
  10. footer
- **Company data:** single source `web/src/data/site.ts`, taken from https://leapliving.ae/ (owner: that site is correct). Footer, contact page and JSON-LD read it.
- **Hero video:** one file, the client's original as delivered.
  - Path `public/videos/hero/client-hero-original.mp4`, ~150 MB, git-ignored, placed with `scripts/prepare-hero-original.sh`.
  - No renditions, no trimming (D-24).
  - The poster is frame 0.
- **Styles:** `web/src/styles/01-…21-*.css`, imported in order by `web/src/app/globals.css` (was one 84 KB file). Content width is fluid, 1220 → 1560px (`DESIGN_SYSTEM.md` §6).
- **Server (`web/src/server/`):**
  - SQLite via Prisma + better-sqlite3; models `MediaAsset` and `Inquiry`.
  - Tables are created on the first request (`schema.ts`). A test checks them against `prisma/schema.prisma`.
- **APIs:**
  - `POST /api/inquiries`: the public form endpoint. It runs validation, a honeypot and a same-origin check, caps bodies at 16 KB, and saves at most 5 submissions per IP per 10 minutes.
  - Admin only: `GET /api/inquiries[?format=csv]`, `POST /api/upload`, `GET /api/sharp`.
    - Basic auth with `ADMIN_USER`/`ADMIN_PASSWORD` (password ≥ 12 characters).
    - These answer 404 when either variable is unset.
  - `GET /api/health`: returns `{status, db}`; error details go to the server log only.
- **Environment variables:** listed in `web/.env.example`:
  - `DATABASE_URL`, `STORAGE_DIR`;
  - `ADMIN_USER`, `ADMIN_PASSWORD`, `IP_HASH_SECRET`;
  - `SITE_URL`, `SITE_INDEXING`;
  - `ALLOW_FRAMING` (preview only).
- **Checks:**
  1. `npx tsc --noEmit`
  2. `npx eslint .`
  3. `npx vitest run` (12 files)
  4. `npm run build`
  5. `ADMIN_USER=… ADMIN_PASSWORD=… BASE=http://localhost:3000 bash scripts/verify.sh`, against `next start` running with the same env.

## Done

- [x] Multi-page platform and brand layer (D-21)
- [x] Developer marquee (28 developers)
- [x] Hero search inside a full-screen hero
- [x] Featured carousel and Client Experience slider
- [x] Hero: client's original video with a seamless poster → video start (poster vs frame 0 ≈ 3/255, first visible frame within one 60 fps frame of t=0)
- [x] Forms saved to the database; admin export as CSV (Excel-safe)
- [x] `/api/upload` and `/api/sharp` locked
- [x] Security headers and CSP; noindex by default
- [x] SEO: metadata on every page, canonical URLs, sitemap, robots, OG image, JSON-LD
- [x] Branded 404 and error pages
- [x] `Insights` removed from the navbar
- [x] YouTube removed (not on the real site); Facebook and TikTok added
- [x] Fluid content width (no jumps at 1400/1600/1800)
- [x] CSS split into 21 files
- [x] Tests 8 → 47, covering API, auth, rate limit, validation, CSV, schema, SEO and hero rules

## Open items (temporary on purpose, to settle at the client meeting)

- **Stats:** `21+ Years` / `AED 12B+` do not appear on leapliving.ae; the owner will confirm (O-05).
- **Testimonials:** Hassan A., Leila K. and Omar N. are placeholders, to be replaced.
- **Samples:** sample listings, projects and developer names/logos stay until the CRM and permission answers arrive (O-06). No SAMPLE labels for now (owner).
- **Links:** Privacy, Terms and some other links point to `/contact` (O-08).
- **Forms:** the CRM link and email notification are undecided (O-19). Until then, read submissions via `GET /api/inquiries?format=csv`.
- **WhatsApp:** a possible WhatsApp option next to `Know More` on property cards, after the meeting.
- **Source materials:** `docs/source-materials/` is git-ignored and absent from fresh clones.

## Next (in order)

1. Client meeting: get answers for the open items above.
2. Staging on cPanel when the owner resumes it (`docs/deployment/cpanel-staging.md`). Set `ADMIN_USER`, `ADMIN_PASSWORD` and `SITE_URL`.
3. Production cut-over, only with written approval: set `SITE_URL=https://leapliving.ae` and `SITE_INDEXING=true`.

## Blocked / waiting

- **Hosting:** staging is on hold (owner). The host OS/glibc is still unverified; better-sqlite3 needs glibc ≥ 2.28.
- **Content/legal:** O-05 stats, O-06 developer logo permissions, O-08 legal pages, O-19 SMTP / CRM.

## Session log

| Date | Who/Model | Summary | Verification |
|---|---|---|---|
| 2026-11-08 | Planning assistant | Created root docs from spec + client materials | Documentation only |
| 2026-11-08 | Audit assistant | Phase 0 public hosting checks; compatibility report; contradictions recorded | Public unauthenticated checks only |
| 2026-11-10 | Audit assistant | Local Phase 0 PoC: Next.js + Prisma + SQLite + Sharp | `tsc` PASS, `next build` PASS, `verify.sh` 14/14 PASS |
| 2026-11-11 | Antigravity | Refactored `poc/` → `web/`, built full multi-page platform, restored client logo lockups, sourced 11 internet architectural images, refined bespoke design | `tsc` PASS, `next build` PASS, `verify.sh` 33/33 PASS |
| 2026-11-11 | Antigravity | Redesigned Header (`Mortgage Calculator` + `Free Valuation ↗`, `Insights`), Hero panoramic composition (Burj Khalifa skyline + infinity-pool villa, exact preserved copy), and Search Interface (`Buy` / `Rent` / `Commercial`) | `tsc` PASS, `next build` PASS, `verify.sh` 33/33 PASS |
| 2026-11-11 | Antigravity | Fixed persistent favicon 404 regression (`logo-mark.svg` → official `/favicon.ico`, `favicon-32x32.png`, `favicon-192x192.png`, `apple-touch-icon.png`) and restored `Poppins` + `Playfair Display` web fonts in `layout.tsx` | `tsc` PASS, `next build` PASS, `verify.sh` 40/40 PASS |
| 2026-11-11 | Antigravity | Refined Hero Section centerpiece composition (removed floating villa inset, expanded Burj Khalifa panoramic showcase, refined left-edge text-to-image scrim balance) | `tsc` PASS, `next build` PASS, `verify.sh` 40/40 PASS |
| 2026-11-11 | Antigravity | Replaced white hero wash with full-bleed dark-scrim cinematic background video system (5 verified Mixkit MP4s + Skyline poster fallback), integrated translucent search bar, and refined airy `100% Fiduciary` statistics strip | `tsc` PASS, `next build` PASS, `verify.sh` 46/46 PASS |
| 2026-11-11 | Antigravity | Curated 6 luxury Dubai real-estate & executive brokerage hero clips (`dubai-palace-burj-waterfront.mp4`, `broker-key-handover.mp4`, `executive-skyscraper-meeting.mp4`, Palm Jumeirah, Marina, Downtown aerials) | `tsc` PASS, `next build` PASS, `verify.sh` 47/47 PASS |
| 2026-11-11 | Antigravity | Made Homepage top navbar transparent (`ll-header--transparent`, white logo & white links) over full-bleed Hero video, transitioning on scroll into a frosted glassy header (`ll-header--glass`) | `tsc` PASS, `next build` PASS, `verify.sh` 47/47 PASS |
| 2026-11-11 | Antigravity | Redesigned Footer to deep dark architectural teal (`#0B353A`) with internet-sourced glass skyscraper facade (`footer-glass-facade.jpg`), 5 vertical-divided columns (`Brand/Contact/Socials`, `Explore`, `Properties`, `Information`, `Location`), preserving all existing links and contact details | `tsc` PASS, `next build` PASS, `verify.sh` 47/47 PASS |
| 2026-11-11 | Arena agent | Reviewed project + homepage (desktop/mobile screenshots); installed deps (native `better-sqlite3` build), generated Prisma client, created local SQLite DB; added ESLint 9.39.5 + `eslint-config-next` 16.4.5 + Vitest 5.1.0 with `lint`/`test` scripts and first unit tests (`validation`, `safeJoin`); fixed `react-hooks/set-state-in-effect` error in `HeroVideoBackdrop` via `useSyncExternalStore`; filled `AGENTS.md` §9 commands | `typecheck` PASS, `lint` PASS (0 errors, 14 `<img>` warnings), `test` PASS 5/5, `next build` PASS, `verify.sh` 46/47 (only failure: `file` utility missing in sandbox; JPEG magic bytes confirmed manually) |
| 2026-11-11 | Arena agent | Recorded project phase count: 6 phases (0 → 5) + backlog, used as a flexible work order per owner (`D-20`); updated `ROADMAP.md` principle and `AGENTS.md` §3 | Documentation only |
| 2026-11-11 | Arena agent | Brand-aligned redesign (D-21): brand gradient, teal bands, keyhole watermark, glass-over-photo leadership section, numbered eyebrows, services bento, rebuilt property/project/quote cards, Poppins display titles, self-hosted fonts, detail-hero price panel, mobile overflow fixes. Visually checked at 1440px and 390px | `tsc` PASS, lint 0 errors (14 `<img>` warnings), tests 5/5, `next build` PASS, `verify.sh` 46/47 (only the known missing `file` utility check fails) |
| 2026-11-11 | Arena agent | Developer section rebuilt as a continuously scrolling logo marquee (13 logos sourced from public logo sites, cleaned to transparent PNGs; Meydan as a wordmark) on `/` and `/about`; pause button + reduced-motion grid | `tsc` PASS, lint 0 errors, tests 5/5, `next build` PASS; motion, pause, hover and reduced-motion verified in headless Chrome at 1440px and 390px |
| 2026-11-11 | Arena agent | Developer section moved to a glass surface: tinted Dubai skyline background, frosted band and tiles, white logos (colour on hover), divider before the footer; applied on `/` and `/about` | `tsc` PASS, lint 0 errors, `next build` PASS, no horizontal overflow at 1440px/390px |
| 2026-11-11 | Arena agent | Homepage: swapped the Developer Network marquee (now `01`, under the hero search) with the Institutional Pillars stats band (now just before the footer); eyebrows renumbered 01–06; search band lower half recoloured to blend into the glass section | `tsc` PASS, `next build` PASS, marquee motion verified, no horizontal overflow at 1440px/390px |
| 2026-11-11 | Arena agent | Developer Network switched to a light background (`glass-light`): greyscale skyline under a light scrim, frosted white tiles, grey logos turning colour on hover; search band lower half matched; dark `glass` kept as an option | `tsc` PASS, `next build` PASS, no horizontal overflow at 1440px/390px |
| 2026-11-14 | Arena agent | Developer marquee logos now shown in full brand colour by default (no greyscale; hover only lifts the tile); Meydan wordmark darkened to match | `tsc` PASS, lint 0 errors, tests 5/5, `next build` PASS, verified in headless Chrome |
| 2026-11-11 | Arena agent | Homepage search rebuilt inside a full-screen hero: glass panel, sliding Buy/Rent/Commercial control, custom accessible dropdowns (searchable Location, Bedrooms added, annual budget for Rent), mode-aware popular chips, `beds` param wired into `/buy` and `/rent`; responsive by width and height (see DESIGN_SYSTEM 7.7) | `tsc` PASS, lint 0 errors / 14 warnings, tests 5/5, `next build` PASS, verify 46/47 (`file` util missing); headless Chrome at 9 viewports, no overflow; search flow and keyboard checked |
| 2026-11-11 | Arena agent | Hero overlay changed from deep teal to a light brand-teal wash (owner request); hero copy legibility kept with a soft text-shadow and a lighter accent teal; search inner fills lightened to match; stale DESIGN_SYSTEM note on the old search band fixed | `tsc` PASS, lint 0 errors, tests 5/5, `next build` PASS; headless Chrome at 1440×900, 768×1024, 390×844 |
| 2026-11-14 | Antigravity | Hero background refreshed with bright sunny luxury beach & waterfront footage (JBR beach daylight panorama, Palm Jumeirah coastal villas, turquoise shallow ocean, luxury yacht & pool); hero headline typography aligned to brand identity Poppins with "next move." styled in brand teal accent (`#4AD2D6` / `#3B9EA1`) | `typecheck` PASS, `test` PASS 5/5, `build` PASS, `verify.sh` 47/47 PASS; headless Chrome desktop/mobile verified |
| 2026-11-14 | Antigravity | Hero proportions refined to match Provident reference (~68vh / clamp 520px–690px); perfectly balanced spacing and padding, revealing Developer Network marquee immediately above the fold | `typecheck` PASS, `test` PASS 5/5, `build` PASS, `verify.sh` 47/47 PASS; verified at 1440×900 and 1024×500 |
| 2026-11-14 | Antigravity | Navbar layout refined per owner request: the 7 navigation links (Home..Contact) centered across the navbar, hairline divider after Contact removed, balanced 3-column grid layout | `typecheck` PASS, `test` PASS 5/5, `build` PASS, `verify.sh` 47/47 PASS; verified in headless Chrome at 1440×900 |
| 2026-11-14 | Arena agent | Homepage Featured Properties turned into a carousel with prev/next arrows, counter and progress (swipe on touch, keyboard ←/→); 4 new sample BUY listings added (Jumeirah Bay Island, Bluewaters Island, Business Bay, Tilal Al Ghaf; AI-generated placeholder photos) and Emirates Hills featured, for 8 featured in total | `tsc` PASS, lint 0 errors / 14 warnings, tests 5/5, `next build` PASS, verify 46/47 (`file` util missing); new detail pages 200; carousel verified in headless Chrome at 1440/1024/390/360, one card per click, end states disabled, no horizontal overflow |
| 2026-11-14 | Arena agent | Page width system matched to the Provident reference: fluid gutter `clamp(1.25rem, 5vw, 5rem)`, content capped at 1220px, navbar wider than content (smaller fluid gutter, max 1920px), links grouped right with a hairline before the actions, menu button at ≤1200px | `tsc` PASS, lint 0 errors / 14 warnings, tests 5/5, `next build` PASS, verify 46/47 (`file` util missing); measured in headless Chrome at 11 widths (2560→390), no header or page overflow |
| 2026-11-14 | Arena agent | Developer Network marquee stripped to bare moving logos (no tiles, borders or frosted band). Site performance pass: responsive WebP pipeline (`npm run images:optimize`, `<ResponsiveImg>`) on every photo, preloaded hero poster with a mobile portrait crop, hero video re-encoded (`public/videos/hero/`, 1280 + 854) and deferred until after load (skipped on Save-Data/2G), unused per-clip posters removed, `content-visibility` on below-fold homepage sections, week-long cache headers for media. Lighthouse `/`: mobile LCP 15.3 s → 3.1 s, score 93, weight 9.96 MB → 0.66 MB; desktop 83 → 98, LCP 2.9 s → 1.0 s | `tsc` PASS, lint 0 errors / 4 warnings (was 14), tests 5/5, `next build` PASS, verify 46/47 (`file` util missing in sandbox); screenshots at 1440 and 390 |
| 2026-11-14 | Arena agent | Developer Network marquee updated to the client's 28-developer sheet (sheet order). 15 new brands added (Nshama, Dubai South, SLS, W Residences, MBR City District One, Mira, Arada, Avenew, Binghatti, Imtiaz, MAG, RAK Properties, Beyond, Expo City Dubai, and Meydan with a real logo instead of a wordmark); Emaar, Nakheel, wasl, Majid Al Futtaim and Al Barari switched to the sheet's artwork. Logos cut from the sheet with white keyed to alpha; loop duration now scales with logo count (constant speed). Sheet saved to `docs/client-assets/` | `tsc` PASS, lint 0 errors / 4 warnings, tests 5/5, `next build` PASS, verify 46/47 (`file` util missing in sandbox); all 28 logo URLs 200; screenshots at 1440 (motion and reduced-motion grid) and 390 |
| 2026-11-14 | Arena agent | Developer marquee contained to the page content width: the strip now sits inside `.ll-container` (same edges as the heading and the other sections, not full-bleed); edge fade shortened to 6% | Edges measured equal to the heading and the next section at 390/768/1024/1440/1920, no horizontal overflow; `tsc`, lint (0 errors), tests 5/5, build PASS, verify 46/47 |
| 2026-11-14 | Arena agent | Brand identity added to the Developer Network section: large faint keyhole-mark watermark (teal, 13%) cropped by the right edge; smaller and anchored bottom-right on tablet and mobile | `tsc`, lint (0 errors), tests 5/5, build PASS; screenshots at 1440, 1024 and 390 |
| 2026-11-14 | Arena agent | Developer Network background switched from near-white to a light brand-teal tint (Teal 10% to 25% scrim, skyline toned teal); keyhole watermark now white at 50%; lead text darkened to `#44504F` for AA on the tint | Contrast measured on renders: eyebrow 6.0, title 10.3, lead 5.7, Pause 6.8 (all ≥ 4.5); lint 0 errors, tests 5/5, build PASS, verify 46/47; screenshots at 1440, 1024 and 390 |
| 2026-11-14 | Arena agent | Homepage `05 Executive Leadership` removed (CEO block stays on `/about`, D-22). Its glass-over-photo design reused for `05 Client Perspectives`: one large testimonial at a time, arrows + counter + dots, keyboard and swipe, no autoplay (`client-experience.tsx`, `.ll-cx-*`). `verify.sh` Mod #3 now checks `/about` | `tsc` PASS, lint 0 errors (3 warnings), tests 5/5, `next build` PASS, `verify.sh` 48/49 (only the known `file` utility check fails); visually checked at 1440/1100/900/390; scoped darker glass tint keeps the quote at AA contrast |
| 2026-11-16 | Arena agent | Client feedback (D-23): property card CTA `View Property Brief` → `Know More` (+ sr-only property name); hero search reduced to `Buy` / `Rent` (Commercial tab removed, commercial listings included in Buy/Rent communities); Executive Leadership removal already done (D-22); verify.sh +3 checks | `tsc` PASS, lint 0 errors (3 warnings), tests 5/5, `next build` PASS, `verify.sh` 51/52 (only the known `file` utility check fails); checked at 1440 and 390 |
| 2026-11-16 | Arena agent | cPanel staging prep: host offers Node 22.23.5 (compat item 1 PASS). Added `web/scripts/deployment/package-cpanel.sh`, which builds the standalone bundle in a CloudLinux-safe layout (`leapliving-app/app/server.js`), rebuilds better-sqlite3 for glibc 2.28, creates the initial DB, smoke-tests and zips. Added `STORAGE_DIR` so uploads live outside the release. verify.sh now checks the hero renditions actually served (not the unused masters). Guide: `docs/deployment/cpanel-staging.md` | `tsc` PASS, lint 0 errors (3 warnings), tests 5/5, package script run twice PASS, extracted bundle `verify.sh` 57/58 (only the known `file` utility check fails) |
| 2026-11-16 | Arena agent | Review fixes on the client hero reel. (1) The poster commit had overwritten `hero-dubai-skyline.jpg` (and the unused duplicate `hero-dubai-beach-daylight.jpg`) with the reel's first frame, so the *Burj District Private Collection* project and four property galleries showed Palm Jumeirah; the original skyline photo and its WebP variants are restored, the orphan duplicate and the skyline portrait crop removed. (2) `client-hero-1280/854.mp4` re-encoded from the 1080p master at 24 fps, CRF 31/33, preset slow: 19.3 → 9.1 MB and 7.5 → 3.8 MB, same 74 s, first frame still matches the poster. `encode-hero-videos.sh` no longer hard-codes a local ffmpeg path. (3) Homepage hidden `Platform Ready (DB assets)` line and `force-dynamic` removed: `/` is prerendered and no longer returns 500 when the database is unavailable; verify.sh checks the marker is gone. (4) `src/data/media-assets.test.ts`: fails on byte-identical photos, missing manifest variants, or missing catalogue images. DESIGN_SYSTEM hero-video note rewritten | `tsc` PASS, lint 0 errors (3 warnings), tests 8/8, `next build` PASS (`/` static), verify.sh 50/51 (only the known `file` utility check fails), `/` returns 200 with the database directory removed; mobile 4G LCP 2.7 s (unchanged); project page and hero checked in headless Chrome |
| 2026-11-16 | Arena agent | Hero: seamless poster → video (owner request: "first frame as the background until the video plays, with no feeling of a transition"). Measured in headless Chrome, the old start differed from the video's first frame by 19.6/255 on desktop. Causes: the poster sat at `object-position: center 35%` against the video's `center`, a 1.15 s crossfade ran over a moving shot, the video was revealed on `canplay` and so showed already advanced (t≈0.1–0.4 s), and the renditions carried no colour tags. Changes: (1) poster regenerated from frame 0 of each rendition (1280 landscape, phone crop from the 854 file, enlarged to 540 so it stays the LCP); (2) same object-position on both layers; (3) video revealed with no fade on its first painted frame, rewound to 0 while hidden if needed; (4) video requested only after the poster decodes, because on slow links it had been racing the poster; (5) renditions tagged BT.709; (6) `encode-hero-videos.sh` now cuts the posters and runs `images:optimize` | Poster vs video frame 0: 1.4/255 desktop (1366/1440/1920), 2.0 phone, 3.1 tablet. First visible video frame t=0.000 s in 5 of 5 runs (desktop and phone, throttled and not). Phone 4G LCP stays the poster, 1.8–2.5 s (was 2.7 s). `tsc` PASS, lint 0 errors (3 warnings), tests 8/8, `next build` PASS, verify.sh 50/51 (only the known `file` utility check fails) |
| 2026-11-16 | Arena agent | Hero: the client's original video file (~150 MB) can now be used as delivered (owner request). GitHub rejects files over 100 MB, so it is git-ignored and lives on the build machine and the server. `scripts/prepare-hero-original.sh` copies the H.264 stream bit for bit (`-c:v copy`), drops the audio, applies faststart, adds BT.709 tags only if missing, and cuts the poster from frame 0. It refuses non-H.264, non-8-bit files. `package-cpanel.sh` ships the file if present and fails if it is not faststart. `page.tsx` checks at build time whether it exists (`hasOriginal`). Screens wider than 900 px on a fast link (Chrome `downlink` ≥ 10, or unknown) get the original; slower desktop links and a missing file fall back to 1280, and phones keep 854 | Stand-in test (an 88 MB re-mux with the index at the end and an audio track): output faststart, audio dropped, video frames md5-identical to the source. In headless Chrome, 1440/1920 fast play the original with the first visible frame at t=0.000 and poster vs frame 0 1.4–1.7/255. A 5 Mbps desktop gets 1280, a phone gets 854, and a missing file falls back to 1280. Without the file, no request is made for it. `tsc` PASS, lint 0 errors, tests 8/8, build PASS, verify.sh 50/51 (known `file` check). The stand-in poster was not committed |
| 2026-11-17 | Arena agent | Owner's point-by-point decisions. (1) Hero: 1280/854 renditions and `encode-hero-videos.sh` deleted; only the client's original plays (D-24); rule in `src/lib/hero-video.ts` (10 Mbps, with a 10% band for Chrome's privacy noise: measured 9.1–10 on an unthrottled link). (2) Fluid `--content-max: clamp(1220px, 68vw + 336px, 1560px)` replaces the 1400/1600/1800 steps; sections stay wider than the navbar (Provident reference). (3) `Insights` removed. (4) Company data from leapliving.ae in `src/data/site.ts` (D-27). (5) Forms → `Inquiry` table via `POST /api/inquiries`; admin Basic auth on export, upload, sharp; health hides errors (D-25). (6) Security headers/CSP, noindex default, robots, sitemap, OG image, JSON-LD (D-26); zod set to jitless so the CSP reports no eval. (7) Branded 404 + error page. (8) `globals.css` split into `src/styles/` (21 files). (9) Tests 8 → 47. (10) verify.sh and package-cpanel.sh updated; docs updated | `tsc` PASS, lint 0 errors (3 warnings), vitest 47/47, `next build` PASS, verify.sh 75/75, headless Chrome: 11 routes with no console/CSP errors, form submit 201 + saved row, width 1240 → 1960 grows ≤ 1px per px with no overflow |
