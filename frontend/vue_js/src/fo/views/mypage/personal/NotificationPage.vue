<template>
  <div class="notification-page">
    <div class="header">
      <h1>알림 내역</h1>
    </div>

    <div class="notification-list">
      <div v-if="isEmpty" class="empty-state">
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
          <div class="item-title">
            {{ notification.notificationTtl }}
          </div>
          <div class="item-subtitle">
            {{ truncateText(notification.notificationTxt, 15) }}
          </div>
        </div>

        <div class="item-right-final">
          <div class="info-group">
            <span class="date-label">
              {{ formatDate(notification.notificationCreatedAtDtm) }}
            </span>

            <a
              class="btn btn-rounded"
              :class="notification.notificationIsReadYn === 'N' ? 'btn-unread' : 'btn-read'"
            >
              {{ notification.notificationIsReadYn === 'N' ? '읽지않음' : '읽음' }}
            </a>
          </div>

          <button
            class="btn-delete"
            @click.stop.prevent="deleteNotification(notification)"
            title="알림 삭제"
          >
            <svg class="icon-delete" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!isEmpty" class="pagination-wrap">
      <button class="page-btn" @click="goPrev" :disabled="currentPage === 1">
        이전
      </button>

      <button
        v-for="p in pages"
        :key="p"
        class="page-num"
        :class="{ active: p === currentPage }"
        @click="goPage(p)"
      >
        {{ p }}
      </button>

      <button class="page-btn" @click="goNext" :disabled="currentPage >= maxKnownPage">
        다음
      </button>
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
      size: 10,
      currentPage: 1,

      /**
       * 백엔드가 totalPages를 내려주면 그 값을 사용.
       * totalPages가 없고 hasNext만 있으면, "알려진 페이지"를 page+1로 늘려가며 사용.
       */
      maxKnownPage: 1,

      // (옵션) 백엔드가 totalCount를 주면 저장해둘 수 있음
      totalCount: 0,
    }
  },

  computed: {
    isEmpty() {
      return this.notifications.length === 0
    },

    pages() {
      return Array.from({ length: this.maxKnownPage }, (_, i) => i + 1)
    },
  },

  created() {
    this.fetchNotifications(1)
  },

  methods: {
    // =====================
    // Utils
    // =====================
    stripHTML(html) {
      if (!html) return ''
      return html.replace(/<[^>]*>/g, '').trim()
    },

    truncateText(text, maxlength = 15) {
      if (!text) return ''
      const cleanText = this.stripHTML(text)
      if (cleanText.length <= maxlength) return cleanText
      return cleanText.substring(0, maxlength) + '...'
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

    // =====================
    // API
    // =====================
    async fetchNotifications(page = 1) {
      try {
        /**
         * ✅ 핵심 수정:
         * 기존: /notifications/page
         * 변경: /notifications/page-number
         */
        const response = await api.$get('/notifications/page-number', {
          params: {
            page,
            size: this.size,
          },
        })

        // 공통 응답 형태: { status, message, output }
        const output = response?.output ?? {}

        // 알림 목록
        this.notifications = Array.isArray(output.notifications) ? output.notifications : []
        this.currentPage = page

        // totalCount / totalPages
        if (typeof output.totalCount === 'number') {
          this.totalCount = output.totalCount
        }

        if (typeof output.totalPages === 'number' && output.totalPages > 0) {
          // ✅ totalPages가 있으면 그 값 사용
          this.maxKnownPage = output.totalPages
        } else {
          // ✅ totalPages가 없으면 hasNext 기반으로 "알려진 페이지"만 늘림
          if (output.hasNext === true) {
            this.maxKnownPage = Math.max(this.maxKnownPage, page + 1)
          } else {
            this.maxKnownPage = Math.max(this.maxKnownPage, page)
          }
        }

        console.log('📦 알림 페이지(번호) 응답:', response)
      } catch (error) {
        console.error('알림 조회 실패 : ', error)
        // 실패 시 화면에 "없습니다"가 뜰 수 있으니, 데이터 초기화
        this.notifications = []
        this.maxKnownPage = Math.max(1, this.currentPage)
      }
    },

    // =====================
    // Pagination Actions
    // =====================
    goPage(page) {
      if (page < 1) return
      if (page > this.maxKnownPage) return
      if (page === this.currentPage) return
      this.fetchNotifications(page)
    },

    goPrev() {
      if (this.currentPage <= 1) return
      this.goPage(this.currentPage - 1)
    },

    goNext() {
      if (this.currentPage >= this.maxKnownPage) return
      this.goPage(this.currentPage + 1)
    },

    // =====================
    // Item Actions
    // =====================
    async handleNotificationClick(notification) {
      // 읽지 않은 알림이면 읽음 처리
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

      // 대상 이동
      this.navigateToTarget(notification)
    },

    async deleteNotification(notification) {
      try {
        if (!confirm('이 알림을 삭제하시겠습니까?')) return

        await api.$delete(`/notifications/${notification.notificationSq}`)
        this.notifications = this.notifications.filter(
          (n) => n.notificationSq !== notification.notificationSq,
        )
        alert('알림이 휴지통으로 이동되었습니다.')
      } catch (error) {
        console.error('알림 삭제 실패:', error)
        alert('알림 삭제에 실패했습니다.')
      }
    },

    navigateToTarget(notification) {
      const targetType = notification.notificationTargetTypeCd
      const targetSq = notification.notificationTargetSq
      const parentSq = notification.notificationTargetParentSq
      const title = notification.notificationTtl

      switch (targetType) {
        case 2201:
          // Q&A 답변
          this.$router.push({
            path: `/qna/${parentSq}`,
            hash: `#answer-${targetSq}`,
          })
          break

        case 2202:
          // 게시판 댓글
          this.$router.push({
            path: `/board/${parentSq}`,
            hash: `#comment-${targetSq}`,
          })
          break

        case 2204:
          // 지원 내역
          this.$router.push('mypage/appliedProjects')
          break

        case 2205:
          // 프로젝트 상세
          this.$router.push(`/project/spec/user/${targetSq}`)
          break

        case 2209:
          // Q&A 댓글
          this.$router.push({
            path: `/qna/${parentSq}`,
            hash: `#comment-${targetSq}`,
          })
          break

        case 2207:
          // 지원/스크랩 등
          if (title && title.includes('지원')) {
            if (targetSq) this.$router.push('mypage/appliedProjects')
          } else if (title && title.includes('스크랩')) {
            if (targetSq) this.$router.push(`/projects/${targetSq}`)
          }
          break

        default:
          console.log('알 수 없는 타입:', targetType)
      }
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

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.notification-item {
  display: flex;
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
  flex: 1;
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

.item-right-final {
  display: flex;
  align-items: center;
  margin-left: 12px;
  flex-shrink: 0;
}

.info-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.date-label {
  font-size: 12px;
  color: #999;
}

.btn {
  display: inline-block;
  padding: 8px 18px;
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
  padding: 4px 12px;
}

.btn-unread {
  color: #fff;
  background-color: #0088cc;
  border-color: #0088cc;
}

.btn-read {
  color: #fff;
  background-color: #dd4238;
  border-color: #dd4238;
}

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
  margin-left: 8px;
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

/* Pagination */
.pagination-wrap {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 24px 0 40px;
}

.page-btn,
.page-num {
  border: 1px solid #e0e0e0;
  background: #fff;
  padding: 10px 16px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-num.active {
  border-color: #0088cc;
  box-shadow: 0 0 0 2px rgba(0, 136, 204, 0.15);
  font-weight: 700;
}
</style>
