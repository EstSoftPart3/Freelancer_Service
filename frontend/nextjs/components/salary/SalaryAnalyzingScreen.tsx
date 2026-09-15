'use client'
// D. "컨트롤에프AI가 확인 중입니다" 인터스티셜. 4단계 애니메이션 동안 실제로 GET /salary/submissions를
// 호출해 제출을 끝내고, 최소 노출시간을 채운 뒤 E(연봉 리포트)로 이동한다.
// 계산기(C) 자체는 비로그인도 채울 수 있지만, 제출·리포트는 로그인 필수라 여기서 게이트한다 —
// sessionStorage에 입력값이 남아 있으니 로그인 후 돌아오면 이어서 제출된다.
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import api from '@/lib/api'
import { useUserStore } from '@/stores/userStore'
import { alertStore } from '@/stores/alertStore'
import { getApiErrorMessage } from '@/lib/errors'

const PHASES = ['데이터 수집 중', '같은 조건 그룹 매칭 중', '연봉 분포 계산 중', '리포트 만드는 중']

// 단계별 컨트롤에프 캐릭터. 파일이 없으면 이미지가 안 뜰 뿐 레이아웃은 안 깨짐(Image onError로 숨김).
const MASCOTS = [
  '/img/mascot/ctrl-f-data.png', // 데이터 수집 중
  '/img/mascot/ctrl-f-matching.png', // 같은 조건 그룹 매칭 중
  '/img/mascot/ctrl-f-calculating.png', // 연봉 분포 계산 중
  '/img/mascot/ctrl-f-report.png', // 리포트 만드는 중
]

interface CalcInput {
  employment: 'EMPLOYED' | 'FREELANCE'
  job: string
  years: string
  region: string
  stack: string[]
  salary: number
  age?: string | null
  edu?: string | null
  companySize?: string | null
  companyType?: string | null
  position?: string | null
  teamSize?: string | null
  subtype?: string | null
  remote?: string | null
  bonus?: number | null
  stock?: string | null
  jobChangeCount?: string | null
  companyNm?: string | null
  prevAnnualSalary?: number | null
  jobChangedYm?: string | null
}

const PHASE_DURATION_MS = 1600
const MIN_DISPLAY_MS = PHASE_DURATION_MS * PHASES.length // 애니메이션이 최소 한 바퀴는 돌게

function toSubmissionRequest(input: CalcInput) {
  return {
    employmentType: input.employment,
    jobNm: input.job,
    careerBucket: input.years,
    regionNm: input.region,
    annualSalary: input.salary,
    skillTagNms: input.stack,
    ageBand: input.age ?? null,
    educationNm: input.edu ?? null,
    companySize: input.companySize ?? null,
    companyType: input.companyType ?? null,
    positionNm: input.position ?? null,
    teamSize: input.teamSize ?? null,
    employmentSubtype: input.subtype ?? null,
    remoteType: input.remote ?? null,
    bonusAmount: input.bonus ?? null,
    stockOpt: input.stock ?? null,
    jobChangeCount: input.jobChangeCount ?? null,
    companyNm: input.companyNm ?? null,
    prevAnnualSalary: input.prevAnnualSalary ?? null,
    jobChangedYm: input.jobChangedYm ?? null,
  }
}

export default function SalaryAnalyzingScreen() {
  const router = useRouter()
  const { isLoggedIn, authChecked } = useUserStore()
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [input, setInput] = useState<CalcInput | null>(null)

  useEffect(() => {
    // sessionStorage는 서버에 없어서 SSR과 값이 다를 수밖에 없다 — 하이드레이션 직후
    // 이펙트에서 한 번만 읽어야 서버·클라이언트 첫 렌더가 어긋나지 않는다.
    const raw = sessionStorage.getItem('salaryCalcInput')
    if (!raw) {
      router.replace('/salary/calculator')
      return
    }
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInput(JSON.parse(raw))
    } catch {
      router.replace('/salary/calculator')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // authChecked 전까지 로그인 상태를 단정하지 않는다 — 로그인 상태인데도 로그인 화면으로
    // 잘못 튕기는 것을 막기 위함(다른 화면들과 동일한 패턴).
    if (!authChecked || !input) return
    if (!isLoggedIn()) {
      router.replace('/login?redirect=/salary/analyzing')
      return
    }

    const t = setInterval(() => setPhaseIdx((i) => (i + 1) % PHASES.length), PHASE_DURATION_MS)

    let cancelled = false
    Promise.all([
      api.post('/salary/submissions', toSubmissionRequest(input)),
      new Promise((resolve) => setTimeout(resolve, MIN_DISPLAY_MS)),
    ])
      .then(() => { if (!cancelled) router.push('/salary/report') })
      .catch((err) => {
        if (cancelled) return
        alertStore.show(getApiErrorMessage(err, '연봉 정보 제출에 실패했습니다.'), 'danger')
        router.replace('/salary/calculator')
      })

    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [authChecked, input, isLoggedIn, router])

  return (
    <div className="flex min-h-[calc(100vh-104px)] flex-col items-center justify-center bg-white px-4 py-16 text-center">
      <p className="mb-8 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
        <Sparkles className="h-3.5 w-3.5" />
        컨트롤에프AI
      </p>

      {/* 회전 스피너 + 단계별 컨트롤에프 캐릭터 크로스페이드 — 스피너는 계속 돌고, 안쪽 캐릭터만 단계에 맞춰 전환 */}
      <div className="relative mb-8 flex h-40 w-40 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-[6px] border-indigo-100" />
        <div className="absolute inset-0 animate-spin rounded-full border-[6px] border-transparent border-t-indigo-600" style={{ animationDuration: '1.1s' }} />
        <div className="relative h-28 w-28">
          {MASCOTS.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt=""
              fill
              priority={i === 0}
              className={`object-contain transition-opacity duration-700 ease-in-out ${
                i === phaseIdx ? 'opacity-100' : 'opacity-0'
              }`}
              onError={(e) => {
                e.currentTarget.style.visibility = 'hidden'
              }}
            />
          ))}
        </div>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">컨트롤에프AI가 확인 중입니다</h1>

      {/* 상태 문구 — 4개를 전부 같은 자리에 겹쳐두고 opacity만 전환해서 페이드아웃↔페이드인이 동시에 보이게 함 */}
      <div className="relative mb-6 h-6 w-full">
        {PHASES.map((phase, i) => (
          <p
            key={phase}
            className={`absolute inset-0 flex items-center justify-center text-base font-medium text-indigo-700 transition-opacity duration-700 ease-in-out ${
              i === phaseIdx ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {phase}...
          </p>
        ))}
      </div>

      {/* 불확정 진행바 — 퍼센트 숫자 없이 계속 좌우로 쓸어가는 그라데이션(로딩 중 표시의 정석) */}
      <div className="mb-6 h-1.5 w-64 overflow-hidden rounded-full bg-indigo-50">
        <div className="h-full w-1/3 animate-[salary-sweep_1.3s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-indigo-500 to-amber-400" />
      </div>

      {input && (
        <p className="text-xs text-muted-foreground">
          {input.job} · {input.years} · {input.region} 조건으로 분석하고 있어요
        </p>
      )}

      <style>{`
        @keyframes salary-sweep {
          0% { transform: translateX(-110%); }
          100% { transform: translateX(310%); }
        }
      `}</style>
    </div>
  )
}
