// 운세 풀이 (대운·올해·이달): 읽을거리가 있는 해석
// 재료는 모두 정통 엔진(period.js / luck.js)에서 나온 값 — 그 기간 간지의 십신(천간), 속 기운(지지 본기의 십신),
// 용신·기신 적합도, 일지와의 합·충, 점수. 여기에 십신별 해설·좋은 점·조심할 점·분야별 풀이·실천 팁을 엮는다.
import { tenGod, BRANCH_MAIN_STEM, ELEMENT_KO, ELEMENT_HANJA, STEM_ELEMENT, BRANCH_ELEMENT } from './saju.js';
import { twelveStage } from './expert.js';

/**
 * 12운성 × 십신 × 기간(v0.37, 로드맵 E4): 그 기간 지지에서 내 일간이 놓이는 자리로 「십신의 성격이 얼마나 힘 있게 드러나는지」를 풀이
 * 자리 무리: 왕(장생·관대·건록·제왕) / 자람(목욕·양·태·쇠) / 모음(병·사·묘·절)
 */
export const STAGE_PERIOD = {
  장생: { group: 'up', line: '새싹이 돋듯 새로 시작하는 힘이 붙는 자리예요', tip: '배우기 시작하거나 새 일을 여는 데 쓰면 좋아요' },
  목욕: { group: 'mid', line: '꾸미고 드러내고 싶은 마음이 커지는 자리예요', tip: '나를 보여 주는 일은 좋지만, 마음이 들뜰 땐 한 박자 쉬어 가세요' },
  관대: { group: 'up', line: '어른이 되어 옷을 갖춰 입듯 자리를 잡아 가는 자리예요', tip: '자격·직함·역할을 하나 더 갖추는 데 쓰면 좋아요' },
  건록: { group: 'up', line: '내 힘으로 우뚝 서는 자리예요', tip: '남에게 기대기보다 내 이름으로 하는 일에 힘이 실려요' },
  제왕: { group: 'up', line: '기운이 가장 왕성한 자리예요', tip: '힘이 넘칠수록 주변을 챙기면 운이 오래가요' },
  쇠: { group: 'mid', line: '한창때를 지나 무르익어 차분해지는 자리예요', tip: '경험을 정리하고 나누는 일에서 빛나요' },
  병: { group: 'in', line: '기운이 안으로 잦아들어 돌봄이 필요한 자리예요', tip: '무리한 확장보다 몸과 마음을 먼저 챙기세요' },
  사: { group: 'in', line: '하던 일을 멈추고 정리하는 자리예요', tip: '끝낼 것을 끝내야 새 문이 열려요' },
  묘: { group: 'in', line: '거둔 것을 창고에 모아 두는 자리예요', tip: '저축·기록·정리처럼 모으는 일에 좋아요' },
  절: { group: 'in', line: '낡은 것과 끊고 새로 준비하는 자리예요', tip: '정리할 관계·습관 하나를 내려놓으면 가벼워져요' },
  태: { group: 'mid', line: '새 씨앗이 맺히는 자리예요', tip: '당장 결과보다 계획과 구상에 쓰면 좋아요' },
  양: { group: 'mid', line: '품 안에서 조용히 길러지는 자리예요', tip: '도움을 받으며 실력을 기르는 데 좋아요' },
};
const STAGE_GOD = {
  up: (k) => `그래서 「${k}」의 성격이 힘 있게 겉으로 드러나요.`,
  mid: (k) => `그래서 「${k}」의 성격이 서서히, 부드럽게 드러나요.`,
  in: (k) => `그래서 「${k}」${(() => { const c = k.charCodeAt(k.length - 1) - 0xac00; return c >= 0 && c % 28 !== 0 ? '은' : '는'; })()} 서두르기보다 안에서 다질 때 오래 남아요.`,
};
/** 기간 지지에서의 12운성 문장 (when = '올해는' 등) */
export function stageLine(dayStem, branch, god, when = '이 시기는') {
  const st = twelveStage(dayStem, branch); const P = STAGE_PERIOD[st];
  return { stage: st, text: `${when} 내 일간이 「${st}」 자리에 서요. ${P.line}. ${STAGE_GOD[P.group](GOD_READING[god].keyword)} ${P.tip}.` };
}

