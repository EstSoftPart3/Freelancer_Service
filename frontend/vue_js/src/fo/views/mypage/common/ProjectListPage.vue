<template>
  <div>
    <CommonPageHeader
      title=""
      strongText="프로젝트 목록"
      :breadcrumbs="[{ text: 'Home', link: '/' }, { text: '프로젝트' }]"
    />
    <ProjectFilterBar @update="updateFilters" @search="fetchProjects" />

    <div class="container py-4 position-relative" style="min-height: 400px">
      <div v-if="isLoading" class="text-center py-5">
        <div class="text-center">
          <div class="spinner-border text-primary mb-2" role="status"></div>
          <p class="text-muted">데이터를 불러오는 중입니다...</p>
        </div>
      </div>

      <div class="d-flex justify-content-end mb-3 gap-2">
        <div class="p-1 bg-light rounded-pill d-inline-flex border">
          <button
            type="button"
            class="btn btn-rounded btn-px-4 py-2 text-2 font-weight-semibold transition-3ms border-0"
            :class="
              !isMapView
                ? 'btn-primary text-white shadow-sm'
                : 'text-dark bg-transparent'
            "
            @click="((isMapView = false), $event.target.blur())"
          >
            <i class="fas fa-list-ul me-2"></i>목록보기
          </button>

          <button
            type="button"
            class="btn btn-rounded btn-px-4 py-2 text-2 font-weight-semibold transition-3ms border-0"
            :class="
              isMapView
                ? 'btn-primary text-white shadow-sm'
                : 'text-dark bg-transparent'
            "
            @click="((isMapView = true), $event.target.blur())"
          >
            <i class="fas fa-map-marked-alt me-2"></i>지도보기
          </button>
        </div>
      </div>

      <div v-show="!isMapView">
        <ProjectCardGroup :projects="projects" />
        <div
          v-if="!isLoading && projects.length === 0"
          class="text-center text-muted py-5 border rounded bg-light"
        >
          <i class="fas fa-search mb-3 d-block text-5"></i>
          조건에 맞는 프로젝트가 없습니다.
        </div>
        <div v-if="projects.length > 0">
          <CommonPagination
            :currentPage="currentPage"
            :totalPages="totalPages"
            @update:currentPage="currentPage = $event"
          />
        </div>
      </div>

      <div
        v-show="isMapView"
        class="row gx-0 border rounded overflow-hidden bg-white shadow-sm"
        style="height: 750px"
      >
        <div
          class="col-lg-3 col-md-4 bg-light border-end d-flex flex-column h-100"
        >
          <div class="p-3 bg-white border-bottom">
            <h5 class="text-3 mb-0 font-weight-bold">
              검색 결과 <span class="text-primary">{{ projects.length }}</span
              >건
            </h5>
          </div>

          <div class="flex-grow-1 overflow-auto p-2 custom-scrollbar">
            <MapProjectCardGroup
              :projects="projects"
              @focus-marker="handleFocusMarker"
            />
            <div
              v-if="!isLoading && projects.length === 0"
              class="text-center py-5 text-muted text-2"
            >
              조건에 맞는 프로젝트가 없습니다.
            </div>
          </div>

          <button
            v-if="userStore.userType === 'COMPANY'"
            @click="router.push('/mypage/projectPostPage')"
            class="btn btn-rounded btn-primary m-2"
          >
            등록하기
          </button>

          <div class="p-2 border-top bg-white">
            <CommonPagination
              :currentPage="currentPage"
              :totalPages="totalPages"
              @update:currentPage="currentPage = $event"
              class="pagination-sm justify-content-center m-0"
            />
          </div>
        </div>

        <div class="col-lg-9 col-md-8 h-100 position-relative">
          <div
            ref="mapContainer"
            id="kakao-map"
            class="w-100 h-100 bg-soft-light"
          >
            <div
              v-if="!mapInstance"
              class="d-flex h-100 align-items-center justify-content-center"
            >
              <div class="text-center">
                <div
                  class="spinner-border text-primary mb-2"
                  role="status"
                ></div>
                <div class="text-muted">지도를 초기화하는 중입니다...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
