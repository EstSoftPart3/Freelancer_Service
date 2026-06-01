<template>
  <div class="attendance-complete-modal">
    <div class="modal-header border-0 justify-content-center">
      <h5 class="modal-title fw-bold">출석체크 완료</h5>

      <button
        type="button"
        class="btn-close attendance-close"
        aria-label="Close"
        @click="closeModal"
      ></button>
    </div>

    <div class="modal-body text-center">
      <p class="attendance-message">출석체크가 완료되었습니다.</p>
    </div>

    <div class="modal-footer border-0 justify-content-center">
      <button
        type="button"
        class="btn btn-primary attendance-btn"
        @click="closeModal"
      >
        확인
      </button>
    </div>
  </div>
</template>

<script setup>
import { useModalStore } from '@/fo/stores/modalStore'

const modalStore = useModalStore()

const closeModal = () => {
  modalStore.closeModal()
}
</script>

<style scoped>
.attendance-complete-modal {
  position: relative;
  padding: 28px 32px 32px;
  text-align: center;
}

.modal-header {
  padding: 0;
  margin-bottom: 18px;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #222;
}

.attendance-close {
  position: absolute;
  right: 18px;
  top: 18px;
}

.modal-body {
  padding: 0;
  margin-bottom: 24px;
}

.attendance-message {
  margin: 0;
  font-size: 15px;
  color: #555;
}

.modal-footer {
  padding: 0;
}

.attendance-btn {
  min-width: 88px;
  height: 42px;
  font-size: 15px;
  font-weight: 600;
}
</style>
