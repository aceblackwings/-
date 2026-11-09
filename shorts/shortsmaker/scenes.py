"""장면 그리기. 모든 장면은 draw(img, t, d, ctx) — img는 1080×1080 RGBA, t는 장면 안 시간, d는 장면 길이.
ctx에는 seg_text(이 장면 대사), key_times(낱말이 말해지는 시각) 등이 들어 있다."""
import math

import numpy as np
from PIL import Image, ImageDraw

from . import gfx
from .gfx import ease_back, ease_out, ease_in_out, prog, put

S = 1080

# 장면별 배경(가운데 색, 가장자리 색)
BG = {
    "hook": ("#3a2a4f", "#0b0a17"),
    "profile": ("#5b3a52", "#140b14"),
    "clinic": ("#21485a", "#081419"),
    "years": ("#5a4426", "#150f08"),
    "ecg": ("#1a2430", "#05080c"),
    "family": ("#4b3a5e", "#0e0a16"),
    "organs": ("#3d2433", "#0d070b"),
    "seven": ("#4a3a1c", "#0f0b05"),
    "candle": ("#2a1d14", "#050302"),
    "ending": ("#5a2e46", "#120810"),
}

_bg_cache = {}


def background(name):
    if name not in _bg_cache:
        c1, c2 = (np.array(gfx.rgba(c)[:3], float) for c in BG.get(name, BG["hook"]))
        y, x = np.mgrid[0:S, 0:S]
        r = np.sqrt((x - S / 2) ** 2 + (y - S * .45) ** 2) / (S * .75)
        r = np.clip(r, 0, 1)[..., None]
        arr = c1 * (1 - r) + c2 * r
        arr += np.random.default_rng(1).normal(0, 2.2, arr.shape)  # 필름 결
        _bg_cache[name] = Image.fromarray(np.clip(arr, 0, 255).astype("uint8")).convert("RGBA")
    return _bg_cache[name].copy()


_dot = None


def particles(img, t, seed, color="#ffd9a0", n=26, rise=True):
    global _dot
    if _dot is None:
        _dot = gfx.glowing("heart", 4, "#ffffff", "#ffffff", 6)  # 흰 빛 점
    rng = np.random.default_rng(seed)
    for _ in range(n):
        x0, y0, sp, ph, sc = rng.random() * S, rng.random() * S, 20 + rng.random() * 40, rng.random() * 6.28, .6 + rng.random() * 1.8
        y = (y0 - t * sp) % S if rise else y0
        x = x0 + 18 * math.sin(t * .8 + ph)
        a = .25 + .35 * (0.5 + 0.5 * math.sin(t * 1.5 + ph))
        put(img, _dot, x, y, sc, a)


