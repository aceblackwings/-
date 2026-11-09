"""드라이브에서 받은 장면 그림을 번호대로 넣기.

    python3 -I tools/images_ingest.py 원본폴더 images/village-funeral [--skip-first]

- 원본폴더의 그림을 파일 이름 순서(힉스필드 기본 이름 hf_YYYYMMDD_HHMMSS = 만든 시각 순)로 정렬해 01, 02 … 로 붙인다.
- --skip-first: 맨 앞 그림(00 인물 기준 그림)은 건너뛴다.
- 이름에 「다시 NN」 또는 「redo NN」이 있으면 그 번호 칸을 그 그림으로 바꾼다.
- 정사각형으로 가운데를 잘라 1080×1080 JPG로 저장하고, 확인용 contact.jpg를 만든다.
"""
import os
import re
import sys

from PIL import Image

SIZE = 1080
EXT = (".png", ".jpg", ".jpeg", ".webp")


def square(im):
    w, h = im.size
    s = min(w, h)
    im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))
    return im.convert("RGB").resize((SIZE, SIZE), Image.LANCZOS)


def main():
    src, dst = sys.argv[1], sys.argv[2]
    skip = "--skip-first" in sys.argv
    os.makedirs(dst, exist_ok=True)
    files = sorted(f for f in os.listdir(src) if f.lower().endswith(EXT) and f != "contact.jpg")
    redo = {}
    normal = []
    for f in files:
        m = re.search(r"(?:다시|redo)\s*(\d{1,2})", f)
        (redo.__setitem__(int(m.group(1)), f) if m else normal.append(f))
    if skip and normal:
        normal = normal[1:]
    plan = {i + 1: f for i, f in enumerate(normal)}
    plan.update(redo)
    for n, f in sorted(plan.items()):
        square(Image.open(os.path.join(src, f))).save(os.path.join(dst, f"{n:02d}.jpg"), quality=92)
        print(f"{n:02d} ← {f}")
    thumbs = [Image.open(os.path.join(dst, f"{n:02d}.jpg")).resize((216, 216)) for n in sorted(plan)]
    cols = 6
    sheet = Image.new("RGB", (216 * cols, 216 * ((len(thumbs) + cols - 1) // cols)), "black")
    for i, t in enumerate(thumbs):
        sheet.paste(t, (216 * (i % cols), 216 * (i // cols)))
    sheet.save(os.path.join(src, "contact.jpg"), quality=85)


if __name__ == "__main__":
    main()
