'use client'

// Vue 원본 WorkTypeModal.vue / JobModal.vue 이식 — 두 모달이 옵션 그리드 멀티셀렉트로 로직이 동일해 하나로 통합
//
// allowCustom 은 모집 직군에서만 켠다. 근무 형태(정규직/계약직/프리랜서)는 계약 구분이라
// 임의값이 들어갈 자리가 아니고, 백엔드도 공통코드 조회 결과를 그대로 쓰기 때문에 켜면 안 된다.
//
// allowCustom 일 때 상단 입력창은 SkillSelectModal(사용기술/우대기술)과 같은 역할이다 —
// 치는 즉시 목록이 걸러지고, 목록에 없으면 그 값을 그대로 「직접 추가」한다.
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
  allowCustom = false, customPlaceholder = '검색 · 목록에 없으면 직접 입력',
}: Props) {
  const [local, setLocal] = useState<string[]>(selected)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (open) { setLocal(selected); setSearch('') }
  }, [open, selected])

  function toggle(item: string) {
    setLocal((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item])
  }

  const keyword = search.trim()
  const kw = keyword.toLowerCase()
  // 검색은 직접 입력이 열린 모달(모집 직군)에서만 쓴다. 근무 형태는 항목이 셋뿐이라 거를 것이 없다.
  const filteredOptions = allowCustom ? options.filter((o) => o.toLowerCase().includes(kw)) : options

  // 이미 있는 이름을 또 만들지 않도록, 대소문자만 다른 경우까지 본다.
  const duplicated = [...options, ...local].some((s) => s.toLowerCase() === kw)
  const canAddCustom = keyword.length > 0 && keyword.length <= MAX_LEN && !duplicated

  function addCustom() {
    if (!canAddCustom) return
    setLocal((prev) => [...prev, keyword])
    setSearch('')
  }

  // 마스터에 없는 선택값 = 직접 입력한 것 (수정 모드에서 불러온 것 포함)
  const customSelected = local.filter((s) => !options.includes(s))

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {allowCustom && (
          <>
            <div className="flex gap-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value.slice(0, MAX_LEN))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
                placeholder={customPlaceholder}
              />
              <Button type="button" variant="outline" onClick={addCustom} disabled={!canAddCustom}>
                <Plus className="mr-1 h-3.5 w-3.5" />직접 추가
              </Button>
            </div>
            {keyword.length > 0 && duplicated && (
              <p className="text-xs text-muted-foreground">「{keyword}」는 이미 목록에 있습니다.</p>
            )}
          </>
        )}

        <div className="max-h-96 space-y-4 overflow-y-auto">
          {allowCustom && customSelected.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">직접 입력</p>
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
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {filteredOptions.map((opt) => (
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

          {filteredOptions.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              검색 결과가 없습니다.{canAddCustom && ' 「직접 추가」로 등록할 수 있습니다.'}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={() => { onConfirm(local); onClose() }}>선택 완료</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
