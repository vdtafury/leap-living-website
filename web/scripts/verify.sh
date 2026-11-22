#!/usr/bin/env bash
# LEAP LIVING Platform Verification (DB, forms, admin access, security headers, SEO, routes,
# and meeting modifications)
#   BASE=http://localhost:3000 ./scripts/verify.sh
# Admin checks here are the ones visible from outside (closed to anonymous visitors, sign-in
# page, noindex). Signed-in behaviour (sessions, CSRF, permissions, upload validation) is covered
# by the vitest suites, which run against a throwaway database.
set -u

BASE="${BASE:-http://localhost:3000}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

pass=0
fail=0

check() {
  local name="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "PASS  $name (HTTP $actual)"
    pass=$((pass + 1))
  else
    echo "FAIL  $name (expected HTTP $expected, got $actual)"
    fail=$((fail + 1))
  fi
}

check_contains() {
  local name="$1" pattern="$2" file="$3"
  if grep -q "$pattern" "$file"; then
    echo "PASS  $name"
    pass=$((pass + 1))
  else
    echo "FAIL  $name (missing '$pattern')"
    fail=$((fail + 1))
  fi
}

check_not_contains() {
  local name="$1" pattern="$2" file="$3"
  if ! grep -qi "$pattern" "$file"; then
    echo "PASS  $name"
    pass=$((pass + 1))
  else
    echo "FAIL  $name (unexpectedly found '$pattern')"
    fail=$((fail + 1))
  fi
}

# Fixtures: a small teal JPEG, embedded so no image tool is needed (CI runners have no
# ImageMagick). The upload check only needs a real image file.
echo '/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAgDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCgFUM//9k=' | base64 -d > "$TMP/test.jpg"

# 1. Health endpoint
code=$(curl -s -o "$TMP/health.json" -w '%{http_code}' "$BASE/api/health")
check "health endpoint" 200 "$code"
if grep -q '"db":"up"' "$TMP/health.json"; then
  echo "PASS  health reports db=up"
  pass=$((pass + 1))
else
  echo "FAIL  health does not report db=up"
  fail=$((fail + 1))
fi

# 2. Admin: everything needs a session (D-31); the old Basic-auth endpoints are gone
code=$(curl -s -o /dev/null -w '%{http_code}' -F "file=@$TMP/test.jpg;type=image/jpeg" "$BASE/api/upload")
check "upload refuses anonymous visitors" 401 "$code"
code=$(curl -s -o /dev/null -w '%{http_code}' -u "leapadmin:anything-at-all" \
  -F "file=@$TMP/test.jpg;type=image/jpeg" "$BASE/api/upload")
check "upload ignores Basic auth" 401 "$code"
code=$(curl -s -o /dev/null -w '%{http_code}' -H 'Cookie: ll_session=forged; __Host-ll_session=forged' \
  -F "file=@$TMP/test.jpg;type=image/jpeg" "$BASE/api/upload")
check "upload refuses a forged session cookie" 401 "$code"
code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/inquiries")
check "inquiry export refuses anonymous visitors" 401 "$code"
code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/inquiries?format=csv")
check "inquiry CSV refuses anonymous visitors" 401 "$code"
code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/sharp")
check "old /api/sharp endpoint is gone" 404 "$code"
for page in /admin /admin/properties /admin/content/home /admin/users /admin/preview/home; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$page")
  location=$(curl -s -o /dev/null -w '%{redirect_url}' "$BASE$page")
  if [ "$code" = 307 ] && [[ "$location" == *"/account/sign-in"* ]]; then
    echo "PASS  $page sends anonymous visitors to the shared sign-in page"
    pass=$((pass + 1))
  else
    echo "FAIL  $page answered HTTP $code -> '$location' (expected 307 to /account/sign-in)"
    fail=$((fail + 1))
  fi
