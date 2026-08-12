// 슬라이드 구조의 유일한 원본. index.html의 슬라이드 순서는 이 파일을
// 그대로 따른다. 순수 데이터라서 DOM 없이 테스트할 수 있다.
//
// 2026-08-10 운영이 확정 구성안을 주어 9챕터 22장으로 다시 짰다. 교육개요·
// 투트랙·챕터 8(사전학습·Discord·액션플랜·마일스톤)이 빠지고, 선정 축하·
// 완주 선물·평가 비결·FAQ가 들어왔다. **마스터 자료로 임시로 채웠던 열 곳이
// 전부 확정본으로 바뀌거나 사라졌다** — 남은 임시 자료는 이제 없다.
//
// note는 진행자 노트 창에만 뜨고 프로젝터에는 나오지 않는다.
//
// chapter.scene은 그 챕터의 배경 씬이다. 슬라이드가 자기 scene을 따로
// 선언하면 그것이 이긴다 — 챕터 4는 개요 한 장과 팀 여덟 장이 다른 씬을
// 쓰고, 챕터 7은 코스 한 장과 선물·평가 두 장이 다른 씬을 쓴다.
//
// placeholder가 붙은 슬라이드는 **자료를 아직 받지 못한 자리**다.
// 확정본이 오면 갈아끼운다. 화면에 ⚠︎ 가 뜨고 테스트가 목록을 출력한다.
//
// place는 **문구가 화면 어디에 놓이는가**다. 한 자리에 고정하지 않는다 —
// 씬마다 비어 있는 자리가 다르다. 씬 프롬프트의 "비워 둘 자리" 지시와 이
// 값이 짝이므로, 씬을 다시 뽑으면 여기도 함께 본다.
//
// card가 붙으면 문구 뒤에 흰 판을 깐다. **배경이 가장 복잡한 자리에만** 쓴다.

export const PLACES = [
  'center', 'wide',
  'left-top', 'left-center', 'left-bottom',
  'right-top', 'right-center', 'right-bottom',
];

