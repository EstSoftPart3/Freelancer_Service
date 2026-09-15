'use client'
// Mirrors vue_js/src/fo/components/common/CommonModalContainer.vue
// Bootstrap modal stack → shadcn Dialog
import { useEffect, useState } from 'react'
import type { ModalConfig } from '@/types'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useModalStore } from '@/stores/modalStore'

export default function CommonModalContainer() {
  const { isOpen, getCurrentModal, closeModal } = useModalStore()
  const current = getCurrentModal()

  // isOpen이 false가 되는 순간 getCurrentModal()도 즉시 undefined가 되어(closeModal이
  // 스택을 같은 렌더에서 비움) 여기서 곧장 null을 반환하면 Dialog가 open=false 로
  // 렌더될 기회 없이 통째로 언마운트된다 — data-closed 페이드/줌아웃 애니메이션이 재생되지
  // 못하고 모달이 즉시 사라진다. 닫히는 동안 재생할 마지막 모달을 별도로 기억해둔다.
  const [renderedModal, setRenderedModal] = useState<ModalConfig | undefined>(current)
  useEffect(() => {
    if (current) setRenderedModal(current)
  }, [current])

  // ESC 키 닫기 — Dialog가 자체 처리하므로 별도 이벤트 불필요

  // 모달 열릴 때 body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!renderedModal) return null

  const { component: ModalComponent, props = {} } = renderedModal

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-2xl">
        <ModalComponent {...props} />
      </DialogContent>
    </Dialog>
  )
}
