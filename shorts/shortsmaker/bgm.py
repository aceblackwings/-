"""저작권 걱정 없는 배경음악을 코드로 만든다: 잔잔한 패드 + 피아노 같은 아르페지오."""
import wave

import numpy as np

SR = 44100
# 감성 진행: Am - F - C - G (각 코드 = 근음 주파수들)
CHORDS = {
    "warm": [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [130.81, 196.0, 261.63], [196.0, 246.94, 293.66]],
}


def _pad(freqs, n):
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for f in freqs:
        for k, amp in ((1, 1.0), (2, 0.25), (0.5, 0.35)):
            det = 1 + 0.002 * np.sin(2 * np.pi * 0.2 * t + f)
            sig += amp * np.sin(2 * np.pi * f * k * det * t)
    env = np.minimum(1, t / 1.2) * np.minimum(1, (n / SR - t) / 1.2)
    return sig * env / len(freqs)


def _pluck(f, n):
    t = np.arange(n) / SR
    sig = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t) + 0.15 * np.sin(6 * np.pi * f * t)
    return sig * np.exp(-t * 3.2) * np.minimum(1, t / 0.005)


def make(path, seconds, palette="warm"):
    chords = CHORDS.get(palette, CHORDS["warm"])
    bar = 4.0  # 코드 하나 4초
    total = int((seconds + 2) * SR)
    out = np.zeros(total + int((bar + 4) * SR))  # 마지막 코드가 넘쳐도 들어가게
    i = 0
    rng = np.random.default_rng(7)
    while i * bar < seconds + 2:
        ch = chords[i % len(chords)]
        s = int(i * bar * SR)
        n = int((bar + 1.2) * SR)
        out[s:s + n] += 0.35 * _pad(ch, n)
        # 아르페지오: 코드 음을 한 옥타브 위에서 8분음표로
        notes = [x * 2 for x in ch] + [ch[1] * 4]
        for j in range(8):
            f = notes[(j * 2 + i) % len(notes)] if j % 4 else notes[0]
            ps = s + int(j * bar / 8 * SR)
            pn = int(1.6 * SR)
            out[ps:ps + pn] += 0.16 * (0.8 + 0.2 * rng.random()) * _pluck(f, pn)
        i += 1
    out = out[:total]
    # 간단한 잔향(지연 합)
    for d, g in ((0.11, 0.35), (0.23, 0.22), (0.37, 0.14)):
        k = int(d * SR)
        out[k:] += g * out[:-k]
    t = np.arange(total) / SR
    out *= np.minimum(1, t / 1.5) * np.clip((seconds + 1.5 - t) / 2.0, 0, 1)
    out = out / (np.abs(out).max() + 1e-9) * 0.5
    stereo = np.stack([out, np.roll(out, 300)], axis=1)
    with wave.open(path, "w") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((stereo * 32767).astype("<i2").tobytes())
    return path
