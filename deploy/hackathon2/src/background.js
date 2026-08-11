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

import { SCENES, sceneOfSlide, sceneRanges, sceneOpacity, cameraT, cameraTransform } from './scenes.js';

export function createBackground({ root }) {
  const map = sceneOfSlide();
  const ranges = sceneRanges(map);
  const last = map.length - 1;

  // 씬 하나당 레이어 하나. 실제로 쓰이는 씬만 만든다.
  const layers = new Map();
  for (const scene of SCENES) {
    if (!ranges.has(scene.id)) continue;
    const el = document.createElement('div');
    el.className = 'scene';
    el.dataset.scene = scene.id;

    // **카메라 상자.** 변환은 <img>가 아니라 이 상자가 받는다.
    //
    // 원래는 전광판 글자를 그림과 같은 변환에 태우려고 만든 상자였다
    // (2026-08-12에 글자가 그림 안으로 들어가면서 그 이유는 사라졌다).
    // 그래도 남긴다 — 씬에 뭔가를 겹칠 일이 다시 생기면 여기에 넣으면 되고,
    // <img>에 직접 거는 것보다 합성 레이어가 안정적이다.
    const cam = document.createElement('div');
    cam.className = 'scene__cam';

    const img = document.createElement('img');
    img.src = scene.src;
    img.alt = '';
    // 첫 씬만 즉시 받고 나머지는 브라우저에 맡긴다. 전부 eager로 두면
    // 표지가 뜨기 전에 2.5MB를 기다린다.
    img.loading = scene.id === map[0] ? 'eager' : 'lazy';
    img.decoding = 'async';
    cam.appendChild(img);

    el.appendChild(cam);
    root.appendChild(el);
    layers.set(scene.id, {
      el, cam,
      range: ranges.get(scene.id),
      camOpts: {
        still: Boolean(scene.still),
        zoom: scene.zoom,
        zoomSpan: scene.zoomSpan,
        panSpan: scene.panSpan,
      },
    });
  }

  let lastP = null;

  // p는 슬라이드 인덱스의 실수다. 3.4면 3번 슬라이드에서 4번으로 40% 온 것이다.
  function render(p) {
    const clamped = Math.min(Math.max(p, 0), last);
    if (clamped === lastP) return;
    lastP = clamped;

    for (const [, layer] of layers) {
      const a = sceneOpacity(clamped, layer.range);
      layer.el.style.opacity = a;
      // 보이지 않는 레이어는 합성 대상에서 뺀다.
      layer.el.style.visibility = a <= 0.001 ? 'hidden' : 'visible';
      if (a <= 0.001) continue;

      if (layer.camOpts.still) {
        layer.cam.style.transform = 'none';
        continue;
      }

      const t = cameraT(clamped, layer.range);
      const view = cameraTransform(t, layer.camOpts);
      // **translateX가 scale보다 앞에 온다.** 변환은 오른쪽부터 적용되므로
      // 이 순서면 이동량이 확대되지 않은 폭의 퍼센트로 계산된다. 순서를
      // 뒤집으면 이동이 배율만큼 함께 커져, 프레임 밖에 숨겨 둔 여유를
      // 넘어서면서 이미지 끝이 화면에 들어온다.
      layer.cam.style.transform =
        `translateX(${view.x.toFixed(3)}%) scale(${view.scale.toFixed(4)})`;
    }
  }

  // 마스터의 인터페이스를 남긴다. 이 덱에서는 슬라이드 인덱스가 곧 진행도다.
  function moveTo(index) {
    render(index);
  }

  render(0);
  return { render, moveTo };
}
