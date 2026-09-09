'use client'
// 연봉계산기(그리고 이후 연봉순위표) 전용 기술스택 선택 모달.
// 목록 자체는 실제 기술 마스터(components/project/SkillSelectModal.tsx가 쓰는 것과 같은
// /projects/forms의 skills 그룹)를 그대로 쓰되, 화면은 연봉 화면 전용 라이트+골드 톤에 맞췄다.
import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import type { RequiredSkillGroup } from '@/types'

interface Props {
  open: boolean
  groups: RequiredSkillGroup[]
  selected: string[]
  onClose: () => void
  onConfirm: (selected: string[]) => void
}

export default function SkillPickerModal({ open, groups, selected, onClose, onConfirm }: Props) {
  const [local, setLocal] = useState<string[]>(selected)
  const [search, setSearch] = useState('')

  const kw = search.trim().toLowerCase()
  const filteredGroups = useMemo(() => {
    if (!kw) return groups
    return groups
      .map((g) => ({ ...g, childSkillTagNms: g.childSkillTagNms.filter((s) => s.toLowerCase().includes(kw)) }))
      .filter((g) => g.childSkillTagNms.length > 0)
  }, [groups, kw])

  function toggle(name: string) {
    setLocal((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) { setLocal(selected); setSearch('') }
        if (!o) onClose()
      }}
    >
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-xl">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle>기술스택 선택</DialogTitle>
        </DialogHeader>

        <label className="mx-5 mt-4 flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="기술 이름으로 검색 (예: Spring, React, AWS)"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>

        <div className="mt-4 flex-1 space-y-5 overflow-y-auto px-5 pb-2">
          {local.length > 0 && (
            <div>
              <p className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                선택됨 <span className="text-amber-600">{local.length}개</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {local.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(s)}
                    className="flex cursor-pointer items-center gap-1 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-transform hover:scale-105"
                  >
                    {s}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredGroups.map((g) => (
            <div key={g.parentSkillTagNm}>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">{g.parentSkillTagNm}</p>
              <div className="flex flex-wrap gap-1.5">
                {g.childSkillTagNms.map((s) => {
                  const active = local.includes(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggle(s)}
                      aria-pressed={active}
                      className={
                        active
                          ? 'rounded-full border border-indigo-500 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-transform hover:scale-105'
                          : 'cursor-pointer rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground/70 transition-transform hover:scale-105 hover:bg-muted'
                      }
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          {filteredGroups.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">검색 결과가 없어요.</p>
          )}
        </div>

        <DialogFooter className="border-t px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => { onConfirm(local); onClose() }}
            className="cursor-pointer rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            선택 완료
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
