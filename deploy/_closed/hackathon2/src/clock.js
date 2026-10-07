// 시각 판정. Date를 인자로 받는 순수 함수라서 임의의 시각을 넣어
// 경계값을 테스트할 수 있다. 내부에서 new Date()를 부르지 않는 이유다.

import { SESSIONS } from './schedule.js';

export function minutesOfDay(date) {
  return date.getHours() * 60 + date.getMinutes();
}

// 세션 사이에 빈 시간이 없으므로 경계 시각은 시작하는 쪽에 속한다.
// 12:00 정각은 오전 마지막 세션이 아니라 네트워킹 파티다.
//
// sessions 배열과 분 단위 시각을 받아 인덱스를 계산하는 순수 헬퍼.
// currentSessionIndex의 판정 로직을 그대로 옮긴 것으로, 실제 SESSIONS는
// 세션 사이에 빈틈이 없어 갭(gap) 처리 경로를 통과시킬 수 없기 때문에,
// 테스트에서 빈틈이 있는 가짜 시간표를 넣어 그 경로를 검증할 수 있도록
// 별도 함수로 분리해 export한다.
export function sessionIndexAt(sessions, now) {
  if (now < sessions[0].start) return -1;
  if (now >= sessions[sessions.length - 1].end) return sessions.length;
  const exact = sessions.findIndex((s) => now >= s.start && now < s.end);
  if (exact !== -1) return exact;
  // 행사 전이나 후가 아닌데도 어느 세션의 [start, end) 구간에도 들지 못했다면
  // 일정 수정으로 세션 사이에 빈 시간이 생긴 것이다. 이 -1을 그대로 돌려주면
  // "시작 전"과 구별되지 않아, 진행 중인데도 시간표의 어느 줄에도
  // "진행 중" 표식이 붙지 않는다.
  // 행사 시간 범위 안이므로 가장 최근에 시작한 세션이 아직 진행 중이라고
  // 보고, start가 now 이하인 세션 중 가장 나중 것의 인덱스를 대신 낸다.
  let fallback = 0;
  for (let i = 0; i < sessions.length; i += 1) {
    if (sessions[i].start <= now) fallback = i;
  }
  return fallback;
}

export function currentSessionIndex(date) {
  return sessionIndexAt(SESSIONS, minutesOfDay(date));
}

export function dayPhase(date) {
  const index = currentSessionIndex(date);
  if (index === -1) return 'before';
  if (index === SESSIONS.length) return 'after';
  return 'during';
}
