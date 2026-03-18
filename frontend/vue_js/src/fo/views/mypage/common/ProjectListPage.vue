<template>
  <div class="project-list-page">
    <CommonPageHeader
      title=""
      strongText="프로젝트 목록"
      :breadcrumbs="[{ text: 'Home', link: '/' }, { text: '프로젝트' }]"
    />

    <div class="bg-white border-bottom py-1">
      <div class="container-fluid">
        <ProjectFilterBar @update="updateFilters" @search="fetchProjects" />
      </div>
    </div>

    <div class="container py-2 position-relative">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div
          v-if="isLoading"
          class="spinner-border spinner-border-sm text-primary"
        ></div>
        <div v-else></div>

        <div class="p-1 bg-light rounded-pill d-inline-flex border shadow-sm">
          <button
            class="btn btn-rounded btn-px-3 py-1 text-1 font-weight-semibold border-0"
            :class="
              !isMapView ? 'btn-primary text-white' : 'text-dark bg-transparent'
            "
            @click="isMapView = false"
          >
            목록
          </button>
          <button
            class="btn btn-rounded btn-px-3 py-1 text-1 font-weight-semibold border-0"
            :class="
              isMapView ? 'btn-primary text-white' : 'text-dark bg-transparent'
            "
            @click="isMapView = true"
          >
            지도
          </button>
        </div>
      </div>

      <div v-show="!isMapView">
        <ProjectCardGroup :projects="projects" />

        <div
          v-if="userStore.userType === 'COMPANY' && projects.length > 0"
          class="d-flex justify-content-center my-4"
        >
          <button
            @click="handleRegisterClick"
            class="btn btn-primary btn-px-5 py-2 font-weight-bold shadow-sm rounded-pill"
          >
            <i class="fas fa-plus me-2"></i> 프로젝트 등록하기
          </button>
        </div>

        <div
          v-if="projects.length === 0 && !isLoading"
          class="text-center py-4 border rounded bg-light text-2"
        >
          검색 결과가 없습니다.
        </div>

        <div v-if="projects.length > 0" class="mt-2">
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
        style="height: 500px"
      >
        <div
          class="col-lg-3 col-md-4 bg-light border-end d-none d-md-flex flex-column h-100"
        >
          <div
            class="p-2 bg-white border-bottom d-flex justify-content-between align-items-center"
          >
            <span class="text-1 font-weight-bold"
              >결과 <b class="text-primary">{{ projects.length }}</b></span
            >
            <button
              v-if="userStore.userType === 'COMPANY'"
              @click="handleRegisterClick"
              class="btn btn-primary btn-xs py-1 text-1"
            >
              등록
            </button>
          </div>

          <div class="flex-grow-1 overflow-auto p-1 custom-scrollbar">
            <MapProjectCardGroup
              :projects="projects"
              @focus-marker="handleFocusMarker"
            />
          </div>
        </div>

        <div class="col-12 col-lg-9 col-md-8 h-100 position-relative">
          <transition name="fade">
            <div v-if="isMapMoved" class="search-btn-container">
              <button
                @click="handleSearchInArea"
                class="btn btn-primary btn-rounded shadow-sm px-3 py-1 border-0 text-1"
              >
                <i class="fas fa-sync-alt me-1"></i> 이 영역에서 재검색
              </button>
            </div>
          </transition>

          <div
            ref="mapContainer"
            id="kakao-map"
            class="w-100 h-100 bg-soft-light"
          >
            <div
              v-if="!mapInstance"
              class="d-flex h-100 align-items-center justify-content-center"
            >
              <div class="spinner-border text-primary" role="status"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* global kakao */
import { ref, watch, onMounted, nextTick } from 'vue'
import { api } from '@/axios.js'
import qs from 'qs'
import { useUserStore } from '@/fo/stores/userStore'
import { useModalStore } from '@/fo/stores/modalStore'
import { useRouter } from 'vue-router'

import ProjectFilterBar from '@/fo/components/common/ProjectFilterBar.vue'
import ProjectCardGroup from '@/fo/components/project/ProjectCardGroup.vue'
import CommonPagination from '@/fo/components/common/CommonPagination.vue'
import CommonPageHeader from '@/fo/components/common/CommonPageHeader.vue'
import MapProjectCardGroup from '@/fo/components/project/MapProjectCardGroup.vue'
import CommonConfirmModal from '@/fo/components/common/CommonConfirmModal.vue'
import { navigateByUserTypeAndProjectSq } from '@/fo/router/userTypeRouter'

