// 명단과 과제 데이터의 유일한 원본. 화면(roster.js)과 진행자 노트(notes.js)가
// 함께 읽는다. 문구가 바뀌면 콘텐츠 문서와 이 파일을 함께 고친다.
//
// member.strength는 화면에 렌더하지 않는다. 프로젝터 뒷줄에서 읽히지 않는
// 길이라서, 진행자가 호명하며 읽도록 노트 창에만 띄운다.

// 4-1 스폰서 넷 중 한 분이자 4-2 환영사를 맡는 분.
// photo는 assets/people/<photo>.webp 를 가리킨다(원정대와 같은 규칙).
export const WELCOME = {
  name: '김경철', title: '센터장', org: '포스코인재창조원',
  photo: 'kim-kyungchul',
};

export const SPONSORS = [
  { name: '유재홍', title: '실장',     org: '포스코세이프티솔루션', taskId: 'safety' },
  { name: '하종범', title: '실장',     org: '포스코플로우',        taskId: 'logistics' },
  { name: '박용삼', title: '연구위원', org: '포스코경영연구원',    taskId: 'market' },
];

// 별칭을 크게, 이름을 작게 쓴다. 딱딱한 운영진 소개를 아이스브레이킹으로
// 바꾸는 장치다(콘텐츠 문서 §4-2).
export const EXPEDITION = [
  // photo는 assets/people/<photo>.webp 를 가리킨다. 원본 사진의 파일명이
  // 한글이라 배포 서버의 URL 인코딩 문제를 피하려고 ASCII로 옮겼다.
  // 순서는 화면에 서는 순서 그대로다.
  { nickname: '대장 감독',     name: '김두환', title: '리더', photo: 'kim-doohwan' },
  { nickname: '무대미학 감독', name: '이종은', title: '차장', photo: 'lee-jongeun' },
  { nickname: 'PM',            name: '노영은', title: '과장', photo: 'noh-youngeun' },
  { nickname: '소통 감독',     name: '박은영', title: '과장', photo: 'park-eunyoung' },
  { nickname: '기술 감독',     name: '안서희', title: '사원', photo: 'an-seohee' },
  { nickname: '타임라인 감독', name: '이지영', title: '사원', photo: 'lee-jiyoung' },
];

