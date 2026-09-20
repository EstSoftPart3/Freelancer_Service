<template>
  <div>
    <div class="row">
      <div class="col">
        <h4 class="mb-3 fw-bold" style="font-size: 24px">제안서 내역</h4>
      </div>
    </div>

    <!-- 필터 및 검색 바 -->
    <div class="row align-items-center mt-3 mb-2">
      <div class="col-md-6 d-flex gap-2">
        <button
          v-for="filter in readFilters"
          :key="filter.type"
          class="btn btn-primary fw-bold px-4 py-2 d-flex align-items-center gap-2 fs-6"
          :class="{ active: readType === filter.type }"
          @click="setReadFilter(filter.type)"
        >
          {{ filter.label }}
          <span class="badge bg-white text-primary fw-bold px-2 py-1">
            {{ filter.count }}
          </span>
        </button>
      </div>

      <div class="col-md-6 d-flex justify-content-end gap-2">
        <select v-model="searchType" class="form-select form-select-sm w-auto">
          <option value="all">전체</option>
          <option value="title">제목</option>
          <option value="company">기업명</option>
        </select>
        <input
          v-model="searchKeyword"
          type="text"
          class="form-control form-control-sm w-auto"
          placeholder="검색어 입력"
          @keyup.enter="handleSearch"
        />
        <button class="btn btn-primary btn-sm px-3" @click="handleSearch">
          검색
        </button>
      </div>
    </div>

    <div class="row">
      <div class="col pt-2 mt-1">
        <hr class="my-2" />
      </div>
    </div>

    <!-- 스카우트 제안 목록 -->
    <div class="row">
      <div class="col">
        <div
          v-if="scoutList.length === 0"
          class="text-muted py-5 text-center"
          style="font-size: 14px"
        >
          받은 스카우트 제안이 없습니다.
        </div>

        <ul v-else class="simple-post-list m-0 position-relative">
          <li
            v-for="item in scoutList"
            :key="getItemPk(item)"
            class="py-3"
            style="border-bottom: 1px rgb(230, 230, 230) solid"
          >
            <div class="post-info position-relative">
              <div class="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <a
                    href="#"
                    @click.prevent="openDetailModal(item)"
                    class="text-primary fw-bold fs-5 text-decoration-none title-hover"
                  >
                    {{ item.title }}
                  </a>
                </div>

                <div class="d-flex gap-2 align-items-center">
                  <template v-if="['PENDING', 'READ', '대기중', '열람'].includes(item.status)">
                    <button
                      class="btn btn-primary btn-sm px-3"
                      @click="handleRespond(item, 'ACCEPTED')"
                    >
                      수락
                    </button>
                    <button
                      class="btn btn-outline-secondary btn-sm px-3"
                      @click="handleRespond(item, 'REJECTED')"
                    >
                      거절
                    </button>
                  </template>
                  
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center mt-2 fs-6 text-muted">
                <div>
                  <span class="text-dark fw-bold">
                  기업명 
                  </span>
                  <span class="text-dark">{{ item.sender_company_name || item.companyName || item.company_name || '기업 정보 없음' }}</span>
                </div>
                <div>
                  <span class="text-dark fw-bold">
                  제안 일자
                  </span> 
                  <span class="text-dark">{{ formatDate(item.createdAt || item.created_at || item.created_date) }}</span>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center mt-1 fs-6 text-muted">
                <div>
                  <span class="text-dark fw-bold">
                  제시 단가 
                  </span>
                  | <span class="text-dark">{{ formatPay(item.offeredPay || item.offered_pay || item.pay) }}</span>
                </div>
                <div>
                  <span class="text-dark fw-bold">
                  상태
                  </span>
                    <span class="text-dark">{{ getStatusLabel(item.status) }}</span>
                </div>
              </div>
            </div>
          </li>
        </ul>

        <!-- 페이징 영역 -->
        <div v-if="scoutList.length > 0" class="mt-4 py-3">
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
              <a class="page-link" href="#" @click.prevent="changePage(page)">
                {{ page }}
              </a>
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

    <!-- 스카우트 상세 모달 -->
    <ScoutDetailModal 
      ref="scoutDetailModalRef" 
      @refresh="fetchScoutList" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/axios.js'
import { useModalStore } from '@/fo/stores/modalStore'
import CommonConfirmModal from '@/fo/components/common/CommonConfirmModal.vue'
import ScoutDetailModal from '@/fo/components/scout/ScoutDetailModal.vue'

const modalStore = useModalStore()
const route = useRoute()
const router = useRouter()
const scoutDetailModalRef = ref(null)

const searchType = ref(route.query.searchType || 'all')
const searchKeyword = ref(route.query.keyword || '')
const appliedSearchType = ref(route.query.searchType || 'all')
const appliedSearchKeyword = ref(route.query.keyword || '')

