# PROJECT_CONTEXT.md — LEAP LIVING

Business context for anyone (human or AI) working on this project. Statuses follow `AGENTS.md` §6.

## 1. Company

- **Name:** LEAP LIVING (stylised LEAP / LIVING, with a keyhole-in-circle icon).
- **What it is:** a real-estate **consultancy** in Dubai, UAE. It positions itself as a "trusted advisory partner rather than a conventional brokerage". Not a generic listings marketplace.
- **CEO:** Mohab Samak. *(Per client meeting directive: always use **`CEO`** only — never `Founder & CEO`.)*
- **Domain (from brand guidelines footer):** leapliving.ae
- **Core belief (client copy):** "Better decisions come from clarity and precision."
- **Approved Eyebrow / Tagline:** "CERTAINTY THROUGH PRECISION"
- **Approved Hero Headline:** "Unlock your next move"
- **Designer of the brand identity:** EVOX (credited in the brand guidelines).
- **Reference inspiration:** [Provident Estate](https://providentestate.com/).

## 2. Audience

High-net-worth individuals, international property investors, buyers and owners, institutional investors, family offices, corporate stakeholders. Tone: confident, calm, precise, discreet. No hype, no urgency tactics (the company's own copy rejects "noise, speculation, and urgency").

## 3. Product

One application, two interfaces, one database:

1. **Public website (English):** Home (including Mortgage Calculator & Free Valuation CTA), About, Buy, Rent, Sell (valuation), Contact, Private Advisory, property detail pages.
2. **Admin Dashboard `/admin` (English):** properties, media, CMS content, leads/enquiries, valuation requests, viewing requests, developers, users/roles, SEO, settings, audit log.

Everything visible on the public site must ultimately be editable from the dashboard without code changes. Delivery is **phased** (`ROADMAP.md`); the architecture must not block later phases.

## 4. Contact details

| Item | Value | Status |
|---|---|---|
| Phone | +971 52 145 9888 | CLIENT-SUPPLIED (Company Profile, "Get in touch") |
| Email | contact@leapliving.ae | CLIENT-SUPPLIED (Company Profile) |
| Website | leapliving.ae | CLIENT-SUPPLIED (brand guidelines) |
| Location | Dubai, United Arab Emirates | CLIENT-SUPPLIED (exact tower/office number pending O-04 confirmation) |
| Social links | not supplied | **MISSING** |

**SAMPLE data from brand stationery mock-ups, never use as real:** "Ethan Walker, Sales Director", +971 50 456 7890, +971 4 123 4567, ethan@leap.ae.

## 5. Brand & UI Colour System (summary)

Full detail: `DESIGN_SYSTEM.md`.
- **Core Brand Colours:** Primary Teal `#3B9EA1` (RGB 59, 158, 161), Neutral Grey `#DDDDDD` (RGB 221, 221, 221), White `#FFFFFF`.
- **Supporting Website UI Colours:**
  - Dark Teal: `#185C5E` (for dark hero/highlight sections — use selectively, ~20% with headings)
  - Secondary Teal: `#287F82` (interactive hover & high-contrast accents)
  - Page Background: `#F5F7F6` (soft light background alongside `#FFFFFF`, ~55% combined)
  - Headings / Primary Text: `#252B2B`
  - Body Text: `#626B69`
  - Borders: `#E2E7E5` and `#DDDDDD` (~10%)
- **Vector Logos:** Extracted directly from `BRAND GUIDELINES.pdf` into `docs/source-materials/` and `poc/public/brand/` (`logo-primary.svg`, `logo-horizontal.svg`, `logo-mark.svg`, `logo-wordmark.svg` + `-white.svg` variants).
- **Typeface:** Poppins (Light, Regular, Medium, SemiBold, Bold) + editorial display serif for headlines as shown in the CEO-approved homepage design.

## 6. Approved Homepage Baseline & Meeting Directives (2026-11-10)

The CEO approved `docs/source-materials/homepage-approved-design.jpg` as the homepage design baseline, with **6 mandatory modifications**:

1. **Services Section — Add Consultancy:** Add **Consultancy** (`Real Estate Consultancy`) to the Services section on the website.
2. **Remove People from Homepage:** Do **not** use any photos of people on the Homepage at all — including removing Mohab Samak's portrait and removing person avatars in Client Perspectives.
3. **CEO Title:** Remove `Founder &` from the job title; use **`CEO`** only (`Mohab Samak / CEO`).
4. **Homepage Design Baseline:** Adopt the second homepage design (`docs/source-materials/homepage-approved-design.jpg`) as the base across the site.
5. **Free Valuation Button in Header:** Add a **`Free Valuation`** button in the top Header.
6. **Mortgage Calculator:** Add an interactive **Mortgage Calculator** (حاسبة التمويل العقاري) to the website, inspired by [Provident Estate](https://providentestate.com/).

## 7. Domain notes the agent must respect

- **Publication vs availability** are separate (see `ARCHITECTURE.md` §6).
- **Transaction type vs segment:** `transactionType` (SALE | RENT) × `segment` (RESIDENTIAL | COMMERCIAL). The public "Commercial" tab filters by segment.
- **Dubai advertising rules:** keep an optional `permitNumber` field in the property schema. Never invent a permit number.
- **Personal data:** leads contain personal data. Apply data minimisation and retention rules (`SECURITY.md`).
- **Valuation and viewing requests** are requests, not confirmed appointments, until an administrator confirms.

## 8. Existing assets

- Existing production site: **WordPress** on the same cPanel account. Preserve it untouched until an explicit cut-over approval.
- Brand guidelines PDF (`BRAND GUIDELINES.pdf`) and Company & CEO Profile PDF (`Company + CEO Profile.pdf`): present in root and `docs/source-materials/`.
- CEO-approved Homepage design image: `docs/source-materials/homepage-approved-design.jpg`.
- Vector SVG logos: `docs/source-materials/logo-*.svg` and `poc/public/brand/logo-*.svg`.
