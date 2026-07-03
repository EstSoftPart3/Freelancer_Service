'use client'

// Vue 원본 SkillSelectModal.vue 이식 — 사용기술/우대기술 양쪽에서 재사용
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import type { RequiredSkillGroup } from '@/types'

interface Props {
  open: boolean
  title: string
  groups: RequiredSkillGroup[]
  selected: string[]
  onClose: () => void
  onConfirm: (selected: string[]) => void
}

export default function SkillSelectModal({ open, title, groups, selected, onClose, onConfirm }: Props) {
  const [local, setLocal] = useState<string[]>(selected)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (open) { setLocal(selected); setSearch('') }
  }, [open, selected])

  function toggle(name: string) {
    setLocal((prev) => prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name])
  }

  const kw = search.toLowerCase()
  const filteredGroups = groups
    .map((g) => ({ ...g, childSkillTagNms: g.childSkillTagNms.filter((s) => s.toLowerCase().includes(kw)) }))
    .filter((g) => g.childSkillTagNms.length > 0)

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="기술 검색" />

        <div className="max-h-96 space-y-4 overflow-y-auto">
          {filteredGroups.map((group) => (
            <div key={group.parentSkillTagNm} className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">{group.parentSkillTagNm}</p>
              <div className="flex flex-wrap gap-2">
                {group.childSkillTagNms.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(s)}
                    className={`flex cursor-pointer items-center gap-1.5 rounded border px-2.5 py-1.5 text-sm transition-colors ${
                      local.includes(s) ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent'
                    }`}
                  >
                    <img src={getSkillIconUrl(s)} alt={s} width={16} height={16} />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {filteredGroups.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</p>
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
