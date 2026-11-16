#!/usr/bin/env bash
# Re-encodes the client's hero reel into the two web renditions the homepage plays:
#   public/videos/hero/client-hero-1280.mp4   desktop          (CRF 31, ~9 MB for the 74 s reel)
#   public/videos/hero/client-hero-854.mp4    phones / 3G      (CRF 33, ~4 MB)
# Silent (-an), 24 fps, 2 s GOP, +faststart so playback starts before the download ends,
# tagged BT.709 so every browser converts colours the same way as the poster below.
#
#   FFMPEG=/path/to/ffmpeg bash scripts/encode-hero-videos.sh [master.mp4]
#
# The master is NOT kept in the repository (GitHub limit, and every clone would carry it);
# keep it in the client-assets drive. Default master path: web/hero-master.mp4 (git-ignored by *.mp4).
# It then cuts the hero poster from frame 0 of each rendition, so the still and the video's
# first frame are the same picture (the hero switches from one to the other invisibly):
#   public/images/client-video-frame-0.jpg          frame 0 of client-hero-1280.mp4
#   scripts/assets/client-video-frame-0-854.jpg     frame 0 of client-hero-854.mp4 (phone crop)
# and runs `npm run images:optimize` to rebuild the WebP variants and the manifest.
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
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
    -movflags +faststart "$OUT/client-hero-$1.mp4"
  printf 'client-hero-%s.mp4  %5s KB\n' "$1" "$(($(stat -c%s "$OUT/client-hero-$1.mp4") / 1024))"
}

encode 1280 31 high
encode 854 33 main

poster() { # <width> <output.jpg>: frame 0 of the rendition, BT.709 -> sRGB, JPEG q92 4:4:4
  local tmp
  tmp="$(mktemp --suffix=.png)"
  "$FFMPEG" -v error -y -i "$OUT/client-hero-$1.mp4" -frames:v 1 \
    -vf "scale=in_color_matrix=bt709:in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int,format=rgb24" \
    "$tmp"
  node -e "require('sharp')(process.argv[1]).jpeg({ quality: 92, chromaSubsampling: '4:4:4', mozjpeg: true }).toFile(process.argv[2])" \
    "$tmp" "$2"
  rm -f "$tmp"
}
mkdir -p scripts/assets
poster 1280 public/images/client-video-frame-0.jpg
poster 854 scripts/assets/client-video-frame-0-854.jpg
npm run -s images:optimize
