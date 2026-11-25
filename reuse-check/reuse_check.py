#!/usr/bin/env python3
"""재사용·반복 콘텐츠 자가 점검기 (시제품 v0.1)

올리기 전에 내 영상이 유튜브 「재사용 콘텐츠」·「진정성 없는(반복·대량 생산) 콘텐츠」
정책에 걸릴 위험이 있는지 스스로 점검하는 도구입니다. 유튜브 심사 결과를 보장하지 않습니다.

필요한 것: Python 3.10+, numpy, Pillow, ffmpeg/ffprobe

사용 예:
  python3 reuse_check.py 내영상.mp4 --source 원본.mp4 [--source 원본2.mp4]
         [--history 지난영상1.mp4 --history 지난영상2.mp4]
         [--script 내대본.txt --history-script 지난대본.txt]
         --out 결과폴더
"""
from __future__ import annotations

import argparse
import html
import json
import os
import subprocess
import sys
from dataclasses import dataclass, field

import numpy as np
from PIL import Image

# ───────────────────────── 기본 설정 ─────────────────────────
FPS = 2                    # 1초에 뽑는 장면 수
W, H = 320, 180            # 장면 분석 크기
AUDIO_SR = 8000            # 소리 분석 표본율
AUDIO_HOP = 0.05           # 소리 지문 간격(초)
AUDIO_WIN = 1.0            # 소리 비교 창(초)
FULL_MAX_DIST = 12         # 화면 전체 일치로 보는 해시 거리(64비트 중)
SUB_MAX_DIST = 9           # 화면 속 화면 일치로 보는 거리(더 엄격)
AUDIO_MAX_BER = 0.33       # 소리 일치로 보는 비트 오차율
SUB_SCALES = [0.94, 0.85, 0.76, 0.68, 0.6, 0.54, 0.48, 0.42, 0.36]
SUB_STEP = 8               # 화면 속 화면 찾기 위치 간격(px, 320폭 기준)


def run(cmd: list[str], **kw) -> bytes:
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, **kw)
    if p.returncode != 0:
        sys.exit(f"명령 실패: {' '.join(cmd[:4])}…\n{p.stderr.decode(errors='ignore')[-800:]}")
    return p.stdout


def duration_of(path: str) -> float:
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path])
    return float(out.strip() or 0)


# ───────────────────────── 화면: 지각 해시 ─────────────────────────
def _dct_matrix(n: int = 32) -> np.ndarray:
    k = np.arange(n)[:, None]
    i = np.arange(n)[None, :]
    m = np.cos(np.pi * (2 * i + 1) * k / (2 * n)) * np.sqrt(2 / n)
    m[0] /= np.sqrt(2)
    return m


DCT = _dct_matrix()


def phash_batch(imgs32: np.ndarray) -> np.ndarray:
    """(N,32,32) 회색 → (N,) uint64 지각 해시"""
    d = DCT @ imgs32 @ DCT.T
    low = d[:, :8, :8].reshape(len(imgs32), 64)
    med = np.median(low[:, 1:], axis=1, keepdims=True)
    bits = (low > med).astype(np.uint64)
    weights = (np.uint64(1) << np.arange(64, dtype=np.uint64))
    return (bits * weights).sum(axis=1).astype(np.uint64)


