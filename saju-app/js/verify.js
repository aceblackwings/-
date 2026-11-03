// 검증 세트(v0.35, 로드맵 E2): 명리 전문가가 서로 모르게 판정한 용신·희신(·격국)과 엔진을 비교한다.
// 순수 로직만(테스트: tests/verify.test.mjs). 실행 도구: tools/verify.mjs
// 1) 일간 10 × 태어난 달이 고르게 섞인 60명식 질문지 → 2) 전문가 2명 이상 답 → 3) 전문가끼리 일치율(상한선)
// 4) 앞 절반으로 기준값을 맞추고 뒤 절반으로만 성적을 잼(과적합 방지)

const EL_ALIASES = [['목', '木', 'wood', '나무'], ['화', '火', 'fire', '불'], ['토', '土', 'earth', '흙'], ['금', '金', 'metal', '쇠'], ['수', '水', 'water', '물']];
const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';

/** 「수」「水」「water」 → 4. 모르면 null */
export function elementOf(v) {
  const t = String(v ?? '').trim().toLowerCase();
  if (!t) return null;
  const i = EL_ALIASES.findIndex((a) => a.some((x) => t === x.toLowerCase() || t.startsWith(x.toLowerCase())));
  return i < 0 ? null : i;
}

/** 격국 이름 맞추기: 「정관」「정관격」 → 「정관격」, 칠살=편관, 월겁=양인(음간) 등 별칭 */
export function gyeokOf(v) {
  let t = String(v ?? '').replace(/\s/g, '');
  if (!t) return null;
  if (!t.endsWith('격')) t += '격';
  const alias = { 칠살격: '편관격', 월겁격: '양인격', 녹격: '건록격', 록격: '건록격', 효신격: '편인격', 인수격: '정인격' };
  return alias[t] || t;
}

/**
 * 고른 질문지: 일간마다 태어난 달 6개(일간마다 한 칸씩 밀어 12달을 고르게), 총 60명식.
 * 1955~2005년 중 하루씩 앞으로 훑어 조건에 맞는 첫 날(정오, 시간 앎)을 고른다. 같은 입력이면 늘 같은 세트.
 */
export function buildVerifySet(computeSaju, { perStem = 6, startYear = 1955 } = {}) {
  const want = [];
  for (let st = 0; st < 10; st++) for (let k = 0; k < perStem; k++) want.push({ st, mb: (st + k * (12 / perStem)) % 12 });
  const out = [];
  want.forEach((w, i) => {
    // 질문마다 시작 날짜를 달리해 연도가 넓게 퍼지게
    const t0 = Date.UTC(startYear + (i * 7) % 50, (i * 5) % 12, 1);
    for (let d = 0; d < 800; d++) {
      const dt = new Date(t0 + d * 86400000);
      const input = { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate(), hour: [7, 12, 17, 21][i % 4], minute: 30 };
      const s = computeSaju(input);
      if (s.pillars.day.stem === w.st && s.pillars.month.branch === w.mb) {
        out.push({ id: `V${String(i + 1).padStart(2, '0')}`, input, pillars: pillarsText(s) });
        return;
      }
    }
  });
  return out;
}

export const pillarsText = (s) => ['year', 'month', 'day', 'hour'].map((k) => (s.pillars[k] ? `${STEMS[s.pillars[k].stem]}${BRANCHES[s.pillars[k].branch]}` : '--')).join(' ');

export const SHEET_HEAD = ['번호', '양력', '시각', '연주 월주 일주 시주', '용신', '희신', '격국', '메모'];

/** 전문가에게 보낼 질문지(CSV). 이름 없음, 답 칸은 비워 둠 */
export function sheetCSV(set) {
  const rows = set.map((v) => [v.id, `${v.input.year}-${v.input.month}-${v.input.day}`, `${String(v.input.hour).padStart(2, '0')}:${String(v.input.minute).padStart(2, '0')}`, v.pillars, '', '', '', '']);
  return [SHEET_HEAD, ...rows].map((r) => r.join(',')).join('\n');
}

/** 답이 채워진 CSV → { V01: { yongsin, heesin, gyeok } } (빈 칸은 null) */
export function parseAnswers(csv) {
  const lines = String(csv).replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  const head = lines.shift().split(',').map((h) => h.trim());
  const col = (name) => head.indexOf(name);
  const out = {};
  for (const l of lines) {
    const c = l.split(',');
    const id = c[col('번호')]?.trim(); if (!id) continue;
    out[id] = { yongsin: elementOf(c[col('용신')]), heesin: elementOf(c[col('희신')]), gyeok: gyeokOf(c[col('격국')]) };
  }
  return out;
}

const rate = (hit, n) => (n ? Math.round((hit / n) * 1000) / 10 : null);

/** 두 답(엔진·전문가, 또는 전문가끼리) 비교. 답이 있는 칸만 셈 */
export function compare(a, b, ids = Object.keys(b)) {
  const r = { n: 0, yongsin: 0, either: 0, heesin: 0, nh: 0, gyeok: 0, ng: 0 };
  for (const id of ids) {
    const x = a[id]; const y = b[id];
    if (!x || !y) continue;
    if (y.yongsin != null && x.yongsin != null) {
      r.n++;
      if (x.yongsin === y.yongsin) r.yongsin++;
      // 엔진 용신·희신 둘 중 하나가 상대 용신과 같으면 「넓게 일치」
      if ([x.yongsin, x.heesin].includes(y.yongsin)) r.either++;
    }
    if (y.heesin != null && x.heesin != null) { r.nh++; if (x.heesin === y.heesin) r.heesin++; }
    if (y.gyeok && x.gyeok) { r.ng++; if (x.gyeok === y.gyeok) r.gyeok++; }
  }
  return { n: r.n, yongsin: rate(r.yongsin, r.n), broad: rate(r.either, r.n), heesin: rate(r.heesin, r.nh), gyeok: rate(r.gyeok, r.ng), ng: r.ng };
}

/** 엔진 결과를 비교 형식으로 */
export function engineAnswers(set, computeSaju, opts) {
  return Object.fromEntries(set.map((v) => {
    const s = computeSaju(v.input, opts);
    return [v.id, { yongsin: s.yongsin, heesin: s.heesin, gyeok: s.gyeok?.name ?? null, basis: s.yongsinBasis }];
  }));
}

/** 앞 절반 = 맞추기, 뒤 절반 = 시험. 후보 기준값마다 앞 절반 성적을 재서 가장 좋은 값을 고르고, 뒤 절반 성적만 보고한다 */
export function calibrate(set, answers, computeSaju, candidates = [0, 5, 10, 15, 20, 25, 30]) {
  const half = Math.floor(set.length / 2);
  const ids = set.map((v) => v.id);
  const fit = ids.slice(0, half); const test = ids.slice(half);
  const tries = candidates.map((tableMild) => {
    const eng = engineAnswers(set, computeSaju, { tableMild });
    return { tableMild, fit: compare(eng, answers, fit), test: compare(eng, answers, test) };
  });
  const score = (c) => (c.yongsin ?? 0) * 2 + (c.heesin ?? 0); // 용신 일치를 두 배로
  const best = tries.reduce((a, b) => (score(b.fit) > score(a.fit) ? b : a));
  return { best: best.tableMild, fitScore: best.fit, testScore: best.test, tries };
}
