'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

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
  const set = (k: keyof CareerItem, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const submit = () => {
    if (!form.careerCompanyNm.trim()) return toast.error('회사명을 입력해주세요.')
    if (!form.careerDepartmentNm.trim()) return toast.error('부서를 입력하세요.')
    if (!form.careerPositionNm.trim()) return toast.error('직급을 입력하세요.')
    if (!form.careerStartDt) return toast.error('근무 기간을 선택하세요.')
    onComplete(form)
    setForm(EMPTY)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>회사 이력 추가하기</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1"><label className="text-sm font-medium">회사명</label><Input value={form.careerCompanyNm} onChange={(e) => set('careerCompanyNm', e.target.value)} placeholder="회사명" /></div>
            <div className="space-y-1"><label className="text-sm font-medium">부서</label><Input value={form.careerDepartmentNm} onChange={(e) => set('careerDepartmentNm', e.target.value)} placeholder="부서" /></div>
          </div>
          <div className="space-y-1"><label className="text-sm font-medium">직급</label><Input value={form.careerPositionNm} onChange={(e) => set('careerPositionNm', e.target.value)} placeholder="직급" /></div>
          <div className="space-y-1">
            <label className="text-sm font-medium">근무 기간</label>
            <div className="flex flex-wrap items-center gap-2">
              <Input type="month" max={todayMonth()} className="min-w-0 flex-1" value={form.careerStartDt} onChange={(e) => set('careerStartDt', e.target.value)} />
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
