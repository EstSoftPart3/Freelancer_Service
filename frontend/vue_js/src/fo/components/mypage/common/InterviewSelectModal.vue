<template>
  <div>
    <div class="daterangepicker ltr show-calendar openscenter">
      <div class="calendar-wrapper">
        <div class="drp-calendar left">
          <div class="calendar-table">
            <table class="table-condensed">
              <thead>
                <tr>
                  <th class="prev available" @click="prevMonth">
                    <span>&lt;</span>
                  </th>
                  <th colspan="5" class="month">
                    {{ getMonthYear(leftMonth) }}
                  </th>
                  <th></th>
                </tr>
                <tr>
                  <th>일</th>
                  <th>월</th>
                  <th>화</th>
                  <th>수</th>
                  <th>목</th>
                  <th>금</th>
                  <th>토</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(week, rowIndex) in leftCalendar"
                  :key="'left-' + rowIndex"
                >
                  <td
                    v-for="(day, colIndex) in week"
                    :key="'left-' + colIndex + '-' + rowIndex"
                    :class="dayClass(day.date, leftMonth.month)"
                    @click="!isPastDate(day.date) && selectDate(day.date)"
                  >
                    {{ day.label }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="drp-calendar right">
          <div class="calendar-table">
            <table class="table-condensed">
              <thead>
                <tr>
                  <th></th>
                  <th colspan="5" class="month">
                    {{ getMonthYear(rightMonth) }}
                  </th>
                  <th class="next available" @click="nextMonth">
                    <span>&gt;</span>
                  </th>
                </tr>
                <tr>
                  <th>일</th>
                  <th>월</th>
                  <th>화</th>
                  <th>수</th>
                  <th>목</th>
                  <th>금</th>
                  <th>토</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(week, rowIndex) in rightCalendar"
                  :key="'right-' + rowIndex"
                >
                  <td
                    v-for="(day, colIndex) in week"
                    :key="'right-' + colIndex + '-' + rowIndex"
                    :class="dayClass(day.date, rightMonth.month)"
                    @click="!isPastDate(day.date) && selectDate(day.date)"
                  >
                    {{ day.label }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="time-picker-wrapper">
      <h6 class="time-picker-title">시간 선택 (30분 단위)</h6>
      <p v-if="!selectedDate" class="time-warning">날짜를 먼저 선택해주세요.</p>
      <div class="time-grid">
        <button
          v-for="time in displayedTimeOptions"
          :key="time"
          :class="['time-slot', { selected: isSelectedTime(time) }]"
          :disabled="!selectedDate"
          @click="toggleTime(time)"
        >
          {{ time }}
        </button>
      </div>
    </div>
    <div class="drp-buttons">
      <span class="drp-selected">{{ formattedRange }}</span>
      <button
        class="cancelBtn btn btn-sm btn-default"
        type="button"
        @click="useModalStore().closeModal()"
      >
        취소
      </button>
      <button
        class="applyBtn btn btn-sm btn-primary"
        type="button"
        @click="handleConfirm"
      >
        적용
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue'
import { useModalStore } from '../../../stores/modalStore.js'
import { useAlertStore } from '../../../stores/alertStore.js'

import { api } from '@/axios.js'

const props = defineProps({
  onConfirm: Function,
  interviewTimes: Array,
  applicationSq: Number,
})

const alertStore = useAlertStore()

const selectedDate = ref(null)
const selectedTimes = ref({})

const today = new Date()
const leftMonth = ref({ month: today.getMonth(), year: today.getFullYear() })
const rightMonth = ref({
  month: today.getMonth() === 11 ? 0 : today.getMonth() + 1,
  year: today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear(),
})

const availableTimes = computed(() => {
  const grouped = {}
  props.interviewTimes.forEach(({ interviewTime }) => {
    if (typeof interviewTime !== 'string') return

    const [date, time] = interviewTime.split('T')
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(time.slice(0, 5)) // 'HH:MM'
  })
  return grouped
})

const isSelectedTime = (time) => {
  const date = selectedDate.value
  return selectedTimes.value[date]?.includes(time)
}

const toggleTime = (time) => {
  const date = selectedDate.value
  if (!selectedTimes.value[date]) {
    selectedTimes.value[date] = []
  }

  // 이미 선택된 경우 -> 제거
  if (selectedTimes.value[date][0] === time) {
    selectedTimes.value[date] = []
  } else {
    // 이미 지난 시간인 경우 -> 예외
    const [h, m] = time.split(':').map(Number)
    const dt = new Date(date)
    dt.setHours(h, m, 0, 0)
    if (dt <= new Date()) {
      alertStore.show('이미 지난 시간은 선택할 수 없습니다.', 'danger')
      return
    }
    // 새로 선택된 경우 -> 기존 값 덮어쓰기
    selectedTimes.value[date] = [time]
  }
}

function dayClass(d, currentMonth) {
  const dateString = formatDate(d)
  const isSameMonth = d.getMonth() === currentMonth
  const isPast = isPastDate(d)

  return {
    available: !isPast && dateString in availableTimes.value && isSameMonth,
    selected: dateString === selectedDate.value && isSameMonth,
    'has-times': !!availableTimes.value[dateString]?.length && isSameMonth,
    'past-date': isPast && isSameMonth,
  }
}
function formatDate(d) {
  const date = new Date(d)
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

const handleConfirm = () => {
  const interviewTimeSq = getSelectedInterviewTimeSq()
  // console.log(interviewTimeSq)
  // console.log(props.applicationSq)
  if (!interviewTimeSq || !props.applicationSq) {
    alertStore.show('날짜와 시간을 선택해주세요.', 'danger')
    return
  }

  sendInterviewTimeRequest(interviewTimeSq, props.applicationSq).then(() => {
    props.onConfirm?.(true)
  })
}

const getSelectedInterviewTimeSq = () => {
  const date = selectedDate.value
  const time = selectedTimes.value[date]?.[0]
  if (!date || !time) return null

  const targetDatetime = `${date}T${time}:00`
  const matched = props.interviewTimes.find(
    (i) => i.interviewTime === targetDatetime,
  )
  return matched?.interviewTimeSq ?? null
}

function selectDate(date) {
  const formatted = formatDate(date)
  if (isPastDate(date) || !(formatted in availableTimes.value)) return

  selectedDate.value = selectedDate.value === formatted ? null : formatted
}

function getMonthYear(obj) {
  return `${obj.month + 1}월 ${obj.year}`
}

function generateCalendar(month, year) {
  const weeks = []
  const firstDay = new Date(year, month, 1).getDay()
  let current = 1 - firstDay
  for (let w = 0; w < 6; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(year, month, current)
      const isSameMonth = date.getMonth() === month
      week.push({ date, label: isSameMonth ? date.getDate() : '' })
      current++
    }
    weeks.push(week)
  }
  return weeks
}

const leftCalendar = computed(() =>
  generateCalendar(leftMonth.value.month, leftMonth.value.year),
)
const rightCalendar = computed(() =>
  generateCalendar(rightMonth.value.month, rightMonth.value.year),
)

function prevMonth() {
  if (leftMonth.value.month === 0) {
    leftMonth.value.month = 11
    leftMonth.value.year--
  } else {
    leftMonth.value.month--
  }
  rightMonth.value.month = leftMonth.value.month + 1
  rightMonth.value.year = leftMonth.value.year
  if (rightMonth.value.month > 11) {
    rightMonth.value.month = 0
    rightMonth.value.year++
  }
}

function nextMonth() {
  if (rightMonth.value.month === 11) {
    rightMonth.value.month = 0
    rightMonth.value.year++
  } else {
    rightMonth.value.month++
  }
  leftMonth.value.month = rightMonth.value.month - 1
  leftMonth.value.year = rightMonth.value.year
  if (leftMonth.value.month < 0) {
    leftMonth.value.month = 11
    leftMonth.value.year--
  }
}

const getAccessTokenFromCookie = () => {
  const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

const sendInterviewTimeRequest = async (interviewTimeSq, applicationSq) => {
  try {
    const token = getAccessTokenFromCookie()

    const config = {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      withCredentials: true,
    }

    const payload = {
      applicationSq,
    }

    await api.$patch(
      `/projects/applications/interviews/${interviewTimeSq}`,
      payload,
      config,
    )

    alertStore.show('인터뷰 시간 선택에 성공하였습니다.', 'success')
    // console.log('✅ 인터뷰 시간 선택 성공', response)
    useModalStore().closeModal()
  } catch (e) {
    alertStore.show('인터뷰 시간 선택에 실패하였습니다.', 'danger')
    console.error('❌ 인터뷰 시간 선택 실패', e)
  }
}

const displayedTimeOptions = computed(() => {
  if (!selectedDate.value) return []
  return availableTimes.value[selectedDate.value] || []
})

function isPastDate(d) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = new Date(d)
  target.setHours(0, 0, 0, 0)

  return target < today
}
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 60px;
  padding-bottom: 60px;
}

.daterangepicker {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px 40px;
  width: fit-content;
}

.calendar-wrapper {
  display: flex;
  flex-direction: row;
  gap: 20px;
  justify-content: center;
}

.drp-calendar {
  flex: 1;
}

.calendar-table {
  width: 100%;
  text-align: center;
}

.calendar-table th,
.calendar-table td {
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.calendar-table td.available:hover {
  background-color: #e0f7fa;
}

.calendar-table td.start-date,
.calendar-table td.end-date {
  background-color: #0088cc;
  color: white;
  font-weight: bold;
}

.calendar-table td.in-range {
  background-color: #b2ebf2;
}

.calendar-table td.selected {
  border: 2px solid #0088cc;
}

.calendar-table td.past-date {
  background-color: #f0f0f0;
  color: #aaa;
  cursor: not-allowed;
  pointer-events: none;
}

.drp-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 30px 40px;
  border-top: 1px solid #ddd;
}

.drp-selected {
  flex: 1;
  align-self: center;
  font-weight: bold;
  text-align: left;
  padding-left: 5px;
}
.drp-selected::before {
  font-weight: normal;
  color: #555;
  margin-right: 4px;
}

td.selected {
  background-color: #0088cc;
  color: white;
  font-weight: bold;
  border-radius: 0;
}

td.has-times:not(.selected) {
  background-color: #e6f0ff;
  font-weight: 600;
}

.time-picker-wrapper {
  padding: 0 40px 30px;
  border-top: 1px solid #ddd;
}

.time-picker-title {
  margin: 12px 0;
  font-size: 14px;
  font-weight: bold;
  color: #555;
}

.time-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.time-slot {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-slot.selected {
  background-color: #0088cc;
  color: white;
  border-color: #0088cc;
  font-weight: bold;
}

.time-slot:disabled {
  background-color: #f5f5f5;
  color: #bbb;
  border-color: #ddd;
  cursor: not-allowed;
  pointer-events: none;
}

.time-warning {
  color: #d9534f;
  font-size: 13px;
  margin-bottom: 10px;
}
</style>
