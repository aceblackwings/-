# 포춘 기계 · 포춘 쿠키 그림 16장 프롬프트 시트 (v0.59 첫 화면)

> **비율**: 01은 1:1, 02~04는 1:1, 05~16은 **3:4 세로** · 모두 **1K**. 사람·글자·숫자·한자가 보이면 다시 뽑아 주세요.
> **순서가 중요**: 01 기계를 먼저 확정한 뒤, 05~16을 만들 때 **01 기계 그림 + 그 띠의 `{띠}_s5` 그림**(앱의 5단계 지신)을 함께 첨부해 같은 기계·같은 지신이 나오게 합니다.
> **배경**: 01~04는 초록, 05~16은 띠마다 아래 표의 색(지신 한복 색이 지워지지 않게 기존 띠 시트와 같은 색).
> **올리는 곳**: 드라이브 「12지신 강림 그림」 아래 새 폴더 **「포춘 기계」**에 01~16 순서대로(생성 시각 순서로 맞춥니다).
> **넣기**: `python3 -I saju-app/tools/fortune_ingest.py 원본폴더` → 배경 제거 → `saju-app/assets/fortune/{id}.webp` + `js/fortune-manifest.js` 자동.
> 그림이 없는 칸은 앱이 코드 그림(기계)과 지금 지신 그림으로 대신 보여 주므로, 일부만 먼저 올려도 됩니다.
> **움직임은 코드로**: 손잡이 돌리기(흔들림)·쿠키 굴러 나오기·쿠키 쪼개기(왼쪽·오른쪽 반쪽이 벌어짐)는 앱이 그림을 움직여 만듭니다.

| 순서 | id | 내용 | 비율 | 배경 | 첨부 |
|---|---|---|---|---|---|
| 01 | machine | 포춘 기계 단독 | 1:1 | 초록 | 없음 |
| 02 | cookie | 닫힌 포춘 쿠키 | 1:1 | 초록 | 없음 |
| 03 | cookie_l | 쪼개진 쿠키 왼쪽 반쪽 | 1:1 | 초록 | 02 |
| 04 | cookie_r | 쪼개진 쿠키 오른쪽 반쪽 | 1:1 | 초록 | 02 |
| 05 | rat | 쥐 지신이 기계 손잡이를 돌림 | 3:4 | 초록 | 01 + `rat_s5` |
| 06 | ox | 소 지신이 기계 손잡이를 돌림 | 3:4 | 마젠타 | 01 + `ox_s5` |
| 07 | tiger | 호랑이 지신이 기계 손잡이를 돌림 | 3:4 | 초록 | 01 + `tiger_s5` |
| 08 | rabbit | 토끼 지신이 기계 손잡이를 돌림 | 3:4 | 초록 | 01 + `rabbit_s5` |
| 09 | dragon | 용 지신이 기계 손잡이를 돌림 | 3:4 | 마젠타 | 01 + `dragon_s5` |
| 10 | snake | 뱀 지신이 기계 손잡이를 돌림 | 3:4 | 마젠타 | 01 + `snake_s5` |
| 11 | horse | 말 지신이 기계 손잡이를 돌림 | 3:4 | 초록 | 01 + `horse_s5` |
| 12 | sheep | 양 지신이 기계 손잡이를 돌림 | 3:4 | 마젠타 | 01 + `sheep_s5` |
| 13 | monkey | 원숭이 지신이 기계 손잡이를 돌림 | 3:4 | 초록 | 01 + `monkey_s5` |
| 14 | rooster | 닭 지신이 기계 손잡이를 돌림 | 3:4 | 초록 | 01 + `rooster_s5` |
| 15 | dog | 개 지신이 기계 손잡이를 돌림 | 3:4 | 초록 | 01 + `dog_s5` |
| 16 | pig | 돼지 지신이 기계 손잡이를 돌림 | 3:4 | 초록 | 01 + `pig_s5` |



### 01 · 포춘 기계 (`machine`)

