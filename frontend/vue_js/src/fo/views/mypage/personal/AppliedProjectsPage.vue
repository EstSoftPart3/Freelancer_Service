<template>
  <div>
    <div class="row">
      <div class="col">
        <h4 class="mb-3" style="font-size: 24px">프로젝트 지원 현황</h4>
      </div>
    </div>

    <!-- 🔽 필터 UI -->
    <div class="row align-items-center mt-3 mb-2">
      <!-- 좌측: 열람 필터 토글 버튼 -->
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

      <!-- 우측: 검색 영역 -->
      <div class="col-md-6 d-flex justify-content-end gap-2">
        <select v-model="searchType" class="form-select form-select-sm w-auto">
          <option value="all">전체</option>
          <option value="title">제목</option>
          <option value="company">회사명</option>
        </select>
        <input
          v-model="searchKeyword"
          type="text"
          class="form-control form-control-sm w-auto"
          placeholder="검색어 입력"
          @keyup.enter="handleSearch"
        />
        <button class="btn btn-primary btn-sm" @click="handleSearch">
          검색
        </button>
      </div>
    </div>
    <!-- 🔼 필터 UI -->

    <div class="row">
      <div class="col pt-2 mt-1">
        <hr class="my-2" />
      </div>
    </div>

    <div class="row">
      <div class="col">
        <div
          v-if="pagedApplications.length === 0"
          class="text-muted py-3"
          style="font-size: 14px"
        >
          지원한 프로젝트가 없습니다.
        </div>
        <ul class="simple-post-list m-0 position-relative">
          <li
            v-for="item in pagedApplications"
            :key="item.applicationSq"
            style="border-bottom: 1px rgb(230, 230, 230) solid"
          >
            <div class="post-info position-relative">
              <!-- 제목 + 회사명 + 지원상태 버튼 -->
              <div
                class="d-flex justify-content-between align-items-center gap-2"
              >
                <!-- 왼쪽: 제목 / 회사명 -->
                <div class="d-flex gap-2">
                  <a
                    @click.prevent="goToProjectSpec(item.projectSq)"
                    href="#"
                    class="text-5 m-0"
                    >{{ item.projectTitle }} / {{ item.companyTitle }}</a
                  >
                </div>

                <!-- 오른쪽: 상태 버튼들 -->
                <div class="d-flex gap-2">
                  <template v-if="item.applicantType === '지원중'">
                    <span class="btn btn-primary btn-sm">지원중</span>
                    <span
                      class="btn btn-primary btn-outline btn-sm"
                      @click.prevent="
                        cancelApplication('지원취소', item.applicationSq)
                      "
                    >
                      지원취소
                    </span>
                  </template>

                  <template v-else-if="item.applicantType === '합격'">
                    <span class="btn btn-light btn-sm">합격</span>
                  </template>

                  <template v-else-if="item.applicantType === '인터뷰확정'">
                    <div
                      class="interview-wrapper position-relative d-inline-block"
                    >
                      <div
                        class="interview-tooltip position-absolute bg-white border p-2 rounded shadow-sm text-dark font-weight-semibold"
                        style="
                          bottom: 80%;
                          left: 50%;
                          transform: translateX(-60%);
                          white-space: nowrap;
                        "
                      >
                        {{ formatDate(item.interviewDt) }}
                      </div>
                      <span class="btn btn-light btn-sm interview"
                        >인터뷰 확정</span
                      >
                    </div>
                  </template>

                  <template v-else-if="item.applicantType === '불합격'">
                    <span class="btn btn-light btn-sm">불합격</span>
                  </template>
                  <template v-else-if="item.applicantType === '지원취소'">
                    <span class="btn btn-light btn-sm">지원 취소됨</span>
                  </template>

                  <template v-else-if="item.applicantType === '인터뷰요청중'">
                    <a
                      @click.prevent="
                        fetchAvailableInterviewTimes(
                          item.projectSq,
                          item.applicationSq,
                        )
                      "
                      href="#"
                      class="btn btn-outline btn-primary btn-sm"
                    >
                      인터뷰 요청중
                    </a>
                  </template>

                  <template v-if="item.isRecruitEnded === true">
                    <span class="btn btn-light btn-sm">지원 마감</span>
                  </template>
                </div>
              </div>

              <!-- 지원일자 + 열람일자 -->
              <div
                class="d-flex justify-content-between align-items-center mt-2"
              >
                <div class="post-meta text-4">
                  <span class="text-dark text-uppercase font-weight-semibold"
                    >지원일자</span
                  >
                  | {{ formatDate(item.appliedDt) }}
                </div>
                <div class="post-meta text-4">
                  <span class="text-dark text-uppercase font-weight-semibold"
                    >지원자 수</span
                  >
                  | {{ item.applicantCnt }}
                </div>
              </div>

              <div
                class="d-flex justify-content-between align-items-center mt-2"
              >
                <div class="post-meta text-4">
                  <span class="text-dark text-uppercase font-weight-semibold"
                    >지원 이력서</span
                  >
                  |
                  <span
                    @click="openResumeDetailModal(item)"
                    class="text-muted resume-hover"
                  >
                    <template v-if="userType === 'COMPANY'">
                      {{ item.applicantName }} / {{ item.resumeTitle }}
                    </template>
                    <template v-else>
                      {{ item.resumeTitle }}
                    </template>
                  </span>
                </div>
                <div class="post-meta text-4">
                  <span class="text-dark text-uppercase font-weight-semibold"
                    >열람일자</span
                  >
                  {{
                    item.readApplicationDt
                      ? formatDate(item.readApplicationDt)
                      : '미열람'
                  }}
                </div>
              </div>
            </div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useModalStore } from '@/fo/stores/modalStore'
