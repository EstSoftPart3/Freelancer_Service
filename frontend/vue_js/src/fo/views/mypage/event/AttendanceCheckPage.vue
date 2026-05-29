<template>
  <div
    class="tab-pane tab-pane-navigation active show"
    id="attendanceCheck"
    role="tabpanel"
  >
    <div class="d-flex justify-content-between align-items-start">
      <h4 class="mb-0" style="font-size: 24px; font-weight: 700">출석체크</h4>

      <div class="attendance-info text-end">
        <div class="attendance-month">2026년 5월</div>

        <div class="attendance-streak">
          연속 출석일: {{ consecutiveDays }}일
        </div>
      </div>
    </div>

    <div class="calendar-container Porto-calendar mt-3">
      <FullCalendar :options="calendarOptions" />
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'

/**
 * 임시 출석 날짜 데이터
 *
 * 지금은 백엔드 연결 전이므로 프론트에서 직접 출석 날짜를 넣어둡니다.
 * 나중에 백엔드 API가 생기면 이 배열만 API 응답값으로 바꾸면 됩니다.
 */
const attendanceDates = ['2026-05-28']

/**
 * 연속 출석일 계산
 *
 * 최신 출석일을 기준으로 하루씩 연속되는지 확인합니다.
 *
 * 예)
 * ['2026-05-26', '2026-05-27', '2026-05-28']
 * => 3일
 *
 * ['2026-05-24', '2026-05-26', '2026-05-28']
 * => 최신 날짜인 28일 기준으로 27일이 없으므로 1일
 */
const consecutiveDays = computed(() => {
  if (attendanceDates.length === 0) {
    return 0
  }

  const sortedDates = attendanceDates
    .map((date) => new Date(date))
    .sort((a, b) => b - a)

  let count = 1

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const currentDate = sortedDates[i]
    const previousDate = sortedDates[i + 1]

    const diffTime = currentDate - previousDate
    const diffDays = diffTime / (1000 * 60 * 60 * 24)

    if (diffDays === 1) {
      count++
    } else {
      break
    }
  }

  return count
})

/**
 * FullCalendar 이벤트 데이터
 *
 * attendanceDates 배열을 FullCalendar가 이해할 수 있는 events 형식으로 변환합니다.
 */
const attendanceEvents = attendanceDates.map((date) => ({
  title: '출석',
  start: date,
  allDay: true,
  className: 'attendance-stamp-event',
}))

const calendarOptions = reactive({
  plugins: [dayGridPlugin, bootstrap5Plugin],

  headerToolbar: {
    left: 'prev,next today',
    center: '',
    right: 'title',
  },

  initialView: 'dayGridMonth',

  // 테스트 기준 화면을 2026년 5월로 고정
  initialDate: '2026-05-01',

  themeSystem: 'bootstrap5',
  locale: 'ko',
  height: 'auto',

  events: attendanceEvents,
})
</script>

<style scoped>
.attendance-info {
  padding-top: 2px;
}

.attendance-month {
  font-size: 20px;
  font-weight: 700;
  color: #111;
}

.attendance-streak {
  margin-top: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.calendar-container {
  width: 100%;
}

/* FullCalendar 전체 기본 폰트 */
:deep(.fc) {
  font-size: 14px;
}

/* 우측 title은 직접 만든 2026년 5월 텍스트를 쓰기 때문에 숨김 */
:deep(.fc-toolbar-title) {
  font-size: 0;
}

/* 이전, 다음, today 버튼 */
:deep(.fc-button) {
  background-color: #0088cc;
  border-color: #0088cc;
  font-weight: 600;
}

/* 날짜 칸 높이 */
:deep(.fc-daygrid-day) {
  height: 96px;
}

/* 날짜 숫자 */
:deep(.fc-daygrid-day-number) {
  color: #666;
  font-weight: 600;
  padding: 8px;
}

/* 요일 헤더 */
:deep(.fc-col-header-cell) {
  height: 34px;
  vertical-align: middle;
}

:deep(.fc-col-header-cell-cushion) {
  color: #333;
  font-weight: 700;
  text-decoration: none;
}

/* 출석 도장 이벤트 박스 */
:deep(.attendance-stamp-event) {
  background: transparent;
  border: none;
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

/* 출석 글자 도장 */
:deep(.attendance-stamp-event .fc-event-title) {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 52px;
  height: 40px;

  color: #e60012;
  border: 2px solid #e60012;
  border-radius: 4px;

  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 2px;

  background-color: transparent;
}
</style>
