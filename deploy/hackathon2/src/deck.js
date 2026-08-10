// 슬라이드 좌표계. 21장을 (chapter, row) 격자에 놓고, 선형 순서는
// 열 우선(한 챕터의 모든 행을 지나고 다음 챕터로)으로 매긴다.
// DOM을 모르는 순수 함수만 둔다. transform 적용은 main.js가 한다.

import { chapterCount, rowCount, totalSlides } from './slides.js';

function buildOrder() {
  const order = [];
  for (let chapter = 0; chapter < chapterCount(); chapter += 1) {
    for (let row = 0; row < rowCount(chapter); row += 1) {
      order.push({ chapter, row });
    }
  }
  return order;
}

export const ORDER = buildOrder();

export function clampIndex(index) {
  if (!Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.trunc(index), 0), ORDER.length - 1);
}

export function positionOf(index) {
  return ORDER[clampIndex(index)];
}

export function indexOf(chapter, row) {
  return ORDER.findIndex((p) => p.chapter === chapter && p.row === row);
}

export function nextIndex(index) {
  return clampIndex(clampIndex(index) + 1);
}

export function prevIndex(index) {
  return clampIndex(clampIndex(index) - 1);
}

// ── 계단식 가로 배치 ─────────────────────────────────────────────────
//
// **어느 축으로 움직이는지가 곧 맥락이다.**
//
//   같은 챕터 안 (맥락이 이어짐) → 가로로 미끄러진다
//   챕터가 바뀜   (맥락이 바뀜) → 세로로 미끄러진다
//
// 그래서 챕터는 세로로 쌓이고, 한 챕터의 장들은 가로로 늘어선다.
//
// 여기에 **대각선을 없애는 계단식 배치**가 붙는다. 모든 챕터를 x=0에서
// 시작시키면 챕터의 마지막 장에서 다음 챕터의 첫 장으로 넘어갈 때 가로와
// 세로가 **동시에** 바뀌어 화면이 비스듬히 미끄러진다. 그래서 각 챕터를 앞
// 챕터의 **마지막 열과 같은 자리**에서 시작하도록 계단처럼 오른쪽으로 밀어
// 배치한다. 그러면 경계를 넘을 때 가로 좌표가 그대로라 순수한 세로 이동이
// 되고, 챕터 안에서는 세로가 그대로라 순수한 가로 이동이 된다.
// 이동은 언제나 상하좌우 넷 중 하나다.
//
//   챕터0 (3장)  x = 0,1,2          y = 0
//   챕터1 (3장)  x = 2,3,4  ← 챕터0의 마지막 열과 같은 2에서 시작   y = 1
//   챕터2 (3장)  x = 4,5,6          y = 2
const CHAPTER_LEFTS = (() => {
  const lefts = [0];
  for (let c = 1; c < chapterCount(); c += 1) {
    // 앞 챕터의 마지막 열이 이 챕터의 첫 열이 된다.
    lefts.push(lefts[c - 1] + rowCount(c - 1) - 1);
  }
  return lefts;
})();

export function chapterLeft(chapterIndex) {
  return CHAPTER_LEFTS[chapterIndex] ?? 0;
}

// 화면 전체에서 이 슬라이드가 몇 칸 오른쪽에 있는지. --dx는 이 값을 쓴다.
export function absoluteCol(chapter, row) {
  return chapterLeft(chapter) + row;
}

// 가로로 놓인 칸의 총 개수. 시차 계수를 맞출 때 쓴다.
export function totalCols() {
  const last = chapterCount() - 1;
  return chapterLeft(last) + rowCount(last);
}

// 진행도(슬라이드 인덱스의 실수)에서 무대 칸 단위의 좌표. 정수 진행도에서는
// 그 장의 좌표와 정확히 같고, 사이에서는 두 장 사이를 선형으로 잇는다.
//
// **'전체 연속' 모드에서만 쓴다**(scrub.js의 MODES). 기본 모드는 문구가 한
// 장씩 바뀌므로 정수 좌표만 쓴다. 계단식 배치 덕분에 이웃한 두 장은 가로나
// 세로 중 한쪽만 다르고, 그래서 사이를 잇는 선도 비스듬해지지 않는다 —
// 대각선 없음이 진행도 중간에서도 유지된다.
export function offsetAt(progress) {
  const from = clampIndex(Math.floor(progress));
  const to = clampIndex(from + 1);
  const f = Math.min(Math.max(progress - from, 0), 1);
  const a = positionOf(from);
  const b = positionOf(to);
  const ax = absoluteCol(a.chapter, a.row);
  const bx = absoluteCol(b.chapter, b.row);
  return {
    x: ax + (bx - ax) * f,
    y: a.chapter + (b.chapter - a.chapter) * f,
  };
}

// 전환 방향을 판정하는 함수는 없다. 챕터가 바뀌면 --dy만, 챕터 안에서
// 움직이면 --dx만 달라지고 CSS transition이 그 방향으로 미끄러진다.
// 방향은 좌표에서 저절로 나오므로 따로 계산할 것이 없다 — 계단식 배치가
// "둘 중 하나만 바뀐다"를 보장하기 때문이다.

// 해시는 사람이 읽는 번호라 1부터 센다. 내부 인덱스는 0부터다.
export function toHash(index) {
  const { chapter, row } = positionOf(index);
  return `#${chapter + 1}/${row + 1}`;
}

export function fromHash(hash) {
  const match = /^#(\d+)\/(\d+)$/.exec(String(hash ?? ''));
  if (!match) return 0;
  const index = indexOf(Number(match[1]) - 1, Number(match[2]) - 1);
  return index === -1 ? 0 : index;
}

export function slideCount() {
  return totalSlides();
}