done
# D-41: one sign-in page for visitors and the team; the old admin address redirects to it
code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/admin/login")
location=$(curl -s -o /dev/null -w '%{redirect_url}' "$BASE/admin/login")
echo "$location" > "$TMP/admin-login-location.txt"
check "D-41: /admin/login redirects" 307 "$code"
check_contains "D-41: /admin/login goes to the shared sign-in page" "/account/sign-in" "$TMP/admin-login-location.txt"
code=$(curl -s -D "$TMP/login-headers.txt" -o "$TMP/login.html" -w '%{http_code}' "$BASE/account/sign-in")
check "GET /account/sign-in" 200 "$code"
check_contains "sign-in page has a password field" 'type="password"' "$TMP/login.html"
check_contains "D-41: sign-in takes an email or a username" 'Email or username' "$TMP/login.html"
check_contains "sign-in page is noindex" 'noindex' "$TMP/login.html"
check_not_contains "sign-in page is not cached" "cache-control: public" "$TMP/login-headers.txt"

# D-40: website accounts (signed-in flows are covered by vitest and the browser run)
for page in /account /account/settings; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$page")
  location=$(curl -s -o /dev/null -w '%{redirect_url}' "$BASE$page")
  if [[ "$code" =~ ^30[37]$ ]] && [[ "$location" == *"/account/sign-in"* ]]; then
    echo "PASS  D-40: $page sends guests to the account sign-in page"
    pass=$((pass + 1))
  else
    echo "FAIL  D-40: $page answered HTTP $code -> '$location' (expected a redirect to /account/sign-in)"
    fail=$((fail + 1))
  fi
done
code=$(curl -s -o "$TMP/acc-signup.html" -w '%{http_code}' "$BASE/account/sign-up")
check "D-40: GET /account/sign-up" 200 "$code"
check_contains "D-40: sign-up asks for a new password" '="new-password"' "$TMP/acc-signup.html"

code=$(curl -s --path-as-is -o /dev/null -w '%{http_code}' "$BASE/media/..%2F..%2Fpackage.json")
if [ "$code" = "404" ] || [ "$code" = "400" ]; then
  echo "PASS  reject path traversal (HTTP $code)"
  pass=$((pass + 1))
else
  echo "FAIL  reject path traversal (expected HTTP 404 or 400, got $code)"
  fail=$((fail + 1))
fi

# 6. Multi-Page Platform Routes & Content Checks
code=$(curl -s -o "$TMP/home.html" -w '%{http_code}' "$BASE/")
check "GET / (Home)" 200 "$code"
# Home reads published content from the database; no hidden debug marker (DB health is /api/health above).
check_not_contains "Home has no hidden DB debug marker" "Platform Ready" "$TMP/home.html"
check_contains "Mod #1: Consultancy service on Home" "Real Estate Consultancy" "$TMP/home.html"
check_not_contains "Mod #2 & #3: Founder & removed (escaped)" "Founder &amp; CEO" "$TMP/home.html"
check_not_contains "Mod #2 & #3: Founder & removed (plain)" "Founder & CEO" "$TMP/home.html"
check_contains "Mod #4: Editorial Hero headline" "Unlock your" "$TMP/home.html"
check_contains "Mod #5: Free Valuation button in Header" "Free Valuation" "$TMP/home.html"
check_contains "D-23: property card CTA is Know More" "Know More" "$TMP/home.html"
check_contains "D-46: property cards have WhatsApp / Call / Email" "ll-pc-contact-btn--wa" "$TMP/home.html"
check_contains "D-46: WhatsApp message names the listing" "wa.me/971521459888?text=Hello%20Leap%20Living" "$TMP/home.html"
check_contains "D-46: carousel runs to the screen edge (next card peeks in)" "ll-carousel--bleed" "$TMP/home.html"
check_contains "D-47: carousel has the edge \"N more\" tab (no round header buttons)" "ll-carousel-edge--next" "$TMP/home.html"
check_not_contains "D-50: no segment bar or counter under the carousel" "ll-carousel-seg" "$TMP/home.html"
check_contains "D-47: carousel ends on a View all card" "ll-carousel-endcard" "$TMP/home.html"
check_not_contains "D-47: old round carousel buttons are gone" "ll-carousel-btn" "$TMP/home.html"
check_contains "D-44: all reviews at once on a review wall, not a carousel" "ll-rw-grid" "$TMP/home.html"
check_contains "D-44: visitors can write a review" "href=\"/account/review\"" "$TMP/home.html"
check_contains "D-45: projects as expanding panels" "ll-xp-panel" "$TMP/home.html"
check_contains "D-48: services as heading block + cards" "ll-svc-card" "$TMP/home.html"
check_contains "D-48: every service is in the server HTML" "Portfolio Advisory" "$TMP/home.html"
check_not_contains "D-23: no Commercial tab in hero search" ">Commercial</button>" "$TMP/home.html"
check_not_contains "D-22: no Executive Leadership section on Home" "ll-leadership-panel" "$TMP/home.html"
check_contains "Mod #6: Mortgage Calculator link on Home" "Mortgage Calculator" "$TMP/home.html"

