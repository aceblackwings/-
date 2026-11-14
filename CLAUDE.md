# 프로젝트 인수인계: 12지신 강림 (사주 × 부적 × 신수 육성 소셜 앱 프로토타입)

새 대화에서 이어서 작업할 때 이 파일부터 읽으세요.

> **🤝 Codex와 함께 쓰기(2026-11-09 사용자 결정)** — Claude Code와 Codex가 같은 저장소에서 함께 작업함. 두 도구 모두 아래 규칙을 지킬 것.
> 1. **기록은 이 파일 하나**: Codex는 `AGENTS.md`를 먼저 읽지만, 그 파일은 「CLAUDE.md를 읽으라」는 안내와 공통 규칙만 둠. 최근 버전 기록·모듈 지도·설계 원칙은 여기(CLAUDE.md)에 적고, 오래된 버전 기록은 `docs/changelog.md`(새 것이 위)에 둠.
> 2. **브랜치 나누기**: 한 브랜치를 두 도구가 동시에 고치지 않음. Claude Code = `claude/…`, Codex = `codex/…` 브랜치. 시작 전 기본 브랜치 `claude/zhuge-liang-advice-window-e8ghwy`를 최신으로 받고, 끝나면 PR로 기본 브랜치에 병합(사용자가 「병합 커밋 만들기」).
> 3. **작업 표시**: 시작할 때 이 파일 맨 위 「진행 중」 줄에 `[도구 · 브랜치 · 작업 · 건드리는 파일]`을 적고 푸시, 끝나면 지움. 상대가 적어 둔 파일(특히 `saju-app/js/app.js`·`styles.css`처럼 큰 파일)은 그 작업이 병합될 때까지 고치지 않음.
> 4. **완료 기준**: `cd saju-app && npm test` 모두 통과 + 이 파일 맨 위에 `> **✅ v번호(날짜, 사용자 요청 요약, 작업한 도구)**` 기록 + 「최근 버전」이 5개를 넘으면 가장 오래된 것을 `docs/changelog.md` 맨 위로 옮김 + 새 모듈이면 「모듈 지도」 표에 추가. 버전 번호는 병합 순서대로(겹치면 나중 것이 올림).
> 5. **설계 원칙·말투 유지**: 아래 「설계 원칙」 1~7, 화면 글은 한국어·쉬운 말, 금지어 테스트, 생년월일은 기기에만. 결제로 운을 올리지 않음.
> 6. **Claude 쪽에만 있는 것**: 미리보기 아티팩트 게시, `sample`·`room`·`db` 기능, 구글 드라이브 그림 받기 — 이 작업은 Claude Code가 맡음. Codex는 그림이 필요하면 프롬프트(`docs/prompts/`)와 넣는 도구 사용법만 남김.
> 7. **역할 나누기(기본안, 사용자가 바꿀 수 있음)**: Codex = 출시 구조(Firebase 로그인·구매 기록 동기화·Capacitor 포장·웹 PG/인앱 결제·약관 페이지), Claude Code = 사주 엔진·운세 문장·화면 연출·그림 연결·미리보기.
>
> **진행 중**: (없음)

## 최근 버전 (최근 5개 · 그 전 기록은 `docs/changelog.md`)

> **✅ v0.74(2026-11-13, 사용자 결정 「앱 등록은 A안(1차 앱은 무료, 유료 부적·등불은 웹에서만) · 구글 플레이만 먼저, 애플은 나중」, Claude Code)**: **안드로이드 앱 포장** 새 폴더 `app/`(Capacitor 8, `capacitor.config.json` appId **`com.ockstar.zodiac12`**(바꿀 수 없음)·이름 「12지신 강림」·webDir `www`, `tools/copy-web.mjs` = `saju-app`을 `.assetsignore` 빼고 `www`로 복사, `@capacitor/app` 뒤로 가기, `android/` = targetSdk 36·versionName 0.74·versionCode는 `-PappVersionCode`·서명은 환경 변수 `ANDROID_KEYSTORE_PATH/PASSWORD`·`ANDROID_KEY_ALIAS/PASSWORD`, `tools/make_icons.py` = 용 지신 아이콘·적응형 아이콘·시작 화면·스토어 아이콘 512·그래픽 1024×500 → `docs/store/`). **빌드는 GitHub Actions** `.github/workflows/android.yml`(이 작업 환경은 dl.google.com이 막혀 안드로이드 도구 설치 불가): `claude/**`·`codex/**` 푸시(웹·앱·작업 흐름 파일이 바뀔 때)나 손 실행 → 웹 테스트 → `cap sync` → `bundleRelease`(AAB)·`assembleDebug`(시험 APK), versionCode = 실행 번호, 서명 키는 저장소 비밀 값 `ANDROID_KEYSTORE_BASE64`·`ANDROID_KEYSTORE_PASSWORD`(별칭 `upload`, 업로드 키는 사용자에게 파일로 전달, **저장소에 없음**). **앱 모드(A안)** `site.js inApp()`(Capacitor 네이티브 판별) → app.js `IN_APP`: `html.in-app` + `[data-web-only]` 숨김(CSS), 지신 탭 진열장 `charmShowcaseHTML` 없음, 한 줄 제안 `charmNudgeHTML`은 걱정 태우기만, `openCharmMaker`는 burn만, 부적 공방 링크·소원 벽 「소원 부적 만들러 가기」·걱정 씨앗 「소원으로 키워 볼까?」·복떡 창의 소원 부적 줄·읽기 화면 「어떻게 운영하나요?」·바닥글 환불 규정·상품 안내·광고 없는 무료 운세 숨김, 토스 `resumePay`·bfcache 처리 안 함, 안드로이드 뒤로 가기 `setupAppShell`(열린 창 닫기 → 하위 화면이면 부모 탭/오늘 → 오늘이면 「한 번 더 누르면 앱이 닫혀요」). 웹은 그대로. 안내 문서 **`docs/play-store.md`**(콘솔 순서·스토어 문구·데이터 안전·연령 등급·타겟층·테스터 모집 글·일정). 테스트 site 1 추가. 확인: `npm test` 통과, Playwright 375×667 + 가짜 Capacitor → 4탭 유료 입구 0·가격 글 0·바닥글 3개만·뒤로 가기(지신 → 오늘 → 두 번 눌러 닫힘)·오류 0, 웹은 지신 탭 유료 입구 4·가격 그대로. **남은 일(사용자)**: 구글 개발자 계정 · 저장소 비밀 값 2개 등록 → Actions 다시 실행 → AAB 받아 비공개 테스트 · 테스터 12명 이상 **11/27까지 14일 테스트 시작** → 12/11 프로덕션 신청. 2차 = 구글 플레이 인앱 결제, 애플은 나중.

