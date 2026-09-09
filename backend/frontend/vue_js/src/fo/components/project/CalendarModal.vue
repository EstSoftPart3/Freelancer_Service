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
    <div class="drp-buttons">
      <span class="drp-selected">{{ formattedRange }}</span>
      <button
        class="cancelBtn btn btn-sm btn-default"
        type="button"
        @click="clearRange"
      >
        취소
      </button>
      <button
        class="applyBtn btn btn-sm btn-primary"
        type="button"
        :disabled="!selectedRange[0] || !selectedRange[1]"
        @click="confirmSelection"
      >
        적용
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits } from 'vue'
import { useModalStore } from '../../stores/modalStore.js'

const selectedRange = ref([null, null])

const today = new Date()
const leftMonth = ref({ month: today.getMonth(), year: today.getFullYear() })
const rightMonth = ref({
  month: today.getMonth() === 11 ? 0 : today.getMonth() + 1,
  year: today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear(),
})

const emit = defineEmits(['confirm'])

const modalStore = useModalStore()

const formatDate = (d) => {
  const date = new Date(d)
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

const formattedRange = computed(() => {
  const [start, end] = selectedRange.value
  return start && end ? `${formatDate(start)} ~ ${formatDate(end)}` : ''
})

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

function selectDate(date) {
  if (
    !selectedRange.value[0] ||
    (selectedRange.value[0] && selectedRange.value[1])
  ) {
    selectedRange.value = [date, null]
  } else {
    if (new Date(date) < new Date(selectedRange.value[0])) {
      selectedRange.value = [date, selectedRange.value[0]]
    } else {
      selectedRange.value[1] = date
    }
  }
}

function isPastDate(d) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)
  return target < today
}

function clearRange() {
  selectedRange.value = [null, null]
  modalStore.closeModal()
}

function isInRange(d) {
  if (!selectedRange.value[0] || !selectedRange.value[1]) return false
  const target = new Date(d).setHours(0, 0, 0, 0)
  const start = new Date(selectedRange.value[0]).setHours(0, 0, 0, 0)
  const end = new Date(selectedRange.value[1]).setHours(0, 0, 0, 0)
  return target >= start && target <= end
}

function isSelected(d) {
  const target = new Date(d).setHours(0, 0, 0, 0)
  return selectedRange.value.some(
    (s) => s && new Date(s).setHours(0, 0, 0, 0) === target,
  )
}

function dayClass(d, currentMonth) {
  const isSameMonth = d.getMonth() === currentMonth
  const isPast = isPastDate(d)

  return {
    available: !isPast,
    'start-date':
      selectedRange.value[0] &&
      formatDate(d) === formatDate(selectedRange.value[0]) &&
      isSameMonth,
    'end-date':
      selectedRange.value[1] &&
      formatDate(d) === formatDate(selectedRange.value[1]) &&
      isSameMonth,
    'in-range': isInRange(d) && isSameMonth,
    selected: isSelected(d) && isSameMonth,
    'past-date': isPast && isSameMonth,
  }
}

const confirmSelection = () => {
  const formatted = {
    start: convertDate(selectedRange.value[0]),
    end: convertDate(selectedRange.value[1]),
  }
  emit('confirm', formatted)
  useModalStore().closeModal()
}

const convertDate = (date) => {
  return typeof date === 'string'
    ? date
    : date
        .toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .replace(/\. /g, '-')
        .replace('.', '')
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
  background-color: #0088cc;
  color: white;
  font-weight: bold;
}

.calendar-table td.selected {
  background-color: #0088cc;
  font-weight: bold;
}

.calendar-table td.past-date {
  background-color: #f0f0f0; /* 회색 배경 */
  color: #aaa; /* 흐린 글씨 */
  cursor: not-allowed;
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
  content: '선택 일자: ';
  font-weight: normal;
  color: #555;
  margin-right: 4px;
}
</style>
