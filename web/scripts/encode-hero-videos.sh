#!/usr/bin/env bash
# Re-encodes the official client hero video into three web renditions:
#   /videos/hero/client-hero-1080.mp4 (Full HD 1080p 60fps Master, ~85MB, <100MB for GitHub)
#   /videos/hero/client-hero-1280.mp4 (desktop / large screens, ~19MB)
#   /videos/hero/client-hero-854.mp4  (mobile / phones, ~7.2MB)
set -euo pipefail

cd "$(dirname "$0")/.."
SRC="Website Video 1.mp4"
HERO="public/videos/hero"
FFMPEG="${FFMPEG:-/home/vdta/.hermes/tools/ffmpeg-9.0.1-linux-x64/bin/ffmpeg}"
command -v "$FFMPEG" >/dev/null || FFMPEG="ffmpeg"

[ -f "$SRC" ] || { echo "Place the master video at web/$SRC first."; exit 1; }
mkdir -p "$HERO"

echo "Encoding 1080p 60fps master (<100MB for GitHub)..."
"$FFMPEG" -y -i "$SRC" \
  -c:v libx264 -preset superfast -threads 6 -b:v 9500k -maxrate 10500k -bufsize 19000k -pix_fmt yuv420p -r 60 \
  -c:a aac -b:a 128k \
  -movflags +faststart "$HERO/client-hero-1080.mp4"

echo "Encoding desktop rendition (1280)..."
"$FFMPEG" -y -i "$SRC" \
  -vf "scale=1280:-2" -c:v libx264 -preset faster -profile:v high -level 4.0 -pix_fmt yuv420p -r 30 -crf 24 \
  -movflags +faststart -an "$HERO/client-hero-1280.mp4"

echo "Encoding mobile rendition (854)..."
"$FFMPEG" -y -i "$SRC" \
  -vf "scale=854:-2" -c:v libx264 -preset faster -profile:v main -level 3.1 -pix_fmt yuv420p -r 30 -crf 26 \
  -movflags +faststart -an "$HERO/client-hero-854.mp4"

echo "Done. Hero video renditions ready in $HERO/."
