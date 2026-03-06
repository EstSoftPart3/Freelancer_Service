<template>
  <div>
    <div class="modal-header">
      <h4 class="modal-title">{{ modalTitle }}</h4>
      <button type="button" class="btn-close" @click="closeModal">×</button>
    </div>

    <div class="modal-body">
      <div class="card bg-color-grey mb-0">
        <div class="card-body">
          <div v-if="mode === 'VIEW'" class="view-mode">
            <div class="mb-3">
              <label class="text-1 text-muted d-block">제목</label>
              <div class="text-4 font-weight-bold text-dark">
                {{ scheduleData.scheduleTtl }}
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="text-1 text-muted d-block">시작 일시</label>
                <div class="text-3 text-dark">
                  {{ formatDate(scheduleData.scheduleStartDtm) }}
                </div>
              </div>
              <div class="col-md-6">
                <label class="text-1 text-muted d-block">종료 일시</label>
                <div class="text-3 text-dark">
                  {{ formatDate(scheduleData.scheduleEndDtm) }}
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label class="text-1 text-muted d-block">내용</label>
              <div class="text-3 text-dark pre-wrap">
                {{ scheduleData.scheduleCnt || '내용이 없습니다.' }}
              </div>
            </div>
          </div>

          <form v-else class="post-form">
            <div class="form-group mb-3">
              <label class="form-label font-weight-bold text-dark">제목</label>
              <input
                type="text"
                v-model="scheduleData.scheduleTtl"
                class="form-control"
                placeholder="일정 제목을 입력하세요"
              />
            </div>
            <div class="form-check mb-3">
              <input
                class="form-check-input"
                type="checkbox"
                v-model="isAllDay"
                id="allDayCheck"
              />
              <label class="form-check-label" for="allDayCheck">종일</label>
            </div>
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label font-weight-bold text-dark"
                  >시작 일시</label
                >
                <input
                  :type="isAllDay ? 'date' : 'datetime-local'"
                  v-model="scheduleData.scheduleStartDtm"
                  class="form-control"
                />
              </div>
              <div class="col-md-6">
                <label class="form-label font-weight-bold text-dark"
                  >종료 일시</label
                >
                <input
                  :type="isAllDay ? 'date' : 'datetime-local'"
                  v-model="scheduleData.scheduleEndDtm"
                  class="form-control"
                />
              </div>
            </div>
            <div class="form-group mb-0">
              <label class="form-label font-weight-bold text-dark"
                >일정 내용</label
              >
              <textarea
                v-model="scheduleData.scheduleCnt"
                class="form-control"
                rows="4"
                placeholder="내용을 입력하세요"
              ></textarea>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <template v-if="mode === 'VIEW'">
        <button
          v-if="scheduleData.scheduleTypeCd === 2401"
          class="btn btn-danger me-auto"
          @click="confirmDelete"
        >
          삭제
        </button>
        <button class="btn btn-primary" @click="mode = 'EDIT'">수정</button>
        <button class="btn btn-outline-secondary" @click="closeModal">
          닫기
        </button>
      </template>

      <template v-else-if="mode === 'EDIT'">
        <button class="btn btn-primary" @click="saveSchedule">저장</button>
        <button class="btn btn-outline-secondary" @click="mode = 'VIEW'">
          취소
        </button>
      </template>

      <template v-else>
        <button class="btn btn-primary" @click="saveSchedule">등록</button>
        <button class="btn btn-outline-secondary" @click="closeModal">
          취소
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, computed } from 'vue'
import { useModalStore } from '@/fo/stores/modalStore'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useUserStore } from '@/fo/stores/userStore'
import { api } from '@/axios'
import CommonConfirmModal from '../../common/CommonConfirmModal.vue'

const props = defineProps({
  initialMode: { type: String, default: 'REGISTER' },
  eventData: { type: Object, default: null },
  onConfirm: { type: Function, required: true },
})

const modalStore = useModalStore()
const alertStore = useAlertStore()
const userStore = useUserStore()

const mode = ref(props.initialMode)
const isAllDay = ref(props.eventData?.allDay || false)

