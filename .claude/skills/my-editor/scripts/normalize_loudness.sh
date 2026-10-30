#!/usr/bin/env bash
# 렌더본 소리 크기를 -14 LUFS(유튜브·인스타 기준)로 맞춘다. 화면은 다시 인코딩하지 않는다.
# 사용법: normalize_loudness.sh render.mp4 [out.mp4] [target=-14]
set -euo pipefail
in="$1"; out="${2:-${in%.*}.norm.mp4}"; target="${3:--14}"

stats=$(ffmpeg -hide_banner -nostats -i "$in" -af "loudnorm=I=$target:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 \
  | sed -n '/^{/,/^}/p')
get() { echo "$stats" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }

ffmpeg -y -hide_banner -loglevel error -i "$in" -c:v copy -c:a aac -b:a 192k -ar 48000 \
  -af "loudnorm=I=$target:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" \
  "$out"
echo "-> $out"
