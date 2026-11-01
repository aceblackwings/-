## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.

## 디자인 작업 후 다듬기 안내 (impeccable)

화면을 만들거나 고친 응답(HTML/CSS/화면 파일 수정)의 끝에는 반드시 아래 메뉴를 붙인다. 사용자는 명령어를 외우지 않고 번호만 답한다. 번호를 받으면 해당 `/impeccable <명령> <대상 파일>`을 실행한다. 디자인과 무관한 응답에는 붙이지 않는다.

> ✨ **다듬기 할까요?** 번호만 말씀하세요.
> 1. 마무리 손질 — `/impeccable polish`
> 2. 문제 점검(글자 크기·대비·모바일) — `/impeccable audit`
> 3. 디자인 평가·점수 — `/impeccable critique`
> 4. 더 과감하게 / 5. 더 차분하게 — `bolder` / `quieter`
> 6. 휴대폰 화면 맞춤 — `/impeccable adapt`
> 0. 괜찮아요
