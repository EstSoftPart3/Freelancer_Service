import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { voteApi } from '../api/vote-api'
import { VoteMutateDrawer } from './vote-mutate-drawer'
import { useVote } from './vote-provider'
import { VoteViewDrawer } from './vote-view-drawer'

export function VoteDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useVote()

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      await voteApi.deleteVote(currentRow.voteSq)
      toast.success('투표가 성공적으로 삭제되었습니다.')
      setOpen(null)
      setCurrentRow(null)
      setTimeout(() => window.location.reload(), 500)
    } catch (_) {
      toast.error('삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      <VoteMutateDrawer
        key='vote-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {currentRow && (
        <>
          <VoteMutateDrawer
            key={`vote-update-${currentRow.voteSq}`}
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
            key='vote-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(isOpen) => !isOpen && setOpen(null)}
            handleConfirm={handleDelete}
            className='max-w-md'
            title={`투표 삭제: ${currentRow.voteSq}번`}
            desc={
              <>
                정말로 <strong>{currentRow.voteTtl}</strong> 투표를 삭제하시겠습니까?
                <br />이 작업은 되돌릴 수 없습니다.
              </>
            }
            confirmText='삭제'
          />

          <VoteViewDrawer />
        </>
      )}
    </>
  )
}
