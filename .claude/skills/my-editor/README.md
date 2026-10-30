# 편집 스킬 (my-editor)

클로드 코드에 영상 편집을 통째로 맡기는 스킬입니다.
받아쓰기(Whisper) → 쉼 줄이기(ffmpeg) → 실제 사이트 캡처(Puppeteer) → 자막·모션그래픽(HyperFrames) → -14 LUFS → 자동 검사(싱크·개인 정보·소리 크기).

## 설치 (한 번만)
```bash
bash .claude/skills/my-editor/setup/install.sh --model small
```
- macOS는 Homebrew, Linux는 apt를 씁니다.
- 끝나면 `~/.claude/skills/my-editor` 가 이 폴더로 연결되어 어느 프로젝트에서든 쓸 수 있습니다.

## 사용
클로드 코드에서: `편집 스킬로 이 영상 만들어 줘: ~/Movies/raw.mp4`

피드백 후에는: `방금 고친 내용을 편집 스킬(SKILL.md)의 '절대 규칙'에 날짜와 내가 한 말 그대로 추가해 줘.`

## 스크립트
| 파일 | 하는 일 |
| --- | --- |
| `scripts/transcribe.py` | 단어마다 시각 → `words.json` |
| `scripts/cut_silence.py` | 0.18초 넘는 쉼을 0.12초로, 단어 시각도 새 타임라인으로 이동 |
| `scripts/capture.mjs` | 실제 사이트 캡처 + 강조 문구 좌표(같은 실행) |
| `scripts/normalize_loudness.sh` | -14 LUFS로 맞추기(화면 재인코딩 없음) |
| `scripts/check_render.py` | 입 모양 시차·화면 개인 정보 OCR·라우드니스 검사, 실패 시 종료 코드 1 |
