// [Freelancer Service]
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { boardApi } from '../api/board-api'
import { BoardImportDialog } from './board-import-dialog'
import { BoardMutateDrawer } from './board-mutate-drawer'
import { useBoard } from './board-provider'
import { BoardViewDrawer } from './board-view-drawer'

export function BoardDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useBoard()

  const handleDelete = async () => {
    if (!currentRow) {
      return
    }

    if (!currentRow.mainType) {
      toast.error('데이터 형식이 올바르지 않아 삭제할 수 없습니다.')
      return
    }

    try {
      await boardApi.deleteBoard(currentRow.sq, currentRow.mainType)

      toast.success('게시글이 성공적으로 삭제되었습니다.')
      setOpen(null)
      setCurrentRow(null)

      // 목록 새로고침
      setTimeout(() => window.location.reload(), 500)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('삭제 API 호출 중 실제 에러 발생:', error)
      toast.error('삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      {/* [해결] 오타 '0' 제거 및 정상적인 props 전달 */}
      <BoardMutateDrawer
        key='board-create'
        open={open === 'create'}
        onOpenChange={() => setOpen(null)}
      />

      <BoardImportDialog
        key='board-import'
        open={open === 'import'}
        onOpenChange={() => setOpen(null)}
      />

      {currentRow && (
        <>
          <BoardMutateDrawer
            key={`board-update-${currentRow.sq}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='board-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(isOpen) => !isOpen && setOpen(null)}
            handleConfirm={handleDelete}
            className='max-w-md'
            title={`게시글 삭제: ${currentRow.sq}번`}
            desc={
              <>
                정말로 <strong>{currentRow.ttl}</strong> 게시글을
                삭제하시겠습니까? <br />이 작업은 되돌릴 수 없습니다.
              </>
            }
            confirmText='삭제'
          />

          <BoardViewDrawer
            open={open === 'view'}
            onOpenChange={() => setOpen(null)}
          />
        </>
      )}
    </>
  )
}
