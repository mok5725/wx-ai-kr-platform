// 조립. 모듈들을 아는 유일한 곳이다.

import { positionOf, clampIndex, toHash, fromHash, absoluteCol, chapterLeft, offsetAt } from './deck.js';
import { flatSlides, placeholders } from './slides.js';
import { bindKeys } from './keys.js';
import { bindSwipe } from './pointer.js';
import {
  DEFAULT_MODE, SNAP_DELAY_MS, GLIDE_MS,
  advance, snapTarget, indexFor, glide,
} from './scrub.js';
import { createBackground } from './background.js';
import { createProgress } from './progress.js';
import { createTimetable } from './timetable.js';
import { mountRoster } from './roster.js';
import { createTeamCard } from './teamcard.js';
import { createReveal } from './reveal.js';
import { createNotesHost } from './notes.js';
import { runCountUp } from './countup.js';
import { initMobileFullscreen } from './mobile.js';

const deckEl = document.getElementById('deck');
const slideEls = [...document.querySelectorAll('.slide')];
const SLIDES = flatSlides();

// 챕터를 계단식으로 놓는다. 챕터는 세로로 쌓이고, 한 챕터의 장들은
// 가로로 늘어선다. CSS에 nth-child로 박아두면 챕터가 하나 늘 때 조용히
// 화면 밖으로 나가므로, 좌표의 원본인 deck.js에서 계산해 넣는다.
//
// **px이 아니라 무대 단위(--stage-w/--stage-h)로 넣는다.** px으로 박으면
// 창이 바뀔 때마다 다시 써야 하고, 전체화면 진입처럼 resize 이벤트를 놓칠 수
// 있는 자리에서 챕터가 통째로 어긋난다. 무대 크기는 tokens.css가 가지고
// 있어서, calc로 걸어두면 창이 바뀌는 대로 저절로 따라간다.
[...document.querySelectorAll('.chapter')].forEach((el, i) => {
  el.style.left = `calc(var(--stage-w) * ${chapterLeft(i)})`;
  el.style.top = `calc(var(--stage-h) * ${i})`;
});

// 문구 배치와 흰 판도 슬라이드 데이터에서 나온다. 마크업에 클래스로 적으면
// 씬을 다시 뽑아 배치를 옮길 때 slides.js와 index.html 두 곳을 고쳐야 하고,
// 한 곳을 빠뜨리면 스크림은 오른쪽인데 글은 왼쪽에 남는다.
slideEls.forEach((el, i) => {
  const slide = SLIDES[i];
  if (!slide) return;
  el.dataset.place = slide.place;
  if (slide.card) el.classList.add('slide--card');
});

// #deck을 미는 양은 px이어야 해서, tokens.css의 --stage-w/--stage-h와 같은
// 식을 여기서 한 번 더 계산한다. 두 곳이 어긋나면 장이 반쯤 걸쳐 선다 —
// 식을 고칠 일이 생기면 반드시 함께 고친다.
//
// **무대는 화면 안에 들어가는 가장 큰 16:9 사각형이다**(2026-08-11).
// 예전에는 높이가 그냥 화면 높이(100vh)여서, 세로로 긴 화면에서 무대가 16:9가
// 아니었고 배경 밖으로 글자가 새어 나갔다.
function stageSize() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    w: Math.min(vw, vh * (16 / 9)),
    h: Math.min(vh, vw * (9 / 16)),
  };
}

const background = createBackground({ root: document.getElementById('bg') });

const progress = createProgress(document.getElementById('progress'));

const timetable = createTimetable([...document.querySelectorAll('[data-timetable]')]);
timetable.start();

mountRoster([...document.querySelectorAll('[data-roster]')]);

// 팀 소개 카드는 덱 밖에 붙박이로 선다 — 사유는 teamcard.js 첫머리 참고.
const teamCard = createTeamCard(document.getElementById('teamcard'));

// 한 장 안에서 여러 번 넘기는 자리. 지금은 FAQ 한 장뿐이다.
// **id로 찾지 않고 클래스로 찾는다** — 다른 장에 같은 장치를 붙일 때
// main.js를 고치지 않아도 되게.
const reveals = new Map(
  [...document.querySelectorAll('[data-reveal]')].map((el) => [
    el.closest('.slide')?.dataset.slideId,
    createReveal(el),
  ]),
);

function revealHere() {
  return reveals.get(SLIDES[index]?.id);
}

// ── 임시로 채운 자리의 세 겹 방어 (콘텐츠 문서 §4.9) ─────────────────
//
// ① 데이터의 placeholder 플래그가 원본이다. ② 화면의 ⚠︎ 배지를 **여기서
// 만들어 붙인다** — 마크업에 손으로 적으면 데이터를 갈아끼울 때 배지가
// 남아 확정된 자리에 경고가 뜨거나, 반대로 임시 자리에서 배지가 빠진다.
// ③ 테스트가 목록으로 출력한다(tests/slides.test.js).
//
// 여기에 콘솔 경고와 클로징 슬라이드의 남은 개수를 더한다. 리허설에서
// 아무도 ⚠︎ 를 못 봤을 경우의 마지막 그물이다.
SLIDES.forEach((slide, i) => {
  if (!slide.placeholder) return;
  const el = slideEls[i];
  if (!el) return;
  const badge = document.createElement('p');
  badge.className = 'needs-fact';
  badge.textContent = `⚠︎ ${slide.placeholder}`;
  el.prepend(badge);
});

