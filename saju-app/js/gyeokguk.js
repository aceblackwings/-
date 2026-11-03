// 격국(v0.36, 로드맵 E3): 태어난 달(월지)에 숨은 천간 중 드러난 것으로 「타고난 그릇」을 정하고, 강점 풀이와 강점 미션을 준다.
// 자평진전 기본 규칙: 월지 본기가 천간에 드러나면 그 십신 → 아니면 중기·여기 중 드러난 것 → 아무것도 없으면 본기.
// 월지가 나와 같은 기운(비견·겁재)이면 건록격·양인격(음간은 월겁격). 종격·화격 같은 특수격은 다루지 않고 안내만.
// 순수 로직만(테스트: tests/gyeokguk.test.mjs)
import { tenGod } from './saju.js';
import { HIDDEN_STEMS } from './expert.js';

const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';
// 일간별 녹(건록) 자리, 양간의 양인 자리
const ROK = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];
const YANGIN = { 0: 3, 2: 6, 4: 6, 6: 9, 8: 0 };
const FROM = ['여기', '중기', '본기'];

/** 십신 → 격국 이름 */
const GOD_GYEOK = { 정관: '정관격', 편관: '편관격', 정재: '정재격', 편재: '편재격', 식신: '식신격', 상관: '상관격', 정인: '정인격', 편인: '편인격' };
const isBigeop = (g) => g === '비견' || g === '겁재';

/**
 * 격국 판정. saju = computeSaju 결과
 * @returns { name, god, stem, from('본기'|'중기'|'여기'|'녹'|'양인'), exposed, quality('good'|'care'|'plain'), note, check }
 */
export function analyzeGyeok(saju) {
  const ds = saju.pillars.day.stem; const mb = saju.pillars.month.branch;
  const exposedStems = ['year', 'month', 'hour'].map((k) => saju.pillars[k]?.stem).filter((x) => x != null);
  const hidden = HIDDEN_STEMS[mb]; // [여기, (중기), 본기]
  const main = hidden[hidden.length - 1];
  const mainGod = tenGod(ds, main);
  const fromOf = (i) => (hidden.length === 2 ? (i === 0 ? '여기' : '본기') : FROM[i]);

  let pick = null;
  if (isBigeop(mainGod)) {
    if (ROK[ds] === mb) pick = { name: '건록격', god: '비견', stem: main, from: '녹' };
    else if (YANGIN[ds] === mb) pick = { name: '양인격', god: '겁재', stem: main, from: '양인' };
    else {
      // 辰·戌·丑·未처럼 본기만 나와 같은 기운이면, 드러난 다른 글자로 격을 잡음
      const other = [...hidden].reverse().find((h) => !isBigeop(tenGod(ds, h)) && exposedStems.includes(h));
      if (other != null) pick = { name: GOD_GYEOK[tenGod(ds, other)], god: tenGod(ds, other), stem: other, from: fromOf(hidden.indexOf(other)), exposed: true };
      else pick = { name: mainGod === '비견' ? '건록격' : (ds % 2 === 0 ? '양인격' : '월겁격'), god: mainGod, stem: main, from: '본기' };
    }
    pick.exposed = pick.exposed ?? exposedStems.some((s) => isBigeop(tenGod(ds, s)));
  } else if (exposedStems.includes(main)) {
    pick = { name: GOD_GYEOK[mainGod], god: mainGod, stem: main, from: '본기', exposed: true };
  } else {
    const other = [...hidden].reverse().slice(1).find((h) => exposedStems.includes(h) && !isBigeop(tenGod(ds, h)));
    pick = other != null
      ? { name: GOD_GYEOK[tenGod(ds, other)], god: tenGod(ds, other), stem: other, from: fromOf(hidden.indexOf(other)), exposed: true }
      : { name: GOD_GYEOK[mainGod], god: mainGod, stem: main, from: '본기', exposed: false };
  }
  const check = qualityOf(pick, exposedStems.map((s) => tenGod(ds, s)));
  return { ...pick, ...check, monthBranch: BRANCHES[mb], stemHanja: STEMS[pick.stem], basisText: basisText(pick, mb) };
}

