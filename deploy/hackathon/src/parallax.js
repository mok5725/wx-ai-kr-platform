// 배경 시차. 내용 레이어가 화면 하나만큼 통째로 움직일 때
// 배경은 계수만큼만 따라 흐른다. 계수 차이가 깊이감을 만든다.
//
// 근거리 별(0.11)이 원거리 별(0.03)보다 3.7배 빨리 흐르는 것이 핵심이다.
// 두 값을 같게 두면 배경이 평면으로 보인다.
//
// deepSky(은하·성운)는 가장 작다. 아득히 멀어 아무리 움직여도 가까워지지
// 않는다는 것이 이 레이어의 전부라, 원거리 별보다도 느리게 흘러야 한다.

import { chapterCount } from './slides.js';
import { totalCols } from './deck.js';

export const PARALLAX = {
  deepSky: 0.012,
  aurora: 0.04,
  farStars: 0.03,
  nearStars: 0.11,
};

// 두 축이 지나는 칸 수가 다르다 — 계단식 배치라 가로 15칸, 세로 6칸이다.
// 같은 계수를 그대로 쓰면 긴 축의 드리프트가 두 배 반이 되어 배경이 화면
// 밖으로 밀려난다. 짧은 축을 기준으로 긴 축을 줄여, 하루 동안 배경이
// 가로로 흐르는 폭과 세로로 흐르는 폭을 같게 맞춘다.
//
// 챕터 수나 장수가 바뀌면 두 값도 따라 바뀐다. 손으로 적은 상수가 아니다.
const X_STEPS = totalCols() - 1;
const Y_STEPS = chapterCount() - 1;
const REF_STEPS = Math.min(X_STEPS, Y_STEPS);

export const X_SCALE = REF_STEPS / X_STEPS;
export const Y_SCALE = REF_STEPS / Y_STEPS;

// x는 챕터 안의 순번이 아니라 **화면 전체 기준의 절대 열**이다
// (deck.js의 absoluteCol). y는 챕터 번호다. 챕터 경계에서 배경만 따로
// 튀지 않게 하려면 덱과 같은 좌표를 봐야 한다.
export function offsetFor(layer, x, y, viewport) {
  const factor = PARALLAX[layer];
  if (!factor) return { x: 0, y: 0 };
  return {
    x: (-x * viewport.width * factor * X_SCALE) || 0,
    y: (-y * viewport.height * factor * Y_SCALE) || 0,
  };
}
