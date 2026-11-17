#!/usr/bin/env bash
# Puts the client's ORIGINAL hero video on the site exactly as delivered (no re-encode).
#
#   bash scripts/prepare-hero-original.sh "/path/to/Website Video 1.mp4"
#
# The picture is never touched. The script only:
#   - copies the video stream bit-for-bit (-c:v copy) and drops the audio (the hero is muted),
#   - moves the index to the front (+faststart). Without that, a browser must download the
#     whole file before the first frame can play,
#   - writes BT.709 colour tags only if the file has none, so browsers convert colours the same
#     way as the poster,
#   - cuts the poster from the file's frame 0 and rebuilds the WebP variants (landscape and the
#     phone crop), so the hero still switches from poster to video invisibly.
#
# Output: public/videos/hero/client-hero-original.mp4. The file is git-ignored because GitHub
# rejects files over 100 MB. It stays on this machine, and package-cpanel.sh ships it in the
# zip. Commit the regenerated poster (public/images/client-video-frame-0.jpg, images/opt/,
# src/data/image-manifest.json), not the video.
set -euo pipefail

cd "$(dirname "$0")/.."
SRC="${1:-}"
OUT="public/videos/hero/client-hero-original.mp4"
FFMPEG="${FFMPEG:-ffmpeg}"
FFPROBE="${FFPROBE:-${FFMPEG%ffmpeg}ffprobe}"

[ -n "$SRC" ] && [ -f "$SRC" ] || { echo "Usage: $0 /path/to/original.mp4"; exit 1; }
command -v "$FFMPEG" >/dev/null || { echo "ffmpeg not found. Set FFMPEG=/path/to/ffmpeg"; exit 1; }
command -v "$FFPROBE" >/dev/null || { echo "ffprobe not found. Set FFPROBE=/path/to/ffprobe"; exit 1; }

probe() { "$FFPROBE" -v error -select_streams v:0 -show_entries "stream=$1" -of default=nw=1:nk=1 "$SRC"; }
codec=$(probe codec_name)
pix=$(probe pix_fmt)
space=$(probe color_space)

# Browsers only play H.264 8-bit 4:2:0 everywhere. Anything else would need a re-encode.
if [ "$codec" != h264 ] || [ "$pix" != yuv420p ]; then
  echo "This file is $codec / $pix. Browsers need H.264 yuv420p, so it cannot be used as-is."
  echo "Ask the client for an H.264 MP4 export, or convert it at near-lossless quality with:"
  echo "  $FFMPEG -i \"$SRC\" -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -an converted.mp4"
  echo "and run this script on converted.mp4."
  exit 1
fi

tags=()
if [ -z "$space" ] || [ "$space" = unknown ]; then
  tags=(-bsf:v h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1)
  space=bt709
fi

mkdir -p "$(dirname "$OUT")"
"$FFMPEG" -v error -y -i "$SRC" -map 0:v:0 -c:v copy "${tags[@]}" -an -movflags +faststart "$OUT"

# Poster: frame 0 of the file every device plays.
tmp="$(mktemp --suffix=.png)"
"$FFMPEG" -v error -y -i "$OUT" -frames:v 1 \
  -vf "scale=in_color_matrix=$space:in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int,format=rgb24" \
  "$tmp"
node -e "require('sharp')(process.argv[1]).jpeg({ quality: 92, chromaSubsampling: '4:4:4', mozjpeg: true }).toFile(process.argv[2])" \
  "$tmp" public/images/client-video-frame-0.jpg
rm -f "$tmp"
npm run -s images:optimize >/dev/null

size=$(stat -c%s "$OUT")
dur=$("$FFPROBE" -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT")
res=$("$FFPROBE" -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of csv=p=0 "$OUT")
node -e "
const [size, dur, res] = process.argv.slice(1)
const mbps = (size * 8) / dur / 1e6
console.log('Ready: $OUT')
console.log('  ' + (size / 1048576).toFixed(0) + ' MB, ' + (+dur).toFixed(1) + ' s, ' + res + ', ' + mbps.toFixed(1) + ' Mbps')
console.log('  Plays without stalling on connections above ~' + Math.ceil(mbps) + ' Mbps; on slower links the poster (frame 0) stays.')
" "$size" "$dur" "$res"
echo "Next: commit the poster files (git status), then build the zip with scripts/deployment/package-cpanel.sh."