> **✅ v0.73.1(2026-11-13, 사용자 「실제 결제 시험 — 카카오페이 HTTP 405 · 네이버페이 「지원되지 않는 간편결제 수단」 · 삼성페이·토스페이는 인증 뒤 「업체 사정으로 인해 결제를 일시 중지하였습니다」」, Claude Code)**: ① **카카오페이 405** = 결제창이 successUrl·failUrl로 **POST**로 돌아오는데 정적 파일은 GET만 받음 → `worker/index.js postToGet`: 페이지 주소로 온 POST·PUT 등은 폼(또는 JSON) 값을 주소 `?` 뒤로 옮겨 **303 GET**으로 다시 보냄(주소에 이미 있는 값 우선, 값 500자 제한), 그 뒤 기존 `parseReturn`·`resumePay` 그대로. ② 승인 실패 토스트에 **오류 코드**도 표시(`· 오류 코드 XXX`, 10초) → 원인 찾기용. ③ 코드 밖 원인(사용자 확인): 네이버페이 = 상점의 네이버페이 사용 심사·활성화 전(토스 오류 표의 「지원되지 않는 결제 수단」 계열), 삼성·토스페이 「업체 사정…일시 중지」 = 토스 오류 표에 없는 카드사·간편결제사 쪽 문구 → 카드사 가맹 심사 진행 중이거나 결제 수단이 아직 열리지 않은 상태로 보임 → 상점관리자 결제 내역(실패)·개발자센터 「라이브」 API 로그에서 오류 코드 확인 + 토스 고객센터 문의. 인증 뒤 승인 실패라 돈은 나가지 않음. 테스트 pay 1 추가(POST → 303). 확인: `npm test` 통과.

> **✅ v0.73(2026-11-13, 사용자 「토스페이먼츠 승인 메일 옴 → 다음 작업」, Claude Code)**: 내 상점 「라이브」 **API 개별 연동** 클라이언트 키로 교체 — `site.js PAY.tossClientKey` = `live_ck_c19xYLanYqVhbcHhjpj0hO3F8rnOqjoGzV`(예전 체험 상점 시험 키는 주석으로 남김) → `payMode()` = live, 결제 창의 「시험 결제 중」 문구 자동으로 사라짐. **시크릿 키 `live_sk_`는 사용자가 Cloudflare Workers `zodiac12` 「변수 및 비밀」 `TOSS_SECRET_KEY`에 직접(채팅·저장소 금지), 두 키의 짝이 다르면 승인 실패** → PR 병합(= 배포) 전에 시크릿 키부터 바꿀 것. `tools/launch_check.mjs`가 live 모드일 때 시크릿 키 확인 알림. **남은 일**: ① 본인 카드로 990원 실제 결제 → 상점관리자에서 취소까지 확인 + 간편결제 4개(삼성페이 계약 포함 여부 확인) ② 통신판매업 신고번호(`BIZ.mailOrderNo`, 상점관리자 구매안전서비스 이용확인증 → 정부24; 2027-01-01 일반과세자 전환 전 필요). 확인: `npm test` 통과.

> **✅ v0.72(2026-11-12, 사용자 「간편결제는 네이버 → 카카오 → 삼성/애플 → 토스 순서로, 금액 적힌 결제 창에 큰 버튼」, Claude Code)**: 토스 통합결제창은 간편결제 순서를 정할 수 없어(원문: `flowMode: DEFAULT`면 `easyPay` 무시) **우리 결제 창(`openCharmPay`)에 바로가기 4개**(2×2, 52px): `pay.js EASY_PAYS`·`easyPayOrder(ua, touch)` = 네이버페이 · 카카오페이 · 삼성페이(아이폰·아이패드 = 애플페이, `isAppleDevice`) · 토스페이 → 누르면 `goTossPay(kind, rec, ez)` → `tossRequest(..., easyPay)`가 `card: { flowMode: 'DIRECT', easyPay }`(자체창, 토스 화면 한 단계 건너뜀), 그 밖은 「💳 다른 카드로 결제하고 인장 찍기/불 붙이기」(통합결제창 그대로). 순서 근거 = 2025 조사(컨슈머인사이트 주이용률 네이버 20·삼성 18·카카오 12·토스 6%, 오픈서베이 최근 한 달 네이버 51.5·카카오 25.1·토스 13.2%) + 카카오톡 링크 유입. 결제 내역에 간편결제 이름 `ez`(승인 응답 `easyPay.provider`) 저장 → **출시 1~2달 뒤 실제 많이 쓴 순서로 다시 정렬**. 주의: 삼성페이는 토스 신청서 「선택」 → 계약에 없으면 결제 안 됨(사용자 확인 필요), 카카오페이는 내 상점 시험 키부터 시험 가능. CSS 「v0.72 간편결제 바로가기」. 테스트 pay 1 추가. 확인: `npm test` 통과, Playwright Galaxy S9+·iPhone 13 + 가짜 토스 SDK → 버튼 순서·`card.flowMode DIRECT/easyPay NAVERPAY`·가로 넘침 0·오류 0.

