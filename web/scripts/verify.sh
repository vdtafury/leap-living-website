#!/usr/bin/env bash
# LEAP LIVING Platform Verification (DB, forms, admin endpoints, security headers, SEO, routes,
# and meeting modifications)
#   BASE=http://localhost:3000 ./scripts/verify.sh
# The upload / sharp / inquiry-export checks need the admin login the server runs with:
#   ADMIN_USER=... ADMIN_PASSWORD=... BASE=... ./scripts/verify.sh
# Without them those checks only confirm the endpoints are closed.
set -u

BASE="${BASE:-http://localhost:3000}"
ADMIN_USER="${ADMIN_USER:-}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"
AUTH=()
[ -n "$ADMIN_USER" ] && AUTH=(-u "$ADMIN_USER:$ADMIN_PASSWORD")
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

# Fixtures
convert -size 800x600 xc:'#3B9EA1' "$TMP/test.jpg"
convert -size 400x300 xc:'#123C42' "$TMP/test.png"
printf 'hello not an image' > "$TMP/notimage.jpg"
dd if=/dev/zero of="$TMP/oversize.jpg" bs=1M count=6 status=none

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

# 2. Admin-only endpoints are closed to the public
for ep in /api/upload /api/sharp; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -F "file=@$TMP/test.jpg;type=image/jpeg" "$BASE$ep")
  if [ "$code" = 401 ] || [ "$code" = 404 ]; then
    echo "PASS  $ep refuses anonymous uploads (HTTP $code)"
    pass=$((pass + 1))
  else
    echo "FAIL  $ep accepted an anonymous upload (HTTP $code)"
    fail=$((fail + 1))
  fi
done
code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/inquiries")
if [ "$code" = 401 ] || [ "$code" = 404 ]; then
  echo "PASS  inquiry export is not public (HTTP $code)"
  pass=$((pass + 1))
else
  echo "FAIL  inquiry export is public (HTTP $code)"
  fail=$((fail + 1))
fi

if [ ${#AUTH[@]} -gt 0 ]; then
  # 3. Upload a valid JPEG
  code=$(curl -s "${AUTH[@]}" -o "$TMP/upload.json" -w '%{http_code}' \
    -F "file=@$TMP/test.jpg;type=image/jpeg" "$BASE/api/upload")
  check "upload jpeg (admin)" 201 "$code"
  FNAME=$(node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.asset.filename)" < "$TMP/upload.json")
  if [ -n "$FNAME" ]; then
    echo "PASS  upload returned filename $FNAME"
    pass=$((pass + 1))
  else
    echo "FAIL  upload did not return a filename"
    fail=$((fail + 1))
  fi

  # Media read-back
  code=$(curl -s -o "$TMP/readback.jpg" -w '%{http_code}' "$BASE/media/$FNAME")
  check "media read-back" 200 "$code"
  if [ "$(head -c 3 "$TMP/readback.jpg" | od -An -tx1 | tr -d ' \n')" = "ffd8ff" ]; then
    echo "PASS  media read-back is a JPEG"
    pass=$((pass + 1))
  else
    echo "FAIL  media read-back is not a JPEG"
    fail=$((fail + 1))
  fi

  # 4. Sharp resize
  code=$(curl -s "${AUTH[@]}" -o "$TMP/resized.jpg" -w '%{http_code}' \
    -F "file=@$TMP/test.jpg;type=image/jpeg" "$BASE/api/sharp")
  check "sharp resize (admin)" 200 "$code"
  WIDTH=$(identify -format '%w' "$TMP/resized.jpg" 2>/dev/null)
  if [ "$WIDTH" = "320" ]; then
    echo "PASS  sharp produced a 320px-wide JPEG"
    pass=$((pass + 1))
  else
    echo "FAIL  sharp output width was '$WIDTH', expected 320"
    fail=$((fail + 1))
  fi

  # 5. Rejection cases
  code=$(curl -s "${AUTH[@]}" -o /dev/null -w '%{http_code}' -F "file=@$TMP/test.png;type=image/jpeg" "$BASE/api/upload")
  check "reject PNG bytes declared as JPEG" 415 "$code"

  code=$(curl -s "${AUTH[@]}" -o /dev/null -w '%{http_code}' -F "file=@$TMP/notimage.jpg;type=image/jpeg" "$BASE/api/upload")
  check "reject non-image content" 415 "$code"

  code=$(curl -s "${AUTH[@]}" -o /dev/null -w '%{http_code}' -F "file=@$TMP/oversize.jpg;type=image/jpeg" "$BASE/api/upload")
  check "reject oversize file" 413 "$code"

  code=$(curl -s "${AUTH[@]}" -o "$TMP/inquiries.csv" -w '%{http_code}' "$BASE/api/inquiries?format=csv")
  check "inquiry CSV export (admin)" 200 "$code"
else
  echo "SKIP  upload / sharp / export checks (set ADMIN_USER and ADMIN_PASSWORD to run them)"
fi

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
# Home is static: no database read and no hidden debug marker (DB health is /api/health above).
check_not_contains "Home has no hidden DB debug marker" "Platform Ready" "$TMP/home.html"
check_contains "Mod #1: Consultancy service on Home" "Real Estate Consultancy" "$TMP/home.html"
check_not_contains "Mod #2 & #3: Founder & removed (escaped)" "Founder &amp; CEO" "$TMP/home.html"
check_not_contains "Mod #2 & #3: Founder & removed (plain)" "Founder & CEO" "$TMP/home.html"
check_contains "Mod #4: Editorial Hero headline" "Unlock your" "$TMP/home.html"
check_contains "Mod #5: Free Valuation button in Header" "Free Valuation" "$TMP/home.html"
check_contains "D-23: property card CTA is Know More" "Know More" "$TMP/home.html"
check_not_contains "D-23: no Commercial tab in hero search" ">Commercial</button>" "$TMP/home.html"
check_not_contains "D-22: no Executive Leadership section on Home" "ll-leadership-panel" "$TMP/home.html"
check_contains "Mod #6: Mortgage Calculator link on Home" "Mortgage Calculator" "$TMP/home.html"

for route in /buy /rent /sell /projects /mortgage /about /contact \
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

code=$(curl -s -o "$TMP/mortgage.html" -w '%{http_code}' "$BASE/mortgage")
check "GET /mortgage content" 200 "$code"
check_contains "Mortgage page contains calculator" "UAE Mortgage Calculator" "$TMP/mortgage.html"

# 7. Favicon Configuration & Asset Checks
check_not_contains "Head has no broken logo-mark.svg reference" "logo-mark.svg" "$TMP/home.html"
check_contains "Head declares favicon.ico" "/favicon.ico?v=2" "$TMP/home.html"
check_contains "Head declares 32x32 PNG favicon" "/brand/favicon-32x32.png?v=2" "$TMP/home.html"
for icon_path in /favicon.ico /brand/favicon-32x32.png /brand/favicon-192x192.png /brand/apple-touch-icon.png; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$icon_path")
  check "GET $icon_path" 200 "$code"
done

# 8. Hero Video & Statistics Checks
check_contains "Stats bar displays 100% Fiduciary" "100% Fiduciary" "$TMP/home.html"
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
