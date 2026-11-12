// v0.65 웹 결제(토스페이먼츠) — 순수 로직만. 화면은 app.js `openCharmPay`·`resumePay`, 승인은 functions/api/pay/confirm.js
// 흐름: 인장을 꾹 → 결제 창 → 주문 만들기(makeOrder, 기기에 「기다리는 주문」 저장) → 토스 결제창(다른 주소로 다녀옴)
//   → 돌아오면 parseReturn·checkReturn → 승인 함수가 금액을 다시 확인하고 토스에 승인 요청 → 성공하면 부적 저장 + 인장
// 원칙: 금액은 주문 번호의 상품 종류로 서버가 다시 계산(verifyOrder). 승인하지 않은 결제는 토스가 자동 취소해 돈이 나가지 않음.
// 소원 글·이름은 서버로 보내지 않는다(주문 이름은 상품 이름만). 테스트 tests/pay.test.mjs
import { CHARM_PRICE } from './tteok.js';
import { LANTERN_PRICE } from './lantern.js';

export const PAY_PRODUCTS = {
  wish: { price: CHARM_PRICE, name: '소원 부적', desc: '내 이름과 띠 지신 인장이 찍힌 금박 소원 부적 한 장. 정한 날에 지신이 먼저 물어봐요.' },
  lantern: { price: LANTERN_PRICE, name: '100일 소원 등불', desc: '100일 동안 날마다 밝아지는 소원 등불. 매일 한 줄 기도와 지신의 편지 3통.' },
};
export const PENDING_KEY = 'unmyeong2099.payorder';
export const PENDING_MAX_MS = 24 * 60 * 60 * 1000; // 하루 지난 주문은 버림
const ID_RE = /^z12-(wish|lantern)-[a-z0-9]{6,12}-[a-z0-9]{6,16}$/;

/** 주문 번호: z12-종류-시각-무작위 (토스 규칙: 영문·숫자·-·_ 6~64자) */
export function makeOrderId(kind, now = Date.now(), rand = Math.random) {
  if (!PAY_PRODUCTS[kind]) return null;
  let r = ''; while (r.length < 10) r += Math.floor(rand() * 36).toString(36);
  return `z12-${kind}-${now.toString(36)}-${r.slice(0, 10)}`;
}
export const kindOfOrder = (orderId) => (ID_RE.exec(String(orderId || '')) || [])[1] || null;

/** 주문 번호와 금액이 가격표와 맞는지 — 기기와 서버가 같은 함수를 씀 */
export function verifyOrder(orderId, amount) {
  const kind = kindOfOrder(orderId);
  if (!kind) return { ok: false, code: 'BAD_ORDER', message: '주문 번호를 확인할 수 없어요.' };
  if (Number(amount) !== PAY_PRODUCTS[kind].price) return { ok: false, code: 'BAD_AMOUNT', message: '결제 금액이 상품 가격과 달라요.' };
  return { ok: true, kind, amount: PAY_PRODUCTS[kind].price, name: PAY_PRODUCTS[kind].name };
}

/** 기다리는 주문(기기에 저장): 결제창에 다녀와도 만들던 부적을 이어서 완성하려고 기록 rec를 함께 둔다 */
export function makeOrder(kind, rec, now = Date.now(), rand = Math.random) {
  const orderId = makeOrderId(kind, now, rand); if (!orderId) return null;
  return { orderId, kind, amount: PAY_PRODUCTS[kind].price, name: PAY_PRODUCTS[kind].name, rec, at: now, paymentKey: null };
}
export const pendingAlive = (p, now = Date.now()) => !!(p && p.orderId && p.rec && now - (p.at || 0) < PENDING_MAX_MS);

/** v0.72 간편결제 바로가기(결제창(구버전) 자체창: card.flowMode 'DIRECT' + easyPay 코드 — 토스 SDK 문서 「간편결제사 코드」).
 *  통합결제창(DEFAULT)은 easyPay를 무시해 순서를 정할 수 없어서, 우리 결제 창에 버튼을 둔다.
 *  순서(사용자 결정 2026-11-12, 2025 이용 조사 참고): 네이버페이 → 카카오페이 → 삼성페이(아이폰은 애플페이) → 토스페이 */
export const EASY_PAYS = {
  NAVERPAY: { label: '네이버페이' },
  KAKAOPAY: { label: '카카오페이' },
  SAMSUNGPAY: { label: '삼성페이' },
  APPLEPAY: { label: '애플페이' },
  TOSSPAY: { label: '토스페이' },
};
export const isAppleDevice = (ua = '', touch = 0) => /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && touch > 1);
export function easyPayOrder(ua = '', touch = 0) {
  return ['NAVERPAY', 'KAKAOPAY', isAppleDevice(ua, touch) ? 'APPLEPAY' : 'SAMSUNGPAY', 'TOSSPAY'];
}

