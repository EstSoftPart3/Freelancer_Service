'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useFormErrors } from '@/hooks/useFormErrors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'

export interface ScheduleEventData {
  scheduleSq?: number | string | null
  scheduleTtl?: string
  scheduleCnt?: string
  scheduleStartDtm?: string
  scheduleEndDtm?: string
  scheduleTypeCd?: number
  scheduleAllDayYn?: string
  projectSq?: number | null
  start?: string
  end?: string
  allDay?: boolean
}

type Mode = 'REGISTER' | 'VIEW' | 'EDIT'

interface Props {
  open: boolean
  initialMode: Mode
  event: ScheduleEventData | null
  onClose: () => void
  onSaved: () => void
}

const trimDt = (v: string, allDay: boolean) => (!v ? '' : allDay ? v.substring(0, 10) : v.substring(0, 16))

type ScheduleField = 'scheduleTtl' | 'scheduleStartDtm' | 'scheduleEndDtm'

export default function ScheduleRegisterModal({ open, initialMode, event, onClose, onSaved }: Props) {
  const { userSq } = useUserStore()
  const { validate, fieldProps, clearField } = useFormErrors<ScheduleField>()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [isAllDay, setIsAllDay] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [form, setForm] = useState({
    scheduleSq: null as number | string | null,
    scheduleTtl: '', scheduleCnt: '',
    scheduleStartDtm: '', scheduleEndDtm: '',
    scheduleTypeCd: 2401, projectSq: null as number | null,
  })

  // 모달이 열릴 때 eventData 기준으로 초기화
  useEffect(() => {
    if (!open) return
    const allDay = event?.allDay ?? event?.scheduleAllDayYn === 'Y'
    const start = event?.scheduleStartDtm || event?.start || ''
    const end = event?.scheduleEndDtm || event?.end || start
    setMode(initialMode)
    setIsAllDay(allDay)
    setForm({
      scheduleSq: event?.scheduleSq ?? null,
      scheduleTtl: event?.scheduleTtl ?? '',
      scheduleCnt: event?.scheduleCnt ?? '',
      scheduleStartDtm: trimDt(start, allDay),
      scheduleEndDtm: trimDt(end, allDay),
      scheduleTypeCd: event?.scheduleTypeCd ?? 2401,
      projectSq: event?.projectSq ?? null,
    })
  }, [open, event, initialMode])

  const title = mode === 'REGISTER' ? '일정 등록' : mode === 'VIEW' ? '일정 상세' : '일정 수정'
  const set = (k: keyof typeof form, v: string) => { clearField(k as ScheduleField); setForm((p) => ({ ...p, [k]: v })) }

  async function save() {
    // 날짜 비교는 배열 밖에서 끝내 둔다 — 배열 리터럴 안에서 예외가 나면 폼 전체가 죽는다.
    const now = new Date()
    const start = new Date(form.scheduleStartDtm)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const target = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const startIsPast = !!form.scheduleStartDtm && (isAllDay ? target < today : start < now)
    const endStr = form.scheduleEndDtm || form.scheduleStartDtm
    const endBeforeStart = !!form.scheduleStartDtm && new Date(endStr) < start

    if (!validate([
      { key: 'scheduleTtl', invalid: !form.scheduleTtl.trim(), message: '제목을 입력해주세요.' },
      { key: 'scheduleStartDtm', invalid: !form.scheduleStartDtm, message: '시작 일시를 선택해주세요.' },
      { key: 'scheduleStartDtm', invalid: startIsPast,
        message: isAllDay ? '과거 날짜로 일정을 등록할 수 없습니다.' : '시작 일시는 현재 시간보다 이후여야 합니다.' },
      { key: 'scheduleEndDtm', invalid: endBeforeStart, message: '종료 일시는 시작 일시보다 빠를 수 없습니다.' },
    ])) return

    const payload = {
      ...form,
      userSq,
      scheduleEndDtm: endStr,
      scheduleAllDayYn: isAllDay ? 'Y' : 'N',
    }
    try {
      if (mode === 'EDIT') await api.put('/mypage/schedule/modify', payload)
      else await api.post('/mypage/schedule/register', payload)
      toast.success(mode === 'EDIT' ? '일정이 수정되었습니다.' : '일정이 등록되었습니다.')
      onSaved()
      onClose()
    } catch {
      toast.error('일정 저장 중 오류가 발생했습니다.')
    }
  }

  async function remove() {
    try {
      await api.delete(`/mypage/schedule/delete/${form.scheduleSq}`)
      toast.success('일정이 삭제되었습니다.')
      onSaved()
      onClose()
    } catch {
      toast.error('일정 삭제 중 오류가 발생했습니다.')
    }
  }

  const fmt = (v: string) => (v ? v.replace('T', ' ') : '-')

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-h-[90vh] w-[95vw] sm:max-w-lg overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>

        {mode === 'VIEW' ? (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm">
            <div><p className="text-xs text-muted-foreground">제목</p><p className="font-semibold">{form.scheduleTtl}</p></div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-muted-foreground">시작 일시</p><p>{fmt(form.scheduleStartDtm)}</p></div>
              <div><p className="text-xs text-muted-foreground">종료 일시</p><p>{fmt(form.scheduleEndDtm)}</p></div>
            </div>
            <div><p className="text-xs text-muted-foreground">내용</p><p className="whitespace-pre-wrap">{form.scheduleCnt || '내용이 없습니다.'}</p></div>
          </div>
        ) : (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold">제목</label>
              <Input {...fieldProps('scheduleTtl')} value={form.scheduleTtl} onChange={(e) => set('scheduleTtl', e.target.value)} placeholder="일정 제목을 입력하세요" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="allDay"
                checked={isAllDay}
                onCheckedChange={(v) => {
                  const next = v === true
                  setIsAllDay(next)
                  // 종일 여부가 바뀌면 input type(date ↔ datetime-local)도 바뀌므로
                  // 기존 값을 새 포맷에 맞게 다시 잘라줘야 값이 비거나 깨지지 않는다.
                  setForm((p) => ({
                    ...p,
                    scheduleStartDtm: trimDt(p.scheduleStartDtm, next),
                    scheduleEndDtm: trimDt(p.scheduleEndDtm, next),
                  }))
                }}
              />
              <label htmlFor="allDay" className="text-sm cursor-pointer">종일</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-semibold">시작 일시</label>
                <Input {...fieldProps('scheduleStartDtm')} type={isAllDay ? 'date' : 'datetime-local'} value={form.scheduleStartDtm} onChange={(e) => set('scheduleStartDtm', e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">종료 일시</label>
                <Input {...fieldProps('scheduleEndDtm')} type={isAllDay ? 'date' : 'datetime-local'} value={form.scheduleEndDtm} onChange={(e) => set('scheduleEndDtm', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">일정 내용</label>
              <Textarea value={form.scheduleCnt} onChange={(e) => set('scheduleCnt', e.target.value)} rows={4} placeholder="내용을 입력하세요" />
            </div>
          </div>
        )}

        <DialogFooter>
          {mode === 'VIEW' ? (
            <>
              {form.scheduleTypeCd === 2401 && (
                <Button variant="destructive" className="mr-auto" onClick={() => setDeleteOpen(true)}>삭제</Button>
              )}
              <Button onClick={() => setMode('EDIT')}>수정</Button>
              <Button variant="outline" onClick={onClose}>닫기</Button>
            </>
          ) : mode === 'EDIT' ? (
            <>
              <Button onClick={save}>저장</Button>
              <Button variant="outline" onClick={() => setMode('VIEW')}>취소</Button>
            </>
          ) : (
            <>
              <Button onClick={save}>등록</Button>
              <Button variant="outline" onClick={onClose}>취소</Button>
            </>
          )}
        </DialogFooter>

        <ConfirmDialog
          open={deleteOpen}
          title="일정 삭제"
          message="정말로 이 일정을 삭제하시겠습니까?"
          onConfirm={remove}
          onClose={() => setDeleteOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
