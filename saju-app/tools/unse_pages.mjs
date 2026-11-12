// 띠별 2027년 운세 검색용 페이지 12장 + 목록 페이지 만들기 (v0.49, 2026-11-04 사용자 결정 「네이버·구글 검색에서 사주·신년운세로 들어오게」)
// 실행: node tools/unse_pages.mjs  → unse/2027/{띠}.html · unse/2027/index.html
// 띠 운세는 같은 해에 태어난 모든 사람의 큰 그림(연지와 그해 丁未의 관계)만 다루고, 끝에서 「내 사주로 정확히 보기」로 앱에 잇는다.
// 문장 규칙: 날씨→우산 문법(근거 → 긍정 해석 → 행동), 금지어·조사 검사 통과해야 파일을 씀
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { samjaeOf } from '../js/yearcheck.js';
import { josaProblems } from '../js/josa.js';
import { toneProblems } from '../js/habit.js';

export const YEAR = 2027;
export const YEAR_BRANCH = 7; // 未
const HANJA = '子丑寅卯辰巳午未申酉戌亥';
// 절기월 지지 → 양력으로 시작하는 달(입춘 2월 초 ~ 이듬해 소한 1월 초)
const MONTH_OF = { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 0: 12, 1: 1 };
const ORDER = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1];
const SIXHAP = { 0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6 };
const TRIADS = [[8, 0, 4], [2, 6, 10], [5, 9, 1], [11, 3, 7]];
const clash = (b) => (b + 6) % 12;

