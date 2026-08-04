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
    start: toMinutes('09:30'), end: toMinutes('10:30'), label: '09:30~10:30',
    title: '오리엔테이션 및 팀 빌딩', titleLines: ['오리엔테이션 및', '팀 빌딩'], duration: '1hr',
    details: [
      '해커톤 개요 및 전체 프로세스 공유',
      '과제별 스폰서 소개',
      '팀 빌딩 및 역할 분담',
    ],
    owner: '노영은 과장 · 이종은 차장', isBreak: false,
  },
  {
    id: 'guidance',
    start: toMinutes('10:30'), end: toMinutes('11:00'), label: '10:30~11:00',
    title: '과제 및 개발 관련 주의사항 안내', titleLines: ['과제 및 개발 관련', '주의사항 안내'], duration: '0.5hr',
    details: [
      '마스터 트랙 과제 설명 (안전 · 물류 · 마켓 센싱)',
      '바이브 코딩 거버넌스 공유',
    ],
    owner: '김두환 리더', isBreak: false,
  },
  {
    id: 'agentee',
    start: toMinutes('11:00'), end: toMinutes('12:00'), label: '11:00~12:00',
    title: '개발 환경(Agentee 플랫폼) 안내', titleLines: ['개발 환경 안내', '(Agentee 플랫폼)'], duration: '1hr',
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
      '첫 상견례 및 과제 최초 검토 (마스터 크루 · 미래연 자문 · 팀스파르타 기술코치)',
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
