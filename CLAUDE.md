# 프로젝트 인수인계: 12지신 강림 (사주 × 부적 × 신수 육성 소셜 앱 프로토타입)

새 대화에서 이어서 작업할 때 이 파일부터 읽으세요. **마지막 작업(2026-11-02 밤 2)**: 12띠 그림 모두 반영 완료(띠당 진화 5 + 표정 8, `assets/char`·`assets/emo` 156장) + 미리보기 아티팩트 갱신. 그림 처리 도구 개선: 배경색 자동 판별(시트 지정과 달리 마젠타로 생성된 띠 대응), 테두리 실측 색상 거리로 크로마키(분홍 하트·초록 클로버·보라 한복 보존), `swap=calm:sleepy` 옵션(쥐·뱀은 12·13번이 뒤바뀌어 생성됨). 남은 것: 호랑이는 예전 도구로 처리해 06 smile 클로버가 흐림 → 원본 다시 받아 `ingest.py zodiac tiger`로 재처리하면 해결. 그 전 v0.28 내년 운세 카드 = 신년운세 구성(총평·키워드 → 분야별 별 → 사계절 → 꼭 기억할 달 → 행운 키트 → 다짐, 12달 막대는 운세 풀이로 이동, `yearcard.js`). 그 전: v0.27 홈 재구성 — 2027년(접힘) → 오늘(펼침) → 이달·올해(작은 창) → 「오늘의 미션 3가지」(이달의 실천·돌아보기·새 기능 열기, `daymission.js`). 그 전: 로드맵 v0.22 기록함 → v0.23 백업·이번 주 재물 흐름 → v0.24 신수 카드 → v0.25 전문가 보기·여러 명식 → v0.26 첫 7일까지 완료. 그 전: v0.21 홈 개편 — 첫 화면 = 2027년(내년) 운세·오늘(펼침)·올해 3장 + 「다음 할 일」 길잡이 퀘스트 9단계로 나머지 기능을 하나씩 엶(기획 `docs/home-quest-plan.md`). 그 전 작업: 12띠 그림 프롬프트 시트·드라이브 폴더·자동 처리 도구 준비 완료 → 사용자가 띠별 폴더에 1K 그림 13장씩 올리면 「그림 제작」 절의 처리 순서대로 반영.

