// 배경 씬 레이어.
//
// 마스터 덱의 배경은 별 canvas 두 장과 blur 오브 네 개였고, 슬라이드와
// 무관하게 혼자 흘렀다. 성능 강등 로직도 그 canvas 루프를 지키기 위한
// 것이었다.
//
// 이 덱의 배경은 **스크롤 진행도가 곧 카메라**다. 씬 이미지를 겹쳐 두고
// 진행도에서 불투명도와 변환을 계산해 얹는다. 매 프레임 수백 개를 그리는
// 일이 없으므로 rAF 루프도, 성능 강등도 필요 없다 — 진행도가 바뀔 때만
// 스타일을 쓴다.

import { SCENES, sceneOfSlide, sceneRanges, sceneOpacity, cameraT, cameraTransform, teamPan } from './scenes.js';
import { flatSlides } from './slides.js';

// 팀 슬라이드는 한 씬 안에서 카메라가 옆으로 옮겨 간다. 어느 장이 몇 번째
// 팀인지 미리 뽑아 둔다.
function teamPanOfSlide() {
  const slides = flatSlides();
  const teams = slides.filter((s) => s.team).length;
  return slides.map((s) => (s.team ? teamPan(s.team - 1, teams) : 0));
}

export function createBackground({ root }) {
  const map = sceneOfSlide();
  const ranges = sceneRanges(map);
  const pans = teamPanOfSlide();
  const last = map.length - 1;

  // 씬 하나당 레이어 하나. 실제로 쓰이는 씬만 만든다.
  const layers = new Map();
  for (const scene of SCENES) {
    if (!ranges.has(scene.id)) continue;
    const el = document.createElement('div');
    el.className = 'scene';
    el.dataset.scene = scene.id;
    const img = document.createElement('img');
    img.src = scene.src;
    img.alt = '';
    // 첫 씬만 즉시 받고 나머지는 브라우저에 맡긴다. 전부 eager로 두면
    // 표지가 뜨기 전에 2.5MB를 기다린다.
    img.loading = scene.id === map[0] ? 'eager' : 'lazy';
    img.decoding = 'async';
    el.appendChild(img);
    root.appendChild(el);
    layers.set(scene.id, {
      el, img,
      range: ranges.get(scene.id),
      cam: { still: Boolean(scene.still), zoom: scene.zoom },
    });
  }

  let lastP = null;

  // p는 슬라이드 인덱스의 실수다. 3.4면 3번 슬라이드에서 4번으로 40% 온 것이다.
  function render(p) {
    const clamped = Math.min(Math.max(p, 0), last);
    if (clamped === lastP) return;
    lastP = clamped;

    // 팀 구간의 가로 이동. 두 팀 사이에서는 선형으로 섞어 카메라가 끊기지
    // 않게 한다.
    const i = Math.floor(clamped);
    const frac = clamped - i;
    const pan = pans[i] * (1 - frac) + (pans[Math.min(i + 1, last)] ?? 0) * frac;

    for (const [, layer] of layers) {
      const a = sceneOpacity(clamped, layer.range);
      layer.el.style.opacity = a;
      // 보이지 않는 레이어는 합성 대상에서 뺀다.
      layer.el.style.visibility = a <= 0.001 ? 'hidden' : 'visible';
      if (a <= 0.001) continue;

      if (layer.cam.still) {
        layer.img.style.transform = 'none';
        continue;
      }

      const t = cameraT(clamped, layer.range);
      const cam = cameraTransform(t, layer.cam);
      // **translateX가 scale보다 앞에 온다.** 변환은 오른쪽부터 적용되므로
      // 이 순서면 이동량이 확대되지 않은 폭의 퍼센트로 계산된다. 순서를
      // 뒤집으면 이동이 배율만큼 함께 커져, 프레임 밖에 숨겨 둔 여유를
      // 넘어서면서 이미지 끝이 화면에 들어온다.
      layer.img.style.transform =
        `translateX(${(cam.x + pan).toFixed(3)}%) scale(${cam.scale.toFixed(4)})`;
    }
  }

  // 마스터의 인터페이스를 남긴다. 이 덱에서는 슬라이드 인덱스가 곧 진행도다.
  function moveTo(index) {
    render(index);
  }

  render(0);
  return { render, moveTo };
}