/* global kakao */
import ProjectFilterBar from '@/fo/components/common/ProjectFilterBar.vue'
import ProjectCardGroup from '@/fo/components/project/ProjectCardGroup.vue'
import CommonPagination from '@/fo/components/common/CommonPagination.vue'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import MapProjectCardGroup from '@/fo/components/project/MapProjectCardGroup.vue'
import MapProjectSummaryModal from '@/fo/components/project/MapProjectSummaryModal.vue'

import { ref, watch, onMounted, nextTick } from 'vue'
import { api } from '@/axios.js'
import qs from 'qs'
import { useUserStore } from '@/fo/stores/userStore'
import { useModalStore } from '@/fo/stores/modalStore'

const userStore = useUserStore()
const modalStore = useModalStore()
const isMapView = ref(false) // [추가] 지도 보기 상태 변수
const selectedProjectSq = ref(null)
const isLoading = ref(false)

const filters = ref({
  addressCodeSq: [],
  projectDeveloperGradeCd: [],
  educationCd: [],
  jobRoleCd: [],
  distance: null,
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
const mapContainer = ref(null)
const mapInstance = ref(null)
const markers = ref([]) // 지도에 표시된 마커들을 관리할 배열

// 1. 지도 초기화 함수
const initMap = () => {
  if (!mapContainer.value || mapInstance.value) return

  const options = {
    center: new kakao.maps.LatLng(37.5665, 126.978),
    level: 7,
  }

  mapInstance.value = new kakao.maps.Map(mapContainer.value, options)

  if (projects.value.length > 0) {
    displayMarkers()
  }
}

// 2. 서버 데이터를 직접 활용
const displayMarkers = () => {
  if (!mapInstance.value) return

  markers.value.forEach((m) => m.setMap(null))
  markers.value = []

  const positionLog = {}

  projects.value.forEach((project, index) => {
    if (!project.latitude || !project.longitude) return

    let lat = project.latitude
    let lng = project.longitude

    const posKey = `${lat},${lng}`
    if (positionLog[posKey]) {
      lat += (Math.random() - 0.5) * 0.0002
      lng += (Math.random() - 0.5) * 0.0002
    } else {
      positionLog[posKey] = true
    }

    const coords = new kakao.maps.LatLng(lat, lng)
    const content = document.createElement('div')
    content.className = 'label'
    content.innerHTML = `
        <span class="badge rounded-circle bg-primary border border-white shadow-sm" 
              style="width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:14px; color:white; cursor:pointer;">
          ${index + 1}
        </span>`

    content.onclick = () => {
      mapInstance.value.panTo(coords)
      modalStore.openModal(MapProjectSummaryModal, { projectInfo: project })
    }

    const customOverlay = new kakao.maps.CustomOverlay({
      position: coords,
      content: content,
      zIndex: 3,
    })

    customOverlay.setMap(mapInstance.value)
    markers.value.push(customOverlay)

    if (index === 0) mapInstance.value.setCenter(coords)
  })
}

// 3. 지도/목록 토글 감시
watch(isMapView, async (newVal) => {
  if (newVal) {
    // 지도 보기로 전환될 때 DOM이 생성된 후 지도 초기화
    await nextTick()
    initMap()
  }
})

// 4. 검색 결과(projects)가 바뀔 때 지도 업데이트
watch(projects, () => {
  if (isMapView.value && mapInstance.value) {
    displayMarkers()
  }
})

const handleFocusMarker = ({ index, project }) => {
  // [수정] 같은 프로젝트를 다시 눌렀을 때만 모달을 띄웁니다.
  if (selectedProjectSq.value === project.projectSq) {
    console.log(`재클릭: ${project.projectTtl} 요약 모달을 엽니다.`)
    modalStore.openModal(MapProjectSummaryModal, { projectInfo: project })
    return
  }

  // [수정] 처음 클릭 시: 상태 저장 및 지도 이동만 수행
  selectedProjectSq.value = project.projectSq
  console.log(`첫 클릭: ${index + 1}번 프로젝트로 지도 이동`)

  if (project.latitude && project.longitude) {
    const moveLatLon = new kakao.maps.LatLng(
      project.latitude,
      project.longitude,
    )
    mapInstance.value.panTo(moveLatLon)
  } else {
    console.warn('좌표 정보가 없어 이동할 수 없습니다.')
  }
}
const fetchProjects = async () => {
  isLoading.value = true
  if (userStore.isLoggedIn && !userStore.userLat) {
    isLoading.value = false
    return
  }

  try {
    let finalLat = userStore.userLat
    let finalLng = userStore.userLng

    if (!userStore.isLoggedIn || !finalLat) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
          })
        })
        finalLat = position.coords.latitude
        finalLng = position.coords.longitude
      } catch (err) {
        console.error('GPS 실패:', err.message)
      }
    }

    const params = { ...filters.value, userLat: finalLat, userLng: finalLng }
    const queryString = qs.stringify(params, { arrayFormat: 'repeat' })
    const response = await api.$get(`/projects?${queryString}`)

    projects.value = response.output.projects
    const totalCount = response.output.totalCount ?? 0
    totalPages.value = Math.max(1, Math.ceil(totalCount / filters.value.size))

    // [중요] 데이터 로딩 후 지도 모드라면 마커 갱신
    if (isMapView.value) {
      nextTick(() => displayMarkers())
    }
  } catch (e) {
    console.error('로드 실패', e)
  } finally {
    isLoading.value = false
  }
}

