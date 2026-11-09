# AGENTS.md — Codex용 안내

이 저장소는 **12지신 강림**(사주 × 부적 × 지신 육성 앱, `saju-app/`)이며 Claude Code와 Codex가 함께 작업합니다.

## 먼저 읽을 것
1. **`CLAUDE.md`를 처음부터 읽으세요.** 버전별 완료 내역, 모듈 지도, 설계 원칙, 「🤝 Codex와 함께 쓰기」 규칙이 모두 그 파일에 있습니다. 이 파일은 요약일 뿐입니다.
2. 출시 계획: `docs/launch-plan.html`(목표 2026-12-22 웹·안드로이드·iOS 동시 출시), 결제 방향: `docs/payment-plan.md`.

## 핵심 규칙
- 기본 브랜치: `claude/zhuge-liang-advice-window-e8ghwy`. Codex는 `codex/작업이름` 브랜치에서 작업하고 PR로 병합합니다.
- 시작할 때 `CLAUDE.md` 맨 위 「진행 중」 줄에 `[Codex · 브랜치 · 작업 · 건드리는 파일]`을 적어 푸시하고, 끝나면 지웁니다. 상대가 적어 둔 파일은 고치지 않습니다.
- 앱은 빌드 없는 정적 웹(ES 모듈). 루트 `index.html`은 다른 프로젝트이니 건드리지 않습니다.
- 실행: `cd saju-app && python3 -m http.server 8000` → http://localhost:8000
- 테스트: `cd saju-app && npm test` — 모두 통과해야 완료입니다. 새 모듈에는 `saju-app/tests/*.test.mjs`를 추가하고 `package.json` test 스크립트에 넣습니다.
- 끝나면 `CLAUDE.md` 맨 위에 `> **✅ v번호(날짜, 요청 요약, Codex)**` 기록을 남깁니다.
- 화면 글은 한국어 쉬운 말, 겁주는 말·금지어 금지, 생년월일·사주 원본은 기기에만, 결제로 운 점수를 올리지 않습니다.
- 미리보기 아티팩트·`sample`/`room`/`db` 기능·드라이브 그림 받기는 Claude Code가 맡습니다.