def hamming(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """a (N,) × b (M,) → (N,M) 비트 거리"""
    return np.bitwise_count(a[:, None] ^ b[None, :]).astype(np.int16)


def to32(arr: np.ndarray) -> np.ndarray:
    return np.asarray(Image.fromarray(arr).resize((32, 32), Image.BILINEAR), dtype=np.float32)


def read_frames(path: str) -> np.ndarray:
    vf = f"fps={FPS},scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2,format=gray"
    raw = run(["ffmpeg", "-v", "error", "-i", path, "-vf", vf, "-f", "rawvideo", "-"])
    n = len(raw) // (W * H)
    return np.frombuffer(raw[: n * W * H], np.uint8).reshape(n, H, W)


def frame_hashes(frames: np.ndarray, mirrored: bool = False) -> np.ndarray:
    if mirrored:
        frames = frames[:, :, ::-1]
    return phash_batch(np.stack([to32(np.ascontiguousarray(f)) for f in frames]))


def subwindows(frame: np.ndarray):
    """화면 속 화면 후보 창(16:9) 목록과 32×32 축소본"""
    boxes, crops = [], []
    for s in SUB_SCALES:
        w, h = int(W * s), int(H * s)
        for y in range(0, H - h + 1, SUB_STEP):
            for x in range(0, W - w + 1, SUB_STEP):
                boxes.append((x, y, w, h))
                crops.append(to32(frame[y:y + h, x:x + w]))
    return boxes, np.stack(crops)


# ───────────────────────── 소리: 지문 ─────────────────────────
def read_audio(path: str) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(AUDIO_SR),
                          "-f", "s16le", "-"], stdout=subprocess.PIPE, stderr=subprocess.PIPE).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768.0


def audio_features(x: np.ndarray):
    """50ms 간격 33대역 에너지 → (지문 비트(N,32), 음량(N,))"""
    hop, n = int(AUDIO_SR * AUDIO_HOP), 512
    if len(x) < n:
        return np.zeros((0, 32), bool), np.zeros(0)
    idx = np.arange(0, len(x) - n, hop)
    fr = np.stack([x[i:i + n] for i in idx]) * np.hanning(n)
    spec = np.abs(np.fft.rfft(fr, axis=1)) ** 2
    freqs = np.fft.rfftfreq(n, 1 / AUDIO_SR)
    edges = np.geomspace(250, 3800, 34)
    bands = np.stack([spec[:, (freqs >= lo) & (freqs < hi)].sum(1) for lo, hi in zip(edges[:-1], edges[1:])], 1)
    e = np.log(bands + 1e-9)
    de = e[:, 1:] - e[:, :-1]                                  # 주파수 방향 차이
    bits = np.zeros((len(e), 32), bool)
    bits[1:] = (de[1:] - de[:-1]) > 0                          # 시간 방향 차이
    rms = np.sqrt((fr ** 2).mean(1))
    return bits, rms


def audio_match(my_bits: np.ndarray, src_bits: np.ndarray) -> np.ndarray:
    """내 소리 1초 창마다 원본과의 최소 비트 오차율"""
    k = int(AUDIO_WIN / AUDIO_HOP)
    if len(src_bits) < k or len(my_bits) < k:
        return np.ones(max(len(my_bits), 0))
    src_w = np.lib.stride_tricks.sliding_window_view(src_bits, (k, 32))[:, 0].reshape(-1, k * 32)
    out = np.ones(len(my_bits))
    for i in range(0, len(my_bits) - k + 1, 2):
        w = my_bits[i:i + k].reshape(-1)
        ber = (src_w != w).mean(1).min()
        out[i:i + k] = np.minimum(out[i:i + k], ber)
    return out


# ───────────────────────── 분석 ─────────────────────────
@dataclass
class Ref:
    path: str
    hashes: np.ndarray
    hashes_m: np.ndarray
    abits: np.ndarray


def load_ref(path: str) -> Ref:
    fr = read_frames(path)
    bits, _ = audio_features(read_audio(path))
    return Ref(path, frame_hashes(fr), frame_hashes(fr, mirrored=True), bits)


@dataclass
class Result:
    duration: float
    video: list = field(default_factory=list)    # 초마다: own / full / mirror / pip
    audio: list = field(default_factory=list)    # 초마다: silent / source / new
    voice: list = field(default_factory=list)    # 초마다: 말소리 같은 새 소리 여부


