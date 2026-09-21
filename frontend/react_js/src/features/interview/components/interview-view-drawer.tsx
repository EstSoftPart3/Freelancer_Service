import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { Loader2, Calendar, User, Eye, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { interviewApi } from '../api/interview-api'
import { resultLabel } from '../data/constants'
import { type AdminInterview } from '../data/schema'
import { useInterview } from './interview-provider'

export function InterviewViewDrawer() {
  const { open, setOpen, currentRow } = useInterview()
  const [detail, setDetail] = useState<AdminInterview | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchDetail = useCallback(async () => {
    if (open === 'view' && currentRow?.interviewReviewSq) {
      try {
        setIsLoading(true)
        // 이전 행의 상세가 새 행 로딩·실패 화면에 그대로 비치지 않게 먼저 비운다.
        setDetail(null)
        const response = await interviewApi.getReviewDetail(currentRow.interviewReviewSq)
        setDetail(response.output)
      } catch (_) {
        toast.error('데이터를 불러오는 중 에러가 발생했습니다.')
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
                <Badge variant='outline'>{detail.careerLevel}</Badge>
                {detail.resultCd && <Badge variant='outline'>{resultLabel(detail.resultCd)}</Badge>}
                {detail.interviewIsDeletedYn === 'Y' && (
                  <Badge variant='destructive'>삭제됨</Badge>
                )}
              </div>
              <SheetTitle className='text-2xl'>
                {detail.companyNm} · {detail.jobNm}
              </SheetTitle>
              <div className='mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
                <div className='flex items-center gap-1'>
                  <User size={14} /> {detail.userNickname ?? '탈퇴한 사용자'}
                </div>
                <div className='flex items-center gap-1'>
                  <Calendar size={14} />{' '}
                  {format(new Date(detail.interviewCreatedAtDtm), 'yyyy-MM-dd HH:mm')}
                </div>
                {detail.interviewDt && (
                  <div className='flex items-center gap-1'>면접일: {detail.interviewDt}</div>
                )}
                <div className='flex items-center gap-1'>
                  <Eye size={14} /> {detail.interviewViewCnt}
                </div>
                {!!detail.difficultyStar && (
                  <div className='flex items-center gap-1'>
                    <Star size={14} className='fill-amber-400 text-amber-400' /> {detail.difficultyStar}
                  </div>
                )}
              </div>
              {(detail.interviewStages ?? []).length > 0 && (
                <div className='mt-2 flex flex-wrap gap-1.5'>
                  {detail.interviewStages!.map((stage) => (
                    <Badge key={stage} variant='secondary'>
                      {stage}
                    </Badge>
                  ))}
                </div>
              )}
            </SheetHeader>

            <div className='space-y-4 pb-10'>
              {detail.questionEdt && (
                <div className='space-y-1'>
                  <h4 className='font-semibold'>면접 질문</h4>
                  <p className='whitespace-pre-wrap text-sm'>{detail.questionEdt}</p>
                </div>
              )}

              {detail.atmosphereEdt && (
                <>
                  <Separator />
                  <div className='space-y-1'>
                    <h4 className='font-semibold'>면접 분위기</h4>
                    <p className='whitespace-pre-wrap text-sm'>{detail.atmosphereEdt}</p>
                  </div>
                </>
              )}

              {detail.proposedSalary != null && (
                <>
                  <Separator />
                  <div className='space-y-1'>
                    <h4 className='font-semibold'>제안 연봉</h4>
                    <p className='text-sm'>{detail.proposedSalary.toLocaleString()}만원</p>
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
