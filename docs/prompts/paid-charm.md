# 유료 부적 종이 2장 + 황금 쿠키 1장 프롬프트 시트 (v0.60)

> **지금도 앱은 그림 없이 동작합니다.** 금박 한지·붉은 한지는 코드로 그린 종이(결·금박 조각)를 씁니다. 그림이 들어오면 그 종이로 바뀝니다.
> **비율**: 01·02는 **2:3 세로**(앱이 5:8로 가운데를 자름), 03은 1:1 · 모두 **1K**.
> **글자 금지**: 종이 위의 글(소원·걱정 붓글씨, 所願成就·消災降福, 이름·날짜, 인장)은 **앱이 직접 씁니다**. 종이 그림에는 글자·한자·도장·무늬 기호가 없어야 합니다.
> **가운데는 비워 둠**: 가운데 70%는 글이 올라갈 자리라 무늬 없이 고른 종이 결만.
> **올리는 곳**: 드라이브 「12지신 강림 그림」 아래 새 폴더 **「유료 부적」**에 01~02 순서대로. 03은 「포춘 기계」 폴더에.
> **넣기**: `python3 -I saju-app/tools/paidcharm_ingest.py 원본폴더 gold red` → `saju-app/assets/paidcharm/{gold,red}.webp` + `js/paidcharm-manifest.js` 자동.
> 03 황금 쿠키: `python3 -I saju-app/tools/fortune_ingest.py 원본폴더 cookie_gold` (1부 「황금 쿠키」 작업 때 연결, 확률 **10번에 한 번** — 사용자 결정 2026-11-06).

| 순서 | id | 내용 | 비율 | 배경 |
|---|---|---|---|---|
| 01 | gold | 소원 부적 금박 한지 | 2:3 | 종이가 꽉 참 |
| 02 | red | 태우기 부적 붉은 한지 | 2:3 | 종이가 꽉 참 |
| 03 | cookie_gold | 황금 포춘 쿠키(닫힌 모양) | 1:1 | 초록 |

### 01 · 금박 한지 (`gold`)

```
Flat top-down scan of a single sheet of handmade Korean hanji paper filling the entire image edge to edge, no background visible, no table, no shadow. The paper is warm pale gold: soft cream-yellow fibers with visible long mulberry fibers and gentle uneven thickness, scattered tiny real gold-leaf flakes (more near the edges, very few in the center), a faint warm golden sheen. A thin double border printed near the edges: an outer gold line and an inner thin vermilion red line, with tiny round gold dots at the four corners. The central 70% of the sheet is plain paper texture only. IMPORTANT: absolutely no text, no letters, no Chinese characters, no seals, no stamps, no symbols, no drawings, no people, no watermark. Soft even lighting, high detail, photographic paper texture.
```

### 02 · 붉은 한지 (`red`)

```
Flat top-down scan of a single sheet of handmade Korean hanji paper filling the entire image edge to edge, no background visible, no table, no shadow. The paper is deep vermilion red fading to darker crimson at the bottom, with visible long mulberry fibers in lighter red, gentle uneven thickness, scattered tiny gold-leaf flakes near the edges. A thin double border near the edges: an outer gold line and an inner thin pale-gold line, with tiny round gold dots at the four corners. The central 70% of the sheet is plain paper texture only. IMPORTANT: absolutely no text, no letters, no Chinese characters, no seals, no stamps, no symbols, no flames, no drawings, no people, no watermark. Soft even lighting, high detail, photographic paper texture.
```

### 03 · 황금 포춘 쿠키 (`cookie_gold`) — 「포춘 기계」 02번 쿠키 그림을 함께 첨부

```
Clean game object illustration, soft cel shading with gentle gradients, clean thick dark plum outlines, cute and cozy. Plain solid bright pure chroma-key green background filling the whole image, nothing else in the background. IMPORTANT: absolutely no people, no text, no letters, no numbers, no Chinese characters, no watermark, no frame, no shadow on the ground. Object: the same closed fortune cookie as the attached image, same shape and angle, but made of shining polished gold with a warm glossy highlight, a few tiny sparkle stars floating around it (sparkles must not touch the edges), centered, fully visible with about 12% empty margin.
```
