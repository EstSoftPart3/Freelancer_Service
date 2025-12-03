<template>
  <div class="notification-page">
    <div class="header">
      <h1>알림 내역</h1>
    </div>
    <div class="notification-list">
      <div v-if="isEmpty" class="text-center py-5 text-muted">
        알림 내역이 없습니다.
      </div>
      <div
        v-else
        v-for="notification in notifications"
        :key="notification.notificationSq"
        class="notification-item"
        :class="{ unread: notification.notificationIsReadYn === 'N' }"
        @click="handleNotificationClick(notification)"
      >
        <div class="item-content">
          <div class="item-title">{{ notification.notificationTtl }}</div>
          <div class="item-subtitle">
            {{ truncateText(notification.notificationTxt, 15) }}
          </div>
        </div>

        <div class="item-right-final">
          <div class="info-group">
            <span class="date-label">{{
              formatDate(notification.notificationCreatedAtDtm)
            }}</span>
            <a
              class="btn btn-rounded"
              :class="
                notification.notificationIsReadYn === 'N'
                  ? 'btn-unread'
                  : 'btn-read'
              "
            >
              {{
                notification.notificationIsReadYn === 'N' ? '읽지않음' : '읽음'
              }}
            </a>
          </div>

          <button
            class="btn-delete"
            @click.stop.prevent="deleteNotification(notification)"
            title="알림 삭제"
          >
            <svg
              class="icon-delete"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from '@/axios'

export default {
  name: 'NotificationPage',
  data() {
    return {
      notifications: [],
    }
  },
  computed: {
    isEmpty() {
      return this.notifications.length === 0
    },
  },
  created() {
    this.fetchNotifications()
  },
  methods: {
    truncateText(text, maxlength = 15) {
      if (!text || text.length <= maxlength) {
        return text
      }
      return text.substring(0, maxlength) + '...'
    },
    async fetchNotifications() {
      try {
        const response = await api.$get(`/notifications/page`)
        this.notifications = response.output?.notifications || []
      } catch (error) {
        console.error('알림 조회 실패 : ', error)
      }
    },

    async handleNotificationClick(notification) {
      console.log('알림 클릭 : ', notification)
      if (notification.notificationIsReadYn === 'N') {
        try {
          await api.$patch(`/notifications/${notification.notificationSq}`, {
            notificationIsReadYn: 'Y',
          })
          notification.notificationIsReadYn = 'Y'
        } catch (error) {
          console.error('읽음 상태 변경 실패 :', error)
        }
      }
      this.navigateToTarget(notification)
    },

    async toggleReadStatus(notification) {
      try {
        const newStatus = notification.notificationIsReadYn === 'N' ? 'Y' : 'N'

        await api.$patch(`/notifications/${notification.notificationSq}`, {
          notificationIsReadYn: newStatus,
        })

        notification.notificationIsReadYn = newStatus
      } catch (error) {
        console.error('읽음 상태 변경 실패 :', error)
      }
    },

    async deleteNotification(notification) {
      try {
        if (!confirm('이 알림을 삭제하시겠습니까?')) {
          return
        }
        // 디버깅: 토큰 확인
        const token = localStorage.getItem('accessToken')
        console.log('AccessToken 존재 여부:', !!token)
        console.log(
          '삭제 요청 URL:',
          `/notifications/${notification.notificationSq}`,
        )

        await api.$delete(`/notifications/${notification.notificationSq}`)

        // 로컬 목록에서 제거
        this.notifications = this.notifications.filter(
          (n) => n.notificationSq !== notification.notificationSq,
        )
        alert('알림이 삭제되었습니다.')
      } catch (error) {
        console.error('알림 삭제 실패:', error)
        console.error('에러 응답:', error.response?.data)
        alert('알림 삭제에 실패했습니다.')
      }
    },

    navigateToTarget(notification) {
      const targetType = notification.notificationTargetTypeCd
      const targetSq = notification.notificationTargetSq
      const parentSq = notification.notificationTargetParentSq
      switch (targetType) {
        case 2201: //답변
          if (!parentSq) {
            console.error(
              'notificationTargetParentSq가 없습니다:',
              notification,
            )
            alert('잘못된 알림 데이터입니다.')
            return
          }
          this.$router.push(`/qna/${parentSq}`)
          break
        case 2202: //댓글
          if (!parentSq) {
            console.error(
              'notificationTargetParentSq가 없습니다:',
              notification,
            )
            alert('잘못된 알림 데이터입니다.')
            return
          }
          this.$router.push(`/qna/${parentSq}`)
          break
        case 1:
          this.$router.push(`/projects/${targetSq}`)
          break
        case 2:
          this.$router.push(`/announcements/${targetSq}`)
          break
        case 3:
          this.$router.push(`/interviews/${targetSq}`)
          break
        case 5:
          this.$router.push(`/applications/${targetSq}`)
          break
        default:
          console.log('알 수 없는 타입:', targetType)
      }
    },

    formatDate(dateTime) {
      if (!dateTime) return ''

      const date = new Date(dateTime)
      const now = new Date()
      const diff = now - date

      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (minutes < 1) return '방금전'
      if (minutes < 60) return `${minutes}분 전`
      if (hours < 24) return `${hours}시간 전`
      if (days === 0) return '오늘'
      if (days === 1) return '어제'
      if (days < 7) return `${days}일 전`

      const month = date.getMonth() + 1
      const day = date.getDate()
      const hour = date.getHours()
      const minute = date.getMinutes()

      return `${month}.${day} ${hour}:${minute.toString().padStart(2, '0')}`
    },
  },
}
</script>
<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.notification-page {
  max-width: 600px;
  margin: 0 auto;
  background-color: white;
  min-height: 100vh;
}

