// v0.94 이야기체(novel.js): 번호·목록·꼬리표 → 이어지는 문장
import assert from 'node:assert/strict';
import { prose, joinItems, novelBlock } from '../js/novel.js';
import { josaProblems } from '../js/josa.js';
let pass = 0; const t = (n, f) => { f(); pass++; console.log('ok -', n); };

t('할 일 목록 → 「…하고, …하세요」 · 피할 일 → 「…하거나 …하는 일은 피하세요」', () => {
  assert.equal(joinItems(['물 한 잔을 자주 마시기', '강가 산책하기', '일찍 자기', '하루 10분 생각을 정리하는 시간 갖기']), '물 한 잔을 자주 마시고, 강가 산책하고, 일찍 자고, 하루 10분 생각을 정리하는 시간 가지세요.');
  assert.equal(joinItems(['큰 지출하기', '할 일을 떠안기', '결정을 기다리기'], { avoid: true }), '큰 지출하거나, 할 일을 떠안거나, 결정을 기다리는 일은 피하세요.');
  assert.equal(prose('① 메모 적기 ② 책 읽기 ③ 천천히 걷기'), '메모 적고, 책 읽고, 천천히 걸으세요.');
});
t('꼬리표 → 이어 주는 말 · 1주: → 첫 주에는 · 「용기」 같은 이름씨는 그대로', () => {
  assert.equal(prose('① 미리 준비: 할 일을 세 칸으로 나누기.'), '미리 할 일을 세 칸으로 나누세요.');
  assert.equal(prose('왜 생길까: 일이 몰려요.'), '일이 몰려요.');
  assert.equal(prose('1주: 물 마시기. 2주: 일기 쓰기.'), '첫 주에는 물 마시세요. 둘째 주에는 일기 쓰세요.');
  assert.equal(prose('강점은 추진력, 어려운 일을 맡는 용기.'), '강점은 추진력, 어려운 일을 맡는 용기.');
});
t('블록: 제목은 숨김 표시(novel)만, 「…요」 제목은 첫 문장 · 달 제목은 「N월은 …」 · 피할 일 + 「하나만 피해도」', () => {
  const a = novelBlock({ h: '🔎 1. 일이 몰려요', paras: ['왜 생길까: 책임이 겹쳐요.'] });
  assert.ok(a.novel && a.h); assert.ok(a.paras[0].startsWith('일이 몰려요. 책임이 겹쳐요.'));
  const m = novelBlock({ h: '2월 · 만든 것이 칭찬받는 달 🌟', paras: ['입춘부터 즐거운 기운이 들어와요.'] });
  assert.ok(m.paras[0].startsWith('2월은 만든 것이 칭찬받는 달이에요.'));
  const v = novelBlock({ h: '🚫 올해 피해야 할 일', paras: ['① 큰 지출하기 ② 결정을 미루기. 이 중 하나만 피해도 한 해가 훨씬 가벼워져요.'] });
  assert.equal(v.paras[0], '큰 지출하거나, 결정을 미루는 일은 피하세요. 이 중 하나만 피해도 한 해가 훨씬 가벼워져요.');
  const biz = novelBlock({ h: '🏪 분야', paras: ['· 물류·운송 — 흐르는 일이에요', '· 연구·기획 — 깊이 생각해요'] });
  assert.equal(biz.paras[0], '물류·운송은 흐르는 일이에요. 연구·기획은 깊이 생각해요.');
  for (const x of [a, m, v, biz]) assert.deepEqual(josaProblems(x.paras.join(' ')), []);
});
console.log(`novel: ${pass} passed`);
