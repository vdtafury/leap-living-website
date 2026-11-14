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
| `brand-teal` | `#3B9EA1` | `59, 158, 161` | `74, 20, 38, 0` | Primary brand colour, primary buttons, key brand accents |
| `neutral-grey` | `#DDDDDD` | `221, 221, 221` | `12, 9, 9, 0` | Dividers, borders, secondary neutral elements |
| `white` | `#FFFFFF` | `255, 255, 255` | `0, 0, 0, 0` | Primary clean backgrounds and cards |

**Brand Teal & Neutral Tints (from `BRAND GUIDELINES.pdf` p. 16):**
- Teal tints: 75% `#6CB6B8` · 50% `#9CCECF` · 25% `#CDE6E7` · 10% `#EBF5F5`
- Grey tints: 75% `#E5E5E5` · 50% `#EDEDED` · 25% `#F6F6F6` · 10% `#FBFBFB`

### 3.2 Approved Website UI Colors

| Token | Usage | HEX | Notes |
|---|---|---|---|
| `dark-teal` | Dark Hero / Feature Sections | `#185C5E` | Used selectively for dark hero/advisory panels and dark accents |
| `secondary-teal` | Secondary Teal / Interactive Hover | `#287F82` | Button hover states, secondary highlights, high-contrast interactive elements |
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
   - Floating Search Bar (`Buy` / `Rent` / `Commercial` tabs, Location/Community, Property Type, Price Range AED, `Search Properties ↗`)
   - 4-Pillar Credentials Strip (`21+ Years`, `AED 12B+`, `100% Fiduciary`, `Direct Access`)
   - Curated `Featured Properties` (3-card luxury grid)
   - `Our Services — End-to-End Real Estate Advisory` (with `Consultancy` added)
   - `Executive Leadership` (Mohab Samak, `CEO` only, zero human photo, architectural skyline/keyhole graphic)
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
  - `--content-max: 1220px`: `.ll-container` = 1220px of content plus gutters, centred.
  - The **navbar is wider than the content**: `--nav-gutter: clamp(1.25rem, calc(10vw - 77px), 5rem)` (always ≤ the content gutter) and `--nav-max: 1920px`. At 1568px the bar runs 80px from each edge while content starts at ~174px. On phones both use 20px.
  - Navbar layout: logo on the left; links grouped on the right next to the actions, separated by a 1px hairline. It switches to the menu button at **≤ 1200px** (was 1120px) so the bar never gets cramped.
- Core interactive states required on all controls: hover, focus-visible ring, active, disabled, loading, empty, and confirmation states.
- WCAG 2.2 AA baseline: keyboard operability, labelled controls, semantic landmarks.

## 7. Brand Visual Layer (D-21)

All tokens live at the top of `web/src/app/globals.css`; the brand layer is appended after the base styles.

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
| `ll-section-teal` | flat teal band, white text | CTA bands (`ll-cta-band`) |
| `ll-section-gradient` | `--brand-gradient`, white text | featured/service blocks |
| `ll-section-image` | photo (`.ll-section-image-bg`) + teal scrim + glass panel | leadership/editorial, same language as the footer |
| `ll-section-dark` | gradient, white text | forms on dark (Sell valuation) |

Dark surfaces automatically re-colour titles, leads, eyebrows, link arrows and checklist ticks. Inner-page heroes (`ll-page-hero`) use the brand gradient + keyhole watermark; detail pages show the price in a glass `.ll-hero-price` panel.

### 7.3 Labels & motifs

- `ll-eyebrow-num`: index number + hairline + label, e.g. `01 | CURATED PORTFOLIO ——`.
- `KeyholeMark` (`web/src/components/ui/keyhole-mark.tsx`): inline SVG of the logo keyhole (circle r 62.5, viewBox 132), `aria-hidden`. Positioned with `.ll-keyhole` plus a variant (`-stats`, `-grey`, `-teal-band`, `-services`, `-tile`, `-emblem`). Watermark only: never recoloured, distorted, or used in place of the logo.
- Large faded index numbers (`.ll-service-bignum`) in the services bento.

