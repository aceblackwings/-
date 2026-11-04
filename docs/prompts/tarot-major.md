# 타로 메이저 아르카나 22장 프롬프트 시트 (v0.43.1)

> 비율 **2:3 세로(예: 1024×1536)** · 1K. 그림 속 글자·숫자·사람이 보이면 다시 뽑아 주세요. 카드 이름과 로마 숫자는 앱이 카드 아래쪽에 붙입니다(그래서 아래 12%는 비워 둠).
> 주인공 지신이 나오는 카드는 그 띠의 **진화 3단계 그림**(`saju-app/assets/char/{띠}_s3.webp` 또는 드라이브 원본)을 참조 이미지로 첨부하면 얼굴·한복이 앱과 똑같이 나옵니다.
> **순서대로 0번부터 21번까지** 만들어 드라이브 「12지신 강림 그림」 아래 새 폴더(예: 「타로 아르카나」)에 올려 주세요. 파일 이름(생성 시각) 순서로 0~21번에 자동으로 맞춥니다.
> 넣기: `python3 -I saju-app/tools/tarot_ingest.py 원본폴더` (일부만 다시: `… 원본폴더 13` → 13번부터) → `assets/tarot/m{번호}.webp` + `js/tarot-manifest.js` 자동 갱신 → 원본폴더 `contact.jpg`로 순서 확인 → `npm test`.

| 번호 | 카드 | 주인공 | 첨부 |
|---|---|---|---|
| 0 | 바보 (The Fool) | 원숭이 | `monkey_s3` |
| 1 | 마법사 (The Magician) | 쥐 | `rat_s3` |
| 2 | 여사제 (The High Priestess) | 뱀 | `snake_s3` |
| 3 | 여황제 (The Empress) | 돼지 | `pig_s3` |
| 4 | 황제 (The Emperor) | 용 | `dragon_s3` |
| 5 | 교황 (The Hierophant) | 소 | `ox_s3` |
| 6 | 연인 (The Lovers) | 양 | `sheep_s3` |
| 7 | 전차 (The Chariot) | 말 | `horse_s3` |
| 8 | 힘 (Strength) | 토끼 | `rabbit_s3` |
| 9 | 은둔자 (The Hermit) | 개 | `dog_s3` |
| 10 | 운명의 수레바퀴 (Wheel of Fortune) | 12지신 모두 | 없음 |
| 11 | 정의 (Justice) | 호랑이 | `tiger_s3` |
| 12 | 매달린 사람 (The Hanged Man) | 원숭이 | `monkey_s3` |
| 13 | 변화 (Change (Death)) | 뱀 | `snake_s3` |
| 14 | 절제 (Temperance) | 용 | `dragon_s3` |
| 15 | 유혹 (Temptation (The Devil)) | 쥐 | `rat_s3` |
| 16 | 탑 (The Tower) | 돼지 | `pig_s3` |
| 17 | 별 (The Star) | 소 | `ox_s3` |
| 18 | 달 (The Moon) | 토끼 | `rabbit_s3` |
| 19 | 태양 (The Sun) | 말 | `horse_s3` |
| 20 | 심판 (Judgement) | 닭 | `rooster_s3` |
| 21 | 세계 (The World) | 양 | `sheep_s3` |

### 00 · 바보 (The Fool)
- 첨부: 원숭이 진화 3단계 그림 `monkey_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby monkey guardian spirit with warm caramel-brown fur, a light peach face and ears, a long curled tail, wearing a mustard-yellow jeogori jacket with a white collar band, olive trousers and a red ribbon tie, stepping happily toward the edge of a soft pastel cliff at sunrise, carrying a small bojagi cloth bundle tied to a stick over the shoulder, a white butterfly fluttering beside it, mountains and clouds far below, carefree joyful expression.
```

### 01 · 마법사 (The Magician)
- 첨부: 쥐 진화 3단계 그림 `rat_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby mouse guardian spirit with soft lavender-grey fur, a pale cream belly and muzzle, pink inner ears and soft pink cheeks, a long thin tail, wearing a sky-blue jeogori jacket with a white collar band, navy trousers and a lemon-yellow ribbon tie, standing behind a low wooden table, one paw raising a calligraphy brush toward the sky and the other pointing to the ground, on the table: a brass coin (yeopjeon), a celadon cup, a folding fan and a small wooden wand, an infinity-shaped ribbon of light floating above its head, roses and lilies around, confident smile.
```

