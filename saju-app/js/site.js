// v0.65 웹 출시 설정 — 사업자 정보와 결제 설정은 이 파일 한 곳에서만 고친다.
// · 바닥글(index.html), 약관·처리방침·환불 규정·상품 안내(legal/*.html)가 모두 여기 값을 읽어 채운다.
// · 빈 값은 화면에 「(등록 예정)」으로 보인다. 출시 전 점검: `node tools/launch_check.mjs`
// · 비밀 키(토스페이먼츠 시크릿 키)는 절대 여기 적지 않는다 → 호스팅의 환경 변수 TOSS_SECRET_KEY (docs/web-launch.md)

export const BIZ = {
  name: '',          // 상호 (사업자등록증 그대로)
  owner: '',         // 대표자 이름
  regNo: '',         // 사업자등록번호 000-00-00000
  mailOrderNo: '',   // 통신판매업 신고번호 (신고 전에는 빈 값 → 「신고 진행 중」)
  address: '',       // 사업장 주소
  phone: '',         // 고객센터 전화번호
  email: '',         // 고객센터 이메일
  privacyOfficer: '',// 개인정보 보호책임자 (비우면 대표자)
  domain: '',        // 정식 주소 (예: https://example.kr, 끝에 / 없이)
  hours: '평일 10:00~17:00 (이메일은 24시간 접수)',
};

export const SERVICE = { name: '12지신 강림', effective: '2026-11-11' }; // 약관·처리방침 시행일

export const PAY = {
  // 토스페이먼츠 「API 개별 연동 키」의 클라이언트 키(test_ck_… 또는 live_ck_…). 공개되어도 되는 키.
  // 비어 있으면 체험판(결제 없이 만들어짐). test_ 키면 시험 결제, live_ 키면 실제 결제.
  tossClientKey: '',
  confirmUrl: '/api/pay/confirm', // 결제 승인 함수 (functions/api/pay/confirm.js)
  sdk: 'https://js.tosspayments.com/v2/standard',
};

export const payMode = (p = PAY) => (!p.tossClientKey ? 'trial' : p.tossClientKey.startsWith('test_') ? 'test' : 'live');

const EMPTY = '(등록 예정)';
/** 화면에 보일 값 — 빈 값은 「(등록 예정)」, 통신판매업 신고번호는 「신고 진행 중」 */
export function bizValue(key, biz = BIZ) {
  if (key === 'service') return SERVICE.name;
  if (key === 'effective') { const [y, m, d] = SERVICE.effective.split('-').map(Number); return `${y}년 ${m}월 ${d}일`; }
  if (key === 'privacyOfficer') return biz.privacyOfficer || biz.owner || EMPTY;
  if (key === 'mailOrderNo') return biz.mailOrderNo || '신고 진행 중';
  return biz[key] || EMPTY;
}
/** 출시 전에 채워야 하는 빈 항목 이름 */
export function missingBiz(biz = BIZ) {
  const need = { name: '상호', owner: '대표자', regNo: '사업자등록번호', mailOrderNo: '통신판매업 신고번호', address: '사업장 주소', phone: '고객센터 전화번호', email: '고객센터 이메일', domain: '정식 주소(도메인)' };
  return Object.entries(need).filter(([k]) => !String(biz[k] || '').trim()).map(([, v]) => v);
}
/** 문서 안의 [data-biz="키"] 칸을 채운다. 이메일·전화는 링크로 */
export function fillBiz(root = document, biz = BIZ) {
  root.querySelectorAll('[data-biz]').forEach((el) => {
    const k = el.dataset.biz; const v = bizValue(k, biz);
    el.textContent = v;
    if (el.tagName === 'A' && biz[k]) el.setAttribute('href', k === 'email' ? `mailto:${v}` : k === 'phone' ? `tel:${v.replace(/[^0-9+]/g, '')}` : el.getAttribute('href') || '#');
  });
}
