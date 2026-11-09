"""edge-tts 음성 합성: 문장마다 따로 만들어 길이를 재고, 사이에 짧은 쉼을 넣어 이어 붙인다."""
import asyncio
import os
import subprocess
import wave

import edge_tts

SR = 44100
GAP = 0.18  # 문장 사이 쉼(초)


def _proxy():
    return os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")


async def _say(text, voice, rate, out_mp3):
    kw = {"proxy": _proxy()} if _proxy() else {}
    await edge_tts.Communicate(text, voice, rate=rate, **kw).save(out_mp3)


def _to_wav(src, dst):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ac", "1", "-ar", str(SR), dst], check=True)


def _dur(path):
    with wave.open(path) as w:
        return w.getnframes() / w.getframerate()


def synth(segments, voice, rate, work):
    """segments: [{text}] → (narration.wav 경로, [(시작, 끝)] 문장별 시간)."""
    os.makedirs(work, exist_ok=True)
    parts, times, t = [], [], 0.35  # 첫 소리 전 0.35초 여유
    for i, seg in enumerate(segments):
        mp3 = os.path.join(work, f"seg{i:02d}.mp3")
        wav = os.path.join(work, f"seg{i:02d}.wav")
        for attempt in range(3):
            try:
                asyncio.run(_say(seg["text"], voice, rate, mp3))
                break
            except Exception:
                if attempt == 2:
                    raise
        _to_wav(mp3, wav)
        d = _dur(wav)
        times.append((t, t + d))
        parts.append(wav)
        t += d + GAP
    # 이어 붙이기(앞 여유 + 문장 + 쉼)
    lst = os.path.join(work, "concat.txt")
    sil = os.path.join(work, "gap.wav")
    lead = os.path.join(work, "lead.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=mono", "-t", str(GAP), sil], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=mono", "-t", "0.35", lead], check=True)
    with open(lst, "w") as f:
        f.write(f"file '{lead}'\n")
        for p in parts:
            f.write(f"file '{p}'\nfile '{sil}'\n")
    out = os.path.join(work, "narration.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "pcm_s16le", out], check=True)
    return out, times
