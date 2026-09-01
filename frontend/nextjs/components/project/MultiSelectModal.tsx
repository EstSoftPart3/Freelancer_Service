'use client'

// Vue 원본 WorkTypeModal.vue / JobModal.vue 이식 — 두 모달이 옵션 그리드 멀티셀렉트로 로직이 동일해 하나로 통합
//
// allowCustom 은 모집 직군에서만 켠다. 근무 형태(정규직/계약직/프리랜서)는 계약 구분이라
// 임의값이 들어갈 자리가 아니고, 백엔드도 공통코드 조회 결과를 그대로 쓰기 때문에 켜면 안 된다.
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface Props {
  open: boolean
  title: string
  options: string[]
  selected: string[]
  onClose: () => void
  onConfirm: (selected: string[]) => void
  /** 목록에 없는 값을 직접 입력할 수 있게 한다. 입력값은 해당 공고에만 저장된다 */
  allowCustom?: boolean
  customPlaceholder?: string
}

const MAX_LEN = 100

export default function MultiSelectModal({
  open, title, options, selected, onClose, onConfirm,
  allowCustom = false, customPlaceholder = '목록에 없으면 직접 입력',
}: Props) {
  const [local, setLocal] = useState<string[]>(selected)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (open) { setLocal(selected); setDraft('') }
  }, [open, selected])

  function toggle(item: string) {
    setLocal((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item])
  }

  const keyword = draft.trim()
  const duplicated = [...options, ...local].some((s) => s.toLowerCase() === keyword.toLowerCase())
  const canAddCustom = keyword.length > 0 && keyword.length <= MAX_LEN && !duplicated

  function addCustom() {
    if (!canAddCustom) return
    setLocal((prev) => [...prev, keyword])
    setDraft('')
  }

  // 마스터에 없는 선택값 = 직접 입력한 것 (수정 모드에서 불러온 것 포함)
  const customSelected = local.filter((s) => !options.includes(s))

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-lg">
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

        {allowCustom && (
          <div className="space-y-2 border-t pt-3">
            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, MAX_LEN))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
                placeholder={customPlaceholder}
              />
              <Button type="button" variant="outline" onClick={addCustom} disabled={!canAddCustom}>
                <Plus className="mr-1 h-3.5 w-3.5" />추가
              </Button>
            </div>
            {keyword.length > 0 && duplicated && (
              <p className="text-xs text-muted-foreground">「{keyword}」는 이미 목록에 있습니다.</p>
            )}
            {customSelected.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customSelected.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(s)}
                    title="클릭하여 삭제"
                    className="cursor-pointer rounded border border-dashed border-primary bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                  >
                    {s} ×
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={() => { onConfirm(local); onClose() }}>선택 완료</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
