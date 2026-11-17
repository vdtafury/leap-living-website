#!/usr/bin/env bash
# Packages the site for cPanel "Setup Node.js App" (CloudLinux Node.js Selector + Passenger).
#
#   bash scripts/deployment/package-cpanel.sh
#
# Run on Linux x86_64 with Node 22 (the host app must also use Node 22.x: native
# modules are tied to Node's ABI). Writes to web/deploy-out/:
#
#   leapliving-app-<stamp>.zip   extract in /home/<user>/  ->  leapliving-app/app/...
#                                cPanel: Application root = leapliving-app
#                                        Startup file     = app/server.js
#   leapliving-data-initial.zip  FIRST deploy only       ->  leapliving-data/leapliving.db
#                                never re-upload it over a live database
#
# Why the app lives in leapliving-app/app/: CloudLinux reserves "node_modules" in the
# application root for its own virtualenv symlink, while the Next.js standalone bundle
# ships its own node_modules. Keeping the bundle one level down avoids the clash.
#
# better-sqlite3 is rebuilt so it only needs glibc 2.28 / GLIBCXX 3.4.20 (CloudLinux 8+),
# instead of the build machine's glibc. Set SKIP_GLIBC_COMPAT=1 to keep the local build.
#
# Build-time settings (baked into the zip, so build one zip per environment):
#   SITE_URL=https://staging.leapliving.ae   public origin (default https://leapliving.ae)
#   SITE_INDEXING=true                       ONLY for the live production site; without it
#                                            search engines are kept out (robots + noindex)
# The hero video (public/videos/hero/client-hero-original.mp4, git-ignored) must be placed with
# scripts/prepare-hero-original.sh first; ALLOW_NO_HERO_VIDEO=1 builds without it (poster only).
set -euo pipefail

cd "$(dirname "$0")/../.."
WEB=$PWD
HERE=$WEB/scripts/deployment
OUT=$WEB/deploy-out
STAMP=$(date -u +%Y%m%d-%H%M)
PKG=$OUT/leapliving-app
APP=$PKG/app
MAX_GLIBC=2.28

log() { printf '\n== %s\n' "$*"; }

[ "$(uname -sm)" = "Linux x86_64" ] || { echo "Run on Linux x86_64 (the host's platform)."; exit 1; }
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" = 22 ] || { echo "Use Node 22 (found $(node -v)); the host app runs Node 22.x."; exit 1; }
[ -d node_modules ] || { echo "Run npm ci first."; exit 1; }
[ "${ALLOW_FRAMING:-}" != 1 ] || { echo "ALLOW_FRAMING=1 is for preview builds only, never for a deploy."; exit 1; }

HERO=public/videos/hero/client-hero-original.mp4
if [ ! -f "$HERO" ] && [ "${ALLOW_NO_HERO_VIDEO:-0}" != 1 ]; then
  echo "Hero video missing: $HERO"
  echo "Run: bash scripts/prepare-hero-original.sh \"/path/to/the client's video.mp4\""
  echo "(or ALLOW_NO_HERO_VIDEO=1 to build a zip whose hero shows the still poster only)."
  exit 1
fi

# A fresh clone has no .env; the build and Prisma only need a placeholder URL here
# (the host gets its real DATABASE_URL from the cPanel Node.js app screen).
export DATABASE_URL=${DATABASE_URL:-file:./storage/dev.db}
if [ ! -d generated ]; then
  log "Generating Prisma client"
  npx prisma generate
fi

rm -rf "$OUT" # also keeps the type-check from seeing an old bundle

log "Building (Next.js standalone) for ${SITE_URL:-https://leapliving.ae}, indexing: ${SITE_INDEXING:-off}"
NEXT_STANDALONE=1 npm run build

log "Assembling $APP"
mkdir -p "$APP" "$OUT/leapliving-data"
cp -a .next/standalone/. "$APP/"
rm -f "$APP/.env" # env vars are set in the cPanel Node.js app screen, never shipped
# Next aliases a few packages through symlinks; replace them with real copies so the
# archive extracts identically in cPanel's File Manager.
if [ -d "$APP/.next/node_modules" ]; then
  find "$APP/.next/node_modules" -type l | while read -r link; do
    target=$(readlink -f "$link")
    rm "$link"
    cp -a "$target" "$link"
  done
fi
cp -a .next/static "$APP/.next/static"
mkdir -p "$APP/public"
# Master videos in public/videos/*.mp4 are unused at runtime (the hero plays videos/hero/*).
# --no-wildcards-match-slash keeps "*" from also matching videos/hero/*.mp4.
tar -C public --no-wildcards-match-slash --exclude='./videos/*.mp4' -cf - . | tar -C "$APP/public" -xf -
# The client's hero video is git-ignored (over GitHub's 100 MB limit): it ships only if it was
# placed here with scripts/prepare-hero-original.sh. It must be faststart (index before the
# media data), or browsers download the whole file before the first frame plays.
if [ -f "$HERO" ]; then
  cmp -s "$HERO" "$APP/$HERO" || { echo "Hero video missing from the bundle"; exit 1; }
  node -e "
    const fs = require('fs'); const fd = fs.openSync(process.argv[1], 'r'); const b = Buffer.alloc(16)
    let pos = 0; const size = fs.fstatSync(fd).size
    while (pos < size) {
      fs.readSync(fd, b, 0, 16, pos)
      let len = b.readUInt32BE(0); const type = b.toString('latin1', 4, 8)
      if (len === 1) len = Number(b.readBigUInt64BE(8))
      if (type === 'moov') process.exit(0)
      if (type === 'mdat' || len < 8) process.exit(1)
      pos += len
    }
    process.exit(1)
  " "$HERO" || { echo "$HERO is not faststart: run scripts/prepare-hero-original.sh on it"; exit 1; }
  log "Hero video included ($(du -h "$HERO" | cut -f1))"