## 위치
- 앱: `saju-app/` (빌드 없는 정적 웹, ES 모듈). 루트 `index.html`은 별개 프로젝트(일일계도상소) — 건드리지 않음
- 기획·조사 문서: `docs/` (**홈 개편: `docs/home-quest-plan.md`**, **최신 기획: `docs/core-saju-review-plan.md` — 핵심 사주 타임라인·엔진 통합·경쟁 앱 리뷰 분석·v0.19~ 로드맵**, 전략: `docs/strategy-v013.md`, 방향: `docs/kaiun-loop-direction.md`, 승천·가챠: `docs/ascension-gacha-report.md`, 소셜 설계: `docs/social-design.md`)
- 작업 브랜치: **최신 작업은 `ccr-c85c770a-b6ueyf`**(v0.16~ 그림 파이프라인까지, 아직 main에 병합 전). 새 세션이 다른 브랜치를 받으면 먼저 `git fetch origin ccr-c85c770a-b6ueyf && git merge origin/ccr-c85c770a-b6ueyf`로 최신 작업을 가져온 뒤 시작. (예전 브랜치 `claude/exciting-johnson-1f6o78`는 v0.15까지, PR #1로 main에 병합됨)
- 미리보기(Claude 아티팩트): slug `f5ff35d3-d121-45d3-8a5e-b1b6c7e1fffe`, URL https://claude.ai/artifact/XNrP2AFTcULKijQSe1xzC5
  - 갱신: `Artifact` 도구 — 먼저 `action:read`(url), 바뀐 파일은 `read`의 `paths`로 확인 후 `publish`(url, file_path=`saju-app/index.html`, files={"styles.css":..., "js/x.js":"saju-app/js/x.js"}). 예전 `publish_files` 도구는 더 이상 없음
  - 선언된 capability: `sample`(AI 대화), `room`(실시간), `db`+`user`(우편함). 새 capability는 **선언 먼저 → 코드 게시**

## 실행·테스트
- 로컬: `cd saju-app && python3 -m http.server 8000` → http://localhost:8000
- 테스트: `cd saju-app && npm test` (node 테스트 파일 26개(갤러리 테스트에 이미지 연결 검사 포함), 모두 통과 상태 유지)
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
| records.js | **기록함(v0.22)**: 날마다 본 운세 자동 기록(`logDay`, 120일), 다음 날 「어제 운세 맞았나요?」(`pendingFeedback`·`setFeedback`: 맞았어요·반반·아니었어요·건너뛰기, 첫 답 +2 EXP), 결과 저장(`addItem`: 질문 답·운세 풀이·신수 카드, 100개, 메모), 통계(맞았어요 비율·점수 높은/낮은 날 적중·연속 일수). 저장 `unmyeong2099.records`. 화면: 「어제 운세 맞았나요?」는 v0.27부터 오늘의 미션 ②, 내 수호신 > 📒 기록함(`renderRecords`), 결과 화면의 `saveBtnHTML` |
| wealthweek.js / backup.js | **v0.23**: 이번 주 재물 흐름(`weekWealth`: 재물 점수 7일·가장 좋은 날·결정적 행운 숫자 6개, 만 19세 미만 숨김, `SAFETY_LINES` 무작위 추첨 안내·☎1336, `BANNED_WORDS` 테스트) → 홈 「이번 주」 카드 안 `wealthWeekHTML`. 백업(`makeBackup`·`parseBackup`: `unmyeong2099.*`만, 파일 `zodiac12-backup-날짜.json` 또는 글자 복사, 가져오면 덮어쓰고 새로고침) → 기록함 맨 아래 `backupCardHTML` |
| cards.js | **12지신 신수 카드(v0.24)**: 60장(12지신 `CARD_ZODIAC` × 오행 `CARD_ELEMENT`), 모두 1/60, 질문 분야 6(`CARD_AREAS`) × 오행 문장, 한 장/세 장(지금·조언·앞으로), `drawReading`은 사람+날짜+질문+방식으로 결정(같은 날 다시 뽑아도 같은 카드), 용신·기신 카드 문장. 화면: 운세 보기 > 🃏 신수 카드(`renderCards`, 카드 그림은 `renderCharacterSVG`라 띠 그림이 들어오면 자동 사용), 결과는 기록함에 자동 저장(+2 EXP) |
| expert.js | **전문가 보기(v0.25)**: 지장간(`HIDDEN_STEMS`), 12운성(`twelveStage`), 공망(`gongmang`), 신살 6종(`sinsalOf`: 천을귀인·문창·역마·도화·화개·양인), 기둥표(`expertTable`), 계산 기준(`calcBasis`: 표준시·경도·자시·태양 황경, 서머타임 해는 직접 빼서 입력하라는 안내 — 엔진은 서머타임 미반영), 여러 명식(`makeChart`·`addChart`·`removeChart`, 20개, `unmyeong2099.charts`). 화면: 내 사주 맨 아래 `expertCardHTML`(켜고 끄기, 나/명식 고르기, 대운표). 내 경도 보정·자시를 바꾸면 `applyMyBasis`로 모든 화면 재계산 |
| firstweek.js | **첫 7일(v0.26)**: 가입일(`ensureStart`, EXP 300 이상이면 첫 주 건너뜀). 날마다 기능 소개 카드(`INTRO_DAYS`)는 v0.27에서 홈에서 빼고 미션 ③으로 합침(데이터만 남음). 첫 주에는 `plainTerms`로 EXP→성장 점수·Lv.N→성장 N. 용어는 `setupPlainTerms`의 MutationObserver가 화면 전체에서 한 번에 바꿈(새 화면에 EXP·Lv.를 써도 첫 주에는 자동으로 바뀜). 저장 `unmyeong2099.firstweek` |
| daymission.js | **오늘의 미션 3가지(v0.27)**: ① 이달의 실천(절기월 기간·테마 + 오늘의 액땜 미션 = `MISSION_KEY`, 완료 시 액막이 정화) ② 돌아보기(어제 기록 있으면 「어제 운세 맞았나요?」, 없으면 이달 좋은 날/오늘 근거를 하루씩 번갈아) ③ 새 기능 열기(길잡이 다음 단계, 다 열면 `ROTATION` 신수 카드·상담·질문·기록함). 셋 다 하면 +5 EXP + 내일 미리보기. 저장 `unmyeong2099.dmission`(14일, `openKey`로 그날 연 기능 기억). 화면: 홈 타임라인 아래 `missionCardHTML`, 클릭은 `[data-dm]` |
| yearcard.js | **신년(내년) 운세 카드(v0.28)**: `yearCard`(yearOf 값 그대로) → 그해 이름·키워드 3개(`YEAR_HEADLINE` 십신별), 분야별 별(`stars`: 75+★5·65+★4·55+★3·45+★2), 사계절 4칸(`seasonsOf`: 계절 평균 순위로 가장 좋은/쉬어 가는 계절), 꼭 기억할 달 3개(`keyMonths`: 좋은 달 2 + 조심할 달 1, 절기월 기간), 행운 키트(용신 색·수·방향 + 육합·삼합 띠), 다짐(`savePledge`, 그해 12월 `pledgeReviewDue` → 미션 ② 「다짐 돌아보기」). 12달 표는 운세 풀이 `monthsTableHTML`(내년·올해 탭). 저장 `unmyeong2099.pledge` |
| guide.js | **홈 길잡이(v0.21 → v0.27)**: 기능 소개 11단계(`GUIDE_STEPS`: next→week→ask→cards→draw→records→daewoon→chat→journey→compat→todo, 각 단계 `go`='home:구역' 또는 탭). v0.27부터 별도 카드 없이 미션 ③이 하루 하나씩 보여 줌와 각 단계가 여는 홈 구역, `showNextYear`(9월 이후·입춘 전에만 내년 카드), `isUnlocked`·`completeStep`·`setAll`(전체 보기). 저장 `unmyeong2099.guide` |
| ask.js | 운세 보기 질문형 메뉴판: 질문 10개(내 고민 우선), 답(점수·근거·팁·7일 흐름), 한 걸음 버튼 연결 |
| season.js | 계절 한정 패키지(꾸미기 세트는 `seasonSceneSVG` 계절 장면 11종 포함): 시즌 일정(명절 우선), 무료 트랙 미션·보상, 꾸미기 세트, 한정 소품·배경 효과 SVG (`unmyeong2099.season`) |
| chat.js | AI 수호신 대화(지시문·안전·오프라인 답변) |
| memory.js | 수호신의 기억: 일정·주제·사람·좋아하는 것 추출, 요약, 지난 일정 안부, 개인정보 제외 (`unmyeong2099.memory`) |
| realtime.js | 실시간 궁합방(room)·친구 우편함(db) 도우미 |
| story.js | 인스타 스토리 카드(캔버스) |
| assets.js / asset-manifest.js | 이미지 그림 목록(`asset-manifest.js`는 ingest.py가 자동 생성)·주소(`charImage`·`emoImage`, 오행별 파일 우선 → 띠 공통)·미리 불러오기(`preloadCharImages(띠)`, 스토리 카드용 data URL). 없으면 SVG. 6~14단계는 5단계 그림 + 코드 승천 효과 |
| app.js | 화면·상태·localStorage(`unmyeong2099.*` 키). 홈(v0.21) = 내년 카드(`tlNext`, 금색) + 「다음 할 일」(v0.21.1부터 내년 카드 바로 아래, `timelineHTML` 안) + 타임라인(잠긴 층은 숨김, `tlVisible`) + 「다음 할 일」(`guideCardHTML`) + 길잡이로 연 구역만(`renderToday`의 `sections`). 다른 화면이 잠긴 구역을 부르면 `ensureUnlocked`로 바로 엶. 운세 풀이에 「🎁 2027년」 탭(`readingFor('next')`). 홈 = **운의 타임라인**(`timelineHTML`: 오늘·이번 주·이달·올해·대운·타고난 나, 카드마다 근거·층 이동·한 걸음 버튼), 첫 가입 = `showSajuCard`(사주 한 장 요약) → `showSummon`, 🧪 `renderGallery`(내 수호신 > 전체 미리보기, `?gallery=1`로 바로 열림, 프로필이 없으면 저장하지 않는 견본 프로필 사용) |

## 설계 원칙 (지켜야 할 것)
1. 초보자 우선: 3단계 시작, 홈 = 내년(접힘)·오늘(펼침)·이달·올해(작은 창) + 「오늘의 미션 3가지」(v0.27). 새 기능은 홈에 바로 붙이지 말고 길잡이 단계(`guide.js` `GUIDE_STEPS`, 미션 ③이 하루 하나씩 엶)로 열 것. 주 탭 5개(오늘·운세 보기·상담·궁합·친구·내 수호신), 하위 화면은 `TAB_PARENT`·`SUBNAV`(app.js)로 묶음. 기능은 "질문 → 답 → 한 걸음 버튼 1개"로 연결
2. 점수 눈금(v0.21.1, 사용자 요청): 평균 60점대 중후반, 50점 밑은 드물게(오늘 약 1~3%) — `luck.js` `SCORE_BASE`·`GISIN_DELTA`·`CLASH_DELTA`, `period.js` `NEG_MOD_WEIGHT`로 조정, 분포는 `tests/period.test.mjs`가 검사. 정통 기본 흐름은 이 눈금 위에서 부풀리지 않고, 개운 반영은 "게임 요소"로 나란히 표시. 오늘 운세 `scores`는 정통값만, 게임 보너스는 `gameScores`·`abilityBonus`로 분리. 모든 화면은 period.js 값을 써서 같은 날짜는 같은 점수
3. 결제로 운을 직접 올리지 않음(유료 뽑기 부적 충전 50%)
4. 확률 공개, 위기 신호 시 109 안내, 의료·법률·투자 단정 금지
5. 생년월일·사주 원본은 기기에만. 공유는 띠·오행 비율·캐릭터 정보까지만
6. 사용자 응대는 한국어, 공식적이고 격려하는 톤

## 그림 제작 (이미지 생성 도구)
- **방식(2026-11-02 확정): 띠마다 대표 한복 1벌, 오행은 코드로 표현**(배경 빛 + 오른쪽 아래 오행 배지 `elementBadge`). 띠당 13장(진화 5 + 표정 8) × 12띠 + 공용(부적 상징 6·부적 종이 2·한정 소품 11·계절 장면 11) ≈ 186장. 나중에 `${띠}_s${단계}_${오행}` 파일을 추가하면 그 오행 사용자에게 우선 사용
- 프롬프트: 띠별 시트 `docs/prompts/zodiac/NN-{띠}.md`(목록 `README.md`, 대표 한복·배경색은 `saju-app/tools/zodiac_specs.json`), 공용 물건 수정본 `docs/prompts/tiger-pilot-redo.md`(사람 금지 강화). 사용자는 **1K(1024px)**로 생성
- 드라이브: 「12지신 강림 그림」 아래 띠별 폴더(id는 `saju-app/tools/drive_folders.json`, 호랑이 = 「호랑이 시범 세트」). 사용자가 시트 순서대로 생성해 올림(파일 이름은 힉스필드 기본 `hf_YYYYMMDD_HHMMSS_…`)
- **처리 순서**: ① `search_files`(parentId=띠 폴더, 한 쪽에 5·8장씩 나오니 pageToken으로 다음 쪽까지) ② `download_file_content`를 **한 장씩**(동시 호출 시 연결 끊김, 결과는 tool-results 파일로 저장됨 → base64 디코드) ③ `python3 -I saju-app/tools/ingest.py zodiac {띠} {원본폴더} [swap=calm:sleepy]`(배경색은 그림마다 자동 판별) → 생성 시각순으로 시트 01~13에 매칭(01=s2, 02~05=s1,s3,s4,s5, 06~13=표정), 배경 제거, `assets/char/{띠}_s{n}.webp`(768)·`assets/emo/{띠}_{표정}.webp`(512), `js/asset-manifest.js` 자동 갱신, 원본폴더에 `contact.jpg` ④ contact.jpg를 눈으로 확인(사람·글자 섞임, 순서) ⑤ `npm test` → 커밋 → 아티팩트에 새 webp·manifest 게시
- 드라이브 도구 한도: 약 6.3MB 넘는 파일은 받을 수 없음(1K면 문제없음)
- 들어간 그림: **12띠 전부** 진화 1~5 + 표정 8(`{띠}_s*.webp`, `{띠}_{표정}.webp`). 밝은 바탕 확인용으로 contact.jpg(어두운 바탕)와 함께 밝은 바탕 모음도 보면 외곽선·소품이 지워졌는지 잘 보임. 공용 물건: 깨끗한 것 보름달 등불·창포 비녀·별핀·송편 바구니(아직 앱 미연결), 장면 7장 받음(미연결), 장면 4장(064725·064828·064914·064921)은 큰 파일이라 미수령
- 배경 제거 단독 도구: `python3 -I saju-app/tools/chroma.py 입력 출력 [green|magenta] [크기]`
- 힉스필드 무제한은 웹사이트에서만(API·CLI·MCP는 크레딧 차감). 사용자는 윈도우라 Remote Control 불가

## 다음 할 일 후보
(완료: v0.28 신년운세 카드·다짐, v0.27 홈 재구성·오늘의 미션 3가지, v0.26 첫 7일 소개·게임 용어 감추기, v0.25 전문가 보기·여러 명식, v0.24 신수 카드, v0.23 백업·이번 주 재물 흐름, v0.22 기록함·어제 운세 확인, v0.21.1 점수 눈금 60점대·길잡이 카드 위로, v0.21 홈 길잡이·내년 운세, v0.16 수호신의 기억, v0.17 계절 한정 패키지, v0.18 질문형 운세 메뉴·탭 5개, v0.19 운의 층 엔진 통합, v0.20 타임라인 홈·사주 한 장 요약·전체 미리보기 갤러리, v0.20.1 말투 개편·운세 풀이·등급별 그림 차별화)
- **1순위: `docs/core-saju-review-plan.md` 5절 로드맵** (~~v0.19 엔진 통합~~ ~~v0.20 타임라인 홈~~ ~~v0.21 홈 길잡이~~ 완료 → ~~v0.22 기록함~~ ~~v0.23 백업·재물 흐름~~ ~~v0.24 신수 카드~~ ~~v0.25 전문가 보기~~ ~~v0.26 첫 7일~~ 완료 → 로드맵 끝. 다음 후보는 아래). 번호는 2026-11-02에 한 칸씩 밀어 정리함
- 사용성 개편 다음 단계: ② 모든 결과 화면 끝에 한 걸음 버튼
- 해외판 튜토리얼과 다국어, 정식 앱 전환(React Native/Flutter + 서버)
