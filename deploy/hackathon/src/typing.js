// 제목과 소제목이 타이핑되듯 나타난다.
//
// 제목은 21장 어디서나 같은 자리에 있다(styles/slides.css의 제목 블록
// 높이 고정). 그래서 본문처럼 통째로 사라졌다 나타나면 붙박이라는 인상이
// 깨진다. 자리는 지키고 글자만 갈아끼워지는 편이 맞다.
//
// **원래 마크업을 그대로 살린다.** 제목 안에는 형광 강조(<span class="kw">)와
// 줄바꿈(<br>)이 들어 있어서, textContent를 잘라 쓰면 강조가 통째로 사라진다.
// 그래서 매 프레임 원본 노드를 복제하면서 글자 예산만큼만 잘라 넣는다.

// 이 노드 아래에 글자가 몇 개인지.
export function textLength(node) {
  let n = 0;
  for (const child of node.childNodes) {
    n += child.nodeType === Node.TEXT_NODE ? child.textContent.length : textLength(child);
  }
  return n;
}

// 흐른 시간으로 보여줄 글자 수를 낸다. 순수 함수라 DOM 없이 검증할 수 있다.
export function typedCount(total, elapsedMs, msPerChar) {
  if (!(msPerChar > 0)) return total;
  return Math.max(0, Math.min(total, Math.floor(elapsedMs / msPerChar)));
}

// src의 자식들을 dest에 복제하되, 글자는 budget개까지만 넣는다.
// 남은 예산을 돌려준다.
function copyUpTo(src, dest, budget) {
  let left = budget;
  for (const child of src.childNodes) {
    if (left <= 0 && child.nodeType === Node.TEXT_NODE) continue;
    if (child.nodeType === Node.TEXT_NODE) {
      const take = Math.min(left, child.textContent.length);
      dest.appendChild(document.createTextNode(child.textContent.slice(0, take)));
      left -= take;
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    // <br>처럼 글자가 없는 요소는 예산과 무관하게 그대로 둔다 —
    // 빼면 줄바꿈이 사라져 제목이 한 줄로 뭉친다.
    const clone = child.cloneNode(false);
    dest.appendChild(clone);
    left = copyUpTo(child, clone, left);
  }
  return left;
}

const MS_PER_CHAR = 26;

// 요소 하나를 타이핑한다. 원본 마크업은 처음 한 번만 저장해 두고
// 이후에는 그것을 원본으로 삼는다 — 두 번째 호출부터는 화면에 잘린
// 내용만 남아 있기 때문이다.
export function typeInto(el, { delay = 0, msPerChar = MS_PER_CHAR } = {}) {
  if (!el) return () => {};

  if (!el.__typeSource) {
    const source = document.createElement('div');
    while (el.firstChild) source.appendChild(el.firstChild);
    el.__typeSource = source;
  }
  const source = el.__typeSource;
  const total = textLength(source);

  // 진행 중이던 타이핑이 있으면 멈춘다. 빠르게 연타하면 두 타이머가
  // 같은 요소에 서로 다른 글자 수를 쓰며 싸운다.
  if (el.__typeStop) el.__typeStop();

  let raf = 0;
  let guard = 0;
  let started = 0;
  let done = false;

  const paint = (count) => {
    el.textContent = '';
    copyUpTo(source, el, count);
    el.classList.toggle('is-typing', count < total);
  };

  paint(0);

  const step = (now) => {
    if (!started) started = now;
    const elapsed = now - started - delay;
    const count = typedCount(total, elapsed, msPerChar);
    paint(count);
    if (count >= total) { done = true; clearTimeout(guard); return; }
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);

  // **안전장치.** requestAnimationFrame이 돌지 않으면 제목이 빈 채로 남는다.
  // 창이 가려졌거나 브라우저가 프레임을 조이면 실제로 그렇게 된다(이 덱을
  // 만들며 쓴 미리보기 창이 rAF를 초당 한 번으로 조여 제목이 0글자에서
  // 멈춘 적이 있다). setTimeout은 그런 상황에서도 돌므로, 다 쳐졌어야 할
  // 시각이 지나면 무조건 온전한 제목을 남긴다. 발표 중 제목이 안 보이는
  // 것보다 타이핑이 생략되는 편이 훨씬 낫다.
  guard = setTimeout(() => { if (!done) { done = true; paint(total); } },
    delay + total * msPerChar + 400);

  const stop = () => {
    cancelAnimationFrame(raf);
    clearTimeout(guard);
    if (!done) paint(total); // 중간에 끊기면 온전한 제목을 남긴다
    el.__typeStop = null;
  };
  el.__typeStop = stop;
  return stop;
}
