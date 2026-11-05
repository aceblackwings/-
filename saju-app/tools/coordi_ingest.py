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

def ingest(src_dir, ids):
    files = sorted(glob.glob(os.path.join(src_dir, '*.png')) + glob.glob(os.path.join(src_dir, '*.jpg')))
    if len(files) < len(ids): sys.exit(f'그림 {len(files)}장 < id {len(ids)}개')
    os.makedirs(OUT, exist_ok=True)
    for f, i in zip(files, ids):
        tmp = os.path.join(src_dir, f'_{i}.png')
        remove(f, tmp, 'magenta' if i in MAGENTA else 'green')
        im = Image.open(tmp); bb = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
        im = im.crop(bb); im.thumbnail((512, 512), Image.LANCZOS)
        im.save(os.path.join(OUT, f'{i}.webp'), quality=90); os.remove(tmp)
        print(f'{os.path.basename(f)} → {i}.webp {im.size}')
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