def analyze(path: str, refs: list[Ref]) -> Result:
    dur = duration_of(path)
    frames = read_frames(path)
    secs = int(np.ceil(dur))
    res = Result(dur)

    # 화면
    labels = ["own"] * len(frames)
    if refs:
        src = np.concatenate([r.hashes for r in refs])
        src_m = np.concatenate([r.hashes_m for r in refs])
        h = frame_hashes(frames)
        d_norm = hamming(h, src).min(1)
        d_mirr = hamming(h, src_m).min(1)
        for i in range(len(frames)):
            if d_norm[i] <= FULL_MAX_DIST:
                labels[i] = "full"
            elif d_mirr[i] <= FULL_MAX_DIST:
                labels[i] = "mirror"
        both = np.concatenate([src, src_m])
        for i in range(len(frames)):
            if labels[i] != "own":
                continue
            boxes, crops = subwindows(frames[i])
            dist = hamming(phash_batch(crops), both)
            j = np.unravel_index(dist.argmin(), dist.shape)
            if dist[j] <= SUB_MAX_DIST:
                x, y, w, hh = boxes[j[0]]
                labels[i] = "full" if w >= W * 0.84 else "pip"
                if j[1] >= len(src) and labels[i] == "full":
                    labels[i] = "mirror"
        # 한 장면만 튀는 오탐은 지우고, 원본 사이 한 장면 빈틈은 메움
        for i in range(1, len(labels) - 1):
            if labels[i] == "pip" and labels[i - 1] == "own" and labels[i + 1] == "own":
                labels[i] = "own"
            elif labels[i] == "own" and labels[i - 1] != "own" and labels[i - 1] == labels[i + 1]:
                labels[i] = labels[i - 1]
    res.video = [_majority(labels[s * FPS:(s + 1) * FPS]) for s in range(secs)]

    # 소리
    bits, rms = audio_features(read_audio(path))
    ber = np.ones(len(bits))
    for r in refs:
        ber = np.minimum(ber, audio_match(bits, r.abits))
    per = int(1 / AUDIO_HOP)
    loud = rms > max(0.01, np.percentile(rms, 20) * 1.5) if len(rms) else rms
    for s in range(secs):
        sl = slice(s * per, (s + 1) * per)
        if len(rms[sl]) == 0 or loud[sl].mean() < 0.3:
            res.audio.append("silent"); res.voice.append(False); continue
        is_src = ber[sl].mean() <= AUDIO_MAX_BER
        res.audio.append("source" if is_src else "new")
        # 말소리는 음절마다 커졌다 작아져 1초 안 음량 변동이 큼(배경음악은 고름)
        r = rms[sl]
        cv = r.std() / (r.mean() + 1e-9)
        res.voice.append(bool(not is_src and cv > 0.45))
    return res


def _majority(xs):
    if not xs:
        return "own"
    vals, cnt = np.unique(xs, return_counts=True)
    return str(vals[cnt.argmax()])


# ───────────────────────── 반복·대량 생산 ─────────────────────────
def history_overlap(path: str, hist: list[str]) -> list[dict]:
    if not hist:
        return []
    my = frame_hashes(read_frames(path))
    out = []
    for hp in hist:
        hh = frame_hashes(read_frames(hp))
        same = hamming(my, hh).min(1) <= 6
        runs = _runs(same, FPS)
        out.append({"video": os.path.basename(hp), "same_ratio": round(float(same.mean()), 3),
                    "segments": [{"start": a, "end": b} for a, b in runs if b - a >= 2]})
    return out


def _runs(mask, fps):
    runs, start = [], None
    for i, m in enumerate(list(mask) + [False]):
        if m and start is None:
            start = i
        if not m and start is not None:
            runs.append((round(start / fps, 1), round(i / fps, 1)))
            start = None
    return runs


def text_similarity(a: str, b: str) -> float:
    def grams(t):
        t = "".join(t.split())
        g = {}
        for i in range(len(t) - 2):
            g[t[i:i + 3]] = g.get(t[i:i + 3], 0) + 1
        return g
    ga, gb = grams(a), grams(b)
    if not ga or not gb:
        return 0.0
    dot = sum(v * gb.get(k, 0) for k, v in ga.items())
    return dot / (np.sqrt(sum(v * v for v in ga.values())) * np.sqrt(sum(v * v for v in gb.values())))