/** 띠별 내용(손으로 쓴 문장). key = 그림 파일 이름, b = 지지 번호 */
export const TTI = [
  { key: 'rat', name: '쥐', b: 0, kw: '책임이 자라는 해',
    flow: '2027년 정미년은 흙과 불의 기운이 강한 해예요. 물의 기운을 가진 쥐띠에게 흙은 둑처럼 흐름을 잡아 주는 힘이라, 책임과 자리가 커지는 한 해가 돼요. 다만 쥐(子)와 양(未)은 서로 마음이 엇갈리기 쉬운 사이(원진)라, 짐작보다 확인이 먼저인 해예요.',
    wealth: '크게 벌기보다 지키고 쌓는 힘이 좋은 해예요. 고정 지출을 한 번 정리해 두면 하반기가 한결 여유로워요.',
    work: '맡는 일이 늘고 평가받을 기회도 따라와요. 일정과 약속을 적어 두는 습관 하나가 신뢰를 크게 키워요.',
    love: '서운함이 말없이 쌓이기 쉬운 해라, 짐작하기보다 직접 묻는 쪽이 관계를 지켜 줘요.',
    health: '책임이 늘면 잠이 줄기 쉬워요. 잠드는 시간을 정해 지키면 컨디션이 오래가요.',
    act: '이번 주 할 일과 약속을 한 장에 적어 보기' },
  { key: 'ox', name: '소', b: 1, kw: '움직이며 새로 짜는 해',
    flow: '소(丑)와 양(未)은 서로 마주 보는 자리(충)라, 2027년은 이사·이직·역할 변화처럼 자리가 움직이기 쉬운 해예요. 흔들림이 아니라 오래된 틀을 새로 짜는 기회로 쓰면 한 해가 훨씬 가벼워져요. 같은 흙 기운이 겹쳐 나만의 길을 세우고 싶은 마음도 커져요.',
    wealth: '함께 쓰는 돈, 나눠 내는 돈이 늘 수 있어요. 돈이 오가는 약속은 금액과 날짜를 글로 남겨 두면 마음이 편해요.',
    work: '자리 이동이나 새 역할이 들어오기 쉬워요. 바뀌는 일을 미리 정리해 두면 변화가 오히려 기회가 돼요.',
    love: '생활 리듬이 바뀌면서 서로의 속도가 달라질 수 있어요. 일주일에 한 번 같이 걷는 시간이 거리를 좁혀 줘요.',
    health: '이동과 변화가 많은 해라 소화와 관절을 챙겨 주세요. 무리한 날 다음 날은 쉬어 가는 규칙이 좋아요.',
    act: '올해 바꾸고 싶은 것 하나, 지키고 싶은 것 하나 적기' },
  { key: 'tiger', name: '호랑이', b: 2, kw: '거두는 손이 바쁜 해',
    flow: '나무 기운의 호랑이띠에게 흙이 두터운 2027년은 일구고 거둘 밭이 넓어지는 해예요. 해 온 만큼 결과로 돌아오는 흐름이라, 계획을 숫자로 세울수록 손에 남는 것이 많아져요. 불의 기운도 함께 들어와 표현과 실행에 힘이 붙어요.',
    wealth: '수입 기회가 늘어나는 해예요. 들어오는 돈의 일부를 바로 따로 떼어 두면 한 해 끝에 크게 남아요.',
    work: '성과가 눈에 보이는 일이 잘 맞아요. 목표를 달마다 쪼개 두면 하반기에 큰 결실로 이어져요.',
    love: '챙겨 주고 싶은 마음이 커지는 해예요. 선물보다 시간을 내어 주는 쪽이 더 오래 기억돼요.',
    health: '바쁘게 움직이다 쉬는 때를 놓치기 쉬워요. 하루 한 번 스트레칭으로 몸을 풀어 주세요.',
    act: '이달 수입과 지출을 세 줄로 정리하기' },
  { key: 'rabbit', name: '토끼', b: 3, kw: '손잡고 거두는 해',
    flow: '토끼(卯)와 양(未)은 함께 큰 숲을 이루는 사이(삼합)라, 2027년은 사람과 손잡을수록 일이 커지는 해예요. 나무 기운의 토끼띠에게 두터운 흙은 거둘 밭이기도 해서, 협업과 소개에서 실속이 생겨요.',
    wealth: '함께하는 일에서 들어오는 기회가 많아요. 역할과 몫을 처음에 분명히 정해 두면 끝까지 기분 좋게 거둬요.',
    work: '팀과 함께할 때 실력이 더 잘 보여요. 도와준 사람에게 고마움을 전하면 다음 기회로 이어져요.',
    love: '소개나 모임에서 좋은 인연이 닿기 쉬운 해예요. 가벼운 약속이라도 먼저 잡아 보세요.',
    health: '사람을 많이 만나 기운이 흩어지기 쉬워요. 일주일에 하루는 혼자 쉬는 날로 비워 두세요.',
    act: '함께 해 보고 싶은 사람에게 안부 한 줄 보내기' },
  { key: 'dragon', name: '용', b: 4, kw: '내 길을 세우는 해',
    flow: '흙 기운의 용띠에게 흙이 두터운 2027년은 같은 기운이 힘을 보태는 해예요. 내 판단과 내 방식이 단단해져 독립·창업·새 프로젝트처럼 스스로 서는 일에 힘이 실려요. 비슷한 사람끼리 부딪히기 쉬우니 경쟁보다 연대를 고르면 더 멀리 가요.',
    wealth: '벌 기회만큼 함께 나가는 돈도 생겨요. 큰 지출은 하루 넘겨 다시 보는 규칙이 지갑을 지켜 줘요.',
    work: '스스로 끌고 가는 일이 잘 풀려요. 혼자 다 하려 하기보다 맡길 일을 정하면 속도가 붙어요.',
    love: '고집이 부딪히기 쉬운 해라, 이기려 하기보다 이유를 먼저 들어 주면 가까워져요.',
    health: '의욕이 앞서 무리하기 쉬워요. 잠과 식사 시간을 일정하게 지키면 힘이 오래가요.',
    act: '올해 스스로 해내고 싶은 일 한 줄 적기' },
  { key: 'snake', name: '뱀', b: 5, kw: '재능이 빛나는 해',
    flow: '뱀(巳)·말(午)·양(未)은 함께 여름의 불기운을 이루는 사이(방합)라, 2027년은 뱀띠의 힘이 한데 모이는 해예요. 불이 흙을 낳듯 내 안의 재능과 생각이 밖으로 드러나 결과물이 되는 흐름이라, 보여 주고 알리는 일에 운이 따라요.',
    wealth: '솜씨와 아이디어가 수입으로 이어지기 좋은 해예요. 작은 부업이나 판매를 가볍게 시험해 보세요.',
    work: '발표·기획·창작처럼 나를 드러내는 일이 빛나요. 결과물을 기록으로 남겨 두면 다음 기회의 무기가 돼요.',
    love: '표현이 풍부해져 마음을 전하기 좋은 해예요. 말 한마디를 아끼지 않는 쪽이 관계를 키워요.',
    health: '열이 오르기 쉬운 해라 물을 자주 마시고, 늦은 밤 화면 보는 시간을 줄여 주세요.',
    act: '내가 만든 것 하나를 누군가에게 보여 주기' },
  { key: 'horse', name: '말', b: 6, kw: '손잡는 인연의 해',
    flow: '말(午)과 양(未)은 열두 띠 가운데 서로 가장 잘 맞는 짝(육합)이라, 2027년은 말띠에게 반가운 인연이 닿는 해예요. 도와주는 사람, 함께할 사람이 자연스럽게 모이고, 불이 흙을 낳듯 해 온 일이 눈에 보이는 결과로 이어져요.',
    wealth: '사람을 통해 들어오는 기회가 많아요. 소개받은 일은 가볍게라도 한 번 이야기를 들어 보세요.',
    work: '협업과 제휴가 잘 풀리는 해예요. 혼자 고민하던 일을 함께 나누면 속도가 붙어요.',
    love: '만남과 약속, 관계의 다음 걸음에 힘이 실리는 해예요. 미뤄 둔 이야기를 꺼내기 좋은 때예요.',
    health: '약속과 모임이 늘어 피곤이 쌓이기 쉬워요. 들뜬 만큼 잠을 챙기면 좋은 흐름이 오래가요.',
    act: '고마운 사람에게 밥 한 끼 약속 잡기' },
  { key: 'sheep', name: '양', b: 7, kw: '나의 해, 새로 시작하는 해',
    flow: '2027년은 양의 해, 바로 양띠 자신의 해예요. 열두 해 만에 돌아온 내 띠의 해는 지난 시간을 정리하고 새 바퀴를 시작하는 때라, 스스로의 방향이 또렷해져요. 같은 기운이 겹쳐 고집도 커질 수 있으니 마음을 열어 두면 좋아요.',
    wealth: '새로 시작하는 만큼 준비에 드는 돈이 생겨요. 꼭 필요한 것과 갖고 싶은 것을 나눠 적으면 균형이 잡혀요.',
    work: '오래 해 온 일을 돌아보고 다음 단계를 정하기 좋은 해예요. 배우고 싶은 것 하나를 시작해 보세요.',
    love: '나를 먼저 아끼는 마음이 관계도 건강하게 해요. 혼자만의 시간과 함께하는 시간을 둘 다 챙겨 주세요.',
    health: '생활 리듬을 새로 맞추기 좋은 해예요. 정기 검진처럼 미뤄 둔 것을 상반기에 챙겨 두면 마음이 편해요.',
    act: '열두 해 전의 나에게 고마운 점 세 가지 적기' },
  { key: 'monkey', name: '원숭이', b: 8, kw: '도움이 들어오는 해',
    flow: '쇠 기운의 원숭이띠에게 흙은 나를 낳고 길러 주는 기운이라, 2027년은 도와주는 사람과 배울 거리가 들어오는 해예요. 자격증·공부·이사처럼 바탕을 다지는 일에 힘이 실리고, 윗사람이나 가족의 지지를 받기 쉬워요.',
    wealth: '바로 버는 돈보다 실력과 자격에 쓰는 돈이 나중에 크게 돌아와요. 배움에 쓰는 예산을 따로 정해 두세요.',
    work: '공부와 준비가 결과로 이어지는 해예요. 시험과 자격 일정을 상반기에 잡아 두면 좋아요.',
    love: '보살핌을 주고받는 따뜻한 해예요. 고맙다는 말을 자주 할수록 관계가 단단해져요.',
    health: '생각이 많아 몸을 덜 움직이기 쉬워요. 하루 20분 걷기로 머리와 몸을 함께 풀어 주세요.',
    act: '배우고 싶은 것 하나 찾아 첫 수업 신청하기' },
  { key: 'rooster', name: '닭', b: 9, kw: '배움으로 다지는 해',
    flow: '쇠 기운의 닭띠에게 두터운 흙은 든든한 바탕이 되어 주는 기운이라, 2027년은 배우고 준비한 만큼 실력이 단단해지는 해예요. 문서·계약·자격처럼 남는 것을 만드는 일에 운이 따르고, 믿을 만한 조언자를 만나기 쉬워요.',
    wealth: '서류와 계약을 꼼꼼히 볼수록 이득이 생기는 해예요. 도장 찍기 전 하루 넘겨 다시 읽어 보세요.',
    work: '전문성을 쌓기 좋은 해예요. 하던 일을 정리해 문서로 남기면 그 자체가 경력이 돼요.',
    love: '안정감을 주는 관계가 힘이 되는 해예요. 작은 약속을 꾸준히 지키는 것이 가장 큰 표현이에요.',
    health: '앉아 있는 시간이 길어지기 쉬워요. 한 시간마다 일어나 몸을 펴 주세요.',
    act: '올해 따고 싶은 자격이나 배우고 싶은 것 하나 정하기' },
  { key: 'dog', name: '개', b: 10, kw: '다듬고 정리하는 해',
    flow: '개(戌)와 양(未)은 서로를 다듬어 주는 사이(형·파)라, 2027년은 오래된 것을 고치고 정리하기 좋은 해예요. 같은 흙 기운이 겹쳐 책임감도 커지니, 다 짊어지기보다 무엇을 내려놓을지 먼저 정하면 한 해가 가벼워져요.',
    wealth: '새는 돈을 막기 좋은 해예요. 안 쓰는 구독과 보험을 한 번 점검하면 연말에 차이가 커요.',
    work: '규칙과 절차를 다시 세우는 일에 강해요. 문서와 약속을 꼼꼼히 남기면 오해가 줄어요.',
    love: '작은 말이 서운함이 되기 쉬운 해예요. 고칠 점 하나를 말하기 전에 좋은 점 둘을 먼저 말해 보세요.',
    health: '긴장이 어깨와 위에 쌓이기 쉬워요. 따뜻한 물로 하루를 마무리하는 습관이 도움이 돼요.',
    act: '집이나 책상에서 안 쓰는 물건 다섯 개 정리하기' },
  { key: 'pig', name: '돼지', b: 11, kw: '함께 자리를 넓히는 해',
    flow: '돼지(亥)와 양(未)은 함께 큰 숲을 이루는 사이(삼합)라, 2027년은 사람과 함께할 때 길이 넓어지는 해예요. 물 기운의 돼지띠에게 흙은 둑처럼 흐름을 잡아 주는 힘이라, 맡는 자리와 책임도 함께 커져요.',
    wealth: '함께하는 일에서 기회가 오고, 책임이 늘며 씀씀이도 커질 수 있어요. 큰 결정은 혼자보다 믿는 사람과 상의해 보세요.',
    work: '자리와 역할이 커지는 해예요. 도움을 청하는 것도 능력이라, 혼자 끌어안지 말고 나눠 맡기세요.',
    love: '모임과 소개에서 마음 맞는 사람을 만나기 쉬워요. 먼저 웃으며 인사하는 쪽이 인연을 불러요.',
    health: '책임이 늘면 쉬는 시간이 줄기 쉬워요. 주말 하루는 일정 없이 쉬는 날로 지켜 주세요.',
    act: '이번 주 함께하고 싶은 사람에게 먼저 연락하기' },
];

