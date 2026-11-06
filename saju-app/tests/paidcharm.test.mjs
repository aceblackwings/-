// v0.60 유료 부적(소원 · 태우기): 하나뿐인 종이 · 의식 · 씨앗 · 중간 알림 · 결제 창
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as P from '../js/paidcharm.js';
import * as W from '../js/wish.js';
import { josaProblems } from '../js/josa.js';
import { toneProblems } from '../js/habit.js';
let pass = 0; const t = (n, f) => { f(); pass++; console.log('ok -', n); };

t('인장: 12띠 모두 다른 두 줄 + 줄 나누기', () => {
  const seals = Array.from({ length: 12 }, (_, i) => P.sealChars(i));
  assert.equal(new Set(seals.map((x) => x[0])).size, 12);
  assert.ok(seals.every(([a, b]) => a.length === 2 && b === '之印'));
  assert.deepEqual(P.sealChars(4), ['龍神', '之印']);
  assert.deepEqual(P.wrapLines('자격증 시험 합격', 6), ['자격증 시험', '합격']);
  assert.deepEqual(P.wrapLines('가나다라마바사아자', 4), ['가나다라', '마바사아', '자']);
  for (const s of ['저축 100만 원 모으기', '가족 모두 건강하기', '가'.repeat(30), '좋은 인연 만나서 행복하게 오래오래 지내기']) {
    for (const per of [6, 7, 8]) {
      const ls = P.wrapLines(s, per);
      assert.ok(ls.every((l) => l.length <= per), `${s} ${per}`);
      assert.equal(ls.join('').replace(/\s/g, ''), s.replace(/\s/g, ''));
    }
  }
});

t('부적 글자 배치·SVG: 종이 안쪽, 인장, 꺾쇠 안전, 생년월일 없음, 같은 글이면 같은 종이', () => {
  const base = { text: '자격증 시험 꼭 합격하기', name: '하늘', madeKey: '2026-11-6', dueKey: '2026-12-6', branch: 4 };
  for (const kind of ['wish', 'burn']) {
    for (const text of ['합격', base.text, '가'.repeat(30), '다음 주 발표가 걱정돼요 <script>']) {
      const items = P.charmLayout({ ...base, kind, text });
      assert.ok(items.every((x) => x.x >= 0 && x.x <= 300 && x.y > 0 && x.y < 480), `${kind} ${text}`);
      const body = items.filter((x) => x.font === P.BRUSH_FONT);
      assert.ok(body.length >= 1 && body.length <= 5);
      assert.ok(body.every((x) => x.y > 112 && x.y < 350), '본문은 위아래 선 사이');
      assert.equal(items.filter((x) => x.seal).length, 2);
      const svg = P.paidCharmSVG({ ...base, kind, text });
      assert.ok(!svg.includes('<script>'));
      const words = [...svg.matchAll(/>([^<>]+)<\/text>/g)].map((m) => m[1]).join(' ');
      assert.ok(!/19\d\d|200\d|201\d/.test(words), '태어난 해 같은 숫자 없음');
    }
  }
  const svg = P.paidCharmSVG({ ...base, kind: 'wish' });
  assert.ok(svg.includes('所願成就') && svg.includes('하늘 님의 소원') && svg.includes('이루고 싶은 날 · 12월 6일') && svg.includes('龍神'));
  assert.ok(P.paidCharmSVG({ ...base, kind: 'burn' }).includes('消災降福'));
  const strip = (x) => x.replace(/pc\d+g/g, '');
  assert.equal(strip(P.paidCharmSVG({ ...base, kind: 'wish' })), strip(P.paidCharmSVG({ ...base, kind: 'wish' })));
  assert.ok(!P.paidCharmSVG({ ...base, kind: 'wish' }, { noText: true }).includes('<text'));
  assert.ok(!P.paidCharmSVG({ ...base, kind: 'wish', seal: false }).includes('pc-seal'));
  assert.ok(P.paidCharmSVG({ ...base, kind: 'wish', done: true, doneKey: '2026-12-6' }).includes('成就</text>'));
});

