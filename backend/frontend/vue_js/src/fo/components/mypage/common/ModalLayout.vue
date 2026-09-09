<template>
  <div>
    <!-- Backdrop -->
    <transition name="fade">
      <div
        v-show="isOpen"
        class="modal-backdrop fade"
        :class="{ show: isOpen }"
        @click="closeModal"
      ></div>
    </transition>

    <!-- Modal  -->
    <transition name="fade">
      <div
        v-show="isOpen"
        class="modal fade"
        :class="{ show: isOpen }"
        tabindex="-1"
        style="display: block"
      >
        <div :class="['modal-dialog', size]">
          <div class="modal-content">
            <slot></slot>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  size: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1050;
  display: none;
}

.modal.show {
  display: block;
}

.modal-dialog {
  position: relative;
  width: auto;
  margin: 1.75rem auto;
  max-width: 500px;
}

.modal-dialog.modal-lg {
  max-width: 800px;
}

.modal-dialog.modal-sm {
  max-width: 300px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
