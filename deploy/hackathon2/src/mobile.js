// 휴대폰으로 들어온 사람을 위한 전체화면.
//
// 진행자는 프로젝터 앞에서 F 키를 쓴다(main.js의 toggleFullscreen).
// 이 파일이 상대하는 것은 QR을 찍고 들어온 참가자의 휴대폰이다. 그래서
// 버튼은 **손가락 입력 장치에서만** 뜬다 — 발표 노트북 화면에 군더더기
// 버튼이 하나 더 뜨는 것이 무대에서는 사고다.
//
// **자동 진입은 브라우저가 막는다.** requestFullscreen은 사용자 제스처를
// 요구해서 페이지가 뜨자마자 부를 수 없다. 그래서 첫 손가락 접촉을 제스처로
// 삼는다 — 화면을 처음 만지는 순간이 사람 입장에서는 곧 진입 시점이다.
//
// 아이폰 사파리는 요소 전체화면 API 자체가 없다(아이패드·안드로이드는 있다).
// 없는 곳에서는 버튼을 띄우지 않는다. 되지도 않는 버튼을 눌러보게 하는 것이
// 아무것도 없는 것보다 나쁘다.

export const FS_LABEL = { on: '✕  닫기', off: '⤢  전체화면' };

// 버튼 하나가 두 가지 일을 한다. 자리는 그대로 두고 글자만 바꾼다.
export function fullscreenLabel(isActive) {
  return isActive ? FS_LABEL.on : FS_LABEL.off;
}

export function supportsFullscreen(doc = document) {
  return typeof doc.documentElement?.requestFullscreen === 'function';
}

// 마우스가 아니라 손가락인가. 노트북에는 버튼을 띄우지 않기 위한 조건이다.
export function isCoarsePointer(win = window) {
  return Boolean(win.matchMedia?.('(pointer: coarse)')?.matches);
}

// 휴대폰 전체화면 버튼을 띄울 자리인가.
export function shouldOfferFullscreen(win = window, doc = document) {
  return isCoarsePointer(win) && supportsFullscreen(doc);
}

// 잠글 방향의 후보. 'landscape'를 모르는 브라우저가 'landscape-primary'는
// 받는 경우가 있어 둘을 차례로 시도한다. 앞의 것이 되면 뒤는 부르지 않는다.
export const LANDSCAPE_TRIES = ['landscape', 'landscape-primary'];

// 가로로 눕힌다. 덱은 16:9로 짜여 있어 세로로 보면 무대가 화면 가운데
// 좁은 띠로 쪼그라든다.
//
// **전체화면 안에서만 허용된다.** 그래서 부르는 쪽은 반드시 전체화면 진입을
// 기다린 뒤에 부른다(enter). 아이폰 사파리에는 lock 자체가 없다 —
// 되는지 물어보고 없으면 조용히 물러난다. 어느 쪽이든 발표는 계속된다.
export async function lockLandscape(win = window) {
  const orientation = win.screen?.orientation;
  if (typeof orientation?.lock !== 'function') return false;
  for (const value of LANDSCAPE_TRIES) {
    try {
      await orientation.lock(value);
      return true;
    } catch {
      /* 이 값은 거부됐다 — 다음 후보로 넘어간다. */
    }
  }
  return false;
}

function unlockOrientation(win) {
  try {
    win.screen?.orientation?.unlock?.();
  } catch {
    /* 위와 같다. */
  }
}

export function initMobileFullscreen({ win = window, doc = document } = {}) {
  const button = doc.getElementById('fs-btn');
  if (!button || !shouldOfferFullscreen(win, doc)) return null;

  const isActive = () => Boolean(doc.fullscreenElement);

  const sync = () => {
    button.textContent = fullscreenLabel(isActive());
    button.setAttribute('aria-pressed', String(isActive()));
  };

  async function enter() {
    try {
      await doc.documentElement.requestFullscreen();
      await lockLandscape(win);
    } catch {
      /* 브라우저가 거부해도 덱은 그대로 보인다. */
    }
  }

  async function leave() {
    unlockOrientation(win);
    try {
      await doc.exitFullscreen();
    } catch {
      /* 위와 같다. */
    }
  }

  const toggle = () => (isActive() ? leave() : enter());

  button.hidden = false;
  sync();

  // 버튼을 누른 것이 넘기기(쓸어 넘김)로 새어 나가지 않게 막는다.
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    toggle();
  });
  button.addEventListener('touchend', (event) => event.stopPropagation(), { passive: true });

  // 첫 접촉 한 번만 자동 진입에 쓴다. once가 붙어 있어 이후에는
  // 사용자가 버튼으로만 오간다 — 닫아 둔 사람을 다시 끌고 들어가지 않는다.
  doc.addEventListener('touchend', () => {
    if (!isActive()) enter();
  }, { once: true, passive: true });

  // 전체화면에 들어갈 때마다 방향을 다시 잠근다. enter()에서 한 번
  // 부르지만, 그 호출은 requestFullscreen이 풀리는 순간이라 브라우저에 따라
  // "아직 전체화면이 아니다"로 거부된다. 실제로 전체화면이 된 것을 알리는
  // 이 이벤트에서 한 번 더 부르면 그 틈이 메워진다. 이미 잠겨 있으면
  // 두 번째 호출은 아무 일도 하지 않는다.
  doc.addEventListener('fullscreenchange', () => {
    sync();
    if (isActive()) lockLandscape(win);
  });

  return { enter, leave, toggle, sync };
}