import { useUserStore } from '@/fo/stores/userStore'
import { navigateByUserTypeAndProjectSq } from '@/fo/router/userTypeRouter.js'
import InterviewTimeModal from '@/fo/components/mypage/common/InterviewSelectModal.vue'
import CommonConfirmModal from '@/fo/components/common/CommonConfirmModal.vue'
import ResumeDetailModal from '@/fo/components/mypage/common/ResumeDetailModal.vue'
import { api } from '@/axios.js'

const userStore = useUserStore()
const userType = userStore.getUserType
const modalStore = useModalStore()
const route = useRoute()
const router = useRouter()

// 검색 조건
const searchType = ref(route.query.searchType || 'all')
const searchKeyword = ref(route.query.keyword || '')
const appliedSearchType = ref(route.query.searchType || 'all')
const appliedSearchKeyword = ref(route.query.keyword || '')

// 열람 필터
const readType = ref(route.query.readType || 'all')
const readFilters = [
  { type: 'all', label: '전체', count: 0 },
  { type: 'read', label: '열람', count: 0 },
  { type: 'unread', label: '미열람', count: 0 },
]

// 페이징
const currentPage = ref(Math.max(1, Number(route.query.page) || 1))
if (route.query.page !== undefined && Number(route.query.page) !== currentPage.value) {
  router.replace({ query: { ...route.query, page: currentPage.value } })
}
const itemsPerPage = 5
const totalPages = ref(1)

// 지원 목록
const applications = ref([])
const pagedApplications = computed(() => applications.value)

// 인터뷰 시간 선택용
const selectedInterviewTimes = ref([])

// 초기 호출
onMounted(() => {
  fetchApplicationList()
})

// 리스트 호출
const fetchApplicationList = async () => {
  try {
    // 💡 userType에 따라 API 엔드포인트 분기 처리
    const endpoint =
      userType === 'COMPANY'
        ? `/projects/applications/corporate` // 기업용: 지원자 목록
        : `/projects/applications` // 개인용: 지원 현황

    const response = await api.$get(endpoint, {
      withCredentials: true,
      params: {
        offset: (currentPage.value - 1) * itemsPerPage,
        size: itemsPerPage,
        searchType: appliedSearchType.value,
        keyword: appliedSearchKeyword.value,
        readType: readType.value === 'all' ? null : readType.value,
      },
    })

    const data = response.output || {}
    applications.value = data.applications || []
    totalPages.value = Math.max(
      1,
      Math.ceil((data.totalCount || 0) / itemsPerPage),
    )
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
      router.replace({ query: { ...route.query, page: currentPage.value } })
      return fetchApplicationList()
    }

    // 필터 카운트 갱신
    updateCounts(data.counts)
  } catch (e) {
    console.error('❌ 프로젝트 지원 리스트 불러오기 실패:', e)
  }
}

