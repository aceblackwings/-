"""크로마키 배경 제거: 초록(#00FF00) 또는 마젠타(#FF00FF) 단색 배경을 투명하게 만들고 가장자리 번짐을 정리한다.
사용: python3 -I tools/chroma.py 입력.png 출력.png [green|magenta] [최대크기px]
"""
import sys
import numpy as np
from PIL import Image

def _hsv(r, g, b):
    mx = np.maximum(np.maximum(r, g), b); mn = np.minimum(np.minimum(r, g), b); d = mx - mn + 1e-6
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, (mx - mn) / (mx + 1e-6), mx

def _border_hue(hue, sat, val):
    """테두리 띠(가장자리 3%)에서 채도 높은 픽셀의 색상 중앙값 = 배경 색상(그라데이션 배경 대비)"""
    H, W = hue.shape; k = max(2, int(min(H, W) * 0.03))
    m = np.zeros_like(hue, bool); m[:k] = m[-k:] = True; m[:, :k] = m[:, -k:] = True
    m &= (sat > 0.4) & (val > 0.4)
    hs = hue[m]
    if hs.size == 0: return 300.0
    # 0/360 경계를 넘는 색상도 맞게 평균 내려고 원형 평균
    ang = np.deg2rad(hs); return float(np.rad2deg(np.arctan2(np.sin(ang).mean(), np.cos(ang).mean())) % 360)

def remove(src, dst, key='green', size=None):
    im = Image.open(src).convert('RGB')
    a = np.asarray(im).astype(np.float32) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    if key == 'green':
        # 배경색 우세 정도: g가 r·b보다 얼마나 큰지. 0.12 이하 → 불투명, 0.35 이상 → 투명
        dom = g - np.maximum(r, b)
        alpha = np.clip(1 - (dom - 0.12) / (0.35 - 0.12), 0, 1)
        # 반투명 가장자리의 배경색 번짐(스필) 제거
        g2 = np.minimum(g, np.maximum(r, b) + 0.04)
        out = np.stack([r, g2, b], -1)
    else:
        # 마젠타: 분홍·빨강(하트·볼·귀)을 지키려고 테두리에서 잰 실제 배경 색상(hue)과의 거리로 판단
        hue, sat, val = _hsv(r, g, b)
        h0 = _border_hue(hue, sat, val)
        dh = np.abs((hue - h0 + 180) % 360 - 180)
        a_h = np.clip((dh - 14) / (26 - 14), 0, 1)        # 색상이 배경과 14° 이내 → 투명, 26° 이상 → 불투명
        a_s = np.clip((0.62 - sat) / (0.62 - 0.45), 0, 1)  # 채도가 낮은 흰색·회색·연보라 털은 불투명 (배경 채도 0.7 이상)
        a_v = np.clip((0.75 - val) / (0.75 - 0.55), 0, 1)  # 어두운 보라 외곽선·눈동자는 불투명 (배경 명도 0.9 이상)
        alpha = np.maximum(a_h, np.maximum(a_s, a_v))
        # 스필 제거는 반투명 가장자리에만(안쪽 분홍은 그대로)
        edge = (alpha < 1)[..., None]
        lim = g + 0.04
        fixed = np.stack([np.minimum(r, np.maximum(lim, r * alpha)), g, np.minimum(b, np.maximum(lim, b * alpha))], -1)
        out = np.where(edge, fixed, np.stack([r, g, b], -1))
    rgba = np.dstack([out, alpha])
    res = Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA')
    bbox = res.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    if size:
        res.thumbnail((size, size), Image.LANCZOS)
    res.save(dst)
    return bbox, float((alpha < 0.05).mean())

if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    key = sys.argv[3] if len(sys.argv) > 3 else 'green'
    size = int(sys.argv[4]) if len(sys.argv) > 4 else None
    bbox, clear = remove(src, dst, key, size)
    print(f'{dst}: 투명 영역 {clear * 100:.0f}%, 그림 범위 {bbox}')
