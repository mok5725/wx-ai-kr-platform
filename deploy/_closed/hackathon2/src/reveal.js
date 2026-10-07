// 한 장 안에서 **여러 번 넘기는** 장치.
//
// FAQ(#8/3)는 문답이 여섯이라 한 화면에 다 넣으면 글자를 아주 작게 눌러야
// 한다. 그래서 세 개씩만 보이고, 넘기면 목록이 위로 올라오며 다음 문답이
// 들어온다(2026-08-11 요청).
//
// **덱의 이동 규칙을 깨지 않는다.** next를 가로채는 것은 아직 올릴 것이
// 남아 있을 때뿐이고, 다 올리면 그다음 next는 그대로 다음 장으로 간다.
// prev도 같다 — 위로 올릴 것이 남아 있으면 내리고, 없으면 이전 장이다.
// 그래서 진행자는 "Enter를 누르면 앞으로 간다"는 감각을 잃지 않는다.
//
// 장을 떠나면 자리를 처음으로 되돌린다. 되돌리지 않으면 발표 중에 되짚어
// 왔을 때 목록이 중간에 걸린 채로 떠 있다.
//
// ── 축과 걸음수 ────────────────────────────────────────────────────
//
//   data-reveal="축:걸음[:끝]"
//
//   (빈 값)          → 세로, 한 칸씩
//   x:1              → 가로, 한 칸씩            (#7/2 완주 선물)
//   y:page:0.667     → 세로, 창 높이의 2/3씩    (#8/1 본선 일정)
//   y:1:top          → 세로, 한 칸씩 · 끝은 마지막 칸이 맨 위 (#8/3 FAQ)
//
// **걸음(둘째 칸)** — 숫자면 그만큼의 칸, `page`면 창 하나가 한 걸음이다.
// page는 칸 크기가 제각각인 자리(본선 일정의 표는 한 칸이 한 시간이라
// 1hr짜리와 4hr짜리가 섞여 있다)에서 걸음을 고르게 만든다.
//
// **끝(셋째 칸)** — 어디까지 가느냐를 정한다.
//
//   숫자   page의 배율. `page:0.667`이면 한 걸음이 창의 2/3다. 걸음이
//          창보다 짧으면 앞뒤 화면이 3분의 1씩 겹쳐, 표가 통째로 갈리지
//          않고 이어서 굴러 올라가는 것이 보인다(2026-08-11 요청).
//   top    **마지막 칸이 창의 첫머리에 닿을 때까지** 간다. 기본값은 마지막
//          칸의 *끝*이 창의 끝에 닿으면 멈추는데, 문답처럼 하나씩 짚어 가는
//          자리에서는 마지막 문답이 화면 아래에 걸린 채로 끝나 버린다
//          (2026-08-11 요청 — "마지막 질의박스가 가장 위로 올라갈 때까지").
//
// 축을 속성으로 적는 이유는 **어느 장이 어떻게 넘어가는지가 마크업에
// 드러나야** 하기 때문이다. main.js는 여전히 [data-reveal]만 찾고 축은 모른다.
function readConfig(root) {
  const [axis, per, tail] = String(root.dataset.reveal || '').trim().split(':');
  const ratio = Number(tail);
  return {
    horizontal: axis === 'x',
    page: per === 'page',
    pageRatio: ratio > 0 ? ratio : 1,
    toLast: tail === 'top',
    // 한 걸음에 몇 칸을 넘기는가. 0이나 헛값이 오면 한 칸으로 되돌린다.
    per: Math.max(1, Math.trunc(Number(per)) || 1),
  };
}

// 한 걸음의 길이는 **칸 하나 + 칸 사이 간격**에 걸음당 칸 수를 곱한 것이다.
// 픽셀을 박아 두면 창 크기가 바뀔 때 어긋나므로 실측해서 쓴다.
//
// **getBoundingClientRect가 아니라 offsetWidth/offsetHeight로 잰다.**
// 앞의 것은 transform이 **적용된 뒤**의 크기라, 칸에 확대 연출이 걸려 있으면
// (완주 선물의 gift-pulse는 0.97~1.035배로 숨 쉰다) 재는 순간의 배율이
// 그대로 섞여 들어간다. 실제로 0.97배 시점에 재는 바람에 한 걸음이 3%
// 짧게 나왔고, 그만큼 남은 자리를 reveal이 "아직 더 있다"로 세어 빈 화면이
// 한 번 더 나왔다. offsetWidth는 배치 크기라 transform과 무관하다.
function stepSize(viewport, list, cfg) {
  // 창을 단위로 넘기는 자리는 칸을 재지 않는다 — 창(×배율)이 곧 걸음이다.
  if (cfg.page) {
    const win = cfg.horizontal ? viewport.clientWidth : viewport.clientHeight;
    return win * cfg.pageRatio;
  }

  const first = list.children[0];
  if (!first) return 0;
  const style = getComputedStyle(list);
  const gap = parseFloat(cfg.horizontal ? style.columnGap : style.rowGap) || 0;
  const size = cfg.horizontal ? first.offsetWidth : first.offsetHeight;
  return (size + gap) * cfg.per;
}

