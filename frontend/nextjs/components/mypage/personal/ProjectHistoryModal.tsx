'use client'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

export interface SkillTag {
  skillTagSq: number
  parentSkillTagSq?: number | null
  skillTagLvl?: number
  skillTagNm: string
}
export interface CommonCode { commonCodeSq: number; commonCodeNm: string }
export interface ProjectHistoryItem {
  projectHistoryClient: string
  projectHistoryTypeCd: number | null
  projectHistoryJobPositionTypeCd: number | null
  projectHistoryTask: string
  projectHistoryStartDt: string
  projectHistoryEndDt: string
  skillTagList: SkillTag[]
}

interface Props {
  open: boolean
  allSkills: SkillTag[]
  roleTypes: CommonCode[]
  taskTypes: CommonCode[]
  onClose: () => void
  onComplete: (item: ProjectHistoryItem) => void
}

const EMPTY = { name: '', startDate: '', endDate: '', client: '', workUnit: '' as number | '', role: '' as number | '' }

const today = () => new Date().toISOString().slice(0, 10)

export default function ProjectHistoryModal({ open, allSkills, roleTypes, taskTypes, onClose, onComplete }: Props) {
  const [form, setForm] = useState(EMPTY)
  const [selectedSkills, setSelectedSkills] = useState<SkillTag[]>([])
  const set = (k: keyof typeof EMPTY, v: string | number) => setForm((p) => ({ ...p, [k]: v }))

  // skillTagLvl===1 부모 기준 그룹핑 (Vue ProjectHistorySkillTagModal과 동일)
  const groups = useMemo(() => allSkills.filter((t) => t.skillTagLvl === 1).map((parent) => ({
    ...parent,
    children: allSkills.filter((t) => t.parentSkillTagSq === parent.skillTagSq),
  })), [allSkills])

  const toggle = (s: SkillTag) => setSelectedSkills((prev) => prev.some((x) => x.skillTagSq === s.skillTagSq) ? prev.filter((x) => x.skillTagSq !== s.skillTagSq) : [...prev, s])
  const isSel = (s: SkillTag) => selectedSkills.some((x) => x.skillTagSq === s.skillTagSq)

  const reset = () => { setForm(EMPTY); setSelectedSkills([]) }
  const close = () => { reset(); onClose() }

  const submit = () => {
    if (!form.name.trim()) return toast.error('프로젝트명을 입력해주세요.')
    if (!form.startDate) return toast.error('프로젝트 근무 기간을 선택하세요.')
    if (!form.client.trim()) return toast.error('고객사를 입력하세요.')
    if (form.workUnit === '') return toast.error('업무단을 선택하세요.')
    if (form.role === '') return toast.error('프로젝트 담당 역할을 선택하세요.')
    if (selectedSkills.length === 0) return toast.error('개발환경을 선택하세요.')
    onComplete({
      projectHistoryTask: form.name,
      projectHistoryStartDt: form.startDate,
      projectHistoryEndDt: form.endDate,
      projectHistoryClient: form.client,
      projectHistoryTypeCd: Number(form.workUnit),
      projectHistoryJobPositionTypeCd: Number(form.role),
      skillTagList: selectedSkills,
    })
    close()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close() }}>
      <DialogContent className="max-h-[90vh] w-[95vw] sm:max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>프로젝트 이력 추가하기</DialogTitle></DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold">프로젝트 내용</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1"><label className="text-sm">프로젝트명</label><Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="예: 금융 시스템 구축" /></div>
              <div className="space-y-1">
                <label className="text-sm">참여기간</label>
                <div className="flex flex-wrap items-center gap-1">
                  <Input type="date" max={today()} className="min-w-0 flex-1" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
                  <span>~</span>
                  <Input type="date" max={today()} className="min-w-0 flex-1" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1"><label className="text-sm">고객사</label><Input value={form.client} onChange={(e) => set('client', e.target.value)} placeholder="예: OO은행" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-sm">업무단</label>
                  <select value={form.workUnit} onChange={(e) => set('workUnit', e.target.value ? Number(e.target.value) : '')} className="h-9 w-full rounded-md border border-input px-2 text-sm cursor-pointer">
                    <option value="">선택</option>
                    {taskTypes.map((t) => <option key={t.commonCodeSq} value={t.commonCodeSq}>{t.commonCodeNm}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm">역할</label>
                  <select value={form.role} onChange={(e) => set('role', e.target.value ? Number(e.target.value) : '')} className="h-9 w-full rounded-md border border-input px-2 text-sm cursor-pointer">
                    <option value="">선택</option>
                    {roleTypes.map((r) => <option key={r.commonCodeSq} value={r.commonCodeSq}>{r.commonCodeNm}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">개발환경</p>
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
            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {selectedSkills.map((s) => <Badge key={s.skillTagSq} variant="secondary">{s.skillTagNm}</Badge>)}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit}>저장하기</Button>
          <Button variant="outline" onClick={close}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