```
Clean game object illustration, soft cel shading with gentle gradients, clean thick dark plum outlines, cute and cozy, modern Korean traditional motifs. Plain solid bright pure chroma-key green background filling the whole image, nothing else in the background, and any hole or gap inside the object is also filled with that same flat green. IMPORTANT: absolutely no people, no text, no letters, no numbers, no Chinese characters, no labels, no arrows, no watermark, no frame, no second panel, no shadow on the ground. No characters, no animals, no hands. Front three-quarter view slightly from the right so the crank handle is clearly visible, centered, fully visible with about 10% empty margin.

Object: a cute tabletop fortune-cookie machine in modern Korean traditional style: a round clear glass dome full of small golden fortune cookies, sitting on a rounded cream-white and navy-blue lacquered wooden base with thin gold trim and a simple gold cloud pattern, a big gold crank handle with a round navy knob on the RIGHT side of the base, and a small arched cookie chute opening at the front bottom center with a tiny gold tray in front of it, one small red silk tassel hanging from the top of the dome.
```

### 02 · 닫힌 포춘 쿠키 (`cookie`)

```
Clean game item illustration, soft cel shading with gentle gradients, clean thick dark plum outline, cute premium Korean mobile-game item art. Plain solid bright pure chroma-key green background filling the whole image, nothing else in the background, and any hole or gap inside the object is also filled with that same flat green. IMPORTANT: absolutely no people, no text, no letters, no numbers, no Chinese characters, no labels, no arrows, no watermark, no frame, no second panel, no shadow on the ground. No characters, no hands, no plate. Front view, centered, about 60% of the image width, fully visible.

Item: a single golden-brown fortune cookie, the classic folded crescent shape, glossy warm baked color with soft highlights, a tiny tip of white paper slip peeking out of the fold.
```

### 03 · 쪼개진 쿠키 왼쪽 반쪽 (`cookie_l`)

- 첨부: 02번 그림(같은 쿠키를 반으로 쪼갠 모양)

```
Clean game item illustration, soft cel shading with gentle gradients, clean thick dark plum outline, cute premium Korean mobile-game item art, same cookie as the attached image. Plain solid bright pure chroma-key green background filling the whole image, nothing else in the background, and any hole or gap inside the object is also filled with that same flat green. IMPORTANT: absolutely no people, no text, no letters, no numbers, no Chinese characters, no labels, no arrows, no watermark, no frame, no second panel, no shadow on the ground. No characters, no hands, no paper slip, no crumbs flying. Centered, fully visible.

Item: ONLY the LEFT half of the attached golden fortune cookie after it was snapped in two by hand, the jagged broken edge facing to the right with a slightly lighter inner crumb texture, the other half is NOT in the image.
```

### 04 · 쪼개진 쿠키 오른쪽 반쪽 (`cookie_r`)

- 첨부: 02번 그림(같은 쿠키를 반으로 쪼갠 모양)

```
Clean game item illustration, soft cel shading with gentle gradients, clean thick dark plum outline, cute premium Korean mobile-game item art, same cookie as the attached image. Plain solid bright pure chroma-key green background filling the whole image, nothing else in the background, and any hole or gap inside the object is also filled with that same flat green. IMPORTANT: absolutely no people, no text, no letters, no numbers, no Chinese characters, no labels, no arrows, no watermark, no frame, no second panel, no shadow on the ground. No characters, no hands, no paper slip, no crumbs flying. Centered, fully visible.

Item: ONLY the RIGHT half of the attached golden fortune cookie after it was snapped in two by hand, the jagged broken edge facing to the left with a slightly lighter inner crumb texture, the other half is NOT in the image.
```

### 05 · 쥐 지신 + 포춘 기계 (`rat`)

- 첨부: 01번 기계 그림 + 앱의 `rat_s5` 그림(5단계 지신)

```
Cute premium Korean mobile-game illustration, chibi proportions (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly but not childish, modern Korean traditional motifs. Plain solid bright pure chroma-key green background filling the whole image, nothing else in the background, and any hole or gap inside the object is also filled with that same flat green. IMPORTANT: absolutely no humans, no text, no letters, no numbers, no Chinese characters, no labels, no arrows, no watermark, no frame, no second panel, no shadow on the ground. Exactly one character and one machine, both fully visible with about 8% empty margin, vertical 3:4 composition.

Scene: the attached fortune-cookie machine (keep its exact design: glass dome of golden cookies, cream-white and navy base, gold crank on the right, chute at front bottom) stands on the LEFT, about 55% of the image width, its base at the bottom of the image. To its RIGHT stands the attached guardian spirit (keep the exact same look, size, crown and outfit as the attached character image, NOT a baby version): a mouse, soft lavender-grey fur, a pale cream belly and muzzle, pink inner ears and soft pink cheeks, a long thin tail, wearing a sky-blue jeogori jacket with a white collar band, navy trousers and a lemon-yellow ribbon tie. The character faces left toward the machine in three-quarter view and grips the gold crank handle with both hands, cheerfully turning it, eyes sparkling with excitement, clever and tidy, bright curious eyes, a small confident smile. The chute at the front bottom of the machine is empty and clearly visible (nothing covers it).
```

