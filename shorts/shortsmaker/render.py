"""쇼츠 화면 합성: 위 제목 2줄 · 가운데 장면(1080×1080, 천천히 확대) · 장면 아래쪽 자막 · 맨 아래 출처."""
import math
import subprocess

from PIL import Image

from . import footage, gfx, overlays, scenes
from .gfx import ease_back, ease_out, prog

W, H, FPS = 1080, 1920, 30
SCENE_Y = 420            # 장면 위쪽
SUB_Y = SCENE_Y + 900    # 자막 가운데
SUB_MAX = 15             # 자막 한 줄 최대 글자 수(띄어쓰기 포함)


def title_base(lines, note):
    base = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    cols = ["#ffe600", "#ff2d2d"]
    y = 150
    for i, line in enumerate(lines[:2]):
        size = 104
        while gfx.font(size).getlength(line) > W - 70:
            size -= 2
        im = gfx.text_img(line, size, cols[i], stroke=7, stroke_fill="#000000")
        gfx.put(base, im, W / 2, y)
        y += size + 26
    if note:
        gfx.put(base, gfx.text_img(note, 30, "#8a8a96", "Bold"), W / 2, SCENE_Y + 1080 + 70)
    return base


def chunk_text(text, keys=()):
    for k in keys:  # 강조 낱말은 자막 줄에서 갈라지지 않게
        k = k.rstrip(",")
        text = text.replace(k, k.replace(" ", "\u00a0"))
    words, out, cur = text.split(" "), [], ""
    for w in words:
        if cur and len(cur) + 1 + len(w) > SUB_MAX:
            out.append(cur)
            cur = w
        else:
            cur = f"{cur} {w}".strip()
    if cur:
        out.append(cur)
    return [c.replace("\u00a0", " ") for c in out]


def sub_runs(chunk, keys, base="#ffffff"):
    """핵심 낱말은 노랑으로(대사 문장은 바탕 글자를 하늘색으로)."""
    marks = [False] * len(chunk)
    for k in keys:
        k = k.rstrip(",")
        i = chunk.find(k)
        while i >= 0 and k:
            for j in range(i, i + len(k)):
                marks[j] = True
            i = chunk.find(k, i + 1)
    runs, cur, cm = [], "", None
    for ch, m in zip(chunk, marks):
        if cm is not None and m != cm:
            runs.append((cur, "#ffe600" if cm else base))
            cur = ""
        cur += ch
        cm = m
    if cur:
        runs.append((cur, "#ffe600" if cm else base))
    return runs


def build_timeline(story, times, tail=1.4):
    segs = story["segments"]
    subs, scene_list = [], []
    for seg, (a, b) in zip(segs, times):
        chunks = chunk_text(seg["text"], seg.get("keys", []))
        total = sum(len(c.replace(" ", "")) for c in chunks)
        t = a
        for c in chunks:
            dt = (b - a) * len(c.replace(" ", "")) / total
            base = "#bfe6ff" if seg.get("who") else "#ffffff"
            img = gfx.text_img(c, 62, runs=sub_runs(c, seg.get("keys", []), base), stroke=7, stroke_fill="#000000")
            subs.append((t, t + dt, img, c))
            t += dt
        clips = seg.get("_clips") or []
        if clips:  # 실제 영상 장면: 문장마다 따로, 영상 여러 개면 나눠서 컷 전환
            scene_list.append({"name": seg.get("scene", "hook"), "segs": [(seg, a, b)], "clips": clips,
                               "overlay": seg.get("overlay")})
        elif scene_list and scene_list[-1]["name"] == seg["scene"] and not scene_list[-1].get("clips"):
            scene_list[-1]["segs"].append((seg, a, b))
        else:
            scene_list.append({"name": seg["scene"], "segs": [(seg, a, b)]})
    end = times[-1][1] + tail
    for i, sc in enumerate(scene_list):
        sc["start"] = 0.0 if i == 0 else sc["segs"][0][1] - 0.12
        sc["end"] = scene_list[i + 1]["segs"][0][1] - 0.12 if i + 1 < len(scene_list) else end
    return scene_list, subs, end


_stream = {}