const hasBatchim = (w) => { const c = w.charCodeAt(w.length - 1) - 0xac00; return c >= 0 && c <= 11171 && c % 28 !== 0; };
const ig = (w) => (hasBatchim(w) ? '이' : '가');
const eul = (w) => (hasBatchim(w) ? '을' : '를');

function basisText(p, mb) {
  const b = `태어난 달(${BRANCHES[mb]})이`;
  if (p.from === '녹') return `${b} 일간의 녹(스스로 서는 자리)이라 ${p.name}이에요.`;
  if (p.from === '양인') return `${b} 일간의 양인(가장 왕성한 자리)이라 ${p.name}이에요.`;
  const lead = `태어난 달(${BRANCHES[mb]}) 속 ${p.from} ${STEMS[p.stem]}(${p.god})`;
  return p.exposed && !['건록격', '양인격', '월겁격'].includes(p.name)
    ? `${lead}${ig(p.god)} 천간에 드러나 ${p.name}이에요.`
    : `${lead}${eul(p.god)} 중심으로 보아 ${p.name}이에요.`;
}

/** 격이 잘 짜였는지(성격) 다듬을 점이 있는지 — 드러난 천간의 십신만으로 간단히. 경고가 아니라 「~면 더 좋아요」로 */
export function qualityOf(p, gods) {
  const has = (...g) => gods.some((x) => g.includes(x));
  const n = (...g) => gods.filter((x) => g.includes(x)).length;
  switch (p.name) {
    case '정관격':
      if (has('상관') && !has('정인', '편인')) return { quality: 'care', check: '상관견관', note: '말과 재능이 규칙과 부딪치기 쉬운 구조예요. 하고 싶은 말을 한 번 정리해서 전하면 신뢰가 오히려 커져요.' };
      if (has('편관')) return { quality: 'care', check: '관살혼잡', note: '맡은 역할이 여러 갈래로 나뉘기 쉬워요. 우선순위 하나를 정해 두면 힘이 모여요.' };
      if (has('정재', '편재', '정인', '편인')) return { quality: 'good', check: '재관·관인', note: '규칙을 돕는 기운(재물·배움)이 곁에 있어 인정받는 그릇이 잘 짜여 있어요.' };
      break;
    case '편관격':
      if (has('식신')) return { quality: 'good', check: '식신제살', note: '강한 압박을 재능으로 다스리는 구조예요. 어려운 일일수록 실력이 드러나요.' };
      if (has('정인', '편인')) return { quality: 'good', check: '살인상생', note: '압박을 배움으로 바꾸는 구조예요. 공부·자격이 큰 무기가 돼요.' };
      return { quality: 'care', check: '제살 필요', note: '센 기운을 다스릴 도구가 있으면 더 좋아요. 체력 관리와 기술 하나가 든든한 방패가 돼요.' };
    case '정재격': case '편재격':
      if (n('비견', '겁재') >= 2 && !has('식신', '상관', '정관', '편관')) return { quality: 'care', check: '군겁쟁재', note: '함께하는 사람이 많아 몫이 나뉘기 쉬워요. 돈 관리 규칙을 먼저 정해 두면 결실이 지켜져요.' };
      if (has('식신', '상관', '정관', '편관')) return { quality: 'good', check: '식상생재·재생관', note: '재능이 결실로 이어지는 길이 열려 있는 그릇이에요.' };
      break;
    case '식신격':
      if (has('편인') && !has('편재', '정재')) return { quality: 'care', check: '효신탈식', note: '생각이 많아 실행이 늦어질 수 있어요. 작게라도 먼저 만들어 보면 재능이 살아나요.' };
      if (has('편재', '정재')) return { quality: 'good', check: '식신생재', note: '좋아하는 일이 재물로 이어지는 구조예요.' };
      break;
    case '상관격':
      if (has('정관') && !has('정인', '편인')) return { quality: 'care', check: '상관견관', note: '날카로운 표현이 윗사람과 부딪치기 쉬워요. 부드러운 말 한마디를 먼저 고르면 재능이 빛나요.' };
      if (has('정재', '편재', '정인', '편인')) return { quality: 'good', check: '상관생재·상관패인', note: '재능을 결실이나 깊이로 바꾸는 길이 열려 있어요.' };
      break;
    case '정인격': case '편인격':
      if (has('정재', '편재') && !has('정관', '편관')) return { quality: 'care', check: '재극인', note: '배움과 현실 일이 서로 시간을 다투기 쉬워요. 공부 시간을 따로 떼어 두면 둘 다 지킬 수 있어요.' };
      if (has('정관', '편관')) return { quality: 'good', check: '관인상생', note: '배움이 자리와 인정으로 이어지는 그릇이에요.' };
      break;
    default: // 건록·양인·월겁
      if (has('정관', '편관')) return { quality: 'good', check: '녹·인 용관', note: '넘치는 힘을 규칙과 책임으로 다듬어 쓰는 그릇이에요.' };
      if (has('식신', '상관', '정재', '편재')) return { quality: 'good', check: '녹·인 용재·식상', note: '스스로 일어선 힘을 재능과 결실로 바꾸는 그릇이에요.' };
      return { quality: 'care', check: '힘 쓸 곳 필요', note: '힘이 넘치는데 쓸 곳이 정해지지 않으면 답답할 수 있어요. 목표 하나를 정해 꾸준히 쓰면 크게 자라요.' };
  }
  return { quality: 'plain', check: '기본', note: '격의 기본 성질이 그대로 드러나는 사주예요.' };
}

