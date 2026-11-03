import assert from 'node:assert/strict';
import { emptyEasy, setEasy, dismissEasy, suggestEasy, ageOf, EASY_TERMS, easyTerms, hasEasyTerms, easyLinkQuery, parseEasyLink, acceptLink, linkAskText, cleanFrom } from '../js/easymode.js';
import { toneProblems } from '../js/habit.js';

let pass = 0;
const t = (name, fn) => { fn(); pass++; console.log('ok -', name); };

t('사전 치환: 원래 용어는 괄호로 남김', () => {
  assert.equal(easyTerms('용신은 수(水)'), '나에게 필요한 기운(용신)은 수(水)');
  assert.equal(easyTerms('대운·세운·월운·일진'), '10년 큰 흐름(대운)·올해 흐름(세운)·이달 흐름(월운)·오늘 기운(일진)');
  assert.equal(easyTerms('신강 / 신약 / 중화'), '기운이 센 편(신강) / 기운이 여린 편(신약) / 기운이 고른 편(중화)');
  assert.equal(easyTerms('정재와 편관'), '차곡차곡 모으는 기운(정재)와 버텨 내는 기운(편관)');
  assert.equal(easyTerms('조후 보완'), '계절 균형(조후) 보완');
});

t('게임 용어도 함께 (firstweek.plainTerms)', () => {
  assert.equal(easyTerms('+3 EXP · Lv.4'), '+3 성장 점수 · 성장 4');
});

t('같은 단어를 두 번 바꾸지 않음', () => {
  const once = easyTerms('용신·희신·기신, 대운 세운 정인 상관 Lv.2 EXP');
  assert.equal(easyTerms(once), once);
  assert.equal(easyTerms(easyTerms(once)), once);
  assert.equal((once.match(/용신/g) || []).length, 1);
  assert.ok(!hasEasyTerms(once), '바뀐 문장에는 더 바꿀 것이 없음');
  assert.ok(hasEasyTerms('오늘 일진'));
});

t('사주 용어가 아닌 같은 글자는 그대로', () => {
  assert.equal(easyTerms('나이와 상관없이'), '나이와 상관없이');
  assert.equal(easyTerms('새해에 세운 다짐'), '새해에 세운 다짐');
  assert.equal(easyTerms('결정인가요'), '결정인가요');
  assert.equal(easyTerms('조심할 기운'), '조심할 기운');
  assert.equal(easyTerms('좋은 편인 하루예요'), '좋은 편인 하루예요');
  assert.equal(easyTerms('높은 편인가요'), '높은 편인가요');
  assert.equal(easyTerms('속 기운 편인'), '속 기운 남다르게 배우는 기운(편인)');
});

t('쉬운 말에 금지어 없음', () => {
  Object.values(EASY_TERMS).forEach((v) => assert.deepEqual(toneProblems(v), [], v));
  assert.deepEqual(toneProblems(linkAskText({ from: '엄마' })), []);
});

t('추천 나이 경계: 49세 아님 · 50세 추천 · 16세 추천 · 17세 아님', () => {
  const s = emptyEasy();
  assert.equal(suggestEasy(1977, 2026, s), false); // 49
  assert.equal(suggestEasy(1976, 2026, s), true); // 50
  assert.equal(suggestEasy(2010, 2026, s), true); // 16
  assert.equal(suggestEasy(2009, 2026, s), false); // 17
  assert.equal(ageOf({ year: 1976, month: 12, day: 1 }, { year: 2026, month: 11, day: 3 }), 49, '생일 전이면 한 살 적게');
  assert.equal(suggestEasy({ year: 1976, month: 12, day: 1 }, { year: 2026, month: 11, day: 3 }, s), false);
});

t('이미 켰거나 닫았거나 끈 적이 있으면 추천하지 않음', () => {
  let s = setEasy(emptyEasy(), true, '2026-11-3');
  assert.equal(s.on, true); assert.equal(s.since, '2026-11-3'); assert.equal(s.by, 'self');
  assert.equal(suggestEasy(1960, 2026, s), false);
  s = setEasy(s, false, '2026-11-4');
  assert.equal(s.on, false);
  assert.equal(suggestEasy(1960, 2026, s), false);
  assert.equal(suggestEasy(1960, 2026, dismissEasy(emptyEasy())), false);
  assert.equal(setEasy(setEasy(emptyEasy(), true, '2026-11-1'), true, '2026-11-9').since, '2026-11-1', '다시 켜도 처음 날 유지');
});

t('링크: 생년월일·이름 없이, 읽기·수락', () => {
  const q = easyLinkQuery({ remind: '08:00', level: 1, from: '큰딸 010-1234' });
  assert.ok(!/\d{4}|010/.test(q.replace('08%3A00', '')), q);
  assert.equal(cleanFrom('엄마1990!'), '엄마');
  const link = parseEasyLink(q);
  assert.deepEqual(link, { remind: '08:00', level: 1, from: '큰딸' });
  assert.equal(parseEasyLink('?x=1'), null);
  assert.equal(parseEasyLink('?easy=1&remind=99:99&level=7').level, 1);
  assert.equal(parseEasyLink('?easy=1&remind=99:99').remind, null);
  const s = acceptLink(emptyEasy(), { ...link, level: 2 }, '2026-11-3');
  assert.equal(s.on, true); assert.equal(s.by, 'link'); assert.equal(s.remind, '08:00'); assert.equal(s.level, 2);
  assert.equal(linkAskText(link), '큰딸님이 쉬운 모드를 추천했어요. 켤까요?');
  assert.equal(linkAskText({}), '소중한 사람이 쉬운 모드를 추천했어요. 켤까요?');
});

console.log(`\neasymode: ${pass} passed`);
