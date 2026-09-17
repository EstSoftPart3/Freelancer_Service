<template>
<Teleport to="body">
  <div
    ref="modalRef"
    class="modal fade"
    id="scoutDetailModal"
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border shadow-sm rounded-2 overflow-hidden">
        <!-- 모달 헤더 -->
        <div class="modal-header py-3 border-bottom bg-white d-flex align-items-center justify-content-between">
          <h4 class="modal-title fs-6 fw-bold text-dark m-0" id="scoutOfferModalLabel">스카우트 상세 내역</h4>
          <button
            type="button"
            class="btn-close fs-6"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>

        <!-- 본문 (데이터 존재 시) -->
        <div class="modal-body bg-light p-4" v-if="scoutDetail">
          <!-- 보낸 기업 -->
          <div class="mb-4">
            <label class="form-label text-primary fw-semibold mb-1 d-block">보낸 기업</label>
            <div class="text-dark fs-7">{{ scoutDetail.companyName || scoutDetail.company_name || scoutDetail.sender_company_name || '기업명 없음' }}</div>
          </div>

          <!-- 연관 프로젝트 -->
          <div class="mb-3">
            <label class="form-label text-primary fw-semibold mb-1 d-block">연관 프로젝트</label>
            <div class="text-dark fs-7">{{ scoutDetail.projectTitle || scoutDetail.project_ttl || '연관 프로젝트 없음' }}</div>
          </div>

          <!-- 제안 제목 -->
          <div class="mb-3">
            <label class="form-label text-primary fw-semibold mb-1 d-block">제안 제목</label>
            <div class="text-dark fs-7">{{ scoutDetail.title || scoutDetail.scout_offer_ttl || '제목 없음' }}</div>
          </div>

          <!-- 제시 단가 -->
          <div class="mb-3">
            <label class="form-label text-primary fw-semibold mb-1 d-block">제시 단가</label>
            <div class="text-dark fs-7">{{ formatPay(scoutDetail.offeredPay || scoutDetail.offered_pay) }}</div>
          </div>

          <!-- 제안 내용 -->
          <div class="mb-2">
            <label class="form-label text-primary fw-semibold mb-1 d-block">제안 내용</label>
            <div
              class="p-3 bg-white rounded border"
              style="min-height: 120px; white-space: pre-wrap; word-break: break-all;"
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
        <div class="modal-footer d-flex justify-content-end">
          <div>
            <template v-if="scoutDetail && (scoutDetail.status === 'PENDING' || scoutDetail.status === '대기중')">
              <button
                type="button"
                class="btn btn-primary px-3 me-2"
                @click="handleRespond('ACCEPTED')"
              >
                수락하기
              </button>
              <button
                type="button"
                class="btn btn-reject-custom px-3 py-2 fw-bold"
                @click="handleReject"
              >
                거절하기
              </button>
            </template>
          </div>
          <button
            type="button"
            class="btn btn-outline-secondary px-3"
            @click="closeModal"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  </div>
  </Teleport>
</template>


<script setup>
/* global defineProps, defineEmits, defineExpose */
import { ref } from 'vue'
import { api } from '@/axios.js'
import { useModalStore } from '@/fo/stores/modalStore'
import CommonConfirmModal from '@/fo/components/common/CommonConfirmModal.vue'
import ScoutRejectModal from '@/fo/components/scout/ScoutRejectModal.vue'

const emit = defineEmits(['refresh'])
const modalStore = useModalStore()

const modalRef = ref(null)
const scoutDetail = ref(null)
const isLoading = ref(false)
let modalInstance = null

const props = defineProps({
  scoutSq: { type: [Number, String], required: false, default: null },
})

const getScoutSq = () => {
  if (!scoutDetail.value) return props.scoutSq || null
  return (
    scoutDetail.value.scoutsSq ??
    scoutDetail.value.scouts_sq ??
    scoutDetail.value.scoutSq ??
    scoutDetail.value.scout_sq ??
    scoutDetail.value.sq ??
    props.scoutSq
  )
}

const handleReject = () => {
  const targetSq = getScoutSq()

  if (!targetSq || targetSq === 'null' || targetSq === 'undefined') {
    console.error('유효하지 않은 scoutSq입니다:', targetSq, scoutDetail.value)
    alert('제안 정보 식별자를 찾을 수 없습니다.')
    return
  }

  const targetCompany = scoutDetail.value?.companyName || scoutDetail.value?.company_name || scoutDetail.value?.corpNm || ''
  const targetTitle = scoutDetail.value?.title || scoutDetail.value?.scout_offer_ttl || ''

  modalStore.openModal(ScoutRejectModal, {
    scoutSq: targetSq,
    companyName: targetCompany,
    title: targetTitle,
    onConfirm: async (reason) => {
      try {
        await api.$patch(`/v1/scouts/${targetSq}/reject`, {
          rejectReason: reason,
        })
        modalStore.closeModal()
        closeModal()
        emit('refresh')
      } catch (e) {
        console.error('스카우트 거절 처리 실패:', e)
      }
    },
    onCancel: () => {
      modalStore.closeModal()
    },
  })
}

const openModal = async (scoutSqParam) => {
  const targetSq = scoutSqParam || props.scoutSq
  if (!targetSq) {
    console.error('유효하지 않은 scoutSq입니다:', targetSq)
    return
  }

  if (modalRef.value) {
    const bootstrapObj = window.bootstrap || window.Bootstrap
    if (bootstrapObj?.Modal) {
      modalInstance = bootstrapObj.Modal.getOrCreateInstance(modalRef.value)
      modalInstance.show()
    }
  }

  await fetchScoutDetail(targetSq)
}

const fetchScoutDetail = async (scoutSq) => {
  isLoading.value = true
  scoutDetail.value = null

  try {
    const response = await api.$get(`/v1/scouts/${scoutSq}`, { 
      withCredentials: true,
    })
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

const handleRespond = (status) => {
  if (!scoutDetail.value) return

    const scoutSq = 
    scoutDetail.value.scouts_sq ?? 
    scoutDetail.value.scoutsSq ?? 
    scoutDetail.value.scoutSq ?? 
    scoutDetail.value.scout_sq ??
    scoutDetail.value.sq;
  
    if (!scoutSq) {
    console.error('스카우트 식별자(scoutSq)를 찾을 수 없습니다.', scoutDetail.value)
    alert('제안 정보 식별자를 찾을 수 없습니다.')
    return
  }

  if (!scoutSq || scoutSq === 'null') {
    console.error('유효하지 않은 scoutSq 입니다:', scoutDetail.value);
    alert('제안 정보 식별자가 유효하지 않습니다.');
    return;
  }

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




function formatPay(pay) {
  if (!pay || isNaN(pay)) return '협의'
  return `${Number(pay).toLocaleString()}원`
}

defineExpose({
  openModal,
  closeModal,
})


</script>

<style scoped>

#scoutDetailModal {
  z-index: 1060 !important;
}

.modal-title {
  font-size: 1.35rem !important;
  letter-spacing: -0.5px;
}

.btn-reject-custom {
  background-color: #ffffff !important;
  color: #dc3545 !important;
  border: 1px solid #dc3545 !important;
  transition: all 0.15s ease-in-out;
}

.btn-reject-custom:hover {
  background-color: #dc3545 !important;
  color: #ffffff !important;
  border-color: #dc3545 !important;
}

</style>

<style>
#scoutDetailModal ~ .modal-backdrop {
  z-index: 1050 !important;
}
</style>