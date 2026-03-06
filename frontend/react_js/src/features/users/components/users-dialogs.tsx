import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { userApi } from '../api/users-api'
// import { UsersInviteDialog } from './users-invite-dialog'
import { UsersMasterPasswordDialog } from './users-master-password-dialog'
import { UsersMutateDrawer } from './users-mutate-drawer'
import { useUsers } from './users-provider'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      await userApi.deleteUser(currentRow.userSq)
      toast.success('유저가 성공적으로 삭제되었습니다.')
      setOpen(null)
      setCurrentRow(null)
      setTimeout(() => window.location.reload(), 500)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('삭제 API 호출 중 실제 에러 발생:', error)
      toast.error('삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      <UsersMutateDrawer
        key='user-add'
        open={open === 'add'}
        onOpenChange={() => setOpen(null)}
      />

      {/* <UsersInviteDialog
        key='user-invite'
        open={open === 'invite'}
        onOpenChange={() => setOpen(null)}
      /> */}

      {currentRow && (
        <>
          <UsersMutateDrawer
            key={`user-edit-${currentRow.userId}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key={`user-delete-${currentRow.userId}`}
            destructive
            open={open === 'delete'}
            onOpenChange={(isOpen) => !isOpen && setOpen(null)}
            handleConfirm={handleDelete}
            className='max-w-md'
            title={`유저 삭제: ${currentRow.userSq}번`}
            desc={
              <>
                정말로 <strong>{currentRow.userNm}</strong> ({currentRow.userId}
                ) 유저를 삭제하시겠습니까? <br />이 작업은 되돌릴 수 없습니다.
              </>
            }
            confirmText='삭제'
          />

          <UsersMasterPasswordDialog
            key={`user-submit-${currentRow.userId}`}
            open={open === 'master-pw'}
            onOpenChange={() => {
              setOpen(null)
              setTimeout(() => setCurrentRow(null), 500)
            }}
          />
        </>
      )}
    </>
  )
}
