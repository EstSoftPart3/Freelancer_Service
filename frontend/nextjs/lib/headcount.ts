// 공고 모집 인원 표기 — 상세·목록 카드·지도 툴팁이 같은 규칙을 쓰도록 한 곳에 모았다.
//
// 저장 구조상 두 가지 모드가 있다 (백엔드 TBL_PROJECT_RECRUIT_HEADCOUNT_S).
//  · 등급별 모집 — grade 가 채워진 행이 여러 개
//  · 총원 모집   — grade 가 null 인 행 하나
// 총원 모드는 행 자체에 등급이 없으므로, 공고의 대표 등급(devGradeNm / projectExperience)을
// fallbackGrade 로 받아 붙인다. 이게 없으면 화면에 인원 숫자만 덩그러니 남는다.
//
// count 가 null 이면 "인원 미정" 이다 (인원을 정하지 않고 등록한 공고).

import type { RecruitHeadcount } from '@/types'

/** 한 줄 분량 표기: '중상 2명' / '중상 (인원 미정)' */
function labelOf(grade: string | null | undefined, count: number | null | undefined, fallbackGrade?: string): string {
  const name = grade || fallbackGrade || ''
  const amount = count == null ? '(인원 미정)' : `${count}명`
  return name ? `${name} ${amount}` : amount
}

function splitRows(rows: RecruitHeadcount[]) {
  const byGrade = rows.filter((r) => r.grade)
  return { byGrade, isTotalMode: byGrade.length === 0 }
}

/**
 * 상세 화면용.
 *  · 총원   → '중상 3명'
 *  · 등급별 → '중상 2명 · 상초 1명 (총 3명)'  (등급이 하나면 합계를 생략)
 * 인원 미정이 하나라도 섞이면 합계를 낼 수 없으므로 생략한다.
 */
export function formatHeadcountDetail(rows: RecruitHeadcount[], fallbackGrade?: string): string {
  if (rows.length === 0) return ''
  const { byGrade, isTotalMode } = splitRows(rows)

  if (isTotalMode) return labelOf(null, rows[0].count, fallbackGrade)

  const detail = byGrade.map((r) => labelOf(r.grade, r.count)).join(' · ')
  const hasUnknown = byGrade.some((r) => r.count == null)
  if (byGrade.length <= 1 || hasUnknown) return detail

  const total = byGrade.reduce((sum, r) => sum + (r.count ?? 0), 0)
  return `${detail} (총 ${total}명)`
}

/**
 * 목록 카드용 — '중상 2명, 상초 1명'.
 * 인원 정보가 없는 옛 공고는 대표 등급만 돌려준다.
 */
export function formatHeadcountShort(rows: RecruitHeadcount[] | undefined, fallbackGrade?: string): string {
  if (!rows || rows.length === 0) return fallbackGrade ?? ''
  const { byGrade, isTotalMode } = splitRows(rows)
  if (isTotalMode) return labelOf(null, rows[0].count, fallbackGrade)
  return byGrade.map((r) => labelOf(r.grade, r.count)).join(', ')
}

/**
 * 지도 마커 툴팁 뱃지용 — 폭이 좁아 인원은 빼고 등급 이름만: '중상, 상초'.
 */
export function formatGradeNames(rows: RecruitHeadcount[] | undefined, fallbackGrade?: string): string {
  if (!rows || rows.length === 0) return fallbackGrade ?? ''
  const { byGrade, isTotalMode } = splitRows(rows)
  if (isTotalMode) return fallbackGrade ?? ''
  return byGrade.map((r) => r.grade).join(', ')
}