const readType = ref(route.query.readType || 'all')
const readFilters = ref([
  { type: 'all', label: '전체', count: 0 },
  { type: 'read', label: '열람', count: 0 },
  { type: 'unread', label: '미열람', count: 0 },
])

const currentPage = ref(Math.max(1, Number(route.query.page) || 1))
const itemsPerPage = 5
const totalPages = ref(1)

const scoutList = ref([])

onMounted(() => {
  fetchScoutList()
})

const fetchScoutList = async () => {
  try {
    let statusParam = null
    
    if (readType.value === 'read') {
      statusParam = 'READ'
    } else if (readType.value === 'unread') {
      statusParam = 'PENDING'
    }

    const response = await api.$get('/v1/scouts/my', {
      withCredentials: true,
      params: {
        offset: (currentPage.value - 1) * itemsPerPage,
        size: itemsPerPage,
        status: statusParam,
        searchType: appliedSearchKeyword.value ? appliedSearchType.value : null,
        keyword: appliedSearchKeyword.value || null,
      },
    })

    const resData = response.data || response.output || response || {}
    scoutList.value = resData.scouts || resData.list || []

    const counts = resData.counts || {}
    readFilters.value = [
      { type: 'all', label: '전체', count: counts.totalCount || 0 },
      { type: 'read', label: '열람', count: counts.readCount || 0 },
      { type: 'unread', label: '미열람', count: counts.unreadCount || 0 },
    ]
    
    if (resData.pageInfo) {
      totalPages.value = Math.max(1, resData.pageInfo.totalPages)
    } else if (resData.page_info) {
      totalPages.value = Math.max(1, resData.page_info.total_pages)
    } else if (resData.totalPages) {
      totalPages.value = Math.max(1, resData.totalPages)
    }
  } catch (e) {
    console.error('스카우트 제안 목록 불러오기 실패:', e)
  }
}

// PK 파싱 헬퍼 함수 (scouts_sq 우선 추출)
const getItemPk = (item) => {
  if (!item) return null
  return item.scouts_sq || item.scoutSq || item.scout_sq || item.scoutsSq || item.id
}

const updateQuery = (params) => {
  router.replace({ query: { ...route.query, ...params } })
}

const handleSearch = () => {
  currentPage.value = 1
  appliedSearchType.value = searchType.value
  appliedSearchKeyword.value = searchKeyword.value
  updateQuery({
    page: 1,
    searchType: searchType.value,
    keyword: searchKeyword.value || undefined,
    readType: readType.value !== 'all' ? readType.value : undefined,
  })
  fetchScoutList()
}

const setReadFilter = (type) => {
  readType.value = type
  currentPage.value = 1
  updateQuery({
    page: 1,
    readType: type !== 'all' ? type : undefined,
  })
  fetchScoutList()
}

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  router.push({ query: { ...route.query, page } })
  fetchScoutList()
}

watch(
  () => route.query.page,
  (newPage) => {
    const page = Math.max(1, Number(newPage) || 1)
    if (page !== currentPage.value) {
      currentPage.value = page
      fetchScoutList()
    }
  }
)

const openDetailModal = (item) => {
  const scoutSq = getItemPk(item)
  
  console.log('최종 추출된 scoutSq:', scoutSq)
  
  if (!scoutSq) {
    console.error('아이템에서 PK(scoutSq)를 찾을 수 없습니다. item 객체:', item)
    return
  }
  
  if (scoutDetailModalRef.value) {
    scoutDetailModalRef.value.openModal(scoutSq)
  }
}

const handleRespond = (item, status) => {
  const actionText = status === 'ACCEPTED' ? '수락' : '거절'
  const scoutSq = getItemPk(item)

  if (!scoutSq) return

  modalStore.openModal(CommonConfirmModal, {
    title: `스카우트 제안 ${actionText}`,
    message: `해당 제안을 ${actionText}하시겠습니까?`,
    onConfirm: async () => {
      try {
        await api.$patch(`/v1/scouts/${scoutSq}/status`, { status }, { withCredentials: true })
        await fetchScoutList()
        modalStore.closeModal()
      } catch (e) {
        console.error(`스카우트 ${actionText} 처리 실패:`, e)
      }
    },
  })
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`
}

function formatPay(pay) {
  if (!pay || isNaN(pay)) return '협의'
  return `${Number(pay).toLocaleString()}원 (월)`
}

function getStatusLabel(status) {
  switch (status) {
    case 'ACCEPTED':
    case '수락':
      return '수락됨'
    case 'REJECTED':
    case '거절':
      return '거절됨'
    case 'PENDING':
    case '대기중':
    default:
      return '대기중'
  }
}
</script>

<style scoped>
.simple-post-list {
  list-style: none;
  padding: 0;
}

.title-hover:hover {
  text-decoration: underline !important;
}

.fs-7 {
  font-size: 0.8rem;
}
</style>