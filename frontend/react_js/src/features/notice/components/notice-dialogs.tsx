// [Freelancer Service] 공지사항 관련
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { noticeApi } from '../api/notice-api'
// import { NoticeImportDialog } from './notice-import-dialog'
import { NoticeMutateDrawer } from './notice-mutate-drawer'
import { useNotice } from './notice-provider'
import { NoticeViewDrawer } from './notice-view-drawer'

// 추가

export function NoticeDialogs() {
  // context에서 필요한 정보들을 가져옵니다.
  const { open, setOpen, currentRow, setCurrentRow } = useNotice()

  // 삭제 실행 함수
  const handleDelete = async () => {
    if (!currentRow) return

    try {
      // 1. API 호출
      await noticeApi.deleteNotice(currentRow.sq)

      // 2. 성공 알림
      toast.success('공지사항이 성공적으로 삭제되었습니다.')

      // 3. 상태 초기화 및 닫기
      setOpen(null)
      setCurrentRow(null)

      // 4. 목록 새로고침 (가장 확실한 방법)
      setTimeout(() => window.location.reload(), 500)
    } catch (_) {
      toast.error('삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      {/* 공지사항 작성 (Create) */}
      <NoticeMutateDrawer
        key='notice-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {/* 공지사항 대량 가져오기 (Import)
      <NoticeImportDialog
        key='notice-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      /> */}

      {currentRow && (
        <>
          {/* 공지사항 수정 (Update) */}
          <NoticeMutateDrawer
            key={`notice-update-${currentRow.sq}`} // id 대신 sq 사용
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          {/* 공지사항 삭제 (Delete) */}
          <ConfirmDialog
            key='notice-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(isOpen) => !isOpen && setOpen(null)} // 닫기 로직 수정
            handleConfirm={handleDelete} // 위에서 만든 함수 연결
            className='max-w-md'
            title={`공지사항 삭제: ${currentRow.sq}번`}
            desc={
              <>
                정말로 <strong>{currentRow.ttl}</strong> 공지를
                삭제하시겠습니까? <br />이 작업은 되돌릴 수 없습니다.
              </>
            }
            confirmText='삭제'
          />
          {/* 상세보기 드로어 */}
          <NoticeViewDrawer />
        </>
      )}
    </>
  )
}