### 7.4 Cards (`ll-card-*`)

Shared shell for `PropertyCard` and `ProjectCard`:

1. **Media** (`.ll-card-media`): photo with a bottom shade, status chip (teal for `Private Advisory` / `Exclusive Mandate` / project status, glass otherwise), type/developer chip, and location in the media foot.
2. **Body**: kicker (segment · completion), title, price (with frequency for rentals), then either `ll-card-specs` (beds/baths/area with icons, beds hidden when 0) or `ll-card-facts` (handover + payment plan) for projects.
3. **Foot**: reference code + `View Property Brief` / `Explore Development` CTA with a circular arrow.

Other cards: `ll-service-tile` (glass; `.featured` = teal tile spanning two rows), `ll-quote-card` (quote mark, text, monogram + author/role), and panels (`ll-form-card`, `ll-key-specs-box`, `ll-mortgage-shell`, `ll-filter-bar`, `ll-leadership-panel`). All use `--radius-md` + `--shadow-card`.

### 7.5 Developer network marquee

`DeveloperShowcase` (`web/src/components/home/developer-showcase.tsx`), used on `/` (index `01`, directly under the hero search) and `/about`.

- Default surface **`glass-light`**: the Dubai sunset skyline (`public/images/developer-network-skyline.jpg`) **toned toward the brand teal** under a teal-tint scrim. The scrim runs from Teal 10% (`--brand-teal-10`) at the top to Teal 25% at the bottom, with a teal glow bottom-left and a soft white highlight top-right. The section reads in the brand colour, not white, while staying light enough for full-colour logos (owner request, 2026-11-14). The lead text uses `#44504F` here to keep WCAG AA (5.7:1); measured contrast is eyebrow 6.0, title 10.3, Pause 6.8. Logos scroll **bare, straight on the skyline**: no tiles, no borders/frames, no frosted band (owner request, 2026-11-14). They show in their **original brand colours at all times**; hover gives a gentle 1.08 scale.
- The section starts directly under the full-screen hero (the search now lives inside the hero, see 7.7).
- Other surfaces: `glass` (same photo under a deep-teal scrim, bare white logos that brighten on hover) and flat `light` / `muted`.

- Data: `DEVELOPER_BRANDS` in `web/src/data/catalog.ts` (name, logo path, display width/height). It holds **28 developers in the order of the client's "Developers we work with" sheet** (`docs/client-assets/developers-we-work-with.png`, received 2026-11-14): Emaar, Nakheel, Meraas, Dubai Properties, Majid Al Futtaim, Select Group, Omniyat, Nshama, DAMAC, Al Barari, Dubai South, SLS Dubai, W Residences, MBR City District One, wasl, Sobha Realty, Mira, Arada, Avenew, Aldar, Ellington, Binghatti, Imtiaz, MAG, RAK Properties, Beyond, Expo City Dubai, Meydan.
- Logo files are transparent PNGs in `web/public/images/developers/` (~230 KB total). Eight are earlier 120px-tall masters that match the sheet's artwork: Meraas, Dubai Properties, Select Group, Omniyat, DAMAC, Sobha, Aldar, Ellington. The other 20 were **cut from the client sheet** with the white keyed out (colour-to-alpha, no halo), so they are only ~30–60px tall. That is sharp at 1x and slightly soft on retina screens. **Next step: ask the client for the original logo files (SVG or large PNG)** and drop them in under the same file names. Emaar, Nakheel, wasl, Majid Al Futtaim and Al Barari now use the sheet's versions (wordmark-only Emaar/Nakheel, black "wasl", horizontal MAF).
- Display sizes are optically balanced (≈3,500 px² each, max 150 wide / ~50–56 tall): square marks are taller, long wordmarks are shorter. Crops are never shown much larger than their native size.
- A brand without a logo file still renders as a spaced uppercase wordmark (fallback; no brand uses it at the moment).
- Loop duration scales with the logo count (`--marquee-items`, set by the component): 3.9 s per logo (3 s on mobile), so adding brands keeps the glide speed constant (28 logos give 109 s).
- The dark `glass` surface turns logos into white silhouettes. Several sheet logos (Dubai South shield, Mira box, Aldar) lose detail that way, so keep `glass-light` for this list.
- **Brand watermark:** a large Leap Living keyhole mark (`<KeyholeMark className="ll-keyhole ll-keyhole-dev">`) sits behind the content, cropped by the right edge of the section like the Brand Guidelines cover. It is 640 px, **white at 50%** on the teal tint, as on the Brand Guidelines cover (white at 10% on the dark `glass` surface); at ≤960 px it shrinks to 440 px and anchors bottom-right behind the logos (owner request, 2026-11-14).
- **Contained strip:** the marquee sits inside `.ll-container`, so it starts and ends exactly where the heading and every other section's content do (same `--content-max` and `--page-gutter`). It is **not** full-bleed (owner request, 2026-11-14). Logos fade in and out over the outer 6% of that box.
- Slots: each logo sits in an invisible fixed-width slot, 200×72 (156×60 on mobile), so the spacing stays even. **Do not reintroduce tile backgrounds, borders, shadows or a band.** Logos are full colour on light and flat surfaces; only the dark `glass` variant renders them white.
- Motion: CSS-only `translateX(-50%)` loop over a duplicated list (the duplicate is `aria-hidden`), 55s per loop (42s on mobile), edge fade mask. Pauses on hover, on keyboard focus, and via a **Pause/Play** button (WCAG 2.2.2). `prefers-reduced-motion` turns it into a static wrapped grid.
- Logos are third-party trademarks. Usage permission is still open (`DECISIONS.md` O-06) and must be confirmed before launch.