export const TASKS = [
  {
    id: 'safety',
    // 과제 분위기를 담은 이미지. assets/tasks/<id>.webp (4:3).
    image: 'safety.webp',
    no: 1,
    perspective: '안전 (Work 관점)',
    title: 'PSM 법정 안전 서류 작성 및 준수사항 점검 AI 어시스턴트 개발',
    background: '방대한 법정 요구 서류 작성 부담 및 안전기관 점검 시 적발 사례 과다 발생',
    core: '안전보건플랫폼 內 PSM 서류 초안 작성 및 변경관리(오류·누락)를 점검하는 AI 어시스턴트 구현',
    output: '설비명세서(엑셀 등) 업로드 시 AI가 서류 초안을 자동 작성하고, 단계별 입력을 제안·검토하는 기능 및 워크오더 발생 시 지정 설비를 자동 식별하여 담당자에게 알림을 제공하고, 변경관리까지 연계하는 자동화 시스템 구축',
    // 아웃풋 문장에서 굵게 세울 조각. 원본 장표가 굵게 처리한 자리를
    // 그대로 옮겼다. roster.js가 정확히 일치하는 부분만 <strong>으로 감싼다.
    outputMarks: ['서류 초안을 자동 작성', '담당자에게 알림을 제공', '자동화 시스템 구축'],
    effects: [
      '서류 누락 방지 및 현장 Work 방식 개선',
      '그룹내 PSM 사용 사업사 전체 활용',
    ],
    composition: { domain: 5, dev: 2, domainDev: 0, advisor: 1 },
    members: [
      { name: '이치헌', company: '포스코', dept: '안전기획실 안전진단그룹', role: 'domain',
        strength: 'PSM 지침·제도·대관 대응과 현장 VOE 관리 경험을 바탕으로 법규와 사용자 요구를 균형 있게 반영할 수 있음' },
      { name: '박정용', company: '포스코', dept: '안전방재그룹(포)', role: 'domain',
        strength: 'PSM 업무와 시스템 이해도가 높아 현업의 Pain Point를 발굴하고 AI 적용 방향을 구체화할 수 있는 도메인 전문가' },
      { name: '김동현', company: '포스코', dept: '안전방재그룹(광)', role: 'domain',
        strength: '장기간의 PSM 실무, 시스템 개발 참여, 안전공학 석사 경험을 겸비한 최고 수준의 PSM 기술 전문가' },
      { name: '정병수', company: '포스코', dept: '제강부(포)', role: 'domain',
        strength: '제강부 PSM 실무 경험과 매크로 활용 역량을 바탕으로 반복 문서업무를 자동화할 수 있는 현장 실행형 인재' },
      { name: '김천석', company: '포스코', dept: '제강부(광)', role: 'domain',
        strength: '현장 경험과 PSM 데이터 확보 역량을 갖춰 실제 사용자의 불편과 위험요인을 반영한 현장 친화형 결과물 구현 가능' },
      { name: '장정우', company: '포스코DX', dept: '인텔리전스기술그룹 생산지원섹션', role: 'dev',
        strength: '안전보건플랫폼과 AI Agent 운영 경험에 JAVA·React·RAG 역량을 갖춘 현업·시스템 연계형 핵심 개발자' },
      { name: '김민서', company: '포스코DX', dept: '인텔리전스기술그룹 생산지원섹션', role: 'dev',
        strength: 'LLM·RAG PoC와 설비 WO 운영 경험을 바탕으로 사용자 요구, 예외 상황, 성능을 함께 고려하는 실무형 개발자' },
      { name: '김현중', company: '미래기술연구원', dept: '', role: 'advisor', title: '수석연구원', strength: '' },
    ],
  },
  {
    id: 'logistics',
    // 과제 분위기를 담은 이미지. assets/tasks/<id>.webp (4:3).
    image: 'logistics.webp',
    no: 2,
    perspective: '물류·데이터 (Process 관점)',
    title: '물류 데이터 연동 기반 실시간 지연 알람 대시보드 구축 [해송 분야]',
    background: '사업회사간 데이터 인터페이스 강화를 통해 해송 물류 최적화 및 비용 절감 필요 (체선, 공선, 보관 비용 등)',
    core: '부서/그룹사 간 데이터 장벽으로 인한 납기 지연 및 물류비 상승 문제를 해결하기 위해, 공동 데이터 관리 관점의 통합 데이터 허브 및 AI 이상 탐지 기능 구현',
    output: '선적 경로의 데이터를 연결 및 실시간 동기화하는 \'통합 데이터 허브\'를 구축하고, 이를 기반으로 납기 지연 및 이상 징후를 자동 알림해주는 \'탐지 & 알람 대시보드\' 구현',
    outputMarks: ['\'통합 데이터 허브\'를 구축', '자동 알림해주는 \'탐지 & 알람 대시보드\' 구현'],
    effects: [
      '그룹내 물류비 절감 및 사일로 극복',
      'SCM 변동시 긴급 대응체계 구축',
    ],
    composition: { domain: 4, dev: 4, domainDev: 0, advisor: 1 },
    members: [
      { name: '이수형', company: '포스코플로우', dept: '해외철강그룹', role: 'domain',
        strength: '글로벌 수출 배선 실무와 AI Agent 프로젝트 PM 경험을 바탕으로 물류 흐름의 핵심 Pain Point와 개선 방향을 제시할 수 있음' },
      { name: '전영창', company: '포스코', dept: '판매생산계획그룹', role: 'domain',
        strength: '판매·생산·출하 전 과정을 연결해 본 경험과 데이터 분석 역량을 갖춘 프로세스 혁신 및 문제 정의 전문가' },
      { name: '박재은', company: '포스코', dept: '생산기술부 제품출하섹션(포)', role: 'domain',
        strength: '제품출하 실무와 물류 자격(물류관리사 1급), Python·R·SQL 역량을 겸비했으며 현업 적용형 자동화·최적화 과제 성과가 풍부함' },
      { name: '정훈', company: '포스코', dept: '생산기술부 제품출하섹션(광)', role: 'domain',
        strength: '출하작업 관련 전영역 업무 수행, MES 시스템 설계/운영 및 개선활동에 주도적 역할로 참여한 경력 다수' },
      { name: '김동우', company: '포스코DX', dept: 'AX융합연구소 AX기술개발그룹', role: 'dev',
        strength: '배선계획 최적화 모델과 Agent 개발 경험을 함께 보유해 물류 도메인을 AI 기술로 구현할 수 있는 핵심 개발자' },
      { name: '김재웅', company: '포스코DX', dept: 'IT사업실 소재물류IT그룹', role: 'dev',
        strength: 'FLOWer 시스템의 설계·개발·운영 전 과정을 경험해 사용자 요구를 실제 시스템으로 전환하는 데 강점' },
      { name: '현진원', company: '포스코DX', dept: 'AX융합연구소 AX기술개발그룹', role: 'dev',
        strength: 'LLM·RAG·FastAPI·React 역량과 요구사항 구체화 능력을 갖춰 빠른 프로토타입 구현에 적합한 실행형 개발자' },
      { name: '경승환', company: '포스코DX', dept: '마케팅DX그룹', role: 'dev',
        strength: 'MES·SCM·P-FLOW 데이터 흐름과 SQL에 정통해 대시보드에 필요한 실무 데이터를 정확히 식별·추출할 수 있음' },
      { name: '이수장', company: '미래기술연구원', dept: '', role: 'advisor', title: '수석연구원', strength: '' },
    ],
  },
  {
    id: 'market',
    // 과제 분위기를 담은 이미지. assets/tasks/<id>.webp (4:3).
    image: 'market.webp',
    no: 3,
    perspective: '마켓 센싱 (Value 관점)',
    title: '그룹 공통 마켓 인사이트(MI) 고도화 및 맞춤형 AI 챗봇 구축',
    background: '그룹 통합 마켓 센싱 표준 모델 정립으로 전략적 의사결정 체계 구축 필요',
    core: '환율, 원자재 가격, 글로벌 트렌드 등 외적 변화 요소를 신속하게 포착하여, 경영진의 선제적 전략 수립과 실무진의 구체적 대응을 지원하는 그룹 공통 표준 모델 정립',
    output: '외부 공개 정보 기반 데이터 파이프라인 구축 → 비즈니스 영향도 스크리닝 → AI 기반 팩트체크 및 전문가 인사이트 도출 → 챗봇을 통해 실시간 전달 가능한 의사결정 지원 시스템 구현',
    outputMarks: ['AI 기반 팩트체크 및 전문가 인사이트 도출', '실시간 전달 가능한 의사결정 지원 시스템 구현'],
    effects: [
      '경영층의 의사결정 속도 향상',
      '전사 시장 대응 역량 향상 평준화',
    ],
    composition: { domain: 3, dev: 2, domainDev: 2, advisor: 1 },
    members: [
      { name: '조재형', company: '포스코경영연구원', dept: '경제정책연구센터', role: 'domain',
        strength: 'Market Monitoring 운영과 AI 활용 설계 경험을 바탕으로 센싱 체계와 데이터 파이프라인을 구조화할 수 있는 기획형 전문가' },
      { name: '이강원', company: '포스코', dept: '마케팅전략그룹', role: 'domain',
        strength: '철강 생산·판매·전략 경험을 토대로 시장 변화를 경영 언어로 해석하고 현업 요구를 AI 규칙으로 전환하는 데 강점' },
      { name: '조아라', company: '포스코인터내셔널', dept: '투자관리2그룹', role: 'domain',
        strength: '실제 마켓 리서치 자동화 대시보드 개발 경험을 보유해 현업에 필요한 정보 선별과 빠른 바이브코딩 구현이 가능' },
      { name: '오명철', company: '포스코', dept: '경영기획본부 경영기획DX추진TF팀', role: 'domain-dev',
        strength: 'PosPLOT 개발과 AI Agent 단독 PoC 경험을 겸비해 문제 정의부터 풀스택 프로토타입 구현까지 주도할 수 있음 (AI활용전문가 성적 우수자)' },
      { name: '황혁기', company: 'RIST', dept: 'AX연구그룹', role: 'domain-dev',
        strength: '증권사 퀀트와 산업 AI 연구 경험을 바탕으로 시장 신호의 신뢰도·리스크·시나리오를 정교하게 검증할 수 있음' },
      { name: '이영채', company: '포스코DX', dept: '마케팅DX그룹', role: 'dev',
        strength: 'Market Intelligence Hub 개발·운영 경험을 토대로 외부 지표와 뉴스의 수집·분석·시각화를 안정적으로 구현 가능' },
      { name: '한예원', company: '포스코DX', dept: 'AI Workforce TF', role: 'dev',
        strength: '다수의 AI PoC와 멀티에이전트·RAG 평가 경험을 바탕으로 신뢰도 높은 마켓센싱 Agent를 설계할 수 있음' },
      { name: '안치경', company: '미래기술연구원', dept: '', role: 'advisor', title: '수석연구원', strength: '' },
    ],
  },
];

