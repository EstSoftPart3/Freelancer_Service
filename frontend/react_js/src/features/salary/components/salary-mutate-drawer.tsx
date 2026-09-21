import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
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
import { salaryApi } from '../api/salary-api'
import {
  COMPANY_SIZES,
  COMPANY_TYPES,
  EMPLOYMENT_SUBTYPES,
  EMPLOYMENT_TYPES,
  JOB_CHANGE_COUNTS,
  POSITIONS,
  REMOTE_TYPES,
  STOCK_OPTS,
  TEAM_SIZES,
  YEAR_BUCKETS,
} from '../data/constants'
import { type AdminSalary } from '../data/schema'

const schema = z.object({
  employmentType: z.string().refine((val) => val.length > 0, '고용형태를 선택해주세요.'),
  jobNm: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, '직무를 입력해주세요.'),
  careerBucket: z.string().refine((val) => val.length > 0, '연차를 선택해주세요.'),
  regionNm: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, '지역을 입력해주세요.'),
  annualSalary: z.string().refine((val) => Number(val) > 0, '연봉을 입력해주세요.'),
  skillTagNmsRaw: z.string().optional(),
  ageBand: z.string().optional(),
  educationNm: z.string().optional(),
  companySize: z.string().optional(),
  companyType: z.string().optional(),
  positionNm: z.string().optional(),
  teamSize: z.string().optional(),
  employmentSubtype: z.string().optional(),
  remoteType: z.string().optional(),
  bonusAmount: z.string().optional(),
  stockOpt: z.string().optional(),
  jobChangeCount: z.string().optional(),
  companyNm: z.string().optional(),
  prevAnnualSalary: z.string().optional(),
  jobChangedYm: z.string().optional(),
  userSq: z.string().optional(),
  seedNickname: z.string().optional(),
})

type SalaryForm = z.infer<typeof schema>

const EMPTY_VALUES: SalaryForm = {
  employmentType: '',
  jobNm: '',
  careerBucket: '',
  regionNm: '',
  annualSalary: '',
  skillTagNmsRaw: '',
  ageBand: '',
  educationNm: '',
  companySize: '',
  companyType: '',
  positionNm: '',
  teamSize: '',
  employmentSubtype: '',
  remoteType: '',
  bonusAmount: '',
  stockOpt: '',
  jobChangeCount: '',
  companyNm: '',
  prevAnnualSalary: '',
  jobChangedYm: '',
  userSq: '',
  seedNickname: '',
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: AdminSalary
}

