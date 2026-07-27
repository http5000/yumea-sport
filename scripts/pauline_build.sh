#!/usr/bin/env bash
# Yumea Move — montage du doublage Pauline.
# Assemble les clips de base (générés via Cartesia, cf. pauline_transcripts.tsv)
# en répliques finales lues par le lecteur : go_<ex>, intro_<ex>, rest_<ex>,
# + les clips fixes (halfway, tenLeft, restLast, finish).
#
# Prérequis : les clips de base dans  $BASE  (name_<ex>.mp3, carrier_*.mp3, fixes).
# Usage :  bash scripts/pauline_build.sh
set -euo pipefail
cd "$(dirname "$0")/.."
BASE="${BASE:-/root/audio_tmp/base}"      # clips de base
OUT="public/audio/fr"                       # sortie (embarquée dans l'export)
GAP="0.14"                                   # silence de liaison (s)
mkdir -p "$OUT"

# Concatène deux mp3 avec un court silence entre les deux (re-encode = params normalisés).
join() { # <a> <b> <out>
  ffmpeg -y -i "$1" -i "$2" -filter_complex \
    "[0:a]apad=pad_dur=$GAP[a0];[a0][1:a]concat=n=2:v=0:a=1[o]" \
    -map "[o]" -c:a libmp3lame -q:a 4 "$3" 2>/dev/null
}

EXOS=$(grep -oE '^name_[a-z_]+' scripts/pauline_transcripts.tsv | sed 's/^name_//')
n=0
for ex in $EXOS; do
  join "$BASE/name_$ex.mp3"    "$BASE/carrier_go.mp3"  "$OUT/go_$ex.mp3"
  join "$BASE/carrier_intro.mp3" "$BASE/name_$ex.mp3"  "$OUT/intro_$ex.mp3"
  join "$BASE/carrier_rest.mp3"  "$BASE/name_$ex.mp3"  "$OUT/rest_$ex.mp3"
  n=$((n+1))
done

for fixed in halfway tenLeft restLast finish; do
  cp "$BASE/$fixed.mp3" "$OUT/$fixed.mp3"
done

echo "✓ $((n*3 + 4)) clips générés dans $OUT (pour $n exercices)."
ls "$OUT" | wc -l