/** 태어난 해(1950~2023, 입춘 기준) */
export const birthYears = (b) => Array.from({ length: 74 }, (_, i) => 1950 + i).filter((y) => (((y - 4) % 12) + 12) % 12 === b);
/** 힘이 실리는 달(육합·삼합 지지의 달)과 쉬어 가는 달(충 지지의 달), 입춘부터 차례대로 */
export function monthsOf(b) {
  const tri = TRIADS.find((g) => g.includes(b));
  const good = ORDER.filter((m) => m === SIXHAP[b] || (tri.includes(m) && m !== b));
  return { good: good.map((m) => MONTH_OF[m]), slow: [MONTH_OF[clash(b)]] };
}
const monthWord = (m) => (m === 1 ? `${YEAR + 1}년 1월` : `${m}월`);

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const head = (title, desc, extra = '') => `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="12지신 강림">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta name="theme-color" content="#fff6f3">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Noto+Sans+KR:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="unse.css">${extra}
</head>
<body>`;
const footer = `<footer class="u-foot"><p>띠 운세는 같은 해에 태어난 모든 사람의 큰 흐름이에요. 사주는 확률적인 해석이며, 건강·법률·투자 판단은 전문가와 함께 하세요.</p><p><a href="../../index.html">12지신 강림</a> · 광고 없는 무료 사주 · 2027 신년운세 · 12지신 타로</p></footer>
</body>
</html>
`;
const otherLinks = (cur) => `<nav class="u-others" aria-label="다른 띠 2027년 운세">${TTI.map((t) => t.key === cur ? `<span class="on">${t.name}띠</span>` : `<a href="${t.key}.html">${t.name}띠</a>`).join('')}</nav>`;