const TONE_BY_COMPANY = {
  '포스코': 'warm',
  '포스코플로우': 'warm',
  '포스코인터내셔널': 'warm',
  '포스코세이프티솔루션': 'warm',
  '포스코인재창조원': 'warm',
  '포스코DX': 'green',
  '포스코경영연구원': 'neutral',
  'RIST': 'neutral',
  '미래기술연구원': 'neutral',
};

// 원본 자료의 색 구분을 그대로 가져온 것이다(콘텐츠 문서 §1).
// 모르는 회사는 neutral로 떨어뜨린다. 명단에 새 회사가 들어오면
// tests/content.test.js의 마지막 테스트가 잡는다.
export function chipTone(company) {
  return TONE_BY_COMPANY[company] ?? 'neutral';
}

export function crewCount(taskId) {
  const targets = taskId ? TASKS.filter((t) => t.id === taskId) : TASKS;
  return targets.reduce(
    (sum, t) => sum + t.members.filter((m) => m.role !== 'advisor').length,
    0,
  );
}

// 4-3 지원 체계 조직도.
//
// 원본은 크루를 "마스터 크루 4인"으로 적었으나 확정 명단은 7~8인이다.
// 챌린저 트랙의 팀당 4명에서 온 기획 초기 수치로 보인다. 두 장 건너
// 숫자가 어긋나면 청중이 먼저 알아채므로 숫자 없이 쓴다(설계 문서 3절).
export const ORG_TIERS = {
  sponsor: {
    label: '임원 (Project Sponsor)',
    body: '목표 부여 · 예산/인력 지원 · 타 부서 협조 승인',
  },
  sides: [
    { label: 'Advisor', org: '미래기술연구원 전담연구원 1인',
      body: '주 1~2회 자문 · AI 기술 고도화 · 팩트체크' },
    { label: 'Infra & Tech', org: '포스코DX 및 사내 기술 지원',
      body: 'P-Cloud · API 연동 · 보안 검토' },
  ],
  // 원본 도식의 구조를 그대로 옮긴다. 세 역할이 평평하게 늘어선 것이
  // 아니라, **마스터 크루 묶음 안에 둘**이 있고 그 밖에 외부 코치가 붙는다.
  // 크루 둘은 서로, 크루 묶음과 코치도 서로 주고받는다.
  core: {
    label: '마스터 과제 실행팀 (Core Team)',
    crew: {
      // 원본은 '마스터 크루 (4인)'이지만 확정 명단은 과제당 7~8인이다.
      // 챌린저 트랙의 팀당 4명에서 온 기획 초기 수치로 보여 숫자를 뺐다.
      label: '마스터 크루',
      roles: [
        { name: 'Task Owner / PM', body: '전체 일정관리 · 소통 · QC' },
        { name: '도메인 전문가', body: '비즈니스 로직 / Pain-Point 정의' },
      ],
    },
    coach: { name: '외부 기술 코치', body: 'AI Agent / 대시보드 구현' },
  },
  user: {
    label: '실사용자 (End-User / 현업 고객)',
    body: '프로토타입 테스트 · UX 검증 · 현장 실효성 피드백',
  },
  principles: [
    { title: '실행 중심의 핵심 팀',
      body: '마스터 크루와 외부 기술 코치가 한 팀이 되어 과제 설계부터 구현까지 직접 주도' },
    { title: '전방위적 지원 인프라',
      body: '임원의 스폰서십과 전문 조직의 기술·인프라 지원으로 실행 속도 확보' },
    { title: '현장 중심의 선순환 피드백',
      body: '실사용자의 테스트와 피드백을 기술 코치에게 즉시 반영해 현장 안착 제고' },
  ],
};

