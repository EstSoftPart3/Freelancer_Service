// 관리자 게시글(Q&A) 등록/수정 시 기술 태그 선택 — FO SkillTagModal과 동일한 /board/skill-tags 트리 재사용
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { boardApi, type RawSkillTag } from '../api/board-api'

export interface SkillTag {
  skillTagSq: number
  skillTagNm: string
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

export function SkillTagSelectModal({ open, selected, onClose, onConfirm }: Props) {
  const [groups, setGroups] = useState<Group[]>([])
  const [local, setLocal] = useState<SkillTag[]>(selected)

  useEffect(() => {
    if (open) setLocal(selected)
  }, [open, selected])

  useEffect(() => {
    if (!open || groups.length > 0) return
    boardApi
      .getSkillTags()
      .then((res) => {
        if (res.status !== 'OK' || !res.output) return
        const list = res.output
        const grouped = list
          .filter((t) => t.skillTagLvl === 1)
          .map((parent) => ({
            ...parent,
            children: list.filter((c) => c.parentSkillTagSq === parent.skillTagSq),
          }))
        setGroups(grouped)
      })
      .catch(() => toast.error('기술 태그 목록을 불러올 수 없습니다.'))
  }, [open, groups.length])

  const isSelected = (sq: number) => local.some((s) => s.skillTagSq === sq)

  function toggle(skill: RawSkillTag) {
    setLocal((prev) =>
      prev.some((s) => s.skillTagSq === skill.skillTagSq)
        ? prev.filter((s) => s.skillTagSq !== skill.skillTagSq)
        : [...prev, { skillTagSq: skill.skillTagSq, skillTagNm: skill.skillTagNm }]
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>기술 태그 선택</DialogTitle>
        </DialogHeader>

        <div className='max-h-96 space-y-4 overflow-y-auto'>
          {groups.length === 0 ? (
            <p className='py-8 text-center text-sm text-muted-foreground'>불러오는 중...</p>
          ) : (
            groups.map((group) => (
              <div key={group.skillTagSq} className='space-y-2'>
                <p className='text-xs font-semibold text-muted-foreground'>{group.skillTagNm}</p>
                <div className='grid grid-cols-3 gap-2'>
                  {group.children.map((skill) => (
                    <button
                      key={skill.skillTagSq}
                      type='button'
                      onClick={() => toggle(skill)}
                      className={`flex h-10 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-colors cursor-pointer ${
                        isSelected(skill.skillTagSq)
                          ? 'border-primary bg-primary/10'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <span className='truncate'>{skill.skillTagNm}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => { onConfirm(local); onClose() }}>선택 완료</Button>
          <Button variant='outline' onClick={onClose}>취소</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
