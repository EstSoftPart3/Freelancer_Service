<template>
  <div class="calendar-container">
    <!-- 로딩 화면 -->
    <div v-if="loading" class="fullpage-loading">
      <div class="loading-spinner">
        <i class="bi bi-arrow-clockwise"></i>
        <span>로딩 중...</span>
      </div>
    </div>

    <!-- 캘린더 필터바 -->
    <CalendarFilterBar @update="updateFilters" />

    <!-- 하단 캘린더 영역 -->
    <div class="recruit-bottom">
      <div class="calendar-right">
        <!-- 캘린더 헤더 -->
        <div class="calendar-right-head">
          <div class="nav-search-bar">
            <div class="calendar-nav">
              <div class="icon-wrapper" @click="addMonth(-1)">
                <i class="bi bi-chevron-left"></i>
              </div>
              <span class="current">{{ currentDate }}</span>
              <div class="icon-wrapper" @click="addMonth(1)">
                <i class="bi bi-chevron-right"></i>
              </div>
            </div>
            <div class="add-schedule" @click="openScheduleModal">
              일정 추가
            </div>
          </div>
        </div>

        <!-- 메인 캘린더 -->
        <div class="calendar body employment-mode" :class="{ 'schedule-mode': favoritesMode }">
          <div v-for="(week, weekIndex) in calendarWeeks" :key="`week-${weekIndex}`" class="calendar-week" :class="`week-${weekIndex}`">
            <div v-for="day in week" :key="`${day.year}-${day.month}-${day.date}`" class="calendar-cell">
              <div 
                class="day-label" 
                :class="{ today: isToday(day) }"
              >
                {{ day.date }}
              </div>
              <div 
                class="day-content" 
                :class="{ 'has-calendar-item': getDayItems(day).length > 0 }"
                @dblclick="favoritesMode ? openScheduleModal(day) : null"
              >
                <div v-if="getDayItems(day).length > 0" class="calendar-items">
                  <div 
                    v-for="event in getDayItems(day)" 
                    :key="event.scheduleSq"
                    class="calendar-item"
                    :class="getItemClasses(event, day)"
                  >
                    <div class="company" @click="handleScheduleClick(event)">
                      <div v-if="event.isStartDate(day.fullDate)" class="calendar-label start">시</div>
                      <div v-if="event.isEndDate(day.fullDate)" class="calendar-label end">끝</div>
                      <div class="company-name">
                        <span>{{ truncateText(event.title, 10) }}</span>
                      </div>
                      <div v-if="event.sourceType === 'PERSONAL'" class="personal-badge">
                        <i class="bi bi-person"></i>
                      </div>
                      <div v-else-if="event.sourceType === 'PROJECT'" class="project-badge">
                        <i class="bi bi-briefcase"></i>
                      </div>
                    </div>
                    <div class="favorite">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 개인 일정 추가 모달 -->
    <ScheduleModal
      :show="showScheduleModal"
      :selectedDate="selectedDateForModal"
      @close="closeScheduleModal"
      @success="handleScheduleSuccess"
    />

    <!-- 일정 상세 모달 -->
    <ScheduleDetailModal
      :show="showScheduleDetailModal"
      :scheduleSq="selectedScheduleSq"
      @close="closeScheduleDetailModal"
      @updated="handleScheduleUpdated"
      @deleted="handleScheduleDeleted"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, addDays, isSameDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useAlertStore } from '@/fo/stores/alertStore'
import calendarService from '@/fo/services/calendarService'
import { CalendarEvent, CalendarSourceType } from '@/fo/types/calendar'
import ScheduleModal from '@/fo/components/calendar/ScheduleModal.vue'
import ScheduleDetailModal from '@/fo/components/calendar/ScheduleDetailModal.vue'
import CalendarFilterBar from '@/fo/components/calendar/CalendarFilterBar.vue'

