// v0.65 웹 출시: 사업자 정보 채우기 · 약관 페이지 · 바닥글
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BIZ, PAY, payMode, bizValue, missingBiz } from '../js/site.js';
import { legalPage, LEGAL_KEYS } from '../tools/legal_pages.mjs';
import { josaProblems } from '../js/josa.js';

let n = 0; const ok = (name) => { n += 1; console.log(`  ✓ ${name}`); };
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const textOf = (html) => html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

assert.equal(payMode({ tossClientKey: '' }), 'trial');
assert.equal(payMode({ tossClientKey: 'test_ck_abc' }), 'test');
assert.equal(payMode({ tossClientKey: 'live_ck_abc' }), 'live');
assert.ok(!/sk_/.test(PAY.tossClientKey), '클라이언트 키 자리에 시크릿 키를 넣으면 안 됨');
assert.equal(bizValue('name', { name: '' }), '(등록 예정)');
assert.equal(bizValue('mailOrderNo', { mailOrderNo: '' }), '신고 진행 중');
assert.equal(bizValue('privacyOfficer', { owner: '홍길동' }), '홍길동');
assert.equal(bizValue('effective'), '2026년 11월 11일');
assert.deepEqual(missingBiz({ name: 'a', owner: 'b', regNo: 'c', mailOrderNo: 'd', address: 'e', phone: 'f', email: 'g', domain: 'h' }), []);
assert.ok(Array.isArray(missingBiz(BIZ)));
ok('결제 모드(체험·시험·실제) · 빈 사업자 정보 표시');

for (const k of LEGAL_KEYS) {
  const html = read(`legal/${k}.html`);
  assert.equal(html, legalPage(k), `legal/${k}.html — 글을 고쳤으면 node tools/legal_pages.mjs 다시 실행`);
  for (const f of ['name', 'owner', 'regNo', 'mailOrderNo', 'address', 'phone', 'email']) assert.ok(html.includes(`data-biz="${f}"`), `${k}: 사업자 정보 ${f}`);
  assert.deepEqual(josaProblems(textOf(html)), [], `${k}: 조사`);
}
ok('약관 4쪽: 생성기 결과와 같음 · 사업자 정보 칸 · 조사');

{
  const terms = textOf(read('legal/terms.html')); const privacy = textOf(read('legal/privacy.html')); const refund = textOf(read('legal/refund.html')); const shop = read('legal/shop.html');
  assert.ok(terms.includes('오락용 읽을거리') && terms.includes('만 14세') && terms.includes('법정대리인') && terms.includes('109'));
  assert.ok(privacy.includes('서버로 보내지 않습니다') && privacy.includes('토스페이먼츠') && privacy.includes('5년') && privacy.includes('보호책임자') && privacy.includes('국외'));
  assert.ok(refund.includes('전액 환불') && refund.includes('제17조') && refund.includes('3영업일') && refund.includes('id="pay-log"') === false);
  assert.ok(read('legal/refund.html').includes('id="pay-log"'));
  assert.ok(shop.includes('data-price="wish"') && shop.includes('data-price="lantern"'));
}
ok('약관·처리방침·환불 규정에 꼭 들어갈 내용');

{
  const index = read('index.html');
  for (const p of ['legal/terms.html', 'legal/privacy.html', 'legal/refund.html', 'legal/shop.html']) assert.ok(index.includes(`href="${p}"`), `바닥글 링크 ${p}`);
  for (const f of ['name', 'owner', 'regNo', 'mailOrderNo', 'address', 'phone', 'email']) assert.ok(index.includes(`data-biz="${f}"`), `바닥글 ${f}`);
  assert.ok(index.includes('agree-note') && index.includes('만 14세 이상'));
  const app = read('js/app.js');
  assert.ok(app.includes('legal/refund.html') && app.includes('단순 변심 환불이 어려워요') && app.includes('이 기기의 이 브라우저에만'), '결제 창 고지');
  assert.ok(read('robots.txt').includes('Disallow: /api/'));
  JSON.parse(read('manifest.webmanifest'));
}
ok('바닥글 사업자 정보·약관 링크 · 가입 동의 줄 · 결제 창 고지');

console.log(`site.test: ${n}개 통과`);

// 회사 홈페이지(ockstar.com): 생성기 결과와 같음 · 사업자 정보 · 12지신 강림 링크
{
  const { companyPage, CONTENTS, COMPANY_URL } = await import('../tools/company_page.mjs');
  const html = readFileSync(new URL('../../company/site/index.html', import.meta.url), 'utf8');
  assert.equal(html, companyPage(), 'company/site/index.html — 글을 고쳤으면 node saju-app/tools/company_page.mjs 다시 실행');
  for (const x of [BIZ.name, BIZ.owner, BIZ.regNo, BIZ.address, BIZ.phone, BIZ.email]) assert.ok(html.includes(x), `회사 홈페이지에 ${x}`);
  assert.ok(html.includes(`href="${BIZ.domain}/"`) && html.includes('12지신 강림'), '콘텐츠 목록에 12지신 강림');
  assert.ok(CONTENTS.length >= 1 && COMPANY_URL === 'https://ockstar.com');
  assert.deepEqual(josaProblems(textOf(html)), [], '회사 홈페이지 조사');
  const cfg = readFileSync(new URL('../../company/wrangler.jsonc', import.meta.url), 'utf8');
  assert.ok(cfg.includes('"name": "ockstar-home"') && cfg.includes('"directory": "./site"'));
  for (const f of ['company.css', 'img/12jisin.webp', 'robots.txt']) readFileSync(new URL(`../../company/site/${f}`, import.meta.url));
}
console.log('  ✓ 회사 홈페이지: 생성기 결과와 같음 · 사업자 정보 · 12지신 강림 링크 · 배포 설정');

// v0.68 「광고 없음 · 운세 무료」 알리기 + 내 오행 부적 버튼 삭제
{
  const index = read('index.html'); const app = read('js/app.js'); const free = textOf(read('legal/free.html'));
  assert.ok(index.includes('href="legal/free.html"') && index.includes('class="free-badge"') && /<title>[^<]*광고 없는 무료 사주/.test(index), '바닥글 링크 · 가입 배지 · 제목');
  assert.ok(app.includes('광고 없이 무료로 읽으셨어요'), '상세판·정통사주 끝 문구');
  assert.ok(free.includes('소원 부적') && free.includes('100일 소원 등불') && free.includes('운세 점수는 바뀌지 않습니다'), '운영 방법 페이지');
  assert.ok(!/완전 무료/.test(free + textOf(index)), '「완전 무료」라고 쓰지 않음(유료 상품이 있음)');
  assert.ok(!/광고 시청|광고 없음<\/small>/.test(app), '광고가 있는 것처럼 읽히는 옛 문구 없음');
  assert.deepEqual(josaProblems(free), [], '조사');
  assert.ok(!/기운 부적 만들러 가기/.test(app), '내 오행: 눌러도 반응 없던 부적 버튼 삭제');
}
console.log('  ✓ 광고 없는 무료 운세 페이지 · 가입 배지 · 상세판 끝 문구 · 오행 부적 버튼 삭제');
