// 슬라이드 구조의 유일한 원본. index.html의 슬라이드 순서는 이 파일을
// 그대로 따른다. 순수 데이터라서 DOM 없이 테스트할 수 있다.
//
// note는 진행자 노트 창에만 뜨고 프로젝터에는 나오지 않는다.
// noteTask가 붙은 슬라이드는 노트 창이 content.js에서 크루 강점을 읽어
// 뒤에 덧붙인다. 22명분 문장을 여기에 복사하지 않는 이유다.

export const CHAPTERS = [
  {
    id: 'opening',
    title: '오프닝',
    slides: [
      { id: 'title', title: 'WX해커톤 마스터 트랙 오프라인 팀밋업',
        note: '정시 시작 전까지 이 화면을 띄워둔다. 배경 오로라가 도는 상태 그대로가 대기 화면이다.' },
      { id: 'selected', title: '여러분은 마스터 크루입니다',
        note: '첫 대면 자리다. 이 장에서 환영사 큐를 넘긴다. 116명 지원에 3팀 22명 선발 — 5.3:1이다. 운영 자료의 "15~20명"은 확정 전 계획치이고, 최종 확정 명단이 22명이다.' },
      { id: 'three-things', title: '오늘 집에 갈 때 손에 쥐고 갈 것',
        note: '오늘의 목적 선언. 하루 종일 이 세 가지로 돌아온다. 오후 세션 세 개와 1:1로 대응한다.' },
    ],
  },
  {
    id: 'overview',
    title: '해커톤 개요',
    slides: [
      { id: 'what-is', title: 'WX해커톤은 어떤 대회인가요',
        note: '3회차라는 점, 올해 처음 투 트랙으로 나뉘었다는 점만 짚고 넘어간다. 길게 끌지 않는다. 경쟁률을 묻거든 — 24년 6.9:1, 25년 1.9:1, 26년 챌린저 6.9:1, 마스터 5.3:1. 25년은 해커톤과 제로톤 둘 다 열렸고 화면에 나란히 있다.' },
      { id: 'two-track', title: '창의성과 전략성을 결합한 Two-Track',
        note: '"여러분은 오른쪽입니다." 챌린저와 달리 과제가 이미 정해져 있고, 그만큼 기대치도 높다는 점.' },
      { id: 'process', title: '마스터 트랙은 이렇게 진행됩니다',
        note: '오늘이 3단계의 첫날. 본선까지 정확히 5주 남았다는 것을 숫자로 말해준다.' },
    ],
  },
  {
    id: 'today',
    title: '오늘의 흐름',
    slides: [
      { id: 'timetable-all', title: '오늘 팀밋업 순서',
        note: '세부는 읽지 않는다. "오전은 듣는 시간, 오후는 만드는 시간" 한 줄로 요약하고 넘어간다.' },
      { id: 'timetable-am', title: '오전 — 듣고, 알고, 친해지는 시간',
        note: '09:30~13:00. 세부 항목을 읽어야 할 때만 내려온다.' },
      { id: 'afternoon', title: '오후 — 우리 과제를 우리 손으로',
        note: '오전에 여기까지 한 번에 설명하고 끝낸다 — 점심 뒤 안내는 팀스파르타가 자기 자료로 진행하므로 덱에 오후 상세를 다시 펼치는 장은 두지 않는다. 아침 1-3에서 말한 세 가지가 여기서 나온다는 것이 읽히도록 같은 3분할을 쓴다.' },
    ],
  },
  {
    id: 'people',
    title: '함께하는 사람들',
    slides: [
      { id: 'sponsors', title: '오늘 함께해 주신 스폰서를 소개합니다',
        note: '스폰서 4인 인사 순서. 이름 위에 어느 과제를 맡는지가 적혀 있으니 그것을 읽어주며 넘긴다. 스폰서는 오늘 하루 참관이 아니라 9월까지 리소스를 대는 사람이라는 점을 짚는다. 김경철 센터장은 트랙 전체 디렉터이고, 이 자리에서 환영사도 함께 하신다 — 화면을 이대로 둔 채 마이크를 넘긴다.' },
      { id: 'expedition', title: '인창원 해커톤 운영진을 소개합니다',
        note: '아이스브레이킹 구간. 일곱 명이다 — 맨 왼쪽 김민정 그룹장(총감독)부터 시작한다. 얼굴이 크게 뜨므로 한 명씩 눈을 맞추며 별칭의 유래를 짧게 붙이면 웃음이 나온다. 오늘 진행 담당(노영은 과장·이종은 차장)이 누구인지 여기서 확실히 알린다.' },
      { id: 'coaches', title: '우리의 해결사 코치를 소개합니다',
        note: '과제별로 자문 1인 + 기술 코치 2인이 붙는다. 미래연 자문은 주 1~2회 방향을 봐주고, 팀스파르타 코치는 상시로 함께 만든다 — 이 차이를 여기서 한 번 말해두면 다음 장의 지원 체계가 쉽게 읽힌다.' },
      { id: 'support', title: '혼자 만들지 않습니다',
        note: '크루가 혼자 짊어지는 구조가 아니라는 것이 핵심 메시지. 가운데 실행팀에서 시작해 위(임원)·좌(미래연 자문)·우(포스코DX)·아래(실사용자) 순으로 짚는다. 미래연 자문은 주 1~2회, 팀스파르타 코치는 상시라는 점을 구분해서 말한다. 실사용자와 주고받는 아래쪽 양방향 화살표가 애자일 순환이다 — 만들고, 보여드리고, 피드백을 반영한다.' },
    ],
  },
  {
    id: 'tasks',
    title: '우리 과제와 크루',
    slides: [
      { id: 'tasks-all', title: '최종 선발된 세 개의 과제',
        note: '세 과제가 각각 Work / Process / Value 라는 다른 관점을 대표한다는 점. 우연이 아니라 그렇게 고른 것이다.' },
      { id: 'task-safety', title: '과제1 · 안전', noteTask: 'safety',
        note: '도메인 5 · 개발 2 · 자문 1. 도메인 5인은 안전기획실 추천, 개발 2인은 안전보건플랫폼·설비관리시스템 WO 담당자다.' },
      { id: 'task-logistics', title: '과제2 · 물류', noteTask: 'logistics',
        note: '도메인 4 · 개발 4 · 자문 1. 세 과제 중 유일하게 개발 인력이 4명이다. 구축 난도가 가장 높은 과제라는 뜻.' },
      { id: 'task-market', title: '과제3 · 마켓 센싱', noteTask: 'market',
        note: '도메인 3 · 도메인+개발 2 · 개발 2 · 자문 1. 도메인과 개발을 겸하는 인원이 2명으로, 세 팀 중 경계가 가장 흐린 팀이다.' },
    ],
  },
  {
    id: 'reward',
    title: '혜택과 평가',
    slides: [
      { id: 'reward', title: '무엇으로 평가받고, 무엇이 남는가',
        note: '위가 평가, 아래가 보상이다. 두 평가를 모두 받는다는 점, Verification은 본부장급·Validation은 실장급 임원이 들어온다는 점을 짚고(2 Track 구성은 센터장 의견으로 정해졌다), 그대로 아래로 내려가 "완주하면 이것이 남는다"로 분위기를 올린다. 챌린저 특전은 화면에 없다 — 물으면 참가자 전원 에어팟이라고만 답한다.' },
      { id: 'teambuilding', title: '이제, 팀 빌딩',
        note: '팀 빌딩 세션으로 넘기는 장이다. 화면을 띄운 채로 진행 방법을 말한다 — PM을 먼저 뽑고, 역할을 나누고, 팀 이름을 정한다. 오늘 하루의 나머지가 여기서 정해진 팀으로 굴러간다는 점을 짚는다.' },
    ],
  },
  {
    id: 'devprep',
    title: '개발 준비',
    slides: [
      { id: 'governance', title: '바이브 코딩, 이것만은 지킵니다',
        note: '다리 슬라이드다. 제목과 두 항목만 읽고 김두환 리더에게 넘긴 뒤 화면을 리더 자료로 바꾼다. 화면 전환에 시간이 걸리면 이 장을 띄워둔 채로 기다린다. 내용(허용 도구 범위, 데이터 반입 기준, 산출물 귀속)은 리더가 직접 말한다.' },
      { id: 'agentee', title: '개발 환경 — Agentee 플랫폼',
        note: '같은 다리 슬라이드. 이 세션은 논의 시간이 포함돼 있으므로 화면을 일찍 김우겸 프로에게 넘기고 플랫폼 실화면으로 진행하게 한다.' },
    ],
  },
  {
    id: 'closing',
    title: '점심과 클로징',
    slides: [
      { id: 'networking', title: '잠깐, 밥먹고 합시다!',
        note: '오후 첫 세션이 "첫 상견례"다. 이 한 시간이 사실상 팀 빌딩이라는 점을 가볍게 말해둔다.' },
      { id: 'closing', title: '9월 10일, 송도에서 본선으로 다시 만나요',
        note: '슬로건을 다시 띄우고 배경을 밝힌다. 1-1과 수미상관.' },
    ],
  },
];

export function chapterCount() {
  return CHAPTERS.length;
}

export function rowCount(chapterIndex) {
  const chapter = CHAPTERS[chapterIndex];
  return chapter ? chapter.slides.length : 0;
}

export function totalSlides() {
  return CHAPTERS.reduce((sum, chapter) => sum + chapter.slides.length, 0);
}

export function slideAt(chapterIndex, rowIndex) {
  const chapter = CHAPTERS[chapterIndex];
  if (!chapter) return null;
  return chapter.slides[rowIndex] ?? null;
}
