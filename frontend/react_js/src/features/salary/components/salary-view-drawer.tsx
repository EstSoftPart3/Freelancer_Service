import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { Loader2, Calendar, User } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { salaryApi, apiErrorMessage } from '../api/salary-api'
import { employmentTypeLabel } from '../data/constants'
import { type AdminSalary } from '../data/schema'
import { useSalary } from './salary-provider'

export function SalaryViewDrawer() {
  const { open, setOpen, currentRow } = useSalary()
  const [detail, setDetail] = useState<AdminSalary | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchDetail = useCallback(async () => {
    if (open === 'view' && currentRow?.salarySubmissionSq) {
      try {
        setIsLoading(true)
        setDetail(null) // 실패 시 이전 행의 상세가 남아 다른 제출건처럼 보이지 않게
        const response = await salaryApi.getSubmissionDetail(currentRow.salarySubmissionSq)
        setDetail(response.output)
      } catch (err) {
        toast.error(apiErrorMessage(err, '데이터를 불러오는 중 에러가 발생했습니다.'))
      } finally {
        setIsLoading(false)
      }
    }
  }, [open, currentRow])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  return (
    <Sheet open={open === 'view'} onOpenChange={() => setOpen(null)}>
      <SheetContent className='w-full overflow-y-auto sm:max-w-xl'>
        {isLoading ? (
          <div className='flex h-full items-center justify-center'>
            <Loader2 className='animate-spin' />
          </div>
        ) : detail ? (
          <div className='space-y-6 pt-6'>
            <SheetHeader className='border-b pb-6 text-left'>
              <div className='mb-2 flex gap-2'>
                <Badge variant='outline'>{employmentTypeLabel(detail.employmentType)}</Badge>
                <Badge variant='outline'>{detail.careerBucket}</Badge>
                {detail.isSeedYn === 'Y' && <Badge variant='secondary'>시드</Badge>}
                {detail.isDeletedYn === 'Y' && <Badge variant='destructive'>삭제됨</Badge>}
              </div>
              <SheetTitle className='text-2xl'>
                {detail.jobNm} · {detail.regionNm}
              </SheetTitle>
              <div className='mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
                <div className='flex items-center gap-1'>
                  <User size={14} />{' '}
                  {detail.isSeedYn === 'Y' ? (detail.seedNickname ?? '-') : (detail.userNickname ?? '탈퇴한 사용자')}
                </div>
                {detail.createdAtDtm && (
                  <div className='flex items-center gap-1'>
                    <Calendar size={14} /> {format(new Date(detail.createdAtDtm), 'yyyy-MM-dd HH:mm')}
                  </div>
                )}
              </div>
            </SheetHeader>

            <div className='space-y-4 pb-10'>
              <div className='grid grid-cols-2 gap-y-2 text-sm'>
                <span className='text-muted-foreground'>연봉</span>
                <span className='font-semibold'>{detail.annualSalary.toLocaleString()}만원</span>

                {(detail.skillTagNms ?? []).length > 0 && (
                  <>
                    <span className='text-muted-foreground'>기술스택</span>
                    <span className='flex flex-wrap gap-1'>
                      {detail.skillTagNms!.map((s) => (
                        <Badge key={s} variant='secondary'>
                          {s}
                        </Badge>
                      ))}
                    </span>
                  </>
                )}

                {detail.ageBand && (
                  <>
                    <span className='text-muted-foreground'>연령대</span>
                    <span>{detail.ageBand}</span>
                  </>
                )}
                {detail.educationNm && (
                  <>
                    <span className='text-muted-foreground'>학력</span>
                    <span>{detail.educationNm}</span>
                  </>
                )}
                {detail.companySize && (
                  <>
                    <span className='text-muted-foreground'>회사규모</span>
                    <span>{detail.companySize}</span>
                  </>
                )}
                {detail.companyType && (
                  <>
                    <span className='text-muted-foreground'>회사종류</span>
                    <span>{detail.companyType}</span>
                  </>
                )}
                {detail.positionNm && (
                  <>
                    <span className='text-muted-foreground'>직급</span>
                    <span>{detail.positionNm}</span>
                  </>
                )}
                {detail.teamSize && (
                  <>
                    <span className='text-muted-foreground'>팀 규모</span>
                    <span>{detail.teamSize}</span>
                  </>
                )}
                {detail.employmentSubtype && (
                  <>
                    <span className='text-muted-foreground'>고용상세</span>
                    <span>{detail.employmentSubtype}</span>
                  </>
                )}
                {detail.remoteType && (
                  <>
                    <span className='text-muted-foreground'>근무형태</span>
                    <span>{detail.remoteType}</span>
                  </>
                )}
                {detail.bonusAmount != null && (
                  <>
                    <span className='text-muted-foreground'>상여금</span>
                    <span>{detail.bonusAmount.toLocaleString()}만원</span>
                  </>
                )}
                {detail.stockOpt && (
                  <>
                    <span className='text-muted-foreground'>스톡옵션</span>
                    <span>{detail.stockOpt}</span>
                  </>
                )}
                {detail.jobChangeCount && (
                  <>
                    <span className='text-muted-foreground'>이직 횟수</span>
                    <span>{detail.jobChangeCount}</span>
                  </>
                )}
              </div>

              {(detail.companyNm || detail.prevAnnualSalary != null || detail.jobChangedYm) && (
                <>
                  <Separator />
                  <div className='space-y-1'>
                    <h4 className='font-semibold'>이직 동향 정보</h4>
                    <p className='text-sm text-muted-foreground'>
                      {detail.companyNm ?? '-'} · 직전연봉{' '}
                      {detail.prevAnnualSalary != null ? `${detail.prevAnnualSalary.toLocaleString()}만원` : '-'} ·{' '}
                      {detail.jobChangedYm ?? '-'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
