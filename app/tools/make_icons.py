# 앱 아이콘·시작 화면·스토어 그림 만들기: python3 -I app/tools/make_icons.py
# 재료 = saju-app/assets/char/dragon_s3.webp (웹 manifest 아이콘과 같은 용 지신), 바탕 = 앱 크림색 #fff6f3
import os, sys
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
RES = os.path.join(ROOT, 'app/android/app/src/main/res')
STORE = os.path.join(ROOT, 'docs/store')
BG = (255, 246, 243, 255); ROSE = (236, 127, 160, 255)
char = Image.open(os.path.join(ROOT, 'saju-app/assets/char/dragon_s3.webp')).convert('RGBA')
char = char.crop(char.getbbox())

def fit(img, box):
    w, h = img.size; s = min(box / w, box / h)
    return img.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)

def tile(size, scale=0.86, round_=False, ring=True, square=False):
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if square: d.rectangle([0, 0, size - 1, size - 1], fill=BG); ring = False
    elif round_: d.ellipse([0, 0, size - 1, size - 1], fill=BG)
    else: d.rounded_rectangle([0, 0, size - 1, size - 1], radius=round(size * 0.22), fill=BG)
    if ring:
        w = max(1, round(size * 0.035)); m = round(size * 0.06)
        (d.ellipse if round_ else (lambda b, **k: d.rounded_rectangle(b, radius=round(size * 0.18), **k)))([m, m, size - 1 - m, size - 1 - m], outline=ROSE, width=w)
    c = fit(char, round(size * scale * 0.82))
    im.alpha_composite(c, ((size - c.width) // 2, (size - c.height) // 2 + round(size * 0.02)))
    return im

def foreground(size):  # 적응형 아이콘: 바깥 1/6씩은 잘릴 수 있어 가운데 66% 안에
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    c = fit(char, round(size * 0.64)); im.alpha_composite(c, ((size - c.width) // 2, (size - c.height) // 2 + round(size * 0.015)))
    return im

for dpi, n in {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}.items():
    tile(n).save(os.path.join(RES, f'mipmap-{dpi}/ic_launcher.png'))
    tile(n, round_=True).save(os.path.join(RES, f'mipmap-{dpi}/ic_launcher_round.png'))
    foreground(round(n * 2.25)).save(os.path.join(RES, f'mipmap-{dpi}/ic_launcher_foreground.png'))
with open(os.path.join(RES, 'values/ic_launcher_background.xml'), 'w') as f:
    f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#FFF6F3</color>\n</resources>\n')

# 시작 화면(splash.png 전부): 크림 바탕 + 가운데 지신
for dirpath, _, files in os.walk(RES):
    for fn in files:
        if fn == 'splash.png':
            p = os.path.join(dirpath, fn); w, h = Image.open(p).size
            im = Image.new('RGBA', (w, h), BG); c = fit(char, round(min(w, h) * 0.42))
            im.alpha_composite(c, ((w - c.width) // 2, (h - c.height) // 2)); im.convert('RGB').save(p)

# 스토어: 아이콘 512(32비트 PNG) · 그래픽 이미지 1024×500(알파 없음)
os.makedirs(STORE, exist_ok=True)
tile(512, scale=1.0, square=True).convert('RGB').save(os.path.join(STORE, 'icon-512.png'))  # 구글이 모서리를 깎으니 꽉 찬 정사각형
fg = Image.new('RGBA', (1024, 500), BG); d = ImageDraw.Draw(fg)
for i in range(500):  # 아래로 갈수록 옅은 분홍
    t = i / 499; d.line([(0, i), (1024, i)], fill=(255, round(246 - 18 * t), round(243 - 10 * t), 255))
c = fit(char, 400); fg.alpha_composite(c, (60, 50))
font = lambda s: ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc', s, index=1)
try: f1, f2 = font(78), font(34)
except Exception: f1 = f2 = ImageFont.load_default()
d.text((500, 150), '12지신 강림', font=f1, fill=(75, 57, 66, 255))
d.text((504, 262), '광고 없는 무료 사주 · 타로', font=f2, fill=(208, 132, 58, 255))
d.text((504, 312), '매일 지신을 키우는 운세 습관', font=f2, fill=(125, 104, 115, 255))
fg.convert('RGB').save(os.path.join(STORE, 'feature-1024x500.png'))
print('아이콘·시작 화면·스토어 그림 완료')
