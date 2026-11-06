# 유료 부적 종이 v2 — 「보자마자 고급스럽다」 일러스트 부적 카드 (2026-11-06)

> **왜 다시 만드나**: v1(`paid-charm.md` 01·02)은 「한지 사진 + 가는 테두리」라 밋밋합니다. v2는 타로 아르카나 그림과 같은 **파스텔 스토리북 일러스트 + 금박 장식 테두리 + 12지신** 으로, 990원을 낸 순간 「와, 진짜 예쁘다」가 나오게 합니다.
> **첨부(참고 그림)**: 앱의 타로 그림 `assets/tarot/m10.webp`(12지신 수레바퀴 카드, 그림체·색감 기준) + 띠 그림 `{띠}_s3` 아무거나 1장(지신 얼굴 기준). 「같은 그림체, 같은 색감」이라고 함께 넣으세요.
> **비율·크기**: **2:3 세로, 1K**(848×1264 정도). 앱이 양옆을 3%씩 잘라 5:8로 씀 → **중요한 장식은 양옆 끝 3% 안쪽에**.
> **글자 금지**: 소원 글·所願成就·이름·날짜·인장은 **앱이 직접 씁니다**. 그림에 글자·한자·숫자·도장 금지.
> **비워 둘 자리(글자가 올라감)** — 그림 높이·너비 기준:
> - 위 8~22%: 제목 한자 4자(가운데) → **무늬 없이 밝고 고른 바탕**
> - 가운데 28~72%, 너비 15~85%: 소원 붓글씨(최대 5줄) → **가장 깨끗하게**, 아주 옅은 비침 무늬만
> - 아래 78~95%: 왼쪽 60%는 이름·날짜, 오른쪽 아래(너비 70~93%)는 인장 → **고른 바탕**
> - 꾸밈은 **바깥 테두리 띠(가장자리 약 9%)** 와 **맨 위 7%·맨 아래 6%** 에만
> **올리는 곳**: 드라이브 「12지신 강림 그림 › 포춘 기계」(지난번과 같은 폴더) 또는 새 폴더 「유료 부적」, 01 → 02 순서로.
> **넣기**: `python3 -I saju-app/tools/paidcharm_ingest.py 원본폴더 gold2 red2` → 앱이 v2 종이(`gold2`·`red2`)를 먼저 쓰고, v2일 때는 코드 테두리·모서리 장식을 빼고 구분선·반짝임만 얹음(그림 장식과 겹치지 않게).

| 순서 | id | 내용 | 비율 |
|---|---|---|---|
| 01 | gold2 | 소원 부적 — 상아·금박 한지 + 12지신 메달 테두리 + 일월오봉 + 모란·학 | 2:3 |
| 02 | red2 | 걱정 태우기 부적 — 다홍·장밋빛 한지 + 봉황 깃 불꽃 → 꽃잎 + 아기 해태 | 2:3 |

---

### 01 · 소원 부적 v2 (`gold2`)

```
A luxurious Korean wish talisman card, premium storybook illustration in exactly the same art style and soft pastel palette as the attached tarot card: clean thick soft outlines, gentle cel shading, dreamy glow, cute and elegant. Vertical 2:3 card that fills the whole image edge to edge.

FRAME (only in the outer 9% border band of the card): a thick ornate frame of shining polished gold leaf with real metallic highlights and fine engraved detail; large embossed golden cloud-scroll ornaments (Korean ununmun clouds) curling at all four corners; a thin inner band of soft pastel dancheong pattern (mint, coral pink, lavender, butter yellow) with tiny pearl dots. Along the left and right borders, twelve small round gold medallions evenly spaced, six on each side, each holding a tiny cute chibi face of one of the twelve zodiac animals (rat, ox, tiger, rabbit, dragon, snake on the left; horse, sheep, monkey, rooster, dog, pig on the right), same cute style as the attached character.

TOP (top 7% only): a small golden arch crest with a soft red sun disk over five tiny pastel mountain peaks (irworobongdo motif), two tiny white cranes flying beside it.
BOTTOM (bottom 6% only): soft pastel layered ocean waves in mint and lavender, pink lotus blossoms, and a small golden lucky pouch (bokjumeoni) with a red tassel at bottom center.

CENTER PANEL (everything inside the frame): smooth warm ivory and pale gold handmade hanji paper with visible soft mulberry fibers and a gentle golden sheen; only a very faint embossed peony-and-cloud watermark, almost invisible; a few tiny gold-leaf flakes near the panel edges only. The upper band (8% to 22% of the height), the large middle area (28% to 72% of the height) and the lower band (78% to 95% of the height) must stay clean, bright and empty for text added later.

IMPORTANT: absolutely no text, no letters, no Chinese characters, no numbers, no seals, no stamps, no signature, no watermark text, no people. Keep every ornament inside the border band, top crest and bottom wave band. Symmetrical composition, high detail, soft warm lighting, premium collectible card quality.
```

### 02 · 걱정 태우기 부적 v2 (`red2`)

```
A luxurious Korean protective talisman card for burning away worries, premium storybook illustration in exactly the same art style as the attached tarot card: clean thick soft outlines, gentle cel shading, dreamy glow, cute and elegant, but in a rich warm palette of vermilion red, rose pink and gold. Vertical 2:3 card that fills the whole image edge to edge.

FRAME (only in the outer 9% border band): a thick ornate frame of shining polished gold leaf with real metallic highlights and fine engraved detail; at the four corners, golden phoenix tail feathers that curl like flame-shaped cloud scrolls; along the left and right borders, delicate golden plum blossom branches with small pink-white blossoms and tiny glowing embers turning into petals.

TOP (top 7% only): a small golden crest with a glowing flame-colored wish jewel (yeouiju) held by two tiny golden cloud curls.
BOTTOM (bottom 6% only): soft gentle golden-orange flames along the bottom edge that turn into pink flower petals and small green sprouts rising upward (worries burning into flowers), and a tiny cute baby haetae guardian (round, fluffy, friendly, same cute style as the attached character) sitting at bottom center, smiling.

CENTER PANEL (everything inside the frame): rich deep vermilion red handmade hanji paper fading to darker crimson at the bottom, with visible lighter red mulberry fibers and a soft inner glow; only a very faint embossed peony-and-cloud watermark, almost invisible; a few tiny gold-leaf flakes near the panel edges only. The upper band (8% to 22% of the height), the large middle area (28% to 72% of the height) and the lower band (78% to 95% of the height) must stay clean and evenly colored for light gold and white text added later.

IMPORTANT: absolutely no text, no letters, no Chinese characters, no numbers, no seals, no stamps, no signature, no watermark text, no people, nothing scary, no big fire in the center. Keep every ornament inside the border band, top crest and bottom band. Symmetrical composition, high detail, soft warm lighting, premium collectible card quality.
```

---

**확인할 것(그림을 받은 뒤)**: ① 가운데·위·아래 글자 자리가 깨끗한지 ② 12지신 메달 순서·얼굴이 모두 다른지 ③ 글자·한자처럼 보이는 무늬가 없는지 ④ 양옆 끝 3%(잘리는 곳)에 메달이 걸리지 않는지. 어긋나면 그 그림만 다시 뽑습니다.