### 7.6 Homepage section order

1. Full-screen hero (video) with the glass search **inside** it (see 7.7)
2. `01` Developer Network: light glass logo marquee
3. `02` Featured Properties: light, **carousel with arrows** (see 7.8)
4. `03` Advisory Scope: gradient bento
5. `04` Dubai Developments: grey
6. `05` Executive Leadership: image + glass
7. Valuation & Mortgage CTA: teal band
8. `06` Client Perspectives: muted
9. Institutional Pillars (21+ Years, AED 12B+, ...): teal stats band
10. Footer

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
- **Hero poster (the LCP element):** preloaded with high priority. Phones in portrait get an art-directed 540×900 centre crop (`CROPS` in `scripts/optimize-images.mjs`), which is sharper and lighter than the landscape frame.
- **Hero video:** renditions live in `public/videos/hero/<name>-1280.mp4` and `-854.mp4`. They are silent, trimmed to 9.6 s, faststart, and re-encoded by `scripts/encode-hero-videos.sh`. They load only after `window.load` plus idle time. Phones and 3G get 854, and Save-Data or 2G get no video (the poster stays). Clips have no `poster` attribute because a clip is only shown once it can play. The masters stay in `public/videos/`.
- **Developer logos** stay PNG (≈80 KB total). WebP with alpha came out larger.
- **Deferred rendering:** homepage sections below `01` and the footer carry `ll-defer-render` (`content-visibility: auto`), so the browser skips their layout, paint and lazy images until they near the viewport. Paint containment clips overflow to the section box, so keep decorations inside the section. A full-page screenshot that does not scroll shows these sections blank; that is expected.
- **Caching:** `next.config.ts` sends `Cache-Control: public, max-age=604800, stale-while-revalidate=86400` for `/images`, `/videos` and `/brand`. File names are not hashed, so they are not marked immutable.

### 7.7 Hero search (`ll-hs-*`)

The search lives inside the hero (`.ll-hero-inner` = hero copy + `<HeroSearchBar />`). There is no separate search band any more.

