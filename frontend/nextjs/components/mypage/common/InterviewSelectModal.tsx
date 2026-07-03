'use client'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import api from '@/lib/api'

export interface InterviewTime {
  interviewTimeSq: number
  interviewTime: string // "YYYY-MM-DDTHH:mm[:ss]"
}

interface Props {
  open: boolean
  applicationSq: number | null
  interviewTimes: InterviewTime[]
  onClose: () => void
  onConfirm: () => void
}

export default function InterviewSelectModal({ open, applicationSq, interviewTimes, onClose, onConfirm }: Props) {
  const [selectedSq, setSelectedSq] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // 날짜별 그룹핑 + 시간 정렬
  const grouped = useMemo(() => {
    const map = new Map<string, InterviewTime[]>()
    interviewTimes
      .filter((t) => typeof t.interviewTime === 'string')
      .forEach((t) => {
        const [date] = t.interviewTime.split('T')
        if (!map.has(date)) map.set(date, [])
        map.get(date)!.push(t)
      })
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, slots]) => ({ date, slots: slots.sort((a, b) => a.interviewTime.localeCompare(b.interviewTime)) }))
  }, [interviewTimes])

  const isPast = (iso: string) => new Date(iso).getTime() < Date.now()

  async function confirm() {
    if (selectedSq == null || applicationSq == null) { toast.error('날짜와 시간을 선택해주세요.'); return }
    setSubmitting(true)
    try {
      await api.patch(`/projects/applications/interviews/${selectedSq}`, { applicationSq })
      toast.success('인터뷰 시간 선택에 성공하였습니다.')
      onConfirm()
      onClose()
    } catch {
      toast.error('인터뷰 시간 선택에 실패하였습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setSelectedSq(null); onClose() } }}>
      <DialogContent className="max-h-[90vh] w-[95vw] sm:max-w-lg overflow-y-auto">
        <DialogHeader><DialogTitle>인터뷰 시간 선택</DialogTitle></DialogHeader>
        {grouped.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">선택 가능한 인터뷰 시간이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {grouped.map(({ date, slots }) => (
              <div key={date} className="space-y-1">
                <p className="text-sm font-semibold">{date}</p>
                <div className="flex flex-wrap gap-1.5">
                  {slots.map((s) => {
                    const past = isPast(s.interviewTime)
                    const time = s.interviewTime.split('T')[1]?.substring(0, 5) ?? ''
                    return (
                      <button key={s.interviewTimeSq} type="button" disabled={past}
                        onClick={() => setSelectedSq(s.interviewTimeSq)}
                        className={`rounded-md border px-3 py-1 text-sm ${past ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'} ${selectedSq === s.interviewTimeSq ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent'}`}>
                        {time}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button onClick={confirm} disabled={submitting || selectedSq == null}>선택 완료</Button>
          <Button variant="outline" onClick={onClose}>취소</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
