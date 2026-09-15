// F(연봉순위표) 전용 타입 — 개인 연봉 리포트가 아니라 플랫폼 전체 랭킹을 조건별로 훑어보는 화면이다.
// 실제 통계는 백엔드 GET /salary/ranking(비로그인 공개)이 계산해서 내려준다 — 이 파일은 더 이상
// 가짜 인구 집단을 만들지 않는다(과거엔 시드 기반 의사난수 4000명 고정 집단이었음).

export const YEAR_BUCKETS = ['1~2년', '3~5년', '6~9년', '10년+']

export type RankingDimension = 'all' | 'job' | 'years' | 'region'

export interface RankingRow {
  rank: number
  maskedNickname: string
  job: string
  years: string
  region: string
  salary: number
  // 직전 연봉 대비 인상률 — 없으면 null(백엔드에 직전 연봉을 입력하지 않은 회원이거나 시드 데이터)
  changePct: number | null
}

export interface RankingFilterParams {
  dimension: RankingDimension
  job?: string
  years?: string
  region?: string
}

/** GET /salary/ranking 응답. includesSeed는 표본 부족으로 시드 데이터가 섞였을 때 true. */
export interface PlatformRankingBoard {
  rows: RankingRow[]
  totalCount: number
  includesSeed: boolean
}
