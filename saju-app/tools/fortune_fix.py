"""포춘 기계 그림 손질(v0.59): 마젠타 배경으로 만든 띠(소·용·뱀·양)는 유리 돔에 보라·분홍빛이 배어 있고
불투명하게 남음 → 기계 자리(그림 왼쪽 58%)의 마젠타 빛 픽셀만 골라
  · 돔(위 56%) = 밝은 무채색 유리 + 반투명(초록 배경 그림의 돔과 비슷하게)
  · 받침(아래) = 쿠키 구멍 안쪽 남색
으로 바꿈. 지신(오른쪽)은 건드리지 않음(뱀의 보라 한복·분홍 볼 보존).
사용: python3 -I tools/fortune_fix.py [id ...]   (기본 ox dragon snake sheep) — fortune_ingest 뒤에 실행
"""
import sys, os
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR = os.path.join(ROOT, 'assets', 'fortune')
DEFAULT = ['ox', 'dragon', 'snake', 'sheep']
# 쿠키 구멍이 배경과 함께 지워져 뚫린 그림: 구멍 안 한 점(768 기준)에서 투명 칸을 남색으로 메움
HOLES = {'sheep': [(130, 560)]}

def is_magenta(r, g, b, t=28):
    return r - g > t and b - g > t

def fill_hole(px, w, h, seed):
    st, seen, n = [seed], set(), 0
    while st:
        x, y = st.pop()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h): continue
        seen.add((x, y))
        if px[x, y][3] > 200: continue
        px[x, y] = (34, 42, 64, 255); n += 1
        if n > 40000: break
        st += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    return n

def fix(i):
    p = os.path.join(DIR, f'{i}.webp')
    im = Image.open(p).convert('RGBA'); w, h = im.size; px = im.load(); n = 0
    for y in range(h):
        for x in range(int(w * 0.58)):
            r, g, b, a = px[x, y]
            top = y < h * 0.56
            if a < 8 or not is_magenta(r, g, b, 10 if top else 28): continue
            if top and b < r - 25 and b < 120 and 0.14 * w < x < 0.36 * w and y < 0.25 * h: continue  # 붉은 술 장식은 그대로
            L = int(0.3 * r + 0.59 * g + 0.11 * b)
            if top:
                L = min(255, int(L * 1.08) + 20)
                px[x, y] = (int(L * 0.93), int(L * 0.97), L, min(a, 105 if L < 235 else 170))
            else:
                px[x, y] = (34, 42, 64, a)
            n += 1
    for seed in HOLES.get(i, []): n += fill_hole(px, w, h, seed)
    im.save(p, quality=90)
    print(f'{i}: {n}px 손질')

if __name__ == '__main__':
    for i in sys.argv[1:] or DEFAULT: fix(i)
