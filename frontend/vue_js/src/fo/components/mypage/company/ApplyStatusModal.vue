<template>
  <div class="modal-content">
    <div class="modal-header">
      <h3 class="modal-title">지원 현황</h3>
      <button
        type="button"
        class="btn-close"
        @click="closeModal"
        aria-hidden="true"
      >
        ×
      </button>
    </div>
    <div
      class="modal-body"
      style="max-height: 80vh; overflow-y: auto; padding: 0"
    >
      <div class="container py-1 mt-3">
        <div class="row">
          <div class="col">
            <h1 class="font-weight-normal text-10 mb-20">
              <strong>프로젝트 Title</strong>
            </h1>
          </div>
        </div>

        <!-- 필터 UI -->
        <div class="row align-items-center mt-3 mb-2">
          <!-- 좌측 토글 버튼 -->
          <div class="col-md-8 d-flex gap-2">
            <button
              v-for="filter in filtersWithCount"
              :key="filter.type"
              class="btn btn-primary fw-bold px-2 py-2 d-flex align-items-center gap-2 fs-6 btn-sm"
              :class="{ active: currentFilter === filter.type }"
              @click="setFilter(filter.type)"
            >
              {{ filter.label }}
              <span class="badge bg-white text-primary fw-bold px-2 py-1">{{
                filter.count
              }}</span>
            </button>
          </div>

          <!-- 우측 셀렉트 + 검색 -->
          <div class="col-md-4 d-flex justify-content-end gap-2">
            <select
              v-model="searchType"
              class="form-select form-select-sm w-auto"
            >
              <option value="all">전체</option>
              <option value="name">이름</option>
              <option value="skills">사용 기술</option>
            </select>
            <input
              v-model="searchText"
              type="text"
              class="form-control form-control-sm w-auto"
              placeholder="검색어 입력"
            />
            <button class="btn btn-primary btn-sm" @click="search">검색</button>
          </div>
        </div>

        <div class="row">
          <div class="col-12 d-flex justify-content-end pt-2 mt-1">
            <div class="btn-group" role="group" aria-label="개인 기업 토글">
              <button
                type="button"
                class="btn btn-primary btn-outline"
                :class="{ active: applicantType === 'personal' }"
                @click="toggleToPersonal()"
              >
                개인
              </button>
              <button
                type="button"
                class="btn btn-primary"
                :class="{ active: applicantType === 'company' }"
              >
                기업
              </button>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col" style="padding: 0">
            <hr class="my-4" />
          </div>
        </div>

        <!-- 기업별 지원자 목록 -->
        <div class="row">
          <div class="col">
            <div
              v-if="corporateGroups.length === 0"
              class="text-muted py-3"
              style="font-size: 14px"
            >
              지원한 기업 지원자가 없습니다.
            </div>
            <div
              v-for="(company, index) in corporateGroups"
              :key="index"
              class="row mb-3"
            >
              <div class="col">
                <!-- 회사 정보 및 토글 버튼 -->
                <button
                  class="btn w-100 text-start d-flex justify-content-between align-items-center px-3 py-2 bg-grey text-dark border"
                  type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="'#collapse-company-' + index"
                  aria-expanded="true"
                  :aria-controls="'collapse-company-' + index"
                  style="font-size: 1.5rem; border-color: black"
                >
                  <div>
                    <strong>{{ company.companyNm }}</strong>
                  </div>
                  <i class="fas fa-chevron-down"></i>
                </button>

                <!-- 토글로 열고 닫을 지원자 정보 영역 -->
                <div
                  class="collapse show mt-2"
                  :id="'collapse-company-' + index"
                >
                  <!-- 지원자 목록 -->
                  <ul class="simple-post-list m-0 position-relative">
                    <li
                      v-for="applicant in company.applicants"
                      :key="applicant.applicationSq"
                      style="border-bottom: 1px rgb(230, 230, 230) solid"
                    >
                      <div class="post-info position-relative">
                        <!-- 제목 + 회사명 + 지원상태 버튼 -->
                        <div
                          class="d-flex justify-content-between align-items-center gap-2"
                        >
                          <div class="d-flex gap-2">
                            <a
                              @click.prevent="
                                () =>
                                  openResumeDetailModal(
                                    applicant.resumeSq,
                                    applicant.applicationSq,
                                  )
                              "
                              href="#"
                              class="d-flex gap-1 align-items-center text-decoration-none"
                            >
                              <span class="text-6 m-0"
                                >{{ applicant.resumeNmTtlVo.resumeNm }} /</span
                              >
                              <span class="text-5 m-0">{{
                                applicant.resumeNmTtlVo.resumeTtl
                              }}</span>
                            </a>
                          </div>
                          <div class="d-flex gap-2">
                            <template
                              v-if="applicant.appStatusVo.appStatus === '합격'"
                            >
                              <span
                                @click.prevent="
                                  fetchAvailableInterviewTimes(
                                    applicant.applicationSq,
                                  )
                                "
                                class="btn btn-outline btn-primary btn-sm"
                              >
                                인터뷰 요청
                              </span>
                            </template>
                            <template
                              v-else-if="
                                applicant.appStatusVo.appStatus === '불합격'
                              "
                            >
                              <span
                                class="btn btn-primary btn-sm"
                                @click="handleReject(applicant)"
                              >
                                불합격
                              </span>
                            </template>

                            <template
                              v-if="
                                applicant.appStatusVo.appStatus === '지원중'
                              "
                            >
                              <span
                                @click.prevent="
                                  updateStatus(
                                    applicant.applicationSq,
                                    '인터뷰요청중',
                                  )
                                "
                                class="btn btn-outline btn-primary btn-sm"
                              >
                                인터뷰 요청
                              </span>

                              <span
                                @click.prevent="
                                  openStatusFailureModal(
                                    applicant.applicationSq,
                                  )
                                "
                                class="btn btn-outline btn-primary btn-sm"
                              >
                                불합격
                              </span>
                            </template>
                            <template
                              v-else-if="
                                applicant.appStatusVo.appStatus ===
                                '인터뷰요청중'
                              "
                            >
                              <span class="btn btn-primary btn-sm"
                                >인터뷰 요청중</span
                              >
                            </template>
                            <template
                              v-else-if="
                                applicant.appStatusVo.appStatus === '인터뷰확정'
                              "
                            >
                              <div
                                class="interview-wrapper position-relative d-inline-block"
                              >
                                <!-- 툴팁 -->
                                <div
                                  class="interview-tooltip position-absolute bg-white border p-2 rounded shadow-sm text-dark font-weight-semibold"
                                  style="
                                    bottom: 80%;
                                    left: 50%;
                                    transform: translateX(-60%);
                                    white-space: nowrap;
                                  "
                                >
                                  {{
                                    formatDate(
                                      applicant.appStatusVo.interviewDt,
                                    )
                                  }}
                                </div>

                                <!-- 인터뷰 확정 버튼 -->
                                <span class="btn btn-light btn-sm interview"
                                  >인터뷰 확정</span
                                >
                              </div>
                            </template>
                            <template
                              v-else-if="
                                applicant.appStatusVo.appStatus === '지원취소'
                              "
                            >
                              <span class="btn btn-light btn-sm"
                                >지원 취소됨</span
                              >
                            </template>
                          </div>
                        </div>

                        <!-- 경력 + 열람일자 -->
                        <div
                          class="d-flex justify-content-between align-items-center mt-2"
                        >
                          <div class="post-meta text-4">
                            <span
                              class="text-dark text-uppercase font-weight-semibold"
                              >경력</span
                            >
                            | {{ applicant.careerYear || '-' }}년차
                          </div>
                          <div class="post-meta text-4">
                            <span
                              class="text-dark text-uppercase font-weight-semibold"
                              >열람일자</span
                            >
                            |
                            {{ applicant.appStatusVo.readResumeDt || '미열람' }}
                          </div>
                        </div>

                        <!-- 사용 기술 + 지원일자 -->
                        <div
                          class="d-flex justify-content-between align-items-center mt-2"
                          style="font-size: 16.8px !important"
                        >
                          <div class="d-flex align-items-center gap-2">
                            <span
                              class="text-dark text-uppercase font-weight-semibold"
                              >사용 기술</span
                            >
                            |
                            <div
                              v-for="skill in applicant.skillNames || []"
                              :key="skill"
                              class="btn d-flex align-items-center gap-2 border-0"
                            >
                              <img
                                :src="generateIconUrl(skill)"
                                :alt="skill"
                                width="24"
                                height="24"
                              />
                              <span>{{ skill }}</span>
                            </div>
                          </div>
                          <div class="post-meta" style="font-size: 16.8px">
                            <span
                              class="text-dark text-uppercase font-weight-semibold"
                              style="font-size: 16.8px"
                              >지원일자</span
                            >
                            | {{ applicant.appStatusVo.appDt || '-' }}
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- 페이지네이션 -->
            <div class="mt-5 py-5">
              <ul class="pagination float-end">
                <li class="page-item">
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
                  class="page-item"
                  :class="{ active: currentPage === page }"
                >
                  <a
                    class="page-link"
                    href="#"
                    @click.prevent="changePage(page)"
                    >{{ page }}</a
                  >
                </li>
                <li class="page-item">
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
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-light" @click="closeModal">
        닫기
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, watch, onMounted, computed } from 'vue'
import { useModalStore } from '@/fo/stores/modalStore'
import { useAlertStore } from '@/fo/stores/alertStore'

