<template>
  <div>
    <div class="row">
      <div class="col">
        <h4 class="mb-3" style="font-size: 24px">알림 내역</h4>
      </div>
    </div>

    <!-- 필터 UI -->
    <div class="row align-items-center mt-3 mb-2">
      <div class="col-md-12 d-flex justify-content-end gap-2">
        <select v-model="searchType" class="form-select form-select-sm w-auto">
          <option value="ALL">전체</option>
          <option value="CATEGORY">카테고리</option>
          <option value="CONTENT">내용</option>
        </select>
        <input
          v-model="searchKeyword"
          @keyup.enter="handleSearch"
          type="text"
          class="form-control form-control-sm w-auto"
          placeholder="검색어 입력"
        />

        <button class="btn btn-primary btn-sm" @click="handleSearch">
          검색
        </button>
      </div>
    </div>

    <div class="row">
      <div class="col pt-2 mt-1">
        <hr class="my-2" />
      </div>
    </div>

    <div class="row">
      <div class="col">
        <ul class="simple-post-list m-0 position-relative">
          <li
            v-for="item in notifications"
            :key="item.notificationSq"
            :class="{ 'notification-unread': item.notificationReadYn !== 'Y' }"
            style="border-bottom: 1px rgb(230, 230, 230) solid"
          >
            <div class="post-info position-relative">
              <!-- 알림타입 + 제목 + 버튼 -->

              <span :class="['btn', 'btn-light', 'btn-sm', 'mb-2']">{{
                getNotificationTypeText(item.notificationTypeCd)
              }}</span>

              <div
                class="d-flex justify-content-between align-items-center gap-2"
              >
                <div class="flex-grow-1 overflow-hidden">
                  <router-link
                    :to="item.notificationTargetUrl || '#'"
                    class="text-decoration-none d-block"
                    @click="markAsRead(item)"
                  >
                    <div class="d-block text-5 m-0 text-truncate py-1">
                      {{ item.notificationContentTxt }}
                    </div>
                  </router-link>
                </div>

                <div class="d-flex gap-2 flex-shrink-0">
                  <!-- 읽음 / 삭제 버튼 -->

                  <button
                    v-if="item.notificationReadYn !== 'Y'"
                    class="btn btn-outline btn-primary btn-sm"
                    @click="markAsRead(item)"
                  >
                    읽음
                  </button>

                  <button
                    class="btn btn-outline btn-primary btn-sm"
                    @click="deleteAlert(item)"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <div
                class="d-flex justify-content-between align-items-center mt-2"
              >
                <!-- <div
                  class="post-meta text-4 me-3 flex-grow-1"
                  style="min-width: 0"
                >
                  <div class="mb-1">{{ item.content }}</div>
                </div> -->
                <div class="post-meta text-2">
                  {{ formatDate(item.notificationCreatedAtDtm) }}
                </div>
              </div>
            </div>
          </li>
          <li
            v-if="notifications.length === 0"
            class="text-center py-5 text-muted"
          >
            새로운 알림이 없습니다.
          </li>
        </ul>

        <!-- 페이징 -->
        <div class="mt-5 py-5">
          <ul class="pagination float-end">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a
                class="page-link"
                href="#"
                @click.prevent="changePage(currentPage - 1)"
              >
                <i class="fas fa-angle-left"></i>
              </a>
            </li>
            <li
              v-for="page in totalPages"
              :key="page"
              :class="['page-item', { active: page === currentPage }]"
            >
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{
                page
              }}</a>
            </li>
            <li
              class="page-item"
              :class="{ disabled: currentPage === totalPages }"
            >
              <a
                class="page-link"
                href="#"
                @click.prevent="changePage(currentPage + 1)"
              >
                <i class="fas fa-angle-right"></i>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { api } from '@/axios'
import { useUserStore } from '@/fo/stores/userStore'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useRoute, useRouter } from 'vue-router'
import { useModalStore } from '@/fo/stores/modalStore'
import { useNotificationStore } from '@/fo/stores/NotificationStore'
import CommonConfirmModal from '@/fo/components/common/CommonConfirmModal.vue'

const alertStore = useAlertStore()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn)
const notifications = ref([])
const searchType = ref('ALL')
const searchKeyword = ref(route.query.searchKeyword || '')
const currentPage = ref(Math.max(1, Number(route.query.page) || 1))
const itemsPerPage = 10
const totalPages = ref(1)
const modalStore = useModalStore()
const notificationStore = useNotificationStore()

