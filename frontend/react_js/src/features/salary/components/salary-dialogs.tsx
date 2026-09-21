import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { salaryApi, apiErrorMessage } from '../api/salary-api'
import { SalaryMutateDrawer } from './salary-mutate-drawer'
import { useSalary } from './salary-provider'
import { SalaryViewDrawer } from './salary-view-drawer'

export function SalaryDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useSalary()

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      await salaryApi.deleteSubmission(currentRow.salarySubmissionSq)
      toast.success('제출건이 성공적으로 삭제되었습니다.')
      setOpen(null)
      setCurrentRow(null)
      setTimeout(() => window.location.reload(), 500)
    } catch (err) {
      toast.error(apiErrorMessage(err, '삭제 중 오류가 발생했습니다.'))
    }
  }

  return (
    <>
      <SalaryMutateDrawer
        key='salary-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {currentRow && (
        <>
          <SalaryMutateDrawer
            key={`salary-update-${currentRow.salarySubmissionSq}`}
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
            key='salary-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(isOpen) => !isOpen && setOpen(null)}
            handleConfirm={handleDelete}
            className='max-w-md'
            title={`제출건 삭제: ${currentRow.salarySubmissionSq}번`}
            desc={
              <>
                정말로 <strong>{currentRow.jobNm} · {currentRow.regionNm}</strong> 제출건을
                삭제하시겠습니까?
                <br />통계 집계에서 제외되며(소프트 삭제), 목록에는 감사 목적으로 계속 표시됩니다.
              </>
            }
            confirmText='삭제'
          />

          <SalaryViewDrawer />
        </>
      )}
    </>
  )
}
