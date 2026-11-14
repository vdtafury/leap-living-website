#!/usr/bin/env bash
# Re-encodes the homepage hero clips into lightweight web renditions.
#
#   FFMPEG=/path/to/ffmpeg bash scripts/encode-hero-videos.sh
#
# For each master in public/videos/<name>.mp4 it writes:
#   public/videos/hero/<name>-1280.mp4   desktop  (CRF 27)
#   public/videos/hero/<name>-854.mp4    phones / slow links (CRF 29)
# Silent (-an), trimmed to 9.6s (the hero shows each clip for 9s),
# 24fps, 2s GOP, +faststart so playback can begin before the file finishes.
# Clip order/names must match HERO_CLIPS in
# src/components/home/hero-video-backdrop.tsx.
set -euo pipefail

FFMPEG="${FFMPEG:-ffmpeg}"
cd "$(dirname "$0")/../public/videos"
mkdir -p hero

CLIPS=(
  beach-turquoise-ocean
  dubai-palm-jumeirah-sunny
  beach-aerial-pier
  luxury-villa-pool-sunny
  luxury-yacht-waterfront
  coastal-yacht-bay
)

encode() { # <name> <width> <crf>
  "$FFMPEG" -v error -y -i "$1.mp4" -t 9.6 -an \
    -vf "scale=$2:-2:flags=lanczos,fps=24" \
    -c:v libx264 -preset slow -crf "$3" -profile:v high -pix_fmt yuv420p -g 48 \
    -movflags +faststart "hero/$1-$2.mp4"
}

for name in "${CLIPS[@]}"; do
  encode "$name" 1280 27
  encode "$name" 854 29
  printf '%-28s 1280: %5s KB   854: %5s KB\n' "$name" \
    "$(($(stat -c%s "hero/$name-1280.mp4") / 1024))" \
    "$(($(stat -c%s "hero/$name-854.mp4") / 1024))"
done