export const CHAPTERS = [
  {
    id: 'opening',
    title: '오프닝',
    scene: 'raceday',
    slides: [
      // 표지만 스크림을 끈다. 대회장 아침이 이 덱의 첫인상이라 하얗게 덮지 않는다.
      { id: 'title', title: '2026 WX해커톤 챌린저 트랙 온라인 팀밋업', place: 'center', scrim: 'off',
        note: '정시 시작 전까지 이 화면을 띄워둔다. 8. 12 (수) 14:00, Teams 영상회의. 참가자가 하나둘 들어오는 동안 배경이 천천히 흐르는 상태가 대기 화면이다.' },
      // 씬을 표지와 나눠 쓴다 — 표지에서 넘어올 때 배경도 배번표 장면으로
      // 함께 바뀐다. 크루끼리 서로 배번표를 붙여 주는 그림이라 "선정"이라는
      // 말을 그림이 대신 한다.
      { id: 'congrats', title: '챌린저 트랙 크루 선정을 축하드립니다!', scene: 'bibs', place: 'center',
        note: '14개 사 219명(55개 과제) 지원 → 5개사 32명(8개 과제) 본선 진출. 배번표를 받은 것처럼 — 숫자가 올라가는 동안 박수를 유도한다.' },
    ],
  },
  {
    id: 'hackathon',
    title: '해커톤 소개',
    scene: 'crowd',
    slides: [
      // 마스터와 똑같은 연도별 구성에 2026 챌린저만 불을 켠다 (운영 지시).
      { id: 'what-is', title: 'WX해커톤은 어떤 대회인가요?', place: 'wide',
        note: '연도별 흐름을 훑고 2026 챌린저 숫자(219명 → 32명)에서 멈춘다. "여러분이 저 6.9:1을 뚫고 오셨습니다."' },
      // 마스터 덱(hackathon.wx.ai.kr #2/2)의 투 트랙 장을 가져와 **뒤집었다**
      // (2026-08-12 요청). 그쪽은 마스터에 불이 켜져 있고 챌린저가 흐리다.
      // 같은 그림을 두 덱이 반대로 쓰는 것이 맞다 — 각자 자기 트랙을 본다.
      // 씬을 챕터와 따로 쓴다 — 관중석 대신 **두 갈래로 갈라진 코스**다.
      { id: 'two-track', title: '창의성과 전략성을 결합한 Two-Track', place: 'wide', scene: 'twotrack',
        note: '"여러분은 왼쪽입니다." 마스터는 과제가 위에서 정해져 내려오고, 챌린저는 현업에서 스스로 찾아 올라간다 — 화살표 방향이 그 말이다. 오른쪽 마스터는 참고로만 두고 길게 설명하지 않는다.' },
    ],
  },
  {
    id: 'cheer',
    title: '응원의 시간',
    scene: 'sendoff',
    slides: [
      // 문구를 미리 받는 자리가 아니다 — 센터장이 마이크로 직접 전한다.
      { id: 'cheer', title: '출발 전, 파이팅 메시지', place: 'left-top',
        note: '김경철 센터장(포스코인재창조원 혁신기술센터) 응원 메시지. 화면을 이대로 둔 채 마이크를 넘긴다.' },
    ],
  },
  {
    id: 'crew',
    title: '크루 소개',
    scene: 'startline',
    slides: [
      // 여덟 팀 전체가 한 장에. 팀 순서는 팀명 가나다순(한글 먼저, 영문 나중) —
      // 운영 지시. content.js의 TEAMS가 이미 그 순서로 정렬돼 있다.
      { id: 'crew-all', title: 'Ready, Set, Hack!', place: 'wide',
        note: '여덟 팀 훑어보기. 다음 여덟 장에서 팀장이 직접 3분씩 소개한다는 것을 여기서 안내한다. 팀 순서는 팀명 가나다순이다.' },
      // 팀 여덟 장. **화면에 얹는 것이 하나도 없다**(2026-08-12).
      //
      // 팀명·아이디어명·크루 넷의 회사와 이름이 전부 배경 그림에 구워져
      // 있어서, index.html의 <article>이 비어 있고 배경만 보인다. 그래서
      // 팀장이 마이크로 말하는 동안 화면이 떠들지 않는다 — 예전에는 흰
      // 카드가, 그다음에는 씬 속 전광판 안의 HTML이 하던 일이다.
      //
      // 팀마다 제 그림 한 장이고 씬 id도 팀 id와 같다(scenes.js).
      //
      // 여기 title은 **진행자 노트와 진행바만** 읽는다. 무대에 뜨는 팀명은
      // 그림 안에 있으므로, 이 값을 고쳐도 화면은 바뀌지 않는다 — 그림을
      // 다시 뽑아야 한다. 두 곳이 어긋나지 않는지 테스트가 본다.
      { id: 'team-1', title: '배꼽 (배 + Copilot)', scene: 'team-1', team: 1, place: 'left-bottom', note: '포스코 3명 + 포스코플로우 1명. 팀장 소개 3분.' },
      { id: 'team-2', title: '설루션', scene: 'team-2', team: 2, place: 'left-bottom', note: '포스코. 팀명은 설비자재구매실 & 설비기술부 + 솔루션에서 왔다.' },
      { id: 'team-3', title: '설비실종수사대', scene: 'team-3', team: 3, place: 'left-bottom', note: '포스코 2명 + 포스코DX 2명.' },
      { id: 'team-4', title: '웰커넥트 (WellConnect)', scene: 'team-4', team: 4, place: 'left-bottom', note: '포스코인터내셔널.' },
      { id: 'team-5', title: '터널 밖 개구리', scene: 'team-5', team: 5, place: 'left-bottom', note: '포스코이앤씨.' },
      { id: 'team-6', title: '텐엑스 (10x)', scene: 'team-6', team: 6, place: 'left-bottom', note: '포스코DX.' },
      { id: 'team-7', title: '포브레인 (4Brain)', scene: 'team-7', team: 7, place: 'left-bottom', note: '포스코.' },
      { id: 'team-8', title: 'HR AX 연구소', scene: 'team-8', team: 8, place: 'left-bottom', note: '포스코. 영문 팀명이라 가나다순의 맨 뒤다.' },
    ],
  },
  {
    id: 'staff',
    title: '운영진 소개',
    scene: 'hq',
    slides: [
      // 씬 안에 일곱 명이 이미 그려져 있고 이름표만 그 아래에 세운다.
      { id: 'expedition', title: '이 레이스, 저희가 함께 뜁니다', place: 'left-top',
        note: '센터장을 뺀 일곱 명. 각자 든 소품이 곧 역할이다 — 신호탄·페이서 깃발·결승선 테이프·급수컵·스톱워치·드론·메가폰.' },
    ],
  },
  {
    id: 'game',
    title: '팀 빌딩 게임',
    scene: 'warmup',
    slides: [
      // 게임은 현장에서 진행자가 이끈다. 화면은 넘어가는 다리 한 장이면 된다.
      { id: 'game', title: '본격적인 레이스를 시작해볼까요', place: 'left-top',
        note: '해커톤 팀빌딩 게임 PLAY. 진행 방식은 화면이 아니라 진행자가 말로 안내한다.' },
    ],
  },
  {
    id: 'race',
    // 세 장이 급수대 씬 하나를 함께 쓴다. 코스 지도 씬(coursemap)은
    // 2026-08-11에 걷어냈다 — 진행 흐름 장(#7/1)의 배경을 선물 장(#7/2)과
    // 같게 해 달라는 요청이었고, 그러면서 쓰는 곳이 없어져 파일까지 지웠다.
    // 씬이 하나라 카메라가 세 장에 걸쳐 끊기지 않고 이어서 파고든다.
    title: '레이스 안내',
    scene: 'water',
    slides: [
      { id: 'course', title: '출발부터 완주까지, 챌린저 레이스 코스', place: 'wide',
        note: '다섯 구간: 지원(7.20~26) → 선발(7.27~31) → 오늘 팀밋업(8.12) → 사전학습(8.13~9.9) → 본선(9.10~11 무박 2일). "오늘 여기"를 짚는다.' },
      { id: 'gifts', title: '완주에 필요한 건 다 준비했습니다', place: 'wide',
        note: '참가자 100% 선물(에어팟 4 ANC — 수상팀 제외, 굿즈), 교육 콘텐츠 무제한(박종천 특강·스파르타 수강권·AI Tool 유료 플랜), 1:1 전문 코치 멘토링.' },
      { id: 'evaluation', title: '잘 달리는 팀보다, 함께 달리는 팀이 우승합니다', place: 'wide',
        note: '심사위원 평가 75%(혁신성·실현가능성·파급력, 기준은 본선 1주 전 공지) + 협업 점수 25%(팀미팅 횟수·디스코드 소통 지수·사전학습 참여도).' },
    ],
  },
  {
    id: 'finals',
    title: '본선을 향해',
    scene: 'turnpoint',
    slides: [
      // 2026-08-10 운영이 본선 시간표를 주어 ⚠︎ 를 떼었다. 표는 index.html에
      // grid-template-areas로 짜여 있다(styles/scene.css의 .fs).
      { id: 'finals-schedule', title: '결승선까지 남은 2일', place: 'wide',
        note: '무박 2일. 1일차는 접수·개회식·특강 뒤 오후부터 과제 수행, 18시부터 밤샘 14시간. 2일차는 코칭 → 과제 수행 → 결과 발표회(3hr) → 시상. 초록이 챌린저, 파랑이 마스터다. ⚠︎ 2일차 오전 블록은 원본이 09~12시(3칸)인데 4hr로 적혀 있다 — 운영 확인 필요.' },
      // ⚠︎ 배지를 뗐다(2026-08-10 요청). 소개 자료는 아직 없지만 화면에
      // 경고를 띄우지 않는다 — 이 장은 진행자가 말로 소개하는 자리다.
      { id: 'teamsparta', title: '혼자 뛰지 마세요, 코치가 함께 갑니다', place: 'left-top',
        note: '사전학습 이러닝과 1:1 코칭을 맡는 파트너다. 소개 자료가 오면 이 장에 넣는다.' },
      { id: 'faq', title: '출발 전, 이것만은 체크!', place: 'wide',
        note: '설문(8.12 17시~8.13 17시, 러닝플랫폼) · 입과 안내(9.3 개별 메일) · 발표 13분(발표 8 + 질의 5, 순서는 당일) · 유료 라이선스(팀별 메인 개발자 Claude Code Premium, 나머지는 선택) · 문의는 디스코드.' },
    ],
  },
  {
    id: 'closing',
    title: '마무리',
    scene: 'finish',
    slides: [
      { id: 'closing', title: '우리는 9월 10일, 본선에서 다시 만나겠습니다!', place: 'center',
        note: '본선 2026. 9. 10~11, 무박 2일 끝장 개발. 남은 임시 자료 개수가 이 화면에 뜬다 — 0이 되면 발표 준비 완료다.' },
    ],
  },
];

export function chapterCount() {
  return CHAPTERS.length;
}

export function rowCount(chapterIndex) {
  return CHAPTERS[chapterIndex]?.slides.length ?? 0;
}

export function totalSlides() {
  return CHAPTERS.reduce((sum, c) => sum + c.slides.length, 0);
}

export function slideAt(chapterIndex, rowIndex) {
  return CHAPTERS[chapterIndex]?.slides[rowIndex] ?? null;
}

// 열 우선(한 챕터의 모든 행을 지나고 다음 챕터로) 평탄화. deck.js의 ORDER와
// 같은 순서다.
export function flatSlides() {
  return CHAPTERS.flatMap((c) => c.slides);
}

// 임시로 채운 자리의 목록. **개수가 아니라 목록으로 돌려준다** — 개수를
// 고정값으로 박으면 항목을 갈아끼울 때마다 테스트를 함께 고쳐야 해서,
// 정작 무엇이 남았는지는 아무도 보지 않게 된다.
export function placeholders() {
  return flatSlides()
    .filter((s) => s.placeholder)
    .map((s) => ({ id: s.id, title: s.title, reason: s.placeholder }));
}