> **✅ v0.71.1(2026-11-12, 사용자 「시험 결제는 토스에 정상으로 찍힘 · 결제창 닫기/취소하면 「돈은 나가지 않았어요」 없이 인장 화면으로 · 동의 뒤 뒤로 가기 → 「이미 종료된 세션」 · 간편결제 첫 화면 순서」, Claude Code)**: ① 원인 = 토스트(z-index 20)가 의식·결제 창(`.evo-modal` 30) 뒤에 가려짐 → `.toast { z-index: 250 }`(styles.css 끝, 읽기 화면 200보다 위) + 돌아올 때 안내를 의식 창 안 tip에도(`openWishRitual`·`openLanternRitual` `opt.notice`). ② 결제창에서 브라우저 뒤로 가기는 토스가 failUrl로 보내지 않음(「이미 종료된 세션」은 토스 결제창 쪽 화면) → `resumePay`: 기다리는 주문이 있고 paymentKey가 없으면 `backToRitual(ABANDON_LINE)`(pay.js, 「결제를 마치지 않고 돌아오셨어요. 돈은 나가지 않았어요…」) = 주문 지우고 인장/심지 화면 + 안내, 페이지가 저장된 채 되살아나는 경우(bfcache)도 `pageshow` persisted → 열린 결제 창 닫고 `resumePay`. `failLine` 취소 문장에서 「인장」을 빼 등불에도 맞게. ③ 간편결제 순서: 토스 원문(결제창(구버전) SDK) 확인 결과 통합결제창(`flowMode: DEFAULT`)은 `easyPay`를 무시하고 순서를 정할 수 없음 → 바꾸려면 우리 결제 창에 간편결제 바로가기 버튼(`flowMode: DIRECT` + `easyPay` 코드 TOSSPAY·NAVERPAY·SAMSUNGPAY·KAKAOPAY·APPLEPAY·PAYCO) 또는 결제창형(위젯 키 gck, 어드민에서 순서 설정)으로 옮겨야 함 → **사용자 결정 대기**. 시험 체험 상점에는 SSG페이 등이 보이지만 실제 계약(SSG 제외)에서는 계약한 수단만 나옴. 테스트 pay 1 추가. 확인: `npm test` 통과, Playwright 375×667 실패 주소·뒤로 가기 두 경우 모두 인장 화면 안내 + 토스트가 창 위에 보임·기다리는 주문 지워짐·오류 0.

> **⏰ 출시 뒤 할 일(2026-11-05 사용자 요청 「웹·앱 등록 후 작업, 까먹지 않게 상기시켜 줘」) — 출시(목표 2026-12-22) 뒤 새 창을 열면 사용자에게 이 목록부터 먼저 알려 줄 것**: ① 매달 1일 「이달 이야기」 배달(2027년 운세 이번 달 부분 = 지신 밥 한 그릇 특식) ② 정통사주 책갈피 ③ 승천 시련(6단계 이후 진화 직전 3일짜리 작은 시련) ④ 기운 카드 도감 60장(12지신 × 오행, 모은 장수별 칭호·꾸밈) ⑤ 출시판 알림(아침·저녁 2회). 오늘의 운세·타로 재미 아이디어(아래 v0.53 「추천 아이디어」)도 사용자가 고른 것부터.

> **🚀 출시 결정 요약(2026-11-05~12, 자세한 내용은 `docs/changelog.md` 「출시 계획 문서 완성」)**: 목표 2026-12-22(동지) 출시, 계획 문서 `docs/launch-plan.html`. 사업자 = 개인 간이과세자(유니유통, 2027-01-01 일반과세자 전환 예정 → 통신판매업 신고 필요), 개발자 계정 = 애플·구글 개인 계정, **로그인 없음 · 생년월일은 기기에만**(서버로 보내지 않음), 가입 = 만 14세 이상, AI 상담 = 준비된 답변(오프라인)으로 출시. 웹 = https://12jisin.ockstar.com (Cloudflare Workers `zodiac12`), 결제 = 토스페이먼츠(소원 부적 990원 · 100일 등불 2,900원만), 앱 = 구글 플레이 먼저(1차 무료, 유료는 웹에서만), 애플은 나중.