const userStore = useUserStore()
const modalStore = useModalStore()
const router = useRouter()
const isMapView = ref(false)
const isLoading = ref(false)
const isMapMoved = ref(false)
const filters = ref({
  size: 5,
  page: 1,
  minLat: null,
  maxLat: null,
  minLng: null,
  maxLng: null,
})
const currentPage = ref(1)
const totalPages = ref(1)
const projects = ref([])
const regionGroups = ref([])
const mapContainer = ref(null)
const mapInstance = ref(null)
const markers = ref([])
const selectedProjectId = ref(null)

let isMarkerClickTriggered = false

const projectOverlays = new Map()

// --- 지도 로직 ---
const initMap = () => {
  if (!mapContainer.value || mapInstance.value) return

  // 1. 우선순위에 따른 중심 좌표 설정 (사용자 좌표 -> 없으면 서울시청)
  const centerLat = userStore.userLat || 37.5665
  const centerLng = userStore.userLng || 126.978

  mapInstance.value = new kakao.maps.Map(mapContainer.value, {
    center: new kakao.maps.LatLng(centerLat, centerLng),
    level: 7,
  })

  kakao.maps.event.addListener(
    mapInstance.value,
    'zoom_changed',
    displayMarkers,
  )
  kakao.maps.event.addListener(mapInstance.value, 'idle', () => {
    isMapMoved.value = true
  })
  kakao.maps.event.addListener(mapInstance.value, 'click', () => {
    if (isMarkerClickTriggered) return

    selectedProjectId.value = null
    document.querySelectorAll('.marker-wrapper').forEach((el) => {
      el.classList.remove('active')
    })
  })

  if (projects.value.length > 0) displayMarkers()
}

const selectProject = (project) => {
  if (!mapInstance.value) return

  // 1. 모든 오버레이의 zIndex를 기본값으로 초기화
  projectOverlays.forEach((ov) => ov.setZIndex(3))

  const isAlreadySelected = selectedProjectId.value === project.projectSq

  if (isAlreadySelected) {
    goToProjectSpecWithConfirm(project)
  } else {
    selectedProjectId.value = project.projectSq

    // 2. [핵심] 현재 선택된 오버레이의 zIndex를 최상단으로 변경
    const currentOverlay = projectOverlays.get(project.projectSq)
    if (currentOverlay) {
      currentOverlay.setZIndex(999)
    }

    mapInstance.value.panTo(
      new kakao.maps.LatLng(project.latitude, project.longitude),
    )

    nextTick(() => {
      document
        .querySelectorAll('.marker-wrapper')
        .forEach((el) => el.classList.remove('active'))
      const activeEl = document.querySelector(
        `.marker-wrapper[data-id="${project.projectSq}"]`,
      )
      if (activeEl) activeEl.classList.add('active')
    })
  }
}

// 길찾기 페이지 오픈 함수
const openKakaoRoute = (project) => {
  const baseUrl = 'https://map.kakao.com/link/to/'
  const destName = encodeURIComponent(project.projectTtl)
  const destLat = project.latitude
  const destLng = project.longitude

  let url = `${baseUrl}${destName},${destLat},${destLng}`

  // 출발지 정보가 있다면 추가 (userStore 활용)
  if (userStore.userLat && userStore.userLng) {
    const startName = encodeURIComponent('내 위치')
    url += `/from/${startName},${userStore.userLat},${userStore.userLng}`
  }

  window.open(url, '_blank')
}

