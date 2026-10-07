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

// ── 팀 여덟 장 (2026-08-12 개편) ────────────────────────────────────
//
// 세 번째 구조다. 처음엔 달리기 씬 한 장 위를 카메라가 훑고 팀 소개는 그
// 위에 뜬 흰 카드가 맡았다(카드가 배경을 가렸다). 다음엔 씬 넷에 전광판을
// 그려 넣고 팀 소개를 그 판 안에 HTML로 앉혔다(그림 넷을 여덟 팀이 나눠
// 썼다). 지금은 **팀마다 제 그림 한 장**이고, 팀명·아이디어명·크루 넷의
// 회사와 이름이 전부 **그림에 구워져** 있다.
//
// 그래서 이 배열에 panel이 없다. 얹을 글자가 없으니 잴 자리도 없다 —
// .scene__board도, roster.js의 crewFigure도 함께 사라졌다.
//
// 여덟 장은 마라톤 여덟 단계다(팀 번호 = 단계 번호). 이름은 **그림의
// 내용**으로 짓는다. 한때 a·b·c로 뒀다가 "3, 1, 2 순"이라는 지시를 파일
// 이름의 숫자로 잘못 읽어 순서가 뒤바뀌었다.
//
// 만드는 법은 docs/characters.md에 있다 — 참조로 넣는 캐릭터 32장, 단계별
// 운영진 둘, 글자가 깨지는 자리까지 거기에 적혀 있다.
export const TEAM_SCENES = [
  { id: 'team-1', teams: [1], src: 'assets/scenes/team-1-start.webp' },
  { id: 'team-2', teams: [2], src: 'assets/scenes/team-2-gun.webp' },
  { id: 'team-3', teams: [3], src: 'assets/scenes/team-3-pack.webp' },
  { id: 'team-4', teams: [4], src: 'assets/scenes/team-4-pace.webp' },
  { id: 'team-5', teams: [5], src: 'assets/scenes/team-5-water.webp' },
  { id: 'team-6', teams: [6], src: 'assets/scenes/team-6-turn.webp' },
  { id: 'team-7', teams: [7], src: 'assets/scenes/team-7-hill.webp' },
  { id: 'team-8', teams: [8], src: 'assets/scenes/team-8-finish.webp' },
];

// 팀 번호 → 그 팀이 쓰는 씬 id.
export const SCENE_OF_TEAM = new Map(
  TEAM_SCENES.flatMap((s) => s.teams.map((t) => [t, s.id])),
);

// 팀 씬의 카메라. **여기서는 카메라를 거의 쓰지 않는다.**
//
// 글자가 그림에 구워지면서 제약이 뒤집혔다. 판이 HTML이던 때는 판만 프레임
// 안에 남기면 됐고 배율 1.26까지 밀 수 있었다. 지금은 **전광판이 그림의
// 일부**여서, 가운데 기준으로 확대하면 위아래가 (1 - 1/배율)/2씩 잘리고
// 그 첫 희생자가 판의 윗줄이다.
//
// 여덟 장에서 판의 위 여백을 실측하면 **5.1~8.1%**다(가장 빠듯한 것은
// team-1과 team-3의 5.1%). 위가 5.1%보다 더 잘리면 안 되므로
//   (1 - 1/배율)/2 < 0.051  →  배율 < 1.114.
//
// 그래서 1.05에서 시작해 제 장이 끝날 무렵 1.10까지만 민다. 페이드가 끝나는
// t=1에서 배율이 1.10이고 위가 4.55% 잘린다 — 5.1% 안이다.
// 확대 여유 부등식(|이동| ≤ (배율-1)/2 × 100)도 t=-0.5에서 지켜진다:
//   배율 1.025 → 여유 1.25% / 이동 |−0.5 × 1.5| = 0.75%   ✓
//
// **장면이 바뀌는 느낌은 이제 카메라가 아니라 그림이 만든다.** 여덟 팀이
// 저마다 다른 그림(출발선 → 총성 → … → 결승선)이라 넘길 때마다 교차
// 페이드로 장면 자체가 갈린다. 예전에 카메라를 크게 쓴 것은 한 그림을 두
// 팀이 나눠 쓰던 시절, 같은 그림을 다르게 보이게 하려던 일이었다.
//
// 판이 프레임 안에 남는지는 tests/scenes.test.js가 실제로 검사한다 —
// 값을 키우면 그 테스트가 먼저 걸린다.
export const TEAM_ZOOM = 1.05;
export const TEAM_ZOOM_SPAN = 0.05;
export const TEAM_PAN_DRIFT = 1.5;

// 여덟 장에서 실측한 전광판 위 여백 중 가장 작은 값(%). 테스트가 쓴다.
export const BOARD_TOP_MIN = 5.1;

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
  // #2/2 투 트랙 전용. **새로 뽑지 않고 이미 있던 그림을 꺼내 썼다**
  // (2026-08-12 지정) — 초기 씬 후보로 만들어 두고 쓰지 않던
  // m4-running-4k.png다(원본 4096×2323, D:\scroll_world_samples_png).
  //
  // 갈라진 코스를 따로 생성해 붙였다가 걷은 뒤의 결론이다. 새로 뽑은 것은
  // 초점이 흐린 미니어처 사진 결에 텅 빈 경기장이라 혼자 다른 세계였다 —
  // 이 덱의 씬은 또렷한 3D 클레이 렌더에 인파가 가득한 그림이다.
  // 같은 세트에서 나온 그림을 쓰니 이질감이 생길 자리가 없다.
  //
  // 강변 마라톤 코스를 크루와 응원단이 가득 메운 그림이라, 두 트랙 카드가
  // 그 위에 앉으면 "이 길 위에 두 갈래가 있다"로 읽힌다.
  { id: 'twotrack',  src: 'assets/scenes/ch2b-twotrack.webp' },
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
  // 팀 여덟 장. 위의 TEAM_SCENES 주석 참고 — 마라톤 여덟 단계다
  // (출발선 · 총성 · 초반 주행 · 자기 페이스 · 급수대 · 반환점 · 언덕 · 결승선).
  ...TEAM_SCENES.map((s) => ({
    ...s,
    zoom: TEAM_ZOOM,
    zoomSpan: TEAM_ZOOM_SPAN,
    panSpan: TEAM_PAN_DRIFT,
  })),
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
//
// zoomSpan·panSpan을 씬이 따로 줄 수 있다. 전광판 씬은 한 그림을 두 팀이
// 나눠 쓰므로, 두 팀이 **눈에 띄게 다른 자리**에서 보이도록 기본값보다
// 훨씬 크게 판다(scenes의 TEAM_ZOOM_SPAN·TEAM_PAN_DRIFT).
export function cameraTransform(t, {
  still = false, zoom = ZOOM_BASE,
  zoomSpan = ZOOM_SPAN, panSpan = PAN_SPAN,
} = {}) {
  if (still) return { scale: 1, x: 0 };
  return {
    scale: zoom + t * zoomSpan,
    x: t * -panSpan,
  };
}

// 프레임 밖에 숨겨진 여유. 이만큼까지만 옆으로 밀 수 있다.
export function overhang(scale) {
  return (scale - 1) / 2 * 100;
}

// 가운데 기준으로 배율만큼 확대했을 때 **위(또는 아래)가 잘려 나가는 양**(%).
// 전광판이 그림 안에 있으므로 이 값이 판의 위 여백을 넘으면 팀명이 잘린다.
export function verticalCrop(scale) {
  return (1 - 1 / scale) / 2 * 100;
}