export const GOD_READING = {
  비견: {
    keyword: '자기 확신과 독립',
    core: '나와 같은 기운이 들어와 자기 확신과 독립심이 커지는 때예요. 내 뜻대로 해 보고 싶은 마음이 강해지고, 비슷한 사람들과 어깨를 나란히 하게 됩니다.',
    good: ['주관이 뚜렷해져 결정을 미루지 않게 돼요', '동료·친구와 힘을 합치면 혼자일 때보다 멀리 가요', '자신감이 올라 새로운 시작에 유리해요'],
    watch: ['고집이 세져 주변과 부딪히기 쉬워요', '돈이 나뉘는 흐름이라 동업·보증·큰 지출은 신중하게'],
    fields: {
      wealth: '들어오는 만큼 나가기 쉬워요. 공동 지출과 빌려주는 돈만 조심하면 충분히 지킬 수 있어요.',
      love: '서로의 자존심이 부딪힐 수 있어요. 이기려 하기보다 같은 편이 되어 주세요.',
      career: '독립·창업·프리랜서처럼 내 이름으로 하는 일에 힘이 실려요.',
      health: '활동량이 늘어 체력이 좋아지는 편이에요. 과신해서 무리하지만 않으면 돼요.',
      social: '동료와 친구가 늘어나요. 경쟁보다 협력의 관계로 만들면 큰 자산이 돼요.',
    },
    tips: ['혼자 결정하기 전에 믿는 사람 한 명에게 의견을 물어보세요', '함께하는 운동·스터디 모임이 운을 키워요'],
  },
  겁재: {
    keyword: '경쟁 속 성장',
    core: '경쟁과 승부의 기운이 강한 때예요. 승부욕 덕분에 크게 성장할 수 있지만, 재물과 기회가 새어 나가기도 쉬워요.',
    good: ['승부욕이 동기가 되어 실력이 빠르게 늘어요', '어려운 일에 뛰어드는 배짱이 생겨요'],
    watch: ['충동적인 지출·투자로 손실이 나기 쉬워요', '가까운 사람과 돈 문제로 서운해질 수 있어요', '무리한 경쟁으로 지칠 수 있어요'],
    fields: {
      wealth: '지키는 것이 곧 버는 것이에요. 가계부와 고정 지출 점검이 가장 좋은 재테크예요.',
      love: '질투나 경쟁심이 끼어들기 쉬워요. 솔직한 대화가 오해를 막아 줘요.',
      career: '시험·공모전·경쟁 프로젝트처럼 승부가 있는 일에서 실력이 드러나요.',
      health: '스트레스가 몸으로 오기 쉬워요. 땀 흘리는 운동으로 풀어 주세요.',
      social: '라이벌이 생기지만, 좋은 라이벌은 성장의 엔진이 돼요.',
    },
    tips: ['큰돈이 오가는 결정은 하루 묵혀 두고 다시 보세요', '경쟁심을 운동이나 목표 달성으로 돌려 보세요'],
  },
  식신: {
    keyword: '재능 발휘와 여유',
    core: '재능과 표현력이 자연스럽게 흘러나오는 때예요. 마음의 여유가 생기고, 좋아하는 일을 할 때 복이 따라와요.',
    good: ['창작·요리·취미처럼 손으로 만드는 일이 잘 풀려요', '여유가 생겨 사람들이 편하게 다가와요', '꾸준히 하면 재능이 수입으로 이어져요'],
    watch: ['편안함에 젖어 게을러지기 쉬워요', '과식·과음으로 체중과 소화에 신경 써야 해요'],
    fields: {
      wealth: '재능이 돈이 되는 흐름이에요. 부업이나 작은 판매처럼 내가 만든 것으로 버는 기회를 잡아 보세요.',
      love: '편안하고 다정한 매력이 빛나요. 함께 맛있는 걸 먹는 데이트가 잘 맞아요.',
      career: '기획·콘텐츠·교육처럼 표현하는 일에서 좋은 평가를 받아요.',
      health: '대체로 무난하지만, 먹는 양을 조절하는 게 관건이에요.',
      social: '분위기를 편하게 만드는 사람으로 인기가 올라가요.',
    },
    tips: ['떠오른 아이디어를 바로 메모해 두세요', '배우고 싶던 취미 하나를 시작해 보세요'],
  },
  상관: {
    keyword: '표현력과 변화',
    core: '말과 아이디어가 날카롭게 빛나는 때예요. 틀을 깨는 힘이 생기지만, 그만큼 부딪힘도 생길 수 있어요.',
    good: ['남들이 못 본 문제를 짚어 내는 통찰이 생겨요', '발표·글쓰기·영업처럼 말로 하는 일에 강해져요', '새로운 방식을 시도할 용기가 생겨요'],
    watch: ['윗사람이나 규칙과 부딪히기 쉬워요', '말이 앞서 구설에 오를 수 있어요'],
    fields: {
      wealth: '아이디어로 버는 흐름이에요. 다만 즉흥적인 지출이 늘 수 있으니 예산을 정해 두세요.',
      love: '솔직함이 매력이지만 날카로운 한마디가 상처가 될 수 있어요. 칭찬을 먼저 건네세요.',
      career: '변화와 개선을 이끄는 역할에서 빛나요. 상사와는 근거를 갖고 차분하게 이야기하세요.',
      health: '신경이 예민해질 수 있어요. 충분한 잠이 최고의 보약이에요.',
      social: '재치로 사람을 끄는 때예요. 뒷말이 생기지 않게 말을 한 번 더 고르세요.',
    },
    tips: ['말하기 전에 세 번 숨 고르기', '불만은 개선안과 함께 제안하기'],
  },
  편재: {
    keyword: '활발한 재물 활동',
    core: '움직이는 만큼 기회와 재물이 따라오는 때예요. 새로운 사람·장소·일에서 뜻밖의 기회가 열려요.',
    good: ['활동 범위가 넓어지고 기회가 많아져요', '사업·영업·협상에서 수완이 좋아져요', '여행과 이동이 행운을 불러요'],
    watch: ['크게 벌이다 크게 잃을 수 있어요', '씀씀이가 커지니 지출 관리가 필요해요'],
    fields: {
      wealth: '돈의 흐름이 활발해요. 들어오는 기회는 잡되 큰 베팅은 피하고, 일부는 꼭 저축하세요.',
      love: '만남의 기회가 많아져요. 다양한 사람을 만나 보되 진심은 천천히 확인하세요.',
      career: '영업·사업·프로젝트 확장에 유리해요. 새 거래처나 판로를 찾아보세요.',
      health: '바쁘게 다니느라 끼니를 거르기 쉬워요. 규칙적인 식사를 챙기세요.',
      social: '인맥이 넓어져요. 새로 만난 사람 중에 귀한 인연이 있어요.',
    },
    tips: ['평소 안 가던 곳에 한 번 가 보기', '수입의 일부는 자동 저축으로 묶어 두기'],
  },
  정재: {
    keyword: '차곡차곡 쌓이는 재물',
    core: '성실함이 그대로 보상으로 돌아오는 때예요. 크게 튀기보다 차곡차곡 쌓을수록 결과가 좋아요.',
    good: ['계획한 일이 차근차근 이루어져요', '안정적인 수입과 저축이 늘어요', '신뢰를 얻어 책임 있는 자리를 맡게 돼요'],
    watch: ['지나치게 계산적으로 보일 수 있어요', '안정만 추구하다 기회를 놓칠 수 있어요'],
    fields: {
      wealth: '꾸준히 모으기 좋은 흐름이에요. 적금·정리·고정비 줄이기가 큰 열매가 돼요.',
      love: '안정적인 관계에 좋은 때예요. 결혼이나 약속처럼 관계를 단단히 하는 일에 길해요.',
      career: '맡은 일을 꼼꼼히 끝내면 인정받아요. 마감과 정산을 확실히 하세요.',
      health: '생활 리듬이 안정돼요. 좋은 습관을 만들기 딱 좋은 때예요.',
      social: '믿을 만한 사람이라는 평판이 쌓여요.',
    },
    tips: ['한 달 예산을 정하고 지켜 보기', '할 일 3가지를 정해 매일 끝내기'],
  },
  편관: {
    keyword: '도전과 책임',
    core: '압박과 책임이 몰려오지만, 버텨 낸 만큼 단단해지는 때예요. 시련을 지나며 리더십이 자라요.',
    good: ['위기 대처 능력과 결단력이 커져요', '어려운 일을 해내며 인정받을 기회가 와요', '규율이 생겨 나쁜 습관을 끊기 좋아요'],
    watch: ['과로와 스트레스로 몸이 지치기 쉬워요', '윗사람이나 조직의 압박이 커질 수 있어요', '사고·부상에 주의가 필요해요'],
    fields: {
      wealth: '예상 못 한 지출이 생기기 쉬워요. 비상금을 마련해 두면 마음이 편해요.',
      love: '책임감 있는 모습이 매력이 돼요. 바쁘다고 소홀해지지 않게 연락을 챙기세요.',
      career: '어려운 프로젝트·시험·승진 심사처럼 실력이 검증되는 자리가 와요. 원칙을 지키면 이겨 내요.',
      health: '무리하지 않는 게 핵심이에요. 정기 검진과 충분한 휴식을 챙기세요.',
      social: '나를 시험하는 사람이 있을 수 있어요. 감정보다 원칙으로 대하세요.',
    },
    tips: ['일정표에 쉬는 시간을 먼저 적어 두기', '하루 한 번 몸을 푸는 운동하기'],
  },
  정관: {
    keyword: '명예와 인정',
    core: '책임감과 신뢰가 빛나는 때예요. 노력이 공식적으로 인정받고, 명예와 자리가 따라와요.',
    good: ['승진·합격·자격 취득처럼 공식적인 성과가 기대돼요', '윗사람의 신뢰를 얻어요', '삶이 반듯하게 정리돼요'],
    watch: ['체면 때문에 무리한 약속을 할 수 있어요', '틀에 갇혀 답답함을 느낄 수 있어요'],
    fields: {
      wealth: '안정적인 수입 흐름이에요. 급여나 정기 수입이 늘 수 있어요.',
      love: '진지하고 바른 인연이 다가와요. 소개나 공식적인 만남에 길해요.',
      career: '면접·시험·계약·발표에 유리해요. 성실하게 준비한 만큼 결과가 나와요.',
      health: '대체로 안정적이에요. 바른 생활 습관이 그대로 건강이 돼요.',
      social: '신뢰받는 사람으로 자리 잡아요. 약속 시간만 잘 지켜도 운이 올라요.',
    },
    tips: ['약속 시간보다 10분 먼저 도착하기', '미뤄 둔 자격증이나 시험에 도전하기'],
  },
  편인: {
    keyword: '직감과 전문성',
    core: '직감과 영감이 날카로워지는 때예요. 남들과 다른 시각으로 깊이 파고들 때 전문성이 생겨요.',
    good: ['공부·연구·기술 습득에 몰입하기 좋아요', '남다른 아이디어와 통찰이 떠올라요', '혼자만의 시간이 큰 힘이 돼요'],
    watch: ['생각이 많아져 결정을 미루기 쉬워요', '의심이 늘고 기분이 오락가락할 수 있어요'],
    fields: {
      wealth: '돈보다 배움에 투자하는 때예요. 자격증과 기술이 나중에 수입으로 돌아와요.',
      love: '혼자 생각하는 시간이 늘어 무심해 보일 수 있어요. 마음을 말로 표현해 주세요.',
      career: '전문 분야를 깊게 파고들면 대체 불가능한 사람이 돼요.',
      health: '생각이 많아 잠을 설칠 수 있어요. 잠들기 전에는 휴대폰을 멀리하세요.',
      social: '깊은 대화를 나눌 소수의 사람과 가까워져요.',
    },
    tips: ['배우고 싶던 분야 하나를 정해 매일 30분씩', '결정에는 마감을 정해 두기'],
  },
  정인: {
    keyword: '배움과 귀인',
    core: '도움의 손길이 자연스럽게 들어오는 때예요. 배우고 받아들이는 자세가 그대로 복이 돼요.',
    good: ['윗사람·스승·귀인의 도움을 받아요', '공부·시험·자격 취득에 유리해요', '마음이 안정되고 회복력이 좋아져요'],
    watch: ['도움에 기대어 스스로 움직이지 않을 수 있어요', '편안함에 머물러 기회를 미룰 수 있어요'],
    fields: {
      wealth: '문서·계약과 관련된 이득이 생기기 쉬워요. 꼼꼼히 읽고 서명하세요.',
      love: '따뜻하게 챙겨 주는 인연이 다가와요. 고마움을 표현하면 관계가 깊어져요.',
      career: '공부한 만큼 결과가 나와요. 시험·자격증·교육 과정에 길해요.',
      health: '회복력이 좋은 때예요. 아팠던 곳을 돌보기 좋아요.',
      social: '멘토를 만나기 좋은 때예요. 먼저 조언을 구해 보세요.',
    },
    tips: ['도움을 준 사람에게 감사 메시지 보내기', '읽고 싶던 책 한 권 끝내기'],
  },
};

