"""한 번 쓰는 테마 변환기(2026-11-04): 어두운 네온 → 밝은 파스텔.
속성 종류(글자색 / 배경·테두리·그림자)에 따라 색을 다르게 바꾼다.  python3 -I tools/retheme.py styles.css"""
import re, sys
TEXT_PROPS = {'color', '-webkit-text-fill-color', 'caret-color'}
LIGHT_LAV = '#d9d4ff #cfcaf2 #d9d4f5 #e6e1ff #cfc9f2 #f1eefa #ece9ff #c8c3ec #f3efff'.split()
DARK = '#241b2f #07060f #1d1742 #0d0a1f #0f0c22 #05040c'.split()
GOLD = '#ffc93c #ffd166 #ffe9a8 #ffe39a #fff8d6'.split()
PINK = '#ff2e63 #ff4d8d #ff6b8b'.split()
SOFTPINK = '#ff8fb3 #ffb3c7'.split()
LAV = '#8a7dff #7b5cff #b9b0ff #c77dff #a99fd6 #a9d8ff'.split()
GREY = '#9a94c4 #8f88c0 #9aa3b2'.split()
ORANGE = '#ff9a3c #ff7a3c'.split()
def hexmap(h, text):
    h = h.lower()
    if h in ('#fff', '#ffffff'): return 'var(--ink)' if text else '#fff'
    if h in LIGHT_LAV: return '#5a4651' if text else '#fbe9ef'
    if h in DARK: return '#3b2a33' if text else '#fff8f6'
    if h == '#00e5ff': return '#d9658a' if text else '#f4a6bd'
    if h in GOLD: return '#c77a26' if text else '#f6c47a'
    if h == '#39ff88': return '#3f9c6f' if text else '#8fd4ad'
    if h in PINK: return '#e0607e' if text else '#f48aa2'
    if h in SOFTPINK: return '#e0789a' if text else '#f9b3c6'
    if h in LAV: return '#8c6cc4' if text else '#c9b6ec'
    if h in GREY: return 'var(--muted)' if text else '#cdbfd0'
    if h == '#e0e0ff': return '#8a8499' if text else '#e8e4f0'
    if h in ORANGE: return '#e07a3c' if text else '#f6b07a'
    return h
RGBA = [
    ((255, 255, 255), (150, 90, 120), (236, 127, 160)),
    ((0, 229, 255), (217, 101, 138), (236, 127, 160)),
    ((255, 201, 60), (199, 122, 38), (232, 160, 70)),
    ((57, 255, 136), (63, 156, 111), (91, 181, 138)),
    ((255, 46, 99), (224, 96, 126), (240, 118, 140)),
    ((255, 77, 141), (224, 96, 126), (240, 118, 140)),
    ((255, 77, 109), (224, 96, 126), (240, 118, 140)),
    ((160, 140, 255), (140, 108, 196), (179, 157, 219)),
    ((123, 92, 255), (140, 108, 196), (179, 157, 219)),
    ((190, 175, 255), (140, 108, 196), (179, 157, 219)),
    ((199, 125, 255), (140, 108, 196), (179, 157, 219)),
    ((224, 224, 255), (138, 132, 153), (200, 190, 215)),
    ((0, 0, 0), (60, 30, 45), (120, 70, 90)),
]
for d in [(20, 16, 44), (22, 18, 48), (18, 15, 38), (15, 12, 34), (7, 6, 15), (5, 4, 12)]:
    RGBA.append((d, (59, 42, 51), (255, 255, 255)))
def rgbamap(m, text):
    r, g, b = (int(x) for x in m.group(1, 2, 3)); rest = m.group(4)
    for src, t, o in RGBA:
        if (r, g, b) == src:
            c = t if text else o
            a = rest
            if src == (0, 0, 0) and not text:
                try: a = ', ' + str(round(float(rest.strip(', ')) * 0.45, 3))
                except ValueError: pass
            return f'rgba({c[0]}, {c[1]}, {c[2]}{a})'
    return m.group(0)
RG = re.compile(r'rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*[\d.]+)\s*\)')
HX = re.compile(r'#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b')
DECL = re.compile(r'(?<![\w-])([a-z-]+)(\s*:\s*)([^;{}]+)')
def fix_decl(m):
    prop, sep, val = m.groups()
    if prop.startswith('--'): return m.group(0)
    if prop == 'text-shadow': return f'{prop}{sep}none'
    if prop == 'color-scheme': return f'{prop}{sep}light'
    text = prop in TEXT_PROPS
    val = RG.sub(lambda x: rgbamap(x, text), val)
    val = HX.sub(lambda x: hexmap(x.group(0), text), val)
    return f'{prop}{sep}{val}'
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
root_end = s.index('}') + 1
body = s[root_end:]
# 선택자 안의 선언만 바꾸기: { ... } 블록 단위
out = re.sub(r'\{([^{}]*)\}', lambda b: '{' + DECL.sub(fix_decl, b.group(1)) + '}', body)
open(p, 'w', encoding='utf-8').write(s[:root_end] + out)
