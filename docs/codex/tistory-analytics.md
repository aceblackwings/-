# Codex 작업 지시서: 티스토리 유입 → 결과 도달 측정 (2026-11-22, Claude Code 작성)

## 목표
티스토리 블로그 글에서 들어온 사람이 **사주 결과 → 수호신 강림**까지 몇 명 가는지, **어느 글이 가장 많이 이어지는지** 센다.
- 개인을 알아볼 수 있는 정보는 하나도 보내지 않는다(생년월일·이름·사주 글자·IP 저장 금지). 「이 단계에 도달했다」는 사실과 유입 이름만 센다.
- 쿠키를 쓰지 않는다(개인정보처리방침 6절 「광고나 추적을 위한 쿠키를 쓰지 않습니다」를 그대로 지킬 수 있게).

## 현재 상태(Claude Code가 확인함)
- 코드 안에 분석 도구가 전혀 없다(`gtag`·`analytics`·`beacon`·`referrer`·`utm` 검색 결과 0).
- 배포 = Cloudflare Workers `zodiac12`(`wrangler.jsonc`), 진입점 `worker/index.js`. 지금은 `/api/pay/confirm`만 처리하고 나머지는 `env.ASSETS`(정적 `saju-app/`)로 넘긴다. `/api/` 아래 다른 주소는 404.
- 화면에 CSP 메타 태그 없음, 스크립트는 `saju-app/index.html`의 `js/app.js` 하나.

## 퍼널(세는 단계 3개)
| 이벤트 | 언제 | 넣을 곳 |
|---|---|---|
| `land` | 첫 화면이 열릴 때(세션당 1번) | `saju-app/js/app.js` 시작 부분(초기화 직후) |
| `saju` | 첫 가입 후 「사주 한 장 요약」이 뜰 때 | `app.js` `showSajuCard()` (약 4953번째 줄) |
| `summon` | 「수호신 강림」 화면이 뜰 때 | `app.js` `showSummon()` (약 4981번째 줄) |

`showSajuCard`·`showSummon`은 **처음 가입한 사람에게만** 뜬다 → 신규 사용자 퍼널로 그대로 쓰면 된다.

## 구현 안
### 1) 새 모듈 `saju-app/js/hit.js`
- `readSource(location)` : 주소의 `utm_source`·`utm_campaign`을 읽어 `sessionStorage`에 보관(없으면 `document.referrer`의 도메인이 `tistory.com`으로 끝나면 `src=tistory`, 그 밖은 `other`/`direct`). 값은 영문·숫자·`-_`만 남기고 40자로 자름.
- `hit(event)` : `navigator.sendBeacon('/api/hit', JSON.stringify({ e, src, c }))`. 실패해도 조용히 넘어감(try/catch).
- 보내지 않는 경우: 앱 안(`site.js inApp()` 참이면), `?gallery=1`, `localhost`, 같은 기기에서 같은 이벤트를 이미 보낸 경우(`localStorage` 키 `unmyeong2099.hit` 에 보낸 이벤트 이름만 기록 — `unmyeong2099.*` 규칙이라 백업에도 같이 들어감).
- 순수 함수(`readSource`, 값 다듬기, 보낼지 판단)는 DOM 없이 테스트할 수 있게 분리.

### 2) `worker/index.js`에 `POST /api/hit`
- 허용 이벤트 이름만 받음(`land`·`saju`·`summon`), 나머지 400. Origin 검사는 `handlePay`와 같은 방식.
- 저장 = **Workers Analytics Engine** 바인딩(`wrangler.jsonc`에 `"analytics_engine_datasets": [{ "binding": "HITS", "dataset": "zodiac12_hits" }]`)
  `env.HITS.writeDataPoint({ blobs: [e, src, c], indexes: [e] })` — IP·User-Agent는 넣지 않음.
- 바인딩이 없으면(로컬·테스트) 204만 돌려줌. 항상 204, 본문 없음, `Cache-Control: no-store`.
- `handleHit(request, env)`를 export 해서 테스트에서 가짜 `env.HITS`로 검사.
- Pages 방식 대비가 필요하면 `saju-app/functions/api/hit.js`도 같은 함수를 불러 씀(pay와 같은 구조).

### 3) 숫자 보기
- `docs/analytics.md`에 Analytics Engine SQL 예시를 남김(사용자가 Cloudflare 대시보드 또는 API로 실행):
  `SELECT blob2 AS src, blob3 AS campaign, blob1 AS event, SUM(_sample_interval) AS n FROM zodiac12_hits WHERE timestamp > NOW() - INTERVAL '7' DAY GROUP BY src, campaign, event ORDER BY campaign, event`
- 대시보드 화면은 이번 작업에 넣지 않음(나중에 Claude Code가 아티팩트로 만들 수 있음).

### 4) 약관
- `saju-app/tools/legal_pages.mjs` 개인정보처리방침에 한 줄 추가 후 다시 생성:
  「서비스 개선을 위해 화면 도달 횟수와 들어온 경로(예: 블로그 글 이름)를 셉니다. 생년월일·이름·IP 등 개인을 알아볼 수 있는 정보는 함께 보내지도 저장하지도 않으며, 쿠키를 쓰지 않습니다.」
- 토스 재심사 중이므로 결제·환불 문구는 건드리지 않음.

### 5) 테스트 `saju-app/tests/hit.test.mjs` (package.json `test` 스크립트 끝에 추가)
- `readSource`: utm 우선, 티스토리 referrer → `tistory`, 이상한 문자 제거·40자 자르기
- 보낼지 판단: 앱 안·gallery·localhost·이미 보낸 이벤트는 보내지 않음
- `handleHit`: 허용 이벤트만 기록, 다른 Origin 403, 보낸 값에 생년월일 형태(숫자 8자리 등)가 섞여도 blob에 남지 않음, 바인딩 없을 때 204
- 기존 `pay.test.mjs`의 worker 테스트가 그대로 통과하는지 확인

## 규칙(AGENTS.md·CLAUDE.md 요약)
- 브랜치 `codex/tistory-analytics`, 기본 브랜치 `claude/zhuge-liang-advice-window-e8ghwy`에서 시작, PR로 병합.
- 시작할 때 CLAUDE.md 맨 위 「진행 중」에 `[Codex · codex/tistory-analytics · 유입 측정 · worker/index.js, wrangler.jsonc, app.js(showSajuCard·showSummon·초기화 3곳만), js/hit.js, legal]` 적고 푸시. 끝나면 지움.
- `app.js`는 위 3곳에 `hit()` 호출만 넣고 다른 곳은 고치지 않음(큰 파일, Claude Code와 충돌 방지).
- 완료 = `cd saju-app && npm test` 전부 통과 + CLAUDE.md 「최근 버전」 맨 위에 `> **✅ v0.81(날짜, 사용자 「티스토리 유입·결과 도달 측정」, Codex)**` + 5개 넘으면 가장 오래된 것을 `docs/changelog.md` 맨 위로 + 모듈 지도 표에 `hit.js` 추가.

## 배포 후 사용자가 할 일
1. PR 병합 → 배포 확인 (Analytics Engine은 Workers 무료 요금제에서도 쓸 수 있음, 처음 쓰면 대시보드에서 켜기 안내가 나올 수 있음)
2. (선택) Cloudflare 대시보드 → Web Analytics에서 `12jisin.ockstar.com` 켜기 = 전체 방문·유입 경로 보조 지표
3. 티스토리 글 링크 형식: `https://12jisin.ockstar.com/?utm_source=tistory&utm_campaign=글이름` (글이름은 영문·숫자, 예: `2027-rabbit`)
