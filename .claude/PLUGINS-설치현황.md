# 플러그인·스킬 설치 현황 (2026-11-01 점검)

## 1. 이번 요청 8개 처리 결과

| # | 이름 | 원본 저장소 | 처리 | 이유 |
|---|------|------------|------|------|
| 1 | hyperframes | heygen-com/hyperframes | ✅ 등록 (`hyperframes@hyperframes`) | HTML로 영상 만들기. 기존 Remotion 프로젝트와 겹치지만 방식이 달라 보완 관계 |
| 2 | taste | Leonxlnx/taste-skill | ✅ 등록 (`taste-skill@taste-skill`) | ⚠ frontend-design·impeccable과 역할이 겹침 (아래 참고) |
| 3 | graphify | Graphify-Labs/graphify | ⏸ 명령어 안내 | 파이썬 프로그램 설치가 필요해 설정 파일만으로는 불가 |
| 4 | omniroute | diegosouzapw/OmniRoute | ❌ 보류 | 내 컴퓨터에서 돌리는 AI 중계 서버. 클라우드 세션에서는 작동 불가, headroom과 기능 중복, 자체 ponytail 사본 포함 |
| 5 | ecc | affaan-m/ECC | ❌ 보류 | 스킬 314개·에이전트 71개·명령 98개의 초대형 묶음. 이미 설치된 superpowers와 역할이 대부분 겹침 |
| 6 | claude-video | bradautomates/claude-video | ✅ 등록 (`watch@claude-video`) | 영상을 "보고" 내용 파악 — 새로운 능력 |
| 7 | headroom | headroomlabs-ai/headroom | ❌ 보류 | 토큰 압축 프록시. 내 PC에서 `headroom wrap claude`로 실행하는 방식이라 클라우드에서는 무의미 |
| 8 | ponytail | DietrichGebert/ponytail | ✅ 등록 (`ponytail@ponytail`) | "코드를 적게, 단순하게" 규칙. 가볍고 충돌 없음 |

## 2. 이전에 설치해 둔 것 (다른 브랜치에서 확인)

- 플러그인: frontend-design, superpowers, context7, playwright, claude-hud, claude-mem, impeccable
- 스킬: find-skills, higgsfield 8종(브랜드킷·썸네일·상품사진·영상설명 등), my-editor(영상 편집)
- 프로젝트: rescene-isa-video(Remotion 영상), 카드뉴스

## 3. 겹치는 것 정리

- **디자인 3형제**: frontend-design / impeccable / taste → 모두 "AI 티 안 나는 예쁜 화면" 담당. 하나만 남기는 걸 권장 (추천: impeccable 또는 taste 중 택1).
- **영상 만들기**: hyperframes(HTML) / Remotion 프로젝트(React) / higgsfield-video-explainer / my-editor → 만드는 방식이 달라 공존 가능.
- **업무 방식 묶음**: superpowers ↔ ecc → 둘 다 넣으면 규칙이 서로 부딪힘. 하나만.
- **토큰 절약**: headroom ↔ omniroute → 둘 다 중계 서버. 내 PC에서 쓸 거라면 하나만.

## 4. 직접 설치해야 하는 것 (내 컴퓨터 터미널)

graphify:
```bash
uv tool install graphifyy
```
```bash
graphify install --project
```
그다음 Claude Code에서 `/graphify .`