watch(currentPage, (newPage) => {
  filters.value.page = newPage
  fetchProjects()
})

// 1. 위경도 좌표 감시자 추가
watch(
  () => [userStore.userLat, userStore.userLng],
  ([newLat, newLng]) => {
    // 하나라도 값이 들어오면 즉시 실행
    if (newLat && newLng) {
      console.log('📍 [WATCH] 좌표 감지! 데이터를 불러옵니다.')
      fetchProjects()
    }
  },
  { immediate: true }, // 컴포넌트 생성 시점에 값이 이미 있다면 즉시 실행
)

// 2. 초기 로드 로직
onMounted(() => {
  // 비로그인 상태면 즉시 실행 (GPS 로직 사용)
  // 로그인 상태인데 좌표가 이미 있으면 즉시 실행
  if (!userStore.isLoggedIn || (userStore.userLat && userStore.userLng)) {
    fetchProjects()
  } else {
    console.log('⏳ 좌표가 아직 없습니다. 워처가 응답을 기다립니다...')
  }
})

const updateFilters = (updated) => {
  filters.value = { ...filters.value, ...updated }
  currentPage.value = 1 // 필터 바꾸면 1페이지부터
}
</script>

<style scoped>
/* 버튼 전환 시 색상과 위치 변화를 부드럽게 만들기 위한 애니메이션 */
.transition-3ms {
  transition: all 0.3s ease;
}

/* 포르토 라이트 배경 미세 조정 */
.bg-light {
  background-color: #f7f7f7 !important;
}

/* 선택되지 않은 버튼 위로 마우스 올렸을 때 효과 */
.bg-transparent:hover {
  background-color: rgba(0, 0, 0, 0.05) !important;
}

.btn-rounded:focus {
  outline: none !important;
  box-shadow: none !important;
}

/* 사이드바 스크롤바 디자인 (Porto 스타일과 매칭) */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #0088cc; /* Porto Primary */
}

/* 지도 배경색 살짝 조절 */
.bg-soft-light {
  background-color: #f8f9fa;
}

/* 페이지네이션 크기 미세 조절 */
:deep(.pagination-sm .page-link) {
  padding: 5px 10px;
  font-size: 0.75rem;
}
</style>