### 06 · 소 지신 + 포춘 기계 (`ox`)

- 첨부: 01번 기계 그림 + 앱의 `ox_s5` 그림(5단계 지신)

```
Cute premium Korean mobile-game illustration, chibi proportions (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly but not childish, modern Korean traditional motifs. Plain solid bright pure chroma-key magenta background filling the whole image, nothing else in the background, and any hole or gap inside the object is also filled with that same flat magenta. IMPORTANT: absolutely no humans, no text, no letters, no numbers, no Chinese characters, no labels, no arrows, no watermark, no frame, no second panel, no shadow on the ground. Exactly one character and one machine, both fully visible with about 8% empty margin, vertical 3:4 composition.

Scene: the attached fortune-cookie machine (keep its exact design: glass dome of golden cookies, cream-white and navy base, gold crank on the right, chute at front bottom) stands on the LEFT, about 55% of the image width, its base at the bottom of the image. To its RIGHT stands the attached guardian spirit (keep the exact same look, size, crown and outfit as the attached character image, NOT a baby version): a ox calf with two small rounded horns, creamy beige fur with soft brown patches, a pale pink nose, small rounded ears with peach inner ears, wearing a forest-green jeogori jacket with a white collar band, dark brown trousers and a golden ribbon tie. The character faces left toward the machine in three-quarter view and grips the gold crank handle with both hands, cheerfully turning it, eyes sparkling with excitement, calm and reliable, gentle half-smile, steady kind eyes. The chute at the front bottom of the machine is empty and clearly visible (nothing covers it).
```

### 07 · 호랑이 지신 + 포춘 기계 (`tiger`)

- 첨부: 01번 기계 그림 + 앱의 `tiger_s5` 그림(5단계 지신)

```
Cute premium Korean mobile-game illustration, chibi proportions (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly but not childish, modern Korean traditional motifs. Plain solid bright pure chroma-key green background filling the whole image, nothing else in the background, and any hole or gap inside the object is also filled with that same flat green. IMPORTANT: absolutely no humans, no text, no letters, no numbers, no Chinese characters, no labels, no arrows, no watermark, no frame, no second panel, no shadow on the ground. Exactly one character and one machine, both fully visible with about 8% empty margin, vertical 3:4 composition.

Scene: the attached fortune-cookie machine (keep its exact design: glass dome of golden cookies, cream-white and navy base, gold crank on the right, chute at front bottom) stands on the LEFT, about 55% of the image width, its base at the bottom of the image. To its RIGHT stands the attached guardian spirit (keep the exact same look, size, crown and outfit as the attached character image, NOT a baby version): a tiger cub, warm orange fur with dark brown stripes, a cream-white muzzle and belly, peach-colored inner ears and soft pink cheeks, short striped tail, wearing a coral-red jeogori jacket with a white collar band, deep crimson trousers and a golden-yellow ribbon tie. The character faces left toward the machine in three-quarter view and grips the gold crank handle with both hands, cheerfully turning it, eyes sparkling with excitement, brave cheerleader, warm confident smile and bright eyes. The chute at the front bottom of the machine is empty and clearly visible (nothing covers it).
```

### 08 · 토끼 지신 + 포춘 기계 (`rabbit`)

- 첨부: 01번 기계 그림 + 앱의 `rabbit_s5` 그림(5단계 지신)

```
Cute premium Korean mobile-game illustration, chibi proportions (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly but not childish, modern Korean traditional motifs. Plain solid bright pure chroma-key green background filling the whole image, nothing else in the background, and any hole or gap inside the object is also filled with that same flat green. IMPORTANT: absolutely no humans, no text, no letters, no numbers, no Chinese characters, no labels, no arrows, no watermark, no frame, no second panel, no shadow on the ground. Exactly one character and one machine, both fully visible with about 8% empty margin, vertical 3:4 composition.

Scene: the attached fortune-cookie machine (keep its exact design: glass dome of golden cookies, cream-white and navy base, gold crank on the right, chute at front bottom) stands on the LEFT, about 55% of the image width, its base at the bottom of the image. To its RIGHT stands the attached guardian spirit (keep the exact same look, size, crown and outfit as the attached character image, NOT a baby version): a rabbit with long upright ears, snow-white fluffy fur, pink inner ears, rosy cheeks, a small round cotton tail, wearing a soft pink jeogori jacket with a white collar band, plum-purple trousers and a mint-green ribbon tie. The character faces left toward the machine in three-quarter view and grips the gold crank handle with both hands, cheerfully turning it, eyes sparkling with excitement, kind and empathetic, soft warm smile, gentle sparkling eyes. The chute at the front bottom of the machine is empty and clearly visible (nothing covers it).
```

