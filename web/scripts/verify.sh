#!/usr/bin/env bash
# LEAP LIVING Platform Verification (DB, Uploads, Sharp, Multi-Page Routes, and Meeting Modifications)
#   BASE=http://localhost:3000 ./scripts/verify.sh
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

# 2. Upload a valid JPEG
code=$(curl -s -o "$TMP/upload.json" -w '%{http_code}' \
  -F "file=@$TMP/test.jpg;type=image/jpeg" "$BASE/api/upload")
check "upload jpeg" 201 "$code"
FNAME=$(node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.asset.filename)" < "$TMP/upload.json")
if [ -n "$FNAME" ]; then
  echo "PASS  upload returned filename $FNAME"
  pass=$((pass + 1))
else
  echo "FAIL  upload did not return a filename"
  fail=$((fail + 1))
fi

# 3. Media read-back
code=$(curl -s -o "$TMP/readback.jpg" -w '%{http_code}' "$BASE/media/$FNAME")
check "media read-back" 200 "$code"
if file "$TMP/readback.jpg" | grep -q 'JPEG image data'; then
  echo "PASS  media read-back is a JPEG"
  pass=$((pass + 1))
else
  echo "FAIL  media read-back is not a JPEG"
  fail=$((fail + 1))
fi

# 4. Sharp resize
code=$(curl -s -o "$TMP/resized.jpg" -w '%{http_code}' \
  -F "file=@$TMP/test.jpg;type=image/jpeg" "$BASE/api/sharp")
check "sharp resize" 200 "$code"
WIDTH=$(identify -format '%w' "$TMP/resized.jpg" 2>/dev/null)
if [ "$WIDTH" = "320" ]; then
  echo "PASS  sharp produced a 320px-wide JPEG"
  pass=$((pass + 1))
else
  echo "FAIL  sharp output width was '$WIDTH', expected 320"
  fail=$((fail + 1))
fi

# 5. Rejection cases
code=$(curl -s -o /dev/null -w '%{http_code}' -F "file=@$TMP/test.png;type=image/jpeg" "$BASE/api/upload")
check "reject PNG bytes declared as JPEG" 415 "$code"

code=$(curl -s -o /dev/null -w '%{http_code}' -F "file=@$TMP/notimage.jpg;type=image/jpeg" "$BASE/api/upload")
check "reject non-image content" 415 "$code"

code=$(curl -s -o /dev/null -w '%{http_code}' -F "file=@$TMP/oversize.jpg;type=image/jpeg" "$BASE/api/upload")
check "reject oversize file" 413 "$code"

code=$(curl -s --path-as-is -o /dev/null -w '%{http_code}' "$BASE/media/..%2F..%2Fpackage.json")
check "reject path traversal" 404 "$code"

# 6. Multi-Page Platform Routes & Content Checks
code=$(curl -s -o "$TMP/home.html" -w '%{http_code}' "$BASE/")
check "GET / (Home)" 200 "$code"
check_contains "Home renders DB readiness marker" "LEAP LIVING — Platform Ready" "$TMP/home.html"
check_contains "Mod #1: Consultancy service on Home" "Real Estate Consultancy" "$TMP/home.html"
check_not_contains "Mod #2 & #3: Founder & removed (escaped)" "Founder &amp; CEO" "$TMP/home.html"
check_not_contains "Mod #2 & #3: Founder & removed (plain)" "Founder & CEO" "$TMP/home.html"
check_contains "Mod #3: Mohab Samak CEO title" "Mohab Samak" "$TMP/home.html"
check_contains "Mod #4: Editorial Hero headline" "Unlock your" "$TMP/home.html"
check_contains "Mod #5: Free Valuation button in Header" "Free Valuation" "$TMP/home.html"
check_contains "Mod #6: Mortgage Calculator link on Home" "Mortgage Calculator" "$TMP/home.html"

for route in /buy /rent /sell /projects /mortgage /about /contact \
  /properties/palm-jumeirah-waterfront-sky-villa \
  /properties/downtown-boulevard-sky-penthouse \
  /projects/the-peninsula-harbour-residences; do
  code=$(curl -s -o "$TMP/page.html" -w '%{http_code}' "$BASE$route")
  check "GET $route" 200 "$code"
done

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
for vid in dubai-palace-burj-waterfront.mp4 broker-key-handover.mp4 dubai-palm-jumeirah.mp4 executive-skyscraper-meeting.mp4 dubai-marina-skyline.mp4 dubai-downtown-aerial.mp4; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/videos/$vid")
  check "GET /videos/$vid" 200 "$code"
done

echo
echo "RESULT: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