// 날짜 포맷 함수 (yyyy.MM.dd)
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd}`
}

// API 호출
async function fetchNotifications() {
  try {
    const notificationTypeCd =
      searchType.value === 'CATEGORY'
        ? findNotificationTypeCd(searchKeyword.value)
        : null

    const params = {
      searchType: searchType.value,
      searchKeyword: searchKeyword.value,
      notificationTypeCd,
      page: currentPage.value,
      size: itemsPerPage,
    }
    const res = await api.$get('/notifications', { params })
    const output = res?.output ?? {}

    notifications.value = Array.isArray(output.notifications)
      ? output.notifications
      : []
    totalPages.value = output.totalPages ?? 1

    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
      fetchNotifications()
    }
    console.log('알림응답', res)
  } catch (e) {
    console.error('알림 목록 조회 실패:', e)
  }
}
watch(isLoggedIn, (newVal) => {
  if (newVal) {
    fetchNotifications()
  } else {
    notifications.value = []
  }
})
watch(
  () => notificationStore.notificationChanged,
  () => {
    fetchNotifications()
  },
)
onMounted(fetchNotifications)

const updateQuery = (params) => {
  router.replace({ query: { ...route.query, ...params } })
}

function handleSearch() {
  currentPage.value = 1

  updateQuery({
    page: 1,
    searchType: searchType.value,
    searchKeyword: searchKeyword.value || undefined,
  })
  fetchNotifications()
}

const deleteAlert = (notification) => {
  modalStore.openModal(CommonConfirmModal, {
    title: '알림 삭제',
    message: '정말 삭제하시겠습니까?',
    onConfirm: async () => {
      try {
        const res = await notificationStore.deleteNotification(
          notification.notificationSq,
        )
        // await api.$delete(`/notifications/${notification.notificationSq}`,)
        if (res.status === 'OK') {
          alertStore.show('삭제 완료되었습니다.', 'success')
          fetchNotifications()
        } else {
          alertStore.show(
            '삭제 실패: ' + (res.message || '오류 발생'),
            'danger',
          )
        }
      } catch (err) {
        alertStore.show(
          '삭제 실패: ' + (err?.response?.data?.message || err.message),
          'danger',
        )
      } finally {
        modalStore.closeModal()
      }
    },
  })
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  router.push({ query: { ...route.query, page } })
  fetchNotifications().then(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}
watch(
  () => route.query.page,
  (newPage) => {
    const page = Math.max(1, Number(newPage) || 1)
    if (page !== currentPage.value) {
      currentPage.value = page
      fetchNotifications().then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    }
  },
)

const markAsRead = async (notification) => {
  if (notification.notificationReadYn === 'Y') return
  try {
    // await api.$patch(`/notifications/${notification.notificationSq}`)
    // notification.notificationReadYn = 'Y'
    await notificationStore.markAsRead(notification)
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error)
  }
}

const notificationTypeMap = {
  댓글: 2601,
  프로젝트: 2602,
  소속: 2603,
  즐겨찾기: 2604,
  답변: 2605,
  공지사항: 2606,
}

const findNotificationTypeCd = (keyword) => {
  return Object.entries(notificationTypeMap).find(([name]) =>
    name.includes(keyword),
  )?.[1]
}

const getNotificationTypeText = (typeCd) => {
  switch (typeCd) {
    case 2601:
      return '댓글'
    case 2602:
      return '프로젝트'
    case 2603:
      return '소속'
    case 2604:
      return '즐겨찾기'
    case 2605:
      return '답변'
    case 2606:
      return '공지사항'
  }
}

// 목업 데이터
notifications.value = [
  {
    notificationSq: 1,
    notificationType: '댓글',
    content: '내 댓글에 새로운 답글이 달렸습니다.',
    notificationTargetUrl: '/project/123',
    createdAt: '2026-06-01',
    readYn: false,
  },
  {
    notificationSq: 2,
    notificationType: '공지사항',
    content: '시스템 점검 안내',
    notificationTargetUrl: '/project/123',
    createdAt: '2026-06-01',
    readYn: true,
  },
  {
    notificationSq: 3,
    notificationType: '프로젝트',
    content: '프로젝트 지원 결과가 변경되었습니다.',
    notificationTargetUrl: '/project/123',
    createdAt: '2026-05-31',
    readYn: false,
  },
  {
    notificationSq: 4,
    notificationType: '답변',
    content: '문의에 답변이 등록되었습니다.',
    notificationTargetUrl: '/project/123',
    createdAt: '2026-05-30',
    readYn: true,
  },
]
</script>

<style scoped>
.simple-post-list {
  list-style: none;
  padding-left: 0;
}
.notification-unread {
  background-color: #f0f4fa;
}
.post-info {
  padding: 0px 10px;
}
.notification-title {
  margin-bottom: 10px;
}

.notification-content {
  margin-bottom: 12px;
}
</style>
