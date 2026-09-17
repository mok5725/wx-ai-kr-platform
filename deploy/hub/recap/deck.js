/* 인창원라이브 발표 장표 — 빌드 없는 순수 JS.
   조작: → Space Enter PageDown 다음 · ← Backspace PageUp 이전 · Home/End
         F 전체화면 · P 발표자 노트 창 · V 영상 재생/멈춤 · B(또는 .) 화면 끄기
   주소: #장-단계 (예: #3-2) — 새로고침해도 같은 자리로 돌아온다. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const CH = 'inchang-live-deck';
  const BG = { sunset: 'img/bg/sunset.jpg', songdo: 'img/bg/songdo.jpg', cloud: 'img/bg/cloud.jpg', group: 'img/photos/p240_wide.jpg' };

  const slides = $$('.slide').map(el => ({ el, title: el.dataset.title, time: el.dataset.time, views: $$('.view', el) }));
  const bc = 'BroadcastChannel' in window ? new BroadcastChannel(CH) : null;

  if (new URLSearchParams(location.search).has('notes')) return notesMode();

  /* ── 무대 맞춤 ── */
  const frame = $('#frame');
  function fit() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    frame.style.transform = `translate(${(innerWidth - 1920 * s) / 2}px,${(innerHeight - 1080 * s) / 2}px) scale(${s})`;
  }
  addEventListener('resize', fit); fit();

  /* ── 배경: 같은 그림이면 위치만 흘리고, 다른 그림이면 겹쳐 녹인다 ── */
  const layers = [$('#bgA'), $('#bgB')]; let live = 0; const shade = $('#shade');
  function setBg(spec) {
    const [key, size, pos, dim] = spec.split('|');
    const url = BG[key];
    let L = layers[live];
    if (L.dataset.key !== key) {
      live = 1 - live; L = layers[live];
      L.classList.add('snap');
      Object.assign(L.style, { backgroundImage: `url("${url}")`, backgroundSize: size, backgroundPosition: pos });
      L.dataset.key = key; void L.offsetWidth; L.classList.remove('snap');
      L.classList.add('on'); layers[1 - live].classList.remove('on');
    } else {
      Object.assign(L.style, { backgroundSize: size, backgroundPosition: pos });
    }
    shade.style.opacity = dim;
  }

  /* ── 숫자 카운트업 ── */
  function countUp(root) {
    $$('[data-count]', root).forEach(n => {
      const to = +n.dataset.count, dec = +(n.dataset.dec || 0), pre = n.dataset.pre || '', t0 = performance.now(), dur = 1500;
      const fmt = x => pre + x.toLocaleString('ko-KR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      const tick = t => { const k = Math.min(1, (t - t0) / dur); n.textContent = fmt(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
      n.textContent = fmt(0); setTimeout(() => requestAnimationFrame(tick), 350);
    });
  }

  /* ── 영상 ── */
  const player = $('#player'), mv = $('#mv');
  mv.addEventListener('error', () => player.classList.add('missing'));
  // 캐시 덕에 오류가 이 스크립트보다 먼저 났을 수도 있다 — 이미 난 오류도 잡는다
  if (mv.error || mv.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) player.classList.add('missing');
  mv.addEventListener('play', () => player.classList.add('playing'));
  mv.addEventListener('pause', () => player.classList.remove('playing'));
  mv.addEventListener('ended', () => player.classList.remove('playing'));
  const toggleVideo = () => { if (player.classList.contains('missing') || !player.closest('.view.cur')) return; mv.paused ? mv.play().catch(() => {}) : mv.pause(); };
  player.addEventListener('click', toggleVideo);

  /* ── 진행 표시 ── */
  const progress = $('#progress');
  progress.innerHTML = slides.map(() => '<i></i>').join('');
  const lab = $('#lab');

  /* ── 이동 ── */
  let S = -1, V = 0, shownT = 0;
  function go(s, v, soft) {
    s = Math.max(0, Math.min(slides.length - 1, s));
    v = Math.max(0, Math.min(slides[s].views.length - 1, v));
    const slideChanged = s !== S, viewChanged = slideChanged || v !== V;
    slides.forEach((sl, i) => {
      sl.el.classList.toggle('active', i === s);
      sl.views.forEach((vw, j) => {
        const now = i === s && j === v, before = i < s || (i === s && j < v);
        vw.classList.toggle('cur', now); vw.classList.toggle('past', before); vw.classList.toggle('future', !now && !before);
        if (!now) vw.classList.remove('shown');
      });
    });
    const view = slides[s].views[v];
    // 같은 장 안에서 제목 이름이 같으면(예: "현장의 생생한 순간들 · …") 큐브를 굴리지 않고 그대로 바꾼다
    const baseOf = vw => { const t = vw && $(':scope>.title-z>.fx', vw); return t ? t.textContent.trim() : null; };
    const prevView = S === s ? slides[S].views[V] : null;
    if (prevView && prevView !== view && baseOf(prevView) && baseOf(prevView) === baseOf(view)) splitSwap(prevView, view, v > V ? 1 : -1);
    if (!mv.paused && !view.contains(player)) mv.pause();
    setBg(view.dataset.bg);
    frame.classList.toggle('cover-on', view.hasAttribute('data-cover'));
    if (viewChanged) {
      clearTimeout(shownT); shownT = setTimeout(() => view.classList.add('shown'), slideChanged ? 500 : 250);
      if ($('[data-count]', view)) countUp(view);
    }
    $$('i', progress).forEach((d, i) => { d.className = i < s ? 'past' : i === s ? 'cur' : ''; });
    const n = slides[s].views.length;
    lab.textContent = n > 1 ? `${v + 1} / ${n}` : '';
    S = s; V = v;
    if (!soft) history.replaceState(null, '', `#${s + 1}-${v + 1}`);
    bc && bc.postMessage({ type: 'pos', s, v });
  }
  /* 고정 글자는 두고 조각만 굴리기 — 나가는 제목의 조각은 위(또는 아래)로, 들어오는 제목의 조각은 반대쪽에서 */
  function splitSwap(pv, nv, dir) {
    const pt = $(':scope>.title-z', pv), nt = $(':scope>.title-z', nv);
    const out = dir > 0 ? 'to-up' : 'to-down', inn = dir > 0 ? 'from-down' : 'from-up';
    [pt, nt].forEach(t => { clearTimeout(t._swap); t.style.transition = 'none'; t.classList.remove('leaving', 'to-up', 'to-down', 'from-up', 'from-down'); t.classList.add('keep'); });
    const ncb = $$('.cb', nt);
    ncb.forEach(c => { c.style.transition = 'none'; }); nt.classList.add(inn);
    void nt.offsetWidth;
    ncb.forEach(c => { c.style.transition = ''; }); nt.classList.remove(inn);
    pt.classList.add('leaving', out);
    pt._swap = setTimeout(() => {
      pt.classList.remove('leaving', out, 'keep'); nt.classList.remove('keep');
      $$('.cb', pt).forEach(c => { c.style.transition = 'none'; });
      void pt.offsetWidth;
      [pt, nt].forEach(t => { t.style.transition = ''; }); $$('.cb', pt).forEach(c => { c.style.transition = ''; });
    }, 460);
  }
  // 조각 자리 폭 맞추기 — 장마다 같은 순번의 조각 중 가장 긴 폭으로
  function fitSlots() {
    slides.forEach(sl => {
      const rows = sl.views.map(vw => $$(':scope>.title-z .slot', vw)).filter(r => r.length);
      if (rows.length < 2) return;
      rows[0].forEach((_, k) => {
        const w = Math.max(...rows.map(r => r[k] ? r[k].firstElementChild.offsetWidth : 0));
        rows.forEach(r => { if (r[k]) r[k].style.minWidth = w + 'px'; });
      });
    });
  }
  fitSlots(); document.fonts && document.fonts.ready.then(fitSlots);

  /* 열한 개의 별 — 제자리 주변을 천천히 떠다니고, 별자리 점선도 따라 움직인다.
     별마다 느린 사인 두 개를 섞어 무작위처럼 보이게 한다(진폭 8~16px, 주기 약 3~9초). */
  (function drift() {
    const box = $('.stars'); if (!box) return;
    const view = box.closest('.view'), line = $('.constel polyline', box);
    const R = (a, b) => a + Math.random() * (b - a);
    const stars = $$('.star', box).map(el => {
      el.style.setProperty('--tw', R(2.2, 3.8).toFixed(2) + 's');
      el.style.setProperty('--td', (-R(0, 3.8)).toFixed(2) + 's');
      return { el, x: parseFloat(el.style.left), y: parseFloat(el.style.top),
        ax: R(8, 16), ay: R(8, 16), f: [R(.11, .3), R(.11, .3), R(.11, .3), R(.11, .3)], p: [0, 0, 0, 0].map(() => R(0, 6.283)) };
    });
    const tick = t => {
      if (view.classList.contains('cur')) {
        const s = t / 1000, pts = [];
        stars.forEach(o => {
          const dx = o.ax * (.62 * Math.sin(6.283 * o.f[0] * s + o.p[0]) + .38 * Math.sin(6.283 * o.f[1] * s + o.p[1]));
          const dy = o.ay * (.62 * Math.sin(6.283 * o.f[2] * s + o.p[2]) + .38 * Math.sin(6.283 * o.f[3] * s + o.p[3]));
          o.el.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
          pts.push(`${(o.x + dx).toFixed(1)},${(o.y + dy).toFixed(1)}`);
        });
        line.setAttribute('points', pts.join(' '));
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  })();

  const next = () => V < slides[S].views.length - 1 ? go(S, V + 1) : S < slides.length - 1 && go(S + 1, 0);
  const prev = () => V > 0 ? go(S, V - 1) : S > 0 && go(S - 1, slides[S - 1].views.length - 1);

  function fromHash() {
    const m = location.hash.match(/^#(\d+)(?:-(\d+))?/);
    return m ? [+m[1] - 1, (+m[2] || 1) - 1] : [0, 0];
  }
  go(...fromHash(), true);
  addEventListener('hashchange', () => { const [s, v] = fromHash(); if (s !== S || v !== V) go(s, v, true); });

  /* ── 입력 ── */
  const black = $('#black'), hint = $('#hint');
  const hideHint = () => hint.classList.add('gone');
  setTimeout(hideHint, 4000);
  const fullscreen = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {});
  const openNotes = () => window.open(location.pathname + '?notes', 'inchang-notes', 'width=1000,height=760');
  function cmd(c) {
    hideHint();
    if (c !== 'black' && black.classList.contains('on')) { black.classList.remove('on'); if (c !== 'next' && c !== 'prev') return; }
    ({ next, prev, first: () => go(0, 0), last: () => go(slides.length - 1, slides.at(-1).views.length - 1),
       full: fullscreen, notes: openNotes, video: toggleVideo, black: () => black.classList.toggle('on') })[c]?.();
  }
  addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key, c = e.code;
    let a = null;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) a = 'next';
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) a = 'prev';
    else if (k === 'Home') a = 'first'; else if (k === 'End') a = 'last';
    else if (c === 'KeyF') a = 'full'; else if (c === 'KeyP') a = 'notes';
    else if (c === 'KeyV') a = 'video'; else if (c === 'KeyB' || c === 'Period') a = 'black';
    if (a) { e.preventDefault(); cmd(a); }
  });
  $('#next').addEventListener('click', () => cmd('next'));
  $('#prev').addEventListener('click', () => cmd('prev'));
  // 휠은 한 번 쓸어내림(연달아 오는 이벤트 묶음)에 한 장만 — 트랙패드 관성으로 여러 장 넘어가지 않게
  let wheelLast = 0;
  addEventListener('wheel', e => {
    const t = Date.now(), fresh = t - wheelLast > 350; wheelLast = t;
    if (fresh && Math.abs(e.deltaY) >= 20) cmd(e.deltaY > 0 ? 'next' : 'prev');
  }, { passive: true });
  let tx = null;
  addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  addEventListener('touchend', e => { if (tx == null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) cmd(dx < 0 ? 'next' : 'prev'); tx = null; });
  let idleT = 0;
  addEventListener('mousemove', () => { document.body.classList.remove('idle'); clearTimeout(idleT); idleT = setTimeout(() => document.body.classList.add('idle'), 2500); });
  bc && bc.addEventListener('message', ({ data }) => {
    if (data.type === 'cmd') cmd(data.cmd);
    if (data.type === 'hello') bc.postMessage({ type: 'pos', s: S, v: V });
  });

  /* ── 발표자 노트 창 ── */
  function notesMode() {
    const meta = slides.map(s => ({ title: s.title, time: s.time, n: s.views.length }));
    document.body.className = 'notes';
    document.title = '발표자 노트 · 해커톤 이모저모';
    document.body.innerHTML = `<div class="nt">
      <div class="top"><span class="pos" id="pos">—</span><span class="ttl" id="ttl"></span><span class="budget" id="budget"></span>
        <span class="clock" id="clock">00:00</span></div>
      <div class="btns"><button data-c="prev">◀ 이전</button><button data-c="next">다음 ▶</button><button data-c="video">🎬 영상 재생/멈춤</button>
        <button data-c="black">화면 끄기</button><button id="tgo">타이머 시작</button><button id="trs">타이머 리셋</button></div>
      <div class="script" id="script">장표 창과 연결 중… (장표 창에서 한 번 넘기면 연결됩니다)</div>
      <div class="next" id="nx"></div></div>`;
    const send = c => bc && bc.postMessage({ type: 'cmd', cmd: c });
    $$('[data-c]').forEach(b => b.addEventListener('click', () => send(b.dataset.c)));
    addEventListener('keydown', e => {
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); send('next'); }
      if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); send('prev'); }
    });
    let t0 = 0, run = false;
    const clock = $('#clock'), tgo = $('#tgo');
    const start = () => { if (!run) { t0 = Date.now(); run = true; tgo.textContent = '타이머 진행 중'; } };
    tgo.addEventListener('click', start);
    $('#trs').addEventListener('click', () => { run = false; t0 = 0; clock.textContent = '00:00'; clock.classList.remove('over'); tgo.textContent = '타이머 시작'; });
    setInterval(() => {
      if (!run) return;
      const sec = Math.floor((Date.now() - t0) / 1000);
      clock.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
      clock.classList.toggle('over', sec >= 600);
    }, 250);
    bc && bc.addEventListener('message', ({ data }) => {
      if (data.type !== 'pos') return;
      const { s, v } = data, m = meta[s];
      $('#pos').textContent = `${s + 1} / ${meta.length}` + (m.n > 1 ? ` · ${v + 1}/${m.n}` : '');
      $('#ttl').textContent = m.title; $('#budget').textContent = `배정 ${m.time}`;
      $('#script').innerHTML = (window.NOTES || {})[`${s + 1}-${v + 1}`] || '(노트 없음)';
      const ns = v < m.n - 1 ? [s, v + 1] : s < meta.length - 1 ? [s + 1, 0] : null;
      $('#nx').textContent = ns ? `다음 → ${ns[0] + 1}. ${meta[ns[0]].title}${meta[ns[0]].n > 1 ? ` (${ns[1] + 1}/${meta[ns[0]].n})` : ''}` : '마지막 장입니다';
      if (s > 0 || v > 0) start();
    });
    bc && bc.postMessage({ type: 'hello' });
  }
})();