const updateCounts = (counts) => {
  readFilters.forEach((filter) => {
    filter.count = counts?.[filter.type] ?? 0
  })
}

const updateQuery = (params) => {
  router.replace({ query: { ...route.query, ...params } })
}

// 검색
const handleSearch = () => {
  // console.log('검색 클릭이여ㅑ')
  currentPage.value = 1
  appliedSearchType.value = searchType.value
  appliedSearchKeyword.value = searchKeyword.value
  updateQuery({
    page: 1,
    searchType: searchType.value,
    keyword: searchKeyword.value || undefined,
    readType: readType.value !== 'all' ? readType.value : undefined,
  })
  fetchApplicationList()
}

// 열람 필터 클릭
const setReadFilter = (type) => {
  readType.value = type
  currentPage.value = 1
  updateQuery({
    page: 1,
    readType: type !== 'all' ? type : undefined,
  })
  fetchApplicationList()
}

// 페이지 변경
const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  router.push({ query: { ...route.query, page } })
  fetchApplicationList()
}
watch(
  () => route.query.page,
  (newPage) => {
    const page = Math.max(1, Number(newPage) || 1)
    if (Number(newPage) !== page) {
      router.replace({ query: { ...route.query, page } })
    }
    if (page !== currentPage.value) {
      currentPage.value = page
      fetchApplicationList()
    }
  },
)

// 프로젝트 상세 이동
const goToProjectSpec = (projectSq) => {
  navigateByUserTypeAndProjectSq(userType, projectSq)
}

// 상태 변경
const updateAppStatus = async (status, applicationSq) => {
  try {
    await api.$patch(
      `/projects/applications/${applicationSq}`,
      { status },
      { withCredentials: true },
    )
  } catch (e) {
    console.error('❌ 지원 상태 변경 실패:', e)
  }
}

// 지원 취소
const cancelApplication = (status, applicationSq) => {
  modalStore.openModal(CommonConfirmModal, {
    title: '프로젝트 지원 취소',
    message: '취소한 프로젝트 내역은 복구할 수 없습니다. 취소하시겠습니까?',
    onConfirm: async () => {
      await updateAppStatus(status, applicationSq)
      await fetchApplicationList()
      modalStore.closeModal()
    },
  })
}

// 날짜 포맷터
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 인터뷰 시간 조회 + 모달 열기
const fetchAvailableInterviewTimes = async (projectSq, applicationSq) => {
  try {
    const response = await api.$get(
      `/projects/applications/interviews/${projectSq}`,
      { withCredentials: true },
    )

    selectedInterviewTimes.value = response.output

    const confirmed = await openInterviewTimeModal(applicationSq)
    if (confirmed) {
      await fetchApplicationList()
    }
  } catch (e) {
    console.error('❌ 인터뷰 시간 조회 실패:', e)
  }
}

const openInterviewTimeModal = (applicationSq) => {
  return new Promise((resolve) => {
    modalStore.openModal(InterviewTimeModal, {
      applicationSq,
      interviewTimes: selectedInterviewTimes.value,
      onConfirm: (result) => {
        resolve(result)
        modalStore.closeModal()
      },
      onCancel: () => {
        resolve(null)
        modalStore.closeModal()
      },
    })
  })
}

// 이력서 상세 보기
const openResumeDetailModal = (item) => {
  modalStore.openModal(ResumeDetailModal, {
    resumeSq: item.resumeSq,
    projectSq: item.projectSq,
    applicationSq: item.applicationSq,
    isFromApplicationList: true,
    size: 'modal-xl',
  })
}
</script>

<style scoped>
.simple-post-list {
  list-style: none;
  padding: 0;
}

.interview-tooltip {
  bottom: 80%;
  left: 30%;
  white-space: nowrap;
  display: none;
}

.interview-wrapper:hover .interview-tooltip {
  display: block;
}

.resume-hover {
  cursor: pointer;
}

.resume-hover:hover {
  text-decoration: underline;
}
</style>
