// OCKSTAR 스튜디오 시안 — 첫 화면 펼침 효과와 스크롤 등장 효과
(function () {
  var hero = document.getElementById('hero');
  var media = document.getElementById('heroMedia');
  var fg = document.getElementById('heroFg');
  var copy = document.getElementById('heroCopy');
  var names = document.getElementById('heroNames');
  var top = document.getElementById('top');
  var hint = document.querySelector('.scrollhint');
  var narrow = window.matchMedia('(max-width: 760px)');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  var ticking = false;

  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function draw() {
    ticking = false;
    var y = window.scrollY;
    top.classList.toggle('solid', y > hero.offsetHeight - window.innerHeight);
    if (still.matches) return;
    var p = ease(clamp(y / (hero.offsetHeight - window.innerHeight)));
    var q = 1 - p;
    if (narrow.matches) {
      // 좁은 화면: 아래쪽 비스듬한 창이 위로 올라오며 가득 찬다
      media.style.clipPath = 'polygon(0 ' + 39 * q + '%, 100% ' + 30 * q + '%, 100% 100%, 0 100%)';
    } else {
      // 넓은 화면: 오른쪽 비스듬한 창이 왼쪽으로 펼쳐지고, 그림은 가운데로 온다
      media.style.clipPath = 'polygon(' + 49 * q + '% ' + 42 * q + '%, 95% 0, 100% 0, 100% 100%, ' + 49 * q + '% 100%)';
      fg.style.left = 74.5 - 24.5 * p + '%';
    }
    copy.style.opacity = clamp(1 - p * 2.4);
    copy.style.visibility = p > 0.42 ? 'hidden' : 'visible';
    names.style.opacity = clamp((p - 0.62) / 0.38);
    hint.style.opacity = clamp(1 - p * 4);
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(draw); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    media.style.clipPath = '';
    fg.style.left = '';
    onScroll();
  });
  draw();

  // 화면에 들어오면 떠오르기
  var items = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
    io.observe(el);
  });
})();
