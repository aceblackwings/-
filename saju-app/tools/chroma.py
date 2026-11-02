"""크로마키 배경 제거: 초록(#00FF00) 또는 마젠타(#FF00FF) 단색 배경을 투명하게 만들고 가장자리 번짐을 정리한다.
사용: python3 -I tools/chroma.py 입력.png 출력.png [green|magenta] [최대크기px]
"""
import sys
import numpy as np
from PIL import Image

def remove(src, dst, key='green', size=None):
    im = Image.open(src).convert('RGB')
    a = np.asarray(im).astype(np.float32) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # 배경색 우세 정도: 초록이면 g가 r·b보다 얼마나 큰지, 마젠타면 r·b가 g보다 얼마나 큰지
    dom = g - np.maximum(r, b) if key == 'green' else np.minimum(r, b) - g
    # dom 0.12 이하 → 완전 불투명, 0.35 이상 → 완전 투명, 사이는 부드럽게
    alpha = np.clip(1 - (dom - 0.12) / (0.35 - 0.12), 0, 1)
    # 반투명 가장자리의 배경색 번짐(스필) 제거
    if key == 'green':
        g2 = np.minimum(g, np.maximum(r, b) + 0.04)
        out = np.stack([r, g2, b], -1)
    else:
        lim = g + 0.04
        out = np.stack([np.minimum(r, np.maximum(lim, (r + b) / 2 * (1 - (1 - alpha)))), g, np.minimum(b, np.maximum(lim, (r + b) / 2 * (1 - (1 - alpha))))], -1)
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
