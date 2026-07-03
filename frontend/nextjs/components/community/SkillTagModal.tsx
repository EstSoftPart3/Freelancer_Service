'use client'

// Vue 원본 community/SkillTagModal.vue 이식 — /board/skill-tags 트리에서 기술태그 선택
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import type { SkillTag } from '@/types'

interface RawSkillTag extends SkillTag {
  skillTagLvl: number
  parentSkillTagSq: number | null
}

interface Group extends RawSkillTag {
  children: RawSkillTag[]
}

interface Props {
  open: boolean
  selected: SkillTag[]
  onClose: () => void
  onConfirm: (skills: SkillTag[]) => void
}

export default function SkillTagModal({ open, selected, onClose, onConfirm }: Props) {
  const [groups, setGroups] = useState<Group[]>([])
  const [local, setLocal] = useState<SkillTag[]>(selected)

  useEffect(() => {
    if (open) setLocal(selected)
  }, [open, selected])

  useEffect(() => {
    if (!open || groups.length > 0) return
    api
      .get<{ status: string; output: RawSkillTag[] }>('/board/skill-tags')
      .then(({ data }) => {
        if (data.status !== 'OK') return
        const list = data.output
        const grouped = list
          .filter((t) => t.skillTagLvl === 1)
          .map((parent) => ({
            ...parent,
            children: list.filter((c) => c.parentSkillTagSq === parent.skillTagSq),
          }))
        setGroups(grouped)
      })
      .catch(() => alertStore.show('기술 태그 리스트를 불러올 수 없습니다.', 'danger'))
  }, [open, groups.length])

  const isSelected = (sq: number) => local.some((s) => s.skillTagSq === sq)

  function toggle(skill: RawSkillTag) {
    setLocal((prev) =>
      prev.some((s) => s.skillTagSq === skill.skillTagSq)
        ? prev.filter((s) => s.skillTagSq !== skill.skillTagSq)
        : [...prev, { skillTagSq: skill.skillTagSq, skillTagNm: skill.skillTagNm }],
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>기술 선택</DialogTitle>
        </DialogHeader>

        <div className="max-h-96 space-y-4 overflow-y-auto">
          {groups.map((group) => (
            <div key={group.skillTagSq} className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">{group.skillTagNm}</p>
              <div className="grid grid-cols-3 gap-2">
                {group.children.map((skill) => (
                  <button
                    key={skill.skillTagSq}
                    type="button"
                    onClick={() => toggle(skill)}
                    className={`flex h-12 items-center justify-center gap-2 rounded-lg border px-2 text-sm font-medium transition-colors ${
                      isSelected(skill.skillTagSq)
                        ? 'border-primary bg-primary/10'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <img src={getSkillIconUrl(skill.skillTagNm)} alt="" className="h-5 w-5" />
                    <span className="truncate">{skill.skillTagNm}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={() => { onConfirm(local); onClose() }}>선택 완료</Button>
          <Button variant="outline" onClick={onClose}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
