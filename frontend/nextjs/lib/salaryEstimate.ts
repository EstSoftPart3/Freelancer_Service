// E(연봉 리포트) 전용 — 백엔드에 "연봉 통계" API 가 없어서, 사용자 입력값을 시드로 한
// 결정론적 의사난수로 그럴듯한 분포·추정치를 만든다(새로고침해도 같은 입력이면 같은 결과).
// 실제 시장 데이터가 아니라 Phase2 프로토타입 시연용 추정치임을 명심할 것.

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

// 이 파일과 lib/salaryRanking.ts가 함께 쓰는 결정론적 PRNG 유틸 — export해서 재사용한다.
export function hashString(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i)
  }
  return h >>> 0
}

// mulberry32 — 시드 하나로 재현 가능한 0~1 난수열을 만드는 가벼운 PRNG
export function mulberry32(seed: number) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function normalPdf(z: number): number {
  return Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI)
}

// Abramowitz & Stegun 근사 — erf 없이 표준정규 CDF 계산
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp((-z * z) / 2)
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  if (z > 0) p = 1 - p
  return p
}

export const roundTo10 = (n: number) => Math.round(n / 10) * 10

export function computeSalaryReport(input: SalaryCalcInput, catalogSkills: string[]): SalaryReportData {
  const seed = hashString(`${input.job}|${input.years}|${input.region}|${input.employment}`)
  const rng = mulberry32(seed)

  const mySalary = input.salary
  // 시장 평균은 내 연봉의 88~112% 사이에서, 지역 시드로 한 번 더 흔들어 만든다
  // (완전 무관한 값이 나와 "상위 200%" 같은 비상식적 결과가 뜨는 걸 막기 위함)
  const regionRng = mulberry32(hashString(input.region))
  const regionMultiplier = 0.94 + regionRng() * 0.12
  const meanSalary = roundTo10(mySalary * (0.88 + rng() * 0.24) * regionMultiplier)
  const stdSalary = Math.max(meanSalary * (0.14 + rng() * 0.1), 50)

  const z = (mySalary - meanSalary) / stdSalary
  const percentileTop = Math.min(99, Math.max(1, Math.round(100 * (1 - normalCdf(z)))))

  // 히스토그램 — 평균 ±3표준편차를 9구간으로 나눠 정규분포 밀도로 표본 수를 근사
  const bucketCount = 9
  const span = stdSalary * 6
  const bucketWidth = span / bucketCount
  const start = meanSalary - stdSalary * 3
  const totalSamples = 1200
  const histogram: HistogramBucket[] = Array.from({ length: bucketCount }, (_, i) => {
    const from = roundTo10(start + i * bucketWidth)
    const to = roundTo10(start + (i + 1) * bucketWidth)
    const mid = (from + to) / 2
    const zi = (mid - meanSalary) / stdSalary
    const count = Math.max(1, Math.round(totalSamples * normalPdf(zi) * (bucketWidth / stdSalary)))
    return { from, to, count, isMine: mySalary >= from && mySalary < to }
  })
  // 내 연봉이 마지막 구간 바깥이면(극단값) 가장 가까운 끝 구간을 "내 위치"로 표시
  if (!histogram.some((b) => b.isMine)) {
    const target = mySalary < start ? histogram[0] : histogram[histogram.length - 1]
    target.isMine = true
  }

  // 연도별 추정 — "일반" 시나리오와, 성장률을 끌어올린 "인생 빡세게 모드"
  // (야근·자격증·이직 등 커리어에 적극 투자했을 때 가능한 성장률이라는 설정)
  const normalGrowth = 0.04 + rng() * 0.05
  const grindGrowth = Math.min(0.28, normalGrowth * (1.7 + rng() * 0.9))
  const YEARS_AHEAD = 5
  const buildProjection = (growth: number): YearPoint[] =>
    Array.from({ length: YEARS_AHEAD + 1 }, (_, i) => ({
      year: new Date().getFullYear() + i,
      salary: roundTo10(mySalary * Math.pow(1 + growth, i)),
    }))

  // 기술스택 추천 — 이미 가진 스택은 제외하고, 시드로 섞어 상위 6개 + 예상 상승폭(%)
  const notOwned = catalogSkills.filter((s) => !input.stack.includes(s))
  const shuffled = [...notOwned]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  const skillCandidates: SkillBump[] = shuffled.slice(0, 6).map((skill) => ({
    skill,
    bumpPct: Math.round((2 + rng() * 7) * 2) / 2, // 2.0~9.0%, 0.5 단위
  }))

  // 같은 조건 개발자가 많이 다니는 회사 — 향후 회사 추천 서비스의 미리보기.
  // 실제 재직 데이터가 아니라, 이 조건의 시드로 회사 후보를 섞고 그럴듯한 재직자 수·평균 연봉을 붙인 목데이터.
  const companyRng = mulberry32(hashString(`company|${input.job}|${input.years}|${input.region}`))
  const shuffledCompanies = [...COMPANY_POOL]
  for (let i = shuffledCompanies.length - 1; i > 0; i--) {
    const j = Math.floor(companyRng() * (i + 1))
    ;[shuffledCompanies[i], shuffledCompanies[j]] = [shuffledCompanies[j], shuffledCompanies[i]]
  }
  const companyRecommendations: CompanyRecommendation[] = shuffledCompanies
    .slice(0, 5)
    .map((companyNm) => ({
      companyNm,
      matchedCount: Math.round(8 + companyRng() * 54),
      avgSalary: roundTo10(meanSalary * (0.9 + companyRng() * 0.24)),
    }))
    .sort((a, b) => b.matchedCount - a.matchedCount)

  return {
    mySalary,
    meanSalary,
    percentileTop,
    histogram,
    yearProjection: { normal: buildProjection(normalGrowth), grind: buildProjection(grindGrowth) },
    skillCandidates,
    companyRecommendations,
  }
}

