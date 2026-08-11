// 배경 씬의 좌표계. DOM을 모르는 순수 함수만 둔다 — 적용은 background.js가 한다.
//
// 마스터 덱의 배경은 별 canvas였고 슬라이드와 무관하게 혼자 흘렀다.
// 이 덱의 배경은 **슬라이드 진행도 자체가 카메라**다. 스크롤이 곧 시간이고,
// 씬은 그 시간축 위에 구간으로 놓인다.

import { CHAPTERS } from './slides.js';

// ── 카메라 계수 ─────────────────────────────────────────────────────
//
// **이동은 씬 이미지 폭의 퍼센트다.** vw로 잡으면 창이 16:9보다 넓을 때
// 씬 상자(무대 크기)와 기준이 갈라진다.
//
// 지켜야 하는 부등식 하나: **|이동| ≤ (배율 - 1) / 2 × 100.**
// 확대로 프레임 밖에 숨겨 둔 여유가 이동량보다 작으면 이미지의 끝이 화면에
// 들어와 하늘색 여백이 보인다. 아래 값들은 t의 양 끝(-0.5·1.5)에서 이
// 부등식을 만족한다 — 값을 만질 때 반드시 함께 확인한다. 테스트가 지킨다.
const ZOOM_BASE = 1.10;    // t=0(구간 시작)의 배율
const ZOOM_SPAN = 0.12;    // t가 1 늘 때 더해지는 배율
const PAN_SPAN = 3.5;      // % — t가 1 늘 때 왼쪽으로 미는 양

// 카메라가 자기 구간을 벗어난 뒤에도 계속 미는 범위. 위 부등식의 경계가
// 여기서 정해진다.
export const T_MIN = -0.5;
export const T_MAX = 1.5;

// 팀 여덟 장이 한 씬 안에서 옆으로 옮겨 가는 양과, 그만큼을 프레임 밖에
// 숨겨 두기 위한 배율. 부등식에 26을 넣으면 1.625 이상이 나온다.
export const TEAM_PAN_SPAN = 26;
export const TEAM_ZOOM = 1.66;

// 챕터마다 배경 씬 하나. 슬라이드가 자기 scene을 따로 선언하면 그것이 이긴다
// (챕터 4는 개요 한 장과 팀 여덟 장이, 챕터 7은 코스와 선물·평가가 다른
// 씬을 쓴다).
//
// 2026-08-10: 지구본·지도 연결 씬 셋을 마라톤 컨셉으로 교체했다 — 대회장
// 아침(배번표 수령), 응원 관중석, 센터장 스타트라인 응원. 운영 지시.
export const SCENES = [
  { id: 'raceday',   src: 'assets/scenes/ch1-raceday.webp' },
  // 선정 축하 장 전용. 크루끼리 서로 배번표를 붙여 주고 챙기는 장면이라
  // "선정 = 배번표를 받았다"는 그 장의 메시지와 그림이 같은 말을 한다.
  // 가운데가 비어 있어 축하 카드가 그 안에 앉는다.
  { id: 'bibs',      src: 'assets/scenes/ch1b-bibs.webp' },
  { id: 'crowd',     src: 'assets/scenes/ch2-crowd.webp' },
  { id: 'sendoff',   src: 'assets/scenes/ch3-sendoff.webp' },
  // 출발선 씬은 **원본 크기로 쓰지 않는다**(2026-08-11 요청). 그림의 아래
  // 절반이 빈 아스팔트라, 원본대로 얹으면 화면의 절반을 회색이 차지하고
  // 출발선에 선 크루는 위쪽에 작게 몰린다. 조금 당겨 크루를 화면 안으로
  // 끌어온다 — 잘려 나가는 것은 아치의 꼭대기와 빈 노면뿐이다.
  // 1.5배로 뒀다가 1.2배로 낮췄다(요청) — 아치가 더 남고 크루가 조금 물러난다.
  //
  // 확대 여유 부등식(|이동| ≤ (배율-1)/2 × 100)은 여유롭게 만족한다:
  // 이 씬의 이동은 t가 -0.5~1.5이므로 최대 5.25%이고, 1.2배가 숨겨 두는
  // 여유는 10%다.
  { id: 'startline', src: 'assets/scenes/ch4a-startline.webp', zoom: 1.2 },
  // 팀 여덟 장이 함께 쓰는 씬. 카메라가 여덟 그룹 사이를 ±26%까지 옮겨
  // 다니므로 그만큼을 프레임 밖에 숨겨 둘 배율이 필요하다. 그래서 이 씬만
  // 4k로 뽑았다 — 2k에서 1.66배로 확대하면 프로젝터에서 뭉개진다.
  { id: 'running',   src: 'assets/scenes/ch4b-running-4k.webp', zoom: TEAM_ZOOM },
  // 운영진 씬은 **카메라를 세운다.** 그림 속 일곱 명 아래에 이름표를 가로
  // 퍼센트로 세우기 때문에, 이미지가 확대·이동하면 이름표가 사람에게서
  // 떨어져 나간다. 이 한 장만 정지시키고 이웃 씬이 계속 움직이므로 전환의
  // 움직임은 그대로 남는다.
  { id: 'hq',        src: 'assets/scenes/ch5-staff.webp', still: true },
  { id: 'warmup',    src: 'assets/scenes/ch6-warmup.webp' },
  // 코스 지도 씬(ch7-coursemap.webp)은 2026-08-11에 지웠다 — 진행 흐름
  // 장(#7/1)이 선물 장과 같은 급수대 씬을 쓰게 되면서 아무도 부르지 않게 됐다.
  // 파일도 함께 지운다. tests/assets.test.js가 "선언하지 않은 씬 파일이
  // assets/scenes에 남아 있으면 실패"를 지키므로, 둘 중 하나만 지우면 걸린다.
  { id: 'water',     src: 'assets/scenes/ch7b-water.webp' },
  { id: 'turnpoint', src: 'assets/scenes/ch8-turnpoint.webp' },
  { id: 'finish',    src: 'assets/scenes/ch9-finish.webp' },
];

