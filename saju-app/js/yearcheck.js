// 한 해 「조심할 점 · 참고할 점」 엔진(2026-11-04, 사용자 의견 「좋은 말만 하지 말고 조심할 부분·참고할 내용을 구체적으로」,
// 「기본 사주·2027년 운세가 잘 안 맞는다는 사람이 있다」)
// 같은 해·같은 십신이어도 사람마다 달라지게, 그해 글자가 「내 원국에 이미 있는 글자」와 어떻게 작용하는지를 본다(명리 기본 작용):
//  - 상관견관(표현이 규칙과 부딪힘) · 군겁쟁재(돈이 사람 사이로 나뉨) · 재극인(문서·공부·어머니 자리 흔들림)
//  - 편인도식(계획·식사 리듬이 끊김) · 관살혼잡(일과 책임이 겹침) · 비겁 과다·재성 부족
//  - 좋은 작용: 식신제살 · 관인상생 · 식상생재 · 재생관 · 인성 받침
//  - 그해 지지와 원국 지지의 충·형·파·해(자리별 뜻), 삼재(민간 풍습, 겁주지 않게), 그해 신살(역마·도화·화개)
//  - 건강: 그해 넘치는 오행이 누르는 장부(의료 단정 금지, 「검진 때 한 번 더」로만)
// 모든 문장 = 근거 → 무엇이 생기기 쉬운지(구체적 장면) → 이렇게 대비(5분 행동) → 언제(달). 순수 로직(테스트 tests/yearcheck.test.mjs)
import { tenGod, STEMS, BRANCHES, BRANCH_MAIN_STEM, STEM_ELEMENT, BRANCH_ELEMENT, ELEMENT_KO, ELEMENT_HANJA, ANIMALS } from './saju.js';
import { branchPair, groupCompletions } from './relations.js';
import { gongmangOf } from './luck.js';
import { tenGodProfile } from './natal.js';
import { monthRange } from './yearcard.js';
import { josa } from './josa.js';

const GROUP = { 비견: 0, 겁재: 0, 식신: 1, 상관: 1, 편재: 2, 정재: 2, 편관: 3, 정관: 3, 편인: 4, 정인: 4 };
const POS_KO = { year: '연지(집안·어른)', month: '월지(일터·부모)', day: '일지(나·배우자)', hour: '시지(자녀·아랫사람)' };
const el = (e) => `${ELEMENT_HANJA[e]}(${ELEMENT_KO[e]})`;

// 오행 → 몸에서 챙길 곳(한의학 오행 배속의 일반 상식, 진단 아님)
export const ORGAN = ['간·눈·근육(목)', '심장·혈압·수면(화)', '위장·소화(토)', '폐·호흡기·피부(금)', '신장·방광·허리(수)'];
const ORGAN_ACT = ['눈 쉬는 시간과 스트레칭', '잠드는 시간 고정과 혈압 재기', '야식 줄이기와 천천히 먹기', '환기와 보습, 목 관리', '물 자주 마시기와 허리 펴기'];

/** 원국에 드러난 십신 세기: 천간(일간 제외) 1, 지지 본기 1 */
function natalGods(saju) {
  const ds = saju.dayMaster; const c = {};
  for (const [k, p] of Object.entries(saju.pillars)) {
    if (!p) continue;
    if (k !== 'day') { const g = tenGod(ds, p.stem); c[g] = (c[g] || 0) + 1; }
    const g2 = tenGod(ds, BRANCH_MAIN_STEM[p.branch]); c[g2] = (c[g2] || 0) + 1;
  }
  return c;
}

/** 그해 그 무리 기운이 들어오는 달 중 점수가 가장 낮은 달(조심 달) / 가장 높은 달(기회 달) */
function monthFor(y, test, worst = true) {
  const list = y.months.map((m, i) => ({ m, i })).filter(({ m }) => test(m.god));
  if (!list.length) return '';
  list.sort((a, b) => (worst ? a.m.score - b.m.score : b.m.score - a.m.score) || a.i - b.i);
  const { m, i } = list[0];
  return `${m.solarMonth}월(${monthRange(y.months, i)})`;
}

