// 행사 시간표의 유일한 원본. 시간이 바뀌면 여기만 고친다.
// 설계 문서 2절의 표를 그대로 옮긴 것이다.
//
// 원본 표에서 13:00~14:00과 14:00~15:00은 두 행으로 나뉘어 있으나
// 같은 세션(2hr)이라 한 항목으로 합쳤다.

export function toMinutes(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + m;
}

// titleLines는 #3/1 가로 타임라인 전용이다. 칸 폭이 화면의 1/7이라
// 자동 줄바꿈에 맡기면 끊기는 자리가 칸마다 들쭉날쭉하고 세 줄이 되는
// 칸도 생긴다. 두 줄로 나누는 지점을 여기서 정해 둔다.
// 화면의 다른 곳과 진행자 노트는 계속 title(한 줄)을 쓴다.
export const SESSIONS = [
  {
    id: 'orientation',
    start: toMinutes('09:30'), end: toMinutes('11:00'), label: '09:30~11:00',
    title: '오리엔테이션 및 팀 빌딩', titleLines: ['오리엔테이션 및', '팀 빌딩'], duration: '1.5hr',
    details: [
      '해커톤 개요 및 전체 프로세스 공유',
      '과제별 스폰서 소개',
      '팀 빌딩 및 역할 분담',
    ],
    owner: '노영은 과장 · 이종은 차장', isBreak: false,
  },
  {
    id: 'guidance',
    start: toMinutes('11:00'), end: toMinutes('11:30'), label: '11:00~11:30',
    title: '과제 및 개발 관련 주의사항 안내', titleLines: ['과제 및 개발 관련', '주의사항 안내'], duration: '0.5hr',
    details: [
      '마스터 트랙 과제 설명 (안전 · 물류 · 마켓 센싱)',
      '바이브 코딩 거버넌스 공유',
    ],
    owner: '김두환 리더', isBreak: false,
  },
  {
    id: 'agentee',
    start: toMinutes('11:30'), end: toMinutes('12:00'), label: '11:30~12:00',
    title: '개발 환경(Agentee 플랫폼) 안내', titleLines: ['개발 환경 안내', '(Agentee 플랫폼)'], duration: '0.5hr',
    details: [
      '마스터 과제 솔루션 안착을 위한 Agentee 플랫폼 소개',
      '과제별 지원사항 논의',
    ],
    owner: '김우겸 프로 (P-DX)', isBreak: false,
  },
  {
    id: 'networking',
    start: toMinutes('12:00'), end: toMinutes('13:00'), label: '12:00~13:00',
    title: '네트워킹 파티', titleLines: ['네트워킹 파티', '도시락 타임'], duration: '1hr',
    details: [
      '마스터 트랙 참가를 축하하는 시간',
      '편하게 소통하고 친해지는 도시락 타임',
    ],
    owner: '', isBreak: true,
  },
  {
    id: 'discovery',
    start: toMinutes('13:00'), end: toMinutes('15:00'), label: '13:00~15:00',
    title: '과제 발굴 및 과제 재정의', titleLines: ['과제 발굴 및', '과제 재정의'], duration: '2hr',
    details: [
      // \n은 화면에서 줄바꿈이 된다(timetable.js). 참가 주체 세 무리가
      // 괄호 안에 길게 이어져, 앞 문장과 한 줄로 붙으면 어디까지가 활동
      // 이름인지가 흐려진다.
      '첫 상견례 및 과제 최초 검토\n(마스터 크루 · 미래연 자문 · 팀스파르타 기술코치)',
      '문제의 타당성 및 다각도 논의를 통한 과제 재정의',
      '핵심 요구사항 명확화',
    ],
    owner: '팀스파르타', isBreak: false,
  },
  {
    id: 'refine',
    start: toMinutes('15:00'), end: toMinutes('16:00'), label: '15:00~16:00',
    title: '과제 구체화 및 기획 점검', titleLines: ['과제 구체화 및', '기획 점검'], duration: '1hr',
    details: [
      '확정된 과제의 기술적 구현 가능성 검토',
      '솔루션 기획 구체화',
    ],
    owner: '팀스파르타', isBreak: false,
  },
  {
    id: 'milestone',
    start: toMinutes('16:00'), end: toMinutes('16:30'), label: '16:00~16:30',
    title: '팀별 마일스톤 설정 및 개발 목표 수립', titleLines: ['팀별 마일스톤 설정', '및 개발 목표 수립'], duration: '0.5hr',
    details: [
      '과제별 세부 진행 방식 및 액션 플랜 수립',
      '단계별 마일스톤 확정',
    ],
    owner: '팀스파르타', isBreak: false,
  },
];

export const MORNING = ['orientation', 'guidance', 'agentee', 'networking'];
export const AFTERNOON = ['discovery', 'refine', 'milestone'];

// #3/1 순서 슬라이드 전용 묶음.
//
// 세션 7개를 그대로 일곱 칸에 늘어놓지 않는다. 오후 세 세션(5~7)은 모두
// 팀스파르타가 이어서 끌고 가는 한 덩어리라, 한 칸에 묶어야 "오전 넷 +
// 오후 하나"라는 하루의 골격이 보인다. 칸이 다섯으로 줄어 글자도 커진다.
//
// icon은 칸 번호 위에 서는 그림 글자다. 번호만 있을 때보다 무엇을 하는
// 시간인지가 먼저 잡힌다.
// sub는 제목만으로 빠지는 내용을 한 줄 덧붙이는 자리다.
// sessions에 적힌 id가 그 칸이 대표하는 세션들이다 — 시간 범위(label)는
// 이 목록의 처음과 끝에서 계산한다. 시간표가 바뀌어도 여기는 그대로다.
export const FLOW = [
  { icon: '🤝', sessions: ['orientation'], sub: '과제별 스폰서 소개' },
  { icon: '📌', sessions: ['guidance'] },
  { icon: '🛠️', sessions: ['agentee'] },
  { icon: '🍱', sessions: ['networking'] },
  {
    icon: '🚀', no: '5~7', sessions: ['discovery', 'refine', 'milestone'],
    title: '과제 발굴부터 마일스톤까지',
    lines: ['과제 발굴 및 과제 재정의', '과제 구체화 및 기획 점검', '팀별 마일스톤 설정'],
  },
];

// FLOW 한 칸이 덮는 시간 범위. 묶인 칸은 첫 세션의 시작과 끝 세션의 끝을 잇는다.
export function flowLabel(step) {
  const first = SESSIONS.find((s) => s.id === step.sessions[0]);
  const last = SESSIONS.find((s) => s.id === step.sessions[step.sessions.length - 1]);
  if (!first || !last) return '';
  return `${first.label.split('~')[0]}~${last.label.split('~')[1]}`;
}
