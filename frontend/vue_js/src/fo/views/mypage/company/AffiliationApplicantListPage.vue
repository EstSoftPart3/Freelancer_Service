<template>
  <div>
    <!-- 페이지 제목 -->
    <div class="row">
      <div class="col">
        <h4 class="mb-3" style="font-size: 24px">소속 공고 지원자 현황</h4>
      </div>
    </div>

    <!-- 🔽 필터/검색 UI -->
    <div class="row align-items-center mt-3 mb-2">
      <!-- 좌측: 필터 버튼 -->
      <div class="col-md-6 d-flex gap-2">
        <button
          v-for="filter in filters"
          :key="filter.type"
          class="btn btn-primary fw-bold px-4 py-2 d-flex align-items-center gap-2 fs-6"
          :class="{ active: readType === filter.type }"
          @click="setFilter(filter.type)"
        >
          {{ filter.label }}
          <span class="badge bg-white text-primary fw-bold px-2 py-1">{{
            filter.count
          }}</span>
        </button>
      </div>
      <!-- 우측: 검색 -->
      <div class="col-md-6 d-flex justify-content-end gap-2">
        <select v-model="searchType" class="form-select form-select-sm w-auto">
          <option value="all">전체</option>
          <option value="title">이력서 제목</option>
          <option value="name">지원자명</option>
          <option value="greeting">인사말</option>
        </select>
        <input
          v-model="keyword"
          type="text"
          class="form-control form-control-sm w-auto"
          placeholder="검색어 입력"
          @keyup.enter="getApplicants"
        />
        <button class="btn btn-primary btn-sm" @click="getApplicants">
          검색
        </button>
      </div>
    </div>

    <div class="row" v-if="applicants.length > 0">
      <div class="col">
        <ul class="simple-post-list m-0 my-2 position-relative">
          <li
            v-for="(applicant, index) in applicants"
            :key="applicant.applicationSq"
            :style="{
              borderTop: index === 0 ? '1px solid rgb(230, 230, 230)' : '',
              borderBottom: '1px solid rgb(230, 230, 230)',
            }"
          >
            <div class="post-info position-relative">
              <!-- 이름 + 합격/불합격 버튼 -->
              <div
                class="d-flex justify-content-between align-items-center gap-2"
              >
                <div class="d-flex gap-2">
                  <button
                    type="button"
                    class="text-5 m-0 text-primary"
                    @click="handleOpenApplicant(applicant.applicationSq)"
                  >
                    {{ applicant.userNm }}
                  </button>
                </div>
                <div class="d-flex gap-2">
                  <!-- 합격 상태일 때 -->
                  <button
                    v-if="applicant.statusCd === 502"
                    type="button"
                    class="btn btn-outline btn-primary btn-sm btn-light"
                  >
                    합격
                  </button>

                  <!-- 불합격 상태일 때 -->
                  <button
                    v-else-if="applicant.statusCd === 503"
                    type="button"
                    class="btn btn-outline btn-primary btn-sm btn-light"
                  >
                    불합격
                  </button>

                  <!-- 아직 처리되지 않은 경우 -->
                  <template v-else>
                    <button
                      type="button"
                      class="btn btn-outline btn-primary btn-sm"
                      @click="handlePassClick(applicant, 502)"
                    >
                      합격
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline btn-primary btn-sm"
                      @click="handlePassClick(applicant, 503)"
                    >
                      불합격
                    </button>
                  </template>
                </div>
              </div>
              <!-- 경력/열람일자 -->
              <div class="row mt-2">
                <div class="col-md-8">
                  <div class="post-meta text-4">
                    <span class="text-dark text-uppercase font-weight-semibold"
                      >경력</span
                    >
                    | {{ convertCareer(applicant.career) }}
                  </div>
                </div>
                <div class="col-md-4 text-end">
                  <div class="post-meta text-4">
                    <span class="text-dark text-uppercase font-weight-semibold"
                      >열람일자</span
                    >
                    |
                    {{
                      applicant.readAt
                        ? convertDate(applicant.readAt)
                        : '미열람'
                    }}
                  </div>
                </div>
              </div>
              <!-- 사용 기술/지원일자 -->
              <div
                class="row mt-2 align-items-start"
                style="font-size: 16.8px !important"
              >
                <div class="col-md-8">
                  <div class="d-flex align-items-center gap-2 flex-wrap">
                    <span class="text-dark text-uppercase font-weight-semibold"
                      >사용 기술</span
                    >
                    |
                    <div
                      v-for="skill in applicant.skills"
                      :key="skill.skillTagNm"
                      class="btn d-flex align-items-center gap-2 border-0 p-0"
                    >
                      <img :src="getSkillIcon(skill.skillTagNm)" width="20" />
                      {{ skill.skillTagNm }}
                    </div>
                  </div>
                </div>
                <div class="col-md-4 text-end">
                  <div class="post-meta" style="font-size: 16.8px">
                    <span
                      class="text-dark text-uppercase font-weight-semibold"
                      style="font-size: 16.8px"
                      >지원일자</span
                    >
                    | {{ convertDate(applicant.createdAt) }}
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>

        <!-- 페이지네이션: 우측 하단 정렬 -->
        <CommonPagination
          :currentPage="currentPage"
          :totalPages="totalPages"
          @update:currentPage="currentPage = $event"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { api } from '@/axios'
