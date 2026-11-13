// v0.66.4 Cloudflare Workers 진입점: 결제 승인(POST /api/pay/confirm)만 처리하고, 나머지는 정적 파일(saju-app/)로 넘긴다.
// · 비밀 키 = 환경 변수 TOSS_SECRET_KEY (Cloudflare 화면 「변수 및 비밀」). 저장소·화면 코드에 적지 않는다.
// · 금액은 주문 번호의 상품 종류로 가격표에서 다시 계산(saju-app/js/pay.js confirmPayment). 아무것도 저장하지 않는다.
// · Pages 방식으로 올릴 때는 같은 일을 saju-app/functions/api/pay/confirm.js 가 한다.
import { confirmPayment } from '../saju-app/js/pay.js';

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export async function handlePay(request, env, fetchImpl = fetch) {
  if (request.method !== 'POST') return json(405, { ok: false, code: 'METHOD', message: 'POST만 받아요.' });
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json(403, { ok: false, code: 'BAD_ORIGIN', message: '다른 곳에서 온 요청이에요.' });
  let input;
  try { input = await request.json(); } catch { return json(400, { ok: false, code: 'BAD_BODY', message: '요청을 읽지 못했어요.' }); }
  const r = await confirmPayment(input, env.TOSS_SECRET_KEY, fetchImpl);
  return json(r.status, r.body);
}

// v0.73.1 결제창(특히 카카오페이)이 successUrl·failUrl로 돌아올 때 POST로 오면 정적 파일은 405를 낸다.
// → 페이지 주소로 온 POST는 본문(폼 값)을 주소 뒤 ?값으로 옮겨 GET으로 다시 보낸다(303). 이미 주소에 있는 값이 우선.
export async function postToGet(request) {
  const url = new URL(request.url);
  try {
    const type = request.headers.get('Content-Type') || '';
    if (/application\/x-www-form-urlencoded|multipart\/form-data/i.test(type)) {
      const form = await request.formData();
      for (const [k, v] of form) if (typeof v === 'string' && !url.searchParams.has(k)) url.searchParams.set(k, v.slice(0, 500));
    } else if (/json/i.test(type)) {
      const data = await request.json();
      if (data && typeof data === 'object') for (const [k, v] of Object.entries(data)) if (['string', 'number'].includes(typeof v) && !url.searchParams.has(k)) url.searchParams.set(k, String(v).slice(0, 500));
    }
  } catch { /* 본문을 못 읽어도 주소만으로 돌려보냄 */ }
  return new Response(null, { status: 303, headers: { Location: url.pathname + url.search, 'Cache-Control': 'no-store' } });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/pay/confirm') return handlePay(request, env);
    if (pathname.startsWith('/api/')) return json(404, { ok: false, code: 'NOT_FOUND', message: '없는 주소예요.' });
    if (request.method !== 'GET' && request.method !== 'HEAD') return postToGet(request);
    return env.ASSETS.fetch(request);
  },
};
