import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { vocApi } from '../api/voc-api'
import { useVoc } from './voc-provider'
import { VocViewDrawer } from './voc-view-drawer'

export function VocDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, refresh } = useVoc()
  const [isDeleting, setIsDeleting] = useState(false)

  if (!currentRow) return null

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await vocApi.deleteVoc(currentRow.sq)
      toast.success('삭제되었습니다.')
      setOpen(null)
      setCurrentRow(null)
      refresh()
    } catch (_) {
      toast.error('삭제에 실패했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <VocViewDrawer
        key={`view-${currentRow.sq}`}
        open={open === 'view'}
        onOpenChange={(v) => {
          setOpen(v ? 'view' : null)
          if (!v) setCurrentRow(null)
        }}
        currentRow={currentRow}
        onAnswered={refresh}
      />

      <ConfirmDialog
        key={`delete-${currentRow.sq}`}
        open={open === 'delete'}
        onOpenChange={(v) => {
          setOpen(v ? 'delete' : null)
          if (!v) setCurrentRow(null)
        }}
        title='문의 삭제'
        desc={`"${currentRow.ttl}" 문의를 삭제하시겠습니까? 작성자에게는 목록에서 사라집니다.`}
        cancelBtnText='취소'
        confirmText='삭제'
        destructive
        isLoading={isDeleting}
        handleConfirm={handleDelete}
      />
    </>
  )
}
