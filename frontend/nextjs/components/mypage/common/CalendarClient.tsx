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
import api from '@/lib/api'
import type { CalendarEvent } from '@/types'

// FullCalendar은 SSR 불가
const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false })

const TYPE_COLORS: Record<number, string> = {
  2401: '#0088cc',
  2402: '#e36159',
  2403: '#2baab1',
  2404: '#7aa93c',
}

const TYPE_PREFIX: Record<number, string> = {
  2401: '[일정] ',
  2402: '[면접] ',
  2403: '[스크랩 마감] ',
  2404: '[관심 기업 공고 마감] ',
}

export default function CalendarClient() {
  const router = useRouter()
  const { userSq, getUserType } = useUserStore()
  const userType = getUserType()
  const [searchType, setSearchType] = useState('전체')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [events, setEvents] = useState<object[]>([])

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
          title: (TYPE_PREFIX[e.scheduleTypeCd] ?? '') + e.scheduleTtl,
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

  function handleEventClick(info: { event: { extendedProps: CalendarEvent } }) {
    const props = info.event.extendedProps
    if (props.scheduleTypeCd === 2403 || props.scheduleTypeCd === 2404) {
      if (props.projectSq) {
        const path = userType === 'PERSONAL'
          ? `/projects/user/${props.projectSq}`
          : `/projects/company/${props.projectSq}`
        router.push(path)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold">일정 관리</h2>
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
          />
        )}
      </div>
    </div>
  )
}

function FullCalendarWrapper({
  events,
  onEventClick,
}: {
  events: object[]
  onEventClick: (info: { event: { extendedProps: CalendarEvent } }) => void
}) {
  // Plugins loaded dynamically to avoid SSR issues
  const [plugins, setPlugins] = useState<object[]>([])
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
      plugins={plugins as Parameters<typeof FullCalendar>[0]['plugins']}
      headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
      initialView="dayGridMonth"
      locale="ko"
      dayMaxEvents={2}
      events={events}
      eventClick={onEventClick as Parameters<typeof FullCalendar>[0]['eventClick']}
    />
  )
}
