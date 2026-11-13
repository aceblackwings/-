// v0.65 웹 결제(토스페이먼츠) 순수 로직 + 승인 함수
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PAY_PRODUCTS, makeOrderId, kindOfOrder, verifyOrder, makeOrder, pendingAlive, tossRequest, parseReturn, cleanSearch, checkReturn, payLogEntry, failLine, confirmPayment, PENDING_MAX_MS, makeCustomerKey, validCustomerKey, confirmIdemKey, CUSTOMER_KEY, ABANDON_LINE, EASY_PAYS, easyPayOrder, isAppleDevice } from '../js/pay.js';
import { CHARM_PRICE } from '../js/tteok.js';
import { LANTERN_PRICE } from '../js/lantern.js';
import { toneProblems } from '../js/habit.js';

let n = 0; const ok = (name) => { n += 1; console.log(`  ✓ ${name}`); };

// 1. 가격표·주문 번호
assert.equal(PAY_PRODUCTS.wish.price, CHARM_PRICE); assert.equal(PAY_PRODUCTS.lantern.price, LANTERN_PRICE);
for (const kind of ['wish', 'lantern']) {
  const id = makeOrderId(kind, 1794000000000);
  assert.match(id, /^[A-Za-z0-9_-]{6,64}$/, '토스 주문 번호 규칙');
  assert.equal(kindOfOrder(id), kind);
  assert.equal(verifyOrder(id, PAY_PRODUCTS[kind].price).ok, true);
  assert.equal(verifyOrder(id, 100).code, 'BAD_AMOUNT');
}
assert.equal(makeOrderId('bundle'), null);
assert.equal(verifyOrder('z12-wish-x', 990).code, 'BAD_ORDER');
assert.equal(verifyOrder(makeOrderId('wish'), PAY_PRODUCTS.lantern.price).ok, false, '등불 값으로 소원 부적 주문 불가');
assert.notEqual(makeOrderId('wish', 1), makeOrderId('wish', 1));
ok('가격표 = 앱 가격 · 주문 번호 규칙 · 종류와 금액 검사');

// 2. 결제 요청 값: 소원 글·이름이 결제 회사로 가지 않음
const rec = { wish: '엄마가 건강하게 해 주세요', by: '은하', paid: 'gold', dueKey: '2026-12-25' };
const order = makeOrder('wish', rec, 1794000000000);
const req = tossRequest(order, 'https://example.kr', '/index.html');
assert.equal(req.amount.value, 990); assert.equal(req.amount.currency, 'KRW'); assert.equal(req.orderName, '소원 부적');
assert.ok(!JSON.stringify(req).includes('엄마') && !JSON.stringify(req).includes('은하'));
assert.equal(req.successUrl, 'https://example.kr/index.html?pay=success'); assert.equal(req.failUrl, 'https://example.kr/index.html?pay=fail');
assert.equal(tossRequest(order, 'https://e.kr', '/?easy=1').successUrl, 'https://e.kr/?easy=1&pay=success');
ok('결제 요청에 소원 글·이름 없음 · 돌아올 주소');

// 3. 돌아온 주소 읽기·검사
const back = parseReturn(`?pay=success&paymentKey=pk_1&orderId=${order.orderId}&amount=990&paymentType=NORMAL`);
assert.deepEqual(checkReturn(back, order, order.at + 1000), { ok: true, kind: 'wish', amount: 990 });
assert.equal(checkReturn({ ...back, amount: 100 }, order, order.at).ok, false);
assert.equal(checkReturn({ ...back, orderId: makeOrderId('wish') }, order, order.at).code, 'ORDER_MISMATCH');
assert.equal(checkReturn(back, null).code, 'NO_PENDING');
assert.equal(checkReturn(back, order, order.at + PENDING_MAX_MS + 1).code, 'NO_PENDING');
assert.equal(pendingAlive(order, order.at + 1000), true);
assert.equal(parseReturn('?easy=1'), null);
const fail = parseReturn('?pay=fail&code=PAY_PROCESS_CANCELED&message=x&orderId=a');
assert.equal(fail.status, 'fail'); assert.equal(fail.code, 'PAY_PROCESS_CANCELED');
assert.equal(cleanSearch(`?easy=1&pay=success&paymentKey=k&orderId=o&amount=990&paymentType=NORMAL`), '?easy=1');
assert.equal(cleanSearch('?pay=fail&code=x&message=y'), '');
ok('돌아온 주소 읽기 · 주문·금액 어긋남 거절 · 주소 정리');

