"""유료 부적 종이 그림 넣기(v0.60): 원본 폴더의 그림을 파일 이름(생성 시각) 순서로 id에 맞춰
5:8 세로(300×480 비율) 가운데 자르기 → assets/paidcharm/{id}.webp(600×960), js/paidcharm-manifest.js 자동 갱신.
배경 제거 없음(종이가 화면을 꽉 채우는 그림). 황금 쿠키(golden)는 fortune_ingest.py로 넣음.
사용: python3 -I tools/paidcharm_ingest.py 원본폴더 [gold red]
프롬프트 시트: docs/prompts/paid-charm.md
"""
import sys, os, glob, json
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'paidcharm'); MAN = os.path.join(ROOT, 'js', 'paidcharm-manifest.js')
W, H = 600, 960

def ingest(src, ids):
    files = sorted(f for ext in ('png', 'jpg', 'jpeg', 'webp') for f in glob.glob(os.path.join(src, f'*.{ext}')) if 'contact' not in f)
    if len(files) < len(ids): sys.exit(f'그림 {len(files)}장 < id {len(ids)}개')
    os.makedirs(OUT, exist_ok=True)
    for f, i in zip(files, ids):
        im = Image.open(f).convert('RGB'); w, h = im.size
        if w / h > W / H: nw = round(h * W / H); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
        else: nh = round(w * H / W); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
        im.resize((W, H), Image.LANCZOS).save(os.path.join(OUT, f'{i}.webp'), quality=88)
        print(f'{os.path.basename(f)} → {i}.webp')
    ratio = {os.path.splitext(os.path.basename(p))[0]: round(W / H, 3) for p in sorted(glob.glob(os.path.join(OUT, '*.webp')))}
    with open(MAN, 'w') as fp:
        fp.write('// 자동 생성 파일 (tools/paidcharm_ingest.py) — 손으로 고치지 마세요. 유료 부적 종이 그림 id → 가로/세로 비율 (gold 금박 한지 · red 붉은 한지)\n')
        fp.write(f'export const PAID_PAPERS = {json.dumps(ratio)};\n')

if __name__ == '__main__':
    if len(sys.argv) < 2: sys.exit(__doc__)
    ingest(sys.argv[1], sys.argv[2:] or ['gold', 'red'])
