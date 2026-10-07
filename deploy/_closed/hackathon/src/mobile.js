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

// 가로로 눕힌다. 덱은 16:9로 짜여 있어 세로로 보면 글자가 잘게 접힌다.
// lock은 전체화면 안에서만 허용되고, 지원하지 않는 브라우저에서는 거부된다.
// 어느 쪽이든 발표는 계속되어야 하므로 조용히 넘긴다.
async function lockLandscape(win) {
  try {
    await win.screen?.orientation?.lock?.('landscape');
  } catch {
    /* 지원하지 않거나 거부됨 — 세로 그대로 본다. */
  }
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

  doc.addEventListener('fullscreenchange', sync);

  return { enter, leave, toggle, sync };
}