def label(img, text, cx, cy, size=46, fill="#ffffff", alpha=1.0, scale=1.0, bg=None, weight="Black"):
    t = gfx.text_img(text, size, fill, weight)
    if bg:
        c = gfx.card(t.width + 56, t.height + 34, bg, radius=(t.height + 34) // 2, alpha=230, shadow=False)
        c.alpha_composite(t, (28, 17))
        t = c
    put(img, t, cx, cy, scale, alpha)


# ---------------------------------------------------------------- 장면들
def hook(img, t, d, ctx):
    particles(img, t, 1)
    # 스포트라이트
    spot = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(spot).polygon([(S * .42, 0), (S * .58, 0), (S * .85, S * .86), (S * .15, S * .86)], fill=(255, 230, 190, 34))
    img.alpha_composite(spot)
    p = ease_back(prog(t, 0.05, .7))
    put(img, gfx.glowing("dog", 420, "#f1d3a8", "#ffcf8a", 30), S / 2, S * .5 + 6 * math.sin(t * 2), .85 + .15 * p, p)
    # 「안락사 예정」 도장 → 지워지고 하트가 감싼다
    st = prog(t, .7, .25)
    cross = prog(t, d * .55, .35)
    if st > 0:
        stamp = gfx.text_img("안락사 예정", 64, "#ff3b3b", stroke=0)
        box = gfx.card(stamp.width + 60, stamp.height + 36, "#ff3b3b", 14, 40, False)
        box.alpha_composite(stamp, (30, 18))
        ImageDraw.Draw(box).rounded_rectangle([3, 3, box.width - 4, box.height - 4], 14, outline=(255, 59, 59, 255), width=6)
        if cross:
            dd = ImageDraw.Draw(box)
            dd.line([(10, box.height / 2), (10 + (box.width - 20) * ease_out(cross), box.height / 2)], fill=(255, 255, 255, 255), width=10)
        put(img, box, S * .5, S * .16, 1.4 - .4 * ease_out(st), (1 - .55 * cross) * ease_out(st), -8)
    h = ease_back(prog(t, d * .6, .6))
    if h > 0:
        put(img, gfx.glowing("heart_line", 620, "#ff8fb1", "#ff5d8f", 26), S / 2, S * .52, .7 + .3 * h, min(1, h))


def profile(img, t, d, ctx):
    particles(img, t, 2, n=18)
    p = ease_out(prog(t, 0, .6))
    c = gfx.card(760, 470, "#fff7f2", 40, 240)
    put(img, c, S / 2, S * .48 + 60 * (1 - p), 1, p)
    av = gfx.card(180, 180, "#f2c1cf", 90, 255, False)
    put(img, av, S / 2, S * .33 + 60 * (1 - p), 1, p)
    put(img, gfx.scaled("person", 120, "#ffffff"), S / 2, S * .335 + 60 * (1 - p), 1, p)
    n = ease_back(prog(t, .35, .5))
    label(img, "이미정 씨", S / 2, S * .48, 92, "#2b1d22", n, .8 + .2 * n)
    for i, (txt, col) in enumerate((("37세", "#e0527a"), ("부산", "#7a5cc4"), ("2녀 중 막내", "#d08a2e"))):
        q = ease_back(prog(t, .7 + i * .25, .45))
        label(img, txt, S * (.3 + i * .2) if i < 2 else S * .71, S * .6, 40, "#ffffff", q, .7 + .3 * q, bg=col)


def clinic(img, t, d, ctx):
    particles(img, t, 3, n=16)
    a = ease_back(prog(t, 0, .6))
    put(img, gfx.glowing("cross", 260, "#e9fbff", "#5fd1e8", 26), S * .28, S * .42, a, min(1, a))
    label(img, "동물병원", S * .28, S * .64, 44, "#bfeaf4", ease_out(prog(t, .3, .4)))
    b = ease_back(prog(t, .5, .6))
    put(img, gfx.glowing("eye_closed", 150, "#f1d3a8", "#ffcf8a", 16), S * .72, S * .3, b, min(1, b))
    put(img, gfx.glowing("paw", 230, "#f1d3a8", "#ffcf8a", 22), S * .72, S * .5, b, min(1, b))
    label(img, "시력을 잃은 강아지", S * .72, S * .66, 40, "#ffe2b8", ease_out(prog(t, .8, .4)))
    # 둘 사이를 잇는 하트
    h = ease_back(prog(t, d * .5, .6))
    if h > 0:
        pulse = 1 + .06 * math.sin(t * 7)
        put(img, gfx.glowing("heart", 150, "#ff6f91", "#ff3d6e", 24), S * .5, S * .44, h * pulse, min(1, h))


def years(img, t, d, ctx):
    particles(img, t, 4, n=20)
    k = ease_in_out(prog(t, .2, d * .7))
    n = max(1, int(round(1 + 14 * k)))
    num = gfx.text_img(str(n), 300, "#ffd36b", stroke=0)
    put(img, gfx.glow(gfx.pad(num, 40), 26, 1.4, "#ffae3b"), S * .44, S * .38)
    put(img, num, S * .44, S * .38)
    label(img, "살", S * .68, S * .44, 120, "#fff1d6", ease_out(prog(t, .3, .4)))
    label(img, "노견이 되기까지", S / 2, S * .58, 46, "#ffe2b8", ease_out(prog(t, .5, .4)))
    # 발자국이 걸어간다
    steps = 9
    for i in range(steps):
        q = prog(t, .3 + i * (d * .75 / steps), .25)
        if q <= 0:
            continue
        x = S * (.1 + .8 * i / (steps - 1))
        y = S * (.73 + (.03 if i % 2 else -.035))
        put(img, gfx.scaled("paw", 70, "#f1d3a8"), x, y, .6 + .4 * ease_back(q), .85 * min(1, q), -90)


def ecg(img, t, d, ctx):
    flat_at = d * .45
    beat = 0.85
    layer = Image.new("RGBA", (S * 2, S * 2), (0, 0, 0, 0))
    dr = ImageDraw.Draw(layer)
    # 격자
    for i in range(0, S * 2, 90):
        dr.line([(i, 0), (i, S * 2)], fill=(80, 255, 170, 18), width=2)
        dr.line([(0, i), (S * 2, i)], fill=(80, 255, 170, 18), width=2)
    head = min(1.0, t / max(.1, d * .85))  # 선이 그려지는 위치(0~1)
    pts = []
    for i in range(0, int(400 * head)):
        u = i / 400
        tt = u * d * .85
        y = 0.0
        if tt < flat_at:
            ph = (tt % beat) / beat
            if .30 < ph < .34:
                y = -(ph - .30) / .04 * .9
            elif .34 <= ph < .40:
                y = -.9 + (ph - .34) / .06 * 1.4
            elif .40 <= ph < .44:
                y = .5 - (ph - .40) / .04 * .5
            elif .55 < ph < .7:
                y = -.18 * math.sin((ph - .55) / .15 * math.pi)
        pts.append((S * 2 * (.04 + .92 * u), S * 2 * .45 + y * 300))
    flat = t >= flat_at
    col = (255, 70, 70, 255) if flat else (90, 255, 170, 255)
    if len(pts) > 1:
        dr.line(pts, fill=col, width=12, joint="curve")
        x, y = pts[-1]
        dr.ellipse([x - 16, y - 16, x + 16, y + 16], fill=(255, 255, 255, 255))
    small = layer.resize((S, S), Image.LANCZOS)
    img.alpha_composite(gfx.glow(small, 12, 1.5, "#ff4646" if flat else "#5affaa"))
    img.alpha_composite(small)
    label(img, "2024. 7. 1", S / 2, S * .14, 50, "#ffffff", ease_out(prog(t, 0, .4)), bg="#e0405a")
    if flat:
        f = prog(t, flat_at, .5)
        label(img, "갑작스러운 심정지", S / 2, S * .7, 70, "#ff8080", ease_out(f), .9 + .1 * ease_back(f))
        dim = Image.new("RGBA", (S, S), (0, 0, 0, int(140 * ease_in_out(prog(t, d * .7, d * .3)))))
        img.alpha_composite(dim)


def family(img, t, d, ctx):
    particles(img, t, 6, color="#ffffff", n=22)
    for i, (x, sz) in enumerate(((.26, 230), (.5, 270), (.74, 230))):
        p = ease_out(prog(t, i * .2, .6))
        put(img, gfx.scaled("person", sz, "#2a2036"), S * x, S * .6 + 40 * (1 - p), 1, p)
    # 가족 사이에서 떠오르는 빛
    o = ease_in_out(prog(t, .6, d * .7))
    put(img, gfx.glowing("heart", 110, "#fff2c9", "#ffd36b", 34), S / 2, S * (.42 - .16 * o), .7 + .3 * o, min(1, o * 2))
    q = ease_out(prog(t, d * .35, .6))
    c = gfx.card(700, 120, "#ffffff", 60, 40, False)
    put(img, c, S / 2, S * .18, 1, q)
    label(img, "“누군가를 살리고 떠나길”", S / 2, S * .18, 50, "#fff3d6", q)


ORGANS = [("heart", "심장", "#ff6f91"), ("lungs", "폐", "#ff9fb5"), ("liver", "간", "#e98a6d"),
          ("kidney", "신장", "#f2a37b"), ("kidney", "신장", "#f2a37b"), ("eye", "안구", "#a9d8ff"), ("eye", "안구", "#a9d8ff")]
ORGAN_WORDS = ["심장", "폐", "간", "두 신장", "두 신장", "두 눈", "두 눈"]


def organs(img, t, d, ctx):
    particles(img, t, 7, n=14)
    label(img, "2024. 10. 15", S / 2, S * .1, 46, "#ffffff", ease_out(prog(t, 0, .4)), bg="#c2456a")
    label(img, "가톨릭대 부천성모병원", S / 2, S * .19, 36, "#f4d0dc", ease_out(prog(t, .2, .4)))
    text = ctx["seg_text"]
    pos = [(.25, .34), (.5, .34), (.75, .34), (.2, .62), (.4, .62), (.6, .62), (.8, .62)]
    for i, (name, ko, col) in enumerate(ORGANS):
        w = ORGAN_WORDS[i]
        idx = text.find(w)
        at = (idx / len(text)) * ctx["speech_len"] + ctx["speech_off"] + (.12 if i in (4, 6) else 0)
        q = ease_back(prog(t, at, .45))
        if q <= 0:
            continue
        x, y = pos[i]
        sz = 130 if i < 3 else 110
        put(img, gfx.glowing(name, sz, col, col, 18), S * x, S * y - 20, .7 + .3 * q, min(1, q))
        label(img, ko, S * x, S * y + 60, 34, "#ffffff", min(1, q))


def seven(img, t, d, ctx):
    particles(img, t, 8, n=30)
    k = ease_out(prog(t, 0, .5))
    num = gfx.text_img("7", 330, "#ffd36b")
    put(img, gfx.glow(gfx.pad(num, 50), 34, 1.6, "#ffae3b"), S / 2, S * .44, .8 + .2 * k, k)
    put(img, num, S / 2, S * .44, .8 + .2 * ease_back(prog(t, 0, .5)), k)
    label(img, "명에게 새 삶", S / 2, S * .66, 64, "#fff1d6", ease_out(prog(t, .3, .4)))
    for i in range(7):
        ang = math.pi * (1.1 + .8 * i / 6)
        x, y = S / 2 + S * .4 * math.cos(ang), S * .52 + S * .42 * math.sin(ang)
        q = ease_back(prog(t, .2 + i * (d * .6 / 7), .35))
        put(img, gfx.glowing("person", 90, "#fff3c9", "#ffcf5a", 16), x, y, .6 + .4 * q, min(1, q))


def candle(img, t, d, ctx):
    particles(img, t, 9, color="#ffd08a", n=24)
    put(img, gfx.scaled("candle", 260, "#f5eadb", "#3a2a20"), S / 2, S * .62)
    fl = math.sin(t * 13) * .5 + math.sin(t * 7.3) * .5
    f = gfx.flame(150, fl)
    put(img, gfx.glow(gfx.pad(f, 60), 40, 2.2, "#ffb347"), S / 2, S * .44, 1.4 + .05 * fl, .85)
    put(img, f, S / 2, S * .44, 1 + .04 * fl)
    q = ease_out(prog(t, .5, .8))
    label(img, "“함께 숨 쉰다고 믿으며”", S / 2, S * .14, 48, "#ffe6c4", q)
    label(img, "— 어머니의 편지 중", S / 2, S * .22, 32, "#c9a988", q * .9)


def ending(img, t, d, ctx):
    particles(img, t, 10, n=30)
    p = ease_back(prog(t, 0, .7))
    put(img, gfx.glowing("heart", 300, "#ff6f91", "#ff3d6e", 40), S / 2, S * .44, (.8 + .2 * p) * (1 + .03 * math.sin(t * 4)), min(1, p))
    put(img, gfx.scaled("paw", 120, "#fff1e6"), S / 2, S * .44, p, min(1, p))
    for i in range(7):
        ang = t * .6 + 2 * math.pi * i / 7
        x, y = S / 2 + S * .3 * math.cos(ang), S * .44 + S * .3 * math.sin(ang)
        put(img, gfx.glowing("person", 56, "#fff3c9", "#ffcf5a", 12), x, y, 1, ease_out(prog(t, .3 + i * .1, .4)))
    label(img, "따뜻한 마음은 남아 있습니다", S / 2, S * .1, 52, "#ffe3ec", ease_out(prog(t, d * .45, .6)))


SCENES = {f.__name__: f for f in (hook, profile, clinic, years, ecg, family, organs, seven, candle, ending)}
