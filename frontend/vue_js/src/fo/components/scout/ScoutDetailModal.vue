<template>
  <div
    ref="modalRef"
    class="modal fade"
    id="scoutDetailModal"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title fw-bold">스카우트 제안 상세</h5>
          <button
            type="button"
            class="btn-close"
            @click="closeModal"
            aria-label="Close"
          ></button>
        </div>

        <div class="modal-body" v-if="scoutDetail">
          <div class="mb-4">
            <h4 class="fw-bold text-primary">{{ scoutDetail.title }}</h4>
            <p class="text-muted fs-6">
              제안 기업: <strong class="text-dark">{{ scoutDetail.companyName || scoutDetail.company_name || scoutDetail.sender_company_name || '기업명 없음' }}</strong>
            </p>
          </div>

          <hr />

          <div class="row g-3 my-2">
            <div class="col-md-6">
              <span class="text-muted d-block">제시 월 단가</span>
              <strong class="fs-5 text-dark">{{ formatPay(scoutDetail.offeredPay || scoutDetail.offered_pay) }}</strong>
            </div>
            <div class="col-md-6">
              <span class="text-muted d-block">제안 일시</span>
              <span class="text-dark">{{ formatDate(scoutDetail.createdAt || scoutDetail.created_at) }}</span>
            </div>
          </div>

          <hr />

          <div class="my-3">
            <h6 class="fw-bold mb-2">제안 내용</h6>
            <div
              class="p-3 bg-light rounded border"
              style="min-height: 120px; white-space: pre-wrap;"
            >
              {{ scoutDetail.content || scoutDetail.message || '상세 제안 내용이 없습니다.' }}
            </div>
          </div>
        </div>

        <div class="modal-body text-center py-5" v-else-if="isLoading">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">제안 정보를 불러오는 중입니다...</p>
        </div>

        <div class="modal-body text-center py-5" v-else>
          <p class="text-danger mb-0">제안 상세 정보를 불러올 수 없습니다.</p>
        </div>

        <div class="modal-footer d-flex justify-content-between">
          <div>
            <template v-if="scoutDetail && (scoutDetail.status === 'PENDING' || scoutDetail.status === '대기중')">
              <button
                type="button"
                class="btn btn-primary px-4 me-2"
                @click="handleRespond('ACCEPTED')"
              >
                수락
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary px-4"
                @click="handleRespond('REJECTED')"
              >
                거절
              </button>
            </template>
          </div>
          <button
            type="button"
            class="btn btn-secondary px-4"
            @click="closeModal"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineExpose } from 'vue'
import { api } from '@/axios.js'
import { useModalStore } from '@/fo/stores/modalStore'
import CommonConfirmModal from '@/fo/components/common/CommonConfirmModal.vue'

const emit = defineEmits(['refresh'])
const modalStore = useModalStore()

const modalRef = ref(null)
const scoutDetail = ref(null)
const isLoading = ref(false)
let modalInstance = null

const openModal = async (scoutSq) => {
  if (!scoutSq) {
    console.error('유효하지 않은 scoutSq입니다:', scoutSq)
    return
  }

  if (modalRef.value) {
    const bootstrapObj = window.bootstrap || window.Bootstrap
    if (bootstrapObj?.Modal) {
      modalInstance = bootstrapObj.Modal.getOrCreateInstance(modalRef.value)
      modalInstance.show()
    }
  }

  await fetchScoutDetail(scoutSq)
}

// 1. 상세 데이터 조회 (ApiResponse 제거에 맞춘 resData 바인딩)
const fetchScoutDetail = async (scoutSq) => {
  isLoading.value = true
  scoutDetail.value = null

  try {
    const response = await api.$get(`/v1/scouts/${scoutSq}`, {
      withCredentials: true,
    })

    // Axios 커스텀 인스턴스(api.$get)가 response.data를 즉시 리턴하는 구조인 경우
    // response 자체가 ScoutDetailResponse 객체입니다.
    scoutDetail.value = response?.data || response
  } catch (e) {
    console.error('스카우트 상세 조회 실패:', e)
  } finally {
    isLoading.value = false
  }
}

const closeModal = () => {
  if (modalInstance) {
    modalInstance.hide()
  } else if (modalRef.value) {
    const bootstrapObj = window.bootstrap || window.Bootstrap
    if (bootstrapObj?.Modal) {
      const instance = bootstrapObj.Modal.getInstance(modalRef.value)
      if (instance) instance.hide()
    }
  }
}

// 2. 수락 / 거절 처리
const handleRespond = (status) => {
  if (!scoutDetail.value) return
  
  const scoutSq = scoutDetail.value.scoutSq || scoutDetail.value.scout_sq || scoutDetail.value.scouts_sq || scoutDetail.value.id
  const actionText = status === 'ACCEPTED' ? '수락' : '거절'

  modalStore.openModal(CommonConfirmModal, {
    title: `스카우트 제안 ${actionText}`,
    message: `해당 제안을 ${actionText}하시겠습니까?`,
    onConfirm: async () => {
      try {
        await api.$patch(`/v1/scouts/${scoutSq}/status`, { status }, { withCredentials: true })
        modalStore.closeModal()
        closeModal()
        emit('refresh')
      } catch (e) {
        console.error(`스카우트 ${actionText} 처리 실패:`, e)
      }
    },
  })
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function formatPay(pay) {
  if (!pay || isNaN(pay)) return '협의'
  return `${Number(pay).toLocaleString()}원`
}

defineExpose({
  openModal,
  closeModal,
})
</script>