// 4. 결제 내역·안내 문장
const log = payLogEntry(order, { method: '카드', receiptUrl: 'https://r' }, 5);
assert.deepEqual(Object.keys(log).sort(), ['at', 'ez', 'kind', 'method', 'orderId', 'price', 'receipt', 'via'].sort());
assert.ok(!JSON.stringify(log).includes('엄마'), '결제 내역에 소원 글 없음');
for (const c of ['PAY_PROCESS_CANCELED', 'REJECT_CARD_COMPANY', 'UNKNOWN', undefined]) {
  const line = failLine(c); assert.ok(line.includes('돈은 나가지 않았어요')); assert.deepEqual(toneProblems(line), []);
}
ok('결제 내역에 소원 글 없음 · 실패 안내는 돈이 나가지 않았다는 말 먼저');

// 5. 승인 함수: 금액을 가격표로 다시 계산, 비밀 키는 Basic 인증, 실패 전달
{
  const calls = [];
  const good = async (url, init) => { calls.push({ url, init }); return { ok: true, status: 200, json: async () => ({ status: 'DONE', totalAmount: 990, method: '카드', approvedAt: '2026-12-22T09:00:00+09:00', receipt: { url: 'https://receipt' } }) }; };
  const r = await confirmPayment({ paymentKey: 'pk_1', orderId: order.orderId, amount: 990 }, 'test_sk_abc', good);
  assert.equal(r.status, 200); assert.equal(r.body.ok, true); assert.equal(r.body.kind, 'wish'); assert.equal(r.body.receiptUrl, 'https://receipt');
  assert.equal(calls[0].url, 'https://api.tosspayments.com/v1/payments/confirm');
  assert.equal(calls[0].init.headers.Authorization, `Basic ${btoa('test_sk_abc:')}`);
  assert.deepEqual(JSON.parse(calls[0].init.body), { paymentKey: 'pk_1', orderId: order.orderId, amount: 990 });
  assert.ok(!JSON.stringify(r.body).includes('test_sk'), '응답에 비밀 키 없음');

  const never = async () => { throw new Error('호출되면 안 됨'); };
  assert.equal((await confirmPayment({ paymentKey: 'pk', orderId: order.orderId, amount: 1 }, 'sk', never)).body.code, 'BAD_AMOUNT');
  assert.equal((await confirmPayment({ paymentKey: 'pk', orderId: 'hack', amount: 990 }, 'sk', never)).body.code, 'BAD_ORDER');
  assert.equal((await confirmPayment({ orderId: order.orderId, amount: 990 }, 'sk', never)).body.code, 'NO_KEY');
  assert.equal((await confirmPayment({ paymentKey: 'pk', orderId: order.orderId, amount: 990 }, '', never)).body.code, 'NO_SECRET');

  const reject = async () => ({ ok: false, status: 400, json: async () => ({ code: 'REJECT_CARD_COMPANY', message: '카드사 거절' }) });
  const rj = await confirmPayment({ paymentKey: 'pk', orderId: order.orderId, amount: 990 }, 'sk', reject);
  assert.equal(rj.body.ok, false); assert.equal(rj.body.code, 'REJECT_CARD_COMPANY');
  const down = async () => { throw new Error('net'); };
  assert.equal((await confirmPayment({ paymentKey: 'pk', orderId: order.orderId, amount: 990 }, 'sk', down)).body.code, 'PG_UNREACHABLE');
  const wrong = async () => ({ ok: true, status: 200, json: async () => ({ status: 'DONE', totalAmount: 100 }) });
  assert.equal((await confirmPayment({ paymentKey: 'pk', orderId: order.orderId, amount: 990 }, 'sk', wrong)).body.code, 'BAD_AMOUNT');
}
ok('승인 함수: 가격표로 금액 재확인 · 비밀 키 전달 · 거절·연결 끊김 처리');

