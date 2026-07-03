'use client'

// Vue 원본 CalendarModal.vue(좌우 듀얼 월 + 클릭 2회로 범위 선택) 이식 — 프로젝트 기간/모집 기간 공용
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (range: { start: string; end: string }) => void
}

interface MonthRef { month: number; year: number }

function pad(n: number) { return String(n).padStart(2, '0') }
function formatDate(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
function startOfDay(d: Date) { const c = new Date(d); c.setHours(0, 0, 0, 0); return c }
function isPastDate(d: Date) { return startOfDay(d).getTime() < startOfDay(new Date()).getTime() }

function generateCalendar(month: number, year: number) {
  const weeks: { date: Date; inMonth: boolean }[][] = []
  const firstDay = new Date(year, month, 1).getDay()
  let current = 1 - firstDay
  for (let w = 0; w < 6; w++) {
    const week: { date: Date; inMonth: boolean }[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(year, month, current)
      week.push({ date, inMonth: date.getMonth() === month })
      current++
    }
    weeks.push(week)
  }
  return weeks
}

export default function DateRangeModal({ open, onClose, onConfirm }: Props) {
  const today = new Date()
  const [leftMonth, setLeftMonth] = useState<MonthRef>({ month: today.getMonth(), year: today.getFullYear() })
  const [rightMonth, setRightMonth] = useState<MonthRef>({
    month: today.getMonth() === 11 ? 0 : today.getMonth() + 1,
    year: today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear(),
  })
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null])

  function prevMonth() {
    setLeftMonth((prev) => {
      const next = prev.month === 0 ? { month: 11, year: prev.year - 1 } : { month: prev.month - 1, year: prev.year }
      setRightMonth(next.month === 11 ? { month: 0, year: next.year + 1 } : { month: next.month + 1, year: next.year })
      return next
    })
  }
  function nextMonth() {
    setRightMonth((prev) => {
      const next = prev.month === 11 ? { month: 0, year: prev.year + 1 } : { month: prev.month + 1, year: prev.year }
      setLeftMonth(next.month === 0 ? { month: 11, year: next.year - 1 } : { month: next.month - 1, year: next.year })
      return next
    })
  }

  function selectDate(date: Date) {
    setRange(([s, e]) => {
      if (!s || (s && e)) return [date, null]
      return date < s ? [date, s] : [s, date]
    })
  }

  function dayClass(date: Date, inMonth: boolean) {
    const [s, e] = range
    const past = isPastDate(date)
    const t = startOfDay(date).getTime()
    const inRange = !!s && !!e && t >= startOfDay(s).getTime() && t <= startOfDay(e).getTime()
    const isStart = !!s && formatDate(date) === formatDate(s)
    const isEnd = !!e && formatDate(date) === formatDate(e)
    return cn(
      'h-9 w-9 text-center text-sm leading-9 rounded-md',
      !inMonth && 'invisible',
      inMonth && past && 'cursor-not-allowed text-muted-foreground/40',
      inMonth && !past && 'cursor-pointer hover:bg-accent',
      inMonth && (isStart || isEnd) && 'bg-primary text-primary-foreground font-bold hover:bg-primary',
      inMonth && inRange && !isStart && !isEnd && 'bg-primary/20',
    )
  }

  const [s, e] = range
  const selectedText = s && e ? `${formatDate(s)} ~ ${formatDate(e)}` : ''

  function handleConfirm() {
    if (!s || !e) return
    onConfirm({ start: formatDate(s), end: formatDate(e) })
    setRange([null, null])
    onClose()
  }

  const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

  function MonthGrid({ m, showPrev, showNext }: { m: MonthRef; showPrev?: boolean; showNext?: boolean }) {
    const weeks = generateCalendar(m.month, m.year)
    return (
      <div className="flex-1">
        <div className="mb-2 flex items-center justify-between">
          <button onClick={prevMonth} className={cn('px-2 text-sm', !showPrev && 'invisible')}>‹</button>
          <span className="text-sm font-semibold">{m.year}년 {m.month + 1}월</span>
          <button onClick={nextMonth} className={cn('px-2 text-sm', !showNext && 'invisible')}>›</button>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {WEEKDAYS.map((w) => <span key={w} className="text-xs text-muted-foreground">{w}</span>)}
          {weeks.flat().map((day, i) => (
            <button
              key={i}
              disabled={!day.inMonth || isPastDate(day.date)}
              onClick={() => selectDate(day.date)}
              className={dayClass(day.date, day.inMonth)}
            >
              {day.inMonth ? day.date.getDate() : ''}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>기간 선택</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6">
          <MonthGrid m={leftMonth} showPrev />
          <MonthGrid m={rightMonth} showNext />
        </div>

        <div className="flex items-center justify-between border-t pt-3 text-sm">
          <span className="font-medium">{selectedText ? `선택 일자: ${selectedText}` : '시작일과 종료일을 순서대로 클릭하세요.'}</span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { setRange([null, null]); onClose() }}>취소</Button>
          <Button onClick={handleConfirm} disabled={!s || !e}>적용</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
