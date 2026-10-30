#!/usr/bin/env python3
"""렌더본 자동 검사 (사람이 보기 전에 실행).

1) 입 모양 싱크: 렌더 영상 속 소리와 원본 음성의 시차(ms)
2) 개인 정보: 0.5초마다 화면 글자를 OCR로 읽어 이메일·API 키·UUID가 보이면 실패
3) 소리 크기: 통합 라우드니스가 -14 LUFS(±1) 인지

사용법:
  python3 check_render.py render.mp4 --audio cut.wav [--sync-tol-ms 0] [--target-lufs -14]
하나라도 실패하면 종료 코드 1. 결과는 check_report.json 에도 저장한다.
"""
import argparse
import glob
import json
import os
import re
import subprocess
import sys
import tempfile

import numpy as np

SR = 16000
SECRET_PATTERNS = {
    "email": r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
    "uuid": r"\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b",
    "api_key": r"\b(?:sk-[A-Za-z0-9_-]{16,}|sk-ant-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}"
               r"|AIza[0-9A-Za-z_-]{30,}|xox[baprs]-[A-Za-z0-9-]{10,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,})",
}


def load_pcm(path, seconds=None):
    cmd = ["ffmpeg", "-v", "error", "-i", path]
    if seconds:
        cmd += ["-t", str(seconds)]
    cmd += ["-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32)


def sync_offset_ms(render, audio, seconds=30):
    a, b = load_pcm(render, seconds), load_pcm(audio, seconds)
    n = 1 << int(np.ceil(np.log2(len(a) + len(b))))
    corr = np.fft.irfft(np.fft.rfft(a, n) * np.conj(np.fft.rfft(b, n)), n)
    lag = int(np.argmax(corr))
    if lag > n // 2:
        lag -= n
    return lag * 1000 / SR


def scan_privacy(render, every=0.5, lang="kor+eng"):
    hits = []
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["ffmpeg", "-v", "error", "-i", render, "-vf", f"fps={1 / every}",
                        os.path.join(tmp, "f%05d.png")], check=True)
        for i, frame in enumerate(sorted(glob.glob(os.path.join(tmp, "*.png")))):
            text = subprocess.run(["tesseract", frame, "-", "-l", lang],
                                  capture_output=True, text=True).stdout
            for kind, pat in SECRET_PATTERNS.items():
                for m in re.findall(pat, text):
                    hits.append({"time": round(i * every, 2), "type": kind, "text": m})
    return hits


def integrated_lufs(path):
    err = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    vals = re.findall(r"I:\s+(-?[\d.]+) LUFS", err)
    return float(vals[-1]) if vals else None


def main():
    p = argparse.ArgumentParser()
    p.add_argument("render")
    p.add_argument("--audio", help="원본(편집 후) 음성 파일. 없으면 싱크 검사 생략")
    p.add_argument("--sync-tol-ms", type=float, default=0)
    p.add_argument("--target-lufs", type=float, default=-14)
    p.add_argument("--lufs-tol", type=float, default=1)
    p.add_argument("--every", type=float, default=0.5)
    p.add_argument("--report", default="check_report.json")
    args = p.parse_args()

    report = {}
    if args.audio:
        off = sync_offset_ms(args.render, args.audio)
        report["sync"] = {"offset_ms": round(off, 2), "pass": abs(off) <= args.sync_tol_ms}
    hits = scan_privacy(args.render, args.every)
    report["privacy"] = {"hits": hits, "pass": not hits}
    lufs = integrated_lufs(args.render)
    report["loudness"] = {"lufs": lufs, "target": args.target_lufs,
                          "pass": lufs is not None and abs(lufs - args.target_lufs) <= args.lufs_tol}

    ok = all(v["pass"] for v in report.values())
    report["pass"] = ok
    with open(args.report, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    if "sync" in report:
        print(f"[{'OK' if report['sync']['pass'] else 'FAIL'}] 입 모양 싱크: {report['sync']['offset_ms']} ms")
    print(f"[{'OK' if not hits else 'FAIL'}] 개인 정보: {len(hits)}건")
    for h in hits:
        print(f"    {h['time']}s {h['type']}: {h['text']}")
    print(f"[{'OK' if report['loudness']['pass'] else 'FAIL'}] 소리 크기: {lufs} LUFS (목표 {args.target_lufs})")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