for route in /buy /rent /sell /projects /about /contact \
  /properties/palm-jumeirah-waterfront-sky-villa \
  /properties/downtown-boulevard-sky-penthouse \
  /projects/the-peninsula-harbour-residences; do
  code=$(curl -s -o "$TMP/page.html" -w '%{http_code}' "$BASE$route")
  check "GET $route" 200 "$code"
done

# Mod #3: the CEO block lives on /about (homepage leadership section removed per owner, 2026-11-14)
code=$(curl -s -o "$TMP/about.html" -w '%{http_code}' "$BASE/about")
check "GET /about content" 200 "$code"
check_contains "Mod #3: Mohab Samak CEO title on About" "Mohab Samak" "$TMP/about.html"
check_not_contains "Mod #3: no Founder title on About" "Founder" "$TMP/about.html"

# D-30: the calculator lives on the homepage; /mortgage redirects to it
check_contains "D-30: homepage calculator anchor" 'id="mortgage-calculator"' "$TMP/home.html"
check_contains "D-30/D-51: homepage calculator inputs" "Loan period" "$TMP/home.html"
check_contains "D-30/D-52: footer link targets the homepage calculator" 'href="/#mortgage-calculator"' "$TMP/home.html"
code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/mortgage")
check "D-30: /mortgage redirects permanently" 308 "$code"
location=$(curl -s -o /dev/null -w '%{redirect_url}' "$BASE/mortgage")
echo "$location" > "$TMP/mortgage-location.txt"
check_contains "D-30: /mortgage redirect target" "/#mortgage-calculator" "$TMP/mortgage-location.txt"

# D-52: client's homepage changes (2026-11-19)
check_contains "D-52: header button List Your Property" "List Your Property" "$TMP/home.html"
check_not_contains "D-52: no Mortgage Calculator header button" "ll-btn-mortgage" "$TMP/home.html"
check_not_contains "D-52: no Off-plan link in the hero search" "Off-plan developments" "$TMP/home.html"
check_not_contains "D-52: no key-figures band" "ll-stats-section" "$TMP/home.html"
check_contains "D-52: Consultancy service card" "Independent, strategic real estate guidance." "$TMP/home.html"
check_contains "D-52: teal logo (brand guidelines)" "/brand/logo-horizontal-teal.png" "$TMP/home.html"
check_not_contains "D-52: no dark logo" "logo-horizontal-brand.png" "$TMP/home.html"

# 7. Favicon Configuration & Asset Checks
check_not_contains "Head has no broken logo-mark.svg reference" "logo-mark.svg" "$TMP/home.html"
check_contains "Head declares favicon.ico" "/favicon.ico?v=2" "$TMP/home.html"
check_contains "Head declares 32x32 PNG favicon" "/brand/favicon-32x32.png?v=2" "$TMP/home.html"
for icon_path in /favicon.ico /brand/favicon-32x32.png /brand/favicon-192x192.png /brand/apple-touch-icon.png; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$icon_path")
  check "GET $icon_path" 200 "$code"
done

