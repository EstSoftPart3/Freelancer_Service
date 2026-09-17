'use client'
// F. 연봉순위표 — 개인 연봉 계산 결과와 무관한, 플랫폼 전체 랭킹 조회 화면.
// 보기 기준(전체/직무별/연차별/지역별)을 고르면 그 기준으로 상위 랭킹을 보여준다.
// GET /salary/ranking(비로그인 공개) 호출 — 실표본이 부족하면 시드가 섞이고 includesSeed로 알려준다.
import { useEffect, useMemo, useState } from 'react'
import { ListOrdered, Trophy } from 'lucide-react'
import api from '@/lib/api'
import { InfoTooltip } from '@/components/ui/tooltip'
import { YEAR_BUCKETS, type PlatformRankingBoard, type RankingDimension } from '@/lib/salaryRanking'
import type { RequiredSkillGroup } from '@/types'

const REGION_REMOTE = '원격'

interface FormsData {
  cities: { areaSq: number; areaName: string }[]
  educationLevels: string[]
  recruitJobs: string[]
  skills: RequiredSkillGroup[]
}

function formatMan(n: number): string {
  return `${Math.round(n).toLocaleString()}만원`
}

const DIMENSION_LABEL: Record<RankingDimension, string> = {
  all: '전체',
  job: '직무별',
  years: '연차별',
  region: '지역별',
}

export default function SalaryRankingScreen() {
  const [forms, setForms] = useState<FormsData | null>(null)

  const [dimension, setDimension] = useState<RankingDimension>('all')
  const [job, setJob] = useState('')
  const [years, setYears] = useState('3~5년')
  const [region, setRegion] = useState('')

  useEffect(() => {
    api
      .get<{ output: FormsData }>('/projects/forms')
      .then(({ data }) => setForms(data.output))
      .catch(() => console.error('[SalaryRanking] 폼 메타데이터 로드 실패'))
  }, [])

  const regionOptions = useMemo(
    () => (forms ? [...forms.cities.map((c) => c.areaName), REGION_REMOTE] : []),
    [forms],
  )

  useEffect(() => {
    if (!forms) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJob((prev) => prev || forms.recruitJobs[0] || '')
    setRegion((prev) => prev || regionOptions[0] || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forms])

  const [board, setBoard] = useState<PlatformRankingBoard | null>(null)

  useEffect(() => {
    // dimension별로 실제 필터 대상 값이 아직 안 정해졌으면(예: job 기준인데 forms 로딩 전) 기다린다
    if (dimension === 'job' && !job) return
    if (dimension === 'region' && !region) return

    let cancelled = false
    api
      .get<{ output: PlatformRankingBoard }>('/salary/ranking', {
        params: { dimension, job: dimension === 'job' ? job : undefined,
          years: dimension === 'years' ? years : undefined,
          region: dimension === 'region' ? region : undefined },
      })
      .then(({ data }) => { if (!cancelled) setBoard(data.output) })
      .catch(() => console.error('[SalaryRanking] 순위표 조회 실패'))
    return () => { cancelled = true }
  }, [dimension, job, years, region])

  if (!board) {
    return <div className="min-h-[calc(100vh-104px)] bg-white" />
  }

  const conditionLabel =
    dimension === 'all'
      ? '플랫폼 전체'
      : dimension === 'job'
        ? job
        : dimension === 'years'
          ? years
          : region

  return (
    <div className="min-h-[calc(100vh-104px)] bg-white">
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        {/* 헤더 */}
        <div className="mb-8">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Trophy className="h-3.5 w-3.5" />
            연봉순위표
          </p>
          <h1 className="mb-1 text-2xl font-bold text-foreground md:text-3xl">플랫폼 연봉 랭킹</h1>
          <p className="text-sm text-muted-foreground">
            전체 · 직무별 · 연차별 · 지역별로 랭킹을 나눠 볼 수 있어요. 실제 회원 제출 데이터
            기준이며, 표본이 부족한 조건은 예시 데이터가 섞여요.
          </p>
        </div>

        {/* 보기 기준 */}
        <section className="mb-6 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
          <label className="mb-2 block text-sm font-semibold text-foreground">보기 기준</label>
          <div className="mb-5 inline-flex flex-wrap rounded-full bg-muted p-1 text-xs font-semibold">
            {(Object.keys(DIMENSION_LABEL) as RankingDimension[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDimension(d)}
                className={
                  dimension === d
                    ? 'rounded-full bg-indigo-600 px-4 py-2 text-white'
                    : 'cursor-pointer rounded-full px-4 py-2 text-muted-foreground hover:text-foreground'
                }
              >
                {DIMENSION_LABEL[d]}
              </button>
            ))}
          </div>

          {dimension === 'job' && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">직무</label>
              <select
                value={job}
                onChange={(e) => setJob(e.target.value)}
                disabled={!forms}
                className="w-full appearance-none rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 sm:max-w-xs"
              >
                {forms?.recruitJobs.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>
          )}

          {dimension === 'years' && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">연차</label>
              <div className="flex flex-wrap gap-2">
                {YEAR_BUCKETS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYears(y)}
                    aria-pressed={years === y}
                    className={
                      years === y
                        ? 'cursor-pointer rounded-full bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white transition-transform hover:scale-105'
                        : 'cursor-pointer rounded-full border border-border bg-white px-3.5 py-1.5 text-sm font-medium text-foreground/70 transition-transform hover:scale-105 hover:bg-muted'
                    }
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {dimension === 'region' && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">지역</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={!forms}
                className="w-full appearance-none rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 sm:max-w-xs"
              >
                {regionOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        {/* 순위표 */}
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-1 flex items-center gap-1.5 text-lg font-bold text-foreground">
            <ListOrdered className="h-4 w-4 text-indigo-600" />
            {conditionLabel} 랭킹
            <InfoTooltip label="랭킹 안내">
              직무 · 연차 · 지역이 섞인 추정 인구 집단에서, 선택한 기준으로 걸러 연봉이 높은 순으로
              보여드려요.
            </InfoTooltip>
          </h2>
          <p className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            총 {board.totalCount.toLocaleString()}명 중 상위 {board.rows.length}명 · 닉네임은 마스킹돼요.
            {board.includesSeed && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                예시 데이터 포함
              </span>
            )}
          </p>

          <div className="flex flex-col gap-2">
            {board.rows.map((row) => (
              <div key={`${row.rank}-${row.maskedNickname}`} className="flex items-center gap-3 rounded-xl border border-border p-3.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {row.rank}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {row.maskedNickname}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{formatMan(row.salary)}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.job} · {row.years} · {row.region}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1">
                  <span
                    className={`text-xs font-bold ${
                      row.changePct == null ? 'text-muted-foreground' : row.changePct >= 0 ? 'text-[#0ca30c]' : 'text-red-500'
                    }`}
                  >
                    {row.changePct == null ? '-' : `${row.changePct >= 0 ? '+' : ''}${row.changePct}%`}
                  </span>
                  <InfoTooltip label="증감률 안내" side="left">
                    직전 대비 연봉 변동률이에요. 이직·연봉협상 등으로 오르면 초록색(+), 내리면
                    빨간색(-)으로 보여드려요.
                  </InfoTooltip>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
