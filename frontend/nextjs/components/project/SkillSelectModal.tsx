'use client'

// Vue 원본 SkillSelectModal.vue 이식 — 사용기술/우대기술 양쪽에서 재사용
//
// 목록에 없는 기술은 검색창에 그대로 치고 "직접 추가"할 수 있다. 직접 추가한 값은
// 기술 마스터(TBL_SKILL_TAG_C)에 새로 만들지 않고 그 공고에만 저장된다 —
// 오타나 표기 흔들림(react / React / 리액트)이 마스터에 쌓이지 않게 하기 위해서다.
import { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
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

const MAX_LEN = 50

export default function SkillSelectModal({ open, title, groups, selected, onClose, onConfirm }: Props) {
  const [local, setLocal] = useState<string[]>(selected)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (open) { setLocal(selected); setSearch('') }
  }, [open, selected])

  function toggle(name: string) {
    setLocal((prev) => prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name])
  }

  const masterNames = useMemo(
    () => new Set(groups.flatMap((g) => g.childSkillTagNms)),
    [groups],
  )
  // 마스터에 없는 선택값 = 직접 입력한 것 (수정 모드에서 불러온 것 포함)
  const customSelected = local.filter((s) => !masterNames.has(s))

  const keyword = search.trim()
  const kw = keyword.toLowerCase()
  const filteredGroups = groups
    .map((g) => ({ ...g, childSkillTagNms: g.childSkillTagNms.filter((s) => s.toLowerCase().includes(kw)) }))
    .filter((g) => g.childSkillTagNms.length > 0)

  // 이미 있는 이름을 또 만들지 않도록, 대소문자만 다른 경우까지 본다.
  const duplicated = [...masterNames, ...local].some((s) => s.toLowerCase() === kw)
  const canAddCustom = keyword.length > 0 && keyword.length <= MAX_LEN && !duplicated

  function addCustom() {
    if (!canAddCustom) return
    setLocal((prev) => [...prev, keyword])
    setSearch('')
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value.slice(0, MAX_LEN))}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
            placeholder="기술 검색 · 목록에 없으면 직접 입력"
          />
          <Button type="button" variant="outline" onClick={addCustom} disabled={!canAddCustom}>
            <Plus className="mr-1 h-3.5 w-3.5" />직접 추가
          </Button>
        </div>
        {keyword.length > 0 && duplicated && (
          <p className="text-xs text-muted-foreground">「{keyword}」는 이미 목록에 있습니다.</p>
        )}

        <div className="max-h-96 space-y-4 overflow-y-auto">
          {customSelected.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">직접 입력</p>
              <div className="flex flex-wrap gap-2">
                {customSelected.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(s)}
                    title="클릭하여 삭제"
                    className="flex cursor-pointer items-center gap-1.5 rounded border border-dashed border-primary bg-primary px-2.5 py-1.5 text-sm text-primary-foreground"
                  >
                    {s} ×
                  </button>
                ))}
              </div>
            </div>
          )}

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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getSkillIconUrl(s)} alt={s} width={16} height={16} />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {filteredGroups.length === 0 && (
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