### 09 · 용 지신 + 포춘 기계 (`dragon`)

- 첨부: 01번 기계 그림 + 앱의 `dragon_s5` 그림(5단계 지신)

```
Cute premium Korean mobile-game illustration, chibi proportions (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly but not childish, modern Korean traditional motifs. Plain solid bright pure chroma-key magenta background filling the whole image, nothing else in the background, and any hole or gap inside the object is also filled with that same flat magenta. IMPORTANT: absolutely no humans, no text, no letters, no numbers, no Chinese characters, no labels, no arrows, no watermark, no frame, no second panel, no shadow on the ground. Exactly one character and one machine, both fully visible with about 8% empty margin, vertical 3:4 composition.

Scene: the attached fortune-cookie machine (keep its exact design: glass dome of golden cookies, cream-white and navy base, gold crank on the right, chute at front bottom) stands on the LEFT, about 55% of the image width, its base at the bottom of the image. To its RIGHT stands the attached guardian spirit (keep the exact same look, size, crown and outfit as the attached character image, NOT a baby version): a dragon with two small golden antlers and a short soft mane, smooth jade-teal scales with a pale cream belly, a fluffy light mint mane, a short curled tail with a small tuft, wearing a deep royal-blue jeogori jacket with a white collar band, navy trousers and a golden ribbon tie. The character faces left toward the machine in three-quarter view and grips the gold crank handle with both hands, cheerfully turning it, eyes sparkling with excitement, a big dreamer, calm and noble, gentle proud smile. The chute at the front bottom of the machine is empty and clearly visible (nothing covers it).
```

### 10 · 뱀 지신 + 포춘 기계 (`snake`)

- 첨부: 01번 기계 그림 + 앱의 `snake_s5` 그림(5단계 지신)

```
Cute premium Korean mobile-game illustration, chibi proportions (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly but not childish, modern Korean traditional motifs. Plain solid bright pure chroma-key magenta background filling the whole image, nothing else in the background, and any hole or gap inside the object is also filled with that same flat magenta. IMPORTANT: absolutely no humans, no text, no letters, no numbers, no Chinese characters, no labels, no arrows, no watermark, no frame, no second panel, no shadow on the ground. Exactly one character and one machine, both fully visible with about 8% empty margin, vertical 3:4 composition.

Scene: the attached fortune-cookie machine (keep its exact design: glass dome of golden cookies, cream-white and navy base, gold crank on the right, chute at front bottom) stands on the LEFT, about 55% of the image width, its base at the bottom of the image. To its RIGHT stands the attached guardian spirit (keep the exact same look, size, crown and outfit as the attached character image, NOT a baby version): a snake standing upright in a cute chibi way, round head with a tiny topknot, smooth spring-green scales with a pale yellow belly, soft pink cheeks, the tail curled neatly behind, wearing a lavender-purple jeogori jacket with a white collar band, deep violet trousers and a pale yellow ribbon tie. The character faces left toward the machine in three-quarter view and grips the gold crank handle with both hands, cheerfully turning it, eyes sparkling with excitement, calm and wise, gentle half-closed eyes, a quiet knowing smile. The chute at the front bottom of the machine is empty and clearly visible (nothing covers it).
```

### 11 · 말 지신 + 포춘 기계 (`horse`)

- 첨부: 01번 기계 그림 + 앱의 `horse_s5` 그림(5단계 지신)

