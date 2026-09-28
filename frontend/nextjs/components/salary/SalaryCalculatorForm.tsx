'use client'
// 연봉계산기 입력 폼 — 연봉 관련 화면 전용 톤(라이트 + 인디고/골드 액센트).
// 직무·지역·학력·기술스택은 실제 프로젝트 등록 폼과 같은 데이터(/projects/forms)를 그대로 쓴다.
// 나머지(회사규모·회사종류·직급·개발팀규모 등)는 아직 백엔드에 없는 개인 프로필 항목이라 목데이터.
//
// "후킹" 장치: 폼을 그냥 나열하지 않고, 필수 5개 항목이 채워질 때마다 도넛형 진행률 링이
// 실시간으로 차오르게 해서 퀴즈처럼 진행 상황이 보이게 했다.
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calculator, ChevronDown, Sparkles } from 'lucide-react'
import api from '@/lib/api'
import SkillPickerModal from './SkillPickerModal'
import { useUserStore } from '@/stores/userStore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { RequiredSkillGroup } from '@/types'

type Employment = 'EMPLOYED' | 'FREELANCE'

const YEAR_BUCKETS = ['1~2년', '3~5년', '6~9년', '10년+']
const REGION_REMOTE = '원격'
const EMPLOYMENT_SUBTYPES = ['정규직', '계약직']
const COMPANY_SIZES = ['10인 미만', '10~49명', '50~299명', '300~999명', '1,000명 이상']
const COMPANY_TYPES = ['스타트업', '중소기업', '중견기업', '대기업']
const POSITIONS = ['사원', '주임', '대리', '과장', '차장', '부장급 이상']
const TEAM_SIZES = ['1~4명', '5~9명', '10~19명', '20명 이상']
const REMOTE_TYPES = ['완전 출근', '하이브리드', '완전 재택']
const YES_NO = ['없음', '있음']
const JOB_CHANGE_COUNTS = ['0회', '1~2회', '3~4회', '5회 이상']

interface FormsData {
  cities: { areaSq: number; areaName: string }[]
  educationLevels: string[]
  recruitJobs: string[]
  skills: RequiredSkillGroup[]
}

// GET /salary/submissions/me 응답 — SalarySubmissionResponse(백엔드)와 필드 그대로 대응
interface SubmissionMeResponse {
  employmentType: Employment
  jobNm: string
  careerBucket: string
  regionNm: string
  annualSalary: number
  skillTagNms: string[]
  ageBand: string | null
  educationNm: string | null
  companySize: string | null
  companyType: string | null
  positionNm: string | null
  teamSize: string | null
  employmentSubtype: string | null
  remoteType: string | null
  bonusAmount: number | null
  stockOpt: string | null
  jobChangeCount: string | null
  companyNm: string | null
  prevAnnualSalary: number | null
  jobChangedYm: string | null
}

// SalaryReportScreen 등이 읽는 sessionStorage 페이로드 형태로 변환
function toCalcInputPayload(m: SubmissionMeResponse) {
  return {
    employment: m.employmentType,
    job: m.jobNm,
    years: m.careerBucket,
    region: m.regionNm,
    stack: m.skillTagNms,
    salary: m.annualSalary,
    age: m.ageBand,
    edu: m.educationNm,
    companySize: m.companySize,
    companyType: m.companyType,
    position: m.positionNm,
    teamSize: m.teamSize,
    subtype: m.employmentSubtype,
    remote: m.remoteType,
    bonus: m.bonusAmount,
    stock: m.stockOpt,
    jobChangeCount: m.jobChangeCount,
    companyNm: m.companyNm,
    prevAnnualSalary: m.prevAnnualSalary,
    jobChangedYm: m.jobChangedYm,
  }
}

// 단일 선택 칩 — 연봉 화면 공용(연봉계산기·연봉순위표에서 재사용)
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? 'cursor-pointer rounded-full bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white transition-transform hover:scale-105'
          : 'cursor-pointer rounded-full border border-border bg-white px-3.5 py-1.5 text-sm font-medium text-foreground/70 transition-transform hover:scale-105 hover:bg-muted'
      }
    >
      {label}
    </button>
  )
}