const WAITING = placeholders();
if (WAITING.length) {
  console.warn(
    `[챌린저 덱] 임시로 채운 자리 ${WAITING.length}곳이 남아 있습니다. 확정본으로 갈아끼우세요:\n` +
    WAITING.map((p) => `  · ${p.id} — ${p.title} (${p.reason})`).join('\n'),
  );
}

// 클로징에 남은 개수를 띄우던 줄은 걷어냈다(2026-08-10 요청) — 무대에
// 뜨는 문구가 아니라 제작 중 확인용이었고, 콘솔 경고와 테스트 목록이
// 같은 일을 이미 한다.

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

  const stage = stageSize();
  const { chapter, row } = positionOf(index);

  // 계단식 배치라 챕터 안에서 움직이면 --dx만, 챕터가 바뀌면 --dy만
  // 달라진다. 둘이 동시에 바뀌지 않으므로 화면은 언제나 상하좌우로만
  // 미끄러진다. 가로 = 같은 맥락, 세로 = 맥락이 바뀜.
  const x = absoluteCol(chapter, row);
  deckEl.style.setProperty('--dx', `${-x * stage.w}px`);
  deckEl.style.setProperty('--dy', `${-chapter * stage.h}px`);
  // **배경은 여기서 움직이지 않는다.** 카메라는 인덱스가 아니라 진행도를
  // 따르고(scrub.js), 진행도는 스크롤과 정렬 애니메이션이 함께 만든다.
  // 여기서 인덱스로 한 번 더 밀면 스크럽 도중에 카메라가 장 경계로 튄다.

  slideEls.forEach((el, i) => el.classList.toggle('is-active', i === index));

  // 슬라이드별 배경 강조를 CSS가 이 값으로 건다.
  document.body.dataset.slide = slideEls[index]?.dataset.slideId ?? '';

  // 문구 배치. 스크림(background.css)이 이 값을 보고 좌우·위아래로 옮겨
  // 간다 — 문구가 오른쪽에 있는데 스크림만 왼쪽에 깔려 있으면 글이 묻힌다.
  // 슬라이드 자체의 정렬은 .slide[data-place]가 맡는다(styles/scene.css).
  const slide = SLIDES[index];
  document.body.dataset.place = slide?.place ?? 'left-center';
  document.body.dataset.scrim = slide?.scrim ?? 'on';

  // 붙박이 팀 카드의 내용. 팀 장이 아니면 판째 꺼진다.
  teamCard.update(slide);

  // 장을 떠나면 목록을 처음으로 되돌린다 — 되짚어 왔을 때 중간에 걸린 채로
  // 떠 있으면 진행자가 어디까지 보여줬는지 알 수 없다.
  for (const [id, r] of reveals) {
    if (id !== slide?.id) r.reset();
  }

  progress.update(index);
  notes.publish(index);

  // 진입 애니메이션이 끝날 무렵 숫자가 올라가야 자연스럽다.
  const active = slideEls[index];
  if (active) setTimeout(() => runCountUp(active), 320);

  // 문구의 등장·퇴장은 **전부 CSS가 맡는다** (styles/slides.css의 진입
  // 애니메이션). 제목을 글자 단위로 타이핑하던 코드는 2026-08-10에 걷어냈다 —
  // 페이드 인/아웃으로 바꾸라는 요청이었고, 타이핑은 JS가 매 프레임 제목의
  // DOM을 다시 쓰는 구조라 CSS로 넘기면서 그 모듈째 사라졌다.
  // is-active 클래스 하나만 토글하면 되므로 리사이즈 재렌더에서 문구가
  // 다시 등장하는 문제도 없다.

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

// ── 스크롤 스크럽과 자동 정렬 ────────────────────────────────────────
//
// 카메라는 **진행도**를 따른다. 진행도는 슬라이드 인덱스의 실수이고,
// 휠을 굴리면 그만큼 흐르고 스크롤이 멎으면 가장 가까운 장으로 정렬된다.
//
// 기본 모드는 '배경만 연속'이다(scrub.js의 DEFAULT_MODE): 카메라는 스크롤에
// 붙고 문구는 한 장씩 바뀐다. 문구까지 연속으로 움직이는 모드는 스크롤 중
// 이전 문구와 다음 문구가 겹쳐 보이므로 리허설에서 실물로 판단한다.
const mode = DEFAULT_MODE;
const lastIndex = SLIDES.length - 1;

let camera = index;      // 진행도. 카메라가 놓인 자리다.
let glideFrom = index;   // 정렬 애니메이션의 시작값
let glideTo = index;
let glideAt = 0;         // 시작 시각. 0이면 정렬 중이 아니다.
let snapTimer = 0;

