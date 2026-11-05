// 원국 깊이 보기(v0.39): ④ 십성 분포로 본 성향 · ⑥ 기둥 자리별 해석
// 순수 로직만(테스트: tests/natal.test.mjs)
import { iyeyo } from './josa.js';
import { tenGod, HIDDEN_DAYS, STEMS, BRANCHES, BRANCH_MAIN_STEM } from './saju.js';
import { twelveStage, STAGE_NOTE } from './expert.js';
import { STAGE_PERIOD } from './reading.js';

export const GOD_GROUPS = [
  { key: 'bigeop', label: '비겁', gods: ['비견', '겁재'], type: '주체형', icon: '🧭', mean: '나를 세우는 힘', strong: '자기 뜻이 분명하고 독립심이 강해요. 스스로 결정하고 밀고 나가는 힘이 있어요.', fill: '하루 한 번 「나는 이게 좋아/싫어」를 분명히 말하고, 내 몫을 먼저 챙겨 보세요.' },
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
      : `이 자리 겉(천간)에는 ${sg}, ${GOD_IN_POS[sg]}. 속(지지)에는 ${bg}${sg === bg ? `${'재'.includes(bg.slice(-1)) ? '로' : '으로'} 겉과 속이 같아` + ' 그 성격이 더 또렷해요' : `, ${GOD_IN_POS[bg]}`}. 12운성은 ${iyeyo(`「${st}」(${STAGE_NOTE[st]})`)}.`;
    return { key: k, name, head, body };
  });
}

// ---------- A4 「나라는 사람」 한 장 요약(v0.41): 일간·일주·격국·십성·강약을 서로 어긋나지 않게 세 문장으로 ----------
const GYEOK_GROUP_KEY = { 건록격: 'bigeop', 양인격: 'bigeop', 월겁격: 'bigeop', 식신격: 'siksang', 상관격: 'siksang', 정재격: 'jaeseong', 편재격: 'jaeseong', 정관격: 'gwanseong', 편관격: 'gwanseong', 정인격: 'inseong', 편인격: 'inseong' };
const EL_KO = ['목(木)', '화(火)', '토(土)', '금(金)', '수(水)'];
const LV_TEXT = { 극신약: '기운이 아주 여린 편', 신약: '기운이 여린 편', 중화신약: '기운이 고르면서 조금 여린 편', 중화: '기운이 고른 편', 중화신강: '기운이 고르면서 조금 센 편', 신강: '기운이 센 편', 극신강: '기운이 아주 센 편' };
const bat = (w) => { const c = w.charCodeAt(w.length - 1) - 0xac00; return c >= 0 && c % 28 !== 0; };

/**
 * @param saju · dayProfile DAY_MASTER_PROFILE[일간] · ilju buildIlju 결과 · gyeok analyzeGyeok 결과 · gyeokProfile GYEOK_PROFILE[격]
 * @returns { headline, lines: [3문장] }
 */
export function personSummary(saju, dayProfile, ilju, gyeok, gyeokProfile) {
  const t = tenGodProfile(saju);
  const same = GYEOK_GROUP_KEY[gyeok.name] === t.top.key;
  const lv = saju.strengthLevel || saju.strength;
  const weak = (saju.strengthScore ?? 50) < 45;
  const s1 = `일간은 ${dayProfile.name} · ${dayProfile.image}, 태어난 날은 「${ilju.image}」예요. ${ilju.paras.personality.split('. ')[0]}.`;
  const s2 = same
    ? `타고난 그릇은 ${gyeok.name} 「${gyeokProfile.title}」이고, 사주 전체에도 ${t.top.mean}(${t.top.label} ${t.top.pct}%)이 가장 많아 이 성격이 또렷해요. 특히 ${gyeokProfile.strengths[0]}${bat(gyeokProfile.strengths[0]) ? '이' : '가'} 돋보여요.`
    : `타고난 그릇은 ${gyeok.name} 「${gyeokProfile.title}」이고, 사주 전체로는 ${t.top.mean}(${t.top.label} ${t.top.pct}%)도 커서, ${gyeokProfile.strengths[0]}에 ${t.top.type} 기질이 함께 어우러져요.`;
  const s3 = `${LV_TEXT[lv] || '기운이 고른 편'}이라 ${weak ? '나를 받쳐 주는' : '힘을 잘 써 주는'} ${EL_KO[saju.yongsin]} 기운이 가장 반가워요. 이 기운을 가까이할수록 일이 잘 풀려요.`;
  return { headline: `「${ilju.image}」 같은 ${gyeokProfile.title}`, lines: [s1, s2, s3] };
}

/**
 * 타고난 사주에서 조심할 습관(2026-11-04 사용자 의견 「좋은 말만 하지 말고 조심할 부분도」)
 * 십성이 넘치거나(35% 이상) 비는(5% 이하) 무리, 강약 극단, 일지와 월지의 충·원진을 근거로 최대 3개
 * @returns [{ title, text, act, basis }]
 */