import InterviewTimeModal from '@/fo/components/mypage/common/InterviewSelectModal.vue'
import ResumeDetailModal from '@/fo/components/mypage/common/ResumeDetailModal.vue'
import CommonConfirmModal from '@/fo/components/common/CommonConfirmModal.vue'

import { api } from '@/axios.js'

const modalStore = useModalStore()
const alertStore = useAlertStore()

const props = defineProps({
  projectSq: Number,
  onToggle: Function,
})

const applicantType = ref('company')
const currentPage = ref(1)
const pageSize = ref(5)
const totalPages = ref(1)

const currentFilter = ref('all')
const searchType = ref('all')
const searchText = ref('')
const corporateGroups = ref([])

const fetchCorporateApplicants = async () => {
  try {
    const res = await api.$get(
      `/projects/applications/${props.projectSq}/corporate/grouped`,
      {
        withCredentials: true,
        params: {
          page: currentPage.value,
          size: pageSize.value,
          filter: currentFilter.value,
          searchType: searchType.value,
          keyword: searchText.value,
        },
      },
    )
    corporateGroups.value = res.response || []
    totalPages.value = res.totalPages || 1
  } catch (err) {
    console.error('기업 지원자 목록 조회 실패', err)
    corporateGroups.value = []
    totalPages.value = 1
  }
}