else
  log "No hero video (ALLOW_NO_HERO_VIDEO=1): the hero shows the still poster"
fi

ADDON=$APP/node_modules/better-sqlite3/build/Release/better_sqlite3.node
if [ "${SKIP_GLIBC_COMPAT:-0}" != 1 ]; then
  log "Rebuilding better-sqlite3 for glibc <= $MAX_GLIBC"
  TMP=$(mktemp -d)
  trap 'rm -rf "$TMP"' EXIT
  cp -a node_modules/better-sqlite3 "$TMP/"
  gcc -O2 -fPIC -c "$HERE/glibc-compat/stat_shim.c" -o "$TMP/stat_shim.o"
  g++ -O2 -fPIC -c "$HERE/glibc-compat/cxx_shim.cc" -o "$TMP/cxx_shim.o"
  NODE_GYP=$(dirname "$(dirname "$(readlink -f "$(command -v npm)")")")/node_modules/node-gyp/bin/node-gyp.js
  NODEDIR=$(dirname "$(dirname "$(readlink -f "$(command -v node)")")")
  (
    cd "$TMP/better-sqlite3"
    rm -rf build
    CFLAGS="-include $HERE/glibc-compat/glibc_compat.h" \
      CXXFLAGS="-include $HERE/glibc-compat/glibc_compat.h" \
      LDFLAGS="$TMP/stat_shim.o $TMP/cxx_shim.o" \
      node "$NODE_GYP" rebuild --release --nodedir="$NODEDIR" >"$TMP/gyp.log" 2>&1 ||
      { tail -30 "$TMP/gyp.log"; exit 1; }
  )
  cp "$TMP/better-sqlite3/build/Release/better_sqlite3.node" "$ADDON"
fi

log "Checking native modules"
need=$(objdump -T "$ADDON" | grep -oE 'GLIBC_[0-9.]+' | sed 's/GLIBC_//' | sort -uV | tail -1)
echo "better-sqlite3 needs glibc $need"
if [ "${SKIP_GLIBC_COMPAT:-0}" != 1 ] &&
  [ "$(printf '%s\n%s\n' "$need" "$MAX_GLIBC" | sort -V | tail -1)" != "$MAX_GLIBC" ]; then
  echo "better-sqlite3 still needs glibc $need (> $MAX_GLIBC)"
  exit 1
fi
(cd "$APP" && node -e "const D=require('better-sqlite3');new D(':memory:').prepare('select 1').get();require('sharp');console.log('native modules load OK')")

log "Creating initial database"
# The app creates its own tables on first use (src/server/schema.ts, all IF NOT EXISTS); the
# smoke test below is that first use, so the zipped database already has every table.
rm -f "$OUT/leapliving-data/leapliving.db"
mkdir -p "$OUT/leapliving-data/storage"

log "Smoke test"
PORT=$((20000 + RANDOM % 20000))
(cd "$PKG" && NODE_ENV=production PORT=$PORT HOSTNAME=127.0.0.1 \
  DATABASE_URL="file:$OUT/leapliving-data/leapliving.db" STORAGE_DIR="$OUT/leapliving-data/storage" \
  exec node app/server.js >"$OUT/smoke.log" 2>&1) &
SERVER=$! # exec: $! is node itself, so the kill below really stops it
ok=0
for _ in $(seq 1 30); do
  sleep 1
  if curl -fsS "http://127.0.0.1:$PORT/api/health" | grep -q '"db":"up"'; then ok=1; break; fi
done
home=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/" || true)
if [ -f "$HERO" ]; then
  video=$(curl -s -o /dev/null -r 0-1023 -w '%{http_code}' "http://127.0.0.1:$PORT/${HERO#public/}" || true)
else
  video=206 # nothing to fetch
fi
kill "$SERVER" 2>/dev/null || true
wait "$SERVER" 2>/dev/null || true
[ "$ok" = 1 ] && [ "$home" = 200 ] && [ "$video" = 206 ] ||
  { echo "Smoke test failed (health=$ok, home=$home, video=$video)"; cat "$OUT/smoke.log"; exit 1; }
node -e "
const D = require('better-sqlite3')
const db = new D(process.argv[1], { readonly: true })
const names = db.prepare(\"SELECT name FROM sqlite_master WHERE type = 'table'\").all().map((t) => t.name)
for (const t of ['MediaAsset', 'Inquiry']) if (!names.includes(t)) { console.error('missing table ' + t); process.exit(1) }
" "$OUT/leapliving-data/leapliving.db" || { echo "Initial database is missing tables"; exit 1; }
echo "health OK, home 200, hero video OK, database tables OK"
rm -rf "$OUT/leapliving-data/storage"/* "$OUT/smoke.log"

log "Zipping"
(cd "$OUT" && zip -qr "leapliving-app-$STAMP.zip" leapliving-app && zip -qr leapliving-data-initial.zip leapliving-data)
ls -lh "$OUT"/*.zip
