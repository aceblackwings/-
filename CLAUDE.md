# 프로젝트 인수인계: 12지신 강림 (사주 × 부적 × 신수 육성 소셜 앱 프로토타입)

새 대화에서 이어서 작업할 때 이 파일부터 읽으세요.

## 위치
- 앱: `saju-app/` (빌드 없는 정적 웹, ES 모듈). 루트 `index.html`은 별개 프로젝트(일일계도상소) — 건드리지 않음
- 기획·조사 문서: `docs/` (**최신 기획: `docs/core-saju-review-plan.md` — 핵심 사주 타임라인·엔진 통합·경쟁 앱 리뷰 분석·v0.19~ 로드맵**, 전략: `docs/strategy-v013.md`, 방향: `docs/kaiun-loop-direction.md`, 승천·가챠: `docs/ascension-gacha-report.md`, 소셜 설계: `docs/social-design.md`)
- 작업 브랜치: `claude/exciting-johnson-1f6o78` (커밋 후 `git push -u origin claude/exciting-johnson-1f6o78`)
- 미리보기(Claude 아티팩트): slug `f5ff35d3-d121-45d3-8a5e-b1b6c7e1fffe`, URL https://claude.ai/artifact/XNrP2AFTcULKijQSe1xzC5
  - 갱신: `Artifact` 도구 — 먼저 `action:read`(url), 바뀐 파일은 `read`의 `paths`로 확인 후 `publish`(url, file_path=`saju-app/index.html`, files={"styles.css":..., "js/x.js":"saju-app/js/x.js"}). 예전 `publish_files` 도구는 더 이상 없음
  - 선언된 capability: `sample`(AI 대화), `room`(실시간), `db`+`user`(우편함). 새 capability는 **선언 먼저 → 코드 게시**

## 실행·테스트
- 로컬: `cd saju-app && python3 -m http.server 8000` → http://localhost:8000
- 테스트: `cd saju-app && npm test` (node 테스트 파일 18개, 모두 통과 상태 유지)
- 화면 확인: Playwright(`require('playwright')`, 크로미움 내장)로 스크린샷
- 디자인 확인: `http://localhost:8000/?gallery=1` (12지신 띠×14단계×성별×오행, 부적 6종×5등급×2테마, 이모티콘 8표정×스타일×등급, 한정 소품 11종)

## 모듈 지도 (`saju-app/js/`)
| 파일 | 역할 |
|---|---|
| saju.js | 만세력(태양 황경 절기), 사주 8글자, 오행, 신강/신약, 용신, 십신, 한국 표준시 변천 |
| lunar.js | 한국 음력(합삭+중기, 무중치윤), 양↔음 변환 |
| luck.js | 대운(순·역행, 절기 날수÷3)·세운, 오행 충전·개운 지수, 5년 흐름, 진화 게이트 |
| period.js | **운의 층 엔진(v0.19)**: 모든 기간 점수를 `luck.js scoreParts` 하나로 계산. 올해=세운70%+대운30%, 이달=월운60%+올해40%, 오늘=일진70%+이달30% (`mix`로 정수 비율 반올림). 절기월(`monthPeriod`, 절입일부터 새 달), 입춘 기준 해, `dayScores`(그날 6분야 = 오늘 운세와 같은 값), 이번 주(`weekOf` 월~일), 이달 날짜(`monthDays` 좋은 날·조심할 날), 올해 12절기월(`yearOf`), 근거 문장. 무작위 몫 없음 |
| fortune.js | 오늘의 운세: period.js 층 점수 + 십신 보정 + 합·충 → 6분야 점수·문장·행운 키트, `layers`·`period`·`why` 포함 |
| character.js | 12지신 캐릭터 SVG(띠×오행×성별×고민×진화 14단계), 장착, 스탯 |
| growth.js | 경험치·레벨·퀘스트·연속 출석·진화 단계 목록 |
| ascension.js | 승천(6~14) 능력, 시련, 성장 가속 |
| talisman.js / emoticon.js / stickers.js | 부적·이모티콘·스티커 SVG와 등급 효과. **등급별 그림 규칙**: 부적 = 종류별 상징(엽전·복주머니·동심결·붓·불로초·호랑이 방패), 희귀 작은 상징 → 영웅 팔괘 고리 → 전설 금빛+구름 날개 → 신화 무지개+12지신 고리. 이모티콘 = 표정별 소품(클로버·꽃가루·필승 머리띠·하트·별 폭죽·복주머니·찻잔·수면 모자), 희귀 표정색 배경 → 영웅 장면 무늬 → 전설 금메달 → 신화 무지개 날개 |
| gacha.js | 운명 뽑기(확률 공개, 30회 천장, 무료/추가/구독) |
| personality.js / pairtalk.js | 띠별 성격·말투, 띠끼리 대화 144조합(+전설 30쌍). **말투 가이드(v0.20.1)**: 다정한 친구 같은 부드러운 반말(닭띠만 상냥한 존댓말), 문장마다 붙는 의성어·과장된 자기 호칭(이 몸·본 용·뀨 등) 금지(테스트로 검사), 의성어는 쓰다듬기(tap)에서만, 아기 단계는 문장 앞 🍼 |
| reading.js | 운세 풀이(대운·올해·이달): 십신 10종 해설·좋은 점·조심할 점·5분야·팁 + 속 기운(지지 본기 십신) + 용신·합충 근거 문장 + 실제 흐름(좋은 달·날). 사주 원국 화면 맨 위 「📖 나의 운세 풀이」 |
| compat.js / dex.js | 궁합 점수·카드, 12띠 수집 도감 |
| journey.js | 고민 해결 여정 30일 |
| fengshui.js | 풍수 기운 스팟·보물 |
| festivals.js | 계절 축제 달력 |
| ask.js | 운세 보기 질문형 메뉴판: 질문 10개(내 고민 우선), 답(점수·근거·팁·7일 흐름), 한 걸음 버튼 연결 |
| season.js | 계절 한정 패키지(꾸미기 세트는 `seasonSceneSVG` 계절 장면 11종 포함): 시즌 일정(명절 우선), 무료 트랙 미션·보상, 꾸미기 세트, 한정 소품·배경 효과 SVG (`unmyeong2099.season`) |
| chat.js | AI 수호신 대화(지시문·안전·오프라인 답변) |
| memory.js | 수호신의 기억: 일정·주제·사람·좋아하는 것 추출, 요약, 지난 일정 안부, 개인정보 제외 (`unmyeong2099.memory`) |
| realtime.js | 실시간 궁합방(room)·친구 우편함(db) 도우미 |
| story.js | 인스타 스토리 카드(캔버스) |
| app.js | 화면·상태·localStorage(`unmyeong2099.*` 키). 홈 = **운의 타임라인**(`timelineHTML`: 오늘·이번 주·이달·올해·대운·타고난 나, 카드마다 근거·층 이동·한 걸음 버튼), 첫 가입 = `showSajuCard`(사주 한 장 요약) → `showSummon`, 🧪 `renderGallery`(내 수호신 > 전체 미리보기, `?gallery=1`로 바로 열림, 프로필이 없으면 저장하지 않는 견본 프로필 사용) |

