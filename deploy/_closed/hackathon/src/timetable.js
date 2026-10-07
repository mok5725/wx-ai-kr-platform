// 타임테이블 슬라이드 3장을 시간표 데이터에서 생성하고 현재 시각의
// 세션을 강조한다. 시간표가 바뀌면 schedule.js만 고치면 세 장이 함께 바뀐다.

import { SESSIONS, MORNING, AFTERNOON, FLOW, flowLabel } from './schedule.js';
import { currentSessionIndex, dayPhase } from './clock.js';

// 오후는 시간표 행이 아니라 renderSessionTrio의 3분할로 나간다(#3/3).
// #3/1(all)은 세션 행이 아니라 FLOW 묶음으로 나가므로 여기에도 없다.
const VIEWS = {
  morning: () => SESSIONS.map((s, i) => (MORNING.includes(s.id) ? i : -1)).filter((i) => i >= 0),
};

// 여러 줄짜리 문구를 <br>로 넣는다. 원본(schedule.js)은 줄바꿈을 \n으로
// 적는다 — innerHTML을 쓰지 않고 텍스트 노드로만 짓는다.
function fillLines(node, text) {
  String(text).split('\n').forEach((line, i) => {
    if (i) node.appendChild(document.createElement('br'));
    node.appendChild(document.createTextNode(line));
  });
}

function buildRow(session, sessionIndex, withDetails) {
  const row = document.createElement('div');
  row.className = 'tt-row';
  if (session.isBreak) row.classList.add('tt-row--break');
  row.dataset.sessionIndex = String(sessionIndex);

  const lead = document.createElement('div');
  lead.className = 'tt-row__time';
  lead.textContent = session.label;

  const body = document.createElement('div');
  body.className = 'tt-row__body';

  const title = document.createElement('div');
  title.className = 'tt-row__title';
  // 소요시간은 붙이지 않는다. 시각 범위(label)가 이미 같은 것을 말하고,
  // 활동 이름 뒤의 괄호는 제목을 읽는 눈을 한 번씩 끊는다.
  title.textContent = session.title;
  body.appendChild(title);

  if (withDetails && session.details.length) {
    const list = document.createElement('ul');
    list.className = 'tt-row__details';
    for (const detail of session.details) {
      const li = document.createElement('li');
      fillLines(li, detail);
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

// #3/1 순서 슬라이드의 한 칸.
//
// **강조를 걸지 않는다.** 예전에는 지금 진행 중인 칸만 발광하고 지나간
// 칸은 흐려졌는데, 이 장은 "지금 어디"가 아니라 "오늘 무엇을 어떤 순서로"를
// 말하는 장이다. 일곱 중 하나만 밝으면 나머지 여섯이 배경으로 내려앉는다.
// 그래서 다섯 칸 모두 같은 밝기로 세우고, 시각 강조는 오전·오후 확대판
// (#3/2·#3/3)에 맡긴다.
function buildFlowStep(step, position) {
  const sessions = step.sessions.map((id) => SESSIONS.find((s) => s.id === id)).filter(Boolean);
  const first = sessions[0];

  const row = document.createElement('div');
  row.className = 'tt-row tt-flow';
  if (sessions.every((s) => s.isBreak)) row.classList.add('tt-row--break');

  row.appendChild(el('div', 'tt-flow__icon', step.icon));
  row.appendChild(el('div', 'tt-row__no', step.no ?? String(position + 1)));
  row.appendChild(el('div', 'tt-flow__when', flowLabel(step)));

  const body = el('div', 'tt-row__body');
  const title = el('div', 'tt-row__title');
  // 칸 폭이 좁아 줄바꿈 자리를 schedule.js가 정해 준다(titleLines).
  // 묶음 칸은 세션 제목이 셋이라 대표 제목(step.title)을 따로 갖는다.
  if (step.title) title.textContent = step.title;
  else fillLines(title, (first.titleLines ?? [first.title]).join('\n'));
  body.appendChild(title);

  // 묶인 세션들의 이름. 무엇 셋이 한 덩어리로 묶였는지가 보여야 한다.
  if (step.lines) {
    const list = el('ul', 'tt-flow__lines');
    for (const line of step.lines) list.appendChild(el('li', null, line));
    body.appendChild(list);
  }
  if (step.sub) body.appendChild(el('div', 'tt-flow__sub', step.sub));
  row.appendChild(body);

  // 담당이 모두 같을 때만 한 줄로 적는다. 묶음 칸(5~7)이 팀스파르타
  // 하나로 적히는 것이 이 슬라이드에서 셋을 묶은 이유이기도 하다.
  const owners = [...new Set(sessions.map((s) => s.owner).filter(Boolean))];
  row.appendChild(el('div', 'tt-row__owner', owners.length === 1 ? owners[0] : ''));

  return row;
}

export function createTimetable(roots) {
  const rendered = [];

  for (const root of roots) {
    const view = root.dataset.timetable;
    root.innerHTML = '';

    if (view === 'all') {
      FLOW.forEach((step, i) => root.appendChild(buildFlowStep(step, i)));
      continue;
    }

    const indices = (VIEWS[view] ?? VIEWS.morning)();
    // 세부 항목을 펼칠지는 슬라이드가 정한다. data-detail="off"로 끌 수 있다.
    //
    // #3/3(오후)이 이것을 끈 상태다. 세부까지 펼치면 #7/2(오후 상세)와
    // 세션 제목·항목이 글자까지 똑같이 두 번 나온다. 오전에는 예고만 하고
    // 실제로 오후가 시작될 때 #7/2에서 펼치는 편이 낫다.
    const withDetails = root.dataset.detail !== 'off';
    const rows = indices.map((sessionIndex) => {
      const row = buildRow(SESSIONS[sessionIndex], sessionIndex, withDetails);
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
      fillLines(li, detail);
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
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}
