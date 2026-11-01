#!/usr/bin/env python3
"""간단한 마크다운을 Google Docs batchUpdate 요청(JSON)으로 바꾼다. 문서 본문 전체를 교체한다.

지원 문법 (한 줄 단위):
  # 제목        -> TITLE
  ## 소제목     -> HEADING_1
  ### 소소제목  -> HEADING_2
  - 항목        -> 글머리 기호 목록
  그 외         -> 본문
  줄 안: **굵게**, [글자](https://링크)

사용법:
  python3 md_to_gdoc.py 정리.md --end-index <read_doc의 body 마지막 endIndex> -o requests.json
  (새로 만든 빈 문서는 --end-index 2)
결과 requests.json 을 update_doc 의 requests 로 그대로 넘기고,
writeControl.requiredRevisionId 에는 직전 read_doc 의 revisionId 를 넣는다.
"""
import argparse, json, re, sys

INLINE = re.compile(r"\*\*(.+?)\*\*|\[([^\]]+)\]\((https?://[^)\s]+)\)")


def u16(s):
    return len(s.encode("utf-16-le")) // 2


def parse_inline(text):
    """마크다운 인라인 표기를 벗기고 (평문, [(시작, 끝, 종류, 값)]) 을 돌려준다(UTF-16 오프셋)."""
    out, spans, pos = "", [], 0
    for m in INLINE.finditer(text):
        out += text[pos:m.start()]
        start = u16(out)
        if m.group(1) is not None:
            out += m.group(1)
            spans.append((start, u16(out), "bold", None))
        else:
            out += m.group(2)
            spans.append((start, u16(out), "link", m.group(3)))
        pos = m.end()
    out += text[pos:]
    return out, spans


def build(md, end_index):
    paras = []  # (text, style, is_bullet, spans)
    for raw in md.splitlines():
        line = raw.rstrip()
        if not line.strip():
            continue  # 빈 줄은 문단 간격으로 대신한다
        style, bullet = "NORMAL_TEXT", False
        if line.startswith("### "):
            style, line = "HEADING_2", line[4:]
        elif line.startswith("## "):
            style, line = "HEADING_1", line[3:]
        elif line.startswith("# "):
            style, line = "TITLE", line[2:]
        elif line.startswith("- ") or line.startswith("* "):
            bullet, line = True, line[2:]
        text, spans = parse_inline(line.strip())
        paras.append((text, style, bullet, spans))
    if not paras:
        sys.exit("빈 문서입니다.")

    body = "\n".join(p[0] for p in paras)
    total = u16(body)
    reqs = []
    if end_index - 1 > 1:
        reqs.append({"deleteContentRange": {"range": {"startIndex": 1, "endIndex": end_index - 1}}})
    reqs.append({"insertText": {"location": {"index": 1}, "text": body}})
    whole = {"startIndex": 1, "endIndex": 1 + total + 1}
    reqs.append({"deleteParagraphBullets": {"range": whole}})
    reqs.append({"updateParagraphStyle": {"range": whole, "paragraphStyle": {"namedStyleType": "NORMAL_TEXT"}, "fields": "namedStyleType"}})
    reqs.append({"updateTextStyle": {"range": {"startIndex": 1, "endIndex": 1 + total}, "textStyle": {}, "fields": "bold,italic,link,underline,foregroundColor"}})

    idx, bullet_run = 1, None
    styled = []
    for text, style, bullet, spans in paras:
        n = u16(text)
        rng = {"startIndex": idx, "endIndex": idx + n + 1}
        if style != "NORMAL_TEXT":
            ps = {"namedStyleType": style}
            fields = "namedStyleType"
            if style.startswith("HEADING"):
                ps["keepWithNext"] = True
                fields += ",keepWithNext"
            styled.append({"updateParagraphStyle": {"range": rng, "paragraphStyle": ps, "fields": fields}})
        if bullet:
            bullet_run = [bullet_run[0] if bullet_run else idx, idx + n + 1]
        elif bullet_run:
            styled.append({"createParagraphBullets": {"range": {"startIndex": bullet_run[0], "endIndex": bullet_run[1]}, "bulletPreset": "BULLET_DISC_CIRCLE_SQUARE"}})
            bullet_run = None
        for s, e, kind, val in spans:
            r = {"startIndex": idx + s, "endIndex": idx + e}
            if kind == "bold":
                styled.append({"updateTextStyle": {"range": r, "textStyle": {"bold": True}, "fields": "bold"}})
            else:
                styled.append({"updateTextStyle": {"range": r, "textStyle": {"link": {"url": val}}, "fields": "link"}})
        idx += n + 1
    if bullet_run:
        styled.append({"createParagraphBullets": {"range": {"startIndex": bullet_run[0], "endIndex": bullet_run[1]}, "bulletPreset": "BULLET_DISC_CIRCLE_SQUARE"}})
    return reqs + styled


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("markdown")
    ap.add_argument("--end-index", type=int, required=True, help="read_doc 결과 body.content 마지막 요소의 endIndex")
    ap.add_argument("-o", "--out", default="-")
    a = ap.parse_args()
    with open(a.markdown, encoding="utf-8") as f:
        reqs = build(f.read(), a.end_index)
    data = json.dumps(reqs, ensure_ascii=False)
    if a.out == "-":
        print(data)
    else:
        with open(a.out, "w", encoding="utf-8") as f:
            f.write(data)
        print(f"{len(reqs)} requests -> {a.out}", file=sys.stderr)


if __name__ == "__main__":
    main()
