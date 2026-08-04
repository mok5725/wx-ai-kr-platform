// 사람과 과제 화면. content.js의 데이터를 DOM으로 그린다.
// 좌표도 시각도 모른다.
//
// member.strength는 렌더하지 않는다. 프로젝터 뒷줄에서 읽히지 않는
// 길이라, 진행자가 호명하며 읽도록 노트 창에만 띄운다(notes.js).

import { WELCOME, SPONSORS, EXPEDITION, COACHES, TASKS, ORG_TIERS, PERKS, chipTone } from './content.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function chip(company) {
  const node = el('span', `chip chip--${chipTone(company)}`, company);
  return node;
}

// 4-1 오늘 함께해 주신 스폰서.
//
// 넷을 같은 레벨의 네임카드로 나란히 세운다.
//
// **역할이 이름 위에 선다.** 넷을 그냥 늘어놓으면 "높은 분 네 명"으로만
// 읽히고 누가 내 과제를 받치는지가 안 보인다. 카드를 위에서 아래로 훑을 때
// 과제 이름이 먼저 걸리도록 이름보다 위에 두었다.
//
// **김경철 센터장이 맨 오른쪽이다.** 네 분 모두 스폰서이지만 센터장만
// 과제가 아니라 트랙 전체를 맡는다. 과제 셋을 1·2·3 순서로 먼저 훑고
// 마지막에 디렉터로 닫는 편이, 앞의 과제 슬라이드 순서와도 맞는다.
// 센터장은 이 자리에서 환영사도 맡는다.
// 소속 칩은 회사별 색을 쓰지 않는다 — 이 장은 회사를 구분하는 자리가
// 아니라 네 분을 나란히 소개하는 자리라, 색이 갈리면 없는 편이 생긴다.
// 색으로 회사를 구분하는 곳은 크루 명단(5-2~5-4)뿐이다.
function renderSponsors(root) {
  root.className = 'namecards';

  const people = [...SPONSORS, WELCOME];

  for (const p of people) {
    const card = el('div', 'namecard');
    card.append(
      el('div', 'namecard__role', p.role),
      el('div', 'namecard__name', `${p.name} ${p.title}`),
      el('span', 'chip chip--plain', p.org),
    );
    root.appendChild(card);
  }
}

// 4-2 인창원 해커톤 원정대 — 별칭을 크게, 이름을 작게.
// 딱딱한 운영진 소개를 아이스브레이킹으로 바꾸는 장치다.
function renderExpedition(root) {
  root.className = 'expedition';
  for (const p of EXPEDITION) {
    const card = el('div', 'exp-card');

    const photo = document.createElement('img');
    photo.className = 'exp-card__photo';
    photo.src = `assets/people/${p.photo}.webp`;
    // 이름과 별칭이 바로 아래 글자로 나오므로 alt를 비운다. 채우면
    // 화면 낭독기가 같은 이름을 두 번 읽는다.
    photo.alt = '';
    photo.decoding = 'async';

    const plate = el('div', 'exp-card__plate');
    plate.append(
      el('div', 'exp-card__name', `${p.name} ${p.title}`),
      el('div', 'exp-card__nickname', `(${p.nickname})`),
    );

    card.append(photo, plate);
    root.appendChild(card);
  }
}

// 4-3 우리의 해결사 코치.
//
// 사람을 소속별로 늘어놓지 않고 **과제별로 묶는다.** 크루가 이 장에서
// 찾는 것은 "팀스파르타가 몇 명인가"가 아니라 "내 과제는 누가 봐주는가"다.
// 묶음 안에서도 자문과 코치를 갈라 놓는다 — 오는 빈도가 다르기 때문이다
// (자문 주 1~2회, 코치 상시). 그 빈도를 묶음 머리에 못 박아 둔다.
function renderCoaches(root) {
  root.className = 'coach-grid';

  for (const group of COACHES) {
    const card = el('div', 'coach-card');

    const head = el('div', 'coach-card__head');
    head.append(
      el('span', 'coach-card__no', `과제 ${group.no}`),
      el('span', 'coach-card__task', group.task),
    );
    card.appendChild(head);

    const line = (person, when) => {
      const row = el('div', 'coach-person');
      const name = el('div', 'coach-person__name', person.name);
      name.appendChild(el('small', 'coach-person__title', person.title));
      row.append(name, chip(person.org), el('div', 'coach-person__when', when));
      return row;
    };

    card.appendChild(el('div', 'coach-card__label', '자문'));
    card.appendChild(line(group.advisor, '주 1~2회'));
    card.appendChild(el('div', 'coach-card__label', '기술 코치'));
    for (const c of group.coaches) card.appendChild(line(c, '상시'));

    root.appendChild(card);
  }
}

