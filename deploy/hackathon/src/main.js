// 조립. 모듈들을 아는 유일한 곳이다.

import { positionOf, clampIndex, toHash, fromHash, absoluteCol, chapterLeft } from './deck.js';
import { bindKeys } from './keys.js';
import { bindWheel, bindSwipe } from './pointer.js';
import { createBackground } from './background.js';
import { createProgress } from './progress.js';
import { createTimetable, renderSessionTrio } from './timetable.js';
import { mountRoster } from './roster.js';
import { createNotesHost } from './notes.js';
import { runCountUp } from './countup.js';
import { typeInto } from './typing.js';
import { initMobileFullscreen } from './mobile.js';

const deckEl = document.getElementById('deck');
const slideEls = [...document.querySelectorAll('.slide')];
// 상단 바 오른쪽의 행사 표기. 표지에서만 감춘다.
const brandEventEl = document.querySelector('.brandbar__event');

// 챕터를 계단식으로 놓는다. 챕터는 세로로 쌓이고, 한 챕터의 장들은
// 가로로 늘어선다. CSS에 nth-child로 박아두면 챕터가 하나 늘 때 조용히
// 화면 밖으로 나가므로, 좌표의 원본인 deck.js에서 계산해 넣는다.
// vw/vh 단위라 창 크기가 바뀌어도 다시 계산할 필요가 없다.
[...document.querySelectorAll('.chapter')].forEach((el, i) => {
  el.style.left = `${chapterLeft(i) * 100}vw`;
  el.style.top = `${i * 100}vh`;
});

const background = createBackground({
  far: document.getElementById('stars-far'),
  near: document.getElementById('stars-near'),
  layers: {
    deep: document.getElementById('layer-deep'),
    aurora: document.getElementById('layer-aurora'),
    far: document.getElementById('layer-far'),
    near: document.getElementById('layer-near'),
  },
});

const progress = createProgress(document.getElementById('progress'));

const timetable = createTimetable([...document.querySelectorAll('[data-timetable]')]);
timetable.start();

// 3-2 오전·3-3 오후의 3분할도 같은 시간표 원본(schedule.js)에서 만든다.
// 3-1 전체 보기와 문구가 어긋나지 않게 하기 위함이다.
for (const root of document.querySelectorAll('[data-trio]')) renderSessionTrio(root);

mountRoster([...document.querySelectorAll('[data-roster]')]);

let index = fromHash(window.location.hash);

// 연타 처리: 전환을 큐에 쌓지 않는다. 인덱스는 즉시 갱신하고
// transform은 항상 최신 인덱스의 좌표를 쓴다. Enter를 세 번 빠르게
// 누르면 세 번 미끄러지지 않고 최종 위치로 한 번에 간다.
//
// isResize가 true면 리사이즈로 인한 재계산이다: 슬라이드 인덱스는
// 그대로인데 px 좌표만 바뀌므로, #deck과 배경 레이어의 전환을 잠깐
// 꺼서 미끄러지지 않고 즉시 스냅하게 만든다. 기본값(false)은 기존
// 내비게이션 동작 그대로다 — 700ms 동안 부드럽게 미끄러진다.
function render(isResize = false) {
  if (isResize) {
    // #deck과 배경 레이어의 transition을 CSS에서 끈다.
    document.body.classList.add('is-resizing');
  }

  const { chapter, row } = positionOf(index);

  // 계단식 배치라 챕터 안에서 움직이면 --dx만, 챕터가 바뀌면 --dy만
  // 달라진다. 둘이 동시에 바뀌지 않으므로 화면은 언제나 상하좌우로만
  // 미끄러진다. 가로 = 같은 맥락, 세로 = 맥락이 바뀜.
  const x = absoluteCol(chapter, row);
  deckEl.style.setProperty('--dx', `${-x * window.innerWidth}px`);
  deckEl.style.setProperty('--dy', `${-chapter * window.innerHeight}px`);
  background.moveTo(x, chapter);

  slideEls.forEach((el, i) => el.classList.toggle('is-active', i === index));

  // 슬라이드별 배경 강조(networking, closing)를 CSS가 이 값으로 건다.
  document.body.dataset.slide = slideEls[index]?.dataset.slideId ?? '';

  // 표지에는 화면 한가운데에 "∞ 2026 WX해커톤"이 크게 있다. 오른쪽 위에
  // 같은 락업이 또 뜨면 산만하므로 표지에서만 감추고, 2장부터 서서히
  // 나타나 끝까지 남는다. 전환은 styles/slides.css가 맡는다.
  if (brandEventEl) brandEventEl.style.opacity = index === 0 ? '0' : '1';
  progress.update(index);
  notes.publish(index);

  // 진입 애니메이션이 끝날 무렵 숫자가 올라가야 자연스럽다.
  const active = slideEls[index];
  if (active) setTimeout(() => runCountUp(active), 320);

  // 제목과 소제목은 자리를 지킨 채 글자만 타이핑된다. 리사이즈로 인한
  // 재렌더에서는 돌리지 않는다 — 창을 조금 늘렸을 뿐인데 제목이 다시
  // 써지면 발표 중에 사고로 보인다.
  //
  // 소제목을 빠르게(16ms/자) 치는 이유: 한 장(#5/1)의 소제목이 38자라
  // 제목과 같은 속도로는 1초를 넘겨 본문 등장까지 밀린다.
  // 본문은 제목이 다 쳐진 뒤에 나타난다 — 지연값은 styles/slides.css에 있다.
  if (active && !isResize) {
    typeInto(active.querySelector('.slide__eyebrow'), { delay: 100, msPerChar: 16 });
    typeInto(active.querySelector('.slide__title'), { delay: 260, msPerChar: 28 });
  }

  const hash = toHash(index);
  if (window.location.hash !== hash) {
    // 슬라이드마다 히스토리를 쌓으면 뒤로가기가 덱을 거슬러 올라간다.
    window.history.replaceState(null, '', hash);
  }

  if (isResize) {
    // 강제 리플로우: transition이 꺼진 채로 새 좌표를 브라우저가 실제로
    // 커밋하게 만드는 지점이다. 이 읽기가 없으면 transition을 다시
    // 켜는 시점에 아직 이전 값이 적용된 상태라, 재활성화와 동시에
    // 새 값으로 애니메이션이 걸려버려 스냅이 아니라 미끄러짐이 된다.
    // 즉, 이 줄은 죽은 코드가 아니라 스냅을 강제하는 핵심 트릭이다.
    void deckEl.offsetHeight;
    document.body.classList.remove('is-resizing');
  }
}