/** 토스 결제 요청 값 — 소원 글은 넣지 않는다. easyPay를 주면 그 간편결제 창을 바로 연다 */
export function tossRequest(order, origin, path = '/', easyPay = null) {
  const base = `${origin}${path}`; const sep = base.includes('?') ? '&' : '?';
  return {
    method: 'CARD',
    amount: { currency: 'KRW', value: order.amount },
    orderId: order.orderId,
    orderName: order.name,
    successUrl: `${base}${sep}pay=success`,
    failUrl: `${base}${sep}pay=fail`,
    ...(EASY_PAYS[easyPay] ? { card: { flowMode: 'DIRECT', easyPay } } : {}),
  };
}

/** 결제창에서 돌아온 주소 읽기 */
export function parseReturn(search) {
  const q = new URLSearchParams(search || ''); const pay = q.get('pay');
  if (pay === 'success') return { status: 'success', paymentKey: q.get('paymentKey') || '', orderId: q.get('orderId') || '', amount: Number(q.get('amount')) };
  if (pay === 'fail') return { status: 'fail', code: q.get('code') || '', message: q.get('message') || '', orderId: q.get('orderId') || '' };
  return null;
}
export const PAY_PARAMS = ['pay', 'paymentKey', 'orderId', 'amount', 'paymentType', 'code', 'message'];
/** 주소에서 결제 값만 지운 나머지 */
export function cleanSearch(search) {
  const q = new URLSearchParams(search || ''); PAY_PARAMS.forEach((k) => q.delete(k));
  const s = q.toString(); return s ? `?${s}` : '';
}

/** 돌아온 값이 기다리는 주문과 맞는지(주소를 손으로 고친 경우를 막음) */
export function checkReturn(ret, pending, now = Date.now()) {
  if (!ret || ret.status !== 'success') return { ok: false, code: 'NOT_SUCCESS' };
  if (!pendingAlive(pending, now)) return { ok: false, code: 'NO_PENDING', message: '이어서 만들 부적 기록을 찾지 못했어요.' };
  if (ret.orderId !== pending.orderId) return { ok: false, code: 'ORDER_MISMATCH', message: '주문 번호가 달라요.' };
  if (!ret.paymentKey) return { ok: false, code: 'NO_KEY', message: '결제 정보를 받지 못했어요.' };
  const v = verifyOrder(ret.orderId, ret.amount); if (!v.ok) return v;
  if (ret.amount !== pending.amount) return { ok: false, code: 'BAD_AMOUNT', message: '결제 금액이 달라요.' };
  return { ok: true, kind: v.kind, amount: v.amount };
}

/** 결제 내역 한 줄(기기 저장, 소원 글 없음) */
export function payLogEntry(order, res = {}, now = Date.now()) {
  return { kind: order.kind, price: order.amount, at: now, via: 'toss', orderId: order.orderId, method: res.method || '', ez: res.easyPay || '', receipt: res.receiptUrl || '' };
}

/** v0.71.1 결제창에서 뒤로 가기 등으로 결제를 마치지 않고 돌아온 경우 */
export const ABANDON_LINE = '결제를 마치지 않고 돌아오셨어요. 돈은 나가지 않았어요. 마음이 정해지면 다시 해 보세요';

/** 사용자가 결제창을 그냥 닫은 경우인지 */
export const isUserCancel = (code) => ['PAY_PROCESS_CANCELED', 'USER_CANCEL'].includes(String(code || ''));
/** 실패 안내 문장(겁주지 않게, 돈이 나가지 않았다는 점을 먼저) */
export function failLine(code) {
  if (isUserCancel(code)) return '결제를 그만두셨어요. 돈은 나가지 않았어요. 마음이 정해지면 다시 해 보세요';
  if (code === 'REJECT_CARD_COMPANY' || code === 'PAY_PROCESS_ABORTED') return '카드사에서 결제가 이루어지지 않았어요. 돈은 나가지 않았어요. 다른 카드로 다시 해 보세요';
  return '결제가 끝나지 않았어요. 돈은 나가지 않았어요. 잠시 뒤 다시 해 보세요';
}

/** v0.71 구매자 번호(customerKey): 기기마다 한 번 만드는 무작위 값 — 이름·전화·생년월일과 무관.
 *  토스 규칙: 22~255자, 영문·숫자와 특수문자(- _ = . @) 중 최소 1개. 저장 키 CUSTOMER_KEY */
