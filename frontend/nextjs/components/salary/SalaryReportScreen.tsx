'use client'
// E. 연봉 리포트 — D(분석 중)에서 넘어온 sessionStorage 입력값을 읽어 리포트를 그린다.
// 백엔드에 "연봉 통계" API 가 없어서 lib/salaryEstimate.ts 의 결정론적 추정치를 쓴다
// (같은 입력이면 새로고침해도 같은 숫자가 나온다 — 진짜 시장 데이터 아님, 프로토타입 시연용).
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Award, Briefcase, Building2, Flame, RotateCcw, Sparkles, TrendingUp, Users } from 'lucide-react'
import api from '@/lib/api'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import { InfoTooltip } from '@/components/ui/tooltip'
import {
  buildJobChangeFeed,
  buildJobChangeSalaryBands,
  computeSalaryReport,
  type JobChangeFeedItem,
  type SalaryCalcInput,
  type SalaryReportData,
} from '@/lib/salaryEstimate'
import type { RequiredSkillGroup } from '@/types'

function formatMan(n: number): string {
  return `${Math.round(n).toLocaleString()}만원`
}

// 히스토그램·연봉 눈금용 — 1억 넘으면 "억" 단위를 섞어 짧게 보여준다 (예: 1.2억)
function formatManShort(n: number): string {
  if (Math.abs(n) >= 10000) return `${(n / 10000).toFixed(1)}억`
  return `${Math.round(n).toLocaleString()}`
}

