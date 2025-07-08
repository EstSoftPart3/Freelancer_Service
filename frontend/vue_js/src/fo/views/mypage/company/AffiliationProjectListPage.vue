<template>
  <div class="container py-5 mt-3">
    <div class="row">
      <div class="col">
        <h1 class="font-weight-normal text-10 mb-20">
          <strong>프로젝트 목록</strong>
        </h1>
      </div>
    </div>

    <!-- 🔽 필터 UI 추가 영역 -->
    <div class="row align-items-center mt-3 mb-2">
      <!-- 좌측 토글 버튼 -->
      <div class="col-md-6 d-flex gap-2">
        <button
          v-for="filter in filters"
          :key="filter.type"
          class="btn btn-primary fw-bold px-4 py-2 d-flex align-items-center gap-2 fs-6"
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
      <div class="col-md-6 d-flex justify-content-end gap-2">
        <select v-model="searchType" class="form-select form-select-sm w-auto">
          <option
            v-for="option in searchOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
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
      <div class="col pt-2 mt-1">
        <hr class="my-4" />
      </div>
    </div>

    <div class="row">
      <div class="col">
        <span v-if="projects.length === 0"
          >검색 조건을 만족하는 프로젝트가 없습니다.</span
        >

        <ul
          v-for="(post, index) in filteredProjects"
          :key="index"
          class="simple-post-list m-0 position-relative"
        >
          <li style="border-bottom: 1px rgb(230, 230, 230) solid">
            <div class="post-info position-relative">
              <!-- 제목 + 회사명 + 지원상태 버튼 -->
              <div
                class="d-flex justify-content-between align-items-center gap-2"
              >
                <div class="d-flex gap-2">
                  <a @click="goToProjectSpec(post)" href="#" class="text-6 m-0"
                    >{{ post.projectTtl }} /</a
                  >
                  <span href="#" class="text-5 m-0">{{ post.companyNm }}</span>
                </div>
                <div class="d-flex gap-2">
                  <span
                    :class="[
                      'btn',
                      getPostStatus(post).status === '채용중'
                        ? 'btn-primary'
                        : 'btn-light',
                      'btn-sm',
                    ]"
                  >
                    {{ getPostStatus(post).status }}
                    <span
                      v-if="getPostStatus(post).status === '채용중'"
                      class="badge bg-white text-primary fw-bold px-2 py-1"
                    >
                      {{ getPostStatus(post).dDay }}
                    </span>
                  </span>
                  <a
                    :href="`/mypage/projectPostPage/${post.projectSq}`"
                    class="btn btn-outline btn-primary btn-sm"
                  >
                    수정
                  </a>
                  <a
                    @click="confirmDelete(post.projectSq)"
                    class="btn btn-outline btn-primary btn-sm"
                    >삭제</a
                  >
                </div>
              </div>

              <!-- 등록일자 + 지원자 수 -->
              <div
                class="d-flex justify-content-between align-items-center mt-2"
              >
                <div class="post-meta text-4">
                  <span class="text-dark text-uppercase font-weight-semibold"
                    >등록일자</span
                  >
                  | {{ post.projectCreatedDt }}
                </div>
                <div class="d-flex align-items-center gap-2 text-4">
                  <span class="text-dark text-uppercase font-weight-semibold"
                    >지원자 수</span
                  >
                  | {{ post.applicantCnt }}
                  <a
                    @click="openUserApplyModal(post.projectSq)"
                    href="#"
                    class="btn btn-outline btn-primary btn-sm"
                    >지원현황 바로가기</a
                  >
                </div>
              </div>

              <!-- 지원 자격 + 채용기간 -->
              <div
                class="d-flex justify-content-between align-items-center mt-2"
              >
                <div
                  class="post-meta text-4 me-3 flex-grow-1"
                  style="min-width: 0"
                >
                  <!-- 지원 자격 -->
                  <div class="mb-1">
                    <span class="text-dark text-uppercase font-weight-semibold"
                      >지원 자격</span
                    >
                    | {{ post.address }} / {{ post.devGradeNm }} /
                    {{ post.requiredEduLvl }}
                  </div>

                  <!-- 기술 스택 -->
                  <div class="d-flex flex-wrap gap-2">
                    <span class="text-dark text-uppercase font-weight-semibold"
                      >사용 기술</span
                    >
                    <span class="text-muted">|</span>

                    <span
                      v-for="(skill, index) in [].concat(post.reqSkills)"
                      :key="index"
                      class="badge bg-light text-dark px-2 py-1"
                    >
                      <img
                        :src="generateIconUrl(skill)"
                        width="24"
                        height="24"
                      />
                      {{ skill }}
                    </span>
                  </div>
                </div>
                <div class="post-meta text-4">
                  <span class="text-dark text-uppercase font-weight-semibold"
                    >채용기간</span
                  >
                  | {{ post.recruitStartDt }} ~ {{ post.recruitEndDt }}
                </div>
              </div>
            </div>
          </li>
        </ul>

        <!-- 프로젝트 등록하기 버튼 -->
        <div class="d-flex justify-content-end mt-4 mb-5">
          <a href="/mypage/projectPostPage" class="btn btn-primary px-4 py-2"
            >프로젝트 등록하기</a
          >
        </div>

        <!-- 페이징 -->
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
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{
                page
              }}</a>
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
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useModalStore } from '../../../stores/modalStore.js'
import { useUserStore } from '../../../stores/userStore.js'
import PersonalApplyStatusModal from '@/fo/components/mypage/personal/PersonalApplyStatusModal.vue'
import CompanyApplyStatusModal from '@/fo/components/mypage/company/ApplyStatusModal.vue'
import CommonConfirmModal from '@/fo/components/common/CommonConfirmModal.vue'
import { navigateCompanyPageWithProjectSq } from '@/fo/router/userTypeRouter.js'