```
Cute premium Korean mobile-game illustration, chibi proportions (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly but not childish, modern Korean traditional motifs. Plain solid bright pure chroma-key green background filling the whole image, nothing else in the background, and any hole or gap inside the object is also filled with that same flat green. IMPORTANT: absolutely no humans, no text, no letters, no numbers, no Chinese characters, no labels, no arrows, no watermark, no frame, no second panel, no shadow on the ground. Exactly one character and one machine, both fully visible with about 8% empty margin, vertical 3:4 composition.

Scene: the attached fortune-cookie machine (keep its exact design: glass dome of golden cookies, cream-white and navy base, gold crank on the right, chute at front bottom) stands on the LEFT, about 55% of the image width, its base at the bottom of the image. To its RIGHT stands the attached guardian spirit (keep the exact same look, size, crown and outfit as the attached character image, NOT a baby version): a pony, warm chestnut-brown fur, a cream muzzle, a fluffy dark brown mane and tail, small rounded ears, wearing a tangerine-orange jeogori jacket with a white collar band, chocolate-brown trousers and a cream ribbon tie. The character faces left toward the machine in three-quarter view and grips the gold crank handle with both hands, cheerfully turning it, eyes sparkling with excitement, energetic and sporty, a bright open smile, lively eyes. The chute at the front bottom of the machine is empty and clearly visible (nothing covers it).
```

### 12 · 양 지신 + 포춘 기계 (`sheep`)

- 첨부: 01번 기계 그림 + 앱의 `sheep_s5` 그림(5단계 지신)

```
Cute premium Korean mobile-game illustration, chibi proportions (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly but not childish, modern Korean traditional motifs. Plain solid bright pure chroma-key magenta background filling the whole image, nothing else in the background, and any hole or gap inside the object is also filled with that same flat magenta. IMPORTANT: absolutely no humans, no text, no letters, no numbers, no Chinese characters, no labels, no arrows, no watermark, no frame, no second panel, no shadow on the ground. Exactly one character and one machine, both fully visible with about 8% empty margin, vertical 3:4 composition.

Scene: the attached fortune-cookie machine (keep its exact design: glass dome of golden cookies, cream-white and navy base, gold crank on the right, chute at front bottom) stands on the LEFT, about 55% of the image width, its base at the bottom of the image. To its RIGHT stands the attached guardian spirit (keep the exact same look, size, crown and outfit as the attached character image, NOT a baby version): a lamb with small curled horns, very fluffy cloud-white wool, a soft peach face, pink inner ears and rosy cheeks, wearing a sky-mint jeogori jacket with a white collar band, cream trousers and a pink ribbon tie. The character faces left toward the machine in three-quarter view and grips the gold crank handle with both hands, cheerfully turning it, eyes sparkling with excitement, cozy and healing, soft sleepy-gentle eyes, a tender smile. The chute at the front bottom of the machine is empty and clearly visible (nothing covers it).
```

### 13 · 원숭이 지신 + 포춘 기계 (`monkey`)

- 첨부: 01번 기계 그림 + 앱의 `monkey_s5` 그림(5단계 지신)

```
Cute premium Korean mobile-game illustration, chibi proportions (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly but not childish, modern Korean traditional motifs. Plain solid bright pure chroma-key green background filling the whole image, nothing else in the background, and any hole or gap inside the object is also filled with that same flat green. IMPORTANT: absolutely no humans, no text, no letters, no numbers, no Chinese characters, no labels, no arrows, no watermark, no frame, no second panel, no shadow on the ground. Exactly one character and one machine, both fully visible with about 8% empty margin, vertical 3:4 composition.

Scene: the attached fortune-cookie machine (keep its exact design: glass dome of golden cookies, cream-white and navy base, gold crank on the right, chute at front bottom) stands on the LEFT, about 55% of the image width, its base at the bottom of the image. To its RIGHT stands the attached guardian spirit (keep the exact same look, size, crown and outfit as the attached character image, NOT a baby version): a monkey, warm caramel-brown fur, a light peach face and ears, a long curled tail, wearing a mustard-yellow jeogori jacket with a white collar band, olive trousers and a red ribbon tie. The character faces left toward the machine in three-quarter view and grips the gold crank handle with both hands, cheerfully turning it, eyes sparkling with excitement, witty and playful, a mischievous grin, twinkling eyes. The chute at the front bottom of the machine is empty and clearly visible (nothing covers it).
```

### 14 · 닭 지신 + 포춘 기계 (`rooster`)

- 첨부: 01번 기계 그림 + 앱의 `rooster_s5` 그림(5단계 지신)

