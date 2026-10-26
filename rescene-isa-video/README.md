# 다섯 명 곁의 한 사람 — 리센느와 김혜수 이사의 이야기

약 5분(306초~) 분량 다큐멘터리 영상. Remotion 모션그래픽 + ElevenLabs 나레이션 + Suno BGM + 합성 효과음 + AI 보조 이미지.

## 빠른 시작

```bash
npm install
cp .env.example .env        # 키 입력
npm run narration           # ElevenLabs → public/narration/s01..s13.mp3
npm run measure             # 나레이션 길이 측정 → 장면 길이 자동 조정
npm run music               # Suno → public/bgm/hope|struggle|rise.mp3
npm run images              # AI 보조 이미지 → public/ai/*.png
# 실제 사진을 public/images/ 에 넣고
npm run studio              # 미리보기 / 타이밍 확인
npm run render              # out/rescene-isa.mp4
```

파일이 없는 슬롯은 자동으로 대체 그래픽이 나오므로 단계별로 채워 가며 확인할 수 있습니다.

## 구성 (13장면)

| # | 장면 | BGM | 핵심 모션그래픽 | 효과음 |
|---|---|---|---|---|
| s01 | 무대 옆의 한 사람 | hope | 다섯 실루엣 → 카메라 팬 → 여섯 번째 실루엣 | 심장박동, 함성, 피아노 |
| s02 | 타이틀 | hope | 블러 인 타이틀 | 휙, 임팩트 |
| s03 | 버클리에서 시작된 꿈 | hope | 하단 자막 바, 선후배 연결 카드 | 휙 |
| s04 | 천만 원의 회사 | hope | 동전 3개 → ₩10,000,000 카운터, 역할 분담 카드 | 틱, 차임 |
| s05 | 2024년 3월, 데뷔 | hope | 날짜 스탬프, 멤버 이름 칩 | 셔터, 팝 |
| s06 | 모든 것이 처음 | struggle | 물음표 아이콘 | 팝 |
| s07 | 흙바닥 운동장의 무대 | struggle | 흙먼지 파티클, 조명/응원봉/열정 리스트 | 팝 |
| s08 | 904위 | struggle | 1→904 카운터, 가라앉는 차트 | 라이저, 임팩트 |
| s09 | 서로를 붙잡아 준 사람 | struggle | 멤버 5인 + 이사님 연결망 | 심장박동, 틱 |
| s10 | 뜻밖의 변화 (역주행) | rise | SNS 카드 확산 → 904위→1위 카운트다운 | 알림음, 라이저, 임팩트, 차임 |
| s11 | 첫 번째 1위 | rise | 트로피 + 컨페티 | 임팩트, 차임, 함성 |
| s12 | 멈추지 않는 기세 | rise | 트로피 3개 타임라인, 홍보대사 배지 | 임팩트×3, 차임 |
| s13 | 다음 장 | hope | 3줄 회상 → 엔딩 문구, 페이드아웃 | 피아노, 휙 |

대본과 장면 기본 길이는 `src/scenes.json` 한 곳에서 관리합니다. 대본을 고치면 `npm run narration -- --only=s04 --force` 처럼 해당 장면만 다시 생성하세요.

## 사진 슬롯 (public/images/)

실존 인물(멤버·이사) 이미지는 **AI로 만들지 않고 실제 사진만** 씁니다.

| 파일명 | 장면 | 권장 소스 |
|---|---|---|
| `isa_portrait.jpg` | s03 | 소속사 제공 공식 사진 |
| `debut_group.jpg` | s05 | 데뷔 공식 단체 사진 |
| `waiting_room.jpg` | s09 | 공식 유튜브 비하인드(대기실) 캡처 |
| `first_win.jpg` | s11 | 공식 채널의 1위 앵콜·소감 영상 캡처 |
| `ending_group.jpg` | s13 | 공식 단체 사진 |

저작권 체크리스트
1. 가장 안전한 방법: 더뮤즈엔터테인먼트에 사용 허락 받기 (2차 창작 채널은 이메일 문의로 허락받는 경우가 많음)
2. Wikimedia Commons `Category:RESCENE` 의 CC BY / CC BY-SA 이미지 → 출처·라이선스 표기 필수
3. 공식 SNS·유튜브 캡처는 짧게, 비평·해설 목적에 한해 출처 표기 (공정이용은 상황에 따라 판단이 달라짐)
4. 지상파(KBS·MBC·SBS) 방송 화면은 사용하지 않음. 방송 내용은 나레이션과 모션그래픽으로만 설명

## AI 보조 이미지 (public/ai/)

`ai-prompts.json` — 손·사물·공간만 생성 (얼굴 없음). 화면 오른쪽 위에 "AI 생성 이미지 · 이해를 돕기 위한 재연" 표기가 자동으로 붙습니다.
이미지→영상 도구(Kling, Runway, Veo 등)로 5초 클립을 만들고 싶다면 같은 파일의 `video` 모션 프롬프트를 쓰세요.

## 오디오

- **나레이션**: 기본 모델 `eleven_v4`. 계정에서 쓸 수 없으면 `eleven_v3` → `eleven_multilingual_v2` 순으로 자동 대체. 차분하고 따뜻한 한국어 여성/남성 다큐 보이스 추천
- **BGM**: hope(피아노) → struggle(첼로·앰비언트) → rise(빌드업 시네마틱 팝) → hope. 나레이션 구간에서는 자동으로 볼륨을 낮춤(덕킹, 0.42 → 0.16)
- **효과음**: `public/sfx/*.wav` — ffmpeg로 직접 합성해 저작권 걱정이 없음

## 팩트 출처

- 버클리 선후배, 1천만 원 법인 설립, 인이어 일화, 운동회 무대: [일간스포츠](https://isplus.com/article/view/isp202607120081), [엑스포츠뉴스(다음)](https://v.daum.net/v/20260713161151906)
- 운동회 무대 재조명 / 거제 야호: [스포츠경향](https://sports.khan.co.kr/article/202605271109003)
- 멜론 TOP100 1위, 일간 904위 출발: [스포츠경향](https://sports.khan.co.kr/article/202607090722003)
- 첫 1위(7/14 더쇼), 눈물: [스포츠경향](https://sports.khan.co.kr/article/202607150729003), [스포츠경향](https://sports.khan.co.kr/article/202607151007003)
- 인기가요 1위·통산 세 번째 트로피: [데일리안](https://www.dailian.co.kr/news/view/1671083/), [스포츠경향](https://sports.khan.co.kr/article/202607261742003)
- 거제시 홍보대사: [데일리안](https://www.dailian.co.kr/news/view/1647899/)
