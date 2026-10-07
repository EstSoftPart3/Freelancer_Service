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
import koLocale from '@fullcalendar/core/locales/ko'

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
  const { userSq, getUserType, authChecked } = useUserStore()
  const userType = getUserType()
  const [searchType, setSearchType] = useState('전체')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [events, setEvents] = useState<object[]>([])
  const [detailResumeSq, setDetailResumeSq] = useState<number | null>(null)
  const [navConfirm, setNavConfirm] = useState<{ open: boolean; title: string; path: string }>({ open: false, title: '', path: '' })
  const [schedule, setSchedule] = useState<{ open: boolean; mode: 'REGISTER' | 'VIEW'; event: ScheduleEventData | null }>({ open: false, mode: 'REGISTER', event: null })

  const fetchSchedules = useCallback(async (kw = appliedKeyword) => {
    if (!authChecked) return
    try {
      const { data } = await api.get('/mypage/schedule/list', {
        params: { userSq, userType, searchType, searchKeyword: kw },
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
    } catch (error) {
      console.error('일정 조회 실패:', error)
      toast.error('일정을 불러올 수 없습니다.')
    }
  }, [authChecked, userSq, userType, searchType, appliedKeyword])

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
    // FullCalendar의 info.event.startStr/endStr/allDay는 현재 뷰(월/주)에 따라 재해석되어
    // 달라질 수 있으므로, 백엔드 원본 값(extendedProps)을 그대로 사용해 뷰 전환과 무관하게
    // 저장된 시간·종일 여부가 유지되도록 한다.
    const rawStart = props.scheduleStartDtm || info.event.startStr
    const rawEnd = props.scheduleEndDtm || info.event.endStr || rawStart
    setSchedule({
      open: true,
      mode: 'VIEW',
      event: {
        scheduleSq: props.scheduleSq,
        scheduleTtl: props.scheduleTtl,
        scheduleCnt: props.scheduleCnt,
        scheduleStartDtm: rawStart,
        scheduleEndDtm: rawEnd,
        scheduleTypeCd: props.scheduleTypeCd,
        scheduleAllDayYn: props.scheduleAllDayYn,
        projectSq: props.projectSq ?? null,
        allDay: props.scheduleAllDayYn === 'Y',
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
          onKeyDown={(e) => { if (e.key === 'Enter') { setAppliedKeyword(searchKeyword); fetchSchedules(searchKeyword) } }}
          placeholder="검색어 입력"
          className="w-full min-w-0 flex-1 sm:w-48 sm:flex-none"
        />
        <Button onClick={() => { setAppliedKeyword(searchKeyword); fetchSchedules(searchKeyword) }} size="sm">검색</Button>
      </div>

      <div className="min-h-[500px] overflow-x-auto">
        <FullCalendarWrapper
          events={events}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
        />
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
  // 모바일(640 미만)은 기본 aspectRatio 로는 달력 높이가 250px 남짓이라 월 뷰는 3주만, 주 뷰는 두 시간만 보이고
  // 나머지는 안쪽 스크롤로 숨는다 — 높이를 내용에 맞춘다(주 뷰는 24시간이 다 펼쳐진다. 제목 줄바꿈은 globals.css).
  // views 로 뷰별 height 를 주면 월 뷰 본문 높이가 0 이 되어 쓰지 않는다. PC는 기존 aspectRatio 그대로.
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const sync = () => setNarrow(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
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
      // 문자열 'ko' 만 주면 날짜(Intl)만 한글이고 버튼·"+N more" 는 영문으로 남는다 — 로케일 객체를 넘긴다.
      locale={koLocale}
      height={narrow ? 'auto' : undefined}
      dayMaxEvents={2}
      // 시간이 있는 일정(직접 일정·면접)은 월 뷰에서도 "14:00" 처럼 시작 시각을 제목 앞에 붙인다.
      // 예전엔 "오전 3시" 한글 표기가 칸을 넘쳐 월 뷰에서 시간을 숨겼는데, 그러면 면접이 몇 시인지
      // 알 수 없었다 — 24시간 2자리로 짧게 표시한다. 종일 일정(공고 마감 등)엔 시간이 붙지 않는다.
      eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: false, hour12: false }}
      // 같은 날 일정은 시작 시각 순(기본 eventOrder: start,-duration,allDay,title — 종일 일정은 자정
      // 시작이라 위로). 다만 기본값(strict=false)은 월 뷰에서 칸을 촘촘히 채우려고 이 순서를 어겨,
      // 여러 날 걸친 공고 막대나 dayMaxEvents 와 섞이면 14:00 일정이 10:00 보다 위에 올 수 있었다.
      eventOrderStrict
      // 기본값(dot)이면 시간 텍스트가 제목과 같은 줄에 붙는다. block이면 종일 일정처럼 한 덩어리로 렌더된다.
      eventDisplay="block"
      selectable
      events={events}
      eventClick={onEventClick}
      dateClick={onDateClick}
    />
  )
}
