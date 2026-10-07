// 하단 목차. 챕터 7개가 점으로 놓이고, 현재 챕터의 점만 알약 모양으로
// 늘어나 그 안이 세로 진행만큼 채워진다. 점 하나로 "7챕터 중 몇 번째,
// 그 안에서 얼마나"가 동시에 읽힌다.
//
// 클릭 대상이 아니다. 조작 수단은 키보드뿐이다(styles/progress.css의
// pointer-events: none).

import { positionOf } from './deck.js';
import { CHAPTERS, rowCount } from './slides.js';

export function progressFor(index) {
  const { chapter, row } = positionOf(index);
  const rows = rowCount(chapter);
  // 1장짜리 챕터는 나눗셈이 0/0이 된다. 도착했으면 다 찬 것으로 본다.
  const ratio = rows > 1 ? row / (rows - 1) : 1;
  return { chapter, row, ratio };
}

export function createProgress(root) {
  root.innerHTML = '';
  const dots = CHAPTERS.map((chapter) => {
    const dot = document.createElement('span');
    dot.className = 'progress__dot';
    const fill = document.createElement('span');
    fill.className = 'progress__fill';
    dot.appendChild(fill);
    root.appendChild(dot);
    return { dot, fill };
  });

  function update(index) {
    const { chapter, ratio } = progressFor(index);
    dots.forEach(({ dot, fill }, i) => {
      dot.classList.toggle('is-current', i === chapter);
      dot.classList.toggle('is-past', i < chapter);
      fill.style.transform = i === chapter ? `scaleX(${ratio})` : 'scaleX(0)';
    });
  }

  return { update };
}