// 4-5 마스터 트랙 역할분담.
//
// 원본 장표(2×2 네 그룹)의 글을 그대로 옮겼다. duties는 원본에서 파란
// 굵은 글씨로 "/"로 이어 붙였던 실무 항목이고, 화면에서는 칩으로 흩어
// 놓는다 — 한 문단으로 이어 붙이면 네 항목이 한 덩어리로 읽힌다.
// notes는 칩으로 쪼갤 수 없는 문장(인프라 그룹의 저장소 안내)이다.
export const ROLE_GROUPS = [
  {
    tag: 'Core',
    label: '해커톤 마스터 트랙 선발팀',
    tone: 'core',
    roles: [
      {
        name: '과제 수행자', en: 'Task Owner/PM',
        desc: '과제의 실질적 리더로서, 전체 일정 관리, 내/외부 소통, 산출물 퀄리티 컨트롤 담당',
      },
      {
        name: '도메인 전문가', en: 'Domain Expert',
        desc: '현업의 진짜 Pain-point와 복잡한 비즈니스 로직(안전 법규, 해운 선적 프로세스 등)을 정확하게 파악하고 제공하는 브레인',
        duties: [
          '프로젝트 범위 설정', '문제 정의', '아웃풋 이미지 구체화', '도메인 지식 공유',
          '산출물(솔루션) 개발 — 참여자 중 P-DX 직원이 담당', '솔루션 테스트 및 보완',
        ],
      },
    ],
  },
  {
    tag: 'Tech & Advisory',
    label: '기술 구현 및 자문 그룹',
    tone: 'tech',
    roles: [
      {
        name: '미래기술연구원', en: 'Advisor',
        desc: '과제별 전담 연구원 1인. 주 1~2회 수시 자문을 통해 솔루션의 격을 높임',
        duties: [
          '프로젝트 범위 설정 시 의견 제시(과도 or 부족, 달성 가능 여부 등)',
          '핵심 알고리즘 or AI 기술 제안 및 멘토링(필요 시 개발 일부 참여)',
          '솔루션 테스트 후 성능 체크 및 향상 노하우·조언',
          '기타 구현 장애요소 해결을 위한 조언 및 경험 공유',
        ],
      },
      {
        name: '외부 기술 코치', en: '팀스파르타',
        desc: 'AX 솔루션팀 2명으로 구성되어 도메인 전문가의 아이디어를 실제 작동하는 AI/UX로 구현(바이브코딩 등)하는 실무자',
        duties: [
          '프로젝트 일정 및 To-Do list 도출', '마일스톤 도출',
          '마일스톤 관리 및 진도 체크', '솔루션 개발 지원(필요 시 직접 개발에 참여)',
        ],
      },
    ],
  },
  {
    tag: 'Support',
    label: '현장 검증 및 피드백 그룹',
    tone: 'support',
    roles: [
      {
        name: '실사용자', en: 'End-User / 고객',
        desc: '프로토타입이 나올 때마다 "이게 진짜 현장에 필요한가?", "UX가 직관적인가?"를 검증해 주는 현업 실무자',
      },
      {
        name: '사내 기술 지원', en: 'Internal Tech Supporter',
        desc: '기존 시스템(안전보건플랫폼, GIH 등)의 데이터 구조를 가장 잘 아는 현업 IT/데이터 담당자. 스파르타 코치들이 API 연동을 할 때 필수적인 길잡이 역할',
      },
    ],
  },
  {
    tag: 'Infra',
    label: '인프라 및 보안 그룹',
    tone: 'infra',
    roles: [
      {
        name: '포스코DX', en: 'Infra & Security',
        desc: 'P-Cloud 환경 세팅 지원. 민감 데이터 외부 연동 시 보안 가이드라인 제시 및 방화벽/접근 권한 관리',
        notes: [
          { label: '코드 저장소', body: 'Code 공유 및 협업을 위한 Code Repository로 Gitlab 제공 (P-DX 협조요청 완료)' },
          { label: '산출물 저장소', body: '그룹 공통망의 P-Cloud 내 Agentee 플랫폼에 저장 (P-DX 협조요청 완료)',
            sub: '단, 과제1(안전)은 안전보건플랫폼 내 하위 기능이므로 플랫폼 내 개발계에 구현·저장' },
          { label: '기타', body: '예산/인력/장비/SW/라이선스 등 지원 필요사항이 있을 경우 인창원에서 최대한 지원 예정' },
        ],
      },
    ],
  },
];