function paintCamera() {
  background.render(camera);
  if (mode !== 'all') return;
  // '전체 연속' 모드에서는 문구까지 진행도를 따른다. 전환을 끄고 매 프레임
  // 직접 좌표를 넣는다 — CSS transition을 켠 채로 매 프레임 새 값을 주면
  // 항상 뒤쫓기만 해서 스크롤을 놓은 뒤에도 한참 흐른다.
  const stage = stageSize();
  const at = offsetAt(camera);
  document.body.classList.add('is-scrubbing');
  deckEl.style.setProperty('--dx', `${-at.x * stage.w}px`);
  deckEl.style.setProperty('--dy', `${-at.y * stage.h}px`);
}

// 정렬 애니메이션. rAF로 직접 보간한다 —
// scrollTo({behavior:'smooth'})는 브라우저마다 속도가 달라 무대에서
// 예측이 안 된다. easeOutCubic으로 항상 같은 시간에 도착한다.
function stepGlide(now) {
  if (!glideAt) return;
  camera = glide(glideFrom, glideTo, now - glideAt);
  paintCamera();
  if (camera === glideTo) {
    glideAt = 0;
    return;
  }
  requestAnimationFrame(stepGlide);
}

function startGlide(target) {
  glideFrom = camera;
  glideTo = target;
  if (glideFrom === glideTo) {
    glideAt = 0;
    return;
  }
  glideAt = performance.now();
  requestAnimationFrame(stepGlide);
}

function cancelGlide() {
  glideAt = 0;
}

// **정렬 타이머는 프로그램이 카메라를 움직이는 동안 걸지 않는다.**
// 걸면 정렬이 끝나는 순간 자기 자신을 다시 호출한다.
function scheduleSnap() {
  clearTimeout(snapTimer);
  snapTimer = setTimeout(() => {
    const target = snapTarget(camera, lastIndex);
    startGlide(target);
    // 정렬 목표가 지금 떠 있는 장과 다를 수 있다 — 반쯤 걸친 자리에서
    // 멎었다면 문구도 그 장으로 함께 간다.
    if (target !== index) {
      index = target;
      render();
    }
  }, SNAP_DELAY_MS);
}

function scrub(deltaY) {
  cancelGlide();
  camera = advance(camera, deltaY, lastIndex);
  paintCamera();

  // 문구는 경계를 지날 때 한 번 바뀐다(배경만 연속 모드).
  const next = indexFor(camera, lastIndex);
  if (next !== index) {
    index = next;
    render();
  }
  scheduleSnap();
}

function goTo(next) {
  const clamped = clampIndex(next);
  if (clamped === index) return;
  index = clamped;
  render();
  // 키보드·리모컨으로 넘긴 것도 카메라는 같은 시간에 같은 방식으로 따라간다.
  clearTimeout(snapTimer);
  startGlide(clamped);
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
  // **먼저 이 장 안에서 올릴 것이 있는지 본다.** 있으면 목록만 한 칸 올리고
  // 장은 그대로 둔다(reveal.js). 다 올렸으면 그다음 next가 다음 장이다.
  next: () => {
    if (revealHere()?.next()) return;
    goTo(index + 1);
  },
  prev: () => {
    if (revealHere()?.prev()) return;
    goTo(index - 1);
  },
  fullscreen: toggleFullscreen,
  notes: () => notes.open(),
};

const act = (intent) => INTENTS[intent]?.();

bindKeys(window, act);

// 휠은 **한 장 넘기기가 아니라 스크럽**이다. 마스터는 한 제스처에 한 장이었고
// (pointer.js의 wheelStep), 이 덱은 굴린 양이 그대로 카메라의 이동이다.
// **클릭은 넘기지 않는다** — 창을 앞으로 가져오려고 무심코 누른 클릭에 한
// 장이 넘어가 무대에서 사고가 된다.
window.addEventListener('wheel', (event) => {
  // body가 overflow: hidden이라 스크롤될 것은 없지만, 브라우저의
  // 오버스크롤 제스처(뒤로가기 등)까지 막으려면 필요하다.
  event.preventDefault();
  scrub(event.deltaY);
}, { passive: false });

// 손가락으로 쓸면 한 장씩 넘어간다(참가자 휴대폰). 휴대폰에서 스크럽까지
// 흉내내지 않는다 — 화면이 작아 배경의 카메라 이동이 거의 안 보이고,
// 손가락 관성까지 진행도에 실으면 어느 장에 있는지 알기 어려워진다.
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
// 첫 그림에서는 카메라를 정확히 그 장에 놓는다(애니메이션 없이).
camera = index;
paintCamera();

// 챕터가 제자리에 놓였다. 이제 보여준다 — 이 클래스가 붙어 있는 동안은
// 여덟 챕터가 (0,0)에 겹쳐 있어서 25장의 제목이 한 덩어리로 보인다
// (styles/slides.css의 html.is-booting 규칙).
document.documentElement.classList.remove('is-booting');

window.__deck = { goTo, current: () => index };