export default function SalaryReportScreen() {
  const [input, setInput] = useState<SalaryCalcInput | null | undefined>(undefined) // undefined = 아직 확인 전
  const [catalogSkills, setCatalogSkills] = useState<string[]>([])

  const [scenario, setScenario] = useState<'normal' | 'grind'>('normal')
  const [selectedBumps, setSelectedBumps] = useState<Set<string>>(new Set())
  const [hoveredBucket, setHoveredBucket] = useState<number | null>(null)

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

  const report: SalaryReportData | null = useMemo(() => {
    if (!input || catalogSkills.length === 0) return null
    return computeSalaryReport(input, catalogSkills)
  }, [input, catalogSkills])

  const feed: JobChangeFeedItem[] = useMemo(() => {
    if (!input || !report) return []
    return buildJobChangeFeed(input, report.meanSalary)
  }, [input, report])

  const jobChangeBands = useMemo(() => {
    if (!report || feed.length === 0) return []
    return buildJobChangeSalaryBands(report.mySalary, feed)
  }, [report, feed])

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
  const isGrind = scenario === 'grind'
  // 일반/빡세게 두 시나리오를 같은 축에 놓고 계산해야 그래프 "위치" 자체가 달라 보인다 —
  // 시나리오별로 축을 따로 스케일링하면 성장률이 달라도 항상 같은 박스를 꽉 채워서 그려지므로
  // 숫자만 다르고 그래프 모양은 늘 똑같아 보이는 문제가 있었다.
  const allProjectionSalaries = [...report.yearProjection.normal, ...report.yearProjection.grind].map((p) => p.salary)
  const maxProjection = Math.max(...allProjectionSalaries)
  const minProjection = Math.min(...allProjectionSalaries)
  const projectionRange = Math.max(maxProjection - minProjection, 1)
  const projectionGrowthPct = Math.round(
    ((projection[projection.length - 1].salary - projection[0].salary) / projection[0].salary) * 100,
  )

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
            <div className="flex items-center gap-2">
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
                  onClick={() => setScenario('grind')}
                  className={
                    scenario === 'grind'
                      ? 'flex items-center gap-1 rounded-full bg-amber-500 px-3.5 py-1.5 text-white'
                      : 'flex cursor-pointer items-center gap-1 rounded-full px-3.5 py-1.5 text-muted-foreground hover:text-foreground'
                  }
                >
                  <Flame className="h-3.5 w-3.5" />
                  인생 빡세게 모드
                </button>
              </div>
              <InfoTooltip label="인생 빡세게 모드 안내">
                야근·자격증 취득·전략적 이직처럼 커리어에 적극적으로 투자했을 때 가능한 성장률로
                추정한 시나리오예요. 정말 열심히 살았을 때 오를 수 있는 연봉을 보여드려요.
              </InfoTooltip>
            </div>
          </div>

          {/* 시나리오 요약 배지 — 두 시나리오의 "그래프 위치" 차이를 숫자로도 강조한다 */}
          <div
            key={`badge-${scenario}`}
            className={
              isGrind
                ? 'mb-4 inline-flex animate-in fade-in-0 slide-in-from-bottom-2 items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-red-500 px-4 py-2 text-sm font-extrabold text-white shadow-lg shadow-amber-200'
                : 'mb-4 inline-flex animate-in fade-in-0 slide-in-from-bottom-2 items-center gap-1.5 rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700'
            }
          >
            {isGrind && <Flame className="h-4 w-4 animate-pulse" />}5년 후 {formatMan(projection[projection.length - 1].salary)} ·{' '}
            {projectionGrowthPct >= 0 ? '+' : ''}
            {projectionGrowthPct}%
          </div>

          {/* 두 시나리오를 같은 축(minProjection~maxProjection)에 그려서, 빡세게 모드가 실제로
              더 높은 "위치"까지 올라가는 게 눈으로 바로 보이게 한다(숫자만 다르고 모양은 똑같아
              보이던 문제 수정). 색상·글로우·라인 굵기도 시나리오별로 확 달라지게 했다. */}
          <div key={`chart-${scenario}`} className="relative h-48 w-full animate-in fade-in-0 duration-500 pt-7">
            <svg viewBox="0 0 600 180" className="h-full w-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="grindLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
                <linearGradient id="grindArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                    <polygon points={areaPath} fill={isGrind ? 'url(#grindArea)' : '#4F46E5'} opacity={isGrind ? 1 : 0.08} />
                    <polyline
                      points={linePath}
                      fill="none"
                      stroke={isGrind ? 'url(#grindLine)' : '#4F46E5'}
                      strokeWidth={isGrind ? 3.5 : 2}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      style={isGrind ? { filter: 'drop-shadow(0 0 5px rgba(239,68,68,0.5))' } : undefined}
                    />
                    {points.map(([x, y], i) => (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={isGrind ? 6 : 5}
                        fill={isGrind ? '#EF4444' : '#4F46E5'}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </>
                )
              })()}
            </svg>
            {/* 항목별 예상 연봉 — hover 없이 항상 노출 */}
            {projection.map((p, i) => (
              <div
                key={p.year}
                className={
                  isGrind
                    ? 'pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-gradient-to-r from-amber-500 to-red-500 px-1.5 py-1 text-[10px] font-bold text-white shadow'
                    : 'pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-foreground px-1.5 py-1 text-[10px] font-semibold text-background shadow'
                }
                style={{
                  left: `${(i / (projection.length - 1)) * 100}%`,
                  top: `${((170 - ((p.salary - minProjection) / projectionRange) * 150) / 180) * 100}%`,
                }}
              >
                {isGrind && i === projection.length - 1 ? '🔥 ' : ''}
                {formatMan(p.salary)}
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            {projection.map((p) => (
              <span key={p.year}>{p.year}</span>
            ))}
          </div>
        </section>

        {/* 기술스택 추가 시 재계산 */}
        <section className="mb-6 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-1 flex items-center gap-1.5 text-lg font-bold text-foreground">
            이 기술을 더하면 얼마나 오를까요?
            <InfoTooltip label="추천 기준 안내">
              같은 직무 · 연차 · 지역 공고에서 자주 요구되지만 아직 보유하지 않은 기술 중, 연봉
              상승 효과가 큰 순으로 골랐어요.
            </InfoTooltip>
          </h2>
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

        {/* 같은 조건 개발자가 많이 다니는 회사 */}
        <section className="mb-6 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-1 flex items-center gap-1.5 text-lg font-bold text-foreground">
            <Building2 className="h-4 w-4 text-indigo-600" />
            같은 조건 개발자가 많이 다니는 회사
            <InfoTooltip label="추천 기준 안내">
              같은 직무 · 연차 · 지역 조건으로 계산한 사용자들이 최근 가장 많이 재직 중인 회사
              순으로 보여드려요. 추후 회사 추천 서비스로 발전시킬 예정이에요.
            </InfoTooltip>
          </h2>
          <p className="mb-5 text-xs text-muted-foreground">
            {input.job} · {input.years} · {input.region} 조건과 겹치는 재직자가 많은 곳이에요.
          </p>
          <div className="flex flex-col gap-2.5">
            {report.companyRecommendations.map((c, i) => (
              <div key={c.companyNm} className="flex items-center gap-3 rounded-xl border border-border p-3.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{c.companyNm}</p>
                  <p className="text-xs text-muted-foreground">
                    동일 조건 재직자 약 {c.matchedCount}명 · 평균 {formatMan(c.avgSalary)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 최근 이직 연봉 동향 + 이직했을 때 예상 연봉 */}
        <section className="mb-6 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
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

          {jobChangeBands.length > 0 && (
            <div className="mt-6 border-t border-border pt-5">
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-foreground">
                이직했을 때 예상 연봉
                <InfoTooltip label="추정 기준 안내">
                  위 최근 이직 사례들의 인상폭(최소~평균~최대)을 근거로, 내 연봉에 그대로 적용했을
                  때 받을 수 있는 범위를 추정했어요.
                </InfoTooltip>
              </h3>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {jobChangeBands.map((b) => (
                  <div key={b.label} className="rounded-xl bg-muted/40 p-3.5 text-center">
                    <p className="text-xs font-medium text-muted-foreground">{b.label}</p>
                    <p className="mt-1 text-lg font-bold text-foreground">{formatMan(b.salary)}</p>
                    <p className="text-xs font-semibold text-[#0ca30c]">+{b.pct}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 추천 프로젝트 — 별도 페이지로 분리 */}
        <div className="flex justify-center pt-2">
          <Link
            href="/salary/recommend"
            className="flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-200"
          >
            <Briefcase className="h-4 w-4 text-amber-300" />
            추천 프로젝트 보기
          </Link>
        </div>
      </div>
    </div>
  )
}
