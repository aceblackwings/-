// 유니유통 회사 홈페이지(ockstar.com) 생성기: `node saju-app/tools/company_page.mjs` → company/site/index.html
// 사업자 정보는 saju-app/js/site.js 의 BIZ 한 곳에서 읽는다. 글을 고치면 다시 실행(tests/site.test.mjs가 같은지 검사).
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { BIZ, bizValue } from '../js/site.js';

export const COMPANY_URL = 'https://ockstar.com';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tel = (p) => p.replace(/[^0-9+]/g, '');

/** 회사가 서비스하는 콘텐츠 목록 — 새 콘텐츠가 생기면 여기에 한 칸 추가 */
export const CONTENTS = [
  {
    name: '12지신 강림', tag: '웹 서비스 · 무료로 시작', img: 'img/12jisin.webp', imgAlt: '포춘 쿠키 기계 옆에 선 용 지신 캐릭터',
    desc: '생년월일로 보는 사주와 2027년 신년운세, 12지신 타로와 궁합을 무료로 볼 수 있습니다. 내 띠의 수호신을 키우며 매일 습관 두 가지를 챙기는 운세·습관 서비스입니다.',
    points: ['오늘의 포춘 쿠키와 운세', '2027년 신년운세 · 사주 풀이', '12지신 타로 · 궁합', '소원 부적 · 100일 소원 등불'],
    url: BIZ.domain, cta: '12지신 강림 열기',
  },
];

export function companyPage(biz = BIZ) {
  const v = (k) => esc(bizValue(k, biz));
  const items = CONTENTS.map((c) => `
        <article class="item">
          <div class="pic"><img src="${c.img}" alt="${esc(c.imgAlt)}" width="768" height="700" loading="lazy"></div>
          <div class="body">
            <span class="tag">${esc(c.tag)}</span>
            <h3>${esc(c.name)}</h3>
            <p>${esc(c.desc)}</p>
            <ul>${c.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
            <a class="btn" href="${esc(c.url)}/">${esc(c.cta)} →</a>
          </div>
        </article>`).join('');
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OCKSTAR · ${v('name')} – 디지털 콘텐츠와 앱</title>
  <meta name="description" content="${v('name')}은 디지털 콘텐츠와 앱을 만들고 직접 서비스합니다. 무료 사주·2027 신년운세·타로·습관 서비스 「12지신 강림」을 운영합니다.">
  <link rel="canonical" href="${COMPANY_URL}/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="OCKSTAR · ${v('name')}">
  <meta property="og:title" content="OCKSTAR · ${v('name')}">
  <meta property="og:url" content="${COMPANY_URL}/">
  <meta name="theme-color" content="#faf7f1">
  <link rel="stylesheet" href="company.css">
</head>
<body>
<div class="wrap">
  <header class="top">
    <a class="mark" href="./"><b>OCKSTAR</b><small>${v('name')}</small></a>
    <nav aria-label="바로 가기"><a href="#contents">콘텐츠</a><a href="#about">회사 정보</a><a href="#contact">문의</a></nav>
  </header>
  <main>
    <div class="hero">
      <p class="eyebrow">${v('name')}</p>
      <h1>매일 한 번 열어 보고 싶은 디지털 콘텐츠를 만듭니다</h1>
      <p>${v('name')}은 앱과 디지털 콘텐츠를 만들고 직접 서비스합니다. 지금 운영하는 콘텐츠를 아래에서 만나 보세요.</p>
    </div>
    <section id="contents" aria-labelledby="h-contents">
      <h2 id="h-contents">콘텐츠</h2>
      <p class="lead">${v('name')}이 운영하는 서비스입니다.</p>
      <div class="grid">${items}
        <article class="item soon"><div class="body"><h3>다음 콘텐츠</h3><p>새 콘텐츠를 준비하고 있습니다. 공개되면 이곳에 추가됩니다.</p></div></article>
      </div>
    </section>
    <section id="about" aria-labelledby="h-about">
      <h2 id="h-about">회사 정보</h2>
      <p class="lead">사업자 등록 정보입니다.</p>
      <dl class="info">
        <dt>상호</dt><dd>${v('name')}</dd>
        <dt>대표</dt><dd>${v('owner')}</dd>
        <dt>사업자등록번호</dt><dd>${v('regNo')}</dd>
        <dt>통신판매업 신고</dt><dd>${v('mailOrderNo')}</dd>
        <dt>주소</dt><dd>${v('address')}</dd>
        <dt>하는 일</dt><dd>응용 소프트웨어 개발 및 공급 · 전자상거래 · 미디어 콘텐츠 창작</dd>
      </dl>
    </section>
    <section id="contact" aria-labelledby="h-contact">
      <h2 id="h-contact">문의</h2>
      <p class="lead">서비스 이용, 환불, 제휴 문의를 받습니다.</p>
      <div class="contact">
        <a href="mailto:${v('email')}">✉ ${v('email')}</a>
        <a href="tel:${esc(tel(bizValue('phone', biz)))}">☎ ${v('phone')}</a>
      </div>
      <p class="hours">${v('hours')}</p>
    </section>
  </main>
  <footer>
    <span>© 2026 ${v('name')}</span>
    <span><a href="${esc(biz.domain)}/legal/terms.html">12지신 강림 이용약관</a> · <a href="${esc(biz.domain)}/legal/privacy.html">개인정보 처리방침</a> · <a href="${esc(biz.domain)}/legal/refund.html">환불 규정</a></span>
  </footer>
</div>
</body>
</html>
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const out = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'company', 'site', 'index.html');
  writeFileSync(out, companyPage()); console.log('company/site/index.html');
}
