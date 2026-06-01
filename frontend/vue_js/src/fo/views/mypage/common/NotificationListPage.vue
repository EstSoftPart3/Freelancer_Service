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
          <option value="전체">전체</option>
          <option value="제목">제목</option>
          <option value="내용">내용</option>
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
            v-for="item in scraps"
            :key="item.notificationSq"
            :class="{ 'notification-unread': !item.readYn }"
            style="border-bottom: 1px rgb(230, 230, 230) solid"
          >
            <div class="post-info position-relative">
              <!-- 알림타입 + 제목 + 버튼 -->

              <span :class="['btn', 'btn-light', 'btn-sm', 'mb-2']">{{
                item.notificationType
              }}</span>

              <div
                class="d-flex justify-content-between align-items-center gap-2"
              >
                <div class="flex-grow-1 overflow-hidden">
                  <a
                    href="#"
                    class="d-block text-5 m-0 text-truncate py-1"
                    @click.prevent="goToProjectDetail(item.projectSq)"
                  >
                    {{ item.title }}
                  </a>
                </div>

                <div class="d-flex gap-2 flex-shrink-0">
                  <!-- 읽음 / 삭제 버튼 -->

                  <button
                    v-if="!item.readYn"
                    class="btn btn-outline btn-primary btn-sm"
                    @click="removeScrap(item.projectSq)"
                  >
                    읽음
                  </button>

                  <button
                    class="btn btn-outline btn-primary btn-sm"
                    @click="deleteAlert(item.projectSq)"
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
                  {{ formatDate(item.createdAt) }}
                </div>
              </div>
            </div>
          </li>
          <li v-if="scraps.length === 0" class="text-center py-5 text-muted">
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
import { ref, watch } from 'vue'
import { api } from '@/axios'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/fo/stores/userStore'
import { useModalStore } from '@/fo/stores/modalStore'
import CommonConfirmModal from '@/fo/components/common/CommonConfirmModal.vue'

const alertStore = useAlertStore()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const scraps = ref([])
const searchType = ref(route.query.searchType || '전체')
const searchKeyword = ref(route.query.keyword || '')
const currentPage = ref(Math.max(1, Number(route.query.page) || 1))
const itemsPerPage = 5
const totalPages = ref(1)
const modalStore = useModalStore()

// 날짜 포맷 함수 (yyyy.MM.dd)
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd}`
}

function goToProjectDetail(projectSq) {
  if (userStore.userType === 'PERSONAL') {
    router.push({ name: 'UserProjectSpec', params: { project_sq: projectSq } })
  } else if (userStore.userType === 'COMPANY') {
    router.push({
      name: 'CompanyProjectSpec',
      params: { project_sq: projectSq },
    })
  }
}

// API 호출
async function fetchScraps() {
  try {
    const params = {
      searchType: searchType.value,
      searchKeyword: searchKeyword.value,
      page: currentPage.value,
      size: itemsPerPage,
    }
    const res = await api.$get('/mypage/projectScrap', { params })
    const output = res?.output ?? {}
    scraps.value = Array.isArray(output.content) ? output.content : []
    const totalCount = Number(output.totalCount ?? 0)
    totalPages.value = Math.max(1, Math.ceil(totalCount / itemsPerPage))
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  } catch (e) {
    console.error('알림 목록 조회 실패:', e)
  }
}
// const fetchNotifications = async () => {
//   if (!isLoggedIn.value) return
//   try {
//     const res = await api.$get(`/notifications`)
//     notifications.value = res
//   } catch (error) {
//     console.error('알림 목록 조회 실패:', error)
//   }
// }
// onMounted(fetchScraps)

const updateQuery = (params) => {
  router.replace({ query: { ...route.query, ...params } })
}

function handleSearch() {
  currentPage.value = 1
  updateQuery({
    page: 1,
    searchType: searchType.value !== '전체' ? searchType.value : undefined,
    keyword: searchKeyword.value || undefined,
  })
  fetchScraps()
}

const deleteAlert = () => {
  modalStore.openModal(CommonConfirmModal, {
    title: '알림 삭제',
    message: '선택한 알림을 삭제하시겠습니까?',
    onConfirm: async () => {
      alertStore.show('알림이 삭제되었습니다.', 'success')
      modalStore.closeModal()
    },
  })
}

async function removeScrap(projectSq) {
  try {
    const response = await api.$delete(`/mypage/projectScrap/${projectSq}`)

    if (response.status === 'OK') {
      if (scraps.value.length === 1 && currentPage.value > 1) {
        currentPage.value -= 1
        updateQuery({ page: currentPage.value })
      }
      await fetchScraps()
      alertStore.show('스크랩이 삭제되었습니다.', 'success')
    } else {
      alertStore.show('스크랩 삭제에 실패했습니다.', 'danger')
    }
  } catch (error) {
    alertStore.show('스크랩 삭제 중 오류가 발생했습니다.', 'danger')
    console.error(error)
  }
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  router.push({ query: { ...route.query, page } })
  fetchScraps().then(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}
watch(
  () => route.query.page,
  (newPage) => {
    const page = Math.max(1, Number(newPage) || 1)
    if (page !== currentPage.value) {
      currentPage.value = page
      fetchScraps().then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    }
  },
)
// 목업 데이터
scraps.value = [
  {
    notificationSq: 1,
    notificationType: '댓글',
    title: '내 댓글에 새로운 답글이 달렸습니다.',
    // content: '좋은 의견 감사합니다.',
    createdAt: '2026-06-01',
    readYn: false,
  },
  {
    notificationSq: 2,
    notificationType: '공지사항',
    title: '시스템 점검 안내',
    // content: '6월 10일 02:00 ~ 04:00 점검이 진행됩니다.',
    createdAt: '2026-06-01',
    readYn: true,
  },
  {
    notificationSq: 3,
    notificationType: '프로젝트',
    title: '프로젝트 지원 결과가 변경되었습니다.',
    // content: '지원한 프로젝트의 상태를 확인해 주세요.',
    createdAt: '2026-05-31',
    readYn: false,
  },
  {
    notificationSq: 4,
    notificationType: '답변',
    title: '문의에 답변이 등록되었습니다.',
    // content: '문의하신 내용에 대한 답변이 작성되었습니다.',
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
