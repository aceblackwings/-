# 쇼츠 자동 제작기

주제 대본(JSON) 하나로 **9:16 쇼츠(1분 이내)**를 만든다: 위 제목 2줄(노랑·빨강) · 가운데 모션그래픽 장면 · 강조 자막 · edge-tts 음성 · 직접 만든 배경음악.

## 실행
```bash
pip install -r requirements.txt
sudo apt-get install -y ffmpeg fonts-noto-cjk   # 윈도우는 ffmpeg 설치 + Noto Sans CJK KR 글꼴
python3 make_short.py stories/organ-donation-7.json
python3 make_short.py stories/organ-donation-7.json --preview 2,10,30   # 그 순간 화면만 jpg로
```
결과: `output/<id>/<id>.mp4` · `thumbnail.jpg` · `description.txt`(설명란·출처)

## 새 영상 만들기
`stories/`에 JSON 하나를 만든다.
- `title`: 제목 2줄, `voice`: `ko-KR-InJoonNeural`(남) / `ko-KR-SunHiNeural`(여), `rate`: 말 속도
- `segments`: 문장마다 `scene`(장면 이름) · `text`(대사) · `keys`(노랑 강조 낱말)
- 장면 이름: `hook` `profile` `clinic` `years` `ecg` `family` `organs` `seven` `candle` `ending` (`shortsmaker/scenes.py`)
- 사실은 반드시 기사로 확인하고 `sources`에 주소를 남긴다(설명란에 자동 기재). 없는 인용문을 만들지 않는다.

## 구조
| 파일 | 하는 일 |
|---|---|
| `shortsmaker/tts.py` | 문장별 음성 합성 → 길이 측정 → 이어 붙이기(프록시 환경 자동 대응) |
| `shortsmaker/gfx.py` | 글꼴·이징·아이콘(4배 그려 매끈하게)·빛 번짐 |
| `shortsmaker/scenes.py` | 장면별 모션그래픽(1080×1080) |
| `shortsmaker/render.py` | 제목·장면·자막 합성, 천천히 확대, 페이드 → ffmpeg |
| `shortsmaker/bgm.py` | 저작권 없는 배경음악 생성(패드 + 아르페지오) |
| `shortsmaker/sources.py` | Pexels·Pixabay 무료 영상 검색(키가 있을 때, 아직 미시험) |

## 저작권 원칙
- 영상 그래픽·음악은 코드로 직접 만든다. 외부 영상은 Pexels·Pixabay처럼 상업 이용이 허락된 것만 쓴다.
- 허락 없는 방송·유튜브 영상은 쓰지 않는다(저작권 침해 + 유튜브 「재사용 콘텐츠」 수익 정지).
