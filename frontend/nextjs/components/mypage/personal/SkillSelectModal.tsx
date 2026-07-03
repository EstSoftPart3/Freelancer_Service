'use client'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

export interface SkillTag {
  skillTagSq: number
  parentSkillTagSq?: number | null
  skillTagLvl?: number
  skillTagNm: string
}

interface Props {
  open: boolean
  allSkills: SkillTag[]
  selected: SkillTag[]
  onClose: () => void
  onConfirm: (skills: SkillTag[]) => void
}

export default function SkillSelectModal({ open, allSkills, selected, onClose, onConfirm }: Props) {
  const [picked, setPicked] = useState<SkillTag[]>(selected)

  // 모달이 열릴 때 현재 선택 상태로 초기화
  useEffect(() => { if (open) setPicked(selected) }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // skillTagLvl===1 부모 기준 분류 (Vue SkillTagModal과 동일)
  const groups = useMemo(() => allSkills.filter((t) => t.skillTagLvl === 1).map((parent) => ({
    ...parent,
    children: allSkills.filter((t) => t.parentSkillTagSq === parent.skillTagSq),
  })), [allSkills])

  const toggle = (s: SkillTag) => setPicked((prev) => prev.some((x) => x.skillTagSq === s.skillTagSq) ? prev.filter((x) => x.skillTagSq !== s.skillTagSq) : [...prev, s])
  const isSel = (s: SkillTag) => picked.some((x) => x.skillTagSq === s.skillTagSq)

  const confirm = () => { onConfirm(picked); onClose() }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-h-[90vh] w-[95vw] sm:max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>기술 선택</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {groups.map((g) => (
            <div key={g.skillTagSq} className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{g.skillTagNm}</p>
              <div className="flex flex-wrap gap-1.5">
                {g.children.map((s) => (
                  <button key={s.skillTagSq} type="button" onClick={() => toggle(s)}
                    className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs cursor-pointer ${isSel(s) ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent'}`}>
                    <img src={getSkillIconUrl(s.skillTagNm)} alt="" className="h-3.5 w-3.5" />
                    {s.skillTagNm}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={confirm}>선택 완료</Button>
          <Button variant="outline" onClick={onClose}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
