'use client'
// D. "컨트롤에프AI가 확인 중입니다" 인터스티셜.
// 🔴 지금은 리뷰용으로 애니메이션이 멈추지 않고 계속 돈다 — E(연봉 리포트)가 만들어지면
// 그때 아래 useEffect에 "일정 시간 뒤 /salary/report로 자동 이동" 로직을 붙이면 된다.
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'

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
}

export default function SalaryAnalyzingScreen() {
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [input, setInput] = useState<CalcInput | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('salaryCalcInput')
    if (raw) {
      try {
        setInput(JSON.parse(raw))
      } catch {
        // 손상된 값이면 조용히 무시 — 조건 캡션만 안 뜬다
      }
    }
  }, [])

  useEffect(() => {
    const t = setInterval(() => setPhaseIdx((i) => (i + 1) % PHASES.length), 1600)
    return () => clearInterval(t)
  }, [])

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
