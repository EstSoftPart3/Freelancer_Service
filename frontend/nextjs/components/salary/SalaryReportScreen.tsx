'use client'
// E. 연봉 리포트 — D(분석 중)에서 넘어온 sessionStorage 입력값을 읽어 리포트를 그린다.
// 백엔드에 "연봉 통계" API 가 없어서 lib/salaryEstimate.ts 의 결정론적 추정치를 쓴다
// (같은 입력이면 새로고침해도 같은 숫자가 나온다 — 진짜 시장 데이터 아님, 프로토타입 시연용).
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Award, Briefcase, Eye, RotateCcw, Sparkles, TrendingUp, Users } from 'lucide-react'
import api from '@/lib/api'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import { useUserStore } from '@/stores/userStore'
import {
  buildJobChangeFeed,
  computeSalaryReport,
  type JobChangeFeedItem,
  type SalaryCalcInput,
  type SalaryReportData,
} from '@/lib/salaryEstimate'
import type { RequiredSkillGroup } from '@/types'
import type { PopularProject } from '@/components/main/MainPage'

function formatMan(n: number): string {
  return `${Math.round(n).toLocaleString()}만원`
}

// 히스토그램·연봉 눈금용 — 1억 넘으면 "억" 단위를 섞어 짧게 보여준다 (예: 1.2억)
function formatManShort(n: number): string {
  if (Math.abs(n) >= 10000) return `${(n / 10000).toFixed(1)}억`
  return `${Math.round(n).toLocaleString()}`
}

