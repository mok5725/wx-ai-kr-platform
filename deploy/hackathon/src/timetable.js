// 타임테이블 슬라이드 3장을 시간표 데이터에서 생성하고 현재 시각의
// 세션을 강조한다. 시간표가 바뀌면 schedule.js만 고치면 세 장이 함께 바뀐다.

import { SESSIONS, MORNING, AFTERNOON } from './schedule.js';
import { currentSessionIndex, dayPhase } from './clock.js';

// 오후는 시간표 행이 아니라 renderSessionTrio의 3분할로 나간다(#3/3).
// 그래서 여기에는 afternoon 뷰가 없다.
const VIEWS = {
  all: () => SESSIONS.map((_, i) => i),
  morning: () => SESSIONS.map((s, i) => (MORNING.includes(s.id) ? i : -1)).filter((i) => i >= 0),
};

// ordinal이 숫자면 첫 칸에 시각 대신 순번을 넣는다. 전체 보기(#3/1)는
// "몇 시에 무엇을"이 아니라 "무엇 다음에 무엇을"을 말하는 장이라, 시각을
// 빼고 1~7로 세는 편이 흐름 자체를 보여준다. 시각이 필요한 오전·오후
// 확대판(#3/2, #3/3)은 그대로 session.label을 쓴다.
function buildRow(session, sessionIndex, withDetails, ordinal) {
  const row = document.createElement('div');
  row.className = 'tt-row';
  if (session.isBreak) row.classList.add('tt-row--break');
  row.dataset.sessionIndex = String(sessionIndex);

  const lead = document.createElement('div');
  if (ordinal === null) {
    lead.className = 'tt-row__time';
    lead.textContent = session.label;
  } else {
    lead.className = 'tt-row__no';
    lead.textContent = String(ordinal);
  }

  const body = document.createElement('div');
  body.className = 'tt-row__body';

  const title = document.createElement('div');
  title.className = 'tt-row__title';
  // 소요시간은 붙이지 않는다. 시각 범위(label)가 이미 같은 것을 말하고,
  // 활동 이름 뒤의 괄호는 제목을 읽는 눈을 한 번씩 끊는다.
  //
  // 가로 타임라인(#3/1)은 칸이 좁아 줄바꿈 자리를 schedule.js가 정해 준다.
  // titleLines가 없으면 예전처럼 한 줄로 넣고 브라우저에 맡긴다.
  if (ordinal !== null && session.titleLines) {
    session.titleLines.forEach((line, i) => {
      if (i) title.appendChild(document.createElement('br'));
      title.appendChild(document.createTextNode(line));
    });
  } else {
    title.textContent = session.title;
  }
  body.appendChild(title);

  if (withDetails && session.details.length) {
    const list = document.createElement('ul');
    list.className = 'tt-row__details';
    for (const detail of session.details) {
      const li = document.createElement('li');
      li.textContent = detail;
      list.appendChild(li);
    }
    body.appendChild(list);
  }

  const owner = document.createElement('div');
  owner.className = 'tt-row__owner';
  owner.textContent = session.owner;

  const mark = document.createElement('div');
  mark.className = 'tt-row__mark';

  row.append(lead, body, owner, mark);
  return row;
}

