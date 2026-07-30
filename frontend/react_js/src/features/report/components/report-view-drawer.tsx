// [Freelancer Service] - 수정본
import { useCallback, useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Loader2,
  User,
  XCircle,
  Trash2,
  FileText, // 아이콘 추가
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { COMMENT_TYPE_CD } from '@/features/board/data/board-type'
import { reportApi } from '../api/report-api'
import { type AdminReport } from '../data/schema'
import { useReport } from './report-provider'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportViewDrawer({ open, onOpenChange }: Props) {
  const { currentRow } = useReport()
  const [detail, setDetail] = useState<AdminReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [processDesc, setProcessDesc] = useState('')

  const fetchDetail = useCallback(async () => {
    if (open && currentRow?.reportSq) {
      try {
        setIsLoading(true)
        // [백엔드 연동] 상세 정보를 다시 조회하여 targetDescription(본문)을 가져옵니다.
        // 만약 리스트에서 이미 가져온다면 setDetail(currentRow)만 해도 무방합니다.
        const response = await reportApi.getReportDetail(currentRow.reportSq)
        if (response) {
          setDetail(response)
          setProcessDesc(response.processDesc || '')
        }
      } catch (_) {
        toast.error('상세 정보를 불러오는 데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }
  }, [open, currentRow])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const handleProcess = async (statusCd: number) => {
    if (!detail?.reportSq) return
    const statusNm = statusCd === 2902 ? '처리 완료(삭제)' : '반려'
    if (!confirm(`해당 신고를 [${statusNm}] 상태로 변경하시겠습니까?`)) return

    try {
      setIsLoading(true)
      await reportApi.processReport(detail.reportSq, statusCd, processDesc)
      toast.success(`신고가 ${statusNm} 되었습니다.`)
      onOpenChange(false)
      window.location.reload() // 리스트 갱신
    } catch (_) {
      toast.error('신고 처리에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full overflow-y-auto sm:max-w-2xl'>
        {isLoading ? (
          <div className='flex h-full items-center justify-center'>
            <Loader2 className='animate-spin' />
          </div>
        ) : detail ? (
          <div className='space-y-6 pt-6'>
            {/* 상단 상태 바 (기존과 동일) */}
            <div
              className={`flex items-center justify-between rounded-lg border p-4 ${
                detail.statusCd === 2901
                  ? 'border-amber-100 bg-amber-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className='flex items-center gap-2'>
                <AlertTriangle
                  size={18}
                  className={
                    detail.statusCd === 2901
                      ? 'text-amber-600'
                      : 'text-slate-400'
                  }
                />
                <span className='text-sm font-medium'>
                  상태: <strong>{detail.statusNm}</strong>
                </span>
              </div>
              <Badge variant='outline'>ID: {detail.reportSq}</Badge>
            </div>

            <SheetHeader className='border-b pb-6 text-left'>
              <div className='mb-2 flex items-center gap-2'>
                <Badge className='bg-red-500'>{detail.reasonNm}</Badge>
                <Badge variant='secondary'>{detail.targetTypeNm}</Badge>
              </div>
              <SheetTitle className='text-xl'>
                {detail.originTypeCd === COMMENT_TYPE_CD
                  ? '댓글 신고 내역'
                  : detail.targetTtl}
              </SheetTitle>
              <div className='mt-2 flex items-center gap-4 text-sm text-muted-foreground'>
                <div className='flex items-center gap-1'>
                  <User size={14} /> 신고자: {detail.reporterNm}
                </div>
                <div className='flex items-center gap-1'>
                  <Calendar size={14} /> {detail.createdAt}
                </div>
              </div>
            </SheetHeader>

            <div className='space-y-3 rounded-lg border-2 border-red-100 bg-red-50/30 p-4'>
              <div className='flex items-center gap-2 text-sm font-bold text-red-700'>
                <FileText size={16} />
                신고된 원문 내용 확인
              </div>
              <div className='rounded border bg-white p-4 text-sm leading-relaxed text-slate-800 shadow-sm'>
                {detail.originTypeCd !== COMMENT_TYPE_CD && (
                  <div className='mb-3 border-b pb-2 font-bold text-slate-900'>
                    [제목] {detail.targetTtl}
                  </div>
                )}

                {/* Quill HTML 데이터를 정제해서 렌더링 */}
                <div
                  className='quill-content break-words whitespace-normal'
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      detail.targetDescription ||
                        '원본 내용을 불러올 수 없습니다.'
                    ),
                  }}
                />
              </div>
              <p className='text-xs text-red-500/70'>
                * 위 내용은 신고 대상자가 작성한 실제 본문입니다.
              </p>
            </div>

            {/* 신고자가 작성한 사유 */}
            <div className='space-y-3'>
              <h4 className='text-sm font-semibold text-muted-foreground'>
                신고자 작성 상세 사유
              </h4>
              <div className='rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap text-slate-600 italic'>
                "{detail.content || '별도의 상세 사유가 입력되지 않았습니다.'}"
              </div>
            </div>

            <Separator />

            {/* 관리자 메모 및 버튼 (기존 유지) */}
            <div className='space-y-4'>
              <h4 className='flex items-center gap-2 font-semibold'>
                <CheckCircle2 size={16} /> 관리자 처리 메모
              </h4>
              <Textarea
                placeholder='처리 결과에 대한 메모를 입력하세요'
                value={processDesc}
                onChange={(e) => setProcessDesc(e.target.value)}
                className='min-h-[100px] text-sm'
                disabled={detail.statusCd !== 2901}
              />
            </div>

            {/* 버튼 섹션 */}
            {detail.statusCd === 2901 && (
              <div className='flex gap-3 pt-4'>
                <Button
                  className='flex-1 bg-red-600 hover:bg-red-700'
                  onClick={() => handleProcess(2902)}
                >
                  <Trash2 size={16} className='mr-2' /> 삭제 및 처리완료
                </Button>
                <Button
                  variant='outline'
                  className='flex-1'
                  onClick={() => handleProcess(2903)}
                >
                  <XCircle size={16} className='mr-2' /> 신고 반려
                </Button>
              </div>
            )}

            {detail.statusCd !== 2901 && (
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground'>
                <div className='flex items-center justify-between'>
                  <span>담당 관리자: {detail.processorNm}</span>
                  <span>처리일: {detail.processedAt}</span>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
