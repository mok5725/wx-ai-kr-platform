// 진행자 노트 창. 본 화면과 BroadcastChannel로 위치를 주고받는다.
//
// 노트 창은 본 화면의 부속물이지 의존 대상이 아니다. 팝업이 차단되든,
// 창을 닫든, BroadcastChannel을 지원하지 않는 브라우저든 본 화면은
// 그대로 돌아가야 한다. 이 파일의 모든 실패 경로가 조용히 넘어가는 이유다.

import { CHAPTERS, slideAt } from './slides.js';
import { positionOf, slideCount } from './deck.js';
import { TASKS } from './content.js';
import { intentFor } from './keys.js';

const CHANNEL = 'tmu-deck';

function openChannel() {
  if (typeof BroadcastChannel === 'undefined') return null;
  try {
    return new BroadcastChannel(CHANNEL);
  } catch {
    return null;
  }
}

// 과제 슬라이드에서는 크루 강점을 함께 보낸다. 22명분 문장을 slides.js에
// 복사해 두지 않고 여기서 content.js를 참조하므로 원본이 하나다.
function crewFor(noteTask) {
  if (!noteTask) return [];
  const task = TASKS.find((t) => t.id === noteTask);
  if (!task) return [];
  return task.members
    .filter((m) => m.strength)
    .map((m) => ({ name: m.name, company: m.company, strength: m.strength }));
}

function slideInfo(index) {
  const { chapter, row } = positionOf(index);
  const c = CHAPTERS[chapter];
  const s = slideAt(chapter, row);
  return {
    index,
    chapterTitle: c.title,
    title: s.title,
    note: s.note,
    crew: crewFor(s.noteTask),
    position: `${chapter + 1} / ${CHAPTERS.length} · ${row + 1} / ${c.slides.length}`,
    total: slideCount(),
  };
}

// ── 본 화면 쪽 ────────────────────────────────────────────────
export function createNotesHost({ onIntent }) {
  const channel = openChannel();
  let popup = null;
  let lastIndex = 0;

  if (channel) {
    channel.onmessage = (event) => {
      const msg = event.data;
      // 노트 창에서도 Enter가 먹어야 노트북을 보며 진행할 수 있다.
      if (msg?.type === 'intent') onIntent(msg.intent);
      if (msg?.type === 'background') {
        document.body.classList.toggle('bg-off', Boolean(msg.off));
      }
      // 노트 창이 늦게 열려도 현재 위치를 곧바로 받아간다.
      if (msg?.type === 'hello') publish(lastIndex);
    };
  }

  function publish(index) {
    lastIndex = index;
    if (!channel) return;
    channel.postMessage({ type: 'state', payload: slideInfo(index) });
  }

  function notifyBlocked() {
    const node = document.createElement('div');
    node.className = 'toast';
    node.textContent = '팝업이 차단되어 진행자 노트를 열지 못했습니다. 발표는 그대로 진행됩니다.';
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 4000);
  }

  function open() {
    if (popup && !popup.closed) {
      popup.focus();
      return;
    }
    popup = window.open('notes.html', 'tmu-notes', 'width=860,height=720');
    // 팝업 차단. 본 화면은 아무 영향 없이 계속 돈다.
    if (!popup) notifyBlocked();
  }

  return { open, publish };
}

// ── 노트 창 쪽 ────────────────────────────────────────────────
export function createNotesClient(els) {
  const channel = openChannel();

  if (!channel) {
    els.note.textContent = '이 브라우저는 BroadcastChannel을 지원하지 않아 본 화면과 연결할 수 없습니다.';
    return;
  }

  channel.onmessage = (event) => {
    if (event.data?.type !== 'state') return;
    const s = event.data.payload;
    els.title.textContent = `${s.chapterTitle} — ${s.title}`;
    els.note.textContent = s.note || '(노트 없음)';
    els.position.textContent = `${s.position}   ·   전체 ${s.index + 1} / ${s.total}`;

    els.crew.innerHTML = '';
    if (s.crew.length) {
      els.crew.appendChild(Object.assign(document.createElement('h2'), {
        className: 'notes__subtitle',
        textContent: '강점 — 호명하며 읽을 것',
      }));
      for (const m of s.crew) {
        const item = document.createElement('div');
        item.className = 'notes__crew-item';
        const name = document.createElement('span');
        name.className = 'notes__crew-name';
        name.textContent = `${m.name} (${m.company})`;
        item.append(name, document.createTextNode(` ${m.strength}`));
        els.crew.appendChild(item);
      }
    }
  };

  channel.postMessage({ type: 'hello' });

  // 노트 창에서 누른 키를 본 화면으로 보낸다. 키 판정은 keys.js의
  // intentFor 하나만 쓴다 — 여기서 키 목록을 따로 베껴두면 리모컨용
  // 키가 나중에 keys.js에만 추가됐을 때 노트 창에서는 안 먹는
  // 불일치가 생긴다. next·prev만 본 화면으로 넘기고 나머지(fullscreen,
  // notes 등)는 노트 창의 몫이 아니므로 흘려보낸다.
  window.addEventListener('keydown', (event) => {
    const intent = intentFor(event);
    if (intent !== 'next' && intent !== 'prev') return;
    event.preventDefault();
    channel.postMessage({ type: 'intent', intent });
  });

  let off = false;
  els.bgButton.addEventListener('click', () => {
    off = !off;
    els.bgButton.textContent = off ? '배경 켜기' : '배경 끄기';
    channel.postMessage({ type: 'background', off });
  });

  function tick() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    els.clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }
  tick();
  setInterval(tick, 1000);
}