import CommonPagination from '@/fo/components/common/CommonPagination.vue'
import { useAlertStore } from '@/fo/stores/alertStore'
import { onMounted, ref } from 'vue'
import skillIconMap from '@/assets/skillIconMap.js'
import { useModalStore } from '@/fo/stores/modalStore'
import CommonConfirmModal from '@/fo/components/common/CommonConfirmModal.vue'
import AffiliationRequestDetailModal from '@/fo/components/mypage/personal/AffiliationRequestDetailModal.vue'

const readType = ref('all')
const searchType = ref('all')
const keyword = ref(null)
const size = 10
const currentPage = ref(1)
const totalPages = ref(1)
const totalElements = ref(0)
const readElements = ref(0)
const unreadElements = ref(0)

const alertStore = useAlertStore()
const modalStore = useModalStore()

const filters = ref([
  { type: 'all', label: '전체', count: totalElements },
  { type: 'read', label: '열람', count: readElements },
  { type: 'unread', label: '미열람', count: unreadElements },
])

const applicants = ref([])

const getApplicants = async () => {
  try {
    const searchFilter =
      keyword.value == null || keyword.value.trim() == ''
        ? ''
        : `&searchType=${searchType.value}&keyword=${keyword.value}`

    const readFilter =
      readType.value == null || readType.value == 'all'
        ? ''
        : `&readType=${readType.value}`
    const res = await api.$get(
      `/mypage/applications/company?page=${currentPage.value}&size=${size}${searchFilter}${readFilter}`,
    )
    if (res.status == 'OK') {
      const totalCnt = res.output.totalElements
      const unreadCnt = res.output.totalElements - res.output.readElements
      const readCnt = res.output.readElements

      applicants.value = res.output.applicants
      totalElements.value = totalCnt
      readElements.value = readCnt
      unreadElements.value = unreadCnt

      if (totalCnt == 0) {
        totalPages.value = 1
      } else {
        totalPages.value = Math.floor((totalCnt + size - 1) / size)
      }

      if (readType.value == 'read') {
        if (readCnt == 0) {
          totalPages.value = 1
        } else {
          totalPages.value = Math.floor((readCnt + size - 1) / size)
        }
      } else if (readType.value == 'unread') {
        if (unreadCnt == 0) {
          totalPages.value = 1
        } else {
          totalPages.value = Math.floor((unreadCnt + size - 1) / size)
        }
      }
    }
  } catch (error) {
    alertStore.show('지원자를 불러올 수 없습니다.', 'danger')
  }
}

const handlePassClick = (applicant, cd) => {
  if (applicant.statusCd == cd) {
    return
  }
  modalStore.openModal(CommonConfirmModal, {
    title: '지원 상태 변경',
    message: `해당 지원자를 ${cd == 502 ? '합격' : '불합격'} 하시겠습니까?`,
    onConfirm: async () => {
      try {
        const res = await api.$put(
          `/mypage/applications/apply/${applicant.applicationSq}`,
          {
            companyApplicationStatusCd: cd,
          },
        )
        if (res.status == 'OK') {
          alertStore.show('지원 상태 변경이 완료되었습니다.', 'success')
          getApplicants()
        }
      } catch (error) {
        alertStore.show('지원 상태 변경에 실패했습니다.', 'danger')
      }
      modalStore.closeModal()
    },
  })
}

const openDetailModal = (applicationSq) => {
  modalStore.openModal(AffiliationRequestDetailModal, {
    applicationSq,
  })
}

const handleOpenApplicant = async (applicationSq) => {
  await api.$put(`/mypage/applications/read/${applicationSq}`) // 이력서 열람으로 업데이트
  getApplicants()
  // [추가] 이력서 모달 오픈
  openDetailModal(applicationSq)
}

const convertCareer = (career) => {
  if (!career || career <= 0) return '신입'
  const years = Math.floor(career / 12)
  const months = career % 12

  const yearPart = years > 0 ? `${years}년 ` : ''
  const monthPart = months > 0 ? `${months}개월` : ''
  return `${yearPart}${monthPart}`
}

const convertDate = (createdAt) => {
  const date = new Date(createdAt)
  const year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()

  if (month < 10) month = '0' + month
  if (day < 10) day = '0' + day

  return `${year}.${month}.${day}`
}

const getSkillIcon = (name) => {
  const key = name.toLowerCase().replace(/[\s.]+/g, '')
  return skillIconMap[key] || skillIconMap.default
}

const setFilter = (type) => {
  readType.value = type
  getApplicants()
}

onMounted(() => {
  getApplicants()
})
</script>

<style scoped>
.simple-post-list {
  list-style: none;
  padding: 0;
}
</style>