// 4-4 지원 체계 조직도.
//
// 상자를 세로로 쌓고 '▼' 글자를 끼워 넣던 예전 방식은 "누가 누구에게
// 무엇을 주는가"를 못 보여줬다. 원본 도식대로 **다섯 칸 격자**에 놓는다 —
// 좌우 지원 조직이 실행팀과 같은 줄에 서고, 화살표가 그 사이 칸을 차지한다.
// 가로 화살표가 별도 줄을 쓰지 않으므로 세로 예산도 늘지 않는다.
//
//        [임원]
//           ↓ 목표 · 협조 승인
//  [Advisor] → [실행팀] ↔ [Infra & Tech]
//           ↕ 구현 결과물 / 테스트 · 피드백
//      [실사용자]
//
// 임원과 Advisor는 한 방향(지지)이고, 실사용자와 Infra & Tech는 주고받는다.
const ARROW = {
  down:  '<svg class="org-flow__art org-flow__art--v" viewBox="0 0 14 46" fill="none" aria-hidden="true"><path d="M7 2v36"/><path d="M2 33l5 7 5-7"/></svg>',
  right: '<svg class="org-flow__art" viewBox="0 0 52 14" fill="none" aria-hidden="true"><path d="M2 7h44"/><path d="M41 2l7 5-7 5"/></svg>',
  leftRight: '<svg class="org-flow__art" viewBox="0 0 52 14" fill="none" aria-hidden="true"><path d="M6 7h40"/><path d="M11 2L4 7l7 5"/><path d="M41 2l7 5-7 5"/></svg>',
  upDown: '<svg class="org-flow__art org-flow__art--v" viewBox="0 0 14 46" fill="none" aria-hidden="true"><path d="M7 6v34"/><path d="M2 11l5-7 5 7"/><path d="M2 35l5 7 5-7"/></svg>',
  // 실행팀 상자 안에서 역할끼리 주고받는 짧은 양방향 화살표.
  swap: '<svg class="org-swap__art" viewBox="0 0 30 14" fill="none" aria-hidden="true"><path d="M5 7h20"/><path d="M9 3L5 7l4 4"/><path d="M21 3l4 4-4 4"/></svg>',
};

// 세로 화살표는 그림 옆에 글자를 두고, 가로 화살표는 그림 위에 둔다.
// 글자가 둘이면 그림을 사이에 끼운다 — 위아래로 쌓으면 그 줄만 한 줄
// 더 높아지고, 어느 글자가 어느 방향인지도 흐려진다.
function flow(area, kind, ...labels) {
  const node = el('div', `org-flow org-flow--${area}`);
  node.style.gridArea = area;

  const art = el('span', 'org-flow__artwrap');
  art.innerHTML = ARROW[kind];

  if (labels.length > 1) {
    node.append(el('span', 'org-flow__label', labels[0]), art, el('span', 'org-flow__label', labels[1]));
  } else {
    node.append(el('span', 'org-flow__label', labels[0]), art);
  }
  return node;
}