/** 페이지 한 장의 글(검사용으로 따로 꺼냄) */
export function pageText(t) {
  const sj = samjaeOf(t.b, YEAR_BRANCH); const mo = monthsOf(t.b);
  const months = `힘이 실리는 달은 ${mo.good.map(monthWord).join('·')}이고, ${mo.slow.map(monthWord).join('·')}은 속도를 늦추고 쉬어 가기 좋은 달이에요(달은 절기 기준이라 그달 초순에 바뀌어요).`;
  const samjae = sj ? `2027년은 ${t.name}띠의 ${sj}(삼재가 나가는 해)예요. 삼재는 풍습으로 전해 오는 이야기라 앱 점수에는 넣지 않아요. 마지막 해라 마무리를 잘하면 된다는 뜻으로 가볍게 받아 주세요.` : '';
  return { sj, mo, months, samjae, all: [t.kw, t.flow, t.wealth, t.work, t.love, t.health, t.act, months, samjae].join(' ') };
}

export function pageHTML(t) {
  const p = pageText(t); const years = birthYears(t.b);
  const title = `2027년 ${t.name}띠 운세 – 정미년 신년운세 무료 | 12지신 강림`;
  const desc = `2027년 정미년 ${t.name}띠(${years.slice(-4).join('·')}년생) 신년운세. ${t.kw}: 재물·일·애정·건강과 힘이 실리는 달을 무료로 확인하세요.`;
  return `${head(title, desc)}
<main class="u-wrap">
  <p class="u-crumb"><a href="index.html">띠별 2027년 운세</a> › ${t.name}띠</p>
  <header class="u-hero">
    <img src="../../assets/char/${t.key}_s3.webp" alt="${t.name}띠 수호신" width="160" height="160">
    <div>
      <p class="u-eyebrow">정미년(丁未年) · 붉은 양의 해</p>
      <h1>2027년 ${t.name}띠 운세</h1>
      <p class="u-kw">「${t.kw}」</p>
      <p class="u-years">${years.join(' · ')}년생 <small>(1월~2월 초 생일은 입춘 전이라 앞 띠일 수 있어요)</small></p>
    </div>
  </header>
  <section class="u-card"><h2>한 해의 흐름</h2><p>${t.flow}</p></section>
  <section class="u-card u-fields">
    <h2>분야별 운세</h2>
    <div><h3>💰 재물</h3><p>${t.wealth}</p></div>
    <div><h3>💼 일·공부</h3><p>${t.work}</p></div>
    <div><h3>💗 애정</h3><p>${t.love}</p></div>
    <div><h3>🌿 건강</h3><p>${t.health}</p></div>
  </section>
  <section class="u-card"><h2>달마다 흐름</h2><p>${p.months}</p>${p.samjae ? `<p class="u-note">${p.samjae}</p>` : ''}</section>
  <section class="u-card u-act"><h2>☂️ 2027년 실천 하나</h2><p><b>${t.act}</b></p></section>
  <section class="u-cta">
    <h2>같은 ${t.name}띠라도 2027년은 사람마다 달라요</h2>
    <p>띠는 태어난 해 한 글자만 봐요. 생년월일과 태어난 시간까지 넣으면 여덟 글자(사주)로 나만의 2027년 12달 흐름, 분야별 점수, 조심할 달까지 볼 수 있어요.</p>
    <a class="u-btn" href="../../index.html">내 사주로 2027년 무료로 보기 →</a>
    <small>생년월일은 내 기기에만 저장돼요</small>
  </section>
  <h2 class="u-h2">다른 띠 2027년 운세</h2>
  ${otherLinks(t.key)}
</main>
${footer}`;
}