### 02 · 여사제 (The High Priestess)
- 첨부: 뱀 진화 3단계 그림 `snake_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby snake standing upright in a cute chibi way, round head with a tiny topknot guardian spirit with smooth spring-green scales with a pale yellow belly, soft pink cheeks, the tail curled neatly behind, wearing a lavender-purple jeogori jacket with a white collar band, deep violet trousers and a pale yellow ribbon tie, sitting calmly between two pillars, one dark plum and one cream white, holding a rolled hanji scroll, a crescent moon at its feet, a curtain with pomegranate pattern behind, a quiet lake and night sky, gentle knowing smile.
```

### 03 · 여황제 (The Empress)
- 첨부: 돼지 진화 3단계 그림 `pig_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby piglet guardian spirit with soft pink skin, a round pink snout, small triangle ears with rosy inner ears, a tiny curly tail, wearing an apricot-peach jeogori jacket with a white collar band, rose-red trousers and a sky-blue ribbon tie, wearing a small floral crown, sitting on soft silk cushions in a golden wheat field, a heart-shaped cushion with a Venus-like flower symbol, pomegranates and peonies around, a gentle waterfall and forest behind, warm generous smile.
```

### 04 · 황제 (The Emperor)
- 첨부: 용 진화 3단계 그림 `dragon_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby dragon with two small golden antlers and a short soft mane guardian spirit with smooth jade-teal scales with a pale cream belly, a fluffy light mint mane, a short curled tail with a small tuft, wearing a deep royal-blue jeogori jacket with a white collar band, navy trousers and a golden ribbon tie, wearing a small golden crown, sitting on a stone throne decorated with ram heads, holding a golden scepter and a small orb, majestic mountains behind, dignified yet kind expression.
```

### 05 · 교황 (The Hierophant)
- 첨부: 소 진화 3단계 그림 `ox_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby ox calf with two small rounded horns guardian spirit with creamy beige fur with soft brown patches, a pale pink nose, small rounded ears with peach inner ears, wearing a forest-green jeogori jacket with a white collar band, dark brown trousers and a golden ribbon tie, dressed as a gentle scholar teacher with a tall soft hat, sitting between two pillars, raising one hoof in blessing, holding a small temple bell, two crossed golden keys at its feet, two tiny baby animals (a chick and a kitten-like small cloud spirit) listening respectfully, warm wise smile.
```

### 06 · 연인 (The Lovers)
- 첨부: 양 진화 3단계 그림 `sheep_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: two lamb guardian spirits with very fluffy cloud-white wool, a soft peach face, pink inner ears and rosy cheeks, one in a sky-mint jeogori jacket with a white collar band, cream trousers and a pink ribbon tie and the other in a matching lavender hanbok, standing face to face holding paws on a bridge made of flying magpies (ojakgyo) over a starry pastel sky, a red thread of fate gently tying their pinkies, a big sun and peach blossoms above, shy happy blush.
```

### 07 · 전차 (The Chariot)
- 첨부: 말 진화 3단계 그림 `horse_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby pony guardian spirit with warm chestnut-brown fur, a cream muzzle, a fluffy dark brown mane and tail, small rounded ears, wearing a tangerine-orange jeogori jacket with a white collar band, chocolate-brown trousers and a cream ribbon tie, standing proudly in a small golden chariot with a star-patterned canopy, pulled by two tiny cloud spirits (one cream white, one plum), a walled town behind, determined bright smile, moving forward.
```

### 08 · 힘 (Strength)
- 첨부: 토끼 진화 3단계 그림 `rabbit_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby rabbit with long upright ears guardian spirit with snow-white fluffy fur, pink inner ears, rosy cheeks, a small round cotton tail, wearing a soft pink jeogori jacket with a white collar band, plum-purple trousers and a mint-green ribbon tie, wearing a flower wreath, gently petting the head of a big fluffy friendly haetae (Korean mythical lion-dog guardian, cream and mint, curly mane) that is calm and smiling, an infinity-shaped ribbon of light over the rabbit's head, a sunny meadow, tender brave expression.
```