export const CUSTOMER_KEY = 'unmyeong2099.paycust';
const CK_RE = /^z12-[a-z0-9]{24}$/;
export function makeCustomerKey(rand = Math.random) {
  let r = ''; while (r.length < 24) r += Math.floor(rand() * 36).toString(36);
  return `z12-${r.slice(0, 24)}`;
}
export const validCustomerKey = (k) => CK_RE.test(String(k || ''));

/** v0.71 같은 주문의 승인 요청은 몇 번을 보내도 한 번만 처리되게(멱등키, 토스: 300자 이하·15일 유효) */
export const confirmIdemKey = (orderId) => `z12-confirm-${orderId}`;
const TOSS_API = 'https://api.tosspayments.com/v1/payments';

/** 승인이 실패하거나 끊겼을 때: 주문 번호로 결제를 다시 조회해 이미 승인(DONE)됐는지 확인 */
async function lookupDone(orderId, paymentKey, amount, auth, fetchImpl) {
  try {
    const res = await fetchImpl(`${TOSS_API}/orders/${encodeURIComponent(orderId)}`, { method: 'GET', headers: { Authorization: auth } });
    if (!res.ok) return null;
    const d = await res.json();
    if (d.status === 'DONE' && d.paymentKey === paymentKey && Number(d.totalAmount) === amount) return d;
  } catch { /* 조회도 끊김 → 원래 결과로 */ }
  return null;
}
const doneBody = (orderId, v, data) => ({ ok: true, orderId, kind: v.kind, amount: v.amount, method: data.method || '', easyPay: data.easyPay?.provider || '', approvedAt: data.approvedAt || '', receiptUrl: data.receipt?.url || '' });

/**
 * 결제 승인(서버 함수 본체) — 호스팅과 상관없이 쓸 수 있게 fetch를 넘겨받는다.
 * v0.71: 멱등키를 붙이고, 승인이 실패·끊기면 결제 조회로 이미 승인됐는지 다시 확인(토스 LLM Quick Reference §7.1·§8)
 * @returns {status, body} body = {ok:true, orderId, kind, amount, method, approvedAt, receiptUrl} | {ok:false, code, message}
 */
export async function confirmPayment(input, secretKey, fetchImpl) {
  const { paymentKey, orderId, amount } = input || {};
  if (!secretKey) return { status: 500, body: { ok: false, code: 'NO_SECRET', message: '결제 설정이 아직 끝나지 않았어요.' } };
  if (typeof paymentKey !== 'string' || !paymentKey || paymentKey.length > 200) return { status: 400, body: { ok: false, code: 'NO_KEY', message: '결제 정보를 받지 못했어요.' } };
  const v = verifyOrder(orderId, amount);
  if (!v.ok) return { status: 400, body: v };
  const auth = `Basic ${btoa(`${secretKey}:`)}`;
  let res; let data = {};
  try {
    res = await fetchImpl(`${TOSS_API}/confirm`, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json', 'Idempotency-Key': confirmIdemKey(orderId) },
      body: JSON.stringify({ paymentKey, orderId, amount: v.amount }),
    });
    data = await res.json();
  } catch {
    const done = await lookupDone(orderId, paymentKey, v.amount, auth, fetchImpl);
    if (done) return { status: 200, body: doneBody(orderId, v, done) };
    return { status: 502, body: { ok: false, code: 'PG_UNREACHABLE', message: '결제 회사와 연결하지 못했어요. 잠시 뒤 다시 확인할게요.' } };
  }
  if (!res.ok) {
    const done = await lookupDone(orderId, paymentKey, v.amount, auth, fetchImpl);
    if (done) return { status: 200, body: doneBody(orderId, v, done) };
    const busy = res.status >= 500 || data.code === 'IDEMPOTENT_REQUEST_PROCESSING';
    if (busy) return { status: 502, body: { ok: false, code: 'PG_UNREACHABLE', message: '결제 확인이 아직 끝나지 않았어요. 잠시 뒤 다시 확인할게요.' } };
    return { status: res.status === 401 ? 500 : 400, body: { ok: false, code: data.code || 'PG_ERROR', message: data.message || '결제 승인이 되지 않았어요.' } };
  }
  if (data.status && data.status !== 'DONE') return { status: 400, body: { ok: false, code: 'NOT_DONE', message: '결제가 아직 끝나지 않았어요.' } };
  if (Number(data.totalAmount) !== v.amount) return { status: 400, body: { ok: false, code: 'BAD_AMOUNT', message: '결제 금액이 상품 가격과 달라요.' } };
  return { status: 200, body: doneBody(orderId, v, data) };
}
/** 이미 승인된 결제를 다시 확인한 경우(새로고침 등)는 성공으로 본다 */
export const alreadyDone = (code) => code === 'ALREADY_PROCESSED_PAYMENT';
