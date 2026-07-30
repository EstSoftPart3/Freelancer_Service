import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { baseUrl } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { vocApi } from '../api/voc-api'
import { type AdminVoc, type AdminVocDetail } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AdminVoc
  /** 답변 등록 후 목록의 처리 상태를 갱신하기 위해 호출한다 */
  onAnswered: () => void
}

export function VocViewDrawer({
  open,
  onOpenChange,
  currentRow,
  onAnswered,
}: Props) {
  const [detail, setDetail] = useState<AdminVocDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [answerTtl, setAnswerTtl] = useState('')
  const [answerBody, setAnswerBody] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    let alive = true
    const load = async () => {
      try {
        setIsLoading(true)
        const res = await vocApi.getVocDetail(currentRow.sq)
        if (alive) setDetail(res.output)
      } catch (_) {
        toast.error('상세 조회에 실패했습니다.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }
    load()
    // 드로어를 닫았다 다른 행으로 열면 이전 문의의 답변 초안이 남아 엉뚱한 글에 달릴 수 있다.
    setAnswerTtl(`[답변] ${currentRow.ttl}`)
    setAnswerBody('')
    return () => {
      alive = false
    }
  }, [open, currentRow.sq, currentRow.ttl])

  const handleSubmitAnswer = async () => {
    if (!answerTtl.trim()) {
      toast.error('답변 제목을 입력해주세요.')
      return
    }
    if (!answerBody.trim()) {
      toast.error('답변 내용을 입력해주세요.')
      return
    }
    try {
      setIsSaving(true)
      await vocApi.createAnswer(currentRow.sq, answerTtl, answerBody)
      toast.success('답변이 등록되었습니다. 문의자에게 알림이 발송됩니다.')
      setAnswerBody('')
      onAnswered()
      const res = await vocApi.getVocDetail(currentRow.sq)
      setDetail(res.output)
    } catch (_) {
      toast.error('답변 등록에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const answers = (detail?.answers ?? []).filter((a) => a.isDeletedYn !== 'Y')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex w-full flex-col gap-0 overflow-y-auto sm:max-w-2xl'>
        <SheetHeader className='space-y-1'>
          <div className='flex items-center gap-2'>
            {currentRow.secret && (
              <Badge variant='outline' className='gap-1 text-muted-foreground'>
                <Lock className='h-3 w-3' /> 비공개
              </Badge>
            )}
            <Badge
              className={
                answers.length > 0
                  ? 'border-none bg-green-600 text-white'
                  : 'border-none bg-amber-500 text-white'
              }
            >
              {answers.length > 0 ? '답변완료' : '미답변'}
            </Badge>
          </div>
          <SheetTitle className='text-start text-lg'>
            {currentRow.ttl}
          </SheetTitle>
          <p className='text-start text-xs text-muted-foreground'>
            {currentRow.userNickname ?? '탈퇴한 사용자'}
            {currentRow.userId ? ` (${currentRow.userId})` : ''} ·{' '}
            {currentRow.createdAt?.slice(0, 16).replace('T', ' ')}
          </p>
        </SheetHeader>

        <Separator className='my-4' />

        {isLoading ? (
          <div className='flex h-40 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-primary' />
          </div>
        ) : (
          <div className='space-y-6 px-1 pb-8'>
            {/* 문의 본문 — Quill HTML 이라 정제 후 렌더한다 */}
            <div
              className='prose prose-sm max-w-none dark:prose-invert'
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(detail?.description ?? ''),
              }}
            />

            {(detail?.attachments?.length ?? 0) > 0 && (
              <div>
                <h4 className='mb-1 text-sm font-semibold'>첨부파일</h4>
                <ul className='space-y-0.5'>
                  {detail?.attachments?.map((a) => (
                    <li key={a.fileSq}>
                      <a
                        href={`${baseUrl}/board/download/${a.fileSq}`}
                        className='text-sm text-blue-600 underline'
                      >
                        {a.fileOriginalNm}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />

            <div>
              <h4 className='mb-2 text-sm font-semibold'>
                등록된 답변 ({answers.length})
              </h4>
              {answers.length === 0 ? (
                <p className='rounded-md border bg-muted/40 px-3 py-4 text-center text-sm text-muted-foreground'>
                  아직 답변이 없습니다.
                </p>
              ) : (
                answers.map((a) => (
                  <article
                    key={a.sq ?? Math.random()}
                    className='mb-2 rounded-md border bg-muted/30 p-3'
                  >
                    <p className='font-medium'>{a.ttl}</p>
                    <p className='mt-0.5 text-[11px] text-muted-foreground'>
                      {a.userNickname} · {a.createdAt?.slice(0, 16).replace('T', ' ')}
                    </p>
                    <div
                      className='prose prose-sm mt-2 max-w-none dark:prose-invert'
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(a.description ?? ''),
                      }}
                    />
                  </article>
                ))
              )}
            </div>

            <Separator />

            {/* 답변 작성 — 등록 즉시 문의자에게 알림(2607)이 나간다 */}
            <div className='space-y-2'>
              <h4 className='text-sm font-semibold'>답변 작성</h4>
              <Input
                value={answerTtl}
                onChange={(e) => setAnswerTtl(e.target.value)}
                placeholder='답변 제목'
              />
              <Textarea
                value={answerBody}
                onChange={(e) => setAnswerBody(e.target.value)}
                placeholder='답변 내용을 입력하세요. 등록하면 문의자에게 알림이 발송됩니다.'
                rows={7}
              />
              <div className='flex justify-end'>
                <Button onClick={handleSubmitAnswer} disabled={isSaving}>
                  {isSaving && <Loader2 className='mr-1 h-4 w-4 animate-spin' />}
                  답변 등록
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
