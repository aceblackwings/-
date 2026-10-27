# 3개월 에이전트 AI 학습 체크리스트
> Claude · Cowork · 터미널 · Claude Code → 카드뉴스 자동화 파이프라인 완성

- 시작일: ____년 __월 __일
- 목표 완료일: ____년 __월 __일 (12주 뒤)
- 하루 루틴(평일 1시간): 강의 20분 → 따라 하기 30분 → 3줄 기록 10분
- 막힘 규칙: 30분 이상 막히면 오류 화면 캡처 → 질문

## 진도 한눈에 보기

| 주 | 주제 | 완료 | 완료일 |
|---|---|---|---|
| 1 | Claude 기본기 | ☐ | |
| 2 | Cowork 실습 | ☐ | |
| 3 | 터미널 + Claude Code 설치 | ☐ | |
| 4 | Claude Code 기본기 | ☐ | |
| 5 | CLAUDE.md · 권한 모드 | ☐ | |
| 6 | 스킬(Skills) | ☐ | |
| 7 | 서브에이전트 · MCP | ☐ | |
| 8 | 브라우저 연동 · Git | ☐ | |
| 9 | 예약 작업 | ☐ | |
| 10 | 훅(Hooks) | ☐ | |
| 11 | 헤드리스 · GitHub 연동 | ☐ | |
| 12 | 최종 프로젝트 · 회고 | ☐ | |

---

# 1개월 차 · 기초: "Claude에게 일 시키는 법" (주 5시간)

