'use client'

// Vue 원본 InterviewTimeModal.vue(듀얼 월 달력 + 시간 그리드) 대신,
// 날짜 1개 선택(모집기간으로 min/max 제한) + 시간슬롯 토글 + "추가"로 간소화한 UX.
// 데이터 모양(date, times[])은 원본과 동일하게 유지해 백엔드/표시 로직에 영향 없음.
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

export interface InterviewTimeEntry {
  date: string
  times: string[]
}

interface Props {
  open: boolean
  minDate: string
  maxDate: string
  entries: InterviewTimeEntry[]
  onClose: () => void
  onConfirm: (entries: InterviewTimeEntry[]) => void
}

const TIME_SLOTS = Array.from({ length: 19 }, (_, i) => {
  const totalMinutes = 9 * 60 + i * 30
  const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
  const m = String(totalMinutes % 60).padStart(2, '0')
  return `${h}:${m}`
})

export default function InterviewTimeModal({ open, minDate, maxDate, entries, onClose, onConfirm }: Props) {
  const [local, setLocal] = useState<InterviewTimeEntry[]>(entries)
  const [date, setDate] = useState('')
  const [times, setTimes] = useState<string[]>([])

  useEffect(() => {
    if (open) { setLocal(entries); setDate(''); setTimes([]) }
  }, [open, entries])

  function toggleTime(t: string) {
    setTimes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].sort())
  }

  function addEntry() {
    if (!date || times.length === 0) return
    setLocal((prev) => [...prev.filter((e) => e.date !== date), { date, times }].sort((a, b) => a.date.localeCompare(b.date)))
    setDate('')
    setTimes([])
  }

  function removeEntry(d: string) {
    setLocal((prev) => prev.filter((e) => e.date !== d))
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>인터뷰 가능시간 추가</DialogTitle>
        </DialogHeader>

        <div className="space-y-1">
          <label className="text-sm font-semibold">날짜</label>
          <Input type="date" value={date} min={minDate} max={maxDate} onChange={(e) => { setDate(e.target.value); setTimes([]) }} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold">시간 (30분 단위)</label>
          <div className="flex flex-wrap gap-1.5">
            {TIME_SLOTS.map((t) => (
              <button
                key={t}
                type="button"
                disabled={!date}
                onClick={() => toggleTime(t)}
                className={`cursor-pointer rounded border px-2 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  times.includes(t) ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <Button size="sm" variant="outline" onClick={addEntry} disabled={!date || times.length === 0}>
          + 이 날짜 추가하기
        </Button>

        {local.length > 0 && (
          <div className="space-y-1.5 border-t pt-3">
            <p className="text-sm font-semibold">추가된 일정</p>
            <div className="flex flex-wrap gap-2">
              {local.map((e) => (
                <span key={e.date} className="flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs">
                  {e.date.replaceAll('-', '.')} ({e.times.length}건)
                  <button onClick={() => removeEntry(e.date)} className="text-muted-foreground hover:text-foreground">×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={() => { onConfirm(local); onClose() }}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
