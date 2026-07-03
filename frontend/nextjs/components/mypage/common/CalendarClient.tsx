'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'next/navigation'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import ResumeDetailModal from '@/components/mypage/personal/ResumeDetailModal'
import ScheduleRegisterModal, { type ScheduleEventData } from '@/components/mypage/common/ScheduleRegisterModal'
import api from '@/lib/api'
import type { CalendarEvent } from '@/types'
import type { EventClickArg, PluginDef } from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction'

// FullCalendar은 SSR 불가
const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false })

const TYPE_COLORS: Record<number, string> = {
  2401: '#0088cc',
  2402: '#e36159',
  2403: '#2baab1',
  2404: '#7aa93c',
}

// Vue 원본: 면접·공고 말머리는 역할별로 다름
function prefixOf(typeCd: number, userType?: string | null): string {
  switch (typeCd) {
    case 2401: return '[일정] '
    case 2402: return userType === 'PERSONAL' ? '[면접] ' : '[면접 진행] '
    case 2403: return userType === 'PERSONAL' ? '[스크랩 마감] ' : '[공고 모집] '
    case 2404: return '[관심 기업 공고 마감] '
    default: return ''
  }
}

export default function CalendarClient() {
  const router = useRouter()
  const { userSq, getUserType } = useUserStore()
  const userType = getUserType()
  const [searchType, setSearchType] = useState('전체')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [events, setEvents] = useState<object[]>([])
  const [detailResumeSq, setDetailResumeSq] = useState<number | null>(null)
  const [navConfirm, setNavConfirm] = useState<{ open: boolean; title: string; path: string }>({ open: false, title: '', path: '' })
  const [schedule, setSchedule] = useState<{ open: boolean; mode: 'REGISTER' | 'VIEW'; event: ScheduleEventData | null }>({ open: false, mode: 'REGISTER', event: null })

  const fetchSchedules = useCallback(async () => {
    try {
      const { data } = await api.get('/mypage/schedule/list', {
        params: { userSq, userType, searchType, searchKeyword },
      })
      const raw: CalendarEvent[] = data.output ?? []
      setEvents(
        raw.map((e, i) => ({
          ...e,
          id: e.scheduleSq ?? `temp-${e.scheduleTypeCd}-${i}`,
          title: prefixOf(e.scheduleTypeCd, userType) + e.scheduleTtl,
          start: e.start,
          end: e.end,
          allDay: e.scheduleAllDayYn === 'Y',
          backgroundColor: TYPE_COLORS[e.scheduleTypeCd] ?? '#0088cc',
          borderColor: TYPE_COLORS[e.scheduleTypeCd] ?? '#0088cc',
          extendedProps: e,
        })),
      )
    } catch {
      toast.error('일정을 불러올 수 없습니다.')
    }
  }, [userSq, userType, searchType, searchKeyword])

  useEffect(() => { fetchSchedules() }, [fetchSchedules])

  function openRegister(start?: string, allDay?: boolean) {
    setSchedule({ open: true, mode: 'REGISTER', event: start ? { start, allDay } : null })
  }

  function handleDateClick(info: DateClickArg) {
    openRegister(info.dateStr, info.allDay)
  }

  function handleEventClick(info: EventClickArg) {
    const props = info.event.extendedProps as CalendarEvent
    // 면접(2402) → 이력서 상세보기 모달
    if (props.scheduleTypeCd === 2402) {
      if (props.resumeSq) setDetailResumeSq(props.resumeSq)
      return
    }
    // 스크랩/공고(2403)·관심기업공고(2404) → 이동 확인 후 상세 페이지
    if (props.scheduleTypeCd === 2403 || props.scheduleTypeCd === 2404) {
      if (props.projectSq) {
        const path = userType === 'PERSONAL'
          ? `/projects/user/${props.projectSq}`
          : `/projects/company/${props.projectSq}`
        setNavConfirm({ open: true, title: info.event.title, path })
      }
      return
    }
    // 일반 일정(2401) → 상세(VIEW) 모달
    setSchedule({
      open: true,
      mode: 'VIEW',
      event: {
        scheduleSq: props.scheduleSq,
        scheduleTtl: props.scheduleTtl,
        scheduleCnt: props.scheduleCnt,
        scheduleStartDtm: info.event.startStr,
        scheduleEndDtm: info.event.endStr || info.event.startStr,
        scheduleTypeCd: props.scheduleTypeCd,
        scheduleAllDayYn: props.scheduleAllDayYn,
        projectSq: props.projectSq ?? null,
        allDay: info.event.allDay,
      },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold">일정 관리</h2>
        <Button onClick={() => openRegister()}>일정 등록</Button>
      </div>

      <div className="flex gap-2 justify-end flex-wrap">
        <Select value={searchType} onValueChange={(v) => { if (v) setSearchType(v) }}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['전체', '제목', '회사명'].map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchSchedules()}
          placeholder="검색어 입력"
          className="w-48"
        />
        <Button onClick={fetchSchedules} size="sm">검색</Button>
      </div>

      <div className="min-h-[500px]">
        {typeof window !== 'undefined' && (
          <FullCalendarWrapper
            events={events}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        )}
      </div>

      <ScheduleRegisterModal
        open={schedule.open}
        initialMode={schedule.mode}
        event={schedule.event}
        onClose={() => setSchedule((s) => ({ ...s, open: false }))}
        onSaved={fetchSchedules}
      />
      <ResumeDetailModal resumeSq={detailResumeSq} onClose={() => setDetailResumeSq(null)} />
      <ConfirmDialog
        open={navConfirm.open}
        title="페이지 이동"
        message={`'${navConfirm.title}' 상세 페이지로 이동하시겠습니까?`}
        onConfirm={() => router.push(navConfirm.path)}
        onClose={() => setNavConfirm({ open: false, title: '', path: '' })}
      />
    </div>
  )
}

function FullCalendarWrapper({
  events,
  onEventClick,
  onDateClick,
}: {
  events: object[]
  onEventClick: (arg: EventClickArg) => void
  onDateClick: (arg: DateClickArg) => void
}) {
  // Plugins loaded dynamically to avoid SSR issues
  const [plugins, setPlugins] = useState<PluginDef[]>([])
  useEffect(() => {
    Promise.all([
      import('@fullcalendar/daygrid').then((m) => m.default),
      import('@fullcalendar/timegrid').then((m) => m.default),
      import('@fullcalendar/interaction').then((m) => m.default),
    ]).then(setPlugins)
  }, [])

  if (plugins.length === 0) {
    return <div className="h-96 bg-muted animate-pulse rounded-lg" />
  }

  return (
    <FullCalendar
      plugins={plugins}
      headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
      initialView="dayGridMonth"
      locale="ko"
      dayMaxEvents={2}
      selectable
      events={events}
      eventClick={onEventClick}
      dateClick={onDateClick}
    />
  )
}
