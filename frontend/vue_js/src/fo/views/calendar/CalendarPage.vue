<template>
  <div class="calendar-container">
    <!-- 로딩 화면 -->
    <div v-if="loading" class="fullpage-loading">
      <div class="loading-spinner">
        <i class="bi bi-arrow-clockwise"></i>
        <span>로딩 중...</span>
      </div>
    </div>

    <!-- 하단 캘린더 영역 -->
    <div class="calendar-layout-wrapper">
      <!-- 사이드바 -->
      <div class="calendar-sidebar-fixed">
        <MyPageSideBar />
      </div>
      
      <!-- 캘린더 콘텐츠 -->
      <div class="calendar-content-full">
        <!-- 캘린더 필터바 -->
        <CalendarFilterBar @update="updateFilters" />
        
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
                        :style="getEventStyle(event)"
                      >
                        <div class="company" @click="handleScheduleClick(event)">
                          <div class="company-name">
                            <span>{{ truncateText(event.title, 9) }}</span>
                          </div>
                          <div v-if="event.sourceType === 'PERSONAL'" class="personal-badge">
                            <i class="bi bi-person"></i>
                          </div>
                          <div v-else-if="event.sourceType === 'PROJECT'" class="project-badge">
                            <i class="bi bi-briefcase"></i>
                          </div>
                          <div v-else-if="event.sourceType === 'INTERVIEW'" class="interview-badge">
                            <i class="bi bi-clipboard-check"></i>
                          </div>
                        </div>
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
      @success="refreshCalendar"
    />

    <!-- 일정 상세 모달 -->
    <ScheduleDetailModal
      :show="showScheduleDetailModal"
      :scheduleSq="selectedScheduleSq"
      @close="closeScheduleDetailModal"
      @updated="refreshCalendar"
      @deleted="refreshCalendar"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, addDays, isSameDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useAlertStore } from '@/fo/stores/alertStore'
import calendarService from '@/fo/services/calendarService'
import { CalendarEvent, CalendarSourceType } from '@/fo/types/calendar'
import ScheduleModal from '@/fo/components/calendar/ScheduleModal.vue'
import ScheduleDetailModal from '@/fo/components/calendar/ScheduleDetailModal.vue'
import CalendarFilterBar from '@/fo/views/calendar/CalendarFilterBar.vue'
import MyPageSideBar from '@/fo/components/mypage/MyPageSideBar.vue'

