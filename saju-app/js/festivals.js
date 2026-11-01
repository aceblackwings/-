// 계절 축제: 음력 명절 + 주요 절기. 축제 기간엔 무료 뽑기 +1과 한정 보너스
import { lunarToSolar, solarTermJDE, dateToJdn, jdnToDate, deltaT } from './lunar.js';
import { koreaUtcOffset } from './saju.js';

const LUNAR_FESTIVALS = [
  { key: 'seollal', name: '설날', icon: '🧧', m: 1, d: 1, span: 1, element: 0, desc: '새해 첫날! 띠가 바뀌는 날, 복주머니 부적이 쏟아져요.' },
  { key: 'daeboreum', name: '정월대보름', icon: '🌕', m: 1, d: 15, span: 1, element: 4, desc: '보름달에 소원을 빌어요. 水 기운 보너스.' },
  { key: 'dano', name: '단오', icon: '🌿', m: 5, d: 5, span: 1, element: 1, desc: '양기가 가장 강한 날. 액막이 부적의 계절.' },
  { key: 'chilseok', name: '칠석', icon: '🌌', m: 7, d: 7, span: 1, element: 4, desc: '견우와 직녀가 만나는 날. 인연·궁합 보너스.' },
  { key: 'chuseok', name: '추석', icon: '🌾', m: 8, d: 15, span: 2, element: 2, desc: '풍요의 한가위. 재물 부적과 土 기운 보너스.' },
];

const TERMS = [
  { key: 'ipchun', name: '입춘', icon: '🌱', lon: 315, element: 0, desc: '봄의 시작, 사주 새해. 木 기운이 깨어나요.' },
  { key: 'chunbun', name: '춘분', icon: '🌸', lon: 0, element: 0, desc: '낮과 밤이 같은 날. 균형의 기운.' },
  { key: 'haji', name: '하지', icon: '☀️', lon: 90, element: 1, desc: '해가 가장 긴 날. 火 기운 최고조.' },
  { key: 'chubun', name: '추분', icon: '🍁', lon: 180, element: 3, desc: '가을의 한가운데. 金 기운 보너스.' },
  { key: 'ipdong', name: '입동', icon: '❄️', lon: 225, element: 4, desc: '겨울의 시작. 水 기운이 차올라요.' },
  { key: 'dongji', name: '동지', icon: '🥣', lon: 270, element: 4, desc: '밤이 가장 긴 날. 팥죽으로 액운을 쫓아요.' },
];

function termDate(year, lon) {
  const guess = 2451545 + (year - 2000) * 365.2422 + ((lon - 280 + 360) % 360) / 360 * 365.2422;
  const jde = solarTermJDE(lon, guess);
  const jdUT = jde - deltaT(year) / 86400;
  return jdnToDate(Math.floor(jdUT + 0.5 + koreaUtcOffset(jdUT) / 24));
}

/** 해당 연도의 축제 목록 (날짜순) */
export function festivalsOf(year) {
  const list = [];
  LUNAR_FESTIVALS.forEach((f) => {
    const s = lunarToSolar(year, f.m, f.d);
    if (!s.error) list.push({ ...f, date: s, span: f.span });
  });
  TERMS.forEach((t) => list.push({ ...t, date: termDate(year, t.lon), span: 1 }));
  return list.map((f) => ({ ...f, jdn: dateToJdn(f.date.year, f.date.month, f.date.day) })).sort((a, b) => a.jdn - b.jdn);
}

/** 오늘 진행 중인 축제와 다음 축제 */
export function festivalStatus(date) {
  const today = dateToJdn(date.year, date.month, date.day);
  const all = [...festivalsOf(date.year - 1), ...festivalsOf(date.year), ...festivalsOf(date.year + 1)];
  const active = all.find((f) => Math.abs(today - f.jdn) <= f.span) || null;
  const next = all.find((f) => f.jdn - f.span > today) || null;
  return { active, next, daysToNext: next ? next.jdn - today : null };
}
