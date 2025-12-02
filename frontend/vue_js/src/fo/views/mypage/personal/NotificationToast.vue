<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item"
        @click="removeToast(toast.id)"
      >
        <div class="toast-icon">
          <i class="bi bi-bell-fill"></i>
        </div>
        <div class="toast-content">
          <h6>{{ toast.title }}</h6>
          <p>{{ toast.message }}</p>
        </div>
        <button class="toast-close" @click.stop="removeToast(toast.id)">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </transition-group>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import { useNotificationStore } from '@/fo/stores/notificationStore'

const notificationStore = useNotificationStore()
const toasts = ref([])
let toastId = 0

watch(
  () => notificationStore.notifications,
  (newNotifications, oldNotifications) => {
    if (newNotifications.length > oldNotifications.length) {
      const newNotification = newNotifications[0]
      showToast(newNotification)
    }
  },
  { deep: true },
)

const showToast = (notification) => {
  const toast = {
    id: toastId++,
    title: notification.notificationTtl,
    message: notification.notificationTxt,
  }
  toasts.value.push(toast)

  setTimeout(() => {
    removeToast(toast.id)
  }, 5000)
}
const removeToast = (id) => {
  const index = toasts.value.findIndex((t) => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}
</script>
<style scoped>
.toast-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  min-width: 350px;
  max-width: 400px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.toast-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.toast-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-content h6 {
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toast-content p {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #999;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #333;
}

/* 애니메이션 */
.toast-enter-active {
  animation: toastIn 0.3s ease-out;
}

.toast-leave-active {
  animation: toastOut 0.3s ease-in;
}

@keyframes toastIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toastOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}

@media (max-width: 576px) {
  .toast-container {
    right: 10px;
    left: 10px;
  }

  .toast-item {
    min-width: auto;
    max-width: none;
  }
}
</style>