export default {
  name: 'CalendarPage',
  components: {
    ScheduleModal,
    ScheduleDetailModal,
    CalendarFilterBar,
    MyPageSideBar
  },
  setup() {
    // ==================== Store ====================
    const alertStore = useAlertStore()
    
    // ==================== State ====================
    const loading = ref(false)
    const favoritesMode = ref(false)
    const currentMonth = ref(new Date())
    const calendarEvents = ref([])
    
    // 모달 상태
    const showScheduleModal = ref(false)
    const selectedDateForModal = ref(null)
    const showScheduleDetailModal = ref(false)
    const selectedScheduleSq = ref(null)
    
    // 필터 상태
    const filters = ref({
      searchKeyword: '',
      contractTypeCd: null,
      jobRoleCd: null,
      calendarType: null
    })
    
    // ==================== Computed ====================
    const currentDate = computed(() => 
      format(currentMonth.value, 'yyyy.MM', { locale: ko })
    )
    
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
  
    // ==================== API 호출 ====================
    const loadCalendarEvents = async () => {
      try {
        loading.value = true
        
        const params = {
          year: currentMonth.value.getFullYear(),
          month: currentMonth.value.getMonth() + 1,
          contractTypeCd: filters.value.contractTypeCd,
          recruitJobPositionTypeCd: filters.value.jobRoleCd,
          searchKeyword: filters.value.searchKeyword,
          calendarType: filters.value.calendarType
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

    // ==================== 이벤트 핸들러 ====================
    const updateFilters = (newFilters) => {
      filters.value = { ...filters.value, ...newFilters }
      loadCalendarEvents()
    }
    
    const addMonth = (months) => {
      currentMonth.value = addMonths(currentMonth.value, months)
      loadCalendarEvents()
    }
    
    const refreshCalendar = () => {
      loadCalendarEvents()
    }
  
    // 모달 제어
    const openScheduleModal = (day = null) => {
      selectedDateForModal.value = day ? day.fullDate : new Date()
      showScheduleModal.value = true
    }
    
    const closeScheduleModal = () => {
      showScheduleModal.value = false
      selectedDateForModal.value = null
    }
    
    const closeScheduleDetailModal = () => {
      showScheduleDetailModal.value = false
      selectedScheduleSq.value = null
    }
    
    // 일정 클릭 핸들러
    const handleScheduleClick = async (event) => {
      try {
        const { success, data } = await calendarService.getScheduleDetail(event.scheduleSq)
        
        if (success && data) {
          // 개인 일정
          if (data.personalDetail) {
            selectedScheduleSq.value = event.scheduleSq
            showScheduleDetailModal.value = true
          }
          // 면접 일정 (interviewDetail이 있으면 면접 일정)
          else if (data.interviewDetail) {
            selectedScheduleSq.value = event.scheduleSq
            showScheduleDetailModal.value = true
          }
          // 프로젝트 일정
          else if (data.projectDetail) {
            if (data.projectDetail.routePath) {
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
    
    // ==================== 유틸리티 함수 ====================
    const isToday = (day) => {
      return isSameDay(day.fullDate, new Date())
    }
    
    // 특정 날짜가 일정 기간에 포함되는지 판단
    const isInPeriod = (event, date) => {
      const isStart = typeof event.isStartDate === 'function' ? event.isStartDate(date) : false
      const isEnd = typeof event.isEndDate === 'function' ? event.isEndDate(date) : false
      const isOngoing = typeof event.isOngoing === 'function' ? event.isOngoing(date) : false

      const hasEnd = !!event.endDt || !!event.endDate || !!event.end

      if (!hasEnd) {
        return typeof event.isOnDate === 'function' ? event.isOnDate(date) : false
      }
      
      return isStart || isEnd || isOngoing
    }
    
    const getDayItems = (day) => {
      return calendarEvents.value.filter(ev => isInPeriod(ev, day.fullDate))
    }
    
    const getItemClasses = (event, day) => {
      const classes = []
      
      if (event.sourceType === CalendarSourceType.PERSONAL) {
        classes.push('personal-schedule')
      } else if (event.sourceType === CalendarSourceType.PROJECT) {
        classes.push('project-schedule')
      } else if (event.sourceType === CalendarSourceType.INTERVIEW) {
        classes.push('interview-schedule')
      }
      
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
    
    // ==================== 스타일 ====================
    const colorPalette = [
      { bg: '#90CAF9', border: '#90CAF9' },  // 파란색
      { bg: '#CE93D8', border: '#CE93D8' },  // 보라색
      { bg: '#A5D6A7', border: '#A5D6A7' },  // 초록색
      { bg: '#FFCC80', border: '#FFCC80' },  // 주황색
      { bg: '#F48FB1', border: '#F48FB1' },  // 핑크색
      { bg: '#80CBC4', border: '#80CBC4' },  // 청록색
      { bg: '#FFF59D', border: '#FFF59D' },  // 노란색
      { bg: '#C5E1A5', border: '#C5E1A5' },  // 라임색
      { bg: '#81D4FA', border: '#81D4FA' },  // 하늘색
      { bg: '#E6EE9C', border: '#E6EE9C' },  // 연두색
      { bg: '#EF9A9A', border: '#EF9A9A' },  // 빨간색
      { bg: '#B39DDB', border: '#B39DDB' },  // 진보라색
    ]
    
    const getEventStyle = (event) => {
      const colorIndex = event.scheduleSq % colorPalette.length
      const colors = colorPalette[colorIndex]
      
      return {
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: '#333'
      }
    }
    
    // ==================== 라이프사이클 ====================
    onMounted(() => {
      loadCalendarEvents()
    })
    
    // ==================== Return ====================
    return {
      // State
      loading,
      favoritesMode,
      currentMonth,
      calendarEvents,
      // Computed
      currentDate,
      calendarWeeks,
      // Modal State
      showScheduleModal,
      selectedDateForModal,
      showScheduleDetailModal,
      selectedScheduleSq,
      // Event Handlers
      addMonth,
      updateFilters,
      refreshCalendar,
      handleScheduleClick,
      // Modal Controls
      openScheduleModal,
      closeScheduleModal,
      closeScheduleDetailModal,
      // Utilities
      isToday,
      getDayItems,
      getItemClasses,
      truncateText,
      getEventStyle
    }
  }
}
</script>

<style scoped>
.calendar-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  margin: 0;
  padding: 0;
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

/* 캘린더 레이아웃 */
.calendar-layout-wrapper {
  display: flex;
  width: 100%;
  min-height: calc(100vh - 100px);
  margin: 0;
  padding: 0;
}

.calendar-sidebar-fixed {
  width: 250px;
  flex-shrink: 0;
  background-color: #fff;
  padding: 1.5rem;
  border-right: 1px solid #dee2e6;
  overflow-y: auto;
  position: sticky;
  top: 0;
  height: calc(100vh - 100px);
}

.calendar-content-full {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: calc(100% - 250px);
  overflow-x: hidden;
}

.calendar-right {
  background-color: white;
  overflow: hidden;
  width: 100%;
  flex: 1;
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
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
  position: relative;
}

.calendar-item:hover {
  border-color: #007bff;
  box-shadow: 0 2px 5px rgba(0, 123, 255, 0.2);
  z-index: 10;
}

/* 시작일 - 왼쪽에 둥근 모서리 */
.calendar-item.start {
  border-radius: 0.25rem 0 0 0.25rem;
  border-right: none;
}

/* 중간 - 둥근 모서리 없음 */
.calendar-item.ongoing {
  border-radius: 0;
  border-left: none;
  border-right: none;
}

/* 종료일 - 오른쪽에 둥근 모서리 */
.calendar-item.end {
  border-radius: 0 0.25rem 0.25rem 0;
  border-left: none;
}

/* 하루짜리 일정 - 전체 둥근 모서리 */
.calendar-item.start.end {
  border-radius: 0.25rem;
  border: 1px solid #dee2e6;
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

.personal-badge {
  color: #2196f3;
  margin-left: 0.25rem;
}

.project-badge {
  color: #9c27b0;
  margin-left: 0.25rem;
}

.interview-badge {
  color: #ff5722;
  margin-left: 0.25rem;
}

/* 반응형 디자인 */
@media (max-width: 992px) {
  .calendar-layout-wrapper {
    flex-direction: column;
  }
  
  .calendar-sidebar-fixed {
    width: 100%;
    height: auto;
    position: relative;
    border-right: none;
    border-bottom: 1px solid #dee2e6;
  }
  
  .calendar-content-full {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .calendar-cell {
    min-height: 100px;
  }
  
  .calendar.body {
    min-height: 600px;
  }
}
</style>