t('의식: 4단계 · 진동은 도장 때만 · 따라 쓸 글', () => {
  assert.deepEqual(P.RITUAL_STEPS.map((x) => x.key), ['ink', 'trace', 'seal', 'blow']);
  assert.equal(P.inkShare(0), 0); assert.equal(P.inkShare(P.INK_NEED * 2), 1);
  assert.equal(P.traceText('김하늘별님'), '김하늘별'); assert.equal(P.traceText(''), '소원');
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  assert.equal((app.match(/navigator\.vibrate/g) || []).length, 1, '진동은 도장 한 곳');
  assert.ok(!/new Audio|AudioContext|\.play\(\)/.test(app), '소리 없음');
});

t('걱정 씨앗: 날짜·기운만 저장, 7일 뒤 안부, 가벼워지면 꽃', () => {
  let st = P.plantSeed(P.emptySeeds(), '2026-11-6', 2);
  assert.deepEqual(Object.keys(st.list[0]).sort(), ['answer', 'at', 'el']);
  assert.equal(P.seedToAsk(st, '2026-11-12'), -1);
  assert.equal(P.seedToAsk(st, '2026-11-13'), 0);
  assert.equal(P.seedStage(st.list[0], '2026-11-8').label, '씨앗');
  assert.equal(P.seedStage(st.list[0], '2026-11-13').label, '새싹');
  st = P.plantSeed(st, '2026-11-20', 1);
  assert.equal(P.seedToAsk(st, '2026-11-30'), 1, '가장 오래된 씨앗부터');
  st = P.answerSeed(st, 1, 'light', '2026-11-30');
  assert.equal(P.seedStage(st.list[1], '2026-11-30').label, '꽃');
  assert.equal(P.seedToAsk(st, '2026-11-30'), 0);
  for (let i = 0; i < 40; i++) st = P.plantSeed(st, '2026-12-1', 0);
  assert.equal(st.list.length, P.SEED_MAX);
  // 앱: 씨앗 저장에는 걱정 글을 넘기지 않음
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  const line = app.split('\n').find((l) => l.includes('plantSeed(load('));
  assert.ok(line && !/worry/.test(line));
  const burn = readFileSync(new URL('../js/burn.js', import.meta.url), 'utf8');
  assert.ok(!/localStorage|sessionStorage|indexedDB/.test(burn));
});

t('소원 중간 알림: 반쯤 지나면 한 번, 그날 전까지', () => {
  const col = [{ wish: '합격', madeKey: '2026-11-1', dueKey: '2026-12-1', result: null }, { wish: '짧은 소원', madeKey: '2026-11-1', dueKey: '2026-11-3' }, { type: 'luck' }];
  assert.equal(W.midWish(col, '2026-11-15'), null);
  assert.equal(W.midWish(col, '2026-11-16').i, 0);
  assert.equal(W.midWish(col, '2026-12-1'), null, '그날은 묻기 카드가 맡음');
  assert.equal(W.midWish(W.markMid(col, 0), '2026-11-20'), null);
  assert.equal(W.midWish([{ ...col[0], result: 'done' }], '2026-11-20'), null);
});

t('말·결제 창: 존댓말 짝 · 조사 · 겁주는 말 없음 · 받는 것 4줄', () => {
  for (const polite of [false, true]) {
    for (const k of ['blow', 'mid', 'seed', 'seedAsk', 'light', 'heavy']) {
      const s = P.ritualLine(k, polite, '자격증 합격', '12월 6일');
      assert.ok(s && !s.includes('{'));
      assert.deepEqual(josaProblems(s), [], s);
      assert.deepEqual(toneProblems(s), [], s);
      if (polite) assert.ok(/요[.?!]?$|요\.|요\?/.test(s), s);
    }
  }
  for (const k of ['wish', 'burn']) { assert.equal(P.PAY_GETS[k].length, 4); P.PAY_GETS[k].forEach((s) => assert.deepEqual(toneProblems(s), [])); }
  assert.ok(P.PAY_GETS.wish.some((x) => x.includes('배경화면')));
  assert.ok(P.PAY_GETS.burn.some((x) => x.includes('저장하지 않아요')));
});

console.log(`paidcharm: ${pass} passed`);
