<template>
  <div>
    <div class="modal-header border-0 justify-content-center pb-0">
      <h5 class="modal-title fw-bold">출석체크 완료</h5>
      <button
        type="button"
        class="btn-close attendance-close"
        aria-label="Close"
        @click="closeModal"
      ></button>
    </div>

    <div class="modal-body text-center pt-3 pb-2">
      <p class="attendance-message mb-0">출석체크가 완료되었습니다.</p>
    </div>

    <div class="modal-footer border-0 justify-content-center pt-2 pb-4">
      <button type="button" class="btn btn-primary px-4" @click="closeModal">
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
.modal-title {
  font-size: 18px;
  color: #222;
}

.attendance-message {
  font-size: 15px;
  color: #555;
}

.attendance-close {
  position: absolute;
  right: 18px;
  top: 18px;
}
</style>
