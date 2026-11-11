// v0.65 약관 페이지 공통: 사업자 정보 채우기 + (환불 규정) 이 기기의 결제 내역 보여 주기
import { fillBiz, BIZ } from '../js/site.js';
import { PAY_PRODUCTS } from '../js/pay.js';

fillBiz(document, BIZ);
const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`;
document.querySelectorAll('[data-price]').forEach((el) => { const p = PAY_PRODUCTS[el.dataset.price]; if (p) el.textContent = won(p.price); });

const box = document.querySelector('#pay-log');
if (box) {
  let log = [];
  try { log = JSON.parse(localStorage.getItem('unmyeong2099.charmpay')) || []; } catch { /* 저장소가 막힌 화면 */ }
  const paid = log.filter((x) => x && x.via === 'toss' && x.orderId);
  if (paid.length) {
    const h = document.createElement('h2'); h.textContent = '이 기기에서 결제한 내역';
    const note = document.createElement('p'); note.textContent = '환불이나 문의를 하실 때 아래 주문 번호를 함께 알려 주세요. 이 목록은 이 기기에만 저장되어 있어요.';
    const wrap = document.createElement('div'); wrap.className = 'lg-table';
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>날짜</th><th>상품</th><th>금액</th><th>주문 번호</th><th>영수증</th></tr></thead>';
    const tb = document.createElement('tbody');
    paid.forEach((x) => {
      const tr = document.createElement('tr');
      const cells = [new Date(x.at).toLocaleDateString('ko-KR'), PAY_PRODUCTS[x.kind]?.name || x.kind, won(x.price), x.orderId];
      cells.forEach((c) => { const td = document.createElement('td'); td.textContent = c; tr.appendChild(td); });
      const td = document.createElement('td');
      if (/^https:\/\//.test(x.receipt || '')) { const a = document.createElement('a'); a.href = x.receipt; a.target = '_blank'; a.rel = 'noopener'; a.textContent = '보기'; td.appendChild(a); } else td.textContent = '-';
      tr.appendChild(td); tb.appendChild(tr);
    });
    table.appendChild(tb); wrap.appendChild(table); box.append(h, note, wrap);
  }
}
