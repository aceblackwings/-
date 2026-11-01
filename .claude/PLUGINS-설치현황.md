# 플러그인·스킬 설치 현황 (2026-11-01 점검)

## 1. 이번 요청 8개 처리 결과

| # | 이름 | 원본 저장소 | 처리 | 이유 |
|---|------|------------|------|------|
| 1 | hyperframes | heygen-com/hyperframes | ✅ 등록 (`hyperframes@hyperframes`) | HTML로 영상 만들기. 기존 Remotion 프로젝트와 겹치지만 방식이 달라 보완 관계 |
| 2 | taste | Leonxlnx/taste-skill | ✅ 등록 (`taste-skill@taste-skill`) | ⚠ frontend-design·impeccable과 역할이 겹침 (아래 참고) |
| 3 | graphify | Graphify-Labs/graphify | ✅ 설치 (프로젝트 스킬 + 훅 + CLAUDE.md) | 새 클라우드 세션에서는 `pip install graphifyy` 필요. 없으면 훅은 조용히 건너뜀 |
| 4 | omniroute | diegosouzapw/OmniRoute | ❌ 보류 | 내 컴퓨터에서 돌리는 AI 중계 서버. 클라우드 세션에서는 작동 불가, headroom과 기능 중복, 자체 ponytail 사본 포함 |
| 5 | ecc | affaan-m/ECC | ❌ 보류 | 스킬 314개·에이전트 71개·명령 98개의 초대형 묶음. 이미 설치된 superpowers와 역할이 대부분 겹침 |
| 6 | claude-video | bradautomates/claude-video | ✅ 등록 (`watch@claude-video`) | 영상을 "보고" 내용 파악 — 새로운 능력 |
| 7 | headroom | headroomlabs-ai/headroom | ✅ 사용자 PC에 직접 설치 완료 | 내 PC 전용 프록시. 클라우드 설정에는 넣지 않음 |
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

## 4. 2026-11-01 실제 설치 확인

- 플러그인 4종 설치 확인: hyperframes 0.8.225 / taste-skill 2.1.5 / watch(claude-video) 0.3.2 / ponytail 5.3.3
- graphify 0.9.100: `.claude/skills/graphify`, `CLAUDE.md` 규칙, PreToolUse 훅 등록
- claude-video 보조 프로그램: ffmpeg(기본 탑재), yt-dlp(이번 세션에 설치)
- ponytail 선택 옵션(ledger·webhook)은 비워 둠 — 필요하면 `/plugin configure ponytail@ponytail`
- 계속 보류: ecc(superpowers와 충돌), omniroute(Claude 무료 아님·약관 위험)