function renderOrg(root) {
  root.className = 'org';

  const tier = (cls, area, label, body) => {
    const node = el('div', `org-tier ${cls}`);
    node.style.gridArea = area;
    node.append(el('div', 'org-tier__label', label), el('p', 'org-tier__body', body));
    return node;
  };

  const grid = el('div', 'org-grid');
  const [advisor, infra] = ORG_TIERS.sides;

  grid.appendChild(tier('org-tier--sponsor', 'sponsor', ORG_TIERS.sponsor.label, ORG_TIERS.sponsor.body));
  grid.appendChild(flow('flowtop', 'down', '목표 · 협조 승인'));
  grid.appendChild(tier('org-tier--side', 'advisor', advisor.label, `${advisor.org}\n${advisor.body}`));
  grid.appendChild(flow('flowleft', 'right', '기술 자문'));

  // 실행팀 상자 안쪽. 원본 도식대로 마스터 크루 둘을 한 묶음으로 감싸고,
  // 외부 기술 코치는 그 묶음 **밖**에 세운다. 코치는 팀스파르타 소속이라
  // 크루 명단에 들어가지 않는 사람이고, 묶음이 그 경계를 그린다.
  const role = (r) => {
    const cell = el('div', 'org-role');
    cell.append(el('div', 'org-role__name', r.name), el('p', 'org-role__body', r.body));
    return cell;
  };
  const swap = () => {
    const node = el('div', 'org-swap');
    node.innerHTML = ARROW.swap;
    return node;
  };

  const core = el('div', 'org-core');
  core.style.gridArea = 'core';
  core.appendChild(el('div', 'org-tier__label', ORG_TIERS.core.label));

  const crew = el('div', 'org-crew');
  crew.appendChild(el('div', 'org-crew__label', ORG_TIERS.core.crew.label));
  const crewRoles = el('div', 'org-crew__roles');
  const [owner, domain] = ORG_TIERS.core.crew.roles;
  crewRoles.append(role(owner), swap(), role(domain));
  crew.appendChild(crewRoles);

  const inner = el('div', 'org-core__body');
  inner.append(crew, swap(), role(ORG_TIERS.core.coach));
  core.appendChild(inner);
  grid.appendChild(core);

  grid.appendChild(flow('flowright', 'leftRight', '인프라 · API 지원'));
  grid.appendChild(tier('org-tier--side', 'infra', infra.label, `${infra.org}\n${infra.body}`));
  grid.appendChild(flow('flowbot', 'upDown', '구현 결과물 전달', '테스트 · 피드백'));
  grid.appendChild(tier('org-tier--user', 'user', ORG_TIERS.user.label, ORG_TIERS.user.body));

  root.appendChild(grid);

  const principles = el('div', 'org-principles');
  for (const p of ORG_TIERS.principles) {
    const item = el('div', 'org-principle');
    item.append(el('div', 'org-principle__title', p.title), el('p', 'org-principle__body', p.body));
    principles.appendChild(item);
  }
  root.appendChild(principles);
}

// 5-1 마스터 과제 3종 — 관점·과제명·기대효과만. 상세는 5-2~5-4에서 푼다.
//
// 카드 순서는 **번호 → 관점 → 과제명 → 기대효과**다.
//
// 사진은 2026-08-05에 뺐다. 분위기 사진 세 장이 카드 높이의 절반을
// 가져가면서 정작 읽어야 할 과제명이 눌려 있었다. 사진이 빠진 자리를
// 과제명에 돌려주고, 대신 번호를 크게 세워 세 칸을 왼쪽부터 셀 수 있게
// 한다. 인원 줄(크루 N명 · 자문 1명)은 바로 다음 장의 범례에 다시 나온다.
function renderTaskOverview(root) {
  root.className = 'card-grid card-grid--tasks';
  for (const t of TASKS) {
    const card = el('div', 'card');

    const head = el('div', 'card__head');
    head.append(
      el('span', 'card__no', String(t.no)),
      el('span', 'card__perspective', t.perspective),
    );
    card.appendChild(head);

    card.appendChild(el('div', 'card__title card__title--sm', t.title));

    const list = el('ul', 'card__effects');
    for (const effect of t.effects) list.appendChild(el('li', null, effect));
    card.appendChild(list);
    root.appendChild(card);
  }
}

