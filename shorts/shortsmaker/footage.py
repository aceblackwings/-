"""실제 영상 소재: Pixabay(키 PIXABAY_API_KEY) 자동 검색 또는 직접 넣은 파일("file:경로").

- 검색어마다 길이가 충분한 영상을 하나씩 골라 work/clips 에 받는다(같은 영상 중복 금지).
- 출처(페이지 주소·올린 사람·라이선스)는 credits 로 모아 설명란에 적는다.
- 화면에 넣을 때는 1080×1080 으로 채우고 색을 한 톤으로 맞춘다(따뜻한 색·대비·비네트).
"""
import json
import os
import re
import subprocess
import urllib.parse
import urllib.request

from PIL import Image

SIZE = 1080
FPS = 30
UA = {"User-Agent": "ShortsMaker/0.2"}
# 사연 영상에서 피할 태그(식별 가능한 환자·얼굴 위주 장면)
AVOID_TAGS = {"patient", "sick", "illness", "portrait", "face", "selfie", "model"}
GRADE = ("eq=saturation=0.88:contrast=1.06:brightness=-0.02,"
         "colorbalance=rs=0.05:gs=0.01:bs=-0.05:rm=0.03:bm=-0.03,vignette=PI/5")


def _get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return json.load(r)


def pixabay_search(query, need_sec, used):
    key = os.environ.get("PIXABAY_API_KEY")
    if not key:
        raise RuntimeError("PIXABAY_API_KEY 가 없습니다(환경 변수 등록 후 새 세션에서 실행).")
    q = urllib.parse.urlencode({"key": key, "q": query, "per_page": 20, "safesearch": "true", "video_type": "film"})
    hits = _get(f"https://pixabay.com/api/videos/?{q}").get("hits", [])

    def ok(h):
        tags = {t.strip() for t in h.get("tags", "").split(",")}
        return h["id"] not in used and h.get("duration", 0) >= need_sec and not (tags & AVOID_TAGS)

    for h in [h for h in hits if ok(h)] or [h for h in hits if h["id"] not in used]:
        v = h["videos"].get("medium") or h["videos"].get("large") or h["videos"].get("small")
        if v and v.get("url"):
            used.add(h["id"])
            return {"id": h["id"], "url": v["url"], "page": h["pageURL"], "by": h.get("user", ""),
                    "license": "Pixabay Content License", "query": query}
    return None


def pixabay_by_id(vid, used):
    """「pixabay:ID」 — 눈으로 고른 영상을 번호로 정확히 지정(검색 결과가 엉뚱할 때)."""
    key = os.environ.get("PIXABAY_API_KEY")
    if not key:
        raise RuntimeError("PIXABAY_API_KEY 가 없습니다(환경 변수 등록 후 새 세션에서 실행).")
    hits = _get(f"https://pixabay.com/api/videos/?key={key}&id={int(vid)}").get("hits", [])
    if not hits:
        return None
    h = hits[0]
    v = h["videos"].get("medium") or h["videos"].get("large") or h["videos"].get("small")
    used.add(h["id"])
    return {"id": h["id"], "url": v["url"], "page": h["pageURL"], "by": h.get("user", ""),
            "license": "Pixabay Content License", "query": f"id {h['id']}"}


def pixabay_photo(pid, used):
    """「photo:ID」 — Pixabay 사진 한 장(천천히 확대되는 정지 화면으로 씀)."""
    key = os.environ.get("PIXABAY_API_KEY")
    hits = _get(f"https://pixabay.com/api/?key={key}&id={int(pid)}").get("hits", [])
    if not hits:
        return None
    h = hits[0]
    return {"id": f"p{h['id']}", "url": h.get("largeImageURL") or h["webformatURL"], "page": h["pageURL"],
            "by": h.get("user", ""), "license": "Pixabay Content License", "query": f"photo {h['id']}", "ext": "jpg"}


def _download(url, path):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=180) as r, open(path, "wb") as f:
        f.write(r.read())


def resolve(story, times, work):
    """segments[*].footage → segments[*]["_clips"] = [파일 경로…], 반환: credits"""
    clip_dir = os.path.join(work, "clips")
    os.makedirs(clip_dir, exist_ok=True)
    used, credits = set(), []
    for seg, (a, b) in zip(story["segments"], times):
        items = seg.get("footage") or []
        if not items:
            continue
        need = (b - a) / len(items) + 1.5
        seg["_clips"] = []
        for it in items:
            if it.startswith("file:"):
                seg["_clips"].append(it[5:])
                credits.append({"query": "(직접 넣은 파일)", "page": os.path.basename(it[5:]), "by": "", "license": "직접 확보"})
                continue
            slug = re.sub(r"[^a-z0-9]+", "-", it.lower()).strip("-")
            if it.startswith("photo:"):
                hit = pixabay_photo(it[6:], used)
            elif it.startswith("pixabay:"):
                hit = pixabay_by_id(it[8:], used)
            else:
                hit = pixabay_search(it, need, used)
            if not hit:
                print(f"   ! 검색 결과 없음: {it} → 그래픽 배경으로 대체")
                continue
            path = os.path.join(clip_dir, f"{slug}-{hit['id']}.{hit.get('ext', 'mp4')}")
            if not os.path.exists(path):
                _download(hit["url"], path)
            seg["_clips"].append(path)
            credits.append(hit)
            print(f"   ✓ {it} → {hit['page']}")
    return credits


class ClipStream:
    """영상 하나를 1080×1080 프레임으로 차례대로 꺼내 준다(모자라면 처음부터 반복)."""

    def __init__(self, path, frames, offset=0.6):
        vf = (f"scale={SIZE}:{SIZE}:force_original_aspect_ratio=increase,crop={SIZE}:{SIZE},fps={FPS},{GRADE}")
        still = path.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
        src = ["-loop", "1", "-i", path] if still else ["-stream_loop", "-1", "-ss", str(offset), "-i", path]
        self.p = subprocess.Popen(["ffmpeg", "-v", "error", *src,
                                   "-vf", vf, "-frames:v", str(frames + 2), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                                  stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        self.last = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 255))

    def read(self):
        buf = self.p.stdout.read(SIZE * SIZE * 3) if self.p else b""
        if len(buf) == SIZE * SIZE * 3:
            self.last = Image.frombytes("RGB", (SIZE, SIZE), buf).convert("RGBA")
        return self.last

    def close(self):
        if self.p:
            self.p.kill()
            self.p.stdout.close()
            self.p.wait()
            self.p = None
