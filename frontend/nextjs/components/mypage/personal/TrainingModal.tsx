'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useFormErrors } from '@/hooks/useFormErrors'

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

const todayMonth = () => new Date().toISOString().slice(0, 7)

export default function TrainingModal({ open, onClose, onComplete }: Props) {
  const [form, setForm] = useState<TrainingItem>(EMPTY)
  const { validate, fieldProps, clearField, clearAll } = useFormErrors<keyof TrainingItem>()
  const set = (k: keyof TrainingItem, v: string) => { clearField(k); setForm((p) => ({ ...p, [k]: v })) }

  const submit = () => {
    if (!validate([
      { key: 'trainingProgramNm', invalid: !form.trainingProgramNm.trim(), message: '교육명을 입력해주세요.' },
      { key: 'trainingInstitutionNm', invalid: !form.trainingInstitutionNm.trim(), message: '교육 기관을 입력하세요.' },
      { key: 'trainingStartDt', invalid: !form.trainingStartDt, message: '교육 시작월을 선택하세요.' },
      { key: 'trainingEndDt', invalid: !form.trainingEndDt, message: '교육 종료월을 선택하세요.' },
    ])) return
    onComplete(form)
    setForm(EMPTY)
    clearAll()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>교육 이력 추가하기</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1"><label className="text-sm font-medium">교육명</label><Input {...fieldProps('trainingProgramNm')} value={form.trainingProgramNm} onChange={(e) => set('trainingProgramNm', e.target.value)} placeholder="교육명" /></div>
            <div className="space-y-1"><label className="text-sm font-medium">교육 기관</label><Input {...fieldProps('trainingInstitutionNm')} value={form.trainingInstitutionNm} onChange={(e) => set('trainingInstitutionNm', e.target.value)} placeholder="교육 기관" /></div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">교육 기간</label>
            <div className="flex flex-wrap items-center gap-2">
              <Input {...fieldProps('trainingStartDt')} type="month" max={todayMonth()} className="min-w-0 flex-1" value={form.trainingStartDt} onChange={(e) => set('trainingStartDt', e.target.value)} />
              <span>~</span>
              <Input {...fieldProps('trainingEndDt')} type="month" max={todayMonth()} className="min-w-0 flex-1" value={form.trainingEndDt} onChange={(e) => set('trainingEndDt', e.target.value)} />
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
