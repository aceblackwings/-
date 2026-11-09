# 100일 소원 등불 그림 — 「2,900원이 아깝지 않은」 등불 카드 (2026-11-09)

> **목표**: 홈의 「🏮 100일 소원 등불」 카드(지금은 남색 바탕 + 🏮 이모지)를 **밤하늘 등불 축제 그림 + 날마다 밝아지는 진짜 등불**로 바꿉니다. 사기 전에 보는 지신 탭 진열장의 「🏮 100일 등불 2,900원」 카드와 등불 만들기 창에도 같은 그림(01 바탕 + 05 완주 등불)을 보여 줘 「이건 사고 싶다」가 나오게 합니다.
> **그림체 기준(첨부)**: 앱의 타로 그림 `assets/tarot/m18.webp`(달토끼, 밤 장면) + `m10.webp`(금박 장식). 프롬프트 앞에 「같은 그림체, 같은 색감」이라고 함께 넣으세요.
> **크기**: 모두 **1K**. 01은 3:2 가로, 02~05는 1:1 정사각.
> **글자 금지**: 소원 글·날짜·D-day는 앱이 씁니다. 그림 안에 글자·한자·숫자·도장 금지.
> **올리는 곳**: 드라이브 「12지신 강림 그림」 아래 새 폴더 **「100일 등불」**에 01 → 05 순서대로.
> **넣기(Claude Code가 함)**: 01은 그대로 잘라 `assets/lantern/bg.webp`로, 02~05는 초록 배경을 지워(`tools/chroma.py … green`) `assets/lantern/{stage1,stage2,stage3,kept}.webp`로 넣습니다. 등불은 1~33일 = stage1, 34~66일 = stage2, 67~99일 = stage3, 100일 완주 = kept. 10칸 밝기 막대·빛 번짐은 지금처럼 코드로 함께 올라가 날마다 조금씩 더 밝아집니다.

| 순서 | id | 내용 | 비율 | 배경 |
|---|---|---|---|---|
| 01 | bg | 카드 바탕 — 달밤 연못 위로 작은 등불들이 떠오르는 장면, 오른쪽은 글자 자리로 비움 | 3:2 | 그림 그대로 |
| 02 | stage1 | 막 불을 붙인 등불(1~33일) — 작은 불씨, 은은한 빛 | 1:1 | 초록 |
| 03 | stage2 | 따뜻하게 밝아진 등불(34~66일) — 연꽃잎이 벌어지기 시작 | 1:1 | 초록 |
| 04 | stage3 | 활짝 핀 등불(67~99일) — 금빛 연꽃, 빛 고리, 꽃잎 반짝임 | 1:1 | 초록 |
| 05 | kept | 100일 완주 등불 — 12지신 메달이 둘러싼 금빛 연등, 가장 화려하게 | 1:1 | 초록 |

**왜 이렇게 나누나**: 처음 산 날 바로 「예쁘다」(01 + 02), 한 달·두 달 뒤 등불 모양이 실제로 바뀌는 보상(03·04), 100일을 채우면 소원 벽에 걸리는 「완주 기념품」(05). 2,900원은 그림 한 장이 아니라 **100일 동안 자라는 등불**을 사는 것으로 느끼게 합니다.

---

### 01 · 카드 바탕 (`bg`, 3:2 가로)

```
A dreamy Korean lantern festival night scene, premium storybook illustration in exactly the same art style and palette as the attached tarot cards: clean soft outlines, gentle cel shading, magical glow, cute and elegant. Horizontal 3:2 image that fills the whole frame edge to edge.

Scene: a calm moonlit lotus pond at night. Deep indigo and violet sky (#2b2a4a to #3d2f52) with a soft lavender gradient near the horizon, a big pale gold full moon in the upper left, faint stars and tiny sparkles. Silhouettes of elegant hanok rooftops with curved eaves and a small stone bridge far in the background on the left. On the water, pink and white lotus flowers and lily pads with gentle golden reflections. Dozens of tiny glowing paper lanterns (red, coral, peach, gold) floating up from the pond into the sky, mostly on the LEFT 45% of the image, getting smaller and fainter as they rise. Soft drifting light particles.

IMPORTANT LAYOUT: the LEFT 40% holds the moon, rooftops and the densest lanterns. The RIGHT 55% must be calm, darker, evenly colored night sky and water with only a few very faint distant lantern dots, so white and gold text can be placed on top later. The bottom 30% is calm dark water with soft reflections. Keep a clear empty area in the lower-left quarter (about 30% wide, 45% tall) where a large lantern image will be placed later.

Absolutely no text, no letters, no Chinese characters, no numbers, no people, no animals. Warm, hopeful, luxurious mood, high detail.
```

### 02 · 등불 1단계 (`stage1`, 1:1, 1~33일)

