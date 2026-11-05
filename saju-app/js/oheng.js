// 내 오행 · 모자란 기운 채우기(v0.56, 2026-11-05 사용자 「정통사주에서 오행을 볼 때 모자란 기운을 얻는 법을 알려 주거나 누르게」)
// 오행 다섯 막대를 누르면 그 기운이 하는 일 · 모자라면 생기기 쉬운 일 · 채우는 법(생활 4가지) · 색·음식·방향·물건·장소·띠
// 문장은 storybook.js EL_TALE, 색·음식·방향·물건은 fortune.js ELEMENT_LUCK(오늘 행운 키트와 같은 값). 순수 로직만(테스트: tests/oheng.test.mjs)
import { EL_TALE, EL_NAME } from './storybook.js';
import { ELEMENT_LUCK } from './fortune.js';

export const MUCH = 30; // 이만큼(%) 넘으면 넉넉한 기운
export const LOW = 12; // 이보다 적으면 모자란 기운

/** 기운의 자리: need 가장 필요 · weak 가장 적음 · low 적은 편 · much 넉넉 · ok 보통 */
export function roleOf(el, saju) {
  const v = saju.elements[el];
  if (el === saju.yongsin) return 'need';
  if (el === saju.weakest) return 'weak';
  if (v < LOW) return 'low';
  if (v >= MUCH) return 'much';
  return 'ok';
}
export const ROLE_TAG = { need: '★ 가장 필요한 기운', weak: '가장 적은 기운', low: '적은 편', much: '넉넉한 기운', ok: '보통' };

/** 한 기운 안내 */
export function ohengGuide(el, saju) {
  const T = EL_TALE[el]; const L = ELEMENT_LUCK[el]; const role = roleOf(el, saju); const name = EL_NAME[el];
  const fill = role === 'need' || role === 'weak' || role === 'low';
  const status = fill
    ? `${name} 기운이 모자라면 이런 일이 생기기 쉬워요. ${T.lack}`
    : role === 'much'
      ? `${name} 기운은 이미 넉넉해서 더 채우지 않아도 돼요. 대신 가장 필요한 ${EL_NAME[saju.yongsin]} 기운을 채우면 균형이 잡혀요.`
      : `${name} 기운은 보통이라 따로 신경 쓰지 않아도 돼요. 아래 방법은 기운이 처질 때 꺼내 쓰면 좋아요.`;
  return {
    el, name, value: saju.elements[el], role, tag: ROLE_TAG[role], fill,
    nature: T.nature, status,
    bring: [...T.bring],
    chips: [
      ['🎨 색', T.color], ['🍲 음식', L.food], ['🧭 방향', L.direction], ['🪴 물건', L.item], ['📍 장소', T.place], ['🐾 힘이 되는 띠', T.zodiac],
    ],
  };
}
/** 처음 펼칠 기운: 가장 필요한 기운 */
export const defaultOheng = (saju) => saju.yongsin;