/** 격국별 타고난 그릇·강점·일하는 방식·다듬을 점·강점 미션(5분 이내) */
export const GYEOK_PROFILE = {
  정관격: { title: '원칙과 신뢰의 사람', strengths: ['약속을 지키는 신뢰', '조직 안에서 인정받는 성실함', '공정하게 판단하는 균형 감각'], work: '정해진 틀 안에서 차근차근 쌓아 올릴 때 가장 빛나요. 공직·관리·조직 생활과 잘 맞아요.', care: '완벽하게 하려다 시작이 늦어지면, 80%에서 먼저 내보내 보세요.', missions: ['오늘 지킬 약속 하나를 메모에 적기', '미뤄 둔 서류 하나 정리하기', '고마운 사람에게 짧은 감사 인사 보내기'] },
  편관격: { title: '도전을 이겨 내는 사람', strengths: ['압박 속에서 더 강해지는 추진력', '어려운 일을 맡는 용기', '위기 때 앞장서는 리더십'], work: '경쟁이 있고 결과가 분명한 일에서 실력이 드러나요. 현장·운동·보안·창업과 잘 맞아요.', care: '혼자 다 짊어지려 하면, 오늘 하나는 남에게 부탁해 보세요.', missions: ['5분 스트레칭이나 빠르게 걷기', '오늘 가장 어려운 일 하나를 첫 순서로 적기', '도움받을 사람 한 명 떠올려 연락하기'] },
  정재격: { title: '차곡차곡 쌓는 사람', strengths: ['꼼꼼한 관리 능력', '꾸준히 모으는 끈기', '현실을 보는 안정감'], work: '계획을 세우고 숫자로 관리하는 일에서 강해요. 재무·운영·사무·살림과 잘 맞아요.', care: '안전만 고르다 기회를 놓칠 것 같으면, 작은 시도 하나는 해 보세요.', missions: ['오늘 쓴 돈 세 줄 적기', '자동 저축이나 구독 하나 점검하기', '지갑·책상 한 칸 정리하기'] },
  편재격: { title: '판을 크게 보는 사람', strengths: ['기회를 알아보는 눈', '사람과 돈을 움직이는 수완', '시원시원한 실행력'], work: '사람을 만나고 흐름을 읽는 일에서 빛나요. 영업·사업·유통·기획과 잘 맞아요.', care: '여러 일을 동시에 벌일 때는, 오늘 마무리할 것 하나를 먼저 정하세요.', missions: ['연락 못 한 사람 한 명에게 안부 보내기', '이번 주 기회 하나를 메모하기', '벌여 둔 일 하나 마무리하기'] },
  식신격: { title: '즐겁게 만들어 내는 사람', strengths: ['좋아하는 일을 꾸준히 하는 힘', '주변을 편하게 하는 여유', '손으로 만들어 내는 재능'], work: '즐기면서 결과물을 만들 때 가장 잘해요. 요리·교육·콘텐츠·서비스와 잘 맞아요.', care: '편한 것만 고르게 될 때는, 작은 목표 하나를 숫자로 정해 보세요.', missions: ['좋아하는 것 하나를 10분 만들어 보기', '맛있는 한 끼를 정성껏 차리기', '오늘 즐거웠던 일 한 줄 적기'] },
  상관격: { title: '톡톡 튀는 표현의 사람', strengths: ['남다른 아이디어', '말과 글의 표현력', '틀을 바꾸는 창의력'], work: '새로운 것을 만들고 드러내는 일에서 빛나요. 예술·디자인·방송·글쓰기·기술 개발과 잘 맞아요.', care: '말이 날카롭게 나갈 것 같으면, 한 번 쉬고 부드러운 단어를 골라 보세요.', missions: ['떠오른 아이디어 세 줄 적기', '칭찬 한마디를 먼저 건네기', '짧은 글이나 사진 하나 올려 보기'] },
  정인격: { title: '배우고 품어 주는 사람', strengths: ['깊이 배우는 힘', '사람을 품는 따뜻함', '믿음을 주는 성품'], work: '배우고 가르치고 돌보는 일에서 강해요. 교육·연구·상담·의료·문서 일과 잘 맞아요.', care: '생각이 길어져 실행이 늦을 때는, 오늘 할 일 하나만 바로 해 보세요.', missions: ['책 한 쪽 읽고 한 줄 남기기', '가족에게 안부 전화하기', '배우고 싶은 것 하나 검색해 저장하기'] },
  편인격: { title: '남다르게 꿰뚫는 사람', strengths: ['남들이 못 보는 것을 보는 직관', '전문 분야를 깊이 파는 집중력', '독창적인 해결법'], work: '전문 기술이나 특별한 분야를 깊이 팔 때 빛나요. 연구·기술·의료·종교·예술과 잘 맞아요.', care: '혼자만의 생각에 오래 머물 때는, 한 사람에게 이야기해 보세요.', missions: ['관심 분야 자료 하나 10분 읽기', '떠오른 생각을 한 사람에게 말해 보기', '잠들기 전 5분 조용히 정리하기'] },
  건록격: { title: '스스로 일어서는 사람', strengths: ['자기 힘으로 서는 자립심', '꾸준한 체력과 근성', '맡은 일을 끝까지 하는 책임감'], work: '자기 이름을 걸고 하는 일에서 강해요. 전문직·자영업·기술직과 잘 맞아요.', care: '모든 걸 혼자 하려 할 때는, 함께할 사람 한 명을 찾아보세요.', missions: ['오늘 목표 하나를 숫자로 정하기', '10분 몸 쓰는 일 하기', '도와준 사람에게 고마움 전하기'] },
  양인격: { title: '강한 힘으로 밀고 나가는 사람', strengths: ['물러서지 않는 결단력', '위기를 돌파하는 힘', '경쟁에서 이기는 승부욕'], work: '분명한 목표와 경쟁이 있는 일에서 강해요. 운동·군경·의료·현장 지휘와 잘 맞아요.', care: '힘이 앞설 때는, 결정 전에 숨 한 번 고르고 상대 말을 끝까지 들어 보세요.', missions: ['땀 흘리는 운동 10분', '오늘 이길 작은 목표 하나 정하기', '결정 전 숨 세 번 고르기 연습'] },
  월겁격: { title: '함께 겨루며 크는 사람', strengths: ['동료와 함께할 때 커지는 힘', '지지 않는 끈기', '사람을 모으는 친화력'], work: '팀으로 경쟁하는 일에서 빛나요. 영업·운동·모임·협업 프로젝트와 잘 맞아요.', care: '남과 비교가 커질 때는, 어제의 나와만 비교해 보세요.', missions: ['함께하는 사람에게 응원 한마디 보내기', '어제보다 나아진 점 하나 적기', '팀 일 하나 먼저 챙기기'] },
};

/** 격국 강점 미션 하나 (날짜로 돌아가며, 같은 날은 같은 미션) */
export function strengthMission(gyeok, dateKey) {
  const p = GYEOK_PROFILE[gyeok.name]; if (!p) return null;
  let h = 0; for (const c of String(dateKey)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return p.missions[h % p.missions.length];
}

/** 화면용 한 문단 요약 */
export function gyeokSummary(g) {
  const p = GYEOK_PROFILE[g.name];
  return `${g.name} · ${p.title}. ${p.strengths.slice(0, 2).join(', ')}이 타고난 강점이에요. ${g.note}`;
}