> **브랜치 규칙(2026-11-03 PR #2로 정리)**: 저장소 기본 브랜치 `claude/zhuge-liang-advice-window-e8ghwy`에 v0.30까지 모든 작업이 들어 있다. 새 세션은 **기본 브랜치(또는 세션이 지정한 브랜치)에서 그대로 시작**하고, 버전 하나가 끝나면 **PR을 만들어 기본 브랜치에 병합**(사용자는 「병합 커밋 만들기」로 합침)한다. 기본 브랜치가 다시 뒤처지면 새 세션이 옛 CLAUDE.md를 읽게 되니, 버전이 끝날 때마다 병합을 잊지 말 것.

## 위치
- 앱: `saju-app/` (빌드 없는 정적 웹, ES 모듈). 루트 `index.html`은 별개 프로젝트(일일계도상소) — 건드리지 않음
- 기획·조사 문서: `docs/` (**최종 방향(2026-11-03): `docs/together-habit-direction.md` — 소중한 사람(짝꿍: 가족·친구·연인 누구나, 엄마·딸은 대표 예시일 뿐 한정 금지)과 함께 운을 습관으로 바꾸는 앱, 날씨→우산 문법, 결정 10가지, v0.30~ 로드맵, 9절 알림·서버(1단계 서버 없이 로컬 알림으로 출시 → 2단계 Firebase)**, **홈 개편: `docs/home-quest-plan.md`**, **최신 기획: `docs/core-saju-review-plan.md` — 핵심 사주 타임라인·엔진 통합·경쟁 앱 리뷰 분석·v0.19~ 로드맵**, 전략: `docs/strategy-v013.md`, 방향: `docs/kaiun-loop-direction.md`, 승천·가챠: `docs/ascension-gacha-report.md`, 소셜 설계: `docs/social-design.md`)
- 작업 브랜치: **기본 브랜치 `claude/zhuge-liang-advice-window-e8ghwy`가 최신**(PR #1 = v0.15, PR #2 = v0.16~v0.30 병합). 세션 지정 브랜치에서 작업 → 버전 끝날 때 PR로 기본 브랜치에 병합. (예전 작업 브랜치 `claude/exciting-johnson-1f6o78`·`ccr-c85c770a-b6ueyf`는 모두 병합 완료, 기록용)
- 미리보기(Claude 아티팩트): slug `f5ff35d3-d121-45d3-8a5e-b1b6c7e1fffe`, URL https://claude.ai/artifact/XNrP2AFTcULKijQSe1xzC5
  - 갱신: `Artifact` 도구 — 먼저 `action:read`(url), 바뀐 파일은 `read`의 `paths`로 확인 후 `publish`(url, file_path=`saju-app/index.html`, files={"styles.css":..., "js/x.js":"saju-app/js/x.js"}). 예전 `publish_files` 도구는 더 이상 없음
  - 선언된 capability: `sample`(AI 대화), `room`(실시간), `db`+`user`(우편함). 새 capability는 **선언 먼저 → 코드 게시**

## 실행·테스트
- 로컬: `cd saju-app && python3 -m http.server 8000` → http://localhost:8000
- 테스트: `cd saju-app && npm test` (node 테스트 파일 66개(갤러리 테스트에 이미지 연결 검사 포함), 모두 통과 상태 유지)
- 화면 확인: Playwright(`require('playwright')`, 크로미움 내장)로 스크린샷
- 디자인 확인: `http://localhost:8000/?gallery=1` (12지신 띠×14단계×성별×오행, 부적 6종×5등급×2테마, 이모티콘 8표정×스타일×등급, 한정 소품 11종)

## 모듈 지도 (`saju-app/js/`)
| 파일 | 역할 |
|---|---|
| saju.js | 만세력(태양 황경 절기), 사주 8글자, 오행, 신강/신약, 용신(억부 + 조후 `analyzeJohu`, v0.29), 희신, 십신, 한국 표준시 변천 |
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
| wealthweek.js / backup.js | **v0.23**(+ **v0.70 백업 안내** `backupNeed`·`markBackedUp`·`snoozeBackup`·`backupSummary`, 저장 `unmyeong2099.backupinfo`, 화면 app.js `backupCardHTML`·`backupNudgeHTML`·`saveBackupFile`, 테스트 `backupnudge.test.mjs`): 이번 주 재물 흐름(`weekWealth`: 재물 점수 7일·가장 좋은 날·결정적 행운 숫자 6개, 만 19세 미만 숨김, `SAFETY_LINES` 무작위 추첨 안내·☎1336, `BANNED_WORDS` 테스트) → 홈 「이번 주」 카드 안 `wealthWeekHTML`. 백업(`makeBackup`·`parseBackup`: `unmyeong2099.*`만, 파일 `zodiac12-backup-날짜.json` 또는 글자 복사, 가져오면 덮어쓰고 새로고침) → 기록함 맨 아래 `backupCardHTML` |
| cards.js | **12지신 신수 카드(v0.24)**: 60장(12지신 `CARD_ZODIAC` × 오행 `CARD_ELEMENT`), 모두 1/60, 질문 분야 6(`CARD_AREAS`) × 오행 문장, 한 장/세 장(지금·조언·앞으로), `drawReading`은 사람+날짜+질문+방식으로 결정(같은 날 다시 뽑아도 같은 카드), 용신·기신 카드 문장. 화면: 운세 보기 > 🃏 신수 카드(`renderCards`, 카드 그림은 `renderCharacterSVG`라 띠 그림이 들어오면 자동 사용), 결과는 기록함에 자동 저장(+2 EXP) |
| expert.js | **전문가 보기(v0.25)**: 지장간(`HIDDEN_STEMS`), 12운성(`twelveStage`), 공망(`gongmang`), 신살 6종(`sinsalOf`: 천을귀인·문창·역마·도화·화개·양인), 기둥표(`expertTable`), 계산 기준(`calcBasis`: 표준시·경도·자시·태양 황경, 서머타임 해는 직접 빼서 입력하라는 안내 — 엔진은 서머타임 미반영), 여러 명식(`makeChart`·`addChart`·`removeChart`, 20개, `unmyeong2099.charts`). 화면: 내 사주 맨 아래 `expertCardHTML`(켜고 끄기, 나/명식 고르기, 대운표). 내 경도 보정·자시를 바꾸면 `applyMyBasis`로 모든 화면 재계산 |
| firstweek.js | **첫 7일(v0.26)**: 가입일(`ensureStart`, EXP 300 이상이면 첫 주 건너뜀). 날마다 기능 소개 카드(`INTRO_DAYS`)는 v0.27에서 홈에서 빼고 미션 ③으로 합침(데이터만 남음). 첫 주에는 `plainTerms`로 EXP→성장 점수·Lv.N→성장 N. 용어는 `setupPlainTerms`의 MutationObserver가 화면 전체에서 한 번에 바꿈(새 화면에 EXP·Lv.를 써도 첫 주에는 자동으로 바뀜). 저장 `unmyeong2099.firstweek` |
| easymode.js | **쉬운 모드(v0.31)**: 추천 나이, 켜기·끄기, 사주 용어 쉬운 말 사전(`EASY_TERMS`·`easyTerms`·`hasEasyTerms`), 대신 켜 주기 링크(`easyLinkQuery`·`parseEasyLink`·`acceptLink`·`linkAskText`). 화면은 app.js `easyHomeHTML`·`easySettingsHTML`·`handleEasyLink`·`applyEasyClass`, CSS `html.easy` |
| relations.js | **v0.37**: 합·충·형·파·해·원진, 합화 `analyzeHwa`, `natalRelations`·`incomingRelations`·`REL_INFO` |
| charmcare.js | **부적 돌보기(v0.38)**: 성장 `growEquipped`·세트 `pairType`·`fiveDone`·바치기 `offerable`·`offerValue`·장착 대사 `equipLine` |
| kaiun.js | **개운 반영(v0.40)**: `kaiunPower`·`kaiunFor`·`kaiunLine`·`fieldKaiunSentence`·`withKaiun` |
| retro.js / hourguess.js | **v0.41**: 지난 일 맞히기 `retroQuestions`·`retroSummary` / 시간 모름 시주 추정 `guessHours`·`HOUR_QUESTIONS` |
| ilju.js / natal.js | **v0.39**: 60일주론 `buildIlju` / 십성 성향 `tenGodProfile`·기둥 자리별 `pillarReadings` |
| johu.js / verify.js | **v0.35**: 120 조후표·처방 문장 / 전문가 검증 세트(질문지·비교·기준값 맞추기, 도구 `tools/verify.mjs`) |
| note.js | **수호신의 쪽지(첫 화면)**: `buildNote`·`markNote`·`weekStamps`·`stampRarity`·`AREA_CHARM`, 주간 편지 `weeklyLetter`, 이야기 `buildStories`·`STORY_STEPS`, 다음 달 열쇠 `monthStamps` |
| booklet.js | **첫 화면(2026-11-03)**: 신년운세 책자 `buildBooklet`(총운 7구역 + 분야 6개, 가족운 포함), 오늘의 운세 `todayLetter`(수호신 편지 + 세 가지 질문) |
| gyeokguk.js | **격국(v0.36)**: `analyzeGyeok`·`qualityOf`·`GYEOK_PROFILE`·`strengthMission`·`gyeokSummary`. 화면 `gyeokCardHTML`(내 사주) |
| josa.js / yearcheck.js | **v0.44**: 조사 붙이기·맞춤법 검사 `josa`·`josaProblems` / 한 해 조심할 점·참고할 점 `yearChecks`·`pickChecks`·`samjaeOf`·`checkLine` |
| storybook.js / storyreport.js / todaystory.js | **v0.50 이야기로 읽는 사주**: 문장 묶음·쉬운 말 바꾸기 `plainText` / 상세판·정통사주 본문 장 `yearStoryChapters`·`lifeStoryChapters`·`monthStory` / 오늘의 이야기 `todayStory`·공감 기록 |
| premium.js / shop.js | **v0.46 유료 상세 풀이**: 그해 상세판 `buildPremiumYear`·평생 정통사주 `buildLifeReport`·궁합 상세 `buildCompatReport`·`PRODUCTS`·`premiumTeaser` / 구매 기록 `priceOf`·`grant`·`owns`·`yearKey`·`compatKey`. 화면은 app.js `premiumYearOfferHTML`·`lifeOfferHTML`·`compatOfferHTML`·`openPay`·`openReader`, CSS `.hanji` |
| habit.js | **날씨→우산(v0.30)**: 마음 날씨·우산 미션 90개·긍정 해석·문장 금지어·주간 연속·상담 안내. 미션 ①의 내용 공급 |
| jisin.js | **v0.52 지신 밥 주기 + v0.53 두 번째 지신**(`recommendSecond`·`adoptSecond`·`secondPoints`·`secondStage`·`duoScene`): `BOWLS`·`DAY_POINTS`·`STAGE_POINTS`·`feed`·`seedFood`·`todayBowls`·`stageForPoints`·`growthOf`·`heightCm`·`decorCount`·`emotesUnlocked`·`conditionOf`·`feedLine`. 화면 app.js `feedJisin`·`bowlsHTML`·`jisinGrowHTML`·`decorWrap`·`openGrowthPreview` |
| wish.js / coordi.js / burn.js | **v0.57**: 소원 부적 `attachWish`·`dueWish`·`fulfill`·`postpone`·`wallOf`·`trimCollection` / 데일리 코디 `WARDROBE`·`coordiHearts`·`saveDay`·`claimStreak` / 걱정 태우기 `burnable`·`burnResult`·`makeGrid`·`stepFire`(저장 안 함). 화면 app.js `wishFormHTML`·`wishDueHTML`·`wishWallHTML`·`coordiHTML`·`coordiWrap`·`burnHTML`·`openBurn` |
| flowstory.js | **v0.59 4단계 나의 흐름 요약**: `weekStory`·`yearStory`·`decadeStory`(이번 주 1천·올해 2천·10년 3천 자 이내, 다른 화면과 문장 겹침 0). 요약판은 storyreport.js `yearSummary`·`textsOf`, 상세판 겹침 빼기는 premium.js `finish(skip)`·`mendChapters` |
| cookie.js / dailyhabit.js / santong.js | **v0.59**: 포춘 쿠키 `todayTodo`·`cookieTiles` / 나만의 습관 2가지 `checkTarget`·`checkHabit`·`recommendHabits` / 산통 점괘 `drawYear`·`santongCard`. 화면 app.js `cookieCardHTML`·`habitsCardHTML`·`santongHTML`·`openCharmPay` |
| site.js / pay.js | **v0.65 웹 출시**(v0.72 간편결제 바로가기 `EASY_PAYS`·`easyPayOrder`, v0.71 멱등키 `confirmIdemKey`·승인 실패 시 결제 조회·기기 구매자 번호 `makeCustomerKey`)(v0.68 안내 페이지 `legal/free.html` 「광고 없는 무료 운세」): 사업자 정보·결제 설정 `BIZ`·`PAY`·`payMode`·`fillBiz`·`missingBiz` / 토스페이먼츠 결제 `makeOrder`·`tossRequest`·`parseReturn`·`checkReturn`·`confirmPayment`·`failLine`. 화면 app.js `openCharmPay`·`goTossPay`·`resumePay`·`commitPaidCharm`, 승인 함수 `functions/api/pay/confirm.js`, 약관 `legal/`(생성기 `tools/legal_pages.mjs`) |
| `app/` (저장소 루트) | **v0.74 구글 플레이 앱**: Capacitor 8 포장(`capacitor.config.json`·`tools/copy-web.mjs`·`tools/make_icons.py`·`android/`), 빌드 = `.github/workflows/android.yml`, 앱 판별 `site.js inApp()` → app.js `IN_APP`·`setupAppShell`, 안내 `docs/play-store.md` |
| sound.js | **v0.66 효과음·짧은 음악**: `sfx`·`jingle`·`unlockSound`·`setSoundEnabled`·`soundOn`·`toggleSound`(저장 `unmyeong2099.sound`). 화면 app.js `setupSound`·`paintSoundBtn`, 머리줄 `#btn-sound` |
| lantern.js | **v0.64 100일 소원 등불·걱정 태우기 무료** + **v0.69 연등 띄우기** `LANTERN_STEPS`·`lanternPlan`·`letterStates`·`lotusOf`·`petalLine`·`floatLine`(화면 app.js `openLanternRitual`·`ltSceneHTML`·`ltEnvelopesHTML`·`ltLotusHTML`): `makeLantern`·`lanternDay`·`lanternStage`·`lanternLine`·`letterDue`·`lanternLetter`·`pray`·`keepLantern`·`canBurnToday`. 화면 app.js `lanternHTML`·`openCharmMaker` 상품 고르기·`openWishRitual` 인장 결제 |
| paidcharm.js | **v0.60 유료 부적**: 종이 `paidCharmSVG`·`charmLayout`·`sealChars`, 의식 상수 `RITUAL_STEPS`·`STAMP_BUZZ`, 걱정 씨앗 `plantSeed`·`seedToAsk`·`answerSeed`·`seedStage`, 배경화면 `drawWallpaper`, 결제 창 `PAY_GETS`. 화면 app.js `openWishRitual`·`saveWallpaper`·`wishMidHTML`·`seedAskHTML`·`seedGardenHTML` |
| cookieplus.js | **v0.61 포춘 쿠키 1부**: 지신 한마디 `cookieReaction`·`REACT`·`tierOf` / 절기·명절 `specialOf`·`TERMS24`·`HOLIDAYS6` / 황금 쿠키 `isGolden`·`GOLD_NOTE`. 화면 app.js `cookieInfo`·`cookieCardHTML`·`crackCookie`·`SHAPE_SVG` |
| omen.js | **v0.54 오늘의 작은 예언·내일 맛보기**: `omenOf`·`checkable`·`markOmen`·`markShown`·`omenStats`·`markPeek`·`peekedFor`·`tomorrowTeaser`·`shiftDay`. 화면 app.js `omenHTML`·`peekHTML`·`fortuneOn` |
| diary.js / scratch.js / oheng.js | **v0.55~0.56**: 지신의 기록 `buildDiary`·`logVisit`·`markRead` / 행운 긁기 `scratchTiles`·`markScratched`·`clearedRatio` / 내 오행 채우기 `ohengGuide`·`roleOf`(v0.56, 라디오는 삭제). 화면 app.js `diaryHTML`·`diaryFacts`·`scratchHTML`·`initScratch`·`ohengCardHTML` |
| dailycard.js | **v0.43 오늘의 기운 카드**: `drawKiCard`·`todayKiCard`·`lackElements`·`pickElement`·`pickRarity`·`stageForDays`·`nextStage`·`kiCardText`·`DAY_STAGES`·`LACK_RATE` |
| tarot.js / todayfive.js / tteok.js | **v0.42**: 12지신 타로 `TAROT_DECK`·`shuffleDeck`·`readTarot` / 오늘 5분야 `fiveScores`(30~96 넓히기) / 복떡·할 일 3가지·두루마리 잠금 `visit`·`doTask`·`isOpen`·`spend`·`buy` |
| daymission.js | **오늘의 미션 3가지(v0.27)**: ① 이달의 실천(v0.30부터 오늘의 우산)(절기월 기간·테마 + 오늘의 액땜 미션 = `MISSION_KEY`, 완료 시 액막이 정화) ② 돌아보기(어제 기록 있으면 「어제 운세 맞았나요?」, 없으면 이달 좋은 날/오늘 근거를 하루씩 번갈아) ③ 새 기능 열기(길잡이 다음 단계, 다 열면 `ROTATION` 신수 카드·상담·질문·기록함). 셋 다 하면 +5 EXP + 내일 미리보기. 저장 `unmyeong2099.dmission`(14일, `openKey`로 그날 연 기능 기억). 화면: 홈 타임라인 아래 `missionCardHTML`, 클릭은 `[data-dm]` |
| yearcard.js | **신년(내년) 운세 카드(v0.28)**: `yearCard`(yearOf 값 그대로) → 그해 이름·키워드 3개(`YEAR_HEADLINE` 십신별), 분야별 별(`stars`: 75+★5·65+★4·55+★3·45+★2), 사계절 4칸(`seasonsOf`: 계절 평균 순위로 가장 좋은/쉬어 가는 계절), 꼭 기억할 달 3개(`keyMonths`: 좋은 달 2 + 조심할 달 1, 절기월 기간), 행운 키트(용신 색·수·방향 + 육합·삼합 띠), 다짐(`savePledge`, 그해 12월 `pledgeReviewDue` → 미션 ② 「다짐 돌아보기」). 12달 표는 운세 풀이 `monthsTableHTML`(내년·올해 탭). 저장 `unmyeong2099.pledge` |
| guide.js | **홈 길잡이(v0.21 → v0.27)**: 기능 소개 11단계(`GUIDE_STEPS`: next→week→ask→cards→draw→records→daewoon→chat→journey→compat→todo, 각 단계 `go`='home:구역' 또는 탭). v0.27부터 별도 카드 없이 미션 ③이 하루 하나씩 보여 줌와 각 단계가 여는 홈 구역, `showNextYear`(9월 이후·입춘 전에만 내년 카드), `isUnlocked`·`completeStep`·`setAll`(전체 보기). 저장 `unmyeong2099.guide` |
| ask.js | 운세 보기 질문형 메뉴판: 질문 10개(내 고민 우선), 답(점수·근거·팁·7일 흐름), 한 걸음 버튼 연결 |
| season.js | 계절 한정 패키지(꾸미기 세트는 `seasonSceneSVG` 계절 장면 11종 포함): 시즌 일정(명절 우선), 무료 트랙 미션·보상, 꾸미기 세트, 한정 소품·배경 효과 SVG (`unmyeong2099.season`) |
| chat.js | AI 수호신 대화(지시문·안전·오프라인 답변) |
| memory.js | 수호신의 기억: 일정·주제·사람·좋아하는 것 추출, 요약, 지난 일정 안부, 개인정보 제외 (`unmyeong2099.memory`) |
| realtime.js | 실시간 궁합방(room)·친구 우편함(db) 도우미 |
| story.js | 인스타 스토리 카드(캔버스) |
| assets.js / asset-manifest.js | 이미지 그림 목록(`CHAR_FILES`·`EMO_FILES`·`SCENE_FILES`·`CHARM_FILES`·`ITEM_FILES`, 계절 장면 `sceneImage`·`preloadScene`, 부적 `charmImage`, 소품 `itemImage`)(`asset-manifest.js`는 ingest.py가 자동 생성)·주소(`charImage`·`emoImage`, 오행별 파일 우선 → 띠 공통)·미리 불러오기(`preloadCharImages(띠)`, 스토리 카드용 data URL). 없으면 SVG. 6~14단계는 5단계 그림 + 코드 승천 효과 |
| app.js | 화면·상태·localStorage(`unmyeong2099.*` 키). 홈(v0.21) = 내년 카드(`tlNext`, 금색) + 「다음 할 일」(v0.21.1부터 내년 카드 바로 아래, `timelineHTML` 안) + 타임라인(잠긴 층은 숨김, `tlVisible`) + 「다음 할 일」(`guideCardHTML`) + 길잡이로 연 구역만(`renderToday`의 `sections`). 다른 화면이 잠긴 구역을 부르면 `ensureUnlocked`로 바로 엶. 운세 풀이에 「🎁 2027년」 탭(`readingFor('next')`). 홈 = **운의 타임라인**(`timelineHTML`: 오늘·이번 주·이달·올해·대운·타고난 나, 카드마다 근거·층 이동·한 걸음 버튼), 첫 가입 = `showSajuCard`(사주 한 장 요약) → `showSummon`, 🧪 `renderGallery`(내 수호신 > 전체 미리보기, `?gallery=1`로 바로 열림, 프로필이 없으면 저장하지 않는 견본 프로필 사용) |

## 설계 원칙 (지켜야 할 것)
1. 초보자 우선(v0.43: 주 탭 4개 오늘·타로·궁합·지신, 펼침은 오늘 점수·기운 카드뿐이고 나머지는 `foldHTML`로 접음 — 새 기능도 접힌 줄로 넣을 것): 3단계 시작, 홈 = 내년(접힘)·오늘(펼침)·이달·올해(작은 창) + 「오늘의 미션 3가지」(v0.27). 새 기능은 홈에 바로 붙이지 말고 길잡이 단계(`guide.js` `GUIDE_STEPS`, 미션 ③이 하루 하나씩 엶)로 열 것. 주 탭 5개(오늘·운세 보기·상담·궁합·친구·내 수호신), 하위 화면은 `TAB_PARENT`·`SUBNAV`(app.js)로 묶음. 기능은 "질문 → 답 → 한 걸음 버튼 1개"로 연결
2. 점수 눈금(v0.21.1, 사용자 요청; v0.42부터 첫 화면 「오늘 5분야」만 `todayfive.js`로 30~90점대로 넓혀 보여 줌): 평균 60점대 중후반, 50점 밑은 드물게(오늘 약 1~3%) — `luck.js` `SCORE_BASE`·`GISIN_DELTA`·`CLASH_DELTA`, `period.js` `NEG_MOD_WEIGHT`로 조정, 분포는 `tests/period.test.mjs`가 검사. 정통 기본 흐름은 이 눈금 위에서 부풀리지 않고, 개운 반영은 "게임 요소"로 나란히 표시. 오늘 운세 `scores`는 정통값만, 게임 보너스는 `gameScores`·`abilityBonus`로 분리. 모든 화면은 period.js 값을 써서 같은 날짜는 같은 점수
3. 결제로 운을 직접 올리지 않음(유료 뽑기 부적 충전 50%)
4. 확률 공개, 위기 신호 시 109 안내, 의료·법률·투자 단정 금지
5. 생년월일·사주 원본은 기기에만. 공유는 띠·오행 비율·캐릭터 정보까지만(공개 카드는 궁합 계산용으로 일간·일지·용신까지 포함 — 2026-11-03 사용자 결정. 생년월일은 절대 넣지 않음)
6. 사용자 응대는 한국어, 공식적이고 격려하는 톤
7. (2026-11-03) **날씨→우산 문법**: 모든 운세 출력 = 근거 → 긍정 해석 → 행동 1개(5분 이내) → 확인·보상. 경고 문장 단독 금지, 금지어(나쁜 날·최악·불길·흉 단독). 숫자는 부풀리지 않고 해석과 행동만 바꿈

## 그림 제작 (이미지 생성 도구)
- **방식(2026-11-02 확정): 띠마다 대표 한복 1벌, 오행은 코드로 표현**(배경 빛 + 오른쪽 아래 오행 배지 `elementBadge`). 띠당 13장(진화 5 + 표정 8) × 12띠 + 공용(부적 상징 6·부적 종이 2·한정 소품 11·계절 장면 11) ≈ 186장. 나중에 `${띠}_s${단계}_${오행}` 파일을 추가하면 그 오행 사용자에게 우선 사용
- **다시 뽑기·추가 시트(2026-11-03)**: `docs/prompts/redo-2026-11-03.md` — **A1~A3·B1~B5·C 계절 장면·D 공용 R01~R15 모두 반영 완료(2026-11-03)**. A 진화 3장(토끼·원숭이 s5 한복 색 바뀜, 닭 s3 그림자), B 표정 5장(가장자리 잘림: rabbit_excited·rabbit_thanks·rat_love·rooster_love·dog_excited), C 계절 장면 4장(6.3MB 초과분 1K 재생성), D 공용 R01~R15. 다시 뽑은 그림은 띠 폴더 14번째 파일로 오므로 ingest 대신 `chroma.py`로 해당 칸만 교체
- 프롬프트: 띠별 시트 `docs/prompts/zodiac/NN-{띠}.md`(목록 `README.md`, 대표 한복·배경색은 `saju-app/tools/zodiac_specs.json`), 공용 물건 수정본 `docs/prompts/tiger-pilot-redo.md`(사람 금지 강화). 사용자는 **1K(1024px)**로 생성
- 드라이브: 「12지신 강림 그림」 아래 띠별 폴더(id는 `saju-app/tools/drive_folders.json`, 호랑이 = 「호랑이 시범 세트」). 사용자가 시트 순서대로 생성해 올림(파일 이름은 힉스필드 기본 `hf_YYYYMMDD_HHMMSS_…`)
- **처리 순서**: ① `search_files`(parentId=띠 폴더, 한 쪽에 5·8장씩 나오니 pageToken으로 다음 쪽까지) ② `download_file_content`를 **한 장씩**(동시 호출 시 연결 끊김, 결과는 tool-results 파일로 저장됨 → base64 디코드) ③ `python3 -I saju-app/tools/ingest.py zodiac {띠} {원본폴더} [swap=calm:sleepy]`(배경색은 그림마다 자동 판별) → 생성 시각순으로 시트 01~13에 매칭(01=s2, 02~05=s1,s3,s4,s5, 06~13=표정), 배경 제거, `assets/char/{띠}_s{n}.webp`(768)·`assets/emo/{띠}_{표정}.webp`(512), `js/asset-manifest.js` 자동 갱신, 원본폴더에 `contact.jpg` ④ contact.jpg를 눈으로 확인(사람·글자 섞임, 순서) ⑤ `npm test` → 커밋 → 아티팩트에 새 webp·manifest 게시
- 드라이브 도구 한도: 약 6.3MB 넘는 파일은 받을 수 없음(1K면 문제없음)
- 들어간 그림: **12띠 전부** 진화 1~5 + 표정 8(`{띠}_s*.webp`, `{띠}_{표정}.webp`). 밝은 바탕 확인용으로 contact.jpg(어두운 바탕)와 함께 밝은 바탕 모음도 보면 외곽선·소품이 지워졌는지 잘 보임. **계절 장면 11장 연결 완료**(`assets/scene/{시즌키}.webp`, 640폭: 입동·동지·설날·대보름·춘분·단오·하지는 드라이브 064626~064813, 입춘·칠석·추분·추석은 사용자가 채팅으로 1024 정사각 재전송). 꾸미기 세트(`season.effect`)를 켜면 `character.js`가 `sceneImage`로 320×400 전체 배경(`xMidYMid slice`)을 깔고 SVG 장면·배경막 대신 씀, 그림 속 달이 있으면 코드 달(`seasonEffectSVG` noGlow) 생략, 스토리 카드는 `preloadScene`으로 data URL. 공용 물건 전부 연결: 부적 상징 6·종이 2(호랑이 시범 세트 폴더 2026-11-03 024127~024530), 계절 소품 11(R09~R15 = 024545~024843 + 어제분 보름달 등불 064420·창포 비녀 064504·별핀 064522·송편 바구니 064605)
- 배경 제거 단독 도구: `python3 -I saju-app/tools/chroma.py 입력 출력 [green|magenta] [크기]`
- 힉스필드 무제한은 웹사이트에서만(API·CLI·MCP는 크레딧 차감). 사용자는 윈도우라 Remote Control 불가

## 다음 할 일
- **사용자 쪽(출시 준비)**: 구글 개발자 계정 · 저장소 비밀 값 `ANDROID_KEYSTORE_BASE64`·`ANDROID_KEYSTORE_PASSWORD` 등록 → Actions 다시 실행 → AAB 비공개 테스트 · 테스터 12명 이상 **11/27까지 14일 테스트 시작** → 12/11 프로덕션 신청 (v0.74)
- **결제 마무리**: 본인 카드 990원 실제 결제 → 취소 확인, 간편결제 4개(네이버페이 심사·삼성페이 계약·「업체 사정…일시 중지」 원인) 확인, 통신판매업 신고번호 `BIZ.mailOrderNo` (v0.73·v0.73.1)
- **2차**: 구글 플레이 인앱 결제, 애플 출시, 파일 백업 다시 켜기(`showBackup()` → true, 앱 안 저장 방식으로 재설계)
- **출시 뒤**: 위 「⏰ 출시 뒤 할 일」 목록부터 사용자에게 알릴 것
- 옛 후보 목록(로드맵 v0.19~v0.36 시절)은 `docs/changelog.md` 맨 아래
