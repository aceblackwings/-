#!/usr/bin/env python3
"""말 사이 쉼 줄이기: 쉼이 --max-gap(기본 0.18초)보다 길면 --keep(기본 0.12초)만 남기고 자른다.
목소리 속도는 바꾸지 않고 구간만 잘라 이어 붙인다. 영상 파일이면 화면도 같은 구간으로 자른다.

사용법:
  python3 cut_silence.py input.wav -o cut.wav [--words words.json --words-out words.cut.json]
  python3 cut_silence.py input.mp4 -o cut.mp4

잘린 구간 정보는 <output>.cutmap.json 에 저장되고, --words 를 주면 단어 시각도 새 타임라인에 맞게 옮긴다.
"""
import argparse
import json
import re
import subprocess


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type", "-of", "json", path],
        capture_output=True, text=True, check=True,
    ).stdout
    info = json.loads(out)
    has_video = any(s.get("codec_type") == "video" for s in info.get("streams", []))
    return float(info["format"]["duration"]), has_video


def detect_silences(path, noise_db, min_gap):
    err = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af",
         f"silencedetect=noise={noise_db}dB:d={min_gap}", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    return list(zip(starts, ends))


def build_segments(duration, silences, keep):
    """남길 구간 [(start, end)] 목록. 각 쉼의 앞뒤로 keep/2 씩 남긴다."""
    half = keep / 2
    segs, cursor = [], 0.0
    for s, e in silences:
        cut_from, cut_to = s + half, e - half
        if cut_to <= cut_from:
            continue
        if cut_from > cursor:
            segs.append((cursor, cut_from))
        cursor = cut_to
    if cursor < duration:
        segs.append((cursor, duration))
    return segs


def remap(t, segs):
    """원본 시각 t를 잘린 타임라인 시각으로 옮긴다."""
    acc = 0.0
    for s, e in segs:
        if t < s:
            return acc
        if t <= e:
            return acc + (t - s)
        acc += e - s
    return acc


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("-o", "--output", required=True)
    p.add_argument("--max-gap", type=float, default=0.18)
    p.add_argument("--keep", type=float, default=0.12)
    p.add_argument("--noise-db", type=float, default=-35)
    p.add_argument("--words")
    p.add_argument("--words-out")
    args = p.parse_args()

    duration, has_video = probe(args.input)
    segs = build_segments(duration, detect_silences(args.input, args.noise_db, args.max_gap), args.keep)

    parts, labels = [], []
    for i, (s, e) in enumerate(segs):
        parts.append(f"[0:a]atrim={s:.4f}:{e:.4f},asetpts=PTS-STARTPTS[a{i}]")
        labels.append(f"[a{i}]")
        if has_video:
            parts.append(f"[0:v]trim={s:.4f}:{e:.4f},setpts=PTS-STARTPTS[v{i}]")
    if has_video:
        inter = "".join(f"[v{i}][a{i}]" for i in range(len(segs)))
        parts.append(f"{inter}concat=n={len(segs)}:v=1:a=1[v][a]")
        maps = ["-map", "[v]", "-map", "[a]"]
    else:
        parts.append(f"{''.join(labels)}concat=n={len(segs)}:v=0:a=1[a]")
        maps = ["-map", "[a]"]

    script = args.output + ".filter.txt"
    with open(script, "w") as f:
        f.write(";\n".join(parts))
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", args.input,
                    "-filter_complex_script", script, *maps, args.output], check=True)

    new_duration = sum(e - s for s, e in segs)
    with open(args.output + ".cutmap.json", "w") as f:
        json.dump({"source": args.input, "segments": segs, "before": duration, "after": new_duration}, f, indent=2)

    if args.words:
        with open(args.words, encoding="utf-8") as f:
            data = json.load(f)
        for w in data["words"]:
            w["start"] = round(remap(w["start"], segs), 3)
            w["end"] = round(remap(w["end"], segs), 3)
        with open(args.words_out or args.words.replace(".json", ".cut.json"), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"{duration:.2f}s -> {new_duration:.2f}s ({len(segs)} segments) -> {args.output}")


if __name__ == "__main__":
    main()
