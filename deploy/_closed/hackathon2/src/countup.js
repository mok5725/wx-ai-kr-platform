// 1-2 선정 수치의 카운트업. 슬라이드가 활성화될 때마다 0부터 올린다.
//
// 슬라이드 하나를 위한 모듈이라 작게 유지한다. 다른 슬라이드에서
// 필요해지면 [data-countup]만 붙이면 그대로 동작한다.

const DURATION = 900;

export function runCountUp(root) {
  const targets = [...root.querySelectorAll('[data-countup]')];
  if (!targets.length) return;

  const start = performance.now();
  const values = targets.map((el) => Number(el.dataset.countup) || 0);

  function step(now) {
    const t = Math.min((now - start) / DURATION, 1);
    // ease-out. 끝에서 부드럽게 멈춰야 숫자가 튀지 않는다.
    const eased = 1 - (1 - t) ** 3;
    targets.forEach((el, i) => {
      el.textContent = String(Math.round(values[i] * eased));
    });
    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}
