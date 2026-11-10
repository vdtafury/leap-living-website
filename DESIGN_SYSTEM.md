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
- **Editorial Display / Headlines:** The CEO-approved homepage design pairs clean geometric sans-serif UI/subtitles with an editorial serif display font (`Playfair Display` / `Cormorant Garamond` style) for major section titles (`Unlock your next move`, `Featured Properties`, `End-to-End Real Estate Advisory`, `What Our Clients Say`).
  *(Note: `BRAND GUIDELINES.pdf` p. 18 also mentions `Sony Sketch EF` for signage/headlines, which has an unverified commercial licence — see `DECISIONS.md` C-14).*

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