def frame(t, base, scene_list, subs, draw_subs=True):
    out = base.copy()
    sc = next(s for s in scene_list if s["start"] <= t < s["end"] + 1e-6) if t < scene_list[-1]["end"] else scene_list[-1]
    lt, d = t - sc["start"], sc["end"] - sc["start"]
    seg, a, b = sc["segs"][0]
    ctx = {"seg_text": " ".join(s[0]["text"] for s in sc["segs"]), "speech_off": a - sc["start"],
           "speech_len": sc["segs"][-1][2] - a}
    ci = 0
    if sc.get("clips"):
        n = len(sc["clips"])
        ci = min(n - 1, int(lt / d * n))
        key = (id(sc), ci)
        if _stream.get("key") != key:
            if _stream.get("s"):
                _stream["s"].close()
            _stream.update(key=key, s=footage.ClipStream(sc["clips"][ci], int(d / n * FPS) + 4))
        img = _stream["s"].read().copy()
        cl = (lt - ci * d / n)  # 컷 안 시간: 컷이 바뀔 때도 짧게 페이드
        overlays.draw(img, lt, d, ctx, sc.get("overlay"), NOTE["text"])
        lt_fade = min(lt, cl)
    else:
        img = scenes.background(sc["name"])
        scenes.SCENES[sc["name"]](img, lt, d, ctx)
        lt_fade = lt
    # 천천히 확대(켄 번스). 정지 그림은 더 크게 움직여 영상처럼 보이게(장면마다 방향을 바꿈)
    # 영상과 그림이 섞인 장면도 컷마다 따로: 그 컷의 시간으로 움직임 계산
    clip_now = sc["clips"][ci] if sc.get("clips") else ""
    still = clip_now.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))
    if sc.get("clips"):
        cut = d / len(sc["clips"])
        k = (lt - ci * cut) / max(cut, .1)
    else:
        k = lt / max(d, .1)
    if still:
        idx = scene_list.index(sc) + ci
        z = 1.06 + 0.10 * (k if idx % 2 == 0 else 1 - k)
        dx, dy = ((1, 0), (-1, 0), (0, 1), (0, -1))[idx % 4]
    else:
        z, dx, dy = 1.0 + 0.05 * k, 0, 0
    if z > 1.001:
        big = img.resize((int(1080 * z), int(1080 * z)), Image.BILINEAR)
        room = (big.width - 1080) // 2
        ox = int(room + dx * room * (k - .5) * .9)
        oy = int(room + dy * room * (k - .5) * .9)
        img = big.crop((ox, oy, ox + 1080, oy + 1080))
    # 장면 시작: 0.2초 페이드 인
    f = min(1.0, lt_fade / 0.2)
    if f < 1:
        img = Image.blend(Image.new("RGBA", img.size, (0, 0, 0, 255)), img, f)
    out.alpha_composite(img, (0, SCENE_Y))
    # 끝 1초 페이드 아웃
    for s0, s1, simg, _ in (subs if draw_subs else ()):
        if s0 <= t < s1:
            p = prog(t, s0, .14)
            gfx.put(out, simg, W / 2, SUB_Y, .88 + .12 * ease_back(p), ease_out(p * 1.5))
            break
    return out


NOTE = {"text": "※ 이해를 돕기 위한 자료 화면입니다"}


def render(story, times, video_path, preview=None, draw_subs=True):
    NOTE["text"] = story.get("footage_note", NOTE["text"])
    base = title_base(story["title"], story.get("source_note"))
    scene_list, subs, end = build_timeline(story, times)
    n = int(math.ceil(end * FPS))
    if preview is not None:  # 미리보기: 몇 초의 프레임만 그림 파일로
        return [frame(t, base, scene_list, subs).convert("RGB") for t in preview]
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                           "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "19",
                           "-pix_fmt", "yuv420p", video_path], stdin=subprocess.PIPE)
    for i in range(n):
        t = i / FPS
        fr = frame(t, base, scene_list, subs, draw_subs)
        fade = min(1.0, (end - t) / 0.8)
        if fade < 1:
            fr = Image.blend(Image.new("RGBA", fr.size, (0, 0, 0, 255)), fr, max(0, fade))
        ff.stdin.write(fr.convert("RGB").tobytes())
        if i % 150 == 0:
            print(f"  프레임 {i}/{n}", flush=True)
    ff.stdin.close()
    ff.wait()
    return end


def write_srt(story, times, path):
    """편집 프로그램(캡컷 등)에 넣을 자막 파일 — 화면에 구운 자막과 같은 시간·끊김."""
    _, subs, _ = build_timeline(story, times)

    def ts(x):
        ms = int(round(x * 1000))
        return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
    with open(path, "w", encoding="utf-8") as f:
        for i, (a, b, _, text) in enumerate(subs, 1):
            f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{text}\n\n")