const scheduleData = ref({
  scheduleSq: props.eventData?.id || null,
  userSq: userStore.userSq,
  scheduleTtl: props.eventData?.title || '',
  scheduleCnt: props.eventData?.extendedProps?.scheduleCnt || '',
  scheduleStartDtm: props.eventData?.start || '',
  scheduleEndDtm: props.eventData?.end || props.eventData?.start || '',
  scheduleTypeCd: props.eventData?.extendedProps?.scheduleTypeCd || 2401,
  projectSq: props.eventData?.extendedProps?.projectSq || null,
})

const modalTitle = computed(() => {
  if (mode.value === 'REGISTER') return '일정 등록'
  if (mode.value === 'VIEW') return '일정 상세'
  return '일정 수정'
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return dateStr.replace('T', ' ')
}

const closeModal = () => modalStore.closeModal()

/**
 * [추가] 일정 삭제 확인 컨펌 모달 호출
 */
const confirmDelete = () => {
  modalStore.openModal(CommonConfirmModal, {
    title: '일정 삭제',
    message: '정말로 이 일정을 삭제하시겠습니까?',
    confirmText: '삭제',
    cancelText: '취소',
    onConfirm: async () => {
      await executeDelete()
    },
  })
}

/**
 * [추가] 실제 삭제 API 호출
 */
const executeDelete = async () => {
  try {
    const response = await api.$delete(
      `/mypage/schedule/delete/${scheduleData.value.scheduleSq}`,
    )

    if (response.status === 'OK') {
      alertStore.show(response.message, 'success')
      props.onConfirm() // 부모 캘린더 새로고침
      modalStore.closeModal() // 컨펌 모달 닫기
      modalStore.closeModal() // 상세 모달 닫기
    }
  } catch (error) {
    console.error('삭제 실패:', error)
    alertStore.show('일정 삭제 중 오류가 발생했습니다.', 'danger')
  }
}

/**
 * 일정 저장/수정 함수
 */
const saveSchedule = async () => {
  if (!scheduleData.value.scheduleTtl.trim()) {
    alertStore.show('제목을 입력해주세요.', 'danger')
    return
  }

  if (!scheduleData.value.scheduleStartDtm) {
    alertStore.show('시작 일시를 선택해주세요.', 'danger')
    return
  }

  const now = new Date()
  const startDate = new Date(scheduleData.value.scheduleStartDtm)

  if (isAllDay.value) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const targetDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
    )

    if (targetDate < today) {
      alertStore.show('과거 날짜로 일정을 등록할 수 없습니다.', 'danger')
      return
    }
  } else {
    if (startDate < now) {
      alertStore.show('시작 일시는 현재 시간보다 이후여야 합니다.', 'danger')
      return
    }
  }

  if (!scheduleData.value.scheduleEndDtm) {
    scheduleData.value.scheduleEndDtm = scheduleData.value.scheduleStartDtm
  }

  const endDate = new Date(scheduleData.value.scheduleEndDtm)
  if (endDate < startDate) {
    alertStore.show('종료 일시는 시작 일시보다 빠를 수 없습니다.', 'danger')
    return
  }

  try {
    const requestPayload = {
      ...scheduleData.value,
      scheduleAllDayYn: isAllDay.value ? 'Y' : 'N',
    }

    let response
    if (mode.value === 'EDIT') {
      response = await api.$put('/mypage/schedule/modify', requestPayload)
    } else {
      response = await api.$post('/mypage/schedule/register', requestPayload)
    }

    if (response.status === 'OK' || response.status === 'CREATED') {
      alertStore.show(response.message, 'success')
      props.onConfirm()
      modalStore.closeModal()
    }
  } catch (error) {
    console.error('저장 실패:', error)
    alertStore.show('일정 저장 중 오류가 발생했습니다.', 'danger')
  }
}
</script>

<style scoped>
.pre-wrap {
  white-space: pre-wrap;
}
.bg-color-grey {
  background-color: #f8f9fa !important;
  border: 1px solid #ebebeb;
}
.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: #000;
}
.view-mode label {
  font-size: 0.75rem;
  margin-bottom: 2px;
}
.view-mode div {
  margin-bottom: 12px;
}
/* 삭제 버튼과 나머지 버튼 사이의 간격을 조절 */
.me-auto {
  margin-right: auto !important;
}
</style>