- **Hero overlay (`.ll-hero-scrim`):** a **light** brand-teal wash (owner request, replacing the earlier deep-teal 88% scrim). It runs `rgba(36,112,115,.6)` behind the copy → `#3B9EA1` at 36% → 14% → 6% on the right, plus a soft top/bottom shade (34% / 26%). The hero copy gets a faint `text-shadow`, and "next move." uses `--brand-teal-25`, so text stays legible on the lighter photo. The search's inner fills were lightened to `rgba(8,44,46,.22–.24)`.
- **Hero size:** `min-height: clamp(520px, 68vh, 690px)` on desktop, matching top-tier Dubai consultancy proportions (e.g. Provident) where the hero occupies ~68% of the viewport and seamlessly reveals the partner/developer network band immediately above the fold. Padding and gaps use `vh` clamps; content can always grow past the minimum.
- **Panel:** frosted glass (`rgba(255,255,255,.15→.06)`, `blur(22px) saturate(140%)`, 1px white/22% border, 22px radius). Falls back to deep teal `rgba(10,52,54,.82)` where `backdrop-filter` is unsupported.
- **Modes:** segmented Buy / Rent / Commercial pill with a sliding teal thumb (`--mode-index`).
- **Bar:** Location (searchable) · Property type · Bedrooms · Price (Annual budget in Rent). Fields are separated by hairlines; the whole field is the click target. Commercial locks type and beds.
- **Dropdowns (`HeroSelect`):** custom button + listbox (WAI-ARIA). Keyboard: arrows, Home/End, type-ahead, Enter, Escape, Tab. Opens upward when there is less than 300px below. The popover is **solid white**, because nested `backdrop-filter` lets the copy bleed through.
- **Submit:** teal, 56px tall, magnifier icon.
- **Quick chips:** "Popular" communities taken from the catalogue for the current mode, so a chip never leads to an empty result.
- **Routing:** `/buy` or `/rent` with `community`, `type`, `beds`, `budget`; listing pages pre-fill all four (`initialBeds`).

| Viewport | Layout |
|---|---|
| > 900px | single-row bar, hairline dividers |
| ≤ 900px | 2-column tiles, full-width Search |
| ≤ 600px | Location full width; Type + Beds; Price + Search; chips swipe in one row; hero CTAs hidden; description clamped to 3 lines |
| ≤ 400px | shorter "Type" label, tighter field padding |
| desktop, height ≤ 820px | hero CTAs hidden (search is the primary action) |
| desktop, height ≤ 720px | compact spacing and title |
| desktop, height ≤ 620px | description and chips hidden |
| phone, height ≤ 700px | eyebrow and description hidden |
| landscape, height ≤ 520px | title on one line; 4 fields + icon-only Search in one row |

Verified with no horizontal overflow, and with the panel fully in view, at 1920×1080, 1440×900, 1366×650, 1280×600, 1024×1366, 768×1024, 390×844, 360×640 and 844×390.

### 7.8 Featured properties carousel (`ll-carousel-*`)

`PropertyCarousel` (`web/src/components/property/property-carousel.tsx`) replaces the fixed 3-card grid on the homepage. It shows every `featured: true` BUY listing (currently 8).

- **Track:** a native horizontal scroll-snap list, so touch swipe and trackpad work natively. Cards keep the standard `ll-card` design. The track has internal padding so the hover lift and shadow are not clipped.
- **Controls (header, right):** "View All" link, a counter (`01–03 / 08`, announced via `aria-live`), and round prev/next buttons (48px; 44px on mobile). Each click moves exactly one card; the button is disabled at either end. Hover turns it solid teal. ←/→ keys work when focus is inside the carousel.
- **Progress:** a 2px hairline under the track with a teal thumb sized to the visible fraction.
- **Per view:** 3 above 1120px; 2 at 1120px and below; 1 card plus a peek of the next at 700px and below. On mobile the link shortens to "View all", so the link, counter and arrows fit on one row.
- **Accessibility:** `role="region"` + `aria-roledescription="carousel"`; slides are labelled "n of N". Smooth scrolling is disabled under `prefers-reduced-motion`.

> The four listings added on 2026-11-14 (Jumeirah Bay Island, Bluewaters Island, Business Bay, Tilal Al Ghaf) are **sample showcase mandates**, like the rest of the catalogue. Their photos (`property-jumeirah-bay-mansion.jpg`, `property-bluewaters-residence.jpg`, `property-business-bay-penthouse.jpg`, `property-lagoon-villa.jpg`) are **AI-generated placeholders**. Replace them with real listing photography before launch.
