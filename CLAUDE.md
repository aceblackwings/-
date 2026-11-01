# 프로젝트 인수인계: 12지신 강림 (사주 × 부적 × 신수 육성 소셜 앱 프로토타입)

새 대화에서 이어서 작업할 때 이 파일부터 읽으세요.

## 위치
- 앱: `saju-app/` (빌드 없는 정적 웹, ES 모듈). 루트 `index.html`은 별개 프로젝트(일일계도상소) — 건드리지 않음
- 기획·조사 문서: `docs/` (최신 전략: `docs/strategy-v013.md`, 방향: `docs/kaiun-loop-direction.md`, 승천·가챠: `docs/ascension-gacha-report.md`, 소셜 설계: `docs/social-design.md`)
- 작업 브랜치: `claude/exciting-johnson-1f6o78` (커밋 후 `git push -u origin claude/exciting-johnson-1f6o78`)
- 미리보기(Claude 아티팩트): slug `f5ff35d3-d121-45d3-8a5e-b1b6c7e1fffe`, URL https://claude.ai/artifact/XNrP2AFTcULKijQSe1xzC5
  - 갱신: `publish_files`(slug, base_version=get_artifact로 확인, files: `index.html`, `styles.css`, `js/*.js`를 같은 경로로)
  - 선언된 capability: `sample`(AI 대화), `room`(실시간), `db`+`user`(우편함). 새 capability는 **선언 먼저 → 코드 게시**

## 실행·테스트
- 로컬: `cd saju-app && python3 -m http.server 8000` → http://localhost:8000
- 테스트: `cd saju-app && npm test` (node 테스트 파일 13개, 모두 통과 상태 유지)
- 화면 확인: Playwright(`require('playwright')`, 크로미움 내장)로 스크린샷

## 모듈 지도 (`saju-app/js/`)
| 파일 | 역할 |
|---|---|
| saju.js | 만세력(태양 황경 절기), 사주 8글자, 오행, 신강/신약, 용신, 십신, 한국 표준시 변천 |
| lunar.js | 한국 음력(합삭+중기, 무중치윤), 양↔음 변환 |
| luck.js | 대운(순·역행, 절기 날수÷3)·세운, 오행 충전·개운 지수, 5년 흐름, 진화 게이트 |
| fortune.js | 오늘의 운세 점수·문장·행운 키트 |
| character.js | 12지신 캐릭터 SVG(띠×오행×성별×고민×진화 14단계), 장착, 스탯 |
| growth.js | 경험치·레벨·퀘스트·연속 출석·진화 단계 목록 |
| ascension.js | 승천(6~14) 능력, 시련, 성장 가속 |
| talisman.js / emoticon.js / stickers.js | 부적·이모티콘·스티커 SVG와 등급 효과 |
| gacha.js | 운명 뽑기(확률 공개, 30회 천장, 무료/추가/구독) |
| personality.js / pairtalk.js | 띠별 성격·말투, 띠끼리 대화 144조합(+전설 30쌍) |
| compat.js / dex.js | 궁합 점수·카드, 12띠 수집 도감 |
| journey.js | 고민 해결 여정 30일 |
| fengshui.js | 풍수 기운 스팟·보물 |
| festivals.js | 계절 축제 달력 |
| chat.js | AI 수호신 대화(지시문·안전·오프라인 답변) |
| memory.js | 수호신의 기억: 일정·주제·사람·좋아하는 것 추출, 요약, 지난 일정 안부, 개인정보 제외 (`unmyeong2099.memory`) |
| realtime.js | 실시간 궁합방(room)·친구 우편함(db) 도우미 |
| story.js | 인스타 스토리 카드(캔버스) |
| app.js | 화면·상태·localStorage(`unmyeong2099.*` 키) |

## 설계 원칙 (지켜야 할 것)
1. 초보자 우선: 3단계 시작, 홈 = 오늘 할 일 3가지
2. 정통 기본 흐름은 부풀리지 않고, 개운 반영은 "게임 요소"로 나란히 표시
3. 결제로 운을 직접 올리지 않음(유료 뽑기 부적 충전 50%)
4. 확률 공개, 위기 신호 시 109 안내, 의료·법률·투자 단정 금지
5. 생년월일·사주 원본은 기기에만. 공유는 띠·오행 비율·캐릭터 정보까지만
6. 사용자 응대는 한국어, 공식적이고 격려하는 톤

## 다음 할 일 후보
(완료: v0.16 수호신의 기억) 계절 한정 패키지, 해외판 튜토리얼과 다국어, 정식 앱 전환(React Native/Flutter + 서버)
