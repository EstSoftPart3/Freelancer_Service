<template>
  <transition name="fade">
    <div
      v-if="visible"
      :class="['alert', alertClass, 'alert-dismissible', 'fade', 'show']"
      role="alert"
    >
      <button
        type="button"
        class="btn-close"
        @click="hide"
        aria-label="Close"
      />
      <strong class="me-2">
        <i
          :class="{
            'fa-solid fa-check': type === 'success',
            'fas fa-exclamation-triangle': type === 'danger',
          }"
        ></i>
        {{ type === 'danger' ? ' 실패!' : ' 성공!' }}
      </strong>
      {{ message }}
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAlertStore } from '@/fo/stores/alertStore'

const alertStore = useAlertStore()
const { visible, message, type } = storeToRefs(alertStore)
const { hide } = alertStore

const alertClass = computed(() => {
  switch (type.value) {
    case 'danger':
      return 'alert-danger'
    case 'success':
      return 'alert-info'
    default:
      return 'alert-info'
  }
})
</script>

<style scoped>
.alert {
  position: fixed;
  top: 115px; /* 고정 위치 */
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  pointer-events: none;
  max-width: 500px;
  width: 90%;
}

.alert * {
  pointer-events: all; /* 내부 버튼은 클릭 가능하도록 */
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