const displayMarkers = () => {
  if (!mapInstance.value) return
  markers.value.forEach((m) => m.setMap(null))
  markers.value = []
  const level = mapInstance.value.getLevel()

  if (level >= 8) {
    // 시군구 클러스터 로직 (기존과 동일)
    regionGroups.value.forEach((group) => {
      const coords = new kakao.maps.LatLng(group.latitude, group.longitude)
      const content = document.createElement('div')
      content.className = 'cluster-pin'
      content.innerHTML = `${group.sigungu}<br><b>${group.projectCount}</b>`
      content.onclick = () => {
        isMapMoved.value = false
        mapInstance.value.setLevel(level - 2, { anchor: coords, animate: true })
        setTimeout(() => updateBounds(), 350)
      }
      const overlay = new kakao.maps.CustomOverlay({
        position: coords,
        content: content,
        zIndex: 1,
      })
      overlay.setMap(mapInstance.value)
      markers.value.push(overlay)
    })
  } else {
    // 상세 프로젝트 핀
    projects.value.forEach((project) => {
      if (!project.latitude || !project.longitude) return
      const isSubway = project.addressTypeCd === 2702
      const displayAddress = isSubway
        ? project.subwayAddress
        : project.detailedAddress

      const content = document.createElement('div')
      content.className = 'marker-wrapper'
      content.setAttribute('data-id', project.projectSq)

      if (selectedProjectId.value === project.projectSq) {
        content.classList.add('active')
      }

      // 1. HTML 구조에 '경로 찾기' 버튼 추가
      content.innerHTML = `
        <div class="marker-pin ${isSubway ? 'subway' : ''}"><i class="bi ${isSubway ? 'bi-train-front' : 'bi-geo-alt-fill'}"></i></div>
        <div class="marker-tooltip">
          <div class="tt-header">
            <span class="tt-badge">${project.projectExperience || '등급미정'}</span>
            <span class="tt-ttl">${project.projectTtl}</span>
          </div>
          <div class="tt-body">
            <div class="tt-item"><i class="bi bi-building me-1"></i>${project.companyNm}</div>
            <div class="tt-item"><i class="bi bi-geo-alt me-1"></i>${displayAddress || '주소 정보 없음'}</div>
            <div class="tt-item text-primary-light font-weight-bold mb-2">
              <i class="bi bi-currency-won me-1"></i>${project.formattedSalary || '단가협의'}
            </div>
            <button class="btn-route-search">
              <i class="bi bi-cursor-fill me-1"></i>경로 찾기
            </button>
          </div>
        </div>`

      // 2. [핵심] 경로 찾기 버튼 전용 mousedown 이벤트 바인딩
      const routeBtn = content.querySelector('.btn-route-search')
      routeBtn.addEventListener('mousedown', (e) => {
        // 부모의 mousedown(isMarkerClickTriggered 세팅) 및 click 전파를 막음
        e.stopPropagation()

        // 지도의 click 이벤트가 발생하지 않도록 방어막 침
        isMarkerClickTriggered = true

        openKakaoRoute(project)

        // 지도의 click 리스너가 동작을 무시할 수 있는 충분한 시간 뒤 해제
        setTimeout(() => {
          isMarkerClickTriggered = false
        }, 300)
      })

      // 3. 기존 마커 전체 영역에 대한 mousedown (지도의 click 방어용)
      content.addEventListener('mousedown', () => {
        isMarkerClickTriggered = true
      })

      content.addEventListener('click', (e) => {
        e.stopPropagation()
        e.preventDefault()
        selectProject(project)

        setTimeout(() => {
          isMarkerClickTriggered = false
        }, 200)
      })

      const overlay = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(project.latitude, project.longitude),
        content: content,
        zIndex: 3,
      })

      projectOverlays.set(project.projectSq, overlay)
      overlay.setMap(mapInstance.value)
      markers.value.push(overlay)
    })
  }
}