# 8. Hero Video & Statistics Checks
check_not_contains "D-52: stats band removed (no 100% Fiduciary)" "100% Fiduciary" "$TMP/home.html"
# The hero plays only the client's original file (git-ignored, placed by prepare-hero-original.sh);
# the old lighter renditions are gone.
for rendition in 1280 854; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/videos/hero/client-hero-$rendition.mp4")
  check "no re-encoded rendition client-hero-$rendition.mp4" 404 "$code"
done
# Persistent poster image (frame 0 of the original, WebP variants)
for img in /images/client-video-frame-0.jpg /images/opt/client-video-frame-0-1280.webp /images/opt/client-video-frame-0-portrait-540.webp; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$img")
  check "GET $img" 200 "$code"
done

# 9. Navigation & company details (from leapliving.ae)
check_not_contains "Navbar has no Insights link" ">Insights<" "$TMP/home.html"
check_contains "Footer shows the Media One Tower office" "Media One Tower" "$TMP/home.html"
check_contains "Footer links the real Instagram account" "instagram.com/leapliving.ae" "$TMP/home.html"

# 10. Forms are saved
code=$(curl -s -o "$TMP/inq.json" -w '%{http_code}' -H 'Content-Type: application/json' \
  -d '{"type":"CONSULTATION","name":"Verify Script","phone":"+971 50 000 0000","email":"verify@example.com","interest":"verify.sh check","notes":"automated test, ignore"}' \
  "$BASE/api/inquiries")
check "inquiry form submission is saved" 201 "$code"
code=$(curl -s -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' \
  -d '{"type":"CONSULTATION","name":"","phone":"x","email":"bad","interest":""}' "$BASE/api/inquiries")
check "invalid inquiry is rejected" 400 "$code"
code=$(curl -s -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' -H 'Origin: https://evil.example' \
  -d '{}' "$BASE/api/inquiries")
check "cross-site inquiry post is refused" 403 "$code"
check_not_contains "health hides internal error details" '"error"' "$TMP/health.json"

# 11. Security headers
curl -s -D "$TMP/headers.txt" -o /dev/null "$BASE/"
check_contains "X-Content-Type-Options: nosniff" "x-content-type-options: nosniff" <(tr 'A-Z' 'a-z' < "$TMP/headers.txt")
check_contains "Referrer-Policy set" "referrer-policy:" <(tr 'A-Z' 'a-z' < "$TMP/headers.txt")
check_contains "Strict-Transport-Security set" "strict-transport-security:" <(tr 'A-Z' 'a-z' < "$TMP/headers.txt")
check_contains "Content-Security-Policy set" "content-security-policy: default-src 'self'" <(tr 'A-Z' 'a-z' < "$TMP/headers.txt")
check_not_contains "No X-Powered-By header" "x-powered-by" "$TMP/headers.txt"

# 12. SEO: 404 page, robots, sitemap, link previews
code=$(curl -s -o "$TMP/404.html" -w '%{http_code}' "$BASE/this-page-does-not-exist")
check "unknown URL returns 404" 404 "$code"
check_contains "404 page is the branded one" "This address is not on our map" "$TMP/404.html"
code=$(curl -s -o "$TMP/robots.txt" -w '%{http_code}' "$BASE/robots.txt")
check "GET /robots.txt" 200 "$code"
check_contains "robots.txt keeps crawlers out of the admin" "Disallow: /" "$TMP/robots.txt"
code=$(curl -s -o "$TMP/sitemap.xml" -w '%{http_code}' "$BASE/sitemap.xml")
check "GET /sitemap.xml" 200 "$code"
check_contains "sitemap lists property pages" "/properties/palm-jumeirah-waterfront-sky-villa" "$TMP/sitemap.xml"
check_contains "Home has an Open Graph image" 'property="og:image"' "$TMP/home.html"
check_contains "Home has company structured data" '"@type":"RealEstateAgent"' "$TMP/home.html"
code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/brand/og-image.jpg")
check "GET /brand/og-image.jpg" 200 "$code"

echo
echo "RESULT: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
