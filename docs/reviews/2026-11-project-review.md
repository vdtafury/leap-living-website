# Project review: November 2026

Full pass over the code, assets and performance of `web/` (owner request, 2026-11-18:
"a full review, fix the problems, clean the code, speed up the site, and suggest
improvements to the structure").

## 1. Health check (before → after)

| Check | Before | After |
|---|---|---|
| TypeScript | clean | clean |
| ESLint | 0 errors, 3 warnings | **0 problems** (plain `<img>` logos documented: next/image needs sharp at runtime on cPanel) |
| Unit tests | 140 | **142** (old saved services still validate; unknown icon rejected) |
| `verify.sh` | 97 | **99** |
| `npm audit --omit=dev` | 0 vulnerabilities | 0 vulnerabilities |
| TODO / FIXME / `console.log` / `any` in `src` | none | none |
| Server render time (local, warm) | 6–25 ms per page | same |

## 2. Lighthouse, homepage (local production build)

| | Performance | Accessibility | Best practices | LCP | CLS |
|---|---|---|---|---|---|
| Mobile, before | 90 | 96 | 100 | 3.5 s (simulated slow 4G) | 0 |
| Mobile, after | 91 | **100** | 100 | 3.5 s | 0 |
| Desktop, after | **98** | **100** | 100 | 0.9 s | 0.001 |

SEO shows 69 only because staging builds are `noindex` on purpose (`SITE_INDEXING`).

## 3. What was fixed and cleaned

- **Images:** developer logos re-encoded (and the four over-wide ones resized to 320 px):
  177 KB → 105 KB, all of it in the first screen. Header/footer logos resized from 557 px
  to 3× their display size (34 KB → 20 KB). Phone hero poster (the mobile LCP image) 85 → 65 KB.
  Logos now carry `width`/`height` (no layout shift); the footer and About logos load lazily.
- **Unused photos removed:** `developer-network-skyline*` and `footer-glass-facade` plus their
  13 WebP variants (~1.7 MB out of the repo and the deploy).
- **Dead CSS removed:** 64 rules for classes no component renders any more (old quote cards,
  leadership emblem card, services grid, section surfaces, card specs, marquee toggle…):
  CSS bundle 101 KB → 93 KB raw.
- **Dead code removed:** `src/server/images.ts` (never imported), `PauseIcon`/`PlayIcon`
  (Pause control removed in D-27), `DEVELOPERS` and `CORE_SERVICES` (replaced), the unused
  `glass` / `light` / `muted` variants of the developer strip (only one surface is used).
- **Accessibility:** the one contrast failure (new *Our Services* label) fixed.

## 4. Checked and left as is (on purpose)

- **Menu prefetch** (14 small requests per page view): makes navigation instant (D-43).
  Next 16 fetches the route tree and the data separately, hence two per page.
- **Plain `<img>` instead of `next/image`:** the target host has no guaranteed sharp at
  runtime; images are pre-optimised by `npm run images:optimize` instead.
- **JavaScript:** ~165–200 KB gzipped, of which ~170 KB is React + Next itself. Zod and the
  admin code are not sent to public pages.

## 5. Recommendations (not done; each needs a decision)

Ordered by value for effort.

1. **SVG icon sprite.** The homepage repeats ~190 inline SVGs (stars, WhatsApp, phone…):
   59 KB of the 245 KB HTML. One hidden `<svg><symbol>` sprite + `<use href>` would cut the
   HTML by roughly a fifth and speed up the first paint on phones. Half a day; low risk.
2. **Fewer reviews on first load.** The review wall renders every published review. Rendering
   the first 6–9 and the rest on *Show more* keeps the DOM small (now 1,500 elements, budget
   ~800) as real reviews grow. Needs the owner's OK (D-44 says "all reviews at once").
3. **Split `globals.css` by route.** All 28 style files ship on every page (93 KB raw, 19 KB
   gzipped, render-blocking). Admin and account styles could move to their own layouts;
   home-only sections could be CSS modules. Medium effort.
4. **Merge the override layers.** `15-responsive.css`, `16-brand-overrides.css` and
   `22-home-plain.css` re-style earlier files. Folding each rule back into its component file
   (and one file per component, like `27-property-card.css`) removes ordering surprises.
5. **Move inline `style={{…}}` to classes** in the header, footer and About page (logo sizes,
   emblem text). Easier to theme and to keep consistent.
6. **Static assets with hashed names.** `/images/opt/*` is cached for a week with
   revalidation. Adding a content hash to the generated file names would allow
   `immutable, max-age=1y` (Lighthouse "cache lifetimes").
7. **Brand kit out of `public/`.** 14 of the 23 files in `public/brand` are never referenced
   (wordmarks, stacked logos, the original artwork). Moving them to `docs/client-assets/`
   keeps them in the repo without publishing them.
8. **Browser test in CI.** The interaction checks run here with Puppeteer (carousel, search,
   accounts) could become a small Playwright suite in GitHub Actions next to `verify.sh`, so
   a regression is caught before a PR is merged.
9. **Error monitoring for production** (e.g. self-hosted logs or Sentry, needs approval:
   third-party infrastructure, AGENTS.md).
