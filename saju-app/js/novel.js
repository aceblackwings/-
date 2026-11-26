// v0.94(2026-11-26 사용자 「내용을 다 1·2·3처럼 붙여 놨는데, 운세나 사주는 소설 읽듯이 전체를 읽는 걸 사람들이 좋아해. 그렇게 구성해 줘」)
// 상세판(신년운세·평생 정통사주·궁합)을 이야기처럼 읽히게 바꾸는 마지막 단계.
// ① 장 안의 작은 제목(🧭·🚫 …)은 읽기 화면에서 숨기고(데이터에는 남김), 「…요」로 끝나는 제목만 그 문단의 첫 문장으로 살림
// ② ①②③ 번호 목록 · 「· 」 줄 목록 → 이어지는 한 문장(「…하고, …하고, …하세요」 / 피할 일은 「…하거나 …하는 일은 피하세요」)
// ③ 「왜 생길까:」「미리 준비:」 같은 꼬리표 → 이어 주는 말, 「1주:」 → 「첫 주에는」
// 부록(용어 풀이)은 그대로 둔다. 화면과 무관한 순수 로직(테스트: tests/novel.test.mjs)
import { josa } from './josa.js';

const H0 = 0xac00;
const isHangul = (c) => c >= '가' && c <= '힣';
const jong = (c) => (isHangul(c) ? (c.charCodeAt(0) - H0) % 28 : 0);
const dropJong = (c) => String.fromCharCode(c.charCodeAt(0) - jong(c));
const IRREG = { 듣: '들으', 걷: '걸으', 묻: '물으', 돕: '도우', 줍: '주우', 눕: '누우', 굽: '구우', 갖: '가지', 쭙: '쭈' };