// 문장 안의 지정된 조각만 굵게 세운다. 원본 장표가 아웃풋 문장에서
// "무엇을 만드는가"에 해당하는 부분만 굵게 처리한 것을 그대로 옮긴 것이다.
//
// **innerHTML을 쓰지 않는다.** 굵힐 조각은 content.js가 주는 고정 문자열
// 이지만, 본문에 태그처럼 보이는 글자가 섞여도 안전하도록 텍스트 노드로만
// 짓는다. 일치하는 조각이 없으면 문장이 그대로 나온다.
function markUp(text, marks) {
  const frag = document.createDocumentFragment();
  let rest = String(text);

  while (rest) {
    // 남은 문장에서 가장 먼저 나오는 표시 조각을 찾는다.
    let at = -1;
    let hit = '';
    for (const m of marks ?? []) {
      const i = rest.indexOf(m);
      if (i !== -1 && (at === -1 || i < at)) { at = i; hit = m; }
    }
    if (at === -1) break;

    if (at > 0) frag.appendChild(document.createTextNode(rest.slice(0, at)));
    frag.appendChild(el('strong', 'task-block__mark', hit));
    rest = rest.slice(at + hit.length);
  }

  if (rest) frag.appendChild(document.createTextNode(rest));
  return frag;
}

// 5-2~5-4 과제 상세 + 크루 명단
function renderTaskDetail(root, taskId) {
  const t = TASKS.find((task) => task.id === taskId);
  if (!t) return;

  root.className = 'task';

  const head = el('div', 'task__head');
  head.append(
    el('p', 'slide__eyebrow', `과제 ${t.no} — ${t.perspective}`),
    // --sm은 --mid보다 한 단계 작다. 과제명이 길어 두 줄을 넘기던 것을
    // 줄이고, 그렇게 아낀 자리를 아래 세 블록에 넘긴다.
    el('h2', 'slide__title slide__title--sm', t.title),
  );

  // 이 세 줄이 슬라이드의 본론이다. 크루 명단은 이름을 확인하는 곳이지
  // 읽는 곳이 아니다.
  //
  // 원본 장표처럼 **가로로 긴 한 줄씩** 쌓는다. 예전에는 셋을 3열로
  // 나눠 놓았는데, 아웃풋처럼 긴 문장이 폭 1/3짜리 칸에서 대여섯 줄로
  // 접혀 읽기 어려웠다. 왼쪽에 라벨 칸을 두는 것도 원본과 같다.
  const blocks = el('div', 'task__blocks');
  const block = (label, body, marks) => {
    const node = el('div', 'task-block');
    node.append(el('div', 'task-block__label', label));
    const text = el('p', 'task-block__body');
    text.appendChild(markUp(body, marks));
    node.appendChild(text);
    return node;
  };
  blocks.append(
    block('배경 / 이슈', t.background),
    block('핵심 내용', t.core),
    block('과제수행 아웃풋', t.output, t.outputMarks),
  );

  const crew = el('div', 'crew');
  const c = t.composition;

  // 범례. 아래 네임카드의 왼쪽 띠와 같은 색을 쓴다 — 범례에서 본 색이
  // 카드에 그대로 나타나야 구성이 한눈에 읽힌다.
  const kicker = el('div', 'crew__kicker');
  kicker.appendChild(el('span', 'crew__kicker-label', '크루 구성'));
  const legend = [
    c.domain ? ['domain', `도메인 ${c.domain}`] : null,
    c.domainDev ? ['domain-dev', `도메인+개발 ${c.domainDev}`] : null,
    c.dev ? ['dev', `개발 ${c.dev}`] : null,
    c.advisor ? ['advisor', `미래연 자문 ${c.advisor}`] : null,
  ].filter(Boolean);
  for (const [role, text] of legend) {
    kicker.appendChild(el('span', `crew__legend crew__legend--${role}`, text));
  }
  crew.appendChild(kicker);

  const grid = el('div', 'crew__grid');
  for (const m of t.members) {
    const cell = el('div', `crew-cell crew-cell--${m.role}`);
    // 이름만 쓴다. 미래연 자문 세 분만 title(수석연구원)을 갖고 있는데,
    // 그것까지 붙이면 같은 줄에 선 카드의 글자 수가 혼자 길어져 명단이
    // 들쭉날쭉해진다. 직책은 진행자 노트에만 남는다.
    const name = el('div', 'crew-cell__name', m.name);
    // 소속 칩도 **역할 색**을 쓴다. 회사별 색을 쓰던 때는 한 칸 안에서
    // 왼쪽 띠(역할)와 칩(회사)이 다른 색으로 갈려, 범례에서 본 색이
    // 카드에서 두 번 다르게 나타났다. 이 장에서 세는 것은 회사가 아니라
    // 도메인 몇 · 개발 몇 · 자문 몇이므로 색을 역할 하나로 모은다.
    cell.append(name, el('span', `chip chip--role chip--role-${m.role}`, m.company));
    // 미래연 자문 세 분은 부서 표기가 비어 있다. 그 자리에 직책을 넣어
    // 카드 높이를 다른 크루와 맞추고, 빈 칸이 남지 않게 한다.
    const under = m.dept || m.title;
    if (under) cell.appendChild(el('div', 'crew-cell__dept', under));
    grid.appendChild(cell);
  }
  crew.appendChild(grid);

  root.append(head, blocks, crew);
}