### 09 · 은둔자 (The Hermit)
- 첨부: 개 진화 3단계 그림 `dog_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby puppy with floppy ears guardian spirit with golden-tan fur with a cream muzzle and chest, floppy ears, a fluffy curled tail, wearing a navy-blue jeogori jacket with a white collar band, sand-beige trousers and a sunny-yellow ribbon tie, wearing a long cozy grey travel cloak over the hanbok, standing alone on a snowy mountain top at night, holding up a glowing hexagonal lantern with a star inside, leaning on a wooden staff, calm thoughtful expression.
```

### 10 · 운명의 수레바퀴 (Wheel of Fortune)
- 첨부: 없음

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Scene: a large ornate golden wheel floating among pastel clouds, the twelve Korean zodiac guardian spirits in tiny chibi form (mouse, ox, tiger, rabbit, dragon, snake, pony, lamb, monkey, rooster chick, puppy, piglet) each in a colorful hanbok sitting around the rim of the wheel like riders of a ferris wheel, waving happily, a golden sphinx-like cloud cat on top, four tiny guardian beasts in the four corners (blue dragon, red phoenix, white tiger, black turtle), joyful spinning motion.
```

### 11 · 정의 (Justice)
- 첨부: 호랑이 진화 3단계 그림 `tiger_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby tiger cub guardian spirit with warm orange fur with dark brown stripes, a cream-white muzzle and belly, peach-colored inner ears and soft pink cheeks, short striped tail, wearing a coral-red jeogori jacket with a white collar band, deep crimson trousers and a golden-yellow ribbon tie, sitting upright on a throne between two pillars, holding balanced golden scales in one paw and a straight calligraphy brush raised like a sword in the other, a purple curtain behind, calm fair expression.
```

### 12 · 매달린 사람 (The Hanged Man)
- 첨부: 원숭이 진화 3단계 그림 `monkey_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby monkey guardian spirit with warm caramel-brown fur, a light peach face and ears, a long curled tail, wearing a mustard-yellow jeogori jacket with a white collar band, olive trousers and a red ribbon tie, hanging upside down by one foot from a living tree branch with leaves (the T-shaped tree), arms relaxed behind its back, a soft golden halo glow around its head, peaceful content smile, seeing the world differently, flowers below.
```

### 13 · 변화 (Change (Death))
- 첨부: 뱀 진화 3단계 그림 `snake_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby snake standing upright in a cute chibi way, round head with a tiny topknot guardian spirit with smooth spring-green scales with a pale yellow belly, soft pink cheeks, the tail curled neatly behind, wearing a lavender-purple jeogori jacket with a white collar band, deep violet trousers and a pale yellow ribbon tie, gently shedding a translucent old skin that turns into many colorful butterflies flying away, a white flag with a flower emblem, a sunrise between two towers on the horizon, a river flowing, peaceful renewing mood (not scary at all).
```

### 14 · 절제 (Temperance)
- 첨부: 용 진화 3단계 그림 `dragon_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby dragon with two small golden antlers and a short soft mane guardian spirit with smooth jade-teal scales with a pale cream belly, a fluffy light mint mane, a short curled tail with a small tuft, wearing a deep royal-blue jeogori jacket with a white collar band, navy trousers and a golden ribbon tie, with small soft angel-like cloud wings, one foot on land and one foot in a calm stream, pouring shimmering water between two celadon jars in a graceful arc, irises growing by the water, a gentle path leading to a sunrise over mountains, serene smile.
```

### 15 · 유혹 (Temptation (The Devil))
- 첨부: 쥐 진화 3단계 그림 `rat_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby mouse guardian spirit with soft lavender-grey fur, a pale cream belly and muzzle, pink inner ears and soft pink cheeks, a long thin tail, wearing a sky-blue jeogori jacket with a white collar band, navy trousers and a lemon-yellow ribbon tie, sitting on a pile of sweets, gold coins and shiny trinkets, loosely wrapped in a playful candy-striped ribbon that it could easily slip out of, a cute mischievous tiny imp-shaped cloud with little horns above holding a candle, a sly but cute smile, pastel night (playful, not evil).
```

### 16 · 탑 (The Tower)
- 첨부: 돼지 진화 3단계 그림 `pig_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby piglet guardian spirit with soft pink skin, a round pink snout, small triangle ears with rosy inner ears, a tiny curly tail, wearing an apricot-peach jeogori jacket with a white collar band, rose-red trousers and a sky-blue ribbon tie, surprised with round eyes, holding onto a little paper umbrella as it floats down safely from a tall pagoda tower whose roof is struck by a pastel lightning bolt, small stones and golden sparks falling like confetti, clouds below cushioning the fall, surprised but safe mood.
```

### 17 · 별 (The Star)
- 첨부: 소 진화 3단계 그림 `ox_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby ox calf with two small rounded horns guardian spirit with creamy beige fur with soft brown patches, a pale pink nose, small rounded ears with peach inner ears, wearing a forest-green jeogori jacket with a white collar band, dark brown trousers and a golden ribbon tie, kneeling by a clear pond under a night sky with one big eight-pointed star and seven small stars (the Altair herdsman star), pouring water from two celadon jars, one into the pond and one onto the land, a little bird on a tree, hopeful peaceful expression.
```

### 18 · 달 (The Moon)
- 첨부: 토끼 진화 3단계 그림 `rabbit_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby rabbit with long upright ears guardian spirit with snow-white fluffy fur, pink inner ears, rosy cheeks, a small round cotton tail, wearing a soft pink jeogori jacket with a white collar band, plum-purple trousers and a mint-green ribbon tie, pounding rice cakes with a wooden mallet in a mortar on the surface of a big full moon, a winding path below leading between two towers, a puppy and a little fox looking up and howling softly, a small crayfish peeking from a pond, dreamy lavender night.
```

### 19 · 태양 (The Sun)
- 첨부: 말 진화 3단계 그림 `horse_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby pony guardian spirit with warm chestnut-brown fur, a cream muzzle, a fluffy dark brown mane and tail, small rounded ears, wearing a tangerine-orange jeogori jacket with a white collar band, chocolate-brown trousers and a cream ribbon tie, riding happily on a white pony-shaped cloud, waving a bright orange flag, a huge smiling sun with soft rays above, a row of tall sunflowers behind a low garden wall, pure joy.
```

### 20 · 심판 (Judgement)
- 첨부: 닭 진화 3단계 그림 `rooster_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby rooster chick, round and fluffy with a small red comb and wattle guardian spirit with soft white and cream feathers, a small orange beak, a little red comb, tiny wing-hands, wearing a royal-blue jeogori jacket with a white collar band, white trousers and a red ribbon tie, flying among clouds and blowing a long golden trumpet with a small banner, below several tiny zodiac baby spirits waking up and rising joyfully from open flower buds with arms raised, snowy mountains far away, uplifting mood.
```

### 21 · 세계 (The World)
- 첨부: 양 진화 3단계 그림 `sheep_s3`

```
Cute premium Korean mobile-game tarot card illustration, portrait 2:3 card, full-bleed scene that fills the whole image. Chibi zodiac guardian characters (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly. Soft pastel palette: cream, rose pink, coral, lavender, mint and honey gold. Modern Korean traditional motifs (hanbok, cloud patterns, dancheong accents, celadon, hanji paper texture) mixed with classic tarot symbolism. A thin ornate honey-gold inner border with small cloud corners. Leave the bottom 12% of the card calm and simple (a name label will be placed there by the app). IMPORTANT: absolutely no text, no letters, no numbers, no Roman numerals, no labels, no watermark. No humans, no human faces. Nothing scary or dark; gentle and hopeful mood.

Use the attached image as the exact character reference for the main zodiac character: keep the same face, eyes, fur colors, markings, proportions and hanbok design. Scene: a baby lamb with small curled horns guardian spirit with very fluffy cloud-white wool, a soft peach face, pink inner ears and rosy cheeks, wearing a sky-mint jeogori jacket with a white collar band, cream trousers and a pink ribbon tie, dancing joyfully inside a large oval wreath of flowers and leaves tied with red ribbons, holding a small wand in each hoof, four tiny guardian beasts in the four corners (blue dragon, red phoenix, white tiger, black turtle) smiling, a celebratory pastel sky.
```