export function indexHTML() {
  const title = '2027년 띠별 운세 – 정미년 12띠 신년운세 무료 | 12지신 강림';
  const desc = '2027년 정미년(붉은 양의 해) 쥐띠부터 돼지띠까지 12띠 신년운세를 무료로 확인하세요. 재물·일·애정·건강과 힘이 실리는 달까지.';
  return `${head(title, desc)}
<main class="u-wrap">
  <header class="u-hero solo"><div>
    <p class="u-eyebrow">정미년(丁未年) · 붉은 양의 해</p>
    <h1>2027년 띠별 운세</h1>
    <p>2027년은 흙과 불의 기운이 강한 해예요. 내 띠를 눌러 한 해의 흐름과 힘이 실리는 달을 확인해 보세요.</p>
  </div></header>
  <div class="u-grid">${TTI.map((t) => `<a class="u-tile" href="${t.key}.html"><img src="../../assets/char/${t.key}_s3.webp" alt="" width="96" height="96" loading="lazy"><b>${t.name}띠</b><small>${t.kw}</small></a>`).join('')}</div>
  <section class="u-cta">
    <h2>띠 운세보다 더 정확하게</h2>
    <p>생년월일과 태어난 시간으로 보는 무료 사주, 2027년 신년운세 책자, 12지신 타로와 궁합까지 광고 없이 모두 무료로 볼 수 있어요.</p>
    <a class="u-btn" href="../../index.html">12지신 강림 시작하기 →</a>
  </section>
</main>
${footer}`;
}

