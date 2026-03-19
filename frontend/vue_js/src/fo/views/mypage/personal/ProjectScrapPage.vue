<template>
  <div>
    <div class="row">
      <div class="col">
        <h4 class="mb-3" style="font-size: 24px">프로젝트 스크랩 내역</h4>
      </div>
    </div>

    <!-- 필터 UI -->
    <div class="row align-items-center mt-3 mb-2">
      <div class="col-md-12 d-flex justify-content-end gap-2">
        <select v-model="searchType" class="form-select form-select-sm w-auto">
          <option value="전체">전체</option>
          <option value="제목">제목</option>
          <option value="회사명">회사명</option>
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
            :key="item.projectSq"
            style="border-bottom: 1px rgb(230, 230, 230) solid"
          >
            <div class="post-info position-relative">
              <!-- 제목 + 회사명 + 상태 -->
              <div
                class="d-flex justify-content-between align-items-center gap-2"
              >
                <div class="d-flex gap-2">
                  <a
                    href="#"
                    class="text-5 m-0"
                    @click.prevent="goToProjectDetail(item.projectSq)"
                  >
                    {{ item.projectTtl }} /
                    <span style="font-size: 1.25rem">{{
                      item.company.companyNm
                    }}</span>
                  </a>
                </div>
                <div class="d-flex gap-2 align-items-center">
                  <span
                    :class="[
                      'btn',
                      item.dday >= 0 ? 'btn-primary' : 'btn-light',
                      'btn-sm',
                    ]"
                  >
                    <template v-if="item.dday >= 0">채용중</template>
                    <template v-else>채용 마감</template>

                    <span
                      v-if="item.dday !== null && item.dday >= 0"
                      class="badge bg-white text-primary fw-bold px-2 py-1 ms-1"
                    >
                      D-{{ item.dday }}
                    </span>
                  </span>

                  <button
                    class="btn btn-outline btn-primary btn-sm"
                    @click="removeScrap(item.projectSq)"
                  >
                    삭제
                  </button>
                </div>
              </div>

              <!-- 지원자 수 + 등록일 -->
              <div
                class="d-flex justify-content-between align-items-center mt-2"
              >
                <div class="post-meta text-4">
                  <span class="text-dark text-uppercase font-weight-semibold"
                    >등록일자</span
                  >
                  | {{ formatDate(item.createdAt) }}
                </div>
                <div class="post-meta text-4">
                  <span class="text-dark text-uppercase font-weight-semibold"
                    >지원자 수</span
                  >
                  | {{ item.candidateCnt }}
                </div>
              </div>

              <!-- 지원 자격 + 기간 -->
              <div
                class="d-flex justify-content-between align-items-center mt-2"
              >
                <div
                  class="post-meta text-4 me-3 flex-grow-1"
                  style="min-width: 0"
                >
                  <div class="mb-1">
                    <span class="text-dark text-uppercase font-weight-semibold"
                      >지원 자격</span
                    >
                    | {{ item.address.parentSigungu }}
                    {{ item.address.sigungu }} / {{ item.developerGrade }} /
                    {{ item.requiredEducation }}
                  </div>

                  <!-- 기술 스택 -->
                  <div class="d-flex flex-wrap gap-2">
                    <span
                      v-for="(skill, index) in item.skillTags"
                      :key="index"
                      class="badge bg-light text-dark px-2 py-1"
                    >
                      <img
                        v-if="generateIconUrl(skill)"
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
                  | {{ item.recruitStartDt }} ~ {{ item.recruitEndDt }}
                </div>
              </div>
            </div>
          </li>
          <li v-if="scraps.length === 0" class="text-center py-5 text-muted">
            검색 결과가 없습니다.
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
import { ref, onMounted, watch } from 'vue'
import { api } from '@/axios'
import { useAlertStore } from '@/fo/stores/alertStore'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/fo/stores/userStore'
import skillIconMap from '@/assets/skillIconMap.js'

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
    const output = res.output
    scraps.value = output.content || []
    totalPages.value = Math.ceil((output.totalCount || 0) / itemsPerPage) || 1
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  } catch (e) {
    console.error('프로젝트 스크랩 조회 실패:', e)
  }
}
onMounted(fetchScraps)

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

const generateIconUrl = (name) => {
  const key = name.toLowerCase().replace(/[\s.]+/g, '')
  return skillIconMap[key] || skillIconMap.default
}
</script>

<style scoped>
.simple-post-list {
  list-style: none;
  padding-left: 0;
}
</style>
