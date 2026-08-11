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

// 목록을 얼마나 움직일지는 **칸 하나 높이 + 칸 사이 간격**이다. 픽셀을 박아
// 두면 창 크기가 바뀔 때 어긋나므로 실측해서 쓴다.
function stepSize(list) {
  const first = list.children[0];
  if (!first) return 0;
  const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
  return first.getBoundingClientRect().height + gap;
}

// 몇 번 올릴 수 있는가. 창이 낮으면 한 번에 두 개만 보일 수도 있으므로
// 고정값이 아니라 실제 높이에서 구한다.
function maxSteps(viewport, list) {
  const step = stepSize(list);
  if (step <= 0) return 0;
  const hidden = list.scrollHeight - viewport.clientHeight;
  if (hidden <= 1) return 0;
  return Math.ceil(hidden / step);
}

export function createReveal(root) {
  if (!root) return { has: () => false, next: () => false, prev: () => false, reset() {} };

  const list = root.firstElementChild;
  let at = 0;

  function paint() {
    if (!list) return;
    list.style.transform = `translateY(${-at * stepSize(list)}px)`;
    // 위아래로 더 있는지 알려 주는 신호. CSS가 이 값으로 페이드를 켠다.
    root.dataset.revealTop = at > 0 ? 'more' : 'end';
    root.dataset.revealBottom = at < maxSteps(root, list) ? 'more' : 'end';
  }

  function reset() {
    at = 0;
    paint();
  }

  // 처음에 한 번 그린다. 안 그리면 '아래에 더 있다' 신호가 첫 화면에서
  // 꺼진 채로 있어, 진행자가 넘길 수 있다는 것을 모른다.
  paint();
  // 창 크기가 바뀌면 칸 높이가 달라져 지금 자리가 어긋난다. 다시 잰다.
  window.addEventListener('resize', paint);

  return {
    // 이 장에 올릴 것이 남아 있는가 — main.js가 next를 가로챌지 판단한다.
    has: () => Boolean(list),
    next() {
      if (!list || at >= maxSteps(root, list)) return false;
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