onMounted(() => {
  fetchCorporateApplicants()
})

watch([currentPage, currentFilter, searchType, searchText], () => {
  fetchCorporateApplicants()
})

// 필터별 카운트 계산 (클라이언트에서 직접 계산)
const filterCounts = computed(() => {
  const counts = {
    all: 0,
    passed: 0,
    in_progress: 0,
    interview_confirmed: 0,
    interview_requested: 0,
    rejected: 0,
  }

  corporateGroups.value.forEach(({ applicants }) => {
    applicants.forEach((a) => {
      counts.all++
      const status = a.appStatusVo?.appStatus
      if (status === '지원중') counts.in_progress++
      else if (status === '합격') counts.passed++
      else if (status === '인터뷰확정') counts.interview_confirmed++
      else if (status === '인터뷰요청중') counts.interview_requested++
      else if (['불합격', '지원취소'].includes(status)) counts.rejected++
    })
  })

  return counts
})

// filters 배열 (상태 코드와 라벨)
const filters = [
  { type: 'all', label: '전체' },
  { type: 'passed', label: '합격' },
  { type: 'in_progress', label: '지원중' },
  { type: 'interview_confirmed', label: '인터뷰확정' },
  { type: 'interview_requested', label: '인터뷰요청중' },
  { type: 'rejected', label: '불합격 / 취소' },
]

