# DESIGN_SYSTEM.md — LEAP LIVING

Source of truth order: (1) Brand Guidelines PDF by EVOX + Approved UI Colour Specification → (2) Client Brand Logo & Concept Direction → (3) Latest Client Meeting Modifications (2026-11-10/11).

## 1. Brand idea

Premium, calm, precise. The keyhole-in-circle icon stands for access and certainty. Visual language: clean white and soft neutral surfaces (`#FFFFFF`, `#F5F7F6`) balanced with primary brand teal (`#3B9EA1`), deep architectural dark teal (`#185C5E`) for select highlight sections, generous whitespace, strong typography, and externally sourced high-resolution architectural photography with **zero photos of people on the homepage**. Never crop or reuse images from visual reference mockups.

Reference inspiration: [Provident Estate](https://providentestate.com/).

## 2. Logo

- Brand lockup variations in `web/public/brand/` are derived exclusively from the official transparent PNG uploaded by the client (`docs/source-materials/leap-living-logo.png`):
  - **Horizontal Lockup** (`logo-horizontal-brand.png`, `logo-horizontal-teal.png`, `logo-horizontal-dark.png`, `logo-horizontal-white.png`): circular keyhole icon to the left of stacked `LEAP / LIVING` (used in Header, Footer, and Dark Executive panels).
  - **Stacked Lockup** (`logo-stacked-teal.png`, `logo-stacked-dark.png`, `logo-stacked-white.png`): circular keyhole icon above `LEAP / LIVING` wordmark.
  - **Brand Mark** (`logo-mark-teal.png`, `logo-mark-white.png`): circular keyhole icon only (used for favicon and graphic marks).
  - **Word Mark** (`leap-wordmark-teal.png`, `leap-wordmark-dark.png`, `leap-wordmark-white.png`): `LEAP LIVING` typography only.
- **Clear space:** at least **1X** on all sides, where **X = the height of the circular keyhole icon**. No text, imagery, or graphics inside it.
- Do not stretch, recolour, rotate, add effects, or place on busy imagery without a solid/overlay panel.
- Keep the full logo ≥ 120px wide on screen.

## 3. Colour System (Brand Colors vs. UI Colors)

It is essential to distinguish between **Core Brand Colors** and **Supporting Website UI Colors**.

### 3.1 Approved Core Brand Colors (from `BRAND GUIDELINES.pdf` p. 15–16)

| Token | HEX | RGB | CMYK | Role |
|---|---|---|---|---|
| `brand-teal` | `#3B9EA1` | `59, 158, 161` | `74, 20, 38, 0` | Primary brand colour, key brand accents (icons, lines, borders, decoration). Not for fills behind white text (3.18:1) |
| `neutral-grey` | `#DDDDDD` | `221, 221, 221` | `12, 9, 9, 0` | Dividers, borders, secondary neutral elements |
| `white` | `#FFFFFF` | `255, 255, 255` | `0, 0, 0, 0` | Primary clean backgrounds and cards |

**Brand Teal & Neutral Tints (from `BRAND GUIDELINES.pdf` p. 16):**
- Teal tints: 75% `#6CB6B8` · 50% `#9CCECF` · 25% `#CDE6E7` · 10% `#EBF5F5`
- Grey tints: 75% `#E5E5E5` · 50% `#EDEDED` · 25% `#F6F6F6` · 10% `#FBFBFB`

### 3.2 Approved Website UI Colors

| Token | Usage | HEX | Notes |
|---|---|---|---|
| `dark-teal` | Dark Hero / Feature Sections | `#185C5E` | Used selectively for dark hero/advisory panels and dark accents |
| `secondary-teal` | Secondary Teal / Action | `#287F82` | **`--action-teal`**: every fill that carries white text or icons: primary buttons (header `Free Valuation`, hero, forms), hero search button and active Buy/Rent tab, form tabs, carousel/social/card-arrow hovers, status chips. White text 4.72:1 (AA). Hover: `--action-teal-hover` = dark teal `#185C5E` (D-38) |
| `page-bg` | Secondary / Page Background | `#F5F7F6` | Soft off-white background to alternate with pure `#FFFFFF` sections |
| `heading` | Headings / Primary Text | `#252B2B` | Deep charcoal-teal for crisp editorial headings and primary text |
| `body-text` | Body Text | `#626B69` | Balanced muted slate-grey for comfortable reading |
| `border-subtle` | UI Card & Section Borders | `#E2E7E5` | Subtle structural borders (alongside `#DDDDDD`) |

### 3.3 Visual Distribution Guidance

| Colour Family | Target Ratio | Usage |
|---|---|---|
| **White / Off-white** (`#FFFFFF`, `#F5F7F6`) | **~55%** | Dominant canvas across pages, cards, and content areas |
| **Charcoal / Dark** (`#252B2B`, `#185C5E`) | **~20%** | Typography, dark hero/advisory feature sections |
| **Teal** (`#3B9EA1`, `#287F82`) | **~15%** | Primary CTAs, active tabs, icons, prices, key brand highlights |
| **Grey / Neutral** (`#DDDDDD`, `#E2E7E5`) | **~10%** | Borders, dividers, form outlines, muted backgrounds |

> **Golden Rule:** Never make the entire website Dark Teal (`#185C5E`), and never flood the entire page with `#3B9EA1`. Keep the majority of sections on clean light backgrounds (`#FFFFFF` and `#F5F7F6`), reserving Dark Sections (`#185C5E`) for the Hero or specific executive/advisory highlights.

## 4. Typography

- **Body & UI Typeface:** **Poppins** (Light 300, Regular 400, Medium 500, SemiBold 600, Bold 700) — confirmed in `BRAND GUIDELINES.pdf` (p. 19) and company documents.
- **Display / Headlines:** **Poppins Medium 500** with tight tracking (`-0.025em`), exposed as `--font-display` (`--font-serif` is kept as an alias for old selectors). The brand identity has no serif, and its headline face `Sony Sketch EF` has no available licence (`DECISIONS.md` D-21, C-14). Quotes use Poppins Light 300, upright.
- **Loading:** self-hosted through `@fontsource/poppins` (300–700) imported in `web/src/app/layout.tsx`. No requests to Google Fonts.

## 5. Approved Homepage Baseline & The 6 Mandatory Meeting Modifications

The CEO approved the second homepage design (`docs/source-materials/homepage-approved-design.jpg`) as the visual foundation for the entire website, subject to **6 mandatory modifications** from the latest meeting:

1. **Services Section — Add Consultancy:**
   Include **Consultancy** (`Real Estate Consultancy`) prominently within the Services section (`End-to-End Real Estate Advisory`) alongside Acquisition Advisory, Investment Strategy, Disposition & Sales, and Portfolio Advisory.
2. **Remove All People from the Homepage:**
   Do **not** use any photos of people anywhere on the Homepage — including removing Mohab Samak's portrait from the Executive Leadership section and removing human avatar photos from the Client Perspectives / Testimonials section. Use architectural imagery, brand watermarks/monograms, and typographic badges instead.
3. **CEO Title — `CEO` Only:**
   Remove `Founder &` from Mohab Samak's title everywhere. Display **`CEO`** only (`Mohab Samak / CEO`).
4. **Approved Homepage Layout & Visual Direction:**
   Follow the approved layout (`docs/source-materials/homepage-approved-design.jpg`) across the site:
   - Header (`LEAP LIVING | REAL ESTATE CONSULTANCY`, navigation links, `Free Valuation` + `Private Advisory ↗` buttons)
   - Hero (`CERTAINTY THROUGH PRECISION`, `Unlock your next move`, dual CTAs, Dubai skyline & architectural terrace visual)
   - Floating Search Bar (`Buy` / `Rent` / `Commercial` tabs, Location/Community, Property Type, Price Range AED, `Search Properties ↗`) — **`Commercial` tab removed (D-23, 2026-11-16): `Buy` / `Rent` only**
   - 4-Pillar Credentials Strip (`21+ Years`, `AED 12B+`, `100% Fiduciary`, `Direct Access`)
   - Curated `Featured Properties` (3-card luxury grid)
   - `Our Services — End-to-End Real Estate Advisory` (with `Consultancy` added)
   - `Executive Leadership` (Mohab Samak, `CEO` only, zero human photo, architectural skyline/keyhole graphic) — **moved to `/about` only (D-22, 2026-11-14)**; its glass design now hosts Client Perspectives
   - `Mortgage Calculator` (interactive UAE mortgage & upfront cost calculator)
   - `Free Valuation` / Advisory request section
   - `Client Perspectives — What Our Clients Say` (zero human avatars)
   - Footer (`LEAP LIVING | REAL ESTATE CONSULTANCY`, Explore, Properties, Information, Location)
5. **Header — `Free Valuation` Button:**
   Add a dedicated **`Free Valuation`** button in the top Header next to `Private Advisory`.
6. **Mortgage Calculator (حاسبة التمويل العقاري):**
   Add an interactive **Mortgage Calculator** section inspired by [Provident Estate](https://providentestate.com/), allowing buyers and investors to calculate Monthly Payments, Down Payment (AED & %), Loan Duration (Years), Interest Rate (%), and estimated DLD/purchase fees in real time.

## 6. Layout, Components & Accessibility

- Mobile-first responsive grid (desktop, tablet, mobile).
- **Page widths (Provident-style, owner request 2026-11-14):**
  - `--page-gutter: clamp(1.25rem, 5vw, 5rem)`: the side gutter for all section content (20px on phones, up to 80px).
  - `--content-max: clamp(1220px, calc(68vw + 336px), 1560px)` (`src/styles/02-primitives.css`): content is 1220px up to a 1300px viewport, then grows **continuously** with the screen (≈1288 at 1400, ≈1357 at 1500, ≈1492 at 1700) and stops at 1560px from 1800px. It replaced fixed steps at 1400/1600/1800 that made the layout jump (owner request 2026-11-17). Card and carousel gaps follow with `clamp(28px, …, 36px)`. Content wider than the navbar's centred links is intended (Provident reference), so sections are **not** aligned to the navbar.
  - The **navbar is wider than the content**: `--nav-gutter: clamp(1.25rem, calc(10vw - 77px), 5rem)` (always ≤ the content gutter) and `--nav-max: 1920px`. At 1568px the bar runs 80px from each edge while content starts at ~174px. On phones both use 20px.
  - Navbar layout (owner commit `0bcb798`): logo on the left, the links **centred**, actions on the right, no hairline. Links: Home, About, Buy, Rent, Sell, Contact (`Insights` removed 2026-11-17: never requested). It switches to the menu button at **≤ 1200px** so the bar never gets cramped.
- Core interactive states required on all controls: hover, focus-visible ring, active, disabled, loading, empty, and confirmation states.
- WCAG 2.2 AA baseline: keyboard operability, labelled controls, semantic landmarks.

## 7. Brand Visual Layer (D-21)

Styles live in `web/src/styles/` as numbered files (`01-tokens-base.css` holds the tokens; `02-primitives.css` widths and containers; then forms, cards, sections, hero, navbar, `21-status-pages.css` for 404/error). `web/src/app/globals.css` only imports them **in order**: later files override earlier ones, so keep the numbering when adding a file.

### 7.1 Tokens

| Token | Value / purpose |
|---|---|
| `--brand-deep` | `#0A3436`, the deepest teal, used at the dark end of gradients |
| `--brand-gradient` | cyan radial glow bottom-left over a 125° teal → near-black gradient (brand PDF cover/backgrounds) |
| `--teal-band` | flat `#3B9EA1` band for stats and CTAs |
| `--keyhole-white` | data-URI thin-line keyhole for CSS backgrounds |
| `--radius-sm/md/lg` | 4 / 12 / 18 px. Cards and panels use `md` |
| `--shadow-card`, `--shadow-card-hover` | the single shadow language for every card and panel |

### 7.2 Section system (sections must read as separate)

Each section gets one surface class. Adjacent sections must never share a surface.

| Class | Surface | Used for |
|---|---|---|
| `ll-section-light` | white | default content |
| `ll-section-muted` | `#F5F7F6` | alternating content |
| `ll-section-grey` | neutral-grey wash + faint keyhole | listings blocks |
| `ll-section-teal` | flat teal band, white text | CTA bands |
| `ll-section-plain` | plain white, no decoration; consecutive plain sections share one gap | homepage lower half: Projects, valuation panel, reviews (D-27) |
| `ll-advice` | one white card in two halves: `ll-advice-owners` (title + valuation request, soft teal gradient) and `ll-hmc` (calculator) | homepage Owner & Buyer section (D-30) |
| `ll-hmc` | calculator half: kicker, title, 2 x 2 inputs on `--surface-tint`, result band in Teal 10% with the consultation button, Apply link | homepage mortgage calculator (D-30) |
| `ll-section-tint` | very light tint `--surface-tint` (`#F3F8F8`) + hairlines | homepage Advisory and Valuation (D-28); the stats band and footer use the same tint |
| `ll-section-gradient` | `--brand-gradient`, white text | featured/service blocks |
| `ll-section-image` | photo (`.ll-section-image-bg`) + teal scrim + glass panel | leadership/editorial (not used on the homepage) |
| `ll-section-dark` | gradient, white text | forms on dark (Sell valuation) |

Dark surfaces automatically re-colour titles, leads, eyebrows, link arrows and checklist ticks. Inner-page heroes (`ll-page-hero`) use the brand gradient + keyhole watermark; detail pages show the price in a glass `.ll-hero-price` panel.

### 7.3 Labels & motifs

- `ll-eyebrow-num`: index number + hairline + label, e.g. `01 | CURATED PORTFOLIO ——`. **Not used on the homepage** (D-27): homepage sections open with the title only.
- `KeyholeMark` (`web/src/components/ui/keyhole-mark.tsx`): inline SVG of the logo keyhole (circle r 62.5, viewBox 132), `aria-hidden`. Positioned with `.ll-keyhole` plus a variant (`-emblem`, `-dev`; the light homepage sections carry none, D-28). Watermark only: never recoloured, distorted, or used in place of the logo.
- Large faded index numbers (`.ll-service-bignum`) in the services bento.

### 7.4 Cards (`ll-card-*`)

Shared shell for `PropertyCard` and `ProjectCard`:

1. **Media** (`.ll-card-media`): photo with a bottom shade, status chip (secondary teal `#287F82` for `Private Advisory` / `Exclusive Mandate` / project status, so white text passes 4.5:1; glass otherwise), type/developer chip, and location in the media foot.
2. **Body**: kicker (segment · completion), title, price (with frequency for rentals), then either `ll-card-specs` (beds/baths/area with icons, beds hidden when 0) or `ll-card-facts` (handover + payment plan) for projects.
3. **Foot**: reference code + `Know More` (property, with a screen-reader-only "about <title>" suffix; D-23) / `Explore Development` (project) CTA with a circular arrow.

Other cards: `ll-service-tile` (glass; `.featured` = teal tile spanning two rows), `ll-quote-card` (quote mark, text, monogram + author/role), and panels (`ll-form-card`, `ll-key-specs-box`, `ll-mortgage-shell`, `ll-filter-bar`, `ll-leadership-panel`). All use `--radius-md` + `--shadow-card`.

### 7.5 Developer network marquee

`DeveloperShowcase` (`web/src/components/home/developer-showcase.tsx`), used on `/` (directly under the hero) and `/about`. **Logos only** (D-27): no eyebrow, title, lead or Pause button; the section is named by `aria-label="Developers we work with"`. It has no state, so it is a server component (no client JavaScript).

- Default surface **`glass-light`**: a **flat brand-teal tint gradient with the white keyhole watermark, no photo** (owner, 2026-11-18, D-39). It runs `#E3F2F2` at the top to `#B6D8D9` near the bottom (the colours the old scrim had over the skyline, now opaque) with a soft teal glow bottom-left, so the band keeps its colour. Logos scroll **bare, straight on the tint**: no tiles, no borders/frames, no frosted band. They show in their **original brand colours at all times**; hover gives a gentle 1.08 scale.
- The section starts directly under the full-screen hero (the search now lives inside the hero, see 7.7).
- Other surfaces: `glass` (skyline photo `developer-network-skyline.jpg` under a deep-teal scrim plus the keyhole watermark, bare white logos; not used at the moment) and flat `light` / `muted`.

- Data: `DEVELOPER_BRANDS` in `web/src/data/catalog.ts` (name, logo path, display width/height). It holds **28 developers in the order of the client's "Developers we work with" sheet** (`docs/client-assets/developers-we-work-with.png`, received 2026-11-14): Emaar, Nakheel, Meraas, Dubai Properties, Majid Al Futtaim, Select Group, Omniyat, Nshama, DAMAC, Al Barari, Dubai South, SLS Dubai, W Residences, MBR City District One, wasl, Sobha Realty, Mira, Arada, Avenew, Aldar, Ellington, Binghatti, Imtiaz, MAG, RAK Properties, Beyond, Expo City Dubai, Meydan.
- Logo files are transparent PNGs in `web/public/images/developers/` (~230 KB total). Eight are earlier 120px-tall masters that match the sheet's artwork: Meraas, Dubai Properties, Select Group, Omniyat, DAMAC, Sobha, Aldar, Ellington. The other 20 were **cut from the client sheet** with the white keyed out (colour-to-alpha, no halo), so they are only ~30–60px tall. That is sharp at 1x and slightly soft on retina screens. **Next step: ask the client for the original logo files (SVG or large PNG)** and drop them in under the same file names. Emaar, Nakheel, wasl, Majid Al Futtaim and Al Barari now use the sheet's versions (wordmark-only Emaar/Nakheel, black "wasl", horizontal MAF).
- Display sizes are optically balanced (≈3,500 px² each, max 150 wide / ~50–56 tall): square marks are taller, long wordmarks are shorter. Crops are never shown much larger than their native size.
- A brand without a logo file still renders as a spaced uppercase wordmark (fallback; no brand uses it at the moment).
- **Rendering (no glitches on the hero):** logos keep their own GPU layer (`will-change: transform`) so the hover zoom never creates or drops a layer; the strip has `contain: paint`; the hero glass search (`.ll-hs`) has a stable layer (`translateZ(0)`). Without this, Chrome showed lines across the search's backdrop blur while a logo was hovered (owner, 2026-11-18).
- Loop duration scales with the logo count (`--marquee-items`, set by the component): 3.9 s per logo (3 s on mobile), so adding brands keeps the glide speed constant (28 logos give 109 s).
- The dark `glass` surface turns logos into white silhouettes. Several sheet logos (Dubai South shield, Mira box, Aldar) lose detail that way, so keep `glass-light` for this list.
- **Brand watermark:** a large Leap Living keyhole mark (`<KeyholeMark className="ll-keyhole ll-keyhole-dev">`) sits behind the logos, cropped by the right edge of the section like the Brand Guidelines cover. It is 640 px, **white at 50%** on the teal tint (white at 10% on the dark `glass` surface); at ≤960 px it shrinks to 440 px and anchors bottom-right. It was removed with the photo and then brought back at the owner's request (2026-11-18: "دا كان حلو").
- **Contained strip:** the marquee sits inside `.ll-container`, so it starts and ends exactly where the heading and every other section's content do (same `--content-max` and `--page-gutter`). It is **not** full-bleed (owner request, 2026-11-14). Logos fade in and out over the outer 6% of that box.
- Slots: each logo sits in an invisible fixed-width slot, 200×72 (156×60 on mobile), so the spacing stays even. **Do not reintroduce tile backgrounds, borders, shadows or a band.** Logos are full colour on light and flat surfaces; only the dark `glass` variant renders them white.
- Motion: CSS-only `translateX(-50%)` loop over a duplicated list (the duplicate is `aria-hidden`), 55s per loop (42s on mobile), edge fade mask. Pauses on hover and on keyboard focus. `prefers-reduced-motion` turns it into a static wrapped grid.
- Logos are third-party trademarks. Usage permission is still open (`DECISIONS.md` O-06) and must be confirmed before launch.

### 7.6 Homepage section order

1. Full-screen hero (video) with the glass search **inside** it (see 7.7); on desktop the search is at most 1040px wide, centred, and sits lower under the buttons (D-30); on desktop its height is `100svh - 130px` (560–860px), so hero + developer strip fill the first screen (D-29)
2. Developer Network: light glass logo marquee, logos only; a tight band of about 130px (104px on phones) (D-29)
3. Institutional Pillars (21+ Years, AED 12B+, ...): light tint, teal line icons, hairline dividers; 2 x 2 on phones (D-28)
4. Featured Properties: white, **carousel with an edge tab, segments and a View all card** (see 7.8)
5. Advisory: bento on the light tint (`ll-section-tint`), white tiles, lead tile Teal 10%
6. Selected Projects: plain white
7. Valuation & Mortgage: light tint, **one card** (`ll-advice`, D-30). Left half: eyebrow, section title, then For Owners ("What is your property worth?" + Request Free Valuation). Right half: For Buyers, the mortgage calculator (`#mortgage-calculator`). One action per side; the halves stack on tablets and phones
8. Client reviews: plain white, **client index + one large review** (see 7.10, D-42)
9. Footer: light tint (coloured logo, hairlines)

**Rule (D-28):** from the stats band down, surfaces alternate tint / white so neighbouring sections never share a background.

### 7.9 Media & performance rules

Measured with Lighthouse 12 on `/` (`next start`). Mobile uses default throttling; desktop is 1440 px wide.

| | Mobile before | Mobile after | Desktop before | Desktop after |
|---|---|---|---|---|
| Performance score | n/a¹ | **93** | 83 | **98** |
| LCP | 15.3 s | **3.1 s** | 2.9 s | **1.0 s** |
| FCP / TBT / CLS | 1.4 s / 0 / 0 | 1.4 s / 0 / 0 | 0.4 s / 0 / 0.001 | 0.4 s / 0 / 0.001 |
| Page weight | 9,962 KiB | **663 KiB** | 14,584 KiB | **3,170 KiB**² |

¹ Speed Index errored in that run. ² Includes the hero video, which now loads only after the page has finished loading.

- **Photos:** never reference `/images/*.jpg|png` from a raw `<img>`. Use `<ResponsiveImg src sizes>` (`web/src/components/ui/responsive-img.tsx`). It serves pre-generated WebP variants (640/768/960/1280/1920) from `public/images/opt/` via `srcSet`, and is lazy by default (`priority` sets eager loading and `fetchPriority="high"` for above-the-fold images). After adding or replacing a photo, run `npm run images:optimize` and commit `public/images/opt/` and `src/data/image-manifest.json`. Sharp runs at build time on a dev machine, not on the host.
- **Hero poster (the LCP element):** preloaded with high priority. It is frame 0 of the client's original video (`client-video-frame-0.jpg`, cut by `scripts/prepare-hero-original.sh`); phones in portrait get a 540×900 centre crop (`CROPS` in `scripts/optimize-images.mjs`). The poster is the whole picture for visitors who get no video, so it stays full quality.
- **Hero video (seamless start):** the client's Dubai reel (74 s, looped) plays from **one** file, the client's original exactly as delivered (`client-hero-original.mp4`, ~150 MB, 1080p60, ~16 Mbps, copied without re-encoding, faststart). Owner decision 2026-11-17: no lighter renditions, no trimming. It is git-ignored because of GitHub's 100 MB limit and the page checks at build time whether it exists. Who gets it is decided in `src/lib/hero-video.ts` (unit-tested): phones (`HERO_MOBILE_QUERY` = `(max-width: 700px), (pointer: coarse) and (max-height: 500px)`, so a phone turned sideways counts too; tablets and desktops play), Save-Data, Chrome-reported 2G/3G, Chrome downlink under 10 Mbps (with a 10% band for Chrome's privacy noise on its capped value), reduced-motion, or a missing file → poster only; localhost always plays. The visitor must not see a switch, so four rules apply. (1) The video is requested only after the poster has decoded. (2) Poster and video share `object-fit: cover; object-position: center center`. (3) The video stays at opacity 0 until `requestVideoFrameCallback` reports its first painted frame; if that frame is past 0.05 s, it rewinds to 0 while still hidden. (4) It is then shown instantly with no fade, so the still simply starts moving. Measured 2026-11-17: poster vs video frame 0 differs by 2.9–3.7/255; first visible frame at t=0.000–0.017 s (at most one frame at 60 fps). Never overwrite another photo with the poster: `hero-dubai-skyline.jpg` is used by project and property galleries, and a test fails on byte-identical photos.
- **Developer logos** stay PNG (≈80 KB total). WebP with alpha came out larger.
- **Deferred rendering:** homepage sections below `01` and the footer carry `ll-defer-render` (`content-visibility: auto`), so the browser skips their layout, paint and lazy images until they near the viewport. Paint containment clips overflow to the section box, so keep decorations inside the section. A full-page screenshot that does not scroll shows these sections blank; that is expected.
- **Caching:** `next.config.ts` sends `Cache-Control: public, max-age=604800, stale-while-revalidate=86400` for `/images`, `/videos` and `/brand`. File names are not hashed, so they are not marked immutable.

### 7.7 Hero search (`ll-hs-*`)

The search lives inside the hero (`.ll-hero-inner` = hero copy + `<HeroSearchBar />`). There is no separate search band any more.

- **Hero overlay (`.ll-hero-scrim`):** a **light** brand-teal wash (owner request, replacing the earlier deep-teal 88% scrim). It runs `rgba(36,112,115,.6)` behind the copy → `#3B9EA1` at 36% → 14% → 6% on the right, plus a soft top/bottom shade (34% / 26%). The hero copy gets a faint `text-shadow`, and "next move." uses `--brand-teal-25`, so text stays legible on the lighter photo. The search's inner fills were lightened to `rgba(8,44,46,.22–.24)`.
- **Hero size:** `min-height: clamp(520px, 68vh, 690px)` on desktop, matching top-tier Dubai consultancy proportions (e.g. Provident) where the hero occupies ~68% of the viewport and seamlessly reveals the partner/developer network band immediately above the fold. Padding and gaps use `vh` clamps; content can always grow past the minimum.
- **Panel:** frosted glass (`rgba(255,255,255,.15→.06)`, `blur(22px) saturate(140%)`, 1px white/22% border, 22px radius). Falls back to deep teal `rgba(10,52,54,.82)` where `backdrop-filter` is unsupported.
- **Modes:** segmented **Buy / Rent** pill with a sliding teal thumb (`--mode-index`). The `Commercial` tab was removed (D-23); commercial listings appear under the matching Buy/Rent mode.
- **Bar:** Location (searchable) · Property type · Bedrooms · Price (Annual budget in Rent). Fields are separated by hairlines; the whole field is the click target.
- **Dropdowns (`HeroSelect`):** custom button + listbox (WAI-ARIA). Keyboard: arrows, Home/End, type-ahead, Enter, Escape, Tab. Opens upward when there is less than 300px below. The popover is **solid white**, because nested `backdrop-filter` lets the copy bleed through.
- **Submit:** teal, 56px tall, magnifier icon.
- **Routing:** `/buy` or `/rent` with `community`, `type`, `beds`, `budget`; listing pages pre-fill all four (`initialBeds`).

| Viewport | Layout |
|---|---|
| > 900px | single-row bar, hairline dividers |
| ≤ 900px | 2-column tiles, full-width Search |
| ≤ 600px | Location full width; Type + Beds; Price + Search; hero CTAs hidden |
| ≤ 400px | shorter "Type" label, tighter field padding |
| desktop, height ≤ 820px | hero CTAs hidden (search is the primary action) |
| desktop, height ≤ 720px | compact spacing and title |
| phone, height ≤ 700px | compact top padding |
| landscape, height ≤ 520px | title on one line; 4 fields + icon-only Search in one row |

Verified with no horizontal overflow, and with the panel fully in view, at 1920×1080, 1440×900, 1366×650, 1280×600, 1024×1366, 768×1024, 390×844, 360×640 and 844×390.

### 7.8 Featured properties carousel (`ll-carousel-*`)

`PropertyCarousel` (`web/src/components/property/property-carousel.tsx`) is a thin wrapper over the shared `Carousel` (`web/src/components/ui/carousel.tsx`). Only the listings use it (the reviews stopped using it in D-42, so no two homepage sections look alike). Slides are rendered on the server and passed in, so the cards ship no JavaScript. It replaces the fixed 3-card grid on the homepage. It shows every `featured: true` BUY listing (currently 8).

- **Track:** a native horizontal scroll-snap list (touch swipe and trackpad). It **bleeds** to the right edge of the screen (`ll-carousel--bleed`, section `ll-carousel-bleed-host`), and the cards are sized so the next one always peeks in (`--carousel-peek`: 130px desktop/tablet, 64px phones, 48px at 360px and below), D-46. The track has internal padding so the hover lift and shadow are not clipped.
- **No buttons in the header (D-47, owner: \"no round buttons up in the corner; something creative that needs no thinking\").** The header keeps only the title and the *View All Properties for Sale* text link.
- **Edge tab (after Netflix rows):** the peeking card on the right is faded with a white gradient and carries a tall rounded tab (64 × 132px, action teal, white arrow + **\"5 more\"**; not a circle), centred on the card height. One click turns a whole page (as many cards as are fully in view); the arrow nudges right on hover, the tab turns dark teal. Once the row has moved, a white tab with **"3 back"** appears on the left. The track **bleeds to both screen edges** (`--carousel-side`), so the card before peeks in from the left exactly as the next one does on the right; the left fade covers only that screen-edge strip, never the first card in view. The tabs sit in a stage that is exactly as tall as the cards (`display: flow-root`). When the last card is in view the right tab fades out. Hidden at 700px and below, where the peek + swipe say the same thing.
- **Segments (after Apple / Instagram stories):** under the track, one 4px segment per property (22px tall hit area); the cards in view are teal, the rest grey; a click goes to that card. To the right a counter **\"1–3 of 8\"** (`aria-live`).
- **Mouse drag:** on devices with a fine pointer the track shows a grab cursor and can be dragged (6px threshold, then it settles on the next card in the drag direction). A drag never opens a card, and any text selection is cleared. Touch and pen keep the native swipe.
- **End card:** after the last property, a dark-teal *View all* card (`ll-carousel-endcard`) with the number of properties for sale, the brand keyhole watermark and *View All Properties for Sale* + white arrow tile, linking to `/buy`. It is not counted in the segments.
- **Per view:** 3 above 1120px; 2 at 1120px and below; 1 at 700px and below, always plus the peek. On mobile the link shortens to "View all".
- **Accessibility:** `role="region"` + `aria-roledescription="carousel"`; slides are labelled "n of N"; ←/→ move one card when focus is inside; the tabs are real buttons ("Next properties, 5 more"), removed from the tab order and from assistive tech while hidden; segments are buttons labelled "Show property n of N" with `aria-current`. Smooth scrolling and all motion are disabled under `prefers-reduced-motion`.

### 7.8.1 Property card (`property-card.tsx`, `27-property-card.css`, `ll-pc-*`, D-46)

| Row | Content |
|---|---|
| Image | 4:3 (owner: bigger photo), status + type chips, heart, location on the photo |
| 1 | *Residential · Ready* (teal kicker) ... reference (grey) |
| 2 | Title, one line with an ellipsis |
| 3 | Price (dark teal, 700) ... *Know More* + round arrow (the arrow is dropped on cards 300px wide and narrower, and the row may wrap, so a full price such as *AED 1,100,000 / year* is never clipped) |
| 4 | Hairline, then beds · baths · area spread across the width, values bold |
| 5 | *WhatsApp* (green icon) · *Call* · *Email*: equal 40px buttons, 1px border, hover = tint; WhatsApp opens a new tab with a message naming the listing |

Narrow cards (container query on the card: 360, 300 and 270px) shrink type and gaps, so every row stays on one line down to 320px screens. The project card keeps the older `ll-card-*` body.

> The four listings added on 2026-11-14 (Jumeirah Bay Island, Bluewaters Island, Business Bay, Tilal Al Ghaf) are **sample showcase mandates**, like the rest of the catalogue. Their photos (`property-jumeirah-bay-mansion.jpg`, `property-bluewaters-residence.jpg`, `property-business-bay-penthouse.jpg`, `property-lagoon-villa.jpg`) are **AI-generated placeholders**. Replace them with real listing photography before launch.

### 7.10 Client reviews: review wall (`client-experience.tsx`, `ll-rw-*`, D-44)

Replaces the D-42 client index (owner: all reviews visible at once, like the big sites).

| Part | Rule |
|---|---|
| Header | Title; below it the summary when there are 3+ real reviews (score 2.6rem, stars, "Based on N client reviews", 5-to-1 gold bars); actions on the right (*Share your experience* primary + *Speak With an Advisor* link) |
| Grid | 3 columns > 1100px, 2 columns > 640px, 1 column on phones; reading order (newest first); even rows, author pinned to the card bottom |
| Card | White, 1px border, radius 12; stars 16px + faint teal quote mark; headline 600; text 0.92rem / 1.7, clamped to 5 lines with *Read more* when longer than 240 characters; avatar 44px + name + role; hover = teal border + soft shadow |
| Phones | First 3 cards, then a full-width *Show all N reviews* button |
| Must not look like | The listings carousel: no arrows, counter, progress bar or photos |

### 7.11 Page changes (`page-transitions.tsx`, `24-page-transitions.css`, D-43)

| Part | Rule |
|---|---|
| Crossfade | Old page fades out 200ms (ease-in); new page fades in and rises 14px, 380ms (ease-out, 40ms delay). Total about 0.4s, and it never waits for images |
| Header | `view-transition-name: site-header`: its own layer, no fade, no slide |
| Speed | Navbar links are fully prefetched, so the new page renders from memory |
| Not animated | Same-page links (hash, filters), the admin, back / forward, new-tab clicks, browsers without View Transitions, `prefers-reduced-motion` |
| Not used | React `<ViewTransition>`: it holds the old page until the new page's images load (up to 1.8s) |

### 7.12 Projects: expanding panels (`project-panels.tsx`, `25-project-panels.css`, D-45)

| Part | Rule |
|---|---|
| Layout | Up to 5 photo panels in a row, 500–600px tall; the open one grows to `count + 1` times a closed one (0.7s ease-out) |
| Closed panel | Even teal wash, number top-left, name + community written bottom-to-top |
| Open panel | Dark gradient behind the text only; status chip, white developer logo, pin + community · segment, name, unit types, facts (starting price, handover, payment plan), *Explore Development* + round arrow; heart top-right |
| Interaction | Hover, focus or tap opens; the open panel is one link; text has a fixed width so it never reflows while the panel widens |
| Phones ≤ 899px | Swipe slider: cards 86% wide, scroll-snap, all open, dots below (current = 24px teal pill); stronger bottom gradient |
| Must not look like | The featured-properties carousel (white cards, arrows, counter) |

### 7.13 Stars and reviews (`stars.tsx`, `26-reviews.css`, D-44)

| Part | Rule |
|---|---|
| Star colour | Gold `#d4a43b` filled, `#dfe4e2` empty; partial stars by width clip (average) |
| Homepage | Stars at the top of every review card; summary with score, stars and 5-to-1 bars from 3 real reviews (7.10) |
| Form | Five 42px star radios (real inputs, keyboard + focus ring), word next to them (*Poor* … *Excellent*), man / woman picture as pill radios, live "Shown as *Mona A.*" line, character counter |
| Status | Left border + chip: waiting = gold, published = teal, hidden = grey |