export const UNSE_CSS = `:root{--bg:#fff6f3;--card:#fff;--ink:#3b2a33;--text:#4b3942;--muted:#8a7480;--rose:#ec7fa0;--gold:#d0843a;--line:rgba(200,170,230,.55)}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.75 'Noto Sans KR',system-ui,sans-serif;word-break:keep-all}
a{color:#c45c80}h1,h2,h3{font-family:'Gowun Dodum',sans-serif;color:var(--ink);line-height:1.35}
.u-wrap{max-width:720px;margin:0 auto;padding:16px 16px 32px}
.u-crumb{font-size:.85rem;color:var(--muted);margin:0 0 8px}
.u-hero{display:flex;gap:16px;align-items:center;background:linear-gradient(135deg,#fff0f5,#f3ecff);border-radius:24px;padding:18px;margin-bottom:14px}
.u-hero img{width:120px;height:120px;object-fit:contain;flex:none}.u-hero.solo{display:block}
.u-hero h1{margin:2px 0 4px;font-size:1.7rem}.u-eyebrow{margin:0;color:var(--gold);font-weight:700;font-size:.9rem}
.u-kw{margin:0;font-size:1.1rem;color:var(--ink);font-weight:700}.u-years{margin:6px 0 0;font-size:.9rem}.u-years small{color:var(--muted)}
.u-card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:14px 16px;margin-bottom:12px}
.u-card h2{margin:0 0 6px;font-size:1.2rem}.u-card p{margin:0 0 6px}
.u-fields div{border-top:1px dashed var(--line);padding-top:8px;margin-top:8px}.u-fields h3{margin:0;font-size:1rem}
.u-note{font-size:.9rem;color:var(--muted)}.u-act b{color:var(--ink)}
.u-cta{text-align:center;background:#fff;border:2px solid var(--rose);border-radius:24px;padding:18px 16px;margin:18px 0}
.u-cta h2{margin:0 0 6px;font-size:1.2rem}.u-cta small{display:block;color:var(--muted);margin-top:6px}
.u-btn{display:inline-block;margin-top:8px;padding:14px 22px;min-height:48px;border-radius:999px;background:linear-gradient(135deg,#ec7fa0,#f29b7e);color:#fff;font-weight:700;text-decoration:none}
.u-h2{font-size:1.1rem;margin:20px 0 8px}
.u-others{display:flex;flex-wrap:wrap;gap:8px}.u-others a,.u-others span{padding:8px 14px;min-height:44px;display:inline-flex;align-items:center;border-radius:999px;background:#fff;border:1px solid var(--line);text-decoration:none}
.u-others .on{background:var(--rose);color:#fff;border-color:var(--rose)}
.u-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.u-tile{display:grid;justify-items:center;gap:2px;padding:12px 6px;border-radius:20px;background:#fff;border:1px solid var(--line);text-decoration:none;color:var(--text);text-align:center}
.u-tile img{width:72px;height:72px;object-fit:contain}.u-tile b{color:var(--ink)}.u-tile small{color:var(--muted);font-size:.78rem;line-height:1.4}
.u-foot{max-width:720px;margin:0 auto;padding:0 16px 32px;font-size:.8rem;color:var(--muted)}
@media (max-width:480px){.u-hero{flex-direction:column;text-align:center}.u-hero img{width:110px;height:110px}.u-hero h1{font-size:1.5rem}}
`;

/** 글 검사: 조사·금지어 문제가 있으면 목록으로 */
export function pageProblems() {
  return TTI.flatMap((t) => { const x = pageText(t).all; return [...josaProblems(x), ...toneProblems(x)].map((p) => `${t.name}띠: ${typeof p === 'string' ? p : JSON.stringify(p)}`); });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const bad = pageProblems();
  if (bad.length) { console.error(bad.join('\n')); process.exit(1); }
  const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'unse', String(YEAR));
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'unse.css'), UNSE_CSS);
  writeFileSync(join(out, 'index.html'), indexHTML());
  for (const t of TTI) writeFileSync(join(out, `${t.key}.html`), pageHTML(t));
  console.log(`unse/${YEAR}: index + ${TTI.length} pages`);
}