// filters 배열에 각 필터별 카운트 포함한 컴퓨티드
const filtersWithCount = computed(() =>
  filters.map((filter) => ({
    ...filter,
    count: filterCounts.value[filter.type] ?? 0,
  })),
)

// 필터 버튼 클릭
const setFilter = (type) => {
  currentFilter.value = type
  currentPage.value = 1
}

// 검색 버튼 클릭
const search = () => {
  currentPage.value = 1
  fetchCorporateApplicants()
}

// 페이지 변경
const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

// 개인 지원자 목록 토글
const toggleToPersonal = () => {
  props.onToggle?.(props.projectSq) // projectSq 넘겨주기
}

// 모달 닫기
const closeModal = () => {
  modalStore.closeModal()
}

// 지원 상태 변경 API 호출 및 리스트 재조회
const updateStatus = async (applicationSq, status) => {
  try {
    await api.$patch(
      `/projects/applications/${applicationSq}`,
      { status },
      { withCredentials: true },
    )
    await fetchCorporateApplicants()
    alertStore.show('상태가 정상적으로 변경되었습니다.')
  } catch (e) {
    console.error('상태 변경 실패', e)
    alertStore.show('상태 변경 중 오류가 발생했습니다.', 'danger')
  }
}

// 불합격 처리 확인 모달 오픈
const openStatusFailureModal = (applicationSq) => {
  modalStore.openModal(CommonConfirmModal, {
    message: '해당 지원자를 불합격 처리하겠습니까?',
    onConfirm: async () => {
      await updateStatus(applicationSq, '불합격')
      modalStore.closeModal()
    },
  })
}

// 인터뷰 시간 목록 조회 및 모달 오픈
const fetchAvailableInterviewTimes = async (applicationSq) => {
  try {
    const res = await api.$get(
      `/projects/applications/interviews/${props.projectSq}`,
      { withCredentials: true },
    )
    openInterviewTimeModal(applicationSq, res.output)
  } catch (e) {
    console.error('인터뷰 시간 조회 실패:', e)
  }
}

const openInterviewTimeModal = (applicationSq, interviewTimes) => {
  modalStore.openModal(InterviewTimeModal, {
    interviewTimes,
    applicationSq,
  })
}

// 이력서 상세 모달 오픈
const openResumeDetailModal = (resumeSq, applicationSq) => {
  modalStore.openModal(ResumeDetailModal, {
    title: '이력서 상세보기',
    size: 'modal-lg',
    resumeSq: resumeSq,
    applicationSq: applicationSq,
    projectSq: props.projectSq,
    isFromApplicationList: true,
  })
}

// 날짜 포맷 함수
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date
    .getHours()
    .toString()
    .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 기술 아이콘 URL 생성
const generateIconUrl = (name) => {
  const supportedIcons = {
    Java: 'java',
    Python: 'python',
    'Spring Boot': 'spring',
    Django: 'django',
    React: 'react',
    'Vue.js': 'vuejs',
    Docker: 'docker',
    Git: 'git',
    Windows: 'windows8',
    MacOS: 'apple',
    Linux: 'linux',
    MySQL: 'mysql',
    OracleDB: 'oracle',
    MongoDB: 'mongodb',
    MariaDB: 'mariadb',
    Redis: 'redis',
  }

  const mapped = supportedIcons[name]
  if (!mapped) return null

  const fileName =
    name === 'Django' ? `${mapped}-plain.svg` : `${mapped}-original.svg`

  return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${mapped}/${fileName}`
}
</script>

<style scoped>
.modal-content {
  border-radius: 8px;
}

.btn-rounded {
  border-radius: 20px;
}

.btn-3d {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.gap-2 {
  gap: 0.5rem;
}

.interview:hover div {
  display: block;
}

.interview div {
  display: none;
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

.bg-color-grey {
  background-color: #f5f5f5;
}

.simple-post-list {
  list-style: none;
  padding: 0;
}

.simple-post-list li {
  padding: 1rem 0;
}

.text-6 {
  font-size: 1.2rem;
}

.text-5 {
  font-size: 1.1rem;
}

.text-4 {
  font-size: 0.9rem;
}

.bg-grey {
  background-color: #f8f9fa;
}
</style>
