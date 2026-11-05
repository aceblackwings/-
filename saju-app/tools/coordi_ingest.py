"""코디 소품 넣기: 원본 폴더의 그림을 생성 시각(파일 이름) 순서로 id에 맞춰 배경을 지우고 잘라 assets/coordi/{id}.webp(최대 512)로 저장,
js/coordi-manifest.js(id → 가로/세로 비율) 자동 갱신.
사용: python3 -I tools/coordi_ingest.py 원본폴더 id1 id2 ...   (예: … raw h0 n1 a3)
배경: 초록 소품(h0·n0·a0)은 마젠타, 나머지는 초록 (docs/prompts/coordi-items.md)
"""
import sys, os, glob, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chroma import remove
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'coordi'); MAN = os.path.join(ROOT, 'js', 'coordi-manifest.js')
MAGENTA = {'h0', 'n0', 'a0'}
# 그림마다 손볼 점(2026-11-05 원본 기준)
PRE_FILL_GREEN = {'n2'}      # 구슬 고리 안이 어두운 초록 원으로 칠해짐 → 배경 초록으로 덮은 뒤 지움
POST_DROP_LINES = {'h4'}     # 두건 안쪽에 머리 모양 테두리선이 그려짐 → 홀로 떠 있는 선만 지움(천 가장자리 선은 남김)

def fill_green(src, dst):
    import numpy as np
    a = np.asarray(Image.open(src).convert('RGB')).astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    H, W = g.shape; k = max(2, int(min(H, W) * 0.03))
    edge = np.concatenate([a[:k].reshape(-1, 3), a[-k:].reshape(-1, 3)]); bg = np.median(edge, 0).astype(int)
    m = (g > r + 30) & (g > b + 30)
    a[m] = bg; Image.fromarray(a.astype('uint8')).save(dst)

def drop_lines(im):
    """머리 자리(가운데 빈 곳)와 바깥 빈 곳 사이에 낀 얇은 선만 지움 = 천이 없는 곳의 테두리선"""
    import numpy as np
    from PIL import ImageFilter, ImageDraw
    A = np.asarray(im.getchannel('A')); H, W = A.shape
    clear = Image.fromarray(((A < 60) * 255).astype('uint8'))
    hole = clear.copy(); ImageDraw.floodfill(hole, (W // 2, int(H * 0.62)), 128)   # 머리 자리 = 회색 128로 칠함
    h = np.asarray(hole); in_hole = h == 128; outside = h == 255
    grow = lambda m, n: np.asarray(Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.MaxFilter(n))) > 0
    near_hole = grow(in_hole, 31); near_out = grow(outside, 31)
    thin = (A > 0) & near_hole & near_out
    a = np.array(im); a[..., 3] = np.where(thin, 0, a[..., 3]); return Image.fromarray(a)

def ingest(src_dir, ids):
    files = sorted(glob.glob(os.path.join(src_dir, '*.png')) + glob.glob(os.path.join(src_dir, '*.jpg')))
    if len(files) < len(ids): sys.exit(f'그림 {len(files)}장 < id {len(ids)}개')
    os.makedirs(OUT, exist_ok=True)
    for f, i in zip(files, ids):
        tmp = os.path.join(src_dir, f'_{i}.png')
        name = os.path.basename(f)
        if i in PRE_FILL_GREEN: fill_green(f, tmp); f = tmp
        remove(f, tmp, 'magenta' if i in MAGENTA else 'green')
        im = Image.open(tmp)
        if i in POST_DROP_LINES: im = drop_lines(im)
        bb = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
        im = im.crop(bb); im.thumbnail((512, 512), Image.LANCZOS)
        im.save(os.path.join(OUT, f'{i}.webp'), quality=90); os.remove(tmp)
        print(f'{name} → {i}.webp {im.size}')
    write_manifest()

def write_manifest():
    ratio = {}
    for p in sorted(glob.glob(os.path.join(OUT, '*.webp'))):
        w, h = Image.open(p).size; ratio[os.path.splitext(os.path.basename(p))[0]] = round(w / h, 3)
    with open(MAN, 'w') as fp:
        fp.write('// 자동 생성 파일 (tools/coordi_ingest.py) — 손으로 고치지 마세요. 코디 소품 그림 id → 가로/세로 비율\n')
        fp.write(f'export const COORDI_IMAGES = {json.dumps(ratio)};\n')

if __name__ == '__main__':
    ingest(sys.argv[1], sys.argv[2:])
