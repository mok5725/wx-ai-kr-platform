// 마우스 입력을 의도로 바꾼다. keys.js와 짝이고, 같은 'next'/'prev'를 낸다.
// 좌표도 슬라이드 수도 모르는 것 역시 같다.
//
// 진행자가 리모컨을 놓쳤거나 노트북 앞에 앉아 있을 때의 보조 수단이다.
// 키보드가 여전히 주 조작이고, 이 파일은 거기에 길을 더할 뿐이다.

// 휠이 이만큼 멎으면 한 동작이 끝난 것으로 본다.
const GESTURE_GAP_MS = 150;

// 이만큼 굴려야 한 장이다. 일반 마우스 휠 한 칸이 보통 100 안팎이라
// 한 칸에 한 장이 넘어간다.
const WHEEL_THRESHOLD = 40;

export function initialWheelState() {
  return { accum: 0, lastEventAt: Number.NEGATIVE_INFINITY, firedDir: 0 };
}

// 휠 이벤트 하나를 상태에 반영하고 이번 이벤트로 넘어갈지를 돌려주는 순수 함수.
//
// **한 동작에 한 장**이 규칙이다. 단순한 쿨다운으로는 부족하다 — 트랙패드는
// 손을 뗀 뒤에도 관성으로 1초 가까이 이벤트를 쏟아내서, 쿨다운이 그 사이에
// 풀리면 한 번 쓸어넘겼을 뿐인데 두세 장이 넘어간다. 그래서 시간이 아니라
// **동작**을 센다: 휠이 GESTURE_GAP_MS만큼 멎어야 다음 동작이 시작된다.
//
// 한 동작 안에서 방향을 바꾸는 것은 허용한다. 지나쳤다 싶어 반대로 굴리는
// 것은 새 의도이므로 막으면 안 된다.
export function wheelStep(state, deltaY, now) {
  if (!deltaY) return { state, intent: null };

  const dir = deltaY > 0 ? 1 : -1;
  // 앞선 이벤트와 멀리 떨어져 있으면 새 동작이다.
  const base = now - state.lastEventAt > GESTURE_GAP_MS
    ? { accum: 0, firedDir: 0 }
    : state;

  // 방향이 바뀌면 이전 방향의 누적은 버린다. 남겨두면 위아래로 흔들었을 때
  // 서로 상쇄되어 아무 반응도 없다.
  const sameWay = base.accum === 0 || (base.accum > 0) === (deltaY > 0);
  const accum = sameWay ? base.accum + deltaY : deltaY;

  // 이 동작에서 이 방향으로는 이미 한 장 넘겼다면 더는 넘기지 않는다.
  if (base.firedDir === dir || Math.abs(accum) < WHEEL_THRESHOLD) {
    return { state: { accum, lastEventAt: now, firedDir: base.firedDir }, intent: null };
  }
  return {
    state: { accum: 0, lastEventAt: now, firedDir: dir },
    intent: dir > 0 ? 'next' : 'prev',
  };
}

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

export function bindWheel(target, handle, now = () => Date.now()) {
  let state = initialWheelState();
  const listener = (event) => {
    const result = wheelStep(state, event.deltaY, now());
    state = result.state;
    if (!result.intent) return;
    // body가 overflow: hidden이라 스크롤될 것은 없지만, 브라우저의
    // 오버스크롤 제스처(뒤로가기 등)까지 막으려면 필요하다.
    event.preventDefault();
    handle(result.intent);
  };
  // preventDefault를 쓰려면 passive를 명시적으로 꺼야 한다.
  target.addEventListener('wheel', listener, { passive: false });
  return () => target.removeEventListener('wheel', listener);
}
