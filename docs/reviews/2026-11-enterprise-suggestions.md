# Enterprise review and suggestions: November 2026

Owner request (2026-11-19): "a full review of the project, with suggestions inspired by the big
enterprise sites". Reviewed on a local production build of `feat/multi-page-platform` at `8a94220`
(after PR #26), on 9 public pages at 1440 px and 390 px. Reference sites: Property Finder, Bayut,
Knight Frank UAE, Savills Dubai, Dubai Sotheby's International Realty, Emaar.

Nothing in this file is built yet. Each item needs the owner's go-ahead, and some need content or
numbers from the client (marked **needs client**).

## What is already at enterprise level

- Homepage: video hero with search, developer strip, featured carousel, services, project panels,
  calculator, reviews wall. Lighthouse desktop 98, mobile 90–91, accessibility 100.
- Admin: RBAC, audit log, draft → preview → publish, revisions, outbox, server-side validation.
- Accounts with favourites; reviews moderated before they are published.

## P0: before launch (compliance and trust)

1. **Trakheesi permit + Madmoun QR on every listing.** Dubai requires the permit number and the
   DLD QR code on every property advert, including a broker's own website; fines start at
   AED 50,000. `Property.permitNumber` is already saved in the admin but **never shown** on the site.
   Suggested: show the permit number and the QR next to the price on the property page, add a QR
   image and a permit expiry date in the admin, and keep a listing hidden while its permit is
   missing or expired (Bayut and Property Finder already work this way). The same applies to
   projects (primary project permit).
2. **Company licence in the footer.** Show the ORN / RERA licence number (**needs client**).
3. **Privacy Policy and Terms pages.** The footer links currently open the contact form
   (`/contact?topic=privacy`). These are needed for accounts (D-40) and for any analytics
   (**needs client** text, already on the open list).
4. **Each property's own photo when shared.** Every listing currently shares the generic brand
   image (`og:image` = `/brand/og-image.jpg`), so a WhatsApp share shows the logo, not the villa.
   Use a ~1200×630 crop of the cover photo (light JPEG, under 300 KB for WhatsApp). Add
   `RealEstateListing` / `Offer` JSON-LD and breadcrumb JSON-LD to property and project pages.

## P1: more enquiries (what the portals do)

5. **Sticky contact bar on phones** on property and project pages: Call · WhatsApp · Email, always
   at the bottom of the screen. Today the enquiry form is the last block on a 5,400 px page. On
   desktop, put the same three buttons above the form in the sidebar (open question to the owner).
6. **Search pages (`/buy`, `/rent`, `/projects`):**
   - sort by newest / price low–high / high–low;
   - keep the filters in the URL, so a filtered search can be shared and the Back button keeps it;
   - plain labels: "Community", "Property type", "Price", not "Asset type" or "Price allocation";
   - later: map view (needs a map provider = third party, approval needed).
7. **Property page:**
   - price per sq ft;
   - developer, completion status and permit in the key-facts row;
   - "Similar properties" row (same community or type);
   - Share button;
   - optional fields for floor plan, video and 360 tour.
8. **Project page (off-plan):**
   - payment plan drawn as steps (e.g. 10% booking → 60% during construction → 30% handover);
   - unit-type table with starting prices;
   - brochure / floor plan download behind the short form (the usual off-plan lead capture on
     developer sites);
   - permit number, as in item 1.
9. **Valuation form in steps:** community → type → beds / size → contact. This gives better leads
   than one long form. No automatic "estimate" without real transaction data.

## P2: authority and search traffic (Knight Frank, Savills, Sotheby's)

10. **Insights / Journal:** quarterly market notes and news under the CEO's name. The big brokers
    lead with research. Already in the backlog ("blog/insights"); content **needs client**.
11. **Community guides:** one page per community the listings use (Palm Jumeirah, Dubai Hills…),
    with its listings and projects. This brings long-tail search traffic.
12. **Advisors page:** team with photo-free cards, languages, RERA BRN numbers; the advisor's name
    on each listing (like Bayut TruBroker). **Needs client**, and must respect "no people photos".
13. **Guides:** buying in Dubai, selling, off-plan, Golden Visa basics, FAQ (**needs client** or
    approved text; never invented).

## P3: consistency and housekeeping

14. **Inner pages still use the older design.** `/buy`, `/rent`, `/sell`, `/about`, property and
    project pages keep the dark-teal hero, numbered labels ("01 / 02 / 03", removed from the
    homepage in D-27) and jargon copy ("curated acquisition mandates", "Mandate notes",
    "Principals-level negotiation oversight from Form F structuring…"). Bringing them in line with
    the light homepage (D-27 onwards) and plain English is the biggest visible gain after P0.
15. **Sample photo with a watermark:** the Harbour Crescent cover has an "EMAAR" watermark burned
    in. It shows as a ghost logo under "Payment plan" on the homepage panel. Replace it.
16. **Lead management (Phase 3):** assign each request to an advisor, track status and response
    time, and count WhatsApp / call clicks per listing.
17. **Analytics:** a privacy-friendly, self-hosted option, or GA4 with a consent banner. Third
    party, so approval is needed.
18. **Later, only if the owner changes D-02:** Arabic, and a currency switch (AED / USD / EUR / GBP)
    plus sq ft / m² for overseas buyers (currency is already in the backlog).

## Suggested order

1. P0 items 1, 4 (no client input needed for 4; item 1 needs only the QR field).
2. Item 5 (sticky contact bar) and item 6 (sort and filters in the URL).
3. Item 14 (inner pages to the light design), one page per PR, like the homepage sections.
4. Items 7–8, then P2 once the client sends content.

## Sources

- Trakheesi / Madmoun on all adverts, AED 50,000 fines, the four DLD inspection points:
  stylabs.com/industries/real-estate; sanayarealestate.com (2026 guide); Gulf News, 24 Apr 2025.
- Bayut: TruCheck, TruEstimate, TruBroker, DLD transactions, area guides, map search, floor plans:
  bayut.com/mybayut; coraly.ai GPPI profile.
- Property Finder: mortgage tools and sliders (see D-51).
- Knight Frank UAE research hub; Savills Dubai news and research; Dubai Sotheby's community
  guides and The Journal.