// 6. 비밀 키가 저장소에 적혀 있지 않음 · 승인 함수는 저장하지 않음
{
  const fn = readFileSync(new URL('../functions/api/pay/confirm.js', import.meta.url), 'utf8');
  const site = readFileSync(new URL('../js/site.js', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  for (const src of [fn, site, app, readFileSync(new URL('../js/pay.js', import.meta.url), 'utf8')]) assert.ok(!/(test|live)_g?sk_[A-Za-z0-9]{8,}/.test(src), '시크릿 키가 코드에 있으면 안 됨');
  assert.ok(fn.includes('env.TOSS_SECRET_KEY'));
  assert.ok(!/localStorage|KV|D1|\.put\(/.test(fn), '승인 함수는 아무것도 저장하지 않음');
  assert.ok(app.includes('resumePay()') && app.includes('commitPaidCharm(p.rec)'));
}
ok('시크릿 키는 환경 변수에만 · 승인 함수는 저장 없음');

// 8. v0.71 토스 문서 대조 보강: 구매자 번호 · 멱등키 · 승인 실패 때 결제 조회
{
  const ck = makeCustomerKey();
  assert.ok(ck.length >= 22 && ck.length <= 255 && /[-_=.@]/.test(ck) && /^[A-Za-z0-9\-_=.@]+$/.test(ck), 'customerKey 규칙(22~255자, 특수문자 1개 이상)');
  assert.equal(validCustomerKey(ck), true); assert.equal(validCustomerKey('ANONYMOUS'), false); assert.equal(validCustomerKey(null), false);
  assert.notEqual(makeCustomerKey(), makeCustomerKey());
  assert.ok(CUSTOMER_KEY.startsWith('unmyeong2099.'), '백업에 함께 옮겨지는 저장 키');
  const o = makeOrder('wish', { wish: 'x' }, 1794000000000);
  assert.ok(confirmIdemKey(o.orderId).length <= 300 && confirmIdemKey(o.orderId) === confirmIdemKey(o.orderId), '같은 주문 = 같은 멱등키');

  const calls = [];
  const okFetch = async (url, init) => { calls.push({ url, init }); return { ok: true, status: 200, json: async () => ({ status: 'DONE', totalAmount: 990 }) }; };
  await confirmPayment({ paymentKey: 'pk', orderId: o.orderId, amount: 990 }, 'sk', okFetch);
  assert.equal(calls[0].init.headers['Idempotency-Key'], confirmIdemKey(o.orderId), '승인 요청에 멱등키');
  assert.equal(calls.length, 1, '성공하면 조회하지 않음');

  // 승인 응답이 끊겼지만 실제로는 승인됨 → 조회로 성공 처리(돈은 나갔는데 부적이 안 생기는 일 막기)
  const seen = [];
  const lostThenDone = async (url, init) => {
    seen.push(url);
    if (url.endsWith('/confirm')) throw new Error('timeout');
    return { ok: true, status: 200, json: async () => ({ status: 'DONE', paymentKey: 'pk', totalAmount: 990, method: '카드', receipt: { url: 'https://r' } }) };
  };
  const r1 = await confirmPayment({ paymentKey: 'pk', orderId: o.orderId, amount: 990 }, 'sk', lostThenDone);
  assert.equal(r1.body.ok, true); assert.equal(r1.body.receiptUrl, 'https://r');
  assert.equal(seen[1], `https://api.tosspayments.com/v1/payments/orders/${o.orderId}`, '주문 번호로 조회');
  // 이미 처리된 결제(새로고침 등)도 조회로 확인
  const already = async (url) => (url.endsWith('/confirm')
    ? { ok: false, status: 400, json: async () => ({ code: 'ALREADY_PROCESSED_PAYMENT', message: '이미 처리' }) }
    : { ok: true, status: 200, json: async () => ({ status: 'DONE', paymentKey: 'pk', totalAmount: 990 }) });
  assert.equal((await confirmPayment({ paymentKey: 'pk', orderId: o.orderId, amount: 990 }, 'sk', already)).body.ok, true);
  // 조회 결과가 다른 결제거나 금액이 다르면 성공으로 보지 않음
  const otherKey = async (url) => (url.endsWith('/confirm')
    ? { ok: false, status: 400, json: async () => ({ code: 'REJECT_CARD_COMPANY', message: '거절' }) }
    : { ok: true, status: 200, json: async () => ({ status: 'DONE', paymentKey: 'other', totalAmount: 990 }) });
  assert.equal((await confirmPayment({ paymentKey: 'pk', orderId: o.orderId, amount: 990 }, 'sk', otherKey)).body.code, 'REJECT_CARD_COMPANY');
  const cheap = async (url) => (url.endsWith('/confirm') ? (() => { throw new Error('x'); })() : { ok: true, status: 200, json: async () => ({ status: 'DONE', paymentKey: 'pk', totalAmount: 100 }) });
  assert.equal((await confirmPayment({ paymentKey: 'pk', orderId: o.orderId, amount: 990 }, 'sk', cheap)).body.code, 'PG_UNREACHABLE');
  // 토스 서버 오류·처리 중(409)이면 기다리는 주문을 지우지 않게 PG_UNREACHABLE
  const busy = async (url) => (url.endsWith('/confirm')
    ? { ok: false, status: 409, json: async () => ({ code: 'IDEMPOTENT_REQUEST_PROCESSING' }) }
    : { ok: true, status: 200, json: async () => ({ status: 'IN_PROGRESS', paymentKey: 'pk', totalAmount: 990 }) });
  assert.equal((await confirmPayment({ paymentKey: 'pk', orderId: o.orderId, amount: 990 }, 'sk', busy)).body.code, 'PG_UNREACHABLE');
  // 화면 코드는 ANONYMOUS 대신 기기 번호를 씀
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  assert.ok(app.includes('payment({ customerKey })') && !app.includes('Toss.ANONYMOUS'));
}
ok('v0.71 구매자 번호 규칙 · 멱등키 · 승인 끊김/이미 처리 = 조회로 확인 · 어긋난 조회는 거절');

// 9. v0.71.1 결제를 마치지 않고 돌아왔을 때 안내가 보이게
{
  assert.ok(ABANDON_LINE.includes('돈은 나가지 않았어요')); assert.deepEqual(toneProblems(ABANDON_LINE), []);
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  assert.ok(app.includes('backToRitual(ABANDON_LINE)'), '뒤로 가기로 돌아오면 안내 + 인장 화면');
  assert.ok(app.includes("window.addEventListener('pageshow'"), '뒤로 가기 페이지 되살림(bfcache)도 처리');
  assert.equal((app.match(/if \(opt\.notice\) tip\.textContent = opt\.notice;/g) || []).length, 2, '소원 부적·등불 의식 창 안에 안내');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const z = Number((css.match(/\.toast \{ z-index: (\d+); \}/) || [])[1]);
  assert.ok(z > 200, '토스트가 모든 창(최대 z-index 200)보다 위');
}
ok('v0.71.1 결제 취소·뒤로 가기 안내가 창 위·의식 창 안에 보임');

// 10. v0.72 간편결제 바로가기: 순서 · 아이폰은 애플페이 · 자체창(DIRECT) 요청
{
  const android = 'Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36';
  const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';
  const ipadDesk = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15';
  assert.deepEqual(easyPayOrder(android), ['NAVERPAY', 'KAKAOPAY', 'SAMSUNGPAY', 'TOSSPAY']);
  assert.deepEqual(easyPayOrder(iphone), ['NAVERPAY', 'KAKAOPAY', 'APPLEPAY', 'TOSSPAY']);
  assert.equal(isAppleDevice(ipadDesk, 5), true, '데스크톱 모드 아이패드'); assert.equal(isAppleDevice(ipadDesk, 0), false, '맥 컴퓨터');
  for (const c of ['NAVERPAY', 'KAKAOPAY', 'SAMSUNGPAY', 'APPLEPAY', 'TOSSPAY']) assert.ok(EASY_PAYS[c].label, `${c} 이름`);
  const o = makeOrder('wish', { wish: '비밀 소원' }, 1794000000000);
  const ez = tossRequest(o, 'https://e.kr', '/', 'NAVERPAY');
  assert.deepEqual(ez.card, { flowMode: 'DIRECT', easyPay: 'NAVERPAY' }, '자체창으로 바로 열기');
  assert.equal(ez.method, 'CARD'); assert.equal(ez.amount.value, 990);
  assert.equal(tossRequest(o, 'https://e.kr', '/').card, undefined, '카드 버튼은 통합결제창 그대로');
  assert.equal(tossRequest(o, 'https://e.kr', '/', 'HACK').card, undefined, '모르는 코드는 무시');
  assert.ok(!JSON.stringify(ez).includes('비밀'));
  const app = readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  assert.ok(app.includes('data-ez="${c}"') && app.includes('goTossPay(kind, rec, ez)'), '결제 창 버튼 → 바로 열기');
}
ok('v0.72 간편결제 순서(네이버·카카오·삼성/애플·토스) · 자체창 요청 · 카드는 통합결제창');

console.log(`pay.test: ${n}개 통과`);

// 7. Workers 진입점(worker/index.js): 결제 승인만 받고 나머지는 정적 파일로
{
  const { default: worker, handlePay } = await import('../../worker/index.js');
  const o = makeOrder('lantern', { wish: 'x' }, 1794000000000);
  const post = (body, headers = {}) => new Request('https://12jisin.ockstar.com/api/pay/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  const okFetch = async () => ({ ok: true, status: 200, json: async () => ({ status: 'DONE', totalAmount: 2900, method: '카드' }) });
  const r1 = await handlePay(post({ paymentKey: 'pk', orderId: o.orderId, amount: 2900 }), { TOSS_SECRET_KEY: 'test_sk_x' }, okFetch);
  assert.equal(r1.status, 200); assert.equal((await r1.json()).kind, 'lantern');
  assert.equal((await handlePay(post({ paymentKey: 'pk', orderId: o.orderId, amount: 2900 }, { Origin: 'https://evil.example' }), { TOSS_SECRET_KEY: 'k' }, okFetch)).status, 403);
  assert.equal((await handlePay(new Request('https://a.b/api/pay/confirm'), {}, okFetch)).status, 405);
  assert.equal((await handlePay(post({ paymentKey: 'pk', orderId: o.orderId, amount: 2900 }), {}, okFetch)).status, 500, '비밀 키가 없으면 승인하지 않음');
  let served = 0; const env = { ASSETS: { fetch: async () => { served += 1; return new Response('page'); } } };
  assert.equal(await (await worker.fetch(new Request('https://a.b/index.html'), env)).text(), 'page'); assert.equal(served, 1);
  assert.equal((await worker.fetch(new Request('https://a.b/api/other'), env)).status, 404);
  // v0.73.1 결제창이 POST로 돌아와도 405가 아니라 같은 주소 GET으로(폼 값은 ?뒤로, 주소 값 우선)
  const back = await worker.fetch(new Request('https://a.b/?pay=success', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'paymentKey=pk1&orderId=z12-wish-1-a&amount=990&pay=evil' }), env);
  assert.equal(back.status, 303);
  const loc = new URL(back.headers.get('Location'), 'https://a.b');
  assert.equal(loc.pathname, '/'); assert.equal(loc.searchParams.get('pay'), 'success'); assert.equal(loc.searchParams.get('paymentKey'), 'pk1'); assert.equal(loc.searchParams.get('amount'), '990');
  assert.equal(served, 1, 'POST는 정적 파일로 넘기지 않음');
  const cfg = readFileSync(new URL('../../wrangler.jsonc', import.meta.url), 'utf8');
  assert.ok(cfg.includes('"directory": "./saju-app"') && cfg.includes('"main": "worker/index.js"') && !/sk_/.test(cfg));
  const ignore = readFileSync(new URL('../.assetsignore', import.meta.url), 'utf8');
  for (const d of ['tests', 'tools', 'functions', 'screenshots']) assert.ok(ignore.split('\n').includes(d), `사이트에 안 올리는 폴더 ${d}`);
}
console.log('  ✓ Workers 진입점: 결제 승인·다른 곳 요청 거절·정적 파일 넘기기·배포 설정');