## 설계 원칙 (지켜야 할 것)
1. 초보자 우선: 3단계 시작, 홈 = 오늘 할 일 3가지. 주 탭 5개(오늘·운세 보기·상담·궁합·친구·내 수호신), 하위 화면은 `TAB_PARENT`·`SUBNAV`(app.js)로 묶음. 기능은 "질문 → 답 → 한 걸음 버튼 1개"로 연결
2. 정통 기본 흐름은 부풀리지 않고, 개운 반영은 "게임 요소"로 나란히 표시. 오늘 운세 `scores`는 정통값만, 게임 보너스는 `gameScores`·`abilityBonus`로 분리. 모든 화면은 period.js 값을 써서 같은 날짜는 같은 점수
3. 결제로 운을 직접 올리지 않음(유료 뽑기 부적 충전 50%)
4. 확률 공개, 위기 신호 시 109 안내, 의료·법률·투자 단정 금지
5. 생년월일·사주 원본은 기기에만. 공유는 띠·오행 비율·캐릭터 정보까지만
6. 사용자 응대는 한국어, 공식적이고 격려하는 톤

## 그림 제작 (이미지 생성 도구)
- 규격·프롬프트·이름 규칙: `docs/art-production-guide.md`. 원본은 `saju-app/assets/raw/`에 올라옴 → 배경(#00FF00/#FF00FF) 제거, 512·256 WebP 변환, 이미지가 있으면 사용·없으면 SVG 대체, 등급 효과·글자는 코드가 덧입힘
- 1차 시범: 호랑이 세트 43장, 복사용 시트 `docs/prompts/tiger-pilot.md` → 확정 후 12띠 확장
- 배경 제거 도구: `python3 -I saju-app/tools/chroma.py 입력 출력 [green|magenta] [크기]` (쥐 시험 그림으로 검증, `docs/prompts/chroma-test-rat.png`)
- 힉스필드 무제한은 웹사이트에서만 적용(API·CLI·MCP는 크레딧 차감, 나노바나나 프로 1장 2크레딧). 사용자는 윈도우라 Remote Control 불가 → 웹에서 생성 후 구글 드라이브 폴더로 전달받아 처리
- 구글 드라이브 업로드 폴더: 「12지신 강림 그림」(id `1_KYUmT0L1sS_Ysf38ccgx-Rk1NRdpFoy`) > 「호랑이 시범 세트」(id `17X6Ho-Qfm50zlIw9kWbqHf33kWNyN-Er`). `search_files`(parentId) → `download_file_content`로 가져오기

## 다음 할 일 후보
(완료: v0.16 수호신의 기억, v0.17 계절 한정 패키지, v0.18 질문형 운세 메뉴·탭 5개, v0.19 운의 층 엔진 통합, v0.20 타임라인 홈·사주 한 장 요약·전체 미리보기 갤러리, v0.20.1 말투 개편·운세 풀이·등급별 그림 차별화)
- **1순위: `docs/core-saju-review-plan.md` 로드맵** (~~v0.19 엔진 통합~~ ~~v0.20 타임라인 홈~~ 완료 → **다음: v0.21 기록함** → v0.22 이번 주 재물 흐름 → v0.23 신수 카드 → v0.24 전문가 보기)
- 사용성 개편 다음 단계: ② 모든 결과 화면 끝에 한 걸음 버튼 ③ 12지신 신수 카드(자체 카드 뽑기) ④ 7일 기능 소개 + 첫 주 게임 용어 감추기
- 해외판 튜토리얼과 다국어, 정식 앱 전환(React Native/Flutter + 서버)
