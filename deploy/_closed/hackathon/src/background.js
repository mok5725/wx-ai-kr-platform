// 별 레이어. 참고 사이트는 별까지 DOM div + blur 필터로 만들었지만
// 여기서는 canvas로 그린다. blur가 걸린 요소 수백 개는 매 프레임
// 재합성 대상이라 행사장 노트북에서 프레임이 떨어진다.
// 오브 4개만 DOM blur로 남겼다(background.css).

import { offsetFor } from './parallax.js';

const FAR_COUNT = 300;
const NEAR_COUNT = 60;
const DPR_CAP = 1.5;

// 별 색. 후광 스프라이트가 이 값에 알파를 붙여 쓰므로 6자리 표기여야 한다.
const FAR_COLOR = '#CCE8FE';
const NEAR_COLOR = '#FFFFFF';

// ── 전진 감각 ────────────────────────────────────────────────────────
// 별은 극좌표로 산다. 각도는 고정이고 화면 중심까지의 거리만 줄어든다.
// 거리를 지수적으로 감소시키는 이유: 일정한 속도로 앞으로 나아갈 때
// 눈에 보이는 별의 이동 속도가 정확히 이 모양이다. 가장자리(먼 거리)는
// 빠르게 흐르고 중심에 가까워질수록 느려진다. 선형 감소로 하면 중심
// 근처에서 별이 총알처럼 사라져 전진이 아니라 폭발처럼 보인다.
//
// 거리는 화면 반대각선 길이를 1로 본 비율이다. 1.0이 화면 모서리이고,
// 그보다 큰 값은 화면 밖이다.
const SPAWN_DISTANCE = 1.15; // 화면 밖에서 태어나 스르륵 들어온다
// 여기까지 오면 화면 밖에서 다시 시작한다. 0에 더 가깝게 두면 별이
// 보이지도 않는 중심 언저리에서 수명의 절반을 쓴다 — 화면에 남는 별이
// 줄어 흐름이 성겨 보인다.
const MIN_DISTANCE = 0.1;

// 별마다 제 속도가 있다. tau는 별을 만들 때 한 번 뽑아 평생 지닌다.
//
// 레이어마다 값 하나씩만 두면 같은 층의 별 수백 개가 한 몸처럼 움직여,
// 흐르는 강물이 아니라 통째로 미끄러지는 판때기로 보인다. 폭을 넓게 잡을수록
// 앞서거니 뒤서거니 하는 결이 생긴다.
//
// 가장자리에서 중심까지 걸리는 시간은 tau * ln(SPAWN/MIN) ≈ tau * 2.44다.
// 아래 범위면 먼 별이 44~146초, 가까운 별이 17~59초에 걸쳐 흩어진다.
// 두 레이어의 범위가 살짝 겹치는 것도 일부러다 — 경계가 뚜렷하면
// 두 층이 따로 노는 것이 눈에 띈다.
const FAR_TAU_MIN = 18000;
const FAR_TAU_MAX = 60000;
const NEAR_TAU_MIN = 7000;
const NEAR_TAU_MAX = 24000;

// 한 프레임에 반영할 최대 시간. 탭이 백그라운드에 있다가 돌아오면
// 델타가 수천 ms로 찍히는데, 그대로 반영하면 별이 순간이동한다.
const MAX_STEP_MS = 100;

// 방향을 뒤집는 스위치. -1이면 중심으로 모이고(현재), +1이면 중심에서
// 바깥으로 퍼진다. 퍼지는 쪽이 흔히 보는 "워프" 연출이다.
const DIRECTION = -1;

// 강등 판정: 60프레임 평균이 기준을 넘으면 한 단계 내린다.
// 기준은 24ms(약 41fps)를 바닥으로 삼되, 화면의 실제 프레임 간격이
// 그보다 길면(30Hz 프로젝터 등) 그 간격의 1.6배로 올린다 — slowThreshold().
const SAMPLE_SIZE = 60;
const SLOW_MS = 24;
const SLOW_RATIO = 1.6;

