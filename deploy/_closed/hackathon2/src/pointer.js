// 손가락 입력을 의도로 바꾼다. keys.js와 짝이고, 같은 'next'/'prev'를 낸다.
// 좌표도 슬라이드 수도 모르는 것 역시 같다.
//
// **휠은 여기 없다.** 마스터 덱은 휠도 "한 동작에 한 장"으로 받았고 그 누적
// 판정이 이 파일의 절반이었는데, 이 덱에서 휠은 넘기기가 아니라 스크럽이다 —
// 굴린 양이 그대로 배경 카메라의 이동이 된다(src/scrub.js). 두 방식을 함께
// 두면 한 번 굴릴 때 카메라가 흐르면서 장까지 넘어가 두 배로 움직인다.

// 손가락으로 쓸어 넘기기.
//
// **클릭은 넘기지 않는다.** 예전에는 왼쪽 클릭을 다음 장에 묶어 두었는데,
// 창을 앞으로 가져오려고 무심코 누른 클릭에 한 장이 넘어가 무대에서
// 사고가 된다. 손가락은 다르다 — 쓸어 넘기는 것은 명확한 의도다.
//
// **위로 쓸거나 왼쪽으로 쓸면 다음**, 그 반대는 이전이다.
// 손가락이 미는 방향이 곧 화면이 밀려나는 방향이다 — 종이를 옆으로
// 넘기듯 왼쪽으로 밀면 다음 장이 오른쪽에서 들어온다.
// 두 축을 모두 받는 이유: 세로로 긴 휴대폰에서는 위아래로 쓰는 것이
// 자연스럽고, 가로로 든 경우에는 옆으로 쓰는 것이 자연스럽다.

// 이만큼은 움직여야 넘긴 것으로 본다. 짧게 잡으면 글을 읽으려고 살짝
// 건드린 것에도 장이 넘어간다.
const SWIPE_MIN_PX = 48;

// 이보다 오래 끌면 넘기려는 뜻이 아니라 무언가를 살펴본 것으로 본다.
const SWIPE_MAX_MS = 900;

// 두 축 중 더 많이 움직인 쪽을 따른다. 대각선으로 쓸었을 때 두 축이
// 서로 다른 의도를 내지 않도록 하나만 고른다.
export function swipeIntent(dx, dy, elapsedMs) {
  if (elapsedMs > SWIPE_MAX_MS) return null;
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (Math.max(ax, ay) < SWIPE_MIN_PX) return null;
  if (ax >= ay) return dx < 0 ? 'next' : 'prev';
  return dy < 0 ? 'next' : 'prev';
}

export function bindSwipe(target, handle, now = () => Date.now()) {
  let startX = 0;
  let startY = 0;
  let startAt = 0;
  let tracking = false;

  const down = (event) => {
    const t = event.changedTouches ? event.changedTouches[0] : null;
    if (!t) return;
    startX = t.clientX; startY = t.clientY; startAt = now(); tracking = true;
  };

  const up = (event) => {
    if (!tracking) return;
    tracking = false;
    const t = event.changedTouches ? event.changedTouches[0] : null;
    if (!t) return;
    const intent = swipeIntent(t.clientX - startX, t.clientY - startY, now() - startAt);
    if (intent) handle(intent);
  };

  target.addEventListener('touchstart', down, { passive: true });
  target.addEventListener('touchend', up, { passive: true });
  return () => {
    target.removeEventListener('touchstart', down);
    target.removeEventListener('touchend', up);
  };
}
