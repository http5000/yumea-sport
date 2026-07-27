#!/usr/bin/env bash
# Yumea Move — pipeline média par exercice.
# Usage:
#   vid.sh clip  <exId> <video_url>   -> télécharge un clip Kling, faststart, boucle navigateur
#   vid.sh still <exId> <image_url>   -> photo éditoriale -> vidéo zoom lent 10s (fallback sol)
set -euo pipefail
DEST=/root/projets/yumea-sport/public/exercises
mkdir -p "$DEST"
mode="$1"; exid="$2"; url="$3"
tmp="/tmp/ym_$exid"

case "$mode" in
  clip)
    curl -s -o "$tmp.src.mp4" "$url"
    # re-encode qualite pro mais leger : 1080x1920, CRF 26, sans audio, faststart
    ffmpeg -y -i "$tmp.src.mp4" -an -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart "$DEST/$exid.mp4" 2>/dev/null
    # poster : 1re image (supprime le flash noir au demarrage)
    ffmpeg -y -i "$DEST/$exid.mp4" -frames:v 1 -q:v 3 "$DEST/$exid.jpg" 2>/dev/null
    rm -f "$tmp.src.mp4"
    ;;
  still)
    curl -s -o "$tmp.png" "$url"
    # zoom lent (Ken Burns) 10s, 1080x1920, silencieux, faststart
    ffmpeg -y -loop 1 -i "$tmp.png" -t 10 \
      -vf "scale=1350:2400,zoompan=z='min(zoom+0.0007,1.10)':d=250:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=25,format=yuv420p" \
      -c:v libx264 -preset veryfast -crf 22 -movflags +faststart "$DEST/$exid.mp4" 2>/dev/null
    ffmpeg -y -i "$DEST/$exid.mp4" -frames:v 1 -q:v 3 "$DEST/$exid.jpg" 2>/dev/null
    rm -f "$tmp.png"
    ;;
  *) echo "mode inconnu: $mode" >&2; exit 1;;
esac
# rapport
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -of csv=p=0 "$DEST/$exid.mp4"
ls -la "$DEST/$exid.mp4"