// 7-3 트랙별 특전. 챌린저 트랙 특전은 넣지 않는다 — 청중이 마스터
// 크루이므로 남의 트랙 보상은 잡음이다(콘텐츠 문서 §7-3).
export const PERKS = {
  // 공통 — 두 트랙 모두에게 똑같이 주어지는 것.
  common: {
    label: '수상팀 전원',
    body: 'CEO 명의 상장',
  },
  // 트랙별 — 무엇이 같고 무엇이 다른지가 이 슬라이드의 핵심이다.
  // 1위 보상(맥북 에어)은 두 트랙이 같고, 그 위에 트랙마다 다른 것이
  // 하나씩 더 붙는다 — 챌린저는 참가자 전원 에어팟, 마스터는 과제 수행
  // 2팀 맥북 네오. only가 붙은 항목이 그 "다른 하나"다.
  //
  // image는 assets/perks/ 안의 파일명이다. 비워두면 CSS로 그린 노트북이
  // 대신 들어간다(roster.js의 productArt).
  // **마스터가 왼쪽이다.** 청중이 마스터 크루라 자기 트랙을 먼저 읽는
  // 자리에 둔다. 순서는 이 배열이 그대로 화면 순서다.
  tracks: [
    {
      id: 'master',
      name: '마스터',
      lit: true,
      items: [
        { rank: '트랙 1위', teams: '1팀', product: '맥북 에어', kind: '프리미엄 코딩용 노트북', icon: 'air', image: 'macbook-air.webp' },
        { rank: '과제 수행 특전', teams: '2팀', product: '맥북 네오', kind: '고효율 AI 실무용 노트북', icon: 'neo', image: 'macbook-neo.webp', only: true, onlyLabel: '마스터 전용' },
      ],
    },
    {
      id: 'challenger',
      name: '챌린저',
      lit: false,
      items: [
        { rank: '트랙 1위', teams: '1팀', product: '맥북 에어', kind: '프리미엄 코딩용 노트북', icon: 'air', image: 'macbook-air.webp' },
        { rank: '참가 특전', teams: '수상자 외 참가자 전원', product: 'AirPods 4 ANC', kind: '', icon: 'pods', image: 'airpods-4-anc.webp', only: true, onlyLabel: '챌린저 전용' },
      ],
    },
  ],
  masterNote: '핵심 인재 예우 및 실전 과제 완주 보상',
};
