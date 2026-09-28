import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { interviewApi } from '../api/interview-api'
import { CAREER_LEVELS, INTERVIEW_STAGES, RESULT_OPTIONS } from '../data/constants'
import { type AdminInterview } from '../data/schema'

const schema = z.object({
  companyNm: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, '회사명을 입력해주세요.'),
  jobNm: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, '직무를 입력해주세요.'),
  careerLevel: z.string().refine((val) => val.trim().length > 0, '경력을 선택해주세요.'),
  interviewDt: z.string().optional(),
  questionEdt: z.string().optional(),
  atmosphereEdt: z.string().optional(),
  resultCd: z.string().optional(),
  proposedSalary: z.string().optional(),
})

type InterviewForm = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: AdminInterview
}

export function InterviewMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow
  const [stages, setStages] = useState<string[]>([])
  const [difficultyStar, setDifficultyStar] = useState(0)
  const [isFetching, setIsFetching] = useState(false)

  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting } } = useForm<InterviewForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyNm: '',
      jobNm: '',
      careerLevel: '',
      interviewDt: '',
      questionEdt: '',
      atmosphereEdt: '',
      resultCd: '',
      proposedSalary: '',
    },
  })

  const careerLevelValue = watch('careerLevel')
  const resultCdValue = watch('resultCd')

  useEffect(() => {
    const fetchDetail = async () => {
      if (!currentRow?.interviewReviewSq) return
      try {
        setIsFetching(true)
        const response = await interviewApi.getReviewDetail(currentRow.interviewReviewSq)
        const detail = response.output
        reset({
          companyNm: detail.companyNm,
          jobNm: detail.jobNm,
          careerLevel: detail.careerLevel,
          interviewDt: detail.interviewDt ?? '',
          questionEdt: detail.questionEdt ?? '',
          atmosphereEdt: detail.atmosphereEdt ?? '',
          resultCd: detail.resultCd ?? '',
          proposedSalary: detail.proposedSalary != null ? String(detail.proposedSalary) : '',
        })
        setStages(detail.interviewStages ?? [])
        setDifficultyStar(detail.difficultyStar ?? 0)
      } catch (_) {
        toast.error('데이터를 불러오는데 실패했습니다.')
        onOpenChange(false)
      } finally {
        setIsFetching(false)
      }
    }

    if (open) {
      if (isUpdate) {
        fetchDetail()
      } else {
        reset({
          companyNm: '',
          jobNm: '',
          careerLevel: '',
          interviewDt: '',
          questionEdt: '',
          atmosphereEdt: '',
          resultCd: '',
          proposedSalary: '',
        })
        setStages([])
        setDifficultyStar(0)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isUpdate, currentRow])

  const toggleStage = (stage: string) =>
    setStages((prev) => (prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]))

  const onSubmit = async (data: InterviewForm) => {
    if (!data.careerLevel) {
      toast.error('경력을 선택해주세요.')
      return
    }

    try {
      const payload = {
        companyNm: data.companyNm,
        jobNm: data.jobNm,
        careerLevel: data.careerLevel,
        interviewDt: data.interviewDt?.trim() || null,
        interviewStages: stages,
        questionEdt: data.questionEdt?.trim() || null,
        difficultyStar: difficultyStar || null,
        atmosphereEdt: data.atmosphereEdt?.trim() || null,
        resultCd: data.resultCd?.trim() || null,
        proposedSalary: data.proposedSalary?.trim() ? Number(data.proposedSalary) : null,
      }

      if (isUpdate && currentRow) {
        await interviewApi.updateReview(currentRow.interviewReviewSq, payload)
        toast.success('면접후기가 수정되었습니다.')
      } else {
        await interviewApi.createReview(payload)
        toast.success('새 면접후기가 등록되었습니다.')
      }

      onOpenChange(false)
      setTimeout(() => window.location.reload(), 500)
    } catch (_) {
      toast.error('저장에 실패했습니다.')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='overflow-y-auto sm:max-w-xl'>
        {isFetching ? (
          <div className='flex h-full flex-col items-center justify-center gap-2'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
            <p className='text-sm text-muted-foreground'>데이터 로딩 중...</p>
          </div>
        ) : (
          <>
            <SheetHeader className='text-left'>
              <SheetTitle>{isUpdate ? '면접후기 수정' : '면접후기 등록'}</SheetTitle>
              <SheetDescription>
                회사명·직무·경력은 필수 입력입니다.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit(onSubmit)} className='mt-6 space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='companyNm'>회사명</Label>
                  <Input id='companyNm' {...register('companyNm')} placeholder='회사명을 입력하세요.' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='jobNm'>직무</Label>
                  <Input id='jobNm' {...register('jobNm')} placeholder='직무를 입력하세요.' />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>경력</Label>
                  <Select
                    value={careerLevelValue}
                    onValueChange={(val) => setValue('careerLevel', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='경력 선택' />
                    </SelectTrigger>
                    <SelectContent>
                      {CAREER_LEVELS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='interviewDt'>면접일</Label>
                  <Input id='interviewDt' type='date' {...register('interviewDt')} />
                </div>
              </div>

              <div className='space-y-2'>
                <Label>면접단계</Label>
                <div className='flex flex-wrap gap-1.5'>
                  {INTERVIEW_STAGES.map((stage) => (
                    <button
                      key={stage}
                      type='button'
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

              <div className='space-y-2'>
                <Label htmlFor='questionEdt'>면접 질문</Label>
                <Textarea
                  id='questionEdt'
                  {...register('questionEdt')}
                  placeholder='받았던 질문을 입력해주세요.'
                  rows={4}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>면접난이도</Label>
                  <div className='flex items-center gap-1'>
                    {Array.from({ length: 5 }, (_, i) => {
                      const star = i + 1
                      return (
                        <button
                          key={star}
                          type='button'
                          onClick={() => setDifficultyStar(star)}
                          aria-label={`${star}점`}
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= difficultyStar
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-none text-muted-foreground/30'
                            }`}
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label>결과</Label>
                  <Select
                    value={resultCdValue}
                    onValueChange={(val) => setValue('resultCd', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='선택 안 함' />
                    </SelectTrigger>
                    <SelectContent>
                      {RESULT_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='atmosphereEdt'>면접 분위기</Label>
                <Input
                  id='atmosphereEdt'
                  {...register('atmosphereEdt')}
                  placeholder='예: 편안한 분위기, 압박면접 등'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='proposedSalary'>제안 연봉 (선택, 만원)</Label>
                <Input
                  id='proposedSalary'
                  type='number'
                  min={0}
                  {...register('proposedSalary')}
                  placeholder='예: 4500'
                />
              </div>

              <SheetFooter>
                <Button type='submit' disabled={isSubmitting}>{isUpdate ? '수정완료' : '등록하기'}</Button>
              </SheetFooter>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