function goTo(next) {
  const clamped = clampIndex(next);
  if (clamped === index) return;
  index = clamped;
  render();
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    // requestFullscreen은 사용자 제스처를 요구한다. 키 입력이 제스처다.
    document.documentElement.requestFullscreen().catch(() => {
      // 브라우저가 거부해도 발표는 계속된다. 조용히 넘긴다.
    });
  }
}

const notes = createNotesHost({
  onIntent: (intent) => {
    const action = INTENTS[intent];
    if (action) action();
  },
});

const INTENTS = {
  next: () => goTo(index + 1),
  prev: () => goTo(index - 1),
  fullscreen: toggleFullscreen,
  notes: () => notes.open(),
};

const act = (intent) => INTENTS[intent]?.();

bindKeys(window, act);
// 휠을 굴리면 앞뒤로. **클릭은 넘기지 않는다** — 창을 앞으로 가져오려고
// 무심코 누른 클릭에 한 장이 넘어가 무대에서 사고가 된다.
bindWheel(window, act);
// 손가락으로 쓸어도 같은 의도를 낸다(참가자 휴대폰).
bindSwipe(window, act);

document.addEventListener('fullscreenchange', () => {
  document.body.classList.toggle('is-fullscreen', Boolean(document.fullscreenElement));
});

// 휴대폰으로 들어온 사람에게만 왼쪽 아래 전체화면 버튼을 띄운다.
// 노트북(마우스)에서는 아무것도 하지 않는다 — 진행자는 F 키를 쓴다.
initMobileFullscreen();

// 창 크기가 바뀌면 px로 계산한 좌표가 어긋난다. 다시 그린다.
// 인덱스는 그대로이므로 내비게이션처럼 미끄러지면 안 된다 — isResize를
// 켜서 render()가 전환을 잠깐 끄고 스냅하게 한다. F 키로 전체화면에
// 들어갈 때 대부분의 브라우저가 resize를 함께 발생시키는데, 발표자의
// 첫 동작에서 스퓨리어스한 700ms 미끄러짐이 나오지 않아야 한다.
window.addEventListener('resize', () => render(true));

// 뒤로가기나 주소창 편집으로 해시가 바뀌면 따라간다.
window.addEventListener('hashchange', () => goTo(fromHash(window.location.hash)));

render();

// 챕터가 제자리에 놓였다. 이제 보여준다 — 이 클래스가 붙어 있는 동안은
// 여덟 챕터가 (0,0)에 겹쳐 있어서 25장의 제목이 한 덩어리로 보인다
// (styles/slides.css의 html.is-booting 규칙).
document.documentElement.classList.remove('is-booting');

window.__deck = { goTo, current: () => index };
