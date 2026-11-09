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


async def _say(text, voice, rate, out_mp3, pitch="+0Hz"):
    kw = {"proxy": _proxy()} if _proxy() else {}
    await edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, **kw).save(out_mp3)


def _to_wav(src, dst):
    # 음성 앞뒤에 붙는 빈 소리를 잘라 문장 사이가 늘어지지 않게 한다
    trim = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,"
            "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", trim, "-ac", "1", "-ar", str(SR), dst], check=True)


def _dur(path):
    with wave.open(path) as w:
        return w.getnframes() / w.getframerate()


def synth(segments, voice, rate, work, voices=None):
    """segments: [{text, who?}] → (narration.wav 경로, [(시작, 끝)] 문장별 시간).

    voices: {"배역": {"voice", "rate", "pitch"}} — 문장의 who 가 있으면 그 배역 목소리로 읽는다."""
    voices = voices or {}
    os.makedirs(work, exist_ok=True)
    parts, times, t = [], [], 0.35  # 첫 소리 전 0.35초 여유
    for i, seg in enumerate(segments):
        mp3 = os.path.join(work, f"seg{i:02d}.mp3")
        wav = os.path.join(work, f"seg{i:02d}.wav")
        for attempt in range(3):
            try:
                v = voices.get(seg.get("who"), {})
                asyncio.run(_say(seg.get("say", seg["text"]), v.get("voice", voice), v.get("rate", rate), mp3,
                                 v.get("pitch", "+0Hz")))
                break
            except Exception:
                if attempt == 2:
                    raise
        _to_wav(mp3, wav)
        d = _dur(wav)
        times.append((t, t + d))
        parts.append(wav)
        t += d + GAP + seg.get("pause", 0)
    # 이어 붙이기(앞 여유 + 문장 + 쉼)
    lst = os.path.join(work, "concat.txt")
    sil = os.path.join(work, "gap.wav")
    lead = os.path.join(work, "lead.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=mono", "-t", str(GAP), sil], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=mono", "-t", "0.35", lead], check=True)
    with open(lst, "w") as f:
        f.write(f"file '{lead}'\n")
        for p, seg in zip(parts, segments):
            f.write(f"file '{p}'\nfile '{sil}'\n")
            if seg.get("pause"):  # 장면 사이 쉼(초)
                ext = os.path.join(work, f"pause{seg['pause']}.wav")
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=mono",
                                "-t", str(seg["pause"]), ext], check=True)
                f.write(f"file '{ext}'\n")
    out = os.path.join(work, "narration.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "pcm_s16le", out], check=True)
    return out, times