## 1주 차 · Claude 기본기
**교재**
- [ ] [Claude 101 (Claude Academy)](https://academy.claude.com/courses) 수강 — 13강, 약 2.5시간

**실습**
- [ ] 프로젝트(Projects) 1개 만들고 채널 소개·타깃(4050) 정보 넣기
- [ ] 아티팩트로 간단한 페이지 1개 만들어 보기
- [ ] 커넥터가 무엇인지, 내 계정에 무엇이 연결돼 있는지 확인

**결과물**
- [ ] Claude와 함께 "카드뉴스 주제 선정 기준표" 작성

**이번 주 3줄 기록**
1.
2.
3.

## 2주 차 · Cowork로 내 컴퓨터 일 시키기
**교재**
- [ ] [Introduction to Claude Cowork](https://academy.claude.com/courses/introduction-to-claude-cowork) — 14강, 약 2.5시간
- [ ] [클로드 코워크 활용법, 핵심 기능 5가지 실습](https://www.youtube.com/watch?v=W56emdXCRMA)
- [ ] [클로드 코워크 왕초보 가이드](https://www.youtube.com/watch?v=v9izl8hN9mE)

**실습**
- [ ] Claude 데스크톱 앱 설치 및 로그인
- [ ] 다운로드 폴더 자동 정리 시켜 보기
- [ ] 뉴스 기사 5개를 요약해 표로 만들기

**결과물**
- [ ] 카드뉴스 작업 폴더 구조 정리 (주제별 / 날짜별)

**이번 주 3줄 기록**
1.
2.
3.

## 3주 차 · 터미널 겁 없애기 + Claude Code 설치
**교재**
- [ ] [클로드 코드 입문, 설치부터 프롬프트 1줄로 웹 만들기](https://www.youtube.com/watch?v=QacldO_VQww)
- [ ] [비전공자를 위한 클로드코드 기초강의](https://www.youtube.com/watch?v=8qEl-s4OA7I)
- [ ] [PowerShell 입문 (MS Learn)](https://learn.microsoft.com/ko-kr/powershell/scripting/learn/ps101/00-introduction)

**실습 (혼자 할 수 있으면 체크)**
- [ ] 터미널(PowerShell) 열기
- [ ] `cd 폴더이름` 으로 폴더 이동, `cd ..` 으로 뒤로 가기
- [ ] `dir` 로 파일 목록 보기
- [ ] `git clone 주소` 로 저장소 내려받기
- [ ] `claude` 실행 → 첫 대화 → `/exit` 로 종료
- [ ] `claude update` 로 최신 버전 유지

**결과물**
- [ ] 설치 과정에서 막혔던 오류와 해결법 메모 1장

**이번 주 3줄 기록**
1.
2.
3.

## 4주 차 · Claude Code 기본기
**교재**
- [ ] [Claude Code 101](https://academy.claude.com/courses/claude-code-101) — 12강, 약 1.5시간 (배지 취득)
- [ ] [Claude Code 왕초보 입문 튜토리얼 23가지 팁](https://www.youtube.com/watch?v=1_bRmkUvjHA)

**실습**
- [ ] 파일 읽기·수정 지시하고 권한 승인 창 이해하기
- [ ] `/help`, `/status`, `/clear`, `/resume` 써 보기
- [ ] 카드 HTML의 제목 문구·강조색을 말로 지시해서 바꾸기
- [ ] 바뀐 카드를 이미지(jpg)로 다시 만들기

**✅ 1개월 차 합격 기준**
- [ ] 터미널에서 `claude` 실행 → 카드 문구 수정 → 이미지 재생성까지 혼자 완료

**이번 주 3줄 기록**
1.
2.
3.

---

# 2개월 차 · 실전: "도구를 연결하는 법" (주 6시간)

## 5주 차 · CLAUDE.md(작업 규칙서)와 권한 모드
**교재**
- [ ] [Claude Code in Action](https://academy.claude.com/courses/claude-code-in-action) 전반부
- [ ] [Claude Code 공식 문서](https://code.claude.com/docs) — 메모리(CLAUDE.md), 권한 모드 편

**실습**
- [ ] `/init` 으로 CLAUDE.md 만들기
- [ ] 권한 모드 차이 이해 (매번 묻기 / 편집 자동 / 자동 모드)
- [ ] `/permissions` 로 허용·차단 규칙 확인

**결과물**
- [ ] 내 채널 규칙을 담은 CLAUDE.md 완성
  - [ ] 타깃: 4050 / 채널명: 4050 돈·안전 뉴스 / 아이디: @ockstar77
  - [ ] 제목 공식: 2줄, 숫자 포함, 핵심어 1개만 강조색
  - [ ] 분야별 강조색: 사건 빨강 / 돈 노랑 / 정책 주황
  - [ ] 출처 표기와 사실 확인 규칙 (매체 2곳 이상 교차 확인)

**이번 주 3줄 기록**
1.
2.
3.

## 6주 차 · 스킬(Skills): 반복 작업을 명령 하나로
**교재**
- [ ] Introduction to Agent Skills (Claude Academy) — 약 1시간
- [ ] [클로드 코드 풀코스 2시간: 설치부터 AI 직원 만들기까지](https://www.youtube.com/watch?v=4PvOQJsgFCg)

**실습**
- [ ] 스킬 폴더 구조 이해 (`.claude/skills/이름/SKILL.md`)
- [ ] 간단한 스킬 1개 만들어 실행해 보기

**결과물**
- [ ] `/카드뉴스` 스킬 완성: 주제 입력 → 조사 → 카드 HTML → 이미지 → 설명란·고정 댓글
- [ ] 같은 주제로 3번 실행해 결과 품질이 일정한지 확인

**이번 주 3줄 기록**
1.
2.
3.

## 7주 차 · 서브에이전트와 MCP(외부 도구 연결)
**교재**
- [ ] Introduction to Subagents (Claude Academy)
- [ ] Introduction to Model Context Protocol (Claude Academy) — 10강

**실습**
- [ ] `/agents` 로 서브에이전트 만들기
- [ ] `/mcp` 로 연결된 도구 목록 확인

**결과물**
- [ ] 역할 분담 구성 완성
  - [ ] 조사 담당: 최근 15일 이슈 찾기 + 출처 2곳 확인
  - [ ] 디자인 담당: 카드 제작
  - [ ] 검수 담당: 수치·출처·오탈자 점검

**이번 주 3줄 기록**
1.
2.
3.

## 8주 차 · 브라우저 연동과 Git 기초
**교재**
- [ ] [Chrome/Edge 연동 공식 문서](https://code.claude.com/docs/en/chrome)
- [ ] [DeepLearning.AI — Claude Code: A Highly Agentic Coding Assistant](https://learn.deeplearning.ai/courses/claude-code-a-highly-agentic-coding-assistant/information) — 10강, 약 2시간

**실습**
- [ ] `claude --chrome` 실행 → `/chrome` 에서 Status: Enabled 확인
- [ ] instagram.com, higgsfield.ai 사이트 승인
- [ ] Git 기본: `git pull` / `git add` / `git commit` / `git push` 의미 이해

**결과물**
- [ ] 힉스필드 이미지 생성 → 카드 합성 → 인스타 업로드 직전(공유 버튼 전)까지 자동 진행

**✅ 2개월 차 합격 기준**
- [ ] `/카드뉴스 사기예방` 한 줄로 카드 1장 + 설명란 + 고정 댓글이 완성됨

**이번 주 3줄 기록**
1.
2.
3.

---

# 3개월 차 · 자동화: "사람 없이 돌아가게 하는 법" (주 7시간)

## 9주 차 · 예약 작업
**교재**
- [ ] Claude Code in Action 후반부 (예약 작업·루틴)
- [ ] [클라우드 환경 공식 문서](https://code.claude.com/docs/en/cloud-environments)

**실습**
- [ ] 클라우드 환경 네트워크 설정 (허용 도메인 추가)
- [ ] 1회성 예약 작업 만들어 보기
- [ ] 매일 반복 예약 작업 만들기

**결과물**
- [ ] 매일 오전 6시 "오늘의 4050 이슈 3개 조사 보고서" 자동 생성

**이번 주 3줄 기록**
1.
2.
3.

## 10주 차 · 훅(Hooks): 작업 전후 자동 점검
**교재**
- [ ] [Claude Code 공식 문서](https://code.claude.com/docs) — Hooks 편

**실습**
- [ ] 훅의 종류 이해 (도구 실행 전 / 후 / 작업 종료 시)
- [ ] 간단한 훅 1개 만들어 동작 확인

**결과물**
- [ ] 카드 저장 시 자동 검사 훅
  - [ ] 출처 표기 누락 검사
  - [ ] 아이디(@ockstar77) 표기 검사
  - [ ] 제목 글자 수 초과 검사

**이번 주 3줄 기록**
1.
2.
3.

## 11주 차 · 헤드리스 모드와 GitHub 연동
**교재**
- [ ] Claude Code in Action — 헤드리스 모드, GitHub 연동 편
- [ ] [Claude Code 공식 문서](https://code.claude.com/docs) — Headless / GitHub Actions 편

**실습**
- [ ] `claude -p "지시문"` 으로 대화 없이 1회 실행해 보기
- [ ] 결과물이 GitHub 저장소에 자동으로 올라오게 연결

**결과물**
- [ ] 매일 아침 카드 초안 3개가 저장소에 올라오고 휴대폰 알림 수신

**이번 주 3줄 기록**
1.
2.
3.

## 12주 차 · 최종 프로젝트와 회고
**최종 파이프라인 점검**
- [ ] ① 조사: 최근 15일 이슈 자동 수집, 출처 2곳 교차 확인
- [ ] ② 제작: 카드 이미지 + 설명란 + 대체 텍스트 + 고정 댓글
- [ ] ③ 검수: 훅으로 수치·출처·아이디 자동 점검
- [ ] ④ 승인: 휴대폰으로 초안 확인 후 선택
- [ ] ⑤ 업로드: 브라우저 연동으로 게시 직전까지 진행 → 공유는 직접

**✅ 3개월 차 합격 기준**
- [ ] 아침에 초안 3개를 받고, 승인만 하면 게시까지 이어짐

**회고**
- 3개월 전과 비교해 지금 혼자 할 수 있게 된 것:
  1.
  2.
  3.
- 가장 크게 시간을 아낀 자동화:
- 다음 3개월 목표:

---

# 2주마다 점검 (지금 할 수 있게 된 것 3가지)

| 시점 | 할 수 있게 된 것 |
|---|---|
| 2주 차 끝 | |
| 4주 차 끝 | |
| 6주 차 끝 | |
| 8주 차 끝 | |
| 10주 차 끝 | |
| 12주 차 끝 | |

# 수료 배지 모음

- [ ] Claude 101
- [ ] Introduction to Claude Cowork
- [ ] Claude Code 101
- [ ] Claude Code in Action
- [ ] Introduction to Agent Skills
- [ ] Introduction to Subagents
- [ ] Introduction to Model Context Protocol
- [ ] DeepLearning.AI — Claude Code 단기 강의

> 참고: 유튜브 영상은 제목·설명 기준으로 골랐습니다. 클로드 제품은 업데이트가 잦으니, 영상 화면이 다를 때는 공식 문서를 기준으로 하세요.