.header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
}

.notification-item {
  display: flex;
  /* align-items: flex-start; 대신 center를 사용해 X 버튼을 수직 중앙에 배치 */
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #fafafa;
}

.notification-item.unread {
  background-color: #f8f9ff;
}

.item-content {
  flex: 1; /* 남은 공간 모두 차지 */
}

.item-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.item-subtitle {
  font-size: 13px;
  color: #666;
}

/* ✅ 새로운 item-right-final 스타일 */
.item-right-final {
  display: flex;
  align-items: center; /* 자식 요소들을 수직 중앙에 정렬 */
  margin-left: 12px;
  flex-shrink: 0;
  /* min-width 제거: 내용물 크기만큼만 공간을 차지하도록 */
}

/* ✅ 날짜와 읽음 버튼을 감싸는 그룹 (세로 정렬) */
.info-group {
  display: flex;
  flex-direction: column; /* 세로 정렬 */
  align-items: flex-end; /* 그룹 내 요소를 오른쪽 정렬 */
  gap: 4px;
}

.date-label {
  font-size: 12px;
  color: #999;
}

/* Porto Template Button Styles */
.btn {
  display: inline-block;
  padding: 8px 18px; /* 기존 패딩 유지 */
  font-size: 12px;
  font-weight: 600;
  line-height: 1.42857143;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  border: 1px solid transparent;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-rounded {
  border-radius: 20px;
  /* ✅ min-width 제거하여 내용물 크기에 맞게 너비 자동 조정 */
  /* min-width: 80px; 삭제 */
  padding: 4px 12px; /* ✅ 패딩을 줄여서 버튼이 글자에 더 가깝게 달라붙도록 조정 */
}

.btn-unread {
  color: #333;
  background-color: #e8f5e9;
  border-color: #e8f5e9;
}

/* .btn-unread:hover {
  background-color: #c8e6c9;
  border-color: #a5d6a7;
} */

.btn-read {
  color: #333;
  background-color: #ffc0cb;
  border-color: #ffc0cb;
}

/* .btn-read:hover {
  background-color: #ffb3c1;
  border-color: #ff9eae;
} */

/* ✅ 삭제 버튼: 왼쪽 마진을 주어 오른쪽 끝으로 밀어냅니다. */
.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: 8px; /* 날짜 그룹과의 간격 */
  /* margin-right: -4px; /* 오른쪽 여백을 더 줄이고 싶다면 음수 마진 사용 가능 */
}

.btn-delete:hover {
  background-color: #ffebee;
  border-radius: 4px;
}
.icon-delete {
  width: 16px;
  height: 16px;
  color: #999;
}

.btn-delete:hover .icon-delete {
  color: #f44336;
}
</style>
