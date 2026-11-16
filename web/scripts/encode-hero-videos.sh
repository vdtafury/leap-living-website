#!/usr/bin/env bash
# Re-encodes the client's hero reel into the two web renditions the homepage plays:
#   public/videos/hero/client-hero-1280.mp4   desktop          (CRF 31, ~9 MB for the 74 s reel)
#   public/videos/hero/client-hero-854.mp4    phones / 3G      (CRF 33, ~4 MB)
# Silent (-an), 24 fps, 2 s GOP, +faststart so playback starts before the download ends.
#
#   FFMPEG=/path/to/ffmpeg bash scripts/encode-hero-videos.sh [master.mp4]
#
# The master is NOT kept in the repository (GitHub limit, and every clone would carry it);
# keep it in the client-assets drive. Default master path: web/hero-master.mp4 (git-ignored by *.mp4).
# The poster is the reel's first frame: after re-encoding, refresh
# public/images/client-video-frame-0.jpg and run `npm run images:optimize`.
set -euo pipefail

cd "$(dirname "$0")/.."
SRC="${1:-hero-master.mp4}"
OUT="public/videos/hero"
FFMPEG="${FFMPEG:-ffmpeg}"

command -v "$FFMPEG" >/dev/null || { echo "ffmpeg not found. Set FFMPEG=/path/to/ffmpeg"; exit 1; }
[ -f "$SRC" ] || { echo "Master not found: web/$SRC (pass the path as the first argument)"; exit 1; }
mkdir -p "$OUT"

encode() { # <width> <crf> <profile>
  "$FFMPEG" -v error -y -i "$SRC" -an \
    -vf "scale=$1:-2:flags=lanczos,fps=24" \
    -c:v libx264 -preset slow -crf "$2" -profile:v "$3" -pix_fmt yuv420p -g 48 \
    -movflags +faststart "$OUT/client-hero-$1.mp4"
  printf 'client-hero-%s.mp4  %5s KB\n' "$1" "$(($(stat -c%s "$OUT/client-hero-$1.mp4") / 1024))"
}

encode 1280 31 high
encode 854 33 main

# Poster: frame 0 of the reel (JPEG q≈2). Uncomment to refresh it with the video.
# "$FFMPEG" -v error -y -i "$SRC" -frames:v 1 -q:v 2 public/images/client-video-frame-0.jpg