def read_text(path: str) -> str:
    t = open(path, encoding="utf-8", errors="ignore").read()
    # .vtt/.srt 시간 줄 제거
    lines = [l for l in t.splitlines() if "-->" not in l and not l.strip().isdigit() and l.strip() != "WEBVTT"]
    return "\n".join(lines)


# ───────────────────────── 점수·조언 ─────────────────────────
def score(res: Result, hist: list[dict], script_sims: list[float]) -> dict:
    n = max(len(res.video), 1)
    v = res.video
    full = sum(x in ("full", "mirror") for x in v) / n
    pip = sum(x == "pip" for x in v) / n
    mirror = sum(x == "mirror" for x in v) / n
    a_src = sum(x == "source" for x in res.audio) / n
    voice = sum(res.voice) / n
    # 원본만 나오는 구간(화면 원본 전체 + 소리가 원본이거나 무음)
    pure = [v[i] in ("full", "mirror") and res.audio[i] in ("source", "silent") for i in range(min(len(v), len(res.audio)))]
    runs = _runs(pure, 1)
    longest = max([b - a for a, b in runs], default=0)

    risk = 0.0
    risk += 45 * full + 15 * pip
    risk += 20 * a_src
    risk += 15 * max(0.0, 1 - voice / 0.35)          # 해설이 35% 이상이면 0점
    risk += min(15, max(0, longest - 10) * 0.75)       # 10초 넘는 원본 단독 구간부터
    if mirror > 0.2:
        risk += 10                                     # 반전 같은 최소 변형은 오히려 감점
    if full + pip < 0.05:                              # 원본이 거의 없으면 재사용 위험 낮음
        risk = min(risk, 5)
    risk = round(min(100, risk))

    rep = 0.0
    for h in hist:
        rep = max(rep, h["same_ratio"] * 100)
    for s in script_sims:
        rep = max(rep, (s - 0.5) * 200 if s > 0.5 else 0)
    rep = round(min(100, rep))

    advice = []
    if longest > 10:
        a, b = max(runs, key=lambda r: r[1] - r[0])
        advice.append(f"{_t(a)}~{_t(b)}: 원본만 {int(b - a)}초 이어집니다. 중간에 내 해설이나 설명 자막을 넣어 10초 안으로 끊어 주세요.")
    if mirror > 0.2:
        advice.append("좌우 반전으로 원본을 바꾼 장면이 많습니다. 반전·색 보정·속도 변경은 「최소한의 변경」으로 보여 의미 있는 차이가 되지 않습니다.")
    if voice < 0.35:
        advice.append(f"내 목소리(해설)가 전체의 {round(voice * 100)}%입니다. 35% 이상이 되도록 내 의견·비교·배경 설명을 더해 주세요.")
    if a_src > 0.4:
        advice.append(f"원본 소리가 전체의 {round(a_src * 100)}%입니다. 원본 소리는 줄이고 내 내레이션을 위에 올려 주세요.")
    if full > 0.5 and pip < 0.1:
        advice.append("원본이 화면 전체를 차지하는 시간이 깁니다. 화면 속 화면, 내 얼굴·반응 화면, 설명 그래픽을 섞어 주세요.")
    for h in hist:
        for s in h["segments"]:
            advice.append(f"지난 영상 「{h['video']}」와 {_t(s['start'])}~{_t(s['end'])} 화면이 같습니다. 같은 인트로를 매번 쓰면 반복 콘텐츠로 보일 수 있으니 짧게 줄이거나 영상마다 바꿔 주세요.")
    for i, s in enumerate(script_sims):
        if s > 0.6:
            advice.append(f"대본이 지난 대본 {i + 1}과 {round(s * 100)}% 비슷합니다. 틀만 같고 내용이 다르게 보이도록 문장을 새로 써 주세요.")
    if not advice:
        advice.append("큰 위험 신호가 없습니다. 원본 출처 표기와 내 의견을 계속 유지해 주세요.")

    level = "높음" if risk >= 60 else "주의" if risk >= 35 else "낮음"
    rlevel = "높음" if rep >= 60 else "주의" if rep >= 30 else "낮음"
    return {
        "reuse_risk": risk, "reuse_level": level,
        "repeat_risk": rep, "repeat_level": rlevel,
        "metrics": {
            "source_fullscreen_ratio": round(full, 3), "source_pip_ratio": round(pip, 3),
            "mirrored_ratio": round(mirror, 3), "source_audio_ratio": round(a_src, 3),
            "my_voice_ratio": round(voice, 3), "longest_source_only_sec": longest,
        },
        "advice": advice,
    }


