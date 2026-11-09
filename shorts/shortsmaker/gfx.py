"""모션그래픽 재료: 글꼴, 이징, 아이콘(4배로 그려 매끈하게), 빛 번짐, 글자 그림."""
import math
from functools import lru_cache

from PIL import Image, ImageDraw, ImageFilter, ImageFont

FONT_DIR = "/usr/share/fonts/opentype/noto/"
SS = 4  # 아이콘 매끈하게 그리는 배율


@lru_cache(maxsize=64)
def font(size, weight="Black"):
    return ImageFont.truetype(f"{FONT_DIR}NotoSansCJK-{weight}.ttc", int(size), index=1)  # index 1 = KR


# ---------- 이징 ----------
def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def ease_out(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def ease_in_out(x):
    x = clamp(x)
    return 3 * x * x - 2 * x * x * x


def ease_back(x, s=1.7):
    x = clamp(x)
    x -= 1
    return x * x * ((s + 1) * x + s) + 1


def prog(t, start, dur):
    return clamp((t - start) / dur) if dur > 0 else float(t >= start)


# ---------- 색 ----------
def rgba(hex_, a=255):
    hex_ = hex_.lstrip("#")
    return tuple(int(hex_[i:i + 2], 16) for i in (0, 2, 4)) + (a,)


# ---------- 아이콘 ----------
def _canvas(w, h=None):
    h = h or w
    im = Image.new("RGBA", (w * SS, h * SS), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)


def _done(im):
    return im.resize((im.width // SS, im.height // SS), Image.LANCZOS)


def heart_points(cx, cy, r, n=120):
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((cx + x * r / 17, cy - y * r / 17))
    return pts


@lru_cache(maxsize=128)
def icon(name, size, color="#ffffff", alt="#1b1b2f"):
    """name: heart heart_line paw person cross eye eye_closed lungs kidney liver dog candle"""
    S = size * SS
    im, d = _canvas(size)
    c, a = rgba(color), rgba(alt)
    if name in ("heart", "heart_line"):
        pts = heart_points(S / 2, S * 0.52, S * 0.46)
        if name == "heart":
            d.polygon(pts, fill=c)
        else:
            d.line(pts + [pts[0]], fill=c, width=int(S * 0.045), joint="curve")
    elif name == "paw":
        d.ellipse([S * .27, S * .5, S * .73, S * .9], fill=c)
        for x, y, r in ((.17, .37, .085), (.37, .19, .09), (.63, .19, .09), (.83, .37, .085)):
            d.ellipse([S * (x - r), S * (y - r * 1.2), S * (x + r), S * (y + r * 1.2)], fill=c)
    elif name == "person":
        d.ellipse([S * .32, S * .05, S * .68, S * .41], fill=c)
        d.pieslice([S * .14, S * .46, S * .86, S * 1.36], 180, 360, fill=c)
    elif name == "cross":
        r = S * .08
        d.rounded_rectangle([S * .36, S * .1, S * .64, S * .9], r, fill=c)
        d.rounded_rectangle([S * .1, S * .36, S * .9, S * .64], r, fill=c)
    elif name in ("eye", "eye_closed"):
        top = [(S * (.06 + .88 * i / 40), S * (.5 - .28 * math.sin(math.pi * i / 40))) for i in range(41)]
        bot = [(S * (.94 - .88 * i / 40), S * (.5 + .28 * math.sin(math.pi * i / 40))) for i in range(41)]
        if name == "eye":
            d.polygon(top + bot, fill=c)
            d.ellipse([S * .34, S * .34, S * .66, S * .66], fill=a)
            d.ellipse([S * .44, S * .4, S * .52, S * .48], fill=c)
        else:
            d.line(bot[::-1][:], fill=c, width=int(S * .05), joint="curve")
            for i in (10, 20, 30):
                x, y = bot[::-1][i]
                d.line([(x, y), (x + (i - 20) * S * .006, y + S * .1)], fill=c, width=int(S * .035))
    elif name == "lungs":
        d.rounded_rectangle([S * .46, S * .08, S * .54, S * .5], S * .04, fill=c)
        d.ellipse([S * .08, S * .25, S * .46, S * .95], fill=c)
        d.ellipse([S * .54, S * .25, S * .92, S * .95], fill=c)
        d.line([(S * .5, S * .45), (S * .36, S * .6)], fill=a, width=int(S * .03))
        d.line([(S * .5, S * .45), (S * .64, S * .6)], fill=a, width=int(S * .03))
    elif name == "kidney":
        d.ellipse([S * .2, S * .08, S * .8, S * .92], fill=c)
        d.ellipse([S * .58, S * .36, S * .9, S * .64], fill=(0, 0, 0, 0))
        im2 = Image.new("RGBA", im.size, (0, 0, 0, 0))
        ImageDraw.Draw(im2).ellipse([S * .6, S * .36, S * .92, S * .64], fill=(255, 255, 255, 255))
        im.putalpha(Image.composite(Image.new("L", im.size, 0), im.getchannel("A"), im2.getchannel("A")))
    elif name == "liver":
        pts = []
        for i in range(60):
            t = 2 * math.pi * i / 60
            rx = .44 if math.cos(t) < 0 else .4
            ry = .3 * (1.15 if math.cos(t) < 0 else .75)
            pts.append((S * (.5 + rx * math.cos(t)), S * (.5 + ry * math.sin(t) - .08 * math.cos(t))))
        d.polygon(pts, fill=c)
    elif name == "dog":
        # 앉아 있는 강아지 옆모습 실루엣
        d.ellipse([S * .22, S * .42, S * .78, S * .96], fill=c)       # 몸
        d.ellipse([S * .3, S * .12, S * .7, S * .52], fill=c)         # 머리
        d.ellipse([S * .58, S * .3, S * .86, S * .48], fill=c)        # 주둥이
        d.ellipse([S * .8, S * .3, S * .88, S * .38], fill=a)         # 코
        d.ellipse([S * .26, S * .16, S * .42, S * .5], fill=rgba(color, 255))  # 귀
        d.ellipse([S * .12, S * .78, S * .32, S * .9], fill=c)        # 꼬리
        d.rounded_rectangle([S * .52, S * .7, S * .64, S * .98], S * .05, fill=c)  # 앞다리
        d.arc([S * .5, S * .26, S * .62, S * .36], 20, 160, fill=a, width=int(S * .025))  # 감은 눈
        d.ellipse([S * .3, S * .14, S * .46, S * .48], fill=rgba("#d9a46c"))
    elif name == "candle":
        d.rounded_rectangle([S * .38, S * .45, S * .62, S * .98], S * .03, fill=c)
        d.line([(S * .5, S * .45), (S * .5, S * .39)], fill=a, width=int(S * .02))
    return _done(im)


def flame(size, flick=0.0):
    im, d = _canvas(size)
    S = size * SS
    w = .2 + .03 * flick
    pts = []
    for i in range(50):
        t = math.pi * i / 49
        pts.append((S * (.5 + w * math.sin(t) * math.sin(t / 2 + .3)), S * (.95 - .9 * t / math.pi)))
    pts += [(S * (1 - x / S), y) for x, y in pts[::-1]]
    d.polygon(pts, fill=rgba("#ffb347"))
    d.ellipse([S * .43, S * .6, S * .57, S * .9], fill=rgba("#fff3c4"))
    return _done(im)


@lru_cache(maxsize=256)
def scaled(name, size, color="#ffffff", alt="#1b1b2f"):
    return icon(name, max(4, int(size)), color, alt)


def glow(img, radius=24, strength=1.6, color=None):
    a = img.getchannel("A").filter(ImageFilter.GaussianBlur(radius))
    a = a.point(lambda v: min(255, int(v * strength)))
    base = Image.new("RGBA", img.size, rgba(color) if color else (255, 255, 255, 255))
    if color is None:
        base = img.copy().filter(ImageFilter.GaussianBlur(radius))
    base.putalpha(a)
    return base


def pad(img, p):
    out = Image.new("RGBA", (img.width + 2 * p, img.height + 2 * p), (0, 0, 0, 0))
    out.alpha_composite(img, (p, p))
    return out


@lru_cache(maxsize=256)
def glowing(name, size, color, glow_color, radius=22):
    ic = pad(scaled(name, size, color), radius * 2)
    g = glow(ic, radius, 1.8, glow_color)
    g.alpha_composite(ic)
    return g


def put(base, img, cx, cy, scale=1.0, alpha=1.0, rot=0.0):
    """img를 (cx, cy) 가운데에 크기·투명도·회전을 바꿔 얹는다."""
    if alpha <= 0.01 or scale <= 0.01:
        return
    if abs(scale - 1) > 0.005:
        img = img.resize((max(1, int(img.width * scale)), max(1, int(img.height * scale))), Image.BILINEAR)
    if rot:
        img = img.rotate(rot, resample=Image.BICUBIC, expand=True)
    if alpha < 0.999:
        img = img.copy()
        img.putalpha(img.getchannel("A").point(lambda v: int(v * alpha)))
    base.alpha_composite(img, (int(cx - img.width / 2), int(cy - img.height / 2)))


# ---------- 글자 ----------
def text_img(text, size, fill="#ffffff", weight="Black", stroke=0, stroke_fill="#000000", runs=None):
    """runs: [(문자열, 색)] 이면 색을 나눠 그린다."""
    f = font(size, weight)
    runs = runs or [(text, fill)]
    full = "".join(r[0] for r in runs)
    l, t, r, b = f.getbbox(full, stroke_width=stroke)
    im = Image.new("RGBA", (r - l + 4, b - t + 4), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    x = -l + 2
    for s, col in runs:
        d.text((x, -t + 2), s, font=f, fill=rgba(col), stroke_width=stroke, stroke_fill=rgba(stroke_fill))
        x += f.getlength(s)
    return im


def card(w, h, fill="#ffffff", radius=28, alpha=235, shadow=True):
    im, d = _canvas(w, h)
    d.rounded_rectangle([0, 0, w * SS - 1, h * SS - 1], radius * SS, fill=rgba(fill, alpha))
    im = _done(im)
    if shadow:
        im = pad(im, 30)
        sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
        sh.putalpha(im.getchannel("A").filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * .5)))
        sh.alpha_composite(im)
        im = sh
    return im