/** 「…하기」의 줄기(하) → 하세요 / 적 → 적으세요 / 만들 → 만드세요 */
function honor(stem) {
  const c = stem.slice(-1); const head = stem.slice(0, -1);
  if (!isHangul(c)) return `${stem}세요`;
  if (IRREG[c]) return `${head}${IRREG[c]}세요`;
  const j = jong(c);
  if (!j) return `${stem}세요`;
  if (j === 8) return `${head}${dropJong(c)}세요`; // ㄹ
  return `${stem}으세요`;
}
/** 줄기 → 꾸미는 말(…하는 / 만드는) */
function adnom(stem) {
  const c = stem.slice(-1); const head = stem.slice(0, -1);
  if (isHangul(c) && jong(c) === 8) return `${head}${dropJong(c)}는`;
  return `${stem}는`;
}
const clean = (t) => String(t).trim().replace(/[.!]+$/, '').trim();
const NOUN_GI = /(^|\s|[·,「(])(용기|이야기|얘기|일기|분위기|경기|향기|인기|시기|공기|무기|전기|고기|아기|온기|생기|열기|크기|기운)$/;
const stemOf = (t) => { const x = clean(t); return /[가-힣]기$/.test(x) && !NOUN_GI.test(x) && !/(잠들|들어가|일어나)기$/.test(x.slice(-4)) ? x.slice(0, -1) : null; };
/** 맨 앞 그림 글자(이모지)와 「1.」 같은 번호 떼기 */
const stripLead = (t) => String(t).replace(/^[^가-힣A-Za-z0-9「『(\[]+/u, '').replace(/^\d+\.\s*/, '').trim();

/** 항목 여러 개 → 한 문장 */
export function joinItems(items, { avoid = false, subject = '' } = {}) {
  const xs = items.map(clean).filter(Boolean);
  if (!xs.length) return '';
  const stems = xs.map(stemOf);
  if (stems.every(Boolean)) {
    if (avoid) return `${stems.slice(0, -1).map((s) => `${s}거나`).join(', ')}${xs.length > 1 ? ', ' : ''}${adnom(stems[stems.length - 1])} 일은 피하세요.`;
    return `${stems.slice(0, -1).map((s) => `${s}고`).join(', ')}${xs.length > 1 ? ', ' : ''}${honor(stems[stems.length - 1])}.`;
  }
  const joined = xs.length === 1 ? xs[0] : `${xs.slice(0, -1).join(', ')}, 그리고 ${xs[xs.length - 1]}`;
  if (avoid) return `${josa(joined, '은/는')} 멀리하세요.`;
  // 섞인 목록(「…하기」와 이름씨가 섞임): 항목마다 한 문장으로
  if (stems.some(Boolean)) return xs.map((x, i) => (stems[i] ? `${honor(stems[i])}.` : `${x}.`)).join(' ');
  if (subject) return `${josa(subject, '은/는')} ${joined}${/[요다]$/.test(joined) ? '' : /[가-힣]$/.test(joined) && (joined.charCodeAt(joined.length - 1) - 0xac00) % 28 ? '이에요' : '예요'}.`;
  return `${joined}.`;
}

/** 꼬리표 → 이어 주는 말(빈 글자 = 꼬리표만 지움) */
const LABEL = {
  '왜 생길까': '', '이런 장면에서 알아채요': '알아채는 때는 ', '미리 준비': '미리 ', '그 순간에는': '그 순간에는 ', '지나고 나서': '지나고 나서는 ',
  '좋은 운으로 바꾸기': '', '이렇게 막아요': '이럴 땐 ', '이렇게 잡아요': '그러려면 ', '이렇게 지나요': '', '날짜 고르기': '',
  '생각해 볼 것': '', '이 달 한 가지': '이 달에는 ', '조심': '', '실천 하나': '그러니 ', '이 10년에 가장 먼저 할 일': '이 10년에는 가장 먼저 ', '일하는 방식': '일할 때는 ', '이번 주 한 가지': '이번 주에는 ', '오늘 한 가지': '오늘은 ', '좋은 날': '좋은 날은 ', '쉬어 갈 날': '쉬어 갈 날은 ', '혼자라면': '혼자라면 ', '함께라면': '함께라면 ', '일할 때': '일할 때는 ', '사랑할 때': '사랑할 때는 ',
};
const WEEK = ['첫 주', '둘째 주', '셋째 주', '넷째 주', '다섯째 주'];
const CIRC = '①②③④⑤⑥⑦⑧⑨';

/** 문단 하나를 이야기 문장으로 */
export function prose(p, { avoid = false, subject = '' } = {}) {
  let t = String(p).trim();
  if (!t) return t;
  // 맨 앞이 ① 인 한 줄 목록(① a ② b ③ c. 뒤 문장)
  if (t.startsWith('①') && /[②③]/.test(t)) {
    const parts = t.split(/\s*[①②③④⑤⑥⑦⑧⑨]\s*/).filter((x) => x.trim());
    // 마지막 항목 뒤에 이어지는 문장(「. 이 중 하나만…」)은 떼어 둠
    const last = parts[parts.length - 1]; const cut = last.search(/[.!?]\s+\S/);
    let tail = '';
    if (cut > 0) { tail = last.slice(cut + 1).trim(); parts[parts.length - 1] = last.slice(0, cut + 1); }
    const sentenceItems = parts.every((x) => /[요다][.!?]?\s*$/.test(x.trim()) || /[.!?]\s+\S/.test(x.trim()));
    const head = sentenceItems ? parts.map((x) => prose(x)).join(' ') : joinItems(parts.map((x) => x.replace(/^[^:：]{1,10}[:：]\s*/, '')), { avoid, subject });
    t = tail ? `${head} ${tail}` : head;
    return t;
  }
  // 문단 가운데의 「○○ 체크리스트: ① a ② b」「○○ 법: ① a ② b」
  const mid = t.indexOf('①');
  if (mid > 0 && /[②③]/.test(t.slice(mid))) {
    const before = t.slice(0, mid).trim();
    const lm = before.match(/(?:^|(?<=[.!?]\s))([^.!?]{1,30}?)[:：]$/);
    let lead = before; let intro = '';
    if (lm) {
      lead = before.slice(0, before.length - lm[0].length).trim();
      const label = lm[1].trim();
      const ck = label.match(/^(.*?)\s*체크리스트$/); const how = label.match(/^(.*?)(을|를)?\s*잘\s*(.+?)는 법$/);
      if (ck) intro = `${josa(ck[1], '을/를')} 챙기려면 `;
      else if (how) intro = `${how[1]}${how[2] || ''} 잘 ${how[3]}려면 `.replace(/\s{2,}/g, ' ');
    }
    const items = prose(t.slice(mid), { avoid, subject });
    const body = intro && /^[가-힣「]/.test(items) ? `${intro}${items}` : items;
    return `${lead ? `${prose(lead, { avoid, subject })} ` : ''}${body}`.replace(/\s{2,}/g, ' ');
  }
  t = t.replace(new RegExp(`^[${CIRC}]\\s*`), '');
  t = stripLead(t) || t;
  // 꼬리표
  const m = t.match(/^([가-힣 ·]{1,14})[:：]\s*/);
  if (m && LABEL[m[1].trim()] !== undefined) {
    const rest = t.slice(m[0].length);
    const s = stemOf(rest.split(/(?<=[.!?])\s/)[0]);
    const body = s && !/[.!?]\s+\S/.test(clean(rest)) ? `${honor(s)}.` : rest;
    t = `${LABEL[m[1].trim()]}${body}`;
  }
  // 문장 사이의 꼬리표(「… . 쉬어 갈 날: …」)와 가운데 그림 글자(👉)
  t = t.replace(/(?<=[.!?]\s)([가-힣 ]{1,10})[:：]\s*/g, (all, l) => (LABEL[l.trim()] !== undefined ? LABEL[l.trim()] : all));
  t = t.replace(/(^|\s)[👉🌈📅🔎⚠️🚫✅💡🤔]+\uFE0F?\s*/gu, '$1');
  // 1주: … 2주: …
  t = t.replace(/(\d)주:\s*([^.]+?)\./g, (all, n, x) => { const s = stemOf(x); return `${WEEK[Number(n) - 1] || `${n}주`}에는 ${s ? honor(s) : x}.`; });
  // 「…하기.」로 끝나는 문장 → 「…하세요.」
  t = t.split(/(?<=[.!?])\s+/).map((x) => { const s = /[.]$/.test(x) || !/[.!?]$/.test(x) ? stemOf(x) : null; return s ? `${honor(s)}.` : x; }).join(' ');
  return t.replace(/\s{2,}/g, ' ');
}

/** 블록 하나: 제목 → (문장이면) 첫 문장, 「· 」 줄들 → 한 문장, 나머지 문단 → prose */
export function novelBlock(b) {
  if (b.cliff) return b;
  const h = b.h ? stripLead(b.h) : '';
  const avoid = /피(해|할|하)|멀리|조심할 것|하지 말/.test(h);
  const subject = h && !/[요?]$/.test(h) ? h.replace(/\s*\([^)]*\)$/, '') : '';
  const out = []; let monthLead = '';
  const hh = h.replace(/\s*[^가-힣A-Za-z0-9)」]+$/u, '').trim(); // 끝의 🌟 같은 표시 떼기
  const [ha, hb] = hh.includes(' · ') ? [hh.slice(0, hh.indexOf(' · ')), hh.slice(hh.indexOf(' · ') + 3)] : [hh, ''];
  if (hb && /^\d+월/.test(ha)) out.push(`${josa(ha, '은/는')} ${/[요?]$/.test(hb) ? hb : `${hb}${/[가-힣]$/.test(hb) && (hb.charCodeAt(hb.length - 1) - 0xac00) % 28 ? '이에요' : '예요'}`}.`);
  else if (hb && /[요?]$/.test(hb)) out.push(`${hb}.`.replace(/[?]\.$/, '?'));
  else if (/[요?]$/.test(hh)) out.push(/[?]$/.test(hh) ? hh : `${hh}.`);
  else if (/^\d+월(\([^)]*\))?/.test(hh)) monthLead = hh.match(/^\d+월(\([^)]*\))?/)[0];
  let bullets = [];
  const flush = () => {
    if (!bullets.length) return;
    const rows = bullets.map((x) => x.replace(/^·\s*/, ''));
    if (rows.every((x) => / — /.test(x))) {
      out.push(rows.map((x) => { const [f, r] = x.split(' — '); return `${josa(f.trim(), '은/는')} ${clean(r)}${/[요다]$/.test(clean(r)) ? '' : '예요'}.`; }).join(' '));
    } else out.push(joinItems(rows, { avoid, subject }));
    bullets = [];
  };
  for (const p of b.paras) {
    if (/^·\s/.test(p)) { bullets.push(p); continue; }
    flush(); let x = prose(p, { avoid, subject });
    if (monthLead && /^이 달은/.test(x)) { x = x.replace(/^이 달은/, josa(monthLead, '은/는')); monthLead = ''; }
    out.push(x);
  }
  flush();
  // 짧은 문단은 앞 문단에 붙여 한 흐름으로
  const merged = [];
  for (const x of out) { if (merged.length && merged[merged.length - 1].length + x.length < 160) merged[merged.length - 1] += ` ${x}`; else merged.push(x); }
  return { ...b, paras: merged, novel: true }; // 작은 제목(h)은 차례·찾아가기용으로 남기고, 읽기 화면에서는 숨김(novel)
}

/** 보고서 전체: 부록·표지는 그대로, 본문 장만 이야기체로 */
export function novelize(rep) {
  return { ...rep, sections: rep.sections.map((s) => (s.appendix ? s : { ...s, intro: s.intro ? prose(s.intro) : s.intro, blocks: s.blocks.map(novelBlock) })) };
}