// 7-3 완주한 사람에게 남는 것.
//
// 이 슬라이드가 답해야 하는 질문은 "무엇이 같고 무엇이 다른가"다. 그래서
// 공통을 맨 위에 한 줄로 놓고, 그 아래 두 트랙을 나란히 세워 차이를
// 눈으로 비교하게 한다. 청중이 마스터 크루이므로 마스터 쪽을 밝힌다
// (2-2 투 트랙 슬라이드와 같은 장치).
//
// 제품 사진이 아직 없어 노트북 모양은 CSS로 그린다(styles/roster.css).
// 실제 이미지가 오면 .laptop 안을 <img>로 바꾸면 된다.
// 제품 그림. item.image가 있으면 실제 사진을, 없으면 CSS로 그린 노트북을
// 놓는다. 사진 파일만 assets/perks/ 에 넣고 content.js에 파일명을 적으면
// 나머지는 그대로 동작한다.
function productArt(item) {
  if (item.image) {
    const img = document.createElement('img');
    img.className = 'perk-art perk-art--photo';
    img.src = `assets/perks/${item.image}`;
    img.alt = '';
    img.decoding = 'async';
    return img;
  }
  const node = el('div', `perk-art laptop laptop--${item.icon}`);
  node.append(el('div', 'laptop__screen'), el('div', 'laptop__base'));
  return node;
}

// 6-1 아래 절반 — 완주한 크루에게 남는 것.
//
// **마스터 트랙만 싣는다.** 청중이 마스터 크루라 남의 트랙 보상은 잡음이다.
// 평가 기준과 한 장에 들어가면서 세로 예산이 반으로 줄었으므로, 예전의
// 두 열(마스터·챌린저)을 버리고 **한 줄 세 칸**으로 눕혔다.
function renderPerks(root) {
  root.className = 'perks perks--row';

  const master = PERKS.tracks.find((t) => t.lit);

  // 공통 상장이 첫 칸이다. 수상팀이면 트랙과 무관하게 받는 것이라
  // 제품 두 칸보다 앞에 둔다.
  const common = el('div', 'perk-cell perk-cell--common');
  common.append(
    el('div', 'perk-cell__rank', `${PERKS.common.label} · 두 트랙 공통`),
    el('div', 'perk-cell__product', PERKS.common.body),
  );
  root.appendChild(common);

  for (const item of master.items) {
    const cell = el('div', `perk-cell${item.only ? ' perk-cell--only' : ''}`);
    cell.appendChild(productArt(item));

    const text = el('div', 'perk-cell__text');
    text.append(
      el('div', 'perk-cell__rank', `${item.rank} · ${item.teams}`),
      el('div', 'perk-cell__product', item.product),
    );
    if (item.kind) text.appendChild(el('div', 'perk-cell__kind', item.kind));
    cell.appendChild(text);
    if (item.only) cell.appendChild(el('div', 'perk-cell__badge', item.onlyLabel));
    root.appendChild(cell);
  }
}

const RENDERERS = {
  sponsors: renderSponsors,
  expedition: renderExpedition,
  coaches: renderCoaches,
  support: renderOrg,
  tasks: renderTaskOverview,
  perks: renderPerks,
};

export function mountRoster(roots) {
  for (const root of roots) {
    const key = root.dataset.roster;
    if (key.startsWith('task:')) {
      renderTaskDetail(root, key.slice('task:'.length));
      continue;
    }
    const render = RENDERERS[key];
    if (render) render(root);
  }
}
