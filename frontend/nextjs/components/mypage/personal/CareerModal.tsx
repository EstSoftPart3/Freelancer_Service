'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useFormErrors } from '@/hooks/useFormErrors'

export interface CareerItem {
  careerCompanyNm: string
  careerDepartmentNm: string
  careerPositionNm: string
  careerStartDt: string // yyyy-MM
  careerEndDt: string
}

interface Props {
  open: boolean
  onClose: () => void
  onComplete: (item: CareerItem) => void
}

const EMPTY: CareerItem = { careerCompanyNm: '', careerDepartmentNm: '', careerPositionNm: '', careerStartDt: '', careerEndDt: '' }

const todayMonth = () => new Date().toISOString().slice(0, 7)

export default function CareerModal({ open, onClose, onComplete }: Props) {
  const [form, setForm] = useState<CareerItem>(EMPTY)
  const { validate, fieldProps, clearField, clearAll } = useFormErrors<keyof CareerItem>()
  const set = (k: keyof CareerItem, v: string) => { clearField(k); setForm((p) => ({ ...p, [k]: v })) }

  const submit = () => {
    if (!validate([
      { key: 'careerCompanyNm', invalid: !form.careerCompanyNm.trim(), message: '회사명을 입력해주세요.' },
      { key: 'careerDepartmentNm', invalid: !form.careerDepartmentNm.trim(), message: '부서를 입력하세요.' },
      { key: 'careerPositionNm', invalid: !form.careerPositionNm.trim(), message: '직급을 입력하세요.' },
      { key: 'careerStartDt', invalid: !form.careerStartDt, message: '근무 기간을 선택하세요.' },
    ])) return
    onComplete(form)
    setForm(EMPTY)
    clearAll()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>회사 이력 추가하기</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1"><label className="text-sm font-medium">회사명</label><Input {...fieldProps('careerCompanyNm')} value={form.careerCompanyNm} onChange={(e) => set('careerCompanyNm', e.target.value)} placeholder="회사명" /></div>
            <div className="space-y-1"><label className="text-sm font-medium">부서</label><Input {...fieldProps('careerDepartmentNm')} value={form.careerDepartmentNm} onChange={(e) => set('careerDepartmentNm', e.target.value)} placeholder="부서" /></div>
          </div>
          <div className="space-y-1"><label className="text-sm font-medium">직급</label><Input {...fieldProps('careerPositionNm')} value={form.careerPositionNm} onChange={(e) => set('careerPositionNm', e.target.value)} placeholder="직급" /></div>
          <div className="space-y-1">
            <label className="text-sm font-medium">근무 기간</label>
            <div className="flex flex-wrap items-center gap-2">
              <Input {...fieldProps('careerStartDt')} type="month" max={todayMonth()} className="min-w-0 flex-1" value={form.careerStartDt} onChange={(e) => set('careerStartDt', e.target.value)} />
              <span>~</span>
              <Input type="month" max={todayMonth()} className="min-w-0 flex-1" value={form.careerEndDt} onChange={(e) => set('careerEndDt', e.target.value)} />
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
