"""무료 상업 이용 영상 검색(Pexels·Pixabay). API 키가 있을 때만 쓴다 — 키는 환경 변수로.

    PEXELS_API_KEY=...  PIXABAY_API_KEY=...

받은 파일마다 라이선스·원본 주소를 credits 목록에 남겨 설명란 출처에 쓴다.
(이 모듈은 키가 없어 아직 실제 호출로 시험하지 않았다. 첫 영상은 모션그래픽만 사용.)
"""
import json
import os
import urllib.parse
import urllib.request

UA = {"User-Agent": "ShortsMaker/0.1"}


def _get(url, headers=None):
    req = urllib.request.Request(url, headers={**UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def pexels(query, n=3, orientation="landscape"):
    key = os.environ.get("PEXELS_API_KEY")
    if not key:
        return []
    q = urllib.parse.urlencode({"query": query, "per_page": n, "orientation": orientation})
    data = _get(f"https://api.pexels.com/videos/search?{q}", {"Authorization": key})
    out = []
    for v in data.get("videos", []):
        files = sorted((f for f in v["video_files"] if f.get("width") and f["width"] <= 1920), key=lambda f: -f["width"])
        if files:
            out.append({"url": files[0]["link"], "page": v["url"], "license": "Pexels License", "by": v["user"]["name"]})
    return out


def pixabay(query, n=3):
    key = os.environ.get("PIXABAY_API_KEY")
    if not key:
        return []
    q = urllib.parse.urlencode({"key": key, "q": query, "per_page": max(3, n), "safesearch": "true"})
    data = _get(f"https://pixabay.com/api/videos/?{q}")
    return [{"url": h["videos"]["medium"]["url"], "page": h["pageURL"], "license": "Pixabay Content License", "by": h["user"]}
            for h in data.get("hits", [])[:n]]


def search(query, n=3):
    return pexels(query, n) or pixabay(query, n)


def download(item, path):
    req = urllib.request.Request(item["url"], headers=UA)
    with urllib.request.urlopen(req, timeout=120) as r, open(path, "wb") as f:
        f.write(r.read())
    return path