export const FIELD_LABEL = { wealth: '💰 재물', love: '💕 애정', career: '💼 직장·학업', health: '🌿 건강', social: '🤝 대인' };
const CONCERN_FIELD = { exam: 'career', job: 'career', business: 'career', change: 'career', wealth: 'wealth', love: 'love', marriage: 'love', health: 'health', people: 'social' };

/** 점수 → 전체 흐름 한 문장 */
export function toneLine(score) {
  if (score >= 65) return '흐름이 좋은 편이라 이 기운의 장점이 잘 살아나요.';
  if (score >= 50) return '무난한 흐름이라, 마음먹기에 따라 장점을 크게 키울 수 있어요.';
  return '부담이 있는 흐름이라, 장점은 살리고 조심할 점을 미리 챙기는 게 중요해요.';
}

/** 근거(parts) → 쉬운 해설 문장 */
export function partsStory(parts, saju) {
  const out = [];
  // 천간·지지가 같은 오행·같은 방향이면 한 문장으로 합친다
  const st = parts.find((p) => p.kind === 'stem'); const br = parts.find((p) => p.kind === 'branch');
  if (st && br && st.element === br.element && Math.sign(st.delta) === Math.sign(br.delta)) {
    const el = `${ELEMENT_HANJA[st.element]}(${ELEMENT_KO[st.element]})`;
    out.push(st.delta > 0
      ? `겉과 바탕 모두 ${el} 기운이에요. ${st.delta >= 10 ? '내게 꼭 필요한 기운(용신)이 겹으로 들어와 힘이 크게 실려요.' : '필요한 기운을 도와주는 기운이 겹으로 들어와 든든해요.'}`
      : `겉과 바탕 모두 ${el} 기운이에요. 내게 부담이 되는 기운(기신)이 겹으로 들어와, 속도를 줄이고 쉬어 가는 지혜가 필요해요.`);
    parts = parts.filter((p) => p !== st && p !== br);
  }
  for (const p of parts) {
    const el = p.element !== undefined ? `${ELEMENT_HANJA[p.element]}(${ELEMENT_KO[p.element]})` : '';
    if (p.kind === 'stem' || p.kind === 'branch') {
      const where = p.kind === 'stem' ? '겉으로 드러나는' : '바탕에 깔린';
      if (p.delta >= 10) out.push(`${where} ${el} 기운이 내게 꼭 필요한 기운(용신)이라 일이 술술 풀리는 힘이 돼요.`);
      else if (p.delta >= 5) out.push(`${where} ${el} 기운이 필요한 기운을 도와줘서 든든한 뒷받침이 돼요.`);
      else if (p.delta > 0) out.push(`${where} ${el} 기운이 조금씩 힘을 보태 줘요.`);
      else out.push(`${where} ${el} 기운은 내게 부담이 되는 기운(기신)이라 무리하지 않는 게 좋아요.`);
    }
    if (p.kind === 'combine') out.push('내 일지와 합(合)을 이뤄 손발이 맞는 사람·일이 찾아오기 쉬워요. 협력과 인연에 좋은 신호예요.');
    if (p.kind === 'clash') out.push('내 일지와 충(沖)이 생겨 이사·이직·관계 변화처럼 움직임이 생기기 쉬워요. 변화는 준비하면 기회가 돼요.');
  }
  if (!out.length && !parts.length && !st) out.push(`원국과 크게 돕거나 부딪히는 글자가 없어, 평소의 나답게 흐름을 이어 가는 때예요. 필요한 기운인 ${ELEMENT_HANJA[saju.yongsin]}(${ELEMENT_KO[saju.yongsin]})을 생활에서 채우면 좋아요.`);
  return out;
}