// 정적 목록 select 공용 헬퍼 — 게시판 BO에서 동적 fetch + programmatic setValue 조합이 Radix
// SelectValue 500 크래시를 냈던 함정을 피하려고 전부 하드코드 정적 목록만 쓴다(투표 BO와 동일 결정).
function StaticSelect({
  label,
  value,
  onChange,
  options,
  placeholder = '선택 안 함',
}: {
  label: string
  value: string
  onChange: (val: string) => void
  options: readonly string[]
  placeholder?: string
}) {
  return (
    <div className='space-y-2'>
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function SalaryMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow
  const [isFetching, setIsFetching] = useState(false)
  const [isSeedYn, setIsSeedYn] = useState<'Y' | 'N'>('N')

  const { register, handleSubmit, setValue, watch, reset } = useForm<SalaryForm>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  })

  const values = watch()

  useEffect(() => {
    const fetchDetail = async () => {
      if (!currentRow?.salarySubmissionSq) return
      try {
        setIsFetching(true)
        const response = await salaryApi.getSubmissionDetail(currentRow.salarySubmissionSq)
        const detail = response.output
        reset({
          ...EMPTY_VALUES,
          employmentType: detail.employmentType,
          jobNm: detail.jobNm,
          careerBucket: detail.careerBucket,
          regionNm: detail.regionNm,
          annualSalary: String(detail.annualSalary),
          skillTagNmsRaw: (detail.skillTagNms ?? []).join(', '),
          ageBand: detail.ageBand ?? '',
          educationNm: detail.educationNm ?? '',
          companySize: detail.companySize ?? '',
          companyType: detail.companyType ?? '',
          positionNm: detail.positionNm ?? '',
          teamSize: detail.teamSize ?? '',
          employmentSubtype: detail.employmentSubtype ?? '',
          remoteType: detail.remoteType ?? '',
          bonusAmount: detail.bonusAmount != null ? String(detail.bonusAmount) : '',
          stockOpt: detail.stockOpt ?? '',
          jobChangeCount: detail.jobChangeCount ?? '',
          companyNm: detail.companyNm ?? '',
          prevAnnualSalary: detail.prevAnnualSalary != null ? String(detail.prevAnnualSalary) : '',
          jobChangedYm: detail.jobChangedYm ?? '',
        })
        setIsSeedYn(detail.isSeedYn)
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
        reset(EMPTY_VALUES)
        setIsSeedYn('N')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isUpdate, currentRow])

  const onSubmit = async (data: SalaryForm) => {
    if (!isUpdate && isSeedYn === 'Y' && !data.seedNickname?.trim()) {
      toast.error('시드 닉네임을 입력해주세요.')
      return
    }
    if (!isUpdate && isSeedYn === 'N' && !data.userSq?.trim()) {
      toast.error('실데이터 등록은 회원 번호를 입력해주세요.')
      return
    }

    try {
      const payload = {
        userSq: isSeedYn === 'N' && data.userSq?.trim() ? Number(data.userSq) : null,
        isSeedYn,
        seedNickname: isSeedYn === 'Y' ? (data.seedNickname?.trim() || null) : null,
        employmentType: data.employmentType,
        jobNm: data.jobNm,
        careerBucket: data.careerBucket,
        regionNm: data.regionNm,
        annualSalary: Number(data.annualSalary),
        skillTagNms: (data.skillTagNmsRaw ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
        ageBand: data.ageBand?.trim() || null,
        educationNm: data.educationNm?.trim() || null,
        companySize: data.companySize?.trim() || null,
        companyType: data.companyType?.trim() || null,
        positionNm: data.positionNm?.trim() || null,
        teamSize: data.teamSize?.trim() || null,
        employmentSubtype: data.employmentSubtype?.trim() || null,
        remoteType: data.remoteType?.trim() || null,
        bonusAmount: data.bonusAmount?.trim() ? Number(data.bonusAmount) : null,
        stockOpt: data.stockOpt?.trim() || null,
        jobChangeCount: data.jobChangeCount?.trim() || null,
        companyNm: data.companyNm?.trim() || null,
        prevAnnualSalary: data.prevAnnualSalary?.trim() ? Number(data.prevAnnualSalary) : null,
        jobChangedYm: data.jobChangedYm?.trim() || null,
      }

      if (isUpdate && currentRow) {
        await salaryApi.updateSubmission(currentRow.salarySubmissionSq, payload)
        toast.success('제출건이 수정되었습니다.')
      } else {
        await salaryApi.createSubmission(payload)
        toast.success('새 제출건이 등록되었습니다.')
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
              <SheetTitle>{isUpdate ? '연봉 제출건 수정' : '연봉 제출건 등록'}</SheetTitle>
              <SheetDescription>
                고용형태·직무·연차·지역·연봉은 필수 입력입니다.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit(onSubmit)} className='mt-6 space-y-6'>
              {!isUpdate && (
                <div className='space-y-2 rounded-md border p-3'>
                  <Label>등록 유형</Label>
                  <div className='flex gap-2'>
                    <Button
                      type='button'
                      variant={isSeedYn === 'N' ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setIsSeedYn('N')}
                    >
                      실데이터(회원 지정)
                    </Button>
                    <Button
                      type='button'
                      variant={isSeedYn === 'Y' ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setIsSeedYn('Y')}
                    >
                      시드(닉네임 지정)
                    </Button>
                  </div>
                  {isSeedYn === 'N' ? (
                    <Input
                      placeholder='회원 번호(userSq)'
                      type='number'
                      {...register('userSq')}
                    />
                  ) : (
                    <Input
                      placeholder='시드 닉네임(예: 김**)'
                      {...register('seedNickname')}
                    />
                  )}
                </div>
              )}

              <div className='grid grid-cols-2 gap-4'>
                <StaticSelect
                  label='고용형태'
                  value={values.employmentType}
                  onChange={(val) => setValue('employmentType', val)}
                  options={EMPLOYMENT_TYPES.map((o) => o.value)}
                  placeholder='고용형태 선택'
                />
                <div className='space-y-2'>
                  <Label htmlFor='jobNm'>직무</Label>
                  <Input id='jobNm' {...register('jobNm')} placeholder='직무를 입력하세요.' />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <StaticSelect
                  label='연차'
                  value={values.careerBucket}
                  onChange={(val) => setValue('careerBucket', val)}
                  options={YEAR_BUCKETS}
                  placeholder='연차 선택'
                />
                <div className='space-y-2'>
                  <Label htmlFor='regionNm'>지역</Label>
                  <Input id='regionNm' {...register('regionNm')} placeholder='예: 서울' />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='annualSalary'>연봉(만원)</Label>
                  <Input id='annualSalary' type='number' min={0} {...register('annualSalary')} />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='skillTagNmsRaw'>기술스택(쉼표 구분)</Label>
                  <Input id='skillTagNmsRaw' {...register('skillTagNmsRaw')} placeholder='예: Java, React' />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='ageBand'>연령대</Label>
                  <Input id='ageBand' {...register('ageBand')} placeholder='예: 20대' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='educationNm'>학력</Label>
                  <Input id='educationNm' {...register('educationNm')} placeholder='예: 4년제' />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <StaticSelect
                  label='회사규모'
                  value={values.companySize ?? ''}
                  onChange={(val) => setValue('companySize', val)}
                  options={COMPANY_SIZES}
                />
                <StaticSelect
                  label='회사종류'
                  value={values.companyType ?? ''}
                  onChange={(val) => setValue('companyType', val)}
                  options={COMPANY_TYPES}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <StaticSelect
                  label='직급'
                  value={values.positionNm ?? ''}
                  onChange={(val) => setValue('positionNm', val)}
                  options={POSITIONS}
                />
                <StaticSelect
                  label='팀 규모'
                  value={values.teamSize ?? ''}
                  onChange={(val) => setValue('teamSize', val)}
                  options={TEAM_SIZES}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <StaticSelect
                  label='고용상세'
                  value={values.employmentSubtype ?? ''}
                  onChange={(val) => setValue('employmentSubtype', val)}
                  options={EMPLOYMENT_SUBTYPES}
                />
                <StaticSelect
                  label='근무형태'
                  value={values.remoteType ?? ''}
                  onChange={(val) => setValue('remoteType', val)}
                  options={REMOTE_TYPES}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='bonusAmount'>상여금(만원)</Label>
                  <Input id='bonusAmount' type='number' min={0} {...register('bonusAmount')} />
                </div>
                <StaticSelect
                  label='스톡옵션'
                  value={values.stockOpt ?? ''}
                  onChange={(val) => setValue('stockOpt', val)}
                  options={STOCK_OPTS}
                />
              </div>

              <StaticSelect
                label='이직 횟수'
                value={values.jobChangeCount ?? ''}
                onChange={(val) => setValue('jobChangeCount', val)}
                options={JOB_CHANGE_COUNTS}
              />

              <div className='space-y-2 rounded-md border p-3'>
                <Label className='text-muted-foreground'>이직 동향 정보(선택)</Label>
                <div className='grid grid-cols-3 gap-4'>
                  <Input {...register('companyNm')} placeholder='회사명' />
                  <Input {...register('prevAnnualSalary')} type='number' placeholder='직전 연봉(만원)' />
                  <Input {...register('jobChangedYm')} placeholder='이직연월(YYYY-MM)' />
                </div>
              </div>

              <SheetFooter>
                <Button type='submit'>{isUpdate ? '수정완료' : '등록하기'}</Button>
              </SheetFooter>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
