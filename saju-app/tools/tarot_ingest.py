"""타로 메이저 아르카나 그림 22장 넣기 (v0.43.1)

사용: python3 -I saju-app/tools/tarot_ingest.py 원본폴더 [시작번호]
- 원본폴더의 그림(png·jpg·webp)을 파일 이름 순서(힉스필드 기본 이름 hf_YYYYMMDD_HHMMSS… = 생성 순서)로
  0번 바보부터 21번 세계까지 차례로 맞춘다. 일부만 다시 넣을 때는 시작번호를 준다(예: 13 → 13번부터)
- 가운데를 2:3 세로로 잘라 480×720 WebP로 저장: saju-app/assets/tarot/m{번호}.webp
- js/tarot-manifest.js를 assets/tarot 폴더 내용으로 다시 쓴다
- 원본폴더에 contact.jpg(번호 붙은 모음)를 만들어 순서를 눈으로 확인한다
"""
import os
import sys
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'tarot')
MANIFEST = os.path.join(ROOT, 'js', 'tarot-manifest.js')
W, H = 480, 720


def crop_23(im):
    w, h = im.size
    if w / h > W / H:
        nw = round(h * W / H); x = (w - nw) // 2
        return im.crop((x, 0, x + nw, h))
    nh = round(w * H / W); y = (h - nh) // 2
    return im.crop((0, y, w, y + nh))


def write_manifest():
    keys = sorted((f[:-5] for f in os.listdir(OUT) if f.endswith('.webp')), key=lambda k: int(k[1:]))
    with open(MANIFEST, 'w', encoding='utf-8') as fp:
        fp.write('// 타로 메이저 아르카나 그림 목록 (tools/tarot_ingest.py가 자동 생성: assets/tarot/m{번호}.webp)\n')
        fp.write('// 비어 있으면 코드로 그린 카드(로마 숫자·상징·이름 + 내 지신)를 씀\n')
        fp.write('export const TAROT_FILES = [' + ', '.join(f"'{k}'" for k in keys) + '];\n')
    return keys


def main():
    src = sys.argv[1]
    start = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    files = sorted(f for f in os.listdir(src) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')) and f != 'contact.jpg')
    os.makedirs(OUT, exist_ok=True)
    thumbs = []
    for i, name in enumerate(files):
        n = start + i
        if n > 21:
            print('22장을 넘는 파일은 건너뜀:', name); continue
        im = crop_23(Image.open(os.path.join(src, name)).convert('RGB')).resize((W, H), Image.LANCZOS)
        im.save(os.path.join(OUT, f'm{n}.webp'), 'WEBP', quality=84, method=6)
        thumbs.append((n, im.resize((160, 240))))
        print(f'm{n}.webp ← {name}')
    if thumbs:
        cols = 6; rows = (len(thumbs) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * 170, rows * 270), (255, 246, 243))
        d = ImageDraw.Draw(sheet)
        for k, (n, t) in enumerate(thumbs):
            x, y = (k % cols) * 170 + 5, (k // cols) * 270 + 5
            sheet.paste(t, (x, y)); d.text((x + 4, y + 244), f'{n}', fill=(60, 40, 50))
        sheet.save(os.path.join(src, 'contact.jpg'), quality=85)
    print('manifest:', write_manifest())


if __name__ == '__main__':
    main()
