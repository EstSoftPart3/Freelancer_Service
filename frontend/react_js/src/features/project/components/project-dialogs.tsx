import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { projectApi } from '../api/project-api'
import { useProject } from './project-provider'
import { ProjectViewDrawer } from './project-view-drawer'

export function ProjectDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, refresh } = useProject()
  const [isBusy, setIsBusy] = useState(false)

  if (!currentRow) return null

  const close = () => {
    setOpen(null)
    setCurrentRow(null)
  }

  const handleDelete = async () => {
    try {
      setIsBusy(true)
      await projectApi.deleteProject(currentRow.projectSq)
      toast.success('프로젝트가 삭제되었습니다. 목록에서 "삭제 포함"을 켜면 복구할 수 있습니다.')
      close()
      refresh()
    } catch (_) {
      toast.error('삭제에 실패했습니다.')
    } finally {
      setIsBusy(false)
    }
  }

  const handleRestore = async () => {
    try {
      setIsBusy(true)
      await projectApi.restoreProject(currentRow.projectSq)
      toast.success('프로젝트가 복구되었습니다.')
      close()
      refresh()
    } catch (_) {
      toast.error('복구에 실패했습니다.')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <>
      <ProjectViewDrawer
        key={`view-${currentRow.projectSq}`}
        open={open === 'view'}
        onOpenChange={(v) => {
          setOpen(v ? 'view' : null)
          if (!v) setCurrentRow(null)
        }}
        currentRow={currentRow}
        onSaved={refresh}
      />

      <ConfirmDialog
        key={`delete-${currentRow.projectSq}`}
        open={open === 'delete'}
        onOpenChange={(v) => {
          setOpen(v ? 'delete' : null)
          if (!v) setCurrentRow(null)
        }}
        title='프로젝트 삭제'
        desc={`"${currentRow.projectTtl}" 공고를 삭제하시겠습니까? 서비스 목록에서 사라지지만 지원 이력은 남으며, 필요하면 되살릴 수 있습니다.`}
        cancelBtnText='취소'
        confirmText='삭제'
        destructive
        isLoading={isBusy}
        handleConfirm={handleDelete}
      />

      <ConfirmDialog
        key={`restore-${currentRow.projectSq}`}
        open={open === 'restore'}
        onOpenChange={(v) => {
          setOpen(v ? 'restore' : null)
          if (!v) setCurrentRow(null)
        }}
        title='프로젝트 복구'
        desc={`"${currentRow.projectTtl}" 공고를 다시 노출하시겠습니까?`}
        cancelBtnText='취소'
        confirmText='복구'
        isLoading={isBusy}
        handleConfirm={handleRestore}
      />
    </>
  )
}