// 탭 백그라운드/창 가림 이후 rAF가 재개되면 첫 델타가 실제 경과
// 시간(수백~수천ms)으로 찍힌다. 아무리 느린 행사장 노트북이라도
// 진짜로 느린 프레임은 수십 ms 단위이므로, 200ms를 넘는 델타는
// "느린 프레임"이 아니라 "루프가 멈췄다가 재개된 것"으로 본다.
// 클램핑(값을 200ms로 깎아서 평균에 넣는 방식)도 고려했지만, 그래도
// 정상 프레임(16.7ms)의 10배가 넘는 값이 평균에 섞여 들어가 오탐
// 위험이 남는다. 따라서 이 델타는 평균에 아예 넣지 않고 폐기한다.
const PAUSE_MS = 200;

function makeStars(count, config) {
  const stars = [];
  for (let i = 0; i < count; i += 1) {
    stars.push({
      // 극좌표다. 각도는 별이 다시 태어날 때만 바뀌고, 거리만 매
      // 프레임 줄어든다. 둘 다 화면 크기와 무관한 값이라 창 크기가
      // 바뀌어도 흐름이 끊기지 않는다.
      angle: Math.random() * Math.PI * 2,
      distance: initialDistance(Math.random()),
      // 이 별만의 속도. 로그 균등 초기 분포는 tau가 별마다 달라도
      // 그대로 정상상태로 남는다 — 각 별이 제 속도로 로그 공간을 일정하게
      // 지나가고 끝에서 되돌아오기 때문이다. 흐름은 여전히 끊기지 않는다.
      tau: config.minTau + Math.random() * (config.maxTau - config.minTau),
      // 소수의 별만 유난히 밝다. 전부 같은 밝기로 두면 별하늘이 아니라
      // 고른 노이즈로 보인다. 밝은 별은 후광을 두르고 조금 더 크다.
      glow: Math.random() < config.brightShare ? 0.6 + Math.random() * 0.4 : 0,
      size: config.minRadius + Math.random() * (config.maxRadius - config.minRadius),
      // 위상과 주기는 초기화 때 한 번만 뽑는다. 매 프레임 난수를 뽑으면
      // 반짝임이 아니라 잡음이 된다.
      phase: Math.random() * Math.PI * 2,
      speed: (Math.PI * 2) / (config.minPeriod + Math.random() * (config.maxPeriod - config.minPeriod)),
      minAlpha: config.minAlpha,
      maxAlpha: config.maxAlpha,
    });
  }
  return stars;
}

function fitCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  return { w: canvas.width, h: canvas.height };
}

// 프레임 델타 하나를 표본 배치에 반영하고, 이번 델타 처리로 강등
// 여부를 판정해야 하는지를 돌려주는 순수 함수. frame() 루프와
// 테스트가 같은 판정 로직을 공유하도록 여기로 뺐다.
export function pushFrameDelta(samples, delta, slowMs = SLOW_MS) {
  if (delta > PAUSE_MS) {
    // 일시정지 후 재개로 보이는 델타는 배치째 버린다. 배치 중간의
    // 정상 표본까지 남겨두면 다음 배치 크기가 어긋나 판정 주기가
    // 밀리기만 할 뿐이라, 통째로 버리고 다음 델타부터 새로 센다.
    return { samples: [], degrade: false };
  }
  const next = samples.length ? samples.concat(delta) : [delta];
  if (next.length >= SAMPLE_SIZE) {
    const avg = next.reduce((a, b) => a + b, 0) / next.length;
    return { samples: [], degrade: avg > slowMs };
  }
  return { samples: next, degrade: false };
}

// 화면의 실제 주사율에서 "느리다"의 기준을 만든다.
//
// **고정 24ms는 60Hz를 전제한 값이다.** 프로젝터를 HDMI로 물리면 30Hz로
// 잡히는 경우가 흔하고, 그러면 모든 프레임이 33ms라 정상인데도 매번
// 느린 것으로 판정된다. 기준을 관측된 프레임 간격에 붙여 두면 30Hz에서는
// 33ms가 정상이 되고, 60Hz 기기에서 프레임이 반토막 날 때만 걸린다.
export function slowThreshold(baseline) {
  if (!baseline) return SLOW_MS;
  return Math.max(SLOW_MS, baseline * SLOW_RATIO);
}

