"""크로마키 배경 제거: 초록 또는 마젠타 단색 배경(실제 색은 테두리에서 측정)을 투명하게 만들고 가장자리 번짐을 정리한다.
사용: python3 -I tools/chroma.py 입력.png 출력.png [green|magenta] [최대크기px]
"""
import sys
import numpy as np
from PIL import Image

def _hsv(r, g, b):
    mx = np.maximum(np.maximum(r, g), b); mn = np.minimum(np.minimum(r, g), b); d = mx - mn + 1e-6
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, (mx - mn) / (mx + 1e-6), mx

def _border_hue(hue, sat, val, fallback=300.0):
    """테두리 띠(가장자리 3%)에서 채도 높은 픽셀의 색상 중앙값 = 배경 색상(그라데이션 배경 대비)"""
    H, W = hue.shape; k = max(2, int(min(H, W) * 0.03))
    m = np.zeros_like(hue, bool); m[:k] = m[-k:] = True; m[:, :k] = m[:, -k:] = True
    m &= (sat > 0.4) & (val > 0.4)
    hs = hue[m]
    if hs.size == 0: return fallback
    # 0/360 경계를 넘는 색상도 맞게 평균 내려고 원형 평균
    ang = np.deg2rad(hs); return float(np.rad2deg(np.arctan2(np.sin(ang).mean(), np.cos(ang).mean())) % 360)

def remove(src, dst, key='green', size=None):
    im = Image.open(src).convert('RGB')
    a = np.asarray(im).astype(np.float32) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # 테두리에서 잰 실제 배경 색상(hue)과의 거리로 판단 (초록·마젠타 공통).
    # 배경과 색이 비슷한 소품(초록 클로버, 분홍 하트)도 색상이 15° 넘게 다르면 지킨다.
    hue, sat, val = _hsv(r, g, b)
    h0 = _border_hue(hue, sat, val, 134.0 if key == 'green' else 300.0)
    dh = np.abs((hue - h0 + 180) % 360 - 180)
    a_h = np.clip((dh - 8) / (16 - 8), 0, 1)          # 색상이 배경과 8° 이내 → 투명, 16° 이상 → 불투명 (배경 편차는 보통 4° 이내)
    a_s = np.clip((0.62 - sat) / (0.62 - 0.45), 0, 1)  # 채도가 낮은 흰색·회색·연한 털은 불투명 (배경 채도 0.7 이상)
    a_v = np.clip((0.75 - val) / (0.75 - 0.55), 0, 1)  # 어두운 외곽선·눈동자는 불투명 (배경 명도 0.8 이상)
    alpha = np.maximum(a_h, np.maximum(a_s, a_v))
    # 밝은 빛(후광·구슬 빛)과 배경이 섞인 픽셀은 색상이 배경과 달라 남으므로, 밝은 곳에서는 배경색 우세도로 한 번 더 지운다
    # (클로버처럼 명도가 낮은 소품은 해당 없음). 마젠타는 보라 한복·분홍 하트가 밝아서 이 규칙을 쓰지 않는다
    if key == 'green':
        dom = g - np.maximum(r, b)
        a_dom = np.clip(1 - (dom - 0.12) / (0.35 - 0.12), 0, 1)
        alpha = np.where(val > 0.78, np.minimum(alpha, a_dom), alpha)
    # 반투명 가장자리에만 배경색 번짐(스필) 제거 (안쪽 색은 그대로)
    edge = (alpha < 1)[..., None]
    lim = g + 0.04
    if key == 'green':
        fixed = np.stack([r, np.minimum(g, np.maximum(r, b) + 0.04), b], -1)
    else:
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