export default {
  name: 'CalendarPage',
  components: {
    ScheduleModal,
    ScheduleDetailModal,
    CalendarFilterBar
  },
  setup() {
    // 스토어
    const alertStore = useAlertStore()
    
    // 반응형 데이터
    const loading = ref(false)
    const favoritesMode = ref(false)
    
    // 현재 날짜 관련
    const currentMonth = ref(new Date())
    
    // 캘린더 데이터
    const calendarEvents = ref([])
    
    // 모달 관련
    const showScheduleModal = ref(false)
    const selectedDateForModal = ref(null)
    const showScheduleDetailModal = ref(false)
    const selectedScheduleSq = ref(null)
    
    // 필터 데이터
    const filters = ref({
      searchKeyword: '',
      contractTypeCd: null,
      jobRoleCd: null
    })
    
    // 상수 데이터
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THR', 'FRI', 'SAT']
    const korDayNames = ['일', '월', '화', '수', '목', '금', '토']
    
    // 계산된 속성
    const currentDate = computed(() => format(currentMonth.value, 'yyyy.MM', { locale: ko }))
    
    
    // 캘린더 주차 데이터 생성
    const calendarWeeks = computed(() => {
      const monthStart = startOfMonth(currentMonth.value)
      const monthEnd = endOfMonth(currentMonth.value)
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
      
      const weeks = []
      let currentWeek = []
      let currentDate = calendarStart
      
      while (currentDate <= calendarEnd) {
        currentWeek.push({
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          date: currentDate.getDate(),
          fullDate: new Date(currentDate)
        })
        
        if (currentWeek.length === 7) {
          weeks.push([...currentWeek])
          currentWeek = []
        }
        
        currentDate = addDays(currentDate, 1)
      }
      
      return weeks
    })
  
    
    // 캘린더 데이터 로드
    const loadCalendarEvents = async () => {
      try {
        loading.value = true
        
        const params = {
          year: currentMonth.value.getFullYear(),
          month: currentMonth.value.getMonth() + 1,
          contractTypeCd: filters.value.contractTypeCd,
          recruitJobPositionTypeCd: filters.value.jobRoleCd,
          searchKeyword: filters.value.searchKeyword
        }
        
        const { success, data } = await calendarService.getCalendarEvents(params)

        if (success) {
          calendarEvents.value = data.map(e => new CalendarEvent(e))
        } else {
          alertStore.show('캘린더 데이터를 불러오는데 실패했습니다.', 'danger')
        }
      } catch (e) {
        console.error('캘린더 데이터 로드 실패:', e)
        alertStore.show('캘린더 데이터를 불러오는데 실패했습니다.', 'danger')
      } finally {
        loading.value = false
      }
    }

    // 메서드
    const updateFilters = (newFilters) => {
      filters.value = { ...filters.value, ...newFilters }
      loadCalendarEvents()
    }
    
    const addMonth = (months) => {
      currentMonth.value = addMonths(currentMonth.value, months)
      loadCalendarEvents()
    }
  
    
    const openScheduleModal = (day = null) => {
      selectedDateForModal.value = day ? day.fullDate : new Date()
      showScheduleModal.value = true
    }
    
    const closeScheduleModal = () => {
      showScheduleModal.value = false
      selectedDateForModal.value = null
    }
    
    const handleScheduleSuccess = () => {
      // 일정 추가 성공 시 캘린더 데이터 새로고침
      loadCalendarEvents()
    }
    
    // 일정 클릭 핸들러
    const handleScheduleClick = async (event) => {
      try {
        const { success, data } = await calendarService.getScheduleDetail(event.scheduleSq)
        
        if (success && data) {
          if (data.sourceType === 'PERSONAL') {
            // 개인 일정: 상세 모달 표시
            selectedScheduleSq.value = event.scheduleSq
            showScheduleDetailModal.value = true
          } else if (data.sourceType === 'PROJECT') {
            // 프로젝트 일정: 프로젝트 상세 페이지로 이동
            if (data.projectDetail?.routePath) {
              window.location.href = data.projectDetail.routePath
            } else {
              alertStore.show('프로젝트 상세 페이지를 찾을 수 없습니다.', 'warning')
            }
          }
        } else {
          alertStore.show('일정 정보를 불러오는데 실패했습니다.', 'danger')
        }
      } catch (error) {
        console.error('일정 클릭 처리 실패:', error)
        alertStore.show('일정 정보를 불러오는데 실패했습니다.', 'danger')
      }
    }
    
    // 일정 상세 모달 닫기
    const closeScheduleDetailModal = () => {
      showScheduleDetailModal.value = false
      selectedScheduleSq.value = null
    }
    
    // 일정 수정 완료 처리
    const handleScheduleUpdated = () => {
      // 일정 수정 완료 시 캘린더 데이터 새로고침
      loadCalendarEvents()
    }
    
    // 일정 삭제 완료 처리
    const handleScheduleDeleted = () => {
      // 일정 삭제 완료 시 캘린더 데이터 새로고침
      loadCalendarEvents()
    }
    
    const isToday = (day) => {
      return isSameDay(day.fullDate, new Date())
    }
    
    // 특정 날짜가 "시작/마감만" 해당되도록 판단
    const isEdgeDay = (event, date) => {
    const isStart = typeof event.isStartDate === 'function' ? event.isStartDate(date) : false
    const isEnd   = typeof event.isEndDate   === 'function' ? event.isEndDate(date)   : false

      // 종료 없이 하루짜리(= 단일 일정)는 원래 로직대로 그 날 표시
    const hasEnd =
      !!event.endDt || !!event.endDate || !!event.end

    if (!hasEnd) {
      return typeof event.isOnDate === 'function' ? event.isOnDate(date) : false
    }
      // 기간 일정은 시작/끝만 표시
    return isStart || isEnd
  }
    
    const getDayItems = (day) => {
      return calendarEvents.value.filter(ev => isEdgeDay(ev, day.fullDate))
    }
    
    const getItemClasses = (event, day) => {
      const classes = []
      
      // 소스 타입별 클래스
      if (event.sourceType === CalendarSourceType.PERSONAL) {
        classes.push('personal-schedule')
      } else if (event.sourceType === CalendarSourceType.PROJECT) {
        classes.push('project-schedule')
      }
      
      // 이벤트 상태별 클래스
      if (event.isStartDate(day.fullDate)) {
        classes.push('start')
      } else if (event.isEndDate(day.fullDate)) {
        classes.push('end')
      } else if (event.isOngoing(day.fullDate)) {
        classes.push('ongoing')
      }
      
      return classes
    }
    
    
    const truncateText = (text, maxLength) => {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }
    
    // 초기화
    onMounted(() => {
      // 초기 데이터 로드
      loadCalendarEvents()
    })

    // 월 변경 감지
    watch(currentMonth, () => {
      loadCalendarEvents()
    })
    
    return {
      // 데이터
      loading,
      favoritesMode,
      currentMonth,
      calendarEvents,
      dayNames,
      korDayNames,
      
      // 계산된 속성
      currentDate,
      calendarWeeks,
      showScheduleModal,
      selectedDateForModal,
      showScheduleDetailModal,
      selectedScheduleSq,
      
      // 메서드
      addMonth,
      openScheduleModal,
      isToday,
      getDayItems,
      getItemClasses,
      truncateText,
      loadCalendarEvents,
      closeScheduleModal,
      handleScheduleSuccess,
      handleScheduleClick,
      closeScheduleDetailModal,
      handleScheduleUpdated,
      handleScheduleDeleted,
      updateFilters
    }
  }
}
</script>

