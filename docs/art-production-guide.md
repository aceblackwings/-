# 12지신 강림 · 그림 제작 가이드 (이미지 생성 도구용)

> 목적: 이미지 생성 도구(예: Nano Banana Pro)로 캐릭터·부적·이모티콘·한정 소품을 만들어 앱에 넣기 위한 규격과 프롬프트 모음
> 작성: 2026-11-02 · 대상: v0.21 디자인 개편

---

## 1. 역할 나누기: 그림은 이미지로, 등급·글자·움직임은 코드로

| 이미지로 만드는 것 | 코드가 계속 맡는 것 |
|---|---|
| 12지신 캐릭터(진화 단계·표정), 부적 상징 그림, 부적 종이, 한정 소품, 계절 장면 | 등급 테두리·빛·반짝임·회전 같은 **등급 효과**, 점수·이름·효과 수치 같은 **글자**, 애니메이션, 장착(부적·소품 겹치기) |

- **그림 안에 글자를 넣지 않습니다.** 한글·한자는 이미지 도구가 틀리게 그리기 쉽고, 점수처럼 바뀌는 글자는 코드가 넣어야 합니다.
- 등급별 차이(희귀→신화)는 지금처럼 코드가 덧입히므로, **같은 그림 한 장으로 5등급을 모두 표현**할 수 있습니다. 그림 수가 크게 줄어듭니다.
- 이미지가 아직 없는 항목은 지금의 코드 그림(SVG)이 자동으로 대신 나오게 만들어, 조금씩 바꿔 나갈 수 있게 합니다.

---

## 2. 공통 규격 (모든 그림)

| 항목 | 규칙 |
|---|---|
| 크기 | **1024 × 1024 정사각형** PNG (장면 배경만 1024 × 1280 세로형) |
| 배경 | **단색 크로마 그린 `#00FF00`** — 앱에서 배경을 투명하게 지웁니다. 초록색이 많은 그림(용·뱀 캐릭터, 목(木) 한복, 새싹·창포·불로초)은 **마젠타 `#FF00FF`** |
| 구도 | 정면 또는 살짝 3/4, 화면 가운데, 위아래·좌우 여백 약 10% |
| 캐릭터 기준선 | 발바닥이 항상 같은 높이(아래에서 약 8%)에 오도록. 진화 단계가 바뀌어도 크기 비교가 되게 |
| 금지 | 글자·숫자·한자·서명·워터마크 표시·액자 테두리·그림자 바닥판(그림자는 앱이 넣음) |
| 그림체 | 아래 「스타일 기준 문장」을 모든 프롬프트 앞에 그대로 붙이기 |

### 스타일 기준 문장 (모든 프롬프트 맨 앞에 복사)

```
Cute premium Korean mobile-game character art, chibi proportions (head about 45% of body),
soft cel shading with gentle gradients, clean thick dark-plum outlines (#241b2f), big glossy eyes,
warm and friendly not childish, modern Korean traditional (hanbok) motifs, subtle neon rim light.
Solid flat chroma-key green background (#00FF00), no shadow on the ground, no text, no letters,
no watermark, no frame. Centered, full body visible, 10% margin.
```

---

## 3. 캐릭터를 같은 얼굴로 유지하는 방법 (가장 중요)

1. **띠별 캐릭터 시트 1장**을 먼저 만듭니다(아래 프롬프트 A). 마음에 들 때까지 다시 뽑아 확정합니다.
2. 이후 그 띠의 모든 그림(진화 단계·표정·한복 색 바꾸기)은 **확정한 시트를 참조 이미지로 첨부**하고, 프롬프트에 다음 문장을 넣습니다.
   ```
   Use the attached image as the exact character reference. Keep the same face, proportions,
   colors, outline style and costume details. Only change what is described below.
   ```
3. **한복 색 5가지(오행)는 새로 그리지 말고 "편집"으로** 만듭니다. 확정 그림을 첨부하고 "한복 색만 바꿔 줘"라고 하면 얼굴이 흔들리지 않습니다.

| 오행 | 한복 주색 | 보조색 |
|---|---|---|
| 목(木) | 초록 `#33c27a` | 진초록 `#1d6f53`, 노랑 끈 |
| 화(火) | 다홍 `#ff5a7a` | 진홍 `#a8233f`, 노랑 끈 |
| 토(土) | 황금 `#f4b740` | 갈색 `#9a6510`, 분홍 끈 |
| 금(金) | 은백 `#d6d8ec` | 회청 `#6e7192`, 하늘색 끈 |
| 수(水) | 남청 `#3a7bea` | 짙은 남색 `#1b3c80`, 분홍 끈 |

