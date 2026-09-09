// [Freelancer Service]
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useReport } from './report-provider'
import { ReportViewDrawer } from './report-view-drawer'

export function ReportDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useReport()

  /**
   * 신고 내역 자체를 삭제하는 핸들러
   * (참고: 원문을 삭제하는 것이 아니라 '신고 접수 기록'을 삭제하는 기능입니다)
   */
  const handleDeleteReport = async () => {
    if (!currentRow?.reportSq) return

    try {
      // 만약 백엔드에 deleteReport 기록 삭제 API를 만들었다면 호출
      // 현재는 processReport로 처리하는 것이 주 로직이므로 예시로 둡니다.
      // await reportApi.deleteReport(currentRow.reportSq)

      toast.error('신고 기록 삭제는 준비중입니다.')
      setOpen(null)
      setCurrentRow(null)
    } catch (_) {
      toast.error('삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      {/* 1. 신고 상세 보기 및 처리 드로어 (가장 핵심) */}
      <ReportViewDrawer
        open={open === 'view'}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
      />

      {/* 2. 신고 내역 삭제 확인창 (필요 시) */}
      {currentRow && (
        <ConfirmDialog
          key='report-delete'
          destructive
          open={open === 'delete'}
          onOpenChange={(isOpen) => !isOpen && setOpen(null)}
          handleConfirm={handleDeleteReport}
          className='max-w-md'
          title={`신고 기록 삭제: ${currentRow.reportSq}번`}
          desc={
            <>
              정말로 <strong>{currentRow.targetTtl}</strong>에 대한 신고 기록을
              삭제하시겠습니까? <br />이 작업은 신고 기록 자체를 지우는 것이며
              원문에는 영향을 주지 않습니다.
            </>
          }
          confirmText='삭제'
        />
      )}
    </>
  )
}
