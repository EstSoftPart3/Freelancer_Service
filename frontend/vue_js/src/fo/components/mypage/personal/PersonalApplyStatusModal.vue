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
              <strong>{{ projectTitle }}</strong>
            </h1>
          </div>
        </div>

        <!-- 필터 UI -->
        <div class="row align-items-center mt-3 mb-2">
          <!-- 좌측 토글 버튼 -->
          <div class="col-md-8 d-flex gap-2">
            <button
              v-for="filter in filters"
              :key="filter.type"
              class="btn btn-primary fw-bold px-2 py-2 d-flex align-items-center gap-2 fs-6 btn-sm"
              :class="{ active: currentFilter === filter.type }"
              @click="() => setFilter(filter.type)"
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
                class="btn btn-primary"
                :class="{ active: applicantType === 'personal' }"
              >
                개인
              </button>
              <button
                type="button"
                class="btn btn-primary btn-outline"
                :class="{ active: applicantType === 'company' }"
                @click="toggleToCorporate"
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

        <!-- 지원자 목록 -->
        <div class="row">
          <div class="col">
            <div
              v-if="localApplicants.length === 0"
              class="text-muted py-3"
              style="font-size: 14px"
            >
              조건에 해당하는 개인 지원자가 없습니다.
            </div>
            <ul class="simple-post-list m-0 position-relative">
              <li
                v-for="applicant in localApplicants"
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
                        v-if="applicant.appStatusVo.appStatus === '지원중'"
                      >
                        <span
                          @click.prevent="
                            () =>
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
                            () =>
                              openStatusFailureModal(applicant.applicationSq)
                          "
                          class="btn btn-outline btn-primary btn-sm"
                        >
                          불합격
                        </span>
                      </template>
                      <template
                        v-else-if="
                          applicant.appStatusVo.appStatus === '인터뷰요청중'
                        "
                      >
                        <div class="d-flex gap-2">
                          <span class="btn btn-primary btn-sm"
                            >인터뷰 요청중</span
                          >
                          <span
                            @click.prevent="
                              () =>
                                openCancelApplicationModal(
                                  applicant.applicationSq,
                                )
                            "
                            class="btn btn-outline btn-danger btn-sm"
                          >
                            지원 철회
                          </span>
                        </div>
                      </template>
                      <template
                        v-else-if="applicant.appStatusVo.appStatus === '불합격'"
                      >
                        <span class="btn btn-primary btn-sm">불합격</span>
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
                            {{ applicant.appStatusVo.interviewDt }}
                            <!-- {{ formatDate(applicant.appStatusVo.interviewDt) }} -->
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
                        <span class="btn btn-light btn-sm">지원 취소됨</span>
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
                      | {{ applicant.careerYear }}년차
                    </div>
                    <div class="post-meta text-4">
                      <span
                        class="text-dark text-uppercase font-weight-semibold"
                        >열람일자</span
                      >
                      | {{ applicant.appStatusVo.readResumeDt || '미열람' }}
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
                        v-for="skill in applicant.skillNames"
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
                      | {{ applicant.appStatusVo.appDt }}
                    </div>
                  </div>
                </div>
              </li>
            </ul>

            <!-- 페이지네이션 -->
            <div class="mt-5 py-5">
              <ul class="pagination float-end">
                <li class="page-item">
                  <a
                    class="page-link"
                    href="#"
                    @click.prevent="() => changePage(currentPage - 1)"
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
                    @click.prevent="() => changePage(page)"
                    >{{ page }}</a
                  >
                </li>
                <li class="page-item">
                  <a
                    class="page-link"
                    href="#"
                    @click.prevent="() => changePage(currentPage + 1)"
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
import { ref, defineProps, computed, onMounted, watch } from 'vue'
import { useModalStore } from '@/fo/stores/modalStore'
import { useAlertStore } from '@/fo/stores/alertStore'

import CommonConfirmModal from '@/fo/components/common/CommonConfirmModal.vue'
import ResumeDetailModal from '@/fo/components/mypage/common/ResumeDetailModal.vue'

import { api } from '@/axios.js'
import skillIconMap from '@/assets/skillIconMap.js'

const modalStore = useModalStore()
const alertStore = useAlertStore()

const props = defineProps({
  projectSq: Number,
  projectTitle: String,
  onToggle: Function,
})

