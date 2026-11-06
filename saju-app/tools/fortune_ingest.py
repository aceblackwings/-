"""포춘 기계·쿠키 그림 넣기(v0.59): 원본 폴더의 그림을 파일 이름(생성 시각) 순서로 아래 id에 맞춰 배경을 지우고 잘라
assets/fortune/{id}.webp(최대 768)로 저장, js/fortune-manifest.js(id → 가로/세로 비율) 자동 갱신.
사용: python3 -I tools/fortune_ingest.py 원본폴더 [id1 id2 ...]   (id를 안 주면 시트 순서 16개 전부)
프롬프트 시트: docs/prompts/fortune-machine.md
"""
import sys, os, glob, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chroma import remove
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'fortune'); MAN = os.path.join(ROOT, 'js', 'fortune-manifest.js')
SPECS = json.load(open(os.path.join(ROOT, 'tools', 'zodiac_specs.json')))
ORDER = ['machine', 'cookie', 'cookie_l', 'cookie_r'] + list(SPECS)

def bg_of(i):
    return SPECS[i]['bg'] if i in SPECS else 'green'

def ingest(src_dir, ids):
    files = sorted(glob.glob(os.path.join(src_dir, '*.png')) + glob.glob(os.path.join(src_dir, '*.jpg')) + glob.glob(os.path.join(src_dir, '*.webp')))
    files = [f for f in files if not os.path.basename(f).startswith('_') and 'contact' not in f]
    if len(files) < len(ids): sys.exit(f'그림 {len(files)}장 < id {len(ids)}개')
    os.makedirs(OUT, exist_ok=True)
    for f, i in zip(files, ids):
        tmp = os.path.join(src_dir, f'_{i}.png')
        remove(f, tmp, bg_of(i))
        im = Image.open(tmp)
        bb = im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
        im = im.crop(bb); im.thumbnail((768, 768), Image.LANCZOS)
        im.save(os.path.join(OUT, f'{i}.webp'), quality=90); os.remove(tmp)
        print(f'{os.path.basename(f)} → {i}.webp {im.size}')
    write_manifest()

def write_manifest():
    ratio = {}
    for p in sorted(glob.glob(os.path.join(OUT, '*.webp'))):
        w, h = Image.open(p).size; ratio[os.path.splitext(os.path.basename(p))[0]] = round(w / h, 3)
    with open(MAN, 'w') as fp:
        fp.write('// 자동 생성 파일 (tools/fortune_ingest.py) — 손으로 고치지 마세요. 포춘 기계·쿠키 그림 id → 가로/세로 비율\n')
        fp.write(f'export const FORTUNE_IMAGES = {json.dumps(ratio)};\n')

if __name__ == '__main__':
    if len(sys.argv) < 2: sys.exit(__doc__)
    ingest(sys.argv[1], sys.argv[2:] or ORDER)