---

## 4. 만들 그림 목록과 순서

### 1차: 시범 세트 (호랑이 한 마리로 전체 흐름 확인, 약 43장)
| 묶음 | 장수 | 비고 |
|---|---|---|
| 호랑이 캐릭터 시트 | 1 | 일관성 기준 |
| 호랑이 진화 1~5단계 (화(火) 한복) | 5 | 6~14단계(승천)는 처음엔 5단계 그림 + 코드 효과로 |
| 호랑이 표정 8종 (2단계) | 8 | 이모티콘용 |
| 부적 상징 6종 | 6 | 엽전·복주머니·동심결·붓·불로초·호랑이 방패 |
| 부적 종이 2종 | 2 | 전통 한지 / 네온 2099 (배경판, 글자 없이) |
| 한정 소품 11종 | 11 | 캐릭터에 겹쳐 입히는 단독 소품 |
| 계절 장면 11종 | 11 | 꾸미기 세트용 배경 (세로형) |

→ 시범 세트를 앱에 넣어 보고 크기·선 굵기·색감을 확정한 뒤 나머지를 만듭니다.

### 2차: 전체 (시범 확정 후)
| 묶음 | 장수 |
|---|---|
| 나머지 11띠 캐릭터 시트 | 11 |
| 12띠 × 진화 5단계 | 60 (호랑이 포함) |
| 12띠 × 표정 8종 | 96 |
| 한복 색 편집 (12띠 × 5단계 × 나머지 4색) | 240 — 편집이라 빠름. 처음엔 2단계(가장 많이 보이는 단계)만 먼저 48장 |
| 승천 6~14단계 (선택) | 띠마다 9장씩, 인기 띠부터 |

---

## 5. 파일 이름과 올리는 곳

### 이름 규칙 (영문 소문자, 이 규칙대로면 제가 자동으로 연결합니다)
```
char_{띠}_sheet.png                 예: char_tiger_sheet.png
char_{띠}_s{단계}_{오행}.png         예: char_tiger_s2_fire.png
emo_{띠}_{표정}.png                  예: emo_tiger_love.png
charm_emblem_{종류}.png              예: charm_emblem_wealth.png
charm_paper_{테마}.png               예: charm_paper_classic.png / charm_paper_neon.png
item_{시즌}.png                      예: item_ipdong.png
scene_{시즌}.png                     예: scene_chuseok.png
```
- 띠: rat ox tiger rabbit dragon snake horse sheep monkey rooster dog pig
- 오행: wood fire earth metal water
- 표정: smile excited fighting love wow thanks calm sleepy
- 부적 종류: protect luck wealth love exam health
- 시즌: seollal daeboreum ipchun chunbun dano haji chilseok chubun chuseok ipdong dongji

### 올리는 방법 (추천: GitHub 웹)
1. GitHub에서 이 저장소를 열고, 브랜치를 **작업 브랜치**로 바꿉니다.
2. `saju-app/assets/raw/` 폴더로 이동합니다(없으면 아무 파일이나 `saju-app/assets/raw/` 경로로 올리면 생깁니다).
3. **Add file → Upload files**로 그림을 끌어다 놓고 커밋합니다. 한 번에 최대 100개까지 됩니다.
4. 저에게 "올렸어"라고 알려 주시면, 제가 받아서 다음 작업을 합니다.

소량(몇 장) 확인용이라면 대화창에 이미지를 바로 첨부하셔도 됩니다. 다만 대화창 첨부는 원본 파일이 제 작업 공간에 그대로 남지 않을 수 있어, **실제 앱에 넣을 파일은 GitHub로 올리는 방식**이 안전합니다.