/** 삼재: 띠(연지) 삼합 무리별 세 해. 들·눌·날 */
const SAMJAE = { 0: [2, 3, 4], 1: [8, 9, 10], 2: [11, 0, 1], 3: [5, 6, 7] }; // 申子辰→寅卯辰, 寅午戌→申酉戌, 巳酉丑→亥子丑, 亥卯未→巳午未
const TRIAD = (b) => [[8, 0, 4], [2, 6, 10], [5, 9, 1], [11, 3, 7]].findIndex((g) => g.includes(b));
export function samjaeOf(birthBranch, yearBranch) {
  const yrs = SAMJAE[TRIAD(birthBranch)]; const i = yrs.indexOf(yearBranch);
  return i < 0 ? null : ['들삼재', '눌삼재', '날삼재'][i];
}
const YEOKMA = [2, 8, 11, 5]; const DOHWA = [9, 3, 6, 0]; const HWAGAE = [4, 10, 1, 7];

/**
 * @param y yearOf 결과 · saju · gender
 * @returns [{ kind: 'watch'|'good'|'note', key, title, text, act, when }] 중요한 순
 */
export function yearChecks(y, saju, { gender = 'female' } = {}) {
  const p = y.year.pillar; const ds = saju.dayMaster;
  const sg = tenGod(ds, p.stem); const bg = tenGod(ds, BRANCH_MAIN_STEM[p.branch]);
  const inYear = (...gods) => gods.includes(sg) || gods.includes(bg);
  const yG = new Set([GROUP[sg], GROUP[bg]]);
  const N = natalGods(saju); const has = (g) => (N[g] || 0) > 0;
  const prof = tenGodProfile(saju); const pct = Object.fromEntries(prof.groups.map((g, i) => [i, g.pct]));
  const weak = (saju.strengthScore ?? 50) < 45; const strong = (saju.strengthScore ?? 50) > 55;
  const out = [];
  const add = (o) => out.push(o);
  const mOf = (grp, worst = true) => monthFor(y, (g) => GROUP[g] === grp, worst);

  // ── 조심할 작용 ──
  if ((inYear('정관', '편관') && has('상관')) || (inYear('상관') && has('정관'))) add({
    kind: 'watch', key: 'sanggwan', rank: 9, title: '말과 규칙이 부딪히기 쉬워요 (상관견관)',
    text: `내 사주의 상관(솔직한 표현)과 그해의 ${inYear('상관') ? '상관' : '관성(규칙·윗사람)'}이 만나요. 회의·평가·계약 자리에서 맞는 말을 세게 해서 윗사람이나 기관과 각을 세우기 쉬운 해예요.${gender === 'female' ? ' 연애·부부 사이에서도 말 한마디가 서운함이 되기 쉬워요.' : ''}`,
    act: '불만은 그 자리에서 말하지 말고 하룻밤 뒤 글로 정리해 전하기, 계약서·규정은 서명 전 한 번 더 읽기', when: mOf(3) || mOf(1),
  });
  if (inYear('편재', '정재') && (pct[0] >= 30 || strong && has('겁재'))) add({
    kind: 'watch', key: 'gunGeop', rank: 9, title: '돈이 사람 사이로 나뉘기 쉬워요 (군겁쟁재)',
    text: `내 사주에 나와 같은 기운(비겁)이 ${pct[0]}%로 강한 편인데 그해 재물 기운이 들어와요. 돈 기회는 생기지만 지인·형제·동업자와 나누다 손해를 보거나, 빌려준 돈이 늦게 돌아오기 쉬운 해예요.`,
    act: '빌려주기·보증·공동 투자는 금액과 날짜를 글로 남기고, 모르는 사람의 「확실한 수익」 제안은 거절하기', when: mOf(0) || mOf(2),
  });
  if (inYear('겁재', '비견') && pct[2] <= 12) add({
    kind: 'watch', key: 'bigeopMoney', rank: 7, title: '나가는 돈과 경쟁이 늘어요',
    text: `그해에는 나와 같은 기운(${inYear('겁재') ? '겁재' : '비견'})이 들어오는데, 내 사주에 재물 기운(재성)이 ${pct[2]}%로 적어요. 모임·경조사·가족 일로 지출이 늘고, 같은 자리를 두고 경쟁하는 일이 생기기 쉬워요.`,
    act: '한 달 고정 지출 상한을 정해 두고, 경쟁 상황에서는 내 강점 한 가지를 글로 정리해 두기', when: mOf(0),
  });
  if (inYear('편재', '정재') && GROUP[tenGod(ds, [0, 2, 4, 6, 8][saju.yongsin])] === 4) add({
    kind: 'watch', key: 'jaeGeukIn', rank: 8, title: '문서·공부·어머니 자리를 챙겨요 (재극인)',
    text: '내게 꼭 필요한 기운이 배움·문서의 기운(인성)인데, 그해 재물 기운이 그 자리를 눌러요. 돈 욕심에 공부·자격 준비가 흐트러지거나, 집·계약 서류에서 놓치는 부분이 생기기 쉽고, 어머니·윗어른의 건강을 챙길 일이 생길 수 있어요.',
    act: '부동산·대출·계약은 등기부·특약을 한 번 더 확인하고, 어머니·어른께 한 달에 한 번 안부와 검진 일정 여쭙기', when: mOf(2),
  });
  if (inYear('편인') && has('식신')) add({
    kind: 'watch', key: 'doSik', rank: 7, title: '계획이 중간에 끊기기 쉬워요 (편인도식)',
    text: '그해의 편인(생각·직감)이 내 사주의 식신(꾸준히 만들어 내는 힘)을 눌러요. 의욕이 들쭉날쭉하고, 시작한 일이 도중에 엎어지거나 식사 리듬이 깨지기 쉬운 해예요.',
    act: '큰 계획은 4주 단위로 잘게 나누고, 하루 세끼 시간 정해 두기', when: mOf(4),
  });
  if ((inYear('편관') && has('정관')) || (inYear('정관') && has('편관'))) add({
    kind: 'watch', key: 'gwansal', rank: 6, title: '일과 책임이 한꺼번에 몰려요 (관살혼잡)',
    text: `내 사주의 ${has('정관') ? '정관' : '편관'}에 그해의 ${inYear('편관') ? '편관' : '정관'}이 겹쳐요. 맡는 일·평가·윗사람이 동시에 늘어 어느 것부터 할지 헷갈리기 쉬워요.${gender === 'female' ? ' 연애에서는 마음이 두 갈래로 흔들리는 일이 생길 수 있어요.' : ''}`,
    act: '할 일을 「꼭·나중·안 함」 세 칸으로 나누고, 거절할 일은 이유와 함께 정중히 거절하기', when: mOf(3),
  });
  if (weak && [1, 2, 3].includes(GROUP[sg]) && [1, 2, 3].includes(GROUP[bg])) add({
    kind: 'watch', key: 'overwork', rank: 6, title: '할 일이 체력을 앞질러요',
    text: '타고난 기운이 여린 편인데 그해 천간·지지가 모두 힘을 쓰게 하는 기운(재능·재물·책임)이에요. 일은 잘 들어오지만 몸이 먼저 지치기 쉬운 해예요.',
    act: '일정표에 쉬는 날을 먼저 적고, 새 일은 하나 받으면 하나 내려놓기', when: monthFor(y, (g) => [1, 2, 3].includes(GROUP[g])),
  });
  if (strong && [0, 4].includes(GROUP[sg]) && [0, 4].includes(GROUP[bg])) add({
    kind: 'watch', key: 'tooStrong', rank: 6, title: '고집과 자만을 조심해요',
    text: '타고난 기운이 센 편인데 그해에도 나를 돕는 기운이 겹쳐 들어와요. 자신감은 커지지만 남의 말을 덜 듣게 되고, 내 방식만 고집하다 기회를 놓치기 쉬워요.',
    act: '중요한 결정 전 믿는 사람 한 명에게 반대 의견을 일부러 물어보기', when: monthFor(y, (g) => [0, 4].includes(GROUP[g])),
  });

  // ── 그해 지지와 원국 지지의 부딪힘(자리별) ──
  const REL_TEXT = {
    clash: { day: '이사·이직·배우자와의 관계처럼 내 생활의 큰 틀이 움직이기 쉬워요', month: '부서 이동·직장 변화·부모님 일로 움직임이 생기기 쉬워요', year: '집안 어른·고향·이사 문제로 움직임이 생기기 쉬워요', hour: '자녀·아랫사람 일이나 미래 계획이 바뀌기 쉬워요', act: '이사·이직·큰 계약은 3개월 전부터 계획표를 쓰고, 날짜는 좋은 달에 맞추기' },
    punish: { day: '내 몸과 서류를 한 번 더 다듬게 되는 일이 생기기 쉬워요', month: '직장 규정·평가·법적 서류 문제가 생기기 쉬워요', year: '집안의 서류·상속·어른 건강 일이 생기기 쉬워요', hour: '자녀 학업·건강을 한 번 더 챙길 일이 생기기 쉬워요', act: '계약서·신고·보험 서류는 마감 1주 전에 끝내고, 몸이 보내는 신호는 미루지 않고 검진받기' },
    harm: { day: '가까운 사람과 작은 말이 오해로 번지기 쉬워요', month: '동료 사이 말이 와전되기 쉬워요', year: '집안 어른과 서운함이 생기기 쉬워요', hour: '아이·후배와 서로 서운해지기 쉬워요', act: '중요한 말은 문자로 한 번 더 확인하고, 서운함은 하루 지나 부드럽게 전하기' },
    break: { day: '세워 둔 개인 계획이 한 번쯤 바뀌기 쉬워요', month: '일 계획이 중간에 고쳐지기 쉬워요', year: '집안 계획이 한 번쯤 바뀌기 쉬워요', hour: '아이·미래 계획이 한 번쯤 바뀌기 쉬워요', act: '중요한 일엔 두 번째 방법(플랜 B)을 하나 적어 두기' },
  };
  const REL_NAME = { clash: '충', punish: '형', harm: '해', break: '파' };
  let relN = 0; const seenRel = new Set();
  for (const k of ['day', 'month', 'year', 'hour']) {
    const P = saju.pillars[k]; if (!P || relN >= 2) continue;
    const kinds = branchPair(p.branch, P.branch).filter((r) => REL_TEXT[r]);
    if (!kinds.length) continue;
    const r = kinds[0];
    if (seenRel.has(`${r}-${P.branch}`)) continue; // 같은 글자와의 같은 관계는 가장 중요한 자리 하나만
    seenRel.add(`${r}-${P.branch}`); relN++;
    add({
      kind: 'watch', key: `rel-${r}-${k}`, rank: r === 'clash' ? (k === 'day' ? 9 : 8) : 5,
      title: `${BRANCHES[p.branch]}${BRANCHES[P.branch]} ${REL_NAME[r]} — 내 ${POS_KO[k]} 자리가 흔들려요`,
      text: `그해 지지 ${josa(BRANCHES[p.branch], '이/가')} 내 ${POS_KO[k]}의 ${josa(BRANCHES[P.branch], '과/와')} ${REL_NAME[r]}${r === 'clash' ? '(서로 부딪힘)' : r === 'punish' ? '(다듬고 바로잡음)' : r === 'harm' ? '(서로 어긋남)' : '(깨고 다시 맞춤)'}을 이뤄요. ${REL_TEXT[r][k]}. ${r === 'clash' ? '움직임은 준비한 사람에게 자리를 옮길 기회가 돼요.' : '미리 알고 대비하면 작게 지나가요.'}`,
      act: REL_TEXT[r].act, when: '',
    });
  }

  // ── 3자 작용(2026-11-04 정확도 2단계 ③④): 대운 × 그해 × 원국 ──
  const dwp = y.daewoon?.pillar;
  const POS_SHORT = { year: '연지', month: '월지', day: '일지', hour: '시지' };
  for (const g of groupCompletions(saju.pillars, dwp ? dwp.branch : -1, p.branch).slice(0, 1)) {
    const name = g.kind === 'triple' ? '삼합' : '방합';
    const src = [...g.natal.map((k) => `내 ${POS_SHORT[k]}`), ...(g.daewoon ? ['지금 대운'] : []), '그해'].join(' + ');
    const fit = g.el === saju.yongsin ? 'good' : g.el === saju.heesin ? 'good' : g.el === saju.gisin ? 'watch' : 'note';
    add({
      kind: fit, key: `group-${g.kind}`, rank: fit === 'watch' ? 8 : 7,
      title: `${g.branches.map((b) => BRANCHES[b]).join('')} ${name} ${el(g.el)} 국이 완성돼요`,
      text: `${src}의 글자가 모여 ${name}을 이뤄 ${el(g.el)} 기운이 한 해 동안 크게 뭉쳐요. ${fit === 'good' ? '내게 필요한 기운이 뭉치는 거라, 오래 준비한 일이 한꺼번에 풀리거나 큰 기회가 들어오기 쉬운 해예요.' : fit === 'watch' ? '내게 부담이 되는 기운이 뭉치는 거라, 일이 커지는 만큼 그 무게도 커지기 쉬운 해예요.' : '한 방향의 기운이 강해져 생활의 무게중심이 그쪽으로 크게 옮겨 가기 쉬운 해예요.'}${g.daewoon ? ' 10년 큰 흐름이 함께 거들어 그 힘이 더 커요.' : ''}`,
      act: fit === 'good' ? '미뤄 둔 큰 목표 하나를 이 해에 꺼내 일정표에 넣기' : fit === 'watch' ? '새 일은 하나씩만 받고, 큰 결정은 한 달 두고 다시 보기' : '그 기운에 맞는 일(오행별 행운 방향·색)을 하나 정해 꾸준히 해 보기', when: '',
    });
  }
  if (dwp) {
    const stemClash = Math.abs(dwp.stem - p.stem) === 6 && dwp.stem % 2 === p.stem % 2; // 甲庚 乙辛 丙壬 丁癸
    const brClash = Math.abs(dwp.branch - p.branch) === 6;
    if (stemClash && brClash) add({
      kind: 'watch', key: 'dwClash', rank: 10, title: '10년 흐름과 그해가 정면으로 부딪혀요 (천충지충)',
      text: `지금 대운 ${josa(STEMS[dwp.stem] + BRANCHES[dwp.branch], '과/와')} 그해 ${josa(STEMS[p.stem] + BRANCHES[p.branch], '이/가')} 천간·지지 모두 충을 이뤄요. 직장·집·관계 가운데 한 곳에서 판이 크게 바뀌기 쉬운, 몇 년에 한 번 오는 해예요. 준비한 사람에게는 도약의 해가 되기도 해요.`,
      act: '바꾸고 싶은 것과 지키고 싶은 것을 각각 세 가지씩 적어 두고, 큰 결정은 좋은 달에 맞추기', when: '',
    });
    else if (brClash) add({
      kind: 'note', key: 'dwBrClash', rank: 5, title: '10년 흐름과 그해의 지지가 부딪혀요',
      text: `지금 대운의 ${josa(BRANCHES[dwp.branch], '과/와')} 그해의 ${josa(BRANCHES[p.branch], '이/가')} 충을 이뤄요. 큰 흐름은 그대로인데 생활 리듬(이동·일정·사람)이 자주 흔들리기 쉬워요.`,
      act: '한 달에 한 번 일정과 지출을 다시 정리하는 날 정하기', when: '',
    });
    if (dwp.stem === p.stem && dwp.branch === p.branch) add({
      kind: 'note', key: 'dwSame', rank: 6, title: '10년 흐름과 그해가 같은 글자예요 (복음)',
      text: `그해 ${josa(STEMS[p.stem] + BRANCHES[p.branch], '이/가')} 지금 대운과 똑같아, 이 10년의 성격이 한 해에 가장 진하게 드러나요. 좋은 점도 챙길 점도 두 배로 느껴지기 쉬워요.`,
      act: '지금 대운에서 잘되고 있는 것 하나를 골라 올해 더 키우기', when: '',
    });
  }
  // ── 공망(2026-11-04 정확도 2단계 ⑤): 그해 지지가 내 일주의 공망 ──
  if (gongmangOf(saju.pillars.day.stem, saju.pillars.day.branch).includes(p.branch)) add({
    kind: 'note', key: 'gongmang', rank: 6, title: '그해 지지가 내 공망 자리예요',
    text: `그해 지지 ${josa(BRANCHES[p.branch], '은/는')} 내 일주의 공망(空亡, 비어 있는 자리)이에요. 들어오는 힘이 반쯤 비어 있어 기대한 결과·약속이 늦어지거나 생각보다 작게 손에 잡히기 쉬워요. 대신 욕심을 내려놓고 공부·수련·봉사처럼 「채우는 일」에는 잘 맞는 해예요.`,
    act: '큰 계약·투자는 서류와 조건을 두 번 확인하고, 올해는 결과보다 실력 쌓기에 목표 두기', when: '',
  });

  // ── 좋은 작용(참고: 기회를 놓치지 않게) ──
  if (inYear('식신') && has('편관')) add({ kind: 'good', key: 'sikJeSal', rank: 5, title: '어려운 문제를 실력으로 풀어요 (식신제살)', text: '그해의 식신(실력·꾸준함)이 내 사주의 편관(압박·어려운 일)을 다스려요. 오래 끌던 골치 아픈 일이 내 솜씨로 풀리기 쉬운 해예요.', act: '미뤄 둔 어려운 일 하나를 골라 이번 달 안에 끝낼 계획 세우기', when: mOf(1, false) });
  if (inYear('정관', '편관') && pct[4] >= 20 && !out.some((x) => x.key === 'sanggwan')) add({ kind: 'good', key: 'gwanIn', rank: 5, title: '승진·합격·자격에 힘이 실려요 (관인상생)', text: `그해의 관성(자리·평가)이 내 사주에 넉넉한 인성(배움 ${pct[4]}%)과 이어져요. 시험·자격·승진 심사처럼 공식적으로 인정받는 일에 유리한 해예요.`, act: '올해 따고 싶은 자격·평가 하나를 정해 접수 날짜를 달력에 적기', when: mOf(3, false) });
  if (inYear('식신', '상관') && pct[2] >= 15) add({ kind: 'good', key: 'sikSaengJae', rank: 4, title: '재능이 돈이 돼요 (식상생재)', text: `그해의 재능 기운(식상)이 내 사주의 재물 기운(재성 ${pct[2]}%)으로 이어져요. 솜씨·콘텐츠·부업이 실제 수입으로 연결되기 쉬운 해예요.`, act: '내가 잘하는 것 하나를 값을 매겨 알려 보기(가격표·소개 글)', when: mOf(1, false) });
  if (inYear('편재', '정재') && pct[3] >= 15 && !out.some((x) => x.key === 'gunGeop')) add({ kind: 'good', key: 'jaeSaengGwan', rank: 4, title: '번 만큼 자리가 따라와요 (재생관)', text: `그해의 재물 기운이 내 사주의 관성(자리·명예 ${pct[3]}%)을 키워요. 성과가 숫자로 드러나 평가·승진·신용으로 이어지기 쉬운 해예요.`, act: '올해 성과를 숫자로 적어 두는 메모 하나 만들기', when: mOf(2, false) });
  if (weak && [0, 4].includes(GROUP[sg])) add({ kind: 'good', key: 'support', rank: 4, title: '도와주는 사람이 생겨요', text: '타고난 기운이 여린 편인데 그해 천간에 나를 받쳐 주는 기운이 들어와요. 혼자 버티던 일에 손을 보태 줄 사람·제도가 생기기 쉬워요.', act: '도움이 필요한 일 하나를 구체적으로 부탁해 보기', when: monthFor(y, (g) => [0, 4].includes(GROUP[g]), false) });

  // ── 삼재(민간 풍습: 겁주지 않고 참고로) ──
  const sj = samjaeOf(saju.pillars.year.branch, p.branch);
  if (sj) add({
    kind: 'note', key: 'samjae', rank: 3, title: `${ANIMALS[saju.pillars.year.branch]}띠에게는 ${sj}인 해예요`,
    text: `민간에서 말하는 삼재 가운데 ${sj}${sj === '날삼재' ? '(삼재가 끝나 가는 해)' : sj === '들삼재' ? '(삼재가 시작되는 해)' : '(삼재 한가운데 해)'}예요. 삼재는 정통 사주 계산에 들어가지 않는 풍습이라 점수에는 넣지 않았어요. 다만 ${sj === '날삼재' ? '마무리하는 해라 벌여 둔 일을 정리' : '새로 크게 벌이기보다 지키는 쪽'}에 마음을 두면 편안해요.`,
    act: '보험·안전 점검처럼 「지키는 일」 하나를 이번 달에 해 두기', when: '',
  });

  // ── 그해 신살(역마·도화·화개): 연지·일지 기준 ──
  const bases = [saju.pillars.year.branch, saju.pillars.day.branch].map(TRIAD);
  const star = (table) => bases.some((t) => table[t] === p.branch);
  if (star(YEOKMA)) add({ kind: 'note', key: 'yeokma', rank: 4, title: '움직임의 별(역마)이 들어와요', text: `그해 지지 ${josa(BRANCHES[p.branch], '은/는')} 내 사주의 역마 자리예요. 이사·출장·여행·이직처럼 몸이 움직이는 일이 늘고, 멀리서 기회가 오기 쉬워요.`, act: '가 보고 싶던 곳·일자리 정보를 하나 찾아 저장해 두기', when: '' });
  if (star(DOHWA)) add({ kind: 'note', key: 'dohwa', rank: 4, title: '사람을 끄는 별(도화)이 들어와요', text: `그해 지지 ${josa(BRANCHES[p.branch], '은/는')} 내 사주의 도화 자리예요. 인기·호감이 오르고 새 인연이 생기기 쉬운 해예요. 반대로 말 한마디·사진 한 장이 소문이 되기도 쉬워요.`, act: 'SNS에 올리기 전에 한 번 더 읽어 보고, 좋은 인연에는 먼저 연락하기', when: '' });
  if (star(HWAGAE)) add({ kind: 'note', key: 'hwagae', rank: 3, title: '깊이 파고드는 별(화개)이 들어와요', text: `그해 지지 ${josa(BRANCHES[p.branch], '은/는')} 내 사주의 화개 자리예요. 공부·종교·예술처럼 혼자 깊이 들어가는 일에 집중이 잘되고, 사람 만남은 조금 줄기 쉬워요.`, act: '하루 30분 혼자 몰입하는 시간을 정해 두기', when: '' });

  // ── 건강: 그해 넘치는 오행이 누르는 곳 ──
  const yEls = [STEM_ELEMENT[p.stem], BRANCH_ELEMENT[p.branch]];
  const heavy = yEls[0] === yEls[1] ? yEls[0] : (yEls.find((e) => (saju.elements?.[e] ?? 0) >= 30) ?? (yEls.includes(saju.gisin) ? saju.gisin : null));
  if (heavy != null) {
    const hit = (heavy + 2) % 5; // 넘치는 기운이 누르는(극하는) 오행
    add({
      kind: 'watch', key: 'health', rank: 5, title: `몸에서는 ${josa(ORGAN[hit].split('(')[0], '을/를')} 챙겨요`,
      text: `그해에는 ${el(heavy)} 기운이 강하게 들어와 ${el(hit)} 기운을 눌러요. 오행으로 보면 ${josa(ORGAN[hit], '이/가')} 쉽게 지치는 해예요. 병을 뜻하는 말이 아니라, 평소보다 조금 더 아껴 주면 좋은 곳이라는 뜻이에요.`,
      act: `${ORGAN_ACT[hit]}, 정기 검진 때 이 부분을 한 번 더 물어보기`, when: '',
    });
  }

  return out.sort((a, b) => b.rank - a.rank).map(({ rank, ...x }) => x);
}

/** 화면용: 조심할 점 최대 3 + 기회 1 + 참고 1 (겁주지 않게 균형) */
export function pickChecks(list) {
  const w = list.filter((c) => c.kind === 'watch').slice(0, 3);
  const g = list.filter((c) => c.kind === 'good').slice(0, 1);
  const n = list.filter((c) => c.kind === 'note').slice(0, 1);
  return [...w, ...g, ...n];
}

/** 한 문단으로: 「제목 — 내용 → 이렇게: 행동 (때)」 */
export function checkLine(c) {
  return `${c.title}. ${c.text} 👉 이렇게 대비해요: ${c.act}${c.when ? ` (특히 ${c.when})` : ''}.`;
}
