import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { Loader2, Calendar, User, Eye, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { voteApi } from '../api/vote-api'
import { voteCategoryLabel } from '../data/vote-category'
import { type AdminVote } from '../data/schema'
import { useVote } from './vote-provider'

export function VoteViewDrawer() {
  const { open, setOpen, currentRow } = useVote()
  const [detail, setDetail] = useState<AdminVote | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchDetail = useCallback(async () => {
    if (open === 'view' && currentRow?.voteSq) {
      try {
        setIsLoading(true)
        const response = await voteApi.getVoteDetail(currentRow.voteSq)
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

  const totalVoteCnt = detail?.totalVoteCnt ?? 0

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
                <Badge variant='outline'>{voteCategoryLabel(detail.voteCategoryCd)}</Badge>
                {detail.voteIsDeletedYn === 'Y' && (
                  <Badge variant='destructive'>삭제됨</Badge>
                )}
                {detail.voteIsDeletedYn !== 'Y' && detail.closed && (
                  <Badge variant='secondary'>마감</Badge>
                )}
              </div>
              <SheetTitle className='text-2xl'>{detail.voteTtl}</SheetTitle>
              <div className='mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
                <div className='flex items-center gap-1'>
                  <User size={14} /> {detail.userNickname ?? '탈퇴한 사용자'}
                </div>
                <div className='flex items-center gap-1'>
                  <Calendar size={14} />{' '}
                  {format(new Date(detail.voteCreatedAtDtm), 'yyyy-MM-dd HH:mm')}
                </div>
                {detail.voteEndDt && (
                  <div className='flex items-center gap-1'>
                    마감: {format(new Date(detail.voteEndDt), 'yyyy-MM-dd HH:mm')}
                  </div>
                )}
                <div className='flex items-center gap-1'>
                  <Eye size={14} /> {detail.voteViewCnt}
                </div>
                <div className='flex items-center gap-1'>
                  <Users size={14} /> {totalVoteCnt}명 참여
                </div>
              </div>
            </SheetHeader>

            {detail.voteDescriptionEdt && (
              <p className='whitespace-pre-wrap text-sm'>{detail.voteDescriptionEdt}</p>
            )}

            <Separator />

            <div className='space-y-4 pb-10'>
              <h4 className='font-semibold'>선택지 결과</h4>
              <div className='space-y-3'>
                {(detail.options ?? [])
                  .slice()
                  .sort((a, b) => a.voteOptionOrder - b.voteOptionOrder)
                  .map((opt) => {
                    const ratio = totalVoteCnt > 0 ? (opt.voteCnt / totalVoteCnt) * 100 : 0
                    return (
                      <div key={opt.voteOptionSq} className='space-y-1'>
                        <div className='flex items-center justify-between text-sm'>
                          <span>{opt.voteOptionNm}</span>
                          <span className='text-muted-foreground'>
                            {opt.voteCnt}표 ({ratio.toFixed(0)}%)
                          </span>
                        </div>
                        <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
                          <div
                            className='h-full rounded-full bg-primary'
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