### 올린 뒤 제가 하는 일
1. 배경색(#00FF00·#FF00FF)을 지워 투명 PNG로 만들고, 가장자리 초록빛 번짐을 정리합니다.
2. 앱용 크기(512·256px)로 줄이고 WebP로 압축합니다(한 장 약 50~150KB 목표).
3. 이미지가 있으면 이미지를, 없으면 지금의 SVG 그림을 쓰도록 연결합니다.
4. 등급 효과·장착 소품·글자는 코드가 그림 위에 덧입힙니다.
5. 🧪 전체 미리보기 갤러리에서 함께 확인합니다.

---

## 6. 프롬프트 모음

> 각 프롬프트 앞에 2장의 「스타일 기준 문장」을 붙이세요. 캐릭터 관련 프롬프트에는 3장의 「참조 문장」과 확정 시트를 함께 넣으세요.

### A. 띠별 캐릭터 시트
```
Character design sheet of a baby guardian spirit of the Korean zodiac: a {ANIMAL}.
Body color {BASE_COLOR}, darker accents {DARK_COLOR}, inner ears and cheeks {INNER_COLOR}.
Wearing a simple Korean hanbok in {HANBOK_COLOR} with a small {TRIM_COLOR} sash.
Front view, standing, friendly smile, hands relaxed at the sides.
Personality: {PERSONALITY}.
```
| 띠 | ANIMAL | BASE / DARK / INNER | PERSONALITY |
|---|---|---|---|
| 쥐 | mouse | #c9c4dc / #6f6890 / #ffb3c7 | clever and tidy, bright curious eyes |
| 소 | ox calf with small horns | #f6e7d2 / #7a5236 / #ffb3a7 | calm and reliable, gentle eyes |
| 호랑이 | tiger cub | #ffb347 / #9a4f12 / #ffd2a8 | brave cheerleader, warm confident smile |
| 토끼 | rabbit with long ears | #fff5f8 / #b07d92 / #ffb7cf | kind and empathetic, soft smile |
| 용 | baby dragon with small antlers | #7fe0c0 / #1f7a62 / #bff5e3 | big dreamer, calm and noble |
| 뱀 | small round snake with a tiny topknot | #a8e878 / #3f7a1f / #d6f7b8 | calm and wise, half-closed gentle eyes |
| 말 | pony | #d9a06b / #6b3f1f / #f3c19a | energetic runner, sporty |
| 양 | fluffy lamb with curled horns | #fffaf0 / #9c8a6e / #ffd9c2 | cozy and healing, sleepy-soft eyes |
| 원숭이 | monkey | #c48b5c / #5f3a1d / #f0b998 | witty and playful, mischievous grin |
| 닭 | chick-like rooster with red comb | #fffdf6 / #a08c6a / #ffe0b0 | neat and punctual, polite posture |
| 개 | puppy | #efbd7d / #8a5320 / #ffe2c4 | loyal and honest, happy open smile |
| 돼지 | piglet | #ffc9d6 / #b4567a / #ff9fb8 | generous and lucky, round happy face |

### B. 진화 단계 (확정 시트 첨부)
```
Same character, evolution stage {N}: {STAGE_DESC}.
Hanbok main color {HANBOK_COLOR}. Keep the same face and body colors.
```
| 단계 | STAGE_DESC |
|---|---|
| 1 아기 | tiny baby version sitting in a cracked golden egg shell, wearing a soft bib, extra round and small |
| 2 견습 | the reference look: simple hanbok with sash, holding a small item for their worry (briefcase / scroll / coin pouch) |
| 3 수호 무사·선녀 | a little taller, short flowing cape, small shoulder guards, two glowing five-element orbs floating nearby |
| 4 수호신 | gold-trimmed hanbok, floating on a small white cloud, soft golden halo ring behind the head |
| 5 신수 | majestic but still cute: small feathered wings, a little golden crown with a red gem, rainbow aura, spirit-like glowing tail |

### C. 표정 8종 (2단계 그림 첨부, 이모티콘용)
```
Same character, upper body close-up for a messenger sticker, expression: {EXPRESSION}.
Keep the hanbok. Leave space at the bottom for a caption (do not draw any text).
```
| 표정 | EXPRESSION |
|---|---|
| smile 행운 | gentle happy smile, holding a four-leaf clover |
| excited 기쁨 | eyes closed laughing, both arms up, confetti around |
| fighting 화이팅 | determined face, red headband, fist raised, small flames behind |
| love 사랑 | heart-shaped eyes, blushing, hugging a big pink heart |
| wow 놀람 | wide sparkling eyes, open mouth, star burst behind |
| thanks 감사 | polite bow with both hands together, holding a red lucky pouch |
| calm 평온 | peaceful closed eyes, holding a warm tea cup with steam |
| sleepy 졸림 | drowsy eyes, blue night cap with white pom-pom, hugging a small pillow |

### D. 부적 상징 6종 (단독 그림)
```
Single emblem icon for a Korean talisman, isolated object, no paper, no text:
{EMBLEM}. Traditional Korean motif drawn in the same cute premium style,
bold outline, gold and vermilion red accents.
```
| 종류 | EMBLEM |
|---|---|
| wealth 재물 | an old Korean brass coin (yeopjeon) with a square hole, three coins stacked |
| luck 행운 | a red Korean lucky pouch (bokjumeoni) with gold tassels |
| love 애정 | two interlocked hearts tied with a red traditional knot (dongsimgyeol) |
| exam 합격 | a traditional calligraphy brush with a small rolled scroll |
| health 건강 | a lingzhi mushroom (bullocho) of immortality with soft clouds |
| protect 액막이 | a round guardian shield with a stylized tiger face |

### E. 부적 종이 2종 (세로 1024 × 1792 권장, 배경판)
```
Empty vertical Korean talisman paper background, no text, no symbols in the center (leave it empty
for overlays). {THEME}.
```
- classic: `aged yellow hanji paper with subtle fibers, thin red double border with cloud-pattern corners`
- neon: `dark navy futuristic card with neon cyan and magenta circuit lines on the edges, subtle grid floor`

### F. 한정 소품 11종 (단독 그림, 캐릭터 없이)
```
Single seasonal accessory item, isolated object, no character, no text: {ITEM}.
```
| 시즌 | ITEM |
|---|---|
| ipdong 입동 | a white-and-sky-blue knitted scarf with a snowflake charm |
| dongji 동지 | a warm red fur scarf with small white rice-cake balls (saealsim) charm |
| seollal 설날 | a red Korean lucky pouch with gold embroidery |
| daeboreum 정월대보름 | a round full-moon paper lantern on a short stick |
| ipchun 입춘 | a hairpin with a fresh green sprout |
| chunbun 춘분 | a cherry blossom flower crown |
| dano 단오 | a jade-green iris (changpo) hairpin |
| haji 하지 | a Korean taegeuk folding fan |
| chilseok 칠석 | a starry milky-way hairpin with a small purple star |
| chubun 추분 | a red maple leaf hairpin |
| chuseok 추석 | a small woven basket of colorful songpyeon rice cakes |

### G. 계절 장면 11종 (세로 1024 × 1280, 캐릭터가 설 가운데는 비워 두기)
```
Vertical seasonal background scene for a character stage, leave the center empty for a character,
decorations only on the edges and the ground, no characters, no text: {SCENE}.
Use a full scene background instead of the green screen.
```
| 시즌 | SCENE |
|---|---|
| ipdong | snowy ground with a small snowman on the left and a snowy pine tree on the right, falling snow |
| dongji | snowy night, a bowl of red bean porridge on the left, a pale moon on the right |
| seollal | string of blue and red cheongsachorong lanterns across the top, warm wooden floor |
| daeboreum | big full moon on the upper left, a small daljip bonfire on the right, night sky |
| ipchun | a vertical red-and-white spring blessing paper on the left wall, green sprouts on the ground |
| chunbun | cherry blossom branch from the upper right, pink petals on the ground |
| dano | a traditional swing hanging on the right, iris grass on the left |
| haji | bright summer sun on the upper right, watermelon slice on the ground |
| chilseok | milky way across a night sky, a bridge of magpies at the bottom |
| chubun | red and yellow maple branch from the upper left, fallen leaves on the ground |
| chuseok | big full moon with a moon rabbit silhouette, a basket of persimmons on the right |

---

## 7. 주의할 점

- **기존 캐릭터·브랜드·작가 이름을 프롬프트에 넣지 않습니다**(예: 특정 애니메이션·게임·작가 스타일). 우리만의 캐릭터로 남아야 상표·저작권 걱정이 없습니다.
- 사용하는 이미지 도구의 **이용 약관에서 상업적 이용 조건**을 한 번 확인해 주세요. 정식 출시 전에 꼭 필요합니다.
- 생성 이미지에는 눈에 보이지 않는 식별 표시가 들어가는 경우가 있습니다. 앱 사용에는 문제가 없지만, "AI 생성 이미지 포함" 표기 정책을 정해 두면 좋습니다.
- 사용자의 실제 생년월일·이름 같은 개인정보는 프롬프트에 넣지 않습니다.
