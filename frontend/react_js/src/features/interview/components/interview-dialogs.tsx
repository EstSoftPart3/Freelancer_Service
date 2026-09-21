import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { interviewApi } from '../api/interview-api'
import { InterviewMutateDrawer } from './interview-mutate-drawer'
import { useInterview } from './interview-provider'
import { InterviewViewDrawer } from './interview-view-drawer'

export function InterviewDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useInterview()

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      await interviewApi.deleteReview(currentRow.interviewReviewSq)
      toast.success('면접후기가 성공적으로 삭제되었습니다.')
      setOpen(null)
      setCurrentRow(null)
      setTimeout(() => window.location.reload(), 500)
    } catch (_) {
      toast.error('삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      <InterviewMutateDrawer
        key='interview-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {currentRow && (
        <>
          <InterviewMutateDrawer
            key={`interview-update-${currentRow.interviewReviewSq}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='interview-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(isOpen) => !isOpen && setOpen(null)}
            handleConfirm={handleDelete}
            className='max-w-md'
            title={`면접후기 삭제: ${currentRow.interviewReviewSq}번`}
            desc={
              <>
                정말로 <strong>{currentRow.companyNm} · {currentRow.jobNm}</strong> 면접후기를
                삭제하시겠습니까?
                <br />이 작업은 되돌릴 수 없습니다.
              </>
            }
            confirmText='삭제'
          />

          <InterviewViewDrawer />
        </>
      )}
    </>
  )
}