```
A single cute Korean silk lantern (cheongsachorong style mixed with a lotus lantern), premium storybook illustration in exactly the same art style as the attached tarot cards: clean thick soft outlines, gentle cel shading, cute and elegant. Square 1:1 image, the lantern centered and filling about 70% of the height.

The lantern: a round hexagonal lantern of soft coral-red silk with pale gold ribs and a small gold top cap shaped like a cloud scroll, hanging from a short gold cord with a tiny knot (maedeup); a soft peach-and-gold tassel at the bottom. Small closed lotus petals in pale pink wrap around the lower half like a bud. Inside, a small warm flame — just lit, gentle and modest, a soft orange glow only around the lantern. Two or three tiny floating sparkles.

Background: a flat, solid, pure chroma-key green (#00FF00) with no gradient, no shadow, no glow spilling onto the background. The lantern must not contain any green color.
Absolutely no text, no letters, no Chinese characters, no numbers, no people.
```

### 03 · 등불 2단계 (`stage2`, 1:1, 34~66일)

```
The same cute Korean silk lotus lantern as before (same shape, same coral-red silk, same gold ribs, cloud-scroll gold cap, gold cord with maedeup knot and peach-gold tassel), premium storybook illustration in exactly the same art style as the attached tarot cards. Square 1:1 image, lantern centered, about 72% of the height.

Growth: the flame inside is now bright and warm, the silk glows golden-orange from within, and the pale pink lotus petals around the lower half have begun to open halfway. Small golden embroidered cloud patterns are visible on the glowing silk. A soft round warm halo hugs the lantern edge, and five or six tiny golden sparkles float around it.

Background: a flat, solid, pure chroma-key green (#00FF00) with no gradient, no shadow, no glow spilling onto the background. The lantern must not contain any green color.
Absolutely no text, no letters, no Chinese characters, no numbers, no people.
```

### 04 · 등불 3단계 (`stage3`, 1:1, 67~99일)

```
The same cute Korean silk lotus lantern as before (same shape, coral-red silk, gold ribs, cloud-scroll gold cap, gold cord with maedeup knot), now in its most beautiful blooming form, premium storybook illustration in exactly the same art style as the attached tarot cards. Square 1:1 image, lantern centered, about 75% of the height.

Growth: the lantern shines radiantly with warm golden light; the silk shows shimmering gold-leaf peony and cloud embroidery; the lotus petals around it are fully open, layered pink and white with shining gold edges, like the lantern is sitting inside a blooming golden lotus. A thin golden ring of light circles the lantern, small pink petals and golden star sparkles float upward around it, and the tassel is now a rich double tassel of gold and coral with tiny pearl beads.

Background: a flat, solid, pure chroma-key green (#00FF00) with no gradient, no shadow, no glow spilling onto the background. The lantern must not contain any green color.
Absolutely no text, no letters, no Chinese characters, no numbers, no people.
```

### 05 · 100일 완주 등불 (`kept`, 1:1)

```
A magnificent celebratory Korean golden lotus lantern, the final completed form after 100 days of wishing, premium collectible storybook illustration in exactly the same art style as the attached tarot cards and the attached zodiac character: clean thick soft outlines, gentle cel shading, cute, elegant and luxurious. Square 1:1 image, everything centered, filling about 85% of the frame.

The lantern: the same lantern family as before (coral-red silk lotus lantern with gold ribs and cloud-scroll gold cap), now glowing brilliant gold-white from within, sitting in a fully bloomed multi-layered lotus of pink, white and polished gold leaf. Around it, a circular golden ring of twelve small round gold medallions, evenly spaced like a clock, each holding a tiny cute chibi face of one zodiac animal in order clockwise from the top: rat, ox, tiger, rabbit, dragon, snake, horse, sheep, monkey, rooster, dog, pig. Two small golden cloud-scroll curls and two tiny white cranes at the left and right of the ring. Soft rays of warm light, pink petals and golden star sparkles bursting gently outward. Celebratory, proud, joyful mood.

Background: a flat, solid, pure chroma-key green (#00FF00) with no gradient, no shadow, no glow spilling onto the background. Nothing in the image may be green.
Absolutely no text, no letters, no Chinese characters, no numbers, no seals, no people.
```

---

**받은 뒤 확인할 것**: ① 02·03·04가 **같은 등불**로 보이는지(모양·색이 같고 밝기·꽃잎만 달라야 함 — 다르면 02를 첨부해 03·04를 다시 뽑기) ② 01의 오른쪽 글자 자리가 고르게 어두운지, 왼쪽 아래에 등불 자리가 비어 있는지 ③ 05의 12지신 얼굴이 모두 다르고 순서가 맞는지 ④ 그림 어디에도 글자·한자처럼 보이는 무늬가 없는지 ⑤ 등불에 초록색이 섞이지 않았는지(배경 지울 때 같이 지워짐).
