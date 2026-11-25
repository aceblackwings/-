"""인터넷 없이 ffmpeg 합성 영상으로 점검기를 시험합니다.

python3 -m unittest test_reuse_check.py
"""
import json
import os
import subprocess
import tempfile
import unittest

import reuse_check as rc

F = ["ffmpeg", "-v", "error", "-y"]


def make(path, args):
    subprocess.run(F + args + [path], check=True)


class ReuseCheckTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.d = tempfile.mkdtemp()
        j = lambda n: os.path.join(cls.d, n)
        cls.src, cls.bad, cls.pip, cls.own = j("src.mp4"), j("bad.mp4"), j("pip.mp4"), j("own.mp4")
        # 원본: 움직이는 시험 화면 + 끊기는 소리(말소리 흉내)
        make(cls.src, ["-f", "lavfi", "-i", "testsrc2=s=640x360:r=30:d=20",
                       "-f", "lavfi", "-i", "sine=f=440:d=20,volume='if(lt(mod(t,0.5),0.25),1,0.05)':eval=frame",
                       "-c:v", "libx264", "-preset", "veryfast", "-c:a", "aac", "-shortest"])
        # 재사용본: 좌우 반전 + 색 보정, 원본 소리 그대로
        make(cls.bad, ["-i", cls.src, "-vf", "hflip,eq=saturation=1.3", "-c:v", "libx264",
                       "-preset", "veryfast", "-c:a", "aac"])
        # 변형본: 내 배경 위 화면 속 화면 + 내 목소리(다른 높이·리듬의 끊기는 소리)
        make(cls.pip, ["-i", cls.src, "-f", "lavfi", "-i", "cellauto=s=640x360:r=30:rule=110",
                       "-f", "lavfi", "-i", "sine=f=220:d=20,volume='if(lt(mod(t,0.3),0.15),1,0.02)':eval=frame",
                       "-filter_complex", "[0:v]scale=360:202[p];[1:v][p]overlay=30:40,trim=0:20[v];[0:a]volume=0.05[s];[s][2:a]amix=2:normalize=0[a]",
                       "-map", "[v]", "-map", "[a]", "-t", "20", "-c:v", "libx264", "-preset", "veryfast", "-c:a", "aac"])
        # 원본을 전혀 안 쓴 영상
        make(cls.own, ["-f", "lavfi", "-i", "life=s=640x360:r=30:mold=10:ratio=0.2", "-t", "10",
                       "-c:v", "libx264", "-preset", "veryfast"])

    def check(self, video, **kw):
        out = os.path.join(self.d, "out_" + os.path.basename(video))
        args = [video, "--source", self.src, "--out", out]
        for h in kw.get("history", []):
            args += ["--history", h]
        sc = rc.main(args)
        self.assertTrue(os.path.exists(os.path.join(out, "report.html")))
        with open(os.path.join(out, "result.json"), encoding="utf-8") as f:
            data = json.load(f)
        self.assertEqual(data["reuse_risk"], sc["reuse_risk"])
        return sc

    def test_mirrored_reupload_is_high(self):
        sc = self.check(self.bad)
        self.assertGreaterEqual(sc["reuse_risk"], 60)
        self.assertGreater(sc["metrics"]["mirrored_ratio"], 0.5)
        self.assertTrue(any("반전" in a for a in sc["advice"]))

    def test_pip_with_commentary_is_lower(self):
        bad = self.check(self.bad)["reuse_risk"]
        sc = self.check(self.pip)
        self.assertGreater(sc["metrics"]["source_pip_ratio"], 0.5)
        self.assertLess(sc["reuse_risk"], bad - 30)

    def test_own_video_is_low(self):
        sc = self.check(self.own)
        self.assertLessEqual(sc["reuse_risk"], 5)

    def test_history_repeat(self):
        sc = self.check(self.pip, history=[self.pip])
        self.assertGreaterEqual(sc["repeat_risk"], 60)

    def test_text_similarity(self):
        a = "오늘은 외국 도시 영상을 보면서 우리나라와 다른 점을 살펴보겠습니다"
        self.assertGreater(rc.text_similarity(a, a), 0.99)
        self.assertLess(rc.text_similarity(a, "고양이가 밥을 먹고 낮잠을 잡니다"), 0.2)


if __name__ == "__main__":
    unittest.main()