// 별 하나의 처음 거리. u는 0~1의 난수다.
//
// **이 함수가 "끊김 없이 무한히 이어지는" 흐름의 핵심이다.** 거리를 그냥
// 균등하게(또는 넓이 보정으로 제곱근을 씌워) 뽑으면, 흐름이 자리를 잡은
// 뒤의 분포와 어긋난다. 그러면 처음 1~2분 동안 바깥쪽 별이 안쪽으로
// 빠져나가기만 하고 새 별은 아직 도착하지 않아 화면이 한 번 성겨졌다가,
// 재생성이 시작되면서 다시 채워진다 — 흐름이 끊겼다 이어지는 것처럼 보인다.
//
// 거리가 지수적으로 줄고 재생성 속도가 일정하면, 자리를 잡은 분포는
// 로그 균등이다(같은 배율 구간마다 별 수가 같다). 처음부터 그 분포로
// 뽑아두면 첫 프레임이 곧 정상상태라 영원히 같은 밀도로 흐른다.
export function initialDistance(u) {
  return SPAWN_DISTANCE * Math.pow(MIN_DISTANCE / SPAWN_DISTANCE, u);
}

// 이번 프레임에 반영할 시간. 탭 복귀 직후의 거대한 델타를 그대로 쓰면
// 별이 순간이동하므로 여기서 자른다. pushFrameDelta의 PAUSE_MS와 목적이
// 다르다 — 저쪽은 성능 판정에서 표본을 버리는 일이고, 이쪽은 그런 프레임
// 에서도 움직임만은 자연스럽게 이어가는 일이다.
export function motionDelta(rawDelta) {
  if (!(rawDelta > 0)) return 0;
  return Math.min(rawDelta, MAX_STEP_MS);
}

// 별 하나의 다음 거리. 지수 감소라 델타를 어떻게 쪼개 넣어도 같은
// 시간이면 같은 결과가 나온다(프레임률에 흔들리지 않는다).
// 중심에 닿은 별은 화면 밖에서 다시 시작한다 — 돌려준 값이 넣은 값보다
// 크면 다시 태어났다는 뜻이고, 호출자는 그때 각도를 새로 뽑는다.
export function nextDistance(distance, rawDelta, tau) {
  const next = distance * Math.exp(DIRECTION * (motionDelta(rawDelta) / tau));
  if (next < MIN_DISTANCE) return SPAWN_DISTANCE;
  if (next > SPAWN_DISTANCE) return MIN_DISTANCE;
  return next;
}

// 거리에 따른 밝기 배수. 화면 밖에서는 0에서 차오르고, 중심 근처에서는
// 0으로 잦아든다. 양끝에서 정확히 0이어야 한다 — 태어나는 자리와
// 사라지는 자리의 밝기가 0이 아니면 그 순간 별이 툭 나타나거나 툭 꺼져
// 흐름이 끊겨 보인다.
const FADE_IN_EDGE = 0.26;

export function fadeFor(distance) {
  if (distance > 1) return Math.max(0, (SPAWN_DISTANCE - distance) / (SPAWN_DISTANCE - 1));
  return Math.min(1, Math.max(0, (distance - MIN_DISTANCE) / (FADE_IN_EDGE - MIN_DISTANCE)));
}

// 멀수록(중심에 가까울수록) 작게 그린다. 원근의 핵심이라 이것이 빠지면
// 평면 위에서 점이 미끄러지는 것으로 보인다.
export function depthScale(distance) {
  return 0.35 + 0.65 * Math.min(distance, 1);
}

function advance(stars, rawDelta) {
  for (const star of stars) {
    const next = nextDistance(star.distance, rawDelta, star.tau);
    // 다시 태어났다면 어디서 들어올지 새로 정한다. 각도를 그대로 두면
    // 같은 방사선 위로만 별이 흘러 줄무늬가 생긴다.
    if (next > star.distance) star.angle = Math.random() * Math.PI * 2;
    star.distance = next;
  }
}

