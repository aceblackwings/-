// 첫 7일(v0.26): 날마다 기능 하나씩 소개 + 첫 주에는 게임 용어(EXP·Lv.)를 쉬운 말로
// 순수 로직만 둔다(테스트: tests/firstweek.test.mjs). 저장 키: unmyeong2099.firstweek = {start, seen:[일차]}
export const FIRST_WEEK_DAYS = 7;
export const VETERAN_EXP = 300; // 이 기능 전에 이미 많이 쓴 사람은 첫 주로 보지 않음

/** 날마다 소개할 기능 (go = 이동할 탭) */
export const INTRO_DAYS = [
  { day: 1, icon: '☀️', title: '오늘 운세 읽는 법', desc: '점수 아래 「왜 ○점인가요?」를 누르면 어떤 기운 때문에 그런 점수가 나왔는지 쉬운 말로 보여 드려요.', btn: '근거 보러 가기', go: 'today-why' },
  { day: 2, icon: '📒', title: '기록함과 「어제 운세 맞았나요?」', desc: '본 운세는 자동으로 기록돼요. 다음 날 맞았는지 한 번만 눌러 주면, 내 운세가 얼마나 맞는지 쌓여 가요.', btn: '기록함 열기', go: 'records' },
  { day: 3, icon: '🔮', title: '궁금한 것만 골라 보기', desc: '돈·연애·시험처럼 궁금한 것을 고르면 수호신이 점수와 이유, 해 볼 일 하나를 알려 드려요.', btn: '질문 메뉴 열기', go: 'ask' },
  { day: 4, icon: '🃏', title: '12지신 신수 카드', desc: '고민을 떠올리고 카드 한 장 또는 세 장을 뽑아 보세요. 결과는 기록함에 저장돼요.', btn: '카드 뽑으러 가기', go: 'cards' },
  { day: 5, icon: '💬', title: '수호신과 이야기하기', desc: '오늘 있었던 일이나 걱정을 편하게 말해 보세요. 수호신이 기억해 두었다가 다음에 안부를 물어요.', btn: '상담 열기', go: 'chat' },
  { day: 6, icon: '💞', title: '궁합과 친구', desc: '가족·친구와 궁합을 보고, 서로의 수호신끼리 대화하는 모습도 볼 수 있어요.', btn: '궁합 보러 가기', go: 'compat' },
  { day: 7, icon: '🐉', title: '수호신 키우기', desc: '매일 운세를 보고 미션을 할수록 수호신이 자라요. 내일부터는 레벨과 경험치도 숫자로 보여 드릴게요.', btn: '내 수호신 보기', go: 'hero' },
];

export const emptyFirstWeek = () => ({ start: null, seen: [] });
const dn = (k) => { const [y, m, d] = k.split('-').map(Number); return Math.floor(Date.UTC(y, m - 1, d) / 86400000); };

/** 처음 들어온 날 기록 (이미 많이 쓴 사람은 첫 주를 건너뜀) */
export function ensureStart(fw, todayKey, exp = 0) {
  const f = fw || emptyFirstWeek();
  if (f.start) return f;
  return { ...f, start: exp >= VETERAN_EXP ? '2000-1-1' : todayKey };
}

/** 오늘이 몇 일차인지 (1부터) */
export const dayIndex = (fw, todayKey) => (fw?.start ? dn(todayKey) - dn(fw.start) + 1 : 1);
export const inFirstWeek = (fw, todayKey) => { if (!fw?.start) return false; const n = dayIndex(fw, todayKey); return n >= 1 && n <= FIRST_WEEK_DAYS; };

/** 오늘 보여 줄 소개 (첫 주이고 오늘 것을 아직 안 봤을 때) */
export function todayIntro(fw, todayKey) {
  if (!fw?.start || !inFirstWeek(fw, todayKey)) return null;
  const n = dayIndex(fw, todayKey);
  if ((fw.seen || []).includes(n)) return null;
  return INTRO_DAYS[n - 1];
}

export function markSeen(fw, todayKey) {
  if (!fw?.start) return fw || emptyFirstWeek();
  const n = dayIndex(fw, todayKey);
  return (fw.seen || []).includes(n) ? fw : { ...fw, seen: [...(fw.seen || []), n] };
}

/** 첫 주에는 게임 용어를 쉬운 말로: EXP → 성장 점수, Lv.N → 성장 N, 레벨 업 → 한 뼘 성장 */
export function plainTerms(text) {
  return String(text)
    .replace(/레벨 업!\s*Lv\.(\d+)/g, '한 뼘 더 자랐어요! 성장 $1')
    .replace(/Lv\.\s?(\d+)/g, '성장 $1')
    .replace(/\bEXP\b/g, '성장 점수');
}
export const hasGameTerms = (text) => /\bEXP\b|Lv\.\s?\d/.test(text);
