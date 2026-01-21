<template>
  <div
    class="tab-pane tab-pane-navigation active show"
    id="resumeRegistration"
    role="tabpanel"
  >
    <div class="d-flex justify-content-between align-items-center">
      <h4 class="mb-0" style="font-size: 24px; font-weight: 700">일정 관리</h4>
      <button
        class="btn btn-primary btn-px-4 py-2 font-weight-bold text-2"
        @click="openRegisterModal"
      >
        <i class="fas fa-plus mr-1"></i> 일정 등록
      </button>
    </div>

    <div class="row align-items-center mt-3 mb-2">
      <div class="col-md-12 d-flex justify-content-end gap-2">
        <select v-model="searchType" class="form-select form-select-sm w-auto">
          <option value="전체">전체</option>
          <option value="제목">제목</option>
          <option value="회사명">회사명</option>
        </select>
        <input
          v-model="searchKeyword"
          @keyup.enter="handleSearch"
          type="text"
          class="form-control form-control-sm w-auto"
          placeholder="검색어 입력"
        />
        <button class="btn btn-primary btn-sm" @click="handleSearch">
          검색
        </button>
      </div>
    </div>

    <div class="calendar-container Porto-calendar mt-3">
      <FullCalendar :options="calendarOptions" ref="fullCalendar" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'
import { api } from '@/axios'
import { useModalStore } from '@/fo/stores/modalStore'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/fo/stores/userStore'
import ScheduleRegisterModal from '@/fo/components/mypage/common/ScheduleRegisterModal.vue'
import ResumeDetailModal from '@/fo/components/mypage/common/ResumeDetailModal.vue'
import CommonConfirmModal from '@/fo/components/common/CommonConfirmModal.vue'

const modalStore = useModalStore()
const userStore = useUserStore()
const router = useRouter()

// Porto Primary Color
const portoPrimary = '#0088cc'

// 일정 목록 조회
const fetchSchedules = async () => {
  try {
    const params = {
      userSq: userStore.userSq,
      userType: userStore.userType,
      searchType: searchType.value,
      searchKeyword: searchKeyword.value,
    }

    const response = await api.$get('/mypage/schedule/list', { params })
    const data = response.output

    if (data && Array.isArray(data)) {
      calendarOptions.events = data.map((event, index) => {
        let color = portoPrimary
        let prefix = ''

        // [기능 추가] 일정 유형별 말머리 및 색상 지정
        if (event.scheduleTypeCd === 2401) {
          prefix = '[일정] ' // 일반 일정 말머리 추가
          color = portoPrimary
        } else if (event.scheduleTypeCd === 2402) {
          color = '#e36159' // 면접 (Red)
          prefix =
            userStore.userType === 'PERSONAL' ? '[면접] ' : '[면접 진행] '
        } else if (event.scheduleTypeCd === 2403) {
          color = '#2baab1' // 공고/스크랩 (Teal)
          prefix =
            userStore.userType === 'PERSONAL'
              ? '[스크랩 마감] '
              : '[공고 모집] '
        }

        return {
          ...event,
          id:
            event.scheduleSq ||
            `temp-${event.scheduleTypeCd}-${event.projectSq || index}`,
          title: prefix + event.scheduleTtl, // 말머리 + 제목 결합
          start: event.start,
          end: event.end,
          allDay: event.scheduleAllDayYn === 'Y',
          backgroundColor: color,
          borderColor: color,
          extendedProps: { ...event },
        }
      })
    }
  } catch (error) {
    console.error('조회 실패:', error)
  }
}
// 페이지 진입 시 데이터 호출
onMounted(() => {
  fetchSchedules()
})

// 검색 실행 로직
const handleSearch = () => {
  fetchSchedules()
}

const refreshCalendar = () => {
  fetchSchedules()
}

// 검색 관련 상태
const searchType = ref('전체')
const searchKeyword = ref('')
const fullCalendar = ref(null) // 캘린더 인스턴스 참조

// 1. 등록 모달 오픈 (성공 시 refreshCalendar 실행)
const openRegisterModal = () => {
  modalStore.openModal(ScheduleRegisterModal, {
    size: 'modal-lg',
    initialMode: 'REGISTER',
    onConfirm: refreshCalendar,
  })
}

// 2. 날짜 빈 칸 클릭 시 (등록 모드로 오픈)
const handleDateClick = (info) => {
  modalStore.openModal(ScheduleRegisterModal, {
    size: 'modal-lg',
    initialMode: 'REGISTER',
    eventData: { start: info.dateStr, allDay: info.allDay },
    onConfirm: refreshCalendar,
  })
}

// 3. 이미 있는 일정 클릭 시 (분기 로직 적용)
const handleEventClick = (info) => {
  const event = info.event
  const props = event.extendedProps
  const typeCd = props.scheduleTypeCd

  // 면접 일정 클릭 -> 이력서 상세보기 모달
  if (typeCd === 2402) {
    modalStore.openModal(ResumeDetailModal, {
      size: 'modal-lg',
      resumeSq: props.resumeSq,
      projectSq: props.projectSq,
      applicationSq: props.applicationSq,
      isFromApplicationList: false,
    })
    return
  }

  // 스크랩/공고 일정 클릭 -> 공통 컨펌 모달 후 권한별 상세 페이지 이동
  if (typeCd === 2403) {
    modalStore.openModal(CommonConfirmModal, {
      title: '페이지 이동',
      message: `'${event.title}' 상세 페이지로 이동하시겠습니까?`,
      confirmText: '이동',
      cancelText: '취소',
      onConfirm: () => {
        // [1번 과제] 계정 타입에 따른 라우트 분기
        const routeName =
          userStore.userType === 'PERSONAL'
            ? 'UserProjectSpec'
            : 'CompanyProjectSpec'

        router.push({
          name: routeName,
          params: { project_sq: props.projectSq },
        })

        modalStore.closeModal()
      },
    })
    return
  }

  // 일반 일정 클릭 -> 기존 등록/수정 모달
  modalStore.openModal(ScheduleRegisterModal, {
    size: 'modal-lg',
    initialMode: 'VIEW',
    eventData: {
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      allDay: event.allDay,
      extendedProps: props,
    },
    onConfirm: fetchSchedules,
  })
}

// 캘린더 설정
const calendarOptions = reactive({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrap5Plugin],
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek',
  },
  initialView: 'dayGridMonth',
  themeSystem: 'bootstrap5',
  editable: true,
  selectable: true,
  locale: 'ko',
  dayMaxEvents: 2,
  moreLinkClick: 'popover',
  //   moreLinkClick: 'day', // '일' 단위 뷰

  // 함수 연결
  dateClick: handleDateClick,
  eventClick: handleEventClick,

  // 서버에서 불러올 데이터가 들어갈 자리
  events: [],
})
</script>

<style scoped>
/* Porto 스타일링 보정 */
.gap-2 {
  gap: 0.5rem !important;
}

.Porto-calendar :deep(.fc-header-toolbar) {
  margin-bottom: 20px !important;
}

.Porto-calendar :deep(.fc-toolbar-title) {
  font-size: 1.2rem !important;
  font-weight: 700;
}

/* Porto Primary 버튼 스타일 강제 적용 */
.Porto-calendar :deep(.fc-button-primary) {
  background-color: v-bind(portoPrimary) !important;
  border-color: v-bind(portoPrimary) !important;
  font-size: 0.85rem;
  padding: 5px 12px;
}

.Porto-calendar :deep(.fc-day-today) {
  background-color: rgba(0, 136, 204, 0.03) !important;
}

/* 입력창 너비 고정 */
input.form-control-sm {
  min-width: 200px;
}
</style>
