// 공고 모집 상태 / D-day 계산 — 목록 카드·지도·마이페이지가 각자 복붙해 쓰던 것을 한 곳으로 모았다.
//
// 두 가지를 고정한다.
//  1) 날짜 파싱은 반드시 '로컬 자정'. new Date('2026-09-05') 는 스펙상 UTC 자정이라
//     KST 에서는 그날 09:00 이 된다. 그래서 마감일 당일 오전 9시를 넘기는 순간
//     '채용종료' 로 바뀌는 버그가 있었다.
//  2) 마감일 당일을 D-1 로 센다(사업 규칙). 마감 하루 전은 D-2.

export type RecruitStatus = '채용예정' | '채용중' | '채용종료'

export interface RecruitInfo {
  status: RecruitStatus
  /** '채용중'일 때만 채워진다. 예: 'D-1' */
  dDay?: string
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * 'YYYY-MM-DD' (뒤에 시각이 붙어 있어도 됨) 를 로컬 자정 Date 로 만든다.
 * 파싱할 수 없으면 null.
 */
export function parseLocalDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

/** 오늘 로컬 자정. */
function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/** 마감일 당일을 D-1 로 보는 표기. (남은 일수 + 1) */
export function ddayLabel(daysUntilEnd: number): string {
  return `D-${daysUntilEnd + 1}`
}

/**
 * 백엔드가 내려준 D-day 값을 화면 표기로 바꾼다.
 * 백엔드는 ChronoUnit.DAYS.between(오늘, 마감일) 이라 마감일 당일이 0 이다.
 */
export function ddayFromServer(dday: number): string {
  return ddayLabel(dday)
}

/**
 * 모집 시작일/종료일로 상태와 D-day 를 계산한다. 두 날짜 모두 마감일·시작일 **당일을 포함**한다.
 * 날짜를 읽을 수 없으면 판단을 보류하고 '채용중'(D-day 없음)으로 둔다.
 */
export function getRecruitStatus(
  startDt: string | null | undefined,
  endDt: string | null | undefined,
): RecruitInfo {
  const start = parseLocalDate(startDt)
  const end = parseLocalDate(endDt)
  if (!start || !end) return { status: '채용중' }

  const today = startOfToday()
  if (today.getTime() < start.getTime()) return { status: '채용예정' }
  if (today.getTime() > end.getTime()) return { status: '채용종료' }

  const daysUntilEnd = Math.round((end.getTime() - today.getTime()) / MS_PER_DAY)
  return { status: '채용중', dDay: ddayLabel(daysUntilEnd) }
}

/** 마감일(당일 포함)이 지났는지. 상세 화면의 지원 버튼 활성화 판단에 쓴다. */
export function isRecruitEnded(endDt: string | null | undefined): boolean {
  const end = parseLocalDate(endDt)
  if (!end) return false
  return startOfToday().getTime() > end.getTime()
}