// 밝은 별의 후광을 한 번만 그려 캐시해 둔다.
//
// 매 프레임 별마다 그라디언트를 만들면 초당 수천 개의 객체가 생겼다
// 사라진다. 그렇다고 단색 원을 겹치면 경계가 남아 빛무리가 아니라
// 비눗방울처럼 보인다. 스프라이트 한 장을 만들어 drawImage로 늘려
// 쓰면 둘 다 피한다.
function makeGlowSprite(color) {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const mid = size / 2;
  const grad = ctx.createRadialGradient(mid, mid, 0, mid, mid, mid);
  // 가운데는 꽉 찬 빛, 바깥은 완전히 투명. 중간을 급히 떨어뜨려야
  // 흐릿한 원반이 아니라 한 점에서 번지는 빛으로 보인다.
  grad.addColorStop(0, color);
  grad.addColorStop(0.14, `${color}B0`);
  grad.addColorStop(0.4, `${color}30`);
  grad.addColorStop(1, `${color}00`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

function draw(ctx, size, stars, seconds, color, glowSprite) {
  ctx.clearRect(0, 0, size.w, size.h);
  ctx.fillStyle = color;
  const cx = size.w / 2;
  const cy = size.h / 2;
  // 거리 1.0이 화면 모서리가 되도록 반대각선의 절반을 곱한다.
  const span = Math.hypot(size.w, size.h) / 2;
  for (const star of stars) {
    const fade = fadeFor(star.distance);
    if (fade <= 0) continue;
    const wave = (Math.sin(star.phase + seconds * star.speed) + 1) / 2;
    const alpha = (star.minAlpha + wave * (star.maxAlpha - star.minAlpha)) * fade;
    const x = cx + Math.cos(star.angle) * star.distance * span;
    const y = cy + Math.sin(star.angle) * star.distance * span;
    // 밝은 별은 조금 더 굵다. 밝기만 올리면 흰 점이 세질 뿐 빛나 보이지 않는다.
    const core = star.size * depthScale(star.distance) * (1 + star.glow * 0.35);

    if (star.glow > 0 && glowSprite) {
      // 후광. shadowBlur는 별 하나마다 오프스크린 합성을 걸어 행사장
      // 노트북에서 위험하므로 캐시한 스프라이트를 늘려 쓴다.
      const halo = core * 7;
      ctx.globalAlpha = alpha * 0.55 * star.glow;
      ctx.drawImage(glowSprite, x - halo, y - halo, halo * 2, halo * 2);
      ctx.fillStyle = color;
    }

    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, core, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function createBackground({ far, near, layers }) {
  // prefers-reduced-motion을 보지 않는다 (2026-08-03 결정). 사유는
  // styles/background.css 파일 끝 주석에 있다. 요약하면, 무대 장비의
  // OS 설정 때문에 배경이 조용히 정지하는 쪽이 더 나쁘다.
  const farCtx = far.getContext('2d');
  const nearCtx = near.getContext('2d');
  const farGlow = makeGlowSprite(FAR_COLOR);
  const nearGlow = makeGlowSprite(NEAR_COLOR);

  // 반지름은 캔버스 픽셀 기준이다. fitCanvas가 DPR을 최대 1.5배까지
  // 반영하므로 화면에서 보이는 크기는 이 값의 1/1.5 ~ 1배 사이다.
  let farStars = makeStars(FAR_COUNT, {
    minRadius: 1.1, maxRadius: 2.4,
    minPeriod: 3, maxPeriod: 8,
    minAlpha: 0.5, maxAlpha: 0.8,
    brightShare: 0.1,
    minTau: FAR_TAU_MIN, maxTau: FAR_TAU_MAX,
  });
  let nearStars = makeStars(NEAR_COUNT, {
    minRadius: 2.6, maxRadius: 5.0,
    minPeriod: 1.4, maxPeriod: 3.2,
    minAlpha: 0.3, maxAlpha: 1.0,
    brightShare: 0.22,
    minTau: NEAR_TAU_MIN, maxTau: NEAR_TAU_MAX,
  });

  let farSize = fitCanvas(far);
  let nearSize = fitCanvas(near);

  // 강등은 한 방향으로만 일어난다. 회복 판정을 넣으면 경계에서
  // 켜졌다 꺼졌다 하며 오히려 더 눈에 띈다.
  let degradeLevel = 0;
  let frameTimes = [];
  let lastTime = 0;
  // 화면의 프레임 간격. 지금까지 본 가장 짧은 델타로 잡는다 — 가끔
  // 끊기는 프레임은 이 값을 늘리지 못하므로 주사율 추정이 안정적이다.
  let baseline = 0;

  // **루프를 멈추는 단계는 없다.** 예전에는 2단계에서 running을 false로
  // 두고 rAF 예약을 끊었는데, 한 번 꺼지면 되살아나는 길이 없었다.
  // 표지(#1/1)는 행사 시작 전까지 몇 시간이고 떠 있는 화면이라, 그 사이
  // 한 번이라도 오판이 나면 남은 시간 내내 배경이 정지한 채로 있었다.
  // 별 수를 줄이는 것만으로 프레임은 충분히 회복된다.
  function degrade() {
    degradeLevel += 1;
    farStars = farStars.slice(0, Math.max(40, Math.floor(farStars.length / 2)));
    nearStars = nearStars.slice(0, Math.max(10, Math.floor(nearStars.length / 2)));
  }

  // 예약은 이 한 곳에서만 한다. 창 복귀 시 다시 걸어도 중복 예약이
  // 생기지 않는다 — 두 번 걸리면 별이 두 배 속도로 흐른다.
  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(frame);
  }

  function frame(now) {
    scheduled = false;
    if (lastTime) {
      const delta = now - lastTime;
      // 일시정지 복귀 델타는 주사율 추정에서도 뺀다.
      if (delta > 0 && delta <= PAUSE_MS && (!baseline || delta < baseline)) baseline = delta;
      const result = pushFrameDelta(frameTimes, delta, slowThreshold(baseline));
      frameTimes = result.samples;
      if (result.degrade && degradeLevel < 2) degrade();
      advance(farStars, delta);
      advance(nearStars, delta);
    }
    lastTime = now;

    const seconds = now / 1000;
    draw(farCtx, farSize, farStars, seconds, FAR_COLOR, farGlow);
    draw(nearCtx, nearSize, nearStars, seconds, NEAR_COLOR, nearGlow);
    schedule();
  }

  function resize() {
    farSize = fitCanvas(far);
    nearSize = fitCanvas(near);
  }

  window.addEventListener('resize', resize);

  // 탭이 백그라운드에서 돌아왔을 때 타이밍 상태를 리셋한다. PAUSE_MS
  // 폐기 로직으로도 걸러지지만, 일부 브라우저는 창 가림 시 rAF만
  // 멈추고 visibilitychange를 늦게/따로 보내는 경우가 있어 이중으로
  // 막아둔다. lastTime을 0으로 되돌리면(초기화와 동일한 값) 다음
  // frame() 호출이 델타 계산 없이 새 기준 시각만 잡고 지나간다.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      lastTime = 0;
      frameTimes = [];
      // 창을 오래 가려 두면 브라우저가 예약해 둔 콜백째로 버리는 경우가
      // 있다. 표지는 행사 시작 전까지 몇 시간이고 떠 있는 화면이라
      // 여기서 한 번 놓치면 그대로 정지 화면이 된다.
      schedule();
    }
  });

  schedule();

  function moveTo(x, y) {
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const pairs = [
      [layers.deep, offsetFor('deepSky', x, y, viewport)],
      [layers.aurora, offsetFor('aurora', x, y, viewport)],
      [layers.far, offsetFor('farStars', x, y, viewport)],
      [layers.near, offsetFor('nearStars', x, y, viewport)],
    ];
    for (const [el, off] of pairs) {
      el.style.setProperty('--px', `${off.x}px`);
      el.style.setProperty('--py', `${off.y}px`);
    }
  }

  // 덱은 창을 닫을 때까지 살아 있다. 해제 함수를 두지 않는다.
  return { moveTo };
}
