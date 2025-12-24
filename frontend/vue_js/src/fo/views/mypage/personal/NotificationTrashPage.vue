<template>
  <div class="notification-page">
    <div class="header">
      <h1>휴지통</h1>
    </div>

    <!-- 액션 바 -->
    <div class="trash-actions" v-if="!isEmpty">
      <label class="check-all">
        <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
        <span>전체 선택</span>
      </label>

      <div class="action-buttons">
        <button class="action-btn restore" :disabled="selectedIds.length === 0" @click="restoreSelected">
          복구
        </button>
        <button class="action-btn delete" :disabled="selectedIds.length === 0" @click="deleteSelected">
          영구삭제
        </button>
      </div>
    </div>

    <div class="notification-list">
      <div v-if="isEmpty" class="empty-state">
        휴지통에 알림이 없습니다.
      </div>

      <div
        v-else
        v-for="notification in notifications"
        :key="notification.notificationSq"
        class="notification-item"
        @click="handleRowClick(notification)"
      >
        <!-- 체크박스 -->
        <div class="checkbox-wrap" @click.stop.prevent>
          <input
            type="checkbox"
            :checked="selectedMap[notification.notificationSq] === true"
            @change="toggleOne(notification.notificationSq)"
          />
        </div>

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

          <!-- 단건 복구 -->
          <button
            class="btn-mini restore"
            @click.stop.prevent="restoreOne(notification.notificationSq)"
            title="복구"
          >
            복구
          </button>

          <!-- 단건 영구삭제 -->
          <button
            class="btn-mini delete"
            @click.stop.prevent="deleteOne(notification.notificationSq)"
            title="영구삭제"
          >
            삭제
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
  name: 'NotificationTrashPage',

  data() {
    return {
      notifications: [],
      size: 10,
      currentPage: 1,
      maxKnownPage: 1,
      totalCount: 0,

      // ✅ 체크박스 선택 상태
      selectedMap: {}, // { [notificationSq]: true/false }
    }
  },

  computed: {
    isEmpty() {
      return this.notifications.length === 0
    },

    pages() {
      return Array.from({ length: this.maxKnownPage }, (_, i) => i + 1)
    },

    selectedIds() {
      return Object.keys(this.selectedMap)
        .filter((k) => this.selectedMap[k] === true)
        .map((k) => Number(k))
    },

    isAllSelected() {
      if (this.notifications.length === 0) return false
      return this.notifications.every((n) => this.selectedMap[n.notificationSq] === true)
    },
  },

  created() {
    this.fetchTrash(1)
  },

  methods: {
    // =====================
    // Utils (NotificationPage.vue 그대로)
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
    async fetchTrash(page = 1) {
      try {
        const response = await api.$get('/notifications/trash', {
          params: { page, size: this.size },
        })

        const output = response?.output ?? {}

        this.notifications = Array.isArray(output.notifications) ? output.notifications : []
        this.currentPage = page

        // 페이지 바뀔 때: 현재 페이지에 없는 선택값은 제거 (UX 안정)
        const currentIds = new Set(this.notifications.map((n) => n.notificationSq))
        Object.keys(this.selectedMap).forEach((k) => {
          if (!currentIds.has(Number(k))) delete this.selectedMap[k]
        })

        if (typeof output.totalCount === 'number') {
          this.totalCount = output.totalCount
        }

        if (typeof output.totalPages === 'number' && output.totalPages > 0) {
          this.maxKnownPage = output.totalPages
        } else {
          if (output.hasNext === true) {
            this.maxKnownPage = Math.max(this.maxKnownPage, page + 1)
          } else {
            this.maxKnownPage = Math.max(this.maxKnownPage, page)
          }
        }

        console.log('🗑️ 휴지통 페이지(번호) 응답:', response)
      } catch (error) {
        console.error('휴지통 조회 실패 : ', error)
        this.notifications = []
        this.maxKnownPage = Math.max(1, this.currentPage)
      }
    },

    async restoreSelected() {
      try {
        if (this.selectedIds.length === 0) return
        if (!confirm('선택한 알림을 복구하시겠습니까?')) return

        await api.$post('/notifications/trash/restore', {
          notificationIds: this.selectedIds,
        })

        // 화면 반영: 선택된 항목 제거
        const selectedSet = new Set(this.selectedIds)
        this.notifications = this.notifications.filter((n) => !selectedSet.has(n.notificationSq))
        this.selectedMap = {}

        alert('선택한 알림이 복구되었습니다.')

        // 현재 페이지가 비었으면 이전 페이지로 보정
        if (this.notifications.length === 0 && this.currentPage > 1) {
          this.fetchTrash(this.currentPage - 1)
        }
      } catch (error) {
        console.error('복구 실패:', error)
        alert('복구에 실패했습니다.')
      }
    },

    async deleteSelected() {
      try {
        if (this.selectedIds.length === 0) return
        if (!confirm('선택한 알림을 영구삭제하시겠습니까?\n(삭제 후 복구 불가)')) return

        await api.$post('/notifications/trash/delete', {
          notificationIds: this.selectedIds,
        })

        const selectedSet = new Set(this.selectedIds)
        this.notifications = this.notifications.filter((n) => !selectedSet.has(n.notificationSq))
        this.selectedMap = {}

        alert('선택한 알림이 영구삭제되었습니다.')

        if (this.notifications.length === 0 && this.currentPage > 1) {
          this.fetchTrash(this.currentPage - 1)
        }
      } catch (error) {
        console.error('영구삭제 실패:', error)
        alert('영구삭제에 실패했습니다.')
      }
    },

    async restoreOne(notificationSq) {
      try {
        if (!confirm('이 알림을 복구하시겠습니까?')) return

        await api.$post('/notifications/trash/restore', {
          notificationIds: [notificationSq],
        })

        this.notifications = this.notifications.filter((n) => n.notificationSq !== notificationSq)
        delete this.selectedMap[notificationSq]

        alert('알림이 복구되었습니다.')

        if (this.notifications.length === 0 && this.currentPage > 1) {
          this.fetchTrash(this.currentPage - 1)
        }
      } catch (error) {
        console.error('단건 복구 실패:', error)
        alert('복구에 실패했습니다.')
      }
    },

    async deleteOne(notificationSq) {
      try {
        if (!confirm('이 알림을 영구삭제하시겠습니까?\n(삭제 후 복구 불가)')) return

        await api.$post('/notifications/trash/delete', {
          notificationIds: [notificationSq],
        })

        this.notifications = this.notifications.filter((n) => n.notificationSq !== notificationSq)
        delete this.selectedMap[notificationSq]

        alert('알림이 영구삭제되었습니다.')

        if (this.notifications.length === 0 && this.currentPage > 1) {
          this.fetchTrash(this.currentPage - 1)
        }
      } catch (error) {
        console.error('단건 영구삭제 실패:', error)
        alert('영구삭제에 실패했습니다.')
      }
    },

    // =====================
    // Checkbox
    // =====================
    toggleOne(notificationSq) {
      this.selectedMap[notificationSq] = !this.selectedMap[notificationSq]
    },

    toggleSelectAll(e) {
      const checked = e.target.checked
      this.notifications.forEach((n) => {
        this.selectedMap[n.notificationSq] = checked
      })
    },

    // Row 클릭 시 체크 토글(UX 편의)
    handleRowClick(notification) {
      const sq = notification.notificationSq
      this.selectedMap[sq] = !this.selectedMap[sq]
    },

    // =====================
    // Pagination Actions
    // =====================
    goPage(page) {
      if (page < 1) return
      if (page > this.maxKnownPage) return
      if (page === this.currentPage) return
      this.fetchTrash(page)
    },

    goPrev() {
      if (this.currentPage <= 1) return
      this.goPage(this.currentPage - 1)
    },

    goNext() {
      if (this.currentPage >= this.maxKnownPage) return
      this.goPage(this.currentPage + 1)
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

/* ✅ 상단 액션 바 */
.trash-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
}

.check-all {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  user-select: none;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  border: 1px solid #e0e0e0;
  background: #fff;
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-btn.restore {
  border-color: #0088cc;
  color: #0088cc;
}

.action-btn.delete {
  border-color: #f44336;
  color: #f44336;
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

.checkbox-wrap {
  margin-right: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
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

/* ✅ 우측 미니 버튼 */
.btn-mini {
  border: 1px solid #e0e0e0;
  background: #fff;
  padding: 6px 10px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  margin-left: 8px;
}

.btn-mini.restore {
  border-color: #0088cc;
  color: #0088cc;
}

.btn-mini.delete {
  border-color: #f44336;
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
