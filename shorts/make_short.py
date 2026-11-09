"""쇼츠 한 편 만들기.

    python3 make_short.py stories/organ-donation-7.json

순서: 문장별 음성 합성(edge-tts) → 배경음악 생성 → 모션그래픽 장면·자막 합성 → 소리 섞기(대사 나올 때 음악 자동으로 낮춤)
결과: output/<id>/<id>.mp4 · thumbnail.jpg · description.txt(설명란 + 출처)
"""
import argparse
import json
import os
import subprocess
import sys

from shortsmaker import bgm, footage, render, tts

HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("story")
    ap.add_argument("--preview", help="쉼표로 나눈 초(예: 1,5,12) → 그 순간 화면만 그림으로 저장")
    args = ap.parse_args()
    story = json.load(open(args.story, encoding="utf-8"))
    out = os.path.join(HERE, "output", story["id"])
    work = os.path.join(out, "work")
    os.makedirs(work, exist_ok=True)

    print("1/4 음성 합성")
    narr, times = tts.synth(story["segments"], story.get("voice", "ko-KR-InJoonNeural"), story.get("rate", "+0%"), work)
    print(f"   대사 길이 {times[-1][1]:.1f}초")
    credits = []
    if any(seg.get("footage") for seg in story["segments"]):
        print("   실제 영상 소재 찾기")
        credits = footage.resolve(story, times, work)

    if args.preview:
        secs = [float(x) for x in args.preview.split(",")]
        for s, im in zip(secs, render.render(story, times, None, preview=secs)):
            im.save(os.path.join(out, f"preview_{s:05.1f}.jpg"), quality=88)
        print("미리보기 저장:", out)
        return

    print("2/4 화면 합성")
    video = os.path.join(work, "video.mp4")
    end = render.render(story, times, video)

    print("3/4 배경음악")
    music = bgm.make(os.path.join(work, "bgm.wav"), end, story.get("palette", "warm"))

    print("4/4 소리 섞기")
    final = os.path.join(out, f"{story['id']}.mp4")
    flt = ("[1:a]apad,volume=1.0,aformat=channel_layouts=stereo,asplit=2[n1][n2];"
           "[2:a]volume=0.55[m];[m][n1]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[md];"
           "[md][n2]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-i", narr, "-i", music, "-filter_complex", flt,
                    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", f"{end:.2f}",
                    "-movflags", "+faststart", final], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "2.2", "-i", final, "-frames:v", "1", "-q:v", "2",
                    os.path.join(out, "thumbnail.jpg")], check=True)
    with open(os.path.join(out, "description.txt"), "w", encoding="utf-8") as f:
        f.write(f"{story['title'][0]} {story['title'][1]}\n\n")
        f.write(" ".join(s["text"] for s in story["segments"]) + "\n\n")
        f.write("출처\n" + "\n".join(f"- {u}" for u in story.get("sources", [])) + "\n")
        if credits:
            f.write("\n자료 화면\n" + "".join(f"- {c['page']} ({c['license']}{', ' + c['by'] if c['by'] else ''})\n" for c in credits))
        f.write("\n그래픽·배경음악: 직접 제작(코드 생성) / 음성: Microsoft Edge TTS\n")
        f.write("#장기기증 #생명나눔 #감동사연 #쇼츠\n")
    print("완성:", final, f"({end:.1f}초)")


if __name__ == "__main__":
    sys.exit(main())