```
Cute premium Korean mobile-game illustration, chibi proportions (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly but not childish, modern Korean traditional motifs. Plain solid bright pure chroma-key green background filling the whole image, nothing else in the background, and any hole or gap inside the object is also filled with that same flat green. IMPORTANT: absolutely no humans, no text, no letters, no numbers, no Chinese characters, no labels, no arrows, no watermark, no frame, no second panel, no shadow on the ground. Exactly one character and one machine, both fully visible with about 8% empty margin, vertical 3:4 composition.

Scene: the attached fortune-cookie machine (keep its exact design: glass dome of golden cookies, cream-white and navy base, gold crank on the right, chute at front bottom) stands on the LEFT, about 55% of the image width, its base at the bottom of the image. To its RIGHT stands the attached guardian spirit (keep the exact same look, size, crown and outfit as the attached character image, NOT a baby version): a rooster chick, round and fluffy with a small red comb and wattle, soft white and cream feathers, a small orange beak, a little red comb, tiny wing-hands, wearing a royal-blue jeogori jacket with a white collar band, white trousers and a red ribbon tie. The character faces left toward the machine in three-quarter view and grips the gold crank handle with both hands, cheerfully turning it, eyes sparkling with excitement, neat and punctual, polite upright posture, a bright friendly smile. The chute at the front bottom of the machine is empty and clearly visible (nothing covers it).
```

### 15 · 개 지신 + 포춘 기계 (`dog`)

- 첨부: 01번 기계 그림 + 앱의 `dog_s5` 그림(5단계 지신)

```
Cute premium Korean mobile-game illustration, chibi proportions (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly but not childish, modern Korean traditional motifs. Plain solid bright pure chroma-key green background filling the whole image, nothing else in the background, and any hole or gap inside the object is also filled with that same flat green. IMPORTANT: absolutely no humans, no text, no letters, no numbers, no Chinese characters, no labels, no arrows, no watermark, no frame, no second panel, no shadow on the ground. Exactly one character and one machine, both fully visible with about 8% empty margin, vertical 3:4 composition.

Scene: the attached fortune-cookie machine (keep its exact design: glass dome of golden cookies, cream-white and navy base, gold crank on the right, chute at front bottom) stands on the LEFT, about 55% of the image width, its base at the bottom of the image. To its RIGHT stands the attached guardian spirit (keep the exact same look, size, crown and outfit as the attached character image, NOT a baby version): a puppy with floppy ears, golden-tan fur with a cream muzzle and chest, floppy ears, a fluffy curled tail, wearing a navy-blue jeogori jacket with a white collar band, sand-beige trousers and a sunny-yellow ribbon tie. The character faces left toward the machine in three-quarter view and grips the gold crank handle with both hands, cheerfully turning it, eyes sparkling with excitement, loyal and honest, a happy open smile, sparkling eyes. The chute at the front bottom of the machine is empty and clearly visible (nothing covers it).
```

### 16 · 돼지 지신 + 포춘 기계 (`pig`)

- 첨부: 01번 기계 그림 + 앱의 `pig_s5` 그림(5단계 지신)

```
Cute premium Korean mobile-game illustration, chibi proportions (head about 45% of the body), soft cel shading with gentle gradients, clean thick dark plum outlines, big glossy eyes, warm and friendly but not childish, modern Korean traditional motifs. Plain solid bright pure chroma-key green background filling the whole image, nothing else in the background, and any hole or gap inside the object is also filled with that same flat green. IMPORTANT: absolutely no humans, no text, no letters, no numbers, no Chinese characters, no labels, no arrows, no watermark, no frame, no second panel, no shadow on the ground. Exactly one character and one machine, both fully visible with about 8% empty margin, vertical 3:4 composition.

Scene: the attached fortune-cookie machine (keep its exact design: glass dome of golden cookies, cream-white and navy base, gold crank on the right, chute at front bottom) stands on the LEFT, about 55% of the image width, its base at the bottom of the image. To its RIGHT stands the attached guardian spirit (keep the exact same look, size, crown and outfit as the attached character image, NOT a baby version): a piglet, soft pink skin, a round pink snout, small triangle ears with rosy inner ears, a tiny curly tail, wearing an apricot-peach jeogori jacket with a white collar band, rose-red trousers and a sky-blue ribbon tie. The character faces left toward the machine in three-quarter view and grips the gold crank handle with both hands, cheerfully turning it, eyes sparkling with excitement, generous and lucky, a round happy face, cheerful smile. The chute at the front bottom of the machine is empty and clearly visible (nothing covers it).
```