<style scoped>
.calendar-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  margin: -2rem;
  padding: 2rem;
  max-width: 100vw;
  width: 100%;
  box-sizing: border-box;
}

/* 로딩 화면 */
.fullpage-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner i {
  font-size: 2rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}



/* 캘린더 영역 */
.recruit-bottom {
  display: flex;
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem;
  gap: 1rem;
}

.calendar-right {
  flex: 1;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: none;
}

.calendar-right-head {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.nav-search-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.calendar-nav .icon-wrapper {
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.calendar-nav .icon-wrapper:hover {
  background-color: #f8f9fa;
}

.calendar-nav .current {
  font-size: 1.25rem;
  font-weight: 600;
  color: #495057;
}

.add-schedule {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-schedule:hover {
  background-color: #0056b3;
}

.dayname-container {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #dee2e6;
}

.dayname-container .calendar-cell {
  background-color: white;
  padding: 0.75rem;
  text-align: center;
}

.name-of-days {
  font-weight: 600;
  color: #495057;
  font-size: 0.875rem;
}

.top-calendar-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #dee2e6;
  border-bottom: 1px solid #dee2e6;
}

.top-calendar-week .calendar-cell {
  background-color: white;
  padding: 0.5rem;
  text-align: center;
}

.top-calendar-week .day-label {
  color: #6c757d;
  font-size: 0.875rem;
}

/* 메인 캘린더 */
.calendar.body {
  min-height: 1100px;
  width: 100%;
  max-width: none;
}

.calendar-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  background-color: #dee2e6;
  border-bottom: 1px solid #dee2e6;
}

.calendar-week:last-child {
  border-bottom: none;
}

.calendar-cell {
  background-color: white;
  min-height: 180px;
  position: relative;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 0;
}

.calendar-cell:hover {
  background-color: #f8f9fa;
}

.calendar-cell .day-label {
  padding: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.calendar-cell .day-label.today {
  background-color: #007bff;
  color: white;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0.5rem;
}

.day-content {
  padding: 0.75rem;
  height: calc(100% - 3rem);
  cursor: pointer;
  position: relative;
}

.day-content.has-calendar-item {
  background-color: #f8f9fa;
}

.calendar-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.calendar-item {
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  transition: all 0.3s ease;
}

.calendar-item:hover {
  border-color: #007bff;
  box-shadow: 0 2px 5px rgba(0, 123, 255, 0.2);
}

.calendar-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.calendar-item.personal-schedule {
  background-color: #e3f2fd;
  border-color: #2196f3;
}

.calendar-item.project-schedule {
  background-color: #f3e5f5;
  border-color: #9c27b0;
}

.calendar-label {
  background-color: #007bff;
  color: white;
  padding: 0.125rem 0.25rem;
  border-radius: 0.125rem;
  font-size: 0.625rem;
  margin-right: 0.25rem;
}

.company {
  display: flex;
  align-items: center;
  color: inherit;
  flex: 1;
  cursor: pointer;
  transition: all 0.3s ease;
}

.company:hover {
  opacity: 0.8;
}

.company-name {
  font-weight: 500;
}

.jss-badge {
  color: #ffc107;
  margin-left: 0.25rem;
}

.personal-badge {
  color: #2196f3;
  margin-left: 0.25rem;
}

.project-badge {
  color: #9c27b0;
  margin-left: 0.25rem;
}

.favorite {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.item-favorite,
.item-no-favorite {
  cursor: pointer;
  transition: all 0.3s ease;
}

.item-favorite:hover,
.item-no-favorite:hover {
  color: #ffc107;
}

.dayname-container .day-label-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #dee2e6;
  margin-bottom: 0.5rem;
}

.dayname-container .day-label-header .day-label {
  background-color: white;
  padding: 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #495057;
}

.day-label-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #dee2e6;
}

.day-label-body .day-label {
  background-color: white;
  padding: 0.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.75rem;
}

.day-label-body .day-label:hover {
  background-color: #f8f9fa;
}

.day-label-body .day-label.today {
  background-color: #007bff;
  color: white;
}

.day-label-body .day-label.out-of-month {
  color: #6c757d;
}

/* 반응형 디자인 */
@media (max-width: 1200px) {
  .recruit-bottom {
    padding: 0.75rem;
  }
}

@media (max-width: 768px) {
  .recruit-bottom {
    flex-direction: column;
    padding: 0.5rem;
  }
  
  .calendar-cell {
    min-height: 100px;
  }
  
  .calendar.body {
    min-height: 600px;
  }
}
</style>
