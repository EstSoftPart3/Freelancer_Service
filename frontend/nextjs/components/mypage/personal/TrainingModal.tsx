'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

export interface TrainingItem {
  trainingProgramNm: string
  trainingInstitutionNm: string
  trainingStartDt: string // yyyy-MM
  trainingEndDt: string
}

interface Props {
  open: boolean
  onClose: () => void
  onComplete: (item: TrainingItem) => void
}

const EMPTY: TrainingItem = { trainingProgramNm: '', trainingInstitutionNm: '', trainingStartDt: '', trainingEndDt: '' }

export default function TrainingModal({ open, onClose, onComplete }: Props) {
  const [form, setForm] = useState<TrainingItem>(EMPTY)
  const set = (k: keyof TrainingItem, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const submit = () => {
    if (!form.trainingProgramNm.trim()) return toast.error('교육명을 입력해주세요.')
    if (!form.trainingInstitutionNm.trim()) return toast.error('교육 기관을 입력하세요.')
    if (!form.trainingStartDt) return toast.error('교육 시작월을 선택하세요.')
    if (!form.trainingEndDt) return toast.error('교육 종료월을 선택하세요.')
    onComplete(form)
    setForm(EMPTY)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>교육 이력 추가하기</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-sm font-medium">교육명</label><Input value={form.trainingProgramNm} onChange={(e) => set('trainingProgramNm', e.target.value)} placeholder="교육명" /></div>
            <div className="space-y-1"><label className="text-sm font-medium">교육 기관</label><Input value={form.trainingInstitutionNm} onChange={(e) => set('trainingInstitutionNm', e.target.value)} placeholder="교육 기관" /></div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">교육 기간</label>
            <div className="flex items-center gap-2">
              <Input type="month" max="9999-12" value={form.trainingStartDt} onChange={(e) => set('trainingStartDt', e.target.value)} onKeyDown={(e) => e.preventDefault()} />
              <span>~</span>
              <Input type="month" max="9999-12" value={form.trainingEndDt} onChange={(e) => set('trainingEndDt', e.target.value)} onKeyDown={(e) => e.preventDefault()} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit}>저장하기</Button>
          <Button variant="outline" onClick={onClose}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
