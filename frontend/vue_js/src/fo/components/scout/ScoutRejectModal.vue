<template>
  <div class="modal fade show d-block reject-modal-backdrop" tabindex="-1" @click.self="closeModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border shadow-sm rounded-2 overflow-hidden" @click.stop>
        <!-- 헤더 -->
        <div class="modal-header py-3 border-bottom bg-white d-flex align-items-center justify-content-between">
          <h5 class="modal-title fs-5 fw-bold text-dark m-0">스카우트 제안 거절</h5>
          <button type="button" class="btn-close fs-6" @click="closeModal" aria-label="Close"></button>
        </div>

        <!-- 본문 -->
        <div class="modal-body p-4 bg-light">
          <div class="mb-3">
            <label class="form-label text-primary fw-bold mb-1">보낸 기업</label>
            <p class="text-dark m-0">{{ companyName }}</p>
          </div>

          <div class="mb-3">
            <label class="form-label text-primary fw-bold mb-1">제안 제목</label>
            <p class="text-dark m-0">{{ title }}</p>
          </div>

          <div class="mb-0">
            <label class="form-label text-primary fw-bold mb-2">
              거절 사유 입력 (선택)
            </label>
            <!-- 
              1. @keydown.stop / @keyup.stop: 키보드 이벤트 전파 차단
              2. @click.stop: 포커스 탈취 방지
            -->
            <textarea
              v-model="rejectReason"
              class="form-control bg-white text-dark p-3 border"
              rows="4"
              placeholder="거절 사유를 입력해주세요. (예: 현재 진행 중인 프로젝트 일정과 맞지 않아 참여가 어렵습니다.)"
              style="resize: none;"
              @keydown.stop
              @keyup.stop
              @click.stop
            ></textarea>
          </div>
        </div>

        <!-- 푸터 -->
        <div class="modal-footer border-top-0 pt-0 pe-4 pb-4 bg-light">
          <button
            type="button"
            class="btn btn-outline-danger fw-semibold px-3 py-2"
            @click="handleConfirm"
          >
            거절 확정
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary px-3 py-2"
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
/* global defineProps */
import { ref, onMounted } from 'vue'

const props = defineProps({
  scoutSq: { type: [Number, String], required: true },
  companyName: { type: String, default: '' },
  title: { type: String, default: '' },
  onConfirm: { type: Function, required: true },
  onCancel: { type: Function, default: () => {} },
})

const rejectReason = ref('')

onMounted(() => {
  document.addEventListener('focusin', (e) => e.stopPropagation(), true)
})

const handleConfirm = () => {
  props.onConfirm(rejectReason.value)
}

const closeModal = () => {
  props.onCancel()
}
</script>

<style scoped>
.reject-modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1090 !important; /* 기존 상세 모달(1080)보다 높은 z-index */
  pointer-events: auto !important;
}

.modal-content {
  border-radius: 12px;
  pointer-events: auto !important;
}

.form-control:focus {
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25) !important;
  background-color: #ffffff !important;
}
</style>