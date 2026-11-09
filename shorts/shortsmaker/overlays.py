"""실제 영상 위에 얹는 정보 그래픽. draw(img, t, d, ctx, spec) — spec은 JSON 의 overlay 항목."""
import math

from PIL import Image, ImageDraw

from . import gfx, scenes
from .gfx import ease_back, ease_out, prog, put
from .scenes import S, label


_shade = {}


def shade(img, top=.0, bottom=.55):
    """글자가 잘 읽히게 위·아래를 살짝 어둡게."""
    if (top, bottom) in _shade:
        img.alpha_composite(_shade[(top, bottom)])
        return
    g = Image.new("L", (1, S))
    for y in range(S):
        u = y / S
        v = max(0, (u - .55) / .45) * bottom + max(0, (.25 - u) / .25) * top
        g.putpixel((0, y), int(255 * min(1, v)))
    _shade[(top, bottom)] = Image.merge("RGBA", (Image.new("L", (S, S), 0),) * 3 + (g.resize((S, S)),))
    img.alpha_composite(_shade[(top, bottom)])


def stamp(img, t, d, ctx, spec):
    st = prog(t, .5, .25)
    cross = prog(t, d * .6, .35) if spec.get("cross", True) else 0
    if st <= 0:
        return
    tx = gfx.text_img(spec["text"], 70, "#ff3b3b")
    box = gfx.card(tx.width + 64, tx.height + 40, "#000000", 14, 120, False)
    box.alpha_composite(tx, (32, 20))
    dr = ImageDraw.Draw(box)
    dr.rounded_rectangle([3, 3, box.width - 4, box.height - 4], 14, outline=(255, 59, 59, 255), width=7)
    if cross:
        dr.line([(10, box.height / 2), (10 + (box.width - 20) * ease_out(cross), box.height / 2)], fill=(255, 255, 255, 255), width=10)
    put(img, box, S * .5, S * .16, 1.5 - .5 * ease_out(st), (1 - .5 * cross) * ease_out(st), -7)


def namecard(img, t, d, ctx, spec):
    p = ease_out(prog(t, .2, .5))
    label(img, spec["name"], S / 2, S * .14, 80, "#ffffff", p, .85 + .15 * ease_back(p), bg="#000000")
    chips = spec.get("chips", [])
    cols = ["#e0527a", "#7a5cc4", "#d08a2e", "#2e8bd0"]
    w = S / (len(chips) + 1)
    for i, c in enumerate(chips):
        q = ease_back(prog(t, .6 + i * .22, .4))
        label(img, c, w * (i + 1), S * .27, 38, "#ffffff", q, .7 + .3 * q, bg=cols[i % 4])


def tag(img, t, d, ctx, spec):
    q = ease_out(prog(t, .3, .4))
    label(img, spec["text"], S / 2, S * spec.get("y", .14), spec.get("size", 50), "#ffffff", q, bg=spec.get("bg", "#1d3b4a"))


def counter(img, t, d, ctx, spec):
    a, b = spec.get("from", 1), spec["to"]
    k = gfx.ease_in_out(prog(t, .3, d * .6))
    n = int(round(a + (b - a) * k))
    num = gfx.text_img(str(n), 230, "#ffd36b", stroke=8, stroke_fill="#2a1a00")
    put(img, gfx.glow(gfx.pad(num, 40), 24, 1.3, "#ffae3b"), S * .44, S * .2)
    put(img, num, S * .44, S * .2)
    label(img, spec.get("suffix", ""), S * .67, S * .25, 100, "#fff1d6", ease_out(prog(t, .3, .4)))


def quote(img, t, d, ctx, spec):
    q = ease_out(prog(t, .4, .7))
    label(img, spec["text"], S / 2, S * .14, 50, "#fff3d6", q, bg="#000000")
    if spec.get("by"):
        label(img, spec["by"], S / 2, S * .24, 32, "#e7d3bf", q * .95)


def organs(img, t, d, ctx, spec):
    scenes.organs(img, t, d, ctx)


OVERLAYS = {f.__name__: f for f in (stamp, namecard, tag, counter, quote, organs)}


def draw(img, t, d, ctx, spec):
    shade(img, top=.45 if spec else 0)
    if spec:
        OVERLAYS[spec["type"]](img, t, d, ctx, spec)
    note = gfx.text_img("※ 이해를 돕기 위한 자료 화면입니다", 24, "#ffffff", "Bold")
    put(img, note, S - note.width / 2 - 24, S - 26, 1, .6)
