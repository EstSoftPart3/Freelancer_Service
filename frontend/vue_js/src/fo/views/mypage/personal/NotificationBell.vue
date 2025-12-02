<template>
  <div class="notification-bell">
    <button
      class="bell-button"
      @click="toggleDropdown"
      :class="{ 'has-unread': unreadCount > 0 }"
    >
      <i class="bi bi-bell-fill"></i>
      <span v-if="unreadCount > 0" class="badge">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- 알림 드롭 다운-->
    <div v-if="showDropdown" class="notification-dropdown">
      <div class="dropdown-header">
        <h5>알림</h5>
        <button
          v-if="useNotificationStore.length > 0"
          class="btn-text"
          @click="markAllasRead"
        >
          전체읽음
        </button>
      </div>

      <div class="notification-list">
        <div v-if="notifications.length === 0" class="enmpty-state">
          <i class="bi bi-bell-slash"></i>
          <p>알림이 없습니다.</p>
        </div>

        <div
          v-for="notification in notifications"
          :key="notification.notificationSq"
          class="notification-item"
          :class="{ unread: notification.notificationIsReadYn !== 'Y' }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon">
            <i
              :class="getNotificationIcon(notification.notificationTypeCd)"
            ></i>
          </div>
          <div class="notification-content">
            <h6>{{ notification.notificationTtl }}</h6>
            <p>{{ notification.notificationTxt }}</p>
            <span class="time">{{ formatTime(notification.createdAt) }}</span>
          </div>
          <div
            v-if="notification.notificationIsReadYn !== 'Y'"
            class="unread-dot"
          ></div>
        </div>
      </div>

      <div v-if="notifications.length > 0" class="dropdown-footer">
        <button class="btn-view-all" @click="goToNotificationPage">
          전체알림보기
        </button>
      </div>
    </div>

    <!--배경 오버레이-->
    <div v-if="showDropdown" class="overlay" @click="closeDropdown"></div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/fo/stores/notificationStore'

const router = useRouter()
const notificationStore = useNotificationStore()

const showDropdown = ref(false)

const notifications = computed(() =>
  notificationStore.notifications.slice(0, 5),
)
const unreadCount = computed(() => notificationStore.unreadCount)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = () => {
  showDropdown.value = false
}

const handleNotificationClick = (notification) => {
  notificationStore.markAsRead(notification.notificationSq)

  if (notification.notificationUrl) {
    router.push(notification.notificaionUrl)
  }
  closeDropdown()
}

const markAllasRead = () => {
  notificationStore.markAllAsRead()
}

const goToNotificationPage = () => {
  router.push('/notifications')
  closeDropdown()
}

const getNotificationIcon = (typeCd) => {
  const iconMap = {
    1001: 'bi bi-briefcase-fill', // 프로젝트
    1002: 'bi bi-person-fill', // 지원자
    1003: 'bi bi-check-circle-fill', // 승인
    1004: 'bi bi-x-circle-fill', //거절
  }
  return iconMap[typeCd] || 'bi bi-bell-fill'
}

const formatTime = (dateString) => {
  if (!dateString) return ''

  const now = new Date()
  const date = new Date(dateString)
  const diff = Math.floor((now - date) / 1000) // 초 단위

  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`

  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.bell-button {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.3rem;
  color: #666;
  padding: 0.5rem;
  transition: color 0.2s;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.bell-button:hover {
  color: #0088cc;
  background: #f8f9fa;
}

.bell-button.has-unread {
  color: #0088cc;
  animation: bellRing 1s ease-in-out;
}

@keyframes bellRing {
  0%,
  100% {
    transform: rotate(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: rotate(-10deg);
  }
  20%,
  40%,
  60%,
  80% {
    transform: rotate(10deg);
  }
}

.badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ff4444;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 0.65rem;
  font-weight: bold;
  min-width: 18px;
  text-align: center;
  line-height: 1;
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 380px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e9ecef;
}

.dropdown-header h5 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: bold;
}

.btn-text {
  background: none;
  border: none;
  color: #0088cc;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
}

.btn-text:hover {
  text-decoration: underline;
}

.notification-list {
  flex: 1;
  overflow-y: auto;
  max-height: 350px;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
}

.notification-item {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.notification-item:hover {
  background: #f8f9fa;
}

.notification-item.unread {
  background: #f0f8ff;
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e3f2fd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0088cc;
  font-size: 1.2rem;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-content h6 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-content p {
  margin: 0 0 0.25rem 0;
  font-size: 0.85rem;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-content .time {
  font-size: 0.75rem;
  color: #999;
}

.unread-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0088cc;
  margin-top: 0.5rem;
}

.dropdown-footer {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #e9ecef;
}

.btn-view-all {
  width: 100%;
  padding: 0.5rem;
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view-all:hover {
  background: #f8f9fa;
  border-color: #0088cc;
  color: #0088cc;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

@media (max-width: 576px) {
  .notification-dropdown {
    width: calc(100vw - 2rem);
    right: -1rem;
  }
}
</style>
