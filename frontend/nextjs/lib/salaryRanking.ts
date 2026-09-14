// F(연봉순위표) 전용 — 개인 연봉 리포트가 아니라 플랫폼 전체 랭킹을 조건별로 훑어보는 화면이다.
// 백엔드에 통계 API가 없어 lib/salaryEstimate.ts와 같은 결정론적 의사난수로 만든다
// (매번 같은 인구 집단을 생성해두고, 보기 기준에 따라 필터링만 다르게 한다).
// 실제 회원 데이터가 아니라 Phase2 프로토타입 시연용 추정치임을 명심할 것.
import { hashString, mulberry32, roundTo10 } from './salaryEstimate'

export const YEAR_BUCKETS = ['1~2년', '3~5년', '6~9년', '10년+']

export type RankingDimension = 'all' | 'job' | 'years' | 'region'

export interface RankingRow {
  rank: number
  maskedNickname: string
  job: string
  years: string
  region: string
  salary: number
  changePct: number
}

const NICKNAME_POOL = ['김**', '이**', '박**', '최**', '정**', '강**', '조**', '윤**', '임**', '한**', '오**', '서**']
const POPULATION_SIZE = 4000
const ROWS_PER_BOARD = 20

// computeSalaryReport(lib/salaryEstimate.ts)와 같은 방식 — 조건이 같으면 항상 같은 평균 연봉이 나온다
function meanSalaryFor(job: string, years: string, region: string): number {
  const rng = mulberry32(hashString(`rank-mean|${job}|${years}|${region}`))
  const yearIndex = Math.max(0, YEAR_BUCKETS.indexOf(years))
  const base = 3800 + yearIndex * 1300
  const regionRng = mulberry32(hashString(region))
  const regionMultiplier = 0.94 + regionRng() * 0.14
  return roundTo10(base * (0.9 + rng() * 0.3) * regionMultiplier)
}

function stdFor(mean: number, seedKey: string): number {
  const rng = mulberry32(hashString(seedKey))
  return Math.max(mean * (0.14 + rng() * 0.1), 60)
}

// Box-Muller — mulberry32 난수열로 정규분포 표본을 뽑는다
function sampleNormal(rng: () => number, mean: number, std: number): number {
  const u1 = Math.max(rng(), 1e-6)
  const u2 = rng()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return Math.max(roundTo10(mean + z * std), 1800)
}

interface RankingPerson {
  maskedNickname: string
  job: string
  years: string
  region: string
  salary: number
  changePct: number
}

// 필터와 무관하게 매번 같은 "인구 집단"을 만들어 두고, 보기 기준에 따라 그중 일부만 골라 보여준다 —
// 그래야 직무를 바꿔가며 봐도 같은 세계관의 랭킹처럼 느껴진다(필터마다 완전히 다른 사람들이 나오지 않음).
// 호출 비용이 있으니(4천 명) 화면에서 jobs/regions가 로드된 뒤 한 번만 만들어 재사용할 것 — filterRanking은 그 결과를 받아 필터링만 한다.
export function buildPopulation(jobs: string[], regions: string[]): RankingPerson[] {
  const rng = mulberry32(hashString('salary-ranking-population-v1'))
  const nickRng = mulberry32(hashString('salary-ranking-population-v1|nick'))
  return Array.from({ length: POPULATION_SIZE }, () => {
    const job = jobs[Math.floor(rng() * jobs.length)]
    const years = YEAR_BUCKETS[Math.floor(rng() * YEAR_BUCKETS.length)]
    const region = regions[Math.floor(rng() * regions.length)]
    const mean = meanSalaryFor(job, years, region)
    const std = stdFor(mean, `rank-std|${job}|${years}|${region}`)
    return {
      maskedNickname: NICKNAME_POOL[Math.floor(nickRng() * NICKNAME_POOL.length)],
      job,
      years,
      region,
      salary: sampleNormal(rng, mean, std),
      changePct: Math.round((rng() * 24 - 6) * 10) / 10,
    }
  })
}

export interface RankingFilterParams {
  dimension: RankingDimension
  job?: string
  years?: string
  region?: string
}

export interface PlatformRankingBoard {
  rows: RankingRow[]
  totalCount: number
}

export function filterRanking(population: RankingPerson[], params: RankingFilterParams): PlatformRankingBoard {
  const { dimension, job, years, region } = params

  const filtered = population.filter((p) => {
    if (dimension === 'job') return job ? p.job === job : true
    if (dimension === 'years') return years ? p.years === years : true
    if (dimension === 'region') return region ? p.region === region : true
    return true
  })

  const rows: RankingRow[] = filtered
    .slice()
    .sort((a, b) => b.salary - a.salary)
    .slice(0, ROWS_PER_BOARD)
    .map((p, i) => ({ rank: i + 1, ...p }))

  return { rows, totalCount: filtered.length }
}
