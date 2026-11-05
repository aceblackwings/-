// 합니다체 변환(formal.js) 테스트
import assert from 'node:assert/strict';
import { formal, formalWord, hasPoliteYo } from '../js/formal.js';

const cases = [
  ['좋은 해예요.', '좋은 해입니다.'],
  ['올해는 기회의 해이에요.', '올해는 기회의 해입니다.'],
  ['기운이 실려요.', '기운이 실립니다.'],
  ['시작이 쉬워요.', '시작이 쉽습니다.'],
  ['마음이 좋아요.', '마음이 좋습니다.'],
  ['흐름이 바뀌어요.', '흐름이 바뀝니다.'],
  ['남들과 달라요.', '남들과 다릅니다.'],
  ['내 글자와 이어져요.', '내 글자와 이어집니다.'],
  ['스스로 잘 알아요.', '스스로 잘 압니다.'],
  ['힘이 커요.', '힘이 큽니다.'],
  ['좋은 일이 생길 거예요.', '좋은 일이 생길 것입니다.'],
  ['조심해요.', '조심합니다.'],
  ['내가 참고할게요.', '내가 참고하겠습니다.'],
  ['변화가 있었나요?', '변화가 있었습니까?'],
];
for (const [a, b] of cases) assert.equal(formal(a), b, a);
// 권유(~세요)·물음(~까요?)은 그대로
assert.equal(formal('물을 가까이 두세요.'), '물을 가까이 두세요.');
assert.equal(formal('같이 해 볼까요?'), '같이 해 볼까요?');
// 두 번 바꿔도 같음, 바뀐 문장은 더 이상 「요.」가 없음
const t = formal('좋은 해예요. 기운이 실려요!');
assert.equal(formal(t), t);
assert.equal(hasPoliteYo(t), false);
assert.equal(formalWord('사과'), null);
// v0.51.1 사용자 제보 「계산 근것입니다」: 낱말 끝 「거」는 「것」이 아님
assert.equal(formal('사주 용어로 된 계산 근거예요.'), '사주 용어로 된 계산 근거입니다.');
assert.equal(formal('좋은 증거예요.'), '좋은 증거입니다.');
assert.equal(formal('잘 풀릴 거예요.'), '잘 풀릴 것입니다.');
console.log('formal: 모든 테스트 통과');
