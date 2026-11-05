"""왕관 없는 5단계 그림 만들기(v0.58.2): 머리 코디 소품을 쓴 날 5단계 이상 지신의 왕관을 숨기려고,
assets/char/{띠}_s5.webp의 왕관 칸(js/coordi-anchors.js COORDI_CROWN)을 왼쪽·오른쪽·위쪽 가장자리 색으로 메워
assets/char/{띠}_s5_nocrown.webp로 저장한다. 왕관 밑동(칸 아래쪽)은 머리 소품이 덮는다.
사용: python3 -I tools/crownless.py   (다음에 python3 -I tools/ingest.py manifest)
"""
import os, re
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'js', 'coordi-anchors.js'), encoding='utf-8').read()
body = src[src.index('COORDI_CROWN = {'):]; body = body[:body.index('};')]
CROWN = {k: [float(x) for x in v.split(',')] for k, v in re.findall(r'(\w+): \[([^\]]+)\]', body)}

def crown_mask(a, box):
    """왕관 칸(조금 넓혀서) 안의 금빛·보석 빨강 + 그 둘레 외곽선(7px 넓힘)"""
    from PIL import ImageFilter
    H, W = a.shape[:2]; r, g, b, al = [a[..., k] / 255 for k in range(4)]
    mx = np.maximum(np.maximum(r, g), b); mn = np.minimum(np.minimum(r, g), b); d = mx - mn + 1e-6
    hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60; sat = (mx - mn) / (mx + 1e-6)
    x0, y0 = max(0, int((box[0] - 3) / 100 * W)), max(0, int((box[1] - 3) / 100 * H)); x1, y1 = int((box[2] + 3) / 100 * W), int((box[3] + 4) / 100 * H)
    reg = np.zeros((H, W), bool); reg[y0:y1, x0:x1] = True
    gold = (hue > 36) & (hue < 62) & (sat > 0.4) & (mx > 0.55) & (al > 0.5)
    gem = ((hue < 12) | (hue > 340)) & (sat > 0.45) & (mx > 0.35) & (al > 0.5)
    seed = gold & reg
    near = np.asarray(Image.fromarray((seed * 255).astype('uint8')).filter(ImageFilter.MaxFilter(15))) > 0
    m = (seed | (gem & near)) & reg
    # 금빛 사이 틈(보석 테·외곽선·반짝임)까지 덮도록 닫기(넓혔다 좁힘) 후 외곽선 두께만큼 넓힘
    img = Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.MaxFilter(25)).filter(ImageFilter.MinFilter(19))
    # 왕관 뾰족한 끝의 외곽선은 금빛보다 위로 더 나와 있어서 위쪽으로 더 넓힘
    g2 = np.asarray(img.filter(ImageFilter.MaxFilter(19))) > 0
    up = np.zeros_like(g2); up[:-8] = g2[8:]
    return g2 | up

def inpaint(a, m):
    """양파 껍질 메우기: 알려진 이웃(8방향) 평균으로 바깥부터 한 겹씩"""
    a = a.copy(); known = ~m
    while (~known).any():
        acc = np.zeros_like(a); cnt = np.zeros(a.shape[:2])
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dy == 0 and dx == 0: continue
                sh = np.roll(np.roll(a, dy, 0), dx, 1); kn = np.roll(np.roll(known, dy, 0), dx, 1)
                acc += sh * kn[..., None]; cnt += kn
        front = (~known) & (cnt > 0)
        if not front.any(): break
        a[front] = acc[front] / cnt[front][:, None]; known = known | front
    return a

def fill(path, box, out):
    a = np.asarray(Image.open(path).convert('RGBA')).astype(float)
    m = crown_mask(a, box)
    Image.fromarray(inpaint(a, m).clip(0, 255).astype('uint8')).save(out, quality=92)
    return m.mean()

if __name__ == '__main__':
    for z, box in CROWN.items():
        p = os.path.join(ROOT, 'assets', 'char', f'{z}_s5.webp')
        fill(p, box, os.path.join(ROOT, 'assets', 'char', f'{z}_s5_nocrown.webp')); print(z, box)