const COMPANY_POOL = [
  '테크노베이션', '클라우드포지', '데이터브릿지', '넥스트레이어', '핀텍스랩',
  '그리드소프트', '스퀘어웍스', '블루오션소프트', '메타빌드', '코어스택',
  '시그널팩토리', '오르빗테크', '페블시스템', '루미넌스', '아이언메쉬',
]

export interface JobChangeFeedItem {
  maskedNickname: string
  fromSalary: number
  toSalary: number
  relativeTime: string
}

const NICKNAME_POOL = ['김**', '이**', '박**', '최**', '정**', '강**', '조**', '윤**']
const RELATIVE_TIMES = ['3일 전', '1주 전', '2주 전', '3주 전', '한 달 전', '두 달 전']

// "최근 3개월 이직 연봉 동향" — 실제 이직 기록이 아니라, 이 화면의 시장 평균을 기준으로
// 그럴듯한 인상폭을 시드로 흔들어 만든 예시 피드(닉네임은 전부 마스킹된 가상 인물).
export function buildJobChangeFeed(input: SalaryCalcInput, meanSalary: number): JobChangeFeedItem[] {
  const rng = mulberry32(hashString(`change|${input.job}|${input.years}|${input.region}`))
  const count = 4
  return Array.from({ length: count }, (_, i) => {
    const from = roundTo10(meanSalary * (0.75 + rng() * 0.3))
    const bump = 0.06 + rng() * 0.22
    const to = roundTo10(from * (1 + bump))
    return {
      maskedNickname: NICKNAME_POOL[(hashString(`${input.job}${i}`) + i) % NICKNAME_POOL.length],
      fromSalary: from,
      toSalary: to,
      relativeTime: RELATIVE_TIMES[Math.floor(rng() * RELATIVE_TIMES.length)],
    }
  }).sort((a, b) => RELATIVE_TIMES.indexOf(a.relativeTime) - RELATIVE_TIMES.indexOf(b.relativeTime))
}

export interface JobChangeBand {
  label: string
  pct: number
  salary: number
}

// "이직했을 때 예상 연봉" — 위 최근 이직 동향 피드(buildJobChangeFeed)의 인상폭 분포를
// 그대로 근거로 삼아, 내 연봉에 적용했을 때의 범위(보수적~공격적)를 계산한다.
export function buildJobChangeSalaryBands(mySalary: number, feed: JobChangeFeedItem[]): JobChangeBand[] {
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
