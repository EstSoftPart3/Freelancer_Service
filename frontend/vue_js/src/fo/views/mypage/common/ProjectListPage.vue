<template>
  <div>
    <CommonPageHeader
      title=""
      strongText="프로젝트 목록"
      :breadcrumbs="[{ text: 'Home', link: '/' }, { text: '프로젝트' }]"
    />
    <ProjectFilterBar
      :localFilters="['서울', '부산', '대구']"
      :careerFilters="['신입', '경력']"
      :jobTypeFilters="['백엔드', '프론트엔드', 'PM', '디자이너']"
      @update="updateFilters"
    />
    <div class="container py-4">
      <div class="d-flex justify-content-end mb-3">
        <button class="btn btn-rounded btn-primary me-2" @click="fetchProjects">
          검색
        </button>
        <a
          v-if="userStore.userTypeCd === 'COMPANY'"
          href="/mypage/projectPostPage"
          class="btn btn-rounded btn-light"
          >등록하기</a
        >
      </div>

      <!-- 리스트 탭과 지도 탭으로 구분하기 -->
      <button
        class="btn btn-rounded btn-primary me-2"
        v-if="!isListMode"
        @click="changeMode('list')"
      >
        목록 탭 전환
      </button>
      <button
        class="btn btn-rounded btn-primary me-2"
        v-if="isListMode"
        @click="changeMode('map')"
      >
        지도 탭 전환
      </button>

      <div>
        <KeepAlive>
          <component :is="currentViewComponent" :projects="projects" />
        </KeepAlive>
        <div v-if="projects.length === 0" class="text-center text-muted py-5">
          조건에 맞는 프로젝트가 없습니다.
        </div>
        <div>
          <CommonPagination
            :currentPage="currentPage"
            :totalPages="totalPages"
            @update:currentPage="currentPage = $event"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import ProjectFilterBar from '@/fo/components/common/ProjectFilterBar.vue'
// import ProjectCardGroup from '@/fo/components/project/ProjectCardGroup.vue'
import CommonPagination from '@/fo/components/common/CommonPagination.vue'
import { useUserStore } from '@/fo/stores/userStore'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'

import { ref, watch, onMounted, computed } from 'vue'
import { api } from '@/axios.js'
import qs from 'qs'
import ProjectListView from '@/fo/components/project/ProjectListView.vue'
import ProjectMapView from '@/fo/components/project/ProjectMapView.vue'
import { useRoute, useRouter } from 'vue-router'

const userStore = useUserStore()

const filters = ref({
  addressCodeSq: [],
  projectDeveloperGradeCd: [],
  educationCd: [],
  jobRoleCd: [],
  sortBy: 'project_start_dt',
  sortOrder: 'desc',
  searchKeyword: '',
  searchType: '전체',
  size: 5,
  page: 1,
})

const currentPage = ref(1)
const totalPages = ref('')
const projects = ref([])

// URL로 상태관리하기 위한 라우터 객체 가져오기
const route = useRoute()
const router = useRouter()

// 탭 전환용 상태관리 변수
const isListMode = computed(() => {
  return route.query.mode !== 'map'
})

// 조건에 따라 다른 컴포넌트 부르기기 위한 조건에 따라 바뀌는 변수 설정
const currentViewComponent = computed(() => {
  return isListMode.value ? ProjectListView : ProjectMapView
})

//모드 변경 함수
const changeMode = (modeName) => {
  router.replace({ query: { ...route.query, mode: modeName } })
}

onMounted(async () => {
  fetchProjects()
  console.log('fetchProjects')
})

watch(currentPage, (newPage) => {
  filters.value.page = newPage
  fetchProjects()
})

const fetchProjects = async () => {
  try {
    const params = { ...filters.value }
    const queryString = qs.stringify(params, { arrayFormat: 'repeat' })
    const response = await api.$get(`/projects?${queryString}`)
    projects.value = response.output.projects

    const totalCount = response.output.totalCount ?? 0
    totalPages.value = Math.max(1, Math.ceil(totalCount / filters.value.size))
  } catch (e) {
    console.error('프로젝트 정보 불러오기 실패', e)
  }
}

const updateFilters = (updated) => {
  filters.value = { ...filters.value, ...updated }
  currentPage.value = 1 // 필터 바꾸면 1페이지부터
}
</script>
<style lang=""></style>
