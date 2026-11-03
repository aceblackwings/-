"""생성 그림 일괄 처리: 원본 폴더 → (생성 시각순으로 시트 번호에 맞춤) → 배경 제거 → WebP → 앱 목록 갱신
사용:
  python3 -I tools/ingest.py zodiac <띠키> <원본폴더>      예: zodiac horse /tmp/raw/horse
  python3 -I tools/ingest.py zodiac rat /tmp/raw/rat swap=calm:sleepy   (생성 순서가 바뀐 두 칸을 맞바꿈, 여러 개면 쉼표)
  python3 -I tools/ingest.py manifest                       (assets 폴더를 훑어 js/asset-manifest.js만 다시 만들기)
원본 파일 이름이 힉스필드 기본 이름(hf_YYYYMMDD_HHMMSS_...)이면 생성 시각순, 아니면 이름순으로 정렬한다.
"""
import sys, os, re, json, glob
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from chroma import remove

STAGES = ['s2', 's1', 's3', 's4', 's5']  # 시트 01~05
MOODS = ['smile', 'excited', 'fighting', 'love', 'wow', 'thanks', 'calm', 'sleepy']  # 시트 06~13

def order(files):
    def k(f):
        m = re.search(r'hf_(\d{8})_(\d{6})', os.path.basename(f))
        return (0, m.group(1) + m.group(2)) if m else (1, os.path.basename(f))
    return sorted(files, key=k)

def detect_bg(path, fallback):
    """그림 테두리 색을 보고 크로마키 색(green/magenta)을 고른다. 시트 지정색과 다르게 생성된 그림 대비."""
    im = Image.open(path).convert('RGB'); w, h = im.size
    px = [im.getpixel((x, y)) for x in range(0, w, max(1, w // 32)) for y in (0, h - 1)] + \
         [im.getpixel((x, y)) for y in range(0, h, max(1, h // 32)) for x in (0, w - 1)]
    green = sum(1 for r, g, b in px if g - max(r, b) > 60)
    magenta = sum(1 for r, g, b in px if min(r, b) - g > 60)
    if max(green, magenta) < len(px) * 0.3: return fallback
    return 'green' if green >= magenta else 'magenta'

def zodiac(key, src, swaps=()):
    spec = json.load(open(os.path.join(HERE, 'zodiac_specs.json')))[key]
    files = order([f for f in glob.glob(os.path.join(src, '*')) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))])
    targets = [('char', f'{key}_{s}', 768) for s in STAGES] + [('emo', f'{key}_{m}', 512) for m in MOODS]
    for a, b in swaps:  # 사용자가 시트 순서와 다르게 생성한 두 칸 맞바꾸기
        ia = next(i for i, t in enumerate(targets) if t[1] == f'{key}_{a}'); ib = next(i for i, t in enumerate(targets) if t[1] == f'{key}_{b}')
        targets[ia], targets[ib] = targets[ib], targets[ia]
    report = {'zodiac': key, 'found': len(files), 'expected': len(targets), 'items': []}
    if len(files) != len(targets):
        report['warning'] = f'그림 수가 다릅니다: {len(files)}장 (필요 {len(targets)}장). 생성 시각순으로 앞에서부터 맞췄으니 확인이 필요합니다.'
    os.makedirs(os.path.join(APP, 'assets', 'char'), exist_ok=True); os.makedirs(os.path.join(APP, 'assets', 'emo'), exist_ok=True)
    tmp = os.path.join(src, '_cut'); os.makedirs(tmp, exist_ok=True)
    for (kind, name, size), f in zip(targets, files):
        cut = os.path.join(tmp, name + '.png')
        bg = detect_bg(f, spec['bg'])
        bbox, clear = remove(f, cut, bg)
        im = Image.open(cut).resize((size, size), Image.LANCZOS)
        out = os.path.join(APP, 'assets', kind, name + '.webp')
        im.save(out, 'WEBP', quality=88, method=6)
        flag = '배경이 거의 안 지워짐(배경색 확인)' if clear < 0.25 else ('그림이 너무 작음' if clear > 0.9 else '')
        report['items'].append({'file': os.path.basename(f), 'to': f'{kind}/{name}.webp', 'kb': os.path.getsize(out) // 1024, 'bg': bg, 'clear': round(clear, 2), 'flag': flag})
    contact(tmp, [t[1] for t in targets][:len(files)], os.path.join(src, 'contact.jpg'))
    manifest()
    return report

def contact(tmp, names, out):
    from PIL import ImageDraw
    cell = 220; cols = 7; rows = (len(names) + cols - 1) // cols
    W = Image.new('RGB', (cols * cell, rows * (cell + 18)), (24, 18, 48)); d = ImageDraw.Draw(W)
    for i, n in enumerate(names):
        im = Image.open(os.path.join(tmp, n + '.png')); im.thumbnail((cell, cell))
        x = (i % cols) * cell; y = (i // cols) * (cell + 18)
        W.paste(im, (x, y), im); d.text((x + 4, y + cell + 2), f'{i + 1:02d} {n}', fill=(255, 255, 255))
    W.save(out, quality=85)

def manifest():
    def keys(kind):
        return sorted(os.path.basename(p)[:-5] for p in glob.glob(os.path.join(APP, 'assets', kind, '*.webp')))
    js = ('// 자동 생성 파일 (tools/ingest.py manifest) — 손으로 고치지 마세요\n'
          f'export const CHAR_FILES = {json.dumps(keys("char"))};\n'
          f'export const EMO_FILES = {json.dumps(keys("emo"))};\n'
          f'export const SCENE_FILES = {json.dumps(keys("scene"))};\n')
    open(os.path.join(APP, 'js', 'asset-manifest.js'), 'w').write(js)
    return js

if __name__ == '__main__':
    if sys.argv[1] == 'manifest': print(manifest())
    elif sys.argv[1] == 'zodiac':
        swaps = [tuple(x.split(':')) for a in sys.argv[4:] if a.startswith('swap=') for x in a[5:].split(',')]
        print(json.dumps(zodiac(sys.argv[2], sys.argv[3], swaps), ensure_ascii=False, indent=1))
