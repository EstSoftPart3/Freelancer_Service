'use client'
// Mirrors vue_js/src/fo/components/common/CommonModalContainer.vue
// Bootstrap modal stack → shadcn Dialog
import { useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useModalStore } from '@/stores/modalStore'

export default function CommonModalContainer() {
  const { isOpen, getCurrentModal, closeModal } = useModalStore()
  const current = getCurrentModal()

  // ESC 키 닫기 — Dialog가 자체 처리하므로 별도 이벤트 불필요

  // 모달 열릴 때 body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!current) return null

  const { component: ModalComponent, props = {} } = current

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-2xl">
        <ModalComponent {...props} />
      </DialogContent>
    </Dialog>
  )
}
