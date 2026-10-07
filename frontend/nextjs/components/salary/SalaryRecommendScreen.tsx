'use client'
// 연봉 리포트(E)에서 분리된 "추천 프로젝트" 전용 화면.
// 리포트 화면과 같이 서버에 저장된 내 제출(/salary/submissions/me)을 읽어, 두 기준으로 각각 3개씩 실제 공고를 보여준다.
// - 내 기술 기반: /projects?skillTags=... (내가 고른 스택과 겹치는 공고)
// - 내 연봉에 맞는: /projects 전체에서 내 월 환산 금액(원)과 가장 가까운 월 단가 3개
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Sparkles, TrendingUp, Wrench } from 'lucide-react'
import api from '@/lib/api'
import ProjectCard from '@/components/project/ProjectCard'
import { useUserStore } from '@/stores/userStore'
import type { SalaryCalcInput } from '@/lib/salaryEstimate'
import type { ProjectItem } from '@/types'

// ProjectItem 타입엔 화면 표시용 formattedSalary만 있고 정렬용 원시 금액(salary)은 빠져 있다 —
// 백엔드 ProjectSummary는 salary(Long, 원 단위)를 내려주므로 이 화면에서만 로컬로 확장해 쓴다.
type ProjectItemWithSalary = ProjectItem & { salary?: number | null }