export function sceneIds() {
  return SCENES.map((s) => s.id);
}

// 슬라이드 순서(열 우선)대로 각 장이 어떤 씬을 쓰는지 늘어놓는다.
// deck.js의 ORDER와 같은 순서여야 한다 — 둘 다 CHAPTERS를 같은 방식으로 훑는다.
export function sceneOfSlide() {
  const out = [];
  for (const chapter of CHAPTERS) {
    for (const slide of chapter.slides) {
      out.push(slide.scene ?? chapter.scene);
    }
  }
  return out;
}

// 씬 하나가 차지하는 구간 [first, last]. 슬라이드 인덱스 기준이다.
// 같은 씬이 떨어진 자리에서 두 번 쓰이면 그 사이가 통째로 한 구간이 되므로,
// 씬은 붙어 있는 자리에서만 재사용한다.
export function sceneRanges(map = sceneOfSlide()) {
  const ranges = new Map();
  map.forEach((id, i) => {
    const r = ranges.get(id);
    if (r) r.last = i;
    else ranges.set(id, { first: i, last: i });
  });
  return ranges;
}

// 0↔1을 부드럽게 잇는다. 선형으로 섞으면 경계에서 톡 끊겨 보인다.
export function smoothstep(t) {
  const x = Math.min(Math.max(t, 0), 1);
  return x * x * (3 - 2 * x);
}

// 진행도 p(슬라이드 인덱스의 실수)에서 이 씬의 불투명도.
//
// 구간 안이면 1, 구간 밖으로 한 장 벗어나는 동안 0으로 잦아든다.
// 이웃한 두 씬의 합이 경계에서 1 근처가 되도록 smoothstep을 쓴다 —
// 정확히 1은 아니지만, 둘 다 반쯤 보이는 짧은 순간이라 눈에 띄지 않는다.
export function sceneOpacity(p, range) {
  if (p < range.first) return smoothstep(1 - (range.first - p));
  if (p > range.last) return smoothstep(1 - (p - range.last));
  return 1;
}

// 씬 안에서 카메라가 얼마나 파고들었는가. 0이 구간 시작, 1이 구간 끝이다.
//
// **구간을 벗어난 뒤에도 계속 민다.** 구간 끝에서 멈추면 씬이 사라지는 동안
// 정지 화면처럼 보여서, 겹쳐 지나가는 순간에 움직임이 죽는다.
export function cameraT(p, range) {
  const span = (range.last - range.first) + 1;
  const t = (p - range.first) / span;
  return Math.min(Math.max(t, T_MIN), T_MAX);
}

// still이면 변환을 걸지 않는다. 이미지 위에 좌표로 얹는 것(운영진 이름표)이
// 있는 씬은 움직이면 어긋난다 — SCENES의 still 주석 참고.
export function cameraTransform(t, { still = false, zoom = ZOOM_BASE } = {}) {
  if (still) return { scale: 1, x: 0 };
  return {
    scale: zoom + t * ZOOM_SPAN,
    x: t * -PAN_SPAN,
  };
}

// 프레임 밖에 숨겨진 여유. 이만큼까지만 옆으로 밀 수 있다.
export function overhang(scale) {
  return (scale - 1) / 2 * 100;
}

// 챕터 4의 팀 여덟 장은 **한 씬 안에서 카메라가 옆으로 옮겨 간다.**
// 여덟 그룹이 가로로 벌어진 4k 이미지 위를, 팀이 바뀔 때마다 다음 그룹으로
// 이동한다. 확대보다 좌우 이동을 크게 잡는 이유는 4k라도 8분할로 확대하면
// 뭉개지기 때문이다.
//
// **방향은 2026-08-11에 뒤집었다.** 예전에는 1팀이 -26%에서 시작해 8팀에서
// +26%로 갔다 — 이미지가 오른쪽으로 밀리므로 화면에 보이는 배경은 오른쪽에서
// 왼쪽으로 흘렀다. 요청대로 반대로 돌린다. 이동량의 크기는 그대로라 확대로
// 숨겨 둔 여유(부등식)도 그대로 만족한다.
export function teamPan(teamIndex, teamCount) {
  if (teamCount <= 1) return 0;
  const k = teamIndex / (teamCount - 1);      // 0..1
  return (0.5 - k) * 2 * TEAM_PAN_SPAN;       // % , +26 ~ -26
}
