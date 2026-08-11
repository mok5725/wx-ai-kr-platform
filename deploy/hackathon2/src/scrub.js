// 스크롤 스크럽. 휠을 굴린 양을 **진행도**로 바꾼다.
//
// 진행도는 슬라이드 인덱스의 실수다 — 3.4면 3번 장에서 4번 장으로 40% 온
// 것이고, 배경 카메라가 그 위치에 놓인다. DOM도 시각도 모르는 순수 함수만
// 둔다(적용은 main.js).
//
// **두 가지 모드가 있고 아직 정하지 않았다** (설계 문서 §9, 리허설에서 결정).
//
// - `bg`  배경만 연속. 배경 카메라는 스크롤에 붙고 문구는 한 장씩 바뀐다.
//   문구가 겹쳐 보이는 일이 원천적으로 없어 프로젝터에서 가장 안전하다.
// - `all` 전체 연속. 문구까지 스크롤량에 비례해 움직인다. 가장 화려하지만
//   스크롤 중 이전 문구와 다음 문구가 겹쳐 보인다 — 데모에서 확인했다.
//
// 지금 기본값은 `bg`다. 무대에서 문구가 반쯤 걸친 채 멈추는 사고를 만들지
// 않는 쪽을 기본으로 둔다.
export const MODES = ['bg', 'all'];
export const DEFAULT_MODE = 'bg';

// 휠을 이만큼 굴리면 한 장이다. 마우스 휠 한 칸이 보통 100 안팎이라
// 네 칸 남짓에 한 장이 넘어간다 — 한 칸에 한 장씩 튀지 않고 배경이
// 실제로 흐르는 것이 보이는 값이다.
export const PX_PER_SLIDE = 420;

// 한 장 **안에서** 한 걸음 넘기는 데 필요한 양(reveal.js를 쓰는 장).
// 장 넘김보다 조금 작게 둔다 — 같은 값이면 본선 일정 한 장을 지나는 데
// 장 넷을 지나는 만큼 굴려야 해서 표가 무겁게 느껴진다.
export const PX_PER_REVEAL_STEP = 300;

// 스크롤이 멎은 뒤 이만큼 지나면 가장 가까운 장으로 정렬한다.
// **이 자동 정렬이 스크럽의 안전장치다.** 없으면 문구가 반쯤 걸친 채
// 멈추는 사고가 난다.
export const SNAP_DELAY_MS = 160;

// 정렬에 걸리는 시간. scrollTo({behavior:'smooth'})를 쓰지 않는 이유는
// 브라우저마다 속도가 달라 무대에서 예측이 안 되기 때문이다.
export const GLIDE_MS = 620;

// 휠 델타를 진행도에 더한다. 양 끝에서는 더 나가지 않는다 —
// 넘겨 두면 되돌아오는 데 그만큼 헛도는 스크롤이 필요하다.
export function advance(progress, deltaY, lastIndex) {
  const next = progress + deltaY / PX_PER_SLIDE;
  return clamp(next, 0, lastIndex);
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// 멎은 자리에서 갈 곳. **가장 가까운 장**이다 — 진행 방향으로 밀지 않는다.
// 조금만 굴렸다면 제자리에 남는 것이 의도에 맞고, 그러지 않으면 화면을
// 훑어보려고 살짝 굴린 것에도 장이 넘어간다.
export function snapTarget(progress, lastIndex) {
  return clamp(Math.round(progress), 0, lastIndex);
}

// 이 진행도에서 화면에 떠 있어야 하는 장. 경계(x.5)에서 넘어간다.
export function indexFor(progress, lastIndex) {
  return snapTarget(progress, lastIndex);
}

// 감속. 끝에서 부드럽게 멈춘다.
export function easeOutCubic(t) {
  const x = clamp(t, 0, 1);
  return 1 - (1 - x) ** 3;
}

// 정렬 애니메이션의 현재 값. elapsed가 GLIDE_MS를 넘으면 정확히 to다 —
// 근처에서 멈추면 배경이 미세하게 어긋난 채 남는다.
export function glide(from, to, elapsedMs, durationMs = GLIDE_MS) {
  if (elapsedMs >= durationMs) return to;
  return from + (to - from) * easeOutCubic(elapsedMs / durationMs);
}