import { api } from '@/axios.js'

const modalStore = useModalStore()
const userStore = useUserStore()
const userType = userStore.getUserType

const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = ref(5)

const projects = ref([])

const currentFilter = ref('all')
const currnetStatusCnt = ref([])

const filters = computed(() => [
  { type: 'all', label: '전체', count: currnetStatusCnt.value.allCount },
  {
    type: 'recruiting',
    label: '채용중',
    count: currnetStatusCnt.value.recruiting,
  },
  { type: 'closed', label: '지원 마감', count: currnetStatusCnt.value.closed },
  { type: 'scheduled', label: '예정', count: currnetStatusCnt.value.scheduled },
])

onMounted(async () => {
  fetchCompanyProjectList()
  fetchStatusCounts()
})
const filteredProjects = computed(() => {
  if (currentFilter.value === 'all') return projects.value
  return projects.value.filter((post) => {
    const status = getPostStatus(post).status
    return (
      (currentFilter.value === 'recruiting' && status === '채용중') ||
      (currentFilter.value === 'closed' && status === '채용종료') ||
      (currentFilter.value === 'scheduled' && status === '채용예정')
    )
  })
})
const fetchStatusCounts = async () => {
  const params = {
    keyword: searchText.value || null,
    searchType: searchType.value || null,
    status: currentFilter.value !== 'all' ? currentFilter.value : null,
  }

  const res = await api.$get(`/projects/companies/status`, {
    params,
    withCredentials: true,
  })

  currnetStatusCnt.value = res.output
}
const fetchCompanyProjectList = async () => {
  try {
    const response = await api.$get(`/projects/companies`, {
      withCredentials: true,
      params: {
        page: currentPage.value,
        size: pageSize.value,
        searchType: searchType.value,
        keyword: searchText.value,
        status: currentFilter.value,
      },
    })
    fetchStatusCounts()

    projects.value = response.output.projects
    totalPages.value = response.output.totalPages
  } catch (e) {
    console.error('❌ 프로젝트 목록 불러오기 실패', e)
  }
}

const confirmDelete = async (projectSq) => {
  modalStore.openModal(CommonConfirmModal, {
    title: '프로젝트 삭제',
    message: '한 번 삭제한 프로젝트는 복구할 수 없습니다. 삭제하시겠습니까?',
    onConfirm: async () => {
      await deleteCompanyProject(projectSq)
      await fetchCompanyProjectList()
      modalStore.closeModal()
    },
  })
}

const deleteCompanyProject = async (projectSq) => {
  try {
    await api.$delete(`/projects/${projectSq}`, {
      withCredentials: true, // <-- 필수!
    })
  } catch (e) {
    console.error('❌ [catch 블록 진입]', e)

    console.error('프로젝트 상세 정보 불러오기 실패', e)
  }
}

const getPostStatus = (post) => {
  const today = new Date()
  const start = new Date(post.recruitStartDt)
  const end = new Date(post.recruitEndDt)

  if (today < start) {
    return { status: '채용예정' }
  } else if (today > end) {
    return { status: '채용종료' }
  } else {
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24))
    return { status: '채용중', dDay: `D-${diff}` }
  }
}

const generateIconUrl = (name) => {
  const exceptionList = [
    '전자정부 프레임워크',
    'myBatis',
    'Notepad++',
    'PyCharm',
    'Sublime Text',
  ]
  if (exceptionList.includes(name)) return null

  const processed = name
    .toLowerCase()
    .replace('#', 'sharp')
    .replace('++', 'plusplus')

  return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${processed}/${processed}-original.svg`
}

// 검색 상태
const searchType = ref('all')
const searchText = ref('')
const searchOptions = ref([
  { value: 'all', label: '전체' },
  { value: 'title', label: '제목' },
  { value: 'content', label: '내용' },
])

const search = () => {
  currentPage.value = 1
  fetchCompanyProjectList()
}

const setFilter = (type) => {
  currentFilter.value = type
  currentPage.value = 1
  fetchCompanyProjectList()
}

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchCompanyProjectList()
}
const goToProjectSpec = (project) => {
  navigateCompanyPageWithProjectSq(userType, project.projectSq)
}

function resetModal(component, props = {}) {
  modalStore.modalStack = [] // 기존 스택 초기화
  modalStore.openModal(component, props)
}

const openUserApplyModal = async (projectSq) => {
  const data = await api.$get(`/projects/applications/${projectSq}`, {
    withCredentials: true,
  })

  const allApplicants = data.output

  const personalApplicants =
    allApplicants.find((g) => g.applicantType === '개인')?.response || []
  const corporateApplicants =
    allApplicants.find((g) => g.applicantType === '기업')?.response || []

  const openPersonalModal = () => {
    resetModal(PersonalApplyStatusModal, {
      size: 'modal-xl',
      applicants: personalApplicants,
      projectSq, // 넘김
      onToggle: openCorporateModal,
    })
  }

  const openCorporateModal = () => {
    resetModal(CompanyApplyStatusModal, {
      size: 'modal-xl',
      applicants: corporateApplicants,
      projectSq, // 넘김
      onToggle: openPersonalModal,
    })
  }

  openPersonalModal()
}
</script>

<style scoped>
.simple-post-list {
  list-style: none;
  padding: 0;
}
</style>
