<template>
  <div>
    <div class="modal-header">
      <h4 class="modal-title" id="defaultModalLabel">신고 하기</h4>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="modal"
        aria-hidden="true"
        @click="closeModal"
      ></button>
    </div>

    <div class="modal-body">
      <div v-if="reasons.length === 0" class="text-center py-3">
        <div
          class="spinner-border spinner-border-sm text-primary"
          role="status"
        ></div>
        <span class="ms-2">사유를 불러오는 중...</span>
      </div>

      <p v-else class="mb-3">신고 사유를 선택해주세요:</p>

      <form v-if="reasons.length > 0">
        <div
          class="form-check mb-2"
          v-for="item in reasons"
          :key="item.commonCodeSq"
        >
          <input
            class="form-check-input"
            type="radio"
            name="reportReason"
            :id="'reason' + item.commonCodeSq"
            :value="item.commonCodeSq"
            v-model="selectedReasonSq"
          />
          <label class="form-check-label" :for="'reason' + item.commonCodeSq">
            {{ item.commonCodeNm }}
          </label>
        </div>

        <div class="mt-3 text-area">
          <label for="customReason" class="form-label">상세 내용 입력</label>
          <textarea
            class="form-control"
            id="customReason"
            rows="3"
            placeholder="추가적인 신고 사유가 있다면 입력해주세요."
            v-model="customContent"
          ></textarea>
        </div>
      </form>
    </div>

    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-primary"
        @click="reportRegister"
        :disabled="!selectedReasonSq"
      >
        신고 제출
      </button>
      <button type="button" class="btn btn-light" @click="closeModal">
        닫기
      </button>
    </div>
  </div>
</template>

<script setup>
import { useModalStore } from '@/fo/stores/modalStore'
import CommonConfirmModal from '../common/CommonConfirmModal.vue'
import { api } from '@/axios'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useBoardStore } from '@/fo/stores/boardStore' // viewerSq 사용 위함
import { onMounted, ref, defineProps } from 'vue'

const modalStore = useModalStore()
const alertStore = useAlertStore()
const boardStore = useBoardStore()

const props = defineProps({
  reportTypeCd: { type: Number, default: 0 },
  sq: { type: Number, default: 0 },
})

const reasons = ref([]) // API로 받아올 사유 리스트
const selectedReasonSq = ref(null) // 선택된 공통 코드 SQ
const customContent = ref('') // 텍스트 영역 내용

// [추가] 컴포넌트 로드 시 신고 사유(2800) 목록 조회
onMounted(async () => {
  try {
    const res = await api.$get(`/report/codes/2800`)
    if (res.status === 'OK') {
      reasons.value = res.output
    }
  } catch (error) {
    alertStore.show('신고 사유를 불러오지 못했습니다.', 'danger')
  }
})

const closeModal = () => {
  modalStore.closeModal()
}

const reportRegister = () => {
  if (!selectedReasonSq.value) {
    alertStore.show('신고 사유를 선택해주세요', 'danger')
    return
  }

  modalStore.openModal(CommonConfirmModal, {
    title: '신고 등록',
    message: '신고하시겠습니까?',
    onConfirm: async () => {
      // [수정] 백엔드 DTO 규격에 맞춰 데이터 전송
      const res = await api.$post(`/report`, {
        userSq: boardStore.viewerSq || 2, // 로그인 사용자 SQ (fallback: 2)
        sq: props.sq, // 대상 게시글/댓글 SQ
        reportTypeCd: props.reportTypeCd, // 대상 유형 코드 (2001, 2002 등)
        reportReasonCd: selectedReasonSq.value, // 선택한 사유 코드 SQ
        reportReasonTxt: customContent.value.trim(), // 상세 입력 텍스트
      })

      if (res.status === 'CREATED') {
        alertStore.show('신고가 정상적으로 접수되었습니다.', 'success')
        // 새로고침 대신 모달만 닫거나 필요시 로직 처리
        modalStore.closeAllModals()
      } else {
        alertStore.show('신고 등록에 실패하였습니다.', 'danger')
      }
    },
  })
}
</script>
