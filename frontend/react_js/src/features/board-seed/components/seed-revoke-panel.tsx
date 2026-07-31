import { useEffect, useState } from 'react'
import { AlertTriangle, Loader2, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { seedApi, type SeedRevokeResponse } from '../api/seed-api'
import {
  loadBatches,
  removeBatch,
  type SeedBatch,
} from '../data/seed-batch-store'

/**
 * 회수 패널.
 *
 * 두 가지 회수가 있다.
 *  - <b>정밀</b> — 등록 회차의 게시글 번호만 내린다. 그 회차만 되돌린다.
 *  - <b>광역</b> — 봇 계정이 쓴 <b>모든</b> 글과 댓글을 내린다. 남의 글에 단 댓글까지 걷어내고
 *    그 글의 댓글 수를 다시 센다.
 *
 * 어느 쪽이든 서버가 작성자 조건을 항상 걸기 때문에 실제 사용자의 글은 지워지지 않는다.
 */
export function SeedRevokePanel() {
  const [batches, setBatches] = useState<SeedBatch[]>([])
  const [preview, setPreview] = useState<SeedRevokeResponse | null>(null)
  const [target, setTarget] = useState<SeedBatch | 'wide' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    setBatches(loadBatches())
  }, [])

  const request = (t: SeedBatch | 'wide') =>
    t === 'wide' ? {} : { boardSqs: t.boardSqs }

  const handlePreview = async (t: SeedBatch | 'wide') => {
    setIsLoading(true)
    setTarget(t)
    setPreview(null)
    try {
      const res = await seedApi.revokePreview(request(t))
      setPreview(res.output)
      if (res.output.boards === 0 && res.output.comments === 0) {
        toast.message('회수할 대상이 없습니다.')
      }
    } catch {
      toast.error('회수 대상 조회에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevoke = async () => {
    if (!target) return
    setIsLoading(true)
    try {
      const res = await seedApi.revoke(request(target))
      const r = res.output
      toast.success(
        `게시글 ${r.boards}건, 답변 ${r.answers}건, 댓글 ${r.comments}건을 회수했습니다.`
      )
      if (r.recalculatedBoards > 0 || r.recalculatedAnswers > 0) {
        toast.message(
          `살아남은 글 ${r.recalculatedBoards}건, 답변 ${r.recalculatedAnswers}건의 댓글 수를 다시 셌습니다.`
        )
      }
      if (target !== 'wide') {
        setBatches(removeBatch(target.executedAt))
      } else {
        setBatches(loadBatches())
      }
      setPreview(null)
      setTarget(null)
    } catch {
      toast.error('회수에 실패했습니다.')
    } finally {
      setIsLoading(false)
      setConfirmOpen(false)
    }
  }

  return (
    <div className='grid gap-4'>
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base'>등록 회차별 회수</CardTitle>
          <p className='text-sm text-muted-foreground'>
            이 브라우저에서 등록한 기록입니다. 해당 회차의 글과 거기 딸린
            답변·댓글만 내려갑니다.
          </p>
        </CardHeader>
        <CardContent className='grid gap-2'>
          {batches.length === 0 && (
            <p className='text-sm text-muted-foreground'>
              기록이 없습니다. 아래 광역 회수로 봇 글 전체를 내릴 수 있습니다.
            </p>
          )}
          {batches.map((b) => (
            <div
              key={b.executedAt}
              className='flex flex-wrap items-center justify-between gap-2 rounded-md border p-3'
            >
              <div className='text-sm'>
                <div className='font-medium'>
                  {b.executedAt.replace('T', ' ').slice(0, 19)}
                </div>
                <div className='text-muted-foreground'>
                  게시글 {b.boards} · 답변 {b.answers} · 댓글 {b.comments}
                  <span className='ms-2 text-xs'>
                    (board_sq {b.boardSqs[0]}~{b.boardSqs[b.boardSqs.length - 1]}
                    )
                  </span>
                </div>
              </div>
              <Button
                variant='outline'
                size='sm'
                disabled={isLoading}
                onClick={() => handlePreview(b)}
              >
                <Undo2 className='me-1 h-4 w-4' />이 회차 회수
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base'>광역 회수</CardTitle>
          <p className='text-sm text-muted-foreground'>
            봇 계정이 쓴 <strong>모든</strong> 글·답변·댓글을 내립니다. 봇이 실제
            사용자의 글에 단 댓글도 걷어내고, 그 글의 댓글 수를 다시 셉니다.
          </p>
        </CardHeader>
        <CardContent>
          <Button
            variant='outline'
            disabled={isLoading}
            onClick={() => handlePreview('wide')}
          >
            {isLoading && target === 'wide' ? (
              <Loader2 className='me-1 h-4 w-4 animate-spin' />
            ) : (
              <Undo2 className='me-1 h-4 w-4' />
            )}
            봇 글 전체 회수 대상 확인
          </Button>
        </CardContent>
      </Card>

      {preview && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>회수 대상</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-3'>
            {preview.wide && (
              <Alert variant='destructive'>
                <AlertTriangle className='h-4 w-4' />
                <AlertTitle>광역 회수입니다</AlertTitle>
                <AlertDescription>
                  이번 회차뿐 아니라 봇 계정이 남긴 모든 것이 내려갑니다.
                </AlertDescription>
              </Alert>
            )}

            <div className='grid grid-cols-3 gap-3'>
              <Stat label='게시글' value={preview.boards} />
              <Stat label='답변' value={preview.answers} />
              <Stat label='댓글' value={preview.comments} />
            </div>

            {preview.samples.length > 0 && (
              <div className='grid gap-1 text-sm'>
                <span className='text-xs font-medium text-muted-foreground'>
                  대상 상위 {preview.samples.length}건
                </span>
                {preview.samples.map((s) => (
                  <div
                    key={s.boardSq}
                    className='flex flex-wrap justify-between gap-2 border-b py-1 last:border-0'
                  >
                    <span className='truncate'>{s.title}</span>
                    <span className='text-xs text-muted-foreground'>
                      {s.userNickname} ·{' '}
                      {s.createdAt.replace('T', ' ').slice(0, 16)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div>
              <Button
                variant='destructive'
                disabled={
                  isLoading ||
                  (preview.boards === 0 && preview.comments === 0)
                }
                onClick={() => setConfirmOpen(true)}
              >
                회수 실행
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        destructive
        isLoading={isLoading}
        title='회수하시겠습니까?'
        desc={
          preview ? (
            <>
              게시글 <strong>{preview.boards}</strong>건, 답변{' '}
              <strong>{preview.answers}</strong>건, 댓글{' '}
              <strong>{preview.comments}</strong>건이 목록에서 내려갑니다.
              {preview.wide && ' 봇 계정이 남긴 모든 것이 대상입니다.'}
              <br />
              논리 삭제라 데이터는 남지만 화면에서는 사라집니다.
            </>
          ) : (
            ''
          )
        }
        cancelBtnText='취소'
        confirmText='회수'
        handleConfirm={handleRevoke}
      />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className='rounded-md border p-3'>
      <div className='text-xs text-muted-foreground'>{label}</div>
      <div className='text-xl font-semibold'>{value}</div>
    </div>
  )
}
