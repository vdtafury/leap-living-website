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

`DeveloperShowcase` (`web/src/components/home/developer-showcase.tsx`), used on `/` (index `06`) and `/about`, both on the default **`glass`** surface: the Dubai sunset skyline (`public/images/developer-network-skyline.jpg`, plus a 960w variant) is tinted toward teal under a deep-teal scrim with a cyan glow at the bottom-left. A frosted band holds frosted-glass tiles with **white** logos; on hover a tile turns solid white and the logo shows its original colours. A hairline divider separates the section from the footer. `surface="light" | "muted"` remain available for flat use.

- Data: `DEVELOPER_BRANDS` in `web/src/data/catalog.ts` (name, logo path, display width/height). Logos are transparent PNGs in `web/public/images/developers/` (120px-tall masters, 128-colour, ~104 KB total). Display sizes are optically balanced: square marks are taller, long wordmarks are shorter.
- A brand without a logo file renders as a spaced uppercase wordmark (currently **Meydan**, because no reliable developer logo was found).
- Tiles: 208×108 (164×88 on mobile), `--radius-md`. On flat surfaces, logos are greyscale at 74% opacity and switch to full colour with a lift on hover.
- Motion: CSS-only `translateX(-50%)` loop over a duplicated list (the duplicate is `aria-hidden`), 55s per loop (42s on mobile), edge fade mask. Pauses on hover, on keyboard focus, and via a **Pause/Play** button (WCAG 2.2.2). `prefers-reduced-motion` turns it into a static wrapped grid.
- Logos are third-party trademarks. Usage permission is still open (`DECISIONS.md` O-06) and must be confirmed before launch.