// 진행률 도넛 — 필수 항목이 채워질 때마다 실시간으로 차오른다("몇 문제 남았지?" 하는 퀴즈 느낌)
function ProgressRing({ value, max }: { value: number; max: number }) {
  const size = 72
  const stroke = 7
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - value / max)
  const done = value === max
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" className="stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={done ? 'stroke-amber-500 transition-[stroke-dashoffset] duration-500' : 'stroke-indigo-600 transition-[stroke-dashoffset] duration-500'}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-sm font-bold leading-none">{value}/{max}</span>
      </div>
    </div>
  )
}

export default function SalaryCalculatorForm() {
  const router = useRouter()
  const { isLoggedIn, userSq } = useUserStore()
  const [forms, setForms] = useState<FormsData | null>(null)

  // 로그인 상태로 이 화면에 들어왔고, 이전에 계산해 둔 이력이 있으면
  // "바로 리포트를 볼지 / 새로 계산할지" 먼저 물어본다.
  const [historyPayload, setHistoryPayload] = useState<Record<string, unknown> | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  useEffect(() => {
    api
      .get<{ output: FormsData }>('/projects/forms')
      .then(({ data }) => setForms(data.output))
      .catch(() => console.error('[SalaryCalculator] 폼 메타데이터 로드 실패'))
  }, [])

  useEffect(() => {
    if (!isLoggedIn() || !userSq) return
    api
      .get<{ output: SubmissionMeResponse }>('/salary/submissions/me')
      .then(({ data }) => {
        setHistoryPayload(toCalcInputPayload(data.output))
        setShowHistoryModal(true)
      })
      .catch(() => {
        // 404 = 제출 이력 없음(첫 방문) — 조용히 무시, 모달을 안 띄우면 된다.
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSq])

  function goToPreviousReport() {
    if (!historyPayload) return
    sessionStorage.setItem('salaryCalcInput', JSON.stringify(historyPayload))
    setShowHistoryModal(false)
    router.push('/salary/report')
  }

  const regionOptions = useMemo(
    () => (forms ? [...forms.cities.map((c) => c.areaName), REGION_REMOTE] : []),
    [forms],
  )

  // 필수
  const [employment, setEmployment] = useState<Employment>('EMPLOYED')
  const [job, setJob] = useState('')
  const [years, setYears] = useState('')
  const [region, setRegion] = useState('')
  const [stack, setStack] = useState<string[]>([])
  const [salary, setSalary] = useState('')
  const [skillModalOpen, setSkillModalOpen] = useState(false)

  // 옵셔널 — "더 정확한 분석을 원하시나요?"
  const [optionalOpen, setOptionalOpen] = useState(false)
  const [age, setAge] = useState('')
  const [edu, setEdu] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [companyType, setCompanyType] = useState('')
  const [position, setPosition] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [subtype, setSubtype] = useState('')
  const [remote, setRemote] = useState('')
  const [bonusYesNo, setBonusYesNo] = useState('')
  const [bonusAmount, setBonusAmount] = useState('')
  const [stock, setStock] = useState('')
  const [jobChangeCount, setJobChangeCount] = useState('')
  // 실데이터화 신규 3종 — "같은 조건 개발자가 다니는 회사"·"최근 이직 동향"을 실제 제출로 채우기 위함
  const [companyNm, setCompanyNm] = useState('')
  const [prevAnnualSalary, setPrevAnnualSalary] = useState('')
  const [jobChangedYm, setJobChangedYm] = useState('')

  const [error, setError] = useState('')

  const isFreelance = employment === 'FREELANCE'

  const filledCount = [
    job,
    years,
    region,
    stack.length > 0 ? '1' : '',
    salary && Number(salary) > 0 ? '1' : '',
  ].filter(Boolean).length

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const missing: string[] = []
    if (!job) missing.push('직무')
    if (!years) missing.push('연차')
    if (!region) missing.push('지역')
    if (stack.length === 0) missing.push('기술스택')
    if (!salary || Number(salary) <= 0) missing.push(isFreelance ? '월단가' : '연봉')

    if (missing.length) {
      setError(missing.join(' · ') + ' 항목을 확인해 주세요.')
      return
    }
    setError('')

    // E(연봉 리포트)가 아직 준비 중이라, 입력값만 세션에 담아 D(분석 중)로 넘긴다.
    // E가 만들어지면 거기서 이 값을 그대로 읽어 쓰면 된다.
    const payload = {
      employment,
      job,
      years,
      region,
      stack,
      salary: Number(salary),
      age: age || null,
      edu: edu || null,
      companySize: companySize || null,
      companyType: companyType || null,
      position: position || null,
      teamSize: teamSize || null,
      subtype: employment === 'EMPLOYED' ? subtype || null : null,
      remote: remote || null,
      bonus: bonusYesNo === '있음' ? Number(bonusAmount) || 0 : null,
      stock: stock || null,
      jobChangeCount: jobChangeCount || null,
      companyNm: employment === 'EMPLOYED' ? companyNm.trim() || null : null,
      prevAnnualSalary: prevAnnualSalary ? Number(prevAnnualSalary) || null : null,
      jobChangedYm: jobChangedYm || null,
    }
    // 실제 저장(POST /salary/submissions)은 D(분석 중) 화면에서 로그인 확인 후 수행한다 —
    // 여기서는 비로그인 사용자도 일단 입력을 마칠 수 있게 세션에만 담아 넘긴다.
    sessionStorage.setItem('salaryCalcInput', JSON.stringify(payload))
    router.push('/salary/analyzing')
  }

  const monthlyPreview =
    !isFreelance && salary && Number(salary) > 0 ? Math.round(Number(salary) / 12) : null

  return (
    <div className="min-h-[calc(100vh-104px)] bg-white">
      <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <Calculator className="h-3.5 w-3.5" />
              연봉계산기
            </p>
            <h1 className="mb-2 text-2xl font-bold leading-snug text-foreground md:text-3xl">
              같은 조건 개발자 사이,
              <br />내 연봉은 어디쯤일까요?
            </h1>
            <p className="text-sm text-muted-foreground">5가지만 답하면 바로 확인할 수 있어요.</p>
          </div>
          <ProgressRing value={filledCount} max={5} />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          {/* 고용형태 */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              고용형태 <span className="text-xs font-normal text-muted-foreground">필수</span>
            </label>
            <div className="inline-flex rounded-full bg-muted p-1">
              <button
                type="button"
                onClick={() => setEmployment('EMPLOYED')}
                className={
                  employment === 'EMPLOYED'
                    ? 'rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white'
                    : 'cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground'
                }
              >
                정규직 · 계약직
              </button>
              <button
                type="button"
                onClick={() => setEmployment('FREELANCE')}
                className={
                  employment === 'FREELANCE'
                    ? 'rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white'
                    : 'cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground'
                }
              >
                프리랜서
              </button>
            </div>
          </div>

          {/* 직무 */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              직무 <span className="text-xs font-normal text-muted-foreground">필수</span>
            </label>
            <select
              value={job}
              onChange={(e) => setJob(e.target.value)}
              disabled={!forms}
              className="w-full appearance-none rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
            >
              <option value="">{forms ? '직무를 선택하세요' : '불러오는 중...'}</option>
              {forms?.recruitJobs.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>

          {/* 연차 */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              연차 <span className="text-xs font-normal text-muted-foreground">필수</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {YEAR_BUCKETS.map((y) => (
                <Chip key={y} label={y} active={years === y} onClick={() => setYears(y)} />
              ))}
            </div>
          </div>

          {/* 지역 */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              지역 <span className="text-xs font-normal text-muted-foreground">필수</span>
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              disabled={!forms}
              className="w-full appearance-none rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
            >
              <option value="">{forms ? '지역을 선택하세요' : '불러오는 중...'}</option>
              {regionOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* 기술스택 */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              기술스택 <span className="text-xs font-normal text-muted-foreground">필수 · 최소 1개</span>
            </label>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/30 p-3">
              {stack.length === 0 && <span className="px-1 text-sm text-muted-foreground">아직 선택한 기술이 없어요</span>}
              {stack.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1 rounded-full border border-indigo-500 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700"
                >
                  {s}
                </span>
              ))}
              <button
                type="button"
                onClick={() => setSkillModalOpen(true)}
                disabled={!forms}
                className="ml-auto shrink-0 cursor-pointer rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold text-background hover:opacity-85 disabled:opacity-50"
              >
                기술스택 선택
              </button>
            </div>
          </div>

          {/* 연봉/단가 — 골드 액센트로 "돈" 필드임을 드러낸다 */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              {isFreelance ? '현재 월단가' : '현재 연봉'} <span className="text-xs font-normal text-muted-foreground">필수</span>
            </label>
            <div className="flex items-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50/40 px-4 py-2 focus-within:border-amber-400">
              <input
                type="number"
                min={0}
                step={10}
                inputMode="numeric"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder={isFreelance ? '700' : '5200'}
                className="w-full bg-transparent py-2 font-mono text-2xl font-bold text-foreground outline-none placeholder:text-muted-foreground/50"
              />
              <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                {isFreelance ? '만원 · 월 단가' : '만원 · 세전 연봉'}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {isFreelance
                ? '최근 계약 기준, 월 단가(세전)를 입력해 주세요.'
                : monthlyPreview
                  ? `월급으로 치면 약 ${monthlyPreview.toLocaleString()}만원 수준이에요.`
                  : '정규직·계약직 기준, 세전 연봉을 입력해 주세요.'}
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700 ring-1 ring-red-200">{error}</p>
          )}

          {/* 옵셔널 섹션 */}
          <button
            type="button"
            onClick={() => setOptionalOpen((v) => !v)}
            className="flex cursor-pointer items-center gap-2 self-start text-sm font-semibold text-foreground/80 hover:text-foreground"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${optionalOpen ? 'rotate-180' : ''}`} />
            더 정확한 분석을 원하시나요?
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">선택 항목 14개</span>
          </button>

          {optionalOpen && (
            <div className="rounded-2xl border border-border bg-muted/20 p-5">
              <p className="mb-4 text-xs text-muted-foreground">채울수록 더 좁은 그룹과 비교해 드려요. 전부 선택 사항이에요.</p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground">나이</p>
                  <input
                    type="number"
                    min={15}
                    max={70}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="29"
                    className="w-28 rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                  <span className="ml-2 text-xs text-muted-foreground">세</span>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground">학력</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(forms?.educationLevels ?? []).map((e) => (
                      <Chip key={e} label={e} active={edu === e} onClick={() => setEdu(e)} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground">현재 회사 인원</p>
                  <div className="flex flex-wrap gap-1.5">
                    {COMPANY_SIZES.map((c) => (
                      <Chip key={c} label={c} active={companySize === c} onClick={() => setCompanySize(c)} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground">회사 종류</p>
                  <div className="flex flex-wrap gap-1.5">
                    {COMPANY_TYPES.map((c) => (
                      <Chip key={c} label={c} active={companyType === c} onClick={() => setCompanyType(c)} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground">직급</p>
                  <div className="flex flex-wrap gap-1.5">
                    {POSITIONS.map((p) => (
                      <Chip key={p} label={p} active={position === p} onClick={() => setPosition(p)} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground">개발팀 규모</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TEAM_SIZES.map((t) => (
                      <Chip key={t} label={t} active={teamSize === t} onClick={() => setTeamSize(t)} />
                    ))}
                  </div>
                </div>

                {employment === 'EMPLOYED' && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">고용 세부</p>
                    <div className="flex flex-wrap gap-1.5">
                      {EMPLOYMENT_SUBTYPES.map((s) => (
                        <Chip key={s} label={s} active={subtype === s} onClick={() => setSubtype(s)} />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground">재택근무</p>
                  <div className="flex flex-wrap gap-1.5">
                    {REMOTE_TYPES.map((r) => (
                      <Chip key={r} label={r} active={remote === r} onClick={() => setRemote(r)} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground">성과급</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {YES_NO.map((y) => (
                      <Chip key={y} label={y} active={bonusYesNo === y} onClick={() => setBonusYesNo(y)} />
                    ))}
                    {bonusYesNo === '있음' && (
                      <span className="flex items-center gap-1 rounded-lg border border-border bg-white px-2.5 py-1.5">
                        <input
                          type="number"
                          min={0}
                          value={bonusAmount}
                          onChange={(e) => setBonusAmount(e.target.value)}
                          placeholder="500"
                          className="w-16 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                        <span className="text-xs text-muted-foreground">만원</span>
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground">스톡옵션</p>
                  <div className="flex flex-wrap gap-1.5">
                    {YES_NO.map((y) => (
                      <Chip key={y} label={y} active={stock === y} onClick={() => setStock(y)} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground">이직 횟수</p>
                  <div className="flex flex-wrap gap-1.5">
                    {JOB_CHANGE_COUNTS.map((j) => (
                      <Chip key={j} label={j} active={jobChangeCount === j} onClick={() => setJobChangeCount(j)} />
                    ))}
                  </div>
                </div>

                {employment === 'EMPLOYED' && (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">현재 회사명</p>
                    <input
                      type="text"
                      value={companyNm}
                      onChange={(e) => setCompanyNm(e.target.value)}
                      placeholder="예: 컨트롤에프"
                      maxLength={50}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      &ldquo;같은 조건 개발자가 다니는 회사&rdquo; 통계에 실제로 반영돼요(3명 미만이면 노출 안 함).
                    </p>
                  </div>
                )}

                <div>
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
                    직전 {isFreelance ? '단가' : '연봉'}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      value={prevAnnualSalary}
                      onChange={(e) => setPrevAnnualSalary(e.target.value)}
                      placeholder="4500"
                      className="w-28 rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                    <span className="text-xs text-muted-foreground">만원</span>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground">최근 이직·계약 시기</p>
                  <input
                    type="month"
                    value={jobChangedYm}
                    onChange={(e) => setJobChangedYm(e.target.value)}
                    max={new Date().toISOString().slice(0, 7)}
                    className="rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    직전 {isFreelance ? '단가' : '연봉'}와 함께 입력하면 &ldquo;최근 이직 동향&rdquo;에 반영돼요.
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="group mt-2 flex w-fit cursor-pointer items-center gap-2 rounded-full bg-indigo-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-200"
          >
            <Sparkles className="h-4 w-4 text-amber-300 transition-transform group-hover:rotate-12" />
            연봉 확인하기
          </button>
        </form>
      </div>

      {forms && (
        <SkillPickerModal
          open={skillModalOpen}
          groups={forms.skills}
          selected={stack}
          onClose={() => setSkillModalOpen(false)}
          onConfirm={setStack}
        />
      )}

      <Dialog open={showHistoryModal} onOpenChange={(o) => { if (!o) setShowHistoryModal(false) }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>이전에 계산한 연봉 리포트가 있어요</DialogTitle>
            <DialogDescription>
              {String(historyPayload?.job ?? '')} · {String(historyPayload?.years ?? '')} ·{' '}
              {String(historyPayload?.region ?? '')} 조건으로 계산한 이력이 남아있어요. 바로
              리포트를 볼까요, 새로 계산할까요?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistoryModal(false)}>
              새로 계산하기
            </Button>
            <Button onClick={goToPreviousReport}>이전 리포트 보기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