export default function SalaryRecommendScreen() {
  const router = useRouter()
  const { userTypeCd, isLoggedIn, authChecked } = useUserStore()

  const [input, setInput] = useState<SalaryCalcInput | null | undefined>(undefined)
  const [stackProjects, setStackProjects] = useState<ProjectItemWithSalary[]>([])
  const [salaryProjects, setSalaryProjects] = useState<ProjectItemWithSalary[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // sessionStorage(탭 단위·이전 계정 값이 남음) 대신 서버의 내 제출 이력 — 리포트와 같은 기준.
    if (!authChecked) return
    if (!isLoggedIn()) {
      router.replace('/login?redirect=/salary/recommend')
      return
    }
    let cancelled = false
    api.get<{ output: { employmentType: SalaryCalcInput['employment']; jobNm: string; careerBucket: string; regionNm: string; skillTagNms: string[]; annualSalary: number } }>('/salary/submissions/me')
      .then(({ data }) => {
        const m = data.output
        if (!cancelled) setInput({ employment: m.employmentType, job: m.jobNm, years: m.careerBucket, region: m.regionNm, stack: m.skillTagNms, salary: m.annualSalary })
      })
      .catch(() => { if (!cancelled) setInput(null) }) // 404(제출 이력 없음) 포함 — 계산기 안내
    return () => { cancelled = true }
  }, [authChecked, isLoggedIn, router])

  useEffect(() => {
    if (!input) return
    let cancelled = false

    async function load() {
      try {
        const [stackRes, poolRes] = await Promise.all([
          api.get('/projects', {
            params: { skillTags: input!.stack, sortBy: 'project_start_dt', sortOrder: 'desc', page: 1, size: 3 },
          }),
          api.get('/projects', {
            params: { sortBy: 'project_start_dt', sortOrder: 'desc', page: 1, size: 30 },
          }),
        ])
        if (cancelled) return

        const stackOut = stackRes.data.output ?? stackRes.data
        setStackProjects(stackOut.projects ?? [])

        const poolOut = poolRes.data.output ?? poolRes.data
        const pool: ProjectItemWithSalary[] = poolOut.projects ?? []
        // 공고 단가는 월 단가(원). 프리랜서는 월 단가(만원), 재직자는 연봉(만원)을 입력하므로 재직자는 12로 나눈다.
        const targetWon = (input!.employment === 'FREELANCE' ? input!.salary : input!.salary / 12) * 10000
        // 단가 있는 공고를 금액 근접순으로 먼저, 빈자리는 '단가 협의'(0·없음) 공고를 최신순(pool 순서)으로 채운다 —
        // 단가를 공개한 공고가 거의 없어서(운영 46건 중 1건) 협의 공고를 빼면 이 칸이 늘 비기 때문(사용자 결정 A25).
        // ponytail: 최신 30건 안에서만 고른다. 단가 있는 공고가 늘면 서버에서 단가 근접 조회로.
        const priced = pool
          .filter((p) => p.salary)
          .sort((a, b) => Math.abs(a.salary! - targetWon) - Math.abs(b.salary! - targetWon))
        const closest = [...priced, ...pool.filter((p) => !p.salary)].slice(0, 3)
        setSalaryProjects(closest)
      } catch {
        toast.error('추천 프로젝트를 불러오지 못했습니다.')
      } finally {
        if (!cancelled) setLoaded(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [input])

  const getProjectPath = (sq: number) => (userTypeCd === 302 ? `/projects/company/${sq}` : `/projects/user/${sq}`)

  function handleCardClick(sq: number) {
    router.push(getProjectPath(sq))
  }

  async function handleScrap(sq: number, current: 'Y' | 'N') {
    if (!isLoggedIn()) {
      toast.error('로그인이 필요합니다.')
      return
    }
    const isScrapped = current === 'Y'
    try {
      await api.post(`/projects/${sq}/scraps`, { hasScrapped: isScrapped, target: '프로젝트' })
      const flip = (list: ProjectItemWithSalary[]) =>
        list.map((p) => (p.projectSq === sq ? { ...p, hasScrapped: (isScrapped ? 'N' : 'Y') as 'Y' | 'N' } : p))
      setStackProjects(flip)
      setSalaryProjects(flip)
      toast.success(isScrapped ? '스크랩 해제에 성공하였습니다.' : '스크랩에 성공하였습니다.')
    } catch {
      toast.error('스크랩 처리 중 오류가 발생했습니다.')
    }
  }

  if (input === undefined) {
    return <div className="min-h-[calc(100vh-48px)] lg:min-h-[calc(100vh-104px)] bg-white" />
  }

  if (input === null) {
    return (
      <div className="flex min-h-[calc(100vh-48px)] lg:min-h-[calc(100vh-104px)] flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" />
          추천 프로젝트
        </p>
        <h1 className="text-xl font-bold text-foreground">먼저 연봉계산기에서 조건을 입력해 주세요</h1>
        <p className="text-sm text-muted-foreground">계산 결과를 기준으로 프로젝트를 추천해 드려요.</p>
        <Link
          href="/salary/calculator"
          className="mt-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:opacity-90"
        >
          연봉계산기로 이동
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-48px)] lg:min-h-[calc(100vh-104px)] bg-white">
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <div className="mb-8">
          <Link
            href="/salary/report"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/70 hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            연봉 리포트로 돌아가기
          </Link>
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" />
            추천 프로젝트
          </p>
          <h1 className="mb-1 text-2xl font-bold text-foreground md:text-3xl">
            {input.job} · {input.years} · {input.region} 조건에 맞는 프로젝트
          </h1>
          <p className="text-sm text-muted-foreground">내 기술 기반 3개, 내 연봉에 맞는 3개를 각각 골라봤어요.</p>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-1.5 text-lg font-bold text-foreground">
            <Wrench className="h-4 w-4 text-indigo-600" />내 기술 기반 추천
          </h2>
          {!loaded && <p className="text-sm text-muted-foreground">불러오는 중...</p>}
          {loaded && stackProjects.length === 0 && (
            <p className="rounded-xl border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              보유하신 기술과 겹치는 공고가 아직 없어요.
            </p>
          )}
          <div className="space-y-4">
            {stackProjects.map((p) => (
              <ProjectCard key={p.projectSq} project={p} onClick={handleCardClick} onScrap={handleScrap} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-1.5 text-lg font-bold text-foreground">
            <TrendingUp className="h-4 w-4 text-indigo-600" />내 연봉에 맞는 추천
          </h2>
          {!loaded && <p className="text-sm text-muted-foreground">불러오는 중...</p>}
          {loaded && salaryProjects.some((p) => !p.salary) && (
            <p className="mb-3 text-xs text-muted-foreground">단가가 공개된 공고가 적어 단가 협의 공고를 함께 보여드려요.</p>
          )}
          {loaded && salaryProjects.length === 0 && (
            <p className="rounded-xl border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              단가가 비슷한 공고가 아직 없어요.
            </p>
          )}
          <div className="space-y-4">
            {salaryProjects.map((p) => (
              <ProjectCard key={p.projectSq} project={p} onClick={handleCardClick} onScrap={handleScrap} />
            ))}
          </div>
        </section>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row">
          <Link
            href="/salary/ranking"
            className="salary-cta group flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            <TrendingUp className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            연봉순위표
          </Link>
          <Link
            href="/projects"
            className="salary-cta group flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            프로젝트 더보기
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}