export default function SalaryReportScreen() {
  const router = useRouter()
  const userTypeCd = useUserStore((s) => s.userTypeCd)

  const [input, setInput] = useState<SalaryCalcInput | null | undefined>(undefined) // undefined = 아직 확인 전
  const [catalogSkills, setCatalogSkills] = useState<string[]>([])
  const [popularProjects, setPopularProjects] = useState<PopularProject[]>([])
  const [projectsLoaded, setProjectsLoaded] = useState(false)

  const [scenario, setScenario] = useState<'normal' | 'conservative'>('normal')
  const [selectedBumps, setSelectedBumps] = useState<Set<string>>(new Set())
  const [hoveredBucket, setHoveredBucket] = useState<number | null>(null)
  const [hoveredYear, setHoveredYear] = useState<number | null>(null)

  useEffect(() => {
    // sessionStorage는 서버에 없어서 SSR과 값이 다를 수밖에 없다 — 하이드레이션 직후
    // 이펙트에서 한 번만 읽어야 서버·클라이언트 첫 렌더가 어긋나지 않는다.
    const raw = sessionStorage.getItem('salaryCalcInput')
    if (!raw) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInput(null)
      return
    }
    try {
      setInput(JSON.parse(raw))
    } catch {
      setInput(null)
    }
  }, [])

  useEffect(() => {
    api
      .get<{ output: { skills: RequiredSkillGroup[] } }>('/projects/forms')
      .then(({ data }) => setCatalogSkills(data.output.skills.flatMap((g) => g.childSkillTagNms)))
      .catch(() => console.error('[SalaryReport] 기술스택 카탈로그 로드 실패'))
  }, [])

  useEffect(() => {
    api
      .get<PopularProject[]>('/projects/popular', { params: { sortType: 'views' } })
      .then(({ data }) => setPopularProjects(data.slice(0, 3)))
      .catch(() => console.error('[SalaryReport] 추천 프로젝트 로드 실패'))
      .finally(() => setProjectsLoaded(true))
  }, [])

  const report: SalaryReportData | null = useMemo(() => {
    if (!input || catalogSkills.length === 0) return null
    return computeSalaryReport(input, catalogSkills)
  }, [input, catalogSkills])

  const feed: JobChangeFeedItem[] = useMemo(() => {
    if (!input || !report) return []
    return buildJobChangeFeed(input, report.meanSalary)
  }, [input, report])

  // 로딩 중(아직 sessionStorage 확인 전)
  if (input === undefined) {
    return <div className="min-h-[calc(100vh-104px)] bg-white" />
  }

  // 계산기 없이 바로 들어온 경우 — 가드
  if (input === null) {
    return (
      <div className="flex min-h-[calc(100vh-104px)] flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" />
          연봉 리포트
        </p>
        <h1 className="text-xl font-bold text-foreground">먼저 연봉계산기에서 조건을 입력해 주세요</h1>
        <p className="text-sm text-muted-foreground">5가지만 답하면 리포트를 바로 만들어 드려요.</p>
        <Link
          href="/salary/calculator"
          className="mt-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:opacity-90"
        >
          연봉계산기로 이동
        </Link>
      </div>
    )
  }

  if (!report) {
    return <div className="min-h-[calc(100vh-104px)] bg-white" />
  }

  const combinedBumpPct = report.skillCandidates
    .filter((c) => selectedBumps.has(c.skill))
    .reduce((sum, c) => sum + c.bumpPct, 0)
  const bumpedSalary = report.mySalary * (1 + combinedBumpPct / 100)

  const maxBucketCount = Math.max(...report.histogram.map((b) => b.count))
  const gaugePosition = Math.min(96, Math.max(4, 100 - report.percentileTop))

  const projection = report.yearProjection[scenario]
  const maxProjection = Math.max(...projection.map((p) => p.salary))
  const minProjection = Math.min(...projection.map((p) => p.salary))
  const projectionRange = Math.max(maxProjection - minProjection, 1)

  const goToProject = (p: PopularProject) => {
    const path = userTypeCd === 302 ? `/projects/company/${p.projectSq}` : `/projects/user/${p.projectSq}`
    router.push(path)
  }

  const toggleBump = (skill: string) => {
    setSelectedBumps((prev) => {
      const next = new Set(prev)
      if (next.has(skill)) next.delete(skill)
      else next.add(skill)
      return next
    })
  }

  return (
    <div className="min-h-[calc(100vh-104px)] bg-white">
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        {/* 헤더 */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" />
              연봉 리포트
            </p>
            <h1 className="mb-1 text-2xl font-bold text-foreground md:text-3xl">
              {input.job} · {input.years} · {input.region} 조건 리포트
            </h1>
            <p className="text-sm text-muted-foreground">
              {input.employment === 'FREELANCE' ? '프리랜서 월단가' : '정규직·계약직 연봉'} 기준으로 분석했어요.
            </p>
          </div>
          <Link
            href="/salary/calculator"
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-semibold text-foreground/70 hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            다시 계산하기
          </Link>
        </div>

        {/* 히어로 — 내 연봉 · 상위 N% · 게이지 */}
        <section className="mb-6 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1.5 text-sm font-medium text-muted-foreground">
                {input.employment === 'FREELANCE' ? '내 월단가' : '내 연봉'}
              </p>
              <p className="text-4xl font-bold text-foreground md:text-5xl">{formatMan(report.mySalary)}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2.5 text-amber-800">
              <Award className="h-5 w-5" />
              <span className="text-lg font-extrabold">상위 {report.percentileTop}%</span>
            </div>
          </div>

          {/* 백분위 게이지 */}
          <div className="relative pt-3">
            <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-indigo-100 via-indigo-300 to-amber-300" />
            <div
              className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
              style={{ left: `${gaugePosition}%` }}
            >
              <span className="mb-1 whitespace-nowrap rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">
                나
              </span>
              <span className="h-4 w-4 rounded-full border-[3px] border-white bg-indigo-600 shadow" />
            </div>
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>하위</span>
            <span>상위</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            같은 조건({input.job} · {input.years} · {input.region}) 동료들의 평균 추정치는{' '}
            <span className="font-semibold text-foreground">{formatMan(report.meanSalary)}</span> 이에요.
          </p>
        </section>

        {/* 연봉 분포 히스토그램 */}
        <section className="mb-6 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-1 text-lg font-bold text-foreground">같은 조건 동료들과 비교하면</h2>
          <p className="mb-6 text-xs text-muted-foreground">동료 약 1,200명 추정 분포 안에서 내 위치예요.</p>

          <div className="relative flex h-40 items-end gap-1.5">
            {report.histogram.map((bucket, i) => {
              const heightPct = Math.max(6, (bucket.count / maxBucketCount) * 100)
              return (
                <div
                  key={i}
                  className="group relative flex h-full flex-1 flex-col items-center justify-end"
                  onMouseEnter={() => setHoveredBucket(i)}
                  onMouseLeave={() => setHoveredBucket((v) => (v === i ? null : v))}
                >
                  {bucket.isMine && (
                    <span className="mb-1 whitespace-nowrap rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      나
                    </span>
                  )}
                  {hoveredBucket === i && (
                    <div className="absolute bottom-full z-10 mb-1 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-[11px] font-medium text-background shadow-lg">
                      {formatManShort(bucket.from)}~{formatManShort(bucket.to)}만원 · 약 {bucket.count}명
                    </div>
                  )}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t transition-all ${
                      bucket.isMine ? 'bg-amber-500' : 'bg-indigo-200 group-hover:bg-indigo-300'
                    }`}
                  />
                </div>
              )
            })}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
            <span>{formatManShort(report.histogram[0].from)}만원</span>
            <span>{formatManShort(report.histogram[report.histogram.length - 1].to)}만원</span>
          </div>
        </section>

        {/* 연도별 추정 연봉 */}
        <section className="mb-6 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="mb-1 text-lg font-bold text-foreground">앞으로 {projection.length - 1}년, 이렇게 늘어날 수 있어요</h2>
              <p className="text-xs text-muted-foreground">과거 성장 추세를 시드로 추정한 값이에요. 실제와 다를 수 있어요.</p>
            </div>
            <div className="inline-flex rounded-full bg-muted p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setScenario('normal')}
                className={
                  scenario === 'normal'
                    ? 'rounded-full bg-indigo-600 px-3.5 py-1.5 text-white'
                    : 'cursor-pointer rounded-full px-3.5 py-1.5 text-muted-foreground hover:text-foreground'
                }
              >
                일반 시나리오
              </button>
              <button
                type="button"
                onClick={() => setScenario('conservative')}
                className={
                  scenario === 'conservative'
                    ? 'rounded-full bg-indigo-600 px-3.5 py-1.5 text-white'
                    : 'cursor-pointer rounded-full px-3.5 py-1.5 text-muted-foreground hover:text-foreground'
                }
              >
                보수적 시나리오
              </button>
            </div>
          </div>

          <div className="relative h-48 w-full">
            <svg viewBox="0 0 600 180" className="h-full w-full overflow-visible" preserveAspectRatio="none">
              {(() => {
                const toXY = (i: number) => {
                  const x = (i / (projection.length - 1)) * 600
                  const y = 170 - ((projection[i].salary - minProjection) / projectionRange) * 150
                  return [x, y] as const
                }
                const points = projection.map((_, i) => toXY(i))
                const linePath = points.map((p) => p.join(',')).join(' ')
                const areaPath = `0,170 ${linePath} 600,170`
                return (
                  <>
                    <polygon points={areaPath} fill="#4F46E5" opacity={0.08} />
                    <polyline points={linePath} fill="none" stroke="#4F46E5" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                    {points.map(([x, y], i) => (
                      <g key={i} onMouseEnter={() => setHoveredYear(i)} onMouseLeave={() => setHoveredYear((v) => (v === i ? null : v))}>
                        <circle cx={x} cy={y} r={14} fill="transparent" className="cursor-pointer" />
                        <circle cx={x} cy={y} r={5} fill="#4F46E5" stroke="white" strokeWidth={2} />
                      </g>
                    ))}
                  </>
                )
              })()}
            </svg>
            {hoveredYear !== null && (
              <div
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-foreground px-2.5 py-1.5 text-[11px] font-medium text-background shadow-lg"
                style={{
                  left: `${(hoveredYear / (projection.length - 1)) * 100}%`,
                  top: `${((170 - ((projection[hoveredYear].salary - minProjection) / projectionRange) * 150) / 180) * 100}%`,
                }}
              >
                {projection[hoveredYear].year}년 · {formatMan(projection[hoveredYear].salary)}
              </div>
            )}
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            {projection.map((p) => (
              <span key={p.year}>{p.year}</span>
            ))}
          </div>
        </section>

        {/* 기술스택 추가 시 재계산 */}
        <section className="mb-6 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-1 text-lg font-bold text-foreground">이 기술을 더하면 얼마나 오를까요?</h2>
          <p className="mb-5 text-xs text-muted-foreground">아직 선택하지 않은 기술 중, 시세에 영향이 큰 항목을 모아봤어요.</p>

          <div className="mb-5 flex flex-wrap gap-2">
            {report.skillCandidates.map((c) => {
              const active = selectedBumps.has(c.skill)
              return (
                <button
                  key={c.skill}
                  type="button"
                  onClick={() => toggleBump(c.skill)}
                  aria-pressed={active}
                  className={
                    active
                      ? 'flex cursor-pointer items-center gap-1.5 rounded-full bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition-transform hover:scale-105'
                      : 'flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-2 text-sm font-medium text-foreground/80 transition-transform hover:scale-105 hover:bg-muted'
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getSkillIconUrl(c.skill)} alt="" width={14} height={14} className="shrink-0" />
                  {c.skill}
                  <span className={active ? 'font-mono text-xs text-amber-200' : 'font-mono text-xs text-amber-600'}>
                    +{c.bumpPct}%
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50/60 px-5 py-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {selectedBumps.size > 0 ? `${selectedBumps.size}개 기술 추가 시 예상 연봉` : '기술을 선택하면 예상 연봉이 바뀌어요'}
              </p>
              <p className="text-2xl font-bold text-foreground">{formatMan(bumpedSalary)}</p>
            </div>
            {selectedBumps.size > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5 text-sm font-bold text-white">
                <TrendingUp className="h-3.5 w-3.5" />+{formatMan(bumpedSalary - report.mySalary)} (+{combinedBumpPct.toFixed(1)}%)
              </span>
            )}
          </div>
        </section>

        {/* 추천 — 프로젝트 + 이직 동향 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-1.5 text-base font-bold text-foreground">
              <Briefcase className="h-4 w-4 text-indigo-600" />내 조건에 맞는 프로젝트
            </h2>
            {!projectsLoaded && <p className="text-sm text-muted-foreground">불러오는 중...</p>}
            {projectsLoaded && popularProjects.length === 0 && (
              <p className="text-sm text-muted-foreground">아직 추천할 프로젝트가 없어요.</p>
            )}
            <div className="flex flex-col gap-3">
              {popularProjects.map((p) => (
                <button
                  key={p.projectSq}
                  type="button"
                  onClick={() => goToProject(p)}
                  className="flex cursor-pointer flex-col items-start rounded-xl border border-border p-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="mb-1 truncate text-sm font-bold text-foreground">{p.projectTtl}</p>
                  <p className="mb-2 truncate text-xs text-muted-foreground">{p.companyNm}</p>
                  <div className="flex items-center justify-between gap-2 self-stretch">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-extrabold text-primary">
                      {p.formattedSalary}
                    </span>
                    {p.viewCnt != null && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {p.viewCnt}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-1.5 text-base font-bold text-foreground">
              <Users className="h-4 w-4 text-indigo-600" />최근 이직 연봉 동향
            </h2>
            <div className="flex flex-col gap-3">
              {feed.map((f, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {f.maskedNickname}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {formatMan(f.fromSalary)} → {formatMan(f.toSalary)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {input.job} · {input.years} · {f.relativeTime}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-[#0ca30c]">
                    +{Math.round(((f.toSalary - f.fromSalary) / f.fromSalary) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