/** 기간에 맞춘 수호신 한마디 (닭띠는 존댓말) */
export function closingLine(kind, score, polite = false) {
  const when = kind === 'daewoon' ? '이 10년' : kind === 'year' ? '올해' : '이달';
  const lines = score >= 65
    ? [`${when}은 흐름이 좋아. 마음에 품은 일을 시작하기 좋은 때야.`, `${when}은 흐름이 좋아요. 마음에 품은 일을 시작하기 좋은 때예요.`]
    : score >= 50
      ? [`${when}은 무난해. 작은 습관 하나가 큰 차이를 만들 거야.`, `${when}은 무난해요. 작은 습관 하나가 큰 차이를 만들 거예요.`]
      : [`${when}은 쉬어 가며 다지는 때야. 내가 옆에서 같이 챙길게.`, `${when}은 쉬어 가며 다지는 때예요. 제가 옆에서 같이 챙길게요.`];
  return lines[polite ? 1 : 0];
}

/**
 * 기간 하나의 풀이
 * @param kind 'daewoon' | 'year' | 'month'
 * @param layer period.js 층 {pillar, base, score, parts, god}
 * @param ctx {saju, concern, range(문자열), highlights([문자열])}
 */
export function buildReading(kind, layer, ctx) {
  const { saju } = ctx;
  const god = layer.god || tenGod(saju.dayMaster, layer.pillar.stem);
  const R = GOD_READING[god];
  const innerGod = tenGod(saju.dayMaster, BRANCH_MAIN_STEM[layer.pillar.branch]);
  const I = GOD_READING[innerGod];
  const when = ctx.when || (kind === 'daewoon' ? '이 10년은' : kind === 'year' ? '올해는' : '이달은');
  const score = layer.score;
  const focus = CONCERN_FIELD[ctx.concern] || null;
  const intro = [
    `${when} 「${god} · ${R.keyword}」의 기운이 중심이에요. ${R.core}`,
    innerGod === god
      ? `겉과 속이 같은 ${god} 기운이라 이 성격이 더 또렷하게 드러나요.`
      : `속에는 「${innerGod} · ${I.keyword}」의 기운이 함께 흘러요. ${I.core.split('. ')[0]}.`,
    stageLine(saju.dayMaster, layer.pillar.branch, god, when).text,
    `점수는 ${score}점. ${toneLine(score)}`,
  ];
  const good = score >= 50 ? R.good : R.good.slice(0, 2);
  const watch = score < 50 ? [...R.watch, ...I.watch.slice(0, 1)] : R.watch;
  return {
    kind, god, innerGod, keyword: R.keyword, score, base: layer.base, pillar: layer.pillar,
    range: ctx.range || '', intro, why: partsStory(layer.parts || [], saju),
    good, watch, fields: R.fields, focus, focusLine: focus ? R.fields[focus] : null,
    tips: [...R.tips, I.tips[0]].filter((x, i, a) => a.indexOf(x) === i).slice(0, 3),
    highlights: ctx.highlights || [],
    element: { stem: STEM_ELEMENT[layer.pillar.stem], branch: BRANCH_ELEMENT[layer.pillar.branch] },
  };
}
