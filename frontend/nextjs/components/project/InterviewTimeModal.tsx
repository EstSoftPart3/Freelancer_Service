'use client'

// 인터뷰 가능시간 선택 — 왼쪽에 날짜 목록, 오른쪽에 시간 그리드를 둔 2단 구성.
//
// 이전 버전은 "날짜 고르고 → 시간 찍고 → 추가" 순서라, 추가하고 나면 자기가 무슨 시각을
// 골랐는지 볼 수 없었고(칩에 "(3건)" 만 표시), 같은 날짜를 다시 고르면 기존 선택이 통째로
// 덮어써졌다. 여기서는 날짜를 클릭하면 그 날의 선택 상태가 오른쪽 그리드에 그대로 뜨고,
// 시간을 누르는 즉시 반영된다.
//
// 지난 시각은 고를 수 없다 — 8/31 오후 3시에 8/31 오전 9시 인터뷰를 등록하던 문제.
import { useState, useEffect, useMemo } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

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

/** Date → 'YYYY-MM-DD' (로컬 기준). toISOString 은 UTC 라 KST 에서 하루 밀린다. */
function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 현재 시각 'HH:MM' (로컬). 슬롯 문자열과 그대로 사전순 비교할 수 있다. */
function nowHhMm(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function InterviewTimeModal({ open, minDate, maxDate, entries, onClose, onConfirm }: Props) {
  const [local, setLocal] = useState<InterviewTimeEntry[]>(entries)
  const [activeDate, setActiveDate] = useState('')
  const [newDate, setNewDate] = useState('')
  // 모달을 연 시점으로 고정한다. 매 렌더마다 new Date() 를 부르면 슬롯이 렌더 중에 바뀐다.
  const [openedAt, setOpenedAt] = useState(() => ({ today: toDateStr(new Date()), now: nowHhMm() }))

  useEffect(() => {
    if (!open) return
    setLocal(entries)
    setActiveDate(entries[0]?.date ?? '')
    setNewDate('')
    setOpenedAt({ today: toDateStr(new Date()), now: nowHhMm() })
  }, [open, entries])

  // 모집 시작일이 과거인 공고를 수정할 때, 과거 날짜가 그대로 선택 가능해지지 않도록 오늘로 당긴다.
  const pickerMin = minDate && minDate > openedAt.today ? minDate : openedAt.today

  const activeTimes = useMemo(
    () => local.find((e) => e.date === activeDate)?.times ?? [],
    [local, activeDate],
  )

  function addDate(date: string) {
    if (!date) return
    setLocal((prev) => (prev.some((e) => e.date === date)
      ? prev
      : [...prev, { date, times: [] }].sort((a, b) => a.date.localeCompare(b.date))))
    setActiveDate(date)
    setNewDate('')
  }

  function toggleTime(t: string) {
    if (!activeDate) return
    setLocal((prev) => prev.map((e) => {
      if (e.date !== activeDate) return e
      const times = e.times.includes(t)
        ? e.times.filter((x) => x !== t)
        : [...e.times, t].sort()
      return { ...e, times }
    }))
  }

  function removeDate(date: string) {
    setLocal((prev) => prev.filter((e) => e.date !== date))
    if (activeDate === date) setActiveDate('')
  }

  /** 지난 시각인가 — 오늘 날짜일 때만 현재 시각과 비교한다. */
  function isPastSlot(t: string): boolean {
    if (activeDate !== openedAt.today) return false
    return t <= openedAt.now
  }

  function handleSave() {
    // 시간을 하나도 고르지 않은 날짜는 저장하지 않는다.
    onConfirm(local.filter((e) => e.times.length > 0))
    onClose()
  }

  const totalSlots = local.reduce((sum, e) => sum + e.times.length, 0)

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>인터뷰 가능시간</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,11rem)_1fr]">
          {/* 왼쪽 — 날짜 목록 */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">날짜</p>
            <div className="space-y-1">
              {local.map((e) => (
                <div
                  key={e.date}
                  className={cn(
                    'flex items-center justify-between gap-1 rounded border px-2 py-1.5 text-xs',
                    e.date === activeDate ? 'border-primary bg-primary/10' : 'hover:bg-accent',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setActiveDate(e.date)}
                    className="min-w-0 flex-1 cursor-pointer text-left"
                  >
                    <span className="block truncate">{e.date.replaceAll('-', '.')}</span>
                    <span className={cn('text-[10px]', e.times.length === 0 ? 'text-destructive' : 'text-muted-foreground')}>
                      {e.times.length === 0 ? '시간 미선택' : `${e.times.length}건`}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`${e.date} 삭제`}
                    onClick={() => removeDate(e.date)}
                    className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {local.length === 0 && (
                <p className="py-2 text-xs text-muted-foreground">아래에서 날짜를 추가해주세요.</p>
              )}
            </div>
            <Input
              type="date"
              value={newDate}
              min={pickerMin}
              max={maxDate}
              onChange={(e) => addDate(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          {/* 오른쪽 — 선택한 날짜의 시간 그리드 */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <p className="text-sm font-semibold">시간 (30분 단위)</p>
              {activeDate && (
                <span className="text-xs text-muted-foreground">{activeDate.replaceAll('-', '.')}</span>
              )}
            </div>
            {activeDate ? (
              <>
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
                  {TIME_SLOTS.map((t) => {
                    const selected = activeTimes.includes(t)
                    // 이미 선택된 과거 시각(수정 모드)은 해제할 수 있도록 열어 둔다.
                    const disabled = isPastSlot(t) && !selected
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleTime(t)}
                        className={cn(
                          'cursor-pointer rounded border px-2 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                          selected ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent',
                        )}
                      >
                        {t}
                      </button>
                    )
                  })}
                </div>
                {activeDate === openedAt.today && (
                  <p className="text-xs text-muted-foreground">오늘은 현재 시각({openedAt.now}) 이후만 선택할 수 있습니다.</p>
                )}
                {activeTimes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 border-t pt-2">
                    {activeTimes.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTime(t)}
                        title="클릭하여 제외"
                        className="cursor-pointer rounded-full bg-primary px-2 py-0.5 text-[11px] text-primary-foreground"
                      >
                        {t} ×
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                왼쪽에서 날짜를 선택하거나 추가해주세요.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <span className="text-xs text-muted-foreground">총 {totalSlots}개 시간대</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>취소</Button>
            <Button onClick={handleSave}>저장</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
