// 팀 소개 카드 — 무대에 붙박인 판 하나.
//
// 예전에는 팀 여덟 장이 각자 흰 판을 하나씩 갖고 있었다. 장을 넘기면 판이
// 통째로 미끄러져 나갔다가 다음 판이 들어왔는데, 여덟 번 반복되면 "같은
// 자리에서 소개가 바뀐다"가 아니라 "판이 여덟 번 깜빡인다"로 보였다.
// 2026-08-11 요청으로 **판은 세워 두고 안의 글자만 갈아끼우게** 바꿨다.
//
// **판은 #deck 밖에 있어야 한다.** #deck은 --dx/--dy로 통째로 움직이므로,
// 그 안에 있는 한 판은 반드시 장과 함께 미끄러진다. 카운터 이동으로 상쇄해
// 볼 수도 있지만 .slide의 overflow: hidden에 잘린다 — 덱 밖으로 꺼내는 것
// 말고 판을 세워 둘 방법은 없다.
//
// **여덟 팀을 한 번에 다 넣고 겹쳐 쌓는다.** 한 팀씩 만들어 갈아끼우면 판의
// 크기가 그 팀의 내용을 따라가 팀마다 커졌다 작아졌다 한다(실측으로 높이가
// 250~319px, 폭이 357~457px까지 벌어져 있었다). 여덟을 grid의 같은 칸에
// 겹쳐 두면 격자가 **가장 큰 것**에 맞춰지고, 그 크기가 여덟 장 내내
// 고정된다 — 크기 통일과 붙박이가 같은 장치에서 나온다.

import { TEAMS } from './content.js';
import { renderTeam } from './roster.js';

export function createTeamCard(root) {
  if (!root) return { update() {} };

  // 여덟 팀을 미리 다 찍어 둔다. 장을 넘길 때 하는 일은 클래스 토글뿐이라
  // 전환 중에 DOM을 만들지 않는다 — 연타로 넘겨도 깜빡이지 않는다.
  const layers = new Map();
  for (const team of TEAMS) {
    const layer = document.createElement('div');
    renderTeam(layer, team.no);
    // renderTeam이 className을 'team'으로 덮어쓰므로 그 뒤에 붙인다.
    layer.classList.add('teamcard__layer');
    root.appendChild(layer);
    layers.set(team.no, layer);
  }

  let shown = 0;

  // slide는 slides.js의 슬라이드 하나다. team이 없으면 팀 장이 아니다.
  function update(slide) {
    const no = slide?.team ?? 0;
    if (no === shown) return;
    shown = no;

    // 판 자체의 등장·퇴장. 팀 구간 안에서는 켜진 채로 있고, 구간을 벗어날
    // 때만 꺼진다 — 여덟 장을 지나는 동안 판은 한 번도 사라지지 않는다.
    root.classList.toggle('is-on', no > 0);

    for (const [teamNo, layer] of layers) {
      layer.classList.toggle('is-on', teamNo === no);
    }
  }

  return { update };
}