// --- 데이터 로직 ---
const fetchProjects = async () => {
  isLoading.value = true
  try {
    // [수정] 지도 모드와 목록 모드에 따라 요청 파라미터 분기
    const isMap = isMapView.value

    const params = {
      ...filters.value,
      // 지도 모드일 때는 대량(예: 1000개)으로 요청하여 페이징을 무력화, 목록은 기존 5개 유지
      size: isMap ? 1000 : 5,
      // 지도 모드일 때는 항상 1페이지 전체를 가져옴
      page: isMap ? 1 : currentPage.value,
      userLat: userStore.userLat,
      userLng: userStore.userLng,
      // 백엔드에서 지도용 요청임을 인지할 수 있도록 플래그 추가
      isMapView: isMap,
    }

    const response = await api.$get(
      `/projects?${qs.stringify(params, { arrayFormat: 'repeat' })}`,
    )

    projects.value = response.output.projects

    // [수정] 페이지네이션 계산 분기
    if (!isMap) {
      // 목록 모드: 기존처럼 5개 기준으로 전체 페이지 계산
      totalPages.value = Math.max(
        1,
        Math.ceil((response.output.totalCount ?? 0) / 5),
      )
    } else {
      // 지도 모드: 페이지네이션이 필요 없으므로 1로 고정
      totalPages.value = 1
      fetchRegionGroups()
    }
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

const fetchRegionGroups = async () => {
  const response = await api.$get(
    `/projects/regions?${qs.stringify(filters.value, { arrayFormat: 'repeat' })}`,
  )
  regionGroups.value = response.output
  displayMarkers()
}

const updateBounds = () => {
  if (!mapInstance.value) return
  const bounds = mapInstance.value.getBounds()
  filters.value.minLat = bounds.getSouthWest().getLat()
  filters.value.maxLat = bounds.getNorthEast().getLat()
  filters.value.minLng = bounds.getSouthWest().getLng()
  filters.value.maxLng = bounds.getNorthEast().getLng()
  currentPage.value = 1
  filters.value.page = 1
  fetchProjects()
}

const handleSearchInArea = () => {
  isMapMoved.value = false
  updateBounds()
}
watch(isMapView, async (val) => {
  // 1. 공통으로 데이터를 새로 불러옵니다. (모드에 맞는 size와 page로 요청)
  await fetchProjects()

  // 2. 지도 모드로 전환된 경우에만 지도를 초기화하거나 영역을 갱신합니다.
  if (val) {
    await nextTick()
    initMap()
    // 지도 모드로 진입 시 현재 지도 영역(Bounds) 기준으로 한 번 더 필터링하고 싶다면 유지
    updateBounds()
  }
})
watch(projects, () => {
  if (isMapView.value) displayMarkers()
})
watch(currentPage, (val) => {
  filters.value.page = val
  fetchProjects()
})
onMounted(() => {
  if (!userStore.isLoggedIn || (userStore.userLat && userStore.userLng))
    fetchProjects()
})

const updateFilters = (updated) => {
  filters.value = { ...filters.value, ...updated }
  currentPage.value = 1
  fetchProjects()
}
// 2. [수정] 왼쪽 목록 아이템 클릭 이벤트
const handleFocusMarker = ({ project }) => {
  // 1. 목록 클릭은 지도의 클릭 이벤트를 발생시키지 않으므로 플래그가 필요 없지만,
  // 혹시 모를 간섭을 위해 안전하게 처리
  isMarkerClickTriggered = true

  // 2. 선택 로직 실행 (이미 활성화된 상태면 상세 페이지 이동 확인 모달이 뜹니다)
  selectProject(project)

  setTimeout(() => {
    isMarkerClickTriggered = false
  }, 200)
}

const handleRegisterClick = () => {
  if (userStore.companyAuthStatusCd === 2501) {
    modalStore.openModal(CommonConfirmModal, {
      title: '기업 인증 필요',
      message: '인증 페이지로 이동하시겠습니까?',
      confirmText: '이동',
      onConfirm: () => router.push('/mypage/affiliationEdit'),
    })
    return
  }
  router.push('/mypage/projectPostPage')
}

const goToProjectSpecWithConfirm = (project) => {
  modalStore.openModal(CommonConfirmModal, {
    title: '프로젝트 상세 이동',
    message: `[${project.projectTtl}] 상세 페이지로 이동하시겠습니까?`,
    confirmText: '이동하기',
    cancelText: '취소',
    onConfirm: () => {
      // 유저 타입과 프로젝트 번호를 넘겨 분기 처리 실행
      navigateByUserTypeAndProjectSq(userStore.userType, project.projectSq)
      modalStore.closeModal()
    },
  })
}
</script>

<style scoped>
.search-btn-container {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

/* 시군구 뱃지 스타일 */
:deep(.cluster-pin) {
  cursor: pointer;
  background: #0088cc;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  font-size: 9px;
  line-height: 1.1;
  text-align: center;
}

/* 핀 및 툴팁 스타일 */
:deep(.marker-wrapper) {
  position: relative;
  cursor: pointer;
}
:deep(.marker-tooltip) {
  display: none;
  position: absolute;
  bottom: 42px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(33, 37, 41, 0.95);
  color: white;
  padding: 10px 12px; /* 패딩 약간 증량 */
  border-radius: 8px;
  font-size: 11px;
  min-width: 180px; /* 버튼을 위해 너비 확장 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: 9999;

  pointer-events: auto;
}

/* 경로 찾기 버튼 스타일 */
:deep(.btn-route-search) {
  width: 100%;
  background: #0088cc;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 0;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

:deep(.btn-route-search:hover) {
  background: #0088cc;
  transform: translateY(-1px);
}

:deep(.btn-route-search:active) {
  transform: translateY(0);
}

:deep(.btn-route-search i) {
  font-size: 12px;
}
:deep(.marker-wrapper:hover .marker-tooltip),
:deep(.marker-wrapper.active .marker-tooltip) {
  display: block;
}
:deep(.tt-header) {
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding-bottom: 4px;
  margin-bottom: 5px;
}

:deep(.tt-badge) {
  background: #0088cc;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 9px;
  white-space: nowrap;
}

:deep(.tt-ttl) {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

/* 툴팁 본문: 주소, 단가 등 */
:deep(.tt-body) {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

:deep(.tt-item) {
  display: flex;
  align-items: center;
  color: #ccc;
  font-size: 10px;
}

:deep(.text-primary-light) {
  color: #4ebced !important; /* 가독성 좋은 밝은 파란색 */
}

:deep(.marker-pin) {
  background: #0088cc;
  width: 28px;
  height: 28px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
:deep(.marker-pin i) {
  transform: rotate(45deg);
  color: white;
  font-size: 14px;
}
:deep(.marker-pin.subway) {
  background: #28a745 !important;
} /* 지하철 녹색 */

/* 컴팩트 텍스트 및 레이아웃 */
.text-1 {
  font-size: 0.72rem !important;
}
.btn-xs {
  padding: 1px 5px;
  font-size: 0.68rem;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}
.bg-soft-light {
  background-color: #f8f9fa;
}
</style>
