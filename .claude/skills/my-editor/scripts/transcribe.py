#!/usr/bin/env python3
"""Whisper로 받아쓰기: 단어마다 시작·끝 시각을 words.json에 저장한다.

사용법:
  python3 transcribe.py input.(wav|mp3|mp4|mov) -o words.json [--model small] [--language ko]
"""
import argparse
import json

import whisper


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input")
    p.add_argument("-o", "--output", default="words.json")
    p.add_argument("--model", default="small", help="tiny/base/small/medium/large-v3 (클수록 정확, 느림)")
    p.add_argument("--language", default="ko")
    args = p.parse_args()

    model = whisper.load_model(args.model)
    result = model.transcribe(args.input, language=args.language, word_timestamps=True, verbose=False)

    words = []
    for seg in result["segments"]:
        for w in seg.get("words", []):
            words.append({"word": w["word"].strip(), "start": round(w["start"], 3), "end": round(w["end"], 3)})

    out = {"text": result["text"].strip(), "language": args.language, "words": words}
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"{len(words)} words -> {args.output}")


if __name__ == "__main__":
    main()
