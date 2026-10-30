---
name: my-editor
description: 내 쇼츠 편집 스킬. 음성/영상 파일을 주면 받아쓰기 → 쉼 줄이기 → 실제 화면 캡처 → HyperFrames 자막·모션그래픽 → 렌더 → 자동 검사까지 한다. "편집 스킬로", "쇼츠 편집해 줘", "영상 편집해 줘" 요청에 사용.
---

# 내 편집 스킬

`SKILL_DIR` = 이 파일이 있는 폴더. 스크립트는 전부 `SKILL_DIR/scripts/` 에 있다.
Python 스크립트는 가상환경의 파이썬으로 실행한다(없으면 `python3`).
- macOS·Linux: `SKILL_DIR/.venv/bin/python`
- Windows: `SKILL_DIR\.venv\Scripts\python.exe` (Git Bash에서는 `SKILL_DIR/.venv/Scripts/python.exe`)

아래 명령의 `python` 은 이 경로를 뜻한다.
준비물이 없으면 먼저 `bash SKILL_DIR/setup/install.sh` 를 실행한다(macOS·Linux 전용).
Windows는 winget(Gyan.FFmpeg · UB-Mannheim.TesseractOCR)으로 설치하고, 한국어 데이터 `kor.traineddata` 는
`TESSDATA_PREFIX` 가 가리키는 폴더에 둔다. 셸 스크립트(`normalize_loudness.sh`)는 Git Bash로 실행한다.

## 절대 규칙 (내가 준 피드백, 날짜순으로 계속 추가)
- 화면은 실제 사이트 캡처·실제 실행 녹화만. 목업 카드·가짜 터미널 금지.
- 맨 위 제목은 첫 화면부터 고정. 흐릿하게 나타나지 않게.
- 자막은 단어가 나오는 순간에 하나씩. 강조 단어는 주황색.
- 한 화면을 1.5초 넘게 가만히 두지 않기(줌·하이라이트·칩 등장).

## 피드백 기록 방법
내가 "방금 고친 내용을 스킬에 추가해 줘"라고 하면, 위 '절대 규칙' 맨 아래에
`- (YYYY-MM-DD) "내가 한 말 그대로" → 지킬 규칙` 형식으로 한 줄 추가한다.
이 폴더가 git 저장소 안에 있으면 그 변경을 커밋한다.

## 순서
작업 폴더는 영상마다 `edit-<영상이름>/` 을 만들어 그 안에서 진행한다.

1. **받아쓰기** — 단어마다 시각을 `words.json` 에 저장
   `python scripts/transcribe.py input.mp4 -o words.json --model small --language ko`
2. **쉼 줄이기** — 쉼 0.18초 초과분은 0.12초만 남기고 자르기(목소리 속도 유지). 단어 시각도 함께 옮긴다.
   `python scripts/cut_silence.py input.mp4 -o cut.mp4 --words words.json --words-out words.cut.json`
   음성만 있으면 출력을 `cut.wav` 로. 이후 단계는 `words.cut.json` 시각을 기준으로 한다.
   결과의 "before → after" 초를 나에게 보고한다.
3. **실제 사이트 캡처** — 문장마다 말하는 사이트를 `shots.json` 에 적고, 캡처와 강조 문구 좌표를 같은 실행에서 뽑는다.
   `node scripts/capture.mjs shots.json captures`
   형식: `[{"id":"s01","url":"https://…","highlight":["강조 문구"],"scrollTo":"(선택) 이 문구로 스크롤"}]`
   "못 찾은 문구"가 나오면 문구를 화면 글자와 똑같이 고쳐서 다시 실행한다. 목업으로 대신하지 않는다.
4. **조립** — `/hyperframes` 스킬로 1080x1920 세로 프로젝트를 만든다.
   `hyperframes init <이름> --example blank --resolution portrait --non-interactive`
   - `words.cut.json` 시각에 맞춰 자막을 단어가 나올 때 하나씩 올린다.
   - 문장마다 캡처 화면을 창처럼 띄우고, 강조 문구가 나오는 순간 `captures/<id>.json` 좌표에 하이라이트를 긋는다.
   - 오디오는 `cut.wav`(또는 `cut.mp4` 의 소리)를 그대로 쓴다.
   - CDN(jsdelivr 등)이 막힌 환경이면 `SKILL_DIR/node_modules/gsap/dist/gsap.min.js` 를 프로젝트 `vendor/` 로 복사해 로컬 경로로 바꾼다.
   - `hyperframes check` 로 검사한 뒤 `hyperframes render`.
5. **소리 크기** — `bash scripts/normalize_loudness.sh renders/<파일>.mp4 final.mp4` (-14 LUFS)
6. **검사** — 사람에게 보여주기 전에 반드시 실행.
   `python scripts/check_render.py final.mp4 --audio cut.wav`
   - 입 모양 시차 0ms · 화면 개인 정보(이메일·API 키·UUID) 0건 · -14 LUFS(±1)
   - 하나라도 FAIL 이면 원인을 고치고(개인 정보는 해당 캡처를 다시 찍거나 가림 처리) 4~6단계를 반복한다.
   - 모두 OK 일 때만 `final.mp4` 와 검사 결과를 보여준다.

## (선택) 목소리·아바타
ElevenLabs(목소리 복제)·HeyGen(아바타)은 유료이며 API 키가 필요하다. 키는 환경 변수로만 받고 파일에 적지 않는다.
직접 녹화한 영상이면 이 단계는 건너뛰고 1번부터 시작한다.
