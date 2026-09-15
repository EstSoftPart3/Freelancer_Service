// E(연봉 리포트) 전용 타입 + 순수 계산 유틸.
// 실제 통계는 백엔드 GET /salary/report(도메인 domain/salary, SalaryStatsCalculator)가 계산해서
// 내려준다 — 이 파일은 더 이상 가짜 데이터를 만들지 않는다(과거엔 시드 기반 의사난수였음).

export interface SalaryCalcInput {
  employment: 'EMPLOYED' | 'FREELANCE'
  job: string
  years: string
  region: string
  stack: string[]
  salary: number
}

export interface HistogramBucket {
  from: number
  to: number
  count: number
  isMine: boolean
}

export interface YearPoint {
  year: number
  salary: number
}

export interface SkillBump {
  skill: string
  bumpPct: number
}

export interface CompanyRecommendation {
  companyNm: string
  matchedCount: number
  avgSalary: number
}

export interface SalaryReportData {
  mySalary: number
  meanSalary: number
  percentileTop: number // "상위 N%"에 쓸 값(1~99)
  histogram: HistogramBucket[]
  // grind = "인생 빡세게 모드" — 야근·자격증·이직 등 적극적으로 커리어에 투자했을 때의 성장률
  yearProjection: { normal: YearPoint[]; grind: YearPoint[] }
  skillCandidates: SkillBump[]
  companyRecommendations: CompanyRecommendation[]
}

export interface JobChangeFeedItem {
  maskedNickname: string
  fromSalary: number
  toSalary: number
  relativeTime: string
}

/** GET /salary/report 응답 전체 — SalaryReportData + 이직동향 피드 + 표본 메타. */
export interface SalaryReportApiResponse extends SalaryReportData {
  jobChangeFeed: JobChangeFeedItem[]
  sampleCount: number
  realSampleCount: number
  includesSeed: boolean
  relaxedConditions: string[]
}

export const roundTo10 = (n: number) => Math.round(n / 10) * 10

export interface JobChangeBand {
  label: string
  pct: number
  salary: number
}

// "이직했을 때 예상 연봉" — 최근 이직 동향 피드(jobChangeFeed)의 인상폭 분포를 그대로 근거로 삼아,
// 내 연봉에 적용했을 때의 범위(보수적~공격적)를 계산한다. 피드가 실데이터로 바뀐 뒤에도 이 계산
// 자체는 순수 함수라 그대로 재사용한다.
export function buildJobChangeSalaryBands(mySalary: number, feed: JobChangeFeedItem[]): JobChangeBand[] {
  if (feed.length === 0) return []
  const bumps = feed.map((f) => (f.toSalary - f.fromSalary) / f.fromSalary)
  const minBump = Math.min(...bumps)
  const avgBump = bumps.reduce((a, b) => a + b, 0) / bumps.length
  const maxBump = Math.max(...bumps)
  const mk = (label: string, pct: number): JobChangeBand => ({
    label,
    pct: Math.round(pct * 1000) / 10,
    salary: roundTo10(mySalary * (1 + pct)),
  })
  return [mk('보수적으로 이직', minBump), mk('평균적으로 이직', avgBump), mk('적극적으로 이직', maxBump)]
}
