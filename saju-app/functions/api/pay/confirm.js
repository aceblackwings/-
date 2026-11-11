// v0.65 결제 승인 함수 (Cloudflare Pages Functions: POST /api/pay/confirm)
// · 비밀 키는 호스팅 환경 변수 TOSS_SECRET_KEY 에만 둔다(저장소·화면 코드에 적지 않음). 설정 방법: docs/web-launch.md
// · 금액은 주문 번호의 상품 종류로 가격표에서 다시 계산한다(화면에서 보낸 금액을 믿지 않음) — js/pay.js confirmPayment
// · 받는 값: paymentKey · orderId · amount 뿐. 생년월일·소원 글은 오지 않고, 이 함수는 아무것도 저장하지 않는다.
import { confirmPayment } from '../../../js/pay.js';

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json(403, { ok: false, code: 'BAD_ORIGIN', message: '다른 곳에서 온 요청이에요.' });
  let input;
  try { input = await request.json(); } catch { return json(400, { ok: false, code: 'BAD_BODY', message: '요청을 읽지 못했어요.' }); }
  const r = await confirmPayment(input, env.TOSS_SECRET_KEY, fetch);
  return json(r.status, r.body);
}
export const onRequest = () => json(405, { ok: false, code: 'METHOD', message: 'POST만 받아요.' });
