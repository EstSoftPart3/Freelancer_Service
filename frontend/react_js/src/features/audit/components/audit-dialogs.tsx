// [Freelancer Service] 활동 로그 조회 — Dialogs 관리
import { useAudit } from './audit-provider'
import { AuditViewDrawer } from './audit-view-drawer'

export function AuditDialogs() {
  const { open, setOpen, currentRow } = useAudit()

  return (
    <>
      {currentRow && (
        <AuditViewDrawer
          open={open === 'view'}
          onOpenChange={() => setOpen(null)}
        />
      )}
    </>
  )
}
