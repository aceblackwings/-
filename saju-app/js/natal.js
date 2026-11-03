// 원국 깊이 보기(v0.39): ④ 십성 분포로 본 성향 · ⑥ 기둥 자리별 해석
// 순수 로직만(테스트: tests/natal.test.mjs)
import { tenGod, HIDDEN_DAYS, STEMS, BRANCHES, BRANCH_MAIN_STEM } from './saju.js';
import { twelveStage, STAGE_NOTE } from './expert.js';
import { STAGE_PERIOD } from './reading.js';

export const GOD_GROUPS = [
  { key: 'bigeop', label: '비겁', gods: ['비견', '겁재'], type: '주체형', icon: '🧭', mean: '나를 세우는 힘', strong: '자기 뜻이 분명하고 독립심이 강해요. 스스로 결정하고 밀고 나가는 힘이 있어요.', fill: '혼자 짊어지기 쉬우니, 믿는 동료 한 명과 나눠 보세요.' },
  { key: 'siksang', label: '식상', gods: ['식신', '상관'], type: '표현형', icon: '🎨', mean: '재능을 펼치는 힘', strong: '아이디어와 표현력이 풍부해요. 만들고 말하고 보여 주는 일에서 빛나요.', fill: '떠오른 생각을 글이나 작품으로 꺼내 보면 기운이 살아나요.' },
  { key: 'jaeseong', label: '재성', gods: ['편재', '정재'], type: '실속형', icon: '💼', mean: '결실을 거두는 힘', strong: '현실 감각과 관리 능력이 좋아요. 돈과 사람, 일의 흐름을 잘 다뤄요.', fill: '작은 예산 하나를 정해 관리해 보면 결실의 감각이 자라요.' },
  { key: 'gwanseong', label: '관성', gods: ['편관', '정관'], type: '원칙형', icon: '⚖️', mean: '책임과 자리의 힘', strong: '책임감과 원칙이 분명해요. 조직 안에서 믿고 맡길 수 있는 사람이에요.', fill: '작은 약속 하나를 정해 꾸준히 지키면 신뢰의 힘이 붙어요.' },
  { key: 'inseong', label: '인성', gods: ['편인', '정인'], type: '학습형', icon: '📚', mean: '배우고 품는 힘', strong: '배우고 생각하는 힘이 깊어요. 이해하고 받아들이는 그릇이 커요.', fill: '하루 10분 읽거나 배우는 시간을 두면 마음이 단단해져요.' },
];

/**
 * 십성 분포(%): 일간을 뺀 천간 1, 지지는 지장간 날 수 비율(월지 1.5)
 * @returns { groups: [{...GOD_GROUPS[i], pct}], top, low, type }
 */
export function tenGodProfile(saju) {
  const ds = saju.dayMaster; const P = saju.pillars;
  const raw = [0, 0, 0, 0, 0];
  const add = (stem, w) => { const g = tenGod(ds, stem); raw[GOD_GROUPS.findIndex((x) => x.gods.includes(g))] += w; };
  for (const [k, p] of Object.entries(P)) {
    if (!p) continue;
    if (k !== 'day') add(p.stem, 1);
    const w = k === 'month' ? 1.5 : 1;
    for (const [st, days] of HIDDEN_DAYS[p.branch]) add(st, (w * days) / 30);
  }
  const total = raw.reduce((a, b) => a + b, 0);
  const pct = raw.map((v) => Math.round((v / total) * 100));
  const groups = GOD_GROUPS.map((g, i) => ({ ...g, pct: pct[i] }));
  const sorted = [...groups].sort((a, b) => b.pct - a.pct);
  const top = sorted[0]; const second = sorted[1]; const low = sorted[4];
  const type = top.pct - second.pct <= 5 ? `${top.type}·${second.type}` : top.type;
  return {
    groups, top, second, low, type,
    summary: `가장 많은 기운은 ${top.label}(${top.mean}) ${top.pct}%로 「${type}」이에요. ${top.strong}`,
    lowLine: low.pct <= 8 ? `${low.label}(${low.mean})이 ${low.pct}%로 적은 편이에요. ${low.fill}` : `다섯 기운이 비교적 고르게 있어요. 가장 적은 ${low.label}도 ${low.pct}%라 필요할 때 꺼내 쓸 수 있어요.`,
  };
}

const POS = [
  ['year', '연주', '뿌리', '어린 시절·집안 어른·조상의 자리'],
  ['month', '월주', '줄기', '부모·형제·사회생활과 일터의 자리'],
  ['day', '일주', '꽃', '나 자신과 배우자의 자리'],
  ['hour', '시주', '열매', '자녀·아랫사람·노후와 결실의 자리'],
];
const GOD_IN_POS = {
  비견: '나와 같은 기운이 있어 함께 어깨를 나란히 하는 사람이 곁에 있어요',
  겁재: '경쟁하며 자라는 기운이 있어 승부욕이 힘이 돼요',
  식신: '여유와 재능의 기운이 있어 즐겁게 만들어 내는 힘이 있어요',
  상관: '표현과 재치의 기운이 있어 틀을 바꾸는 힘이 있어요',
  편재: '활발한 재물 기운이 있어 넓게 벌고 움직여요',
  정재: '차곡차곡 쌓는 재물 기운이 있어 살림과 관리에 밝아요',
  편관: '도전과 책임의 기운이 있어 어려움을 이겨 내며 단단해져요',
  정관: '명예와 원칙의 기운이 있어 인정받는 자리가 따라와요',
  편인: '직감과 전문성의 기운이 있어 남다른 깊이가 있어요',
  정인: '배움과 도움의 기운이 있어 귀인과 어른의 덕이 있어요',
};

/** ⑥ 기둥 자리별 해석: 자리의 뜻 + 천간 십신 + 지지 십신 + 12운성 */
export function pillarReadings(saju) {
  const ds = saju.dayMaster;
  return POS.filter(([k]) => saju.pillars[k]).map(([k, name, plant, mean]) => {
    const p = saju.pillars[k];
    const sg = k === 'day' ? null : tenGod(ds, p.stem); const bg = tenGod(ds, BRANCH_MAIN_STEM[p.branch]);
    const st = twelveStage(ds, p.branch);
    const head = `${name}(${STEMS[p.stem]}${BRANCHES[p.branch]}) · ${plant} — ${mean}`;
    const body = k === 'day'
      ? `나 자신의 자리예요. 바로 아래 배우자 자리(일지)에 ${bg}, ${GOD_IN_POS[bg]}. 12운성은 「${st}」 — ${STAGE_PERIOD[st].line}.`
      : `이 자리 겉(천간)에는 ${sg}, ${GOD_IN_POS[sg]}. 속(지지)에는 ${bg}${sg === bg ? `${'재'.includes(bg.slice(-1)) ? '로' : '으로'} 겉과 속이 같아` + ' 그 성격이 더 또렷해요' : `, ${GOD_IN_POS[bg]}`}. 12운성은 「${st}」(${STAGE_NOTE[st]})이에요.`;
    return { key: k, name, head, body };
  });
}