def _t(s: float) -> str:
    s = int(round(s))
    return f"{s // 60}:{s % 60:02d}"


# ───────────────────────── 보고서 ─────────────────────────
COLORS = {"own": "#2e9e6a", "pip": "#e0a526", "full": "#d64545", "mirror": "#8e3bd1",
          "new": "#2e9e6a", "source": "#d64545", "silent": "#9aa0a6"}
NAMES = {"own": "내 화면", "pip": "원본(화면 속 화면)", "full": "원본(전체 화면)", "mirror": "원본(반전)",
         "new": "새 소리", "source": "원본 소리", "silent": "무음"}


def _bar(labels):
    n = max(len(labels), 1)
    return "".join(f'<i style="width:{100 / n:.3f}%;background:{COLORS[l]}" title="{_t(i)} {NAMES[l]}"></i>'
                   for i, l in enumerate(labels))


def write_report(out_dir: str, name: str, res: Result, sc: dict, hist: list[dict]):
    os.makedirs(out_dir, exist_ok=True)
    data = {"video": name, "duration_sec": round(res.duration, 1), **sc,
            "timeline": {"video": res.video, "audio": res.audio, "voice": res.voice}, "history": hist}
    with open(os.path.join(out_dir, "result.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    def badge(v, lv):
        c = {"높음": "#d64545", "주의": "#e0a526", "낮음": "#2e9e6a"}[lv]
        return f'<b style="color:{c}">{v}</b><span style="background:{c}">{lv}</span>'
    m = sc["metrics"]
    def legend(keys):
        return '<div class="legend">' + "".join(f'<em><i style="background:{COLORS[k]}"></i>{NAMES[k]}</em>' for k in keys) + "</div>"
    ticks = "".join(f'<span style="left:{p}%">{_t(res.duration * p / 100)}</span>' for p in (0, 25, 50, 75, 100))
    page = f"""<!doctype html><html lang="ko"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>재사용 점검 결과</title>
<style>
body{{font-family:system-ui,'Noto Sans KR',sans-serif;margin:0;padding:16px;background:#f6f7f9;color:#1d2228}}
main{{max-width:760px;margin:auto}} h1{{font-size:20px}} .cards{{display:grid;grid-template-columns:1fr 1fr;gap:12px}}
.card{{background:#fff;border-radius:12px;padding:14px;box-shadow:0 1px 3px #0001}}
.card b{{font-size:36px;margin-right:8px}} .card span{{color:#fff;border-radius:99px;padding:2px 10px;font-size:13px;vertical-align:middle}}
.bar{{display:flex;height:22px;border-radius:6px;overflow:hidden;margin:4px 0 2px}} .bar i{{display:block;height:100%}}
.ticks{{position:relative;height:16px;font-size:11px;color:#666}} .ticks span{{position:absolute;transform:translateX(-50%)}}
.ticks span:first-child{{transform:none}} .ticks span:last-child{{transform:translateX(-100%)}}
.legend{{font-size:12px;display:flex;flex-wrap:wrap;gap:10px;margin:2px 0 10px}} .legend i{{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:4px}}
.legend em{{font-style:normal}} ol li{{margin:6px 0}} table{{width:100%;font-size:14px;border-collapse:collapse}} td{{padding:4px 0;border-bottom:1px solid #eee}}
td:last-child{{text-align:right}} small{{color:#666}}
</style><main>
<h1>재사용·반복 콘텐츠 자가 점검</h1><p><small>{html.escape(name)} · {_t(res.duration)}</small></p>
<div class="cards"><div class="card"><small>재사용 위험</small><br>{badge(sc['reuse_risk'], sc['reuse_level'])}</div>
<div class="card"><small>반복·대량 생산 위험</small><br>{badge(sc['repeat_risk'], sc['repeat_level'])}</div></div>
<div class="card" style="margin-top:12px"><small>화면</small><div class="bar">{_bar(res.video)}</div>{legend(["own", "pip", "full", "mirror"])}
<small>소리</small><div class="bar">{_bar(res.audio)}</div><div class="ticks">{ticks}</div>{legend(["new", "source", "silent"])}</div>
<div class="card" style="margin-top:12px"><b style="font-size:16px">이렇게 고쳐 보세요</b><ol>{''.join(f'<li>{html.escape(a)}</li>' for a in sc['advice'])}</ol></div>
<div class="card" style="margin-top:12px"><table>
<tr><td>원본이 화면 전체에 나온 비율</td><td>{round(m['source_fullscreen_ratio'] * 100)}%</td></tr>
<tr><td>원본이 화면 속 화면으로 나온 비율</td><td>{round(m['source_pip_ratio'] * 100)}%</td></tr>
<tr><td>좌우 반전된 원본 비율</td><td>{round(m['mirrored_ratio'] * 100)}%</td></tr>
<tr><td>원본 소리 비율</td><td>{round(m['source_audio_ratio'] * 100)}%</td></tr>
<tr><td>내 목소리(해설) 비율</td><td>{round(m['my_voice_ratio'] * 100)}%</td></tr>
<tr><td>원본만 이어진 가장 긴 구간</td><td>{int(m['longest_source_only_sec'])}초</td></tr></table></div>
<p><small>이 결과는 올리기 전 스스로 점검하는 참고용입니다. 유튜브의 실제 심사 결과를 보장하지 않습니다.
기준: <a href="https://support.google.com/youtube/answer/1311392">YouTube 채널 수익 창출 정책</a></small></p>
</main></html>"""
    with open(os.path.join(out_dir, "report.html"), "w", encoding="utf-8") as f:
        f.write(page)


def main(argv=None):
    ap = argparse.ArgumentParser(description="재사용·반복 콘텐츠 자가 점검기")
    ap.add_argument("video", help="점검할 내 영상")
    ap.add_argument("--source", action="append", default=[], help="가져다 쓴 원본 영상(여러 개 가능)")
    ap.add_argument("--history", action="append", default=[], help="내 지난 영상(반복 점검용)")
    ap.add_argument("--script", help="이번 영상 대본·자막(.txt/.vtt/.srt)")
    ap.add_argument("--history-script", action="append", default=[], help="지난 영상 대본·자막")
    ap.add_argument("--out", default="reuse-report", help="결과 폴더")
    a = ap.parse_args(argv)

    refs = [load_ref(s) for s in a.source]
    res = analyze(a.video, refs)
    hist = history_overlap(a.video, a.history)
    sims = []
    if a.script and a.history_script:
        mine = read_text(a.script)
        sims = [text_similarity(mine, read_text(p)) for p in a.history_script]
    sc = score(res, hist, sims)
    write_report(a.out, os.path.basename(a.video), res, sc, hist)
    print(f"재사용 위험 {sc['reuse_risk']}({sc['reuse_level']}) · 반복 위험 {sc['repeat_risk']}({sc['repeat_level']})")
    for k, v in sc["metrics"].items():
        print(f"  {k}: {v}")
    for x in sc["advice"]:
        print("  -", x)
    print(f"보고서: {os.path.join(a.out, 'report.html')}")
    return sc


if __name__ == "__main__":
    main()
