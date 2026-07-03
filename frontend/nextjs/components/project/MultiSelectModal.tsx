'use client'

// Vue 원본 WorkTypeModal.vue / JobModal.vue 이식 — 두 모달이 옵션 그리드 멀티셀렉트로 로직이 동일해 하나로 통합
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface Props {
  open: boolean
  title: string
  options: string[]
  selected: string[]
  onClose: () => void
  onConfirm: (selected: string[]) => void
}

export default function MultiSelectModal({ open, title, options, selected, onClose, onConfirm }: Props) {
  const [local, setLocal] = useState<string[]>(selected)

  useEffect(() => {
    if (open) setLocal(selected)
  }, [open, selected])

  function toggle(item: string) {
    setLocal((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item])
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`cursor-pointer rounded border px-3 py-1.5 text-sm transition-colors ${
                local.includes(opt) ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={() => { onConfirm(local); onClose() }}>선택 완료</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