// 끝까지 갔을 때 얼마나 밀려 있는가.
//
// 기본은 **꼬리를 맞추는** 거리다 — 마지막 칸의 끝이 창의 끝에 닿으면 멈춘다.
// `top`이면 **마지막 칸의 머리가 창의 머리에 닿는** 거리다. 둘의 차이가
// 창 하나 높이만큼이라, 문답 하나가 화면 아래에 걸린 채 끝나느냐 화면
// 꼭대기에 올라와 끝나느냐가 갈린다.
function maxShift(viewport, list, cfg) {
  const kids = list.children;
  if (!kids.length) return 0;

  if (cfg.toLast) {
    // offsetTop/Left는 배치 좌표라 list에 걸린 transform과 무관하다.
    // 첫 칸을 빼는 것은 offsetParent가 list가 아닐 수도 있기 때문이다 —
    // 둘의 차이만 쓰면 어느 조상을 기준으로 재든 같은 값이 나온다.
    const first = kids[0];
    const last = kids[kids.length - 1];
    return cfg.horizontal
      ? last.offsetLeft - first.offsetLeft
      : last.offsetTop - first.offsetTop;
  }

  return cfg.horizontal
    ? list.scrollWidth - viewport.clientWidth
    : list.scrollHeight - viewport.clientHeight;
}

// 몇 걸음 갈 수 있는가. 창이 낮거나 좁으면 한 번에 보이는 칸 수가 달라지므로
// 고정값이 아니라 실제 크기에서 구한다.
// **올림이 아니라 반올림이다.** 남은 거리가 걸음으로 딱 떨어지지 않을 때
// 올림하면 마지막 걸음이 몇십 픽셀만 움직이는 헛걸음이 된다(본선 일정이
// 1222px에 걸음 299px이라 다섯째 걸음이 26px이었다). 반올림하면 그 자투리가
// 앞 걸음에 얹혀 마지막 걸음만 조금 길어지고, 끝에 서는 것은 paint의
// 자르기가 보장한다. 딱 떨어지는 자리(완주 선물 2.0, FAQ 5.0)는 그대로다.
function maxSteps(viewport, list, cfg) {
  const step = stepSize(viewport, list, cfg);
  if (step <= 0) return 0;
  const travel = maxShift(viewport, list, cfg);
  if (travel <= 1) return 0;
  return Math.max(1, Math.round(travel / step));
}

export function createReveal(root) {
  if (!root) return { has: () => false, next: () => false, prev: () => false, reset() {} };

  const cfg = readConfig(root);
  const list = root.firstElementChild;
  let at = 0;

  function paint() {
    if (!list) return;
    // **마지막 걸음은 끝에 딱 세운다.** 걸음이 남은 거리로 딱 떨어지지 않을
    // 때(창의 2/3씩 가는 본선 일정이 그렇다) 걸음수만큼 곱하면 끝을 지나치거나
    // — 반올림 뒤에는 — 끝에 못 미친다. 실제로 표 아래 27px이 영영 안 나와
    // 폐회식 칸이 잘린 채 끝났다. 마지막 걸음에서만 남은 거리를 통째로 쓰면
    // 그 한 걸음의 길이만 조금 달라지고 끝은 반드시 보인다.
    const travel = maxShift(root, list, cfg);
    const shift = at >= maxSteps(root, list, cfg)
      ? -travel
      : -Math.min(at * stepSize(root, list, cfg), travel);
    list.style.transform = cfg.horizontal
      ? `translateX(${shift}px)`
      : `translateY(${shift}px)`;
    // 앞뒤로 더 있는지 알려 주는 신호. CSS가 이 값으로 페이드를 켠다.
    // 이름은 세로 시절 그대로 두었다 — FAQ의 페이드 규칙이 이 이름을 쓰고,
    // 뜻은 축과 무관하게 "이 방향에 더 있다"이다.
    root.dataset.revealTop = at > 0 ? 'more' : 'end';
    root.dataset.revealBottom = at < maxSteps(root, list, cfg) ? 'more' : 'end';
    // 지금 몇 걸음째인가. 칸을 밀어내는 것 말고 **강조를 옮기는** 연출
    // (본선 일정의 이틀 훑기)이 이 값을 CSS 선택자로 받는다.
    root.dataset.revealAt = String(at);
  }

  function reset() {
    at = 0;
    paint();
  }

  // 처음에 한 번 그린다. 안 그리면 '더 있다' 신호가 첫 화면에서 꺼진 채로
  // 있어, 진행자가 넘길 수 있다는 것을 모른다.
  paint();
  // 창 크기가 바뀌면 칸 크기가 달라져 지금 자리가 어긋난다. 다시 잰다.
  window.addEventListener('resize', paint);

  return {
    // 이 장에 넘길 것이 남아 있는가 — main.js가 next를 가로챌지 판단한다.
    has: () => Boolean(list),
    // **움직이지 않고** 그 방향으로 갈 데가 있는지만 묻는다. 휠은 굴린 양을
    // 모았다가 문턱을 넘을 때 한 걸음 가는데, 갈 데가 없으면 모으지 않고
    // 그대로 카메라에 넘겨야 한다 — 모아 두면 표 끝에서 다음 장으로
    // 넘어가기 전에 헛도는 스크롤이 한 번 생긴다.
    canNext: () => Boolean(list) && at < maxSteps(root, list, cfg),
    canPrev: () => Boolean(list) && at > 0,
    next() {
      if (!list || at >= maxSteps(root, list, cfg)) return false;
      at += 1;
      paint();
      return true;
    },
    prev() {
      if (!list || at <= 0) return false;
      at -= 1;
      paint();
      return true;
    },
    reset,
  };
}
