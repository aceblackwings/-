#!/usr/bin/env bash
# 편집 스킬 준비물 한 번에 설치 (macOS·Linux 공용)
#   ffmpeg · Tesseract(한국어) · Whisper · Puppeteer · HyperFrames(CLI + 클로드 코드 플러그인)
# 그리고 이 스킬을 ~/.claude/skills/my-editor 에 연결해서 어느 폴더에서든 "편집 스킬로 …" 가 되게 한다.
#
# 사용법: bash .claude/skills/my-editor/setup/install.sh [--model small]   (Whisper 모델 미리 받기, 생략 가능)
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODEL=""
[[ "${1:-}" == "--model" ]] && MODEL="${2:-small}"

step() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }

step "1) ffmpeg · Tesseract(한국어) 설치"
if [[ "$(uname)" == "Darwin" ]]; then
  command -v brew >/dev/null || { echo "Homebrew가 필요합니다: https://brew.sh"; exit 1; }
  brew install ffmpeg tesseract tesseract-lang node python
else
  SUDO=""; [[ $EUID -ne 0 ]] && SUDO="sudo"
  $SUDO apt-get update -qq
  $SUDO apt-get install -y -qq ffmpeg tesseract-ocr tesseract-ocr-kor tesseract-ocr-eng python3-venv
fi

step "2) Whisper (전용 가상환경: $SKILL_DIR/.venv)"
python3 -m venv --system-site-packages "$SKILL_DIR/.venv"
"$SKILL_DIR/.venv/bin/pip" install -q --upgrade pip
"$SKILL_DIR/.venv/bin/pip" install -q openai-whisper numpy
if [[ -n "$MODEL" ]]; then
  "$SKILL_DIR/.venv/bin/python" -c "import whisper; whisper.load_model('$MODEL')"
fi

step "3) Puppeteer · GSAP (스킬 폴더 로컬)"
command -v npm >/dev/null || { echo "Node.js 22 이상이 필요합니다: https://nodejs.org"; exit 1; }
(cd "$SKILL_DIR" && npm install --silent)

step "4) HyperFrames CLI + 클로드 코드 플러그인"
npm install -g --silent hyperframes
if command -v claude >/dev/null; then
  claude plugin marketplace add heygen-com/hyperframes || true
  claude plugin install hyperframes@hyperframes
else
  echo "claude 명령이 없어 플러그인 설치를 건너뜁니다. 클로드 코드 설치 후 다시 실행하세요."
fi

step "5) 스킬 연결: ~/.claude/skills/my-editor"
mkdir -p "$HOME/.claude/skills"
TARGET="$HOME/.claude/skills/my-editor"
if [[ "$SKILL_DIR" != "$TARGET" ]]; then
  if [[ -e "$TARGET" && ! -L "$TARGET" ]]; then
    mv "$TARGET" "$TARGET.backup.$(date +%Y%m%d%H%M%S)"
  fi
  ln -sfn "$SKILL_DIR" "$TARGET"   # 심볼릭 링크: 피드백이 저장소의 SKILL.md 에 그대로 쌓인다
fi

step "설치 확인"
ffmpeg -version | head -1
tesseract --list-langs 2>/dev/null | grep -q kor && echo "tesseract: kor OK"
"$SKILL_DIR/.venv/bin/python" -c "import whisper; print('whisper OK')"
hyperframes --version
echo -e "\n완료. 클로드 코드에서 \"편집 스킬로 이 영상 만들어 줘\" 라고 말하면 됩니다."
