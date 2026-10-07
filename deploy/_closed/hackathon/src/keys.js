// 키 입력을 의도로 바꾼다. 좌표도 슬라이드 수도 모른다.
//
// 이동은 여전히 선형 2방향뿐이다. 다만 **가는 길이 여럿이다** —
// 아래·오른쪽·Enter·Space·PageDown이 모두 같은 next이고,
// 위·왼쪽·PageUp·Backspace가 모두 같은 prev다.
//
// 좌우 화살표는 원래 아무 동작도 하지 않았다(가로는 전환 방향으로만
// 존재한다는 설계였다). 화면이 옆으로 미끄러지는 것을 본 사람이 오른쪽
// 화살표를 누르는 것이 자연스럽고, 눌렀는데 아무 일도 없으면 덱이 멈춘
// 것으로 오해한다. 그래서 앞뒤에 묶었다.
//
// ArrowDown을 챕터 안에 가두지 않고 next에 묶은 이유: 프레젠터 리모컨은
// 기종에 따라 PageDown을 보내기도 하고 ArrowDown을 보내기도 한다.
// 모두 같은 동작에 묶어야 어떤 리모컨이 와도 진행이 막히지 않는다.

const NEXT_KEYS = new Set(['Enter', ' ', 'Spacebar', 'ArrowDown', 'ArrowRight', 'PageDown']);
const PREV_KEYS = new Set(['ArrowUp', 'ArrowLeft', 'PageUp', 'Backspace']);

export function intentFor(event) {
  // 브라우저 단축키(Ctrl+Enter 등)를 가로채지 않는다.
  if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return null;
  // 키를 누른 채 두면 슬라이드가 주르륵 넘어간다. 한 번 누르면 한 장이다.
  if (event.repeat) return null;

  const { key } = event;
  if (NEXT_KEYS.has(key)) return 'next';
  if (PREV_KEYS.has(key)) return 'prev';

  const lower = typeof key === 'string' ? key.toLowerCase() : '';
  if (lower === 'f') return 'fullscreen';
  if (lower === 'p') return 'notes';
  return null;
}

export function bindKeys(target, handle) {
  const listener = (event) => {
    const intent = intentFor(event);
    if (!intent) return;
    // Space는 기본 스크롤, Backspace는 뒤로가기를 일으킨다. 둘 다 막는다.
    event.preventDefault();
    handle(intent);
  };
  target.addEventListener('keydown', listener);
  return () => target.removeEventListener('keydown', listener);
}