export function createTimetable(roots) {
  const rendered = [];

  for (const root of roots) {
    const view = root.dataset.timetable;
    const indices = (VIEWS[view] ?? VIEWS.all)();
    // 세부 항목을 펼칠지는 슬라이드가 정한다. 전체 보기(#3/1)는 늘 접고,
    // 나머지는 data-detail="off"로 끌 수 있다.
    //
    // #3/3(오후)이 이것을 끈 상태다. 세부까지 펼치면 #7/2(오후 상세)와
    // 세션 제목·항목이 글자까지 똑같이 두 번 나온다. 오전에는 예고만 하고
    // 실제로 오후가 시작될 때 #7/2에서 펼치는 편이 낫다.
    const withDetails = view !== 'all' && root.dataset.detail !== 'off';
    const numbered = view === 'all';
    root.innerHTML = '';
    const rows = indices.map((sessionIndex, position) => {
      const row = buildRow(SESSIONS[sessionIndex], sessionIndex, withDetails, numbered ? position + 1 : null);
      root.appendChild(row);
      return row;
    });

    rendered.push({ rows });
  }

  function refresh(now = new Date()) {
    const current = currentSessionIndex(now);
    const phase = dayPhase(now);

    for (const { rows } of rendered) {
      for (const row of rows) {
        const sessionIndex = Number(row.dataset.sessionIndex);
        row.classList.toggle('is-current', sessionIndex === current);
        row.classList.toggle('is-past', sessionIndex < current);

        const mark = row.querySelector('.tt-row__mark');
        // 시작 전에는 아무 표식도 걸지 않는다. 첫 줄에 "곧 시작합니다"를
        // 띄우면 대기 화면에서 그 한 줄만 눈에 띄어, 정작 보여주려는
        // 하루 전체의 흐름이 뒤로 밀린다.
        mark.textContent = '';
        if (phase === 'after' && sessionIndex === SESSIONS.length - 1) mark.textContent = '수고하셨습니다';
        else if (sessionIndex === current) mark.textContent = '진행 중';
      }
    }
  }

  function start() {
    refresh();
    // 1분마다 갱신한다. 초 단위로 돌 이유가 없다.
    // 덱은 창을 닫을 때까지 살아 있으므로 해제 함수를 두지 않는다.
    setInterval(() => refresh(), 60 * 1000);
  }

  return { refresh, start };
}

// #3/2 오전·#3/3 오후 두 장을 같은 3분할(.trio) 형태로 만든다.
// 예전에는 오후만 이 형태였고 오전은 시간표 행이었는데, 2026-08-04에
// 두 장의 포맷을 맞췄다. 문구의 원본은 여전히 schedule.js 하나다.
//
// 번호 칸에는 세션 시작 시각, 제목에는 세션 제목과 소요시간, 본문에는
// 세부 항목 목록을 넣는다. 담당자는 맨 아래 한 줄로 붙인다 — 시간표
// 행에 있던 칸이라, 없애면 어느 세션을 누가 끌고 가는지가 사라진다.
const TRIOS = { morning: MORNING, afternoon: AFTERNOON };

export function renderSessionTrio(root) {
  const ids = TRIOS[root.dataset.trio];
  if (!ids) return;

  root.innerHTML = '';
  for (const id of ids) {
    const session = SESSIONS.find((s) => s.id === id);
    if (!session) continue;

    const item = document.createElement('div');
    item.className = 'trio__item';

    const no = document.createElement('div');
    no.className = 'trio__no';
    no.textContent = session.label.split('~')[0];

    const title = document.createElement('h3');
    title.className = 'trio__title';
    title.append(`${session.title} `);
    const small = document.createElement('small');
    small.textContent = `(${session.duration})`;
    title.appendChild(small);

    const body = document.createElement('div');
    body.className = 'trio__body';
    const list = document.createElement('ul');
    for (const detail of session.details) {
      const li = document.createElement('li');
      li.textContent = detail;
      list.appendChild(li);
    }
    body.appendChild(list);

    item.append(no, title, body);

    // 네트워킹 파티는 담당자가 비어 있다. 빈 줄을 만들지 않는다.
    if (session.owner) {
      item.appendChild(el('div', 'trio__owner', session.owner));
    }

    root.appendChild(item);
  }

  // 오후는 하루의 끝이다. 마지막 칸 오른쪽에 종료 시각을 세워, 세 세션이
  // 어디까지 가는지가 화면 안에서 닫히게 한다.
  if (root.dataset.trio === 'afternoon') {
    const end = document.createElement('div');
    end.className = 'trio__item trio__item--end';
    end.append(el('div', 'trio__no', '16:30'), el('div', 'trio__end', '종료'));
    root.appendChild(end);
  }
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}