const currentFilter = ref('all')
const searchType = ref('all')
const searchText = ref('')
const applicantType = ref('personal')
const currentPage = ref(1)
const pageSize = ref(5)
const totalPages = ref(1)

const localApplicants = ref([])

const fetchPersonalApplicants = async () => {
  try {
    const res = await api.$get(
      `/projects/applications/${props.projectSq}/personal`,
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
    localApplicants.value = res.response || []
    totalPages.value = res.totalPages || 1
  } catch (error) {
    console.error('개인 지원자 목록 불러오기 실패', error)
    localApplicants.value = []
    totalPages.value = 1
  }
}

onMounted(fetchPersonalApplicants)
watch([currentPage, currentFilter, searchType, searchText], () => {
  fetchPersonalApplicants()
})

const filterCounts = computed(() => {
  const counts = {
    all: 0,
    passed: 0,
    in_progress: 0,
    interview_confirmed: 0,
    interview_requested: 0,
    rejected: 0,
  }
  localApplicants.value.forEach((a) => {
    counts.all++
    const status = a.appStatusVo?.appStatus
    if (status === '지원중') counts.in_progress++
    else if (status === '합격') counts.passed++
    else if (status === '인터뷰확정') counts.interview_confirmed++
    else if (status === '인터뷰요청중') counts.interview_requested++
    else if (['불합격', '지원취소'].includes(status)) counts.rejected++
  })
  return counts
})

const filters = computed(() => [
  { type: 'all', label: '전체', count: filterCounts.value.all },
  { type: 'passed', label: '합격', count: filterCounts.value.passed },
  {
    type: 'in_progress',
    label: '지원중',
    count: filterCounts.value.in_progress,
  },
  {
    type: 'interview_confirmed',
    label: '인터뷰확정',
    count: filterCounts.value.interview_confirmed,
  },
  {
    type: 'interview_requested',
    label: '인터뷰요청중',
    count: filterCounts.value.interview_requested,
  },
  {
    type: 'rejected',
    label: '불합격 / 취소',
    count: filterCounts.value.rejected,
  },
])
const toggleToCorporate = () => {
  props.onToggle?.(props.projectSq, props.projectTitle)
}

const setFilter = (type) => {
  currentFilter.value = type
  currentPage.value = 1
}

const search = () => {
  currentPage.value = 1
}

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

const closeModal = () => {
  modalStore.closeModal()
}

const updateStatusLocally = (applicationSq, newStatus) => {
  const target = localApplicants.value.find(
    (app) => app.applicationSq === applicationSq,
  )
  if (target && target.appStatusVo) {
    target.appStatusVo.appStatus = newStatus
  }
}

const updateStatus = async (applicationSq, status) => {
  try {
    await api.$patch(
      `/projects/applications/${applicationSq}`,
      { status },
      { withCredentials: true },
    )
    updateStatusLocally(applicationSq, status)
    alertStore.show('상태가 정상적으로 변경되었습니다.')
  } catch (e) {
    console.error('지원 상태 변경 실패', e)
    alertStore.show('상태 변경 중 오류가 발생했습니다.', 'danger')
  }
}

const openStatusFailureModal = (applicationSq) => {
  modalStore.openModal(CommonConfirmModal, {
    message: '해당 지원자를 불합격 처리하겠습니까?',
    onConfirm: async () => {
      await updateStatus(applicationSq, '불합격')
      modalStore.closeModal()
    },
  })
}

const openCancelApplicationModal = (applicationSq) => {
  modalStore.openModal(CommonConfirmModal, {
    title: '지원 철회',
    message: '해당 지원자를 불합격 처리하시겠습니까?',
    onConfirm: async () => {
      await updateStatus(applicationSq, '불합격')
      modalStore.closeModal()
    },
  })
}

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

const generateIconUrl = (name) => {
  const key = name.toLowerCase().replace(/[\s.]+/g, '')
  return skillIconMap[key] || skillIconMap.default
}
</script>

<style scoped>
.modal-content {
  max-height: 90vh;
  overflow: hidden; /* 전체 모달에 스크롤 생기지 않도록 */
}

.modal-body {
  overflow-y: auto;
  max-height: calc(90vh - 120px); /* 헤더+푸터 제외한 높이, 상황에 따라 조정 */
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
</style>
