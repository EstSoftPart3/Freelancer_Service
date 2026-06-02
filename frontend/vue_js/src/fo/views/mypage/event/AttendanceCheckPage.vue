<template>
  <div
    class="tab-pane tab-pane-navigation active show"
    id="attendanceCheck"
    role="tabpanel"
  >
    <div class="d-flex justify-content-between align-items-start">
      <h4 class="mb-0" style="font-size: 24px; font-weight: 700">출석체크</h4>

      <div class="attendance-info text-end">
        <div class="attendance-month">{{ currentMonthText }}</div>

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
import { computed, reactive, ref } from 'vue'
import { api } from '@/axios'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'

/**
 * 월별 출석 날짜 데이터
 *
 * 백엔드 월별 출석 조회 API 응답값을 저장합니다.
 */
const attendanceDates = ref([])

/**
 * 현재 달력에서 보고 있는 년/월
 */
const currentYear = ref(2026)
const currentMonth = ref(5)

const currentMonthText = computed(() => {
  return `${currentYear.value}년 ${currentMonth.value}월`
})

/**
 * 월별 출석 조회 API 호출
 */
const fetchMonthlyAttendance = async (year, month) => {
  try {
    const response = await api.$get('/mypage/attendance', {
      params: {
        year,
        month,
      },
    })

    attendanceDates.value = response.attendanceDates || []
    calendarOptions.events = attendanceEvents.value
  } catch (error) {
    console.error('월별 출석 조회 실패:', error)
    attendanceDates.value = []
    calendarOptions.events = []
  }
}

/**
 * 연속 출석일 계산
 *
 * 최신 출석일을 기준으로 하루씩 연속되는지 확인합니다.
 */
const consecutiveDays = computed(() => {
  if (attendanceDates.value.length === 0) {
    return 0
  }

  const sortedDates = attendanceDates.value
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
const attendanceEvents = computed(() =>
  attendanceDates.value.map((date) => ({
    title: '출석',
    start: date,
    allDay: true,
    className: 'attendance-stamp-event',
  })),
)

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

  events: [],

  datesSet: (info) => {
    const viewDate = info.view.currentStart

    const year = viewDate.getFullYear()
    const month = viewDate.getMonth() + 1

    currentYear.value = year
    currentMonth.value = month

    fetchMonthlyAttendance(year, month)
  },
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

/* 우측 title은 직접 만든 년/월 텍스트를 쓰기 때문에 숨김 */
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
