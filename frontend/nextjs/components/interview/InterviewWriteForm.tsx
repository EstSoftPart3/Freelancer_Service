'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useFormErrors } from '@/hooks/useFormErrors'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import { CAREER_LEVELS, INTERVIEW_STAGES } from '@/components/interview/types'

type FieldKey = 'companyNm' | 'jobNm' | 'careerLevel'

const RESULT_OPTIONS = [
  { value: 'PASS', label: '합격' },
  { value: 'FAIL', label: '불합격' },
  { value: 'PENDING', label: '대기중' },
]

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1
        return (
          <button key={star} type="button" onClick={() => onChange(star)} aria-label={`${star}점`}>
            <Star className={`h-6 w-6 ${star <= value ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground/30'}`} />
          </button>
        )
      })}
    </div>
  )
}

export default function InterviewWriteForm() {
  const router = useRouter()
  const [jobOptions, setJobOptions] = useState<string[]>([])
  const [companyNm, setCompanyNm] = useState('')
  const [jobNm, setJobNm] = useState('')
  const [careerLevel, setCareerLevel] = useState('')
  const [interviewDt, setInterviewDt] = useState('')
  const [stages, setStages] = useState<string[]>([])
  const [questionEdt, setQuestionEdt] = useState('')
  const [difficultyStar, setDifficultyStar] = useState(0)
  const [atmosphereEdt, setAtmosphereEdt] = useState('')
  const [resultCd, setResultCd] = useState('')
  const [proposedSalary, setProposedSalary] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { validate, fieldProps } = useFormErrors<FieldKey>()

  useEffect(() => {
    api
      .get<{ output: { recruitJobs: string[] } }>('/projects/forms')
      .then(({ data }) => setJobOptions(data.output.recruitJobs.filter((j) => j.trim().length > 0)))
      .catch(() => console.error('[InterviewWrite] 직무 목록 로드 실패'))
  }, [])

  const toggleStage = (stage: string) =>
    setStages((prev) => (prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]))

  const handleSubmit = async () => {
    const ok = validate([
      { key: 'companyNm', invalid: companyNm.trim().length === 0, message: '회사명을 입력해주세요.' },
      { key: 'jobNm', invalid: jobNm.trim().length === 0, message: '직무를 선택해주세요.' },
      { key: 'careerLevel', invalid: careerLevel.trim().length === 0, message: '경력을 선택해주세요.' },
    ])
    if (!ok) return

    setSubmitting(true)
    try {
      await api.post('/interviews', {
        companyNm: companyNm.trim(),
        jobNm,
        careerLevel,
        interviewDt: interviewDt || null,
        interviewStages: stages,
        questionEdt: questionEdt.trim() || null,
        difficultyStar: difficultyStar || null,
        atmosphereEdt: atmosphereEdt.trim() || null,
        resultCd: resultCd || null,
        proposedSalary: proposedSalary.trim() ? Number(proposedSalary) : null,
      })
      alertStore.show('면접후기가 등록되었습니다.', 'success')
      router.push('/interview')
    } catch {
      alertStore.show('면접후기 등록에 실패했습니다.', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">회사명</label>
          <Input {...fieldProps('companyNm')} value={companyNm} onChange={(e) => setCompanyNm(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">직무</label>
          <Select value={jobNm} onValueChange={(v) => setJobNm(v ?? '')} items={jobOptions.map((j) => ({ value: j, label: j }))}>
            <SelectTrigger {...fieldProps('jobNm')} className="w-full">
              <SelectValue placeholder="직무를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {jobOptions.map((job) => (
                <SelectItem key={job} value={job}>{job}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">경력</label>
          <Select value={careerLevel} onValueChange={(v) => setCareerLevel(v ?? '')} items={CAREER_LEVELS.map((c) => ({ value: c, label: c }))}>
            <SelectTrigger {...fieldProps('careerLevel')} className="w-full">
              <SelectValue placeholder="경력을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {CAREER_LEVELS.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">면접일</label>
          <Input type="date" value={interviewDt} onChange={(e) => setInterviewDt(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">면접단계</label>
        <div className="flex flex-wrap gap-1.5">
          {INTERVIEW_STAGES.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => toggleStage(stage)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                stages.includes(stage)
                  ? 'border-primary bg-primary/10 font-medium text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">면접 질문</label>
        <Textarea
          value={questionEdt}
          onChange={(e) => setQuestionEdt(e.target.value)}
          placeholder="받았던 질문을 적어주세요"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">면접난이도</label>
          <StarPicker value={difficultyStar} onChange={setDifficultyStar} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">결과</label>
          <Select value={resultCd} onValueChange={(v) => setResultCd(v ?? '')} items={RESULT_OPTIONS}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="선택 안 함" />
            </SelectTrigger>
            <SelectContent>
              {RESULT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">면접 분위기</label>
        <Input
          value={atmosphereEdt}
          onChange={(e) => setAtmosphereEdt(e.target.value)}
          placeholder="예: 편안한 분위기, 압박면접 등"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">제안 연봉 (선택, 만원)</label>
        <Input
          type="number"
          min={0}
          value={proposedSalary}
          onChange={(e) => setProposedSalary(e.target.value)}
          placeholder="예: 4500"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
        <Button type="button" disabled={submitting} onClick={handleSubmit}>
          {submitting ? '등록 중...' : '등록'}
        </Button>
      </div>
    </div>
  )
}