const OVER = {
  bigeop: ['혼자 다 하려는 고집', '나를 세우는 힘(비겁)이 많아 뜻이 분명한 대신, 조언을 늦게 듣고 혼자 짊어지다 지치기 쉬워요. 가까운 사람과 돈이 오갈 때 서운함이 생기기도 쉬워요.', '큰 결정 전에는 믿는 사람 한 명에게 반대 의견을 일부러 물어보기'],
  siksang: ['벌여 놓고 마무리가 약해지는 습관', '재능을 펼치는 힘(식상)이 많아 아이디어와 말솜씨가 좋은 대신, 말이 앞서거나 일을 여러 개 벌여 놓고 끝맺음이 늦어지기 쉬워요.', '새 일을 시작할 때 「끝낼 날짜」부터 달력에 적기'],
  jaeseong: ['일·돈 욕심에 몸을 뒷전으로 미루는 습관', '결실을 거두는 힘(재성)이 많아 현실 감각이 좋은 대신, 일과 돈을 챙기느라 쉬는 시간·공부·건강을 미루기 쉬워요.', '일주일에 하루는 돈 이야기 없는 쉬는 날로 정하기'],
  gwanseong: ['책임감이 지나쳐 쌓이는 스트레스', '책임과 자리의 힘(관성)이 많아 믿음직한 대신, 남의 눈과 평가를 크게 의식해 거절을 못 하고 스트레스를 속으로 쌓기 쉬워요.', '「이번엔 어렵겠어요」 거절 한 문장을 미리 정해 두기'],
  inseong: ['생각이 길어 실행이 늦어지는 습관', '배우고 품는 힘(인성)이 많아 생각이 깊은 대신, 걱정과 준비가 길어져 시작을 미루거나 도움에 기대기 쉬워요.', '고민은 10분 타이머를 맞춰 하고, 끝나면 작은 일 하나 바로 하기'],
};
const UNDER = {
  bigeop: ['내 몫을 챙기지 못하는 습관', '나를 세우는 힘(비겁)이 적어 남을 잘 맞춰 주는 대신, 싫은 걸 싫다고 못 해 손해를 보거나 체력이 쉽게 떨어지기 쉬워요.', '하루 한 번 「나는 이게 좋아/싫어」를 분명히 말해 보기'],
  siksang: ['마음을 말하지 않아 생기는 오해', '재능을 펼치는 힘(식상)이 적어 신중한 대신, 고마움·서운함을 표현하지 않아 상대가 내 마음을 모르기 쉬워요.', '고마운 일·서운한 일을 그날 한 줄로 말해 보기'],
  jaeseong: ['돈 관리가 느슨해지는 습관', '결실을 거두는 힘(재성)이 적어 욕심이 적은 대신, 돈이 어디로 나가는지 놓치기 쉽고 「얼마면 될까」 감각이 약할 수 있어요.', '고정비는 자동이체로 묶고, 한 달에 한 번 통장 내역 보기'],
  gwanseong: ['마감과 규칙에 느슨해지는 습관', '책임과 자리의 힘(관성)이 적어 자유로운 대신, 마감·약속·규칙을 가볍게 넘기다 신뢰를 잃기 쉬워요.', '중요한 마감은 하루 전에 알림 두 번 맞춰 두기'],
  inseong: ['쉬지 못하고 달리는 습관', '배우고 품는 힘(인성)이 적어 행동이 빠른 대신, 쉬거나 도움을 받는 게 어색해 혼자 지치기 쉬워요.', '힘든 일 하나는 「도와줄 수 있어?」 하고 부탁해 보기'],
};
export function natalWatch(saju) {
  const t = tenGodProfile(saju); const out = [];
  const over = [...t.groups].sort((a, b) => b.pct - a.pct).filter((g) => g.pct >= 35);
  const under = [...t.groups].sort((a, b) => a.pct - b.pct).filter((g) => g.pct <= 5);
  for (const g of over.slice(0, 1)) { const [title, text, act] = OVER[g.key]; out.push({ title, text, act, basis: `${g.label} ${g.pct}%` }); }
  for (const g of under.slice(0, 1)) { const [title, text, act] = UNDER[g.key]; out.push({ title, text, act, basis: `${g.label} ${g.pct}%` }); }
  const lv = saju.strengthLevel;
  if (lv === '극신약') out.push({ title: '부탁을 거절하지 못하는 마음', text: '타고난 기운이 아주 여린 편(극신약)이라 주변 기운에 쉽게 흔들려요. 남의 부탁을 다 들어주다 내 일과 몸이 밀리기 쉬워요.', act: '부탁을 받으면 바로 답하지 말고 「확인하고 알려 줄게요」로 하루 시간 벌기', basis: '강약 극신약' });
  if (lv === '극신강') out.push({ title: '내 방식만 고집하는 마음', text: '타고난 기운이 아주 센 편(극신강)이라 추진력이 강한 대신, 내 방식이 옳다고 믿어 주변과 부딪히기 쉬워요.', act: '하루 한 번은 상대 말을 끝까지 듣고 「그렇구나」로 받아 주기', basis: '강약 극신강' });
  const P = saju.pillars; const d = P.day.branch; const m = P.month.branch;
  if (Math.abs(d - m) === 6) out.push({ title: '일과 집 사이에서 자주 바뀌는 마음', text: '태어난 날(나·배우자 자리)과 태어난 달(일터·부모 자리)의 지지가 서로 부딪혀요(충). 직장과 가정, 내 뜻과 부모님 뜻 사이에서 마음이 자주 바뀌거나 이동·이직이 잦기 쉬워요.', act: '큰 변화는 한 달 기다렸다가도 같은 마음이면 그때 정하기', basis: `일지·월지 충` });
  // 넘치거나 빈 기운이 없으면(고른 사주) 가장 많은 기운의 뒷면 하나만 가볍게
  if (!out.length) { const g = t.top; const [title, text, act] = OVER[g.key]; out.push({ title, text, act, basis: `가장 많은 ${g.label} ${g.pct}%` }); }
  return out.slice(0, 3);
}
